# Veil & Arcana — Tarot Reading

A mystical three-card tarot reading app built with HTML, CSS, JavaScript, and Three.js. Uses public-domain Rider–Waite–Smith card artwork.

**Live:** [https://iampratap.github.io/tarot/](https://iampratap.github.io/tarot/)  
**Repo:** [https://github.com/iampratap/tarot](https://github.com/iampratap/tarot)

## Features

- Name and date-of-birth session
- Personal question, animated 3D shuffle
- Spin a card arc of all 78 cards and choose three (hover to lift, click to choose)
- Face-down picks that flip one-by-one on the result screen
- Client-side reading plus an **Ask Google AI** link with your draw prefilled
- **Card Wiki** — browse, filter, and study meanings for every card

## Run locally

Card images load from GitHub, so use a local static server (not `file://`):

```bash
npx --yes serve .
```

Then open the URL shown in the terminal (usually `http://localhost:3000`).

Any other static server works (`python3 -m http.server`, VS Code Live Server, etc.).

## Stack

- Three.js (CDN) for the ambient starfield and shuffle animation
- ES modules — no build step
- Rider-Waite scans via [metabismuth/tarot-json](https://github.com/metabismuth/tarot-json) (public domain)

## Project layout

```
index.html
css/styles.css
js/app.js
js/cards.js
js/reading.js
js/wheel.js
js/scene.js
js/wiki.js
assets/card-back.svg
```
