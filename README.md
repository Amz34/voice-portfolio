# Aamir Malik Zameer — Voice Portfolio

[![CI](https://github.com/Amz34/voice-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Amz34/voice-portfolio/actions/workflows/ci.yml)

A talking portfolio page: **talk to it and it answers out loud.**

- Live: https://amz34.github.io/voice-portfolio/
- Arabic edition: https://amz34.github.io/voice-portfolio/ar.html

![On-device voice agent: a rising audio waveform over circuit traces](assets/voice-agent-overview.jpg)

## Why it exists

Recruiters skim. This page lets them *ask* instead of reading a wall of text — speech in, spoken
answer out — and offers the same answers by typing when a browser has no speech input. It is a
plain static site: no backend, no API keys, no analytics scripts, no build step.

## What it demonstrates

- **A working browser voice agent with no server.** Speech recognition turns the question into
  text, a keyword-scored knowledge base grounded in the CV picks the answer, and speech synthesis
  reads it back. Nothing leaves the browser.
- **A bilingual layout.** English and Arabic editions share one design system; the Arabic page is
  fully right-to-left.
- **One source for print and web.** `cv.html` is the print stylesheet that produces the
  downloadable PDF, so the CV text lives in one place.
- **Integrity checks in CI.** A dependency-free checker parses every page and fails the build on a
  broken local reference, missing metadata or leftover draft copy.

## What is in here

| File | Purpose |
|---|---|
| `index.html` | The page — hero, stats, selected work, experience, voice CV, video CV, contact |
| `ar.html` | Full Arabic (RTL) edition |
| `styles.css` | Branded design system (deep navy + cyan + lime), large type, responsive |
| `app.js` | The voice agent: on-device speech recognition, spoken answers, audio players, scrollers |
| `assets/voice/kb.js` | The question/answer knowledge base used by the agent |
| `assets/voice-cv.mp3` | Two-minute narrated voice CV |
| `assets/portfolio-video.mp4` | Video CV (720p web encode) |
| `assets/photo-aamir.jpg` | Hero portrait |
| `assets/avatar-aamir.png` | Circular avatar used in the voice player and agent |
| `assets/Aamir_Malik_Zameer_CV.pdf` | Downloadable CV |
| `assets/voice-agent-overview.jpg` | Overview image used by this README |
| `cv.html` | Print source for the CV PDF (Chrome print-to-pdf) |
| `tools/build_ar.py` | Builds the Arabic page from `tools/ar_strings.json` |
| `tools/check_site.py` | Local-reference and metadata checker (standard library only) |
| `tests/` | Unit tests for the checker |

## How the voice agent works

No backend and no API keys. Everything runs in the browser:

- `SpeechRecognition` (Chrome/Edge/Android Chrome) turns speech into text.
- A keyword-scored knowledge base, grounded in the CV, picks the answer.
- `SpeechSynthesis` speaks the answer aloud.
- If the browser has no speech input, the same answers are available by typing.

Because it is fully static it can be hosted on GitHub Pages, or any static host.

## Checks

```bash
python3 tools/check_site.py                    # every local href/src resolves, metadata present
python3 -m unittest discover -s tests -t .     # unit tests for the checker
```

Both run on every push in CI on Python 3.11 and 3.12. Editing the Arabic page? Regenerate
`ar.html` with `python3 tools/build_ar.py` so the change survives the next build.

## Rebuilding the CV PDF

```bash
google-chrome --headless=new --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=assets/Aamir_Malik_Zameer_CV.pdf \
  file://$PWD/cv.html
```

## Contact

- WhatsApp / Phone: +966 57 426 8856
- Email: shaikaamirmalik25@gmail.com
- LinkedIn: https://www.linkedin.com/in/aamirzameer

## License

MIT — see [LICENSE](LICENSE).
