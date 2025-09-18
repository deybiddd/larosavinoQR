import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    {
      ok: true,
      hasSession: !!session,
      user: session?.user ?? null,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      note: "This endpoint is for temporary debugging only.",
    },
    { status: 200 }
  );
}


