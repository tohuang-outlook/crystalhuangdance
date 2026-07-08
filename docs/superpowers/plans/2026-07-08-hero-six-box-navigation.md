# Hero Six-Box Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Hero navigation from four cards to six cards using the user-approved labels and anchor targets.

**Architecture:** Keep the Hero component data-driven through `siteConfig.archiveEntryPoints`. Update only the shared data entries and the Hero test assertions so the UI grows naturally without component-specific branching.

**Tech Stack:** React, TypeScript, Vitest, Testing Library

---

### Task 1: Update Hero navigation data

**Files:**
- Modify: `/Users/tonyhuang/Documents/crystalhuangdance/src/data/siteData.ts`

- [ ] Replace the existing four `archiveEntryPoints` entries with the approved six-box list.
- [ ] Set the hrefs to `#press`, `#archive`, `#profile`, `#styles`, `#videos`, and `#gallery` in the approved order.

### Task 2: Update Hero regression coverage

**Files:**
- Modify: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/Hero.test.tsx`

- [ ] Replace the old four-card expectations with six expectations matching the new labels.

### Task 3: Verify production safety

**Files:**
- Test: `/Users/tonyhuang/Documents/crystalhuangdance/src/components/Hero.test.tsx`

- [ ] Run `npm test -- Hero.test.tsx --run` and expect PASS.
- [ ] Run `npm run build` and expect a successful production build.
