# 🌟 Little Genius Land

Learn · Play · Create · Print. A learning app for curious kids: **Word Quest** (a word a day), **Robo Academy** (electronics → robotics → AI), **Doodle Studio**, and **The 60-Second Challenge** quiz games, with worksheets, stickers and stamps printed on a pocket thermal printer. Created & designed by Joshitha, Grade 6B.

The home page is a scrolling landing page with an animated hero (a printer printing worksheets, stickers and lab sheets), feature cards showing the current learner's progress, and a "Learn it, print it, keep it" guide. The eight quiz games live on their own **60-Second Challenge** screen.

## ⏱️ The 60-Second Challenge (originally built for Edu Fair 2026)

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

## 🎨 Doodle Studio (draw & print)

A creative mode with **no timer, score or level**: draw anything and print it on the POS-58 thermal printer.

- **Tools:** pencil, brush, 🌈 rainbow brush, spray, paint-bucket fill, shapes (line, rectangle, circle, triangle, star, heart; outline or filled), emoji stickers, text, eraser — 12 colours + a custom colour picker, 4 sizes.
- **Extras:** undo/redo (20 steps), 🪞 mirror mode for symmetrical drawings, and 📄 colouring pages (owl, rocket, house, flower, fish, butterfly, school logo). Colouring-page lines sit on their own layer, so the eraser never removes them.
- **Print-ready canvas:** 3:4 portrait, printed at the full 58 mm paper width (384 × 512 dots). 👁️ **Print look** shows exactly what the black-only printer will produce.
- **Print styles:** *Shaded colours* turns each colour into an even dot pattern (best for coloured-in pictures); *Bold lines* prints every mark solid black (best for line drawings and writing).
- **Finish:** add the artist name and a title, then print, save as PNG, or print on a normal printer.
- Touch-friendly: smooth strokes, stylus pressure, and a resting palm doesn't leave marks. Ctrl+Z / Ctrl+Y on a keyboard.

## 📚 Word Quest (daily vocabulary)

A personal learning journey for home or class, separate from the 60-second games.

- **Monday–Friday:** one new word a day. Learn it (🔊 every word and sentence is read aloud), play 3 quick puzzles, then write your own sentence. Missed a day? Catch up any time that week.
- **Print & solve:** every day prints a worksheet on the POS-58 with the day and date: the word, its meaning and puzzles to solve with a pencil, then stick it in a notebook. KG sheets have tracing and picture puzzles; older levels get a word search of the week's words, yesterday's word as review, synonyms, opposites and sentence lines (answers printed upside down).
- **Weekend quiz:** 8–10 questions on the week's 5 words plus review words from earlier weeks. No timer. Finishing wins the week's sticker in 🥉 Bronze, 🥈 Silver (70%+) or 🥇 Gold (90%+); retrying keeps the best. Stickers print as round cut-outs for the notebook.
- **Special stickers** for habits: first word, 5- and 10-day streaks, a perfect week, Gold, writing 5 sentences, printing 5 worksheets and more. The 🔥 streak counts school days only.
- **Five levels:** 🐣 Tiny Words (KG: two- and three-letter words), 🌱 Word Sprouts (Grades 1–2), 🚀 Word Explorers (3–5), 🦉 Word Masters (6–8), 🧠 Word Champions (9+ and grown-ups). Each has 12 themed weeks (300 words in all); after week 12 the themes repeat so stickers can be upgraded.
- **Learners and passkeys:** several learners can share one device. A learner can stay on the device only, or be **saved with a passkey** (fingerprint, face or screen lock; no password). Passkey learners sync to the server, so progress is safe and works on any device. Each passkey learner gets a one-time **backup code** that prints on a learner card, for signing in on a new device.
- Open Word Quest straight away with **`/#quest`** (handy as a home-screen bookmark). Preview another day with `?wqdate=2026-11-07`.

Passkeys need the real **https://** site or `http://localhost`; on a plain `http://192.168…` address learners can still use “Just this device”. Server data lives in `data/wordquest.json` (the Docker setup mounts `./data` so it survives rebuilds). Words are in [`js/wordquest-data.js`](js/wordquest-data.js); add weeks in the same format.

## 🤖 Robo Academy (electronics → robotics → AI)

