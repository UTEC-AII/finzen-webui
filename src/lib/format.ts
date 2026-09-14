// Utilidades para trabajar con los montos que llegan como string desde el backend.

export function toNumber(amount: string | number): number {
  const value = typeof amount === "number" ? amount : parseFloat(amount);
  return Number.isNaN(value) ? 0 : value;
}

export function formatAmount(
  amount: string | number,
  currency = "PEN",
  locale = "es-PE",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(toNumber(amount));
}

// Formatea una fecha ISO (YYYY-MM-DD) al formato local corto.
export function formatDate(date: string, locale = "es-PE"): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}
