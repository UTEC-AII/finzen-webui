"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { useUser } from "@/hooks/useUser";
import { api, endpoints } from "@/lib/api";
import { formatAmount, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { CategoryList, Expense } from "@/types";

export default function ExpensesPage() {
  const user = useUser();
  const { t, locale } = useI18n();
  const [categories, setCategories] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CategoryList>(endpoints.expenses("/expenses/categories/list"))
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    const query = params.toString();
    try {
      const data = await api.get<Expense[]>(
        endpoints.expenses(`/expenses/${user.id}${query ? `?${query}` : ""}`),
      );
      setExpenses(data);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [user, category, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  const chip = (active: boolean) =>
    cn(
      "flex-none rounded-full border px-3 py-1.5 text-xs transition",
      active
        ? "border-primary bg-primary text-primary-fg"
        : "border-border bg-surface text-text-soft",
    );

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("expenses.title")}</h1>
        <Link
          href="/expenses/new"
          className="rounded-sm bg-primary px-4 py-2 text-[13px] font-semibold text-primary-fg hover:opacity-90"
        >
          {t("expenses.new")}
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setCategory("")} className={chip(category === "")}>
          {t("expenses.all")}
        </button>
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)} className={chip(category === item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="grid max-w-md grid-cols-2 gap-3">
        <Field label={t("expenses.from")}>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </Field>
        <Field label={t("expenses.to")}>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </Field>
      </div>

      {loading ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : expenses.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t("expenses.empty")}</p>
        </Card>
      ) : (
        <Card>
          {expenses.map((expense) => (
            <Link
              key={expense.id}
              href={`/expenses/${expense.id}`}
              className="flex items-center gap-3 border-b border-border-soft py-3 last:border-b-0"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-border bg-surface-3 text-xs font-bold text-text-soft">
                −
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold">{expense.category}</p>
                <p className="text-xs text-muted">
                  {formatDate(expense.date, locale)}
                  {expense.description ? ` · ${expense.description}` : ""}
                </p>
              </div>
              <span className="mono flex-none text-[13.5px] font-bold">
                {formatAmount(expense.amount, expense.currency, locale)}
              </span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
