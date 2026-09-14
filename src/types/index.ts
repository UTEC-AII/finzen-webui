// Tipos que reflejan las respuestas del backend FastAPI.

export interface User {
  id: string;
  name: string;
  email: string;
  preferred_currency: string;
  // Los montos llegan como string (Decimal serializado por Pydantic).
  monthly_savings_goal: string;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  type: string;
  amount: string;
  currency: string;
  date: string;
  description: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: string;
  currency: string;
  date: string;
  description: string;
  created_at: string;
}

export interface CategoryList {
  categories: string[];
}

export interface SourceItem {
  id: string;
  text: string;
}

export interface QueryResponse {
  answer: string;
  matched_records: number;
  sources: SourceItem[];
}

export interface ReindexResponse {
  reindexed: number;
  model: string;
}
