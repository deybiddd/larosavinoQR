import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

const PatchSchema = z.object({ action: z.enum(["revoke", "restore"]) });

export async function PATCH(req: Request, context: unknown) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (context as { params: { id: string } }).params;
  const json = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = getSupabaseServerClient();
  const nextStatus = parsed.data.action === "revoke" ? "revoked" : "issued";
  const { data, error } = await supabase
    .from("tickets")
    .update({ status: nextStatus })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ticket: data }, { status: 200 });
}


