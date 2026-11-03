# ConnectStack (Free Beta)

ConnectStack helps Substack writers grow with AI, one tappable step at a time. Its coach, **Shuttle** the weaver bird, teaches AI prompting, hand-offs, simple automation and building your own AI helper, then helps you practice on a real collab with another writer.

Live at **connectstack.app**. Made by Lindy Grace, LLC.

## What's inside

| Path | What it is |
| --- | --- |
| `public/` | The app people use (one HTML page, plus voice, lessons, offline support and icons) |
| `netlify/functions/api.mjs` | Sign-in by email code, saved data, Shuttle's AI replies and the owner's admin view |
| `netlify.toml` | Netlify settings |
| `docs/DECISIONS.md` | Every lasting choice and why |
| `docs/BUILD-LOG.md` | What changed in each work session |
| `CLAUDE.md` | Instructions for AI helpers working on this code |

## Deploying

1. Download this repository as a zip (Code, then Download ZIP).
2. In Netlify (the team under clclindyb21@gmail.com), open the ConnectStack site and drag the unzipped folder onto Deploys.
3. Environment variables (Site configuration, then Environment variables): `RESEND_API_KEY`, `FROM_EMAIL`, `CLAUDE_API_KEY`, `OWNER_EMAIL`. Optional: `SHUTTLE_MODEL`, `SHUTTLE_PER_PERSON_DAY`, `SHUTTLE_ALL_DAY`, `ALLOW_SIGNUPS`.

## Accessibility

ConnectStack aims for WCAG 2.1 AA or better: large, adjustable text, dyslexia-friendly fonts, wide spacing, high contrast and dark mode, full keyboard use, screen-reader labels, voice input and read-aloud, and reduced motion.
