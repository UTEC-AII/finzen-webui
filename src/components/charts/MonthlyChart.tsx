"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export function MonthlyChart({
  data,
}: {
  data: { label: string; incomes: number; expenses: number }[];
}) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const grid = theme === "light" ? "#e2e2e8" : "#2a2a31";
  const tick = theme === "light" ? "#6b6b73" : "#8b8b93";

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        {t("dashboard.noMovementsChart")}
      </p>
    );
  }

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: tick, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: grid }}
          />
          <YAxis
            tick={{ fill: tick, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 9,
              color: "var(--text)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="incomes"
            name={t("dashboard.incomes")}
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name={t("dashboard.expenses")}
            stroke="var(--accent)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}