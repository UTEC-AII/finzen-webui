import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";

// Proxy al ai-service: la clave de OpenAI se guarda en la base SQLite del backend
// (persistente en el volumen EBS). El navegador nunca recibe la clave completa.
async function forward(method: string, body?: unknown) {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
  }

  const response = await fetch(`${process.env.AI_API_URL}/settings/openai-key`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

export async function GET() {
  return forward("GET");
}

// El panel del cliente usa POST; internamente se guarda con PUT.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return forward("PUT", body);
}

export async function DELETE() {
  return forward("DELETE");
}
