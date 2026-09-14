"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useUser } from "@/hooks/useUser";
import { api, endpoints } from "@/lib/api";
import { formatAmount, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import type { Income } from "@/types";

export default function IncomesPage() {
  const user = useUser();
  const { t, locale } = useI18n();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<Income[]>(endpoints.incomes(`/incomes/${user.id}`))
      .then(setIncomes)
      .catch(() => setIncomes([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("incomes.title")}</h1>
        <Link
          href="/incomes/new"
          className="rounded-sm bg-primary px-4 py-2 text-[13px] font-semibold text-primary-fg hover:opacity-90"
        >
          {t("incomes.new")}
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : incomes.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">{t("incomes.empty")}</p>
        </Card>
      ) : (
        <Card>
          {incomes.map((income) => (
            <Link
              key={income.id}
              href={`/incomes/${income.id}`}
              className="flex items-center gap-3 border-b border-border-soft py-3 last:border-b-0"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary text-xs font-bold text-primary-fg">
                +
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold">{income.type}</p>
                <p className="text-xs text-muted">
                  {formatDate(income.date, locale)}
                  {income.description ? ` · ${income.description}` : ""}
                </p>
              </div>
              <span className="mono flex-none text-[13.5px] font-bold">
                {formatAmount(income.amount, income.currency, locale)}
              </span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
