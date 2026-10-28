// Webcam and Science Fair Keepsake Badge Generator

class CameraController {
  constructor() {
    this.stream = null;
    this.videoEl = null;
    this.capturedPhotoDataUrl = null;
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
      ctx.fillText('[ SLOKA STAR ]', canvas.width / 2, 270);
    }

    this.capturedPhotoDataUrl = canvas.toDataURL('image/png');
    return this.capturedPhotoDataUrl;
  }
}

window.cameraController = new CameraController();

