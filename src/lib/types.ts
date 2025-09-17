export type Event = {
  id: string;
  name: string;
  description?: string | null;
  starts_at: string; // ISO
  ends_at?: string | null; // ISO
  venue?: string | null;
  created_at: string; // ISO
};

export type Ticket = {
  id: string;
  event_id: string;
  attendee_name: string;
  attendee_email?: string | null;
  status: "issued" | "checked_in" | "revoked";
  qr_secret: string; // opaque secret embedded in QR
  created_at: string; // ISO
  checked_in_at?: string | null; // ISO
};

export type ScanLog = {
  id: string;
  ticket_id: string;
  scanned_at: string; // ISO
  scanner_id?: string | null; // staff identifier
  result: "success" | "duplicate" | "revoked" | "invalid";
};


