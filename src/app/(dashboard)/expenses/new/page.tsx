"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useUser } from "@/hooks/useUser";
import { api, endpoints } from "@/lib/api";
import { CURRENCIES } from "@/lib/currencies";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_TIMEZONE, todayInTimezone } from "@/lib/timezones";
import type { CategoryList } from "@/types";

export default function NewExpensePage() {
  const user = useUser();
  const router = useRouter();
  const { t } = useI18n();
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    currency: user?.preferred_currency ?? "PEN",
    date: todayInTimezone(DEFAULT_TIMEZONE),
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ajusta la fecha por defecto a la zona horaria del usuario cuando carga.
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      currency: user.preferred_currency || prev.currency,
      date: todayInTimezone(user.timezone || DEFAULT_TIMEZONE),
    }));
  }, [user]);

  useEffect(() => {
    api
      .get<CategoryList>(endpoints.expenses("/expenses/categories/list"))
      .then((data) => {
        setCategories(data.categories);
        setForm((prev) => ({ ...prev, category: prev.category || data.categories[0] }));
      })
      .catch(() => setCategories([]));
  }, []);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      await api.post(endpoints.expenses("/expenses"), {
        user_id: user.id,
        category: form.category,
        amount: form.amount,
        currency: form.currency,
        date: form.date,
        description: form.description,
      });
      router.push("/expenses");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[480px] space-y-4">
      <h1 className="text-center text-2xl font-bold">{t("expenseNew.title")}</h1>

      <form onSubmit={onSubmit}>
        <Field label={t("expenseNew.category")}>
          <Select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            required
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("expenseNew.amount")}>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder="450.50"
              required
            />
          </Field>
          <Field label={t("expenseNew.currency")}>
            <Select
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              required
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label={t("expenseNew.date")}>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            required
          />
        </Field>

        <Field label={t("expenseNew.description")}>
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder={t("expenseNew.descriptionPlaceholder")}
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
