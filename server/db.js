import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const schemaPath = new URL('./sql/schema.sql', import.meta.url);
const defaultComingUpEvents = [
  {
    dateLabel: 'July 2026',
    title: 'Press Play Pro Assistant',
    location: 'Las Vegas',
    sortOrder: 0,
  },
  {
    dateLabel: 'July 2026',
    title: 'YAGP Gala',
    location: 'Beijing',
    sortOrder: 1,
  },
  {
    dateLabel: 'July-August 2026',
    title: 'AEDC Performance and Master Class',
    location: 'Shanghai / Taipei / Hong Kong',
    sortOrder: 2,
  },
];
const defaultFeaturedReels = [
  {
    placement: 'featured',
    youtubeId: '_1p3Udn_SZY',
    videoSrc: null,
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Round 2 Contemporary',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽第二輪當代舞',
    description:
      'Crystal Huang performs her round 2 contemporary selection at the XV Moscow Ballet Competition in July 2026.',
    descriptionZh:
      'Crystal Huang 於 2026 年 7 月在第十五屆莫斯科國際芭蕾舞大賽演出第二輪當代舞作品。',
    thumbnail: '/crystal-press-moscow-vx.png',
    sortOrder: 0,
  },
  {
    placement: 'featured',
    youtubeId: 'ZINiS_mTgd0',
    videoSrc: null,
    metaLabel: 'XV Moscow Ballet Competition Gala · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽晚會演出 · 2026年7月',
    title: '2026 XV Moscow International Ballet Competition Gala Performance',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽晚會演出',
    description:
      'Crystal Huang performs in the 2026 XV Moscow International Ballet Competition gala presentation.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽晚會演出中登台演出。',
    thumbnail: '/crystal-press-moscow-gala-2.png',
    sortOrder: 1,
  },
  {
    placement: 'featured',
    youtubeId: 'e2Z9UXevvIg',
    videoSrc: '/crystal-prix-de-lausanne.mp4',
    metaLabel: 'Prix de Lausanne · 2024',
    metaLabelZh: '洛桑國際芭蕾舞比賽 · 2024',
    title: 'Prix de Lausanne 2024 Contemporary Dance Award and Prize Winner',
    titleZh: '2024 洛桑國際芭蕾舞比賽當代舞特別獎與得獎者',
    description:
      "Contemporary variation that earned Crystal the Female Contemporary Dance Award at one of the world's most prestigious ballet competitions.",
    descriptionZh:
      '贏得洛桑女子當代舞蹈特別獎的演出片段，這是全球最具聲望的芭蕾舞比賽之一。',
    thumbnail: '/crystal-contemporary.jpg',
    sortOrder: 2,
  },
  {
    placement: 'supporting',
    youtubeId: 'JpP-JRj3LMw',
    videoSrc: null,
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Junior Solo Round 3 - Harlequinade Variation',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪 - Harlequinade 變奏',
    description:
      'Crystal Huang performs the Harlequinade variation in junior solo round 3 at the 2026 XV Moscow Ballet Competition.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪演出 Harlequinade 變奏。',
    thumbnail: '/crystal-press-moscow-harlequinade.png',
    sortOrder: 0,
  },
  {
    placement: 'supporting',
    youtubeId: '3i5ap93thF0',
    videoSrc: null,
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Junior Solo Round 3 - Sugar Plum Fairy Variation',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪 - 糖梅仙子變奏',
    description:
      'Crystal Huang performs the Sugar Plum Fairy variation in junior solo round 3 at the 2026 XV Moscow Ballet Competition.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪演出糖梅仙子變奏。',
    thumbnail: '/crystal-press-moscow-sugar-plum.png',
    sortOrder: 1,
  },
  {
    placement: 'supporting',
    youtubeId: 'iA3sQ5TDgu0',
    videoSrc: null,
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Junior Solo Round 1 - Gulnare Variation',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第一輪 - Gulnare 變奏',
    description:
      'Crystal Huang performs the Gulnare variation in junior solo round 1 at the 2026 XV Moscow Ballet Competition.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第一輪演出 Gulnare 變奏。',
    thumbnail: '/crystal-press-moscow-gulnare-2.png',
    sortOrder: 2,
  },
];
const defaultPressHighlights = [
  {
    source: 'XV Moscow International Ballet Competition',
    sourceZh: '第十五屆莫斯科國際芭蕾舞大賽',
    dateLabel: 'July 2026',
    dateLabelZh: '2026 年 7 月',
    title: '2026 XV Moscow Ballet Competition Award Ceremony',
    titleZh: '2026 第十五屆莫斯科芭蕾舞大賽頒獎典禮',
    description:
      'Crystal Huang 2026 XV Moscow Ballet Competition - Junior Group, Girls, Solo First Prize and Gold Medal Winner',
    descriptionZh: 'Crystal Huang 榮獲 2026 第十五屆莫斯科芭蕾舞大賽青少年女子獨舞組第一名與金牌。',
    href: 'https://www.youtube.com/shorts/uNTARMFtDm8',
    imageSrc: '/crystal-press-moscow-award-ceremony.png',
    imageAlt: 'Crystal Huang at the 2026 XV Moscow Ballet Competition award ceremony',
    imageAltZh: 'Crystal Huang 於 2026 第十五屆莫斯科芭蕾舞大賽頒獎典禮現場',
    imageHref: 'https://www.youtube.com/shorts/uNTARMFtDm8',
    sortOrder: 0,
  },
  {
    source: '2026 Moscow VX International Ballet Competition',
    sourceZh: '2026 莫斯科 VX 國際芭蕾舞大賽',
    dateLabel: 'July 2026',
    dateLabelZh: '2026 年 7 月',
    title: '2026 VX Moscow International Ballet Competition.',
    titleZh: '2026 VX 莫斯科國際芭蕾舞大賽',
    description: 'Junior Group Girls Solo 1st Prize and Gold Medal - Crystal Huang',
    descriptionZh: 'Crystal Huang 榮獲青少年女子群舞獨舞組第一名與金牌。',
    href: 'https://moscowballetcompetition.com/en/news/obyavleny-imena-pobediteley-xv-mezhdunarodnogo-konkursa-artistov-baleta-v-moskve/',
    imageSrc: '/crystal-press-moscow-vx-interview.png',
    imageAlt: 'Crystal Huang interview at the 2026 Moscow VX International Ballet Competition',
    imageAltZh: 'Crystal Huang 於 2026 Moscow VX 國際芭蕾舞大賽接受訪問',
    imageHref: 'https://www.youtube.com/watch?v=MVD2iFEuJHw',
    sortOrder: 1,
  },
  {
    source: 'Teen World of Arts Feature',
    sourceZh: 'Teen World of Arts 專訪',
    dateLabel: 'February 2024',
    dateLabelZh: '2024 年 2 月',
    title: 'Prix de Lausanne Interview',
    titleZh: '洛桑國際芭蕾舞比賽專訪',
    description:
      'Crystal Huang was featured in Teen World of Arts following her recognition at the 2024 Prix de Lausanne, where she received both Prize Winner distinction and the Contemporary Dance Award.',
    descriptionZh:
      'Crystal Huang 於 2024 年洛桑國際芭蕾舞比賽獲得 Prize Winner 與當代舞特別獎後，接受 Teen World of Arts 專訪。',
    href: 'https://teenworldarts.com/magazine/crystal-huang-prix-de-lausanne',
    imageSrc: '/crystal-press-prix.jpg',
    imageAlt: 'Crystal Huang at Prix de Lausanne',
    imageAltZh: 'Crystal Huang 於洛桑國際芭蕾舞比賽',
    imageHref: null,
    sortOrder: 2,
  },
  {
    source: 'Los Altos Town Crier',
    sourceZh: 'Los Altos Town Crier 報導',
    dateLabel: 'May 2024',
    dateLabelZh: '2024 年 5 月',
    title: 'ABT Scholarship Feature',
    titleZh: 'ABT 獎學金報導',
    description:
      'Los Altos Town Crier highlighted Crystal’s scholarship milestone with American Ballet Theatre, tracing her early studio training and rising professional trajectory.',
    descriptionZh:
      'Los Altos Town Crier 報導 Crystal 獲得 American Ballet Theatre 獎學金的重要里程碑，並回顧她早期的舞蹈訓練與持續上升的專業發展。',
    href: 'https://www.losaltosonline.com/schools/dancer-from-mv-studio-lands-scholarship-at-american-ballet-theatre/article_8a493d68-1d1e-11ef-b665-abc30a49a1d4.html',
    imageSrc: '/crystal-press-abt-scholarship.jpeg',
    imageAlt: 'Crystal Huang performing in the ABT Scholarship Feature',
    imageAltZh: 'Crystal Huang 於 ABT 獎學金報導使用照片中的演出畫面',
    imageHref: null,
    sortOrder: 3,
  },
  {
    source: 'The T.O.P. Awards',
    sourceZh: 'The T.O.P. Awards',
    dateLabel: '2025',
    dateLabelZh: '2025 年',
    title: 'Artist Spotlight',
    titleZh: '藝術家焦點',
    description:
      'The T.O.P. Awards artist page presents Crystal’s profile within its distinguished roster, spotlighting her recognition and ongoing work as a young performer.',
    descriptionZh:
      'The T.O.P. Awards 藝術家頁面將 Crystal 納入其焦點陣容，突顯她作為年輕表演者所獲得的肯定與持續發展。',
    href: 'https://www.thetopawards.com/artists/crystal-huang',
    imageSrc: '/crystal-press-artist-spotlight.png',
    imageAlt: 'Crystal Huang in the Artist Spotlight feature',
    imageAltZh: 'Crystal Huang 於 Artist Spotlight 特色報導',
    imageHref: null,
    sortOrder: 4,
  },
  {
    source: 'Pointe Magazine',
    sourceZh: 'Pointe Magazine',
    dateLabel: '2024',
    dateLabelZh: '2024 年',
    title: 'Daily Routine Feature',
    titleZh: '日常訓練特輯',
    description:
      "Pointe Magazine spotlights Crystal Huang's daily routine, offering a closer look at the structure, discipline, and training rhythm behind her development as a young ballet artist.",
    descriptionZh:
      'Pointe Magazine 聚焦 Crystal Huang 的日常訓練節奏，呈現她作為年輕芭蕾舞者在生活、紀律與養成上的細節。',
    href: 'https://pointemagazine.com/crystal-huang-daily-routine/#gsc.tab=0',
    imageSrc: '/crystal-press-daily-routine.png',
    imageAlt: 'Crystal Huang in the Daily Routine Feature',
    imageAltZh: 'Crystal Huang 於 Daily Routine Feature 報導',
    imageHref: null,
    sortOrder: 5,
  },
];
function ensureParentDirectory(filename) {
  if (filename === ':memory:') {
    return;
  }

  fs.mkdirSync(path.dirname(filename), { recursive: true });
}

