import { Platform } from 'react-native';
import type { Article } from './api';

// Web fallback - SQLite is not available on web
const isWeb = Platform.OS === 'web';

let db: any = null;

async function getDb() {
  if (isWeb) return null;
  if (!db) {
    const SQLite = require('expo-sqlite');
    db = await SQLite.openDatabaseAsync('offline-articles.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        url TEXT NOT NULL,
        image_url TEXT,
        source_name TEXT NOT NULL,
        source_domain TEXT NOT NULL,
        language TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        is_adult INTEGER NOT NULL DEFAULT 0,
        positivity_score REAL NOT NULL DEFAULT 0,
        published_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        saved_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }
  return db;
}

export const offlineDb = {
  async saveArticle(article: Article): Promise<void> {
    const database = await getDb();
    if (!database) return;
    await database.runAsync(
      `INSERT OR REPLACE INTO offline_articles
       (id, title, description, content, url, image_url, source_name, source_domain, language, category, location, is_adult, positivity_score, published_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        article.id,
        article.title,
        article.description,
        article.content,
        article.url,
        article.image_url,
        article.source_name,
        article.source_domain,
        article.language,
        article.category,
        article.location,
        article.is_adult,
        article.positivity_score,
        article.published_at,
        article.created_at,
      ]
    );
  },

  async removeArticle(id: string): Promise<void> {
    const database = await getDb();
    if (!database) return;
    await database.runAsync('DELETE FROM offline_articles WHERE id = ?', [id]);
  },

  async getArticles(): Promise<Article[]> {
    const database = await getDb();
    if (!database) return [];
    return database.getAllAsync<Article>(
      'SELECT * FROM offline_articles ORDER BY saved_at DESC'
    );
  },

  async getArticle(id: string): Promise<Article | null> {
    const database = await getDb();
    if (!database) return null;
    return database.getFirstAsync<Article>(
      'SELECT * FROM offline_articles WHERE id = ?',
      [id]
    );
  },

  async isArticleSaved(id: string): Promise<boolean> {
    const database = await getDb();
    if (!database) return false;
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM offline_articles WHERE id = ?',
      [id]
    );
    return (result?.count ?? 0) > 0;
  },
};
