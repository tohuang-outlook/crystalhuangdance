import path from 'path';

export function getServerConfig() {
  const port = Number.parseInt(process.env.PORT ?? '3001', 10);
  const passwordResetTokenTtlMinutes = Number.parseInt(
    process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? '15',
    10
  );
  const explicitDbFile = process.env.SQLITE_DB_PATH
    ? path.resolve(process.env.SQLITE_DB_PATH)
    : null;
  const dataDirectory = process.env.DATA_DIRECTORY
    ? path.resolve(process.env.DATA_DIRECTORY)
    : explicitDbFile
      ? path.dirname(explicitDbFile)
      : path.resolve(process.cwd(), 'server/data');
  const uploadsDirectory = process.env.UPLOADS_DIRECTORY
    ? path.resolve(process.env.UPLOADS_DIRECTORY)
    : path.join(dataDirectory, 'uploads');
  const resetPasswordUrlBase =
    process.env.RESET_PASSWORD_URL_BASE ??
    `${process.env.PUBLIC_APP_ORIGIN ?? 'http://localhost:5173'}/reset-password`;

  return {
    port: Number.isNaN(port) ? 3001 : port,
    sessionSecret: process.env.SESSION_SECRET ?? 'dev-session-secret-change-me',
    dbFile: explicitDbFile ?? path.join(dataDirectory, 'crystalhuangdance.sqlite'),
    dataDirectory,
    uploadTempDirectory: path.join(uploadsDirectory, 'tmp'),
    processedVideosDirectory: path.join(uploadsDirectory, 'videos'),
    publicVideosBasePath: '/uploads/videos',
    frontendDistDirectory: process.env.FRONTEND_DIST_DIRECTORY
      ? path.resolve(process.env.FRONTEND_DIST_DIRECTORY)
      : path.resolve(process.cwd(), 'dist'),
    trustProxy: process.env.TRUST_PROXY === 'true' || process.env.NODE_ENV === 'production',
    maxVideoDurationSeconds: 300,
    targetVideoSizeBytes: 19 * 1024 * 1024,
    maxAllowedVideoSizeBytes: 20 * 1024 * 1024,
    uploadFileSizeLimitBytes: 512 * 1024 * 1024,
    passwordResetTokenTtlMinutes:
      Number.isNaN(passwordResetTokenTtlMinutes) || passwordResetTokenTtlMinutes <= 0
        ? 15
        : passwordResetTokenTtlMinutes,
    resetPasswordUrlBase,
    resendApiKey: process.env.RESEND_API_KEY ?? null,
    emailFromAddress: process.env.RESET_EMAIL_FROM ?? 'noreply@crystalhuangdance.org',
  };
}
