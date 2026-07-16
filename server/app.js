import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import express from 'express';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { processUploadedVideo } from './video-processing.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 8;
const forgotPasswordSuccessMessage =
  'If an account exists for that email, a password reset link has been sent.';
const invalidResetPasswordTokenMessage = 'This password reset link is invalid or expired.';
const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{6,}/i;
const allowedExtensions = new Set(['.mp4', '.mov', '.avi']);
const allowedMimeTypes = new Set([
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/avi',
]);
const inviteCodePattern = /^\d{6}$/;
const investorUpdateCategories = new Set([
  'investment-page',
  'monthly-reports',
  'real-time-quote',
]);
const featuredReelPlacements = new Set(['featured', 'supporting']);

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

function serializeComingUpEvent(event) {
  return {
    id: event.id,
    dateLabel: event.dateLabel,
    title: event.title,
    location: event.location,
    sortOrder: event.sortOrder,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

function serializeInvestorUpdate(update) {
  return {
    id: update.id,
    category: update.category,
    title: update.title,
    summary: update.summary,
    href: update.href,
    sortOrder: update.sortOrder,
    createdAt: update.createdAt,
    updatedAt: update.updatedAt,
  };
}

function serializeFeaturedReel(reel) {
  return {
    id: reel.id,
    placement: reel.placement,
    youtubeId: reel.youtubeId,
    videoSrc: reel.videoSrc,
    metaLabel: reel.metaLabel,
    metaLabelZh: reel.metaLabelZh,
    title: reel.title,
    titleZh: reel.titleZh,
    description: reel.description,
    descriptionZh: reel.descriptionZh,
    thumbnail: reel.thumbnail,
    sortOrder: reel.sortOrder,
    createdAt: reel.createdAt,
    updatedAt: reel.updatedAt,
  };
}

function serializePressHighlight(highlight) {
  return {
    id: highlight.id,
    source: highlight.source,
    sourceZh: highlight.sourceZh,
    dateLabel: highlight.dateLabel,
    dateLabelZh: highlight.dateLabelZh,
    title: highlight.title,
    titleZh: highlight.titleZh,
    description: highlight.description,
    descriptionZh: highlight.descriptionZh,
    href: highlight.href,
    imageSrc: highlight.imageSrc,
    imageAlt: highlight.imageAlt,
    imageAltZh: highlight.imageAltZh,
    imageHref: highlight.imageHref,
    sortOrder: highlight.sortOrder,
    createdAt: highlight.createdAt,
    updatedAt: highlight.updatedAt,
  };
}

function serializeAchievementEntry(entry) {
  return {
    id: entry.id,
    year: entry.year,
    title: entry.title,
    titleZh: entry.titleZh,
    description: entry.description,
    descriptionZh: entry.descriptionZh,
    highlight: Boolean(entry.highlight),
    latest: Boolean(entry.latest),
    sortOrder: entry.sortOrder,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

function serializeArtistProfile(profile) {
  return {
    coverIdentity: profile.coverIdentity,
    coverIdentityZh: profile.coverIdentityZh,
    coverStatement: profile.coverStatement,
    coverStatementZh: profile.coverStatementZh,
    aboutParagraph1: profile.aboutParagraph1,
    aboutParagraph1Zh: profile.aboutParagraph1Zh,
    aboutParagraph2: profile.aboutParagraph2,
    aboutParagraph2Zh: profile.aboutParagraph2Zh,
    aboutParagraph3: profile.aboutParagraph3,
    aboutParagraph3Zh: profile.aboutParagraph3Zh,
    updatedAt: profile.updatedAt,
  };
}

function serializeMasterClassTimelineEntry(entry) {
  return {
    id: entry.id,
    dateLabel: entry.dateLabel,
    dateLabelZh: entry.dateLabelZh,
    title: entry.title,
    titleZh: entry.titleZh,
    location: entry.location,
    locationZh: entry.locationZh,
    sortOrder: entry.sortOrder,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

function serializeArchiveMediaItem(item) {
  return {
    id: item.id,
    title: item.title,
    titleZh: item.titleZh,
    subtitle: item.subtitle,
    subtitleZh: item.subtitleZh,
    imageSrc: item.imageSrc,
    imageAlt: item.imageAlt,
    imageAltZh: item.imageAltZh,
    videoSrc: item.videoSrc,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function serializeGroupChoreographyEntry(entry) {
  return {
    id: entry.id,
    seasonLabel: entry.seasonLabel,
    seasonLabelZh: entry.seasonLabelZh,
    organization: entry.organization,
    organizationZh: entry.organizationZh,
    workTitle: entry.workTitle,
    workTitleZh: entry.workTitleZh,
    sortOrder: entry.sortOrder,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

function parseIdParam(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function findHydratedAdminVideo(db, videoId) {
  return db.listAllVideosWithUploader().find((video) => video.id === videoId) ?? null;
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

function parseRequiredTrimmedString(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseComingUpEventPayload(body) {
  return {
    dateLabel: parseRequiredTrimmedString(body?.dateLabel),
    title: parseRequiredTrimmedString(body?.title),
    location: parseRequiredTrimmedString(body?.location),
  };
}

function parseInvestorUpdatePayload(body) {
  const category = parseRequiredTrimmedString(body?.category);

  return {
    category:
      category && investorUpdateCategories.has(category)
        ? category
        : null,
    title: parseRequiredTrimmedString(body?.title),
    summary: parseRequiredTrimmedString(body?.summary),
    href: trimOptionalString(body?.href),
  };
}

function parseFeaturedReelPayload(body) {
  const placement = parseRequiredTrimmedString(body?.placement);

  return {
    placement:
      placement && featuredReelPlacements.has(placement)
        ? placement
        : null,
    youtubeId: trimOptionalString(body?.youtubeId),
    videoSrc: trimOptionalString(body?.videoSrc),
    metaLabel: parseRequiredTrimmedString(body?.metaLabel),
    metaLabelZh: parseRequiredTrimmedString(body?.metaLabelZh),
    title: parseRequiredTrimmedString(body?.title),
    titleZh: parseRequiredTrimmedString(body?.titleZh),
    description: parseRequiredTrimmedString(body?.description),
    descriptionZh: parseRequiredTrimmedString(body?.descriptionZh),
    thumbnail: parseRequiredTrimmedString(body?.thumbnail),
  };
}

function parsePressHighlightPayload(body) {
  return {
    source: parseRequiredTrimmedString(body?.source),
    sourceZh: parseRequiredTrimmedString(body?.sourceZh),
    dateLabel: parseRequiredTrimmedString(body?.dateLabel),
    dateLabelZh: parseRequiredTrimmedString(body?.dateLabelZh),
    title: parseRequiredTrimmedString(body?.title),
    titleZh: parseRequiredTrimmedString(body?.titleZh),
    description: parseRequiredTrimmedString(body?.description),
    descriptionZh: parseRequiredTrimmedString(body?.descriptionZh),
    href: parseRequiredTrimmedString(body?.href),
    imageSrc: parseRequiredTrimmedString(body?.imageSrc),
    imageAlt: parseRequiredTrimmedString(body?.imageAlt),
    imageAltZh: parseRequiredTrimmedString(body?.imageAltZh),
    imageHref: trimOptionalString(body?.imageHref),
  };
}

function parseAchievementEntryPayload(body) {
  return {
    year: parseRequiredTrimmedString(body?.year),
    title: parseRequiredTrimmedString(body?.title),
    titleZh: parseRequiredTrimmedString(body?.titleZh),
    description: parseRequiredTrimmedString(body?.description),
    descriptionZh: parseRequiredTrimmedString(body?.descriptionZh),
    highlight: Boolean(body?.highlight),
    latest: Boolean(body?.latest),
  };
}

function parseArtistProfilePayload(body) {
  return {
    coverIdentity: parseRequiredTrimmedString(body?.coverIdentity),
    coverIdentityZh: parseRequiredTrimmedString(body?.coverIdentityZh),
    coverStatement: parseRequiredTrimmedString(body?.coverStatement),
    coverStatementZh: parseRequiredTrimmedString(body?.coverStatementZh),
    aboutParagraph1: parseRequiredTrimmedString(body?.aboutParagraph1),
    aboutParagraph1Zh: parseRequiredTrimmedString(body?.aboutParagraph1Zh),
    aboutParagraph2: parseRequiredTrimmedString(body?.aboutParagraph2),
    aboutParagraph2Zh: parseRequiredTrimmedString(body?.aboutParagraph2Zh),
    aboutParagraph3: parseRequiredTrimmedString(body?.aboutParagraph3),
    aboutParagraph3Zh: parseRequiredTrimmedString(body?.aboutParagraph3Zh),
  };
}

function parseMasterClassTimelineEntryPayload(body) {
  return {
    dateLabel: parseRequiredTrimmedString(body?.dateLabel),
    dateLabelZh: parseRequiredTrimmedString(body?.dateLabelZh),
    title: parseRequiredTrimmedString(body?.title),
    titleZh: parseRequiredTrimmedString(body?.titleZh),
    location: parseRequiredTrimmedString(body?.location),
    locationZh: parseRequiredTrimmedString(body?.locationZh),
  };
}

function parseArchiveMediaItemPayload(body) {
  return {
    title: parseRequiredTrimmedString(body?.title),
    titleZh: parseRequiredTrimmedString(body?.titleZh),
    subtitle: parseRequiredTrimmedString(body?.subtitle),
    subtitleZh: parseRequiredTrimmedString(body?.subtitleZh),
    imageSrc: parseRequiredTrimmedString(body?.imageSrc),
    imageAlt: parseRequiredTrimmedString(body?.imageAlt),
    imageAltZh: parseRequiredTrimmedString(body?.imageAltZh),
    videoSrc: trimOptionalString(body?.videoSrc),
  };
}

function parseGroupChoreographyEntryPayload(body) {
  return {
    seasonLabel: parseRequiredTrimmedString(body?.seasonLabel),
    seasonLabelZh: parseRequiredTrimmedString(body?.seasonLabelZh),
    organization: parseRequiredTrimmedString(body?.organization),
    organizationZh: parseRequiredTrimmedString(body?.organizationZh),
    workTitle: parseRequiredTrimmedString(body?.workTitle),
    workTitleZh: parseRequiredTrimmedString(body?.workTitleZh),
  };
}

function hashResetToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function createPasswordResetToken() {
  return randomBytes(32).toString('base64url');
}

function buildResetPasswordUrl(resetPasswordUrlBase, token) {
  const url = new URL(resetPasswordUrlBase);
  url.searchParams.set('token', token);
  return url.toString();
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

export function createApp({
  db,
  sessionSecret,
  config,
  now = () => new Date(),
  sendPasswordResetEmail = async () => {},
  processUploadedVideoFn = processUploadedVideo,
}) {
  if (config.requireInviteCode && config.inviteCodes.length === 0) {
    throw new Error(
      'Invite code enforcement requires at least one configured six-digit invite code.'
    );
  }

  const app = express();
  const upload = createUploadMiddleware(config);

  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

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
    const inviteCode = String(req.body?.inviteCode ?? '').trim();

    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }

    if (password.length < minimumPasswordLength) {
      return res.status(400).json({
        error: `Password must be at least ${minimumPasswordLength} characters.`,
      });
    }

    if (config.requireInviteCode) {
      if (!inviteCodePattern.test(inviteCode)) {
        return res.status(400).json({ error: 'A valid six-digit invite code is required.' });
      }

      if (!config.inviteCodes.includes(inviteCode)) {
        return res.status(403).json({ error: 'Invite code is invalid.' });
      }
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

  app.post('/api/auth/forgot-password', async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();

    if (emailPattern.test(email)) {
      const user = db.findUserByEmail(email);

      if (user) {
        const issuedAt = now();
        const expiresAt = new Date(
          issuedAt.getTime() + config.passwordResetTokenTtlMinutes * 60 * 1000
        ).toISOString();
        const token = createPasswordResetToken();

        db.deleteExpiredPasswordResetTokens(issuedAt.toISOString());
        db.createPasswordResetToken({
          userId: user.id,
          tokenHash: hashResetToken(token),
          expiresAt,
        });

        try {
          await sendPasswordResetEmail({
            email: user.email,
            resetUrl: buildResetPasswordUrl(config.resetPasswordUrlBase, token),
            expiresAt,
            expiresInMinutes: config.passwordResetTokenTtlMinutes,
          });
        } catch (error) {
          console.error('Unable to send password reset email.', error);
        }
      }
    }

    return res.json({ message: forgotPasswordSuccessMessage });
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const token = String(req.body?.token ?? '').trim();
    const password = String(req.body?.password ?? '');

    if (!token) {
      return res.status(400).json({ error: 'A reset token is required.' });
    }

    if (password.length < minimumPasswordLength) {
      return res.status(400).json({
        error: `Password must be at least ${minimumPasswordLength} characters.`,
      });
    }

    const passwordResetToken = db.findPasswordResetTokenByHash(hashResetToken(token));

    if (!passwordResetToken || passwordResetToken.usedAt) {
      return res.status(400).json({ error: invalidResetPasswordTokenMessage });
    }

    if (new Date(passwordResetToken.expiresAt).getTime() <= now().getTime()) {
      db.deletePasswordResetTokenById(passwordResetToken.id);
      return res.status(410).json({ error: 'This password reset link has expired.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const updatedUser = db.resetUserPassword({
      userId: passwordResetToken.userId,
      passwordHash,
    });

    if (!updatedUser) {
      db.deletePasswordResetTokenById(passwordResetToken.id);
      return res.status(400).json({ error: invalidResetPasswordTokenMessage });
    }

    return res.json({ message: 'Your password has been reset successfully.' });
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

  app.get('/api/coming-up-events', (_req, res) => {
    const events = db.listComingUpEvents().map(serializeComingUpEvent);
    res.json({ events });
  });

  app.get('/api/investor-updates', (_req, res) => {
    const updates = db.listInvestorUpdates().map(serializeInvestorUpdate);
    res.json({ updates });
  });

  app.get('/api/featured-reels', (_req, res) => {
    const reels = db.listFeaturedReels().map(serializeFeaturedReel);
    res.json({ reels });
  });

  app.get('/api/press-highlights', (_req, res) => {
    const highlights = db.listPressHighlights().map(serializePressHighlight);
    res.json({ highlights });
  });

  app.get('/api/achievements', (_req, res) => {
    const achievements = db.listAchievementEntries().map(serializeAchievementEntry);
    res.json({ achievements });
  });

  app.get('/api/artist-profile', (_req, res) => {
    const profile = db.getArtistProfile();

    if (!profile) {
      return res.status(404).json({ error: 'Artist profile not found.' });
    }

    return res.json({ profile: serializeArtistProfile(profile) });
  });

  app.get('/api/gallery-archive', (_req, res) => {
    return res.json({
      timelineEntries: db.listMasterClassTimelineEntries().map(serializeMasterClassTimelineEntry),
      masterClassMoments: db.listMasterClassMoments().map(serializeArchiveMediaItem),
      groupEntries: db.listGroupChoreographyEntries().map(serializeGroupChoreographyEntry),
      groupMoments: db.listGroupChoreographyMoments().map(serializeArchiveMediaItem),
    });
  });

  app.get('/api/admin/users', requireAdmin, (_req, res) => {
    const users = db.listUsersWithUploadCounts().map(serializeAdminUser);
    res.json({ users });
  });

  app.get('/api/admin/coming-up-events', requireAdmin, (_req, res) => {
    const events = db.listComingUpEvents().map(serializeComingUpEvent);
    res.json({ events });
  });

  app.post('/api/admin/coming-up-events', requireAdmin, (req, res) => {
    const payload = parseComingUpEventPayload(req.body);

    if (!payload.dateLabel) {
      return res.status(400).json({ error: 'A date label is required.' });
    }

    if (!payload.title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    if (!payload.location) {
      return res.status(400).json({ error: 'A location is required.' });
    }

    const event = db.createComingUpEvent({
      ...payload,
      sortOrder: db.listComingUpEvents().length,
    });

    return res.status(201).json({ event: serializeComingUpEvent(event) });
  });

  app.put('/api/admin/coming-up-events/:eventId', requireAdmin, (req, res) => {
    const eventId = parseIdParam(req.params.eventId);

    if (!eventId) {
      return res.status(400).json({ error: 'A valid event id is required.' });
    }

    const payload = parseComingUpEventPayload(req.body);

    if (!payload.dateLabel) {
      return res.status(400).json({ error: 'A date label is required.' });
    }

    if (!payload.title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    if (!payload.location) {
      return res.status(400).json({ error: 'A location is required.' });
    }

    const event = db.updateComingUpEvent({
      id: eventId,
      ...payload,
    });

    if (!event) {
      return res.status(404).json({ error: 'Coming up event not found.' });
    }

    return res.json({ event: serializeComingUpEvent(event) });
  });

  app.delete('/api/admin/coming-up-events/:eventId', requireAdmin, (req, res) => {
    const eventId = parseIdParam(req.params.eventId);

    if (!eventId) {
      return res.status(400).json({ error: 'A valid event id is required.' });
    }

    const deletedEvent = db.deleteComingUpEvent(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Coming up event not found.' });
    }

    const remainingIds = db.listComingUpEvents().map((event) => event.id);
    db.reorderComingUpEvents(remainingIds);

    return res.json({ deletedEventId: deletedEvent.id });
  });

  app.post('/api/admin/coming-up-events/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? req.body.orderedIds.map((id) => parseIdParam(id))
      : null;

    if (!orderedIds || orderedIds.some((id) => id === null)) {
      return res.status(400).json({ error: 'orderedIds must be an array of valid event ids.' });
    }

    const currentIds = db.listComingUpEvents().map((event) => event.id);

    if (orderedIds.length !== currentIds.length) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current event ids.' });
    }

    const orderedIdSet = new Set(orderedIds);

    if (orderedIdSet.size !== currentIds.length || currentIds.some((id) => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current event ids.' });
    }

    const events = db.reorderComingUpEvents(orderedIds).map(serializeComingUpEvent);
    return res.json({ events });
  });

  app.get('/api/admin/investor-updates', requireAdmin, (_req, res) => {
    const updates = db.listInvestorUpdates().map(serializeInvestorUpdate);
    res.json({ updates });
  });

  app.post('/api/admin/investor-updates', requireAdmin, (req, res) => {
    const payload = parseInvestorUpdatePayload(req.body);

    if (!payload.category) {
      return res.status(400).json({ error: 'A valid investor category is required.' });
    }

    if (!payload.title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    if (!payload.summary) {
      return res.status(400).json({ error: 'A summary is required.' });
    }

    const update = db.createInvestorUpdate({
      ...payload,
      sortOrder: db.countInvestorUpdatesByCategory(payload.category),
    });

    return res.status(201).json({ update: serializeInvestorUpdate(update) });
  });

  app.put('/api/admin/investor-updates/:updateId', requireAdmin, (req, res) => {
    const updateId = parseIdParam(req.params.updateId);

    if (!updateId) {
      return res.status(400).json({ error: 'A valid investor update id is required.' });
    }

    const existingUpdate = db.findInvestorUpdateById(updateId);

    if (!existingUpdate) {
      return res.status(404).json({ error: 'Investor update not found.' });
    }

    const payload = parseInvestorUpdatePayload(req.body);

    if (!payload.category) {
      return res.status(400).json({ error: 'A valid investor category is required.' });
    }

    if (!payload.title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    if (!payload.summary) {
      return res.status(400).json({ error: 'A summary is required.' });
    }

    const sortOrder =
      payload.category === existingUpdate.category
        ? existingUpdate.sortOrder
        : db.countInvestorUpdatesByCategory(payload.category);

    const update = db.updateInvestorUpdate({
      id: updateId,
      ...payload,
      sortOrder,
    });

    if (!update) {
      return res.status(404).json({ error: 'Investor update not found.' });
    }

    if (payload.category !== existingUpdate.category) {
      const previousCategoryIds = db
        .listInvestorUpdates()
        .filter((entry) => entry.category === existingUpdate.category)
        .map((entry) => entry.id);
      db.reorderInvestorUpdates(existingUpdate.category, previousCategoryIds);

      const nextCategoryIds = db
        .listInvestorUpdates()
        .filter((entry) => entry.category === payload.category)
        .map((entry) => entry.id);
      db.reorderInvestorUpdates(payload.category, nextCategoryIds);
    }

    return res.json({ update: serializeInvestorUpdate(db.findInvestorUpdateById(updateId)) });
  });

  app.delete('/api/admin/investor-updates/:updateId', requireAdmin, (req, res) => {
    const updateId = parseIdParam(req.params.updateId);

    if (!updateId) {
      return res.status(400).json({ error: 'A valid investor update id is required.' });
    }

    const deletedUpdate = db.deleteInvestorUpdate(updateId);

    if (!deletedUpdate) {
      return res.status(404).json({ error: 'Investor update not found.' });
    }

    const remainingIds = db
      .listInvestorUpdates()
      .filter((entry) => entry.category === deletedUpdate.category)
      .map((entry) => entry.id);
    db.reorderInvestorUpdates(deletedUpdate.category, remainingIds);

    return res.json({ deletedUpdateId: deletedUpdate.id });
  });

  app.post('/api/admin/investor-updates/reorder', requireAdmin, (req, res) => {
    const category = parseRequiredTrimmedString(req.body?.category);
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? req.body.orderedIds.map((id) => parseIdParam(id))
      : null;

    if (!category || !investorUpdateCategories.has(category)) {
      return res.status(400).json({ error: 'A valid investor category is required.' });
    }

    if (!orderedIds || orderedIds.some((id) => id === null)) {
      return res.status(400).json({ error: 'orderedIds must be an array of valid investor update ids.' });
    }

    const currentIds = db
      .listInvestorUpdates()
      .filter((entry) => entry.category === category)
      .map((entry) => entry.id);

    if (orderedIds.length !== currentIds.length) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current investor update ids.' });
    }

    const orderedIdSet = new Set(orderedIds);

    if (orderedIdSet.size !== currentIds.length || currentIds.some((id) => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current investor update ids.' });
    }

    const updates = db.reorderInvestorUpdates(category, orderedIds).map(serializeInvestorUpdate);
    return res.json({ updates });
  });

  app.get('/api/admin/featured-reels', requireAdmin, (_req, res) => {
    const reels = db.listFeaturedReels().map(serializeFeaturedReel);
    res.json({ reels });
  });

  app.get('/api/admin/press-highlights', requireAdmin, (_req, res) => {
    const highlights = db.listPressHighlights().map(serializePressHighlight);
    res.json({ highlights });
  });

  app.get('/api/admin/achievements', requireAdmin, (_req, res) => {
    const achievements = db.listAchievementEntries().map(serializeAchievementEntry);
    res.json({ achievements });
  });

  app.get('/api/admin/artist-profile', requireAdmin, (_req, res) => {
    const profile = db.getArtistProfile();

    if (!profile) {
      return res.status(404).json({ error: 'Artist profile not found.' });
    }

    return res.json({ profile: serializeArtistProfile(profile) });
  });

  app.get('/api/admin/gallery-archive', requireAdmin, (_req, res) => {
    return res.json({
      timelineEntries: db.listMasterClassTimelineEntries().map(serializeMasterClassTimelineEntry),
      masterClassMoments: db.listMasterClassMoments().map(serializeArchiveMediaItem),
      groupEntries: db.listGroupChoreographyEntries().map(serializeGroupChoreographyEntry),
      groupMoments: db.listGroupChoreographyMoments().map(serializeArchiveMediaItem),
    });
  });

  app.post('/api/admin/featured-reels', requireAdmin, (req, res) => {
    const payload = parseFeaturedReelPayload(req.body);

    if (!payload.placement) {
      return res.status(400).json({ error: 'A valid reel placement is required.' });
    }

    if (!payload.metaLabel || !payload.metaLabelZh || !payload.title || !payload.titleZh) {
      return res.status(400).json({ error: 'Both English and Chinese labels and titles are required.' });
    }

    if (!payload.description || !payload.descriptionZh) {
      return res.status(400).json({ error: 'Both English and Chinese descriptions are required.' });
    }

    if (!payload.thumbnail) {
      return res.status(400).json({ error: 'A thumbnail path is required.' });
    }

    if (!payload.youtubeId && !payload.videoSrc) {
      return res.status(400).json({ error: 'Provide either a YouTube id or a local video source.' });
    }

    const reel = db.createFeaturedReel({
      ...payload,
      sortOrder: db.countFeaturedReelsByPlacement(payload.placement),
    });

    return res.status(201).json({ reel: serializeFeaturedReel(reel) });
  });

  app.put('/api/admin/featured-reels/:reelId', requireAdmin, (req, res) => {
    const reelId = parseIdParam(req.params.reelId);

    if (!reelId) {
      return res.status(400).json({ error: 'A valid featured reel id is required.' });
    }

    const existingReel = db.findFeaturedReelById(reelId);

    if (!existingReel) {
      return res.status(404).json({ error: 'Featured reel not found.' });
    }

    const payload = parseFeaturedReelPayload(req.body);

    if (!payload.placement) {
      return res.status(400).json({ error: 'A valid reel placement is required.' });
    }

    if (!payload.metaLabel || !payload.metaLabelZh || !payload.title || !payload.titleZh) {
      return res.status(400).json({ error: 'Both English and Chinese labels and titles are required.' });
    }

    if (!payload.description || !payload.descriptionZh) {
      return res.status(400).json({ error: 'Both English and Chinese descriptions are required.' });
    }

    if (!payload.thumbnail) {
      return res.status(400).json({ error: 'A thumbnail path is required.' });
    }

    if (!payload.youtubeId && !payload.videoSrc) {
      return res.status(400).json({ error: 'Provide either a YouTube id or a local video source.' });
    }

    const sortOrder =
      payload.placement === existingReel.placement
        ? existingReel.sortOrder
        : db.countFeaturedReelsByPlacement(payload.placement);

    const reel = db.updateFeaturedReel({
      id: reelId,
      ...payload,
      sortOrder,
    });

    if (!reel) {
      return res.status(404).json({ error: 'Featured reel not found.' });
    }

    if (payload.placement !== existingReel.placement) {
      const previousPlacementIds = db
        .listFeaturedReels()
        .filter((entry) => entry.placement === existingReel.placement)
        .map((entry) => entry.id);
      db.reorderFeaturedReels(existingReel.placement, previousPlacementIds);

      const nextPlacementIds = db
        .listFeaturedReels()
        .filter((entry) => entry.placement === payload.placement)
        .map((entry) => entry.id);
      db.reorderFeaturedReels(payload.placement, nextPlacementIds);
    }

    return res.json({ reel: serializeFeaturedReel(db.findFeaturedReelById(reelId)) });
  });

  app.delete('/api/admin/featured-reels/:reelId', requireAdmin, (req, res) => {
    const reelId = parseIdParam(req.params.reelId);

    if (!reelId) {
      return res.status(400).json({ error: 'A valid featured reel id is required.' });
    }

    const deletedReel = db.deleteFeaturedReel(reelId);

    if (!deletedReel) {
      return res.status(404).json({ error: 'Featured reel not found.' });
    }

    const remainingIds = db
      .listFeaturedReels()
      .filter((entry) => entry.placement === deletedReel.placement)
      .map((entry) => entry.id);
    db.reorderFeaturedReels(deletedReel.placement, remainingIds);

    return res.json({ deletedReelId: deletedReel.id });
  });

  app.post('/api/admin/featured-reels/reorder', requireAdmin, (req, res) => {
    const placement = parseRequiredTrimmedString(req.body?.placement);
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? req.body.orderedIds.map((id) => parseIdParam(id))
      : null;

    if (!placement || !featuredReelPlacements.has(placement)) {
      return res.status(400).json({ error: 'A valid reel placement is required.' });
    }

    if (!orderedIds || orderedIds.some((id) => id === null)) {
      return res.status(400).json({ error: 'orderedIds must be an array of valid featured reel ids.' });
    }

    const currentIds = db
      .listFeaturedReels()
      .filter((entry) => entry.placement === placement)
      .map((entry) => entry.id);

    if (orderedIds.length !== currentIds.length) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current featured reel ids.' });
    }

    const orderedIdSet = new Set(orderedIds);

    if (orderedIdSet.size !== currentIds.length || currentIds.some((id) => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current featured reel ids.' });
    }

    const reels = db.reorderFeaturedReels(placement, orderedIds).map(serializeFeaturedReel);
    return res.json({ reels });
  });

  app.post('/api/admin/press-highlights', requireAdmin, (req, res) => {
    const payload = parsePressHighlightPayload(req.body);

    if (!payload.source || !payload.sourceZh) {
      return res.status(400).json({ error: 'Both English and Chinese publication names are required.' });
    }

    if (!payload.dateLabel || !payload.dateLabelZh) {
      return res.status(400).json({ error: 'Both English and Chinese date labels are required.' });
    }

    if (!payload.title || !payload.titleZh) {
      return res.status(400).json({ error: 'Both English and Chinese titles are required.' });
    }

    if (!payload.description || !payload.descriptionZh) {
      return res.status(400).json({ error: 'Both English and Chinese descriptions are required.' });
    }

    if (!payload.href) {
      return res.status(400).json({ error: 'A feature link is required.' });
    }

    if (!payload.imageSrc) {
      return res.status(400).json({ error: 'An image path is required.' });
    }

    if (!payload.imageAlt || !payload.imageAltZh) {
      return res.status(400).json({ error: 'Both English and Chinese image alt labels are required.' });
    }

    const highlight = db.createPressHighlight({
      ...payload,
      sortOrder: db.countPressHighlights(),
    });

    return res.status(201).json({ highlight: serializePressHighlight(highlight) });
  });

  app.put('/api/admin/press-highlights/:highlightId', requireAdmin, (req, res) => {
    const highlightId = parseIdParam(req.params.highlightId);

    if (!highlightId) {
      return res.status(400).json({ error: 'A valid press highlight id is required.' });
    }

    const payload = parsePressHighlightPayload(req.body);

    if (!payload.source || !payload.sourceZh) {
      return res.status(400).json({ error: 'Both English and Chinese publication names are required.' });
    }

    if (!payload.dateLabel || !payload.dateLabelZh) {
      return res.status(400).json({ error: 'Both English and Chinese date labels are required.' });
    }

    if (!payload.title || !payload.titleZh) {
      return res.status(400).json({ error: 'Both English and Chinese titles are required.' });
    }

    if (!payload.description || !payload.descriptionZh) {
      return res.status(400).json({ error: 'Both English and Chinese descriptions are required.' });
    }

    if (!payload.href) {
      return res.status(400).json({ error: 'A feature link is required.' });
    }

    if (!payload.imageSrc) {
      return res.status(400).json({ error: 'An image path is required.' });
    }

    if (!payload.imageAlt || !payload.imageAltZh) {
      return res.status(400).json({ error: 'Both English and Chinese image alt labels are required.' });
    }

    const highlight = db.updatePressHighlight({
      id: highlightId,
      ...payload,
    });

    if (!highlight) {
      return res.status(404).json({ error: 'Press highlight not found.' });
    }

    return res.json({ highlight: serializePressHighlight(highlight) });
  });

  app.delete('/api/admin/press-highlights/:highlightId', requireAdmin, (req, res) => {
    const highlightId = parseIdParam(req.params.highlightId);

    if (!highlightId) {
      return res.status(400).json({ error: 'A valid press highlight id is required.' });
    }

    const deletedHighlight = db.deletePressHighlight(highlightId);

    if (!deletedHighlight) {
      return res.status(404).json({ error: 'Press highlight not found.' });
    }

    const remainingIds = db.listPressHighlights().map((entry) => entry.id);
    db.reorderPressHighlights(remainingIds);

    return res.json({ deletedHighlightId: deletedHighlight.id });
  });

  app.post('/api/admin/press-highlights/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? req.body.orderedIds.map((id) => parseIdParam(id))
      : null;

    if (!orderedIds || orderedIds.some((id) => id === null)) {
      return res.status(400).json({ error: 'orderedIds must be an array of valid press highlight ids.' });
    }

    const currentIds = db.listPressHighlights().map((entry) => entry.id);

    if (orderedIds.length !== currentIds.length) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current press highlight ids.' });
    }

    const orderedIdSet = new Set(orderedIds);

    if (orderedIdSet.size !== currentIds.length || currentIds.some((id) => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current press highlight ids.' });
    }

    const highlights = db.reorderPressHighlights(orderedIds).map(serializePressHighlight);
    return res.json({ highlights });
  });

  app.post('/api/admin/achievements', requireAdmin, (req, res) => {
    const payload = parseAchievementEntryPayload(req.body);

    if (!payload.year) {
      return res.status(400).json({ error: 'A year is required.' });
    }

    if (!payload.title || !payload.titleZh) {
      return res.status(400).json({ error: 'Both English and Chinese titles are required.' });
    }

    if (!payload.description || !payload.descriptionZh) {
      return res.status(400).json({ error: 'Both English and Chinese descriptions are required.' });
    }

    const achievement = db.createAchievementEntry({
      ...payload,
      sortOrder: db.countAchievementEntries(),
    });

    return res.status(201).json({ achievement: serializeAchievementEntry(achievement) });
  });

  app.put('/api/admin/achievements/:achievementId', requireAdmin, (req, res) => {
    const achievementId = parseIdParam(req.params.achievementId);

    if (!achievementId) {
      return res.status(400).json({ error: 'A valid achievement id is required.' });
    }

    const payload = parseAchievementEntryPayload(req.body);

    if (!payload.year) {
      return res.status(400).json({ error: 'A year is required.' });
    }

    if (!payload.title || !payload.titleZh) {
      return res.status(400).json({ error: 'Both English and Chinese titles are required.' });
    }

    if (!payload.description || !payload.descriptionZh) {
      return res.status(400).json({ error: 'Both English and Chinese descriptions are required.' });
    }

    const achievement = db.updateAchievementEntry({
      id: achievementId,
      ...payload,
    });

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement entry not found.' });
    }

    return res.json({ achievement: serializeAchievementEntry(achievement) });
  });

  app.delete('/api/admin/achievements/:achievementId', requireAdmin, (req, res) => {
    const achievementId = parseIdParam(req.params.achievementId);

    if (!achievementId) {
      return res.status(400).json({ error: 'A valid achievement id is required.' });
    }

    const deletedAchievement = db.deleteAchievementEntry(achievementId);

    if (!deletedAchievement) {
      return res.status(404).json({ error: 'Achievement entry not found.' });
    }

    const remainingIds = db.listAchievementEntries().map((entry) => entry.id);
    db.reorderAchievementEntries(remainingIds);

    return res.json({ deletedAchievementId: deletedAchievement.id });
  });

  app.post('/api/admin/achievements/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? req.body.orderedIds.map((id) => parseIdParam(id))
      : null;

    if (!orderedIds || orderedIds.some((id) => id === null)) {
      return res.status(400).json({ error: 'orderedIds must be an array of valid achievement ids.' });
    }

    const currentIds = db.listAchievementEntries().map((entry) => entry.id);

    if (orderedIds.length !== currentIds.length) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current achievement ids.' });
    }

    const orderedIdSet = new Set(orderedIds);

    if (orderedIdSet.size !== currentIds.length || currentIds.some((id) => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current achievement ids.' });
    }

    const achievements = db.reorderAchievementEntries(orderedIds).map(serializeAchievementEntry);
    return res.json({ achievements });
  });

  app.put('/api/admin/artist-profile', requireAdmin, (req, res) => {
    const payload = parseArtistProfilePayload(req.body);

    if (!payload.coverIdentity || !payload.coverIdentityZh) {
      return res.status(400).json({ error: 'Both English and Chinese cover identities are required.' });
    }

    if (!payload.coverStatement || !payload.coverStatementZh) {
      return res.status(400).json({ error: 'Both English and Chinese cover statements are required.' });
    }

    if (!payload.aboutParagraph1 || !payload.aboutParagraph1Zh) {
      return res.status(400).json({ error: 'Both English and Chinese paragraph 1 values are required.' });
    }

    if (!payload.aboutParagraph2 || !payload.aboutParagraph2Zh) {
      return res.status(400).json({ error: 'Both English and Chinese paragraph 2 values are required.' });
    }

    if (!payload.aboutParagraph3 || !payload.aboutParagraph3Zh) {
      return res.status(400).json({ error: 'Both English and Chinese paragraph 3 values are required.' });
    }

    const profile = db.upsertArtistProfile(payload);
    return res.json({ profile: serializeArtistProfile(profile) });
  });

  app.post('/api/admin/master-class-timeline', requireAdmin, (req, res) => {
    const payload = parseMasterClassTimelineEntryPayload(req.body);

    if (!payload.dateLabel || !payload.dateLabelZh || !payload.title || !payload.titleZh || !payload.location || !payload.locationZh) {
      return res.status(400).json({ error: 'All English and Chinese timeline fields are required.' });
    }

    const entry = db.createMasterClassTimelineEntry({
      ...payload,
      sortOrder: db.countMasterClassTimelineEntries(),
    });

    return res.status(201).json({ entry: serializeMasterClassTimelineEntry(entry) });
  });

  app.put('/api/admin/master-class-timeline/:entryId', requireAdmin, (req, res) => {
    const entryId = parseIdParam(req.params.entryId);

    if (!entryId) {
      return res.status(400).json({ error: 'A valid timeline entry id is required.' });
    }

    const payload = parseMasterClassTimelineEntryPayload(req.body);

    if (!payload.dateLabel || !payload.dateLabelZh || !payload.title || !payload.titleZh || !payload.location || !payload.locationZh) {
      return res.status(400).json({ error: 'All English and Chinese timeline fields are required.' });
    }

    const entry = db.updateMasterClassTimelineEntry({
      id: entryId,
      ...payload,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Master class timeline entry not found.' });
    }

    return res.json({ entry: serializeMasterClassTimelineEntry(entry) });
  });

  app.delete('/api/admin/master-class-timeline/:entryId', requireAdmin, (req, res) => {
    const entryId = parseIdParam(req.params.entryId);

    if (!entryId) {
      return res.status(400).json({ error: 'A valid timeline entry id is required.' });
    }

    const deletedEntry = db.deleteMasterClassTimelineEntry(entryId);

    if (!deletedEntry) {
      return res.status(404).json({ error: 'Master class timeline entry not found.' });
    }

    db.reorderMasterClassTimelineEntries(db.listMasterClassTimelineEntries().map((entry) => entry.id));
    return res.json({ deletedEntryId: deletedEntry.id });
  });

  app.post('/api/admin/master-class-timeline/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? req.body.orderedIds.map((id) => parseIdParam(id))
      : null;

    if (!orderedIds || orderedIds.some((id) => id === null)) {
      return res.status(400).json({ error: 'orderedIds must be an array of valid timeline entry ids.' });
    }

    const currentIds = db.listMasterClassTimelineEntries().map((entry) => entry.id);

    if (orderedIds.length !== currentIds.length) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current timeline entry ids.' });
    }

    const orderedIdSet = new Set(orderedIds);

    if (orderedIdSet.size !== currentIds.length || currentIds.some((id) => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current timeline entry ids.' });
    }

    const timelineEntries = db.reorderMasterClassTimelineEntries(orderedIds).map(serializeMasterClassTimelineEntry);
    return res.json({ timelineEntries });
  });

  app.post('/api/admin/master-class-moments', requireAdmin, (req, res) => {
    const payload = parseArchiveMediaItemPayload(req.body);

    if (!payload.title || !payload.titleZh || !payload.subtitle || !payload.subtitleZh || !payload.imageSrc || !payload.imageAlt || !payload.imageAltZh) {
      return res.status(400).json({ error: 'All master class media labels, titles, and image fields are required.' });
    }

    const moment = db.createMasterClassMoment({
      ...payload,
      sortOrder: db.countMasterClassMoments(),
    });

    return res.status(201).json({ moment: serializeArchiveMediaItem(moment) });
  });

  app.put('/api/admin/master-class-moments/:momentId', requireAdmin, (req, res) => {
    const momentId = parseIdParam(req.params.momentId);

    if (!momentId) {
      return res.status(400).json({ error: 'A valid master class moment id is required.' });
    }

    const payload = parseArchiveMediaItemPayload(req.body);

    if (!payload.title || !payload.titleZh || !payload.subtitle || !payload.subtitleZh || !payload.imageSrc || !payload.imageAlt || !payload.imageAltZh) {
      return res.status(400).json({ error: 'All master class media labels, titles, and image fields are required.' });
    }

    const moment = db.updateMasterClassMoment({
      id: momentId,
      ...payload,
    });

    if (!moment) {
      return res.status(404).json({ error: 'Master class moment not found.' });
    }

    return res.json({ moment: serializeArchiveMediaItem(moment) });
  });

  app.delete('/api/admin/master-class-moments/:momentId', requireAdmin, (req, res) => {
    const momentId = parseIdParam(req.params.momentId);

    if (!momentId) {
      return res.status(400).json({ error: 'A valid master class moment id is required.' });
    }

    const deletedMoment = db.deleteMasterClassMoment(momentId);

    if (!deletedMoment) {
      return res.status(404).json({ error: 'Master class moment not found.' });
    }

    db.reorderMasterClassMoments(db.listMasterClassMoments().map((entry) => entry.id));
    return res.json({ deletedMomentId: deletedMoment.id });
  });

  app.post('/api/admin/master-class-moments/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? req.body.orderedIds.map((id) => parseIdParam(id))
      : null;

    if (!orderedIds || orderedIds.some((id) => id === null)) {
      return res.status(400).json({ error: 'orderedIds must be an array of valid master class moment ids.' });
    }

    const currentIds = db.listMasterClassMoments().map((entry) => entry.id);

    if (orderedIds.length !== currentIds.length) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current master class moment ids.' });
    }

    const orderedIdSet = new Set(orderedIds);

    if (orderedIdSet.size !== currentIds.length || currentIds.some((id) => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current master class moment ids.' });
    }

    const masterClassMoments = db.reorderMasterClassMoments(orderedIds).map(serializeArchiveMediaItem);
    return res.json({ masterClassMoments });
  });

  app.post('/api/admin/group-choreography-entries', requireAdmin, (req, res) => {
    const payload = parseGroupChoreographyEntryPayload(req.body);

    if (!payload.seasonLabel || !payload.seasonLabelZh || !payload.organization || !payload.organizationZh || !payload.workTitle || !payload.workTitleZh) {
      return res.status(400).json({ error: 'All English and Chinese group choreography fields are required.' });
    }

    const entry = db.createGroupChoreographyEntry({
      ...payload,
      sortOrder: db.countGroupChoreographyEntries(),
    });

    return res.status(201).json({ entry: serializeGroupChoreographyEntry(entry) });
  });

  app.put('/api/admin/group-choreography-entries/:entryId', requireAdmin, (req, res) => {
    const entryId = parseIdParam(req.params.entryId);

    if (!entryId) {
      return res.status(400).json({ error: 'A valid group choreography entry id is required.' });
    }

    const payload = parseGroupChoreographyEntryPayload(req.body);

    if (!payload.seasonLabel || !payload.seasonLabelZh || !payload.organization || !payload.organizationZh || !payload.workTitle || !payload.workTitleZh) {
      return res.status(400).json({ error: 'All English and Chinese group choreography fields are required.' });
    }

    const entry = db.updateGroupChoreographyEntry({
      id: entryId,
      ...payload,
    });

    if (!entry) {
      return res.status(404).json({ error: 'Group choreography entry not found.' });
    }

    return res.json({ entry: serializeGroupChoreographyEntry(entry) });
  });

  app.delete('/api/admin/group-choreography-entries/:entryId', requireAdmin, (req, res) => {
    const entryId = parseIdParam(req.params.entryId);

    if (!entryId) {
      return res.status(400).json({ error: 'A valid group choreography entry id is required.' });
    }

    const deletedEntry = db.deleteGroupChoreographyEntry(entryId);

    if (!deletedEntry) {
      return res.status(404).json({ error: 'Group choreography entry not found.' });
    }

    db.reorderGroupChoreographyEntries(db.listGroupChoreographyEntries().map((entry) => entry.id));
    return res.json({ deletedEntryId: deletedEntry.id });
  });

  app.post('/api/admin/group-choreography-entries/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? req.body.orderedIds.map((id) => parseIdParam(id))
      : null;

    if (!orderedIds || orderedIds.some((id) => id === null)) {
      return res.status(400).json({ error: 'orderedIds must be an array of valid group choreography entry ids.' });
    }

    const currentIds = db.listGroupChoreographyEntries().map((entry) => entry.id);

    if (orderedIds.length !== currentIds.length) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current group choreography entry ids.' });
    }

    const orderedIdSet = new Set(orderedIds);

    if (orderedIdSet.size !== currentIds.length || currentIds.some((id) => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current group choreography entry ids.' });
    }

    const groupEntries = db.reorderGroupChoreographyEntries(orderedIds).map(serializeGroupChoreographyEntry);
    return res.json({ groupEntries });
  });

  app.post('/api/admin/group-choreography-moments', requireAdmin, (req, res) => {
    const payload = parseArchiveMediaItemPayload(req.body);

    if (!payload.title || !payload.titleZh || !payload.subtitle || !payload.subtitleZh || !payload.imageSrc || !payload.imageAlt || !payload.imageAltZh) {
      return res.status(400).json({ error: 'All group media labels, titles, and image fields are required.' });
    }

    const moment = db.createGroupChoreographyMoment({
      ...payload,
      sortOrder: db.countGroupChoreographyMoments(),
    });

    return res.status(201).json({ moment: serializeArchiveMediaItem(moment) });
  });

  app.put('/api/admin/group-choreography-moments/:momentId', requireAdmin, (req, res) => {
    const momentId = parseIdParam(req.params.momentId);

    if (!momentId) {
      return res.status(400).json({ error: 'A valid group choreography moment id is required.' });
    }

    const payload = parseArchiveMediaItemPayload(req.body);

    if (!payload.title || !payload.titleZh || !payload.subtitle || !payload.subtitleZh || !payload.imageSrc || !payload.imageAlt || !payload.imageAltZh) {
      return res.status(400).json({ error: 'All group media labels, titles, and image fields are required.' });
    }

    const moment = db.updateGroupChoreographyMoment({
      id: momentId,
      ...payload,
    });

    if (!moment) {
      return res.status(404).json({ error: 'Group choreography moment not found.' });
    }

    return res.json({ moment: serializeArchiveMediaItem(moment) });
  });

  app.delete('/api/admin/group-choreography-moments/:momentId', requireAdmin, (req, res) => {
    const momentId = parseIdParam(req.params.momentId);

    if (!momentId) {
      return res.status(400).json({ error: 'A valid group choreography moment id is required.' });
    }

    const deletedMoment = db.deleteGroupChoreographyMoment(momentId);

    if (!deletedMoment) {
      return res.status(404).json({ error: 'Group choreography moment not found.' });
    }

    db.reorderGroupChoreographyMoments(db.listGroupChoreographyMoments().map((entry) => entry.id));
    return res.json({ deletedMomentId: deletedMoment.id });
  });

  app.post('/api/admin/group-choreography-moments/reorder', requireAdmin, (req, res) => {
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? req.body.orderedIds.map((id) => parseIdParam(id))
      : null;

    if (!orderedIds || orderedIds.some((id) => id === null)) {
      return res.status(400).json({ error: 'orderedIds must be an array of valid group choreography moment ids.' });
    }

    const currentIds = db.listGroupChoreographyMoments().map((entry) => entry.id);

    if (orderedIds.length !== currentIds.length) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current group choreography moment ids.' });
    }

    const orderedIdSet = new Set(orderedIds);

    if (orderedIdSet.size !== currentIds.length || currentIds.some((id) => !orderedIdSet.has(id))) {
      return res.status(400).json({ error: 'orderedIds must exactly match the current group choreography moment ids.' });
    }

    const groupMoments = db.reorderGroupChoreographyMoments(orderedIds).map(serializeArchiveMediaItem);
    return res.json({ groupMoments });
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

  app.post('/api/admin/users/:userId/videos/youtube', requireAdmin, (req, res) => {
    const userId = parseIdParam(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'A valid user id is required.' });
    }

    const targetUser = db.findUserById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const title = String(req.body?.title ?? '').trim();
    const youtubeUrl = String(req.body?.youtubeUrl ?? '').trim();

    if (!title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    if (!youtubePattern.test(youtubeUrl)) {
      return res.status(400).json({ error: 'Please enter a valid YouTube link.' });
    }

    const video = db.createVideo({
      userId: targetUser.id,
      title,
      sourceType: 'youtube',
      sourceUrl: youtubeUrl,
      filePath: null,
      originalFilename: null,
      durationSeconds: null,
      fileSizeBytes: null,
      status: 'ready',
    });

    const hydratedVideo = findHydratedAdminVideo(db, video.id);

    return res.status(201).json({
      video: hydratedVideo ? serializeAdminVideo(hydratedVideo) : { ...serializeVideo(video), userId },
    });
  });

  app.post('/api/admin/users/:userId/videos/upload', requireAdmin, (req, res) => {
    upload.single('video')(req, res, async (uploadError) => {
      if (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : 'Upload failed.';
        return res.status(400).json({ error: message });
      }

      const userId = parseIdParam(req.params.userId);
      const file = req.file;

      if (!userId) {
        if (file?.path) {
          await fs.rm(file.path, { force: true }).catch(() => {});
        }
        return res.status(400).json({ error: 'A valid user id is required.' });
      }

      const targetUser = db.findUserById(userId);

      if (!targetUser) {
        if (file?.path) {
          await fs.rm(file.path, { force: true }).catch(() => {});
        }
        return res.status(404).json({ error: 'User not found.' });
      }

      const title = String(req.body?.title ?? '').trim();

      if (!title) {
        if (file?.path) {
          await fs.rm(file.path, { force: true }).catch(() => {});
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
          userId: targetUser.id,
          title,
          sourceType: 'upload',
          sourceUrl: null,
          filePath: processed.filePath,
          originalFilename: file.originalname,
          durationSeconds: processed.durationSeconds,
          fileSizeBytes: processed.fileSizeBytes,
          status: 'ready',
        });

        const hydratedVideo = findHydratedAdminVideo(db, video.id);

        return res.status(201).json({
          video: hydratedVideo ? serializeAdminVideo(hydratedVideo) : { ...serializeVideo(video), userId },
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to process the uploaded video.';
        return res.status(400).json({ error: message });
      } finally {
        await fs.rm(file.path, { force: true }).catch(() => {});
      }
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
        const processed = await processUploadedVideoFn({
          inputPath: file.path,
          originalFilename: file.originalname,
          processedVideosDirectory: config.processedVideosDirectory,
          publicVideosBasePath: config.publicVideosBasePath,
          maxVideoDurationSeconds:
            req.session.user.role === 'admin' ? null : config.maxVideoDurationSeconds,
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

  app.use(express.static(config.frontendDistDirectory));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    if (req.path.startsWith('/api/') || req.path === '/api') {
      return next();
    }

    if (req.path.startsWith(config.publicVideosBasePath)) {
      return next();
    }

    res.sendFile('index.html', { root: config.frontendDistDirectory });
  });

  return app;
}
