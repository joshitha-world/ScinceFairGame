// Word Quest printables, drawn at the POS-58's exact width (384 dots = 48 mm of print).
// Daily worksheets differ by age group: tracing and picture puzzles for KG, word searches,
// synonyms and sentence writing for older learners. Stickers are round, with a dashed cut line.

const WQ_PRINT_W = 384;
const WQ_FONT = '"Segoe UI", Roboto, "Noto Sans", Arial, sans-serif, "Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji"';
const WQ_MONO = '"Courier New", Consolas, monospace';

// Small seeded random generator so a worksheet reprints exactly the same
function wqRng(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wqShuffle(list, rng = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Word search: words go across, down (and diagonally for older learners)
function wqWordSearch(words, size, rng, diagonal) {
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const dirs = [[1, 0], [0, 1]];
  if (diagonal) dirs.push([1, 1]);
  const placed = [];
  words.map(w => w.toUpperCase()).filter(w => w.length <= size && /^[A-Z]+$/.test(w)).forEach(word => {
    for (let tries = 0; tries < 300; tries++) {
      const [dx, dy] = dirs[Math.floor(rng() * dirs.length)];
      // Start anywhere the whole word still fits: rows/columns 0 … size-1 (size - length when it runs that way)
      const x0 = Math.floor(rng() * (size - (dx ? word.length : 1) + 1));
      const y0 = Math.floor(rng() * (size - (dy ? word.length : 1) + 1));
      let ok = true;
      for (let i = 0; i < word.length && ok; i++) {
        const c = grid[y0 + dy * i][x0 + dx * i];
        ok = !c || c === word[i];
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) grid[y0 + dy * i][x0 + dx * i] = word[i];
      placed.push(word);
      return;
    }
  });
  const letters = 'ABCDEFGHIJKLMNOPRSTUWY';
  for (const row of grid) for (let x = 0; x < size; x++) if (!row[x]) row[x] = letters[Math.floor(rng() * letters.length)];
  return { grid, placed };
}

class WQCanvas {
  constructor(height = 2400) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = WQ_PRINT_W;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, WQ_PRINT_W, height);
    this.y = 0;
    this.m = 14; // side margin
  }

  font(size, weight = 700, family = WQ_FONT, style = '') {
    this.ctx.font = `${style} ${weight} ${size}px ${family}`.trim();
  }

  text(str, x, y, { size = 18, weight = 700, align = 'left', color = '#000', family, style, baseline = 'alphabetic' } = {}) {
    this.font(size, weight, family, style);
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.fillText(str, x, y);
  }

  // Shrink a single line until it fits maxW
  fitText(str, x, y, maxW, opts) {
    let size = opts.size;
    this.font(size, opts.weight, opts.family);
    while (size > 10 && this.ctx.measureText(str).width > maxW) {
      size -= 1;
      this.font(size, opts.weight, opts.family);
    }
    this.text(str, x, y, { ...opts, size });
    return size;
  }

  wrap(str, maxW, size, weight = 700, style = '') {
    this.font(size, weight, WQ_FONT, style);
    const words = String(str).split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach(w => {
      const test = line ? `${line} ${w}` : w;
      if (this.ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  paragraph(str, { size = 17, weight = 600, align = 'center', style = '', gap = 4 } = {}) {
    const lines = this.wrap(str, WQ_PRINT_W - this.m * 2, size, weight, style);
    const x = align === 'center' ? WQ_PRINT_W / 2 : this.m;
    lines.forEach(line => {
      this.y += size + gap;
      this.text(line, x, this.y, { size, weight, align, style });
    });
    this.y += 4;
  }

  gap(n) {
    this.y += n;
  }

  dashedLine(y, { dash = [6, 5], width = 2 } = {}) {
    const c = this.ctx;
    c.save();
    c.strokeStyle = '#000';
    c.lineWidth = width;
    c.setLineDash(dash);
    c.beginPath();
    c.moveTo(this.m, y);
    c.lineTo(WQ_PRINT_W - this.m, y);
    c.stroke();
    c.restore();
  }

  // Black pill heading, e.g. "WORD SEARCH"
  heading(label) {
    this.y += 14;
    const c = this.ctx;
    this.font(15, 900);
    const w = c.measureText(label).width + 26;
    c.fillStyle = '#000';
    this.roundRect(this.m, this.y, w, 26, 13);
    c.fill();
    this.text(label, this.m + 13, this.y + 18.5, { size: 15, weight: 900, color: '#fff' });
    this.y += 26;
  }

  roundRect(x, y, w, h, r) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  box(h, label) {
    this.y += 8;
    const c = this.ctx;
    c.save();
    c.strokeStyle = '#000';
    c.lineWidth = 2.5;
    this.roundRect(this.m, this.y, WQ_PRINT_W - this.m * 2, h, 14);
    c.stroke();
    c.restore();
    if (label) this.text(label, WQ_PRINT_W / 2, this.y + h - 10, { size: 12, weight: 600, align: 'center', color: '#555' });
    this.y += h;
  }

  // Handwriting lines: solid baseline, dashed midline (like a school copybook)
  writingLine(guide = '', { height = 46, dotted = false } = {}) {
    this.y += 10;
    const c = this.ctx;
    const top = this.y;
    const base = top + height;
    c.save();
    c.strokeStyle = '#000';
    c.lineWidth = 1;
    c.setLineDash([2, 4]);
    c.beginPath();
    c.moveTo(this.m, top + height * 0.45);
    c.lineTo(WQ_PRINT_W - this.m, top + height * 0.45);
    c.stroke();
    c.setLineDash([]);
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(this.m, base);
    c.lineTo(WQ_PRINT_W - this.m, base);
    c.stroke();
    if (guide) {
      this.font(height * 0.95, 500);
      c.textAlign = 'left';
      c.textBaseline = 'alphabetic';
      if (dotted) {
        this.font(height * 0.95, 400);
        c.lineWidth = 2.2;
        c.setLineDash([4, 3.5]);
        c.strokeText(guide, this.m + 6, base - 2);
      } else {
        c.fillStyle = '#000';
        c.fillText(guide, this.m + 6, base - 2);
      }
    }
    c.restore();
    this.y = base;
  }

  star(cx, cy, r, filled) {
    const c = this.ctx;
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.45 : r;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      c.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a));
    }
    c.closePath();
    c.lineWidth = 2;
    c.strokeStyle = '#000';
    c.fillStyle = '#000';
    if (filled) c.fill();
    else c.stroke();
  }

  checkbox(x, y, size = 18) {
    const c = this.ctx;
    c.lineWidth = 2;
    c.strokeStyle = '#000';
    c.strokeRect(x, y - size + 3, size, size);
  }

  // Tiny answers printed upside down, so children can check after trying
  upsideDown(str) {
    this.y += 24;
    const c = this.ctx;
    c.save();
    c.translate(WQ_PRINT_W / 2, this.y);
    c.rotate(Math.PI);
    this.text(str, 0, 0, { size: 13, weight: 600, align: 'center' });
    c.restore();
    this.y += 4;
  }

  scissorLine() {
    this.y += 18;
    this.dashedLine(this.y, { dash: [4, 6], width: 1.5 });
    this.text('✂', this.m - 2, this.y + 6, { size: 16, weight: 400 });
    this.y += 10;
  }

  finish() {
    const h = Math.ceil(this.y + 12);
    const out = document.createElement('canvas');
    out.width = WQ_PRINT_W;
    out.height = h;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, WQ_PRINT_W, h);
    ctx.drawImage(this.canvas, 0, 0);
    return out;
  }
}

