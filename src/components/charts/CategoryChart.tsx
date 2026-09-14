"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

const DARK = ["#ffffff", "#c9c9ce", "#8b8b93", "#5a5a61", "#3a3a3f", "#2a2a2e", "#1b1b1e", "#111113"];
const LIGHT = ["#111114", "#33333a", "#6b6b73", "#9a9aa2", "#b8b8c0", "#d0d0d8", "#e1e1e6", "#ececf0"];

export function CategoryChart({
  data,
}: {
  data: { category: string; total: number }[];
}) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const colors = theme === "light" ? LIGHT : DARK;

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        {t("dashboard.noExpensesChart")}
      </p>
    );
  }

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            innerRadius={60}
            outerRadius={92}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 9,
              color: "var(--text)",
            }}
            formatter={(value: number) => value.toFixed(2)}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
