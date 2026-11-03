# ConnectStack decisions

Lasting choices, newest last. Each has the date it was decided. Change a decision by adding a new dated line, not by deleting the old one.

## Product

- **2026-10 · Name:** ConnectStack. AI coach named **Shuttle**, after the weaving tool that carries thread across the loom. Character: a weaver bird with a turquoise thread.
- **2026-10 · Sold as a web app** (progressive web app) through Lindy's Stan Store, not the app stores.
- **2026-10 · Free Beta.** Launched as "Free in Beta" with only Lindy's real account; no fake example accounts.
- **2026-10 · Culture built in, not announced:** celebration badges and confetti for firsts (first collab and so on). Repeat collabs with the same person earn nothing extra unless the collab grows into a Substack, business, hire or partnership. No signup pledge, no named cliques or labels.
- **2026-10 · Member emails** are kept in the database with a CSV download for the owner. Email opt-in for marketing will be asked for separately, later.
- **2026-11-03 · Shuttle becomes the home screen.** Substack's free Creator Match (August 2026) now handles matching, so ConnectStack's value is Shuttle teaching AI skills on real collabs. Five paths, drawn as a circle (Lindy's circle-of-fifths idea): 1 Prompting (ART framework), 2 Hand-offs, 3 Automation, 4 Build your AI helper, 5 Practice with a real collab. Feedback that the app was "too complicated" led to tappable choices everywhere.
- **2026-11-03 · ART framework** (from Outskill): **A**ct as (give the AI an identity), **R**equest (the task), **T**erms (instructions, limits and output).
- **2026-11-03 · Voice plans:** Shuttle will get a character voice: a boy, recorded by a voice actor from Lindy's script (https://claude.ai/artifact/MRaLHgfs2HAW2n1BcMfFvd). Music and narration come later; music is off by default with a clear on/off and volume control, and it quiets while Shuttle talks.

## Technical

- **2026-10 · Hosting:** Netlify team under clclindyb21@gmail.com; domain **connectstack.app** (bought as a test until Lindy knows people will use it).
- **2026-10 · Sign-in:** one-time email codes sent with **Resend** (not Flodesk). No passwords.
- **2026-10 · Data:** Netlify Blobs for members, collabs and usage counters.
- **2026-10 · Shuttle's AI:** Claude API from the Netlify function, with a per-person and an all-members daily message limit to control cost. A basic mode with ready-made tips works when the AI isn't available.
- **2026-11-03 · Code lives in GitHub** at LindyBee/connectstack (private). `main` is what's deployed. Work happens on branches with pull requests, and every session is logged in `docs/BUILD-LOG.md`.
- **2026-11-03 · Lessons are scripted, not generated.** Shuttle's five paths run from `public/shuttle-paths.js`, so lessons work offline, cost nothing and say exactly what Lindy approved. The AI is used only when a member asks their own question or wants feedback on a try.

- **2026-11-03 · Path layout:** the circle shows only when there's room. Phones and large text sizes get a one-column list, because big text matters more than the circle.
- **2026-11-03 · Lesson progress** is saved on the device for now (localStorage). Moving it to the member's account is planned.

## Accessibility and brand

- WCAG 2.1 AA minimum, in every theme and in high-contrast mode. Display settings: text size up to 150%, Atkinson Hyperlegible and Lexend fonts, wide spacing, high contrast, dark mode, reduced motion.
- Colors: turquoise #40E0D0 and cream #F7F3EA (The Connected Collective) plus Substack orange #FF6719. Orange is used only as a fill with dark text on it (#141B1C); orange text uses #B03E08 for contrast.
- The CS monogram (turquoise C linked with orange S on a charcoal tile) is the app icon and sits in the top corner.
- Read-aloud should use a warm female voice, the same one as Lindy's Substack article audio, until Shuttle's recorded character voice is ready.
