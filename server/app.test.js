// @vitest-environment node
import fs from 'fs';
import os from 'os';
import path from 'path';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { createDatabase } from './db.js';

function createTestConfig() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crystal-auth-test-'));

  return {
    uploadTempDirectory: path.join(root, 'tmp'),
    processedVideosDirectory: path.join(root, 'videos'),
    publicVideosBasePath: '/uploads/videos',
    frontendDistDirectory: path.join(root, 'dist'),
    trustProxy: false,
    maxVideoDurationSeconds: 300,
    targetVideoSizeBytes: 19 * 1024 * 1024,
    maxAllowedVideoSizeBytes: 20 * 1024 * 1024,
    uploadFileSizeLimitBytes: 512 * 1024 * 1024,
  };
}

describe('auth and video backend foundation', () => {
  let app;
  let db;
  let config;

  beforeEach(() => {
    db = createDatabase(':memory:');
    config = createTestConfig();
    fs.mkdirSync(config.uploadTempDirectory, { recursive: true });
    fs.mkdirSync(config.processedVideosDirectory, { recursive: true });
    fs.mkdirSync(config.frontendDistDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(config.frontendDistDirectory, 'index.html'),
      '<!doctype html><html><body><div id="app">Crystal App</div></body></html>'
    );
    fs.mkdirSync(path.join(config.frontendDistDirectory, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(config.frontendDistDirectory, 'assets', 'marker.txt'), 'asset-ok');
    app = createApp({ db, sessionSecret: 'test-session-secret', config });
  });

  it('registers a user, restores the session, and logs out', async () => {
    const agent = request.agent(app);

    const registerResponse = await agent.post('/api/auth/register').send({
      email: 'crystal@example.com',
      password: 'password123',
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user).toEqual({
      id: 1,
      email: 'crystal@example.com',
    });

    const meResponse = await agent.get('/api/auth/me');

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toEqual({
      user: {
        id: 1,
        email: 'crystal@example.com',
      },
    });

    const logoutResponse = await agent.post('/api/auth/logout');
    expect(logoutResponse.status).toBe(204);

    const postLogoutMe = await agent.get('/api/auth/me');
    expect(postLogoutMe.status).toBe(401);
  });

  it('rejects duplicate registration and invalid login attempts', async () => {
    const agent = request.agent(app);

    await agent.post('/api/auth/register').send({
      email: 'crystal@example.com',
      password: 'password123',
    });

    const duplicateResponse = await agent.post('/api/auth/register').send({
      email: 'crystal@example.com',
      password: 'password123',
    });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.error).toMatch(/already exists/i);

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'crystal@example.com',
      password: 'wrong-password',
    });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.error).toMatch(/invalid email or password/i);
  });

  it('protects video routes and stores youtube links for authenticated users', async () => {
    const agent = request.agent(app);
    const unauthorizedList = await request(app).get('/api/videos');
    expect(unauthorizedList.status).toBe(401);

    await agent.post('/api/auth/register').send({
      email: 'crystal@example.com',
      password: 'password123',
    });

    const createResponse = await agent.post('/api/videos/youtube').send({
      title: 'Prix feature interview clip',
      youtubeUrl: 'https://www.youtube.com/watch?v=abcd1234xyz',
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.video).toMatchObject({
      title: 'Prix feature interview clip',
      sourceType: 'youtube',
      sourceUrl: 'https://www.youtube.com/watch?v=abcd1234xyz',
      status: 'ready',
    });

    const listResponse = await agent.get('/api/videos');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.videos).toHaveLength(1);
    expect(listResponse.body.videos[0]).toMatchObject({
      title: 'Prix feature interview clip',
      sourceType: 'youtube',
    });
  });

  it('bootstraps users and videos tables', () => {
    const tables = db.raw
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('users', 'videos') ORDER BY name")
      .all();

    expect(tables).toEqual([
      { name: 'users' },
      { name: 'videos' },
    ]);
  });

  it('serves static frontend assets and SPA routes from the configured dist directory', async () => {
    const assetResponse = await request(app).get('/assets/marker.txt');
    expect(assetResponse.status).toBe(200);
    expect(assetResponse.text).toBe('asset-ok');

    const loginRouteResponse = await request(app).get('/login');
    expect(loginRouteResponse.status).toBe(200);
    expect(loginRouteResponse.text).toContain('Crystal App');

    const loginHeadResponse = await request(app).head('/login');
    expect(loginHeadResponse.status).toBe(200);
  });
});
