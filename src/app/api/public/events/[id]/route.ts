import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_req: Request, context: unknown) {
  const { id } = (context as { params: { id: string } }).params;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ event: data }, { status: 200 });
}


