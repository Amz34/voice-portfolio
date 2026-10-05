/* Aamir Malik Zameer — voice portfolio
   "Talk to my portfolio": on-device speech recognition + spoken answers.
   No backend, no API keys — runs entirely in the browser, so it can be
   hosted on any static host (GitHub Pages). */

(function () {
  "use strict";

  /* ============================================================
     1. KNOWLEDGE BASE — grounded in the CV. Every answer is spoken.
     ============================================================ */
  var KB = [
    {
      k: ["who", "introduce", "yourself", "about you", "background", "summary", "tell me about"],
      a: "I'm Aamir Malik Zameer, a project management engineer based in Jeddah, Saudi Arabia. " +
         "Thirteen years delivering infrastructure, facilities and operations and maintenance projects " +
         "across healthcare, defence and industry. Fifty million riyals delivered on time and under budget, " +
         "with a zero lost-time injury record."
    },
    {
      k: ["experience", "years", "career", "history", "worked", "companies", "worked where"],
      a: "Thirteen plus years. Three chapters: I started in electrical engineering on the SU-30 defence programme " +
         "at Hindustan Aeronautics. Then senior project engineer at Nesma United Industries on King Abdul Aziz Medical City, " +
         "where I delivered a fifty million riyal portfolio. Today I'm project management engineer at Zahran Facilities " +
         "Management, running operations for a five hundred thousand square foot healthcare campus."
    },
    {
      k: ["current", "now", "present", "today", "job", "role", "zahran"],
      a: "Right now I manage operations and maintenance for a five hundred thousand square foot healthcare campus at " +
         "King Saud Bin Abdulaziz University for Health Sciences in Jeddah, through Zahran Facilities Management. " +
         "Eight hundred daily occupants, ninety-eight percent uptime on critical medical infrastructure, and an " +
         "eight million riyal annual budget."
    },
    {
      k: ["project", "projects", "work", "portfolio", "delivered", "case", "achievement", "achievements"],
      a: "The headline numbers: a fifty million riyal capital and operations portfolio at King Abdul Aziz Medical City, " +
         "delivered one hundred percent on time and fifteen percent under budget. A building automation and energy retrofit " +
         "that cut energy cost twenty-two percent, saving about one point two million riyals a year. " +
         "And ninety-eight percent uptime with thirty-five percent fewer emergency repairs on a five hundred thousand " +
         "square foot healthcare campus."
    },
    {
      k: ["skill", "skills", "tool", "tools", "software", "competenc", "capab", "strength", "technical"],
      a: "On the project side: operations and maintenance management, facilities management, tenders and RFP support, " +
         "technical and commercial proposals, cost analysis, contract negotiation and KPI reporting. " +
         "On the tools side: IBM Maximo for CMMS, building automation systems, MS Project, Primavera, AutoCAD, " +
         "BI dashboards, and Python automation with AI and LLM workflows. " +
         "I'm also strong on compliance — OSHA, HIPAA, NFPA and the Saudi Building Code."
    },
    {
      k: ["energy", "bas", "automation", "saving", "savings", "sustainab", "carbon"],
      a: "Energy is one of my favourite wins. I ran a baseline-driven building automation retrofit on a live campus " +
         "and cut energy cost by twenty-two percent — roughly one point two million riyals a year — with no disruption " +
         "to occupied clinical areas."
    },
    {
      k: ["cost", "budget", "margin", "saving", "profit", "negotiat", "vendor", "procurement"],
      a: "Cost control is where I add margin. I manage an eight million riyal annual operations budget, " +
         "deliver projects twelve to fifteen percent under budget, and negotiate with multinational vendors — " +
         "Mitsubishi Electric, MTU, CAT, Atlas Copco — where I've secured around twenty percent cost reductions."
    },
    {
      k: ["safety", "injury", "incident", "osha", "harm", "hse"],
      a: "Zero lost-time injuries on every site I've managed. I work to a zero-harm safety culture, " +
         "with OSHA and NFPA compliance, and the SU-30 defence programme years at Hindustan Aeronautics earned " +
         "national safety awards."
    },
    {
      k: ["education", "degree", "university", "study", "studied", "qualif", "graduate", "btech", "b.tech"],
      a: "A B.Tech in electrical and electronics engineering from JNTU Hyderabad — first class with distinction."
    },
    {
      k: ["certif", "course", "training", "rice", "ibm", "buffalo", "sce", "licen", "accredit"],
      a: "Engineering project management from Rice University, occupational safety and health from the University at Buffalo, " +
         "data science foundations from IBM, and I'm a licensed engineer with the Saudi Council of Engineers, " +
         "registration number three one seven one six four."
    },
    {
      k: ["healthcare", "hospital", "medical", "clinical", "joint commission", "patient"],
      a: "Healthcare is my deepest specialism. Five hundred thousand plus square feet, eight hundred daily occupants, " +
         "Joint Commission readiness, and ninety-eight percent uptime on critical medical infrastructure — " +
         "the systems a hospital cannot afford to lose."
    },
    {
      k: ["defence", "defense", "hal", "hindustan", "su-30", "aircraft", "military"],
      a: "I began on the SU-30 defence aircraft programme at Hindustan Aeronautics Limited — mission-critical work with " +
         "strict contract management, risk assessment and quality and safety compliance under international " +
         "collaboration protocols."
    },
    {
      k: ["remote", "wfh", "relocat", "abroad", "international", "worldwide", "hybrid", "outside"],
      a: "I'm open to remote and hybrid roles worldwide as well as on-site mandates across Saudi Arabia. " +
         "My project management skills transfer cleanly into healthcare, facilities, construction, industrial and " +
         "technology sectors, and I'm set up for distributed work — CMMS, BI dashboards, MS Project and " +
         "AI-driven reporting across time zones."
    },
    {
      k: ["available", "availability", "hiring", "hire", "open to", "looking", "opportunit", "notice"],
      a: "I'm open to project management mandates and senior leadership roles across Saudi Arabia, and to remote " +
         "engagements worldwide. My Iqama is transferable, so I can move quickly. " +
         "The fastest way to reach me is WhatsApp."
    },
    {
      k: ["contact", "email", "phone", "number", "reach", "call", "whatsapp", "linkedin", "cv", "resume", "resume"],
      a: "Email is shaik aamir malik twenty five at gmail dot com. " +
         "WhatsApp and phone is plus nine six six, five seven, four two six, eight eight five six. " +
         "LinkedIn is linkedin dot com slash in slash aamirzameer. " +
         "You can also download the CV as a PDF from this page."
    },
    {
      k: ["up time", "uptime", "reliab", "downtime", "maintenance", "preventive", "cmms", "maximo"],
      a: "Reliability is the core of operations. Ninety-eight percent uptime on critical medical infrastructure, " +
         "a twenty-eight percent reduction in system downtime, thirty-five percent fewer emergency repairs, " +
         "and a preventive and predictive maintenance schedule run through IBM Maximo."
    },
    {
      k: ["team", "lead", "manage", "people", "multidisciplin", "stakeholder", "client"],
      a: "I lead multidisciplinary teams and manage client relationships directly — as technical liaison to the " +
         "National Guard Health Affairs Technical Affairs at King Abdul Aziz Medical City, and with multinational " +
         "OEM networks from Germany, Japan and the United States."
    },
    {
      k: ["ai", "automation", "python", "llm", "reporting", "software", "web", "build"],
      a: "Alongside engineering I build the systems around it — AI-assisted reporting, workflow automation and " +
         "full-stack web tools that replace recurring manual paperwork with reliable, repeatable output. " +
         "This page is one of them: it talks."
    },
    {
      k: ["hello", "hi", "hey", "salam", "assalam", "good morning", "good evening"],
      a: "Hello. I'm Aamir's AI agent. Ask me about his experience, key projects, skills, education, availability " +
         "or how to contact him."
    },
    {
      k: ["thank", "thanks", "shukriya", "jazak"],
      a: "You're welcome. Anything else you'd like to know about Aamir?"
    }
  ];

  var FALLBACK =
    "I can answer questions about Aamir's experience, key projects, skills and tools, education and certifications, " +
    "healthcare and defence work, budget and cost results, availability, and how to contact him. " +
    "Try, for example: what are his key projects?";

  function answerFor(qRaw) {
    var q = (qRaw || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ");
    if (!q.trim()) return FALLBACK;
    var best = null, bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var score = 0;
      for (var j = 0; j < KB[i].k.length; j++) {
        var key = KB[i].k[j];
        if (key.indexOf(" ") !== -1) { if (q.indexOf(key) !== -1) score += 3; }
        else if (new RegExp("\\b" + key).test(q)) score += 2;
      }
      if (score > bestScore) { bestScore = score; best = KB[i]; }
    }
    return bestScore >= 2 ? best.a : FALLBACK;
  }

  /* ============================================================
     2. VOICE — speech synthesis (answers) + recognition (questions)
     ============================================================ */
  var synth = window.speechSynthesis || null;
  var voices = [];
  function loadVoices() {
    if (!synth) return;
    try { voices = synth.getVoices() || []; } catch (e) { voices = []; }
  }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

  var muted = false;
  function pickVoice() {
    if (!voices.length) loadVoices();
    var prefer = ["Google UK English Male", "Google US English", "Daniel", "Alex",
                  "Microsoft Guy Online", "Microsoft Mark", "en-GB", "en-US", "en"];
    for (var p = 0; p < prefer.length; p++) {
      for (var v = 0; v < voices.length; v++) {
        var nm = voices[v].name || "", lg = voices[v].lang || "";
        if (nm.indexOf(prefer[p]) !== -1 || lg.indexOf(prefer[p]) !== -1) return voices[v];
      }
    }
    return voices[0] || null;
  }
  function speak(text, onEnd) {
    if (!synth || muted || !text) { if (onEnd) onEnd(); return; }
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(String(text).replace(/[🎙🎧]/g, ""));
      u.rate = 1.0; u.pitch = 1.0; u.lang = "en-GB";
      var v = pickVoice(); if (v) u.voice = v;
      u.onend = function () { if (onEnd) onEnd(); };
      u.onerror = function () { if (onEnd) onEnd(); };
      synth.speak(u);
    } catch (e) { if (onEnd) onEnd(); }
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

  var greeted = false;

  function scrollLog() { if (log) log.scrollTop = log.scrollHeight; }

  function bubble(text, who) {
    if (!log) return null;
    var d = document.createElement("div");
    d.className = "msg " + (who === "me" ? "me" : "bot");
    d.textContent = text;
    log.appendChild(d);
    scrollLog();
    return d;
  }

  function reply(question) {
    bubble(question, "me");
    var a = answerFor(question);
    var node = bubble(a, "bot");
    if (node && synth && !muted) {
      var tag = document.createElement("span");
      tag.className = "tts";
      tag.textContent = "🔊 speaking…";
      node.appendChild(tag);
      speak(a, function () { if (tag.parentNode) tag.remove(); });
    } else {
      speak(a);
    }
  }

  function openPanel() {
    if (!panel) return;
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    if (status) status.textContent = "Ask about experience, projects, skills, contact…";
    if (!greeted) {
      greeted = true;
      bubble("Hi — I'm Aamir's AI agent. You can type, or tap the mic and just talk. " +
             "Ask me about his experience, projects, skills or availability.", "bot");
      speak("Hi, I'm Aamir's AI agent. Ask me about his experience, projects, skills or availability.");
    }
    if (input) setTimeout(function () { input.focus(); }, 260);
  }
  function closePanel() {
    if (!panel) return;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    if (synth) { try { synth.cancel(); } catch (e) {} }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-open-agent]"), function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); openPanel(); });
  });
  if (closeBtn) closeBtn.addEventListener("click", closePanel);
  var agentFab = document.getElementById("agentFab");
  if (agentFab) agentFab.addEventListener("click", openPanel);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePanel(); });

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
      var map = {
        "Experience?": "Tell me about your experience",
        "Key projects?": "What are your key projects",
        "Skills & tools?": "What are your skills and tools",
        "Education?": "What is your education and certifications",
        "Availability?": "Are you available for hire",
        "Contact?": "How can I contact you"
      };
      reply(map[b.textContent.trim()] || b.textContent.trim());
    });
  }

  if (micBtn) {
    micBtn.addEventListener("click", function () {
      if (!recog) {
        bubble("Voice input isn't supported in this browser. Type your question — same answers.", "bot");
        return;
      }
      if (listening) { try { recog.stop(); } catch (e) {} return; }
      if (synth) { try { synth.cancel(); } catch (e) {} }
      try {
        recog.start();
        listening = true;
        micBtn.classList.add("rec");
        if (status) status.textContent = "Listening… speak now";
      } catch (e) {
        listening = false;
        micBtn.classList.remove("rec");
      }
    });

    recog.onresult = function (ev) {
      var said = "";
      try { said = ev.results[0][0].transcript || ""; } catch (e) {}
      if (said) reply(said);
    };
    recog.onerror = function () {
      if (status) status.textContent = "Couldn't hear that — try again or type.";
    };
    recog.onend = function () {
      listening = false;
      micBtn.classList.remove("rec");
      if (status) status.textContent = "Ask about experience, projects, skills, contact…";
    };
  }

  /* ============================================================
     4. VOICE CV PLAYERS (hero mini + section player)
     ============================================================ */
  var audio = document.getElementById("vcAudio");
  var vcPlay = document.getElementById("vcPlay");
  var vcFill = document.getElementById("vcFill");
  var vcScrub = document.getElementById("vcScrub");
  var vcCur = document.getElementById("vcCur");
  var vcDur = document.getElementById("vcDur");
  var eq = document.getElementById("eq");

  var heroPlay = document.getElementById("heroPlay");
  var heroBar = document.getElementById("heroBar");

  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), x = Math.floor(s % 60);
    return m + ":" + (x < 10 ? "0" : "") + x;
  }

  function syncPlaying(playing) {
    var glyph = playing ? "❚❚" : "▶";
    if (vcPlay) vcPlay.textContent = glyph;
    if (heroPlay) heroPlay.textContent = playing ? "❚❚" : "▶";
    if (eq) eq.classList.toggle("on", playing);
  }

  function toggleAudio() {
    if (!audio) return;
    if (audio.paused) {
      if (synth) { try { synth.cancel(); } catch (e) {} }
      audio.play().catch(function () {});
    } else {
      audio.pause();
    }
  }

  if (audio) {
    if (vcPlay) vcPlay.addEventListener("click", toggleAudio);
    if (heroPlay) heroPlay.addEventListener("click", toggleAudio);

    audio.addEventListener("loadedmetadata", function () { if (vcDur) vcDur.textContent = fmt(audio.duration); });
    audio.addEventListener("play", function () { syncPlaying(true); });
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

  /* Pause speech if the user starts the video */
  var vid = document.querySelector("#video video");
  if (vid && synth) {
    vid.addEventListener("play", function () { try { synth.cancel(); } catch (e) {} });
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

  /* Expose for debugging / self-QA */
  window.__portfolio = {
    answerFor: answerFor,
    kbSize: KB.length,
    openPanel: openPanel,
    closePanel: closePanel,
    hasSR: !!SR,
    hasTTS: !!synth
  };
})();
