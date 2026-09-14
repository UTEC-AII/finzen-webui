"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { Card, CardTitle } from "@/components/ui/Card";
import { useUser } from "@/hooks/useUser";
import { api, endpoints } from "@/lib/api";
import { formatAmount, formatDate, toNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useOpenAIKey } from "@/lib/openai-key";
import type { Expense, Income } from "@/types";

export default function DashboardPage() {
  const user = useUser();
  const { t, locale } = useI18n();
  const { configured } = useOpenAIKey();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [incomeList, expenseList] = await Promise.all([
          api.get<Income[]>(endpoints.incomes(`/incomes/${user!.id}`)),
          api.get<Expense[]>(endpoints.expenses(`/expenses/${user!.id}`)),
        ]);
        setIncomes(incomeList);
        setExpenses(expenseList);
      } catch {
        // Si falla, se muestran los valores en cero.
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const currency = user?.preferred_currency ?? "PEN";
  const totalIncome = incomes.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const balance = totalIncome - totalExpense;

  const byCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + toNumber(item.amount);
      return acc;
    }, {}),
  )
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  const maxCategory = byCategory[0]?.total ?? 1;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {user ? t("dashboard.greeting", { name: user.name }) : t("dashboard.hello")}
      </h1>

      <Card>
        <p className="mb-2 text-xs text-muted">{t("dashboard.balance")}</p>
        <p className="mono text-[34px] font-bold tracking-tight">
          <span className="mr-0.5 text-lg font-medium text-muted">{currency}</span>
          {loading ? "—" : balance.toFixed(2)}
        </p>
        <div className="mt-4 flex gap-8 border-t border-border-soft pt-3.5 text-xs text-muted">
          <div>
            <span>{t("dashboard.incomes")}</span>
            <span className="mono mt-0.5 block text-sm font-semibold text-text">
              {formatAmount(totalIncome, currency, locale)}
            </span>
          </div>
          <div>
            <span>{t("dashboard.expenses")}</span>
            <span className="mono mt-0.5 block text-sm font-semibold text-text">
              {formatAmount(totalExpense, currency, locale)}
            </span>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/incomes/new"
          className="flex-1 basis-40 rounded-sm border border-border px-3 py-2.5 text-center text-[13px] font-semibold hover:bg-surface"
        >
          {t("dashboard.newIncome")}
        </Link>
        <Link
          href="/expenses/new"
          className="flex-1 basis-40 rounded-sm border border-border px-3 py-2.5 text-center text-[13px] font-semibold hover:bg-surface"
        >
          {t("dashboard.newExpense")}
        </Link>
        {configured ? (
          <Link
            href="/assistant"
            className="flex-1 basis-40 rounded-sm bg-primary px-3 py-2.5 text-center text-[13px] font-semibold text-primary-fg hover:opacity-90"
          >
            {t("dashboard.smartQuery")}
          </Link>
        ) : (
          <Link
            href="/assistant"
            title={t("assistant.disabled")}
            className="flex-1 basis-40 rounded-sm border border-border px-3 py-2.5 text-center text-[13px] font-semibold text-muted-2/70 transition hover:text-text-soft"
          >
            {t("dashboard.smartQuery")}
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>{t("dashboard.expensesByCategory")}</CardTitle>
          <CategoryChart data={byCategory} />
        </Card>

        <Card>
          <CardTitle>{t("dashboard.categoryDetail")}</CardTitle>
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted">{t("dashboard.noExpenses")}</p>
          ) : (
            <div className="space-y-2.5">
              {byCategory.map((item) => (
                <div key={item.category} className="flex items-center gap-2.5 text-xs">
                  <span className="w-24 flex-none font-medium text-text-soft">
                    {item.category}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded bg-surface-2">
                    <span
                      className="block h-full rounded bg-primary"
                      style={{ width: `${(item.total / maxCategory) * 100}%` }}
                    />
                  </span>
                  <span className="mono w-16 flex-none text-right text-[11.5px] text-muted">
                    {item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle>{t("dashboard.recent")}</CardTitle>
        {incomes.length + expenses.length === 0 ? (
          <p className="text-sm text-muted">{t("dashboard.noMovements")}</p>
        ) : (
          <div>
            {[...incomes.map((i) => ({ kind: "in" as const, item: i })),
              ...expenses.map((e) => ({ kind: "out" as const, item: e }))]
              .sort((a, b) => b.item.date.localeCompare(a.item.date))
              .slice(0, 5)
              .map(({ kind, item }) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-border-soft py-3 last:border-b-0"
                >
                  <span
                    className={
                      kind === "in"
                        ? "flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary text-xs font-bold text-primary-fg"
                        : "flex h-8 w-8 items-center justify-center rounded-[9px] border border-border bg-surface-3 text-xs font-bold text-text-soft"
                    }
                  >
                    {kind === "in" ? "+" : "−"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold">
                      {kind === "in"
                        ? (item as Income).type
                        : (item as Expense).category}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(item.date, locale)}
                      {item.description ? ` · ${item.description}` : ""}
                    </p>
                  </div>
                  <span className="mono flex-none text-[13.5px] font-bold">
                    {formatAmount(item.amount, item.currency, locale)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}
