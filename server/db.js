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
  ensureColumn(db, 'users', 'member_type', "TEXT NOT NULL DEFAULT 'dancer'");
  ensureColumn(db, 'users', 'updated_at', "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");
  ensureColumn(db, 'videos', 'original_filename', 'TEXT');
  ensureColumn(db, 'videos', 'duration_seconds', 'INTEGER');
  ensureColumn(db, 'videos', 'file_size_bytes', 'INTEGER');
  ensureColumn(db, 'videos', 'updated_at', "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");
  ensureColumn(db, 'password_reset_tokens', 'used_at', 'TEXT');

  db.exec(`
    CREATE TABLE IF NOT EXISTS investment_portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      base_currency TEXT NOT NULL DEFAULT 'USD',
      display_name TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS investment_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL REFERENCES investment_portfolios(id) ON DELETE CASCADE,
      asset_symbol TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      transaction_type TEXT NOT NULL DEFAULT 'buy',
      amount_invested REAL NOT NULL,
      purchase_price REAL NOT NULL,
      purchase_shares REAL NOT NULL,
      purchase_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS investment_monthly_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL REFERENCES investment_portfolios(id) ON DELETE CASCADE,
      month_key TEXT NOT NULL,
      portfolio_value REAL NOT NULL,
      snapshot_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (portfolio_id, month_key)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS investment_monthly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL REFERENCES investment_portfolios(id) ON DELETE CASCADE,
      month_key TEXT NOT NULL,
      snapshot_date TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ready',
      generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (portfolio_id, month_key)
    )
  `);

  const statements = {
    createUser: db.prepare(
      `INSERT INTO users (email, password_hash, role, member_type)
       VALUES (@email, @passwordHash, @role, @memberType)
       RETURNING id, email, role, member_type AS memberType`
    ),
    findUserByEmail: db.prepare(
      'SELECT id, email, role, member_type AS memberType, password_hash AS passwordHash FROM users WHERE email = ?'
    ),
    findUserById: db.prepare(
      'SELECT id, email, role, member_type AS memberType FROM users WHERE id = ?'
    ),
    createInvestmentPortfolio: db.prepare(
      `INSERT INTO investment_portfolios (user_id, base_currency, display_name, notes)
       VALUES (@userId, @baseCurrency, @displayName, @notes)
       RETURNING
         id,
         user_id AS userId,
         base_currency AS baseCurrency,
         display_name AS displayName,
         notes,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    findInvestmentPortfolioByUserId: db.prepare(
      `SELECT
         id,
         user_id AS userId,
         base_currency AS baseCurrency,
         display_name AS displayName,
         notes,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM investment_portfolios
       WHERE user_id = ?`
    ),
    listInvestmentPortfoliosForInvestors: db.prepare(
      `SELECT
         portfolios.id,
         portfolios.user_id AS userId,
         portfolios.base_currency AS baseCurrency,
         portfolios.display_name AS displayName,
         portfolios.notes,
         portfolios.created_at AS createdAt,
         portfolios.updated_at AS updatedAt
       FROM investment_portfolios portfolios
       INNER JOIN users ON users.id = portfolios.user_id
       WHERE users.member_type = 'investor'
       ORDER BY portfolios.id ASC`
    ),
    createInvestmentTransaction: db.prepare(
      `INSERT INTO investment_transactions (
         portfolio_id,
         asset_symbol,
         asset_name,
         transaction_type,
         amount_invested,
         purchase_price,
         purchase_shares,
         purchase_date,
         notes
       ) VALUES (
         @portfolioId,
         @assetSymbol,
         @assetName,
         @transactionType,
         @amountInvested,
         @purchasePrice,
         @purchaseShares,
         @purchaseDate,
         @notes
       )
       RETURNING
         id,
         portfolio_id AS portfolioId,
         asset_symbol AS assetSymbol,
         asset_name AS assetName,
         transaction_type AS transactionType,
         amount_invested AS amountInvested,
         purchase_price AS purchasePrice,
         purchase_shares AS purchaseShares,
         purchase_date AS purchaseDate,
         notes,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    findInvestmentTransactionById: db.prepare(
      `SELECT
         id,
         portfolio_id AS portfolioId,
         asset_symbol AS assetSymbol,
         asset_name AS assetName,
         transaction_type AS transactionType,
         amount_invested AS amountInvested,
         purchase_price AS purchasePrice,
         purchase_shares AS purchaseShares,
         purchase_date AS purchaseDate,
         notes,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM investment_transactions
       WHERE id = ?`
    ),
    updateInvestmentTransaction: db.prepare(
      `UPDATE investment_transactions
       SET asset_symbol = @assetSymbol,
           asset_name = @assetName,
           transaction_type = @transactionType,
           amount_invested = @amountInvested,
           purchase_price = @purchasePrice,
           purchase_shares = @purchaseShares,
           purchase_date = @purchaseDate,
           notes = @notes,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
         id,
         portfolio_id AS portfolioId,
         asset_symbol AS assetSymbol,
         asset_name AS assetName,
         transaction_type AS transactionType,
         amount_invested AS amountInvested,
         purchase_price AS purchasePrice,
         purchase_shares AS purchaseShares,
         purchase_date AS purchaseDate,
         notes,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    deleteInvestmentTransactionById: db.prepare(
      `DELETE FROM investment_transactions
       WHERE id = ?
       RETURNING
         id,
         portfolio_id AS portfolioId,
         asset_symbol AS assetSymbol,
         asset_name AS assetName,
         transaction_type AS transactionType,
         amount_invested AS amountInvested,
         purchase_price AS purchasePrice,
         purchase_shares AS purchaseShares,
         purchase_date AS purchaseDate,
         notes,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    listInvestmentTransactionsByPortfolioId: db.prepare(
      `SELECT
         id,
         portfolio_id AS portfolioId,
         asset_symbol AS assetSymbol,
         asset_name AS assetName,
         transaction_type AS transactionType,
         amount_invested AS amountInvested,
         purchase_price AS purchasePrice,
         purchase_shares AS purchaseShares,
         purchase_date AS purchaseDate,
         notes,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM investment_transactions
       WHERE portfolio_id = ?
       ORDER BY date(purchase_date) DESC, id DESC`
    ),
    listInvestmentMonthlyHistoryByPortfolioId: db.prepare(
      `SELECT
         id,
         portfolio_id AS portfolioId,
         month_key AS month,
         portfolio_value AS portfolioValue,
         snapshot_date AS snapshotDate,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM investment_monthly_history
       WHERE portfolio_id = ?
       ORDER BY month_key ASC, id ASC`
    ),
    upsertInvestmentMonthlyHistory: db.prepare(
      `INSERT INTO investment_monthly_history (
         portfolio_id,
         month_key,
         portfolio_value,
         snapshot_date
       ) VALUES (
         @portfolioId,
         @month,
         @portfolioValue,
         @snapshotDate
       )
       ON CONFLICT(portfolio_id, month_key) DO UPDATE SET
         portfolio_value = excluded.portfolio_value,
         snapshot_date = excluded.snapshot_date,
         updated_at = CURRENT_TIMESTAMP
       RETURNING
         id,
         portfolio_id AS portfolioId,
         month_key AS month,
         portfolio_value AS portfolioValue,
         snapshot_date AS snapshotDate,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    listInvestmentMonthlyReportsByPortfolioId: db.prepare(
      `SELECT
         id,
         portfolio_id AS portfolioId,
         month_key AS monthKey,
         snapshot_date AS snapshotDate,
         file_name AS fileName,
         file_path AS filePath,
         status,
         generated_at AS generatedAt,
         error_message AS errorMessage,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM investment_monthly_reports
       WHERE portfolio_id = ?
       ORDER BY month_key DESC, id DESC`
    ),
    findInvestmentMonthlyReportByPortfolioIdAndMonth: db.prepare(
      `SELECT
         id,
         portfolio_id AS portfolioId,
         month_key AS monthKey,
         snapshot_date AS snapshotDate,
         file_name AS fileName,
         file_path AS filePath,
         status,
         generated_at AS generatedAt,
         error_message AS errorMessage,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM investment_monthly_reports
       WHERE portfolio_id = ? AND month_key = ?`
    ),
    upsertInvestmentMonthlyReport: db.prepare(
      `INSERT INTO investment_monthly_reports (
         portfolio_id,
         month_key,
         snapshot_date,
         file_name,
         file_path,
         status,
         error_message
       ) VALUES (
         @portfolioId,
         @monthKey,
         @snapshotDate,
         @fileName,
         @filePath,
         @status,
         @errorMessage
       )
       ON CONFLICT(portfolio_id, month_key) DO UPDATE SET
         snapshot_date = excluded.snapshot_date,
         file_name = excluded.file_name,
         file_path = excluded.file_path,
         status = excluded.status,
         error_message = excluded.error_message,
         generated_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       RETURNING
         id,
         portfolio_id AS portfolioId,
         month_key AS monthKey,
         snapshot_date AS snapshotDate,
         file_name AS fileName,
         file_path AS filePath,
         status,
         generated_at AS generatedAt,
         error_message AS errorMessage,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    setUserRoleByEmail: db.prepare(
      `UPDATE users
       SET role = @role,
           updated_at = CURRENT_TIMESTAMP
       WHERE email = @email
       RETURNING id, email, role, member_type AS memberType`
    ),
    setUserMemberTypeById: db.prepare(
      `UPDATE users
       SET member_type = @memberType,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @userId
       RETURNING id, email, role, member_type AS memberType`
    ),
    updateUserPasswordHash: db.prepare(
      `UPDATE users
       SET password_hash = @passwordHash,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @userId
       RETURNING id, email, role, member_type AS memberType`
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
          users.member_type AS memberType,
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
       RETURNING id, email, role, member_type AS memberType`
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
    createUser({ email, passwordHash, role = 'user', memberType = 'dancer' }) {
      return statements.createUser.get({ email, passwordHash, role, memberType });
    },
    findUserByEmail(email) {
      return statements.findUserByEmail.get(email) ?? null;
    },
    findUserById(id) {
      return statements.findUserById.get(id) ?? null;
    },
    createInvestmentPortfolio({
      userId,
      displayName = null,
      baseCurrency = 'USD',
      notes = null,
    }) {
      return statements.createInvestmentPortfolio.get({
        userId,
        displayName,
        baseCurrency,
        notes,
      });
    },
    findInvestmentPortfolioByUserId(userId) {
      return statements.findInvestmentPortfolioByUserId.get(userId) ?? null;
    },
    listInvestmentPortfoliosForInvestors() {
      return statements.listInvestmentPortfoliosForInvestors.all();
    },
    createInvestmentTransaction({
      portfolioId,
      assetSymbol,
      assetName,
      transactionType = 'buy',
      amountInvested,
      purchasePrice,
      purchaseShares,
      purchaseDate,
      notes = null,
    }) {
      return statements.createInvestmentTransaction.get({
        portfolioId,
        assetSymbol,
        assetName,
        transactionType,
        amountInvested,
        purchasePrice,
        purchaseShares,
        purchaseDate,
        notes,
      });
    },
    findInvestmentTransactionById(transactionId) {
      return statements.findInvestmentTransactionById.get(transactionId) ?? null;
    },
    updateInvestmentTransaction({
      id,
      assetSymbol,
      assetName,
      transactionType = 'buy',
      amountInvested,
      purchasePrice,
      purchaseShares,
      purchaseDate,
      notes = null,
    }) {
      return statements.updateInvestmentTransaction.get({
        id,
        assetSymbol,
        assetName,
        transactionType,
        amountInvested,
        purchasePrice,
        purchaseShares,
        purchaseDate,
        notes,
      }) ?? null;
    },
    deleteInvestmentTransactionById(transactionId) {
      return statements.deleteInvestmentTransactionById.get(transactionId) ?? null;
    },
    listInvestmentTransactionsByPortfolioId(portfolioId) {
      return statements.listInvestmentTransactionsByPortfolioId.all(portfolioId);
    },
    listInvestmentMonthlyHistoryByPortfolioId(portfolioId) {
      return statements.listInvestmentMonthlyHistoryByPortfolioId.all(portfolioId);
    },
    upsertInvestmentMonthlyHistory(input) {
      return statements.upsertInvestmentMonthlyHistory.get(input);
    },
    listInvestmentMonthlyReportsByPortfolioId(portfolioId) {
      return statements.listInvestmentMonthlyReportsByPortfolioId.all(portfolioId);
    },
    findInvestmentMonthlyReportByPortfolioIdAndMonth(portfolioId, monthKey) {
      return statements.findInvestmentMonthlyReportByPortfolioIdAndMonth.get(portfolioId, monthKey) ?? null;
    },
    upsertInvestmentMonthlyReport(input) {
      return statements.upsertInvestmentMonthlyReport.get(input);
    },
    setUserRoleByEmail(email, role) {
      return statements.setUserRoleByEmail.get({ email, role }) ?? null;
    },
    setUserMemberTypeById(userId, memberType) {
      return statements.setUserMemberTypeById.get({ userId, memberType }) ?? null;
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
