# ConnectStack build log

Newest entry first. Each entry: what changed, why, and what's next.

## 2026-11-03 · Moved into GitHub, started Shuttle's five paths

**What changed**
- Created the repository from the newest files in Lindy's Downloads: the `public/` site from the "ConnectStack site files" folder (Nov 1, with voice read-aloud and input) and the Netlify function and config from `connectstack-netlify (1).zip` (Oct 31, with Resend sign-in codes). Checked for secrets first; there are none in the code.
- Added `CLAUDE.md`, `docs/DECISIONS.md` and this build log, so every future session starts with the full history.

**Found while reading the code**
- `netlify.toml` sends `Permissions-Policy: microphone=()`, which blocks the microphone, while `public/_headers` allows it (`microphone=(self)`). If Netlify sends the stricter one, "Speak your question" can't work. Fixed on the Shuttle branch.

**Earlier history (before GitHub, from Lindy's chats)**
- Oct 16 to 17: built the prototype with Shuttle the weaver bird as the collab coach, celebration badges and Display settings. Lindy's own Shuttle artwork replaced the drawn bird, with a fly-in animation that respects reduced motion.
- Oct 28 to 31: landing page, Netlify version with sign-in by email code (Resend), member database and email CSV, owner admin view, and the connectstack.app domain.
- Nov 1: voice read-aloud and voice input (`voice.js`), walkthrough and accessibility videos with captions.
- Nov 3: Lindy decided Shuttle becomes the home screen with five tappable paths (see `docs/DECISIONS.md`).

**Next**
- Build Shuttle's home screen: the five paths as a circle, scripted lessons with tappable choices, and progress that's saved.
- Then: the ART prompt builder, My Prompt Library, the hand-off note template, and the automation switches.
- Later: Shuttle's recorded character voice, music and narration.
