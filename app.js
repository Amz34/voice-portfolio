/* Aamir Malik Zameer — voice portfolio
   Agent: bilingual (EN/AR) knowledge base + pre-rendered neural voice clips.
   Voice assets come from assets/voice/ (see tools/gen_voice.py). */
(function () {
  "use strict";

  /* ============================================================
     1. KNOWLEDGE BASE — data lives in assets/voice/kb.js
     ============================================================ */
  var DATA = window.PORTFOLIO_KB || { items: [], fallback: {} };
  var KB = DATA.items || [];
  var FALLBACK = DATA.fallback || {};
  var VBASE = "assets/voice/";
  var LANG_KEY = "azVoiceLang";
  var lang = "en";

  /* Arabic-aware matching: strip tashkeel, fold alef/ya/ta-marbuta. */
  var AR_CHARS = /[\u0600-\u06FF]/;
  function hasArabic(s) { return AR_CHARS.test(String(s || "")); }
  function norm(s) {
    s = String(s == null ? "" : s).toLowerCase();
    return s.replace(/[\u064B-\u0652\u0670\u0640]/g, "")
            .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ئ/g, "ي")
            .replace(/ؤ/g, "و").replace(/ة/g, "ه")
            .replace(/[’'`]/g, "").replace(/\s+/g, " ").trim();
  }
  function score(item, q) {
    var s = 0, i, key;
    var keys = (item.k || []).concat(item.ak || []);
    for (i = 0; i < keys.length; i++) {
      key = norm(keys[i]);
      if (!key) continue;
      if (key.indexOf(" ") !== -1) { if (q.indexOf(key) !== -1) s += 3; }
      else if (key.charCodeAt(0) > 255) { if (q.indexOf(key) !== -1) s += 2; }
      else if (new RegExp("\\b" + key).test(q)) s += 2;
    }
    return s;
  }
  function answerFor(text) {
    var q = norm(text), best = null, bestScore = 0, i, sc;
    for (i = 0; i < KB.length; i++) {
      sc = score(KB[i], q);
      if (sc > bestScore) { bestScore = sc; best = KB[i]; }
    }
    var useAr = lang === "ar" || hasArabic(text);
    if (!best || bestScore < 2) {
      return { id: "fallback", lang: useAr ? "ar" : "en",
               text: (useAr ? FALLBACK.aa : FALLBACK.a) || FALLBACK.a || "" };
    }
    return { id: best.id, lang: useAr ? "ar" : "en",
             text: (useAr ? best.aa : best.a) || best.a };
  }

  /* ============================================================
     2. VOICE — clips first (male Asian EN / Saudi male AR), synth fallback
     ============================================================ */
  var synth = window.speechSynthesis || null;
  var voices = [];
  function loadVoices() {
    if (!synth) return;
    try { voices = synth.getVoices() || []; } catch (e) { voices = []; }
  }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

  var muted = false;
  var PREFER = {
    en: ["Prabhat", "Ravi", "Asad", "Google UK English Male", "Guy", "Daniel", "Alex", "Mark", "Male"],
    ar: ["Hamed", "Hamdan", "Maged", "Majed", "Tarik", "Naayf", "ar-SA", "ar-"]
  };
  function pickVoice(lg) {
    if (!voices.length) loadVoices();
    var pref = PREFER[lg] || PREFER.en, i, v, nm, lgd;
    for (i = 0; i < pref.length; i++) {
      for (v = 0; v < voices.length; v++) {
        nm = voices[v].name || ""; lgd = voices[v].lang || "";
        if (nm.indexOf(pref[i]) !== -1 || lgd.indexOf(pref[i]) !== -1) return voices[v];
      }
    }
    for (v = 0; v < voices.length; v++) {
      if ((voices[v].lang || "").indexOf(lg === "ar" ? "ar" : "en") === 0) return voices[v];
    }
    return voices[0] || null;
  }
  function browserSpeak(text, lg, onEnd) {
    if (!synth || muted || !text) { if (onEnd) onEnd(); return; }
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(String(text).replace(/[🎙🎧🔊]/g, ""));
      u.rate = lg === "ar" ? 0.97 : 1.0; u.pitch = 0.92;
      u.lang = lg === "ar" ? "ar-SA" : "en-GB";
      var v = pickVoice(lg); if (v) u.voice = v;
      u.onend = function () { if (onEnd) onEnd(); };
      u.onerror = function () { if (onEnd) onEnd(); };
      synth.speak(u);
    } catch (e) { if (onEnd) onEnd(); }
  }

  var clip = null;
  function stopSpeech() {
    if (clip) { try { clip.pause(); } catch (e) {} clip = null; }
    if (synth) { try { synth.cancel(); } catch (e) {} }
  }
  function say(text, id, lg, onEnd) {
    stopSpeech();
    if (muted || !text) { if (onEnd) onEnd(); return; }
    if (!id) { browserSpeak(text, lg, onEnd); return; }
    var a, p;
    try { a = new Audio(VBASE + id + (lg === "ar" ? "-ar" : "") + ".mp3"); }
    catch (e) { browserSpeak(text, lg, onEnd); return; }
    clip = a;
    a.onended = function () { clip = null; if (onEnd) onEnd(); };
    a.onerror = function () { clip = null; browserSpeak(text, lg, onEnd); };
    p = a.play();
    if (p && p.catch) p.catch(function () {
      if (clip === a) { clip = null; browserSpeak(text, lg, onEnd); }
    });
  }

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  var recog = null, listening = false;
  if (SR) {
    recog = new SR();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.continuous = false;
  }

  /* ============================================================
     3. AGENT PANEL
     ============================================================ */
  var panel = document.getElementById("agentPanel");
  var log = document.getElementById("apLog");
  var form = document.getElementById("apForm");
  var input = document.getElementById("apText");
  var micBtn = document.getElementById("apMic");
  var closeBtn = document.getElementById("apClose");
  var chips = document.getElementById("apChips");
  var status = document.getElementById("apStatus");
  var foot = document.querySelector(".ap-foot");

  var CHIPS = {
    en: [["Experience?", "Tell me about your experience"],
         ["Key projects?", "What are your key projects"],
         ["Skills & tools?", "What are your skills and tools"],
         ["Education?", "What is your education and certifications"],
         ["Availability?", "Are you available for hire"],
         ["Contact?", "How can I contact you"]],
    ar: [["الخبرة؟", "ما هي خبرتك"],
         ["المشاريع؟", "ما هي مشاريعك الرئيسية"],
         ["المهارات؟", "ما هي مهاراتك وأدواتك"],
         ["المؤهلات؟", "ما هي مؤهلاتك وشهاداتك"],
         ["التوفر؟", "هل أنت متاح للعمل"],
         ["التواصل؟", "كيف يمكنني التواصل معك"]]
  };
  var T = {
    status: { en: "Ask about experience, projects, skills, contact…",
              ar: "اسأل عن الخبرة أو المشاريع أو المهارات أو التواصل…" },
    listening: { en: "Listening… speak now", ar: "أستمع… تحدّث الآن" },
    missed: { en: "Couldn't hear that — try again or type.",
              ar: "لم أسمع بوضوح — أعد المحاولة أو اكتب." },
    placeholder: { en: "Type a question…", ar: "اكتب سؤالك…" },
    foot: { en: "Voice needs Chrome, Edge or Android Chrome. Otherwise type — same answers.",
            ar: "الصوت يعمل على كروم أو إيدج أو كروم أندرويد. أو اكتب سؤالك — نفس الإجابات." }
  };

  var greeted = false;
  function scrollLog() { if (log) log.scrollTop = log.scrollHeight; }

  function bubble(text, who, lg) {
    if (!log) return null;
    var d = document.createElement("div");
    d.className = "msg " + (who === "me" ? "me" : "bot") + (lg === "ar" ? " rtl" : "");
    if (lg === "ar") { d.setAttribute("dir", "rtl"); d.setAttribute("lang", "ar"); }
    d.textContent = text;
    log.appendChild(d);
    scrollLog();
    return d;
  }

  function reply(question) {
    bubble(question, "me", hasArabic(question) ? "ar" : "en");
    var r = answerFor(question);
    var node = bubble(r.text, "bot", r.lang);
    if (!muted && node) {
      var tag = document.createElement("span");
      tag.className = "tts";
      tag.textContent = "🔊";
      node.appendChild(tag);
      say(r.text, r.id, r.lang, function () { if (tag.parentNode) tag.remove(); });
    } else {
      say(r.text, r.id, r.lang);
    }
  }

  function setLang(l) {
    lang = l === "ar" ? "ar" : "en";
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    if (recog) recog.lang = lang === "ar" ? "ar-SA" : "en-US";
    if (chips) {
      chips.innerHTML = "";
      CHIPS[lang].forEach(function (pair) {
        var b = document.createElement("button");
        b.textContent = pair[0];
        b.setAttribute("data-q", pair[1]);
        chips.appendChild(b);
      });
    }
    if (status) status.textContent = T.status[lang];
    if (input) input.placeholder = T.placeholder[lang];
    if (foot) foot.textContent = T.foot[lang];
    Array.prototype.forEach.call(document.querySelectorAll("[data-lang-set]"), function (b) {
      b.classList.toggle("on", b.getAttribute("data-lang-set") === lang);
    });
    document.querySelectorAll("[data-lang-label]").forEach(function (el) {
      el.textContent = lang === "ar" ? "🎙 تحدّث مع مساعدي" : "🎙 Talk to my agent";
    });
  }

  function openPanel() {
    if (!panel) return;
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("panel-open");
    if (status) status.textContent = T.status[lang];
    if (!greeted) {
      greeted = true;
      var g = KB.filter(function (it) { return it.id === "hello"; })[0];
      var text = g ? (lang === "ar" ? g.aa : g.a)
                   : "Hi — I'm Aamir's AI agent. Ask about his experience, projects, skills or availability.";
      bubble(text, "bot", lang);
      say(text, "hello", lang);
    }
    if (input && window.innerWidth > 720) setTimeout(function () { input.focus(); }, 260);
  }
  function closePanel() {
    if (!panel) return;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("panel-open");
    stopSpeech();
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-open-agent]"), function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); openPanel(); });
  });
  if (closeBtn) closeBtn.addEventListener("click", closePanel);
  var agentFab = document.getElementById("agentFab");
  if (agentFab) agentFab.addEventListener("click", openPanel);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePanel(); });

  Array.prototype.forEach.call(document.querySelectorAll("[data-lang-set]"), function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang-set")); });
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input ? input.value.trim() : "";
      if (!q) return;
      input.value = "";
      reply(q);
    });
  }

  if (chips) {
    chips.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button") : null;
      if (!b) return;
      reply(b.getAttribute("data-q") || b.textContent.trim());
    });
  }

  if (micBtn) {
    micBtn.addEventListener("click", function () {
      if (!recog) {
        bubble(T.foot[lang], "bot", lang);
        return;
      }
      if (listening) { try { recog.stop(); } catch (e) {} return; }
      stopSpeech();
      if (audio) { try { audio.pause(); } catch (e) {} }
      try {
        recog.start();
        listening = true;
        micBtn.classList.add("rec");
        if (status) status.textContent = T.listening[lang];
      } catch (e) {
        listening = false;
        micBtn.classList.remove("rec");
      }
    });

    recog.onresult = function (ev) {
      var said = "";
      try { said = ev.results[0][0].transcript || ""; } catch (e) {}
      if (said && hasArabic(said) && lang !== "ar") setLang("ar");
      if (said) reply(said);
    };
    recog.onerror = function () { if (status) status.textContent = T.missed[lang]; };
    recog.onend = function () {
      listening = false;
      micBtn.classList.remove("rec");
      if (status) status.textContent = T.status[lang];
    };
  }

  /* ============================================================
     4. VOICE CV PLAYERS (hero mini + section player, EN/AR)
     ============================================================ */
  var audio = document.getElementById("vcAudio");
  var vcPlay = document.getElementById("vcPlay");
  var vcFill = document.getElementById("vcFill");
  var vcScrub = document.getElementById("vcScrub");
  var vcCur = document.getElementById("vcCur");
  var vcDur = document.getElementById("vcDur");
  var vcText = document.getElementById("vcText");
  var eq = document.getElementById("eq");
  var heroPlay = document.getElementById("heroPlay");
  var heroBar = document.getElementById("heroBar");
  var cvLang = "en";
  var CV_SRC = { en: "assets/voice-cv.mp3", ar: "assets/voice-cv-ar.mp3" };

  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), x = Math.floor(s % 60);
    return m + ":" + (x < 10 ? "0" : "") + x;
  }
  function syncPlaying(playing) {
    if (vcPlay) vcPlay.textContent = playing ? "❚❚" : "▶";
    if (heroPlay) heroPlay.textContent = playing ? "❚❚" : "▶";
    if (eq) eq.classList.toggle("on", playing);
  }
  function toggleAudio() {
    if (!audio) return;
    if (audio.paused) { stopSpeech(); if (vid) { try { vid.pause(); } catch (e) {} }
      audio.play().catch(function () {}); }
    else audio.pause();
  }
  function setCvLang(l) {
    cvLang = l === "ar" ? "ar" : "en";
    var wasPlaying = audio && !audio.paused;
    if (audio) {
      audio.pause();
      audio.setAttribute("src", CV_SRC[cvLang]);
      audio.load();
      if (wasPlaying) audio.play().catch(function () {});
      if (vcDur) vcDur.textContent = "0:00";
      if (vcFill) vcFill.style.width = "0%";
      if (heroBar) heroBar.style.width = "0%";
      if (vcCur) vcCur.textContent = "0:00";
    }
    if (vcText && DATA.cv) {
      vcText.textContent = cvLang === "ar" ? DATA.cv.ar : DATA.cv.en;
      vcText.setAttribute("dir", cvLang === "ar" ? "rtl" : "ltr");
      vcText.setAttribute("lang", cvLang);
    }
    Array.prototype.forEach.call(document.querySelectorAll("[data-cv-lang]"), function (b) {
      b.classList.toggle("on", b.getAttribute("data-cv-lang") === cvLang);
    });
    syncPlaying(false);
  }

  if (vcText && DATA.cv) vcText.textContent = DATA.cv.en;

  if (audio) {
    if (vcPlay) vcPlay.addEventListener("click", toggleAudio);
    if (heroPlay) heroPlay.addEventListener("click", toggleAudio);
    Array.prototype.forEach.call(document.querySelectorAll("[data-cv-lang]"), function (b) {
      b.addEventListener("click", function () { setCvLang(b.getAttribute("data-cv-lang")); });
    });

    audio.addEventListener("loadedmetadata", function () { if (vcDur) vcDur.textContent = fmt(audio.duration); });
    audio.addEventListener("play", function () { syncPlaying(true); stopSpeech(); });
    audio.addEventListener("pause", function () { syncPlaying(false); });
    audio.addEventListener("ended", function () {
      syncPlaying(false);
      if (vcFill) vcFill.style.width = "0%";
      if (heroBar) heroBar.style.width = "0%";
    });
    audio.addEventListener("timeupdate", function () {
      var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      if (vcFill) vcFill.style.width = pct + "%";
      if (heroBar) heroBar.style.width = pct + "%";
      if (vcCur) vcCur.textContent = fmt(audio.currentTime);
    });
    if (vcScrub) {
      vcScrub.addEventListener("click", function (e) {
        var r = vcScrub.getBoundingClientRect();
        var ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        if (audio.duration) audio.currentTime = ratio * audio.duration;
      });
    }
  }

  /* Pause speech if the user starts the portfolio video */
  var vid = document.querySelector("#video video");
  if (vid) {
    vid.addEventListener("play", function () { stopSpeech(); if (audio) { try { audio.pause(); } catch (e) {} } });
  }

  /* ============================================================
     5. REVEAL + COUNTERS
     ============================================================ */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
      });
    }, { threshold: 0.16 });
    Array.prototype.forEach.call(reveals, function (el) { ro.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("in"); });
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count") || "0");
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var pre = el.getAttribute("data-prefix") || "";
    var suf = el.getAttribute("data-suffix") || "";
    var start = performance.now(), dur = 1400;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      el.textContent = pre + (dec ? val.toFixed(dec) : Math.round(val).toLocaleString("en-US")) + suf;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(counters, function (el) { co.observe(el); });
  } else {
    Array.prototype.forEach.call(counters, function (el) {
      el.textContent = (el.getAttribute("data-prefix") || "") +
        el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
  }

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* Start in the visitor's saved language */
  var saved = "en";
  try { saved = localStorage.getItem(LANG_KEY) || "en"; } catch (e) { saved = "en"; }
  if (saved !== "en" && navigator.language && /^ar/i.test(navigator.language)) saved = "ar";
  setLang(saved === "ar" ? "ar" : "en");

  /* Expose for debugging / self-QA */
  window.__portfolio = {
    answerFor: answerFor,
    setLang: setLang,
    lang: function () { return lang; },
    say: say,
    kbSize: KB.length,
    openPanel: openPanel,
    closePanel: closePanel,
    hasSR: !!SR,
    hasTTS: !!synth
  };
})();
