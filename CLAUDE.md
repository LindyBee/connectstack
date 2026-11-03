# ConnectStack: instructions for Claude (and any AI helper)

Read this first, then `docs/DECISIONS.md` and the latest entries of `docs/BUILD-LOG.md`.

## What this is

ConnectStack is Lindy Brown's (Lindy Grace, LLC) progressive web app for Substack writers. It is in **Free Beta** at **connectstack.app**. Its home is **Shuttle**, a weaver-bird AI coach that teaches AI prompting, hand-offs, automation and building an AI helper, then lets members practice on a real Substack collab. It is also a portfolio piece, so it must be as accessible as possible.

Build plan: "Shuttle Guide: AI Prompting, Hand-offs, and Automation" (Lindy's Claude doc, https://claude.ai/artifact/REkk9pMDaj9t8aRb9NMcNt). Lesson content in `public/shuttle-paths.js` follows it.

## How it's built

- `public/` is the whole front end: one `index.html` (styles, markup and app script), plus `voice.js` (read-aloud and voice input), `shuttle-paths.js` (Shuttle's five paths and lessons), `sw.js` (offline), `manifest.webmanifest` and `icons/`.
- `netlify/functions/api.mjs` is the back end: sign-in codes by email (Resend), member data in Netlify Blobs, Shuttle replies through the Claude API, and the owner's admin view.
- Hosting: Netlify, the team under **clclindyb21@gmail.com** (not Lindy's lindyb34 team). Lindy deploys by uploading a zip of this repo's files; there is no build step.
- Secrets live only in Netlify environment variables: `RESEND_API_KEY`, `FROM_EMAIL`, `CLAUDE_API_KEY`, `OWNER_EMAIL`, optional `SHUTTLE_MODEL`, `SHUTTLE_PER_PERSON_DAY`, `SHUTTLE_ALL_DAY`, `ALLOW_SIGNUPS`. Never commit a key, password or token.

## Rules that always apply

- **Accessibility first (WCAG 2.1 AA or better):** 4.5:1 text contrast in every theme, full keyboard use, visible focus, screen-reader labels, reduced motion respected, captions on video, no information by color alone. Keep the Display settings working (text size, dyslexia-friendly fonts, wide spacing, high contrast, dark mode).
- **Large, phone-friendly text.** Lindy is over 50 and many members read on phones. Never shrink text to fit; reflow instead.
- **Plain words.** One idea at a time, short sentences, every term explained.
- **Shuttle teaches with tappable choices** (2 to 4 per message; the home screen shows all five paths). Members can always type or speak instead, but never face an empty box.
- **Substack's rules:** no scraping, no auto-posting Notes, no automated messages or recommendations, no tools that need a member's password. Shuttle offers reminders instead.
- **Culture:** generosity first, meeting different kinds of people, celebration badges for firsts. No cliques, rankings or follower-count bragging.
- **Faith-friendly, never preachy.** Scripture in NKJV wording, no version label, used sparingly.
- **Brand:** The Connected Collective turquoise (#40E0D0) and cream (#F7F3EA) with Substack orange (#FF6719); the CS monogram (turquoise C linked with orange S on a charcoal tile) sits in the app's top corner. Shuttle is a boy weaver bird carrying a turquoise thread.
- **Don't** add Instagram or other social links, use Flodesk, or show Lindy's city or state anywhere.

## How to work in this repo

1. Before changing anything, read the last few `docs/BUILD-LOG.md` entries.
2. Work on a branch and open a pull request for Lindy; `main` is what's live.
3. After each working session, add a dated entry to `docs/BUILD-LOG.md` (what changed, why, what's next) and record any new lasting choice in `docs/DECISIONS.md`.
4. Test in a browser at phone width (390 px) and desktop before calling anything done, including keyboard-only use.
