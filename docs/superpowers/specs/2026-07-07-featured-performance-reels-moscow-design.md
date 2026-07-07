# Featured Performance Reels Moscow Update Design

## Goal

Add a new July 2026 XV Moscow Ballet Competition contemporary reel to the `Featured Performance Reels` section and promote it to the primary featured slot on the left.

## Current Context

The section is implemented in `src/components/Videos.tsx` with a local `videos` array. One item is marked `featured: true` and renders as the large left card. All other items render as supporting cards on the right.

## Proposed Change

Add one new reel entry for:

- YouTube URL: `https://www.youtube.com/watch?v=_1p3Udn_SZY`
- Event/date label: `XV Moscow Ballet Competition · July 2026`
- Title: `XV Moscow Ballet Competition — Round 2 Contemporary`

Mark this new entry as the only featured reel so it becomes the left-side primary card. The previously featured Prix de Lausanne reel remains in the array and automatically moves into the right-side supporting list.

## Thumbnail Strategy

Use the existing local image asset `public/crystal-press-moscow-vx.png` as the thumbnail for this reel. This avoids introducing a new production asset dependency and keeps the update self-contained.

## Copy Requirements

The new reel should include English and Chinese metadata, title, and short description consistent with the existing bilingual content pattern in `Videos.tsx`.

## Testing

Update the existing `Videos` component test so it does not depend on the previous featured reel title. The test should click the current featured reel by its new Moscow title and continue verifying that the modal opens and closes correctly.
