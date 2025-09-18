"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setAllowed(true);
        } else {
          window.location.assign(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
      } catch {
        window.location.assign(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
    };
    run();
  }, []);

  if (!allowed) return null;
  return <>{children}</>;
};

export default AuthGate;


