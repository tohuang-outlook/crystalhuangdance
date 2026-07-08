# Latest Achievement Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact homepage banner beneath the hero section that highlights the latest major achievement and links visitors to the achievements section.

**Architecture:** Create a focused `LatestAchievementBanner` component that reads from the existing `achievements` data and derives the first highlighted record. Insert that component into `HomePage.tsx` between `Hero` and `Achievements`, and add tests to verify the banner renders the latest Moscow result and links to `#distinctions`.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

### Task 1: Add the latest achievement banner component

**Files:**
- Create: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/LatestAchievementBanner.tsx`
- Modify: `/Users/tonyhuang/Documents/crystalhuangdance/src/data/siteData.ts`

- [ ] **Step 1: Reuse the existing achievement model**

Keep the `Achievement` interface unchanged and read from the existing exported `achievements` array. No duplicated latest-achievement data should be introduced in `siteData.ts`.

- [ ] **Step 2: Create the new banner component**

Create:

```tsx
import { achievements } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

export default function LatestAchievementBanner() {
  const { t } = useLanguage();
  const latestAchievement = achievements.find((achievement) => achievement.highlight) ?? achievements[0];

  if (!latestAchievement) {
    return null;
  }

  return (
    <section className="section-divider px-4 py-6 sm:px-6 lg:px-8">
      <div className="container-max">
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="eyebrow">{t('Latest Achievement', '最新成就')}</p>
              <h2 className="text-2xl leading-tight text-[var(--text)] sm:text-3xl">
                {latestAchievement.title}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                {latestAchievement.description}
              </p>
            </div>
            <a
              href="#distinctions"
              className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm uppercase tracking-[0.16em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              {t('View Achievement', '查看成就')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Localize the title and description**

If the banner needs Chinese copy, use the same title/description localization source already used by the achievements section rather than introducing conflicting duplicate copy.

### Task 2: Insert the banner into the homepage flow

**Files:**
- Modify: `/Users/tonyhuang/Documents/crystalhuangdance/src/pages/HomePage.tsx`

- [ ] **Step 1: Import the new component**

Add:

```tsx
import LatestAchievementBanner from '../components/LatestAchievementBanner';
```

- [ ] **Step 2: Place it directly below the hero**

Render it between `Hero` and `Achievements`:

```tsx
      <Hero />
      <LatestAchievementBanner />
      <Achievements />
```

### Task 3: Add focused tests for the new banner

**Files:**
- Create: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/LatestAchievementBanner.test.tsx`

- [ ] **Step 1: Add an English render test**

Create a test that verifies the banner renders:

```tsx
expect(screen.getByText(/Latest Achievement/i)).toBeInTheDocument();
expect(
  screen.getByRole('heading', {
    name: /XV Moscow International Ballet Competition — Junior Group Girls Solo First Prize & Gold Medal Winner/i,
  })
).toBeInTheDocument();
expect(screen.getByRole('link', { name: /View Achievement/i })).toHaveAttribute('href', '#distinctions');
```

- [ ] **Step 2: Add a Chinese localization test**

Wrap the component in `LanguageProvider`, switch to Chinese, and assert:

```tsx
expect(screen.getByText('最新成就')).toBeInTheDocument();
expect(screen.getByRole('link', { name: '查看成就' })).toHaveAttribute('href', '#distinctions');
```

### Task 4: Verify homepage safety

**Files:**
- Test: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/LatestAchievementBanner.test.tsx`

- [ ] **Step 1: Run the banner test file**

Run:

```bash
npm test -- LatestAchievementBanner.test.tsx --run
```

Expected: PASS with banner tests passing.

- [ ] **Step 2: Run the existing homepage-adjacent regression**

Run:

```bash
npm test -- Hero.test.tsx Achievements.test.tsx --run
```

Expected: PASS with existing hero and achievements tests unchanged.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: successful Vite production build with no TypeScript errors.
