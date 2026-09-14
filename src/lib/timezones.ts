// Países / zonas horarias disponibles (valor IANA).
export const TIMEZONES = [
  { value: "America/Lima", label: "Perú" },
  { value: "America/Bogota", label: "Colombia" },
  { value: "America/Mexico_City", label: "México" },
  { value: "America/Santiago", label: "Chile" },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina" },
  { value: "America/Sao_Paulo", label: "Brasil" },
  { value: "America/New_York", label: "EE.UU. (Este)" },
  { value: "America/Los_Angeles", label: "EE.UU. (Oeste)" },
  { value: "Europe/Madrid", label: "España" },
  { value: "UTC", label: "UTC" },
];

export const DEFAULT_TIMEZONE = "America/Lima";

// Detecta la zona horaria del navegador (si está disponible).
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

// Devuelve la fecha de "hoy" (YYYY-MM-DD) en la zona horaria indicada.
export function todayInTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || DEFAULT_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}
