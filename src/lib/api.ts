// Cliente HTTP del navegador. Todas las llamadas pasan por el BFF de Next.js
// (/api/backend/...), que inyecta el token JWT desde la cookie httpOnly.

interface ApiError extends Error {
  status?: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error: ApiError = new Error(
      data.detail || data.error || `Error HTTP ${response.status}`,
    );
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// Rutas base por microservicio dentro del proxy del BFF.
export const endpoints = {
  users: (path = "") => `/api/backend/users${path}`,
  incomes: (path = "") => `/api/backend/incomes${path}`,
  expenses: (path = "") => `/api/backend/expenses${path}`,
  ai: (path = "") => `/api/backend/ai${path}`,
};

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
