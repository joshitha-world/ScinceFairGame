// Webcam keepsake photo
// Photos are always square and centre-cropped (never stretched), because tablets
// deliver a portrait stream when held upright while laptops deliver landscape.

const PHOTO_SIZE = 480;

class CameraController {
  constructor() {
    this.stream = null;
    this.videoEl = null;
    this.capturedPhotoDataUrl = null;
    this.isActive = false;
    this.isFrontCamera = true;
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
      // No size/aspect constraints: on Android, Chrome satisfies them by cropping the
      // sensor (extra zoom). We take the camera's natural frame and crop it ourselves.
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });

      // Mirror only the front camera (laptop webcams usually report no facingMode)
      const settings = this.stream.getVideoTracks()[0].getSettings();
      this.isFrontCamera = settings.facingMode !== 'environment';

      if (this.videoEl) {
        this.videoEl.classList.toggle('mirrored', this.isFrontCamera);
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
    canvas.width = PHOTO_SIZE;
    canvas.height = PHOTO_SIZE;
    const ctx = canvas.getContext('2d');

    if (this.isActive && this.videoEl && this.videoEl.videoWidth) {
      // Shutter sound
      if (window.soundEngine) window.soundEngine.playShutter();

      // Centre square of the live frame — the same area the square preview shows
      const vw = this.videoEl.videoWidth;
      const vh = this.videoEl.videoHeight;
      const side = Math.min(vw, vh);
      const sx = (vw - side) / 2;
      const sy = (vh - side) / 2;

      if (this.isFrontCamera) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(this.videoEl, sx, sy, side, side, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      // Cartoon avatar when there is no camera
      const S = canvas.width;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, S, S);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < S; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, S); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(S, i); ctx.stroke();
      }

      // Head
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(S / 2, S * 0.36, S * 0.15, 0, Math.PI * 2);
      ctx.fill();
      // Goggles
      ctx.fillStyle = '#ffd600';
      ctx.beginPath();
      ctx.arc(S / 2 - S * 0.055, S * 0.345, S * 0.045, 0, Math.PI * 2);
      ctx.arc(S / 2 + S * 0.055, S * 0.345, S * 0.045, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.stroke();
      // Coat shoulders
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(S / 2 - S * 0.3, S);
      ctx.lineTo(S / 2 - S * 0.12, S * 0.58);
      ctx.lineTo(S / 2 + S * 0.12, S * 0.58);
      ctx.lineTo(S / 2 + S * 0.3, S);
      ctx.closePath();
      ctx.fill();
      // Tie
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(S / 2 - S * 0.02, S * 0.61, S * 0.04, S * 0.13);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold ${Math.round(S * 0.035)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('[ SLOKA STAR ]', S / 2, S * 0.95);
    }

    this.capturedPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    return this.capturedPhotoDataUrl;
  }
}

window.cameraController = new CameraController();

