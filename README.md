# Luka Jozic — Official Website

Static website for operatic baritone Luka Jozic. Pure HTML/CSS/JS — no build step.

## Structure
- `index.html` — home (hero, upcoming performances, gallery preview)
- `biography.html` — biography
- `repertoire.html` — operatic repertoire
- `upcoming.html` — upcoming performances (loaded live from Airtable)
- `media.html` — photo gallery
- `contact.html` — contact form
- `privacy.html` — privacy & cookie notice
- `404.html` — not-found page
- `styles.css`, `app.js` — shared styles and behaviour (menu, gallery lightbox, headline auto-fit)
- `upcoming.js` — fetches upcoming shows from Airtable and renders them on the home page and the Upcoming page
- `assets/` — fonts, icons, share image, photography
- `sr/` — Serbian-language versions of every page
- `sitemap.xml`, `robots.txt` — crawl directives (list EN + SR URLs with hreflang)

## Languages
Bilingual (English / Serbian) as **separate, crawlable URLs** — English at the root (`/`, `/biography.html`, …) and Serbian under `/sr/` (`/sr/`, `/sr/biography.html`, …). Each page links to its counterpart with `rel="alternate" hreflang` tags, and the EN / SRB switch in the header & footer is a real link. Edit content in both the root file and its `/sr/` counterpart.

## Upcoming performances (Airtable)
The Upcoming section on the home page and the whole `upcoming.html` / `sr/upcoming.html` page are driven by an **Airtable** base, so dates can be managed without touching code or redeploying.

**To add / edit / remove a show:** open the Airtable base and edit the rows. Changes appear on the live site automatically on next page load — no GitHub push needed.

- **Sorting:** shows are sorted by date, soonest first.
- **Past shows:** automatically hidden once their date has passed.
- **Visibility:** the `Checkbox` column toggles a show on/off without deleting it.
- **Empty state:** if there are no upcoming shows, the home-page section hides itself entirely, while `upcoming.html` shows a "More dates coming soon." note (`data-on-empty="message"`).
- **Unreachable:** if Airtable can't be reached, the home-page section stays hidden and the dedicated page shows the same note.

### Airtable configuration
All config lives at the top of `upcoming.js` (`CONFIG` block): `BASE_ID`, `TABLE` (table id), and a **read-only** personal access token (`TOKEN`, scope `data.records:read`, this base only). The token is read-only and locked to this one base, so it is safe to ship in the public site.

**Columns** (one row = one show): `Date` (Date type, required), `Time` (text, optional, e.g. `19:00`), `TitleEN` / `TitleSR` (required), `ComposerEN` / `ComposerSR`, `VenueEN` / `VenueSR` (required), `DirectionEN` / `DirectionSR` (director — `DirectorEN`/`DirectorSR` also accepted), `RoleEN` / `RoleSR`, and `Checkbox` (publish toggle; `Published` also accepted). `EN` columns show on the English pages, `SR` on the Serbian pages; the date/time are formatted per-language automatically.

## Deploy
No build required. Host the folder on any static host (Netlify, GitHub Pages, Cloudflare Pages). The site root must serve `index.html`.

### Custom domain
Open Graph / canonical URLs currently point to `https://lukajozic.com`. If the production domain differs, update the `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, and `hreflang` alternate tags in each HTML file, plus `robots.txt` and `sitemap.xml`.
