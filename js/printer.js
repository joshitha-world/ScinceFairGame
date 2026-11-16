// Web Bluetooth thermal printer controller for 58 mm paper (384 dots wide).
// Two kinds of printer are supported:
//  - POS-58 receipt printers, which understand ESC/POS commands;
//  - "cat printers" (small pocket printers sold under many brands, used with the Fun Print / iPrint
//    apps: GB01-GB03, MX05-MX11, YT01 and the newer MXW01). They have no font and no ESC/POS: every
//    job is turned into rows of dots here and sent in the printer's own packet format.
// The app always builds ESC/POS; for a cat printer escPosToRows() draws those commands as dots.

const CAT_UUID = (short) => `0000${short}-0000-1000-8000-00805f9b34fb`;
const CAT_SERVICES = [CAT_UUID('ae30'), CAT_UUID('af30')];

// CRC-8 (polynomial 0x07) over a packet's payload
const CAT_CRC_TABLE = (() => {
  const t = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let b = 0; b < 8; b++) c = c & 0x80 ? ((c << 1) ^ 0x07) & 0xff : (c << 1) & 0xff;
    t[i] = c;
  }
  return t;
})();

// Cat printers read the leftmost dot from the lowest bit; ESC/POS rasters use the highest bit
const CAT_REVERSE = (() => {
  const t = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let r = 0;
    for (let b = 0; b < 8; b++) if (i & (1 << b)) r |= 0x80 >> b;
    t[i] = r;
  }
  return t;
})();

function catCrc(bytes) {
  let c = 0;
  for (const b of bytes) c = CAT_CRC_TABLE[(c ^ b) & 0xff];
  return c;
}

// [head0, head1, command, 0, length low, length high, ...payload, crc8(payload), 0xFF]
// Older models (GB/MX/YT) use the head 51 78, the MXW01 uses 22 21.
function catPacket(head, cmd, payload) {
  const p = Array.from(payload);
  return [head[0], head[1], cmd, 0x00, p.length & 0xff, (p.length >> 8) & 0xff, ...p, catCrc(p), 0xff];
}

const CAT_CLASSIC = [0x51, 0x78];
const CAT_MXW = [0x22, 0x21];

const POS58_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb',
  '0000af30-0000-1000-8000-00805f9b34fb',
  '0000ae30-0000-1000-8000-00805f9b34fb'
];

class ThermalPrinterController {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isConnected = false;
    this.deviceName = 'POS-58';
    this.onStatusChange = null;
    // 'escpos' (POS-58), 'cat' (older cat printers) or 'mxw' (MXW01)
    this.mode = 'escpos';
    this.catTx = null;     // ae01: commands
    this.catRx = null;     // ae02: replies and "slow down" signals
    this.catData = null;   // ae03: picture data (MXW01)
    this.catWaiters = [];
    this.catPaused = false;
    this.catEnergy = 0xC000;   // older models: heat, 0x0000 light .. 0xFFFF darkest
    this.mxwIntensity = 0x80;  // MXW01: heat, 0x00 .. 0xFF
    this.onCatNotify = this.onCatNotify.bind(this);
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

