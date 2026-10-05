# Aamir Malik Zameer — Voice Portfolio

A talking portfolio page: **talk to it and it answers out loud.**

Live: https://amz34.github.io/voice-portfolio/

## What is in here

| File | Purpose |
|---|---|
| `index.html` | The page — hero, stats, selected work, experience, voice CV, video CV, contact |
| `styles.css` | Branded design system (deep navy + cyan + lime), large type, responsive |
| `app.js` | The voice agent: on-device speech recognition, spoken answers, audio players, scrollers |
| `assets/voice-cv.mp3` | Two-minute narrated voice CV |
| `assets/portfolio-video.mp4` | Video CV (720p web encode) |
| `assets/photo-aamir.jpg` | Hero portrait |
| `assets/avatar-aamir.png` | Circular avatar used in the voice player and agent |
| `assets/Aamir_Malik_Zameer_CV.pdf` | Downloadable CV |
| `cv.html` | Print source for the CV PDF (Chrome print-to-pdf) |

## How the voice agent works

No backend and no API keys. Everything runs in the browser:

- `SpeechRecognition` (Chrome/Edge/Android Chrome) turns speech into text.
- A keyword-scored knowledge base, grounded in the CV, picks the answer.
- `SpeechSynthesis` speaks the answer aloud.
- If the browser has no speech input, the same answers are available by typing.

Because it is fully static it can be hosted on GitHub Pages, or any static host.

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
