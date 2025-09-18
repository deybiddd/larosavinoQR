import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import AuthGate from "@/components/auth-gate";

export const metadata: Metadata = {
  title: "Admin — La Rosa Vino",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AppHeader />
      {children}
    </AuthGate>
  );
}


