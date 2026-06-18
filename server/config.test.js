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
  REQUIRE_INVITE_CODE: process.env.REQUIRE_INVITE_CODE,
  INVITE_CODES: process.env.INVITE_CODES,
};

function restoreEnvValue(key, value) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

afterEach(() => {
  restoreEnvValue('DATA_DIRECTORY', originalEnv.DATA_DIRECTORY);
  restoreEnvValue('SQLITE_DB_PATH', originalEnv.SQLITE_DB_PATH);
  restoreEnvValue('UPLOADS_DIRECTORY', originalEnv.UPLOADS_DIRECTORY);
  restoreEnvValue('FRONTEND_DIST_DIRECTORY', originalEnv.FRONTEND_DIST_DIRECTORY);
  restoreEnvValue(
    'PASSWORD_RESET_TOKEN_TTL_MINUTES',
    originalEnv.PASSWORD_RESET_TOKEN_TTL_MINUTES
  );
  restoreEnvValue('PUBLIC_APP_ORIGIN', originalEnv.PUBLIC_APP_ORIGIN);
  restoreEnvValue('RESET_PASSWORD_URL_BASE', originalEnv.RESET_PASSWORD_URL_BASE);
  restoreEnvValue('RESEND_API_KEY', originalEnv.RESEND_API_KEY);
  restoreEnvValue('RESET_EMAIL_FROM', originalEnv.RESET_EMAIL_FROM);
  restoreEnvValue('TRUST_PROXY', originalEnv.TRUST_PROXY);
  restoreEnvValue('NODE_ENV', originalEnv.NODE_ENV);
  restoreEnvValue('REQUIRE_INVITE_CODE', originalEnv.REQUIRE_INVITE_CODE);
  restoreEnvValue('INVITE_CODES', originalEnv.INVITE_CODES);
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

  it('defaults invite code enforcement off with no configured codes', () => {
    delete process.env.REQUIRE_INVITE_CODE;
    delete process.env.INVITE_CODES;

    const config = getServerConfig();

    expect(config.requireInviteCode).toBe(false);
    expect(config.inviteCodes).toEqual([]);
  });

  it('parses invite code env settings and discards invalid entries', () => {
    process.env.REQUIRE_INVITE_CODE = 'true';
    process.env.INVITE_CODES = '123456, 654321, abcdef, 12345, , 999999 ';

    const config = getServerConfig();

    expect(config.requireInviteCode).toBe(true);
    expect(config.inviteCodes).toEqual(['123456', '654321', '999999']);
  });

  it('treats only the exact string true as enabled for invite code enforcement', () => {
    process.env.REQUIRE_INVITE_CODE = 'false';
    process.env.INVITE_CODES = '123456';

    const config = getServerConfig();

    expect(config.requireInviteCode).toBe(false);
    expect(config.inviteCodes).toEqual(['123456']);
  });

  it('rejects invite code enforcement without at least one valid configured code', () => {
    process.env.REQUIRE_INVITE_CODE = 'true';
    process.env.INVITE_CODES = 'abcdef, 12345, ';

    expect(() => getServerConfig()).toThrow(
      'INVITE_CODES must include at least one valid six-digit code when REQUIRE_INVITE_CODE=true.'
    );
  });

  it('restores missing invite env vars without stringifying undefined', () => {
    restoreEnvValue('REQUIRE_INVITE_CODE', undefined);
    restoreEnvValue('INVITE_CODES', undefined);

    expect(process.env.REQUIRE_INVITE_CODE).toBeUndefined();
    expect(process.env.INVITE_CODES).toBeUndefined();
  });
});
