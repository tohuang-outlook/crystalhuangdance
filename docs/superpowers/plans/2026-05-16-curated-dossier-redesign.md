# Curated Dossier Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing Crystal Huang dance portfolio into a refined bilingual curated dossier that foregrounds professional review, artistic authority, and archival clarity.

**Architecture:** Keep the current single-page React application, but move its presentation from a marketing-style portfolio to a structured editorial archive. Centralize content in `src/data/siteData.ts`, introduce component tests with Vitest and React Testing Library, and rebuild the page around a calmer app shell, a dossier-style cover frame, archive navigation, and more deliberate section hierarchy.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Vitest, React Testing Library, jsdom

---

## File Map

### Existing files to modify

- `package.json`
  Responsibility: add test scripts and dev dependencies for Vitest and React Testing Library.
- `vite.config.js`
  Responsibility: add test environment configuration for jsdom.
- `src/App.tsx`
  Responsibility: define the redesigned page order and section composition.
- `src/index.css`
  Responsibility: establish the archival palette, typography tokens, spacing utilities, and shared motion rules.
- `src/data/siteData.ts`
  Responsibility: centralize dossier content, featured distinctions, archive entry cards, media entries, contact categories, and refined bilingual labels.
- `src/components/Navbar.tsx`
  Responsibility: convert the top navigation into a quiet archive-style bar with formal labels.
- `src/components/Hero.tsx`
  Responsibility: rebuild the hero into a dossier cover frame plus identity strip.
- `src/components/About.tsx`
  Responsibility: reframe the biography and training section into `Artist Profile` plus `Training Archive`.
- `src/components/DanceStyles.tsx`
  Responsibility: reshape dance styles into `Repertoire / Artistic Range` with mixed editorial and archival presentation.
- `src/components/Achievements.tsx`
  Responsibility: split featured distinctions from the full achievement archive timeline.
- `src/components/Videos.tsx`
  Responsibility: convert the video area into `Featured Performance Reels` with more formal grouping.
- `src/components/Gallery.tsx`
  Responsibility: reduce the gallery into curated stills with better hierarchy.
- `src/components/Contact.tsx`
  Responsibility: convert contact into `Professional Inquiries` with clearer inquiry categories.
- `src/components/Footer.tsx`
  Responsibility: simplify the footer into a clean, data-like close.

### New files to create

- `src/test/setup.ts`
  Responsibility: register test helpers and DOM matchers.
- `src/App.test.tsx`
  Responsibility: verify the redesigned shell exposes dossier-first sections in English and Chinese.
- `src/components/Hero.test.tsx`
  Responsibility: verify the cover frame renders the professional identity and highest-signal credentials.
- `src/components/Achievements.test.tsx`
  Responsibility: verify highlighted distinctions and archive timeline render with the new hierarchy.

## Task 1: Add Test Infrastructure And Lock The Dossier Shell Contract

