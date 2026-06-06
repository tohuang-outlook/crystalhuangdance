// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { getServerConfig } from './config.js';

const originalEnv = {
  DATA_DIRECTORY: process.env.DATA_DIRECTORY,
  SQLITE_DB_PATH: process.env.SQLITE_DB_PATH,
  UPLOADS_DIRECTORY: process.env.UPLOADS_DIRECTORY,
  FRONTEND_DIST_DIRECTORY: process.env.FRONTEND_DIST_DIRECTORY,
  PASSWORD_RESET_TOKEN_TTL_MINUTES: process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES,
  PUBLIC_APP_ORIGIN: process.env.PUBLIC_APP_ORIGIN,
  RESET_PASSWORD_URL_BASE: process.env.RESET_PASSWORD_URL_BASE,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESET_EMAIL_FROM: process.env.RESET_EMAIL_FROM,
  TRUST_PROXY: process.env.TRUST_PROXY,
  NODE_ENV: process.env.NODE_ENV,
};

afterEach(() => {
  process.env.DATA_DIRECTORY = originalEnv.DATA_DIRECTORY;
  process.env.SQLITE_DB_PATH = originalEnv.SQLITE_DB_PATH;
  process.env.UPLOADS_DIRECTORY = originalEnv.UPLOADS_DIRECTORY;
  process.env.FRONTEND_DIST_DIRECTORY = originalEnv.FRONTEND_DIST_DIRECTORY;
  process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES = originalEnv.PASSWORD_RESET_TOKEN_TTL_MINUTES;
  process.env.PUBLIC_APP_ORIGIN = originalEnv.PUBLIC_APP_ORIGIN;
  process.env.RESET_PASSWORD_URL_BASE = originalEnv.RESET_PASSWORD_URL_BASE;
  process.env.RESEND_API_KEY = originalEnv.RESEND_API_KEY;
  process.env.RESET_EMAIL_FROM = originalEnv.RESET_EMAIL_FROM;
  process.env.TRUST_PROXY = originalEnv.TRUST_PROXY;
  process.env.NODE_ENV = originalEnv.NODE_ENV;
});

describe('getServerConfig', () => {
  it('derives Railway-friendly storage paths from SQLITE_DB_PATH when no explicit directories are provided', () => {
    process.env.SQLITE_DB_PATH = '/data/crystalhuangdance.sqlite';
    delete process.env.DATA_DIRECTORY;
    delete process.env.UPLOADS_DIRECTORY;
    delete process.env.FRONTEND_DIST_DIRECTORY;
    delete process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES;
    delete process.env.PUBLIC_APP_ORIGIN;
    delete process.env.RESET_PASSWORD_URL_BASE;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESET_EMAIL_FROM;
    process.env.NODE_ENV = 'production';

    const config = getServerConfig();

    expect(config.dbFile).toBe('/data/crystalhuangdance.sqlite');
    expect(config.dataDirectory).toBe('/data');
    expect(config.uploadTempDirectory).toBe('/data/uploads/tmp');
    expect(config.processedVideosDirectory).toBe('/data/uploads/videos');
    expect(config.frontendDistDirectory).toMatch(/\/dist$/);
    expect(config.passwordResetTokenTtlMinutes).toBe(15);
    expect(config.resetPasswordUrlBase).toBe('http://localhost:5173/reset-password');
    expect(config.resendApiKey).toBeNull();
    expect(config.emailFromAddress).toBe('noreply@crystalhuangdance.org');
    expect(config.trustProxy).toBe(true);
  });

  it('respects explicit deployment directory overrides', () => {
    process.env.DATA_DIRECTORY = '/srv/data';
    process.env.SQLITE_DB_PATH = '/srv/db/site.sqlite';
    process.env.UPLOADS_DIRECTORY = '/srv/custom-uploads';
    process.env.FRONTEND_DIST_DIRECTORY = '/srv/frontend-dist';
    process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES = '10';
    process.env.PUBLIC_APP_ORIGIN = 'https://www.crystalhuangdance.org';
    process.env.RESET_PASSWORD_URL_BASE = 'https://www.crystalhuangdance.org/reset-password';
    process.env.RESEND_API_KEY = 're_test_123';
    process.env.RESET_EMAIL_FROM = 'noreply@crystalhuangdance.org';
    process.env.TRUST_PROXY = 'false';
    process.env.NODE_ENV = 'development';

    const config = getServerConfig();

    expect(config.dataDirectory).toBe('/srv/data');
    expect(config.dbFile).toBe('/srv/db/site.sqlite');
    expect(config.uploadTempDirectory).toBe('/srv/custom-uploads/tmp');
    expect(config.processedVideosDirectory).toBe('/srv/custom-uploads/videos');
    expect(config.frontendDistDirectory).toBe('/srv/frontend-dist');
    expect(config.passwordResetTokenTtlMinutes).toBe(10);
    expect(config.resetPasswordUrlBase).toBe('https://www.crystalhuangdance.org/reset-password');
    expect(config.resendApiKey).toBe('re_test_123');
    expect(config.emailFromAddress).toBe('noreply@crystalhuangdance.org');
    expect(config.trustProxy).toBe(false);
  });

  it('prefers an explicit reset password URL base when provided', () => {
    process.env.RESET_PASSWORD_URL_BASE = 'https://accounts.crystalhuangdance.org/reset';

    const config = getServerConfig();

    expect(config.resetPasswordUrlBase).toBe('https://accounts.crystalhuangdance.org/reset');
  });
});
