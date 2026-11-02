// Sticker Maker: design and print your own stickers on a 58 mm thermal (sticker) roll.
//   • Templates: notebook labels, name tags, book plates, bottle labels, bag tags, reward badges…
//   • Fill in: type your name, class, roll no. once; print one sticker or a whole class list
//   • Add: text, emoji clip art, shapes, QR codes, photos (camera / gallery / Doodle Studio)
//     and free pictures found online (Iconify icons and Wikimedia Commons clip art)
//   • Size: vertical or horizontal, any length, 1–3 stickers across, copies and cut lines
// Everything is drawn in millimetres and printed at 8 dots per mm.

const SM_HISTORY = 40;
const SM_STORE = 'sm_designs';
const SM_CURRENT = 'sm_current';
const SM_MAX_SAVED = 24;

const smClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const smEsc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const smId = () => `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

class StickerMaker {
  constructor(app) {
    this.app = app;
    this.canvas = document.getElementById('sm-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.stage = document.getElementById('sm-stage');
    this.panel = document.getElementById('sm-panel');
    this.assets = {};         // id -> { src, credit, img }
    this.imgCache = new Map();
    this.selected = -1;
    this.tab = 'templates';
    this.clipCat = 0;
    this.history = [];
    this.future = [];
    this.printLook = false;
    this.search = { q: '', source: 'icons', results: [], status: '' };
    this.drag = null;
    this.guides = null;
    this.load();
    this.bind();
  }

  $(id) {
    return document.getElementById(id);
  }

  // ---------------------------------------------------------------------------
  // Design model
  // ---------------------------------------------------------------------------
  blankDesign() {
    return {
      v: 1, name: 'My sticker', orient: 'portrait', length: 30, across: 1, copies: 1, gap: 3, cutLines: true,
      frame: 'rounded', template: 'blank', fieldKeys: [], fields: {}, batch: '', elements: []
    };
  }

  geom(d = this.design) {
    const across = d.across || 1;
    const A = (SM_PAPER_MM - (across - 1) * SM_GAP_X) / across;
    return d.orient === 'landscape' ? { W: d.length, H: A, A } : { W: A, H: d.length, A };
  }

  load() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(SM_CURRENT)); } catch (e) { /* ignore */ }
    if (saved && saved.design) {
      this.design = { ...this.blankDesign(), ...saved.design };
      Object.entries(saved.assets || {}).forEach(([id, a]) => this.addAsset(a.src, a.credit, id));
    } else {
      this.applyTemplate('notebook', true);
    }
  }

  // Remember the current design, so nothing is lost if the tablet sleeps
  autosave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(SM_CURRENT, JSON.stringify({ design: this.design, assets: this.usedAssets() }));
      } catch (e) {
        this.app.showToast('⚠️ Storage is full: delete some saved stickers');
      }
    }, 600);
  }

  usedAssets(d = this.design) {
    const out = {};
    d.elements.forEach(el => {
      if (el.type === 'image' && this.assets[el.asset]) out[el.asset] = { src: this.assets[el.asset].src, credit: this.assets[el.asset].credit || '' };
    });
    return out;
  }

  addAsset(src, credit = '', id = smId()) {
    const img = new Image();
    img.onload = () => { this.imgCache.clear(); this.render(); };
    img.src = src;
    this.assets[id] = { src, credit, img };
    return id;
  }

  snapshot() {
    return JSON.stringify(this.design);
  }

  commit() {
    this.history.push(this.lastSnap || this.snapshot());
    if (this.history.length > SM_HISTORY) this.history.shift();
    this.future = [];
    this.lastSnap = this.snapshot();
    this.autosave();
    this.updateBar();
  }

  undo() {
    if (!this.history.length) return;
    this.future.push(this.snapshot());
    this.design = JSON.parse(this.history.pop());
    this.lastSnap = this.snapshot();
    this.selected = -1;
    this.afterChange();
  }

  redo() {
    if (!this.future.length) return;
    this.history.push(this.snapshot());
    this.design = JSON.parse(this.future.pop());
    this.lastSnap = this.snapshot();
    this.selected = -1;
    this.afterChange();
  }

  afterChange() {
    this.autosave();
    this.fit();
    this.renderPanel();
    this.updateBar();
  }

  applyTemplate(id, silent = false) {
    const t = SM_TEMPLATES.find(x => x.id === id);
    if (!t) return;
    const old = this.design;
    const d = this.blankDesign();
    Object.assign(d, t.geom, { frame: t.frame, template: t.id, fieldKeys: t.fields.slice() });
    // Keep answers typed earlier (name, class…) when switching templates
    d.fields = { ...(old ? old.fields : {}) };
    if (!d.fields.name && this.app.quest && this.app.quest.store.current) d.fields.name = this.app.quest.store.current.name;
    d.batch = old ? old.batch : '';
    const { W, H } = this.geom(d);
    d.elements = t.build(W, H);
    d.name = t.name;
    if (!silent && old) this.history.push(this.snapshot());
    this.design = d;
    this.selected = -1;
    this.lastSnap = this.snapshot();
    if (!silent) {
      this.autosave();
      this.tab = d.fieldKeys.length ? 'fill' : 'add';
      this.afterChange();
    }
  }

  // Resize the sticker and move everything proportionally
  setGeometry(changes) {
    const before = this.geom();
    Object.assign(this.design, changes);
    const after = this.geom();
    const sx = after.W / before.W;
    const sy = after.H / before.H;
    const s = Math.min(sx, sy);
    this.design.elements.forEach(el => {
      el.x *= sx;
      el.y *= sy;
      ['size', 'w', 'h'].forEach(k => { if (el[k]) el[k] = +(el[k] * s).toFixed(2); });
      if (el.width) el.width = +(el.width * sx).toFixed(2);
    });
    this.commit();
    this.fit();
    this.renderPanel();
  }

  // ---------------------------------------------------------------------------
  // Drawing (k = pixels per mm)
  // ---------------------------------------------------------------------------
  fillValues(values) {
    return (text) => String(text || '').replace(/\{(\w+)\}/g, (_, key) => {
      const v = (values[key] || '').trim();
      return v || '________';
    });
  }

  fontCss(el, k) {
    const f = SM_FONTS[el.font] || SM_FONTS.round;
    return `${el.italic ? 'italic ' : ''}${el.bold ? 800 : 500} ${el.size * k}px ${f.css}, ${SM_EMOJI_FONT}`;
  }

  wrapLines(ctx, text, maxW) {
    const out = [];
    text.split('\n').forEach(par => {
      if (!maxW) { out.push(par); return; }
      let line = '';
      par.split(/\s+/).forEach(word => {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = word; } else line = test;
      });
      out.push(line);
    });
    return out;
  }

  // Photo styles are turned into black dots at print resolution, so the screen shows what prints
  processedImage(el) {
    const asset = this.assets[el.asset];
    if (!asset || !asset.img.complete || !asset.img.naturalWidth) return null;
    const w = Math.max(1, Math.round(el.w * SM_DPM));
    const h = Math.max(1, Math.round(el.h * SM_DPM));
    const key = `${el.asset}|${w}|${h}|${el.style}|${el.bright || 0}|${el.contrast || 0}|${el.flip ? 1 : 0}`;
    if (this.imgCache.has(key)) return this.imgCache.get(key);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.save();
    if (el.flip) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(asset.img, 0, 0, w, h);
    ctx.restore();
    if (el.style !== 'color') {
      const data = ctx.getImageData(0, 0, w, h);
      const d = data.data;
      const n = w * h;
      const gray = new Float32Array(n);
      const contrast = 1 + (el.contrast || 0) / 100;
      const bright = (el.bright || 0) * 1.28;
      for (let i = 0; i < n; i++) {
        const p = i * 4;
        const a = d[p + 3] / 255;
        const g = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
        gray[i] = smClamp(((255 - a * (255 - g)) - 128) * contrast + 128 + bright, 0, 255);
      }
      const ink = new Uint8Array(n);
      if (el.style === 'bold') {
        for (let i = 0; i < n; i++) ink[i] = gray[i] < 140 ? 1 : 0;
      } else if (el.style === 'sketch') {
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            const gx = gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1] - gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1];
            const gy = gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1] - gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1];
            ink[i] = Math.hypot(gx, gy) > 150 || gray[i] < 40 ? 1 : 0;
          }
        }
      } else {
        const g2 = Float32Array.from(gray);
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            const old = g2[i];
            const v = old < 128 ? 0 : 255;
            ink[i] = v === 0 ? 1 : 0;
            const err = old - v;
            if (x + 1 < w) g2[i + 1] += err * 7 / 16;
            if (y + 1 < h) {
              if (x > 0) g2[i + w - 1] += err * 3 / 16;
              g2[i + w] += err * 5 / 16;
              if (x + 1 < w) g2[i + w + 1] += err / 16;
            }
          }
        }
      }
      for (let i = 0; i < n; i++) {
        const p = i * 4;
        d[p] = d[p + 1] = d[p + 2] = 0;
        d[p + 3] = ink[i] ? 255 : 0; // white parts are see-through, so layers stack nicely
      }
      ctx.putImageData(data, 0, 0);
    }
    if (this.imgCache.size > 40) this.imgCache.delete(this.imgCache.keys().next().value);
    this.imgCache.set(key, c);
    return c;
  }

  drawFrame(ctx, W, H, k, style) {
    const m = 1.2 * k;
    const lw = 0.5 * k;
    ctx.save();
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';
    ctx.lineWidth = lw;
    const rr = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };
    const w = W * k;
    const h = H * k;
    switch (style) {
      case 'line': rr(m, m, w - 2 * m, h - 2 * m, 0.5 * k); ctx.stroke(); break;
      case 'thick': ctx.lineWidth = 1.1 * k; rr(m, m, w - 2 * m, h - 2 * m, 1 * k); ctx.stroke(); break;
      case 'double':
        rr(m, m, w - 2 * m, h - 2 * m, 1.5 * k); ctx.stroke();
        ctx.lineWidth = 0.3 * k; rr(m + 1.1 * k, m + 1.1 * k, w - 2 * m - 2.2 * k, h - 2 * m - 2.2 * k, 1 * k); ctx.stroke();
        break;
      case 'rounded': ctx.lineWidth = 0.7 * k; rr(m, m, w - 2 * m, h - 2 * m, Math.min(w, h) * 0.12); ctx.stroke(); break;
      case 'dashed': ctx.setLineDash([2 * k, 1.2 * k]); rr(m, m, w - 2 * m, h - 2 * m, 1 * k); ctx.stroke(); break;
      case 'dots': {
        const step = 1.6 * k;
        const r = 0.35 * k;
        const dot = (x, y) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
        for (let x = m; x <= w - m + 0.1; x += step) { dot(x, m); dot(x, h - m); }
        for (let y = m; y <= h - m + 0.1; y += step) { dot(m, y); dot(w - m, y); }
        break;
      }
      case 'scallop': {
        const r = 1.6 * k;
        ctx.lineWidth = 0.45 * k;
        ctx.beginPath();
        const nx = Math.max(2, Math.round((w - 2 * m) / (2 * r)));
        const ny = Math.max(2, Math.round((h - 2 * m) / (2 * r)));
        const sx = (w - 2 * m) / nx;
        const sy = (h - 2 * m) / ny;
        for (let i = 0; i < nx; i++) {
          ctx.moveTo(m + i * sx, m); ctx.arc(m + i * sx + sx / 2, m, sx / 2, Math.PI, 0);
          ctx.moveTo(m + i * sx, h - m); ctx.arc(m + i * sx + sx / 2, h - m, sx / 2, Math.PI, 0, true);
        }
        for (let i = 0; i < ny; i++) {
          ctx.moveTo(m, m + i * sy); ctx.arc(m, m + i * sy + sy / 2, sy / 2, -Math.PI / 2, Math.PI / 2, true);
          ctx.moveTo(w - m, m + i * sy); ctx.arc(w - m, m + i * sy + sy / 2, sy / 2, -Math.PI / 2, Math.PI / 2);
        }
        ctx.stroke();
        rr(m + 2.2 * k, m + 2.2 * k, w - 2 * m - 4.4 * k, h - 2 * m - 4.4 * k, 0.8 * k);
        ctx.lineWidth = 0.25 * k;
        ctx.stroke();
        break;
      }
      case 'ticket': {
        const r = Math.min(h, w) * 0.1;
        ctx.lineWidth = 0.6 * k;
        ctx.beginPath();
        ctx.moveTo(m + r, m);
        ctx.lineTo(w - m - r, m);
        ctx.arc(w - m, m, r, Math.PI, Math.PI / 2, true);
        ctx.lineTo(w - m, h / 2 - r);
        ctx.arc(w - m, h / 2, r, -Math.PI / 2, Math.PI / 2, true);
        ctx.lineTo(w - m, h - m - r);
        ctx.arc(w - m, h - m, r, -Math.PI / 2, Math.PI, true);
        ctx.lineTo(m + r, h - m);
        ctx.arc(m, h - m, r, 0, -Math.PI / 2, true);
        ctx.lineTo(m, h / 2 + r);
        ctx.arc(m, h / 2, r, Math.PI / 2, -Math.PI / 2, true);
        ctx.lineTo(m, m + r);
        ctx.arc(m, m, r, Math.PI / 2, 0, true);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 'circle':
        ctx.lineWidth = 0.8 * k;
        ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2 - m, h / 2 - m, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 0.3 * k; ctx.setLineDash([0.8 * k, 0.8 * k]);
        ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2 - m - 1.4 * k, h / 2 - m - 1.4 * k, 0, 0, Math.PI * 2); ctx.stroke();
        break;
      case 'stars': case 'flowers': case 'hearts': {
        const ch = { stars: '⭐', flowers: '🌸', hearts: '❤️' }[style];
        rr(m + 1.6 * k, m + 1.6 * k, w - 2 * m - 3.2 * k, h - 2 * m - 3.2 * k, 1.2 * k);
        ctx.lineWidth = 0.35 * k;
        ctx.stroke();
        const s = Math.min(5.5, Math.min(W, H) * 0.2) * k;
        ctx.font = `${s}px ${SM_EMOJI_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const pts = [[m + s * 0.45, m + s * 0.45], [w - m - s * 0.45, m + s * 0.45], [m + s * 0.45, h - m - s * 0.45], [w - m - s * 0.45, h - m - s * 0.45]];
        if (W > 40) pts.push([w / 2, m + s * 0.3], [w / 2, h - m - s * 0.3]);
        pts.forEach(([x, y]) => {
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(x, y, s * 0.55, 0, Math.PI * 2); ctx.fill();
          ctx.fillText(ch, x, y);
        });
        break;
      }
      default: break;
    }
    ctx.restore();
  }

  drawElement(ctx, el, k, fill) {
    ctx.save();
    ctx.translate(el.x * k, el.y * k);
    ctx.rotate((el.rot || 0) * Math.PI / 180);
    let bw = 0;
    let bh = 0;
    if (el.type === 'text') {
      ctx.font = this.fontCss(el, k);
      const lines = this.wrapLines(ctx, fill(el.text), el.width ? el.width * k : 0);
      const lh = el.size * 1.22 * k;
      const textW = Math.max(1, ...lines.map(l => ctx.measureText(l).width));
      bw = el.width ? el.width * k : textW;
      bh = lines.length * lh;
      const pad = el.invert ? 0.9 * k : 0;
      if (el.invert) {
        ctx.fillStyle = '#000';
        const r = Math.min(bh / 2 + pad, 1.2 * k);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-bw / 2 - pad * 1.6, -bh / 2 - pad, bw + pad * 3.2, bh + pad * 2, r);
        else ctx.rect(-bw / 2 - pad * 1.6, -bh / 2 - pad, bw + pad * 3.2, bh + pad * 2);
        ctx.fill();
        bw += pad * 3.2;
        bh += pad * 2;
      }
      ctx.fillStyle = el.invert ? '#fff' : '#000';
      ctx.textBaseline = 'middle';
      ctx.textAlign = el.align;
      const ax = el.align === 'left' ? -(el.width ? el.width * k : textW) / 2 : el.align === 'right' ? (el.width ? el.width * k : textW) / 2 : 0;
      lines.forEach((ln, i) => ctx.fillText(ln, ax, (i - (lines.length - 1) / 2) * lh));
    } else if (el.type === 'emoji') {
      const s = el.size * k;
      ctx.font = `${s}px ${SM_EMOJI_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(el.char, 0, s * 0.06);
      bw = bh = s;
    } else if (el.type === 'image') {
      bw = el.w * k;
      bh = el.h * k;
      const c = this.processedImage(el);
      if (c) {
        ctx.imageSmoothingEnabled = el.style === 'color';
        ctx.drawImage(c, -bw / 2, -bh / 2, bw, bh);
      } else {
        ctx.strokeStyle = '#999';
        ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
      }
    } else if (el.type === 'shape') {
      bw = el.w * k;
      bh = (el.kind === 'line' ? Math.max(el.stroke, 0.3) : el.h) * k;
      ctx.lineWidth = (el.stroke || 0.6) * k;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#000';
      ctx.beginPath();
      const w = el.w * k;
      const h = el.h * k;
      if (el.kind === 'rect') ctx.rect(-w / 2, -h / 2, w, h);
      else if (el.kind === 'round') { if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.25); else ctx.rect(-w / 2, -h / 2, w, h); }
      else if (el.kind === 'circle') ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      else if (el.kind === 'line') { ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); }
      else if (el.kind === 'star') {
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? 0.45 : 1;
          const a = -Math.PI / 2 + i * Math.PI / 5;
          ctx.lineTo(Math.cos(a) * r * w / 2, Math.sin(a) * r * h / 2);
        }
        ctx.closePath();
      } else if (el.kind === 'heart') {
        ctx.moveTo(0, h * 0.35);
        ctx.bezierCurveTo(-w * 0.55, -h * 0.05, -w * 0.3, -h * 0.6, 0, -h * 0.25);
        ctx.bezierCurveTo(w * 0.3, -h * 0.6, w * 0.55, -h * 0.05, 0, h * 0.35);
        ctx.closePath();
      }
      if (el.fill && el.kind !== 'line') ctx.fill();
      else ctx.stroke();
    } else if (el.type === 'qr') {
      const s = el.size * k;
      bw = bh = s;
      const text = fill(el.text).replace(/_{3,}/g, '');
      if (text.replace(/^tel:/, '').trim()) {
        const m = qrMatrix(text);
        const cell = s / (m.length + 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.fillStyle = '#000';
        m.forEach((row, y) => row.forEach((on, x) => {
          if (on) ctx.fillRect(-s / 2 + (x + 1) * cell, -s / 2 + (y + 1) * cell, Math.ceil(cell), Math.ceil(cell));
        }));
      } else {
        ctx.strokeStyle = '#000';
        ctx.setLineDash([0.8 * k, 0.8 * k]);
        ctx.lineWidth = 0.3 * k;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        ctx.font = `700 ${s * 0.22}px ${SM_FONTS.round.css}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('QR', 0, 0);
      }
    }
    ctx.restore();
    el._box = { w: bw / k, h: bh / k };
  }

  // Draw one sticker (W × H mm) at k pixels per mm
  drawSticker(ctx, k, values, design = this.design) {
    const { W, H } = this.geom(design);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W * k, H * k);
    this.drawFrame(ctx, W, H, k, design.frame);
    const fill = this.fillValues(values);
    design.elements.forEach(el => this.drawElement(ctx, el, k, fill));
  }

  stickerCanvas(values, k = SM_DPM, design = this.design) {
    const { W, H } = this.geom(design);
    const c = document.createElement('canvas');
    c.width = Math.round(W * k);
    c.height = Math.round(H * k);
    this.drawSticker(c.getContext('2d'), k, values, design);
    return c;
  }

  // ---------------------------------------------------------------------------
  // Stage: fit, render, handles
  // ---------------------------------------------------------------------------
  fit() {
    const { W, H } = this.geom();
    const box = this.stage.getBoundingClientRect();
    if (!box.width) return;
    // Leave room for the paper border and the size label; the stage itself never depends on the canvas size
    const scale = Math.max(2, Math.min((box.width - 60) / W, (box.height - 100) / H)); // css px per mm
    this.cssK = scale;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = `${W * scale}px`;
    this.canvas.style.height = `${H * scale}px`;
    this.canvas.width = Math.round(W * scale * dpr);
    this.canvas.height = Math.round(H * scale * dpr);
    this.k = scale * dpr;
    this.$('sm-size-label').textContent = `${+W.toFixed(1)} × ${+H.toFixed(1)} mm${this.design.across > 1 ? ` · ${this.design.across} across` : ''} · ${this.design.orient === 'landscape' ? 'horizontal' : 'vertical'}`;
    this.render();
  }

  render() {
    if (!this.k || !this.isOpen()) return;
    const ctx = this.ctx;
    const k = this.k;
    const { W, H } = this.geom();
    if (this.printLook) {
      const thermal = window.printerController.renderThermal(this.stickerCanvas(this.design.fields), { maxHeight: 4000, gamma: 1.15, method: 'sheet' }).canvas;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(thermal, 0, 0, W * k, H * k);
      return;
    }
    this.drawSticker(ctx, k, this.design.fields);
    if (this.guides) {
      ctx.save();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 5]);
      if (this.guides.v) { ctx.beginPath(); ctx.moveTo(W / 2 * k, 0); ctx.lineTo(W / 2 * k, H * k); ctx.stroke(); }
      if (this.guides.h) { ctx.beginPath(); ctx.moveTo(0, H / 2 * k); ctx.lineTo(W * k, H / 2 * k); ctx.stroke(); }
      ctx.restore();
    }
    const el = this.design.elements[this.selected];
    if (el && el._box) {
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.translate(el.x * k, el.y * k);
      ctx.rotate((el.rot || 0) * Math.PI / 180);
      const w = el._box.w * k + 8 * dpr;
      const h = el._box.h * k + 8 * dpr;
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2 * dpr;
      ctx.setLineDash([6 * dpr, 4 * dpr]);
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.setLineDash([]);
      // rotate handle (top) and resize handle (bottom-right)
      ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, -h / 2 - 18 * dpr); ctx.stroke();
      [[0, -h / 2 - 24 * dpr, '⟳'], [w / 2, h / 2, '⤡']].forEach(([x, y, ch]) => {
        ctx.fillStyle = '#2563eb';
        ctx.beginPath(); ctx.arc(x, y, 12 * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `700 ${14 * dpr}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ch, x, y + dpr);
      });
      ctx.restore();
    }
  }

  isOpen() {
    return document.body.dataset.screen === 'stickers';
  }

  toMm(e) {
    const r = this.canvas.getBoundingClientRect();
    const { W, H } = this.geom();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }

  // Point in the element's own (unrotated) coordinates
  local(el, p) {
    const a = -(el.rot || 0) * Math.PI / 180;
    const dx = p.x - el.x;
    const dy = p.y - el.y;
    return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) };
  }

  hitHandle(el, p) {
    if (!el || !el._box) return null;
    const pad = 4 / this.cssK;
    const w = el._box.w + 2 * pad;
    const h = el._box.h + 2 * pad;
    const q = this.local(el, p);
    const r = 16 / this.cssK;
    if (Math.hypot(q.x, q.y - (-h / 2 - 24 / this.cssK)) < r) return 'rotate';
    if (Math.hypot(q.x - w / 2, q.y - h / 2) < r) return 'resize';
    return null;
  }

  hitElement(p) {
    for (let i = this.design.elements.length - 1; i >= 0; i--) {
      const el = this.design.elements[i];
      if (!el._box) continue;
      const q = this.local(el, p);
      const slack = 2;
      if (Math.abs(q.x) <= el._box.w / 2 + slack && Math.abs(q.y) <= el._box.h / 2 + slack) return i;
    }
    return -1;
  }

  scaleElement(el, f) {
    if (el.type === 'text') { el.size = smClamp(el.size * f, 1.5, 40); if (el.width) el.width = smClamp(el.width * f, 5, 300); }
    else if (el.type === 'emoji' || el.type === 'qr') el.size = smClamp(el.size * f, 3, 200);
    else { el.w = smClamp(el.w * f, 2, 300); el.h = smClamp(el.h * f, 2, 300); }
  }

  onDown(e) {
    if (this.printLook) { this.togglePrintLook(); return; }
    if (this.drag) return;
    const p = this.toMm(e);
    const sel = this.design.elements[this.selected];
    const handle = this.hitHandle(sel, p);
    try { this.canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
    if (handle && sel) {
      const json = JSON.stringify(sel);
      this.drag = { mode: handle, id: e.pointerId, start: p, orig: JSON.parse(json), d0: Math.hypot(p.x - sel.x, p.y - sel.y), a0: Math.atan2(p.y - sel.y, p.x - sel.x) };
      return;
    }
    const i = this.hitElement(p);
    if (i !== this.selected) {
      this.selected = i;
      if (i >= 0) this.tab = 'edit';
      this.renderPanel();
    }
    if (i >= 0) {
      const el = this.design.elements[i];
      this.drag = { mode: 'move', id: e.pointerId, dx: el.x - p.x, dy: el.y - p.y, moved: false };
    }
    this.render();
  }

  onMove(e) {
    const dg = this.drag;
    if (!dg || dg.id !== e.pointerId) return;
    const el = this.design.elements[this.selected];
    if (!el) return;
    const p = this.toMm(e);
    const { W, H } = this.geom();
    if (dg.mode === 'move') {
      let x = p.x + dg.dx;
      let y = p.y + dg.dy;
      const snap = 1.2;
      this.guides = { v: Math.abs(x - W / 2) < snap, h: Math.abs(y - H / 2) < snap };
      if (this.guides.v) x = W / 2;
      if (this.guides.h) y = H / 2;
      el.x = smClamp(x, 0, W);
      el.y = smClamp(y, 0, H);
      dg.moved = true;
    } else if (dg.mode === 'resize') {
      Object.assign(el, dg.orig);
      this.scaleElement(el, Math.max(0.1, Math.hypot(p.x - el.x, p.y - el.y) / Math.max(0.5, dg.d0)));
      dg.moved = true;
    } else if (dg.mode === 'rotate') {
      let rot = dg.orig.rot + (Math.atan2(p.y - el.y, p.x - el.x) - dg.a0) * 180 / Math.PI;
      rot = ((rot + 540) % 360) - 180;
      const snapTo = Math.round(rot / 90) * 90;
      if (Math.abs(rot - snapTo) < 6) rot = snapTo;
      el.rot = Math.round(rot);
      dg.moved = true;
    }
    if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = null; this.render(); });
  }

  onUp(e) {
    const dg = this.drag;
    if (!dg || dg.id !== e.pointerId) return;
    this.drag = null;
    this.guides = null;
    if (dg.moved) {
      this.commit();
      this.renderPanel();
    }
    this.render();
  }

  // ---------------------------------------------------------------------------
  // Adding things
  // ---------------------------------------------------------------------------
  addElement(el) {
    const { W, H } = this.geom();
    this.design.elements.push({ x: W / 2, y: H / 2, rot: 0, ...el });
    this.selected = this.design.elements.length - 1;
    this.tab = 'edit';
    this.commit();
    this.render();
    this.renderPanel();
  }

  addText() {
    const { W, H } = this.geom();
    this.addElement(smText('Your text', W / 2, H / 2, { size: Math.min(6, H * 0.25), bold: true }));
    setTimeout(() => { const t = this.$('sm-text'); if (t) { t.focus(); t.select(); } }, 50);
  }

  addEmoji(char) {
    const { W, H } = this.geom();
    this.addElement({ type: 'emoji', char, size: Math.min(12, Math.min(W, H) * 0.5) });
  }

  addShape(kind) {
    const { W, H } = this.geom();
    const s = Math.min(W, H) * 0.5;
    this.addElement({ type: 'shape', kind, w: kind === 'line' ? W * 0.7 : s, h: kind === 'line' ? 0 : (kind === 'rect' || kind === 'round' ? s * 0.6 : s), fill: false, stroke: 0.6 });
  }

  addQr() {
    const { W, H } = this.geom();
    this.addElement({ type: 'qr', text: 'https://', size: Math.min(20, Math.min(W, H) * 0.7) });
    setTimeout(() => { const t = this.$('sm-qr'); if (t) t.focus(); }, 50);
  }

  // Shrink big photos before keeping them (saved designs live in the browser's storage)
  addImageFromUrl(url, { credit = '', style = 'photo', revoke = false } = {}) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const max = 700;
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.naturalWidth * s));
      c.height = Math.max(1, Math.round(img.naturalHeight * s));
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      let opaque = true;
      try {
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < d.length; i += 16) if (d[i] < 250) { opaque = false; break; }
      } catch (e) {
        this.app.showToast('That picture can\'t be used, try another one');
        return;
      }
      const src = opaque ? c.toDataURL('image/jpeg', 0.85) : c.toDataURL('image/png');
      if (revoke) URL.revokeObjectURL(url);
      const id = this.addAsset(src, credit);
      const { W, H } = this.geom();
      const fitW = W * 0.7;
      const fitH = H * 0.7;
      const r = Math.min(fitW / c.width, fitH / c.height);
      this.addElement({ type: 'image', asset: id, w: +(c.width * r).toFixed(1), h: +(c.height * r).toFixed(1), style, bright: 0, contrast: 0, flip: false });
      this.app.showToast('🖼️ Picture added');
    };
    img.onerror = () => this.app.showToast('Could not load that picture');
    img.src = url;
  }

  importFile(file) {
    if (!file || !/^image\//.test(file.type)) return;
    this.addImageFromUrl(URL.createObjectURL(file), { style: 'photo', revoke: true });
  }

  importDoodle() {
    const studio = this.app.studio;
    if (!studio || (!studio.dirty && studio.pageId === 'blank')) {
      this.app.showToast('🎨 Draw something in Doodle Studio first');
      return;
    }
    this.addImageFromUrl(studio.composite().toDataURL('image/png'), { style: 'color', credit: 'My drawing' });
  }

  // ---------------------------------------------------------------------------
  // Online pictures: Iconify icons and Wikimedia Commons clip art (both allow browser use)
  // ---------------------------------------------------------------------------
  async runSearch() {
    const q = (this.$('sm-search') ? this.$('sm-search').value : this.search.q).trim();
    this.search.q = q;
    if (!q) return;
    if (SM_BLOCKED.test(q)) {
      this.search.results = [];
      this.search.status = 'Let\'s search for something else 🙂';
      this.renderPanel();
      return;
    }
    if (!navigator.onLine) {
      this.search.status = '📴 You are offline. Use the clip art above or your own photos.';
      this.renderPanel();
      return;
    }
    this.search.status = 'Searching…';
    this.search.results = [];
    this.renderPanel();
    try {
      this.search.results = this.search.source === 'icons' ? await this.searchIcons(q) : await this.searchCommons(q);
      this.search.status = this.search.results.length ? '' : 'Nothing found. Try a simpler word like "cat" or "flower".';
    } catch (e) {
      this.search.status = 'Could not reach the picture library. Check the internet and try again.';
    }
    this.renderPanel();
  }

  async searchIcons(q) {
    const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(q)}&limit=200`);
    const data = await res.json();
    const prefer = ['fluent-emoji-flat', 'noto', 'twemoji', 'openmoji', 'streamline-emojis', 'fxemoji', 'emojione', 'mdi', 'ph', 'tabler', 'game-icons', 'lucide', 'icon-park-outline', 'mingcute', 'healthicons', 'material-symbols'];
    const rank = (id) => { const i = prefer.indexOf(id.split(':')[0]); return i === -1 ? 99 : i; };
    return (data.icons || []).sort((a, b) => rank(a) - rank(b)).slice(0, 60).map(id => {
      const [prefix, name] = id.split(':');
      return { thumb: `https://api.iconify.design/${prefix}/${name}.svg?height=64`, title: name.replace(/-/g, ' '), icon: id, credit: `Icon: ${prefix} (Iconify)` };
    });
  }

  async searchCommons(q) {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search'
      + `&gsrsearch=${encodeURIComponent(`filemime:image/svg+xml ${q} clipart`)}&gsrnamespace=6&gsrlimit=40`
      + '&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=300&iiextmetadatafilter=LicenseShortName%7CArtist';
    const res = await fetch(url);
    const data = await res.json();
    const pages = Object.values((data.query && data.query.pages) || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
    return pages.filter(p => p.imageinfo && !SM_BLOCKED.test(p.title)).map(p => {
      const ii = p.imageinfo[0];
      const meta = ii.extmetadata || {};
      const artist = ((meta.Artist && meta.Artist.value) || '').replace(/<[^>]*>/g, '').trim().slice(0, 40);
      const license = (meta.LicenseShortName && meta.LicenseShortName.value) || '';
      return {
        thumb: ii.thumburl, big: ii.thumburl.replace(/\/300px-/, '/700px-'),
        title: p.title.replace(/^File:/, '').replace(/\.svg$/i, ''),
        credit: [artist, license, 'Wikimedia Commons'].filter(Boolean).join(' · ')
      };
    });
  }

  async pickResult(i) {
    const r = this.search.results[i];
    if (!r) return;
    this.app.showToast('⏬ Adding picture…');
    try {
      if (r.icon) {
        const [prefix, name] = r.icon.split(':');
        let svg = await (await fetch(`https://api.iconify.design/${prefix}/${name}.svg?height=512`)).text();
        const mono = svg.includes('currentColor');
        svg = svg.replace(/currentColor/g, '#000');
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        this.addImageFromUrl(url, { credit: r.credit, style: mono ? 'bold' : 'color', revoke: true });
      } else {
        const blob = await (await fetch(r.big)).blob();
        this.addImageFromUrl(URL.createObjectURL(blob), { credit: r.credit, style: 'color', revoke: true });
      }
    } catch (e) {
      this.app.showToast('Could not download that picture');
    }
  }

  // ---------------------------------------------------------------------------
  // Panel (tabs)
  // ---------------------------------------------------------------------------
  renderPanel() {
    const tabs = [['templates', '✨', 'Templates'], ['fill', '📝', 'Fill in'], ['add', '➕', 'Add'], ['edit', '✏️', 'Edit'], ['size', '📏', 'Size & print']];
    const body = {
      templates: () => this.pTemplates(), fill: () => this.pFill(), add: () => this.pAdd(), edit: () => this.pEdit(), size: () => this.pSize()
    }[this.tab]();
    this.panel.innerHTML = `
      <div class="sm-tabs">${tabs.map(([id, ic, label]) => `<button class="sm-tab${this.tab === id ? ' active' : ''}" data-sm="tab" data-v="${id}"><span>${ic}</span>${label}</button>`).join('')}</div>
      <div class="sm-tab-body">${body}</div>`;
  }

  pTemplates() {
    return `
      <p class="sm-hint">Pick a design, then type your details in <b>Fill in</b>. You can change anything after.</p>
      <div class="sm-templates">${SM_TEMPLATES.map(t => `
        <button class="sm-template${this.design.template === t.id ? ' active' : ''}" data-sm="template" data-v="${t.id}">
          <img alt="" src="${this.templateThumb(t)}">
          <b>${t.icon} ${smEsc(t.name)}</b><small>${smEsc(t.about)}</small>
        </button>`).join('')}</div>`;
  }

  templateThumb(t) {
    if (!this.thumbs) this.thumbs = {};
    if (this.thumbs[t.id]) return this.thumbs[t.id];
    const d = { ...this.blankDesign(), ...t.geom, frame: t.frame };
    const { W, H } = this.geom(d);
    d.elements = t.build(W, H);
    const c = this.stickerCanvas(SM_SAMPLE, 4, d);
    this.thumbs[t.id] = c.toDataURL('image/png');
    return this.thumbs[t.id];
  }

  pFill() {
    const d = this.design;
    const keys = d.fieldKeys.length ? d.fieldKeys : [];
    const fields = keys.map(k => `
      <label class="sm-field"><span>${SM_FIELD_LABELS[k] || k}</span>
        <input type="text" data-sm-field="${k}" value="${smEsc(d.fields[k] || '')}" maxlength="40" placeholder="Type ${(SM_FIELD_LABELS[k] || k).toLowerCase()}…" autocomplete="off"></label>`).join('');
    return `
      ${keys.length ? `<p class="sm-hint">Type your answers. Empty boxes print as a line ________ to write on.</p>${fields}` : '<p class="sm-hint">This design has no fill-in boxes. Choose <b>Notebook label</b>, <b>Name tag</b> or another template, or add your own text in <b>Add</b>.</p>'}
      ${keys.length ? `
        <div class="sm-batch">
          <b>👩‍🏫 Stickers for many people</b>
          <p class="sm-hint">One person per line, in this order: <i>${keys.map(k => SM_FIELD_LABELS[k]).join(', ')}</i>. Leave empty to print just the answers above.</p>
          <textarea data-sm-batch rows="4" placeholder="${smEsc(keys.map(k => SM_SAMPLE[k]).join(', '))}\nAarav, 6B, B, 13">${smEsc(d.batch || '')}</textarea>
          <small id="sm-batch-count">${this.batchRows().length > 1 ? `${this.batchRows().length} stickers will print` : ''}</small>
        </div>` : ''}`;
  }

  pAdd() {
    const cat = SM_CLIPART[this.clipCat];
    const s = this.search;
    return `
      <div class="sm-add-row">
        <button class="sm-add" data-sm="add-text"><span>🔤</span>Text</button>
        <button class="sm-add" data-sm="add-photo"><span>🖼️</span>My photo</button>
        <button class="sm-add" data-sm="add-camera"><span>📷</span>Camera</button>
        <button class="sm-add" data-sm="add-doodle"><span>🎨</span>My doodle</button>
        <button class="sm-add" data-sm="add-qr"><span>🔳</span>QR code</button>
      </div>
      <div class="sm-sub">Shapes</div>
      <div class="sm-chips">${[['rect', '▭'], ['round', '▢'], ['circle', '◯'], ['heart', '♡'], ['star', '☆'], ['line', '━']].map(([k, ic]) => `<button class="sm-chip big" data-sm="add-shape" data-v="${k}">${ic}</button>`).join('')}</div>
      <div class="sm-sub">Clip art</div>
      <div class="sm-chips scroll">${SM_CLIPART.map((c, i) => `<button class="sm-chip${i === this.clipCat ? ' active' : ''}" data-sm="clipcat" data-v="${i}">${c.icon} ${c.name}</button>`).join('')}</div>
      <div class="sm-emoji-grid">${cat.items.map(ch => `<button data-sm="add-emoji" data-v="${ch}">${ch}</button>`).join('')}</div>
      <div class="sm-sub">🔎 Find free pictures online</div>
      <div class="sm-chips">
        <button class="sm-chip${s.source === 'icons' ? ' active' : ''}" data-sm="source" data-v="icons">✨ Icons</button>
        <button class="sm-chip${s.source === 'clipart' ? ' active' : ''}" data-sm="source" data-v="clipart">🖍️ Clip art</button>
      </div>
      <div class="sm-search-row"><input type="search" id="sm-search" value="${smEsc(s.q)}" placeholder="e.g. owl, rocket, sunflower" enterkeyhint="search" autocomplete="off"><button class="btn btn-primary" data-sm="search">Search</button></div>
      ${s.status ? `<p class="sm-hint">${smEsc(s.status)}</p>` : ''}
      <div class="sm-results">${s.results.map((r, i) => `<button data-sm="pick" data-v="${i}" title="${smEsc(r.title)}"><img loading="lazy" alt="${smEsc(r.title)}" src="${smEsc(r.thumb)}"></button>`).join('')}</div>
      <p class="sm-hint small">Icons from Iconify and clip art from Wikimedia Commons are free to use. A grown-up should help with searching.</p>`;
  }

  pEdit() {
    const el = this.design.elements[this.selected];
    if (!el) {
      return `<p class="sm-hint">Tap something on the sticker to change it. Drag to move it, use <b>⤡</b> to resize and <b>⟳</b> to turn it.</p>
        <div class="sm-layers">${this.design.elements.map((e, i) => `<button class="sm-layer" data-sm="select" data-v="${i}">${this.layerLabel(e)}</button>`).reverse().join('') || '<p class="sm-hint">Nothing here yet. Add something in ➕ Add.</p>'}</div>`;
    }
    const range = (prop, label, min, max, step, val, unit = '') => `
      <label class="sm-range"><span>${label} <b>${val}${unit}</b></span><input type="range" data-sm-prop="${prop}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
    let html = `<div class="sm-sel-head">${this.layerLabel(el)}</div>`;
    if (el.type === 'text') {
      const fieldChips = this.design.fieldKeys.map(k => `<button class="sm-chip" data-sm="insert-field" data-v="${k}">+ ${SM_FIELD_LABELS[k]}</button>`).join('');
      html += `
        <textarea id="sm-text" data-sm-prop="text" rows="2">${smEsc(el.text)}</textarea>
        ${fieldChips ? `<div class="sm-chips">${fieldChips}</div>` : ''}
        <div class="sm-sub">Font</div>
        <div class="sm-chips">${Object.entries(SM_FONTS).map(([id, f]) => `<button class="sm-chip${el.font === id ? ' active' : ''}" style="font-family:${smEsc(f.css)}" data-sm="set" data-k="font" data-v="${id}">${f.label}</button>`).join('')}</div>
        <div class="sm-chips">
          <button class="sm-chip${el.bold ? ' active' : ''}" data-sm="toggle" data-k="bold"><b>B</b> Bold</button>
          <button class="sm-chip${el.italic ? ' active' : ''}" data-sm="toggle" data-k="italic"><i>I</i> Italic</button>
          <button class="sm-chip${el.invert ? ' active' : ''}" data-sm="toggle" data-k="invert">⬛ White on black</button>
          ${['left', 'center', 'right'].map(a => `<button class="sm-chip${el.align === a ? ' active' : ''}" data-sm="set" data-k="align" data-v="${a}">${{ left: '⇤', center: '↔', right: '⇥' }[a]}</button>`).join('')}
        </div>
        ${range('size', 'Text size', 1.5, 30, 0.1, +el.size.toFixed(1), ' mm')}
        ${range('width', 'Wrap width (0 = one line)', 0, Math.round(this.geom().W), 1, Math.round(el.width || 0), ' mm')}`;
    } else if (el.type === 'emoji') {
      html += `${range('size', 'Size', 3, Math.round(Math.max(this.geom().W, this.geom().H)), 0.5, +el.size.toFixed(1), ' mm')}
        <div class="sm-sub">Swap for</div>
        <div class="sm-emoji-grid small">${SM_CLIPART[this.clipCat].items.map(ch => `<button data-sm="set" data-k="char" data-v="${ch}">${ch}</button>`).join('')}</div>`;
    } else if (el.type === 'image') {
      const asset = this.assets[el.asset];
      html += `
        <div class="sm-sub">Print style</div>
        <div class="sm-chips">${[['photo', '📷 Photo dots'], ['sketch', '✏️ Sketch'], ['bold', '⬛ Bold'], ['color', '🎨 Colour']].map(([id, l]) => `<button class="sm-chip${el.style === id ? ' active' : ''}" data-sm="set" data-k="style" data-v="${id}">${l}</button>`).join('')}</div>
        ${el.style !== 'color' ? `${range('bright', 'Brightness', -60, 60, 1, el.bright || 0)}${range('contrast', 'Contrast', -50, 100, 1, el.contrast || 0)}` : ''}
        ${range('w', 'Width', 3, Math.round(Math.max(this.geom().W, this.geom().H)), 0.5, +el.w.toFixed(1), ' mm')}
        <div class="sm-chips"><button class="sm-chip" data-sm="toggle" data-k="flip">↔ Mirror</button></div>
        ${asset && asset.credit ? `<p class="sm-hint small">Picture: ${smEsc(asset.credit)}</p>` : ''}`;
    } else if (el.type === 'shape') {
      html += `
        <div class="sm-chips">${[['rect', '▭'], ['round', '▢'], ['circle', '◯'], ['heart', '♡'], ['star', '☆'], ['line', '━']].map(([k, ic]) => `<button class="sm-chip big${el.kind === k ? ' active' : ''}" data-sm="set" data-k="kind" data-v="${k}">${ic}</button>`).join('')}</div>
        ${el.kind !== 'line' ? `<div class="sm-chips"><button class="sm-chip${el.fill ? ' active' : ''}" data-sm="toggle" data-k="fill">⬛ Filled</button></div>` : ''}
        ${range('w', 'Width', 2, Math.round(this.geom().W), 0.5, +el.w.toFixed(1), ' mm')}
        ${el.kind !== 'line' ? range('h', 'Height', 2, Math.round(this.geom().H), 0.5, +el.h.toFixed(1), ' mm') : ''}
        ${range('stroke', 'Line thickness', 0.2, 3, 0.1, +el.stroke.toFixed(1), ' mm')}`;
    } else if (el.type === 'qr') {
      const fieldChips = this.design.fieldKeys.map(k => `<button class="sm-chip" data-sm="insert-field" data-v="${k}">+ ${SM_FIELD_LABELS[k]}</button>`).join('');
      html += `
        <label class="sm-field"><span>QR code opens</span><input id="sm-qr" type="text" data-sm-prop="text" value="${smEsc(el.text)}" placeholder="https://… or any text"></label>
        ${fieldChips ? `<div class="sm-chips">${fieldChips}</div>` : ''}
        <p class="sm-hint small">Tip: “tel:” followed by a number makes a phone call when scanned.</p>
        ${range('size', 'Size', 8, Math.round(Math.min(this.geom().W, this.geom().H)), 0.5, +el.size.toFixed(1), ' mm')}`;
    }
    html += `
      ${range('rot', 'Turn', -180, 180, 1, Math.round(el.rot || 0), '°')}
      <div class="sm-actions">
        <button class="sm-chip" data-sm="center">⊕ Centre</button>
        <button class="sm-chip" data-sm="layer" data-v="1">⬆ Front</button>
        <button class="sm-chip" data-sm="layer" data-v="-1">⬇ Back</button>
        <button class="sm-chip" data-sm="duplicate">⧉ Copy</button>
        <button class="sm-chip danger" data-sm="delete">🗑️ Delete</button>
      </div>
      <button class="link-btn" data-sm="deselect">Done editing</button>`;
    return html;
  }

  layerLabel(el) {
    if (el.type === 'text') return `🔤 ${smEsc(this.fillValues(this.design.fields)(el.text).slice(0, 28))}`;
    if (el.type === 'emoji') return `${el.char} Clip art`;
    if (el.type === 'image') return '🖼️ Picture';
    if (el.type === 'qr') return '🔳 QR code';
    return { rect: '▭', round: '▢', circle: '◯', heart: '♡', star: '☆', line: '━' }[el.kind] + ' Shape';
  }

  pSize() {
    const d = this.design;
    const { W, H } = this.geom();
    const rows = this.batchRows().length * d.copies;
    const strip = this.stripLengthMm();
    return `
      <div class="sm-sub">Direction</div>
      <div class="sm-orient">
        <button class="sm-orient-btn${d.orient === 'portrait' ? ' active' : ''}" data-sm="orient" data-v="portrait"><i class="sm-o-v"></i>Vertical<small>reads across the paper</small></button>
        <button class="sm-orient-btn${d.orient === 'landscape' ? ' active' : ''}" data-sm="orient" data-v="landscape"><i class="sm-o-h"></i>Horizontal<small>long stickers, prints sideways</small></button>
      </div>
      <div class="sm-sub">Stickers across the 58 mm roll</div>
      <div class="sm-chips">${[1, 2, 3].map(n => `<button class="sm-chip big${d.across === n ? ' active' : ''}" data-sm="across" data-v="${n}">${'▮'.repeat(n)} ${n}</button>`).join('')}</div>
      <div class="sm-sub">Length along the paper</div>
      <div class="sm-chips">${SM_LENGTHS.map(l => `<button class="sm-chip${d.length === l ? ' active' : ''}" data-sm="length" data-v="${l}">${l} mm</button>`).join('')}</div>
      <label class="sm-range"><span>Custom length <b>${d.length} mm</b></span><input type="range" data-sm-geom="length" min="10" max="200" step="1" value="${d.length}"></label>
      <p class="sm-size-note">Each sticker: <b>${+W.toFixed(1)} × ${+H.toFixed(1)} mm</b></p>
      <div class="sm-sub">Border</div>
      <div class="sm-chips">${SM_FRAMES.map(([id, label]) => `<button class="sm-chip${d.frame === id ? ' active' : ''}" data-sm="frame" data-v="${id}">${label}</button>`).join('')}</div>
      <div class="sm-sub">Printing</div>
      <div class="sm-stepper"><span>Copies${this.batchRows().length > 1 ? ' of each' : ''}</span><button class="sm-chip big" data-sm="copies" data-v="-1">−</button><b>${d.copies}</b><button class="sm-chip big" data-sm="copies" data-v="1">+</button></div>
      <div class="sm-chips"><span class="sm-inline">Gap</span>${[0, 2, 3, 5].map(g => `<button class="sm-chip${d.gap === g ? ' active' : ''}" data-sm="gap" data-v="${g}">${g} mm</button>`).join('')}
        <button class="sm-chip${d.cutLines ? ' active' : ''}" data-sm="cutlines">✂ Cut lines</button></div>
      <p class="sm-size-note">${rows} sticker${rows === 1 ? '' : 's'} · about <b>${Math.round(strip)} mm</b> of paper</p>
      <button class="btn btn-dark btn-big sm-print-btn" data-sm="print">🖨️ Print stickers</button>
      <p class="sm-hint small">Use 58 mm thermal sticker paper. Pre-cut labels: set the length to the label size and the gap to the space between labels.</p>`;
  }

  // ---------------------------------------------------------------------------
  // Printing: lay the stickers out on one long strip, 384 dots wide
  // ---------------------------------------------------------------------------
  batchRows() {
    const d = this.design;
    const lines = (d.batch || '').split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length || !d.fieldKeys.length) return [d.fields];
    return lines.map(line => {
      const parts = line.split(',').map(s => s.trim());
      const v = { ...d.fields };
      d.fieldKeys.forEach((key, i) => { if (parts[i] !== undefined && parts[i] !== '') v[key] = parts[i]; });
      return v;
    });
  }

  stripLengthMm() {
    const d = this.design;
    const n = this.batchRows().length * d.copies;
    const rows = Math.ceil(n / d.across);
    return rows * d.length + (rows - 1) * d.gap + 6;
  }

  buildStrip() {
    const d = this.design;
    const { A } = this.geom();
    const items = [];
    this.batchRows().forEach(v => { for (let i = 0; i < d.copies; i++) items.push(v); });
    const k = SM_DPM;
    const cellW = Math.round(A * k);
    const cellH = Math.round(d.length * k);
    const gapY = Math.round(d.gap * k);
    const gapX = Math.round(SM_GAP_X * k);
    const margin = 3 * k;
    const rows = Math.ceil(items.length / d.across);
    const out = document.createElement('canvas');
    out.width = SM_PAPER_MM * k;
    out.height = margin * 2 + rows * cellH + (rows - 1) * gapY;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, out.width, out.height);
    const totalW = d.across * cellW + (d.across - 1) * gapX;
    const left = Math.round((out.width - totalW) / 2);
    items.forEach((v, i) => {
      const col = i % d.across;
      const row = Math.floor(i / d.across);
      let c = this.stickerCanvas(v);
      if (d.orient === 'landscape') {
        // Horizontal designs print sideways along the paper
        const r = document.createElement('canvas');
        r.width = c.height;
        r.height = c.width;
        const rc = r.getContext('2d');
        rc.translate(r.width, 0);
        rc.rotate(Math.PI / 2);
        rc.drawImage(c, 0, 0);
        c = r;
      }
      ctx.drawImage(c, left + col * (cellW + gapX), margin + row * (cellH + gapY), cellW, cellH);
    });
    if (d.cutLines) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      for (let r = 1; r < rows; r++) {
        const y = margin + r * cellH + (r - 0.5) * gapY;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(out.width, y); ctx.stroke();
      }
      for (let c = 1; c < d.across; c++) {
        const x = left + c * cellW + (c - 0.5) * gapX;
        ctx.beginPath(); ctx.moveTo(x, margin); ctx.lineTo(x, out.height - margin); ctx.stroke();
      }
    }
    return out;
  }

  print() {
    const strip = this.buildStrip();
    const n = this.batchRows().length * this.design.copies;
    const secs = Math.round((strip.height * 48) / 64 * 0.03);
    this.selected = -1;
    this.render();
    this.app.quest.openPrint(`🏷️ ${n} sticker${n === 1 ? '' : 's'}`, strip, `Stickers_${this.design.name}`, null,
      `${Math.round(strip.height / SM_DPM)} mm of paper, about ${Math.max(3, secs)} seconds over Bluetooth. Load sticker paper first!`);
  }

  // ---------------------------------------------------------------------------
  // My stickers (saved designs)
  // ---------------------------------------------------------------------------
  savedList() {
    try { return JSON.parse(localStorage.getItem(SM_STORE) || '[]'); } catch (e) { return []; }
  }

  // Ask for a name in our own pop-up (browser prompts look out of place on a kiosk tablet)
  saveDesign() {
    this.app.quest.modalOwner = 'stickers';
    this.app.quest.openModal('💾 Save this sticker', `
      <div class="wq-modal-center">
        <img class="sm-save-thumb" alt="" src="${this.stickerCanvas(this.design.fields, 4).toDataURL('image/png')}">
        <label class="sm-field"><span>Name</span><input type="text" id="sm-save-name" maxlength="30" value="${smEsc(this.design.name || 'My sticker')}" autocomplete="off"></label>
        <button class="btn btn-primary btn-big" data-sm="save-confirm">💾 Save in My stickers</button>
      </div>`);
    setTimeout(() => { const i = this.$('sm-save-name'); if (i) { i.focus(); i.select(); } }, 50);
  }

  saveConfirmed() {
    const input = this.$('sm-save-name');
    this.design.name = ((input && input.value) || '').trim().slice(0, 30) || 'My sticker';
    this.app.quest.closeModal();
    const list = this.savedList().filter(x => x.id !== this.design.id);
    if (!this.design.id) this.design.id = smId();
    const thumb = this.stickerCanvas(this.design.fields, 3).toDataURL('image/png');
    list.unshift({ id: this.design.id, name: this.design.name, at: Date.now(), thumb, design: this.design, assets: this.usedAssets() });
    try {
      localStorage.setItem(SM_STORE, JSON.stringify(list.slice(0, SM_MAX_SAVED)));
      this.app.showToast('💾 Saved in My stickers');
    } catch (e) {
      this.app.showToast('⚠️ Not enough space. Delete some saved stickers first.');
    }
    this.autosave();
  }

  openGallery() {
    const list = this.savedList();
    this.app.quest.modalOwner = 'stickers';
    this.app.quest.openModal('📁 My stickers', `
      <div class="sm-gallery">
        <button class="sm-saved new" data-sm="new"><span>✨</span><b>New sticker</b></button>
        ${list.map(s => `
          <div class="sm-saved">
            <button data-sm="open-saved" data-v="${s.id}"><img alt="" src="${s.thumb}"><b>${smEsc(s.name)}</b><small>${new Date(s.at).toLocaleDateString()}</small></button>
            <button class="sm-del" data-sm="delete-saved" data-v="${s.id}" title="Delete">🗑️</button>
          </div>`).join('')}
      </div>
      ${list.length ? '' : '<p class="sm-hint">Designs you save with 💾 appear here.</p>'}`, 'wide');
  }

  openSaved(id) {
    const s = this.savedList().find(x => x.id === id);
    if (!s) return;
    this.history.push(this.snapshot());
    Object.entries(s.assets || {}).forEach(([aid, a]) => { if (!this.assets[aid]) this.addAsset(a.src, a.credit, aid); });
    this.design = { ...this.blankDesign(), ...s.design };
    this.selected = -1;
    this.lastSnap = this.snapshot();
    this.app.quest.closeModal();
    this.tab = this.design.fieldKeys.length ? 'fill' : 'edit';
    this.afterChange();
  }

  deleteSaved(id) {
    if (!confirm('Delete this saved sticker?')) return;
    try { localStorage.setItem(SM_STORE, JSON.stringify(this.savedList().filter(x => x.id !== id))); } catch (e) { /* ignore */ }
    this.openGallery();
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  bind() {
    this.canvas.addEventListener('pointerdown', (e) => this.onDown(e));
    this.canvas.addEventListener('pointermove', (e) => this.onMove(e));
    this.canvas.addEventListener('pointerup', (e) => this.onUp(e));
    this.canvas.addEventListener('pointercancel', (e) => this.onUp(e));
    let lastSize = '';
    new ResizeObserver(([entry]) => {
      const size = `${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)}`;
      if (size === lastSize || !this.isOpen()) return;
      lastSize = size;
      this.fit();
    }).observe(this.stage);

    const onClick = (e) => {
      const b = e.target.closest('[data-sm]');
      if (b && !b.disabled) this.act(b.dataset.sm, b.dataset, b);
    };
    this.panel.addEventListener('click', onClick);
    document.getElementById('sm-bar').addEventListener('click', onClick);
    document.getElementById('modal-wq').addEventListener('click', (e) => {
      if (this.app.quest.modalOwner === 'stickers') onClick(e);
    });

    this.panel.addEventListener('input', (e) => this.onInput(e.target, false));
    this.panel.addEventListener('change', (e) => this.onInput(e.target, true));
    this.panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'sm-search') this.runSearch();
    });
    this.$('sm-file').addEventListener('change', (e) => { this.importFile(e.target.files[0]); e.target.value = ''; });
    this.$('sm-camera').addEventListener('change', (e) => { this.importFile(e.target.files[0]); e.target.value = ''; });
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen() || /input|textarea/i.test(e.target.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); this.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); this.redo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selected >= 0) this.act('delete', {});
    });
  }

  onInput(t, done) {
    const el = this.design.elements[this.selected];
    if (t.dataset.smField) {
      this.design.fields[t.dataset.smField] = t.value;
      this.render();
      if (done) this.commit();
      return;
    }
    if (t.hasAttribute('data-sm-batch')) {
      this.design.batch = t.value;
      const n = this.batchRows().length;
      const c = this.$('sm-batch-count');
      if (c) c.textContent = n > 1 ? `${n} stickers will print` : '';
      if (done) this.commit();
      return;
    }
    if (t.dataset.smGeom === 'length') {
      if (done) this.setGeometry({ length: Number(t.value) });
      else t.previousElementSibling.querySelector('b').textContent = `${t.value} mm`;
      return;
    }
    if (t.dataset.smProp && el) {
      const prop = t.dataset.smProp;
      if (prop === 'text') el.text = t.value;
      else if (prop === 'w' && el.type === 'image') {
        const ratio = el.h / el.w;
        el.w = Number(t.value);
        el.h = +(el.w * ratio).toFixed(2);
      } else el[prop] = Number(t.value);
      const label = t.previousElementSibling && t.previousElementSibling.querySelector('b');
      if (label) label.textContent = `${t.value}${{ size: ' mm', width: ' mm', w: ' mm', h: ' mm', stroke: ' mm', rot: '°' }[prop] || ''}`;
      this.render();
      if (done) this.commit();
    }
  }

  act(a, d) {
    const el = this.design.elements[this.selected];
    if (window.soundEngine && a !== 'tab') window.soundEngine.playClick();
    switch (a) {
      case 'tab': this.tab = d.v; return this.renderPanel();
      case 'template':
        if (this.design.elements.length && this.design.template !== d.v && !confirm('Start from this template? Your current design will be replaced (you can Undo).')) return null;
        return this.applyTemplate(d.v);
      case 'add-text': return this.addText();
      case 'add-photo': return this.$('sm-file').click();
      case 'add-camera': return this.$('sm-camera').click();
      case 'add-doodle': return this.importDoodle();
      case 'add-qr': return this.addQr();
      case 'add-shape': return this.addShape(d.v);
      case 'add-emoji': return this.addEmoji(d.v);
      case 'clipcat': this.clipCat = Number(d.v); return this.renderPanel();
      case 'source': this.search.source = d.v; this.search.results = []; this.search.status = ''; this.renderPanel(); return this.search.q ? this.runSearch() : null;
      case 'search': return this.runSearch();
      case 'pick': return this.pickResult(Number(d.v));
      case 'select': this.selected = Number(d.v); this.renderPanel(); return this.render();
      case 'deselect': this.selected = -1; this.renderPanel(); return this.render();
      case 'set': if (el) { el[d.k] = d.v; this.commit(); this.renderPanel(); this.render(); } return null;
      case 'toggle': if (el) { el[d.k] = !el[d.k]; this.commit(); this.renderPanel(); this.render(); } return null;
      case 'insert-field': if (el) { el.text = `${el.text}${el.text && !/\s$/.test(el.text) && el.type === 'text' ? ' ' : ''}{${d.v}}`; this.commit(); this.renderPanel(); this.render(); } return null;
      case 'center': if (el) { const { W, H } = this.geom(); el.x = W / 2; el.y = H / 2; this.commit(); this.render(); } return null;
      case 'layer': {
        if (!el) return null;
        const to = smClamp(this.selected + Number(d.v), 0, this.design.elements.length - 1);
        this.design.elements.splice(this.selected, 1);
        this.design.elements.splice(to, 0, el);
        this.selected = to;
        this.commit(); this.renderPanel(); return this.render();
      }
      case 'duplicate': if (el) { const copy = JSON.parse(JSON.stringify(el)); copy.x += 2; copy.y += 2; this.design.elements.push(copy); this.selected = this.design.elements.length - 1; this.commit(); this.renderPanel(); this.render(); } return null;
      case 'delete': if (el) { this.design.elements.splice(this.selected, 1); this.selected = -1; this.commit(); this.renderPanel(); this.render(); } return null;
      case 'orient': return this.setOrientation(d.v);
      case 'across': return this.setGeometry({ across: Number(d.v) });
      case 'length': return this.setGeometry({ length: Number(d.v) });
      case 'frame': this.design.frame = d.v; this.commit(); this.renderPanel(); return this.render();
      case 'copies': this.design.copies = smClamp(this.design.copies + Number(d.v), 1, 30); this.commit(); return this.renderPanel();
      case 'gap': this.design.gap = Number(d.v); this.commit(); return this.renderPanel();
      case 'cutlines': this.design.cutLines = !this.design.cutLines; this.commit(); return this.renderPanel();
      case 'print': return this.print();
      case 'undo': return this.undo();
      case 'redo': return this.redo();
      case 'look': return this.togglePrintLook();
      case 'save': return this.saveDesign();
      case 'save-confirm': return this.saveConfirmed();
      case 'gallery': return this.openGallery();
      case 'new': this.app.quest.closeModal(); return this.applyTemplate('blank');
      case 'open-saved': return this.openSaved(d.v);
      case 'delete-saved': return this.deleteSaved(d.v);
      case 'done': return this.print();
      default: return null;
    }
  }

  // Switching direction swaps width and height, so turn the layout with it
  setOrientation(orient) {
    const d = this.design;
    if (d.orient === orient) return;
    const before = this.geom();
    d.orient = orient;
    const after = this.geom();
    d.elements.forEach(el => {
      el.x = el.x / before.W * after.W;
      el.y = el.y / before.H * after.H;
      if (el.width) el.width = +(el.width / before.W * after.W).toFixed(2);
    });
    const s = Math.min(after.W / before.W, after.H / before.H, 1.6);
    d.elements.forEach(el => ['size', 'w', 'h'].forEach(key => { if (el[key]) el[key] = +(el[key] * Math.max(0.5, s)).toFixed(2); }));
    this.commit();
    this.fit();
    this.renderPanel();
  }

  togglePrintLook() {
    this.printLook = !this.printLook;
    this.$('sm-look').classList.toggle('active', this.printLook);
    this.render();
  }

  updateBar() {
    const u = this.$('sm-undo');
    if (!u) return;
    u.disabled = !this.history.length;
    this.$('sm-redo').disabled = !this.future.length;
  }

  open() {
    this.app.showScreen('stickers');
    this.renderPanel();
    this.updateBar();
    requestAnimationFrame(() => this.fit());
  }
}
