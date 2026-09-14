"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n";

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error(t("login.error"));
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
      <div className="absolute right-4 top-4">
        <HeaderControls github={GITHUB_URL} />
      </div>

      <h1 className="text-2xl font-bold">{t("login.title")}</h1>
      <p className="mb-7 mt-1 text-sm text-muted">{t("login.subtitle")}</p>

      <form onSubmit={onSubmit} className="w-full max-w-[360px] text-left">
        <Field label={t("login.email")}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("login.emailPlaceholder")}
            required
          />
        </Field>
        <Field label={t("login.password")}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login.passwordPlaceholder")}
            required
          />
        </Field>

        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

        <Button type="submit" block disabled={loading}>
          {loading ? t("login.loading") : t("login.submit")}
        </Button>
      </form>

      <p className="mt-5 text-xs text-muted">
        {t("login.noAccount")}{" "}
        <Link href="/register" className="font-semibold text-text">
          {t("login.register")}
        </Link>
      </p>
    </main>
  );
}
