import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin — La Rosa Vino",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div>
      <AppHeader />
      {children}
    </div>
  );
}


