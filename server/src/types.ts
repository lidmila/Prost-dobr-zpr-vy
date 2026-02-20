export interface Env {
  ARTICLES_DB: D1Database;
  INTERNAL_DB: D1Database;
  AI?: Ai;
  JWT_SECRET: string;
  LIBRE_TRANSLATE_URL: string;
}

export interface Article {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image_url: string | null;
  source_name: string;
  source_domain: string;
  language: string;
  category: string;
  location: string;
  is_adult: number;
  positivity_score: number;
  published_at: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  created_at: string;
}

export interface RSSSource {
  name: string;
  url: string;
  domain: string;
  language: string;
  location: string;
}
