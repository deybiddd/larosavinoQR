"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Event = { id: string; name: string; starts_at: string; ends_at?: string | null; venue?: string | null; description?: string | null };
type Ticket = {
  id: string;
  attendee_name: string;
  attendee_email?: string | null;
  status: "issued" | "checked_in" | "revoked";
  created_at: string;
  checked_in_at?: string | null;
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const run = async () => {
      const [er, tr] = await Promise.all([
        fetch(`/api/events/${params.id}`, { cache: "no-store" }),
        fetch(`/api/tickets?event_id=${params.id}`, { cache: "no-store" }),
      ]);
      if (er.ok) {
        const json = await er.json();
        setEvent(json.event);
      }
      if (tr.ok) {
        const json = await tr.json();
        setTickets(json.tickets as Ticket[]);
      }
      setLoading(false);
    };
    run();
  }, [params.id]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    const list = !text
      ? tickets
      : tickets.filter((t) => `${t.attendee_name} ${t.attendee_email || ""}`.toLowerCase().includes(text));
    return {
      issued: list.filter((t) => t.status === "issued"),
      checked: list.filter((t) => t.status === "checked_in"),
    };
  }, [tickets, q]);

  return (
    <div className="container mx-auto max-w-5xl px-6 py-10">
      <div className="mb-4">
        <Link href="/admin" className="text-sm hover:underline">
          ← Back to events
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : event ? (
            <div className="space-y-1">
              <p className="font-medium">{event.name}</p>
              <p className="text-sm text-muted-foreground">{event.venue || ""}</p>
              <p className="text-sm text-muted-foreground">{event.description || ""}</p>
              <div className="pt-3 flex items-center gap-3">
                <Button asChild className="bg-brand text-brand-foreground hover:opacity-95">
                  <a href={`/api/events/${event.id}/tickets.csv`}>Export tickets (CSV)</a>
                </Button>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search attendees…"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm w-64"
                  aria-label="Search attendees"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="rounded-md border border-border p-3">
                  <p className="font-medium">Not yet checked in</p>
                  <p className="text-xs text-muted-foreground mb-2">{filtered.issued.length} attendee(s)</p>
                  <ul className="space-y-2 max-h-[420px] overflow-auto pr-1">
                    {filtered.issued.map((t) => (
                      <li key={t.id} className="rounded border border-border p-2">
                        <p className="text-sm font-medium">{t.attendee_name}</p>
                        <p className="text-xs text-muted-foreground">{t.attendee_email || ""}</p>
                      </li>
                    ))}
                    {filtered.issued.length === 0 ? (
                      <li className="text-sm text-muted-foreground">No attendees in this list.</li>
                    ) : null}
                  </ul>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="font-medium">Checked in</p>
                  <p className="text-xs text-muted-foreground mb-2">{filtered.checked.length} attendee(s)</p>
                  <ul className="space-y-2 max-h-[420px] overflow-auto pr-1">
                    {filtered.checked.map((t) => (
                      <li key={t.id} className="rounded border border-border p-2">
                        <p className="text-sm font-medium">{t.attendee_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.attendee_email || ""}
                          {t.checked_in_at ? ` • ${new Date(t.checked_in_at).toLocaleString()}` : ""}
                        </p>
                      </li>
                    ))}
                    {filtered.checked.length === 0 ? (
                      <li className="text-sm text-muted-foreground">No attendees in this list.</li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


