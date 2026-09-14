"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useUser } from "@/hooks/useUser";
import { api, endpoints } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useOpenAIKey } from "@/lib/openai-key";
import type { QueryResponse, SourceItem } from "@/types";

interface Message {
  role: "user" | "ai";
  text: string;
  sources?: SourceItem[];
}

const SUGGESTIONS = {
  es: [
    "¿En qué categoría gasto más?",
    "¿Cuánto he gastado este mes?",
    "¿Cuánto he recibido de ingresos?",
  ],
  en: [
    "Which category do I spend the most on?",
    "How much have I spent this month?",
    "How much income have I received?",
  ],
};

export default function AssistantPage() {
  const user = useUser();
  const { t, lang } = useI18n();
  const { configured } = useOpenAIKey();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const shown: Message[] = messages.length
    ? messages
    : [{ role: "ai", text: t("assistant.greeting") }];

  async function ask(question: string) {
    if (!user || !configured || !question.trim() || loading) return;
    setMessages((prev) => [...(prev.length ? prev : shown), { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const data = await api.post<QueryResponse>(endpoints.ai("/query"), {
        user_id: user.id,
        question,
      });
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: t("assistant.error") }]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    ask(input);
  }

  return (
    <div className="mx-auto flex h-[85vh] max-w-3xl flex-col">
      {!configured && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-xs text-muted">{t("assistant.configureInProfile")}</p>
          <Link
            href="/profile"
            className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg transition hover:opacity-90"
          >
            {t("assistant.goToProfile")}
          </Link>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-surface p-4">
        {shown.map((message, index) => (
          <div
            key={index}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div className="max-w-[85%]">
              <div
                className={
                  message.role === "user"
                    ? "rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-fg"
                    : "rounded-2xl rounded-tl-sm border border-border-soft bg-surface-2 px-4 py-2.5 text-sm text-text-soft"
                }
              >
                {message.text}
              </div>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 rounded-xl border border-border-soft bg-surface px-3 py-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {t("assistant.sources")}
                  </p>
                  <ul className="space-y-1">
                    {message.sources.map((source) => (
                      <li
                        key={source.id}
                        className="mono text-[11px] leading-snug text-text-soft"
                      >
                        {source.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="animate-pulse rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-2.5 text-sm text-muted">
              {t("assistant.thinking")}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS[lang].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => ask(suggestion)}
            disabled={loading || !configured}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-soft transition hover:text-text disabled:opacity-40"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("assistant.placeholder")}
          disabled={loading || !configured}
          className="rounded-full"
        />
        <Button type="submit" disabled={loading || !configured} className="rounded-full px-5">
          {t("assistant.send")}
        </Button>
      </form>
    </div>
  );
}
