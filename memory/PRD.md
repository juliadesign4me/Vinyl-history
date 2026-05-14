# Vinyl Player — PRD

## Original Problem Statement
Build a responsive 1-page interactive vinyl player web app. The user can drag a
tonearm onto a vinyl record to start playing music. The UI includes a slider to
switch between 4 different musical eras (1940s, 1970s, 2000s, 2020s), each
updating the background, tonearm, and vinyl graphics. The app is fully
responsive (desktop & mobile portrait) using CSS container queries. The vinyl
spinning triggers 30-second YouTube previews per era, auto-rotating through 4
tracks per era.

User language: **Ukrainian**.

## Architecture
- Frontend-only React app (no backend usage required for the player itself).
- `/app/frontend/src/App.js` — single-component implementation (≈900 lines).
- `/app/frontend/src/App.css` — keyframe animations (vinyl-flip, vinyl-spin).
- YouTube IFrame API loaded via `<script>` in `public/index.html`.

## Implemented (✓)
- Desktop & mobile responsive stage with `cqw` and aspect-ratio container.
- Custom slider (vertical desktop, horizontal mobile) with 4 snap ticks.
- Pointer-event tonearm drag with pivot math; angle ≥ 30° → vinyl spins.
- Vinyl 3D flip entrance animation on era switch.
- Era-specific assets: backgrounds, vinyls, tonearms (desktop + mobile sets).
- YouTube IFrame API integration — hidden audio player.
- 30-second auto-rotation through 4 tracks per era, random pick.
- All four eras now play English chart-toppers (verified embeddable via
  yt-dlp `playable_in_embed=true`):
  - **1940s** (era 0): Frank Sinatra, Ella & Louis, Andrews Sisters, Billie Holiday
  - **1970s** (era 1): Queen, ABBA, Bee Gees, Donna Summer
  - **2000s** (era 2): Britney Spears, Eminem, OutKast, Coldplay
  - **2020s** (era 3): The Weeknd, Dua Lipa, Olivia Rodrigo, Harry Styles

## Verification
- yt-dlp confirmed all 12 new IDs are `playable_in_embed=true`.
- End-to-end Playwright test confirmed `loadVideoById` is called with the
  expected videoId per era after dragging slider thumb + tonearm.

## Roadmap / Backlog
- **P2** — refactor App.js (~900 lines) into smaller components: `Stage`,
  `Tonearm`, `Slider`, `EraAssets`, `YouTubePlayer`.
- **P2** — visible "now playing" badge with current track title (improves UX
  and testability).
- **P3** — keyboard accessibility for the slider (arrow keys to switch era).
- **P3** — fade-in / fade-out on track changes.

## Files of Reference
- `/app/frontend/src/App.js` — main file
- `/app/frontend/src/App.css` — animations
- `/app/frontend/public/index.html` — YT API script tag
- `/app/frontend/public/assets/` — era artwork

## No backend, no auth, no third-party keys required.
