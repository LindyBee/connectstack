/* ConnectStack (Free Beta): the small server behind the app.
   Every request is POST /api?a=<action> with a JSON body.
   Settings live in Netlify's environment variables (see the install steps), never in this file. */

import { createHmac, randomBytes, randomInt, timingSafeEqual, createHash } from "node:crypto";

export const config = { path: "/api" };

const SESSION_DAYS = 30, CODE_MINUTES = 15;
const env = (k, d = "") => {
  try { if (globalThis.Netlify && Netlify.env && Netlify.env.get(k) != null) return Netlify.env.get(k); } catch (e) {}
  return process.env[k] ?? d;
};
const now = () => Math.floor(Date.now() / 1000);

/* ---------- storage: Netlify Blobs (a local folder when testing) ---------- */
let storePromise = null;
async function store() {
  if (!storePromise) storePromise = (async () => {
    if (process.env.CS_DEV_STORE) return devStore(process.env.CS_DEV_STORE);
    const { getStore } = await import("@netlify/blobs");
    return getStore({ name: "connectstack", consistency: "strong" });
  })();
  return storePromise;
}
async function devStore(dir) {
  const fs = await import("node:fs/promises"), path = await import("node:path");
  const file = k => path.join(dir, encodeURIComponent(k));
  await fs.mkdir(dir, { recursive: true });
  return {
    async get(k) { try { return JSON.parse(await fs.readFile(file(k), "utf8")); } catch (e) { return null; } },
    async setJSON(k, v, o = {}) {
      if (o.onlyIfNew) { try { await fs.access(file(k)); return { modified: false }; } catch (e) {} }
      await fs.writeFile(file(k), JSON.stringify(v)); return { modified: true };
    },
    async delete(k) { try { await fs.unlink(file(k)); } catch (e) {} },
    async list({ prefix }) { const all = await fs.readdir(dir); return { blobs: all.map(decodeURIComponent).filter(k => k.startsWith(prefix)).map(key => ({ key })) }; },
  };
}
const getJ = async k => (await store()).get(k, { type: "json" });
const setJ = async (k, v, o) => (await store()).setJSON(k, v, o);
const del = async k => (await store()).delete(k);
const keys = async prefix => ((await (await store()).list({ prefix })).blobs || []).map(b => b.key);

