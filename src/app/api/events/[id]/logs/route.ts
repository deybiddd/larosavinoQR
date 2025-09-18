import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_req: Request, context: unknown) {
  const { id } = (context as { params: { id: string } }).params;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("scan_logs")
    .select("*, tickets!inner(attendee_name, attendee_email, event_id)")
    .eq("tickets.event_id", id)
    .order("scanned_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data ?? [] }, { status: 200 });
}


