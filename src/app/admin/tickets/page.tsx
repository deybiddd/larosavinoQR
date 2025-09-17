"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";

type Event = { id: string; name: string };
type Ticket = { id: string; event_id: string; attendee_name: string; attendee_email?: string | null; qr_secret: string; status: string };

const fetchEvents = async (): Promise<Event[]> => {
  const res = await fetch("/api/events", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  return json.events as Event[];
};

const fetchTickets = async (eventId?: string): Promise<Ticket[]> => {
  const url = new URL("/api/tickets", window.location.origin);
  if (eventId) url.searchParams.set("event_id", eventId);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  const json = await res.json();
  return json.tickets as Ticket[];
};

export default function TicketsAdminPage() {
  const qc = useQueryClient();
  const { data: events } = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [form, setForm] = useState({ attendee_name: "", attendee_email: "" });
  const [query, setQuery] = useState("");
  const { data: tickets } = useQuery({ queryKey: ["tickets", selectedEvent], queryFn: () => fetchTickets(selectedEvent), enabled: !!selectedEvent });

  const issueTicket = useMutation({
    mutationFn: async () => {
      if (!selectedEvent) throw new Error("No event selected");
      const res = await fetch("/api/tickets", {
        method: "POST",
        body: JSON.stringify({ event_id: selectedEvent, attendee_name: form.attendee_name, attendee_email: form.attendee_email || undefined }),
      });
      if (!res.ok) throw new Error("Failed to issue ticket");
      return res.json();
    },
    onSuccess: async () => {
      toast.success("Ticket issued");
      setForm({ attendee_name: "", attendee_email: "" });
      await qc.invalidateQueries({ queryKey: ["tickets", selectedEvent] });
    },
    onError: () => toast.error("Could not issue ticket"),
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tickets/${id}`, { method: "PATCH", body: JSON.stringify({ action: "revoke" }) });
      if (!res.ok) throw new Error("Failed to revoke");
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tickets", selectedEvent] });
    },
  });

  const restore = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tickets/${id}`, { method: "PATCH", body: JSON.stringify({ action: "restore" }) });
      if (!res.ok) throw new Error("Failed to restore");
      return res.json();
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tickets", selectedEvent] });
    },
  });

  const sendEmail = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tickets/${id}/send-email`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send email");
      return res.json();
    },
    onSuccess: () => toast.success("Email sent"),
    onError: () => toast.error("Could not send email"),
  });

  useEffect(() => {
    if (events && events.length > 0 && !selectedEvent) setSelectedEvent(events[0].id);
  }, [events, selectedEvent]);

  // QR currently encodes the secret directly. Switch to URL if needed later.

  return (
    <div className="container mx-auto max-w-6xl px-6 py-10">
      <Toaster richColors closeButton />
      <h1 className="text-3xl font-semibold mb-6">Admin — Tickets</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Issue ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedEvent) {
                toast.error("Select an event first");
                return;
              }
              if (!form.attendee_name.trim()) {
                toast.error("Attendee name is required");
                return;
              }
              issueTicket.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="event">Event</Label>
              <select
                id="event"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                aria-label="Select event"
              >
                <option value="" disabled>
                  Select event
                </option>
                {events?.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendee_name">Attendee name</Label>
              <Input id="attendee_name" value={form.attendee_name} onChange={(e) => setForm({ ...form, attendee_name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendee_email">Attendee email</Label>
              <Input id="attendee_email" type="email" value={form.attendee_email} onChange={(e) => setForm({ ...form, attendee_email: e.target.value })} />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" className="bg-brand text-brand-foreground hover:opacity-95" disabled={issueTicket.isPending}>
                {issueTicket.isPending ? "Issuing…" : "Issue ticket"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tickets</span>
            {selectedEvent ? (
              <a
                href={`/api/events/${selectedEvent}/tickets.csv`}
                className="text-sm underline underline-offset-4 hover:no-underline"
              >
                Export CSV
              </a>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Search by attendee name/email…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {!tickets || tickets.length === 0 ? (
            <p className="text-muted-foreground">No tickets yet.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tickets
                .filter((t) =>
                  !query ? true : `${t.attendee_name} ${t.attendee_email || ""}`.toLowerCase().includes(query.toLowerCase())
                )
                .map((t) => (
                  <li key={t.id} className="rounded-md border border-border p-4">
                    <p className="font-medium">{t.attendee_name}</p>
                    <p className="text-sm text-muted-foreground">{t.attendee_email || ""}</p>
                    <div className="mt-3 bg-white p-3 rounded-md">
                      <QRCodeCanvas value={t.qr_secret} size={160} includeMargin />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground break-all">{t.qr_secret}</p>
                    <div className="mt-3 flex items-center gap-2">
                      {t.status !== "revoked" ? (
                        <button
                          type="button"
                          onClick={() => revoke.mutate(t.id)}
                          className="text-xs rounded-md px-3 py-1 border border-border hover:bg-accent hover:text-accent-foreground"
                          aria-label="Revoke ticket"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => restore.mutate(t.id)}
                          className="text-xs rounded-md px-3 py-1 border border-border hover:bg-accent hover:text-accent-foreground"
                          aria-label="Restore ticket"
                        >
                          Restore
                        </button>
                      )}
                      {t.attendee_email ? (
                        <button
                          type="button"
                          onClick={() => sendEmail.mutate(t.id)}
                          className="text-xs rounded-md px-3 py-1 border border-border hover:bg-accent hover:text-accent-foreground"
                          aria-label="Send ticket email"
                        >
                          {sendEmail.isPending ? "Sending…" : "Send Email"}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


