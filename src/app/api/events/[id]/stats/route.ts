import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_req: Request, context: unknown) {
  const { id } = (context as { params: { id: string } }).params;
  const supabase = getSupabaseServerClient();

  const countFor = async (status?: string) => {
    let q = supabase.from("tickets").select("id", { count: "exact" }).eq("event_id", id);
    if (status) q = q.eq("status", status);
    const { count, error } = await q;
    if (error) throw new Error(error.message);
    return count || 0;
  };

  try {
    const [total, issued, checked_in, revoked] = await Promise.all([
      countFor(),
      countFor("issued"),
      countFor("checked_in"),
      countFor("revoked"),
    ]);
    return NextResponse.json({ total, issued, checked_in, revoked }, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "stats_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


