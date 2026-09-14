"use client";

import { useEffect, useState } from "react";
import { OpenAIKeyPanel } from "@/components/settings/OpenAIKeyPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { useUser } from "@/hooks/useUser";
import { api, endpoints } from "@/lib/api";
import { USER_COOKIE } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import type { User } from "@/types";

const CURRENCIES = ["PEN", "USD", "EUR", "MXN", "COP", "CLP"];

export default function ProfilePage() {
  const user = useUser();
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    preferred_currency: "PEN",
    monthly_savings_goal: "0.00",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      preferred_currency: user.preferred_currency,
      monthly_savings_goal: user.monthly_savings_goal,
    });
  }, [user]);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");
    try {
      const updated = await api.put<User>(endpoints.users(`/users/${user.id}`), {
        name: form.name,
        preferred_currency: form.preferred_currency,
        monthly_savings_goal: form.monthly_savings_goal || "0",
      });
      // Se actualiza la cookie legible para reflejar los cambios en la interfaz.
      document.cookie = `${USER_COOKIE}=${encodeURIComponent(
        JSON.stringify(updated),
      )}; path=/; samesite=lax`;
      setMessage(t("profile.updated"));
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[480px] space-y-4">
      <h1 className="text-center text-2xl font-bold">{t("profile.title")}</h1>

      <Card>
        <p className="text-xs text-muted">{t("profile.emailLocked")}</p>
        <p className="mt-1 text-sm">{user?.email ?? "—"}</p>
      </Card>

      <OpenAIKeyPanel />

      <form onSubmit={onSubmit}>
        <Field label={t("profile.name")}>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </Field>

        <Field label={t("profile.currency")}>
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

        <Field label={t("profile.savingsGoal")}>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.monthly_savings_goal}
            onChange={(e) => update("monthly_savings_goal", e.target.value)}
          />
        </Field>

        {message && <p className="mb-3 text-xs text-text-soft">{message}</p>}

        <Button type="submit" block disabled={loading}>
          {loading ? t("common.saving") : t("profile.save")}
        </Button>
      </form>
    </div>
  );
}
