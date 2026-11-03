# ConnectStack build log

Newest entry first. Each entry: what changed, why, and what's next.

## 2026-11-03 · Shuttle is home, with five paths (branch `shuttle-five-paths`)

**What changed**
- Shuttle is now the first tab and opens when you sign in. The old home tab is renamed "My collabs".
- "Choose a path" shows the five paths as a circle on wide screens. On phones, at large text sizes, or with no room for the circle, it becomes a simple list with big text. Each path shows its lesson count and your progress, and path 5 (Practice a collab) is outlined in orange.
- New `public/shuttle-paths.js` holds 29 scripted lessons: Prompting 6, Hand-offs 5, Automation 5, Your AI helper 6, Practice a collab 7. Each lesson runs as Learn, then See an example, then Try it, all with 2 to 4 tappable choices in the chat ("Show me an example", "Let me try", "I did it", "Help me with this", "Skip for now", "Back to the paths").
- Progress is saved on the device (localStorage) and survives a reload. Toasts celebrate the first lesson and each finished path. Sign out and "Delete my data" clear it.
- When a member types a try, Shuttle's AI gets the current lesson as context. In basic mode (no AI), Shuttle gives a ready-made self-check for the lesson.
- Choices are disabled while Shuttle is thinking. Keyboard focus moves to the first new choice, and "Back to the paths" returns focus to the "Choose a path" heading.
- Fixed the microphone header in `netlify.toml` to `microphone=(self)`, matching `_headers`.
- Broadened Shuttle's AI instructions in `api.mjs` to cover prompting, hand-offs, automation and AI helpers.
- `sw.js` cache is now `connectstack-2` and caches `shuttle-paths.js`, so lessons work offline.
- Dark mode is now espresso: warm brown backgrounds (#241A17 page, #3A2B27 cards) with cream text, turquoise links and orange accents. Neutral tags stay cream so their dark text still reads. The phone's top bar matches in dark mode. High-contrast dark mode is unchanged (pure black and white). Checked every visible text color: all pass 4.5:1.
- Removed the heart from the end of Shuttle's thread in the large Shuttle picture (Lindy asked). The thread now ends in a loose curl. The small round avatar never had the heart.

**Tested** in Chromium at 1280 px and 390 px, and at XL text: no overlapping path cards, no sideways scrolling, no script errors, and focus and saved progress behaved as expected. Tested locally without a Claude key, so AI replies used basic mode.

**Next**
- Lindy reviews the lesson wording in `shuttle-paths.js`.
- Save path progress to the member's account (Netlify Blobs) so it follows them across devices.
- The ART prompt builder, My Prompt Library, the hand-off note template and the automation switches.

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
