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
          <Input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder={t("register.passwordPlaceholder")}
            minLength={6}
            required
          />
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
