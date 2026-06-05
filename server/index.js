import fs from 'fs';
import { createApp } from './app.js';
import { getServerConfig } from './config.js';
import { createDatabase } from './db.js';

const config = getServerConfig();
fs.mkdirSync(config.uploadTempDirectory, { recursive: true });
fs.mkdirSync(config.processedVideosDirectory, { recursive: true });

const db = createDatabase(config.dbFile);
const app = createApp({
  db,
  sessionSecret: config.sessionSecret,
  config,
});

const server = app.listen(config.port, () => {
  console.log(`Crystal auth server listening on http://127.0.0.1:${config.port}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
});
