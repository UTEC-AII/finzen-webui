import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

// Layout de todas las vistas privadas: barra superior, navegación y contenido.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
