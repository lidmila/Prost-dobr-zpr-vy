import { useState, useEffect, useCallback } from 'react';
import { Article } from '../services/api';
import { offlineDb } from '../services/database';

interface UseOfflineArticlesReturn {
  articles: Article[];
  loading: boolean;
  saveArticle: (article: Article) => Promise<void>;
  removeArticle: (id: string) => Promise<void>;
  isArticleSaved: (id: string) => boolean;
}

export function useOfflineArticles(): UseOfflineArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function loadArticles() {
      setLoading(true);
      try {
        const saved = await offlineDb.getArticles();
        if (!cancelled) {
          setArticles(saved);
          setSavedIds(new Set(saved.map((a) => a.id)));
        }
      } catch {
        // Silently fail - offline articles will appear empty
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveArticle = useCallback(async (article: Article) => {
    await offlineDb.saveArticle(article);
    setArticles((prev) => {
      const exists = prev.some((a) => a.id === article.id);
      return exists ? prev : [article, ...prev];
    });
    setSavedIds((prev) => new Set(prev).add(article.id));
  }, []);

  const removeArticle = useCallback(async (id: string) => {
    await offlineDb.removeArticle(id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isArticleSaved = useCallback(
    (id: string): boolean => {
      return savedIds.has(id);
    },
    [savedIds]
  );

  return {
    articles,
    loading,
    saveArticle,
    removeArticle,
    isArticleSaved,
  };
}
