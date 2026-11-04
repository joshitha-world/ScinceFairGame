// Word Quest: a personal daily vocabulary journey.
//   Monday–Friday: one new word a day. Learn it (with sound), solve 3 quick puzzles,
//                  write your own sentence, then print a worksheet to solve and stick in a notebook.
//   Weekend:       a calm quiz on the week's 5 words (plus review words) wins that week's sticker,
//                  Bronze, Silver or Gold. Stickers print on the thermal printer, ready to cut out.
// Five age tracks, from KG (two- and three-letter words) to grown-ups.

const WQ_GAMMA = 1.15;
const WQ_QUIZ_LEN = { tiny: 8 };
const WQ_LESSON_TYPES = {
  tiny: ['picture', 'first', 'spell'],
  sprout: ['meaning', 'blank', 'spell']
};
const WQ_QUIZ_TYPES = {
  tiny: ['picture', 'first', 'rhyme', 'spell'],
  sprout: ['meaning', 'blank', 'spell', 'reverse', 'antonym'],
  older: ['meaning', 'blank', 'reverse', 'synonym', 'antonym', 'spell']
};
const WQ_PRAISE = ['Brilliant!', 'Super!', 'You got it!', 'Fantastic!', 'Well done!', 'Awesome!'];

const wqEsc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wqPick = (list, rng = Math.random) => list[Math.floor(rng() * list.length)];

// ---------------------------------------------------------------------------
// Dates: weeks start on Monday; keys are local YYYY-MM-DD
// ---------------------------------------------------------------------------
const WQDate = {
  key(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },
  parse(k) {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d);
  },
  dow(d) {
    return (d.getDay() + 6) % 7; // 0 = Monday … 6 = Sunday
  },
  addDays(k, n) {
    const d = this.parse(k);
    d.setDate(d.getDate() + n);
    return this.key(d);
  },
  monday(k) {
    return this.addDays(k, -this.dow(this.parse(k)));
  },
  weeksBetween(a, b) {
    return Math.round((this.parse(this.monday(b)) - this.parse(this.monday(a))) / (7 * 864e5));
  },
  label(k) {
    return this.parse(k).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  },
  // Previous school day (Friday before a Monday)
  prevWeekday(k) {
    let p = this.addDays(k, -1);
    while (this.dow(this.parse(p)) > 4) p = this.addDays(p, -1);
    return p;
  }
};

// Streaks, counts and the facts the special stickers need
function wqStats(progress, todayKey) {
  const days = progress.days;
  const keys = Object.keys(days).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  keys.forEach(k => {
    if (WQDate.dow(WQDate.parse(k)) > 4) return;
    run = prev && WQDate.prevWeekday(k) === prev ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  });

  // Current streak: count back from today (or the last school day if today isn't done yet)
  let k = todayKey;
  if (WQDate.dow(WQDate.parse(k)) > 4 || !days[k]) k = WQDate.prevWeekday(k);
  let current = 0;
  while (days[k]) {
    current++;
    k = WQDate.prevWeekday(k);
  }

  const quizzes = Object.entries(progress.quizzes);
  return {
    words: keys.length,
    streak: current,
    bestStreak: best,
    sentences: keys.filter(x => days[x].sentence).length,
    printed: keys.filter(x => days[x].printed > 0).length,
    earlyBird: keys.some(x => days[x].at && new Date(days[x].at).getHours() < 8),
    golds: quizzes.filter(([, q]) => q.tier === 3).length,
    perfectWeeks: quizzes.filter(([m]) => [0, 1, 2, 3, 4].every(i => days[WQDate.addDays(m, i)])).length,
    stickers: Object.keys(progress.stickers).length
  };
}