function ensureColumn(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

export function createDatabase(filename) {
  ensureParentDirectory(filename);

  const db = new Database(filename);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  db.pragma('foreign_keys = ON');
  db.exec(schemaSql);

  ensureColumn(db, 'users', 'role', "TEXT NOT NULL DEFAULT 'user'");
  ensureColumn(db, 'users', 'updated_at', "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");
  ensureColumn(db, 'videos', 'original_filename', 'TEXT');
  ensureColumn(db, 'videos', 'duration_seconds', 'INTEGER');
  ensureColumn(db, 'videos', 'file_size_bytes', 'INTEGER');
  ensureColumn(db, 'videos', 'updated_at', "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");
  ensureColumn(db, 'password_reset_tokens', 'used_at', 'TEXT');

  const statements = {
    createUser: db.prepare(
      `INSERT INTO users (email, password_hash, role)
       VALUES (@email, @passwordHash, @role)
       RETURNING id, email, role`
    ),
    findUserByEmail: db.prepare(
      'SELECT id, email, role, password_hash AS passwordHash FROM users WHERE email = ?'
    ),
    findUserById: db.prepare('SELECT id, email, role FROM users WHERE id = ?'),
    setUserRoleByEmail: db.prepare(
      `UPDATE users
       SET role = @role,
           updated_at = CURRENT_TIMESTAMP
       WHERE email = @email
       RETURNING id, email, role`
    ),
    updateUserPasswordHash: db.prepare(
      `UPDATE users
       SET password_hash = @passwordHash,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @userId
       RETURNING id, email, role`
    ),
    createVideo: db.prepare(
      `INSERT INTO videos (
          user_id,
          title,
          source_type,
          source_url,
          file_path,
          original_filename,
          duration_seconds,
          file_size_bytes,
          status
        ) VALUES (
          @userId,
          @title,
          @sourceType,
          @sourceUrl,
          @filePath,
          @originalFilename,
          @durationSeconds,
          @fileSizeBytes,
          @status
        ) RETURNING
          id,
          user_id AS userId,
          title,
          source_type AS sourceType,
          source_url AS sourceUrl,
          file_path AS filePath,
          original_filename AS originalFilename,
          duration_seconds AS durationSeconds,
          file_size_bytes AS fileSizeBytes,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    listVideosByUser: db.prepare(
      `SELECT
          id,
          user_id AS userId,
          title,
          source_type AS sourceType,
          source_url AS sourceUrl,
          file_path AS filePath,
          original_filename AS originalFilename,
          duration_seconds AS durationSeconds,
          file_size_bytes AS fileSizeBytes,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM videos
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC, id DESC`
    ),
    listUsersWithUploadCounts: db.prepare(
      `SELECT
          users.id,
          users.email,
          users.role,
          users.created_at AS createdAt,
          users.updated_at AS updatedAt,
          COUNT(videos.id) AS uploadCount
       FROM users
       LEFT JOIN videos ON videos.user_id = users.id
       GROUP BY users.id
       ORDER BY datetime(users.created_at) DESC, users.id DESC`
    ),
    listAllVideosWithUploader: db.prepare(
      `SELECT
          videos.id,
          videos.user_id AS userId,
          videos.title,
          videos.source_type AS sourceType,
          videos.source_url AS sourceUrl,
          videos.file_path AS filePath,
          videos.original_filename AS originalFilename,
          videos.duration_seconds AS durationSeconds,
          videos.file_size_bytes AS fileSizeBytes,
          videos.status,
          videos.created_at AS createdAt,
          videos.updated_at AS updatedAt,
          users.id AS uploaderId,
          users.email AS uploaderEmail,
          users.role AS uploaderRole
       FROM videos
       INNER JOIN users ON users.id = videos.user_id
       ORDER BY datetime(videos.created_at) DESC, videos.id DESC`
    ),
    deleteVideoById: db.prepare(
      `DELETE FROM videos
       WHERE id = ?
       RETURNING
         id,
         user_id AS userId,
         title,
         source_type AS sourceType,
         source_url AS sourceUrl,
         file_path AS filePath,
         original_filename AS originalFilename,
         duration_seconds AS durationSeconds,
         file_size_bytes AS fileSizeBytes,
         status,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    deleteVideosByUserId: db.prepare(
      `DELETE FROM videos
       WHERE user_id = ?
       RETURNING
         id,
         user_id AS userId,
         title,
         source_type AS sourceType,
         source_url AS sourceUrl,
         file_path AS filePath,
         original_filename AS originalFilename,
         duration_seconds AS durationSeconds,
         file_size_bytes AS fileSizeBytes,
         status,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    deleteUserById: db.prepare(
      `DELETE FROM users
       WHERE id = ?
       RETURNING id, email, role`
    ),
    insertPasswordResetToken: db.prepare(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (@userId, @tokenHash, @expiresAt)
       RETURNING
         id,
         user_id AS userId,
         token_hash AS tokenHash,
         expires_at AS expiresAt,
         created_at AS createdAt,
         used_at AS usedAt`
    ),
    findPasswordResetTokenByHash: db.prepare(
      `SELECT
         id,
         user_id AS userId,
         token_hash AS tokenHash,
         expires_at AS expiresAt,
         created_at AS createdAt,
         used_at AS usedAt
       FROM password_reset_tokens
       WHERE token_hash = ?`
    ),
    deletePasswordResetTokensByUserId: db.prepare(
      'DELETE FROM password_reset_tokens WHERE user_id = ?'
    ),
    deletePasswordResetTokenById: db.prepare('DELETE FROM password_reset_tokens WHERE id = ?'),
    deleteExpiredPasswordResetTokens: db.prepare(
      'DELETE FROM password_reset_tokens WHERE expires_at <= ?'
    ),
    listComingUpEvents: db.prepare(
      `SELECT
          id,
          date_label AS dateLabel,
          title,
          location,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM coming_up_events
       ORDER BY sort_order ASC, id ASC`
    ),
    countComingUpEvents: db.prepare('SELECT COUNT(*) AS count FROM coming_up_events'),
    findComingUpEventById: db.prepare(
      `SELECT
          id,
          date_label AS dateLabel,
          title,
          location,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM coming_up_events
       WHERE id = ?`
    ),
    createComingUpEvent: db.prepare(
      `INSERT INTO coming_up_events (date_label, title, location, sort_order)
       VALUES (@dateLabel, @title, @location, @sortOrder)
       RETURNING
         id,
         date_label AS dateLabel,
         title,
         location,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    updateComingUpEvent: db.prepare(
      `UPDATE coming_up_events
       SET date_label = @dateLabel,
           title = @title,
           location = @location,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
         id,
         date_label AS dateLabel,
         title,
         location,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    deleteComingUpEvent: db.prepare(
      `DELETE FROM coming_up_events
       WHERE id = ?
       RETURNING
         id,
         date_label AS dateLabel,
         title,
         location,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    updateComingUpEventSortOrder: db.prepare(
      `UPDATE coming_up_events
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listInvestorUpdates: db.prepare(
      `SELECT
          id,
          category,
          title,
          summary,
          href,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM investor_updates
       ORDER BY
         CASE category
           WHEN 'investment-page' THEN 0
           WHEN 'monthly-reports' THEN 1
           WHEN 'real-time-quote' THEN 2
           ELSE 99
         END ASC,
         sort_order ASC,
         id ASC`
    ),
    countInvestorUpdatesByCategory: db.prepare(
      'SELECT COUNT(*) AS count FROM investor_updates WHERE category = ?'
    ),
    findInvestorUpdateById: db.prepare(
      `SELECT
          id,
          category,
          title,
          summary,
          href,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM investor_updates
       WHERE id = ?`
    ),
    createInvestorUpdate: db.prepare(
      `INSERT INTO investor_updates (category, title, summary, href, sort_order)
       VALUES (@category, @title, @summary, @href, @sortOrder)
       RETURNING
         id,
         category,
         title,
         summary,
         href,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    updateInvestorUpdate: db.prepare(
      `UPDATE investor_updates
       SET category = @category,
           title = @title,
           summary = @summary,
           href = @href,
           sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
         id,
         category,
         title,
         summary,
         href,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    deleteInvestorUpdate: db.prepare(
      `DELETE FROM investor_updates
       WHERE id = ?
       RETURNING
         id,
         category,
         title,
         summary,
         href,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    updateInvestorUpdateSortOrder: db.prepare(
      `UPDATE investor_updates
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listFeaturedReels: db.prepare(
      `SELECT
          id,
          placement,
          youtube_id AS youtubeId,
          video_src AS videoSrc,
          meta_label AS metaLabel,
          meta_label_zh AS metaLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          thumbnail,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM featured_reels
       ORDER BY
         CASE placement
           WHEN 'featured' THEN 0
           WHEN 'supporting' THEN 1
           ELSE 99
         END ASC,
         sort_order ASC,
         id ASC`
    ),
    countFeaturedReelsByPlacement: db.prepare(
      'SELECT COUNT(*) AS count FROM featured_reels WHERE placement = ?'
    ),
    findFeaturedReelById: db.prepare(
      `SELECT
          id,
          placement,
          youtube_id AS youtubeId,
          video_src AS videoSrc,
          meta_label AS metaLabel,
          meta_label_zh AS metaLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          thumbnail,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM featured_reels
       WHERE id = ?`
    ),
    createFeaturedReel: db.prepare(
      `INSERT INTO featured_reels (
          placement,
          youtube_id,
          video_src,
          meta_label,
          meta_label_zh,
          title,
          title_zh,
          description,
          description_zh,
          thumbnail,
          sort_order
        ) VALUES (
          @placement,
          @youtubeId,
          @videoSrc,
          @metaLabel,
          @metaLabelZh,
          @title,
          @titleZh,
          @description,
          @descriptionZh,
          @thumbnail,
          @sortOrder
        )
       RETURNING
          id,
          placement,
          youtube_id AS youtubeId,
          video_src AS videoSrc,
          meta_label AS metaLabel,
          meta_label_zh AS metaLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          thumbnail,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateFeaturedReel: db.prepare(
      `UPDATE featured_reels
       SET placement = @placement,
           youtube_id = @youtubeId,
           video_src = @videoSrc,
           meta_label = @metaLabel,
           meta_label_zh = @metaLabelZh,
           title = @title,
           title_zh = @titleZh,
           description = @description,
           description_zh = @descriptionZh,
           thumbnail = @thumbnail,
           sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
          id,
          placement,
          youtube_id AS youtubeId,
          video_src AS videoSrc,
          meta_label AS metaLabel,
          meta_label_zh AS metaLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          thumbnail,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    deleteFeaturedReel: db.prepare(
      `DELETE FROM featured_reels
       WHERE id = ?
       RETURNING
          id,
          placement,
          youtube_id AS youtubeId,
          video_src AS videoSrc,
          meta_label AS metaLabel,
          meta_label_zh AS metaLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          thumbnail,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateFeaturedReelSortOrder: db.prepare(
      `UPDATE featured_reels
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listPressHighlights: db.prepare(
      `SELECT
          id,
          source,
          source_zh AS sourceZh,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          href,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          image_href AS imageHref,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM press_highlights
       ORDER BY sort_order ASC, id ASC`
    ),
    countPressHighlights: db.prepare('SELECT COUNT(*) AS count FROM press_highlights'),
    findPressHighlightById: db.prepare(
      `SELECT
          id,
          source,
          source_zh AS sourceZh,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          href,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          image_href AS imageHref,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM press_highlights
       WHERE id = ?`
    ),
    createPressHighlight: db.prepare(
      `INSERT INTO press_highlights (
          source,
          source_zh,
          date_label,
          date_label_zh,
          title,
          title_zh,
          description,
          description_zh,
          href,
          image_src,
          image_alt,
          image_alt_zh,
          image_href,
          sort_order
        ) VALUES (
          @source,
          @sourceZh,
          @dateLabel,
          @dateLabelZh,
          @title,
          @titleZh,
          @description,
          @descriptionZh,
          @href,
          @imageSrc,
          @imageAlt,
          @imageAltZh,
          @imageHref,
          @sortOrder
        )
       RETURNING
          id,
          source,
          source_zh AS sourceZh,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          href,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          image_href AS imageHref,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updatePressHighlight: db.prepare(
      `UPDATE press_highlights
       SET source = @source,
           source_zh = @sourceZh,
           date_label = @dateLabel,
           date_label_zh = @dateLabelZh,
           title = @title,
           title_zh = @titleZh,
           description = @description,
           description_zh = @descriptionZh,
           href = @href,
           image_src = @imageSrc,
           image_alt = @imageAlt,
           image_alt_zh = @imageAltZh,
           image_href = @imageHref,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
          id,
          source,
          source_zh AS sourceZh,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          href,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          image_href AS imageHref,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    deletePressHighlight: db.prepare(
      `DELETE FROM press_highlights
       WHERE id = ?
       RETURNING
          id,
          source,
          source_zh AS sourceZh,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          href,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          image_href AS imageHref,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updatePressHighlightSortOrder: db.prepare(
      `UPDATE press_highlights
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
  };

  const deleteUserWithVideos = db.transaction((userId) => {
    const videos = statements.deleteVideosByUserId.all(userId);
    const user = statements.deleteUserById.get(userId);

    if (!user) {
      return null;
    }

    return { user, videos };
  });

  const replacePasswordResetToken = db.transaction(({ userId, tokenHash, expiresAt }) => {
    statements.deletePasswordResetTokensByUserId.run(userId);
    return statements.insertPasswordResetToken.get({ userId, tokenHash, expiresAt });
  });

  const resetUserPassword = db.transaction(({ userId, passwordHash }) => {
    const user = statements.updateUserPasswordHash.get({ userId, passwordHash });

    if (!user) {
      return null;
    }

    statements.deletePasswordResetTokensByUserId.run(userId);
    return user;
  });

  const reorderComingUpEvents = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateComingUpEventSortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements.listComingUpEvents.all();
  });

  const reorderInvestorUpdates = db.transaction((category, orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateInvestorUpdateSortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements
      .listInvestorUpdates
      .all()
      .filter((entry) => entry.category === category);
  });

  const reorderFeaturedReels = db.transaction((placement, orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateFeaturedReelSortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements
      .listFeaturedReels
      .all()
      .filter((entry) => entry.placement === placement);
  });

  const reorderPressHighlights = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updatePressHighlightSortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements.listPressHighlights.all();
  });

  function seedComingUpEvents() {
    const { count } = statements.countComingUpEvents.get();

    if (Number(count) > 0) {
      return;
    }

    for (const event of defaultComingUpEvents) {
      statements.createComingUpEvent.get(event);
    }
  }

  function seedFeaturedReels() {
    const featuredCount = statements.countFeaturedReelsByPlacement.get('featured');
    const supportingCount = statements.countFeaturedReelsByPlacement.get('supporting');

    if (Number(featuredCount.count) + Number(supportingCount.count) > 0) {
      return;
    }

    for (const reel of defaultFeaturedReels) {
      statements.createFeaturedReel.get(reel);
    }
  }

  function seedPressHighlights() {
    const { count } = statements.countPressHighlights.get();

    if (Number(count) > 0) {
      return;
    }

    for (const highlight of defaultPressHighlights) {
      statements.createPressHighlight.get(highlight);
    }
  }

  seedComingUpEvents();
  seedFeaturedReels();
  seedPressHighlights();

  return {
    raw: db,
    createUser({ email, passwordHash, role = 'user' }) {
      return statements.createUser.get({ email, passwordHash, role });
    },
    findUserByEmail(email) {
      return statements.findUserByEmail.get(email) ?? null;
    },
    findUserById(id) {
      return statements.findUserById.get(id) ?? null;
    },
    setUserRoleByEmail(email, role) {
      return statements.setUserRoleByEmail.get({ email, role }) ?? null;
    },
    createPasswordResetToken(passwordResetToken) {
      return replacePasswordResetToken(passwordResetToken);
    },
    findPasswordResetTokenByHash(tokenHash) {
      return statements.findPasswordResetTokenByHash.get(tokenHash) ?? null;
    },
    deletePasswordResetTokenById(tokenId) {
      statements.deletePasswordResetTokenById.run(tokenId);
    },
    deleteExpiredPasswordResetTokens(expiresAt) {
      statements.deleteExpiredPasswordResetTokens.run(expiresAt);
    },
    resetUserPassword(resetRequest) {
      return resetUserPassword(resetRequest);
    },
    createVideo(video) {
      return statements.createVideo.get(video);
    },
    listVideosByUser(userId) {
      return statements.listVideosByUser.all(userId);
    },
    listUsersWithUploadCounts() {
      return statements.listUsersWithUploadCounts.all().map((user) => ({
        ...user,
        uploadCount: Number(user.uploadCount),
      }));
    },
    listAllVideosWithUploader() {
      return statements.listAllVideosWithUploader.all();
    },
    deleteVideoById(videoId) {
      return statements.deleteVideoById.get(videoId) ?? null;
    },
    deleteUserWithVideos(userId) {
      return deleteUserWithVideos(userId);
    },
    listComingUpEvents() {
      return statements.listComingUpEvents.all();
    },
    findComingUpEventById(id) {
      return statements.findComingUpEventById.get(id) ?? null;
    },
    createComingUpEvent(event) {
      return statements.createComingUpEvent.get(event);
    },
    updateComingUpEvent(event) {
      return statements.updateComingUpEvent.get(event) ?? null;
    },
    deleteComingUpEvent(eventId) {
      return statements.deleteComingUpEvent.get(eventId) ?? null;
    },
    reorderComingUpEvents(orderedIds) {
      return reorderComingUpEvents(orderedIds);
    },
    listInvestorUpdates() {
      return statements.listInvestorUpdates.all();
    },
    countInvestorUpdatesByCategory(category) {
      const { count } = statements.countInvestorUpdatesByCategory.get(category);
      return Number(count);
    },
    findInvestorUpdateById(id) {
      return statements.findInvestorUpdateById.get(id) ?? null;
    },
    createInvestorUpdate(update) {
      return statements.createInvestorUpdate.get(update);
    },
    updateInvestorUpdate(update) {
      return statements.updateInvestorUpdate.get(update) ?? null;
    },
    deleteInvestorUpdate(updateId) {
      return statements.deleteInvestorUpdate.get(updateId) ?? null;
    },
    reorderInvestorUpdates(category, orderedIds) {
      return reorderInvestorUpdates(category, orderedIds);
    },
    listFeaturedReels() {
      return statements.listFeaturedReels.all();
    },
    countFeaturedReelsByPlacement(placement) {
      const { count } = statements.countFeaturedReelsByPlacement.get(placement);
      return Number(count);
    },
    findFeaturedReelById(id) {
      return statements.findFeaturedReelById.get(id) ?? null;
    },
    createFeaturedReel(reel) {
      return statements.createFeaturedReel.get(reel);
    },
    updateFeaturedReel(reel) {
      return statements.updateFeaturedReel.get(reel) ?? null;
    },
    deleteFeaturedReel(reelId) {
      return statements.deleteFeaturedReel.get(reelId) ?? null;
    },
    reorderFeaturedReels(placement, orderedIds) {
      return reorderFeaturedReels(placement, orderedIds);
    },
    listPressHighlights() {
      return statements.listPressHighlights.all();
    },
    countPressHighlights() {
      const { count } = statements.countPressHighlights.get();
      return Number(count);
    },
    findPressHighlightById(id) {
      return statements.findPressHighlightById.get(id) ?? null;
    },
    createPressHighlight(highlight) {
      return statements.createPressHighlight.get(highlight);
    },
    updatePressHighlight(highlight) {
      return statements.updatePressHighlight.get(highlight) ?? null;
    },
    deletePressHighlight(highlightId) {
      return statements.deletePressHighlight.get(highlightId) ?? null;
    },
    reorderPressHighlights(orderedIds) {
      return reorderPressHighlights(orderedIds);
    },
    close() {
      db.close();
    },
  };
}
