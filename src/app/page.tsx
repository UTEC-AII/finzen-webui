"use client";

import Link from "next/link";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { GITHUB_URL } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";

// Página de bienvenida.
export default function LandingPage() {
  const { t } = useI18n();

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{
        background:
          "radial-gradient(600px 360px at 50% -10%, var(--surface-2), transparent 60%), var(--bg)",
      }}
    >
      <div className="absolute right-4 top-4">
        <HeaderControls github={GITHUB_URL} />
      </div>

      <h1 className="wordmark select-none text-7xl leading-none sm:text-8xl">FinZen</h1>

      <p className="mt-6 max-w-sm text-sm text-muted">{t("landing.tagline")}</p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/register"
          className="inline-flex w-full items-center justify-center rounded-sm bg-primary px-4 py-3 text-sm font-semibold text-primary-fg transition hover:opacity-90"
        >
          {t("landing.createAccount")}
        </Link>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-sm border border-border px-4 py-3 text-sm font-semibold text-text transition hover:bg-surface"
        >
          {t("landing.login")}
        </Link>
      </div>
    </main>
  );
}
