import { useState, useEffect, useCallback, useRef } from 'react';
import { api, Article } from '../services/api';

interface ArticlesFilters {
  category: string;
  language: string;
  location: string;
  search: string;
}

interface UseArticlesReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  filters: ArticlesFilters;
  loadMore: () => void;
  refresh: () => Promise<void>;
  setFilter: (key: keyof ArticlesFilters, value: string) => void;
}

export function useArticles(): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<ArticlesFilters>({
    category: 'all',
    language: 'all',
    location: 'all',
    search: '',
  });

  const pageRef = useRef(1);
  const filtersRef = useRef(filters);
  const isFetchingRef = useRef(false);

  const fetchArticles = useCallback(async (page: number, append: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    const f = filtersRef.current;
    console.log('[useArticles] fetching page', page, 'filters:', JSON.stringify(f));

    try {
      const response = await api.getArticles({
        page,
        limit: 20,
        category: f.category !== 'all' ? f.category : undefined,
        language: f.language !== 'all' ? f.language : undefined,
        location: f.location !== 'all' ? f.location : undefined,
        search: f.search || undefined,
      });

      console.log('[useArticles] got', response.articles.length, 'articles, hasMore:', response.hasMore);

      if (append) {
        setArticles((prev) => [...prev, ...response.articles]);
      } else {
        setArticles(response.articles);
      }
      setHasMore(response.hasMore);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Nepodařilo se načíst články';
      console.log('[useArticles] error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial fetch only once
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    fetchArticles(1, false);
  }, [fetchArticles]);

  const loadMore = useCallback(() => {
    if (!isFetchingRef.current && hasMore) {
      pageRef.current += 1;
      fetchArticles(pageRef.current, true);
    }
  }, [hasMore, fetchArticles]);

  const refresh = useCallback(async () => {
    pageRef.current = 1;
    await fetchArticles(1, false);
  }, [fetchArticles]);

  const setFilter = useCallback(
    (key: keyof ArticlesFilters, value: string) => {
      filtersRef.current = { ...filtersRef.current, [key]: value };
      setFilters({ ...filtersRef.current });
      pageRef.current = 1;
      fetchArticles(1, false);
    },
    [fetchArticles]
  );

  return {
    articles,
    loading,
    error,
    hasMore,
    filters,
    loadMore,
    refresh,
    setFilter,
  };
}
