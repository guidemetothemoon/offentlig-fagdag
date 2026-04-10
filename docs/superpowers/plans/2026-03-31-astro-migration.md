# Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the offentlig-fagdag static site from vanilla HTML/CSS/JS to Astro for component reuse and data-driven program schedule.

**Architecture:** Astro static site with a shared `Base.astro` layout, 4 page files, reusable components for header/footer/schedule, and program data in YAML. Client-side JS (Anime.js, open space API, SVG web components) carried over as `<script>` tags. Deployed to GitHub Pages via updated workflow.

**Tech Stack:** Astro 5.x, YAML (program data), existing CSS + Designsystemet tokens, Anime.js (CDN)

---

## File Structure

```
src/
├── layouts/
│   └── Base.astro              # Shared <html>, <head>, <header>, <footer>
├── pages/
│   ├── index.astro             # Landing page
│   ├── program.astro           # Schedule page (data-driven)
│   ├── openspace.astro         # Open space voting page
│   └── about.astro             # About page
├── components/
│   ├── Header.astro            # Nav bar + mobile toggle + logo SVG
│   ├── Footer.astro            # Footer with logo + kattekopp icon
│   ├── TalkCard.astro          # Single talk card (org, title, speaker, desc, track)
│   └── ScheduleBlock.astro     # Time slot wrapper (time + talks or event label)
├── data/
│   └── program.yaml            # All schedule data
├── scripts/
│   ├── animations.js           # Anime.js animations (from script.js)
│   ├── openspace.js            # Open space API client (from inline <script>)
│   └── svg-components.js       # Custom SVG elements (from static-web/svg-components.js)
└── styles/
    └── style.css               # Main stylesheet (from static-web/style.css)

public/
├── img/                        # All images (from static-web/img/)
└── theme/
    └── off.css                 # Designsystemet tokens (from static-web/theme/)

astro.config.mjs                # Astro config with GitHub Pages site URL
package.json                    # Astro + yaml loader dependency
.github/workflows/
├── pages.yaml                  # Updated: build Astro, deploy dist/
└── designsystemet.yaml         # Updated: output to public/theme/
```

---

### Task 1: Initialize Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "offentlig-fagdag",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

