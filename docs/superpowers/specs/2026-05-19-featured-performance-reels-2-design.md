# Featured Performance Reels 2.0 Design

Date: 2026-05-19
Project: Crystal Huang professional dancer website

## Goal

Rebuild `Featured Performance Reels` into a card-based reel archive that matches the visual and interaction language of `Artistic Range`.

The current section still behaves like an older featured-video layout with one primary reel and a stack of supporting clips. The new version should feel like a disciplined dossier system: clear, modular, expandable, and consistent with the rest of the site.

## Design Direction

`Featured Performance Reels 2.0` will mirror the structural logic of `Artistic Range`.

Instead of a hero video plus side list, the section will present a grid of equal-weight reel cards. Each card represents one dance discipline and acts as an entry point into a single representative performance reel.

This creates a clean relationship between the two sections:

- `Artistic Range` shows capability and stylistic breadth
- `Featured Performance Reels` shows filmed evidence of that capability

## Section Structure

The rebuilt section will contain:

1. `Section Intro`
   - Eyebrow: `Featured Performance Reels`
   - Title: `Featured Performance Reels`
   - Supporting line:
     - English: `A curated reel archive across classical, contemporary, and commercial performance.`
     - Chinese: `依古典、當代與商業表演脈絡整理的精選演出影片檔案。`

2. `Reel Cards Grid`
   - Six equal-weight cards
   - Same general visual language as `Artistic Range`
   - Same hover behavior family already used across the site

3. `Playback Modal`
   - White title bar
   - Small uppercase meta label on the left
   - Reel title beneath the meta label
   - `Close` button on the right
   - Shared modal for local mp4 and YouTube sources

## First-Pass Card Set

The first release will include these six cards:

1. `Ballet`
2. `Contemporary`
3. `Jazz`
4. `Lyrical`
5. `Hip Hop`
6. `Musical Theatre`

Each card maps to one representative reel.

## Card Content Model

Each reel card will contain:

1. `Thumbnail`
   - Large visual thumbnail
   - First pass may use `Hero` or currently available stills
   - Later can be swapped card-by-card as better reel-specific images arrive

2. `Title`
   - Discipline name only
   - Example: `Ballet`

3. `Short Description`
   - One or two lines
   - Written as reel framing, not training biography
   - Example style:
     - `Classical variation and competition performance highlights.`
     - `Contemporary performance reel with musicality, attack, and range.`

4. `Video Cue`
   - Subtle line such as `Click to play reel`
   - Matches the interaction hint style used in other archive sections

## Modal Design

The reel modal will match the established archive modal language already used in the site.

### Header

Left side:

- Meta label in small uppercase text
- Reel title beneath it

Right side:

- `Close`

### Meta Labels

First pass labels:

1. `BALLET REEL`
2. `CONTEMPORARY REEL`
3. `JAZZ REEL`
4. `LYRICAL REEL`
5. `HIP HOP REEL`
6. `MUSICAL THEATRE REEL`

Chinese mode should render equivalent localized labels.

### Video Body

- Local mp4 reels play in the same modal body
- YouTube reels remain supported during transition
- Horizontal video fills the video frame
- Vertical video remains centered on black background

## Data Model Changes

The current `Videos.tsx` hardcoded featured/supporting structure should be replaced by a reel-card data model that is closer to the archive media system used elsewhere.

Each reel item should support:

- stable id
- discipline title
- Chinese title
- short description
- Chinese short description
- thumbnail path
- optional local `videoSrc`
- optional YouTube id
- reel meta label
- localized reel meta label

The system should support mixed local/video-provider sources without branching the UI structure.

## Interaction Rules

- Every card opens the same modal component
- Keyboard `Escape` closes modal
- Close button receives focus when modal opens
- Focus remains trapped within modal controls while open
- Clicking backdrop closes modal
- Hover motion should match the site’s existing archive card behavior

## Migration Strategy

This work should preserve current reel content while changing the presentation system.

Phase 1:

- Replace old featured/supporting layout with six-card discipline grid
- Keep mixed source support so existing YouTube reels remain usable
- Use current available stills or hero fallback for missing thumbnails

Phase 2:

- User supplies final thumbnails and representative videos per card
- Cards are updated one by one without structural rework

## Visual Consistency Requirements

The rebuilt section should align with:

- `Artistic Range` card proportions and rhythm
- archive modal styling used in `Master Class and Choreographer`
- current `Cool Stage` background and surface palette

It should not feel like an older standalone video widget inside an otherwise archival site.

## Testing Requirements

Implementation should verify:

1. six cards render correctly in desktop and mobile layouts
2. modal opens for each card
3. local mp4 and YouTube both render in modal
4. localized meta labels and titles appear correctly in English and Chinese
5. keyboard close behavior still works
6. build passes after structural replacement

## Out of Scope

This design does not yet include:

- multi-video playlists inside one reel card
- filtering by competition or year
- a second-level reel browser inside the modal
- external analytics or tracking

Those can be added later once the single-reel-per-discipline system is stable.
