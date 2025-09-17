"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const AppHeader = () => {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      router.replace("/login");
    }
  };
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/admin" className="text-sm font-medium hover:underline">
          La Rosa Vino — Admin
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/scanner" className="text-sm hover:underline">
            Scanner
          </Link>
          <Button onClick={handleLogout} className="bg-brand text-brand-foreground hover:opacity-95" aria-label="Log out">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};


