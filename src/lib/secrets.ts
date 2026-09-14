// Almacenamiento server-side de secretos. Nunca se importa desde el cliente:
// la clave de OpenAI se guarda en un archivo fuera de `public` y con permisos 600.
import { promises as fs } from "fs";
import path from "path";

const SECRETS_DIR = path.join(process.cwd(), ".secrets");
const KEY_FILE = path.join(SECRETS_DIR, "openai-key");

export async function saveOpenAIKey(apiKey: string): Promise<void> {
  await fs.mkdir(SECRETS_DIR, { recursive: true, mode: 0o700 });
  await fs.writeFile(KEY_FILE, apiKey.trim(), { mode: 0o600 });
}

export async function readOpenAIKey(): Promise<string | null> {
  try {
    const value = (await fs.readFile(KEY_FILE, "utf8")).trim();
    return value || null;
  } catch {
    return null;
  }
}

export async function clearOpenAIKey(): Promise<void> {
  try {
    await fs.rm(KEY_FILE);
  } catch {
    // Si no existe, no hay nada que borrar.
  }
}

// Devuelve una versión enmascarada para mostrar en la interfaz (nunca la clave completa).
export function maskKey(apiKey: string | null): string | null {
  if (!apiKey) return null;
  if (apiKey.length <= 8) return "••••••";
  return `${apiKey.slice(0, 3)}••••••${apiKey.slice(-4)}`;
}
