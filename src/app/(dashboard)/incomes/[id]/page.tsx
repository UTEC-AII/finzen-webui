"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api, endpoints } from "@/lib/api";
import { formatAmount, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import type { Income } from "@/types";

export default function IncomeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [income, setIncome] = useState<Income | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get<Income>(endpoints.incomes(`/incomes/detail/${id}`))
      .then(setIncome)
      .catch(() => setIncome(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function remove() {
    if (!id) return;
    await api.del(endpoints.incomes(`/incomes/${id}`));
    router.push("/incomes");
    router.refresh();
  }

  if (loading) return <p className="text-sm text-muted">{t("common.loading")}</p>;
  if (!income) return <p className="text-sm text-muted">{t("incomeDetail.notFound")}</p>;

  return (
    <div className="mx-auto max-w-[480px] space-y-4">
      <h1 className="text-center text-2xl font-bold">{t("incomeDetail.title")}</h1>

      <Card>
        <p className="mb-1 text-xs text-muted">{income.type}</p>
        <p className="mono text-3xl font-bold">
          {formatAmount(income.amount, income.currency, locale)}
        </p>
        <dl className="mt-4 space-y-2 border-t border-border-soft pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">{t("incomeDetail.date")}</dt>
            <dd>{formatDate(income.date, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{t("incomeDetail.currency")}</dt>
            <dd>{income.currency}</dd>
          </div>
          <div className="flex justify-between gap-6">
            <dt className="text-muted">{t("incomeDetail.description")}</dt>
            <dd className="text-right">{income.description || "—"}</dd>
          </div>
        </dl>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" block onClick={() => router.push("/incomes")}>
          {t("common.back")}
        </Button>
        <Button
          variant="outline"
          block
          className="border-red-500/40 text-red-400"
          onClick={remove}
        >
          {t("common.delete")}
        </Button>
      </div>
    </div>
  );
}
