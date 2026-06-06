import fs from 'fs';
import { createApp } from './app.js';
import { getServerConfig } from './config.js';
import { createDatabase } from './db.js';
import { createResendPasswordResetSender } from './resend.js';

const config = getServerConfig();
fs.mkdirSync(config.uploadTempDirectory, { recursive: true });
fs.mkdirSync(config.processedVideosDirectory, { recursive: true });

const db = createDatabase(config.dbFile);
const app = createApp({
  db,
  sessionSecret: config.sessionSecret,
  config,
  sendPasswordResetEmail: createResendPasswordResetSender({
    apiKey: config.resendApiKey,
    fromAddress: config.emailFromAddress,
  }),
});

const server = app.listen(config.port, () => {
  console.log(`Crystal full-stack server listening on port ${config.port}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    db.close();
    process.exit(0);
  });
});
