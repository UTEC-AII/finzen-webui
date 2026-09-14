"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface OpenAIKeyValue {
  configured: boolean;
  masked: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const OpenAIKeyContext = createContext<OpenAIKeyValue>({
  configured: false,
  masked: null,
  loading: true,
  refresh: async () => {},
});

// Estado compartido de la clave de OpenAI (si está configurada o no).
export function OpenAIKeyProvider({ children }: { children: ReactNode }) {
  const [configured, setConfigured] = useState(false);
  const [masked, setMasked] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/settings/openai-key");
      if (response.ok) {
        const data = await response.json();
        setConfigured(Boolean(data.configured));
        setMasked(data.masked ?? null);
      }
    } catch {
      // Si falla, se mantiene el estado actual.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ configured, masked, loading, refresh }),
    [configured, masked, loading, refresh],
  );

  return <OpenAIKeyContext.Provider value={value}>{children}</OpenAIKeyContext.Provider>;
}

export function useOpenAIKey() {
  return useContext(OpenAIKeyContext);
}
