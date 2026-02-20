import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { offlineDb } from '../services/database';
import { storage } from '../services/storage';

interface UseFavoritesReturn {
  favoriteIds: Set<string>;
  loading: boolean;
  toggleFavorite: (articleId: string) => Promise<void>;
  isFavorite: (articleId: string) => boolean;
}

export function useFavorites(): UseFavoritesReturn {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      setLoading(true);
      try {
        const token = await storage.getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.getFavorites(token);
        if (!cancelled) {
          const ids = new Set(response.favorites.map((f) => f.article_id));
          setFavoriteIds(ids);
        }
      } catch {
        // Silently fail - favorites will appear empty
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleFavorite = useCallback(async (articleId: string) => {
    const token = await storage.getAuthToken();
    if (!token) return;

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });

    try {
      const wasFavorite = favoriteIds.has(articleId);

      if (wasFavorite) {
        await api.removeFavorite(articleId, token);
        await offlineDb.removeArticle(articleId);
      } else {
        await api.addFavorite(articleId, token);
        const article = await api.getArticle(articleId);
        await offlineDb.saveArticle(article);
      }
    } catch {
      // Revert optimistic update on failure
      setFavoriteIds((prev) => {
        const reverted = new Set(prev);
        if (reverted.has(articleId)) {
          reverted.delete(articleId);
        } else {
          reverted.add(articleId);
        }
        return reverted;
      });
    }
  }, [favoriteIds]);

  const isFavorite = useCallback(
    (articleId: string): boolean => {
      return favoriteIds.has(articleId);
    },
    [favoriteIds]
  );

  return {
    favoriteIds,
    loading,
    toggleFavorite,
    isFavorite,
  };
}
