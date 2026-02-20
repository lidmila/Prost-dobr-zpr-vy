CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  article_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, article_id)
);

CREATE TABLE IF NOT EXISTS device_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  push_token TEXT UNIQUE NOT NULL,
  notification_pref TEXT NOT NULL DEFAULT 'daily',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON device_tokens(user_id);
