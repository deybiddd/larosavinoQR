import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export const getSupabaseBrowserClient = (): SupabaseClient => {
  if (browserClient) return browserClient;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== "undefined") {
      console.warn("Supabase env missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    // Avoid constructing an invalid client during SSR/prerender
    throw new Error("Supabase browser client is not configured");
  }
  // Use SSR browser client so auth tokens are stored in cookies (sb:*)
  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
};

export type DatabaseRow<T> = T & { id: string };


