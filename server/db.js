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

  ensureColumn(db, 'users', 'role', "TEXT NOT NULL DEFAULT 'user'");
  ensureColumn(db, 'users', 'updated_at', "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");
  ensureColumn(db, 'videos', 'original_filename', 'TEXT');
  ensureColumn(db, 'videos', 'duration_seconds', 'INTEGER');
  ensureColumn(db, 'videos', 'file_size_bytes', 'INTEGER');
  ensureColumn(db, 'videos', 'updated_at', "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");
  ensureColumn(db, 'password_reset_tokens', 'used_at', 'TEXT');

  const statements = {
    createUser: db.prepare(
      `INSERT INTO users (email, password_hash, role)
       VALUES (@email, @passwordHash, @role)
       RETURNING id, email, role`
    ),
    findUserByEmail: db.prepare(
      'SELECT id, email, role, password_hash AS passwordHash FROM users WHERE email = ?'
    ),
    findUserById: db.prepare('SELECT id, email, role FROM users WHERE id = ?'),
    setUserRoleByEmail: db.prepare(
      `UPDATE users
       SET role = @role,
           updated_at = CURRENT_TIMESTAMP
       WHERE email = @email
       RETURNING id, email, role`
    ),
    updateUserPasswordHash: db.prepare(
      `UPDATE users
       SET password_hash = @passwordHash,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @userId
       RETURNING id, email, role`
    ),
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
    listUsersWithUploadCounts: db.prepare(
      `SELECT
          users.id,
          users.email,
          users.role,
          users.created_at AS createdAt,
          users.updated_at AS updatedAt,
          COUNT(videos.id) AS uploadCount
       FROM users
       LEFT JOIN videos ON videos.user_id = users.id
       GROUP BY users.id
       ORDER BY datetime(users.created_at) DESC, users.id DESC`
    ),
    listAllVideosWithUploader: db.prepare(
      `SELECT
          videos.id,
          videos.user_id AS userId,
          videos.title,
          videos.source_type AS sourceType,
          videos.source_url AS sourceUrl,
          videos.file_path AS filePath,
          videos.original_filename AS originalFilename,
          videos.duration_seconds AS durationSeconds,
          videos.file_size_bytes AS fileSizeBytes,
          videos.status,
          videos.created_at AS createdAt,
          videos.updated_at AS updatedAt,
          users.id AS uploaderId,
          users.email AS uploaderEmail,
          users.role AS uploaderRole
       FROM videos
       INNER JOIN users ON users.id = videos.user_id
       ORDER BY datetime(videos.created_at) DESC, videos.id DESC`
    ),
    deleteVideoById: db.prepare(
      `DELETE FROM videos
       WHERE id = ?
       RETURNING
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
    deleteVideosByUserId: db.prepare(
      `DELETE FROM videos
       WHERE user_id = ?
       RETURNING
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
    deleteUserById: db.prepare(
      `DELETE FROM users
       WHERE id = ?
       RETURNING id, email, role`
    ),
    insertPasswordResetToken: db.prepare(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (@userId, @tokenHash, @expiresAt)
       RETURNING
         id,
         user_id AS userId,
         token_hash AS tokenHash,
         expires_at AS expiresAt,
         created_at AS createdAt,
         used_at AS usedAt`
    ),
    findPasswordResetTokenByHash: db.prepare(
      `SELECT
         id,
         user_id AS userId,
         token_hash AS tokenHash,
         expires_at AS expiresAt,
         created_at AS createdAt,
         used_at AS usedAt
       FROM password_reset_tokens
       WHERE token_hash = ?`
    ),
    deletePasswordResetTokensByUserId: db.prepare(
      'DELETE FROM password_reset_tokens WHERE user_id = ?'
    ),
    deletePasswordResetTokenById: db.prepare('DELETE FROM password_reset_tokens WHERE id = ?'),
    deleteExpiredPasswordResetTokens: db.prepare(
      'DELETE FROM password_reset_tokens WHERE expires_at <= ?'
    ),
  };

  const deleteUserWithVideos = db.transaction((userId) => {
    const videos = statements.deleteVideosByUserId.all(userId);
    const user = statements.deleteUserById.get(userId);

    if (!user) {
      return null;
    }

    return { user, videos };
  });

  const replacePasswordResetToken = db.transaction(({ userId, tokenHash, expiresAt }) => {
    statements.deletePasswordResetTokensByUserId.run(userId);
    return statements.insertPasswordResetToken.get({ userId, tokenHash, expiresAt });
  });

  const resetUserPassword = db.transaction(({ userId, passwordHash }) => {
    const user = statements.updateUserPasswordHash.get({ userId, passwordHash });

    if (!user) {
      return null;
    }

    statements.deletePasswordResetTokensByUserId.run(userId);
    return user;
  });

  return {
    raw: db,
    createUser({ email, passwordHash, role = 'user' }) {
      return statements.createUser.get({ email, passwordHash, role });
    },
    findUserByEmail(email) {
      return statements.findUserByEmail.get(email) ?? null;
    },
    findUserById(id) {
      return statements.findUserById.get(id) ?? null;
    },
    setUserRoleByEmail(email, role) {
      return statements.setUserRoleByEmail.get({ email, role }) ?? null;
    },
    createPasswordResetToken(passwordResetToken) {
      return replacePasswordResetToken(passwordResetToken);
    },
    findPasswordResetTokenByHash(tokenHash) {
      return statements.findPasswordResetTokenByHash.get(tokenHash) ?? null;
    },
    deletePasswordResetTokenById(tokenId) {
      statements.deletePasswordResetTokenById.run(tokenId);
    },
    deleteExpiredPasswordResetTokens(expiresAt) {
      statements.deleteExpiredPasswordResetTokens.run(expiresAt);
    },
    resetUserPassword(resetRequest) {
      return resetUserPassword(resetRequest);
    },
    createVideo(video) {
      return statements.createVideo.get(video);
    },
    listVideosByUser(userId) {
      return statements.listVideosByUser.all(userId);
    },
    listUsersWithUploadCounts() {
      return statements.listUsersWithUploadCounts.all().map((user) => ({
        ...user,
        uploadCount: Number(user.uploadCount),
      }));
    },
    listAllVideosWithUploader() {
      return statements.listAllVideosWithUploader.all();
    },
    deleteVideoById(videoId) {
      return statements.deleteVideoById.get(videoId) ?? null;
    },
    deleteUserWithVideos(userId) {
      return deleteUserWithVideos(userId);
    },
    close() {
      db.close();
    },
  };
}
