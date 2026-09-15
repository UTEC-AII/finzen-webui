"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/cn";
import { GITHUB_URL } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { useOpenAIKey } from "@/lib/openai-key";

// Iconos de la navegación inferior (SVG en línea).
function NavIcon({ href }: { href: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (href === "/dashboard") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  if (href === "/incomes") {
    return (
      <svg {...common}>
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    );
  }
  if (href === "/expenses") {
    return (
      <svg {...common}>
        <polyline points="3 7 9 13 13 9 21 17" />
        <polyline points="14 17 21 17 21 10" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { configured } = useOpenAIKey();
  const [fabOpen, setFabOpen] = useState(false);

  const nav = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/incomes", label: t("nav.incomes") },
    { href: "/expenses", label: t("nav.expenses") },
    { href: "/assistant", label: t("nav.assistant") },
  ];

  const isDisabled = (href: string) => href === "/assistant" && !configured;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() || "F";

  function MobileItem({ item }: { item: (typeof nav)[number] }) {
    const active = pathname.startsWith(item.href);
    const disabled = isDisabled(item.href);
    return (
      <Link
        href={item.href}
        className={cn(
          "relative flex w-16 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-semibold transition-colors",
          active ? "text-text" : disabled ? "text-muted-2/70" : "text-muted",
        )}
      >
        <span
          className={cn(
            "absolute -top-2 h-1 w-7 rounded-full bg-primary transition-opacity",
            active ? "opacity-100" : "opacity-0",
          )}
        />
        <span className={cn("transition-transform", active && "-translate-y-0.5")}>
          <NavIcon href={item.href} />
        </span>
        {item.label}
      </Link>
    );
  }

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

      <main className="mx-auto w-full max-w-[1040px] flex-1 px-4 pb-32 pt-4 md:pb-10">
        {children}
      </main>

      {/* ===== Navegación inferior (móvil) ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        {/* Menú del botón flotante */}
        {fabOpen && (
          <>
            <button
              aria-label="Cerrar"
              onClick={() => setFabOpen(false)}
              className="fixed inset-0 -z-10 bg-black/50 backdrop-blur-[2px]"
            />
            <div className="absolute bottom-[5.5rem] left-1/2 flex -translate-x-1/2 flex-col gap-2">
              <Link
                href="/incomes/new"
                onClick={() => setFabOpen(false)}
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-xl"
              >
                <span className="text-base">+</span>
                {t("fab.newIncome")}
              </Link>
              <Link
                href="/expenses/new"
                onClick={() => setFabOpen(false)}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text shadow-xl"
              >
                <span className="text-base">−</span>
                {t("fab.newExpense")}
              </Link>
            </div>
          </>
        )}

        <div className="border-t border-border-soft bg-[var(--header-bg)] backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-around px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
            <MobileItem item={nav[0]} />
            <MobileItem item={nav[1]} />

            {/* Botón flotante central */}
            <button
              onClick={() => setFabOpen((prev) => !prev)}
              aria-label={t("dashboard.newExpense")}
              className="relative -mt-7 flex h-14 w-14 flex-none items-center justify-center rounded-full bg-primary text-primary-fg shadow-lg ring-4 ring-[var(--bg)] transition active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("transition-transform duration-200", fabOpen && "rotate-45")}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <MobileItem item={nav[2]} />
            <MobileItem item={nav[3]} />
          </div>
        </div>
      </nav>
    </div>
  );
}