The `site` must match the GitHub Pages URL. The `base` is the repo name (for project-site deploys under `username.github.io/repo-name/`). Check the current GitHub Pages URL — the repo is `offentlig-paas/offentlig-fagdag`, but it likely has a custom domain or uses the org pages URL. If unclear, use `base: '/offentlig-fagdag/'` as a safe default.

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://offentlig-paas.github.io',
  base: '/offentlig-fagdag',
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`

- [ ] **Step 5: Create directory structure**

Run:
```bash
mkdir -p src/layouts src/pages src/components src/data src/scripts src/styles public/img public/theme
```

---

### Task 2: Move static assets

**Files:**
- Move: `static-web/img/*` → `public/img/`
- Move: `static-web/theme/*` → `public/theme/`
- Move: `static-web/style.css` → `src/styles/style.css`
- Move: `static-web/svg-components.js` → `src/scripts/svg-components.js`
- Move: `static-web/script.js` → `src/scripts/animations.js`

- [ ] **Step 1: Copy images to `public/img/`**

Run:
```bash
cp static-web/img/* public/img/
```

- [ ] **Step 2: Copy theme to `public/theme/`**

Run:
```bash
cp static-web/theme/* public/theme/
```

- [ ] **Step 3: Copy CSS**

Run:
```bash
cp static-web/style.css src/styles/style.css
```

- [ ] **Step 4: Copy svg-components.js**

Run:
```bash
cp static-web/svg-components.js src/scripts/svg-components.js
```

- [ ] **Step 5: Copy script.js as animations.js**

Run:
```bash
cp static-web/script.js src/scripts/animations.js
```

- [ ] **Step 6: Fix SVG component paths**

In `src/scripts/svg-components.js`, the `loadSvg()` calls use relative paths like `"img/man7.svg"`. In Astro, public assets are served from root, so these need to become absolute paths prefixed with the base path. Update each `loadSvg()` call:

Change every `this.loadSvg("img/` to `this.loadSvg("/offentlig-fagdag/img/` in `src/scripts/svg-components.js`.

Alternatively, if the base path might change, keep relative paths — they'll resolve relative to the page URL. Since all pages are at the root level (`/offentlig-fagdag/`, `/offentlig-fagdag/program/`, etc.), relative paths like `img/foo.svg` won't consistently work. Use absolute paths with the base.

---

### Task 3: Create Header and Footer components

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/Header.astro`**

Extract the header that's duplicated in all 4 pages. Accept an `activeNav` prop to highlight the current page.

```astro
---
interface Props {
  activeNav?: 'program' | 'openspace' | 'about';
}

const { activeNav } = Astro.props;
const base = import.meta.env.BASE_URL;
---

<header class="fixed-width">
  <div class="off-banner" data-color-scheme="light">
    <a href={`${base}`} class="off-logo" aria-label="OFF">
      <svg class="off-logo-svg" viewBox="0 0 108 42" xmlns="http://www.w3.org/2000/svg">
        <text class="off-logo-stroke" x="54" y="32" text-anchor="middle">[OFF]</text>
        <text class="off-logo-fill" x="54" y="32" text-anchor="middle">[OFF]</text>
      </svg>
    </a>
    <span class="off-title">Offentlig fagdag</span>
  </div>
  <button class="nav-toggle" aria-label="Meny" aria-expanded="false">&#9776;</button>
  <nav>
    <a class="ds-button off-button" data-variant="secondary" href={`${base}program`}>Program</a>
    <a class="ds-button off-button" data-variant="secondary" href={`${base}openspace`}>Open Space</a>
    <a class="ds-button off-button" data-variant="secondary" href={`${base}about`}>Om fagdagen</a>
  </nav>
</header>
```

Note: The original uses `.html` extensions in links (e.g., `program.html`). Astro generates clean URLs by default (`/program/` → `index.html`). The nav links should use the clean URL form. If you want to keep `.html` extensions, set `build.format: 'file'` in `astro.config.mjs` and use `href={`${base}program.html`}` instead.

- [ ] **Step 2: Create `src/components/Footer.astro`**

```astro
<footer data-color-scheme="dark">
  <div class="fixed-width information">
    <div>
      <div class="off-banner" data-color-scheme="light">
        <span data-size="xs" class="off-logo">[OFF]</span>
      </div>
      <p data-size="sm">2026 Offentlig fagdag. Laget med ❤️ av frivillige i offentlig sektor.</p>
    </div>
    <icon-kattekopp aria-label="ikon av en kattekopp"></icon-kattekopp>
  </div>
</footer>
```

---

### Task 4: Create Base layout

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Create `src/layouts/Base.astro`**

This extracts the shared `<html>`, `<head>`, header, and footer wrapper from all pages.

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/style.css';

interface Props {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  activeNav?: 'program' | 'openspace' | 'about';
  bodyClass?: string;
  bodyColorScheme?: string;
  bodyColor?: string;
}

const {
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage = '/offentlig-fagdag/img/sharing.jpg',
  activeNav,
  bodyClass,
  bodyColorScheme = 'light',
  bodyColor = 'accent',
} = Astro.props;
---

<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {description && <meta name="description" content={description} />}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
    rel="stylesheet">
  <link rel="stylesheet" href="/offentlig-fagdag/theme/off.css">
  <link rel="stylesheet" href="https://unpkg.com/@digdir/designsystemet-css@1.11.0/dist/src/index.css"
    integrity="sha384-iQVX/eRD/62k5h5Q6ZYkiN2gavfLDZJUu5EudKV0DcTIKhkXbfWUgbas+JkoxIAg" crossorigin="anonymous">
  <script src="/offentlig-fagdag/svg-components.js" defer is:inline></script>
  <script src="https://cdn.jsdelivr.net/npm/animejs/dist/bundles/anime.umd.min.js" defer is:inline></script>
  <title>{title}</title>
  {ogTitle && <meta property="og:title" content={ogTitle} />}
  {ogDescription && <meta property="og:description" content={ogDescription} />}
  {ogImage && <meta property="og:image" content={ogImage} />}
</head>
<body data-color-scheme={bodyColorScheme} data-color={bodyColor} class={bodyClass}>
  <Header activeNav={activeNav} />
  <slot />
  <Footer />
  <slot name="scripts" />
</body>
</html>
```

**Important Astro notes:**
- `is:inline` on `<script>` tags tells Astro NOT to bundle them — they load from the URL as-is (needed for CDN scripts and the svg-components that use runtime `fetch`).
- The CSS import `import '../styles/style.css'` tells Astro to process and include it in the build.
- The svg-components.js script path needs to point to where we place it. Since it uses `fetch()` for SVGs, it should be in `public/` so it's served as-is. Copy it to `public/svg-components.js` instead of `src/scripts/`.

**Correction to Task 2:** Move `svg-components.js` to `public/svg-components.js` (not `src/scripts/`), since it needs to be loaded as a plain script that does runtime `fetch()` calls. The `src/scripts/` copy is not needed.

---

### Task 5: Create the index page

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/pages/index.astro`**

Port the content from `static-web/index.html` into the layout. The `<main>` content goes in the default slot.

```astro
---
import Base from '../layouts/Base.astro';
---

<Base
  title="Offentlig fagdag 2026"
  description="Offentlig fagdag 2026, Konferansen for teknologer i offentlig sektor"
  ogTitle="Offentlig fagdag 2026"
  ogDescription="Konferansen for teknologer i offentlig sektor"
>
  <main>
    <div class="fixed-width hero">
      <icon-pc></icon-pc>
      <div class="hero-text">
        <h1 class="ds-heading" data-size="xxl">Offentlig fagdag 2026</h1>
        <h2 class="ds-heading" data-size="lg">Konferansen for teknologer i offentlig sektor</h2>
      </div>
      <h3 class="ds-heading off-tint hero-where" data-size="md">23. april på <a class="ds-link" href="https://meet-ullevaal.no">Meet Ullevål</a></h3>
    </div>
    <div class="fixed-width action-cards">
      <div class="ds-card action-card">
        <div class="action-icon">
          <icon-kaffekoppenkel></icon-kaffekoppenkel>
        </div>
        <div class="action-description">
          <p class="ds-heading" data-size="md">Påmelding er stengt</p>
          <p class="ds-paragraph">Vi er nå fullbooket!</p>
        </div>
      </div>
      <div class="ds-card action-card">
        <div class="action-icon">
          <icon-mikrofon></icon-mikrofon>
        </div>
        <div class="action-description">
          <a class="ds-link ds-heading" data-size="sm"
            href="https://docs.google.com/forms/d/e/1FAIpQLSdRJRd7h4xbEpX-xh7UdE2CxdTQqnLJrOToifoSQUC_nI70bw/viewform?usp=sharing&ouid=107058326216933342350">Jeg
            vil melde meg på venteliste for å holde foredrag</a>
          <p class="ds-paragraph" data-size="sm">Programmet er satt, men du kan melde interesse for neste gang.</p>
        </div>
      </div>
    </div>
    <div class="bleed">
      <div class="bg-tinted">
        <section class="info-section">
          <icon-man7 aria-label="ikon av mann som sprudler"></icon-man7>
          <div class="info-section-text">
            <h2 class="ds-heading" data-size="lg">Sosialt på Brygg klokken 17:30</h2>
            <p class="ds-paragraph" data-size="lg">Etter en lang dag på konferanse er det godt med noe mat og kaldt i glasset. Her vil det også være mulig å kjøpe mat. Bli med på sosialisering på <a class="ds-link" href="https://brygg.no/">Brygg</a>. Kl 17:20 blir det felles avreise, for de som ønsker det. Vi møtes ved trappa rett utenfor hovedinngangen.</p>
          </div>
        </section>
      </div>
      <div id="program">
        <section class="info-section">
          <div class="info-section-text">
            <h2 class="ds-heading" data-size="lg">Program</h2>
            <p class="ds-paragraph" data-size="lg">Programmet for dagen er klart! Vi har over 30 foredrag og lyntaler innen sikkerhet, frontend, plattform, metode og meir.</p>
            <a class="ds-button off-button" data-variant="secondary" href={`${import.meta.env.BASE_URL}program`} style="width: fit-content;">Se fullt program</a>
          </div>
          <icon-manserpaakart></icon-manserpaakart>
        </section>
      </div>
      <div class="bg-tinted">
        <section class="info-section">
          <div class="info-section-text">
            <h2 class="ds-heading" data-size="lg">Hva er Open Space?</h2>
            <p class="ds-paragraph" data-size="lg">I stedet for at vi har spikret en agenda på forhånd, så får du mulighet til å foreslå et tema du brenner for og har lyst til å diskutere med likesinnede. Vi grupperer og stemmer over forslagene som kommer inn - og de som er mest interessante for flest settes opp på agendaen. Så velger folk selv hva de vil være med på. Har du valgt feil, kan du bare hoppe over til en annen gruppe.</p>
            <p class="ds-paragraph" data-size="lg">Vi stiller med rom, bord og noen som legger til rette for seansen. Alt du trenger å gjøre er å stille med gode spørsmål og lysten til å diskutere fag med andre. Forhåpentligvis lærer du (bort) noe og får med noen nye tanker om hvordan ting kan løses.</p>
            <p class="ds-paragraph" data-size="md">For Open Space følger vi noen få enkle prinsipper:</p>
            <ul class="ds-list" data-size="md">
              <li>De som møter opp, er de rette personene</li>
              <li>Det som skjer, er det som kunne skje</li>
              <li>Når det starter, er det riktig tidspunkt</li>
              <li>Når det er over, er det over</li>
            </ul>
            <a class="ds-button off-button" data-variant="secondary" href={`${import.meta.env.BASE_URL}openspace`} style="width: fit-content;">Foreslå og stem på temaer</a>
          </div>
          <div class="openspace-cloud" aria-hidden="true">
            <img src="/offentlig-fagdag/img/open_space color.svg" alt="" class="openspace-cloud-center">
            <img src="/offentlig-fagdag/img/Person2color.svg" alt="" class="openspace-cloud-face face-1">
            <img src="/offentlig-fagdag/img/person3color.svg" alt="" class="openspace-cloud-face face-2">
            <img src="/offentlig-fagdag/img/person4color.svg" alt="" class="openspace-cloud-face face-3">
          </div>
        </section>
      </div>
      <div>
        <section class="info-section info-section-text">
          <div class="info-section-text" style="align-items: center;">
            <h2 class="ds-heading" data-size="lg">Forrige år</h2>
            <p class="ds-paragraph" data-size="lg">Hvis du trenger inspirasjon til et foredrag kan du jo f.eks ta en titt på <a class="ds-link" href="https://sites.google.com/view/offentligfagdag25">fjorårets program</a>.</p>
          </div>
        </section>
      </div>
    </div>
  </main>

  <script slot="scripts" is:inline src="/offentlig-fagdag/animations.js" defer></script>
</Base>
```

**Note on script loading:** The animations.js file needs to be in `public/animations.js` since it uses the global `anime` object loaded from CDN. Using `is:inline` prevents Astro from bundling it. Alternatively, you could use a `<script>` tag in the page that imports from `src/scripts/animations.js` — but since it depends on the global `anime` variable, the simplest approach is to keep it as a plain script in `public/`.

**Correction to Task 2:** Copy `script.js` to `public/animations.js` instead of `src/scripts/animations.js`.

- [ ] **Step 2: Verify the index page renders**

Run: `npm run dev`

Open the dev server URL in browser. The index page should display with the same layout, icons, and animations as the original. Check:
- Logo SVG draws on load
- Nav links work
- Action card hover animations work
- Open space cloud parallax works
- Footer displays correctly

---

### Task 6: Create the about page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create `src/pages/about.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---

<Base
  title="Offentlig fagdag 2026"
  ogTitle="Offentlig fagdag 2026"
  ogDescription="Konferansen for teknologer i offentlig sektor"
  activeNav="about"
  bodyColorScheme="auto"
>
  <main class="about-page">
    <div class="fixed-width hero">
      <icon-katteskjerm></icon-katteskjerm>
      <h1 class="ds-heading" data-size="xl">Om Offentlig fagdag 2026</h1>
    </div>
    <div id="about" class="ds-card fixed-width about-article">
      <h2 class="ds-heading">Hva og hvorfor?</h2>
      <p class="ds-paragraph">
        Konferanser er dyrt, budsjettene er stramme og kunnskap er ferskvare. Vi har mye kompetanse i det offentlige,
        men det er ikke alltid like enkelt å finne den - spesielt ikke på tvers av organisasjoner. Vi inviterer derfor
        til en fagdag på tvers av organisasjoner hvor vi kan dele og lære sammen - og spille på de fagnettverkene vi har.
      </p>
      <h2 class="ds-heading">Innhold</h2>
      <p class="ds-paragraph">
        Fagdagen springer ut av fagnettverkene Offentlig Frontend, Offentlig PaaS og Security Champions Norge, og det
        faglige innholdet vil i hovedsak falle innunder (men ikke begrenses til) disse områdene. Vi legger opp til en
        dag med høyt faglig innhold, nettverksbygging og gode diskusjoner. Det blir en konferanse med flere spor og
        innhold og noe for enhver smak. Så om du jobber med UX, plattform, sikkerhet, frontend, backend eller
        produktutvikling generelt så bli med på dag av og for nerder i det offentlige!
        Hvis du trenger inspirasjon til et foredrag kan du jo feks ta en titt på
      </p><a class="ds-link" href="https://sites.google.com/view/offentligfagdag25">fjorårets program</a>.
      <h2 class="ds-heading">Hvor og når?</h2>
      <p class="ds-paragraph">
        I fjor ble Oslo Event Hub fylt opp med 300 teknologer til urpremieren av "Offentlig Fagdag". I år har vi sikret
        oss inntil 500 plasser når andre utgave av arrangementet går av stabelen 23. april på Meet Ullevål.
      </p>
      <h2 class="ds-heading">Hvem står bak?</h2>
      <p>
        Bak arrangementet står frivillige ildsjeler fra Nav, Politiet, Meteorologisk institutt, Skatteetaten, Oslo
        kommune og Digitaliseringsdirektoratet. En gjeng som mener det offentlige gjør mye kult som fortjener å deles.
      </p>
      <h2 class="ds-heading">Påmelding og fakturering</h2>
      <p class="ds-paragraph">
        Påmelding skjer ved at hver offentlige etat gjør en gruppepåmelding med hvor mange plasser de ønsker. Antall
        plasser er bindende og en samlet faktura vil bli sendt basert på gruppepåmeldingen. Pris er 1200,- eks mva per
        person. Det er fullt mulig å melde på flere grupper fra en virksomhet hvis man ønsker flere fakturaer, men av
        praktiske hensyn ønsker vi så få fakturaer som mulig. Når det nærmer seg vil det komme en påmeldingsside hvor
        enkeltpersoner fra virksomhetene registrerer seg mot den kvoten de har fått fra gruppepåmeldingen. I fjor ble
        plassene fylt opp fort, og vi ønsker at flest mulig virksomheter skal få mulighet til å delta. Vi kan derfor
        ikke love at man får like mange plasser som man ønsker, men vi kan love en rettferdig fordeling.
      </p>
      <h2 class="ds-heading">Videopptak</h2>
      <p class="ds-paragraph">
        Det blir videopptak av foredragene som vil bli gjort tilgjengelig i etterkant av konferansen.
      </p>
    </div>
  </main>

  <script slot="scripts" is:inline src="/offentlig-fagdag/animations.js" defer></script>
</Base>
```

---

### Task 7: Create the openspace page

**Files:**
- Create: `src/pages/openspace.astro`
- Create: `public/openspace.js`

- [ ] **Step 1: Extract the inline open space script to `public/openspace.js`**

Copy the inline `<script>` content from `static-web/openspace.html` (lines 112–231) into `public/openspace.js`. This is the API client code (fetchTopics, vote, submit, renderTopics, etc.). No changes needed — it runs as client-side JS.

```js
const API_BASE = 'https://fagdag-openspace.ekstern.dev.nav.no';
const topicsList = document.getElementById('topics-list');
const topicCount = document.getElementById('topic-count');
const topicForm = document.getElementById('topic-form');
const topicInput = document.getElementById('topic-input');

function getVotedIds() {
    try {
        return JSON.parse(localStorage.getItem('openspace-votes') || '[]');
    } catch { return []; }
}

function hasVoted(id) {
    return getVotedIds().includes(String(id));
}

function markVoted(id) {
    const voted = getVotedIds();
    voted.push(String(id));
    localStorage.setItem('openspace-votes', JSON.stringify(voted));
}

async function fetchTopics() {
    try {
        const res = await fetch(`${API_BASE}/api/topics`);
        if (!res.ok) throw new Error('Kunne ikke hente temaer');
        const topics = await res.json();
        renderTopics(topics);
    } catch (err) {
        topicsList.innerHTML = `
            <div class="ds-alert" data-color="danger">
                <p>Kunne ikke laste temaer. Prøv igjen senere.</p>
            </div>`;
        topicCount.textContent = '';
    }
}

function renderTopics(topics) {
    topicCount.textContent = `${topics.length} ${topics.length === 1 ? 'tema' : 'temaer'}`;

    if (topics.length === 0) {
        topicsList.innerHTML = `
            <div class="ds-alert" data-color="info">
                <p>Ingen temaer ennå. Vær den første til å foreslå et tema!</p>
            </div>`;
        return;
    }

    topicsList.innerHTML = topics.map((topic, i) => {
        const voted = hasVoted(topic.id);
        return `
        <div class="ds-card openspace-topic" data-color="neutral">
            <div class="ds-card__block openspace-topic-row">
                <button class="ds-button off-button openspace-vote-btn${voted ? ' voted' : ''}" data-variant="secondary" data-id="${topic.id}" ${voted ? 'disabled' : ''} aria-label="${voted ? 'Du har stemt på' : 'Stem på'} ${escapeHtml(topic.title)}">
                    <span>${voted ? '✔' : '▲'}</span>
                    <span>${topic.votes}</span>
                </button>
                <span class="ds-paragraph">${escapeHtml(topic.title)}</span>
            </div>
        </div>
    `}).join('');

    topicsList.querySelectorAll('.openspace-vote-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => vote(btn, btn.dataset.id));
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function vote(btn, id) {
    if (hasVoted(id)) return;
    btn.disabled = true;
    try {
        const res = await fetch(`${API_BASE}/api/topics/${id}/vote`, { method: 'POST' });
        if (!res.ok) throw new Error('Kunne ikke stemme');
        markVoted(id);
        fetchTopics();
    } catch (err) {
        btn.disabled = false;
    }
}

topicForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = topicInput.value.trim();
    if (!title) return;

    const submitBtn = topicForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/api/topics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error('Kunne ikke sende inn tema');
        topicInput.value = '';
        fetchTopics();
    } catch (err) {
        const card = topicForm.closest('.ds-card');
        const existing = card.querySelector('.ds-alert');
        if (existing) existing.remove();
        const alert = document.createElement('div');
        alert.className = 'ds-alert';
        alert.dataset.color = 'danger';
        alert.innerHTML = '<p>Kunne ikke sende inn tema. Prøv igjen.</p>';
        card.appendChild(alert);
        setTimeout(() => alert.remove(), 4000);
    } finally {
        submitBtn.disabled = false;
    }
});

fetchTopics();
```

- [ ] **Step 2: Create `src/pages/openspace.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---

<Base
  title="Open Space – Offentlig fagdag 2026"
  description="Open Space – Offentlig fagdag 2026. Foreslå og stem på temaer."
  ogTitle="Open Space – Offentlig fagdag 2026"
  ogDescription="Foreslå og stem på temaer til Open Space"
  activeNav="openspace"
  bodyClass="program-page openspace-page"
>
  <main class="program-page openspace-page">
    <div class="fixed-width hero">
      <div class="hero-text">
        <h1 class="ds-heading" data-size="xl">Open Space</h1>
        <h2 class="ds-heading" data-size="sm">Foreslå et tema og stem på det du vil diskutere</h2>
      </div>
    </div>

    <div class="bleed">
      <div>
        <div class="openspace-container">
          <div class="ds-card" data-color="accent">
            <form id="topic-form" class="ds-card__block openspace-form">
              <div class="ds-field">
                <label class="ds-label" for="topic-input">Foreslå et tema</label>
                <div data-field="description" class="ds-paragraph" data-size="sm">Hva har du lyst til å diskutere med andre teknologer i offentlig sektor?</div>
                <div class="openspace-input-row">
                  <input id="topic-input" class="ds-input" type="text"
                    placeholder="F.eks. «Hvordan lykkes med designsystemer på tvers av etater?»"
                    required maxlength="200">
                  <button type="submit" class="ds-button off-button">Send inn</button>
                </div>
              </div>
            </form>
          </div>

          <div class="openspace-list-header">
            <h3 class="ds-heading" data-size="xs">Innsendte temaer</h3>
            <span id="topic-count" class="ds-tag" data-color="neutral"></span>
          </div>

          <div id="topics-list" class="openspace-topics">
            <p class="ds-paragraph">Laster temaer...</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bleed">
      <div class="bg-tinted">
        <section class="info-section">
          <div class="info-section-text">
            <h2 class="ds-heading" data-size="lg">Slik fungerer Open Space</h2>
            <p class="ds-paragraph" data-size="md">Foreslå et tema du brenner for, og stem på andres forslag. De mest populære temaene settes opp på agendaen. Under sesjonen velger du selv hva du vil delta på.</p>
            <ul class="ds-list" data-size="md">
              <li>De som møter opp, er de rette personene</li>
              <li>Det som skjer, er det som kunne skje</li>
              <li>Når det starter, er det riktig tidspunkt</li>
              <li>Når det er over, er det over</li>
            </ul>
          </div>
          <icon-man7 aria-label="ikon av mann som sprudler"></icon-man7>
        </section>
      </div>
    </div>
  </main>

  <Fragment slot="scripts">
    <script is:inline src="/offentlig-fagdag/openspace.js"></script>
    <script is:inline src="/offentlig-fagdag/animations.js" defer></script>
  </Fragment>
</Base>
```

---

### Task 8: Extract program data to YAML

**Files:**
- Create: `src/data/program.yaml`

- [ ] **Step 1: Create `src/data/program.yaml`**

Extract all schedule data from `static-web/program.html`. The structure mirrors the HTML: common events, then rooms with their own schedules, then closing events.

Each schedule entry is either a `talk` (with org, title, speaker, description, optional track) or an `event` (break/lunch/etc). The alternating `bg-tinted` styling is derived from position (even/odd index), not from data.

```yaml
commonBefore:
  - time: "08:30"
    event: "Registrering og kaffe"

rooms:
  - name: "Hovedrommet, Meet salen"
    subtitle: "Utvikling"
    id: "hovedrommet"
    schedule:
      - time: "09:00–09:10"
        duration: "10 min"
        talks:
          - org: "Offentlig Fagdag"
            title: "Velkomsttale"
            speaker: "Arrangørene av Offentlig Fagdag"
            description: "Arrangørene ønsker velkommen til fagdagen og gir en kort introduksjon til dagens program."
      - event: "Pause"
        time: "09:10"
      - time: "09:20–09:50"
        duration: "30 min"
        talks:
          - org: "NAV"
            title: "Hvordan Nix & Rust forenkler (F)OSS adopsjon!"
            speaker: "Christian Chavez"
            description: "Jeg vil fortelle om hvilke fordeler jeg opplevde når jeg forsøkte å adoptere opensource prosjekter vha. styrkene til Rust kombinert med Nix! Rust gir feks: - kompilatorgarantier (kompilerer det er..."
      # ... continue for ALL talks in hovedrommet ...
      - event: "Pause"
        time: "09:50"
      # ... etc ...

  - name: "Rom 2, M4"
    subtitle: "Plattform & Sikkerhet"
    id: "rom2"
    schedule:
      # ... all talks for rom2 ...

  - name: "Rom 3, M5"
    subtitle: "Metode, Produkt & Data"
    id: "rom3"
    schedule:
      # ... all talks for rom3 ...

  - name: "Rom 4, Mesanin"
    subtitle: "Open Space & Workshop"
    id: "rom4"
    schedule:
      # ... all talks for rom4 ...

commonAfter:
  - time: "17:00"
    event: "Avslutning"
  - time: "17:20"
    event: "Felles avreise til Brygg"
  - time: "17:30"
    event: "Sosialt på Brygg"
    link: "https://brygg.no/"
```

**This is the most labor-intensive step.** You must extract every talk from all 4 room tabpanels in `program.html`. There are approximately 30+ talks across the 4 rooms. Some talks have a `track` field (e.g., "Lyntale", "Workshop") — include it when present.

When a talk has a `track` tag, add `track: "Lyntale"` or `track: "Workshop"` to the YAML entry.

---

### Task 9: Create program components and page

**Files:**
- Create: `src/components/ScheduleBlock.astro`
- Create: `src/components/TalkCard.astro`
- Create: `src/pages/program.astro`

- [ ] **Step 1: Create `src/components/TalkCard.astro`**

```astro
---
interface Props {
  org?: string;
  title: string;
  speaker?: string;
  description?: string;
  track?: string;
}

const { org, title, speaker, description, track } = Astro.props;
---

<div class="schedule-talk">
  {org && <span class="schedule-org">{org}</span>}
  {track && <span class="schedule-track">{track}</span>}
  <h3 class="ds-heading" data-size="sm">{title}</h3>
  {speaker && <span class="ds-paragraph schedule-speaker" data-size="sm">{speaker}</span>}
  {description && <p class="ds-paragraph" data-size="sm" set:html={description} />}
</div>
```

Note: Use `set:html` for description because some descriptions contain HTML entities like `&#x27;` and `&quot;`. In the YAML, store these as plain text and let Astro escape them, OR store the raw HTML. Simpler: just use `{description}` and let Astro auto-escape — the original HTML entities will display correctly since YAML stores the decoded text.

- [ ] **Step 2: Create `src/components/ScheduleBlock.astro`**

```astro
---
import TalkCard from './TalkCard.astro';

interface Talk {
  org?: string;
  title: string;
  speaker?: string;
  description?: string;
  track?: string;
}

interface Props {
  time: string;
  duration?: string;
  event?: string;
  talks?: Talk[];
  link?: string;
}

const { time, duration, event, talks, link } = Astro.props;
---

<div class="schedule-block">
  <span class="schedule-time">
    {time}
    {duration && <small class="schedule-duration">{duration}</small>}
  </span>
  {event ? (
    <span class="schedule-event">
      {link ? <a class="ds-link" href={link}>{event}</a> : event}
    </span>
  ) : (
    <div class="schedule-talks">
      {talks?.map(talk => <TalkCard {...talk} />)}
    </div>
  )}
</div>
```

- [ ] **Step 3: Create `src/pages/program.astro`**

This page reads `program.yaml` and renders the tabbed schedule.

```astro
---
import Base from '../layouts/Base.astro';
import ScheduleBlock from '../components/ScheduleBlock.astro';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

// Read and parse program data
const yamlContent = readFileSync(new URL('../data/program.yaml', import.meta.url), 'utf-8');
const program = parse(yamlContent);
---

<Base
  title="Program – Offentlig fagdag 2026"
  description="Program for Offentlig fagdag 2026, 23. april på Meet Ullevål"
  ogTitle="Program – Offentlig fagdag 2026"
  ogDescription="Konferansen for teknologer i offentlig sektor"
  activeNav="program"
  bodyClass="program-page"
>
  <main class="program-page">
    <div class="fixed-width hero">
      <icon-manserpaakart></icon-manserpaakart>
      <div class="hero-text">
        <h1 class="ds-heading" data-size="xl">Program</h1>
        <h2 class="ds-heading" data-size="md">23. april 2026 på <a class="ds-link" href="https://meet-ullevaal.no">Meet Ullevål</a></h2>
      </div>
    </div>
    <div class="bleed">
      <div>
        <div class="schedule">
          {program.commonBefore.map((item: any) => (
            <ScheduleBlock {...item} />
          ))}
        </div>
      </div>

      <div class="ds-tabs program-tabs">
        <div role="tablist" class="program-tablist">
          {program.rooms.map((room: any, i: number) => (
            <span role="tab" aria-selected={i === 0 ? 'true' : 'false'} data-tab={room.id}>
              {room.name}<br /><small>- {room.subtitle}</small>
            </span>
          ))}
        </div>
        {program.rooms.map((room: any, i: number) => (
          <div role="tabpanel" data-panel={room.id} hidden={i !== 0 ? true : undefined}>
            {room.schedule.map((block: any, j: number) => (
              <div class={j % 2 === 1 ? 'bg-tinted' : undefined}>
                <div class="schedule">
                  <ScheduleBlock {...block} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div>
        <div class="schedule">
          {program.commonAfter.map((item: any) => (
            <ScheduleBlock {...item} />
          ))}
        </div>
      </div>
    </div>
  </main>

  <script slot="scripts" is:inline src="/offentlig-fagdag/animations.js" defer></script>
</Base>
```

**Note:** Add `yaml` as a dependency: `npm install yaml`.

- [ ] **Step 4: Verify the program page**

Run: `npm run dev`

Open the program page and compare with the original `static-web/program.html` in a browser. Check:
- All 4 room tabs render and switch correctly
- Talk cards show org, title, speaker, description
- Lightning talk / Workshop track tags appear
- Alternating tinted backgrounds
- Common events (registration, closing, Brygg) show correctly
- Tab sticky behavior works

---

### Task 10: Update GitHub Actions workflows

**Files:**
- Modify: `.github/workflows/pages.yaml`
- Modify: `.github/workflows/designsystemet.yaml`

- [ ] **Step 1: Update `pages.yaml`**

Replace the current "upload static-web" workflow with an Astro build step.

```yaml
name: Deploy to Pages

on:
  push:
    branches:
      - main

  workflow_dispatch:

concurrency:
  group: "pages"
  cancel-in-progress: false

permissions: {}

jobs:
  deploy:
    name: Deploy pages
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          persist-credentials: false
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Note: The original used pinned SHA action versions with `# ratchet:` comments. Preserve that pattern if the team uses ratchet for action pinning — look up current SHAs for v4 of each action. For the plan, we use tag versions for clarity. The implementer should pin SHAs if that's the team convention.

- [ ] **Step 2: Update `designsystemet.yaml`**

Change the output directory from `./static-web/theme` to `./public/theme`:

Change line:
```yaml
run: npx --yes @digdir/designsystemet@latest tokens build --clean --out-dir ./static-web/theme
```
To:
```yaml
run: npx --yes @digdir/designsystemet@latest tokens build --clean --out-dir ./public/theme
```

---

### Task 11: Clean up and final verification

- [ ] **Step 1: Add `.gitignore` entries**

Add to `.gitignore` (create if it doesn't exist):

```
node_modules/
dist/
.astro/
```

- [ ] **Step 2: Run a production build**

Run: `npm run build`

Verify it completes without errors and produces output in `dist/`.

- [ ] **Step 3: Preview the production build**

Run: `npm run preview`

Open in browser and verify all 4 pages work:
- `/offentlig-fagdag/` — index page with hero, cards, sections, animations
- `/offentlig-fagdag/program` — tabbed schedule with all rooms and talks
- `/offentlig-fagdag/openspace` — form and topic list (API may not respond from localhost)
- `/offentlig-fagdag/about` — about content

- [ ] **Step 4: Verify no regressions**

Open original `static-web/index.html` in browser side-by-side with the Astro output. Check:
- Visual parity (layout, colors, spacing, fonts)
- Animations work (logo draw, hover effects, parallax)
- Mobile responsive layout (nav toggle at 575px)
- SVG custom elements render
- All links navigate correctly

- [ ] **Step 5: Decide what to do with `static-web/`**

The `static-web/` directory is no longer needed for the Astro build. Options:
1. Delete it now (clean break)
2. Keep it temporarily during the transition and delete after the first successful deploy

Recommend option 1 — delete `static-web/` since everything is ported.
