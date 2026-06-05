import bcrypt from 'bcryptjs';
import express from 'express';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { processUploadedVideo } from './video-processing.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 8;
const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{6,}/i;
const allowedExtensions = new Set(['.mp4', '.mov', '.avi']);
const allowedMimeTypes = new Set([
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/avi',
]);

function toSafeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

function setSessionUser(req, user) {
  req.session.user = toSafeUser(user);
}

function getSessionPayload(req) {
  return {
    authenticated: Boolean(req.session.user),
    user: req.session.user ?? null,
  };
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access is required.' });
  }

  next();
}

function serializeVideo(video) {
  return {
    id: video.id,
    title: video.title,
    sourceType: video.sourceType,
    sourceUrl: video.sourceUrl,
    filePath: video.filePath,
    originalFilename: video.originalFilename,
    durationSeconds: video.durationSeconds,
    fileSizeBytes: video.fileSizeBytes,
    status: video.status,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
  };
}

function serializeAdminUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    uploadCount: user.uploadCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function serializeAdminVideo(video) {
  return {
    ...serializeVideo(video),
    userId: video.userId,
    uploader: {
      id: video.uploaderId,
      email: video.uploaderEmail,
      role: video.uploaderRole,
    },
  };
}

function parseIdParam(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function resolveStoredVideoFilePath(filePath, config) {
  if (typeof filePath !== 'string' || !filePath.startsWith(`${config.publicVideosBasePath}/`)) {
    return null;
  }

  const relativePath = filePath.slice(config.publicVideosBasePath.length + 1);
  const rootPath = path.resolve(config.processedVideosDirectory);
  const absolutePath = path.resolve(config.processedVideosDirectory, relativePath);

  if (absolutePath !== rootPath && !absolutePath.startsWith(`${rootPath}${path.sep}`)) {
    return null;
  }

  return absolutePath;
}

async function removeStoredVideoFile(filePath, config) {
  const absolutePath = resolveStoredVideoFilePath(filePath, config);

  if (!absolutePath) {
    return;
  }

  await fs.rm(absolutePath, { force: true });
}

function trimOptionalString(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

function createUploadMiddleware(config) {
  return multer({
    dest: config.uploadTempDirectory,
    limits: {
      fileSize: config.uploadFileSizeLimitBytes,
    },
    fileFilter: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const mimeAllowed = allowedMimeTypes.has(file.mimetype);
      const extensionAllowed = allowedExtensions.has(extension);

      if (!mimeAllowed && !extensionAllowed) {
        callback(new Error('Only MP4, MOV, and AVI videos are allowed.'));
        return;
      }

      callback(null, true);
    },
  });
}

export function createApp({ db, sessionSecret, config }) {
  const app = express();
  const upload = createUploadMiddleware(config);

  app.use(express.json());
  app.use(
    session({
      name: 'crystal.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );
  app.use(config.publicVideosBasePath, express.static(config.processedVideosDirectory));

  app.get('/api/auth/me', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.json({ user: req.session.user });
  });

  app.get('/api/auth/session', (req, res) => {
    res.json(getSessionPayload(req));
  });

  app.post('/api/auth/register', async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');

    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }

    if (password.length < minimumPasswordLength) {
      return res.status(400).json({
        error: `Password must be at least ${minimumPasswordLength} characters.`,
      });
    }

    if (db.findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = db.createUser({ email, passwordHash });

    setSessionUser(req, user);

    return res.status(201).json({ user: toSafeUser(user) });
  });

  app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const user = db.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    setSessionUser(req, user);

    return res.json({ user: toSafeUser(user) });
  });

  app.post('/api/auth/logout', (req, res) => {
    if (!req.session) {
      return res.sendStatus(204);
    }

    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({ error: 'Unable to log out right now.' });
      }

      res.clearCookie('crystal.sid');
      return res.sendStatus(204);
    });
  });

  app.get('/api/videos', requireAuth, (req, res) => {
    const videos = db.listVideosByUser(req.session.user.id).map(serializeVideo);
    res.json({ videos });
  });

  app.get('/api/admin/users', requireAdmin, (_req, res) => {
    const users = db.listUsersWithUploadCounts().map(serializeAdminUser);
    res.json({ users });
  });

  app.get('/api/admin/videos', requireAdmin, (_req, res) => {
    const videos = db.listAllVideosWithUploader().map(serializeAdminVideo);
    res.json({ videos });
  });

  app.delete('/api/admin/videos/:videoId', requireAdmin, async (req, res) => {
    const videoId = parseIdParam(req.params.videoId);

    if (!videoId) {
      return res.status(400).json({ error: 'A valid video id is required.' });
    }

    const deletedVideo = db.deleteVideoById(videoId);

    if (!deletedVideo) {
      return res.status(404).json({ error: 'Video not found.' });
    }

    await removeStoredVideoFile(deletedVideo.filePath, config).catch(() => {});

    return res.json({ deletedVideoId: deletedVideo.id });
  });

  app.delete('/api/admin/users/:userId', requireAdmin, async (req, res) => {
    const userId = parseIdParam(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'A valid user id is required.' });
    }

    const deleted = db.deleteUserWithVideos(userId);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await Promise.all(
      deleted.videos.map((video) => removeStoredVideoFile(video.filePath, config).catch(() => {}))
    );

    return res.json({
      deletedUserId: deleted.user.id,
      deletedVideoCount: deleted.videos.length,
    });
  });

  app.post('/api/videos/youtube', requireAuth, (req, res) => {
    const title = String(req.body?.title ?? '').trim();
    const youtubeUrl = String(req.body?.youtubeUrl ?? '').trim();

    if (!title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    if (!youtubePattern.test(youtubeUrl)) {
      return res.status(400).json({ error: 'Please enter a valid YouTube link.' });
    }

    const video = db.createVideo({
      userId: req.session.user.id,
      title,
      sourceType: 'youtube',
      sourceUrl: youtubeUrl,
      filePath: null,
      originalFilename: null,
      durationSeconds: null,
      fileSizeBytes: null,
      status: 'ready',
    });

    return res.status(201).json({ video: serializeVideo(video) });
  });

  app.post('/api/videos/upload', requireAuth, (req, res) => {
    upload.single('video')(req, res, async (uploadError) => {
      if (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : 'Upload failed.';
        return res.status(400).json({ error: message });
      }

      const title = String(req.body?.title ?? '').trim();
      const file = req.file;

      if (!title) {
        if (file?.path) {
          await fs.rm(file.path, { force: true });
        }
        return res.status(400).json({ error: 'A title is required.' });
      }

      if (!file) {
        return res.status(400).json({ error: 'Please choose a video file to upload.' });
      }

      try {
        const processed = await processUploadedVideo({
          inputPath: file.path,
          originalFilename: file.originalname,
          processedVideosDirectory: config.processedVideosDirectory,
          publicVideosBasePath: config.publicVideosBasePath,
          maxVideoDurationSeconds: config.maxVideoDurationSeconds,
          targetVideoSizeBytes: config.targetVideoSizeBytes,
          maxAllowedVideoSizeBytes: config.maxAllowedVideoSizeBytes,
        });

        const video = db.createVideo({
          userId: req.session.user.id,
          title,
          sourceType: 'upload',
          sourceUrl: null,
          filePath: processed.filePath,
          originalFilename: file.originalname,
          durationSeconds: processed.durationSeconds,
          fileSizeBytes: processed.fileSizeBytes,
          status: 'ready',
        });

        return res.status(201).json({ video: serializeVideo(video) });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to process the uploaded video.';
        return res.status(400).json({ error: message });
      } finally {
        await fs.rm(file.path, { force: true }).catch(() => {});
      }
    });
  });

  return app;
}
