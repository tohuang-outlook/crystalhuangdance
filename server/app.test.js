// @vitest-environment node
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createHash } from 'crypto';
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
    passwordResetTokenTtlMinutes: 15,
    resetPasswordUrlBase: 'https://www.crystalhuangdance.org/reset-password',
    emailFromAddress: 'noreply@crystalhuangdance.org',
    resendApiKey: 'test-resend-api-key',
    maxVideoDurationSeconds: 300,
    targetVideoSizeBytes: 19 * 1024 * 1024,
    maxAllowedVideoSizeBytes: 20 * 1024 * 1024,
    uploadFileSizeLimitBytes: 512 * 1024 * 1024,
  };
}

async function registerUser(agent, email) {
  const response = await agent.post('/api/auth/register').send({
    email,
    password: 'password123',
  });

  expect(response.status).toBe(201);
  return response.body.user;
}

async function loginUser(agent, email) {
  const response = await agent.post('/api/auth/login').send({
    email,
    password: 'password123',
  });

  expect(response.status).toBe(200);
  return response.body.user;
}

function promoteUserToAdmin(db, email) {
  db.setUserRoleByEmail(email, 'admin');
}

function writeProcessedVideoFile(config, filename, contents = 'video-bytes') {
  const filePath = path.join(config.processedVideosDirectory, filename);
  fs.writeFileSync(filePath, contents);
  return `${config.publicVideosBasePath}/${filename}`;
}

function createUploadFixture(config, filename = 'fixture.mp4') {
  const filePath = path.join(config.uploadTempDirectory, filename);
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-f',
      'lavfi',
      '-i',
      'color=c=black:s=320x240:d=1',
      '-f',
      'lavfi',
      '-i',
      'anullsrc=r=44100:cl=stereo',
      '-shortest',
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '64k',
      filePath,
    ],
    { stdio: 'ignore' }
  );

  return filePath;
}

