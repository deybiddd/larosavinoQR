import { NextResponse } from "next/server";
import { Resend } from "resend";
import TicketEmail from "@/emails/TicketEmail";
import { render } from "@react-email/render";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import * as QRCode from "qrcode";

export async function POST(_req: Request, context: unknown) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (context as { params: { id: string } }).params;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email disabled: missing RESEND_API_KEY" }, { status: 500 });
  }
  const resend = new Resend(apiKey);

  const supabase = getSupabaseServerClient();
  const { data: ticket, error } = await supabase.from("tickets").select("*, events!inner(name, venue, starts_at)").eq("id", id).single();
  if (error || !ticket) return NextResponse.json({ error: error?.message || "Not found" }, { status: 404 });
  if (!ticket.attendee_email) return NextResponse.json({ error: "Ticket has no email" }, { status: 400 });

  const qrDataUrl = await QRCode.toDataURL(ticket.qr_secret, { margin: 2, width: 200 });
  const html = await render(
    TicketEmail({
      attendeeName: ticket.attendee_name,
      eventName: ticket.events.name,
      venue: ticket.events.venue,
      startsAt: ticket.events.starts_at,
      qrDataUrl,
    })
  );

  await resend.emails.send({
    from: process.env.RESEND_FROM || "tickets@larosavino.com",
    to: ticket.attendee_email,
    subject: `Your ticket for ${ticket.events.name}`,
    html,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
