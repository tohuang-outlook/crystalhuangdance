import path from 'path';

export function getServerConfig() {
  const port = Number.parseInt(process.env.PORT ?? '3001', 10);
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
  };
}
