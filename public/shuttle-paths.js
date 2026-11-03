/* Shuttle's five paths: scripted lessons from Lindy's "Shuttle Guide: AI Prompting, Hand-offs, and Automation".
   Every lesson follows the same rhythm: Learn (one idea), See (one example), Try (the member does it), Choose (what's next).
   Text uses the app's light formatting: blank line = new paragraph, "- " = bullet, "1. " = numbered, **bold**.
   Keep sentences short and plain. Never describe a Substack or tool feature that isn't confirmed; point to the help center instead.

   Lesson fields:
     id, title, learn, see, try   (required)
     extra: { label, text }        an optional extra button on the example step
     ask                           what "Help me with this" sends to Shuttle's AI (a sensible default is used if missing)
*/
window.SHUTTLE_PATHS = [
  {
    id: "prompt", n: 1, title: "Prompting", short: "Write clear prompts with ART",
    intro: "A prompt is what you type to an AI tool. You'll learn the ART framework: **A**ct as, **R**equest, and **T**erms. It's 6 short lessons.",
    check: [
      "Does it say who the AI should act as?",
      "Is there one clear task?",
      "Did you add terms: length, tone, who it's for, and format?"
    ],
    lessons: [
      { id: "what", title: "What a prompt is",
        learn: "A prompt is the instructions you give an AI tool. Think of it like briefing a helpful assistant who has never met you. The clearer you are, the better the help.",
        see: "A vague prompt:\n\"Give me ideas.\"\n\nA clear prompt:\n\"Give me 3 ideas for a short Substack Note about my writing week.\"",
        try: "Open the AI tool you use, like Claude or ChatGPT. Ask it for 3 Note ideas for your Substack, and notice what comes back.",
        ask: "Help me write my very first prompt asking an AI tool for 3 Substack Note ideas. Ask me what my newsletter is about first." },
      { id: "act", title: "Act as",
        learn: "Telling the AI who to be changes how it answers. This is the A in ART: **Act as**.",
        see: "\"Act as a friendly Substack growth coach. Give me 3 Note ideas for my newsletter about gardening and faith.\"",
        extra: { label: "Show me the difference", text: "Without a role, AI often gives general ideas, like \"Share a tip\" or \"Ask a question.\"\n\nWith \"Act as a Substack growth coach,\" it tends to get specific, like \"Share the one garden mistake that taught you patience, and ask readers for theirs.\"\n\nThe role gives the AI a point of view." },
        try: "Ask for Note ideas twice: once on its own, and once starting with \"Act as a Substack growth coach.\" Which answer fits you better?" },
      { id: "request", title: "Request",
        learn: "The R in ART is your **Request**: the one task you want done. One clear task beats three fuzzy ones.",
        see: "Fuzzy:\n\"Help with my newsletter and maybe Notes and growth.\"\n\nClear:\n\"Write a 2-sentence Note inviting readers to this week's post.\"",
        try: "Think of something you'd like help with this week. Rewrite it as one clear task that starts with a verb, like Write, List, or Explain." },
      { id: "terms", title: "Terms",
        learn: "The T in ART is **Terms**: the details that shape the answer. Length, tone, who it's for, and the format you want.",
        see: "\"Act as a Substack growth coach. Write a Note inviting readers to my new post. Terms: 2 sentences, warm tone, for Christian women who write, no hashtags.\"",
        try: "Write a full ART prompt for a 2-sentence Note, then try it in your AI tool." },
      { id: "fix", title: "Fix a weak answer",
        learn: "The first answer is a draft, not the final word. Short follow-ups make it better.",
        see: "Follow-ups you can use:\n- Make it shorter.\n- Make it warmer and more personal.\n- Use this real example from my week: (add yours).\n- Give me 3 more options.",
        try: "Take one AI answer you didn't love, and improve it with 2 follow-up prompts." },
      { id: "save", title: "Save and reuse",
        learn: "When a prompt works, keep it. A saved prompt turns a 10-minute task into a 1-minute task.",
        see: "Give each saved prompt a clear name, like \"Weekly Note invite\" or \"Thank-you after a collab.\" Keep them in one place, like a note on your phone.",
        try: "Save your 3 favorite prompts somewhere you'll find them again." }
    ]
  },
  {
    id: "handoff", n: 2, title: "Hand-offs", short: "Pass work between you and AI",
    intro: "A hand-off is passing work from one step to the next: from you to an AI, from one AI tool to another, and back to you to check. It's 5 short lessons.",
    check: [
      "Does the next step know the goal and the audience?",
      "Did you say what's already done and what's next?",
      "Is there a step where a person checks the work?"
    ],
    lessons: [
      { id: "what", title: "What a hand-off is",
        learn: "Work moves in steps. Each step needs the right information from the step before it.",
        see: "A weekly Note, step by step:\n1. You choose the topic.\n2. AI drafts the Note.\n3. You check it and post it.",
        try: "Pick one task you do every week. List its steps, one line each." },
      { id: "note", title: "The hand-off note",
        learn: "A good hand-off carries everything the next step needs, so nothing gets lost. A short hand-off note does that.",
        see: "**Goal:** invite readers to Sunday's post\n**Audience:** my subscribers, mostly writers\n**Done so far:** the post is written\n**Next step:** draft a 2-sentence Note\n**Check:** I review the tone before posting",
        try: "Write a hand-off note for a Note idea of your own, using those 5 lines." },
      { id: "chain", title: "AI to AI",
        learn: "You can chain tools together. One AI drafts, a design tool makes the graphic, and you post it. Each step gets a clear hand-off.",
        see: "1. Claude or ChatGPT turns your article into a short Note.\n2. Canva turns the Note's key line into a graphic.\n3. You post or schedule the Note on Substack.",
        try: "Turn one of your articles into a Note and a simple graphic, passing the words from one tool to the next." },
      { id: "check", title: "Back to you",
        learn: "Some things always need a person: facts, names, tone, and anything about faith or Scripture. Build a check step into every chain.",
        see: "Before posting, check:\n- Are the facts and numbers right?\n- Are names spelled right?\n- Does it sound like me?\n- Is any Scripture quoted correctly?",
        try: "Add a \"check before posting\" step to the chain you made in the last lesson." },
      { id: "partner", title: "Hand off to a partner",
        learn: "In a collab, a clear plan lets your partner pick up their part without a dozen messages.",
        see: "**Format:** Live\n**Date and time:** Thursday, 7 p.m.\n**Topic:** writing with a full-time job\n**Talking points:** 3 each\n**Who promotes what:** we each post 2 Notes",
        try: "Fill in a collab plan like that one, for a real or pretend partner." }
    ]
  },
  {
    id: "auto", n: 3, title: "Automation", short: "Let the repeats run on their own",
    intro: "An automation is something that happens on its own after you set it up once. Automate the repeat, and keep the relationship personal. It's 5 short lessons.",
    check: [
      "Is this a task that repeats?",
      "Does it stay personal where it matters, like thank-yous and replies?",
      "Does the tool connect safely, without your password?"
    ],
    lessons: [
      { id: "when", title: "When to automate",
        learn: "Automate the tasks that repeat. Keep the personal ones personal.",
        see: "Good to automate: reminders, scheduling, sorting.\n\nKeep personal: thank-yous, first messages, and replies to comments.",
        try: "List 5 tasks you do each week. Mark each one \"automate\" or \"keep personal.\"" },
      { id: "schedule", title: "Schedule ahead",
        learn: "Scheduling means writing now and publishing later. Start with the scheduling built into Substack. Its help center shows how it works today.",
        see: "Write 3 Notes on Monday. Then schedule them for Tuesday, Thursday, and Saturday.",
        try: "Schedule one post or Note for next week." },
      { id: "remind", title: "Reminders",
        learn: "Reminders keep your promises on track without holding everything in your head.",
        see: "Set a reminder 2 days before a collab to confirm the time, and 1 day after to send a thank-you.",
        try: "Add a reminder for your next collab or publish day in your phone's calendar." },
      { id: "repurpose", title: "Repurpose with a chain",
        learn: "One article can become several Notes with a prompt chain you reuse every week.",
        see: "**Prompt 1:** List the 3 strongest ideas in this article.\n**Prompt 2:** Turn each idea into a 2-sentence Note in my voice.\n**Then:** you check them and schedule them.",
        try: "Run this chain on one of your articles, and save both prompts." },
      { id: "safe", title: "Is it safe?",
        learn: "Before you connect a tool, check how it connects. Official connections are safer than tools that ask for your password.",
        see: "Safe signs:\n- It uses an official Connect or Sign in button.\n\nWarning signs:\n- It asks for your Substack password.\n- It promises to post or send messages for you automatically. That goes against Substack's rules.",
        try: "Check how one tool you use connects to your accounts." }
    ]
  },
  {
    id: "helper", n: 4, title: "Your AI helper", short: "Build a helper for one job",
    intro: "An AI helper is a saved assistant for one job you repeat, like a Claude Project or a custom GPT. You'll build a Notes helper together. It's 6 short lessons.",
    check: [
      "Does the helper have one clear job?",
      "Does it have a role and a few rules?",
      "Did you leave private details out of its files?"
    ],
    lessons: [
      { id: "basics", title: "Helper basics",
        learn: "One helper, one job. A narrow helper beats one that tries to do everything.",
        see: "Good: a Notes helper that turns each new post into 3 Notes.\n\nToo broad: a helper that runs my whole business.",
        try: "Pick one weekly job you'd hand to a helper." },
      { id: "role", title: "Give it a role",
        learn: "Turn your best ART prompt into standing instructions, so you never retype them.",
        see: "\"You are my Notes helper. When I share a new post, write 3 short Notes in my voice. Rules: no hashtags, end one Note with a question, never make up facts.\"",
        try: "Write your helper's role and 3 rules." },
      { id: "files", title: "Add your files",
        learn: "Reference material makes answers fit you. Add a few pieces that show your work.\n\nLeave out private details, other people's information, and anything confidential.",
        see: "Add your About page and 2 past posts you love.",
        try: "Add your About page and 2 past posts to your helper." },
      { id: "voice", title: "Your voice guide",
        learn: "A short voice guide helps drafts sound like you.",
        see: "**Tone:** warm and hopeful\n**Words I love:** weave, gather, simple\n**Words to avoid:** hustle, crush it\n**Sentences:** short\n**Faith:** gentle, never preachy",
        try: "Write 5 lines: your tone, words you love, words to avoid, sentence style, and one more thing that's you." },
      { id: "connect", title: "Connect only what it needs",
        learn: "Some helpers can connect to other apps. Connect only what the job needs, and never anything that asks for your password.",
        see: "A Notes helper needs no connections. You just paste in your post.",
        try: "Decide which tool, if any, your helper truly needs." },
      { id: "test", title: "Test and refine",
        learn: "Run real tasks, then fix the instructions wherever the answers miss.",
        see: "Drafts too long? Add a rule: \"Keep each Note short.\"\nSounds stiff? Add an example of a Note you love.",
        try: "Test your helper on 3 real tasks, and improve one rule." }
    ]
  },
  {
    id: "collab", n: 5, title: "Practice a collab", short: "Put it all together", featured: true,
    intro: "Now use every skill on one real project with another writer. You'll leave with a finished collab. It's 7 steps, and you can do any step with me.",
    check: [
      "Did you read their work before reaching out?",
      "Does your message sound like you, not like AI?",
      "Does your partner know the plan and their part?"
    ],
    lessons: [
      { id: "find", title: "Find a partner",
        learn: "Start with Creator Match in your Substack dashboard. Then read a few of a writer's posts before you reach out.",
        see: "Look for a writer whose readers would enjoy your work too, and whose work you'd honestly be glad to share.",
        try: "Pick one writer you'd like to collab with.",
        ask: "Help me decide what to look for when I choose a collab partner from Substack's Creator Match. Ask me about my newsletter first." },
      { id: "message", title: "Write the first message",
        learn: "Use an ART prompt to draft a warm, specific message. Then rewrite it in your own words.",
        see: "\"Hi Grace! Your post on writing before sunrise stayed with me all week. I write about faith and small habits, and I think our readers would enjoy a Live together. Would you be open to it this month?\"",
        try: "Draft your first message, then make it sound like you.",
        ask: "Help me write a warm, short first message to a writer I'd like to collab with. Ask me what I know about them first." },
      { id: "plan", title: "Plan it together",
        learn: "Agree on the format, date, topic, talking points, and who promotes what.",
        see: "**Format:** Live\n**Date and time:** Thursday, 7 p.m.\n**Topic:** writing with a full-time job\n**Talking points:** 3 each\n**Who promotes what:** we each post 2 Notes",
        try: "Fill in your collab plan and share it with your partner.",
        ask: "Help me fill in a collab plan: format, date, topic, talking points, and who promotes what. Ask me one question at a time." },
      { id: "prep", title: "Prep the Live or post",
        learn: "Let AI draft talking points or an outline. Then you review and adjust.",
        see: "1. Your story: why this topic matters to you.\n2. One practical tip each.\n3. A question for viewers.",
        try: "Draft your talking points or outline.",
        ask: "Help me draft talking points for my collab. Ask me the topic and format first." },
      { id: "promote", title: "Promote it",
        learn: "Draft promo Notes for both of you, then post or schedule them.",
        see: "\"This Thursday at 7 p.m., I'm going live with Grace to talk about writing with a full-time job. Bring your questions!\"",
        try: "Draft 2 promo Notes, and schedule or post them.",
        ask: "Help me draft 2 short promo Notes for my collab, one for me and one my partner could post. Ask me the details first." },
      { id: "follow", title: "Follow through",
        learn: "Set reminders before and after, and send a thank-you the day after.",
        see: "\"Thank you for going live with me yesterday! I loved your tip about writing on your lunch break. Let's do it again sometime.\"",
        try: "Set your reminders, and write your thank-you.",
        ask: "Help me write a short, warm thank-you to my collab partner. Ask me one thing I appreciated about them first." },
      { id: "reflect", title: "Celebrate",
        learn: "You did it! Take a minute to look back.",
        see: "- What worked well?\n- What would you try differently next time?\n- Who might you collab with next?",
        try: "Write 2 or 3 lines about what you learned.",
        ask: "Help me reflect on my collab: ask me what worked and what I'd change, one question at a time." }
    ]
  }
];
