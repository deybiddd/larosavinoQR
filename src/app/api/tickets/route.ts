import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import crypto from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const IssueTicketSchema = z.object({
  event_id: z.string().uuid(),
  attendee_name: z.string().min(1),
  attendee_email: z.string().email().optional(),
});

export const POST = async (req: Request) => {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json().catch(() => null);
  const parsed = IssueTicketSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const qr_secret = crypto.randomBytes(24).toString("base64url");
  const { data, error } = await supabase
    .from("tickets")
    .insert({ ...parsed.data, qr_secret })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ticket: data }, { status: 201 });
};

export const GET = async (req: Request) => {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const eventId = url.searchParams.get("event_id");
  const supabase = getSupabaseServerClient();
  const query = supabase.from("tickets").select("*").order("created_at", { ascending: false });
  const { data, error } = eventId ? await query.eq("event_id", eventId) : await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tickets: data ?? [] }, { status: 200 });
};


