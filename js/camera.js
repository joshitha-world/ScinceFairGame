// Webcam and Science Fair Keepsake Badge Generator

class CameraController {
  constructor() {
    this.stream = null;
    this.videoEl = null;
    this.capturedPhotoDataUrl = null;
    this.badgeDataUrl = null;
    this.isActive = false;
  }

  setVideoElement(videoEl) {
    this.videoEl = videoEl;
  }

  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Webcam getUserMedia is not supported in this browser/protocol.');
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (this.videoEl) {
        this.videoEl.srcObject = this.stream;
        await this.videoEl.play();
      }
      this.isActive = true;
      return true;
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      this.isActive = false;
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }
    this.isActive = false;
  }

  // Snap photo from webcam or fallback to synthesized scientist avatar
  capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 288;
    const ctx = canvas.getContext('2d');

    if (this.isActive && this.videoEl && this.videoEl.videoWidth) {
      // Shutter sound
      if (window.soundEngine) window.soundEngine.playShutter();

      // Mirror horizontally for natural selfie feel
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(this.videoEl, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      // Synthesized Scientist Portrait Avatar
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lab background grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Scientist avatar silhouette
      ctx.fillStyle = '#38bdf8';
      // Head
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 110, 52, 0, Math.PI * 2);
      ctx.fill();
      // Safety goggles
      ctx.fillStyle = '#ffd600';
      ctx.beginPath();
      ctx.arc(canvas.width / 2 - 20, 105, 16, 0, Math.PI * 2);
      ctx.arc(canvas.width / 2 + 20, 105, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Lab Coat shoulders
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 110, canvas.height);
      ctx.lineTo(canvas.width / 2 - 45, 175);
      ctx.lineTo(canvas.width / 2 + 45, 175);
      ctx.lineTo(canvas.width / 2 + 110, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Tie / Badge
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(canvas.width / 2 - 8, 185, 16, 45);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[ SCIENTIST ID PHOTO ]', canvas.width / 2, 270);
    }

    this.capturedPhotoDataUrl = canvas.toDataURL('image/png');
    return this.capturedPhotoDataUrl;
  }

  // Composite the Science Fair Keepsake Badge (Photo + Stars + Lab Seal)
  generateKeepsakeBadge({ playerName, modeTitle, score, stars, dateStr }) {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Thermal-friendly high contrast badge layout
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative double border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

    // Header
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = '900 16px "Courier New", monospace';
    ctx.fillText('SLOKA THE SCHOOL', canvas.width / 2, 36);

    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('★ EDU FAIR 2026 KEEPSAKE ★', canvas.width / 2, 54);

    ctx.font = 'italic 10px sans-serif';
    ctx.fillText('Project Designed by: Joshitha (Grade 6C)', canvas.width / 2, 68);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(25, 74);
    ctx.lineTo(canvas.width - 25, 74);
    ctx.stroke();

    // User Photo (or default)
    const photo = new Image();
    photo.src = this.capturedPhotoDataUrl || this.capturePhoto();

    // Draw photo synchronously if loaded, or draw placeholder box
    const photoW = 240;
    const photoH = 180;
    const photoX = (canvas.width - photoW) / 2;
    const photoY = 82;

    ctx.drawImage(photo, photoX, photoY, photoW, photoH);
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    // Candidate Details
    const textStartY = photoY + photoH + 28;
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText(`RESEARCHER: ${playerName.toUpperCase()}`, canvas.width / 2, textStartY);

    ctx.font = '13px sans-serif';
    ctx.fillText(`FIELD: ${modeTitle}`, canvas.width / 2, textStartY + 24);

    // Star Rating
    const starString = '★ '.repeat(stars) + '☆ '.repeat(3 - stars);
    ctx.font = '900 24px sans-serif';
    ctx.fillText(starString.trim(), canvas.width / 2, textStartY + 58);

    // Score & Rank Title
    let rankTitle = 'NOVICE SCIENTIST';
    if (stars === 2) rankTitle = 'LAB SPECIALIST';
    if (stars === 3) rankTitle = 'SCIENCE FAIR GENIUS';

    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillText(`RANK: ${rankTitle}`, canvas.width / 2, textStartY + 84);
    ctx.fillText(`SCORE: ${score} POINTS`, canvas.width / 2, textStartY + 104);

    // Date & Barcode simulation
    ctx.font = '10px monospace';
    ctx.fillText(`VALIDATED: ${dateStr || new Date().toLocaleDateString()}`, canvas.width / 2, textStartY + 124);

    // Mini barcode lines
    const bcY = textStartY + 132;
    ctx.fillStyle = '#000000';
    for (let bx = 60; bx < canvas.width - 60; bx += 4) {
      if ((bx % 3) !== 0) {
        ctx.fillRect(bx, bcY, 2, 14);
      }
    }

    this.badgeDataUrl = canvas.toDataURL('image/png');
    return this.badgeDataUrl;
  }
}

window.cameraController = new CameraController();

