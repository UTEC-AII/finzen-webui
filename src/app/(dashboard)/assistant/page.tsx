"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useUser } from "@/hooks/useUser";
import { api, endpoints } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useOpenAIKey } from "@/lib/openai-key";
import type { QueryResponse } from "@/types";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function AssistantPage() {
  const user = useUser();
  const { t } = useI18n();
  const { configured } = useOpenAIKey();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const shown: Message[] = messages.length
    ? messages
    : [{ role: "ai", text: t("assistant.greeting") }];

  // Auto-scroll al último mensaje (como un chat real).
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function ask(question: string) {
    if (!user || !configured || !question.trim() || loading) return;
    setMessages((prev) => [...(prev.length ? prev : shown), { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const data = await api.post<QueryResponse>(endpoints.ai("/query"), {
        user_id: user.id,
        question,
        timezone: user.timezone,
      });
      setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
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
    <div className="mx-auto flex h-[calc(100dvh-12rem)] max-w-3xl flex-col md:h-[78vh]">
      {!configured && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <p className="text-xs text-muted">{t("assistant.configureInProfile")}</p>
          <Link
            href="/profile"
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg transition hover:opacity-90"
          >
            {t("assistant.goToProfile")}
          </Link>
        </div>
      )}

      {/* Mensajes: sin recuadro, sobre el fondo negro */}
      <div className="flex-1 space-y-5 overflow-y-auto px-1 py-2">
        {shown.map((message, index) => (
          <div
            key={index}
            className={cn("msg-in", message.role === "user" ? "flex justify-end" : "flex justify-start")}
          >
            {message.role === "user" ? (
              <div className="max-w-[80%] rounded-3xl bg-surface-2 px-4 py-2.5 text-sm text-text">
                {message.text}
              </div>
            ) : (
              <p className="max-w-[92%] whitespace-pre-wrap text-sm leading-relaxed text-text-soft">
                {message.text}
              </p>
            )}
          </div>
        ))}

        {loading && (
          <div className="msg-in flex justify-start">
            <div className="flex items-center gap-1 rounded-3xl bg-surface-2 px-4 py-3">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: "0.16s" }} />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: "0.32s" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input tipo ChatGPT */}
      <form
        onSubmit={onSubmit}
        className="mt-3 flex items-center gap-2 rounded-[1.75rem] border border-border bg-surface py-1.5 pl-4 pr-1.5 transition focus-within:border-muted-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("assistant.placeholder")}
          disabled={loading || !configured}
          className="h-9 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !configured || !input.trim()}
          aria-label={t("assistant.send")}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary text-primary-fg transition hover:opacity-90 active:scale-95 disabled:opacity-30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </form>
    </div>
  );
}
