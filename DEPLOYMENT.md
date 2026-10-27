# 🚀 Ubuntu Server & Kiosk Deployment Guide
### Edu Fair 2026 — SLOKA THE SCHOOL (Manikonda)
**Project Created & Designed by: Joshitha, Grade 6C**

---

## 📌 Architecture Overview

- **Port:** `3000` (configurable via `PORT` environment variable)
- **Host Binding:** `0.0.0.0` (accessible from all LAN interfaces & reverse proxies)
- **Reverse Proxy:** Nginx Proxy Manager (NPM) with SSL (Let's Encrypt)
- **Kiosk Target:** Android Tablet mounted vertically (Portrait mode)
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

## 📱 Android Tablet Vertical Kiosk Setup

The user interface has been tailored for Android tablets mounted vertically in a kiosk stand:

1. **Orientation:** Mount the tablet vertically (Portrait orientation).
   - In Android Settings ➔ Display ➔ Auto-rotate: Set to **Portrait Lock**.
2. **Camera Positioning:**
   - The front camera at the top of the vertical tablet will naturally be at eye level with students standing at the booth.
3. **Touch Ergonomics:**
   - The question visual/animation is placed at the **top half** of the screen.
   - The 4 answer options `[A], [B], [C], [D]` are placed at the **bottom half** with large touch targets (60px–68px high) for children's fingers.
4. **Full-Screen Kiosk Mode:**
   - Open **Google Chrome** on the Android tablet and navigate to `https://edufair.yourdomain.com`.
   - Tap Chrome's menu (three dots) ➔ **"Add to Home screen"** or **"Install app"**.
   - Launching from the home screen icon opens the app in standalone full-screen window without browser address bars!
   - *Alternative kiosk apps:* **Fully Kiosk Browser** or **SureLock Kiosk**.

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

