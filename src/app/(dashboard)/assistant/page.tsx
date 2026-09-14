"use client";

import { useState } from "react";
import { OpenAIKeyPanel } from "@/components/settings/OpenAIKeyPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useUser } from "@/hooks/useUser";
import { api, endpoints } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useOpenAIKey } from "@/lib/openai-key";
import type { QueryResponse, ReindexResponse, SourceItem } from "@/types";

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
  const [reindexing, setReindexing] = useState(false);
  const [reindexMsg, setReindexMsg] = useState("");

  const greeting = t("assistant.greeting");
  const shown: Message[] = messages.length ? messages : [{ role: "ai", text: greeting }];

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

  async function reindex() {
    if (!configured || reindexing) return;
    setReindexing(true);
    setReindexMsg("");
    try {
      const data = await api.post<ReindexResponse>(endpoints.ai("/reindex"));
      setReindexMsg(
        data.reindexed > 0
          ? t("assistant.reindexed", {
              count: String(data.reindexed),
              model: data.model,
            })
          : t("assistant.reindexNone"),
      );
    } catch (err) {
      setReindexMsg((err as Error).message);
    } finally {
      setReindexing(false);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    ask(input);
  }

  return (
    <div className="mx-auto flex h-[78vh] max-w-2xl flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("assistant.title")}</h1>
        <Button
          type="button"
          variant="outline"
          onClick={reindex}
          disabled={!configured || reindexing}
          className="px-3 py-2 text-xs"
        >
          {reindexing ? t("assistant.reindexing") : t("assistant.reindex")}
        </Button>
      </div>

      <div className="mb-3 space-y-2">
        <OpenAIKeyPanel />
        {reindexMsg && <p className="text-xs text-text-soft">{reindexMsg}</p>}
      </div>

      {!configured && (
        <p className="mb-3 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-xs text-muted">
          {t("assistant.requiresKey")}
        </p>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-border bg-surface p-4">
        {shown.map((message, index) => (
          <div
            key={index}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div className="max-w-[85%]">
              <div
                className={
                  message.role === "user"
                    ? "rounded-lg bg-primary px-3.5 py-2.5 text-sm text-primary-fg"
                    : "rounded-lg bg-surface-2 px-3.5 py-2.5 text-sm text-text-soft"
                }
              >
                {message.text}
              </div>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-1.5 rounded-lg border border-border-soft bg-surface px-3 py-2 text-[11px] text-muted">
                  <span className="font-semibold text-text-soft">
                    {t("assistant.sources")}
                  </span>
                  <ul className="mt-1 space-y-0.5">
                    {message.sources.map((source) => (
                      <li key={source.id}>· {source.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="animate-pulse rounded-lg bg-surface-2 px-3.5 py-2.5 text-sm text-muted">
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
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-soft disabled:opacity-40"
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
        />
        <Button type="submit" disabled={loading || !configured}>
          {t("assistant.send")}
        </Button>
      </form>
    </div>
  );
}
