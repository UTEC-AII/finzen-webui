import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-4 shadow-[0_1px_0_rgba(255,255,255,.02)_inset,0_10px_30px_-14px_rgba(0,0,0,.7)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-xs font-medium text-muted">{children}</h3>;
}
