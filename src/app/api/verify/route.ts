import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const VerifySchema = z.object({ secret: z.string().min(1) });

export const POST = async (req: Request) => {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json().catch(() => null);
  const parsed = VerifySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("qr_secret", parsed.data.secret)
    .limit(1);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!tickets || tickets.length === 0) {
    return NextResponse.json({ valid: false, reason: "invalid" }, { status: 200 });
  }
  const ticket = tickets[0];
  if (ticket.status === "revoked") {
    return NextResponse.json({ valid: false, reason: "revoked" }, { status: 200 });
  }
  if (ticket.status === "checked_in") {
    return NextResponse.json({ valid: false, reason: "duplicate", ticket }, { status: 200 });
  }

  const { error: updateError } = await supabase
    .from("tickets")
    .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
    .eq("id", ticket.id);
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  await supabase.from("scan_logs").insert({ ticket_id: ticket.id, result: "success" });
  return NextResponse.json({ valid: true, ticket }, { status: 200 });
};


