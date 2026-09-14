"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n";
import { useOpenAIKey } from "@/lib/openai-key";

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/";

export function AppShell({ children }: { children: ReactNode }) {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { configured } = useOpenAIKey();

  const nav = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/incomes", label: t("nav.incomes") },
    { href: "/expenses", label: t("nav.expenses") },
    { href: "/assistant", label: t("nav.assistant") },
  ];

  // El asistente solo está disponible si hay clave de OpenAI configurada.
  const isDisabled = (href: string) => href === "/assistant" && !configured;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() || "F";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="relative sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border-soft bg-[var(--header-bg)] px-4 py-2 backdrop-blur">
        <Link href="/dashboard" title="FinZen" className="flex items-center">
          <span className="wordmark text-2xl leading-none">FinZen</span>
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 gap-1 rounded-full border border-border bg-surface p-1 md:flex">
          {nav.map((item) => {
            const disabled = isDisabled(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={disabled ? t("assistant.disabled") : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                  pathname.startsWith(item.href)
                    ? "bg-primary text-primary-fg"
                    : disabled
                      ? "text-muted-2/70 hover:text-text-soft"
                      : "text-muted hover:text-text-soft",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <HeaderControls github={GITHUB_URL} />
          <Link
            href="/profile"
            title={t("common.profile")}
            aria-label={t("common.profile")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-fg transition hover:opacity-90"
          >
            {initial}
          </Link>
          <button
            onClick={logout}
            title={t("common.logout")}
            aria-label={t("common.logout")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-muted-2 hover:text-text"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 pb-24 pt-4 md:pb-10">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border-soft bg-[var(--header-bg)] backdrop-blur md:hidden">
        {nav.map((item) => {
          const disabled = isDisabled(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center py-3 text-[11px] font-semibold",
                pathname.startsWith(item.href)
                  ? "text-text"
                  : disabled
                    ? "text-muted-2/70"
                    : "text-muted",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