/* ---------- helpers ---------- */
class Fail extends Error { constructor(msg, status = 400, code = "bad_request") { super(msg); this.status = status; this.code = code; } }
const fail = (m, s, c) => { throw new Fail(m, s, c); };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
let SECRET = null;
async function secret() {
  if (SECRET) return SECRET;
  const fromEnv = env("SESSION_SECRET");
  if (fromEnv.length >= 32) return (SECRET = fromEnv);
  await setJ("config/secret", { v: randomBytes(32).toString("hex") }, { onlyIfNew: true });   // made once, then reused
  return (SECRET = (await getJ("config/secret")).v);
}
const hmac = async v => createHmac("sha256", await secret()).update(v).digest("hex");
const sha = v => createHash("sha256").update(v).digest("hex").slice(0, 40);
const str = (v, max) => String(typeof v === "string" || typeof v === "number" ? v : "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
const list = (v, maxItems, maxLen) => Array.isArray(v) ? [...new Set(v.filter(x => typeof x === "string" && x && x.length <= maxLen && /^[\p{L}0-9 &\-]+$/u.test(x)))].slice(0, maxItems) : [];
const cleanEmail = e => { e = str(e, 254).toLowerCase(); return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(e) ? e : ""; };
function cleanUrl(u) {
  u = str(u, 300); if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  u = u.replace(/^http:\/\//i, "https://");
  try { const x = new URL(u); return x.protocol === "https:" && x.hostname.includes(".") && /^https:\/\/[^\s"'<>]+$/.test(u) ? u : ""; } catch (e) { return ""; }
}
const ownerEmail = () => (env("OWNER_EMAIL", "lindyb34@gmail.com") || "").toLowerCase();
const newId = () => randomInt(1, 2147483646);
async function tooMany(key, limit, seconds) {
  const k = "rl/" + sha(key), t = now();
  const r = (await getJ(k)) || { ts: [] };
  const recent = (r.ts || []).filter(x => x > t - seconds);
  if (recent.length >= limit) return true;
  recent.push(t); await setJ(k, { ts: recent.slice(-200) });
  return false;
}
const publicProfile = m => ({ name: m.profile.name, pub: m.profile.pub, url: m.profile.url, bio: m.profile.bio, size: m.profile.size, themes: m.profile.themes, open: m.profile.open });
function emptyMember(id, email) {
  return { id, email, created: now(), last_seen: now(), listed: true, profile: { name: "", pub: "", url: "", bio: "", size: 0, themes: [], open: [] } };
}
function seedOwner(m) {
  // The first profile in the directory: Lindy's real account. She can change it anytime in My profile.
  m.profile = { name: "Lindy", pub: "The Connected Collective", url: "https://lindygrace.substack.com",
    bio: "Mindset mastery and wellness for Christian women and Substack writers who want to grow their businesses with AI without losing what matters most.",
    size: 0, themes: ["Faith and Spirituality", "Business", "Tech", "Education", "Finance", "Parenting"], open: ["live", "guest", "interview", "workshop", "recswap"] };
  m.listed = true; return m;
}
async function member(req, required = true) {
  const tok = (req.headers.get("x-cs-token") || (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "")).trim();
  const out = () => { if (required) fail("Please sign in again.", 401, "session_expired"); return null; };
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(tok)) return out();
  const th = await hmac(tok), s = await getJ("s/" + th);
  if (!s || s.expires < now()) return out();
  const m = await getJ("m/" + s.id);
  if (!m) return out();
  if (now() - m.last_seen > 300) { m.last_seen = now(); await setJ("m/" + m.id, m); }
  m._th = th; return m;
}
async function sendCode(to, code) {
  if (process.env.CS_DEV_MAIL) { (await import("node:fs")).appendFileSync(process.env.CS_DEV_MAIL, JSON.stringify({ to, subject: `Your ConnectStack sign-in code: ${code}` }) + "\n"); return true; }
  const key = env("RESEND_API_KEY"), from = env("FROM_EMAIL");
  if (!key || !from) return false;
  const app = env("APP_URL", "https://connectstack.app");
  const r = await fetch(env("CS_DEV_RESEND_URL", "https://api.resend.com/emails"), {
    method: "POST", headers: { authorization: "Bearer " + key, "content-type": "application/json" },
    body: JSON.stringify({ from: `ConnectStack <${from}>`, to: [to], subject: `Your ConnectStack sign-in code: ${code}`,
      text: `Hi there,\n\nYour ConnectStack sign-in code is:\n\n    ${code}\n\nIt works for ${CODE_MINUTES} minutes. If you didn't ask for it, you can ignore this email.\n\nConnectStack (Free Beta)\n${app}\n` }),
  }).catch(() => null);
  if (!r || !r.ok) { console.error("Resend error", r && r.status, r && (await r.text().catch(() => "")).slice(0, 200)); return false; }
  return true;
}
async function deleteMember(m) {
  const id = m.id;
  for (const k of await keys(`pr/${id}/`)) { const r = await getJ(k); if (r) await del(`po/${r.from}/${r.collab}`); await del(k); }
  for (const k of await keys(`po/${id}/`)) { const r = await getJ(k); if (r) await del(`pr/${r.to}/${r.rid}`); await del(k); }
  for (const k of await keys(`si/${id}/`)) { await del("s/" + k.split("/").pop()); await del(k); }
  await del(`st/${id}`); await del(`e/${sha(m.email)}`); await del(`code/${sha(m.email)}`); await del(`m/${id}`);
}
async function allMembers() {
  const ks = await keys("m/"), out = [];
  for (let i = 0; i < ks.length; i += 25) out.push(...(await Promise.all(ks.slice(i, i + 25).map(getJ))).filter(Boolean));
  return out;
}

/* ---------- actions ---------- */
async function route(a, req, b) {
  const t = now(), ip = (req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  switch (a) {
  case "code": {
    const email = cleanEmail(b.email);
    if (!email) fail("Enter an email like name@example.com.");
    if (await tooMany("ip:" + ip, 12, 3600) || await tooMany("em:" + email, 4, 900)) fail("Too many codes requested. Please wait 15 minutes and try again.", 429, "rate_limited");
    const exists = await getJ("e/" + sha(email));
    if (!exists && env("ALLOW_SIGNUPS", "true") === "false" && email !== ownerEmail()) fail("New sign-ups are paused right now. Please check back soon.", 403, "closed");
    const code = String(randomInt(0, 1000000)).padStart(6, "0");
    await setJ("code/" + sha(email), { hash: await hmac(email + "|" + code), expires: t + CODE_MINUTES * 60, tries: 0 });
    if (!(await sendCode(email, code))) fail("We couldn’t send the email. Please try again in a minute.", 502, "mail");
    return { ok: true };
  }
  case "verify": {
    const email = cleanEmail(b.email), code = String(b.code || "").replace(/\D/g, "");
    if (!email || code.length !== 6) fail("Enter the 6-digit code from your email.");
    if (await tooMany("vip:" + ip, 40, 3600)) fail("Too many tries. Please wait a little while.", 429, "rate_limited");
    const ck = "code/" + sha(email), c = await getJ(ck);
    if (!c || c.expires < t) fail("That code has expired. Ask for a new one.", 400, "expired");
    if (c.tries >= 5) { await del(ck); fail("Too many tries. Ask for a new code.", 429, "rate_limited"); }
    const want = Buffer.from(c.hash), got = Buffer.from(await hmac(email + "|" + code));
    if (want.length !== got.length || !timingSafeEqual(want, got)) { c.tries++; await setJ(ck, c); fail("That code didn’t match. Check the newest email and try again.", 400, "wrong_code"); }
    await del(ck);
    let isNew = false, ref = await getJ("e/" + sha(email));
    if (!ref) {
      const id = newId(), made = await setJ("e/" + sha(email), { id }, { onlyIfNew: true });
      if (made.modified === false) ref = await getJ("e/" + sha(email));
      else { let m = emptyMember(id, email); if (email === ownerEmail()) m = seedOwner(m); await setJ("m/" + id, m); await setJ("st/" + id, {}); ref = { id }; isNew = true; }
    }
    const token = randomBytes(32).toString("base64url"), exp = t + SESSION_DAYS * 86400, th = await hmac(token);
    await setJ("s/" + th, { id: ref.id, expires: exp }); await setJ(`si/${ref.id}/${th}`, { expires: exp });
    return { token, exp: exp * 1000, isNew };
  }
  case "signout": {
    const m = await member(req, false);
    if (m) { await del("s/" + m._th); await del(`si/${m.id}/${m._th}`); }
    return { ok: true };
  }
  case "me": {
    const m = await member(req);
    const writers = (await allMembers()).filter(w => w.id !== m.id && w.listed && w.profile && w.profile.name)
      .sort((x, y) => y.last_seen - x.last_seen).slice(0, 2000)
      .map(w => ({ id: w.id, ...publicProfile(w), active: Math.max(0, Math.floor((t - w.last_seen) / 86400)), newMember: t - w.created < 30 * 86400 }));
    const incoming = (await Promise.all((await keys(`pr/${m.id}/`)).map(getJ))).filter(r => r && r.status === "pending")
      .sort((x, y) => y.created - x.created).slice(0, 20)
      .map(r => ({ id: r.rid, ptype: r.ptype, ctype: r.ctype, name: r.fromName, pub: r.fromPub }));
    const answered = (await Promise.all((await keys(`po/${m.id}/`)).map(getJ))).filter(r => r && r.status !== "pending").map(r => ({ collab: r.collab, status: r.status }));
    const state = await getJ("st/" + m.id);
    const me = { id: m.id, email: m.email, owner: m.email === ownerEmail(), listed: m.listed !== false, profile: m.profile };
    return { me, state: state && Object.keys(state).length ? state : null, writers, incoming, answered };
  }
  case "save": {
    const m = await member(req);
    let changed = false;
    if (b.profile && typeof b.profile === "object") {
      const p = b.profile;
      m.profile = { name: str(p.name, 80), pub: str(p.pub, 120), url: cleanUrl(p.url), bio: str(p.bio, 2000),
        size: Math.max(0, Math.min(100000000, parseInt(p.size) || 0)), themes: list(p.themes, 27, 40), open: list(p.open, 12, 20) };
      changed = true;
    }
    if ("listed" in b) { m.listed = !!b.listed; changed = true; }
    if (changed) { delete m._th; await setJ("m/" + m.id, m); }
    if (b.state && typeof b.state === "object" && !Array.isArray(b.state)) {
      const s = JSON.stringify(b.state);
      if (s.length > 300000) fail("Your calendar is too large to save. Delete some old collabs and try again.", 413);
      await setJ("st/" + m.id, b.state);
    }
    return { ok: true };
  }
  case "partner": {
    const m = await member(req), op = b.op;
    if (op === "request") {
      const to = parseInt(b.to) || 0, collab = str(b.collab, 40), ptype = ["copub", "business", "hire"].includes(b.ptype) ? b.ptype : "";
      const ctype = /^[a-z]{2,12}$/.test(String(b.ctype || "")) ? b.ctype : "other";
      if (!to || to === m.id || !/^[A-Za-z0-9_-]{1,40}$/.test(collab) || !ptype) fail("That request is missing details.");
      if (!(await getJ("m/" + to))) fail("That writer isn’t on ConnectStack anymore.", 404);
      if (await tooMany("pr:" + m.id, 20, 86400)) fail("You’ve sent a lot of requests today. Try again tomorrow.", 429, "rate_limited");
      const old = await getJ(`po/${m.id}/${collab}`); if (old) await del(`pr/${old.to}/${old.rid}`);
      const rid = newId(), rec = { rid, from: m.id, to, collab, ptype, ctype, status: "pending", created: t, fromName: m.profile.name || "A ConnectStack writer", fromPub: m.profile.pub || "" };
      await setJ(`pr/${to}/${rid}`, rec); await setJ(`po/${m.id}/${collab}`, rec);
      return { ok: true };
    }
    if (op === "confirm" || op === "decline") {
      const rid = parseInt(b.id) || 0, rec = await getJ(`pr/${m.id}/${rid}`);
      if (!rec || rec.status !== "pending") fail("That request was already answered.", 404);
      rec.status = op === "confirm" ? "confirmed" : "declined";
      await setJ(`pr/${m.id}/${rid}`, rec); await setJ(`po/${rec.from}/${rec.collab}`, rec);
      return { ok: true };
    }
    if (op === "cancel") {
      const collab = str(b.collab, 40), old = await getJ(`po/${m.id}/${collab}`);
      if (old) { await del(`pr/${old.to}/${old.rid}`); await del(`po/${m.id}/${collab}`); }
      return { ok: true };
    }
    fail("Unknown request.");
  }
  case "shuttle": {
    const m = await member(req), key = env("CLAUDE_API_KEY");
    if (!/^sk-ant-/.test(key)) fail("Shuttle isn’t switched on yet.", 503, "not_granted");
    const day = new Date().toISOString().slice(0, 10);
    const mine = (await getJ(`u/${day}/${m.id}`)) || { n: 0 }, all = (await getJ(`u/${day}/all`)) || { n: 0 };
    if (mine.n >= +env("SHUTTLE_PER_PERSON_DAY", "25") || all.n >= +env("SHUTTLE_ALL_DAY", "600")) fail("Shuttle needs a rest for today.", 429, "rate_limited");
    const context = str(b.context, 12000), msgs = [];
    for (const x of (Array.isArray(b.messages) ? b.messages : []).slice(-12)) {
      if (!x || typeof x !== "object") continue;
      const role = x.role === "assistant" ? "assistant" : "user", c = str(x.content, 4000);
      if (!c) continue;
      if (msgs.length && msgs[msgs.length - 1].role === role) { msgs[msgs.length - 1].content += "\n\n" + c; continue; }
      msgs.push({ role, content: c });
    }
    while (msgs.length && msgs[0].role !== "user") msgs.shift();
    if (!msgs.length || msgs[msgs.length - 1].role !== "user") fail("Ask Shuttle a question first.");
    const system = "You are Shuttle, the AI coach inside ConnectStack (Free Beta), which helps Substack writers learn to use AI step by step (prompting, hand-offs, automation, building an AI helper) and put it to work on real collabs. "
      + "Be warm, practical and brief. You are an AI coach: say so if asked, and never pretend to be human. Never claim to send messages for the member. "
      + "Only use what the member shares below. Stay on writing, collaboration, growing a publication, and using AI tools for that work; politely decline anything else.\n\n"
      + "MEMBER CONTEXT (written by the member's app):\n" + context;
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 9000);
    let r;
    try {
      r = await fetch(env("CS_DEV_CLAUDE_URL", "https://api.anthropic.com/v1/messages"), { method: "POST", signal: ctl.signal,
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: env("SHUTTLE_MODEL", "claude-haiku-5-5"), max_tokens: 700, system, messages: msgs }) });
    } catch (e) { fail(e.name === "AbortError" ? "Shuttle took too long. Try a shorter question." : "Shuttle couldn’t connect. Please try again.", 502, "network"); }
    finally { clearTimeout(timer); }
    if (r.status === 429 || r.status === 529) fail("Shuttle is busy. Please try again in a minute.", 429, "rate_limited");
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) { console.error("Claude error", r.status, JSON.stringify(j).slice(0, 200)); fail("Shuttle had a problem. Please try again.", 502, "network"); }
    const text = (j.content || []).filter(p => p.type === "text").map(p => p.text).join("");
    mine.n++; all.n++; await setJ(`u/${day}/${m.id}`, mine); await setJ(`u/${day}/all`, all);
    return { text, truncated: j.stop_reason === "max_tokens" };
  }
  case "delete": {
    const m = await member(req);
    await deleteMember(m);
    return { ok: true };
  }
  case "admin": {   // owner only: member list, setup check, remove a member
    const m = await member(req);
    if (m.email !== ownerEmail()) fail("Not allowed.", 403, "forbidden");
    if (b.op === "remove") {
      const id = parseInt(b.id) || 0, x = id && id !== m.id ? await getJ("m/" + id) : null;
      if (!x) fail("That member is already gone.", 404);
      await deleteMember(x); return { ok: true };
    }
    const members = (await allMembers()).sort((x, y) => y.created - x.created)
      .map(x => ({ id: x.id, email: x.email, name: x.profile.name, pub: x.profile.pub, url: x.profile.url || "", listed: x.listed !== false, created: x.created * 1000, lastSeen: x.last_seen * 1000, you: x.id === m.id }));
    const day = new Date().toISOString().slice(0, 10), all = (await getJ(`u/${day}/all`)) || { n: 0 };
    return { members, setup: { shuttle: /^sk-ant-/.test(env("CLAUDE_API_KEY")), email: !!(env("RESEND_API_KEY") && env("FROM_EMAIL")), signups: env("ALLOW_SIGNUPS", "true") !== "false" }, shuttleToday: all.n };
  }
  }
  fail("Unknown request.", 404);
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST.", code: "bad_request" }, 405);
  const a = new URL(req.url).searchParams.get("a") || "";
  let b = {};
  try { const raw = await req.text(); if (raw.length > 400000) return json({ error: "Too much data.", code: "bad_request" }, 413); b = raw ? JSON.parse(raw) : {}; if (!b || typeof b !== "object") b = {}; } catch (e) { b = {}; }
  try { return json(await route(a, req, b)); }
  catch (e) {
    if (e instanceof Fail) return json({ error: e.message, code: e.code }, e.status);
    console.error("ConnectStack:", e);
    return json({ error: "Something went wrong on the server. Please try again.", code: "server" }, 500);
  }
};
