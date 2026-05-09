# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static marketing website for **Henoq**, an externalized IT consulting company (DSI externalisée) targeting TPE/PME in Île-de-France. Deployed on an Apache server at `henoq.fr`. No build step, no package manager — all files are edited and served directly.

## Development

Open in VS Code and use the **Live Server** extension (configured on port 5501). Open `index.html` to start.

For deployment, push to git and sync to the Apache host. The `.htaccess` handles HTTPS redirect, www→non-www, security headers, Gzip, and cache.

## Architecture

### Page structure

Each HTML page follows the same pattern:

```
<head>
  css/global.css → css/nav.css → css/[page].css
<body>
  <div id="nav-placeholder"></div>  ← nav.html injected here by nav.js
  <main>…</main>
  <footer>…</footer>
  <script src="js/nav.js"></script>
  <script src="js/[page].js"></script>
```

`nav.html` is a standalone HTML fragment (no `<html>/<head>/<body>`) fetched client-side by `js/nav.js` and injected into `#nav-placeholder`. This keeps the nav DRY across all pages.

### CSS design system (`css/global.css`)

CSS custom properties defined on `:root`:
- `--offwhite: #F3EDDA` — background
- `--maroon: #593137` — primary accent
- `--dark: #2F2F2F` — text
- `--condensed` — Barlow Condensed (headings, all-caps)
- `--body` — DM Sans (body text)

Key utility classes:
- `.reveal` / `.reveal-d1/d2/d3` — scroll-triggered fade-up via IntersectionObserver (initialized in `nav.js` for shared elements, and in each page JS for page-specific elements)
- `.lw` — line wrapper for masked text animations
- `.l` — animated headline word (uses `--d` CSS var for stagger delay)
- `.outline` / `.outline.light` — text outline style via `-webkit-text-stroke`
- `.sec-eyebrow`, `.sec-title`, `.stitle`, `.ssub` — section typography hierarchy
- `.btn-fill`, `.btn-text` — button variants
- `.wrap` — centered content container (max `960px`, expands to `80vw` above `1100px`)

### JavaScript

**`js/nav.js`** — runs on every page. Handles:
- Fetching and injecting `nav.html`
- Dropdown (hover on desktop ≥1100px, click on mobile)
- Burger menu toggle
- Nav scroll solidification (`.solid` class at `scrollY > 40`)
- `.reveal` IntersectionObserver for scroll animations
- Back-to-top (`#btt`) button
- Active link detection
- Footer year (`#yr`)

**`js/index.js`** — homepage only. Handles:
- Service card carousel (logo strip, animates on hover via `requestAnimationFrame`)
- Hero ticker (infinite scroll band, uses Web Animations API)
- Hero elevator (cycling text animation)
- Animated counters (`.cnt[data-to]`)
- Contact form: client-side validation → reCAPTCHA v3 token → `POST contact.php` (JSON)

**`js/dsi.js`** — DSI page only. Handles reveal, BTT, and footer year (subset of `nav.js` behavior, used on pages that don't need the full nav logic separately).

### Contact form

The form (`#cform` in `index.html`) submits JSON to `contact.php` (not included in this repo — server-side). The reCAPTCHA site key is hardcoded as the placeholder `'VOTRE_SITE_KEY'` in `js/index.js:142` — replace with the real key before deploying.

### Adding a new page

1. Create `page-name.html` following the head/body pattern above.
2. Create `css/page-name.css` for page-specific styles.
3. Create `js/page-name.js` — include at minimum: reveal observer, BTT toggle, footer year (or use the shared `dsi.js` as a template).
4. Add the page to the nav dropdown in `nav.html` and to footer links in all pages.
