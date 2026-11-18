# Jeffrey Agyemang Acheampong — Portfolio

Personal portfolio for **Jeffrey Agyemang Acheampong**, an aspiring cybersecurity analyst and digital media creator in Kumasi, Ghana. It presents security learning and projects alongside photography, videography, editing and live-streaming work, with an admin panel for adding new videos and photos without touching code.

## Features

- **Pages:** Home, About, Cybersecurity, Projects, Showcase (videos), Gallery (photos), Services, Contact.
- **Content admin** at `/keystatic`: add videos by pasting a YouTube or Vimeo link, upload photos, and edit every page's text.
- **One 3D moment:** a camera-iris aperture on the Home page that opens on scroll to reveal the featured reel. It is lazy-loaded, renders only on demand, and falls back to SVG when WebGL is unavailable.
- **Motion:**
  - A short intro once per session.
  - CSS headline reveals for fast first paint.
  - Scroll-in section transitions.
  - An Experience timeline that draws itself as you scroll.
  - Smooth scrolling and a viewfinder cursor on desktop.
  - Everything respects reduced motion.
- **Media performance:** videos load only after "play". Photos are served as AVIF/WebP with blur placeholders and a keyboard- and swipe-friendly lightbox, plus before/after sliders.
- **Security:** a per-request nonce Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, and a strict Permissions-Policy. The contact form has no server endpoint and no API keys.
- **SEO and accessibility:** metadata per page, Open Graph and Twitter images, a favicon set and manifest, sitemap, robots, and JSON-LD `Person`. Pages are semantic and keyboard navigable, with visible focus states.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Content | Keystatic (git-based CMS; content lives in `content/` and `public/media/`) |
| Motion | GSAP + ScrollTrigger, Lenis, `motion` (section transitions) |
| 3D | three.js (plain, no React wrapper) |
| Styling | Plain CSS with design tokens (`src/styles/tokens.css`) |
| Hosting | Vercel |

## Getting started

Requires **Node.js 20.9+**.

```bash
npm install
npm run dev          # http://localhost:3000   ·   admin: http://localhost:3000/keystatic
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server, with the local admin |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run TypeScript |

## Deploying to Vercel

1. Push this repository to GitHub and import it in Vercel. Next.js is detected automatically, so no extra build settings are needed.
2. Add the environment variables listed below.
3. Add your custom domain under **Project → Settings → Domains**. HTTPS is automatic.

### Environment variables

Copy `.env.example` to `.env.local` for local work. Never commit real values.

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, social images | e.g. `https://your-domain.com` |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` | Admin on the live site | `owner/repo-name`; without it the admin works only in `npm run dev` |
| `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Admin on the live site | Created by Keystatic's GitHub App setup; server-side secrets |

### Admin on the live site

In production, the admin requires GitHub sign-in. It returns 404 until GitHub mode is configured, so an open admin can never be exposed.

1. Set `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` in `.env.local`, run `npm run dev` and open `/keystatic`. Keystatic walks you through creating a GitHub App.
2. Copy the generated values from `.env.local` into Vercel's environment variables and redeploy.
3. Edit at `https://your-domain.com/keystatic`. Each save commits to GitHub, and Vercel redeploys in about a minute.

## Project structure

```
content/                 Site text, videos, photos, projects… (edited by the admin)
public/media/            Uploaded images and the CV
keystatic.config.ts      Content model and admin fields
src/
  app/(site)/            Pages (Home, About, Cybersecurity, …)
  app/keystatic/         Admin UI          app/api/keystatic/  Admin API
  components/            UI: nav, gallery, lightbox, video, aperture, cursor, reveals
  three/                 three.js aperture scene + shared iris maths
  motion/                GSAP loader, Lenis, scroll reveals, environment helpers
  lib/                   Content reader, video-link parser, site URL
  styles/                Design tokens + global styles
  proxy.ts               Per-request CSP nonce
next.config.ts           Security headers, image formats
HANDOVER.md              Plain-language guide to updating content
```

## Updating content

See **[HANDOVER.md](HANDOVER.md)**. It covers adding videos and photos, editing page text, the first-time checklist for replacing placeholder content, and security notes.

## Placeholder content

The current photos are generated placeholders, and the sample videos are Blender Foundation open films. Contact details are dummies. Replace all of them before launch; the checklist is in HANDOVER.md.

## License

- **Code:** [MIT](LICENSE). You're welcome to learn from it or reuse it.
- **Content and media: all rights reserved.** Photos, images, the CV, written copy (`public/media/`, `content/`) and linked videos are © Jeffrey Agyemang Acheampong. They may not be reused without written permission.

See [LICENSE](LICENSE) for the full terms.
