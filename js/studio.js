// Doodle Studio: free drawing canvas (no timer, no score) that prints on the POS-58 thermal printer
// Canvas is 3:4 portrait = the full 58mm paper width (384 dots) x 512 dots when printed.

const STUDIO_W = 600;
const STUDIO_H = 800;
const STUDIO_HISTORY = 20;
const STUDIO_PRINT_GAMMA = 1.3; // darkens light colours a little so they still show as dots on paper

const STUDIO_COLORS = ['#111111', '#6b7280', '#e3141c', '#f97316', '#facc15', '#22c55e',
  '#0d9488', '#2563eb', '#7c3aed', '#ec4899', '#92400e', '#ffffff'];

const STUDIO_TOOLS = [
  { id: 'pencil', icon: '✏️', label: 'Pencil', sizes: [3, 5, 8, 12], hint: 'Draw thin lines.' },
  { id: 'brush', icon: '🖌️', label: 'Brush', sizes: [10, 18, 30, 46], hint: 'Paint with a big brush.' },
  { id: 'rainbow', icon: '🌈', label: 'Rainbow', sizes: [10, 18, 30, 46], hint: 'Colours change as you draw!' },
  { id: 'spray', icon: '💨', label: 'Spray', sizes: [24, 40, 60, 90], hint: 'Spray paint — hold still for more.' },
  { id: 'fill', icon: '🪣', label: 'Fill', sizes: null, hint: 'Tap inside a shape to fill it with colour.' },
  { id: 'shape', icon: '🔷', label: 'Shapes', sizes: [4, 8, 12, 18], hint: 'Drag on the canvas to draw a shape.' },
  { id: 'sticker', icon: '⭐', label: 'Stickers', sizes: [60, 100, 150, 210], hint: 'Tap the canvas to stamp.' },
  { id: 'text', icon: '🔤', label: 'Text', sizes: [32, 48, 70, 100], hint: 'Type below, then tap the canvas to place it.' },
  { id: 'eraser', icon: '🧽', label: 'Eraser', sizes: [16, 30, 50, 80], hint: 'Rub out mistakes. Colouring-page lines stay.' }
];

const STUDIO_SHAPES = [
  { id: 'line', icon: '╱' }, { id: 'rect', icon: '▭' }, { id: 'ellipse', icon: '◯' },
  { id: 'triangle', icon: '△' }, { id: 'star', icon: '☆' }, { id: 'heart', icon: '♡' }
];

const STUDIO_STICKERS = ['⭐', '🌟', '❤️', '🌸', '🌻', '🌈', '☀️', '🌙', '☁️', '⚡', '🐱', '🐶', '🦋', '🐟',
  '🦉', '🐘', '🚀', '✈️', '🚗', '🏠', '🌳', '🎈', '🎂', '⚽', '🍦', '🍕', '👑', '🎨'];

// Colouring pages: black outlines on a 600x800 page (kept on their own layer, so they never get erased)
const SVG_HEAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">';
const svgStar = (cx, cy, r) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}"/>`;
};

