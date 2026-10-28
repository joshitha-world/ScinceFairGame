# 🚀 Ubuntu Server & Kiosk Deployment Guide
### Edu Fair 2026 — SLOKA THE SCHOOL (Manikonda)
**Project Created & Designed by: Joshitha, Grade 6C**

---

## 📌 Architecture Overview

- **Port:** `3000` (configurable via `PORT` environment variable)
- **Host Binding:** `0.0.0.0` (accessible from all LAN interfaces & reverse proxies)
- **Reverse Proxy:** Nginx Proxy Manager (NPM) with SSL (Let's Encrypt)
- **Kiosk Target:** 10" Android tablet (portrait or landscape; layout adapts)
- **Peripherals:** Integrated Webcam (top bezel) & POS-58 Bluetooth Thermal Printer

---

## 🛠️ Method 1: Docker & Docker Compose (Recommended)

This repository includes a production-ready `Dockerfile` and `docker-compose.yml`.

### 1. Clone the repository on your Ubuntu server:
```bash
git clone https://github.com/<your-username>/ScinceFairGame.git /opt/edufair
cd /opt/edufair
```

### 2. Start with Docker Compose:
```bash
docker compose up -d --build
```

### 3. Check container status:
```bash
docker compose ps
docker compose logs -f
```

The application is now running and listening on `0.0.0.0:3000`!

---

## 🛠️ Method 2: Native Node.js & PM2 (Process Manager)

If you prefer running without Docker:

### 1. Install Node.js (v18 or v20):
```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Install PM2 process manager:
```bash
sudo npm install -g pm2
```

### 3. Start the application with PM2:
```bash
cd /opt/edufair
pm2 start server.js --name "sloka-edufair-2026" --env PORT=3000,HOST=0.0.0.0
pm2 save
pm2 startup
```

---

## 🌐 Nginx Proxy Manager (NPM) Configuration

To access the app securely via your domain (e.g., `https://edufair.yourdomain.com`):

### 1. In Nginx Proxy Manager Web UI:
1. Click **Hosts** ➔ **Proxy Hosts** ➔ **Add Proxy Host**.
2. **Details Tab:**
   - **Domain Names:** `edufair.yourdomain.com` (or your chosen domain/subdomain)
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `<your-ubuntu-server-local-ip>` (e.g., `192.168.1.100` or `127.0.0.1` or docker container name if in same network)
   - **Forward Port:** `3000`
   - **Cache Assets:** ✅ Enabled
   - **Block Common Exploits:** ✅ Enabled
   - **Websockets Support:** ✅ Enabled (recommended)

3. **SSL Tab (Crucial for Camera & Web Bluetooth!):**
   - **SSL Certificate:** *Request a new SSL Certificate with Let's Encrypt*
   - **Force SSL:** ✅ Enabled
   - **HTTP/2 Support:** ✅ Enabled
   - **HSTS Enabled:** ✅ Enabled
   - Agree to Let's Encrypt Terms and click **Save**.

> 💡 **IMPORTANT NOTE FOR CAMERA & BLUETOOTH:**  
> Modern Chromium browsers (including Chrome on Android) require either **`https://`** or **`localhost`** to allow `navigator.mediaDevices.getUserMedia` (Webcam) and `navigator.bluetooth` (POS-58 thermal printer). Setting up SSL in Nginx Proxy Manager ensures all Android tablets at the booth will have full camera and Bluetooth access!

---

## 📱 Android Tablet Offline Kiosk Setup (100% Zero-Wi-Fi Operation)

This application is built as an offline-first **Progressive Web App (PWA)** with a dedicated Service Worker (`sw.js`) and Web Manifest (`manifest.json`).

### How to Install for 100% Offline School Booth Use:
1. **Initial Setup (Once with Internet/LAN):**
   - Open **Google Chrome** on the Android tablet and visit `https://edufair.yourdomain.com` (or `http://<server-ip>:3000`).
   - The Service Worker will automatically cache **100% of all scripts, questions, sound synthesizer, and styles** (bump `CACHE_NAME` in `sw.js` after every update so tablets refresh).
   - Tap Chrome's menu (three dots) ➔ tap **"Add to Home screen"** or **"Install app"**.
2. **Offline at the School Fair (No Wi-Fi Needed!):**
   - You can now turn Wi-Fi **OFF** (or put in Airplane mode).
   - Launch the app from the tablet's home screen icon.
   - **Everything works 100% offline**:
     * ⏱️ **60-Second Timers**: Run in local JavaScript.
     * 🌌 **Physics & Idiom Simulations**: 60-FPS Canvas animations render smoothly on the tablet GPU.
     * 🔊 **Sound Effects**: Synthesized locally using the Web Audio API without downloading MP3s.
     * 📷 **Webcam ID Camera**: Front camera captures photos locally.
     * 🖨️ **POS-58 Bluetooth Printing**: Communicates directly over local Bluetooth radio without internet.
     * 🏆 **Leaderboard & High Scores**: Persisted locally in tablet storage.
3. **Reconnecting & Syncing Data:**
   - When the tablet connects to Wi-Fi/Internet later, the app automatically triggers a background sync to send the offline-collected scores to the server (`POST /api/sync-scores`).
   - Teachers can also open the **Top Scores Hall of Fame** modal and tap **"📥 Export to CSV"** to instantly download the results to a spreadsheet file on the tablet or a USB drive without needing any internet!

---

## 🖨️ POS-58 Bluetooth Thermal Printer Setup

1. Turn on the POS-58 portable printer and ensure paper roll is inserted.
2. In Android Settings ➔ Bluetooth: Pair with the POS-58 device (PIN is usually `0000` or `1234`).
3. Open the web app on Chrome.
4. Tap the **🖨️ POS58 Printer** badge in the top bar.
5. In the Chrome Bluetooth pairing popup, select your **POS-58** printer.
6. The badge turns green: `🖨️ Connected (POS-58)`.
7. When the 60-second round concludes, tap **"🖨️ Send to POS58 Bluetooth Printer"** to print the keepsake with the student's dithered photo and Sloka School certificate!

---

## 🌟 Student Designer Credits

- **School:** SLOKA THE SCHOOL, Manikonda (A Temple of Moral Education)
- **Event:** Edu Fair 2026
- **Student Developer & Designer:** **Joshitha, Grade 6C**

