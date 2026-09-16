import { NextResponse } from "next/server";
import { TOKEN_COOKIE, USER_COOKIE, isSecureRequest } from "@/lib/constants";

// Registra al usuario y, si todo sale bien, inicia sesión automáticamente.
export async function POST(request: Request) {
  const body = await request.json();

  const created = await fetch(`${process.env.USER_API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!created.ok) {
    const error = await created.json().catch(() => ({}));
    return NextResponse.json(
      { detail: error.detail || "No se pudo registrar la cuenta" },
      { status: created.status },
    );
  }

  // Tras registrar, se obtiene el token con las mismas credenciales.
  const login = await fetch(`${process.env.USER_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  if (!login.ok) {
    return NextResponse.json({ user: null, autoLogin: false });
  }

  const data = await login.json();
  const response = NextResponse.json({ user: data.user, autoLogin: true });
  const secure = isSecureRequest(request);

  response.cookies.set(TOKEN_COOKIE, data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
  // Next codifica el valor de la cookie; no se debe codificar otra vez aquí.
  response.cookies.set(USER_COOKIE, JSON.stringify(data.user), {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
  });

  return response;
}
