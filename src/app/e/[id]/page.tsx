"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

type Event = { id: string; name: string; description?: string | null; starts_at: string; venue?: string | null };

export default function PublicEventPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ticketSecret, setTicketSecret] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const run = async () => {
      const res = await fetch(`/api/public/events/${params.id}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setEvent(json.event);
      }
      setLoading(false);
    };
    run();
  }, [params.id]);

  return (
    <div className="container mx-auto max-w-2xl px-6 py-10">
      <Toaster richColors closeButton />
      <Card>
        <CardHeader>
          <CardTitle>{event ? event.name : "Event"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : !event ? (
            <p className="text-muted-foreground">Event not found.</p>
          ) : ticketSecret ? (
            <div className="text-center">
              <p className="mb-3">Your ticket</p>
              <div className="inline-block bg-white p-4 rounded-md">
                <QRCodeCanvas value={ticketSecret} size={200} includeMargin />
              </div>
              <p className="mt-2 text-xs text-muted-foreground break-all">{ticketSecret}</p>
              {ticketId ? (
                <div className="pt-4">
                  <p className="text-sm mb-2">Optionally upload your photo (for attendee list):</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !ticketId) return;
                      const fd = new FormData();
                      fd.append("file", file);
                      setUploading(true);
                      try {
                        const res = await fetch(`/api/public/tickets/${ticketId}/photo`, { method: "POST", body: fd });
                        const json = await res.json();
                        if (!res.ok) throw new Error(json.error || "Upload failed");
                        toast.success("Photo uploaded");
                      } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : "Upload failed";
                        toast.error(msg);
                      } finally {
                        setUploading(false);
                      }
                    }}
                    disabled={uploading}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(`/api/public/tickets`, {
                    method: "POST",
                    body: JSON.stringify({ event_id: event!.id, attendee_name: name, attendee_email: email || undefined }),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error?.message || "Could not register");
                  setTicketSecret(json.ticket.qr_secret);
                  setTicketId(json.ticket.id);
                  toast.success("Registered! Your ticket is ready.");
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : "Could not register";
                  toast.error(msg);
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="bg-brand text-brand-foreground hover:opacity-95">Register (Free)</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


