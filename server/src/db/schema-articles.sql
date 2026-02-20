CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT,
  source_name TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'cs',
  category TEXT NOT NULL DEFAULT 'other',
  location TEXT NOT NULL DEFAULT 'world',
  is_adult INTEGER NOT NULL DEFAULT 0,
  positivity_score REAL NOT NULL DEFAULT 0,
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_language ON articles(language);
CREATE INDEX IF NOT EXISTS idx_articles_location ON articles(location);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_domain);
