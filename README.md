# 🔬 Science Fair Educational Game

An interactive, high-energy educational web application designed for science fair booths, STEM exhibits, and school kiosks.

Built with pure modern web standards: **Web Bluetooth API** (ESC/POS thermal printing for POS-58), **WebRTC MediaDevices API** (live webcam badge capture), **Web Audio API** (synthesized sound effects), and **HTML5 Canvas 60-FPS Physics Simulations**.

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

## 🎮 Game Modes (Science & English)

### ⚛️ Science Laboratory Challenges

#### 1. 🧬 Science Synonym Matching
- **Left Panel:** Displays high-resolution scientific vector diagrams and terms (e.g., *Precipitation*, *Velocity*, *Photosynthesis*, *Density*, *Thermal Energy*, *Osmosis*, *Combustion*, *Inertia*, *Biodiversity*, *Refraction*, *Gravity*).
- **Right Panel:** Displays multiple-choice scientific synonyms and equivalent concepts `[A], [B], [C], [D]`.
- **Feedback:** Immediate visual and audio feedback, +10 points per correct answer, with concise educational explanations.

#### 2. 🌌 Science Phenomenon Guessing
- **Left Panel:** Displays real-time **60-FPS Canvas Physics & Natural Event Simulations**:
  - **Solar Eclipse**: Moon transiting the Sun with glowing corona flares and totality diamond ring.
  - **Prism Refraction & Dispersion**: White incident beam splitting into rainbow spectral wavelengths.
  - **Photosynthesis**: Chloroplast thylakoids absorbing photons and releasing O₂ bubbles.
  - **Volcanic Eruption**: Magma chamber pressure, pyroclastic fountain, and glowing lava ejection.
  - **DNA Double Helix**: Rotating 3D-projected complementary base pairs (A-T, G-C).
  - **Supernova Nucleosynthesis**: Massive star gravitational collapse and expanding blast wave.
  - **Brownian Motion**: Colloidal particle random-walk drift caused by molecular collisions.
  - **Bernoulli Aerodynamic Lift**: Airfoil streamline pressure differential generating upward lift.
  - **Hydrological Water Cycle**: Evaporation, cloud condensation, and precipitation rainfall.
  - **Magnetic Dipole Field**: Bar magnet with magnetic flux loops and aligning iron filings.
- **Right Panel:** Vocabulary choices `[A], [B], [C], [D]` to deduce the observed scientific phenomenon.

---

### 📚 English Language Arts Challenges

#### 3. 📖 English Synonym Matching (Vocabulary & Lexicon)
- **Left Panel:** Features evocative literary concept scenes, parts of speech, and advanced vocabulary terms (e.g., *Meticulous*, *Ephemeral*, *Resilient*, *Eloquent*, *Ubiquitous*, *Serendipity*, *Benevolent*, *Cacophony*, *Pragmatic*, *Tenacious*).
- **Right Panel:** Multiple-choice options `[A], [B], [C], [D]` to match the most precise synonym and meaning.
- **Feedback:** Instant feedback highlighting root etymology, Latin/Greek origins, and sentence context.

#### 4. 🎭 English Idiom & Metaphor Guessing (Figurative Language)
- **Left Panel:** Displays **60-FPS Animated Idioms and Metaphors**:
  - **Break the Ice**: Mallet striking and shattering a frozen ice barrier to open warm conversation.
  - **Burn the Midnight Oil**: Antique desk oil lamp glowing late into the night beside classic books and ticking wall clock.
  - **Spill the Beans**: Secret jar tumbling over and scattering colorful bouncing beans.
  - **On Cloud Nine**: Fluffy golden cloud #9 floating happily in the twilight sky with a joyful bobbing star mascot.
  - **A Piece of Cake**: Celebratory 3-tier strawberry cake with sparkler candles and effortless dessert slice.
  - **Time Flies**: Winged golden alarm clock soaring through clouds with feather air trails.
  - **Raining Cats and Dogs**: Dark storm clouds with lightning flashes and torrential rain alongside playful cat/dog pawprints.
  - **Bite the Bullet**: Steadfast knight's shield deflecting fiery obstacle bolts with sparkling fortitude.
