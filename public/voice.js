/* ConnectStack: Shuttle's voice.
   - "Read aloud" on every Shuttle answer, in the Heart voice (the same voice as the Sunday Stack audio).
     Heart runs on the member's own device using its graphics chip (WebGPU): nothing they read is sent
     anywhere. The voice downloads once (about 330 MB) and is then kept by the browser.
   - On devices without a fast enough graphics chip, or when the member picks "This device" in Display
     settings, Shuttle reads with the device's own voice instead, so Read aloud always works.
   - "Speak your question" fills the question box by voice, where the browser supports it.
   Everything is keyboard and screen-reader friendly, and reading stops when you leave Shuttle. */
(function () {
  "use strict";
  var log = document.getElementById("chatlog");
  var status = document.getElementById("voiceStatus");
  var box = document.getElementById("askText");
  if (!log || !status || !box) return;

  var LIB = "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js";
  var MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
  var VOICE = "af_heart";
  var KEY = "connectstack.voice";
  var DEF = { src: "heart", rate: 1, auto: false };
  var prefs = load();

  function load() {
    var p = { src: DEF.src, rate: DEF.rate, auto: DEF.auto };
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (s && typeof s === "object") {
        if (s.src === "heart" || s.src === "device") p.src = s.src;
        if ([0.85, 1, 1.15].indexOf(s.rate) > -1) p.rate = s.rate;
        p.auto = s.auto === true;
      }
    } catch (e) {}
    return p;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} }
  function say(msg) { status.textContent = msg || ""; }
  function note(msg) { if (typeof toast === "function") toast(msg); }

  /* ---------- turning an answer into speakable text ---------- */
  function speakable(text) {
    return String(text || "")
      .replace(/https?:\/\/\S+/g, "the link")
      .split("\n").map(function (l) {
        l = l.trim().replace(/^[-*•]\s+/, "");
        if (l && !/[.!?:;)"”’]$/.test(l)) l += ".";
        return l;
      }).filter(Boolean).join(" ")
      .replace(/\s+/g, " ").trim();
  }
  function chunks(text, max) {
    var parts = text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) || [text], out = [], cur = "";
    parts.forEach(function (p) {
      p = p.trim(); if (!p) return;
      while (p.length > max) {                       /* very long sentence: break at a comma or space */
        var cut = p.lastIndexOf(", ", max); if (cut < max / 2) cut = p.lastIndexOf(" ", max); if (cut < 1) cut = max;
        if (cur) { out.push(cur); cur = ""; }
        out.push(p.slice(0, cut + 1).trim()); p = p.slice(cut + 1).trim();
      }
      if ((cur + " " + p).length > max && cur) { out.push(cur); cur = p; } else cur = (cur ? cur + " " : "") + p;
    });
    if (cur) out.push(cur);
    return out;
  }

  /* ---------- one audio player, unlocked by the first tap (needed on iPhone) ---------- */
  var player = new Audio();
  player.preload = "auto";
  var SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
  var unlocked = false;
  function unlock() {
    if (unlocked) return; unlocked = true;
    try { player.src = SILENT; var p = player.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }
  ["pointerdown", "keydown", "touchend"].forEach(function (ev) { document.addEventListener(ev, unlock, { capture: true, passive: true }); });

  function wavUrl(samples, rate) {
    var n = samples.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    function str(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    str(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); str(8, "WAVE"); str(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, "data"); v.setUint32(40, n * 2, true);
    for (var i = 0, o = 44; i < n; i++, o += 2) { var x = Math.max(-1, Math.min(1, samples[i])); v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7FFF, true); }
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  }

  /* ---------- Heart: runs in a background worker so the app stays responsive ---------- */
  var worker = null, heartReady = false, heartBroken = false, waiting = {}, nextId = 1, loadPct = -1;
  var WORKER_SRC =
    'import { KokoroTTS } from "' + LIB + '";\n' +
    'let tts = null, loading = null; const files = {};\n' +
    'function progress(p){ if(p && p.status === "progress" && p.file){ files[p.file] = [p.loaded||0, p.total||0];\n' +
    '  let l = 0, t = 0; for (const k in files){ l += files[k][0]; t += files[k][1]; }\n' +
    '  if (t > 2e6) self.postMessage({ type: "progress", pct: Math.floor(l / t * 100) }); } }\n' +
    'async function ready(){ if (tts) return tts; if (!loading) loading = (async () => {\n' +
    '  const g = self.navigator && self.navigator.gpu; const ad = g ? await g.requestAdapter().catch(() => null) : null;\n' +
    '  if (!ad) throw new Error("nogpu");\n' +
    '  return KokoroTTS.from_pretrained("' + MODEL + '", { dtype: "fp32", device: "webgpu", progress_callback: progress }); })().then(m => (tts = m));\n' +
    '  return loading; }\n' +
    'self.onmessage = async (e) => { const m = e.data;\n' +
    '  try { const t = await ready(); if (m.type === "warm") { self.postMessage({ type: "ready" }); return; }\n' +
    '    const a = await t.generate(m.text, { voice: m.voice, speed: m.speed });\n' +
    '    self.postMessage({ type: "audio", id: m.id, audio: a.audio, rate: a.sampling_rate }, [a.audio.buffer]);\n' +
    '  } catch (err) { loading = null; self.postMessage({ type: "error", id: m.id, message: String((err && err.message) || err) }); } };\n';

  function startWorker() {
    if (worker || heartBroken) return worker;
    try {
      var url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
      worker = new Worker(url, { type: "module" });
    } catch (e) { heartBroken = true; return null; }
    worker.onmessage = function (e) {
      var m = e.data || {};
      if (m.type === "progress") {
        heartReady = false;
        if (m.pct >= loadPct + 10 || m.pct === 100) { loadPct = m.pct; say("Getting Shuttle’s voice ready, one time only: " + m.pct + "%"); }
      } else if (m.type === "ready" || m.type === "audio") {
        if (!heartReady) { heartReady = true; say(""); }
        var w = waiting[m.id]; delete waiting[m.id]; if (w) w.ok(m);
      } else if (m.type === "error") {
        var f = waiting[m.id]; delete waiting[m.id];
        if (!heartReady) giveUpHeart();
        if (f) f.fail(m);
      }
    };
    worker.onerror = function () { giveUpHeart(); };
    return worker;
  }
  function giveUpHeart() {
    heartBroken = true; heartReady = false;
    try { if (worker) worker.terminate(); } catch (e) {}
    worker = null;
    Object.keys(waiting).forEach(function (k) { var w = waiting[k]; delete waiting[k]; w.fail({}); });
  }
  function heart(text) {
    return new Promise(function (ok, fail) {
      if (!startWorker()) { fail({}); return; }
      var id = nextId++; waiting[id] = { ok: ok, fail: fail };
      worker.postMessage({ type: "speak", id: id, text: text, voice: VOICE, speed: prefs.rate });
    });
  }

  /* ---------- this device's voice (fallback) ---------- */
  var synth = window.speechSynthesis || null;
  var LIKED = ["Samantha", "Ava", "Allison", "Susan", "Serena", "Karen", "Moira", "Tessa", "Victoria", "Microsoft Aria", "Microsoft Jenny", "Google US English", "Microsoft Zira"];
  function deviceVoice() {
    if (!synth) return null;
    var vs = synth.getVoices().filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
    for (var i = 0; i < LIKED.length; i++) for (var j = 0; j < vs.length; j++) if (vs[j].name.indexOf(LIKED[i]) === 0) return vs[j];
    return vs.filter(function (v) { return v.default; })[0] || vs[0] || null;
  }
  if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () {};

  /* ---------- reading an answer ---------- */
  var run = 0, current = null, queue = [], urls = [];
  function bubbleFor(i) { var b = log.querySelector('[data-speak="' + i + '"]'); return b ? b.closest(".bubble") : null; }

  function stop() {
    run++; current = null; queue = [];
    try { player.pause(); } catch (e) {}
    player.onended = null;
    urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = [];
    try { if (synth) synth.cancel(); } catch (e) {}
    if (heartReady || heartBroken) say("");
    sync();
  }
  function finish(myRun) { if (myRun !== run) return; current = null; urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = []; sync(); }

  function speak(i) {
    var msg = (typeof chat !== "undefined" ? chat : [])[i];
    var text = speakable(msg && msg.content);
    stop();
    if (!text) return;
    current = i; sync();
    var myRun = run;
    if (prefs.src === "heart" && !heartBroken && "Worker" in window) readHeart(text, myRun);
    else readDevice(text, myRun);
  }

  function readHeart(text, myRun) {
    var parts = chunks(text, 260), made = 0, playing = false, done = false;
    if (!heartReady) say("Getting Shuttle’s voice ready…");
    function playNext() {
      if (myRun !== run) return;
      var u = queue.shift();
      if (!u) { playing = false; if (done) finish(myRun); return; }
      playing = true;
      player.onended = playNext;
      player.src = u;
      var p = player.play();
      if (p && p.catch) p.catch(function () { if (myRun === run) { stop(); note("Tap Read aloud again to hear Shuttle."); } });
    }
    function makeNext() {
      if (myRun !== run) return;
      if (made >= parts.length) { done = true; if (!playing && !queue.length) finish(myRun); return; }
      heart(parts[made]).then(function (m) {
        if (myRun !== run) return;
        made++;
        var u = wavUrl(m.audio, m.rate || 24000); urls.push(u); queue.push(u);
        if (!playing) playNext();
        makeNext();
      }, function () {
        if (myRun !== run) return;
        if (made === 0) {
          say(""); note("This device can’t run Shuttle’s Heart voice quickly, so Shuttle is reading with this device’s voice.");
          readDevice(text, myRun);
        } else { done = true; if (!playing) finish(myRun); }
      });
    }
    makeNext();
  }

  function readDevice(text, myRun) {
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") { finish(myRun); note("Reading aloud isn’t available in this browser."); return; }
    var parts = chunks(text, 220), v = deviceVoice(), n = 0;
    function next() {
      if (myRun !== run) return;
      if (n >= parts.length) { finish(myRun); return; }
      var u = new SpeechSynthesisUtterance(parts[n++]);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-US";
      u.rate = prefs.rate; u.pitch = 1.05;
      u.onend = next; u.onerror = function () { finish(myRun); };
      synth.speak(u);
    }
    next();
  }

  /* ---------- buttons ---------- */
  function sync() {
    log.querySelectorAll("[data-speak]").forEach(function (b) {
      var on = String(current) === b.dataset.speak, lab = b.querySelector(".vlabel");
      if (lab) lab.textContent = on ? "Stop reading" : "Read aloud";
      var bub = b.closest(".bubble"); if (bub) bub.classList.toggle("speaking", on);
    });
  }
  log.addEventListener("click", function (e) {
    var b = e.target.closest("[data-speak]"); if (!b) return;
    if (String(current) === b.dataset.speak) stop(); else speak(+b.dataset.speak);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && current !== null && !document.querySelector("dialog[open]")) stop(); });
  var clear = document.getElementById("coachClear"); if (clear) clear.addEventListener("click", stop, true);
  window.addEventListener("pagehide", stop);

  /* ---------- voice settings in Display ---------- */
  var form = document.getElementById("displayForm");
  function syncForm() {
    if (!form) return;
    var a = form.querySelector('input[name="voiceSrc"][value="' + prefs.src + '"]'); if (a) a.checked = true;
    var r = form.querySelector('input[name="voiceRate"][value="' + prefs.rate + '"]'); if (r) r.checked = true;
    var t = document.getElementById("optAutoRead"); if (t) t.checked = prefs.auto;
    var small = t && t.parentNode && t.parentNode.querySelector("small");
    if (small) small.textContent = prefs.src === "heart"
      ? "Shuttle reads each new answer in the Heart voice as soon as it’s ready"
      : "Shuttle reads each new answer in this device’s voice as soon as it’s ready";
  }
  document.querySelectorAll(".openDisplay").forEach(function (b) { b.addEventListener("click", syncForm); });
  if (form) form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "voiceSrc") { prefs.src = t.value; stop(); save(); syncForm(); return; }
    else if (t.name === "voiceRate") prefs.rate = +t.value;
    else if (t.id === "optAutoRead") prefs.auto = t.checked;
    else return;
    save();
  });
  var reset = document.getElementById("dispReset");
  if (reset) reset.addEventListener("click", function () { prefs = { src: DEF.src, rate: DEF.rate, auto: DEF.auto }; save(); syncForm(); });
  syncForm();

  /* ---------- speak your question ---------- */
  var Rec = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var mic = document.getElementById("micBtn"), rec = null, listening = false, before = "";
  if (mic && Rec) {
    mic.hidden = false;
    mic.addEventListener("click", function () {
      if (listening) { try { rec.stop(); } catch (e) {} return; }
      stop();
      rec = new Rec(); rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
      before = box.value ? box.value.replace(/\s*$/, " ") : "";
      rec.onstart = function () { listening = true; mic.setAttribute("aria-pressed", "true"); mic.textContent = "Stop listening"; say("Listening… speak your question."); };
      rec.onresult = function (e) {
        var t = ""; for (var k = 0; k < e.results.length; k++) t += e.results[k][0].transcript;
        box.value = (before + t).slice(0, 1000);
      };
      rec.onerror = function (e) {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") note("To speak your question, allow the microphone for ConnectStack.");
        else if (e.error === "no-speech") note("I didn’t hear anything. Try again when you’re ready.");
      };
      rec.onend = function () {
        listening = false; mic.setAttribute("aria-pressed", "false"); mic.textContent = "Speak your question";
        say(""); box.focus();
        if (box.value.trim() && box.value !== before) note("Check your question, then choose Ask Shuttle.");
      };
      try { rec.start(); } catch (e) { note("The microphone isn’t available right now."); }
    });
  }

  /* ---------- public hooks used by the app ---------- */
  window.ShuttleVoice = {
    sync: sync,
    stop: stop,
    answered: function (i) {
      var panel = document.getElementById("p-coach");
      if (prefs.auto && panel && !panel.hidden) speak(i);   /* Heart only downloads when someone asks to hear Shuttle */
    }
  };
  sync();
})();
