import Image from "next/image";
import { cn } from "@/lib/cn";

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-icon-v3.png"
      alt="FinZen"
      width={size}
      height={size}
      className={cn("select-none", className)}
    />
  );
}