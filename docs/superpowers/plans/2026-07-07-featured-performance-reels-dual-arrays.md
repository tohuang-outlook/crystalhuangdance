# Featured Performance Reels Dual Arrays Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the featured reels section into an explicit three-item left-column featured list and an unlimited right-column supporting list.

**Architecture:** Replace the current single `videos` array with two explicit arrays in `src/components/Videos.tsx`: `featuredVideos` and `supportingVideos`. Keep one shared modal by combining both arrays into a single lookup source so rendering changes do not alter playback behavior.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

### Task 1: Refactor reel data into two arrays

**Files:**
- Modify: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/Videos.tsx`

- [ ] **Step 1: Remove the old layout flag from the type**

Change the `Video` interface by deleting:

```ts
  featured?: boolean;
```

- [ ] **Step 2: Create the left-column featured array**

Replace the current leading section of the single `videos` array with a new constant:

```ts
const featuredVideos: Video[] = [
  {
    id: '_1p3Udn_SZY',
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: 'XV Moscow Ballet Competition — Round 2 Contemporary',
    titleZh: '第十五屆莫斯科國際芭蕾舞大賽 — 第二輪當代舞',
    description:
      'Crystal Huang performs her round 2 contemporary selection at the XV Moscow Ballet Competition in July 2026.',
    descriptionZh:
      'Crystal Huang 於 2026 年 7 月在第十五屆莫斯科國際芭蕾舞大賽演出第二輪當代舞作品。',
    thumbnail: '/crystal-press-moscow-vx.png',
  },
  {
    id: 'e2Z9UXevvIg',
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
  },
  {
    id: 'ckEaotosfqs',
    metaLabel: 'The Dance Awards · 2023',
    metaLabelZh: '美國舞蹈大獎賽 · 2023',
    title: 'The Dance Awards 2023 — Teen Best Dancer Winner',
    titleZh: '美國舞蹈大獎賽 2023 — 青少年最佳舞者',
    description:
      \"'Grasping Intentions' — the solo that won Crystal the Teen Female Best Dancer title at The Dance Awards Las Vegas 2023.\",
    descriptionZh:
      '「Grasping Intentions」——讓 Crystal 奪得 2023 年美國舞蹈大獎賽青少年女子最佳舞者的獨舞。',
    thumbnail: '/Grasping_intentions.jpg',
  },
];
```

- [ ] **Step 3: Create the right-column supporting array**

Move the remaining reels into:

```ts
const supportingVideos: Video[] = [
  // LCSPksYxP6U, iEl9gdOaqr8, TyUOTqG2eoY, MQqWEWPIk_4, NAx5malU5Jc, y9wIR8E-REQ, VP_aWHWiLZ8
];
```

- [ ] **Step 4: Add a merged lookup source**

Add:

```ts
  const allVideos = [...featuredVideos, ...supportingVideos];
  const activeVideoData = allVideos.find((video) => video.id === activeVideo) ?? null;
```

and remove the old single-array derived selectors.

### Task 2: Render three large cards on the left and supporting cards on the right

**Files:**
- Modify: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/Videos.tsx`

- [ ] **Step 1: Replace the single featured button with a mapped left column**

Render the left side using:

```tsx
          <div className="space-y-6">
            {featuredVideos.map((video, index) => (
              <button
                key={video.id}
                type="button"
                className="group relative overflow-hidden border border-[var(--line)] bg-[var(--surface)] text-left"
                onClick={() => setActiveVideo(video.id)}
              >
                <div className="absolute left-6 top-6 z-10 rounded-full border border-[var(--line)] bg-[rgba(250,247,242,0.78)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {index === 0 ? t('Featured Reel', '精選主片') : t('Featured Reel', '精選主片')}
                </div>
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(250,247,242,0.48)] bg-[rgba(74,55,40,0.48)] text-[var(--bg)] transition-transform duration-300 group-hover:scale-105">
                      <Play size={30} className="ml-1 fill-current" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(74,55,40,0.76)] via-transparent to-transparent" />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-2xl text-[var(--text)]">{t(video.title, video.titleZh)}</h3>
                  <p className="max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                    {t(video.description, video.descriptionZh)}
                  </p>
                </div>
              </button>
            ))}
          </div>
```

- [ ] **Step 2: Keep the right column mapped from `supportingVideos`**

Preserve the existing small-card structure, but map `supportingVideos` directly.

- [ ] **Step 3: Keep the modal unchanged except for the new lookup source**

Do not change player behavior, iframe behavior, or local `videoSrc` handling.

### Task 3: Update tests for the dual-array layout

**Files:**
- Modify: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/Videos.test.tsx`

- [ ] **Step 1: Keep the English modal open/close test for a featured reel**

Continue using:

```ts
screen.getByRole('button', {
  name: /XV Moscow Ballet Competition — Round 2 Contemporary/i,
})
```

- [ ] **Step 2: Change the Chinese-mode click target to a supporting reel**

Update the second test to click:

```ts
screen.getByRole('button', {
  name: /2024 YoungArts — 芭蕾傑出得獎者/i,
})
```

Then assert:

```ts
expect(screen.getByRole('button', { name: '關閉' })).toBeInTheDocument();
```

- [ ] **Step 3: Verify the supporting reel modal title**

Add:

```ts
expect(
  screen.getByRole('dialog', {
    name: /2024 YoungArts — 芭蕾傑出得獎者/i,
  })
).toBeInTheDocument();
```

### Task 4: Verify the production build

**Files:**
- Test: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/Videos.test.tsx`

- [ ] **Step 1: Run the focused test file**

Run:

```bash
npm test -- Videos.test.tsx
```

Expected: PASS with both `Videos modal` tests passing.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: successful Vite production build with no TypeScript errors.