// Text-to-speech, so even pre-readers can hear every word and sentence
const WQVoice = {
  voice: null,
  pick() {
    if (!('speechSynthesis' in window)) return null;
    const voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
    this.voice = voices.find(v => /en[-_]IN/i.test(v.lang)) || voices.find(v => /en[-_]GB/i.test(v.lang)) || voices[0] || null;
    return this.voice;
  },
  say(text, rate = 0.85) {
    if (!('speechSynthesis' in window) || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = this.voice || this.pick();
    if (v) u.voice = v;
    u.lang = v ? v.lang : 'en-IN';
    u.rate = rate;
    speechSynthesis.speak(u);
  }
};
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => WQVoice.pick();

// ---------------------------------------------------------------------------
// Puzzles: built from the word data, so every word gets every kind of puzzle
// ---------------------------------------------------------------------------
const WQPuzzles = {
  // Wrong answers: this week's other words first (the useful kind of tricky), then the rest
  distractors(word, track, n, pick, rng, avoid = []) {
    const seen = new Set([pick(word), ...avoid].filter(Boolean).map(v => v.toLowerCase()));
    const week = track.weeks[word.week].words;
    const pool = [...wqShuffle(week, rng), ...wqShuffle(track.allWords, rng)];
    const out = [];
    for (const w of pool) {
      if (w.w === word.w) continue;
      const v = pick(w);
      if (!v || seen.has(v.toLowerCase())) continue;
      seen.add(v.toLowerCase());
      out.push(v);
      if (out.length === n) break;
    }
    return out;
  },

  choice(answer, wrong, rng) {
    return wqShuffle([answer, ...wrong], rng).map(v => ({ label: v, value: v }));
  },

  make(type, word, track, rng) {
    const n = track.id === 'tiny' || track.id === 'sprout' ? 2 : 3;
    const W = wqEsc(word.w);
    if (type === 'synonym' && !word.syn) type = word.ant ? 'antonym' : 'reverse';
    if (type === 'antonym' && !word.ant) type = word.syn ? 'synonym' : 'reverse';
    if (type === 'rhyme' && !word.rhyme) type = 'picture';

    switch (type) {
      case 'picture':
        return {
          type, tag: 'Find the picture', say: word.w, layout: 'pics',
          prompt: `<div class="wq-q-word">${W}</div><div class="wq-q-ask">Which picture is “${W}”?</div>`,
          options: this.choice(word.e, this.distractors(word, track, 2, w => w.e, rng), rng),
          answer: word.e, explain: `${word.e} = ${word.w}`
        };
      case 'first': {
        const first = word.w[0];
        const letters = wqShuffle('abcdefghijklmnoprstuw'.split('').filter(c => !word.w.includes(c)), rng).slice(0, 2);
        return {
          type, tag: 'First sound', say: word.w, layout: 'letters',
          prompt: `<div class="wq-q-emoji">${word.e}</div><div class="wq-q-word"><span class="wq-gap">?</span>${W.slice(1)}</div><div class="wq-q-ask">“${W}” starts with…</div>`,
          options: this.choice(first, letters, rng), answer: first, explain: `${word.w} starts with “${first}”`
        };
      }
      case 'rhyme': {
        const end = word.rhyme.slice(-2);
        const wrong = this.distractors(word, track, 2, w => (w.w.slice(-2) === end || w.w.slice(-2) === word.w.slice(-2) ? '' : w.w), rng, [word.rhyme]);
        return {
          type, tag: 'Rhyme time', say: word.w, layout: 'letters',
          prompt: `<div class="wq-q-emoji">${word.e}</div><div class="wq-q-ask">Which word rhymes with “${W}”?</div>`,
          options: this.choice(word.rhyme, wrong, rng), answer: word.rhyme, explain: `${word.w} and ${word.rhyme} rhyme!`
        };
      }
      case 'meaning':
        return {
          type, tag: 'What does it mean?', say: word.w, layout: 'text',
          prompt: `${track.id === 'sprout' ? `<div class="wq-q-emoji small">${word.e}</div>` : ''}<div class="wq-q-ask">What does <b>“${W}”</b> mean?</div>`,
          options: this.choice(word.m, this.distractors(word, track, n, w => w.m, rng), rng),
          answer: word.m, explain: `${word.w}: ${word.m}`
        };
      case 'reverse':
        return {
          type, tag: 'Name the word', say: word.m, layout: 'words',
          prompt: `<div class="wq-q-ask">Which word means:</div><div class="wq-q-quote">“${wqEsc(word.m)}”</div>`,
          options: this.choice(word.w, this.distractors(word, track, n, w => w.w, rng), rng),
          answer: word.w, explain: `${word.w}: ${word.m}`
        };
      case 'blank': {
        const gap = word.s.replace(new RegExp(`\\b${word.w}\\b`, 'i'), '_____');
        const samePos = this.distractors(word, track, n, w => (w.pos === word.pos ? w.w : ''), rng);
        const wrong = samePos.length >= n ? samePos : [...samePos, ...this.distractors(word, track, n, w => w.w, rng, samePos)].slice(0, n);
        return {
          type, tag: 'Fill the gap', say: '', layout: 'words',
          prompt: `<div class="wq-q-ask">Which word fits?</div><div class="wq-q-quote">${wqEsc(gap).replace('_____', '<span class="wq-blank">_____</span>')}</div>`,
          options: this.choice(word.w, wrong, rng), answer: word.w, explain: word.s
        };
      }
      case 'synonym':
        return {
          type, tag: 'Same meaning', say: word.w, layout: 'words',
          prompt: `<div class="wq-q-ask">Which word means almost the same as <b>“${W}”</b>?</div>`,
          options: this.choice(word.syn, this.distractors(word, track, n, w => w.w, rng, [word.ant, word.syn]), rng),
          answer: word.syn, explain: `${word.w} ≈ ${word.syn}`
        };
      case 'antonym':
        return {
          type, tag: 'Opposites', say: word.w, layout: 'words',
          prompt: `<div class="wq-q-ask">Which is the <b>opposite</b> of <b>“${W}”</b>?</div>`,
          options: this.choice(word.ant, this.distractors(word, track, n, w => w.w, rng, [word.syn, word.ant]), rng),
          answer: word.ant, explain: `${word.w} ↔ ${word.ant}`
        };
      case 'spell':
      default:
        return this.spell(word, track, rng);
    }
  },

  // Build the word from letter tiles; long words come with some letters already in place
  spell(word, track, rng) {
    const letters = word.w.split('');
    const blanks = track.id === 'tiny' ? letters.length
      : track.id === 'sprout' ? (letters.length <= 6 ? letters.length : 4)
        : Math.min(letters.length, track.id === 'explorer' ? 4 : 5);
    const hidden = new Set(wqShuffle(letters.map((_, i) => i), rng).slice(0, blanks));
    const decoys = wqShuffle('aeioubcdfghklmnprst'.split('').filter(c => !word.w.includes(c)), rng).slice(0, track.id === 'tiny' ? 1 : 2);
    const tiles = wqShuffle([...letters.filter((_, i) => hidden.has(i)), ...decoys], rng);
    const clue = track.id === 'tiny' || track.id === 'sprout'
      ? `<div class="wq-q-emoji">${word.e}</div><div class="wq-q-ask">Listen, then build the word!</div>`
      : `<div class="wq-q-ask">Spell the word that means:</div><div class="wq-q-quote">“${wqEsc(word.m)}”</div>`;
    return {
      type: 'spell', tag: 'Spell it', say: word.w, prompt: clue, word: word.w,
      slots: letters.map((ch, i) => ({ ch, filled: !hidden.has(i) })),
      tiles: tiles.map(ch => ({ ch, used: false })),
      explain: `${word.w} is spelt ${word.w.toUpperCase().split('').join('-')}`
    };
  }
};

// ---------------------------------------------------------------------------
// The Word Quest screen
// ---------------------------------------------------------------------------
class WordQuest {
  constructor(app) {
    this.app = app;
    this.viewEl = this.$('wq-view');
    this.modal = this.$('modal-wq');
    this.view = 'welcome';
    this.params = {};
    this.draft = null;
    this.play = null;
    this.printJob = null;
    this.returnTo = null;    // 'robo' when Robo Academy borrowed the sign-up / profile screens
    this.modalOwner = null;  // which screen opened the shared modal
    this.store = new WQStore(() => this.renderChrome());
    this.bind();
    this.renderChrome();
  }

  $(id) {
    return document.getElementById(id);
  }

  // ?wqdate=YYYY-MM-DD previews another day (handy for grown-ups and testing)
  now() {
    const q = new URLSearchParams(location.search).get('wqdate');
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) {
      const d = WQDate.parse(q);
      const n = new Date();
      d.setHours(n.getHours(), n.getMinutes());
      return d;
    }
    return new Date();
  }

  todayKey() {
    return WQDate.key(this.now());
  }

  get profile() {
    return this.store.profile;
  }

  get progress() {
    return this.store.progress;
  }

  get track() {
    return WQ_TRACKS[this.profile && this.profile.track] || WQ_TRACKS.explorer;
  }

  // Which week of the learner's track a date falls in
  weekOf(dateKey) {
    const p = this.profile;
    const wk = WQDate.weeksBetween(p.trackStart || this.todayKey(), dateKey);
    if (wk < 0) return null;
    const track = this.track;
    const themeIndex = wk % track.weeks.length;
    return { wk, themeIndex, theme: track.weeks[themeIndex], track, monday: WQDate.monday(dateKey), weekNo: wk + 1 };
  }

  wordOn(dateKey) {
    const dow = WQDate.dow(WQDate.parse(dateKey));
    const info = this.weekOf(dateKey);
    return info && dow < 5 ? info.theme.words[dow] : null;
  }

  findWord(t, w) {
    const track = WQ_TRACKS[t];
    return track ? track.allWords.find(x => x.w === w) : null;
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  bind() {
    const onClick = (e) => {
      const el = e.target.closest('[data-act]');
      if (el && !el.disabled) this.act(el.dataset.act, el);
    };
    this.viewEl.addEventListener('click', onClick);
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
      else onClick(e);
    });
    this.$('wq-close-modal').addEventListener('click', () => this.closeModal());
    this.$('wq-back').addEventListener('click', () => this.back());
    this.$('wq-me').addEventListener('click', () => this.go(this.store.current ? 'profile' : 'welcome'));
    this.viewEl.addEventListener('input', (e) => {
      if (e.target.id === 'wq-name' && this.draft) this.draft.name = e.target.value;
    });
    this.viewEl.addEventListener('change', (e) => {
      if (e.target.id === 'wq-profile-name') this.renameLearner(e.target.value);
    });
    this.viewEl.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (e.target.id === 'wq-code') this.act('recover');
      if (e.target.id === 'wq-profile-name') e.target.blur();
    });
  }

  act(a, el = {}) {
    const d = el.dataset || {};
    if (a !== 'say' && window.soundEngine) window.soundEngine.playClick();
    switch (a) {
      case 'go': return this.go(d.v);
      case 'pick': return this.pickLearner(d.key);
      case 'new': return this.startCreate();
      case 'signin': return this.go('signin');
      case 'avatar': return this.chooseAvatar(d.v, el);
      case 'track': return this.chooseTrack(d.v, el);
      case 'create-passkey': return this.createLearner(true);
      case 'create-local': return this.createLearner(false);
      case 'login-passkey': return this.loginPasskey();
      case 'recover': return this.recover();
      case 'say': return WQVoice.say(d.text);
      case 'start': return this.startLesson(d.day);
      case 'print-day': return this.printWorksheet(d.day || (this.play && this.play.dateKey));
      case 'lesson-next': return this.nextStep();
      case 'answer': return this.answer(Number(d.i), el);
      case 'tile': return this.tapTile(Number(d.i), el);
      case 'use-check': return this.checkSentence();
      case 'use-skip': return this.nextStep();
      case 'quiz': return this.startQuiz(d.monday);
      case 'sticker': return this.showSticker(d.id);
      case 'print-sticker': return this.printSticker(d.id);
      case 'print-card': return this.printCard(this.params.code);
      case 'print-bt': return this.printBluetooth();
      case 'print-browser': return this.printBrowser();
      case 'print-save': return this.printSave();
      case 'close-modal': return this.closeModal();
      case 'switch': this.store.deselect(); return this.go('welcome');
      case 'add-passkey': return this.addPasskey();
      case 'upgrade': return this.upgradeToPasskey();
      case 'new-code': return this.makeBackupCode();
      case 'sign-out': return this.signOut();
      case 'remove': return this.removeLearner();
      case 'delete-account': return this.deleteAccount();
      default: return null;
    }
  }

  open() {
    this.app.showScreen('quest');
    this.go(this.store.current ? 'dash' : 'welcome');
    if (this.store.current) this.store.refresh();
  }

  isPlaying() {
    return this.play && !this.play.finished && (this.play.mode === 'quiz' ? this.play.i > 0 || this.play.answered : this.play.step > 0);
  }

  back() {
    if (this.view === 'lesson' || this.view === 'quiz') {
      if (this.play && this.play.mode === 'quiz' && this.isPlaying() && !confirm('Leave the quiz? You can start it again later.')) return;
      this.play = null;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      return this.go('dash');
    }
    if (this.view === 'dash' || (this.view === 'welcome')) return this.app.showScreen('home');
    if (this.view === 'create' || this.view === 'signin') return this.go(this.store.current ? 'dash' : 'welcome');
    return this.go(this.store.current ? 'dash' : 'welcome');
  }

  go(view, params = {}) {
    if (this.returnTo === 'robo' && (view === 'dash' || view === 'welcome')) {
      this.returnTo = null;
      return this.app.robo.open();
    }
    if (!this.store.current && !['welcome', 'create', 'signin'].includes(view)) view = 'welcome';
    this.view = view;
    this.params = params;
    this.render();
  }

  render() {
    const views = {
      welcome: () => this.vWelcome(), create: () => this.vCreate(), signin: () => this.vSignin(),
      backup: () => this.vBackup(), dash: () => this.vDash(), lesson: () => this.vPlay(), quiz: () => this.vPlay(),
      stickers: () => this.vStickers(), words: () => this.vWords(), profile: () => this.vProfile()
    };
    this.viewEl.dataset.view = this.view;
    this.viewEl.innerHTML = (views[this.view] || views.welcome)();
    this.viewEl.scrollTop = 0;
    this.renderChrome();
  }

  renderChrome() {
    const e = this.store.current;
    const me = this.$('wq-me');
    const sync = this.$('wq-sync');
    if (!me) return;
    me.innerHTML = e ? `<span>${wqEsc(e.avatar)}</span><b>${wqEsc(e.name)}</b>` : '<span>👤</span><b>Sign in</b>';
    const labels = {
      local: ['📱', 'On this device'], saving: ['⏳', 'Saving…'], synced: ['☁️', 'Saved'],
      offline: ['📴', 'Offline · saves later'], signin: ['🔑', 'Sign in to save']
    };
    const state = !e ? null : e.kind === 'guest' ? 'local' : this.store.status;
    sync.hidden = !state;
    if (state) {
      sync.className = `wq-sync s-${state}`;
      sync.innerHTML = `${labels[state][0]} <span>${labels[state][1]}</span>`;
    }
    // Header stats update without re-rendering the whole view
    if (this.view === 'profile' && state) {
      const st = this.$('wq-account-status');
      if (st) st.textContent = labels[state][1];
    }
  }

  toast(text) {
    this.app.showToast(text);
  }

  // ---------------------------------------------------------------------------
  // Welcome, sign-up and sign-in
  // ---------------------------------------------------------------------------
  vWelcome() {
    const cards = this.store.entries.map(e => {
      const p = this.store.loadData(e.key).profile;
      const t = WQ_TRACKS[p.track] || WQ_TRACKS.explorer;
      return `
        <button class="wq-learner" data-act="pick" data-key="${e.key}" style="--c:${t.color}">
          <span class="wq-learner-avatar">${wqEsc(e.avatar)}</span>
          <strong>${wqEsc(e.name)}</strong>
          <small>${t.icon} ${t.label}</small>
          <em>${e.kind === 'account' ? '🔑 Passkey' : '📱 This device'}</em>
        </button>`;
    }).join('');
    return `
      <div class="wq-welcome">
        <div class="wq-hero">
          <div class="wq-hero-icon">📚</div>
          <h2>Word Quest</h2>
          <p>A new word every school day · a quiz every weekend · stickers to collect!</p>
        </div>
        ${cards ? `<div class="wq-section-title">Who's learning today?</div><div class="wq-learners">${cards}</div>` : ''}
        <div class="wq-start-actions">
          <button class="btn btn-primary btn-big" data-act="new">✨ New learner</button>
          <button class="btn btn-ghost btn-big" data-act="signin">🔑 I already have a passkey</button>
        </div>
        <div class="wq-how">
          <div><span>📅</span><b>Every morning</b><small>Learn a new word, play 3 quick puzzles</small></div>
          <div><span>🖨️</span><b>Print &amp; solve</b><small>A worksheet for your notebook</small></div>
          <div><span>🏆</span><b>Weekend quiz</b><small>Win the week's sticker: Bronze, Silver or Gold</small></div>
        </div>
      </div>`;
  }

  startCreate() {
    this.draft = { name: '', avatar: wqPick(WQ_AVATARS), track: this.returnTo === 'robo' ? 'master' : '' };
    this.go('create');
  }

  trackButtons(selected) {
    return Object.values(WQ_TRACKS).map(t => `
      <button class="wq-track${t.id === selected ? ' active' : ''}" data-act="track" data-v="${t.id}" style="--c:${t.color}">
        <span class="wq-track-icon">${t.icon}</span>
        <strong>${t.label}</strong>
        <small>${t.who}</small>
        <em>${t.blurb}</em>
      </button>`).join('');
  }

  avatarButtons(selected) {
    return WQ_AVATARS.map(a => `<button class="wq-avatar${a === selected ? ' active' : ''}" data-act="avatar" data-v="${a}">${a}</button>`).join('');
  }

  vCreate() {
    const d = this.draft || (this.draft = { name: '', avatar: WQ_AVATARS[0], track: '' });
    const pk = WQPasskey.supported();
    return `
      <div class="wq-form">
        <h2>✨ Make your learner card</h2>
        <label class="wq-field"><span>Learner's name</span>
          <input type="text" id="wq-name" maxlength="20" placeholder="Type a name…" value="${wqEsc(d.name)}" autocomplete="off" enterkeyhint="done">
        </label>
        <div class="wq-field"><span>Pick a buddy</span><div class="wq-avatars" id="wq-avatars">${this.avatarButtons(d.avatar)}</div></div>
        <div class="wq-field"><span>Choose the level</span><div class="wq-tracks">${this.trackButtons(d.track)}</div></div>
        <div class="wq-save">
          <button class="btn btn-primary btn-big" data-act="create-passkey" ${pk ? '' : 'disabled'}>🔑 Save with a passkey</button>
          <button class="btn btn-ghost btn-big" data-act="create-local">📱 Just this device</button>
          <p class="wq-note">${pk
            ? '<b>Passkey (recommended):</b> keeps words and stickers safe on our server and works on any device. It uses this device\'s fingerprint, face or screen lock, so there is no password to remember.'
            : 'Passkeys need the secure <b>https://</b> website (or localhost). You can still start on this device and add a passkey later from your profile.'}</p>
          <div class="wq-status" id="wq-status"></div>
        </div>
      </div>`;
  }

  chooseAvatar(v, el) {
    if (this.view === 'profile') {
      this.store.update(d => { d.profile.avatar = v; }, { profileChanged: true });
    } else if (this.draft) {
      this.draft.avatar = v;
    }
    el.parentElement.querySelectorAll('.wq-avatar').forEach(b => b.classList.toggle('active', b === el));
    this.renderChrome();
  }

  chooseTrack(v, el) {
    if (this.view === 'profile') {
      if (v === this.profile.track) return;
      const t = WQ_TRACKS[v];
      if (!confirm(`Switch to ${t.label} (${t.who})?\n\nYou start at week 1 of the new level from this week. Your words and stickers stay in your book.`)) return;
      this.store.update(d => { d.profile.track = v; d.profile.trackStart = WQDate.monday(this.todayKey()); }, { profileChanged: true });
      this.toast(`${t.icon} Now learning ${t.label}!`);
    } else if (this.draft) {
      this.draft.track = v;
    }
    el.parentElement.querySelectorAll('.wq-track').forEach(b => b.classList.toggle('active', b === el));
  }

  status(text, kind = '') {
    const s = this.$('wq-status');
    if (s) {
      s.className = `wq-status ${kind}`;
      s.textContent = text;
    }
  }

  newProfile() {
    const d = this.draft;
    return {
      name: d.name.trim(), avatar: d.avatar, track: d.track,
      trackStart: WQDate.monday(this.todayKey()), updatedAt: Date.now()
    };
  }

  async createLearner(withPasskey) {
    const d = this.draft;
    if (!d.name.trim()) {
      this.status('Please type the learner\'s name first.', 'bad');
      this.$('wq-name').focus();
      return;
    }
    if (!d.track) {
      this.status('Please choose a level for the learner.', 'bad');
      return;
    }
    const profile = this.newProfile();
    if (!withPasskey) {
      this.store.createGuest(profile);
      this.draft = null;
      this.toast(`Welcome, ${profile.name}! 🎉`);
      return this.go('dash');
    }
    this.status('Follow the steps on your screen to save the passkey…');
    try {
      const res = await this.store.registerPasskey(profile, wqEmptyProgress());
      this.store.addAccount(res);
      this.draft = null;
      window.confettiEngine.burst();
      this.go('backup', { code: res.backupCode, fresh: true });
    } catch (err) {
      this.status(WQPasskey.friendlyError(err), 'bad');
    }
  }

  vSignin() {
    const pk = WQPasskey.supported();
    return `
      <div class="wq-form narrow">
        <div class="wq-big-emoji">🔑</div>
        <h2>Welcome back!</h2>
        <button class="btn btn-primary btn-big" data-act="login-passkey" ${pk ? '' : 'disabled'}>🔑 Sign in with my passkey</button>
        ${pk ? '' : '<p class="wq-note">Passkeys need the secure https:// website (or localhost). You can use your backup code instead.</p>'}
        <div class="wq-or"><span>or</span></div>
        <label class="wq-field"><span>Use your backup code (from your learner card)</span>
          <input type="text" id="wq-code" placeholder="WQ-XXXX-XXXX-XXXX" maxlength="24" autocomplete="off" autocapitalize="characters" spellcheck="false">
        </label>
        <button class="btn btn-ghost" data-act="recover">Sign in with the code</button>
        <div class="wq-status" id="wq-status"></div>
      </div>`;
  }

  async loginPasskey() {
    this.status('Choose your passkey on the screen…');
    try {
      const res = await this.store.loginPasskey();
      this.store.addAccount(res);
      this.toast(`Welcome back, ${res.learner.profile.name}! 👋`);
      this.go('dash');
    } catch (err) {
      this.status(WQPasskey.friendlyError(err), 'bad');
    }
  }

  async recover() {
    const code = (this.$('wq-code') || {}).value || '';
    if (code.replace(/[^a-z0-9]/gi, '').length < 12) {
      this.status('Type the whole code, like WQ-7KQ4-M2PX-9RTA.', 'bad');
      return;
    }
    this.status('Checking…');
    try {
      const res = await this.store.recover(code);
      this.store.addAccount(res);
      this.toast(`Welcome back, ${res.learner.profile.name}! 👋`);
      this.go('profile', { hint: 'add-passkey' });
    } catch (err) {
      this.status(WQPasskey.friendlyError(err), 'bad');
    }
  }

  vBackup() {
    const p = this.profile;
    return `
      <div class="wq-form narrow center">
        <div class="wq-big-emoji">${this.params.fresh ? '🎉' : '🗝️'}</div>
        <h2>${this.params.fresh ? `You're all set, ${wqEsc(p.name)}!` : 'Your new backup code'}</h2>
        <p>${this.params.fresh ? 'Your passkey is saved. ' : ''}Keep this secret code safe. It lets you sign in on a new device if your passkey isn't there.</p>
        <div class="wq-code">${wqEsc(this.params.code || '')}</div>
        <p class="wq-note">It won't be shown again. Print it on your learner card and stick it inside your notebook cover.</p>
        <button class="btn btn-dark btn-big" data-act="print-card">🖨️ Print my learner card</button>
        <button class="btn btn-primary btn-big" data-act="go" data-v="dash">${this.params.fresh ? 'Start my quest →' : 'Done'}</button>
      </div>`;
  }

  pickLearner(key) {
    this.store.select(key);
    this.go('dash');
  }

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  vDash() {
    const p = this.profile;
    const today = this.todayKey();
    const now = this.now();
    const dow = WQDate.dow(now);
    const info = this.weekOf(today);
    if (!info) {
      return `<div class="wq-form narrow center"><div class="wq-big-emoji">📅</div><h2>Your quest starts on ${WQDate.label(p.trackStart)}</h2><p>See you then, ${wqEsc(p.name)}!</p></div>`;
    }
    const stats = wqStats(this.progress, today);
    const hour = now.getHours();
    const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const track = this.track;

    return `
      <div class="wq-dash" style="--c:${track.color}">
        <div class="wq-hello">
          <span class="wq-hello-avatar">${wqEsc(p.avatar)}</span>
          <div class="wq-hello-text">
            <h2>${hello}, ${wqEsc(p.name)}!</h2>
            <small>${track.icon} ${track.label} · Week ${info.weekNo}: ${wqEsc(info.theme.title)} ${info.theme.sticker}</small>
          </div>
          <div class="wq-stats">
            <div class="${stats.streak ? 'hot' : ''}"><b>🔥 ${stats.streak}</b><small>day streak</small></div>
            <div><b>📚 ${stats.words}</b><small>words</small></div>
            <div><b>🏅 ${stats.stickers}</b><small>stickers</small></div>
          </div>
        </div>
        ${this.weekStrip(info, today, dow)}
        <div class="wq-dash-main">
          ${dow < 5 ? this.todayCard(today, info, dow) : this.quizCard(info.monday, true)}
          <div class="wq-dash-side">
            ${this.pendingCard(info, today, dow)}
            <button class="wq-tile" data-act="go" data-v="stickers"><span>🏅</span><b>Sticker book</b><small>${stats.stickers} collected</small></button>
            <button class="wq-tile" data-act="go" data-v="words"><span>📖</span><b>My words</b><small>${stats.words} learned</small></button>
            <button class="wq-tile" data-act="go" data-v="profile"><span>${wqEsc(p.avatar)}</span><b>My profile</b><small>Level, passkey</small></button>
          </div>
        </div>
      </div>`;
  }

  weekStrip(info, today, dow) {
    const days = [0, 1, 2, 3, 4].map(i => {
      const key = WQDate.addDays(info.monday, i);
      const word = this.wordOn(key);
      const rec = this.progress.days[key];
      const name = WQ_DAYS[i].slice(0, 3);
      if (rec) {
        const w = this.findWord(rec.t, rec.w) || word;
        return `<button class="wq-day done" data-act="start" data-day="${key}"><small>${name}</small><span class="wq-day-icon">${w ? w.e : '✓'}</span><em>${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}</em></button>`;
      }
      if (!word) return `<div class="wq-day off"><small>${name}</small><span class="wq-day-icon">·</span><em></em></div>`;
      if (key === today) return `<button class="wq-day today" data-act="start" data-day="${key}"><small>${name}</small><span class="wq-day-icon">🎁</span><em>Today</em></button>`;
      if (key < today) return `<button class="wq-day missed" data-act="start" data-day="${key}"><small>${name}</small><span class="wq-day-icon">↺</span><em>Catch up</em></button>`;
      return `<div class="wq-day locked"><small>${name}</small><span class="wq-day-icon">🔒</span><em>Soon</em></div>`;
    }).join('');
    const quiz = this.progress.quizzes[info.monday];
    const open = dow >= 5;
    const tier = quiz ? WQ_TIERS[quiz.tier] : null;
    const quizCell = quiz
      ? `<button class="wq-day quiz done tier-${quiz.tier}" data-act="quiz" data-monday="${info.monday}"><small>Sat–Sun</small><span class="wq-day-icon">${info.theme.sticker}</span><em>${tier.name}</em></button>`
      : open
        ? `<button class="wq-day quiz today" data-act="quiz" data-monday="${info.monday}"><small>Sat–Sun</small><span class="wq-day-icon">🏆</span><em>Quiz!</em></button>`
        : `<div class="wq-day quiz locked"><small>Sat–Sun</small><span class="wq-day-icon">🏆</span><em>Quiz</em></div>`;
    return `<div class="wq-week">${days}${quizCell}</div>`;
  }

  todayCard(today, info, dow) {
    const rec = this.progress.days[today];
    const label = `${WQ_DAYS[dow]}'s word`;
    if (!rec) {
      return `
        <div class="wq-today mystery">
          <div class="wq-today-label">${label} · Word ${dow + 1} of 5</div>
          <div class="wq-gift">🎁</div>
          <h3>A new word is waiting for you!</h3>
          <button class="btn btn-primary btn-big" data-act="start" data-day="${today}">Open today's word →</button>
          <button class="link-btn" data-act="print-day" data-day="${today}">🖨️ Print today's worksheet</button>
        </div>`;
    }
    const w = this.findWord(rec.t, rec.w) || this.wordOn(today);
    const next = dow === 4 ? 'The weekend quiz opens tomorrow. Win the sticker!' : 'Come back tomorrow for a new word!';
    return `
      <div class="wq-today learned">
        <div class="wq-today-label">${label} · learned ✓</div>
        <div class="wq-today-word"><span>${w.e}</span>${wqEsc(w.w)}</div>
        <div class="wq-today-stars">${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}</div>
        <p>${next}</p>
        <div class="wq-row">
          <button class="btn btn-dark" data-act="print-day" data-day="${today}">🖨️ Print worksheet</button>
          <button class="btn btn-ghost" data-act="start" data-day="${today}">🔁 Practise again</button>
        </div>
      </div>`;
  }

  quizCard(monday, big) {
    const info = this.weekOf(monday);
    const q = this.progress.quizzes[monday];
    const learned = [0, 1, 2, 3, 4].filter(i => this.progress.days[WQDate.addDays(monday, i)]).length;
    const len = WQ_QUIZ_LEN[info.track.id] || 10;
    if (!q) {
      return `
        <div class="wq-today quiz-open${big ? '' : ' small'}">
          <div class="wq-today-label">🏆 Weekend quiz · Week ${info.weekNo}</div>
          <div class="wq-sticker-big locked"><span>${info.theme.sticker}</span></div>
          <h3>Win the “${wqEsc(info.theme.title)}” sticker!</h3>
          <p>${len} questions · no timer · ${learned < 5 ? `you learned ${learned} of 5 words, catch up first for the best score!` : 'get 90% for Gold'}</p>
          <button class="btn btn-primary btn-big" data-act="quiz" data-monday="${monday}">Start the quiz →</button>
        </div>`;
    }
    const tier = WQ_TIERS[q.tier];
    return `
      <div class="wq-today quiz-done${big ? '' : ' small'}">
        <div class="wq-today-label">🏆 Weekend quiz · Week ${info.weekNo}</div>
        <div class="wq-sticker-big tier-${q.tier}"><span>${info.theme.sticker}</span></div>
        <h3>${tier.name}! ${q.best} / ${q.total}</h3>
        <p>${q.tier < 3 ? 'Try again to win Gold, your best score is kept.' : 'Perfect! New words start on Monday.'}</p>
        <div class="wq-row">
          <button class="btn btn-dark" data-act="print-sticker" data-id="${info.track.id}-${info.themeIndex}">🖨️ Print sticker</button>
          ${q.tier < 3 ? `<button class="btn btn-ghost" data-act="quiz" data-monday="${monday}">🔁 Try for Gold</button>` : ''}
        </div>
      </div>`;
  }

  // Missed last weekend's quiz? Offer it during the week
  pendingCard(info, today, dow) {
    const lastMonday = WQDate.addDays(info.monday, -7);
    const last = this.weekOf(lastMonday);
    if (!last || this.progress.quizzes[lastMonday]) return '';
    const learnedAny = [0, 1, 2, 3, 4].some(i => this.progress.days[WQDate.addDays(lastMonday, i)]);
    if (!learnedAny) return '';
    return `<button class="wq-tile pending" data-act="quiz" data-monday="${lastMonday}"><span>${last.theme.sticker}</span><b>Last week's quiz</b><small>Still waiting for you!</small></button>`;
  }

  // ---------------------------------------------------------------------------
  // Lesson: learn → 3 puzzles → write a sentence → done
  // ---------------------------------------------------------------------------
  canOpenDay(dateKey) {
    const today = this.todayKey();
    if (this.progress.days[dateKey]) return true;
    return dateKey <= today && WQDate.monday(dateKey) === WQDate.monday(today) && Boolean(this.wordOn(dateKey));
  }

  startLesson(dateKey) {
    const rec = this.progress.days[dateKey];
    const word = rec ? this.findWord(rec.t, rec.w) : this.wordOn(dateKey);
    if (!word || !this.canOpenDay(dateKey)) {
      this.toast('That word isn\'t ready yet 🔒');
      return;
    }
    const track = WQ_TRACKS[word.track];
    const rng = wqRng(`${dateKey}:${word.w}:${Date.now()}`);
    const types = WQ_LESSON_TYPES[track.id] || ['meaning', 'blank', rng() < 0.5 ? 'synonym' : 'antonym'];
    const steps = ['learn', ...types.map((_, i) => `p${i}`)];
    if (track.id !== 'tiny') steps.push('use');
    steps.push('done');
    this.play = {
      mode: 'lesson', dateKey, word, track, steps, step: 0, again: Boolean(rec),
      puzzles: types.map(t => WQPuzzles.make(t, word, track, rng)), firstTry: [], answered: false, sentence: ''
    };
    this.go('lesson');
    if (track.id === 'tiny' || track.id === 'sprout') setTimeout(() => WQVoice.say(word.w, 0.75), 350);
  }

  stepDots() {
    const p = this.play;
    if (p.mode === 'quiz') {
      return `<div class="wq-progress">${p.puzzles.map((_, i) => `<span class="${i < p.i ? (p.firstTry[i] ? 'good' : 'bad') : i === p.i ? 'now' : ''}"></span>`).join('')}</div>`;
    }
    const icon = { learn: '📖', use: '✍️', done: '🏁' };
    return `<div class="wq-progress steps">${p.steps.map((s, i) => `<span class="${i < p.step ? 'good' : i === p.step ? 'now' : ''}">${icon[s] || i}</span>`).join('')}</div>`;
  }

  vPlay() {
    const p = this.play;
    if (!p) return this.vDash();
    if (p.mode === 'quiz') return this.vQuiz();
    const step = p.steps[p.step];
    if (step === 'learn') return this.vLearn();
    if (step === 'use') return this.vUse();
    if (step === 'done') return this.vDone();
    return this.vPuzzle(p.puzzles[Number(step.slice(1))], Number(step.slice(1)), p.puzzles.length);
  }

  vLearn() {
    const { word, track, dateKey } = this.play;
    const dow = WQDate.dow(WQDate.parse(dateKey));
    const info = this.weekOf(dateKey);
    const chips = [word.syn && `<span class="wq-chip same">≈ Same: <b>${wqEsc(word.syn)}</b></span>`, word.ant && `<span class="wq-chip opp">↔ Opposite: <b>${wqEsc(word.ant)}</b></span>`, word.rhyme && track.id === 'tiny' && `<span class="wq-chip">🎵 Rhymes with <b>${wqEsc(word.rhyme)}</b></span>`].filter(Boolean).join('');
    return `
      <div class="wq-lesson" style="--c:${track.color}">
        ${this.stepDots()}
        <div class="wq-learn${track.id === 'tiny' ? ' tiny' : ''}">
          <div class="wq-learn-day">${WQ_DAYS[dow]} · ${info ? `Week ${info.weekNo} · ` : ''}word ${dow + 1} of 5</div>
          <div class="wq-learn-emoji">${word.e}</div>
          <div class="wq-learn-word">${wqEsc(word.w)} <button class="wq-say" data-act="say" data-text="${wqEsc(word.w)}" title="Hear it">🔊</button></div>
          ${word.pos ? `<div class="wq-learn-pos">${wqEsc(word.pos)}</div>` : ''}
          <div class="wq-learn-meaning">${wqEsc(word.m)}</div>
          <div class="wq-learn-sentence">“${wqEsc(word.s)}” <button class="wq-say small" data-act="say" data-text="${wqEsc(word.s)}" title="Hear the sentence">🔊</button></div>
          ${chips ? `<div class="wq-chips">${chips}</div>` : ''}
        </div>
        <div class="wq-lesson-actions">
          <button class="btn btn-ghost" data-act="print-day">🖨️ Print worksheet</button>
          <button class="btn btn-primary btn-big" data-act="lesson-next">Let's play! →</button>
        </div>
      </div>`;
  }

  vPuzzle(pz, index, total) {
    const p = this.play;
    const tag = p.mode === 'quiz'
      ? `Question ${index + 1} of ${total}${pz.review ? ' · ♻️ Review' : ''} · ${pz.tag}`
      : `Puzzle ${index + 1} of ${total} · ${pz.tag}`;
    const body = pz.type === 'spell'
      ? `<div class="wq-spell">
           <div class="wq-slots">${pz.slots.map(s => `<span class="wq-slot${s.filled ? ' filled' : ''}">${s.filled ? wqEsc(s.ch) : ''}</span>`).join('')}</div>
           <div class="wq-tiles">${pz.tiles.map((t, i) => `<button class="wq-tile-letter${t.used ? ' used' : ''}" data-act="tile" data-i="${i}" ${t.used ? 'disabled' : ''}>${wqEsc(t.ch)}</button>`).join('')}</div>
         </div>`
      : `<div class="wq-options layout-${pz.layout} n-${pz.options.length}">${pz.options.map((o, i) => `<button class="wq-opt" data-act="answer" data-i="${i}">${wqEsc(o.label)}</button>`).join('')}</div>`;
    return `
      <div class="wq-lesson" style="--c:${p.track.color}">
        ${this.stepDots()}
        <div class="wq-puzzle">
          <div class="wq-q-tag">${tag}</div>
          <div class="wq-q-prompt">${pz.prompt}</div>
          ${pz.say ? `<button class="wq-say big" data-act="say" data-text="${wqEsc(pz.say)}">🔊 Listen</button>` : ''}
        </div>
        ${body}
        <div class="wq-feedback" id="wq-feedback"></div>
      </div>`;
  }

  currentPuzzle() {
    const p = this.play;
    if (p.mode === 'quiz') return { pz: p.puzzles[p.i], index: p.i };
    const step = p.steps[p.step];
    return step[0] === 'p' ? { pz: p.puzzles[Number(step.slice(1))], index: Number(step.slice(1)) } : {};
  }

  answer(i, el) {
    const p = this.play;
    const { pz, index } = this.currentPuzzle();
    if (!pz || p.answered) return;
    const opt = pz.options[i];
    const correct = opt.value === pz.answer;
    if (p.firstTry[index] === undefined) p.firstTry[index] = correct;

    if (correct) {
      el.classList.add('good');
      this.solved(pz);
      return;
    }
    el.classList.add('bad', 'shake');
    el.disabled = true;
    if (window.soundEngine) window.soundEngine.playIncorrect();
    if (p.mode === 'quiz') {
      // Quizzes are one try: show the right answer and move on
      p.answered = true;
      this.viewEl.querySelectorAll('.wq-opt').forEach((b, j) => {
        b.disabled = true;
        if (pz.options[j].value === pz.answer) b.classList.add('good', 'reveal');
      });
      this.feedback(false, `The answer is “${pz.answer}”. ${pz.explain && pz.explain !== pz.answer ? pz.explain : ''}`);
    } else {
      this.feedback(null, 'Not quite. Have another go! 💪');
    }
  }

  tapTile(i, el) {
    const p = this.play;
    const { pz, index } = this.currentPuzzle();
    if (!pz || p.answered) return;
    const slot = pz.slots.find(s => !s.filled);
    const tile = pz.tiles[i];
    if (!slot || tile.used) return;
    if (tile.ch === slot.ch) {
      slot.filled = true;
      tile.used = true;
      el.classList.add('used');
      el.disabled = true;
      const slotEls = this.viewEl.querySelectorAll('.wq-slot');
      const slotIndex = pz.slots.indexOf(slot);
      slotEls[slotIndex].textContent = slot.ch;
      slotEls[slotIndex].classList.add('filled', 'pop');
      if (window.soundEngine) window.soundEngine.playStar(1);
      if (pz.slots.every(s => s.filled)) {
        if (p.firstTry[index] === undefined) p.firstTry[index] = true;
        WQVoice.say(pz.word);
        this.solved(pz);
      }
      return;
    }
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    if (window.soundEngine) window.soundEngine.playIncorrect();
    if (p.mode === 'quiz' && p.firstTry[index] === undefined) p.firstTry[index] = false;
    if (p.mode === 'lesson' && p.firstTry[index] === undefined) p.firstTry[index] = false;
    this.feedback(null, p.mode === 'quiz' ? 'Oops! Keep going, which letter comes next?' : 'Not that one. Say the word slowly and try again!');
  }

  solved(pz) {
    const p = this.play;
    p.answered = true;
    this.viewEl.querySelectorAll('.wq-opt').forEach(b => { b.disabled = true; });
    if (window.soundEngine) window.soundEngine.playCorrect();
    this.feedback(true, `${wqPick(WQ_PRAISE)} ${pz.explain || ''}`);
  }

  feedback(good, text) {
    const fb = this.$('wq-feedback');
    if (!fb) return;
    const p = this.play;
    fb.className = `wq-feedback show ${good === true ? 'good' : good === false ? 'bad' : 'hint'}`;
    fb.innerHTML = `<span class="wq-fb-text">${good === true ? '✓ ' : ''}${wqEsc(text)}</span>${p.answered ? '<button class="btn btn-primary btn-big" data-act="lesson-next">Next →</button>' : ''}`;
    if (p.answered) {
      const btn = fb.querySelector('button');
      if (btn) btn.focus({ preventScroll: true });
    }
  }

  nextStep() {
    const p = this.play;
    if (!p) return;
    p.answered = false;
    if (p.mode === 'quiz') {
      p.i++;
      if (p.i >= p.puzzles.length) return this.finishQuiz();
      return this.render();
    }
    p.step++;
    if (p.steps[p.step] === 'done') this.finishLesson();
    this.render();
  }

  vUse() {
    const { word, track } = this.play;
    return `
      <div class="wq-lesson" style="--c:${track.color}">
        ${this.stepDots()}
        <div class="wq-use">
          <div class="wq-q-tag">Bonus ✍️ · Use it!</div>
          <h3>Write your own sentence with “${wqEsc(word.w)}”</h3>
          <textarea id="wq-sentence" maxlength="200" rows="3" placeholder="e.g. ${wqEsc(word.s)}" enterkeyhint="done"></textarea>
          <div class="wq-row">
            <button class="btn btn-ghost" data-act="use-skip">Skip, I'll write it on paper</button>
            <button class="btn btn-primary btn-big" data-act="use-check">Check ✓</button>
          </div>
          <div class="wq-feedback" id="wq-feedback"></div>
        </div>
      </div>`;
  }

  checkSentence() {
    const p = this.play;
    const text = (this.$('wq-sentence').value || '').trim().replace(/\s+/g, ' ');
    const stem = p.word.w.toLowerCase().slice(0, Math.max(3, p.word.w.length - 2));
    const words = text.split(' ').filter(Boolean);
    if (!text.toLowerCase().includes(stem)) {
      this.feedback(null, `Use the word “${p.word.w}” in your sentence.`);
      return;
    }
    if (words.length < 3) {
      this.feedback(null, 'Make it a little longer, at least 3 words.');
      return;
    }
    p.sentence = text.charAt(0).toUpperCase() + text.slice(1);
    p.answered = true;
    if (window.soundEngine) window.soundEngine.playCorrect();
    this.feedback(true, 'Lovely sentence! It\'s saved in your word book.');
  }

  finishLesson() {
    const p = this.play;
    const stars = Math.max(1, p.firstTry.filter(Boolean).length);
    p.stars = stars;
    p.finished = true;
    const key = p.dateKey;
    const info = this.weekOf(key);
    this.store.update(d => {
      const old = d.progress.days[key];
      const pending = (d.pending && d.pending[key]) || 0;
      d.progress.days[key] = WQMerge.mergeProgress({ days: old ? { [key]: old } : {} }, {
        days: {
          [key]: {
            t: p.word.track, wk: info ? info.themeIndex : p.word.week, w: p.word.w, stars,
            sentence: p.sentence, at: Date.now(), printed: Math.max(old ? old.printed : 0, pending)
          }
        }
      }).days[key];
      if (d.pending) delete d.pending[key];
    });
    p.newStickers = this.awardBadges();
  }

  vDone() {
    const p = this.play;
    const rec = this.progress.days[p.dateKey];
    const stars = rec ? rec.stars : p.stars;
    setTimeout(() => {
      window.confettiEngine.burst();
      if (window.soundEngine) window.soundEngine.playFanfare();
      if (p.newStickers && p.newStickers.length) this.celebrate(p.newStickers);
    }, 250);
    const msg = stars === 3 ? 'All puzzles right first time. Amazing!' : stars === 2 ? 'Great work! Practise again any time.' : 'You did it! Every try makes you smarter.';
    return `
      <div class="wq-lesson" style="--c:${p.track.color}">
        ${this.stepDots()}
        <div class="wq-done">
          <div class="wq-done-stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('')}</div>
          <div class="wq-done-word"><span>${p.word.e}</span>${wqEsc(p.word.w)}</div>
          <h2>Word learned!</h2>
          <p>${msg}</p>
          ${p.sentence ? `<p class="wq-done-sentence">✍️ “${wqEsc(p.sentence)}”</p>` : ''}
          <div class="wq-row">
            <button class="btn btn-dark btn-big" data-act="print-day">🖨️ Print my worksheet</button>
            <button class="btn btn-ghost btn-big" data-act="go" data-v="dash">🏠 Back to my quest</button>
          </div>
          <p class="wq-note">Solve the worksheet on paper, colour the stars and stick it in your notebook!</p>
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Weekend quiz
  // ---------------------------------------------------------------------------
  startQuiz(monday) {
    const info = this.weekOf(monday);
    const today = this.todayKey();
    if (!info || (WQDate.addDays(monday, 5) > today)) {
      this.toast('The quiz opens on Saturday 🏆');
      return;
    }
    const track = info.track;
    const rng = wqRng(`${monday}:${Date.now()}`);
    const len = WQ_QUIZ_LEN[track.id] || 10;
    const types = WQ_QUIZ_TYPES[track.id] || WQ_QUIZ_TYPES.older;

    // Up to 2 review words from earlier weeks of this track that the learner has met
    const earlier = Object.values(this.progress.days)
      .filter(d => d.t === track.id && d.wk !== info.themeIndex)
      .map(d => this.findWord(d.t, d.w)).filter(Boolean);
    const review = wqShuffle(earlier, rng).slice(0, 2);
    const weekWords = wqShuffle(info.theme.words, rng);
    const list = [];
    let r = 0;
    while (list.length < len - review.length) {
      weekWords.forEach((w, i) => {
        if (list.length < len - review.length) list.push(WQPuzzles.make(types[(r + i) % types.length], w, track, rng));
      });
      r++;
    }
    review.forEach(w => list.push({ ...WQPuzzles.make(wqPick(types, rng), w, track, rng), review: true }));

    this.play = { mode: 'quiz', monday, info, track, puzzles: wqShuffle(list, rng), i: -1, firstTry: [], answered: false };
    this.go('quiz');
  }

  vQuiz() {
    const p = this.play;
    if (p.i === -1) {
      const best = this.progress.quizzes[p.monday];
      return `
        <div class="wq-lesson" style="--c:${p.track.color}">
          <div class="wq-quiz-intro">
            <div class="wq-q-tag">🏆 Weekend quiz · Week ${p.info.weekNo}</div>
            <div class="wq-sticker-big ${best ? `tier-${best.tier}` : 'locked'}"><span>${p.info.theme.sticker}</span></div>
            <h2>${wqEsc(p.info.theme.title)}</h2>
            <p>${p.puzzles.length} questions about this week's words${p.puzzles.some(q => q.review) ? ', plus a little review' : ''}. No timer, take your time!</p>
            <div class="wq-tier-guide">
              <span class="t1">🥉 Bronze<br><small>finish</small></span>
              <span class="t2">🥈 Silver<br><small>70%+</small></span>
              <span class="t3">🥇 Gold<br><small>90%+</small></span>
            </div>
            <div class="wq-quiz-words">${p.info.theme.words.map(w => `<button class="wq-chip" data-act="say" data-text="${wqEsc(w.w)}">${w.e} ${wqEsc(w.w)}</button>`).join('')}</div>
            <button class="btn btn-primary btn-big" data-act="lesson-next">I'm ready! →</button>
          </div>
        </div>`;
    }
    if (p.finished) return this.vQuizResult();
    return this.vPuzzle(p.puzzles[p.i], p.i, p.puzzles.length);
  }

  finishQuiz() {
    const p = this.play;
    const score = p.firstTry.filter(Boolean).length;
    const total = p.puzzles.length;
    const pct = score / total;
    const tier = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
    const stickerId = `${p.track.id}-${p.info.themeIndex}`;
    const before = this.progress.stickers[stickerId];
    p.finished = true;
    p.result = { score, total, tier, upgraded: !before || before.tier < tier };
    this.store.update(d => {
      d.progress = WQMerge.mergeProgress(d.progress, {
        quizzes: { [p.monday]: { t: p.track.id, wk: p.info.themeIndex, best: score, total, tier, tries: ((d.progress.quizzes[p.monday] || {}).tries || 0) + 1, at: Date.now() } },
        stickers: { [stickerId]: { tier, at: Date.now() } }
      });
    });
    p.newStickers = this.awardBadges();
    this.render();
  }

  vQuizResult() {
    const p = this.play;
    const { score, total, tier, upgraded } = p.result;
    const best = this.progress.quizzes[p.monday];
    const t = WQ_TIERS[tier];
    const stickerId = `${p.track.id}-${p.info.themeIndex}`;
    setTimeout(() => {
      window.confettiEngine.burst();
      if (window.soundEngine) window.soundEngine.playFanfare();
      if (p.newStickers && p.newStickers.length) setTimeout(() => this.celebrate(p.newStickers), 900);
    }, 250);
    const msg = tier === 3 ? 'Gold! You really know these words!' : tier === 2 ? 'Silver! So close to Gold, try again?' : 'Bronze! Practise the words and try for Silver.';
    return `
      <div class="wq-lesson" style="--c:${p.track.color}">
        ${this.stepDots()}
        <div class="wq-done">
          <div class="wq-sticker-big tier-${best.tier} reveal"><span>${p.info.theme.sticker}</span></div>
          <h2>${t.name}! ${score} / ${total}</h2>
          <p>${msg}${!upgraded ? ` Your best is still ${WQ_TIERS[best.tier].name} (${best.best}/${best.total}).` : ''}</p>
          <div class="wq-row">
            <button class="btn btn-dark btn-big" data-act="print-sticker" data-id="${stickerId}">🖨️ Print my sticker</button>
            ${best.tier < 3 ? `<button class="btn btn-ghost btn-big" data-act="quiz" data-monday="${p.monday}">🔁 Try again</button>` : ''}
          </div>
          <div class="wq-row">
            <button class="btn btn-ghost" data-act="go" data-v="stickers">🏅 Sticker book</button>
            <button class="btn btn-ghost" data-act="go" data-v="dash">🏠 My quest</button>
          </div>
        </div>
      </div>`;
  }

  // Special stickers for habits (streaks, writing, printing…)
  awardBadges() {
    const stats = wqStats(this.progress, this.todayKey());
    const earned = WQ_BADGES.filter(b => !this.progress.stickers[`b-${b.id}`] && b.test(stats));
    if (earned.length) {
      this.store.update(d => {
        earned.forEach(b => { d.progress.stickers[`b-${b.id}`] = { tier: 0, at: Date.now() }; });
      });
    }
    return earned.map(b => `b-${b.id}`);
  }

  // ---------------------------------------------------------------------------
  // Sticker book
  // ---------------------------------------------------------------------------
  stickerInfo(id) {
    if (id.startsWith('b-')) {
      const b = WQ_BADGES.find(x => `b-${x.id}` === id);
      return b && { id, icon: b.icon, title: b.title, how: b.how, special: true };
    }
    const [t, i] = id.split('-');
    const track = WQ_TRACKS[t];
    const week = track && track.weeks[Number(i)];
    return week && { id, icon: week.sticker, title: week.title, how: `Win the Week ${Number(i) + 1} quiz in ${track.label}`, track, weekIndex: Number(i) };
  }

  stickerCell(id) {
    const s = this.stickerInfo(id);
    const got = this.progress.stickers[id];
    const tier = got ? (s.special ? 'special' : `tier-${got.tier}`) : 'locked';
    return `
      <button class="wq-sticker ${tier}" data-act="sticker" data-id="${id}">
        <span class="wq-sticker-face">${s.icon}</span>
        <small>${wqEsc(s.title)}</small>
      </button>`;
  }

  vStickers() {
    const track = this.track;
    const owned = Object.keys(this.progress.stickers);
    const otherTracks = Object.values(WQ_TRACKS).filter(t => t.id !== track.id && owned.some(id => id.startsWith(`${t.id}-`)));
    return `
      <div class="wq-book">
        <div class="wq-page-head"><h2>🏅 My Sticker Book</h2><small>${owned.length} collected · tap a sticker to print it for your notebook</small></div>
        <div class="wq-section-title">${track.icon} ${track.label} · weekly quiz stickers</div>
        <div class="wq-sticker-grid">${track.weeks.map((_, i) => this.stickerCell(`${track.id}-${i}`)).join('')}</div>
        ${otherTracks.map(t => `
          <div class="wq-section-title">${t.icon} ${t.label}</div>
          <div class="wq-sticker-grid">${t.weeks.map((_, i) => `${t.id}-${i}`).filter(id => owned.includes(id)).map(id => this.stickerCell(id)).join('')}</div>`).join('')}
        <div class="wq-section-title">⭐ Special stickers</div>
        <div class="wq-sticker-grid">${WQ_BADGES.map(b => this.stickerCell(`b-${b.id}`)).join('')}</div>
      </div>`;
  }

  showSticker(id) {
    const s = this.stickerInfo(id);
    const got = this.progress.stickers[id];
    if (!got) {
      this.openModal('🔒 Not yet!', `
        <div class="wq-modal-center">
          <div class="wq-sticker-big locked"><span>${s.icon}</span></div>
          <h3>${wqEsc(s.title)}</h3>
          <p>${wqEsc(s.how)} to collect this sticker.</p>
          <button class="btn btn-primary" data-act="close-modal">OK</button>
        </div>`);
      return;
    }
    this.printSticker(id);
  }

  stickerCanvas(id) {
    const s = this.stickerInfo(id);
    const got = this.progress.stickers[id];
    const tier = s.special ? 0 : got.tier;
    return WQPrint.sticker({
      icon: s.icon,
      top: s.special ? 'SPECIAL STICKER' : 'WORD QUEST',
      title: s.title,
      tier,
      name: this.profile.name,
      dateLabel: WQDate.label(WQDate.key(new Date(got.at || Date.now()))),
      sub: s.special ? s.how : `${s.track.label} · Week ${s.weekIndex + 1} · ${WQ_TIERS[tier].name}`
    });
  }

  printSticker(id) {
    const s = this.stickerInfo(id);
    if (!this.progress.stickers[id]) return this.showSticker(id);
    this.openPrint(`${s.icon} ${s.title}`, this.stickerCanvas(id), `Sticker_${s.title}`, null,
      'Cut along the dashed circle and stick it in your notebook!');
  }

  celebrate(ids) {
    const cells = ids.map(id => {
      const s = this.stickerInfo(id);
      return `<button class="wq-sticker special pop" data-act="print-sticker" data-id="${id}"><span class="wq-sticker-face">${s.icon}</span><small>${wqEsc(s.title)}</small></button>`;
    }).join('');
    this.openModal(ids.length > 1 ? '🎉 New special stickers!' : '🎉 New special sticker!', `
      <div class="wq-modal-center">
        <div class="wq-sticker-grid celebrate">${cells}</div>
        <p>${ids.map(id => wqEsc(this.stickerInfo(id).how)).join(' · ')}</p>
        <p class="wq-note">Tap a sticker to print it.</p>
        <button class="btn btn-primary" data-act="close-modal">Yay! 🎉</button>
      </div>`);
    window.confettiEngine.burst();
  }

  // ---------------------------------------------------------------------------
  // My words
  // ---------------------------------------------------------------------------
  vWords() {
    const days = this.progress.days;
    const keys = Object.keys(days).sort().reverse();
    if (!keys.length) {
      return `<div class="wq-book"><div class="wq-page-head"><h2>📖 My Words</h2></div><div class="wq-empty">📭<p>Your words will appear here. Open today's word to start!</p><button class="btn btn-primary" data-act="go" data-v="dash">Go to today's word →</button></div></div>`;
    }
    const groups = [];
    keys.forEach(k => {
      const m = WQDate.monday(k);
      let g = groups.find(x => x.monday === m);
      if (!g) groups.push(g = { monday: m, items: [] });
      g.items.push(k);
    });
    return `
      <div class="wq-book">
        <div class="wq-page-head"><h2>📖 My Words</h2><small>${keys.length} words learned · tap a word to hear it</small></div>
        ${groups.map(g => {
          const first = days[g.items[0]];
          const track = WQ_TRACKS[first.t];
          const week = track && track.weeks[first.wk];
          return `
            <div class="wq-section-title">Week of ${WQDate.label(g.monday)}${week ? ` · ${week.sticker} ${wqEsc(week.title)}` : ''}</div>
            <div class="wq-word-list">${g.items.map(k => {
              const d = days[k];
              const w = this.findWord(d.t, d.w);
              if (!w) return '';
              return `
                <button class="wq-word-row" data-act="say" data-text="${wqEsc(w.w)}">
                  <span class="wq-word-emoji">${w.e}</span>
                  <span class="wq-word-text"><b>${wqEsc(w.w)}</b><small>${wqEsc(w.m)}</small>${d.sentence ? `<em>✍️ ${wqEsc(d.sentence)}</em>` : ''}</span>
                  <span class="wq-word-stars">${'★'.repeat(d.stars)}<small>${WQ_DAYS[WQDate.dow(WQDate.parse(k))].slice(0, 3)}</small></span>
                </button>`;
            }).join('')}</div>`;
        }).join('')}
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Profile & account
  // ---------------------------------------------------------------------------
  vProfile() {
    const p = this.profile;
    const e = this.store.current;
    const pk = WQPasskey.supported();
    const account = e.kind === 'account';
    const statusText = { saving: 'Saving…', synced: 'Saved', offline: 'Offline, saves later', signin: 'Sign in again to save', local: '' }[this.store.status] || '';
    return `
      <div class="wq-form">
        <h2>${wqEsc(p.avatar)} My profile</h2>
        ${this.params.hint === 'add-passkey' && pk ? '<div class="wq-banner">👋 Signed in with your backup code. Add a passkey on this device so next time is one tap!<button class="btn btn-primary" data-act="add-passkey">🔑 Add a passkey here</button></div>' : ''}
        <label class="wq-field"><span>Name</span><input type="text" id="wq-profile-name" maxlength="20" value="${wqEsc(p.name)}" autocomplete="off" enterkeyhint="done"></label>
        <div class="wq-field"><span>Buddy</span><div class="wq-avatars">${this.avatarButtons(p.avatar)}</div></div>
        <div class="wq-field"><span>Level</span><div class="wq-tracks">${this.trackButtons(p.track)}</div></div>
        <div class="wq-account">
          ${account ? `
            <div class="wq-account-head"><span>🔑</span><div><b>Saved with ${e.passkeys || 1} passkey${(e.passkeys || 1) > 1 ? 's' : ''}</b><small id="wq-account-status">${statusText}</small></div></div>
            <div class="wq-row">
              <button class="btn btn-ghost" data-act="add-passkey" ${pk ? '' : 'disabled'}>➕ Add a passkey on this device</button>
              <button class="btn btn-ghost" data-act="new-code">🗝️ New backup code</button>
              <button class="btn btn-ghost" data-act="sign-out">🚪 Sign out</button>
            </div>
            <button class="link-btn danger" data-act="delete-account">Delete this learner and all progress</button>` : `
            <div class="wq-account-head"><span>📱</span><div><b>Saved only on this device</b><small>If this browser's data is cleared, the progress is lost.</small></div></div>
            <div class="wq-row">
              <button class="btn btn-primary" data-act="upgrade" ${pk ? '' : 'disabled'}>🔑 Save with a passkey</button>
              <button class="btn btn-ghost" data-act="print-card">🪪 Print learner card</button>
            </div>
            ${pk ? '' : '<p class="wq-note">Passkeys need the https:// website (or localhost).</p>'}
            <button class="link-btn danger" data-act="remove">Remove this learner from this device</button>`}
          <div class="wq-status" id="wq-status"></div>
        </div>
        <button class="btn btn-ghost btn-big" data-act="switch">👥 Switch learner</button>
      </div>`;
  }

  renameLearner(name) {
    const clean = name.trim().slice(0, 20);
    if (!clean) return;
    this.store.update(d => { d.profile.name = clean; }, { profileChanged: true });
    this.renderChrome();
    this.toast('Name saved ✓');
  }

  async addPasskey() {
    this.status('Follow the steps on your screen…');
    try {
      await this.store.addPasskey();
      this.toast('🔑 Passkey added on this device!');
      this.go('profile');
    } catch (err) {
      this.status(WQPasskey.friendlyError(err), 'bad');
    }
  }

  async upgradeToPasskey() {
    this.status('Follow the steps on your screen to save the passkey…');
    try {
      const key = this.store.currentKey;
      const res = await this.store.registerPasskey(this.profile, this.progress);
      this.store.addAccount(res, key);
      window.confettiEngine.burst();
      this.go('backup', { code: res.backupCode, fresh: true });
    } catch (err) {
      this.status(WQPasskey.friendlyError(err), 'bad');
    }
  }

  async makeBackupCode() {
    if (!confirm('Make a new backup code? The old code will stop working.')) return;
    try {
      const res = await this.store.newBackupCode();
      this.go('backup', { code: res.backupCode });
    } catch (err) {
      this.status(WQPasskey.friendlyError(err), 'bad');
    }
  }

  async signOut() {
    if (!confirm(`Sign ${this.profile.name} out of this device? Progress stays saved with the passkey.`)) return;
    await this.store.signOut(this.store.currentKey);
    this.go('welcome');
  }

  removeLearner() {
    if (!confirm(`Remove ${this.profile.name} from this device? Their words and stickers will be deleted.`)) return;
    this.store.forget(this.store.currentKey);
    this.go('welcome');
  }

  async deleteAccount() {
    if (!confirm(`Delete ${this.profile.name} and ALL their words and stickers from the server? This cannot be undone.`)) return;
    try {
      await this.store.deleteAccount();
      this.toast('Learner deleted');
      this.go('welcome');
    } catch (err) {
      this.status(WQPasskey.friendlyError(err), 'bad');
    }
  }

  // ---------------------------------------------------------------------------
  // Printing: worksheets, stickers, learner cards
  // ---------------------------------------------------------------------------
  worksheetCanvas(dateKey) {
    const rec = this.progress.days[dateKey];
    const word = rec ? this.findWord(rec.t, rec.w) : this.wordOn(dateKey);
    if (!word) return null;
    const track = WQ_TRACKS[word.track];
    const info = this.weekOf(dateKey);
    const theme = track.weeks[word.week];
    const weekWords = theme.words.slice(0, word.day + 1);
    return {
      word,
      canvas: WQPrint.worksheet({
        word, track,
        dayName: WQ_DAYS[WQDate.dow(WQDate.parse(dateKey))],
        dateLabel: WQDate.label(dateKey),
        weekNo: info ? info.weekNo : word.week + 1,
        theme: theme.title,
        learner: this.profile.name,
        weekWords,
        prevWord: word.day > 0 ? theme.words[word.day - 1] : null,
        seed: `${this.profile.name}:${dateKey}:${word.w}`
      })
    };
  }

  printWorksheet(dateKey) {
    if (!dateKey || !this.canOpenDay(dateKey)) return this.toast('That word isn\'t ready yet 🔒');
    const ws = this.worksheetCanvas(dateKey);
    if (!ws) return null;
    return this.openPrint(`🖨️ ${WQ_DAYS[WQDate.dow(WQDate.parse(dateKey))]}'s worksheet`, ws.canvas, `WordQuest_${dateKey}_${ws.word.w}`, () => {
      this.store.update(d => {
        if (d.progress.days[dateKey]) d.progress.days[dateKey].printed++;
        else {
          d.pending = d.pending || {};
          d.pending[dateKey] = (d.pending[dateKey] || 0) + 1;
        }
      });
      const ids = this.awardBadges();
      if (ids.length) setTimeout(() => this.celebrate(ids), 1200);
    }, 'Solve it with a pencil, colour the stars and stick it in your notebook.');
  }

  printCard(code) {
    const t = this.track;
    this.openPrint('🪪 Learner card', WQPrint.learnerCard({ name: this.profile.name, avatar: this.profile.avatar, trackLabel: `${t.label} · ${t.who}`, code }),
      `WordQuest_card_${this.profile.name}`, null, code ? 'Keep the backup code secret and safe.' : '');
  }

  openPrint(title, canvas, filename, onPrinted, tip = '') {
    this.printJob = { canvas, filename: filename.replace(/[^a-z0-9_-]+/gi, '_'), onPrinted };
    const preview = window.printerController.renderThermal(canvas, { maxHeight: canvas.height, gamma: WQ_GAMMA, method: 'sheet' }).canvas;
    const printer = window.printerController;
    this.openModal(title, `
      <div class="wq-print">
        <div class="wq-print-paper"><img src="${preview.toDataURL('image/png')}" alt="Print preview"></div>
        <div class="wq-print-side">
          <p class="wq-note">This is exactly how it prints on the thermal printer.${tip ? ` ${wqEsc(tip)}` : ''}</p>
          <button class="btn btn-dark btn-big" data-act="print-bt">🖨️ ${printer.isConnected ? 'Print now' : 'Connect & print'}</button>
          <button class="btn btn-ghost" data-act="print-browser">📄 Normal printer</button>
          <button class="btn btn-ghost" data-act="print-save">💾 Save picture</button>
          <div class="wq-status" id="wq-print-status"></div>
        </div>
      </div>`, 'wide');
  }

  printStatus(text, kind = '') {
    const s = this.$('wq-print-status');
    if (s) {
      s.className = `wq-status ${kind}`;
      s.textContent = text;
    }
  }

  async printBluetooth() {
    const job = this.printJob;
    if (!job) return;
    const printer = window.printerController;
    if (printer.busy) {
      this.printStatus('Still printing the last one. Please wait…');
      return;
    }
    // One tap = one print: block extra taps until this job has finished
    const btn = this.modal.querySelector('[data-act="print-bt"]');
    if (btn) btn.disabled = true;
    try {
      if (!printer.isConnected) {
        this.printStatus('Connecting to the printer…');
        const ok = await printer.connect();
        if (!ok) {
          this.printStatus(printer.device === null && printer.isSupported()
            ? 'Could not reach the printer. Switch it on and tap print again to choose it.'
            : 'Could not connect to the POS-58 printer. Try the normal printer or save the picture.', 'bad');
          return;
        }
      }
      this.printStatus('Printing… 0%');
      const ok = await printer.printImage(job.canvas, { gamma: WQ_GAMMA, method: 'sheet' }, (pr) => this.printStatus(`Printing… ${Math.round(pr * 100)}%`));
      if (ok) {
        this.printStatus('🎉 Printed! Tear it off carefully.', 'good');
        if (job.onPrinted) job.onPrinted();
      } else {
        this.printStatus(printer.failMessage(), 'bad');
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  printBrowser() {
    const job = this.printJob;
    if (!job) return;
    this.$('wq-print-img').src = job.canvas.toDataURL('image/png');
    document.body.classList.add('print-wq');
    const done = () => {
      document.body.classList.remove('print-wq');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    setTimeout(() => {
      window.print();
      if (job.onPrinted) job.onPrinted();
    }, 100);
  }

  printSave() {
    const job = this.printJob;
    if (!job) return;
    job.canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${job.filename}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      this.printStatus('💾 Saved to Downloads.', 'good');
    }, 'image/png');
  }

  openModal(title, html, size = '') {
    this.$('wq-modal-title').textContent = title;
    this.$('wq-modal-body').innerHTML = html;
    this.$('wq-modal-box').className = `modal-box wq-modal ${size}`;
    this.modal.classList.add('open');
  }

  closeModal() {
    this.modal.classList.remove('open');
    this.printJob = null;
    this.modalOwner = null;
  }
}
