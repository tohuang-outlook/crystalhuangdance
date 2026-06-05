// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { getServerConfig } from './config.js';

const originalEnv = {
  DATA_DIRECTORY: process.env.DATA_DIRECTORY,
  SQLITE_DB_PATH: process.env.SQLITE_DB_PATH,
  UPLOADS_DIRECTORY: process.env.UPLOADS_DIRECTORY,
  FRONTEND_DIST_DIRECTORY: process.env.FRONTEND_DIST_DIRECTORY,
  TRUST_PROXY: process.env.TRUST_PROXY,
  NODE_ENV: process.env.NODE_ENV,
};

afterEach(() => {
  process.env.DATA_DIRECTORY = originalEnv.DATA_DIRECTORY;
  process.env.SQLITE_DB_PATH = originalEnv.SQLITE_DB_PATH;
  process.env.UPLOADS_DIRECTORY = originalEnv.UPLOADS_DIRECTORY;
  process.env.FRONTEND_DIST_DIRECTORY = originalEnv.FRONTEND_DIST_DIRECTORY;
  process.env.TRUST_PROXY = originalEnv.TRUST_PROXY;
  process.env.NODE_ENV = originalEnv.NODE_ENV;
});

describe('getServerConfig', () => {
  it('derives Railway-friendly storage paths from SQLITE_DB_PATH when no explicit directories are provided', () => {
    process.env.SQLITE_DB_PATH = '/data/crystalhuangdance.sqlite';
    delete process.env.DATA_DIRECTORY;
    delete process.env.UPLOADS_DIRECTORY;
    delete process.env.FRONTEND_DIST_DIRECTORY;
    process.env.NODE_ENV = 'production';

    const config = getServerConfig();

    expect(config.dbFile).toBe('/data/crystalhuangdance.sqlite');
    expect(config.dataDirectory).toBe('/data');
    expect(config.uploadTempDirectory).toBe('/data/uploads/tmp');
    expect(config.processedVideosDirectory).toBe('/data/uploads/videos');
    expect(config.frontendDistDirectory).toMatch(/\/dist$/);
    expect(config.trustProxy).toBe(true);
  });

  it('respects explicit deployment directory overrides', () => {
    process.env.DATA_DIRECTORY = '/srv/data';
    process.env.SQLITE_DB_PATH = '/srv/db/site.sqlite';
    process.env.UPLOADS_DIRECTORY = '/srv/custom-uploads';
    process.env.FRONTEND_DIST_DIRECTORY = '/srv/frontend-dist';
    process.env.TRUST_PROXY = 'false';
    process.env.NODE_ENV = 'development';

    const config = getServerConfig();

    expect(config.dataDirectory).toBe('/srv/data');
    expect(config.dbFile).toBe('/srv/db/site.sqlite');
    expect(config.uploadTempDirectory).toBe('/srv/custom-uploads/tmp');
    expect(config.processedVideosDirectory).toBe('/srv/custom-uploads/videos');
    expect(config.frontendDistDirectory).toBe('/srv/frontend-dist');
    expect(config.trustProxy).toBe(false);
  });
});
