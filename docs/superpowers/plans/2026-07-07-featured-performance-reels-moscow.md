# Featured Performance Reels Moscow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote a new July 2026 XV Moscow Ballet Competition contemporary reel into the featured left-side slot and keep the previous featured reel available in the supporting list.

**Architecture:** Keep the existing `videos` array in `src/components/Videos.tsx` as the single source of truth. Add one new Moscow entry, move the `featured` flag to it, and adjust the component test to validate the new primary reel without changing the section layout logic.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

### Task 1: Add the new Moscow featured reel

**Files:**
- Modify: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/Videos.tsx`

- [ ] **Step 1: Add the new reel entry**

Insert a new `Video` object near the top of the `videos` array:

```ts
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
    featured: true,
  },
```

- [ ] **Step 2: Remove the previous featured flag**

Change the Prix de Lausanne entry so it no longer includes:

```ts
featured: true,
```

- [ ] **Step 3: Verify list behavior remains intact**

Confirm the existing selectors still work:

```ts
  const featuredVideo = videos.find((video) => video.featured) ?? videos[0];
  const supportingVideos = videos.filter((video) => video.id !== featuredVideo.id);
```

No logic change is required if there is exactly one featured entry.

### Task 2: Update tests for the new featured reel

**Files:**
- Modify: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/Videos.test.tsx`

- [ ] **Step 1: Update the featured reel click target**

Change the English test to click:

```ts
screen.getByRole('button', {
  name: /XV Moscow Ballet Competition — Round 2 Contemporary/i,
})
```

- [ ] **Step 2: Update the dialog assertion**

Expect the modal dialog label to match:

```ts
screen.getByRole('dialog', {
  name: /XV Moscow Ballet Competition — Round 2 Contemporary/i,
})
```

- [ ] **Step 3: Keep the close behavior assertion**

Retain the `Escape` close verification unchanged:

```ts
await user.keyboard('{Escape}');
await waitFor(() => {
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

### Task 3: Verify the change

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
