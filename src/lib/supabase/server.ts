import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using service role when needed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE as string | undefined;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const getSupabaseServerClient = () => {
  const key = serviceRole || anonKey || "";
  return createClient(supabaseUrl || "", key);
};


