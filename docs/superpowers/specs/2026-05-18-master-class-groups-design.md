# Master Class And Groups Choreography Design

## Goal

Replace the current gallery-style section with a dossier-style archive that better reflects Crystal Huang's professional master class history, choreographer training, and group choreography credits.

The section should support two use cases at the same time:

1. Professional review by schools, companies, adjudicators, and choreographers
2. Portfolio-style browsing with visual proof through photos and videos

The result should feel like a continuation of the site's existing archive language rather than a generic media gallery.

## Primary Direction

The section will become a two-part archive:

1. `Master Class and Choreographer`
2. `Groups Choreography`

The first part emphasizes formal training records and master class participation, followed by selected visual moments. The second part isolates group choreography credits so they read as professional performance history instead of miscellaneous gallery content.

## Section Structure

### 1. Master Class and Choreographer

This becomes the main replacement for the current `Curated Stills` section.

It will contain:

1. A short intro paragraph explaining that the section documents master classes, choreographic guidance, and formative artistic development
2. An `Archive Timeline` listing master class experiences in chronological order
3. A `Selected Master Class Moments` area showing curated photos and videos from those experiences

This section should feel like an archival training record with visual supporting evidence underneath.

### 2. Groups Choreography

This becomes a second subsection beneath the master class archive.

It will contain:

1. A concise credits-style list of group choreography work
2. A future-ready `Featured Group Works` media area that can be added when photo or video assets are provided

For the first implementation, the credits list is required and the media area is optional depending on provided assets.

## Titles And Labels

### Main section titles

- `Master Class and Choreographer`
- `Groups Choreography`

### Supporting labels

- `Archive Timeline`
- `Selected Master Class Moments`
- `Featured Group Works`

### Chinese labels

- `大師課與編舞指導`
- `群體編舞作品`
- `完整檔案時間線`
- `精選大師課片段`
- `精選群舞作品`

These names should replace the old `Curated Stills / 精選影像` language everywhere the section is represented in UI and tests.

## Information Architecture

### Master class timeline format

Each entry should follow a simple dossier layout:

1. Date or date range on the left
2. Event title on the right
3. City and state directly below the title

Example pattern:

- `March 2026`
- `Ballet Master Class at YAGP`
- `San Francisco, CA`

This should visually align with the site's existing archive/timeline language used elsewhere.

### Group choreography format

Each credit should follow a compact two-line or two-column archive format:

- `2024/25`
- `ABT School — Synergy`

- `2024/25`
- `Yoko's Dance — Yearning Heart`

This should read like a clean credits archive rather than a card-heavy gallery.

## Media Presentation

### Selected Master Class Moments

Photos and videos should be presented as cards below the master class timeline.

Each card may be:

1. Photo only
2. Video only
3. Photo thumbnail with click-to-play video behavior if a video exists

The interaction should match the existing `Artistic Range` media behavior:

- hover lift
- click to open
- videos open in the same modal/lightbox-style playback treatment already used for dance style cards
- photos can open in the existing enlarged viewer pattern if needed

Each card should support:

1. A short title such as choreographer, program, or event name
2. Secondary context such as city, studio, or year

### Featured Group Works

If group choreography media is provided later, it should use the same card and modal system as `Selected Master Class Moments` for consistency.

## Navigation

The top navigation should include a dedicated tab for this archive area.

The tab label should remain aligned with the approved naming direction:

- `Master Class`
- `大師課`

It should link directly to the section anchor for the renamed gallery/archive section.

## Interaction Principles

The section should use the same interaction language as the rest of the site:

1. Hover lift for cards
2. Click to enlarge photos
3. Click to play videos in modal view
4. Keyboard accessibility for interactive cards where playback is supported

No new interaction pattern should be introduced just for this section.

## Implementation Notes

### Data model changes

The current `galleryImages` data will need to evolve from a simple curated stills list into archive-ready content that can support:

1. media type
2. title
3. subtitle or location
4. image source
5. optional video source
6. optional grouping by subsection

This should be structured so master class and group choreography entries can be managed independently.

### Component changes

The current `Gallery` component will need to be reworked into a richer archive component with:

1. section intro
2. master class timeline
3. selected media cards
4. groups choreography credits
5. optional future group media cards

The existing modal viewer patterns should be reused where possible.

### Tests

Tests should be updated to reflect:

1. the new section title
2. the new Chinese title
3. the new navigation tab
4. the updated section semantics

## Success Criteria

The redesign is successful when:

1. The old gallery no longer reads like a generic still-image section
2. The archive clearly communicates formal master class history
3. Group choreography credits are visibly separated and easier to read
4. Photos and videos feel like supporting evidence, not random media
5. The section matches the overall professional dancer dossier tone of the site

## Scope

This design covers:

1. structure
2. naming
3. layout approach
4. interaction behavior
5. data-model direction for future asset entry

This design does not yet require:

1. final data entry for all master class items
2. final data entry for all group choreography items
3. final asset mapping for every photo and video

Those will happen during implementation as assets are supplied.
