# ⏱️ Edu Fair 2026 — The 60-Second Challenge

A quick, fun quiz kiosk for the Sloka The School Edu Fair 2026 booth. Five one-tap games, four difficulty levels, so everyone from Grade 1 students to parents and teachers can play. Built to fill a 10" Android tablet in portrait or landscape, fully offline.

Built with pure modern web standards: **Web Bluetooth API** (ESC/POS thermal printing for POS-58), **WebRTC MediaDevices API** (live webcam badge capture), **Web Audio API** (synthesized sound effects), and **Service Worker** (100% offline kiosk).

---

## 🚀 Quick Start

### Option A: Local Dev Server (Recommended for Bluetooth & Camera)
Web Bluetooth and Webcam APIs require either `http://localhost` or `https://` secure origins.
To start the zero-dependency server:

```bash
npm start
```
*Or directly with Node:*
```bash
node server.js
```
Then open: **`http://localhost:3000`** in **Google Chrome** or **Microsoft Edge**.

### Option B: Direct File Open
You can also directly double-click [`index.html`](file:///c:/Users/lenovo/OneDrive/Documents/GitHub/ScinceFairGame/index.html) to open in your browser. (Note: Chrome requires localhost or HTTPS for Web Bluetooth).

---

## 🎮 The Games

Every round is **60 seconds** (Riddle Time gets 90, since riddles need reading time). Each game uses one simple mechanic so a new player understands it in seconds.

| Game | Subject | How you play |
|---|---|---|
| 🤔 **Fact or Fiction** | Science & Safety | Read a statement, tap ✅ Fact or ❌ Fiction, or swipe the card right/left |
| ♻️ **Eco Sorter** | Environment | Tap the right bin for each item: 🟢 Wet, 🔵 Dry, 🔴 Hazardous (Hyderabad's bin colours) |
| 🔍 **Odd One Out** | Think Smart | Four picture tiles: tap the one that doesn't belong |
| ⚡ **Math Blitz** | Mental Maths | Solve and tap. Questions are generated, so they never run out |
| 📝 **Word Wizard** | English | Fill the blank, fix the grammar, spot the correct spelling |
| 🧩 **Word Builder** | Prefixes & Suffixes | Snap the right prefix or suffix (un-, re-, -ful, -less…) onto a word to match its meaning; the new word appears |
| 🦉 **Riddle Time** | Traditional Riddles | Classic riddles and Indian paheli, with picture answers. 💡 Hint removes 2 wrong answers for half points. 90-second rounds |
| 🎲 **Mega Mix** | Everything | Each question is a surprise from the games switched on in Settings |

After every answer a one-line explanation appears, so players learn even when they're wrong.

## 🎚️ Levels

| Level | For | Points per correct answer |
|---|---|---|
| 🌱 Easy | Grades 1–4 | 10 (Eco Sorter uses just 2 bins) |
| 🚀 Medium | Grades 5–8 | 20 |
| 🧠 Hard | Grade 9+ & grown-ups | 30 |
| 🎲 Mixed | Everyone | Starts Easy, moves to Medium after 3 correct and Hard after 7 |

**Streak bonus:** +5 on every answer while on a streak of 3 or more 🔥.

## 🎖️ Stars

- ★ — everyone who plays (Rising Star)
- ★★ — 6+ correct (Bright Spark)
- ★★★ — 10+ correct (Super Genius)

## ✏️ Editing questions

All content lives in [`js/challenges.js`](js/challenges.js), grouped by game and level (`FACT_BANK`, `ECO_BANK`, `ODD_BANK`, `WORD_BANK`, `AFFIX_BANK`, `RIDDLE_BANK`). Add a line in the same format and it shows up in the game. Math questions come from `MATH_GENERATORS`. After changing any file, bump `CACHE_NAME` in [`sw.js`](sw.js) so tablets pick up the new version.

## 📷 Keepsake photo & 🖨️ POS-58 printing

- The results screen opens the webcam for a selfie (with a cartoon fallback if there's no camera).
- **Print keepsake** sends an ESC/POS receipt with a dithered photo to a POS-58 (58 mm / 384-dot) Bluetooth printer via Web Bluetooth. Text is ASCII-only so it prints cleanly on the printer's default code page.
- **"or use a normal printer"** prints the on-screen slip through the browser.

## 🏆 Leaderboard

- Saved on the tablet (`localStorage`), filterable by game, shows level and stars.
- **Export CSV** for teachers; **Sync to server** posts scores to `/api/sync-scores` (stored in `data/scores.json`).

## 🧭 Kiosk tips

- Tap ⚙️ in the header to choose which games appear on the home screen (saved on the tablet).
- Tap ⛶ in the header for full screen (or "Add to Home screen" to launch as a full-screen app).
- The results screen returns to Home automatically after 2 minutes idle, ready for the next visitor. **New player** clears the name.
- Keyboard: `A`–`D` / `1`–`4` to answer, `←`/`→` for Fact or Fiction, `Enter` for next.

## 🛠️ Architecture & Files

```text
├── index.html          # Screens: home, game, results; countdown & leaderboard overlays
├── server.js           # Zero-dependency Node static server + score sync API
├── sw.js               # Offline cache (bump CACHE_NAME on every release)
├── css/styles.css      # Tablet-first layout (portrait & landscape), school colours, print slip
└── js/
    ├── challenges.js   # Levels, games, all question content and the math generator
    ├── app.js          # Round flow, timer, scoring, streaks, results, leaderboard UI
    ├── audio.js        # Web Audio sound effects (no audio files)
    ├── camera.js       # Webcam snapshot with cartoon fallback
    ├── confetti.js     # Confetti bursts
    ├── leaderboard.js  # localStorage scores, CSV export, server sync
    └── printer.js      # Web Bluetooth POS-58 ESC/POS driver with dithering
```
