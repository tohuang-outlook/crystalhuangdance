# Featured Performance Reels Dual Arrays Design

## Goal

Refactor the `Featured Performance Reels` section so the left column is driven by a dedicated three-item featured array and the right column is driven by a separate unlimited supporting array.

## Current Context

`src/components/Videos.tsx` currently stores all reels in one `videos` array and derives one large left-side card plus many right-side cards from that single list.

## Approved Direction

Replace the current single-list structure with two explicit arrays:

- `featuredVideos`: exactly three large-card reels for the left column
- `supportingVideos`: unlimited smaller-card reels for the right column

This removes the need for `featured: true` flags or ordering rules to determine layout placement.

## Rendering Rules

- The left column renders the three `featuredVideos` as large cards stacked vertically.
- The right column renders every `supportingVideos` item as a smaller supporting card.
- All cards remain clickable and continue opening the same video modal behavior.

## Data Flow

The modal lookup should read from a merged in-memory collection built from both arrays so playback behavior remains identical regardless of whether the clicked reel came from the left or right column.

## Scope

This change is limited to:

- `src/components/Videos.tsx`
- `src/components/Videos.test.tsx`

No other homepage section should be changed.

## Testing

Update the `Videos` component tests so they verify:

- a featured large card still opens the modal
- a supporting small card still opens the modal in Chinese mode
- modal close behavior remains intact
