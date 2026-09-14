"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api, endpoints } from "@/lib/api";
import { formatAmount, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import type { Expense } from "@/types";

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get<Expense>(endpoints.expenses(`/expenses/detail/${id}`))
      .then(setExpense)
      .catch(() => setExpense(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-muted">{t("common.loading")}</p>;
  if (!expense) return <p className="text-sm text-muted">{t("expenseDetail.notFound")}</p>;

  return (
    <div className="mx-auto max-w-[480px] space-y-4">
      <h1 className="text-center text-2xl font-bold">{t("expenseDetail.title")}</h1>

      <Card>
        <p className="mb-1 text-xs text-muted">{expense.category}</p>
        <p className="mono text-3xl font-bold">
          {formatAmount(expense.amount, expense.currency, locale)}
        </p>
        <dl className="mt-4 space-y-2 border-t border-border-soft pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">{t("expenseDetail.date")}</dt>
            <dd>{formatDate(expense.date, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{t("expenseDetail.currency")}</dt>
            <dd>{expense.currency}</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="text-muted">{t("expenseDetail.description")}</dt>
            <dd className="text-right">{expense.description || "—"}</dd>
          </div>
        </dl>
      </Card>

      <Button variant="outline" block onClick={() => router.push("/expenses")}>
        {t("common.back")}
      </Button>
    </div>
  );
}
