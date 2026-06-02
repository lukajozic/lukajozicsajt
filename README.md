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
- `styles.css`, `app.js` — shared styles and behaviour (menu, gallery lightbox, headline auto-fit)
- `assets/` — fonts, icons, share image, photography
- `sr/` — Serbian-language versions of every page
- `sitemap.xml`, `robots.txt` — crawl directives (list EN + SR URLs with hreflang)

## Languages
Bilingual (English / Serbian) as **separate, crawlable URLs** — English at the root (`/`, `/biography.html`, …) and Serbian under `/sr/` (`/sr/`, `/sr/biography.html`, …). Each page links to its counterpart with `rel="alternate" hreflang` tags, and the EN / SRB switch in the header & footer is a real link. Edit content in both the root file and its `/sr/` counterpart.

## Deploy
No build required. Host the folder on any static host (Netlify, GitHub Pages, Cloudflare Pages). The site root must serve `index.html`.

### Custom domain
Open Graph / canonical URLs currently point to `https://lukajozic.com`. If the production domain differs, update the `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, and `hreflang` alternate tags in each HTML file, plus `robots.txt` and `sitemap.xml`.
