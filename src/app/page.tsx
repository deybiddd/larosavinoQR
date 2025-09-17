import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-dvh font-sans">
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 gap-6 bg-muted">
        <div className="h-14 w-14 relative">
          <Image
            src="https://larosavino.com/wp-content/uploads/2023/07/cropped-La-Rosa-Vino-Favicon.png"
            alt="La Rosa Vino logo"
            fill
            sizes="56px"
            className="object-contain"
          />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 text-secondary px-3 py-1 text-xs font-medium">
          <span>La Rosa Vino</span>
          <span aria-hidden>•</span>
          <span>Events & QR</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground font-[var(--font-display)]">
          Elevate your event check‑in
          <span className="block text-brand">with seamless QR tickets</span>
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-muted-foreground">
          Create events, issue digital tickets, and verify guests instantly at the door.
          Built for the La Rosa Vino experience.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md bg-brand text-brand-foreground px-5 py-3 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:opacity-95"
            aria-label="Go to Admin Dashboard"
          >
            Admin dashboard
          </Link>
          <Link
            href="/scanner"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Open QR Scanner"
          >
            Open scanner
          </Link>
        </div>
      </section>
    </main>
  );
}
