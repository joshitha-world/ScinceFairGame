// POS-58 Web Bluetooth Thermal Printer Controller & ESC/POS Generator
// Supports 58mm thermal printers (384 dots width) with Floyd-Steinberg image dithering

const POS58_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb',
  '0000af30-0000-1000-8000-00805f9b34fb'
];

class ThermalPrinterController {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isConnected = false;
    this.deviceName = 'POS-58';
    this.onStatusChange = null;
  }

  isSupported() {
    return Boolean(navigator.bluetooth && navigator.bluetooth.requestDevice);
  }

  setStatus(statusText, connected = false) {
    this.isConnected = connected;
    if (this.onStatusChange) {
      this.onStatusChange({
        connected: this.isConnected,
        statusText: statusText,
        deviceName: this.deviceName
      });
    }
  }

  async connect() {
    if (!this.isSupported()) {
      alert('Web Bluetooth is not supported in this browser.\nPlease use Google Chrome or Microsoft Edge on Windows/Mac/Android over localhost or HTTPS.');
      return false;
    }

    try {
      this.setStatus('Scanning for POS58...', false);

      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: POS58_SERVICES
      });

      this.deviceName = this.device.name || 'POS-58 Thermal';
      this.setStatus(`Connecting to ${this.deviceName}...`, false);

      this.device.addEventListener('gattserverdisconnected', () => {
        this.setStatus('Disconnected', false);
        this.characteristic = null;
        this.server = null;
      });

      this.server = await this.device.gatt.connect();

      // Find any writable characteristic across standard POS services
      let writeChar = null;

      for (const serviceUuid of POS58_SERVICES) {
        try {
          const service = await this.server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              writeChar = char;
              break;
            }
          }
          if (writeChar) break;
        } catch (e) {
          // Continue scanning next service
        }
      }

      // If specific services not found, inspect all primary services
      if (!writeChar) {
        try {
          const services = await this.server.getPrimaryServices();
          for (const s of services) {
            const chars = await s.getCharacteristics();
            for (const c of chars) {
              if (c.properties.write || c.properties.writeWithoutResponse) {
                writeChar = c;
                break;
              }
            }
            if (writeChar) break;
          }
        } catch (err) {
          console.warn('Could not enumerate primary services:', err);
        }
      }

      if (!writeChar) {
        throw new Error('Connected to Bluetooth device, but no writable printer characteristic found.');
      }

      this.characteristic = writeChar;
      this.setStatus(`Connected (${this.deviceName})`, true);
      return true;
    } catch (err) {
      console.error('Bluetooth connection failed:', err);
      this.setStatus('Connection cancelled / failed', false);
      return false;
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.setStatus('Disconnected', false);
    this.characteristic = null;
  }

  // Convert canvas/image to a 1-bit raster for POS58.
  // 'fs' (Floyd-Steinberg) suits photos; 'bayer' (ordered) turns flat drawing colours into clean,
  // even dot patterns instead of grainy noise. gamma > 1 darkens mid-tones so light colours still print.
  ditherImageTo1Bit(imageData, width, height, gamma = 1, method = 'fs') {
    if (method === 'bayer') return this.orderedDither(imageData, width, height, gamma);
    if (method === 'bold') return this.boldThreshold(imageData, width, height);
    const data = imageData.data;
    const gray = new Float32Array(width * height);

    // Convert to grayscale
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const g = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      gray[i] = gamma === 1 ? g : 255 * Math.pow(g / 255, gamma);
    }

    // Floyd-Steinberg error diffusion
    const bitmap = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const oldPixel = gray[i];
        const newPixel = oldPixel < 128 ? 0 : 255;
        bitmap[i] = newPixel === 0 ? 1 : 0; // 1 = black (print dot), 0 = white
        const quantError = oldPixel - newPixel;

        if (x + 1 < width) gray[i + 1] += quantError * (7 / 16);
        if (x - 1 >= 0 && y + 1 < height) gray[i + width - 1] += quantError * (3 / 16);
        if (y + 1 < height) gray[i + width] += quantError * (5 / 16);
        if (x + 1 < width && y + 1 < height) gray[i + width + 1] += quantError * (1 / 16);
      }
    }

    return this.packBitmap(bitmap, width, height);
  }

  orderedDither(imageData, width, height, gamma) {
    const BAYER8 = [
      0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
      12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
      3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
      15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21
    ];
    const data = imageData.data;
    const bitmap = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const p = i * 4;
        let g = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
        if (gamma !== 1) g = 255 * Math.pow(g / 255, gamma);
        const threshold = (BAYER8[(y % 8) * 8 + (x % 8)] + 0.5) * 4;
        bitmap[i] = g < threshold ? 1 : 0;
      }
    }
    return this.packBitmap(bitmap, width, height);
  }

  // Anything that isn't near-white prints solid black: crisp coloured lines and writing
  boldThreshold(imageData, width, height) {
    const data = imageData.data;
    const bitmap = new Uint8Array(width * height);
    for (let i = 0; i < bitmap.length; i++) {
      const p = i * 4;
      const g = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
      bitmap[i] = g < 215 ? 1 : 0;
    }
    return this.packBitmap(bitmap, width, height);
  }

  // Pack 8 bits per byte (columns 0..width-1); 1 = black dot
  packBitmap(bitmap, width, height) {
    const bytesPerRow = Math.ceil(width / 8);
    const packed = new Uint8Array(bytesPerRow * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (bitmap[y * width + x] === 1) {
          const byteIdx = y * bytesPerRow + Math.floor(x / 8);
          const bitIdx = 7 - (x % 8);
          packed[byteIdx] |= (1 << bitIdx);
        }
      }
    }

    return { packed, bitmap, bytesPerRow, width, height };
  }

  // Scale any image/canvas to the 384-dot print width (centre-cropped to maxHeight) and dither it.
  // Returns the packed raster for the printer plus a black/white canvas for on-screen previews.
  renderThermal(source, { maxHeight = 384, gamma = 1, method = 'fs' } = {}) {
    const printWidth = 384;
    const srcW = source.naturalWidth || source.width;
    const srcH = source.naturalHeight || source.height;
    const printHeight = Math.min(maxHeight, Math.round(printWidth * (srcH / srcW)));

    const scale = Math.max(printWidth / srcW, printHeight / srcH);
    const cropW = printWidth / scale;
    const cropH = printHeight / scale;

    const canvas = document.createElement('canvas');
    canvas.width = printWidth;
    canvas.height = printHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, printWidth, printHeight);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, (srcW - cropW) / 2, (srcH - cropH) / 2, cropW, cropH, 0, 0, printWidth, printHeight);

    const imgData = ctx.getImageData(0, 0, printWidth, printHeight);
    const result = this.ditherImageTo1Bit(imgData, printWidth, printHeight, gamma, method);

    // Paint the dots back onto the canvas so it doubles as a "what will print" preview
    const out = imgData.data;
    for (let i = 0; i < result.bitmap.length; i++) {
      const v = result.bitmap[i] ? 0 : 255;
      out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = v;
      out[i * 4 + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    return { ...result, canvas };
  }

  // GS v 0 raster image, sent in bands: many cheap POS-58 printers drop tall single images
  appendRaster(append, { packed, bytesPerRow, height }) {
    const BAND = 128;
    append([0x1B, 0x61, 0x01]); // centre
    for (let y = 0; y < height; y += BAND) {
      const rows = Math.min(BAND, height - y);
      append([0x1D, 0x76, 0x30, 0x00, bytesPerRow % 256, Math.floor(bytesPerRow / 256), rows % 256, Math.floor(rows / 256)]);
      append(Array.from(packed.subarray(y * bytesPerRow, (y + rows) * bytesPerRow)));
    }
    append([0x0A]);
  }

  // Generate ESC/POS commands
  buildEscPosCommands({ playerName, modeTitle, levelLabel, score, stars, rankTitle, dateStr, imageElement }) {
    const commands = [];

    const append = (bytes) => {
      commands.push(...bytes);
    };

    // POS-58 default code page is plain ASCII; anything else prints as garbage
    const appendText = (text) => {
      const ascii = text.replace(/[^\x20-\x7E\n]/g, '');
      append(Array.from(ascii, ch => ch.charCodeAt(0)));
    };

    // ESC @ : Initialize
    append([0x1B, 0x40]);

    // Center alignment
    append([0x1B, 0x61, 0x01]);

    // Header: Double size
    append([0x1D, 0x21, 0x11]); // 2x width, 2x height
    appendText('SLOKA THE SCHOOL\n');
    append([0x1D, 0x21, 0x00]); // Normal size
    appendText('EDU FAIR 2026\n');
    appendText('A Temple of Moral Education\n');
    appendText('Manikonda, Hyderabad\n');
    appendText('================================\n');
    append([0x1B, 0x45, 0x01]);
    appendText('PROJECT DESIGNED BY:\n');
    appendText('JOSHITHA (GRADE 6B)\n');
    append([0x1B, 0x45, 0x00]);
    appendText('================================\n');

    // Left Align for details
    append([0x1B, 0x61, 0x00]);
    append([0x1B, 0x45, 0x01]); // Bold on
    appendText(`NAME:     ${playerName.toUpperCase()}\n`);
    appendText(`GAME:     ${modeTitle}\n`);
    appendText(`LEVEL:    ${levelLabel}\n`);
    appendText(`SCORE:    ${score} PTS\n`);
    append([0x1B, 0x45, 0x00]); // Bold off

    const starIcons = '[*]'.repeat(stars) + '[ ]'.repeat(3 - stars);
    appendText(`AWARD:    ${starIcons}\n`);
    appendText(`          ${rankTitle}\n`);
    appendText(`DATE:     ${dateStr || new Date().toLocaleString()}\n`);
    appendText('--------------------------------\n');

    // If an image (badge or webcam photo) is provided, render ESC/POS raster bitmap (GS v 0)
    if (imageElement) {
      try {
        this.appendRaster(append, this.renderThermal(imageElement, { maxHeight: 384 }));
      } catch (err) {
        console.warn('Bitmap generation failed:', err);
      }
    }

    // Center Align for footer
    append([0x1B, 0x61, 0x01]);
    appendText('================================\n');
    append([0x1B, 0x45, 0x01]);
    appendText('SLOKA THE SCHOOL - MANIKONDA\n');
    appendText('EDU FAIR 2026 KEEPSAKE\n');
    append([0x1B, 0x45, 0x00]);
    appendText('Designed by Joshitha (Grade 6B)\n');
    appendText('Moral Education & Excellence\n');

    // Feed lines & Cut
    append([0x1B, 0x64, 0x04]); // feed 4 lines
    append([0x1D, 0x56, 0x42, 0x00]); // GS V B 0 (Paper cut if cutter available)

    return new Uint8Array(commands);
  }

  // Doodle Studio slip: header, the drawing at full paper width, title and artist
  buildDrawingCommands({ artist, title, dateStr, source, gamma, method = 'bayer' }) {
    const commands = [];
    const append = (bytes) => { for (const b of bytes) commands.push(b); };
    const appendText = (text) => {
      const ascii = text.replace(/[^\x20-\x7E\n]/g, '');
      append(Array.from(ascii, ch => ch.charCodeAt(0)));
    };

    append([0x1B, 0x40]);
    append([0x1B, 0x61, 0x01]);
    append([0x1D, 0x21, 0x11]);
    appendText('DOODLE STUDIO\n');
    append([0x1D, 0x21, 0x00]);
    appendText('Sloka The School - Manikonda\n');
    appendText('================================\n');

    this.appendRaster(append, this.renderThermal(source, { maxHeight: 512, gamma, method }));

    append([0x1B, 0x61, 0x01]);
    if (title) {
      append([0x1B, 0x45, 0x01]);
      appendText(`"${title}"\n`);
      append([0x1B, 0x45, 0x00]);
    }
    appendText(`by ${artist}\n`);
    appendText(`${dateStr}\n`);
    appendText('================================\n');
    appendText('App by Joshitha (Grade 6B)\n');
    append([0x1B, 0x64, 0x04]);
    append([0x1D, 0x56, 0x42, 0x00]);
    return new Uint8Array(commands);
  }

  async printDrawing(params, onProgress) {
    if (window.soundEngine) window.soundEngine.playPrintSound();
    if (!this.isConnected || !this.characteristic) return false;
    try {
      await this.sendDataInChunks(this.buildDrawingCommands(params), onProgress);
      return true;
    } catch (err) {
      console.error('Drawing print failed:', err);
      return false;
    }
  }

  // Send chunks to Bluetooth characteristic with flow control
  async sendDataInChunks(data, onProgress) {
    if (!this.characteristic) throw new Error('Printer is not connected.');

    const CHUNK_SIZE = 64; // Safe size for BLE MTU
    for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
      if (onProgress && offset % (CHUNK_SIZE * 16) === 0) onProgress(offset / data.length);
      const chunk = data.slice(offset, offset + CHUNK_SIZE);
      if (this.characteristic.properties.writeWithoutResponse) {
        await this.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await this.characteristic.writeValue(chunk);
      }
      // Brief pause between packets to prevent BLE buffer overflow
      await new Promise(r => setTimeout(r, 20));
    }
  }

  // Main print routine
  async printReceipt(params) {
    if (window.soundEngine) window.soundEngine.playPrintSound();

    if (!this.isConnected || !this.characteristic) {
      // Return false so caller can fall back to browser print or virtual receipt
      return false;
    }

    try {
      const binaryData = this.buildEscPosCommands(params);
      await this.sendDataInChunks(binaryData);
      return true;
    } catch (err) {
      console.error('Print transmission failed:', err);
      return false;
    }
  }
}

window.printerController = new ThermalPrinterController();