A self-paced, 24-week course for anyone who wants to become a robotics engineer: **one lesson a day**, a **weekly test** for a passport stamp, and real hands-on builds.

| Stage | Weeks | What you learn |
|---|---|---|
| ⚡ Spark Cadet | 1–3 | Electricity, Ohm's law, safety, LEDs, resistors, breadboards, series/parallel, multimeter, capacitors, diodes |
| 🔧 Circuit Builder | 4–6 | Transistors, sensors, voltage dividers, relays, schematics, regulators, soldering, binary, logic gates, the 555 |
| 💻 Code Ninja | 7–11 | Arduino: blink, variables, serial, buttons, loops, analogRead, PWM, ultrasonic/DHT11/PIR/IR sensors, servos, displays, music, functions |
| 🛠️ Embedded Maker | 12–15 | millis(), UART/I2C/SPI, Bluetooth, DC/stepper motors and drivers, ESP32 Wi-Fi web servers, IoT, interrupts, state machines, debugging |
| 🤖 Robot Engineer | 16–20 | Build a 2WD robot: obstacle avoider, line follower with PID, phone web-app control, IMU and encoders |
| 🧠 AI Roboticist | 21–24 | Machine learning, Teachable Machine, ESP32-CAM, TinyML (Edge Impulse), Raspberry Pi + Python + OpenCV, capstone AI robot with a web dashboard |

- **Every lesson:** the idea, key facts, code (for programming days), a fun fact, a **🎬 YouTube search** button for the topic, 2 quick questions, and a hands-on **mission** checklist. Up to 3 stars.
- **Daily lab sheet** (thermal print): the idea, key facts, code, mission checkboxes, exercise questions with answer lines, a sketch box, and a **QR code that opens the YouTube search** on a phone. Answers are printed upside down. Day 4 sheets include next week's parts to order.
- **Pacing:** one new lesson unlocks per day (a grown-up setting allows more). After 5 lessons, the **weekly test** (10 questions, pass 60%, gold *distinction* stamp at 90%) unlocks the next week. Unlimited retries; the best result is kept.
- **Engineer's Passport:** 24 stamps, printable as cut-out stamps. Ranks rise with each stage; XP and a daily streak keep it motivating.
- **Parts list:** every week's components, a week ahead, with "have it" ticks and a printable shopping list.
- **Lab simulators:** Ohm's Law Playground, Resistor Decoder (with challenges), Binary Switches, Logic Gate Lab and PWM Dimmer.
- Learners, passkeys and syncing are **shared with Word Quest**. Open directly with **`/#robo`**. Course content lives in [`js/robo-data.js`](js/robo-data.js).

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
├── wordquest-server.js # Word Quest passkey (WebAuthn) sign-in and progress storage
├── sw.js               # Offline cache (bump CACHE_NAME on every release)
├── css/styles.css      # Tablet-first layout (portrait & landscape), school colours, print slip
└── js/
    ├── challenges.js   # Levels, games, all question content and the math generator
    ├── app.js          # Round flow, timer, scoring, streaks, results, leaderboard UI
    ├── audio.js        # Web Audio sound effects (no audio files)
    ├── camera.js       # Webcam snapshot with cartoon fallback
    ├── confetti.js     # Confetti bursts
    ├── leaderboard.js  # localStorage scores, CSV export, server sync
    ├── printer.js      # Web Bluetooth POS-58 ESC/POS driver: dithering, banded images, receipts & drawings
    ├── studio.js       # Doodle Studio: drawing tools, colouring pages, print preview
    ├── wordquest-data.js   # Word Quest levels, weekly themes, words and special stickers
    ├── wordquest-merge.js  # Progress merging shared by browser and server
    ├── wordquest-store.js  # Learners on the device, passkeys, server sync
    ├── wordquest-print.js  # Worksheets, stickers and learner cards for the thermal printer
    ├── wordquest.js        # Word Quest screens: lesson, puzzles, quiz, sticker book
    ├── qr.js               # Tiny QR code generator (YouTube links on lab sheets)
    ├── robo-data.js        # Robo Academy: 6 stages, 24 weeks, 120 lessons, weekly parts lists
    └── robo.js             # Robo Academy screens, lab simulators, lab sheets, stamps
```
