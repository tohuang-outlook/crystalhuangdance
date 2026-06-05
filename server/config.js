import path from 'path';

const dataDirectory = path.resolve(process.cwd(), 'server/data');
const uploadsDirectory = path.join(dataDirectory, 'uploads');

export function getServerConfig() {
  const port = Number.parseInt(process.env.PORT ?? '3001', 10);

  return {
    port: Number.isNaN(port) ? 3001 : port,
    sessionSecret: process.env.SESSION_SECRET ?? 'dev-session-secret-change-me',
    dbFile: process.env.SQLITE_DB_PATH ?? path.join(dataDirectory, 'crystalhuangdance.sqlite'),
    dataDirectory,
    uploadTempDirectory: path.join(uploadsDirectory, 'tmp'),
    processedVideosDirectory: path.join(uploadsDirectory, 'videos'),
    publicVideosBasePath: '/uploads/videos',
    maxVideoDurationSeconds: 300,
    targetVideoSizeBytes: 19 * 1024 * 1024,
    maxAllowedVideoSizeBytes: 20 * 1024 * 1024,
    uploadFileSizeLimitBytes: 512 * 1024 * 1024,
  };
}
