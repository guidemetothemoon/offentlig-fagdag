# Astro Migration Design

## Goal

Migrate the offentlig-fagdag static site from vanilla HTML/CSS/JS to Astro for better developer experience (shared layouts, components) and content management (program schedule as structured data instead of hardcoded HTML).

## Architecture

```
/
├── src/
│   ├── layouts/
│   │   └── Base.astro              # Shared HTML shell (head, meta, nav, footer, global scripts)
│   ├── pages/
│   │   ├── index.astro
│   │   ├── program.astro
│   │   ├── openspace.astro
│   │   └── about.astro
│   ├── components/
│   │   ├── Header.astro            # Navigation bar + mobile toggle
│   │   ├── Footer.astro            # Footer (if extracted)
│   │   ├── ProgramTabs.astro       # Tabbed schedule view (room tabs + content)
│   │   ├── TalkCard.astro          # Single talk/session block
│   │   └── ActionCard.astro        # Index page action cards
│   ├── content/
│   │   └── program.yaml            # All schedule data: talks, speakers, rooms, times
│   └── scripts/
│       ├── animations.js           # Anime.js animations (ported from script.js)
│       ├── openspace.js            # Open space API client (fetch topics, vote, submit)
│       └── svg-components.js       # Custom SVG element definitions (from static-web/svg-components.js)
├── public/
│   ├── img/                        # All SVG/PNG/JPG assets (from static-web/img/)
│   └── theme/
│       └── off.css                 # Designsystemet generated tokens (from static-web/theme/)
├── astro.config.mjs
├── package.json
└── .github/workflows/
    ├── pages.yaml                  # Updated: install → build → deploy dist/
    └── designsystemet.yaml         # Updated: output to public/theme/
```

## Key Decisions

### Layout component (`Base.astro`)

All 4 pages currently duplicate the same `<head>`, `<header>`, and `<footer>` markup. `Base.astro` extracts this into a single layout with a `<slot />` for page content. Props: `title` (page title), `activeNav` (which nav link to highlight).

The layout includes:
- Google Fonts (IBM Plex Mono)
- Designsystemet CSS (`/theme/off.css`)
- Main stylesheet (`style.css`)
- SVG components script
- Anime.js (CDN)

### Program data (`program.yaml`)

The program schedule (currently ~1100 lines in `program.html`) is extracted into a YAML file. Structure:

```yaml
days:
  - date: "2025-06-12"
    commonSessions:
      - time: "08:30-09:00"
        title: "Registrering og kaffe"
        type: "break"
    rooms:
      - name: "Rom 1"
        id: "rom1"
        talks:
          - time: "09:30-10:15"
            title: "Talk title"
            speaker: "Speaker Name"
            org: "Organization"
            description: "Talk description..."
```

`program.astro` reads this file and loops over it to render the tabbed schedule using `ProgramTabs.astro` and `TalkCard.astro`.

### Styling

No changes to styling approach:
- `style.css` moves to `src/styles/style.css` and is imported in the layout
- Designsystemet theme (`off.css`) stays in `public/theme/` and is loaded via `<link>`
- CSS custom properties (`--ds-*`) continue to work as-is
- No Tailwind, no CSS modules, no changes to class names

### Animations

Anime.js animations stay. The current `script.js` is split by concern:
- `animations.js` — logo draw, hover effects, parallax, floating faces
- `openspace.js` — API interaction for topics/voting

Scripts are loaded per-page via `<script>` tags in each page's Astro file (not every page needs every script). Anime.js loaded via CDN as today.

### SVG Web Components

`svg-components.js` stays as-is — defines custom elements that load SVGs from `/img/`. Loaded globally in the layout.

### Open Space API

Client-side JS unchanged. The open space page calls `https://fagdag-openspace.ekstern.dev.nav.no` for topics and voting. No SSR needed — this stays a client-side interaction with localStorage for vote tracking.

### Deployment (GitHub Pages)

`pages.yaml` workflow updated:
1. Checkout
2. Setup Node.js
3. `npm ci`
4. `npm run build` (runs `astro build`)
5. Upload `dist/` as pages artifact
6. Deploy to GitHub Pages

### Designsystemet workflow

`designsystemet.yaml` updated to output built CSS to `public/theme/` instead of `static-web/theme/`. The `design-tokens/` directory stays at repo root.

## What Changes, What Doesn't

| Aspect | Before | After |
|--------|--------|-------|
| Nav/footer | Copy-pasted in 4 HTML files | Single `Header.astro` + `Footer.astro` in layout |
| Program data | ~1100 lines hardcoded HTML | `program.yaml` + `TalkCard.astro` template |
| Styling | `style.css` + design tokens | Same, just moved to `src/styles/` and `public/theme/` |
| Animations | `script.js` with Anime.js | Split into `animations.js` + `openspace.js`, same behavior |
| SVG components | `svg-components.js` custom elements | Same, loaded in layout |
| Open space | Client-side API calls | Same |
| Deploy | Upload `static-web/` | Build Astro, upload `dist/` |
| Build | None | `npm run build` → Astro static build |

## Out of Scope

- No React/Vue/Svelte — pure Astro components only
- No CMS integration
- No i18n
- No visual redesign — output should be visually identical
- No SSR — fully static output (`output: 'static'` in Astro config)
