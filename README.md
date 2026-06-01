# Luka Jozic — Official Website

Static website for operatic baritone Luka Jozic. Pure HTML/CSS/JS — no build step.

## Structure
- `index.html` — home (hero, upcoming performances, gallery preview)
- `biography.html` — biography
- `repertoire.html` — operatic repertoire
- `media.html` — photo gallery
- `contact.html` — contact form
- `privacy.html` — privacy & cookie notice
- `404.html` — not-found page
- `styles.css`, `app.js` — shared styles and behaviour (EN/SRB language toggle, menu, gallery lightbox)
- `assets/` — fonts, icons, share image, photography

## Languages
Bilingual (English / Serbian) via a client-side toggle — content lives in `data-en` / `data-sr` attributes.

## Deploy
No build required. Host the folder on any static host (Netlify, GitHub Pages, Cloudflare Pages). The site root must serve `index.html`.

### Custom domain
Open Graph / canonical URLs currently point to `https://lukajozic.com`. If the production domain differs, update the `<link rel="canonical">`, `og:url`, `og:image`, and `twitter:image` tags in each HTML file, plus `robots.txt` and `sitemap.xml`.
