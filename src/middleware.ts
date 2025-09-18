import { NextResponse, type NextRequest } from "next/server";

export async function middleware(_req: NextRequest) {
  // Avoid page redirect loops. Auth is enforced in client layouts.
  return NextResponse.next();
}

export const config = {
  // Keep middleware enabled (no-op) only to allow future tweaks.
  matcher: ["/api/:path*", "/admin/:path*", "/scanner"],
};


