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

  it('lists featured reels publicly and lets admins manage them by placement', async () => {
    const publicResponse = await request(app).get('/api/featured-reels');
    expect(publicResponse.status).toBe(200);
    expect(publicResponse.body.reels.length).toBeGreaterThan(0);

    const adminAgent = request.agent(app);
    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createResponse = await adminAgent.post('/api/admin/featured-reels').send({
      placement: 'supporting',
      youtubeId: 'abc123xyz99',
      videoSrc: '',
      metaLabel: 'Test Event · 2026',
      metaLabelZh: '測試活動 · 2026',
      title: 'Test Supporting Reel',
      titleZh: '測試支援影片',
      description: 'English description',
      descriptionZh: '中文描述',
      thumbnail: '/test-thumbnail.png',
    });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.reel).toMatchObject({
      placement: 'supporting',
      title: 'Test Supporting Reel',
    });

    const createdId = createResponse.body.reel.id;
    const updateResponse = await adminAgent.put(`/api/admin/featured-reels/${createdId}`).send({
      placement: 'featured',
      youtubeId: '',
      videoSrc: '/local-test.mp4',
      metaLabel: 'Updated Event · 2026',
      metaLabelZh: '更新活動 · 2026',
      title: 'Updated Featured Reel',
      titleZh: '更新主影片',
      description: 'Updated English description',
      descriptionZh: '更新中文描述',
      thumbnail: '/updated-thumbnail.png',
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.reel).toMatchObject({
      id: createdId,
      placement: 'featured',
      videoSrc: '/local-test.mp4',
      youtubeId: null,
    });

    const featuredIds = db
      .listFeaturedReels()
      .filter((entry) => entry.placement === 'featured')
      .map((entry) => entry.id);
    const reorderedFeaturedIds = [...featuredIds].reverse();
    const reorderResponse = await adminAgent.post('/api/admin/featured-reels/reorder').send({
      placement: 'featured',
      orderedIds: reorderedFeaturedIds,
    });
    expect(reorderResponse.status).toBe(200);
    expect(reorderResponse.body.reels.map((entry) => entry.id)).toEqual(reorderedFeaturedIds);

    const deleteResponse = await adminAgent.delete(`/api/admin/featured-reels/${createdId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ deletedReelId: createdId });
    expect(db.findFeaturedReelById(createdId)).toBeNull();
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
