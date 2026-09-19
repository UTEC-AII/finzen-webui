"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderControls } from "@/components/layout/HeaderControls";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { GITHUB_URL } from "@/lib/constants";
import { CURRENCIES } from "@/lib/currencies";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_TIMEZONE, detectTimezone, TIMEZONES } from "@/lib/timezones";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    preferred_currency: "PEN",
    timezone: DEFAULT_TIMEZONE,
  });

  // Se detecta la zona horaria del navegador al montar (evita desajuste de hidratación).
  useEffect(() => {
    const detected = detectTimezone();
    if (TIMEZONES.some((tz) => tz.value === detected)) {
      setForm((prev) => ({ ...prev, timezone: detected }));
    }
  }, []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(t("register.error"));
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

      <h1 className="text-2xl font-bold">{t("register.title")}</h1>
      <p className="mb-7 mt-1 text-sm text-muted">{t("register.subtitle")}</p>

      <form onSubmit={onSubmit} className="w-full max-w-[360px] text-left">
        <Field label={t("register.name")}>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={t("register.namePlaceholder")}
            required
          />
        </Field>
        <Field label={t("register.email")}>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder={t("login.emailPlaceholder")}
            required
          />
        </Field>
        <Field label={t("register.password")}>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder={t("register.passwordPlaceholder")}
              minLength={6}
              required
              className="pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? t("register.hidePassword") : t("register.showPassword")}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted transition hover:text-text"
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("register.currency")}>
            <Select
              value={form.preferred_currency}
              onChange={(e) => update("preferred_currency", e.target.value)}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("register.timezone")}>
            <Select
              value={form.timezone}
              onChange={(e) => update("timezone", e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

        <Button type="submit" block disabled={loading}>
          {loading ? t("register.loading") : t("register.submit")}
        </Button>
      </form>

      <p className="mt-5 text-xs text-muted">
        {t("register.haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-text">
          {t("register.login")}
        </Link>
      </p>
    </main>
  );
}
