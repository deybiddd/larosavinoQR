"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";
import Link from "next/link";

type Event = {
  id: string;
  name: string;
  description?: string | null;
  starts_at: string;
  ends_at?: string | null;
  venue?: string | null;
  created_at: string;
};

const EventFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  starts_at: z.string().min(1),
  ends_at: z.string().optional(),
  venue: z.string().optional(),
});

const fetchEvents = async (): Promise<Event[]> => {
  const res = await fetch("/api/events", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  return json.events as Event[];
};

export default function AdminPage() {
  const qc = useQueryClient();
  const { data: events, isLoading, isError } = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const [form, setForm] = useState({ name: "", description: "", starts_at: "", ends_at: "", venue: "" });

  const createEvent = useMutation({
    mutationFn: async (payload: z.infer<typeof EventFormSchema>) => {
      const res = await fetch("/api/events", { method: "POST", body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: async () => {
      toast.success("Event created");
      setForm({ name: "", description: "", starts_at: "", ends_at: "", venue: "" });
      await qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Could not create event"),
  });

  useEffect(() => {
    // Pre-fill starts_at with next top of the hour
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const iso = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
    setForm((f) => ({ ...f, starts_at: iso }));
  }, []);

  return (
    <div className="container mx-auto max-w-5xl px-6 py-10">
      <Toaster richColors closeButton />
      <h1 className="text-3xl font-semibold mb-6">Admin — Events</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create event</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const parse = EventFormSchema.safeParse(form);
              if (!parse.success) {
                toast.error("Please fill required fields");
                return;
              }
              createEvent.mutate({
                ...parse.data,
                starts_at: new Date(parse.data.starts_at).toISOString(),
                ends_at: parse.data.ends_at ? new Date(parse.data.ends_at).toISOString() : undefined,
              });
            }}
          >
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="starts_at">Starts at</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">Ends at</Label>
              <Input id="ends_at" type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="bg-brand text-brand-foreground hover:opacity-95" disabled={createEvent.isPending}>
                {createEvent.isPending ? "Creating…" : "Create event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="space-y-2">
              <p className="text-red-600">Cannot load events. Your session may have expired.</p>
              <Button
                type="button"
                onClick={() => window.location.assign(`/login?redirect=${encodeURIComponent("/admin")}`)}
              >
                Sign in again
              </Button>
            </div>
          ) : isLoading ? (
            <p className="text-muted-foreground">Loading events…</p>
          ) : events && events.length > 0 ? (
            <ul className="divide-y divide-border">
              {events.map((ev) => (
                <li key={ev.id} className="py-4 flex items-center justify-between">
                  <div>
                    <Link href={`/admin/${ev.id}`} className="font-medium hover:underline">
                      {ev.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {ev.starts_at ? format(new Date(ev.starts_at), "PPpp") : "TBA"}
                      {ev.venue ? ` • ${ev.venue}` : ""}
                    </p>
                  </div>
                  <div>
                    <Link href={`/admin/${ev.id}`} className="text-sm hover:underline">
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No events yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


