import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const PublicTicketSchema = z.object({
  event_id: z.string().uuid(),
  attendee_name: z.string().min(1),
  attendee_email: z.string().email().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = PublicTicketSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const qr_secret = crypto.randomBytes(24).toString("base64url");
  const { data, error } = await supabase
    .from("tickets")
    .insert({ ...parsed.data, qr_secret, status: "issued" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ticket: data }, { status: 201 });
}


