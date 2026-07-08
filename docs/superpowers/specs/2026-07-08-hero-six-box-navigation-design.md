# Hero Six-Box Navigation Design

## Goal

Expand the homepage Hero navigation cards from four boxes to six boxes while keeping the existing visual layout style intact.

## Approved Box Mapping

The Hero card grid should render these six boxes in this order:

1. `Press Highlight` -> `#press`
2. `Archive Timeline` -> `#archive`
3. `Artist Profile` -> `#profile`
4. `Artistic Range` -> `#styles`
5. `Media` -> `#videos`
6. `Master Class and Choreographer` -> `#gallery`

## Scope

- update `archiveEntryPoints` in shared site data
- keep the current Hero card component and styling pattern
- keep the cards data-driven from `siteConfig`
- update tests that assert the Hero navigation labels

## Non-Goals

- do not redesign the Hero layout
- do not change the Hero background, typography, or spacing system
- do not rename unrelated homepage sections