describe('auth and video backend foundation', () => {
  let app;
  let db;
  let config;
  let sentResetEmails;
  let currentTime;

  beforeEach(() => {
    db = createDatabase(':memory:');
    config = createTestConfig();
    sentResetEmails = [];
    currentTime = new Date('2026-06-06T19:00:00.000Z');
    fs.mkdirSync(config.uploadTempDirectory, { recursive: true });
    fs.mkdirSync(config.processedVideosDirectory, { recursive: true });
    fs.mkdirSync(config.frontendDistDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(config.frontendDistDirectory, 'index.html'),
      '<!doctype html><html><body><div id="app">Crystal App</div></body></html>'
    );
    fs.mkdirSync(path.join(config.frontendDistDirectory, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(config.frontendDistDirectory, 'assets', 'marker.txt'), 'asset-ok');
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
    });
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
      role: 'user',
    });

    const meResponse = await agent.get('/api/auth/me');

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toEqual({
      user: {
        id: 1,
        email: 'crystal@example.com',
        role: 'user',
      },
    });

    const sessionResponse = await agent.get('/api/auth/session');
    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body).toEqual({
      authenticated: true,
      user: {
        id: 1,
        email: 'crystal@example.com',
        role: 'user',
      },
    });

    expect(db.findUserByEmail('crystal@example.com')).toMatchObject({
      id: 1,
      email: 'crystal@example.com',
      role: 'user',
    });

    const logoutResponse = await agent.post('/api/auth/logout');
    expect(logoutResponse.status).toBe(204);

    const postLogoutMe = await agent.get('/api/auth/me');
    expect(postLogoutMe.status).toBe(401);

    const loginResponse = await agent.post('/api/auth/login').send({
      email: 'crystal@example.com',
      password: 'password123',
    });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toEqual({
      user: {
        id: 1,
        email: 'crystal@example.com',
        role: 'user',
      },
    });
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
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('password_reset_tokens', 'users', 'videos') ORDER BY name"
      )
      .all();

    expect(tables).toEqual([
      { name: 'password_reset_tokens' },
      { name: 'users' },
      { name: 'videos' },
    ]);
  });

  it('returns a generic response for password reset requests while emailing known users', async () => {
    const agent = request.agent(app);
    await registerUser(agent, 'crystal@example.com');

    const existingResponse = await request(app).post('/api/auth/forgot-password').send({
      email: 'crystal@example.com',
    });

    expect(existingResponse.status).toBe(200);
    expect(existingResponse.body).toEqual({
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
    expect(sentResetEmails).toHaveLength(1);

    const sentUrl = new URL(sentResetEmails[0].resetUrl);
    const token = sentUrl.searchParams.get('token');
    expect(token).toBeTruthy();

    const storedToken = db.findPasswordResetTokenByHash(
      createHash('sha256').update(token).digest('hex')
    );
    expect(storedToken).toMatchObject({
      userId: 1,
      usedAt: null,
    });
    expect(new Date(storedToken.expiresAt).getTime()).toBe(
      currentTime.getTime() + config.passwordResetTokenTtlMinutes * 60 * 1000
    );

    const unknownResponse = await request(app).post('/api/auth/forgot-password').send({
      email: 'unknown@example.com',
    });

    expect(unknownResponse.status).toBe(200);
    expect(unknownResponse.body).toEqual(existingResponse.body);
    expect(sentResetEmails).toHaveLength(1);
  });

  it('resets a password with a valid token', async () => {
    const agent = request.agent(app);
    await registerUser(agent, 'crystal@example.com');

    await request(app).post('/api/auth/forgot-password').send({
      email: 'crystal@example.com',
    });

    const token = new URL(sentResetEmails[0].resetUrl).searchParams.get('token');

    const resetResponse = await request(app).post('/api/auth/reset-password').send({
      token,
      password: 'newpassword123',
    });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body).toEqual({
      message: 'Your password has been reset successfully.',
    });

    const oldPasswordLogin = await request(app).post('/api/auth/login').send({
      email: 'crystal@example.com',
      password: 'password123',
    });
    expect(oldPasswordLogin.status).toBe(401);

    const newPasswordLogin = await request(app).post('/api/auth/login').send({
      email: 'crystal@example.com',
      password: 'newpassword123',
    });
    expect(newPasswordLogin.status).toBe(200);

    const storedToken = db.findPasswordResetTokenByHash(
      createHash('sha256').update(token).digest('hex')
    );
    expect(storedToken).toBeNull();
  });

  it('rejects expired password reset tokens', async () => {
    const agent = request.agent(app);
    await registerUser(agent, 'crystal@example.com');

    await request(app).post('/api/auth/forgot-password').send({
      email: 'crystal@example.com',
    });

    const token = new URL(sentResetEmails[0].resetUrl).searchParams.get('token');
    currentTime = new Date(currentTime.getTime() + 16 * 60 * 1000);

    const resetResponse = await request(app).post('/api/auth/reset-password').send({
      token,
      password: 'newpassword123',
    });

    expect(resetResponse.status).toBe(410);
    expect(resetResponse.body).toEqual({
      error: 'This password reset link has expired.',
    });
  });

  it('rejects admin routes for non-admin users', async () => {
    const userAgent = request.agent(app);
    await registerUser(userAgent, 'member@example.com');

    const usersResponse = await userAgent.get('/api/admin/users');
    expect(usersResponse.status).toBe(403);
    expect(usersResponse.body.error).toMatch(/admin/i);

    const videosResponse = await userAgent.get('/api/admin/videos');
    expect(videosResponse.status).toBe(403);
    expect(videosResponse.body.error).toMatch(/admin/i);
  });

  it('lists all users with upload counts and all videos with uploader info for admins', async () => {
    const adminAgent = request.agent(app);
    const adminUser = await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const memberAgent = request.agent(app);
    const memberUser = await registerUser(memberAgent, 'member@example.com');

    db.createVideo({
      userId: adminUser.id,
      title: 'Admin upload',
      sourceType: 'youtube',
      sourceUrl: 'https://youtu.be/adminclip1',
      filePath: null,
      originalFilename: null,
      durationSeconds: null,
      fileSizeBytes: null,
      status: 'ready',
    });
    db.createVideo({
      userId: memberUser.id,
      title: 'Member upload',
      sourceType: 'youtube',
      sourceUrl: 'https://youtu.be/memberclip1',
      filePath: null,
      originalFilename: null,
      durationSeconds: null,
      fileSizeBytes: null,
      status: 'ready',
    });

    const usersResponse = await adminAgent.get('/api/admin/users');
    expect(usersResponse.status).toBe(200);
    expect(usersResponse.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: adminUser.id,
          email: 'admin@example.com',
          role: 'admin',
          uploadCount: 1,
        }),
        expect.objectContaining({
          id: memberUser.id,
          email: 'member@example.com',
          role: 'user',
          uploadCount: 1,
        }),
      ])
    );

    const videosResponse = await adminAgent.get('/api/admin/videos');
    expect(videosResponse.status).toBe(200);
    expect(videosResponse.body.videos).toEqual([
      expect.objectContaining({
        title: 'Member upload',
        uploader: {
          id: memberUser.id,
          email: 'member@example.com',
          role: 'user',
        },
      }),
      expect.objectContaining({
        title: 'Admin upload',
        uploader: {
          id: adminUser.id,
          email: 'admin@example.com',
          role: 'admin',
        },
      }),
    ]);
  });

  it('deletes a single video and removes its processed file for admins', async () => {
    const adminAgent = request.agent(app);
    const adminUser = await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const storedFilePath = writeProcessedVideoFile(config, 'single-delete.mp4');
    const video = db.createVideo({
      userId: adminUser.id,
      title: 'Delete me',
      sourceType: 'upload',
      sourceUrl: null,
      filePath: storedFilePath,
      originalFilename: 'single-delete.mov',
      durationSeconds: 30,
      fileSizeBytes: 1024,
      status: 'ready',
    });

    const deleteResponse = await adminAgent.delete(`/api/admin/videos/${video.id}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ deletedVideoId: video.id });
    expect(db.listVideosByUser(adminUser.id)).toEqual([]);
    expect(fs.existsSync(path.join(config.processedVideosDirectory, 'single-delete.mp4'))).toBe(false);
  });

  it('deletes a user, cascades their videos, and removes uploaded files for admins', async () => {
    const adminAgent = request.agent(app);
    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const memberAgent = request.agent(app);
    const memberUser = await registerUser(memberAgent, 'member@example.com');

    const firstFilePath = writeProcessedVideoFile(config, 'cascade-one.mp4', 'one');
    const secondFilePath = writeProcessedVideoFile(config, 'cascade-two.mp4', 'two');

    db.createVideo({
      userId: memberUser.id,
      title: 'Cascade upload one',
      sourceType: 'upload',
      sourceUrl: null,
      filePath: firstFilePath,
      originalFilename: 'cascade-one.mov',
      durationSeconds: 20,
      fileSizeBytes: 512,
      status: 'ready',
    });
    db.createVideo({
      userId: memberUser.id,
      title: 'Cascade upload two',
      sourceType: 'upload',
      sourceUrl: null,
      filePath: secondFilePath,
      originalFilename: 'cascade-two.mov',
      durationSeconds: 25,
      fileSizeBytes: 1024,
      status: 'ready',
    });

    const deleteResponse = await adminAgent.delete(`/api/admin/users/${memberUser.id}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      deletedUserId: memberUser.id,
      deletedVideoCount: 2,
    });
    expect(db.findUserById(memberUser.id)).toBeNull();
    expect(db.listVideosByUser(memberUser.id)).toEqual([]);
    expect(fs.existsSync(path.join(config.processedVideosDirectory, 'cascade-one.mp4'))).toBe(false);
    expect(fs.existsSync(path.join(config.processedVideosDirectory, 'cascade-two.mp4'))).toBe(false);
  });

  it('lets admins create a youtube video for a dancer and exposes it in the dancer archive', async () => {
    const adminAgent = request.agent(app);
    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const dancerAgent = request.agent(app);
    const dancerUser = await registerUser(dancerAgent, 'dancer@example.com');

    const createResponse = await adminAgent
      .post(`/api/admin/users/${dancerUser.id}/videos/youtube`)
      .send({
        title: 'Assigned YAGP reel',
        youtubeUrl: 'https://www.youtube.com/watch?v=abcd1234xyz',
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.video).toMatchObject({
      title: 'Assigned YAGP reel',
      uploader: {
        id: dancerUser.id,
        email: 'dancer@example.com',
        role: 'user',
      },
    });

    const dancerVideosResponse = await dancerAgent.get('/api/videos');
    expect(dancerVideosResponse.status).toBe(200);
    expect(dancerVideosResponse.body.videos).toEqual([
      expect.objectContaining({
        title: 'Assigned YAGP reel',
        sourceType: 'youtube',
      }),
    ]);
  });

  it('lets admins upload a file for a dancer and exposes it in the dancer archive', async () => {
    const adminAgent = request.agent(app);
    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const dancerAgent = request.agent(app);
    const dancerUser = await registerUser(dancerAgent, 'dancer@example.com');
    const uploadFixturePath = createUploadFixture(config, 'assigned-admin-upload.mp4');

    const createResponse = await adminAgent
      .post(`/api/admin/users/${dancerUser.id}/videos/upload`)
      .field('title', 'Assigned studio clip')
      .attach('video', uploadFixturePath);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.video).toMatchObject({
      title: 'Assigned studio clip',
      sourceType: 'upload',
      uploader: {
        id: dancerUser.id,
        email: 'dancer@example.com',
        role: 'user',
      },
    });

    const dancerVideosResponse = await dancerAgent.get('/api/videos');
    expect(dancerVideosResponse.status).toBe(200);
    expect(dancerVideosResponse.body.videos).toEqual([
      expect.objectContaining({
        title: 'Assigned studio clip',
        sourceType: 'upload',
      }),
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
