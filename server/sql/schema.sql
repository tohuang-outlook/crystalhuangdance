CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'upload',
  source_url TEXT,
  file_path TEXT,
  original_filename TEXT,
  duration_seconds INTEGER,
  file_size_bytes INTEGER,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coming_up_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_label TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investor_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  href TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS featured_reels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  placement TEXT NOT NULL,
  youtube_id TEXT,
  video_src TEXT,
  meta_label TEXT NOT NULL,
  meta_label_zh TEXT NOT NULL,
  title TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  description TEXT NOT NULL,
  description_zh TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS press_highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  source_zh TEXT NOT NULL,
  date_label TEXT NOT NULL,
  date_label_zh TEXT NOT NULL,
  title TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  description TEXT NOT NULL,
  description_zh TEXT NOT NULL,
  href TEXT NOT NULL,
  image_src TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  image_alt_zh TEXT NOT NULL,
  image_href TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievement_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  description TEXT NOT NULL,
  description_zh TEXT NOT NULL,
  highlight INTEGER NOT NULL DEFAULT 0,
  latest INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artist_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  cover_identity TEXT NOT NULL,
  cover_identity_zh TEXT NOT NULL,
  cover_statement TEXT NOT NULL,
  cover_statement_zh TEXT NOT NULL,
  about_paragraph_1 TEXT NOT NULL,
  about_paragraph_1_zh TEXT NOT NULL,
  about_paragraph_2 TEXT NOT NULL,
  about_paragraph_2_zh TEXT NOT NULL,
  about_paragraph_3 TEXT NOT NULL,
  about_paragraph_3_zh TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_class_timeline_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_label TEXT NOT NULL,
  date_label_zh TEXT NOT NULL,
  title TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  location TEXT NOT NULL,
  location_zh TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_class_moments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  subtitle_zh TEXT NOT NULL,
  image_src TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  image_alt_zh TEXT NOT NULL,
  video_src TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_choreography_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  season_label TEXT NOT NULL,
  season_label_zh TEXT NOT NULL,
  organization TEXT NOT NULL,
  organization_zh TEXT NOT NULL,
  work_title TEXT NOT NULL,
  work_title_zh TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_choreography_moments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  subtitle_zh TEXT NOT NULL,
  image_src TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  image_alt_zh TEXT NOT NULL,
  video_src TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
