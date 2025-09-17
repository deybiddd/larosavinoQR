import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

const toCsv = (rows: Array<Record<string, unknown>>) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    const str = val == null ? "" : String(val);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  return lines.join("\n");
};

export async function GET(_req: Request, context: unknown) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getSupabaseServerClient();
  const { id } = (context as { params: { id: string } }).params;
  const { data, error } = await supabase
    .from("tickets")
    .select("id,attendee_name,attendee_email,status,created_at,checked_in_at,qr_secret")
    .eq("event_id", id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const csv = toCsv((data as Array<Record<string, unknown>>) || []);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=tickets-${id}.csv`,
    },
  });
}