  // Find a characteristic we can write print data to
  async findWritable(server) {
    for (const serviceUuid of POS58_SERVICES) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        const chars = await service.getCharacteristics();
        const c = chars.find(ch => ch.properties.write || ch.properties.writeWithoutResponse);
        if (c) return c;
      } catch (e) {
        // try the next service
      }
    }
    try {
      for (const service of await server.getPrimaryServices()) {
        const chars = await service.getCharacteristics();
        const c = chars.find(ch => ch.properties.write || ch.properties.writeWithoutResponse);
        if (c) return c;
      }
    } catch (err) {
      console.warn('Could not enumerate primary services:', err);
    }
    return null;
  }

  // Work out which kind of printer this is and get the characteristics we need
  async setupLink(server) {
    this.mode = 'escpos';
    this.catTx = this.catRx = this.catData = null;
    this.catPaused = false;
    for (const uuid of CAT_SERVICES) {
      let service;
      try {
        service = await server.getPrimaryService(uuid);
      } catch (e) {
        continue;
      }
      let tx;
      try {
        tx = await service.getCharacteristic(CAT_UUID('ae01'));
      } catch (e) {
        continue;
      }
      this.catTx = tx;
      try {
        this.catRx = await service.getCharacteristic(CAT_UUID('ae02'));
        this.catRx.addEventListener('characteristicvaluechanged', this.onCatNotify);
        await this.catRx.startNotifications();
      } catch (e) {
        console.warn('Cat printer: no replies channel', e);
        this.catRx = null;
      }
      try {
        this.catData = await service.getCharacteristic(CAT_UUID('ae03'));
      } catch (e) {
        this.catData = null;
      }
      this.mode = await this.detectCat();
      this.characteristic = tx;
      console.info(`Printer ${this.deviceName}: ${this.mode === 'mxw' ? 'MXW01-style' : 'GB/MX-style'} cat printer`);
      return true;
    }
    this.characteristic = await this.findWritable(server);
    return Boolean(this.characteristic);
  }

  // Older cat printers answer 51 78 a3 (device state); the MXW01 answers 22 21 a1 (status)
  async detectCat() {
    const mxwName = /^MXW/i.test(this.deviceName || '');
    if (mxwName && this.catData) return 'mxw';
    if (!this.catRx) return 'cat';
    if (await this.catAsk(catPacket(CAT_CLASSIC, 0xa3, [0x00]), CAT_CLASSIC, null, 900)) return 'cat';
    if (this.catData && await this.catAsk(catPacket(CAT_MXW, 0xa1, [0x00]), CAT_MXW, 0xa1, 900)) return 'mxw';
    return 'cat';
  }

  onCatNotify(event) {
    const dv = event.target.value;
    const v = new Uint8Array(dv.buffer, dv.byteOffset, dv.byteLength);
    if (v.length < 3) return;
    // Older models ask us to pause (51 78 ae .. 10) and resume (.. 00) while their buffer empties
    if (v[0] === 0x51 && v[1] === 0x78 && v[2] === 0xae && v.length > 6) this.catPaused = v[6] === 0x10;
    const len = v.length > 5 ? v[4] | (v[5] << 8) : 0;
    const reply = { head: [v[0], v[1]], cmd: v[2], payload: v.slice(6, 6 + len) };
    this.catWaiters = this.catWaiters.filter(w => {
      if (w.head[0] !== v[0] || w.head[1] !== v[1] || (w.cmd !== null && w.cmd !== v[2])) return true;
      w.resolve(reply);
      return false;
    });
  }

  // Wait for a reply with this head (and command, unless null); null after ms
  catWait(head, cmd, ms) {
    return new Promise(resolve => {
      const waiter = { head, cmd, resolve };
      this.catWaiters.push(waiter);
      setTimeout(() => {
        if (!this.catWaiters.includes(waiter)) return;
        this.catWaiters = this.catWaiters.filter(w => w !== waiter);
        resolve(null);
      }, ms);
    });
  }

  async catWrite(ch, bytes) {
    const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const write = ch.properties.writeWithoutResponse ? ch.writeValueWithoutResponse(data) : ch.writeValue(data);
    await this.withTimeout(write, 5000, 'Printer stopped responding');
  }

  async catAsk(packet, head, cmd, ms) {
    const reply = this.catWait(head, cmd, ms);
    try {
      await this.catWrite(this.catTx, packet);
    } catch (e) {
      return null;
    }
    return reply;
  }

  // Printers sleep and tablets save power, so the Bluetooth link can drop between prints.
  // Reconnect to the printer chosen earlier without showing the device picker again.
  async ensureConnected() {
    if (this.characteristic && this.device && this.device.gatt.connected) return true;
    if (!this.device) return false;
    try {
      this.setStatus(`Reconnecting to ${this.deviceName}...`, false);
      this.server = await this.withTimeout(this.device.gatt.connect(), 10000, 'Printer did not answer');
      if (await this.setupLink(this.server)) {
        this.setStatus(`Connected (${this.deviceName})`, true);
        return true;
      }
    } catch (err) {
      console.warn('Reconnect failed:', err);
    }
    this.setStatus('Disconnected', false);
    return false;
  }

  withTimeout(promise, ms, message) {
    let timer;
    return Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), ms); })
    ]).finally(() => clearTimeout(timer));
  }

  async connect() {
    if (this.device) {
      if (await this.ensureConnected()) return true;
      // The printer we knew is off or out of range. Forget it so the next tap opens the picker
      // (the browser only shows the picker straight after a tap, so we can't open it now).
      this.device = null;
      this.setStatus('Printer not found: tap print again to choose it', false);
      return false;
    }
    if (!this.isSupported()) {
      alert('Web Bluetooth is not supported in this browser.\nPlease use Google Chrome or Microsoft Edge on Windows/Mac/Android over localhost or HTTPS.');
      return false;
    }

    try {
      this.setStatus('Looking for your printer...', false);

      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: POS58_SERVICES
      });

      this.deviceName = this.device.name || 'POS-58 Thermal';
      this.setStatus(`Connecting to ${this.deviceName}...`, false);

      const device = this.device;
      device.addEventListener('gattserverdisconnected', () => {
        if (device !== this.device) return;
        this.setStatus('Disconnected', false);
        this.characteristic = null;
        this.server = null;
      });

      this.server = await this.withTimeout(device.gatt.connect(), 15000, 'Printer did not answer');
      if (!(await this.setupLink(this.server))) {
        throw new Error('Connected to Bluetooth device, but no writable printer characteristic found.');
      }

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

  // ---- Cat printers: draw the ESC/POS job as rows of dots ----

  // Handles the ESC/POS the app produces: ESC @, ESC a (align), ESC E (bold), GS ! (size),
  // text lines, GS v 0 rasters, ESC d (feed) and GS V (cut, ignored). Returns 48-byte rows,
  // highest bit = leftmost dot, like a GS v 0 raster.
  escPosToRows(data) {
    const BPR = 48;
    const rows = [];
    const blank = (n) => { for (let k = 0; k < n; k++) rows.push(new Uint8Array(BPR)); };
    let align = 0;
    let big = false;
    let bold = false;
    let text = '';
    let pending = false;
    const flush = () => {
      if (!pending) return;
      for (const r of this.textRows(text, { align, big, bold })) rows.push(r);
      text = '';
      pending = false;
    };
    let i = 0;
    while (i < data.length) {
      const b = data[i];
      const c = data[i + 1];
      if (b === 0x1B) {
        if (c === 0x40) { flush(); align = 0; big = false; bold = false; i += 2; continue; }
        if (c === 0x61) { align = Math.min(2, data[i + 2] % 48); i += 3; continue; }
        if (c === 0x45) { bold = Boolean(data[i + 2] & 1); i += 3; continue; }
        if (c === 0x64) { flush(); blank(data[i + 2] * 30); i += 3; continue; }
        i += 3;
        continue;
      }
      if (b === 0x1D) {
        if (c === 0x21) { big = data[i + 2] !== 0; i += 3; continue; }
        if (c === 0x56) { i += (data[i + 2] === 0x41 || data[i + 2] === 0x42) ? 4 : 3; continue; }
        if (c === 0x76 && data[i + 2] === 0x30) {
          flush();
          const bpr = data[i + 4] + data[i + 5] * 256;
          const h = data[i + 6] + data[i + 7] * 256;
          const keep = Math.min(bpr, BPR);
          const off = Math.floor((BPR - keep) * align / 2);
          let p = i + 8;
          for (let y = 0; y < h; y++) {
            const row = new Uint8Array(BPR);
            row.set(data.subarray(p, p + keep), off);
            rows.push(row);
            p += bpr;
          }
          i = p;
          continue;
        }
        i += 3;
        continue;
      }
      if (b === 0x0A) {
        pending = true;
        flush();
      } else if (b >= 0x20 && b < 0x7f) {
        text += String.fromCharCode(b);
        pending = true;
      }
      i++;
    }
    flush();
    return rows;
  }

  // One line of receipt text (12 x 30 dots per letter, double size when big), word-wrapped
  textRows(text, { align = 0, big = false, bold = false } = {}) {
    const W = 384;
    const s = big ? 2 : 1;
    const cw = 12 * s;
    const lh = 30 * s;
    const cols = Math.floor(W / cw);
    const lines = [];
    let line = '';
    for (const word of text.split(/(\s+)/)) {
      if (!word) continue;
      if ((line + word).length <= cols) { line += word; continue; }
      if (line.trim()) lines.push(line.replace(/\s+$/, ''));
      line = word.trim() ? word : '';
      while (line.length > cols) { lines.push(line.slice(0, cols)); line = line.slice(cols); }
    }
    lines.push(line.replace(/\s+$/, ''));
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = lh * lines.length;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = `${bold ? 'bold' : '600'} ${20 * s}px "Roboto Mono", "DejaVu Sans Mono", Consolas, Menlo, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((ln, row) => {
      const width = ln.length * cw;
      const x0 = align === 1 ? Math.floor((W - width) / 2) : align === 2 ? W - width : 0;
      for (let k = 0; k < ln.length; k++) ctx.fillText(ln[k], x0 + k * cw + cw / 2, row * lh + lh / 2 + s);
    });
    const d = ctx.getImageData(0, 0, W, canvas.height).data;
    const out = [];
    for (let y = 0; y < canvas.height; y++) {
      const r = new Uint8Array(W / 8);
      for (let x = 0; x < W; x++) {
        if (d[(y * W + x) * 4] < 150) r[x >> 3] |= 0x80 >> (x & 7);
      }
      out.push(r);
    }
    return out;
  }

  async catJob(rows, onProgress) {
    if (!this.catTx) throw new Error('Printer is not connected.');
    // Drop blank paper at the very top; the feed at the end stays so the slip can be torn off
    let top = 0;
    while (top < rows.length - 1 && rows[top].every(x => x === 0)) top++;
    rows = rows.slice(top);
    return this.mode === 'mxw' ? this.mxwJob(rows, onProgress) : this.classicJob(rows, onProgress);
  }

  // GB01-GB03, MX05-MX11, YT01 and friends
  async classicJob(rows, onProgress) {
    const P = (cmd, payload) => catPacket(CAT_CLASSIC, cmd, payload);
    const bytes = [];
    const add = (pkt) => { for (const b of pkt) bytes.push(b); };
    add(P(0xa3, [0x00]));                                       // device state
    add(P(0xa4, [0x32]));                                       // 200 dpi quality
    add(P(0xaf, [this.catEnergy & 0xff, this.catEnergy >> 8])); // heat
    add(P(0xbe, [0x01]));                                       // apply heat
    add(P(0xa6, [0xaa, 0x55, 0x17, 0x38, 0x44, 0x5f, 0x5f, 0x5f, 0x44, 0x38, 0x2c])); // start
    for (const row of rows) add(P(0xa2, Array.from(row, x => CAT_REVERSE[x])));
    add(P(0xa1, [0x30, 0x00]));                                 // feed a little
    add(P(0xa6, [0xaa, 0x55, 0x17, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17])); // end
    add(P(0xa3, [0x00]));
    const data = new Uint8Array(bytes);
    // About 100 rows a second, close to the paper speed, so the small buffer does not overflow;
    // the printer can also ask us to pause
    const CHUNK = 112;
    this.catPaused = false;
    for (let offset = 0; offset < data.length; offset += CHUNK) {
      if (onProgress && offset % (CHUNK * 16) === 0) onProgress(offset / data.length);
      let waited = 0;
      while (this.catPaused && waited < 15000) { await new Promise(r => setTimeout(r, 40)); waited += 40; }
      await this.catWrite(this.catTx, data.subarray(offset, offset + CHUNK));
      await new Promise(r => setTimeout(r, 18));
    }
    if (onProgress) onProgress(1);
    return true;
  }

  // MXW01: ask first, send the picture on its own channel, then wait for "done"
  async mxwJob(rows, onProgress) {
    const P = (cmd, payload) => catPacket(CAT_MXW, cmd, payload);
    if (!this.catData) throw new Error('Printer is not connected.');
    await this.catWrite(this.catTx, P(0xa2, [this.mxwIntensity]));
    const status = await this.catAsk(P(0xa1, [0x00]), CAT_MXW, 0xa1, 2000);
    if (status && status.payload.length > 13 && status.payload[12] !== 0) {
      const code = status.payload[13];
      this.lastError = code === 1 || code === 9 ? 'paper' : code === 4 ? 'hot' : code === 8 ? 'battery' : 'refused';
      return false;
    }
    while (rows.length < 90) rows.push(new Uint8Array(48));
    const lines = rows.length;
    const ok = await this.catAsk(P(0xa9, [lines & 0xff, lines >> 8, 0x30, 0x00]), CAT_MXW, 0xa9, 3000);
    if (ok && ok.payload.length && ok.payload[0] !== 0) {
      this.lastError = 'refused';
      return false;
    }
    const data = new Uint8Array(lines * 48);
    rows.forEach((row, y) => { for (let x = 0; x < 48; x++) data[y * 48 + x] = CAT_REVERSE[row[x]]; });
    const CHUNK = 144;
    for (let offset = 0; offset < data.length; offset += CHUNK) {
      if (onProgress && offset % (CHUNK * 16) === 0) onProgress(offset / data.length * 0.9);
      await this.catWrite(this.catData, data.subarray(offset, offset + CHUNK));
      await new Promise(r => setTimeout(r, 12));
    }
    const done = this.catWait(CAT_MXW, 0xaa, 20000 + lines * 15);
    await this.catWrite(this.catTx, P(0xad, [0x00]));
    await done;
    if (onProgress) onProgress(1);
    return true;
  }

  // Convert canvas/image to a 1-bit raster for POS58.
  // 'fs' (Floyd-Steinberg) suits photos; 'bayer' (ordered) turns flat drawing colours into clean,
  // even dot patterns instead of grainy noise. gamma > 1 darkens mid-tones so light colours still print.
  ditherImageTo1Bit(imageData, width, height, gamma = 1, method = 'fs') {
    if (method === 'bayer') return this.orderedDither(imageData, width, height, gamma);
    if (method === 'bold') return this.boldThreshold(imageData, width, height);
    if (method === 'sheet') return this.sheetDither(imageData, width, height, gamma);
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

  // Worksheets and stickers: grey text and lines print crisp (threshold); coloured emoji
  // pictures get a bold outline with light dot shading inside, like a colouring book
  sheetDither(imageData, width, height, gamma) {
    const d = imageData.data;
    const total = width * height;
    const lum = new Float32Array(total);
    const colour = new Uint8Array(total);
    for (let i = 0; i < total; i++) {
      const p = i * 4;
      lum[i] = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
      colour[i] = Math.max(d[p], d[p + 1], d[p + 2]) - Math.min(d[p], d[p + 1], d[p + 2]) >= 36 ? 1 : 0;
    }
    const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const isPaper = (x, y) => x < 0 || y < 0 || x >= width || y >= height || lum[y * width + x] >= 238;
    const bitmap = new Uint8Array(total);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (!colour[i]) {
          bitmap[i] = lum[i] < 150 ? 1 : 0;
          continue;
        }
        if (isPaper(x - 2, y) || isPaper(x + 2, y) || isPaper(x, y - 2) || isPaper(x, y + 2)
          || isPaper(x - 1, y - 1) || isPaper(x + 1, y + 1) || isPaper(x + 1, y - 1) || isPaper(x - 1, y + 1)) {
          bitmap[i] = 1;
          continue;
        }
        const g = 255 * Math.pow(lum[i] / 255, gamma);
        bitmap[i] = g < (BAYER4[(y % 4) * 4 + (x % 4)] + 0.5) * 16 ? 1 : 0;
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
    appendText('LITTLE GENIUS LAND\n');
    append([0x1D, 0x21, 0x00]); // Normal size
    appendText('60-SECOND CHALLENGE\n');
    appendText('Learn - Play - Create - Print\n');
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
    appendText('LITTLE GENIUS LAND\n');
    appendText('KEEPSAKE\n');
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
    appendText('Little Genius Land\n');
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
    return this.send(() => this.buildDrawingCommands(params), onProgress);
  }

  // Print a ready-made 384-dot-wide picture (Word Quest worksheets, stickers, learner cards)
  buildImageCommands(source, { gamma = 1.15, method = 'sheet' } = {}) {
    const commands = [];
    const append = (bytes) => { for (const b of bytes) commands.push(b); };
    append([0x1B, 0x40]);
    const height = Math.round(384 * (source.height / source.width));
    this.appendRaster(append, this.renderThermal(source, { maxHeight: height, gamma, method }));
    append([0x1B, 0x64, 0x04]);
    append([0x1D, 0x56, 0x42, 0x00]);
    return new Uint8Array(commands);
  }

  async printImage(source, options, onProgress) {
    if (window.soundEngine) window.soundEngine.playPrintSound();
    return this.send(() => this.buildImageCommands(source, options), onProgress);
  }

  failMessage() {
    if (this.lastError === 'busy') return 'Still printing the last one. Wait for it to finish, then print again.';
    if (this.lastError === 'lost') return 'The printer stopped answering. Switch it off and on, then tap print again.';
    if (this.lastError === 'not-connected') return 'The printer is not connected. Switch it on and tap print again.';
    if (this.lastError === 'paper') return 'The printer is out of paper. Put in a new roll and tap print again.';
    if (this.lastError === 'hot') return 'The printer is too hot. Wait a minute, then tap print again.';
    if (this.lastError === 'battery') return 'The printer battery is low. Charge it, then tap print again.';
    if (this.lastError === 'refused') return 'The printer said it is not ready. Switch it off and on, then tap print again.';
    return 'Printing failed. Check the printer is on and has paper.';
  }

  // One print job at a time: a second job sent while the first is still going mixes their
  // bytes together, which garbles the picture and can lock up the printer until it is restarted.
  // lastError tells the screen what went wrong: 'busy', 'not-connected' or 'lost'.
  async send(build, onProgress) {
    this.lastError = '';
    if (this.busy) {
      this.lastError = 'busy';
      return false;
    }
    this.busy = true;
    try {
      if (!(await this.ensureConnected())) {
        this.lastError = 'not-connected';
        return false;
      }
      if (this.mode === 'escpos') {
        await this.sendDataInChunks(build(), onProgress);
        return true;
      }
      return await this.catJob(this.escPosToRows(build()), onProgress);
    } catch (err) {
      console.error('Print failed:', err);
      this.lastError = 'lost';
      // Start fresh next time: drop the half-dead link so the next print reconnects cleanly
      this.characteristic = null;
      try { if (this.device && this.device.gatt.connected) this.device.gatt.disconnect(); } catch (e) { /* ignore */ }
      this.setStatus('Disconnected', false);
      return false;
    } finally {
      this.busy = false;
    }
  }

  // Send chunks to the Bluetooth characteristic with flow control. Each write has a time limit,
  // so a link that died silently gives an error instead of waiting forever.
  async sendDataInChunks(data, onProgress) {
    if (!this.characteristic) throw new Error('Printer is not connected.');
    const CHUNK_SIZE = 64; // Safe size for BLE MTU
    const ch = this.characteristic;
    for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
      if (onProgress && offset % (CHUNK_SIZE * 16) === 0) onProgress(offset / data.length);
      const chunk = data.slice(offset, offset + CHUNK_SIZE);
      const write = ch.properties.writeWithoutResponse ? ch.writeValueWithoutResponse(chunk) : ch.writeValue(chunk);
      await this.withTimeout(write, 5000, 'Printer stopped responding');
      // Brief pause between packets to prevent BLE buffer overflow
      await new Promise(r => setTimeout(r, 20));
    }
    if (onProgress) onProgress(1);
  }

  // Main print routine (keepsake receipt); false lets the caller fall back to a normal printer
  async printReceipt(params) {
    if (window.soundEngine) window.soundEngine.playPrintSound();
    if (!this.device) return false;
    return this.send(() => this.buildEscPosCommands(params));
  }
}

window.printerController = new ThermalPrinterController();
