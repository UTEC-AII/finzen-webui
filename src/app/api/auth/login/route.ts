import { NextResponse } from "next/server";
import { TOKEN_COOKIE, USER_COOKIE, isSecureRequest } from "@/lib/constants";

// Inicia sesión contra el user-service y guarda el JWT en una cookie httpOnly.
export async function POST(request: Request) {
  const body = await request.json();

  const backend = await fetch(`${process.env.USER_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!backend.ok) {
    const error = await backend.json().catch(() => ({}));
    return NextResponse.json(
      { detail: error.detail || "Credenciales inválidas" },
      { status: backend.status },
    );
  }

  const data = await backend.json();
  const response = NextResponse.json({ user: data.user });
  const secure = isSecureRequest(request);

  // El token va en cookie httpOnly (no accesible desde JavaScript).
  response.cookies.set(TOKEN_COOKIE, data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });

  // El usuario (no sensible) va en cookie legible para mostrar la interfaz.
  // Next codifica el valor de la cookie; no se debe codificar otra vez aquí.
  response.cookies.set(USER_COOKIE, JSON.stringify(data.user), {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
  });

  return response;
}
