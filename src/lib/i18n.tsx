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

export type Lang = "es" | "en";

export const LANG_STORAGE_KEY = "finzen-lang";
export const DEFAULT_LANG: Lang = "es";

// Diccionarios de textos de la interfaz (español e inglés).
const DICT: Record<Lang, Record<string, string>> = {
  es: {
    "nav.dashboard": "Dashboard",
    "nav.incomes": "Ingresos",
    "nav.expenses": "Gastos",
    "nav.assistant": "Asistente",
    "common.profile": "Mi perfil",
    "common.logout": "Cerrar sesión",
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.saving": "Guardando...",
    "common.cancel": "Cancelar",
    "common.back": "Volver",
    "common.delete": "Eliminar",

    "landing.tagline":
      "Registra tus ingresos y gastos, y pregúntale a tu asistente de IA en lenguaje natural sobre tus propias finanzas.",
    "landing.createAccount": "Crear cuenta",
    "landing.login": "Iniciar sesión",

    "login.title": "Inicia sesión",
    "login.subtitle": "Accede a tus finanzas",
    "login.email": "Correo",
    "login.password": "Contraseña",
    "login.emailPlaceholder": "tucorreo@ejemplo.com",
    "login.passwordPlaceholder": "••••••••",
    "login.submit": "Entrar",
    "login.loading": "Entrando...",
    "login.noAccount": "¿No tienes cuenta?",
    "login.register": "Regístrate",
    "login.error": "No se pudo iniciar sesión",

    "register.title": "Crea tu cuenta",
    "register.subtitle": "Empieza a ordenar tus finanzas",
    "register.name": "Nombre",
    "register.namePlaceholder": "Tu nombre",
    "register.email": "Correo",
    "register.password": "Contraseña",
    "register.passwordPlaceholder": "Mínimo 6 caracteres",
    "register.currency": "Moneda preferida",
    "register.submit": "Registrarme",
    "register.loading": "Creando...",
    "register.haveAccount": "¿Ya tienes cuenta?",
    "register.login": "Inicia sesión",
    "register.error": "No se pudo crear la cuenta",

    "dashboard.greeting": "Hola, {name}",
    "dashboard.hello": "Hola",
    "dashboard.balance": "Balance actual",
    "dashboard.incomes": "Ingresos",
    "dashboard.expenses": "Gastos",
    "dashboard.newIncome": "+ Nuevo ingreso",
    "dashboard.newExpense": "+ Nuevo gasto",
    "dashboard.smartQuery": "Consulta inteligente",
    "dashboard.expensesByCategory": "Gastos por categoría",
    "dashboard.categoryDetail": "Detalle por categoría",
    "dashboard.noExpenses": "Aún no registras gastos.",
    "dashboard.noExpensesChart": "Sin gastos registrados.",
    "dashboard.recent": "Últimos movimientos",
    "dashboard.noMovements": "Registra tu primer ingreso o gasto para verlos aquí.",

    "incomes.title": "Mis ingresos",
    "incomes.new": "+ Nuevo",
    "incomes.empty": "Aún no tienes ingresos. Registra tu primer ingreso.",

    "incomeNew.title": "Nuevo ingreso",
    "incomeNew.type": "Tipo",
    "incomeNew.amount": "Monto",
    "incomeNew.currency": "Moneda",
    "incomeNew.date": "Fecha",
    "incomeNew.description": "Descripción (opcional)",
    "incomeNew.descriptionPlaceholder": "Sueldo de setiembre",

    "incomeDetail.title": "Detalle del ingreso",
    "incomeDetail.date": "Fecha",
    "incomeDetail.currency": "Moneda",
    "incomeDetail.description": "Descripción",
    "incomeDetail.notFound": "Ingreso no encontrado.",

    "expenses.title": "Mis gastos",
    "expenses.new": "+ Nuevo",
    "expenses.all": "Todas",
    "expenses.from": "Desde",
    "expenses.to": "Hasta",
    "expenses.empty": "No hay gastos para ese filtro.",

    "expenseNew.title": "Nuevo gasto",
    "expenseNew.category": "Categoría",
    "expenseNew.amount": "Monto",
    "expenseNew.currency": "Moneda",
    "expenseNew.date": "Fecha",
    "expenseNew.description": "Descripción (opcional)",
    "expenseNew.descriptionPlaceholder": "Supermercado",

    "expenseDetail.title": "Detalle del gasto",
    "expenseDetail.date": "Fecha",
    "expenseDetail.currency": "Moneda",
    "expenseDetail.description": "Descripción",
    "expenseDetail.notFound": "Gasto no encontrado.",

    "profile.title": "Mi perfil",
    "profile.emailLocked": "Correo (no editable)",
    "profile.name": "Nombre",
    "profile.currency": "Moneda preferida",
    "profile.savingsGoal": "Meta de ahorro mensual",
    "profile.save": "Guardar cambios",
    "profile.updated": "Perfil actualizado correctamente.",

    "assistant.title": "Consulta inteligente",
    "assistant.greeting":
      "¡Hola! Soy tu asistente de FinZen. Pregúntame lo que quieras sobre tus finanzas.",
    "assistant.placeholder": "Escribe tu pregunta...",
    "assistant.send": "Enviar",
    "assistant.thinking": "FinZen IA está pensando...",
    "assistant.error": "Ocurrió un error al procesar tu consulta.",
    "assistant.disabled": "Configura tu clave de OpenAI para usar el asistente.",
    "assistant.requiresKey":
      "El asistente está deshabilitado. Agrega tu clave de OpenAI aquí arriba para activarlo.",

    "openai.title": "Clave de OpenAI",
    "openai.desc":
      "Se guarda solo en el servidor (nunca en el navegador) para que el asistente use embeddings y respuestas reales.",
    "openai.placeholder": "sk-...",
    "openai.save": "Guardar clave",
    "openai.saving": "Guardando...",
    "openai.remove": "Quitar",
    "openai.configured": "Configurada: {masked}",
    "openai.notConfigured": "No configurada (el asistente responde en modo local).",
    "openai.invalid": "La clave no es válida.",
    "openai.saved": "Clave guardada. El asistente usará OpenAI.",
    "openai.removed": "Clave eliminada.",
  },
  en: {
    "nav.dashboard": "Dashboard",
    "nav.incomes": "Income",
    "nav.expenses": "Expenses",
    "nav.assistant": "Assistant",
    "common.profile": "My profile",
    "common.logout": "Log out",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.saving": "Saving...",
    "common.cancel": "Cancel",
    "common.back": "Back",
    "common.delete": "Delete",

    "landing.tagline":
      "Track your income and expenses, and ask your AI assistant about your own finances in natural language.",
    "landing.createAccount": "Create account",
    "landing.login": "Sign in",

    "login.title": "Sign in",
    "login.subtitle": "Access your finances",
    "login.email": "Email",
    "login.password": "Password",
    "login.emailPlaceholder": "you@example.com",
    "login.passwordPlaceholder": "••••••••",
    "login.submit": "Sign in",
    "login.loading": "Signing in...",
    "login.noAccount": "Don't have an account?",
    "login.register": "Sign up",
    "login.error": "Could not sign in",

    "register.title": "Create your account",
    "register.subtitle": "Start organizing your finances",
    "register.name": "Name",
    "register.namePlaceholder": "Your name",
    "register.email": "Email",
    "register.password": "Password",
    "register.passwordPlaceholder": "At least 6 characters",
    "register.currency": "Preferred currency",
    "register.submit": "Sign up",
    "register.loading": "Creating...",
    "register.haveAccount": "Already have an account?",
    "register.login": "Sign in",
    "register.error": "Could not create the account",

    "dashboard.greeting": "Hi, {name}",
    "dashboard.hello": "Hi",
    "dashboard.balance": "Current balance",
    "dashboard.incomes": "Income",
    "dashboard.expenses": "Expenses",
    "dashboard.newIncome": "+ New income",
    "dashboard.newExpense": "+ New expense",
    "dashboard.smartQuery": "Smart query",
    "dashboard.expensesByCategory": "Expenses by category",
    "dashboard.categoryDetail": "Category detail",
    "dashboard.noExpenses": "You haven't recorded expenses yet.",
    "dashboard.noExpensesChart": "No expenses recorded.",
    "dashboard.recent": "Recent activity",
    "dashboard.noMovements": "Record your first income or expense to see it here.",

    "incomes.title": "My income",
    "incomes.new": "+ New",
    "incomes.empty": "You have no income yet. Record your first one.",

    "incomeNew.title": "New income",
    "incomeNew.type": "Type",
    "incomeNew.amount": "Amount",
    "incomeNew.currency": "Currency",
    "incomeNew.date": "Date",
    "incomeNew.description": "Description (optional)",
    "incomeNew.descriptionPlaceholder": "September salary",

    "incomeDetail.title": "Income detail",
    "incomeDetail.date": "Date",
    "incomeDetail.currency": "Currency",
    "incomeDetail.description": "Description",
    "incomeDetail.notFound": "Income not found.",

    "expenses.title": "My expenses",
    "expenses.new": "+ New",
    "expenses.all": "All",
    "expenses.from": "From",
    "expenses.to": "To",
    "expenses.empty": "No expenses for that filter.",

    "expenseNew.title": "New expense",
    "expenseNew.category": "Category",
    "expenseNew.amount": "Amount",
    "expenseNew.currency": "Currency",
    "expenseNew.date": "Date",
    "expenseNew.description": "Description (optional)",
    "expenseNew.descriptionPlaceholder": "Groceries",

    "expenseDetail.title": "Expense detail",
    "expenseDetail.date": "Date",
    "expenseDetail.currency": "Currency",
    "expenseDetail.description": "Description",
    "expenseDetail.notFound": "Expense not found.",

    "profile.title": "My profile",
    "profile.emailLocked": "Email (not editable)",
    "profile.name": "Name",
    "profile.currency": "Preferred currency",
    "profile.savingsGoal": "Monthly savings goal",
    "profile.save": "Save changes",
    "profile.updated": "Profile updated successfully.",

    "assistant.title": "Smart query",
    "assistant.greeting":
      "Hi! I'm your FinZen assistant. Ask me anything about your finances.",
    "assistant.placeholder": "Type your question...",
    "assistant.send": "Send",
    "assistant.thinking": "FinZen AI is thinking...",
    "assistant.error": "Something went wrong while processing your query.",
    "assistant.disabled": "Set your OpenAI key to use the assistant.",
    "assistant.requiresKey":
      "The assistant is disabled. Add your OpenAI key above to enable it.",

    "openai.title": "OpenAI key",
    "openai.desc":
      "Stored only on the server (never in the browser) so the assistant can use real embeddings and answers.",
    "openai.placeholder": "sk-...",
    "openai.save": "Save key",
    "openai.saving": "Saving...",
    "openai.remove": "Remove",
    "openai.configured": "Configured: {masked}",
    "openai.notConfigured": "Not configured (assistant replies in local mode).",
    "openai.invalid": "The key is not valid.",
    "openai.saved": "Key saved. The assistant will use OpenAI.",
    "openai.removed": "Key removed.",
  },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  locale: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // El idioma se inicializa desde localStorage (igual que en quartopress).
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return DEFAULT_LANG;
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return stored === "en" || stored === "es" ? stored : DEFAULT_LANG;
  });

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      let value = DICT[lang][key] ?? key;
      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          value = value.replace(`{${name}}`, replacement);
        }
      }
      return value;
    },
    [lang],
  );

  const locale = lang === "es" ? "es-PE" : "en-US";
  const value = useMemo(
    () => ({ lang, setLang, t, locale }),
    [lang, setLang, t, locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n debe usarse dentro de I18nProvider");
  return ctx;
}
