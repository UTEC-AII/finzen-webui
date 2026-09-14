"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useUser } from "@/hooks/useUser";
import { api, endpoints } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

// Valores de tipo de ingreso que acepta el backend.
const TYPES = ["Sueldo", "Freelance", "Bono", "Inversion", "Otro"];

export default function NewIncomePage() {
  const user = useUser();
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState({
    type: "Sueldo",
    amount: "",
    currency: user?.preferred_currency ?? "PEN",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      await api.post(endpoints.incomes("/incomes"), {
        user_id: user.id,
        type: form.type,
        amount: form.amount,
        currency: form.currency,
        date: form.date,
        description: form.description,
      });
      router.push("/incomes");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[480px] space-y-4">
      <h1 className="text-center text-2xl font-bold">{t("incomeNew.title")}</h1>

      <form onSubmit={onSubmit}>
        <Field label={t("incomeNew.type")}>
          <Select value={form.type} onChange={(e) => update("type", e.target.value)}>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("incomeNew.amount")}>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder="3500.50"
              required
            />
          </Field>
          <Field label={t("incomeNew.currency")}>
            <Input
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label={t("incomeNew.date")}>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
        </Field>

        <Field label={t("incomeNew.description")}>
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder={t("incomeNew.descriptionPlaceholder")}
            rows={2}
          />
        </Field>

        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" block disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
          <Button type="button" variant="outline" block onClick={() => router.back()}>
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
