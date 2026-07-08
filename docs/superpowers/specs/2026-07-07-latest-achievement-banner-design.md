# Latest Achievement Banner Design

## Goal

Add a compact `Latest Achievement` banner to the homepage so the newest major result is visible immediately beneath the hero section.

## Placement

Render the banner on the homepage between the hero section and the achievements section.

## Content Source

The banner should read from the existing `achievements` data rather than introducing duplicated copy. It should use the first highlighted achievement in the array, which is currently the 2026 XV Moscow International Ballet Competition first prize and gold medal result.

## Layout

The component should be a narrow horizontal card or strip that fits the site’s current visual language:

- soft surface card treatment
- dark text
- compact vertical padding
- clear label, headline, supporting sentence, and one CTA

## Content Structure

- Eyebrow: `Latest Achievement` / `最新成就`
- Headline: achievement title
- Body: achievement description
- CTA:
  - English: `View Achievement`
  - Chinese: `查看成就`
  - destination: `#distinctions`

## Scope

This change should stay focused to:

- a new banner component
- homepage placement
- tests needed to verify the new banner appears and links correctly

No other homepage sections should be redesigned as part of this task.
