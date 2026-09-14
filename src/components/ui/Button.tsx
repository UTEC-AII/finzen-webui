import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

export function Button({
  variant = "primary",
  block,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm px-4 py-3 text-sm font-semibold transition active:scale-[.98] disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-fg hover:opacity-90",
        variant === "outline" &&
          "border border-border bg-transparent text-text hover:bg-surface",
        variant === "ghost" && "text-muted hover:text-text",
        block && "w-full",
        className,
      )}
      {...props}
    />
  );
}
