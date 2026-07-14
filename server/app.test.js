// @vitest-environment node
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createHash } from 'crypto';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';
import { createDatabase } from './db.js';

function createTestConfig() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crystal-auth-test-'));

  return {
    reportStorageDirectory: path.join(root, 'investment-reports'),
    uploadTempDirectory: path.join(root, 'tmp'),
    processedVideosDirectory: path.join(root, 'videos'),
    publicVideosBasePath: '/uploads/videos',
    frontendDistDirectory: path.join(root, 'dist'),
    trustProxy: false,
    passwordResetTokenTtlMinutes: 15,
    resetPasswordUrlBase: 'https://www.crystalhuangdance.org/reset-password',
    emailFromAddress: 'noreply@crystalhuangdance.org',
    resendApiKey: 'test-resend-api-key',
    cronSecret: 'test-cron-secret',
    maxVideoDurationSeconds: 300,
    targetVideoSizeBytes: 19 * 1024 * 1024,
    maxAllowedVideoSizeBytes: 20 * 1024 * 1024,
    uploadFileSizeLimitBytes: 512 * 1024 * 1024,
    requireInviteCode: false,
    inviteCodes: [],
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

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    db = createDatabase(':memory:');
    config = createTestConfig();
    sentResetEmails = [];
    currentTime = new Date('2026-06-06T19:00:00.000Z');
    fs.mkdirSync(config.uploadTempDirectory, { recursive: true });
    fs.mkdirSync(config.reportStorageDirectory, { recursive: true });
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
      memberType: 'dancer',
    });

    const meResponse = await agent.get('/api/auth/me');

    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toEqual({
      user: {
        id: 1,
        email: 'crystal@example.com',
        role: 'user',
        memberType: 'dancer',
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
        memberType: 'dancer',
      },
    });

    expect(db.findUserByEmail('crystal@example.com')).toMatchObject({
      id: 1,
      email: 'crystal@example.com',
      role: 'user',
      memberType: 'dancer',
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
        memberType: 'dancer',
      },
    });
  });

  it('returns the default member type for newly registered users', async () => {
    const agent = request.agent(app);

    const response = await agent.post('/api/auth/register').send({
      email: 'investor-default@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toEqual({
      id: 1,
      email: 'investor-default@example.com',
      role: 'user',
      memberType: 'dancer',
    });

    expect(db.findUserByEmail('investor-default@example.com')).toMatchObject({
      email: 'investor-default@example.com',
      role: 'user',
      memberType: 'dancer',
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

  it('registers without an invite code when enforcement is disabled', async () => {
    config.requireInviteCode = false;
    config.inviteCodes = ['123456'];
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'disabled@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      email: 'disabled@example.com',
      role: 'user',
    });
  });

  it('requires a valid six-digit invite code when enforcement is enabled', async () => {
    config.requireInviteCode = true;
    config.inviteCodes = ['123456'];
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'missing-code@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'A valid six-digit invite code is required.',
    });
  });

  it('rejects invite codes that are not six digits when enforcement is enabled', async () => {
    config.requireInviteCode = true;
    config.inviteCodes = ['123456'];
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'bad-format@example.com',
      password: 'password123',
      inviteCode: '12ab56',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'A valid six-digit invite code is required.',
    });
  });

  it('rejects unknown invite codes when enforcement is enabled', async () => {
    config.requireInviteCode = true;
    config.inviteCodes = ['123456'];
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'wrong-code@example.com',
      password: 'password123',
      inviteCode: '654321',
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: 'Invite code is invalid.',
    });
  });

  it('registers with a known invite code when enforcement is enabled', async () => {
    config.requireInviteCode = true;
    config.inviteCodes = ['123456'];
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'accepted-code@example.com',
      password: 'password123',
      inviteCode: '123456',
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      email: 'accepted-code@example.com',
      role: 'user',
    });
  });

  it('fails fast when invite code enforcement is enabled without usable invite codes', () => {
    config.requireInviteCode = true;
    config.inviteCodes = [];

    expect(() =>
      createApp({
        db,
        sessionSecret: 'test-session-secret',
        config,
        now: () => currentTime,
        sendPasswordResetEmail: async (payload) => {
          sentResetEmails.push(payload);
        },
      })
    ).toThrow(
      'Invite code enforcement requires at least one configured six-digit invite code.'
    );
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
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('coming_up_events', 'password_reset_tokens', 'users', 'videos') ORDER BY name"
      )
      .all();

    expect(tables).toEqual([
      { name: 'coming_up_events' },
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

  it('returns seeded coming up events in public sort order', async () => {
    const response = await request(app).get('/api/coming-up-events');

    expect(response.status).toBe(200);
    expect(response.body.events).toEqual([
      expect.objectContaining({
        dateLabel: 'July 2026',
        title: 'Press Play Pro Assistant',
        location: 'Las Vegas',
        sortOrder: 0,
      }),
      expect.objectContaining({
        dateLabel: 'July 2026',
        title: 'YAGP Gala',
        location: 'Beijing',
        sortOrder: 1,
      }),
      expect.objectContaining({
        dateLabel: 'July-August 2026',
        title: 'AEDC Performance and Master Class',
        location: 'Shanghai / Taipei / Hong Kong',
        sortOrder: 2,
      }),
    ]);
  });

  it('protects admin coming up event routes for non-admin users', async () => {
    const userAgent = request.agent(app);
    await registerUser(userAgent, 'member@example.com');

    const listResponse = await userAgent.get('/api/admin/coming-up-events');
    expect(listResponse.status).toBe(403);
    expect(listResponse.body.error).toMatch(/admin/i);

    const createResponse = await userAgent.post('/api/admin/coming-up-events').send({
      dateLabel: 'August 2026',
      title: 'Summer Intensive',
      location: 'New York',
    });
    expect(createResponse.status).toBe(403);
    expect(createResponse.body.error).toMatch(/admin/i);

    const updateResponse = await userAgent.put('/api/admin/coming-up-events/1').send({
      dateLabel: 'August 2026',
      title: 'Updated Title',
      location: 'Paris',
    });
    expect(updateResponse.status).toBe(403);
    expect(updateResponse.body.error).toMatch(/admin/i);

    const deleteResponse = await userAgent.delete('/api/admin/coming-up-events/1');
    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body.error).toMatch(/admin/i);

    const reorderResponse = await userAgent.post('/api/admin/coming-up-events/reorder').send({
      orderedIds: [1, 2, 3],
    });
    expect(reorderResponse.status).toBe(403);
    expect(reorderResponse.body.error).toMatch(/admin/i);
  });

  it('lets admins create a coming up event at the end of the list', async () => {
    const adminAgent = request.agent(app);
    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const response = await adminAgent.post('/api/admin/coming-up-events').send({
      dateLabel: 'August 2026',
      title: 'Summer Intensive',
      location: 'New York',
    });

    expect(response.status).toBe(201);
    expect(response.body.event).toMatchObject({
      dateLabel: 'August 2026',
      title: 'Summer Intensive',
      location: 'New York',
      sortOrder: 3,
    });
    expect(db.listComingUpEvents()).toEqual([
      expect.objectContaining({ sortOrder: 0 }),
      expect.objectContaining({ sortOrder: 1 }),
      expect.objectContaining({ sortOrder: 2 }),
      expect.objectContaining({
        dateLabel: 'August 2026',
        title: 'Summer Intensive',
        location: 'New York',
        sortOrder: 3,
      }),
    ]);
  });

  it('lets admins update a coming up event', async () => {
    const adminAgent = request.agent(app);
    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const existingEvent = db.listComingUpEvents()[1];

    const response = await adminAgent.put(`/api/admin/coming-up-events/${existingEvent.id}`).send({
      dateLabel: 'September 2026',
      title: 'Updated Gala',
      location: 'Tokyo',
    });

    expect(response.status).toBe(200);
    expect(response.body.event).toMatchObject({
      id: existingEvent.id,
      dateLabel: 'September 2026',
      title: 'Updated Gala',
      location: 'Tokyo',
      sortOrder: existingEvent.sortOrder,
    });
    expect(db.findComingUpEventById(existingEvent.id)).toMatchObject({
      id: existingEvent.id,
      dateLabel: 'September 2026',
      title: 'Updated Gala',
      location: 'Tokyo',
      sortOrder: existingEvent.sortOrder,
    });
  });

  it('lets admins delete a coming up event and normalizes remaining sort order', async () => {
    const adminAgent = request.agent(app);
    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const existingEvents = db.listComingUpEvents();
    const deletedEvent = existingEvents[1];

    const response = await adminAgent.delete(`/api/admin/coming-up-events/${deletedEvent.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ deletedEventId: deletedEvent.id });
    expect(db.findComingUpEventById(deletedEvent.id)).toBeNull();
    expect(db.listComingUpEvents()).toEqual([
      expect.objectContaining({
        id: existingEvents[0].id,
        sortOrder: 0,
      }),
      expect.objectContaining({
        id: existingEvents[2].id,
        sortOrder: 1,
      }),
    ]);
  });

  it('lets admins reorder coming up events when the ids match exactly', async () => {
    const adminAgent = request.agent(app);
    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const existingEvents = db.listComingUpEvents();
    const orderedIds = [existingEvents[2].id, existingEvents[0].id, existingEvents[1].id];

    const response = await adminAgent.post('/api/admin/coming-up-events/reorder').send({
      orderedIds,
    });

    expect(response.status).toBe(200);
    expect(response.body.events.map((event) => event.id)).toEqual(orderedIds);
    expect(response.body.events.map((event) => event.sortOrder)).toEqual([0, 1, 2]);
    expect(db.listComingUpEvents().map((event) => event.id)).toEqual(orderedIds);
  });

  it('lists investor updates publicly and protects admin investor routes for non-admin users', async () => {
    const publicResponse = await request(app).get('/api/investor-updates');
    expect(publicResponse.status).toBe(200);
    expect(publicResponse.body.updates).toEqual([]);

    const userAgent = request.agent(app);
    await registerUser(userAgent, 'member@example.com');

    const listResponse = await userAgent.get('/api/admin/investor-updates');
    expect(listResponse.status).toBe(403);

    const createResponse = await userAgent.post('/api/admin/investor-updates').send({
      category: 'investment-page',
      title: 'Investor page note',
      summary: 'Summary',
      href: 'https://example.com',
    });
    expect(createResponse.status).toBe(403);

    const updateResponse = await userAgent.put('/api/admin/investor-updates/1').send({
      category: 'investment-page',
      title: 'Updated note',
      summary: 'Updated summary',
      href: 'https://example.com/updated',
    });
    expect(updateResponse.status).toBe(403);

    const deleteResponse = await userAgent.delete('/api/admin/investor-updates/1');
    expect(deleteResponse.status).toBe(403);

    const reorderResponse = await userAgent.post('/api/admin/investor-updates/reorder').send({
      category: 'investment-page',
      orderedIds: [1],
    });
    expect(reorderResponse.status).toBe(403);
  });

  it('lets admins create, update, delete, and reorder investor updates by category', async () => {
    const adminAgent = request.agent(app);
    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const firstCreate = await adminAgent.post('/api/admin/investor-updates').send({
      category: 'investment-page',
      title: 'Investor page note',
      summary: 'First investor summary',
      href: 'https://example.com/investor-page',
    });
    expect(firstCreate.status).toBe(201);
    expect(firstCreate.body.update).toMatchObject({
      category: 'investment-page',
      title: 'Investor page note',
      sortOrder: 0,
    });

    const secondCreate = await adminAgent.post('/api/admin/investor-updates').send({
      category: 'investment-page',
      title: 'Second investor note',
      summary: 'Second investor summary',
      href: '',
    });
    expect(secondCreate.status).toBe(201);
    expect(secondCreate.body.update).toMatchObject({
      category: 'investment-page',
      title: 'Second investor note',
      sortOrder: 1,
      href: null,
    });

    const thirdCreate = await adminAgent.post('/api/admin/investor-updates').send({
      category: 'monthly-reports',
      title: 'June report',
      summary: 'Report published',
      href: 'https://example.com/june-report',
    });
    expect(thirdCreate.status).toBe(201);
    expect(thirdCreate.body.update).toMatchObject({
      category: 'monthly-reports',
      title: 'June report',
      sortOrder: 0,
    });

    const publicResponse = await request(app).get('/api/investor-updates');
    expect(publicResponse.status).toBe(200);
    expect(publicResponse.body.updates).toHaveLength(3);

    const secondUpdateId = secondCreate.body.update.id;
    const saveResponse = await adminAgent.put(`/api/admin/investor-updates/${secondUpdateId}`).send({
      category: 'monthly-reports',
      title: 'Moved report note',
      summary: 'Moved into monthly reports',
      href: 'https://example.com/moved-report',
    });
    expect(saveResponse.status).toBe(200);
    expect(saveResponse.body.update).toMatchObject({
      id: secondUpdateId,
      category: 'monthly-reports',
      title: 'Moved report note',
      sortOrder: 1,
    });

    expect(db.listInvestorUpdates().filter((entry) => entry.category === 'investment-page')).toEqual([
      expect.objectContaining({
        id: firstCreate.body.update.id,
        sortOrder: 0,
      }),
    ]);

    const monthlyIdsBeforeReorder = db
      .listInvestorUpdates()
      .filter((entry) => entry.category === 'monthly-reports')
      .map((entry) => entry.id);
    expect(monthlyIdsBeforeReorder).toEqual([thirdCreate.body.update.id, secondUpdateId]);

    const reorderResponse = await adminAgent.post('/api/admin/investor-updates/reorder').send({
      category: 'monthly-reports',
      orderedIds: [secondUpdateId, thirdCreate.body.update.id],
    });
    expect(reorderResponse.status).toBe(200);
    expect(reorderResponse.body.updates.map((entry) => entry.id)).toEqual([
      secondUpdateId,
      thirdCreate.body.update.id,
    ]);
    expect(reorderResponse.body.updates.map((entry) => entry.sortOrder)).toEqual([0, 1]);

    const deleteResponse = await adminAgent.delete(`/api/admin/investor-updates/${secondUpdateId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ deletedUpdateId: secondUpdateId });
    expect(db.findInvestorUpdateById(secondUpdateId)).toBeNull();
    expect(db.listInvestorUpdates().filter((entry) => entry.category === 'monthly-reports')).toEqual([
      expect.objectContaining({
        id: thirdCreate.body.update.id,
        sortOrder: 0,
      }),
    ]);
  });

  it('skips the upload duration limit for admins while preserving it for regular users', async () => {
    const processedPayloads = [];
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      processUploadedVideoFn: async (payload) => {
        processedPayloads.push(payload);
        return {
          filePath: `${config.publicVideosBasePath}/processed.mp4`,
          durationSeconds: 721,
          fileSizeBytes: 1024,
          outputPath: path.join(config.processedVideosDirectory, 'processed.mp4'),
        };
      },
    });

    const memberAgent = request.agent(app);
    await registerUser(memberAgent, 'member@example.com');

    const memberUploadResponse = await memberAgent
      .post('/api/videos/upload')
      .field('title', 'Member upload')
      .attach('video', Buffer.from('fake-video'), 'member.mov');

    expect(memberUploadResponse.status).toBe(201);

    const adminAgent = request.agent(app);
    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const adminUploadResponse = await adminAgent
      .post('/api/videos/upload')
      .field('title', 'Admin upload')
      .attach('video', Buffer.from('fake-video'), 'admin.mov');

    expect(adminUploadResponse.status).toBe(201);
    expect(processedPayloads).toHaveLength(2);
    expect(processedPayloads[0].maxVideoDurationSeconds).toBe(300);
    expect(processedPayloads[1].maxVideoDurationSeconds).toBeNull();
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
          memberType: 'dancer',
          uploadCount: 1,
        }),
        expect.objectContaining({
          id: memberUser.id,
          email: 'member@example.com',
          role: 'user',
          memberType: 'dancer',
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

  it('lets an admin update a member type between dancer and investor', async () => {
    const adminAgent = request.agent(app);
    const userAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');
    const createdUser = await registerUser(userAgent, 'jennifer@example.com');

    const response = await adminAgent
      .patch(`/api/admin/users/${createdUser.id}/member-type`)
      .send({
        memberType: 'investor',
      });

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      id: createdUser.id,
      email: 'jennifer@example.com',
      role: 'user',
      memberType: 'investor',
    });

    expect(db.findUserByEmail('jennifer@example.com')).toMatchObject({
      email: 'jennifer@example.com',
      memberType: 'investor',
    });
  });

  it('rejects unsupported member type values', async () => {
    const adminAgent = request.agent(app);
    const userAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');
    const createdUser = await registerUser(userAgent, 'bad-role@example.com');

    const response = await adminAgent
      .patch(`/api/admin/users/${createdUser.id}/member-type`)
      .send({
        memberType: 'vip',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/member type/i);
  });

  it('lets an admin create a portfolio for an investor and read it back', async () => {
    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');

    const createResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.portfolio).toMatchObject({
      userId: promotedUser.id,
      displayName: 'Jennifer Portfolio',
      baseCurrency: 'USD',
    });

    const getResponse = await adminAgent.get(`/api/admin/investors/${promotedUser.id}/portfolio`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.portfolio).toMatchObject({
      userId: promotedUser.id,
      displayName: 'Jennifer Portfolio',
      baseCurrency: 'USD',
    });
  });

  it('lets an admin add a buy transaction and exposes calculated holdings to the investor', async () => {
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 54000,
      }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' });

    const transactionResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-06-01',
        notes: 'Initial BTC position',
      });

    expect(transactionResponse.status).toBe(201);

    const investmentResponse = await investorAgent.get('/api/investment/me');

    expect(investmentResponse.status).toBe(200);
    expect(investmentResponse.body.summary).toMatchObject({
      totalInvested: 5000,
      portfolioValue: 5400,
      unrealizedPnL: 400,
      totalReturnPercent: 8,
    });
    expect(investmentResponse.body.holdings).toEqual([
      expect.objectContaining({
        assetSymbol: 'BTC',
        assetName: 'Bitcoin',
        quantity: 0.1,
        invested: 5000,
        averageCost: 50000,
        currentPrice: 54000,
        currentValue: 5400,
        unrealizedPnL: 400,
        allocationPercent: 100,
      }),
    ]);
    expect(investmentResponse.body.transactions).toEqual([
      expect.objectContaining({
        assetSymbol: 'BTC',
        assetName: 'Bitcoin',
        amountInvested: 5000,
        purchasePrice: 50000,
        purchaseShares: 0.1,
        purchaseDate: '2026-06-01',
      }),
    ]);
  });

  it('includes live prices and a last-updated timestamp in the investor snapshot', async () => {
    const mockedPriceTime = '2026-06-19T16:00:00.000Z';

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 54000,
        ETH: 2500,
      }),
      getInvestmentPricesLastUpdatedAt: () => mockedPriceTime,
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    const createPortfolioResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' });
    expect(createPortfolioResponse.status).toBe(201);

    const createTransactionResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-06-01',
      });
    expect(createTransactionResponse.status).toBe(201);

    const response = await investorAgent.get('/api/investment/me');

    expect(response.status).toBe(200);
    expect(response.body.livePrices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetSymbol: 'BTC',
          assetName: 'Bitcoin',
          currentPrice: 54000,
        }),
      ])
    );
    expect(response.body.pricesLastUpdatedAt).toBe(mockedPriceTime);
  });

  it('returns seeded monthly portfolio performance values for investors', async () => {
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 54000,
      }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    const createPortfolioResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' });
    expect(createPortfolioResponse.status).toBe(201);

    const createTransactionResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      });
    expect(createTransactionResponse.status).toBe(201);

    const response = await investorAgent.get('/api/investment/me');

    expect(response.status).toBe(200);
    expect(response.body.monthlyPerformance).toEqual([
      { month: '2025-06', label: 'Jun 2025', portfolioValue: 50004.88 },
      { month: '2025-07', label: 'Jul 2025', portfolioValue: 49345.13 },
      { month: '2025-08', label: 'Aug 2025', portfolioValue: 61851.85 },
      { month: '2025-09', label: 'Sep 2025', portfolioValue: 68851.62 },
      { month: '2025-10', label: 'Oct 2025', portfolioValue: 69919.95 },
      { month: '2025-11', label: 'Nov 2025', portfolioValue: 60918.19 },
      { month: '2025-12', label: 'Dec 2025', portfolioValue: 44607.51 },
      { month: '2026-01', label: 'Jan 2026', portfolioValue: 45283.78 },
      { month: '2026-02', label: 'Feb 2026', portfolioValue: 36456.4 },
      { month: '2026-03', label: 'Mar 2026', portfolioValue: 31754.3 },
      { month: '2026-04', label: 'Apr 2026', portfolioValue: 32263.08 },
      { month: '2026-05', label: 'May 2026', portfolioValue: 34855.04 },
    ]);
  });

  it('seeds monthly performance once and appends the latest completed month snapshot', async () => {
    currentTime = new Date('2026-07-10T12:00:00.000Z');

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 60000,
      }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    const createPortfolioResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' });
    expect(createPortfolioResponse.status).toBe(201);

    const createTransactionResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      });
    expect(createTransactionResponse.status).toBe(201);

    const firstResponse = await investorAgent.get('/api/investment/me');
    const secondResponse = await investorAgent.get('/api/investment/me');

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(firstResponse.body.monthlyPerformance).toEqual([
      { month: '2025-06', label: 'Jun 2025', portfolioValue: 50004.88 },
      { month: '2025-07', label: 'Jul 2025', portfolioValue: 49345.13 },
      { month: '2025-08', label: 'Aug 2025', portfolioValue: 61851.85 },
      { month: '2025-09', label: 'Sep 2025', portfolioValue: 68851.62 },
      { month: '2025-10', label: 'Oct 2025', portfolioValue: 69919.95 },
      { month: '2025-11', label: 'Nov 2025', portfolioValue: 60918.19 },
      { month: '2025-12', label: 'Dec 2025', portfolioValue: 44607.51 },
      { month: '2026-01', label: 'Jan 2026', portfolioValue: 45283.78 },
      { month: '2026-02', label: 'Feb 2026', portfolioValue: 36456.4 },
      { month: '2026-03', label: 'Mar 2026', portfolioValue: 31754.3 },
      { month: '2026-04', label: 'Apr 2026', portfolioValue: 32263.08 },
      { month: '2026-05', label: 'May 2026', portfolioValue: 34855.04 },
      { month: '2026-06', label: 'Jun 2026', portfolioValue: 6000 },
    ]);
    expect(secondResponse.body.monthlyPerformance).toEqual(firstResponse.body.monthlyPerformance);
  });

  it('lists and downloads saved monthly reports for the logged-in investor', async () => {
    currentTime = new Date('2026-07-10T12:00:00.000Z');

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 60000,
      }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'investor@example.com');
    db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'investor@example.com');

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio`)
      .send({ displayName: 'Investor Portfolio' })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      })
      .expect(201);

    const generateResponse = await adminAgent
      .post('/api/admin/investment/reports/generate-latest')
      .send({});

    expect(generateResponse.status).toBe(200);
    expect(generateResponse.body.monthKey).toBe('2026-06');

    const listResponse = await investorAgent.get('/api/investment/me/reports');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.reports).toEqual([
      expect.objectContaining({
        monthKey: '2026-06',
        label: 'Jun 2026',
        status: 'ready',
      }),
    ]);

    const downloadResponse = await investorAgent.get('/api/investment/me/reports/2026-06/download');
    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.headers['content-type']).toContain('application/pdf');
    expect(downloadResponse.headers['content-disposition']).toContain('.pdf');
  });

  it('lists saved investor reports for admins across multiple portfolios', async () => {
    currentTime = new Date('2026-07-10T12:00:00.000Z');

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async () => {},
      getInvestmentPrices: async () => ({ BTC: 60000 }),
    });

    const adminAgent = request.agent(app);
    const firstInvestorAgent = request.agent(app);
    const secondInvestorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const firstCreatedUser = await registerUser(firstInvestorAgent, 'jennifer@example.com');
    db.setUserMemberTypeById(firstCreatedUser.id, 'investor');
    const secondCreatedUser = await registerUser(secondInvestorAgent, 'marco@example.com');
    db.setUserMemberTypeById(secondCreatedUser.id, 'investor');

    await adminAgent
      .post(`/api/admin/investors/${firstCreatedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${firstCreatedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${secondCreatedUser.id}/portfolio`)
      .send({ displayName: 'Marco Portfolio' })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${secondCreatedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'ETH',
        amountInvested: 7000,
        purchaseShares: 2,
        purchaseDate: '2026-05-18',
      })
      .expect(201);

    await adminAgent.post('/api/admin/investment/reports/generate-latest').send({}).expect(200);

    const response = await adminAgent.get('/api/admin/investment/reports').expect(200);

    expect(response.body.reports).toHaveLength(2);
    expect(response.body.reports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          investorEmail: 'jennifer@example.com',
          portfolioDisplayName: 'Jennifer Portfolio',
          monthKey: '2026-06',
          status: 'ready',
        }),
        expect.objectContaining({
          investorEmail: 'marco@example.com',
          portfolioDisplayName: 'Marco Portfolio',
          monthKey: '2026-06',
          status: 'ready',
        }),
      ])
    );
  });

  it('lets admins save investor-facing and admin-only notes on a monthly report', async () => {
    currentTime = new Date('2026-07-10T12:00:00.000Z');

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async () => {},
      getInvestmentPrices: async () => ({ BTC: 60000 }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      })
      .expect(201);

    await adminAgent.post('/api/admin/investment/reports/generate-latest').send({}).expect(200);
    const adminReportList = await adminAgent.get('/api/admin/investment/reports').expect(200);
    const savedReport = adminReportList.body.reports.find((report) => report.monthKey === '2026-06');
    expect(savedReport).toBeDefined();

    const updateResponse = await adminAgent
      .patch(`/api/admin/investment/reports/2026-06/${savedReport.id}`)
      .send({
        investorNote: 'Stayed patient during June volatility.',
        adminNote: 'Review ETH sizing before next rebalance.',
      })
      .expect(200);

    expect(updateResponse.body.report).toEqual(
      expect.objectContaining({
        investorNote: 'Stayed patient during June volatility.',
        adminNote: 'Review ETH sizing before next rebalance.',
      })
    );

    const refreshedAdminReportList = await adminAgent.get('/api/admin/investment/reports').expect(200);
    expect(refreshedAdminReportList.body.reports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: savedReport.id,
          monthKey: '2026-06',
          investorNote: 'Stayed patient during June volatility.',
          adminNote: 'Review ETH sizing before next rebalance.',
        }),
      ])
    );

    const investorReportList = await investorAgent.get('/api/investment/me/reports').expect(200);
    expect(investorReportList.body.reports).toEqual([
      expect.objectContaining({
        investorNote: 'Stayed patient during June volatility.',
      }),
    ]);
    expect(investorReportList.body.reports[0].adminNote).toBeUndefined();
  });

  it('lets admins regenerate a specific saved month report', async () => {
    currentTime = new Date('2026-07-10T12:00:00.000Z');

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async () => {},
      getInvestmentPrices: async () => ({ BTC: 60000 }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    db.setUserMemberTypeById(createdUser.id, 'investor');

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      })
      .expect(201);

    await adminAgent.post('/api/admin/investment/reports/generate-latest').send({}).expect(200);
    const adminReportList = await adminAgent.get('/api/admin/investment/reports').expect(200);
    const savedReport = adminReportList.body.reports.find((report) => report.monthKey === '2026-06');
    expect(savedReport).toBeDefined();

    const response = await adminAgent
      .post(`/api/admin/investment/reports/2026-06/${savedReport.id}/regenerate`)
      .send({})
      .expect(200);

    expect(response.body.report).toEqual(
      expect.objectContaining({
        monthKey: '2026-06',
        status: 'ready',
      })
    );
  });

  it('regenerates the latest completed month report idempotently', async () => {
    currentTime = new Date('2026-07-10T12:00:00.000Z');

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 60000,
      }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'investor@example.com');
    db.setUserMemberTypeById(createdUser.id, 'investor');

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio`)
      .send({ displayName: 'Investor Portfolio' })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      })
      .expect(201);

    const firstRun = await adminAgent.post('/api/admin/investment/reports/generate-latest').send({});
    const secondRun = await adminAgent.post('/api/admin/investment/reports/generate-latest').send({});

    expect(firstRun.status).toBe(200);
    expect(secondRun.status).toBe(200);
    expect(secondRun.body.summary.updated + secondRun.body.summary.generated).toBeGreaterThanOrEqual(1);
  });

  it('allows the internal cron endpoint to generate the latest reports with the shared secret', async () => {
    currentTime = new Date('2026-07-10T12:00:00.000Z');

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 60000,
      }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'investor@example.com');
    db.setUserMemberTypeById(createdUser.id, 'investor');

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio`)
      .send({ displayName: 'Investor Portfolio' })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      })
      .expect(201);

    await request(app)
      .post('/internal/jobs/investment-reports/generate-latest')
      .set('x-cron-secret', 'test-cron-secret')
      .send({})
      .expect(200)
      .expect(({ body }) => {
        expect(body.monthKey).toBe('2026-06');
        expect(body.summary.generated + body.summary.updated).toBeGreaterThanOrEqual(1);
      });
  });

  it('backfills missing seeded months for portfolios that were initialized before the 2025 history was added', async () => {
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 54000,
      }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    const portfolio = db.createInvestmentPortfolio({
      userId: promotedUser.id,
      displayName: 'Jennifer Portfolio',
    });

    for (const seed of [
      { month: '2026-01', portfolioValue: 45283.78, snapshotDate: '2026-01-31' },
      { month: '2026-02', portfolioValue: 36456.4, snapshotDate: '2026-02-28' },
      { month: '2026-03', portfolioValue: 31754.3, snapshotDate: '2026-03-31' },
      { month: '2026-04', portfolioValue: 32263.08, snapshotDate: '2026-04-30' },
      { month: '2026-05', portfolioValue: 34855.04, snapshotDate: '2026-05-31' },
    ]) {
      db.upsertInvestmentMonthlyHistory({
        portfolioId: portfolio.id,
        month: seed.month,
        portfolioValue: seed.portfolioValue,
        snapshotDate: seed.snapshotDate,
      });
    }

    const createTransactionResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      });
    expect(createTransactionResponse.status).toBe(201);

    const response = await investorAgent.get('/api/investment/me');

    expect(response.status).toBe(200);
    expect(response.body.monthlyPerformance).toEqual([
      { month: '2025-06', label: 'Jun 2025', portfolioValue: 50004.88 },
      { month: '2025-07', label: 'Jul 2025', portfolioValue: 49345.13 },
      { month: '2025-08', label: 'Aug 2025', portfolioValue: 61851.85 },
      { month: '2025-09', label: 'Sep 2025', portfolioValue: 68851.62 },
      { month: '2025-10', label: 'Oct 2025', portfolioValue: 69919.95 },
      { month: '2025-11', label: 'Nov 2025', portfolioValue: 60918.19 },
      { month: '2025-12', label: 'Dec 2025', portfolioValue: 44607.51 },
      { month: '2026-01', label: 'Jan 2026', portfolioValue: 45283.78 },
      { month: '2026-02', label: 'Feb 2026', portfolioValue: 36456.4 },
      { month: '2026-03', label: 'Mar 2026', portfolioValue: 31754.3 },
      { month: '2026-04', label: 'Apr 2026', portfolioValue: 32263.08 },
      { month: '2026-05', label: 'May 2026', portfolioValue: 34855.04 },
    ]);
  });

  it('keeps the investor snapshot available when live price fetching fails', async () => {
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => {
        throw new Error('CoinGecko unavailable');
      },
      getInvestmentPricesLastUpdatedAt: () => null,
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    const createPortfolioResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' });
    expect(createPortfolioResponse.status).toBe(201);

    const createTransactionResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-06-01',
      });
    expect(createTransactionResponse.status).toBe(201);

    const response = await investorAgent.get('/api/investment/me');

    expect(response.status).toBe(200);
    expect(response.body.livePrices).toEqual([]);
    expect(response.body.pricesLastUpdatedAt).toBeNull();
    expect(response.body.summary).toEqual({
      totalInvested: 5000,
      portfolioValue: 5000,
      unrealizedPnL: 0,
      totalReturnPercent: 0,
    });
    expect(response.body.holdings).toEqual([
      expect.objectContaining({
        assetSymbol: 'BTC',
        currentPrice: 50000,
        currentValue: 5000,
        unrealizedPnL: 0,
        allocationPercent: 100,
      }),
    ]);
  });

  it('times out hung CoinGecko requests and returns the investor snapshot without fake losses', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn((_url, options = {}) => {
      const { signal } = options;

      return new Promise((_resolve, reject) => {
        signal?.addEventListener(
          'abort',
          () => {
            const abortError = new Error('The operation was aborted.');
            abortError.name = 'AbortError';
            reject(abortError);
          },
          { once: true }
        );
      });
    });

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      investmentPriceFetchTimeoutMs: 20,
    });

    try {
      const adminAgent = request.agent(app);
      const investorAgent = request.agent(app);

      await registerUser(adminAgent, 'admin@example.com');
      promoteUserToAdmin(db, 'admin@example.com');
      await loginUser(adminAgent, 'admin@example.com');

      const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
      const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
      await loginUser(investorAgent, 'jennifer@example.com');

      const createPortfolioResponse = await adminAgent
        .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
        .send({ displayName: 'Jennifer Portfolio' });
      expect(createPortfolioResponse.status).toBe(201);

      const createTransactionResponse = await adminAgent
        .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
        .send({
          assetSymbol: 'BTC',
          amountInvested: 5000,
          purchaseShares: 0.1,
          purchaseDate: '2026-06-01',
        });
      expect(createTransactionResponse.status).toBe(201);

      const response = await investorAgent.get('/api/investment/me');

      expect(response.status).toBe(200);
      expect(response.body.livePrices).toEqual([]);
      expect(response.body.pricesLastUpdatedAt).toBeNull();
      expect(response.body.summary).toEqual({
        totalInvested: 5000,
        portfolioValue: 5000,
        unrealizedPnL: 0,
        totalReturnPercent: 0,
      });
      expect(response.body.holdings).toEqual([
        expect.objectContaining({
          assetSymbol: 'BTC',
          currentPrice: 50000,
          currentValue: 5000,
          unrealizedPnL: 0,
        }),
      ]);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      expect(globalThis.fetch.mock.calls[0][1]).toEqual(
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('rejects transaction mutation requests from investor users', async () => {
    const investorAgent = request.agent(app);
    const ownerAgent = request.agent(app);

    const actingInvestor = await registerUser(investorAgent, 'investor-one@example.com');
    const targetInvestor = await registerUser(ownerAgent, 'investor-two@example.com');

    db.setUserMemberTypeById(actingInvestor.id, 'investor');
    const promotedTarget = db.setUserMemberTypeById(targetInvestor.id, 'investor');

    const response = await investorAgent
      .post(`/api/admin/investors/${promotedTarget.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-06-01',
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toMatch(/admin/i);
  });

  it('lets an admin edit a buy transaction and recalculates the investor snapshot', async () => {
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 54000,
      }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' });

    const transactionResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-06-01',
        notes: 'Initial BTC position',
      });

    const transactionId = transactionResponse.body.transaction.id;

    const updateResponse = await adminAgent
      .patch(`/api/admin/portfolio-transactions/${transactionId}`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 6000,
        purchasePrice: 60000,
        purchaseDate: '2026-06-02',
        notes: 'Updated BTC position',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.transaction).toMatchObject({
      id: transactionId,
      amountInvested: 6000,
      purchasePrice: 60000,
      purchaseShares: 0.1,
      purchaseDate: '2026-06-02',
      notes: 'Updated BTC position',
    });

    const investmentResponse = await investorAgent.get('/api/investment/me');

    expect(investmentResponse.status).toBe(200);
    expect(investmentResponse.body.summary).toMatchObject({
      totalInvested: 6000,
      portfolioValue: 5400,
      unrealizedPnL: -600,
      totalReturnPercent: -10,
    });
    expect(investmentResponse.body.transactions).toEqual([
      expect.objectContaining({
        id: transactionId,
        amountInvested: 6000,
        purchasePrice: 60000,
        purchaseDate: '2026-06-02',
      }),
    ]);
  });

  it('lets an admin delete a buy transaction and removes it from the investor snapshot', async () => {
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 54000,
      }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' });

    const transactionResponse = await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-06-01',
      });

    const transactionId = transactionResponse.body.transaction.id;

    const deleteResponse = await adminAgent.delete(`/api/admin/portfolio-transactions/${transactionId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ deletedTransactionId: transactionId });

    const investmentResponse = await investorAgent.get('/api/investment/me');

    expect(investmentResponse.status).toBe(200);
    expect(investmentResponse.body.summary).toMatchObject({
      totalInvested: 0,
      portfolioValue: 0,
      unrealizedPnL: 0,
      totalReturnPercent: 0,
    });
    expect(investmentResponse.body.holdings).toEqual([]);
    expect(investmentResponse.body.transactions).toEqual([]);
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
