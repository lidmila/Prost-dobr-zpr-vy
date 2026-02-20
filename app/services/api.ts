import { Platform } from 'react-native';

const PROD_API = 'https://proste-dobre-zpravy-api.lidmilamarsalkova.workers.dev/api';

const DEV_API = Platform.OS === 'web'
  ? 'http://localhost:8789/api'
  : PROD_API;

const API_BASE = __DEV__ ? DEV_API : PROD_API;

export function getImageProxyUrl(url: string): string {
  const base = API_BASE.replace('/api', '');
  return `${base}/api/image-proxy?url=${encodeURIComponent(url)}`;
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

interface ArticlesResponse {
  articles: Article[];
  page: number;
  limit: number;
  hasMore: boolean;
}

interface ArticlesParams {
  page?: number;
  limit?: number;
  category?: string;
  language?: string;
  location?: string;
  search?: string;
  adult?: 0 | 1;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((error as { message?: string }).message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getArticles(params: ArticlesParams = {}): Promise<ArticlesResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.language && params.language !== 'all') query.set('language', params.language);
    if (params.location && params.location !== 'all') query.set('location', params.location);
    if (params.search) query.set('search', params.search);
    if (params.adult !== undefined) query.set('adult', String(params.adult));
    const qs = query.toString();
    return request<ArticlesResponse>(`/articles${qs ? `?${qs}` : ''}`);
  },

  getArticle(id: string): Promise<Article> {
    return request<Article>(`/articles/${id}`);
  },

  translate(text: string, targetLang: string, sourceLang?: string) {
    return request<{ translatedText: string }>('/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLang, sourceLang }),
    });
  },

  registerPushToken(pushToken: string, notificationPref = 'daily') {
    return request<{ success: boolean }>('/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ pushToken, notificationPref }),
    });
  },

  register(email: string, password: string, displayName?: string) {
    return request<{ token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  },

  login(email: string, password: string) {
    return request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getFavorites(token: string) {
    return request<{ favorites: { article_id: string; created_at: string }[] }>('/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  addFavorite(articleId: string, token: string) {
    return request<{ success: boolean }>(`/favorites/${articleId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  removeFavorite(articleId: string, token: string) {
    return request<{ success: boolean }>(`/favorites/${articleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