- **Right Panel:** Choices `[A], [B], [C], [D]` to deduce the true figurative or historical meaning.

---

## ⏱️ Strict 60-Second Speed Timer
- **Countdown Gauge:** Dynamic timer counting down strictly from `01:00` to `00:00`.
- **Sensory Cues:** Color shifts from Cyan (>20s) to Amber warning (11-20s) to pulsing Red (<10s) with urgent auditory tick-tock cues.
- **Strict Cutoff:** At `00:00`, the round terminates immediately and transitions to the **Mission Results** screen.

---

## 🎖️ Star Award System
Based on correct match count within the 60-second limit:
- **★☆☆ 1 Star (Novice Researcher):** 1 – 3 correct answers
- **★★☆ 2 Stars (Lab Specialist):** 4 – 6 correct answers
- **★★★ 3 Stars (Science Fair Genius):** 7+ correct answers

Includes sequential star popping animations, confetti celebrations, and brass synthesizer fanfares.

---

## 📷 Webcam Scientist ID Snapshot
- **Live Video Feed:** Captures live webcam stream (`getUserMedia`).
- **Shutter Effect:** Realistic mechanical shutter audio and visual flash.
- **Fallback Avatar:** Synthesizes a laboratory scientist avatar if camera permission is denied or absent.
- **Photo Keepsake:** Seamlessly embeds the captured photo into the thermal receipt and research certificate.

---

## 🖨️ POS-58 Bluetooth Thermal Printer Integration
Specifically designed for **POS-58 (58mm / 384 dots)** thermal receipt printers:
- **Web Bluetooth Connectivity:** Scans and connects to POS58 BLE GATT services (`000018f0...`, `e7810a71...`, `49535343...`).
- **ESC/POS Protocol:**
  - Initial reset (`ESC @`)
  - Centering & Bold formatting (`ESC a 1`, `ESC E 1`)
  - Double width/height typography for certificates (`GS ! 0x11`)
  - Line feeds and paper cut (`ESC d`, `GS V`)
- **Floyd-Steinberg Dithering:** Converts the user's webcam photo into crisp 1-bit monochrome raster pixels (`GS v 0`) scaled for 384-dot thermal print heads.
- **Virtual Thermal Receipt Preview:** Displays on-screen 58mm receipt paper with jagged top and bottom tear edges.
- **Browser Print Fallback:** One-click `@media print` style to print the thermal keepsake on any connected printer or PDF.

---

## 🏆 Top Scores / Leaderboard
- Persists high scores locally in `localStorage`.
- Displays top researcher names, stars earned, scores, accuracy, and dates.
- Modal filterable by **All**, **Synonym Matching**, and **Phenomenon Guessing**.

---

## 🛠️ Architecture & Files

```text
├── index.html                  # Semantic application markup & modals
├── package.json                # Project configuration & npm start script
├── server.js                   # Zero-dependency local Node.js static server
├── css/
│   └── styles.css              # Glassmorphic sci-fi UI, responsive layout, print styles
└── js/
    ├── app.js                  # Main controller, game loop, 60s timer, state machine
    ├── audio.js                # Web Audio API synthesizer (no missing MP3 files)
    ├── camera.js               # Webcam stream controller, snapshot & badge compositor
    ├── confetti.js             # Canvas particle confetti burst celebration engine
    ├── leaderboard.js          # High scores manager with localStorage persistence
    ├── phenomenonAnimations.js # 60-FPS physics canvas simulations for 10 phenomena
    ├── printer.js              # Web Bluetooth POS-58 driver & ESC/POS raster serializer
    ├── questions.js            # Comprehensive scientific question banks
    └── synonymIllustrations.js # Scalable vector SVG diagrams for scientific terms
```

