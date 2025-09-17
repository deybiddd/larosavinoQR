import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const protectedPaths = ["/admin", "/scanner", "/api/events", "/api/tickets", "/api/verify"];
  const isProtected = protectedPaths.some((p) => url.pathname === p || url.pathname.startsWith(p + "/"));
  if (!isProtected) return NextResponse.next();

  // Supabase sets auth cookies starting with `sb:`; simple presence check
  const hasSupabaseAuth = Array.from(req.cookies.getAll()).some((c) => c.name.startsWith("sb:"));
  if (!hasSupabaseAuth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", url.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/scanner", "/api/:path*"],
};


