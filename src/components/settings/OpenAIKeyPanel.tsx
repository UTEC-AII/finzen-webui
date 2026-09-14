"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n";
import { useOpenAIKey } from "@/lib/openai-key";

// Panel para configurar la clave de OpenAI. La clave viaja al servidor (BFF) y
// se guarda ahí; el navegador solo recibe el estado y una versión enmascarada.
export function OpenAIKeyPanel() {
  const { t } = useI18n();
  const { configured, masked, refresh } = useOpenAIKey();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function save() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/settings/openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: value }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || t("openai.invalid"));
      setValue("");
      setMessage(t("openai.saved"));
      await refresh();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setLoading(true);
    setMessage("");
    try {
      await fetch("/api/settings/openai-key", { method: "DELETE" });
      setMessage(t("openai.removed"));
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-xs">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-text-soft">{t("openai.title")}</p>
          <p className="text-muted">
            {configured
              ? t("openai.configured", { masked: masked ?? "" })
              : t("openai.notConfigured")}
          </p>
        </div>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="px-2 text-lg leading-none text-muted transition hover:text-text"
          aria-label={t("openai.title")}
        >
          {open ? "−" : "+"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-muted">{t("openai.desc")}</p>
          <Input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("openai.placeholder")}
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={save} disabled={loading || !value}>
              {loading ? t("openai.saving") : t("openai.save")}
            </Button>
            {configured && (
              <Button type="button" variant="outline" onClick={remove} disabled={loading}>
                {t("openai.remove")}
              </Button>
            )}
          </div>
          {message && <p className="text-text-soft">{message}</p>}
        </div>
      )}
    </div>
  );
}
