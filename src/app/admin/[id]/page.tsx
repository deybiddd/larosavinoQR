"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Event = { id: string; name: string; starts_at: string; ends_at?: string | null; venue?: string | null; description?: string | null };

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const res = await fetch(`/api/events/${params.id}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setEvent(json.event);
      }
      setLoading(false);
    };
    run();
  }, [params.id]);

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
              <div className="pt-3">
                <Button asChild className="bg-brand text-brand-foreground hover:opacity-95">
                  <a href={`/api/events/${event.id}/tickets.csv`}>Export tickets (CSV)</a>
                </Button>
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


