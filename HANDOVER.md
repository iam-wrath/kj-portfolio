# Jeffrey Agyemang Acheampong — Portfolio handover guide

This guide explains how to update the site yourself. You never need to touch code for day-to-day changes.

## How it works (one paragraph)
All words, links, photos and videos live in the `content/` and `public/media/` folders of the GitHub repo. The **admin panel at `/keystatic`** edits those files for you. When you press **Save** in the admin, it commits to GitHub, and Vercel redeploys the live site automatically within about a minute.

---

## Everyday tasks

### Add a video (paste a link)
1. Go to `https://<your-domain>/keystatic` and sign in with GitHub.
2. Click **Videos → Add**.
3. Fill in:
   - **Title**
   - **Video link**: paste a YouTube or Vimeo URL. Any YouTube format works, including `watch?v=`, `youtu.be/`, Shorts and Live.
   - **Category**, **Date**, **Venue or client**, and **My role** (e.g. "Camera & editor").
4. YouTube thumbnails appear automatically. **Vimeo needs a custom thumbnail**, so upload one in the last field.
5. Tick **Featured reel** on one video only. That video appears large on the Home and Showcase pages.
6. Press **Save**.

### Add photos
1. Click **Photos → Add**.
2. Upload the photo. JPG or WebP around 2000px on the long edge is ideal; the site makes smaller copies itself.
3. Fill in **Alt text**. This is a short description for blind visitors and Google, and it is required.
4. Choose an **Album** and add a **Caption** (event or place).
5. Tick **Show on Home page** for your best 5 shots.

### Before / after edits
Go to **Before / After edits → Add**. Upload the unedited photo and the edited one at the **same size and crop**.

### Projects, certifications, learning log
- **Projects:** title, description, categories (Web Development, Cybersecurity, Study Tools), tools, plus GitHub and demo links.
- **Certifications & education:** set **Verification link** when you have one; a "Verify" link then appears.
- **Cyber learning log:** add an entry every time you finish a lab or room. This is your public learning record.

### Text on pages
The **Pages** group in the admin holds Site settings, Home, About, Cybersecurity and Services.
- In long text fields, leave a blank line between paragraphs.
- **Site settings** holds your name, title, email, WhatsApp number, social links and **CV (PDF)**.

---

## Replacing the placeholder content (first-time checklist)
- [ ] Site settings: real email, WhatsApp number (digits only, e.g. `233241234567`), social links and CV PDF
- [ ] About: portrait photo, your story, and the Experience timeline
- [ ] Delete the sample photos and videos, then add your own. The sample videos are Blender open films.
- [ ] Services: real equipment list and sample images for each role
- [ ] Projects: real GitHub and demo links
- [ ] Certifications: verification links
- [ ] Featured reel: tick **Featured reel** on your best video. It is the one revealed through the 3D lens on the Home page.

---

## One-time setup (developer)

### 1. Deploy on Vercel
1. Push this repo to GitHub, then import it in Vercel. The framework is detected as Next.js automatically.
2. Set these environment variables:
   - `NEXT_PUBLIC_SITE_URL`: `https://your-domain.com`
   - `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO`: `owner/repo-name`
   - The Keystatic GitHub App variables (see step 2).
3. **Custom domain:** in Vercel go to Project → Settings → Domains, add the domain, then set the DNS records Vercel shows at your registrar. HTTPS is automatic.

### 2. Enable the admin in production (Keystatic GitHub mode)
1. Run `npm run dev` locally and open `http://localhost:3000/keystatic`.
2. With `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` set in `.env.local`, Keystatic walks you through creating a GitHub App.
3. That writes `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` and `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` to `.env.local`. Copy them into Vercel's environment variables.
4. Only GitHub users with write access to the repo can edit content.

Without `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO`, the admin works only locally (`npm run dev`) and edits files on disk.

### 3. Local development
```bash
npm install
npm run dev        # http://localhost:3000  (admin: /keystatic)
npm run build && npm start   # production check
```

Development-only test switches (ignored in production):
- `?motion=reduce` shows the site as a reduced-motion visitor sees it.
- `?webgl=off` shows the SVG fallback instead of the 3D lens.

---

## Security notes
- **Strict Content-Security-Policy** with a fresh nonce on every request (`src/proxy.ts`). Only this site's own scripts run. YouTube and Vimeo frames load only after a visitor presses play.
- **Other headers:** HSTS (2 years, preload), `X-Frame-Options: DENY`, `nosniff`, a strict Referrer-Policy, and a Permissions-Policy that disables camera, mic and location (`next.config.ts`).
- **No server-side form and no API keys in the browser.** The contact form opens the visitor's own email app or WhatsApp with the message pre-filled.
- **Secrets:** the only secrets are the Keystatic GitHub App credentials. They are server-side environment variables and never committed (`.env*` is git-ignored).
- **Dependencies:** Dependabot (`.github/dependabot.yml`) opens weekly update PRs. Keep them merged.
- **After launch:** check the live URL on securityheaders.com and developer.mozilla.org/observatory.

## Where things live
| What | Where |
|---|---|
| Pages | `src/app/(site)/*/page.tsx` |
| Shared UI (nav, gallery, lightbox, video, forms) | `src/components/` |
| Motion system (GSAP + Lenis, motion section reveals) | `src/motion/`, `src/components/reveal.tsx` |
| 3D aperture (three.js) and its SVG fallback | `src/three/`, `src/components/aperture-*.tsx` |
| Viewfinder cursor | `src/components/cursor.tsx` |
| Colours (black + acid lime), fonts, spacing | `src/styles/tokens.css` |
| Content model / admin fields | `keystatic.config.ts` |
| Content files | `content/`, `public/media/` |
