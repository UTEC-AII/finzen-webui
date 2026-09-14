import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";
import { clearOpenAIKey, maskKey, readOpenAIKey, saveOpenAIKey } from "@/lib/secrets";

// Solo usuarios con sesión pueden configurar la clave.
async function hasSession(): Promise<boolean> {
  const store = await cookies();
  return Boolean(store.get(TOKEN_COOKIE)?.value);
}

// Estado: indica si hay clave configurada y su versión enmascarada (nunca la clave).
export async function GET() {
  if (!(await hasSession())) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
  }
  const key = await readOpenAIKey();
  return NextResponse.json({ configured: Boolean(key), masked: maskKey(key) });
}

// Guarda la clave en el servidor (archivo con permisos 600).
export async function POST(request: Request) {
  if (!(await hasSession())) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

  if (!apiKey.startsWith("sk-") || apiKey.length < 20) {
    return NextResponse.json(
      { detail: "La clave debe empezar con 'sk-' y tener una longitud válida" },
      { status: 400 },
    );
  }

  await saveOpenAIKey(apiKey);
  return NextResponse.json({ configured: true, masked: maskKey(apiKey) });
}

// Elimina la clave guardada.
export async function DELETE() {
  if (!(await hasSession())) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
  }
  await clearOpenAIKey();
  return NextResponse.json({ configured: false, masked: null });
}
