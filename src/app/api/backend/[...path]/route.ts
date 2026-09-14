import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";
import { readOpenAIKey } from "@/lib/secrets";

// Proxy BFF: recibe las llamadas del navegador, les inyecta el token desde la
// cookie httpOnly y las reenvía al microservicio correspondiente.
const SERVICE_MAP: Record<string, string | undefined> = {
  users: process.env.USER_API_URL,
  incomes: process.env.INCOME_API_URL,
  expenses: process.env.EXPENSE_API_URL,
  ai: process.env.AI_API_URL,
};

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const [service, ...rest] = path;
  const baseUrl = SERVICE_MAP[service];

  if (!baseUrl) {
    return NextResponse.json({ detail: "Servicio no encontrado" }, { status: 404 });
  }

  const target = `${baseUrl}/${rest.join("/")}${request.nextUrl.search}`;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Para el ai-service, se inyecta la clave de OpenAI guardada server-side.
  if (service === "ai") {
    const openaiKey = (await readOpenAIKey()) || process.env.OPENAI_API_KEY;
    if (openaiKey) headers["X-OpenAI-Key"] = openaiKey;
  }

  const init: RequestInit = { method: request.method, headers, cache: "no-store" };
  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.text();
    if (body) init.body = body;
  }

  const backend = await fetch(target, init);
  const text = await backend.text();

  return new NextResponse(text || null, {
    status: backend.status,
    headers: { "Content-Type": "application/json" },
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
