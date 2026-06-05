import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const schemaPath = new URL('./sql/schema.sql', import.meta.url);

function ensureParentDirectory(filename) {
  if (filename === ':memory:') {
    return;
  }

  fs.mkdirSync(path.dirname(filename), { recursive: true });
}

function ensureColumn(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

export function createDatabase(filename) {
  ensureParentDirectory(filename);

  const db = new Database(filename);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  db.pragma('foreign_keys = ON');
  db.exec(schemaSql);

  ensureColumn(db, 'users', 'updated_at', "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");
  ensureColumn(db, 'videos', 'original_filename', 'TEXT');
  ensureColumn(db, 'videos', 'duration_seconds', 'INTEGER');
  ensureColumn(db, 'videos', 'file_size_bytes', 'INTEGER');
  ensureColumn(db, 'videos', 'updated_at', "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");

  const statements = {
    createUser: db.prepare(
      `INSERT INTO users (email, password_hash)
       VALUES (@email, @passwordHash)
       RETURNING id, email`
    ),
    findUserByEmail: db.prepare(
      'SELECT id, email, password_hash AS passwordHash FROM users WHERE email = ?'
    ),
    findUserById: db.prepare('SELECT id, email FROM users WHERE id = ?'),
    createVideo: db.prepare(
      `INSERT INTO videos (
          user_id,
          title,
          source_type,
          source_url,
          file_path,
          original_filename,
          duration_seconds,
          file_size_bytes,
          status
        ) VALUES (
          @userId,
          @title,
          @sourceType,
          @sourceUrl,
          @filePath,
          @originalFilename,
          @durationSeconds,
          @fileSizeBytes,
          @status
        ) RETURNING
          id,
          user_id AS userId,
          title,
          source_type AS sourceType,
          source_url AS sourceUrl,
          file_path AS filePath,
          original_filename AS originalFilename,
          duration_seconds AS durationSeconds,
          file_size_bytes AS fileSizeBytes,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    listVideosByUser: db.prepare(
      `SELECT
          id,
          user_id AS userId,
          title,
          source_type AS sourceType,
          source_url AS sourceUrl,
          file_path AS filePath,
          original_filename AS originalFilename,
          duration_seconds AS durationSeconds,
          file_size_bytes AS fileSizeBytes,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM videos
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC, id DESC`
    ),
  };

  return {
    raw: db,
    createUser({ email, passwordHash }) {
      return statements.createUser.get({ email, passwordHash });
    },
    findUserByEmail(email) {
      return statements.findUserByEmail.get(email) ?? null;
    },
    findUserById(id) {
      return statements.findUserById.get(id) ?? null;
    },
    createVideo(video) {
      return statements.createVideo.get(video);
    },
    listVideosByUser(userId) {
      return statements.listVideosByUser.all(userId);
    },
    close() {
      db.close();
    },
  };
}
