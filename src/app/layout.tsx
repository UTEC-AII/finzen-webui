import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n";
import { OpenAIKeyProvider } from "@/lib/openai-key";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinZen",
  description: "Finanzas personales con consultas inteligentes (IA)",
};

// Evita el parpadeo de tema/idioma aplicando lo guardado antes de pintar.
const BOOT_SCRIPT = `try{var t=localStorage.getItem('finzen-theme');if(t==='light'){document.documentElement.classList.add('light');}var l=localStorage.getItem('finzen-lang');if(l){document.documentElement.lang=l;}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=VT323&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <OpenAIKeyProvider>{children}</OpenAIKeyProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
