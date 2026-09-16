// Nombres de las cookies usadas para la sesión.
// Se separan en este archivo para poder importarlos también desde el middleware (edge).
export const TOKEN_COOKIE = "finzen_token";
export const USER_COOKIE = "finzen_user";

// Enlace del icono de GitHub del encabezado (repositorios de la organización).
export const GITHUB_URL = "https://github.com/orgs/UTEC-AII/repositories";

// Indica si la petición llegó por HTTPS. La cookie de sesión solo se marca
// "secure" en HTTPS: en HTTP plano el navegador la descartaría y no habría sesión.
export function isSecureRequest(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}