**Files:**
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Write the failing test infrastructure and shell test**

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App dossier layout', () => {
  it('renders the dossier-first sections in English by default', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /Crystal Huang/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Selected Distinctions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Artist Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Professional Inquiries/i })).toBeInTheDocument();
  });

  it('switches to Chinese dossier labels', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({ user: userEvent.setup() }));
    render(<App />);

    await user.click(screen.getByRole('button', { name: /toggle language/i }));

    expect(screen.getByRole('heading', { name: '精選榮譽' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '藝術家簡介' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '專業洽詢' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/App.test.tsx`
Expected: FAIL because the test command, jsdom setup, and redesigned headings do not exist yet.

- [ ] **Step 3: Add the minimal testing configuration**

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.8"
  }
}
```

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
```

- [ ] **Step 4: Run test to verify the tooling loads and the assertion still fails for missing redesign content**

Run: `npm test -- --runInBand src/App.test.tsx`
Expected: FAIL with missing headings such as `Selected Distinctions` until the redesign components are implemented.

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.js src/test/setup.ts src/App.test.tsx
git commit -m "test: add dossier redesign test harness"
```

## Task 2: Centralize The Dossier Content Model

**Files:**
- Modify: `src/data/siteData.ts`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing content contract assertions**

```tsx
// add to src/App.test.tsx
it('renders archive entry point labels from shared site data', () => {
  render(<App />);

  expect(screen.getByText(/Training/i)).toBeInTheDocument();
  expect(screen.getByText(/Awards/i)).toBeInTheDocument();
  expect(screen.getByText(/Repertoire/i)).toBeInTheDocument();
  expect(screen.getByText(/Media/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/App.test.tsx`
Expected: FAIL because the archive entry labels are not yet exposed by the app.

- [ ] **Step 3: Reshape `src/data/siteData.ts` into the shared dossier source**

```ts
// add near the top of src/data/siteData.ts
export interface CredentialTag {
  label: string;
  labelZh: string;
}

export interface DistinctionFeature {
  year: string;
  title: string;
  titleZh: string;
  body: string;
  bodyZh: string;
}

export interface ArchiveEntryPoint {
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  href: string;
}
```

```ts
// add to the exported config block in src/data/siteData.ts
coverIdentity: 'San Francisco Ballet School Trainee',
coverIdentityZh: '舊金山芭蕾舞學校培訓生',
coverStatement:
  'Emerging artist with elite training across ballet, contemporary, and commercial performance.',
coverStatementZh:
  '橫跨古典芭蕾、當代與商業演出的新生代舞者，具備國際級訓練背景。',
identityStrip: [
  { label: 'San Francisco Ballet School Trainee', labelZh: '舊金山芭蕾舞學校培訓生' },
  { label: 'ABT JKO School', labelZh: 'ABT JKO 學校' },
  { label: 'Prix de Lausanne Prize Winner', labelZh: '洛桑國際芭蕾舞比賽得獎者' },
  { label: 'Contemporary Dance Award', labelZh: '當代舞蹈特別獎' },
],
archiveEntryPoints: [
  {
    title: 'Training',
    titleZh: '訓練',
    description: 'Elite institutions, teachers, and formative programs.',
    descriptionZh: '菁英學校、師資與重要養成計畫。',
    href: '#profile',
  },
  {
    title: 'Awards',
    titleZh: '榮譽',
    description: 'Major distinctions and competitive milestones.',
    descriptionZh: '重要獎項與比賽里程碑。',
    href: '#distinctions',
  },
  {
    title: 'Repertoire',
    titleZh: '舞作範圍',
    description: 'Classical foundations and contemporary range.',
    descriptionZh: '古典基礎與當代延展能力。',
    href: '#range',
  },
  {
    title: 'Media',
    titleZh: '影像',
    description: 'Performance reels and curated stills.',
    descriptionZh: '精選演出影片與影像。',
    href: '#media',
  },
],
```

```ts
// add a new export in src/data/siteData.ts
export const distinctionFeatures: DistinctionFeature[] = [
  {
    year: '2025',
    title: 'T.O.P. Award — Asian American Outstanding Dancer',
    titleZh: 'T.O.P. 獎 — 亞裔美國傑出舞者',
    body: 'Recognized for artistry, discipline, and impact across major training and performance settings.',
    bodyZh: '表彰其在重要訓練與演出場域中的藝術性、紀律與影響力。',
  },
  {
    year: '2024',
    title: 'Prix de Lausanne Prize Winner',
    titleZh: '洛桑國際芭蕾舞比賽得獎者',
    body: 'One of nine dancers worldwide recognized with a scholarship at the 2024 competition.',
    bodyZh: '2024 年賽事中全球九位獲得獎學金資格的舞者之一。',
  },
  {
    year: '2024',
    title: 'Prix de Lausanne — Contemporary Dance Award',
    titleZh: '洛桑比賽 — 當代舞蹈特別獎',
    body: 'A distinction that underscores her fluency beyond classical vocabulary.',
    bodyZh: '突顯其在古典語彙之外的當代表現能力。',
  },
];
```

- [ ] **Step 4: Run test to verify the shared labels are now available for rendering**

Run: `npm test -- --runInBand src/App.test.tsx`
Expected: FAIL only on still-unimplemented component layout expectations, not on missing shared content keys.

- [ ] **Step 5: Commit**

```bash
git add src/data/siteData.ts src/App.test.tsx
git commit -m "feat: add shared dossier content model"
```

## Task 3: Rebuild The Global Visual System And App Shell

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/Footer.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Extend the failing shell test for the redesigned navigation and footer tone**

```tsx
// add to src/App.test.tsx
it('renders a formal archive navigation and professional footer copy', () => {
  render(<App />);

  expect(screen.getByRole('link', { name: /Profile/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Archive/i })).toBeInTheDocument();
  expect(screen.getByText(/curated artist archive/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/App.test.tsx`
Expected: FAIL because the current nav labels and footer copy still reflect the older marketing-style site.

- [ ] **Step 3: Implement the archival shell, palette, and typography tokens**

```css
/* replace the core theme section in src/index.css */
@layer base {
  :root {
    --bg: #11100d;
    --surface: #181714;
    --surface-soft: #211f1a;
    --text: #f3eee4;
    --text-muted: #b6afa1;
    --line: rgba(243, 238, 228, 0.12);
    --accent: #a67c52;
    --accent-strong: #6f1d1b;
  }

  html {
    scroll-behavior: smooth;
    background: var(--bg);
  }

  body {
    font-family: 'Instrument Sans', 'Inter', sans-serif;
    background:
      radial-gradient(circle at top, rgba(166, 124, 82, 0.08), transparent 32%),
      linear-gradient(180deg, #11100d 0%, #161411 48%, #0f0e0c 100%);
    color: var(--text);
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Cormorant Garamond', 'Playfair Display', serif;
    letter-spacing: 0.02em;
  }
}

@layer components {
  .section-padding {
    @apply px-4 py-24 sm:px-6 lg:px-8;
  }

  .container-max {
    @apply mx-auto max-w-7xl;
  }

  .eyebrow {
    @apply text-xs uppercase tracking-[0.28em];
    color: var(--text-muted);
  }

  .section-divider {
    border-top: 1px solid var(--line);
  }
}
```

```tsx
// src/App.tsx
export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <main>
          <Hero />
          <Achievements />
          <About />
          <DanceStyles />
          <Videos />
          <Gallery />
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
```

```tsx
// key nav label block inside src/components/Navbar.tsx
const navLinks = [
  { label: t('Profile', '簡介'), href: '#profile' },
  { label: t('Archive', '檔案'), href: '#archive' },
  { label: t('Distinctions', '榮譽'), href: '#distinctions' },
  { label: t('Media', '影像'), href: '#media' },
  { label: t('Contact', '聯絡'), href: '#contact' },
];
```

```tsx
// src/components/Footer.tsx
export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="section-divider px-4 py-8 sm:px-6 lg:px-8">
      <div className="container-max flex flex-col gap-3 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Crystal Huang.</p>
        <p>{t('Curated artist archive for professional review and inquiry.', '為專業審閱與洽詢所策劃的藝術家檔案。')}</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Run test to verify the shell assertions pass**

Run: `npm test -- --runInBand src/App.test.tsx`
Expected: PASS for navigation and footer assertions, with remaining failures limited to content sections not yet rebuilt.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/App.tsx src/components/Navbar.tsx src/components/Footer.tsx src/App.test.tsx
git commit -m "feat: add archival app shell"
```

## Task 4: Build The Cover Frame, Identity Strip, And Artist Profile Sections

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/About.tsx`
- Create: `src/components/Hero.test.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing cover-frame tests**

```tsx
// src/components/Hero.test.tsx
import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import { LanguageProvider } from '../context/LanguageContext';

describe('Hero cover frame', () => {
  it('renders the professional identity and credential strip', () => {
    render(
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    );

    expect(screen.getByText(/San Francisco Ballet School Trainee/i)).toBeInTheDocument();
    expect(screen.getByText(/ABT JKO School/i)).toBeInTheDocument();
    expect(screen.getByText(/Prix de Lausanne Prize Winner/i)).toBeInTheDocument();
  });
});
```

```tsx
// add to src/App.test.tsx
expect(screen.getByRole('heading', { name: /Artist Profile/i })).toBeInTheDocument();
expect(screen.getByRole('heading', { name: /Training Archive/i })).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/components/Hero.test.tsx src/App.test.tsx`
Expected: FAIL because the current hero does not render the dossier cover identity strip or the new profile headings.

- [ ] **Step 3: Implement the cover frame and profile architecture**

```tsx
// core content structure for src/components/Hero.tsx
<section id="home" className="section-padding pt-32">
  <div className="container-max grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
    <div className="space-y-8">
      <p className="eyebrow">{t('Curated Dossier', '策劃檔案')}</p>
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">
          {t(siteConfig.coverIdentity, siteConfig.coverIdentityZh)}
        </p>
        <h1 className="max-w-3xl text-6xl leading-none sm:text-7xl lg:text-8xl">{siteConfig.name}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">
          {t(siteConfig.coverStatement, siteConfig.coverStatementZh)}
        </p>
      </div>
      <div className="flex flex-wrap gap-3 border-t border-[var(--line)] pt-5">
        {siteConfig.identityStrip.map((item) => (
          <span key={item.label} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {t(item.label, item.labelZh)}
          </span>
        ))}
      </div>
    </div>
    <div className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]">
      <img src="/crystal-hero.jpg" alt="Crystal Huang cover portrait" className="h-[34rem] w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#11100d]/40 to-transparent" />
    </div>
  </div>
</section>
```

```tsx
// core section structure for src/components/About.tsx
<section id="profile" className="section-padding section-divider">
  <div className="container-max grid gap-16 lg:grid-cols-[0.95fr_1.05fr]">
    <div className="space-y-6">
      <p className="eyebrow">{t('Artist Profile', '藝術家簡介')}</p>
      <h2 className="text-4xl sm:text-5xl">{t('Artist Profile', '藝術家簡介')}</h2>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="max-w-xl text-base leading-8 text-[var(--text-muted)]">{paragraph}</p>
      ))}
    </div>
    <div id="archive" className="space-y-6">
      <p className="eyebrow">{t('Training Archive', '訓練檔案')}</p>
      <h2 className="text-4xl sm:text-5xl">{t('Training Archive', '訓練檔案')}</h2>
      <div className="space-y-4">
        {trainingTimeline.map((training) => (
          <article key={`${training.period}-${training.school}`} className="grid gap-2 border-t border-[var(--line)] py-4 sm:grid-cols-[11rem_1fr]">
            <p className="text-sm uppercase tracking-[0.14em] text-[var(--text-muted)]">{training.period}</p>
            <div className="space-y-1">
              <h3 className="text-lg text-[var(--text)]">{training.school}</h3>
              <p className="text-sm leading-6 text-[var(--text-muted)]">{training.teachers}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Run test to verify the cover frame and profile sections pass**

Run: `npm test -- --runInBand src/components/Hero.test.tsx src/App.test.tsx`
Expected: PASS for the new hero credential strip and profile/training headings.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.tsx src/components/About.tsx src/components/Hero.test.tsx src/App.test.tsx
git commit -m "feat: add dossier cover frame and profile archive"
```

## Task 5: Rebuild Distinctions, Artistic Range, Media, Gallery, And Contact

**Files:**
- Modify: `src/components/Achievements.tsx`
- Modify: `src/components/DanceStyles.tsx`
- Modify: `src/components/Videos.tsx`
- Modify: `src/components/Gallery.tsx`
- Modify: `src/components/Contact.tsx`
- Create: `src/components/Achievements.test.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing section hierarchy tests**

```tsx
// src/components/Achievements.test.tsx
import { render, screen } from '@testing-library/react';
import Achievements from './Achievements';
import { LanguageProvider } from '../context/LanguageContext';

describe('Achievements dossier hierarchy', () => {
  it('renders selected distinctions above the archive timeline', () => {
    render(
      <LanguageProvider>
        <Achievements />
      </LanguageProvider>
    );

    expect(screen.getByRole('heading', { name: /Selected Distinctions/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Archive Timeline/i })).toBeInTheDocument();
    expect(screen.getByText(/Prix de Lausanne Prize Winner/i)).toBeInTheDocument();
  });
});
```

```tsx
// add to src/App.test.tsx
expect(screen.getByRole('heading', { name: /Artistic Range/i })).toBeInTheDocument();
expect(screen.getByRole('heading', { name: /Featured Performance Reels/i })).toBeInTheDocument();
expect(screen.getByRole('heading', { name: /Curated Stills/i })).toBeInTheDocument();
expect(screen.getByRole('heading', { name: /Professional Inquiries/i })).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand src/components/Achievements.test.tsx src/App.test.tsx`
Expected: FAIL because the existing sections still use the older labels and flatter hierarchy.

- [ ] **Step 3: Implement the dossier-style content sections**

```tsx
// core hierarchy in src/components/Achievements.tsx
<section id="distinctions" className="section-padding section-divider">
  <div className="container-max space-y-16">
    <div className="space-y-4">
      <p className="eyebrow">{t('Selected Distinctions', '精選榮譽')}</p>
      <h2 className="text-4xl sm:text-5xl">{t('Selected Distinctions', '精選榮譽')}</h2>
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      {distinctionFeatures.map((item) => (
        <article key={item.title} className="min-h-[18rem] border border-[var(--line)] bg-[var(--surface)] p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--accent)]">{item.year}</p>
          <h3 className="mt-6 text-2xl leading-tight">{t(item.title, item.titleZh)}</h3>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{t(item.body, item.bodyZh)}</p>
        </article>
      ))}
    </div>
    <div className="space-y-6">
      <div className="space-y-2 border-t border-[var(--line)] pt-8">
        <p className="eyebrow">{t('Archive Timeline', '完整檔案時間線')}</p>
        <h3 className="text-3xl">{t('Archive Timeline', '完整檔案時間線')}</h3>
      </div>
      {achievements.map((achievement) => (
        <article key={`${achievement.year}-${achievement.title}`} className="grid gap-3 border-t border-[var(--line)] py-5 md:grid-cols-[7rem_1fr]">
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">{achievement.year}</p>
          <div className="space-y-2">
            <h4 className="text-lg text-[var(--text)]">{t(achievement.title, titlesZh[achievement.title] ?? achievement.title)}</h4>
            <p className="text-sm leading-7 text-[var(--text-muted)]">{t(achievement.description, descriptionsZh[achievement.title] ?? achievement.description)}</p>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
```

```tsx
// core structure in src/components/DanceStyles.tsx
<section id="range" className="section-padding section-divider">
  <div className="container-max space-y-12">
    <div className="max-w-3xl space-y-4">
      <p className="eyebrow">{t('Artistic Range', '藝術範圍')}</p>
      <h2 className="text-4xl sm:text-5xl">{t('Artistic Range', '藝術範圍')}</h2>
    </div>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-6 sm:grid-cols-2">
        {danceStyles.filter((style) => style.image).map((style) => (
          <article key={style.name} className="overflow-hidden border border-[var(--line)] bg-[var(--surface)]">
            <img src={style.image} alt={style.name} className="h-64 w-full object-cover" />
            <div className="space-y-3 p-5">
              <h3 className="text-2xl">{style.name}</h3>
              <p className="text-sm leading-7 text-[var(--text-muted)]">{t(style.description, descriptionsZh[style.name] ?? style.description)}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="eyebrow mb-4">{t('Extended Vocabulary', '延伸語彙')}</p>
        <div className="space-y-5">
          {danceStyles.filter((style) => !style.image).map((style) => (
            <article key={style.name} className="border-t border-[var(--line)] pt-4 first:border-t-0 first:pt-0">
              <h3 className="text-xl">{style.name}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{t(style.description, descriptionsZh[style.name] ?? style.description)}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
```

```tsx
// key wrapper headings in src/components/Videos.tsx, src/components/Gallery.tsx, and src/components/Contact.tsx
<h2 className="text-4xl sm:text-5xl">{t('Featured Performance Reels', '精選演出影片')}</h2>
<h2 className="text-4xl sm:text-5xl">{t('Curated Stills', '精選影像')}</h2>
<h2 className="text-4xl sm:text-5xl">{t('Professional Inquiries', '專業洽詢')}</h2>
```

```tsx
// contact select options in src/components/Contact.tsx
<option value="audition">{t('Audition / School Inquiry', '試演 / 校方洽詢')}</option>
<option value="collaboration">{t('Collaboration', '合作')}</option>
<option value="teaching">{t('Teaching / Workshop', '教學 / 工作坊')}</option>
<option value="press">{t('Press / Interview', '媒體 / 訪談')}</option>
```

- [ ] **Step 4: Run test to verify the redesigned content hierarchy passes**

Run: `npm test -- --runInBand src/components/Achievements.test.tsx src/App.test.tsx`
Expected: PASS for distinctions, artistic range, media, gallery, and professional inquiry headings.

- [ ] **Step 5: Commit**

```bash
git add src/components/Achievements.tsx src/components/DanceStyles.tsx src/components/Videos.tsx src/components/Gallery.tsx src/components/Contact.tsx src/components/Achievements.test.tsx src/App.test.tsx
git commit -m "feat: redesign dossier content sections"
```

## Task 6: Final Responsive Polish, Full Verification, And Delivery Check

**Files:**
- Modify: any files from Tasks 3-5 that need spacing, language, or responsive adjustments discovered during verification.
- Test: `src/App.test.tsx`
- Test: `src/components/Hero.test.tsx`
- Test: `src/components/Achievements.test.tsx`

- [ ] **Step 1: Add the final responsive and bilingual regression assertions**

```tsx
// add to src/App.test.tsx
it('keeps the archive entry points and professional inquiries visible in Chinese', async () => {
  const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({ user: userEvent.setup() }));
  render(<App />);

  await user.click(screen.getByRole('button', { name: /toggle language/i }));

  expect(screen.getByText('舞作範圍')).toBeInTheDocument();
  expect(screen.getByText('精選影像')).toBeInTheDocument();
  expect(screen.getByText('專業洽詢')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails when any section misses bilingual coverage**

Run: `npm test -- --runInBand src/App.test.tsx src/components/Hero.test.tsx src/components/Achievements.test.tsx`
Expected: FAIL if any of the redesigned headings or entry points are not translated and rendered correctly.

- [ ] **Step 3: Apply polish fixes discovered during verification**

```tsx
// expected kinds of final code adjustments
// src/components/Hero.tsx
<div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end xl:gap-14">
```

```tsx
// src/components/Contact.tsx
<p className="max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
  {t(
    'For auditions, collaborations, workshops, and press inquiries, please use the form below or email directly.',
    '如需試演、合作、工作坊或媒體洽詢，請使用下列表單或直接來信。'
  )}
</p>
```

```css
/* src/index.css */
@media (max-width: 640px) {
  .section-padding {
    @apply py-20;
  }
}
```

- [ ] **Step 4: Run the full verification suite**

Run: `npm test -- --runInBand`
Expected: PASS

Run: `npm run build`
Expected: PASS with a production build written to `dist/`

- [ ] **Step 5: Commit**

```bash
git add src/App.test.tsx src/components/Hero.test.tsx src/components/Achievements.test.tsx src/index.css src/components/Hero.tsx src/components/Contact.tsx src/components/Achievements.tsx src/components/DanceStyles.tsx src/components/Videos.tsx src/components/Gallery.tsx
git commit -m "feat: polish curated dossier redesign"
```

## Self-Review

### Spec coverage

- `Homepage / cover frame`: covered in Task 4.
- `Visual system / palette / typography / spacing / motion`: covered in Task 3 and finalized in Task 6.
- `Section changes`: navbar, footer, profile, archive, distinctions, range, media, gallery, and contact are covered in Tasks 3-5.
- `Testing and acceptance criteria`: covered by the new Vitest suite and final build verification in Task 6.

### Placeholder scan

- No `TBD`, `TODO`, or deferred phrases remain.
- Every task includes explicit file paths, code snippets, commands, and expected outcomes.

### Type consistency

- Shared naming remains consistent across tasks: `identityStrip`, `archiveEntryPoints`, `distinctionFeatures`, `Artist Profile`, `Training Archive`, `Artistic Range`, `Featured Performance Reels`, `Curated Stills`, and `Professional Inquiries`.
- The section ids referenced by the nav and archive entry points are `#profile`, `#archive`, `#distinctions`, `#range`, `#media`, and `#contact`.