const STUDIO_PAGES = [
  { id: 'blank', label: 'Blank page', svg: '' },
  {
    id: 'owl', label: 'Owl', svg: `
      <ellipse cx="300" cy="440" rx="190" ry="250"/>
      <path d="M170 265 L150 140 L255 212 Z"/><path d="M430 265 L450 140 L345 212 Z"/>
      <circle cx="215" cy="360" r="70"/><circle cx="385" cy="360" r="70"/>
      <circle cx="215" cy="360" r="28"/><circle cx="385" cy="360" r="28"/>
      <path d="M272 430 H328 L300 482 Z"/>
      <path d="M118 430 Q70 560 175 655"/><path d="M482 430 Q530 560 425 655"/>
      <ellipse cx="300" cy="575" rx="115" ry="105"/>
      <path d="M215 545 q21 26 42 0 q21 26 42 0 q21 26 42 0 q21 26 42 0"/>
      <path d="M236 600 q21 26 42 0 q21 26 42 0 q21 26 42 0"/>
      <path d="M30 712 H570"/><path d="M30 746 H570"/><path d="M30 712 V746"/><path d="M570 712 V746"/>
      <path d="M230 690 q12 22 24 0 q12 22 24 0"/><path d="M322 690 q12 22 24 0 q12 22 24 0"/>`
  },
  {
    id: 'rocket', label: 'Rocket', svg: `
      <path d="M300 90 C400 190 420 360 390 540 H210 C180 360 200 190 300 90 Z"/>
      <path d="M232 215 Q300 238 368 215"/>
      <circle cx="300" cy="335" r="62"/><circle cx="300" cy="335" r="38"/>
      <path d="M212 430 L118 605 L208 560 Z"/><path d="M388 430 L482 605 L392 560 Z"/>
      <rect x="232" y="540" width="136" height="42" rx="10"/>
      <path d="M248 582 Q232 655 272 705 Q284 655 300 735 Q316 655 328 705 Q368 655 352 582 Z"/>
      ${svgStar(95, 150, 42)}${svgStar(515, 330, 34)}${svgStar(90, 420, 28)}${svgStar(500, 690, 30)}
      <circle cx="490" cy="130" r="45"/><ellipse cx="490" cy="130" rx="85" ry="20" transform="rotate(-20 490 130)"/>`
  },
  {
    id: 'house', label: 'House', svg: `
      <path d="M20 722 H580"/>
      <rect x="130" y="392" width="340" height="330"/>
      <path d="M100 402 L300 212 L500 402 Z"/>
      <path d="M390 297 V232 H442 V346"/>
      <rect x="255" y="562" width="90" height="160" rx="10"/><circle cx="328" cy="645" r="7"/>
      <rect x="165" y="450" width="72" height="72"/><path d="M201 450 V522 M165 486 H237"/>
      <rect x="363" y="450" width="72" height="72"/><path d="M399 450 V522 M363 486 H435"/>
      <circle cx="98" cy="112" r="48"/>
      <path d="M98 40 V20 M98 184 V204 M26 112 H6 M170 112 H190 M47 61 L33 47 M149 61 L163 47 M47 163 L33 177 M149 163 L163 177"/>
      <path d="M372 172 a36 36 0 0 1 28 -58 a48 48 0 0 1 90 -12 a38 38 0 0 1 58 42 a30 30 0 0 1 -12 28 Z"/>
      <path d="M60 722 V660 M40 680 q20 -30 40 0 M545 722 V665 M525 685 q20 -30 40 0"/>`
  },
  {
    id: 'flower', label: 'Flower', svg: `
      <rect x="185" y="572" width="230" height="42" rx="8"/>
      <path d="M202 614 H398 L374 765 H226 Z"/>
      <path d="M300 572 C290 480 312 420 300 300"/>
      <path d="M300 488 C232 478 208 428 220 404 C272 404 300 438 300 488 Z"/>
      <path d="M302 528 C370 518 394 468 382 444 C330 444 302 478 302 528 Z"/>
      ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<ellipse cx="300" cy="133" rx="44" ry="72" transform="rotate(${a} 300 228)"/>`).join('')}
      <circle cx="300" cy="228" r="56"/>
      <circle cx="110" cy="640" r="12"/><path d="M75 600 q35 -30 70 0"/>`
  },
  {
    id: 'fish', label: 'Fish', svg: `
      <path d="M110 380 C200 230 400 230 470 380 C400 530 200 530 110 380 Z"/>
      <path d="M462 380 L560 290 L540 380 L560 470 Z"/>
      <circle cx="190" cy="360" r="26"/><circle cx="190" cy="360" r="9"/>
      <path d="M250 296 Q282 380 250 464"/>
      <path d="M300 266 Q340 196 392 272"/><path d="M300 494 Q332 552 372 496"/>
      <path d="M300 340 a22 22 0 0 1 0 44 M345 330 a26 26 0 0 1 0 52 M390 340 a22 22 0 0 1 0 44 M322 392 a22 22 0 0 1 0 44 M368 392 a22 22 0 0 1 0 44"/>
      <circle cx="125" cy="205" r="18"/><circle cx="155" cy="145" r="12"/><circle cx="105" cy="110" r="9"/>
      <path d="M0 742 Q150 712 300 742 T600 742"/>
      <path d="M70 742 C40 680 98 650 70 590 C50 545 90 515 78 470"/>
      <path d="M520 742 C550 690 495 655 525 600 C545 560 505 530 520 495"/>`
  },
  {
    id: 'butterfly', label: 'Butterfly', svg: `
      <path d="M285 330 C180 160 40 200 80 360 C110 450 220 440 285 400 Z"/>
      <path d="M315 330 C420 160 560 200 520 360 C490 450 380 440 315 400 Z"/>
      <path d="M285 440 C170 440 100 560 170 622 C230 662 280 582 290 520 Z"/>
      <path d="M315 440 C430 440 500 560 430 622 C370 662 320 582 310 520 Z"/>
      <ellipse cx="300" cy="430" rx="26" ry="170"/><circle cx="300" cy="232" r="34"/>
      <path d="M290 202 Q252 122 220 110 M310 202 Q348 122 380 110"/>
      <circle cx="214" cy="106" r="11"/><circle cx="386" cy="106" r="11"/>
      <circle cx="170" cy="312" r="36"/><circle cx="430" cy="312" r="36"/>
      <circle cx="200" cy="562" r="26"/><circle cx="400" cy="562" r="26"/>
      ${svgStar(80, 640, 36)}${svgStar(520, 660, 30)}`
  },
  { id: 'logo', label: 'School logo', image: 'assets/logo.jpg' }
];

class DoodleStudio {
  constructor(app) {
    this.app = app;
    this.tool = 'brush';
    this.color = '#e3141c';
    this.sizeIdx = 1;
    this.shape = 'ellipse';
    this.shapeFilled = false;
    this.sticker = '⭐';
    this.mirror = false;
    this.printLook = false;
    this.printStyle = 'shade';
    this.undoStack = [];
    this.redoStack = [];
    this.dirty = false;
    this.pointerId = null;
    this.hue = 0;
    this.pageId = 'blank';

    const $ = (id) => document.getElementById(id);
    this.$ = $;
    this.wrap = $('studio-canvas-wrap');
    this.stack = $('studio-canvas-stack');
    this.paint = $('studio-paint');
    this.lines = $('studio-lines');
    this.overlay = $('studio-overlay');
    this.preview = $('studio-preview');
    [this.paint, this.lines, this.overlay].forEach(c => { c.width = STUDIO_W; c.height = STUDIO_H; });
    this.pctx = this.paint.getContext('2d', { willReadFrequently: true });
    this.lctx = this.lines.getContext('2d');
    this.octx = this.overlay.getContext('2d');

    this.buildUI();
    this.bindEvents();
    new ResizeObserver(() => this.fit()).observe(this.wrap);
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------
  buildUI() {
    this.$('studio-tools').innerHTML = STUDIO_TOOLS.map(t => `
      <button class="studio-tool" data-tool="${t.id}" title="${t.label}">
        <span class="studio-tool-icon">${t.icon}</span><span class="studio-tool-label">${t.label}</span>
      </button>`).join('');

    this.$('studio-colors').innerHTML = STUDIO_COLORS.map(c =>
      `<button class="swatch" data-color="${c}" style="--sw:${c}" title="${c}"></button>`).join('') +
      '<label class="swatch swatch-custom" title="More colours"><input type="color" id="studio-color-picker" value="#e3141c"></label>';

    this.$('studio-sizes').innerHTML = [0, 1, 2, 3].map(i =>
      `<button class="size-btn" data-size="${i}" title="Size ${i + 1}"><span style="--d:${8 + i * 7}px"></span></button>`).join('');

    this.$('studio-pages').innerHTML = STUDIO_PAGES.map(p => `
      <button class="page-card" data-page="${p.id}">
        <span class="page-thumb">${p.image ? `<img src="${p.image}" alt="">` : (p.svg ? SVG_HEAD + p.svg + '</svg>' : '<span class="page-blank">＋</span>')}</span>
        <span>${p.label}</span>
      </button>`).join('');

    this.selectTool(this.tool);
    this.selectColor(this.color);
    this.selectSize(this.sizeIdx);
    this.updateHistoryButtons();
  }

  renderOptions() {
    const t = STUDIO_TOOLS.find(x => x.id === this.tool);
    let html = `<p class="studio-hint">${t.icon} ${t.hint}</p>`;
    if (this.tool === 'shape') {
      html += `<div class="opt-row">${STUDIO_SHAPES.map(s =>
        `<button class="opt-btn${s.id === this.shape ? ' active' : ''}" data-shape="${s.id}">${s.icon}</button>`).join('')}</div>
        <div class="opt-row">
          <button class="opt-pill${!this.shapeFilled ? ' active' : ''}" data-filled="0">Outline</button>
          <button class="opt-pill${this.shapeFilled ? ' active' : ''}" data-filled="1">Filled</button>
        </div>`;
    } else if (this.tool === 'sticker') {
      html += `<div class="sticker-grid">${STUDIO_STICKERS.map(s =>
        `<button class="opt-btn sticker-btn${s === this.sticker ? ' active' : ''}" data-sticker="${s}">${s}</button>`).join('')}</div>`;
    } else if (this.tool === 'text') {
      html += `<input type="text" id="studio-text" class="studio-text-input" maxlength="30" placeholder="Type your words…" value="${this.textValue ? this.textValue.replace(/"/g, '&quot;') : ''}">`;
    }
    this.$('studio-options').innerHTML = html;
    this.$('studio-sizes').classList.toggle('disabled', !t.sizes);
  }

  selectTool(id) {
    this.tool = id;
    document.querySelectorAll('.studio-tool').forEach(b => b.classList.toggle('active', b.dataset.tool === id));
    this.renderOptions();
  }

  selectColor(c) {
    this.color = c;
    document.querySelectorAll('.swatch[data-color]').forEach(b => b.classList.toggle('active', b.dataset.color === c));
    this.$('studio-colors').style.setProperty('--current', c);
    if (this.tool === 'eraser') this.selectTool('brush');
  }

  selectSize(i) {
    this.sizeIdx = i;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.toggle('active', +b.dataset.size === i));
  }

  currentSize() {
    const t = STUDIO_TOOLS.find(x => x.id === this.tool);
    return t.sizes ? t.sizes[this.sizeIdx] : 0;
  }

  bindEvents() {
    const $ = this.$;
    $('studio-tools').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tool]');
      if (b) { window.soundEngine.playClick(); this.selectTool(b.dataset.tool); }
    });
    $('studio-colors').addEventListener('click', (e) => {
      const b = e.target.closest('[data-color]');
      if (b) { window.soundEngine.playClick(); this.selectColor(b.dataset.color); }
    });
    $('studio-colors').addEventListener('input', (e) => {
      if (e.target.id === 'studio-color-picker') this.selectColor(e.target.value);
    });
    $('studio-sizes').addEventListener('click', (e) => {
      const b = e.target.closest('[data-size]');
      if (b) { window.soundEngine.playClick(); this.selectSize(+b.dataset.size); }
    });
    $('studio-options').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      window.soundEngine.playClick();
      if (b.dataset.shape) this.shape = b.dataset.shape;
      if (b.dataset.filled) this.shapeFilled = b.dataset.filled === '1';
      if (b.dataset.sticker) this.sticker = b.dataset.sticker;
      this.renderOptions();
    });
    $('studio-options').addEventListener('input', (e) => {
      if (e.target.id === 'studio-text') this.textValue = e.target.value;
    });

    $('studio-undo').addEventListener('click', () => this.undo());
    $('studio-redo').addEventListener('click', () => this.redo());
    $('studio-clear').addEventListener('click', () => {
      if (!this.dirty) return;
      if (confirm('Clear your whole drawing?')) {
        this.pushHistory();
        this.pctx.clearRect(0, 0, STUDIO_W, STUDIO_H);
        this.afterChange();
      }
    });
    $('studio-mirror').addEventListener('click', (e) => {
      this.mirror = !this.mirror;
      e.currentTarget.classList.toggle('active', this.mirror);
      this.stack.classList.toggle('mirror-on', this.mirror);
      this.app.showToast(this.mirror ? '🪞 Mirror on — both sides draw together!' : 'Mirror off');
    });
    $('studio-look').addEventListener('click', () => this.setPrintLook(!this.printLook));
    $('studio-pages-btn').addEventListener('click', () => $('modal-studio-pages').classList.add('open'));
    $('studio-pages').addEventListener('click', (e) => {
      const b = e.target.closest('[data-page]');
      if (b) this.choosePage(b.dataset.page);
    });
    $('btn-close-studio-pages').addEventListener('click', () => $('modal-studio-pages').classList.remove('open'));
    $('studio-back').addEventListener('click', () => this.app.showScreen('home'));
    $('studio-done').addEventListener('click', () => this.openFinish());

    // Finish modal
    $('btn-close-studio-finish').addEventListener('click', () => $('modal-studio-finish').classList.remove('open'));
    $('studio-keep-drawing').addEventListener('click', () => $('modal-studio-finish').classList.remove('open'));
    $('studio-print').addEventListener('click', () => this.printDrawing());
    $('studio-print-style').addEventListener('click', (e) => {
      const b = e.target.closest('[data-print-style]');
      if (b) { window.soundEngine.playClick(); this.setPrintStyle(b.dataset.printStyle); }
    });
    $('studio-save').addEventListener('click', () => this.savePicture());
    $('studio-browser-print').addEventListener('click', () => this.browserPrint());
    $('studio-new').addEventListener('click', () => {
      if (confirm('Start a brand new drawing?')) {
        $('modal-studio-finish').classList.remove('open');
        this.reset();
      }
    });

    // Drawing
    this.stack.addEventListener('pointerdown', (e) => this.onDown(e));
    this.stack.addEventListener('pointermove', (e) => this.onMove(e));
    this.stack.addEventListener('pointerup', (e) => this.onUp(e));
    this.stack.addEventListener('pointercancel', (e) => this.onUp(e));

    window.addEventListener('keydown', (e) => {
      if (!this.isOpen() || e.target.tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'z') { e.preventDefault(); e.shiftKey ? this.redo() : this.undo(); }
      if ((e.ctrlKey || e.metaKey) && key === 'y') { e.preventDefault(); this.redo(); }
    });
  }

  isOpen() {
    return document.getElementById('screen-studio').classList.contains('active');
  }

  open() {
    this.app.showScreen('studio');
    requestAnimationFrame(() => this.fit());
  }

  // Fit the 3:4 canvas into whatever space the layout gives it
  fit() {
    const r = this.wrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const scale = Math.min(r.width / STUDIO_W, r.height / STUDIO_H);
    this.stack.style.width = `${Math.floor(STUDIO_W * scale)}px`;
    this.stack.style.height = `${Math.floor(STUDIO_H * scale)}px`;
  }

  reset() {
    this.pctx.clearRect(0, 0, STUDIO_W, STUDIO_H);
    this.lctx.clearRect(0, 0, STUDIO_W, STUDIO_H);
    this.pageId = 'blank';
    this.undoStack = [];
    this.redoStack = [];
    this.dirty = false;
    this.textValue = '';
    this.$('studio-title').value = '';
    this.setPrintLook(false);
    this.updateHistoryButtons();
  }

  // ---------------------------------------------------------------------------
  // History
  // ---------------------------------------------------------------------------
  pushHistory() {
    this.undoStack.push(this.pctx.getImageData(0, 0, STUDIO_W, STUDIO_H));
    if (this.undoStack.length > STUDIO_HISTORY) this.undoStack.shift();
    this.redoStack = [];
    this.updateHistoryButtons();
  }

  undo() {
    if (!this.undoStack.length) return;
    this.redoStack.push(this.pctx.getImageData(0, 0, STUDIO_W, STUDIO_H));
    this.pctx.putImageData(this.undoStack.pop(), 0, 0);
    this.afterChange();
  }

  redo() {
    if (!this.redoStack.length) return;
    this.undoStack.push(this.pctx.getImageData(0, 0, STUDIO_W, STUDIO_H));
    this.pctx.putImageData(this.redoStack.pop(), 0, 0);
    this.afterChange();
  }

  updateHistoryButtons() {
    this.$('studio-undo').disabled = !this.undoStack.length;
    this.$('studio-redo').disabled = !this.redoStack.length;
  }

  afterChange() {
    this.dirty = true;
    this.updateHistoryButtons();
    if (this.printLook) this.renderPrintLook();
  }

  // ---------------------------------------------------------------------------
  // Pointer handling
  // ---------------------------------------------------------------------------
  toCanvas(e) {
    const r = this.stack.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * STUDIO_W / r.width,
      y: (e.clientY - r.top) * STUDIO_H / r.height,
      p: e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.5
    };
  }

  mirrored(pt) {
    return { ...pt, x: STUDIO_W - pt.x };
  }

  onDown(e) {
    if (this.pointerId !== null) return; // ignore a second finger / resting palm
    if (this.printLook) { this.setPrintLook(false); return; }
    e.preventDefault();
    this.pointerId = e.pointerId;
    // Capture keeps the stroke going if the finger slides off the canvas; it can fail
    // (e.g. the pointer already lifted) and must never leave the studio stuck mid-stroke
    try { this.stack.setPointerCapture(e.pointerId); } catch (err) { /* draw without capture */ }
    const pt = this.toCanvas(e);
    this.start = pt;
    this.last = pt;
    this.lastMid = pt;

    switch (this.tool) {
      case 'pencil': case 'brush': case 'rainbow': case 'eraser':
        this.pushHistory();
        this.strokeDot(pt);
        break;
      case 'spray':
        this.pushHistory();
        this.sprayAt = pt;
        this.spray();
        this.sprayTimer = setInterval(() => this.spray(), 30);
        break;
      case 'fill':
        this.doFill(pt);
        this.endPointer();
        break;
      case 'sticker':
        this.pushHistory();
        this.stamp(pt, this.sticker, `${this.currentSize()}px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif`, '#000');
        window.soundEngine.playClick();
        this.afterChange();
        this.endPointer();
        break;
      case 'text': {
        const text = (this.textValue || '').trim();
        if (!text) {
          this.app.showToast('🔤 Type your words first, then tap the canvas');
          const input = document.getElementById('studio-text');
          if (input) input.focus();
        } else {
          this.pushHistory();
          this.stamp(pt, text, `900 ${this.currentSize()}px 'Segoe UI', Roboto, sans-serif`, this.color);
          this.afterChange();
        }
        this.endPointer();
        break;
      }
      // shape: drawn on pointer up, previewed while dragging
    }
  }

  onMove(e) {
    if (e.pointerId !== this.pointerId) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (events.length ? events : [e])) {
      const pt = this.toCanvas(ev);
      if (['pencil', 'brush', 'rainbow', 'eraser'].includes(this.tool)) this.strokeTo(pt);
      else if (this.tool === 'spray') this.sprayAt = pt;
      else if (this.tool === 'shape') this.previewShape(this.start, pt);
    }
  }

  onUp(e) {
    if (e.pointerId !== this.pointerId) return;
    if (this.tool === 'shape') {
      const end = this.toCanvas(e);
      this.octx.clearRect(0, 0, STUDIO_W, STUDIO_H);
      if (Math.hypot(end.x - this.start.x, end.y - this.start.y) > 6) {
        this.pushHistory();
        this.drawShape(this.pctx, this.start, end);
        if (this.mirror) this.drawShape(this.pctx, this.mirrored(this.start), this.mirrored(end));
        this.afterChange();
      }
    } else if (['pencil', 'brush', 'rainbow', 'eraser', 'spray'].includes(this.tool)) {
      this.afterChange();
    }
    this.endPointer();
  }

  endPointer() {
    clearInterval(this.sprayTimer);
    this.pointerId = null;
  }

  // ---------------------------------------------------------------------------
  // Drawing tools
  // ---------------------------------------------------------------------------
  strokeStyle(ctx, pt) {
    const base = this.currentSize();
    ctx.lineWidth = this.tool === 'pencil' ? base : base * (0.6 + pt.p * 0.8);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = this.tool === 'eraser' ? 'destination-out' : 'source-over';
    if (this.tool === 'rainbow') {
      this.hue = (this.hue + 4) % 360;
      ctx.strokeStyle = ctx.fillStyle = `hsl(${this.hue}, 90%, 50%)`;
    } else {
      ctx.strokeStyle = ctx.fillStyle = this.color;
    }
  }

  strokeDot(pt) {
    const ctx = this.pctx;
    const pts = this.mirror ? [pt, this.mirrored(pt)] : [pt];
    for (const p of pts) {
      this.strokeStyle(ctx, p);
      ctx.beginPath();
      ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // Smooth strokes: quadratic curves through the midpoints of successive points
  strokeTo(pt) {
    const mid = { x: (this.last.x + pt.x) / 2, y: (this.last.y + pt.y) / 2, p: pt.p };
    const segs = [[this.lastMid, this.last, mid]];
    if (this.mirror) segs.push([this.mirrored(this.lastMid), this.mirrored(this.last), this.mirrored(mid)]);
    const ctx = this.pctx;
    for (const [a, c, b] of segs) {
      this.strokeStyle(ctx, pt);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(c.x, c.y, b.x, b.y);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    this.last = pt;
    this.lastMid = mid;
  }

  spray() {
    const ctx = this.pctx;
    const r = this.currentSize() / 2;
    ctx.fillStyle = this.color;
    const centres = this.mirror ? [this.sprayAt, this.mirrored(this.sprayAt)] : [this.sprayAt];
    for (const c of centres) {
      for (let i = 0; i < r * 0.7; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * r;
        ctx.fillRect(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d, 2.2, 2.2);
      }
    }
  }

  stamp(pt, text, font, color) {
    const ctx = this.pctx;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(text, pt.x, pt.y);
    if (this.mirror) ctx.fillText(text, STUDIO_W - pt.x, pt.y);
  }

  previewShape(a, b) {
    this.octx.clearRect(0, 0, STUDIO_W, STUDIO_H);
    this.drawShape(this.octx, a, b);
    if (this.mirror) this.drawShape(this.octx, this.mirrored(a), this.mirrored(b));
  }

  drawShape(ctx, a, b) {
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
    const w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
    const cx = x + w / 2, cy = y + h / 2;
    ctx.save();
    ctx.lineWidth = this.currentSize();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ctx.fillStyle = this.color;
    ctx.beginPath();
    switch (this.shape) {
      case 'line':
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        break;
      case 'rect':
        ctx.rect(x, y, w, h);
        break;
      case 'ellipse':
        ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
        break;
      case 'triangle':
        ctx.moveTo(cx, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath();
        break;
      case 'star':
        for (let i = 0; i < 10; i++) {
          const ang = -Math.PI / 2 + i * Math.PI / 5;
          const rx = (i % 2 ? 0.45 : 1) * w / 2, ry = (i % 2 ? 0.45 : 1) * h / 2;
          ctx.lineTo(cx + rx * Math.cos(ang), cy + ry * Math.sin(ang));
        }
        ctx.closePath();
        break;
      case 'heart':
        ctx.moveTo(cx, y + h * 0.3);
        ctx.bezierCurveTo(cx, y, x, y, x, y + h * 0.3);
        ctx.bezierCurveTo(x, y + h * 0.6, cx, y + h * 0.8, cx, y + h);
        ctx.bezierCurveTo(cx, y + h * 0.8, x + w, y + h * 0.6, x + w, y + h * 0.3);
        ctx.bezierCurveTo(x + w, y, cx, y, cx, y + h * 0.3);
        break;
    }
    if (this.shapeFilled && this.shape !== 'line') ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Paint-bucket: region is found on paint + colouring-page lines, colour goes on the paint layer
  doFill(pt) {
    const points = this.mirror ? [pt, this.mirrored(pt)] : [pt];
    let changed = false;
    for (const p of points) {
      // Tapping right on a colouring-page outline would only "fill" the line itself (invisible)
      const onLine = this.lctx.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data[3] > 100;
      if (onLine) {
        if (p === pt) this.app.showToast('🪣 Tap a little inside the shape, not on the line');
        continue;
      }
      const comp = this.composite().getContext('2d').getImageData(0, 0, STUDIO_W, STUDIO_H);
      const mask = this.floodMask(comp, Math.floor(p.x), Math.floor(p.y));
      if (!mask) continue;
      if (!changed) this.pushHistory();
      changed = true;
      const img = this.pctx.getImageData(0, 0, STUDIO_W, STUDIO_H);
      const [r, g, b] = this.hexToRgb(this.color);
      const d = img.data;
      for (let i = 0; i < mask.length; i++) {
        if (!mask[i]) continue;
        d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = 255;
      }
      this.pctx.putImageData(img, 0, 0);
    }
    if (changed) {
      window.soundEngine.playClick();
      this.afterChange();
    }
  }

  floodMask(imgData, sx, sy) {
    const W = STUDIO_W, H = STUDIO_H, d = imgData.data;
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) return null;
    const s = (sy * W + sx) * 4;
    const tr = d[s], tg = d[s + 1], tb = d[s + 2];
    const [fr, fg, fb] = this.hexToRgb(this.color);
    if (Math.abs(tr - fr) + Math.abs(tg - fg) + Math.abs(tb - fb) < 10) return null; // already that colour
    const TOL = 60;
    const match = (i) => {
      const p = i * 4;
      return Math.abs(d[p] - tr) + Math.abs(d[p + 1] - tg) + Math.abs(d[p + 2] - tb) <= TOL;
    };
    const mask = new Uint8Array(W * H);
    const stack = [sx, sy];
    while (stack.length) {
      const y = stack.pop();
      let x = stack.pop();
      let i = y * W + x;
      while (x >= 0 && !mask[i] && match(i)) { x--; i--; }
      x++; i++;
      let up = false, down = false;
      while (x < W && !mask[i] && match(i)) {
        mask[i] = 1;
        if (y > 0) {
          const j = i - W;
          if (!mask[j] && match(j)) { if (!up) { stack.push(x, y - 1); up = true; } } else up = false;
        }
        if (y < H - 1) {
          const j = i + W;
          if (!mask[j] && match(j)) { if (!down) { stack.push(x, y + 1); down = true; } } else down = false;
        }
        x++; i++;
      }
    }
    // Grow by 1px so the fill tucks under anti-aliased edges (no white halo)
    const grown = mask.slice();
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if (mask[i]) continue;
        if (mask[i - 1] || mask[i + 1] || mask[i - W] || mask[i + W]) grown[i] = 1;
      }
    }
    return grown;
  }

  hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // ---------------------------------------------------------------------------
  // Colouring pages
  // ---------------------------------------------------------------------------
  async choosePage(id) {
    if (this.dirty && !confirm('Start a new page? Your current drawing will be cleared.')) return;
    this.$('modal-studio-pages').classList.remove('open');
    this.reset();
    this.pageId = id;
    const page = STUDIO_PAGES.find(p => p.id === id);
    if (page.svg) {
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SVG_HEAD + page.svg + '</svg>');
      await img.decode();
      this.lctx.drawImage(img, 0, 0, STUDIO_W, STUDIO_H);
    } else if (page.image) {
      const img = new Image();
      img.src = page.image;
      await img.decode();
      // Turn the colour logo into black outlines with a transparent background
      const size = 520;
      const tmp = document.createElement('canvas');
      tmp.width = tmp.height = size;
      const t = tmp.getContext('2d');
      t.drawImage(img, 0, 0, size, size);
      const data = t.getImageData(0, 0, size, size);
      const p = data.data;
      for (let i = 0; i < p.length; i += 4) {
        const ink = p[i + 1] < 150; // yellow paper has high green; red & black ink do not
        p[i] = p[i + 1] = p[i + 2] = 0;
        p[i + 3] = ink ? 255 : 0;
      }
      t.putImageData(data, 0, 0);
      this.lctx.drawImage(tmp, (STUDIO_W - size) / 2, (STUDIO_H - size) / 2);
    }
    if (id !== 'blank') {
      this.selectTool('fill');
      this.app.showToast('🪣 Tap inside the shapes to colour them in!');
    }
  }

  // ---------------------------------------------------------------------------
  // Output: composite, print look, finish, print, save
  // ---------------------------------------------------------------------------
  composite() {
    const c = document.createElement('canvas');
    c.width = STUDIO_W;
    c.height = STUDIO_H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, STUDIO_W, STUDIO_H);
    ctx.drawImage(this.paint, 0, 0);
    ctx.drawImage(this.lines, 0, 0);
    return c;
  }

  thermal() {
    return window.printerController.renderThermal(this.composite(), { maxHeight: 512, gamma: STUDIO_PRINT_GAMMA, method: this.printMethod() });
  }

  // 'shade' = colours become dot patterns; 'bold' = every non-white mark prints solid black
  printMethod() {
    return this.printStyle === 'bold' ? 'bold' : 'bayer';
  }

  setPrintStyle(style) {
    this.printStyle = style;
    document.querySelectorAll('[data-print-style]').forEach(b => b.classList.toggle('active', b.dataset.printStyle === style));
    this.renderFinishPreview();
    if (this.printLook) this.renderPrintLook();
  }

  renderFinishPreview() {
    const { canvas } = this.thermal();
    const prev = this.$('studio-finish-preview');
    prev.width = canvas.width;
    prev.height = canvas.height;
    prev.getContext('2d').drawImage(canvas, 0, 0);
  }

  setPrintLook(on) {
    this.printLook = on;
    this.$('studio-look').classList.toggle('active', on);
    this.preview.style.display = on ? 'block' : 'none';
    if (on) {
      this.renderPrintLook();
      this.app.showToast('👁️ This is how it will print. Tap the drawing to keep going.');
    }
  }

  renderPrintLook() {
    const { canvas } = this.thermal();
    this.preview.width = canvas.width;
    this.preview.height = canvas.height;
    this.preview.getContext('2d').drawImage(canvas, 0, 0);
  }

  openFinish() {
    if (!this.dirty && this.pageId === 'blank') {
      this.app.showToast('🎨 Draw something first!');
      return;
    }
    this.renderFinishPreview();
    const nameInput = this.$('studio-artist');
    if (!nameInput.value) nameInput.value = this.app.playerName || '';
    this.$('studio-print-status').textContent = '';
    this.$('modal-studio-finish').classList.add('open');
  }

  artistName() {
    return this.$('studio-artist').value.trim() || 'A Little Genius';
  }

  async printDrawing() {
    const status = this.$('studio-print-status');
    const printer = window.printerController;
    if (printer.busy) {
      status.textContent = 'Still printing the last one. Please wait…';
      return;
    }
    if (!printer.isConnected) {
      status.textContent = 'Connecting to the printer…';
      const ok = await printer.connect();
      if (!ok) {
        status.textContent = 'Could not connect to the POS-58 printer. You can save the picture or use a normal printer instead.';
        return;
      }
    }
    const btn = this.$('studio-print');
    btn.disabled = true;
    status.textContent = 'Printing… 0%';
    const ok = await printer.printDrawing({
      artist: this.artistName(),
      title: this.$('studio-title').value.trim(),
      dateStr: new Date().toLocaleDateString(),
      source: this.composite(),
      gamma: STUDIO_PRINT_GAMMA,
      method: this.printMethod()
    }, (p) => { status.textContent = `Printing… ${Math.round(p * 100)}%`; });
    btn.disabled = false;
    if (ok) {
      status.textContent = '🎉 Printed! Tear off your masterpiece.';
      window.confettiEngine.burst();
    } else {
      status.textContent = printer.failMessage();
    }
  }

  savePicture() {
    const c = this.composite();
    const safe = this.artistName().replace(/[^a-z0-9]+/gi, '_');
    c.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Doodle_${safe}_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      this.$('studio-print-status').textContent = '💾 Picture saved to Downloads.';
    }, 'image/png');
  }

  browserPrint() {
    this.$('drawing-slip-img').src = this.thermal().canvas.toDataURL('image/png');
    const title = this.$('studio-title').value.trim();
    this.$('drawing-slip-title').textContent = title ? `"${title}"` : '';
    this.$('drawing-slip-artist').textContent = `by ${this.artistName()}`;
    this.$('drawing-slip-date').textContent = new Date().toLocaleDateString();
    document.body.classList.add('print-drawing');
    const done = () => { document.body.classList.remove('print-drawing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => window.print(), 100);
  }
}
