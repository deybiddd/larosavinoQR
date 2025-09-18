import type { Metadata } from "next";
import AuthGate from "@/components/auth-gate";

export const metadata: Metadata = {
  title: "Scanner — La Rosa Vino",
};

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}