const WQPrint = {
  header(pc, left, right) {
    const c = pc.ctx;
    c.fillStyle = '#000';
    pc.roundRect(pc.m, 8, WQ_PRINT_W - pc.m * 2, 44, 12);
    c.fill();
    pc.text(left, pc.m + 14, 38, { size: 21, weight: 900, color: '#fff' });
    pc.text(right, WQ_PRINT_W - pc.m - 14, 38, { size: 19, weight: 900, color: '#fff', align: 'right' });
    pc.y = 52;
  },

  // A daily worksheet. info = { word, track, dayName, dateLabel, weekNo, theme, learner, weekWords, prevWord, seed }
  worksheet(info) {
    const { word, track } = info;
    const pc = new WQCanvas();
    const rng = wqRng(info.seed);
    const mid = WQ_PRINT_W / 2;
    const tiny = track.id === 'tiny';
    const pool = track.allWords.filter(w => w.w !== word.w);

    this.header(pc, 'WORD QUEST', `DAY ${word.day + 1}`);
    pc.gap(26);
    pc.text(`${info.dayName} · ${info.dateLabel}`, mid, pc.y, { size: 19, weight: 800, align: 'center' });
    pc.gap(20);
    pc.fitText(`${info.learner} · ${track.label} · Week ${info.weekNo}: ${info.theme}`, mid, pc.y, WQ_PRINT_W - 28, { size: 14, weight: 600, align: 'center' });

    // The word itself
    pc.gap(tiny ? 104 : 86);
    pc.text(word.e, mid, pc.y, { size: tiny ? 92 : 72, weight: 400, align: 'center' });
    pc.gap(tiny ? 72 : 58);
    pc.fitText(tiny ? word.w : word.w, mid, pc.y, WQ_PRINT_W - 28, { size: tiny ? 72 : 52, weight: 900, align: 'center' });
    if (word.pos) {
      pc.gap(24);
      pc.text(word.pos, mid, pc.y, { size: 16, weight: 600, align: 'center', style: 'italic' });
    }
    pc.gap(4);
    pc.paragraph(word.m, { size: 18, weight: 700 });
    pc.paragraph(`“${word.s}”`, { size: 16, weight: 500, style: 'italic' });
    if (!tiny && (word.syn || word.ant) && track.id === 'sprout') {
      pc.paragraph([word.syn && `Same: ${word.syn}`, word.ant && `Opposite: ${word.ant}`].filter(Boolean).join('   ·   '), { size: 15, weight: 700 });
    }

    const answers = [];
    if (tiny) this.tinyPuzzles(pc, word, pool, rng);
    else if (track.id === 'sprout') this.sproutPuzzles(pc, info, rng);
    else this.olderPuzzles(pc, info, pool, rng, answers);

    // Footer: colour-in stars and a tick for a grown-up
    pc.gap(30);
    pc.text('Colour a star for each puzzle:', pc.m, pc.y, { size: 15, weight: 700 });
    [0, 1, 2].forEach(i => pc.star(WQ_PRINT_W - pc.m - 16 - i * 34, pc.y - 6, 13, false));
    pc.gap(32);
    pc.checkbox(pc.m, pc.y);
    pc.text('I did it!', pc.m + 26, pc.y, { size: 16, weight: 800 });
    pc.text('Grown-up: ___________', WQ_PRINT_W - pc.m, pc.y, { size: 15, weight: 600, align: 'right' });
    if (answers.length) pc.upsideDown(`Answers: ${answers.join(' · ')}`);
    pc.scissorLine();
    return pc.finish();
  },

  tinyPuzzles(pc, word, pool, rng) {
    const mid = WQ_PRINT_W / 2;
    pc.heading('TRACE IT, THEN WRITE IT');
    pc.writingLine(word.w, { height: 58, dotted: true });
    pc.writingLine(word.w, { height: 58, dotted: true });
    pc.writingLine('', { height: 58 });

    const first = word.w[0];
    const others = wqShuffle(pool.filter(w => w.w[0] !== first && w.e !== word.e), rng).slice(0, 2);
    const pics = wqShuffle([word, ...others], rng);
    pc.heading(`CIRCLE THE ONE THAT STARTS WITH  ${first}`);
    pc.gap(72);
    pics.forEach((p, i) => pc.text(p.e, mid + (i - 1) * 118, pc.y, { size: 62, weight: 400, align: 'center' }));
    pc.gap(8);

    pc.heading('DRAW IT!');
    pc.box(150);
  },

  sproutPuzzles(pc, info, rng) {
    const { word } = info;
    pc.heading('WRITE IT 3 TIMES');
    pc.writingLine(word.w, { height: 44, dotted: true });
    pc.writingLine('', { height: 44 });
    pc.writingLine('', { height: 44 });
    this.wordSearch(pc, info.weekWords.map(w => w.w), 8, rng, false);
    pc.heading('DRAW IT!');
    pc.box(120);
  },

  olderPuzzles(pc, info, pool, rng, answers) {
    const { word, track } = info;
    const champion = track.id === 'champion';

    // Review yesterday's word (spaced repetition), with the first letter as a hint
    if (info.prevWord) {
      const p = info.prevWord;
      pc.heading('REMEMBER YESTERDAY\'S WORD?');
      const blank = p.s.replace(new RegExp(`\\b${p.w}\\b`, 'i'), `${p.w[0]}${' _'.repeat(p.w.length - 1)}`);
      pc.paragraph(blank, { size: 17, weight: 600, align: 'left' });
      answers.push(p.w);
    }

    this.wordSearch(pc, info.weekWords.map(w => w.w), champion ? 12 : 10, rng, track.id !== 'explorer');

    if (word.syn) {
      const others = wqShuffle(pool.filter(w => w.w !== word.syn && w.w !== word.ant), rng).slice(0, 2).map(w => w.w);
      const choices = wqShuffle([word.syn, ...others], rng);
      pc.heading('SAME MEANING');
      pc.paragraph(`Circle the word that means the same as “${word.w}”:`, { size: 16, weight: 600, align: 'left' });
      pc.paragraph(choices.join('   ·   '), { size: 19, weight: 800 });
      answers.push(word.syn);
    }
    if (word.ant) {
      pc.heading('OPPOSITE');
      pc.paragraph(`The opposite of “${word.w}” is  ${word.ant[0]}${' _'.repeat(Math.max(1, word.ant.length - 1))}`, { size: 16, weight: 600, align: 'left' });
      answers.push(word.ant);
    }

    pc.heading('MY OWN SENTENCE');
    pc.writingLine('', { height: 34 });
    pc.writingLine('', { height: 34 });
    if (track.id !== 'explorer') pc.writingLine('', { height: 34 });
  },

  wordSearch(pc, words, size, rng, diagonal) {
    const { grid, placed } = wqWordSearch(words, size, rng, diagonal);
    if (!placed.length) return;
    pc.heading(`WORD SEARCH · FIND ${placed.length === 1 ? 'TODAY\'S WORD' : `${placed.length} WORDS`}`);
    const cell = Math.floor((WQ_PRINT_W - pc.m * 2 - 20) / size);
    const left = (WQ_PRINT_W - cell * size) / 2;
    const top = pc.y + 10;
    grid.forEach((row, y) => row.forEach((ch, x) => {
      pc.text(ch, left + x * cell + cell / 2, top + y * cell + cell * 0.74, { size: Math.round(cell * 0.6), weight: 800, align: 'center' });
    }));
    pc.ctx.lineWidth = 2;
    pc.ctx.strokeStyle = '#000';
    pc.roundRect(left - 6, top - 4, cell * size + 12, cell * size + 8, 10);
    pc.ctx.stroke();
    pc.y = top + cell * size + 6;
    pc.paragraph(placed.join('  ·  '), { size: 15, weight: 800 });
  },

  // Round sticker with a dashed cut line. s = { icon, top, title, tier (0 = special), name, dateLabel, sub }
  sticker(s) {
    const pc = new WQCanvas(470);
    const c = pc.ctx;
    const cx = WQ_PRINT_W / 2;
    const cy = 186;

    c.save();
    c.strokeStyle = '#000';
    c.setLineDash([5, 6]);
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(cx, cy, 180, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);
    c.lineWidth = 5;
    c.beginPath();
    c.arc(cx, cy, 168, 0, Math.PI * 2);
    c.stroke();
    if (s.tier !== 1) {
      c.lineWidth = 2;
      c.beginPath();
      c.arc(cx, cy, 158, 0, Math.PI * 2);
      c.stroke();
    }
    if (s.tier === 3 || s.tier === 0) {
      c.lineWidth = 2;
      c.setLineDash([2, 5]);
      c.beginPath();
      c.arc(cx, cy, 150, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();

    this.arcText(pc, s.top, cx, cy, 128, 20);
    pc.text(s.icon, cx, cy + 34, { size: 112, weight: 400, align: 'center' });
    pc.fitText(s.title.toUpperCase(), cx, cy + 86, 232, { size: 24, weight: 900, align: 'center' });
    if (s.tier) {
      [0, 1, 2].forEach(i => pc.star(cx + (i - 1) * 36, cy + 118, 14, i < s.tier));
    } else {
      pc.text('★ SPECIAL ★', cx, cy + 124, { size: 17, weight: 900, align: 'center' });
    }

    pc.y = 400;
    pc.text(s.name, cx, pc.y, { size: 18, weight: 800, align: 'center' });
    pc.y += 24;
    pc.text(`${s.sub} · ${s.dateLabel}`, cx, pc.y, { size: 14, weight: 600, align: 'center' });
    pc.scissorLine();
    return pc.finish();
  },

  // Letters spaced around the top of the circle
  arcText(pc, str, cx, cy, r, size) {
    const c = pc.ctx;
    pc.font(size, 900);
    c.fillStyle = '#000';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const letters = str.split('');
    const step = (size * 0.9) / r;
    const start = -Math.PI / 2 - (step * (letters.length - 1)) / 2;
    letters.forEach((ch, i) => {
      const a = start + i * step;
      c.save();
      c.translate(cx + r * Math.cos(a), cy + r * Math.sin(a));
      c.rotate(a + Math.PI / 2);
      c.fillText(ch, 0, 0);
      c.restore();
    });
  },

  // Learner card with the backup code, to keep safely in the notebook
  learnerCard({ name, avatar, trackLabel, code }) {
    const pc = new WQCanvas(520);
    const mid = WQ_PRINT_W / 2;
    this.header(pc, 'WORD QUEST', 'LEARNER CARD');
    pc.gap(86);
    pc.text(avatar, mid, pc.y, { size: 64, weight: 400, align: 'center' });
    pc.gap(42);
    pc.fitText(name, mid, pc.y, WQ_PRINT_W - 28, { size: 32, weight: 900, align: 'center' });
    pc.gap(24);
    pc.text(trackLabel, mid, pc.y, { size: 16, weight: 700, align: 'center' });
    if (code) {
      pc.heading('BACKUP CODE');
      pc.gap(36);
      pc.fitText(code, mid, pc.y, WQ_PRINT_W - 28, { size: 30, weight: 900, align: 'center', family: WQ_MONO });
      pc.gap(6);
      pc.paragraph('Use this code to sign in on a new device if your passkey is not there. Keep it safe and secret!', { size: 14, weight: 600 });
    }
    pc.gap(8);
    pc.paragraph('A new word every school day. A quiz and a sticker every weekend!', { size: 14, weight: 700 });
    pc.scissorLine();
    return pc.finish();
  }
};
