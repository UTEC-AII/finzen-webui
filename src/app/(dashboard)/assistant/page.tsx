"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
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
