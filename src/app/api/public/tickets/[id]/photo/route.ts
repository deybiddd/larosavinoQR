import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request, context: unknown) {
  const { id } = (context as { params: { id: string } }).params;
  const supabase = getSupabaseServerClient();

  // Parse multipart form data
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file_required" }, { status: 400 });

  // Fetch ticket to know event_id
  const { data: ticket, error: tErr } = await supabase.from("tickets").select("id,event_id").eq("id", id).single();
  if (tErr || !ticket) return NextResponse.json({ error: tErr?.message || "ticket_not_found" }, { status: 404 });

  // Upload to storage (bucket must exist): attendee-uploads/<event_id>/<ticket_id>-<ts>.<ext>
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = file.type || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const path = `${ticket.event_id}/${ticket.id}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("attendee-uploads").upload(path, buffer, { contentType, upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // If bucket is public, construct public URL; else store path only
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const photo_url = projectUrl ? `${projectUrl}/storage/v1/object/public/attendee-uploads/${path}` : path;
  await supabase.from("tickets").update({ photo_url }).eq("id", ticket.id);

  return NextResponse.json({ ok: true, photo_url }, { status: 200 });
}


