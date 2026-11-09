// Story Spark: daily storytelling practice for UKG to Grade 5.
//   Sentence Gym  listen → echo → words fade → from memory → swap words → use it in today's story.
//                 Practised sentences come back on a spaced schedule until they are second nature.
//   Daily story   spark, tell it by voice or typing, Story Coach (two stars and a wish), tell it better,
//                 record a performance, print the day's Story Receipt.
//   Weekend       quiz on the week's sentences and story skills, Author Stamp and a printed mini book.
// Learners and syncing are shared with Word Quest. Recordings stay on this device.

const ST_BOX_DAYS = [0, 1, 2, 4, 7, 14, 30]; // days until the next review, by memory box
const ST_MASTERED = 5;                       // box at which a sentence counts as known by heart
const ST_PASS = 0.7;                         // share of words that must be heard (speech tools mishear children)
const ST_GAMMA = 1.15;
const ST_KEEP_CLIPS = 30;
const ST_PRAISE = ['Brilliant!', 'Super voice!', 'You got it!', 'Wonderful!', 'Yes!'];

const stCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const stSentence = (s) => {
  const t = stCap(String(s).trim());
  return !t || /[.!?”"]$/.test(t) ? t : `${t}.`;
};

// Speech to text from the browser (free). One sentence per tap: it stops by itself at a pause,
// which also avoids the restart problems long listening has on Android.
const STSpeech = {
  rec: null,
  supported() {
    return Boolean(window.isSecureContext && (window.SpeechRecognition || window.webkitSpeechRecognition));
  },
  start({ onInterim, onEnd, onError }) {
    this.stop();
    if (window.speechSynthesis) speechSynthesis.cancel();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = 'en-IN';
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;
    let text = '';
    let error = '';
    r.onresult = (e) => {
      text = Array.from(e.results).map(x => x[0].transcript).join(' ').trim();
      onInterim(text);
    };
    r.onerror = (e) => { error = e.error; };
    r.onend = () => {
      if (this.rec === r) this.rec = null;
      if (!text && error && error !== 'no-speech' && error !== 'aborted') onError(error);
      else onEnd(text);
    };
    this.rec = r;
    r.start();
  },
  stop() {
    if (this.rec) { try { this.rec.stop(); } catch (e) { /* already stopped */ } }
  },
  errorText(code) {
    if (code === 'not-allowed' || code === 'service-not-allowed') return 'Please allow the microphone, or type instead.';
    if (code === 'network') return 'Voice typing needs the internet. You can type instead.';
    return 'I could not hear that. Please try again.';
  }
};

// Recordings live only on this device, in the browser's database
const STClips = {
  open() {
    if (!this.db) {
      this.db = new Promise((resolve, reject) => {
        const req = indexedDB.open('story_spark', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('clips');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return this.db;
  },
  async tx(mode, fn) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const t = db.transaction('clips', mode);
      const out = fn(t.objectStore('clips'));
      t.oncomplete = () => resolve(out && 'result' in out ? out.result : undefined);
      t.onerror = () => reject(t.error);
    });
  },
  put(key, value) { return this.tx('readwrite', s => s.put(value, key)); },
  get(key) { return this.tx('readonly', s => s.get(key)); },
  del(key) { return this.tx('readwrite', s => s.delete(key)); },
  keys(prefix) { return this.tx('readonly', s => s.getAllKeys(IDBKeyRange.bound(prefix, `${prefix}￿`))); }
};

class StorySpark {
  constructor(app) {
    this.app = app;
    this.store = app.quest.store;
    this.viewEl = document.getElementById('st-view');
    this.view = 'dash';
    this.play = null;
    this.gym = null;
    this.urls = [];
    this.store.listeners.push(() => this.renderChrome());
    this.bind();
  }

  $(id) { return document.getElementById(id); }
  get profile() { return this.store.profile; }
  get story() {
    const p = this.store.progress;
    if (p && !p.story) p.story = WQMerge.cleanProgress({}).story;
    return p ? p.story : WQMerge.cleanProgress({}).story;
  }
  get level() { return ST_LEVELS[this.story.level] || null; }
  todayKey() { return this.app.quest.todayKey(); }
  isSpeak() { return this.level.mode === 'speak'; }
  save(fn) { this.store.update(d => fn(d.progress.story)); }

  weekOf(dateKey) {
    const wk = WQDate.weeksBetween(this.story.start || this.todayKey(), dateKey);
    if (wk < 0) return null;
    const level = this.level;
    const themeIndex = wk % level.weeks.length;
    return { wk, weekNo: wk + 1, themeIndex, theme: level.weeks[themeIndex], level, monday: WQDate.monday(dateKey) };
  }

  dayInfo(dateKey) {
    const dow = WQDate.dow(WQDate.parse(dateKey));
    const info = this.weekOf(dateKey);
    if (!info || dow > 4) return null;
    const words = WQ_TRACKS[info.level.wqTrack].weeks[info.themeIndex].words;
    return { ...info, dateKey, dow, skill: ST_DAYS[dow], sentence: info.theme.sentences[dow], word: words[dow].w };
  }

  canOpen(dateKey) {
    const today = this.todayKey();
    return Boolean(this.story.days[dateKey]) || (dateKey <= today && WQDate.monday(dateKey) === WQDate.monday(today) && Boolean(this.dayInfo(dateKey)));
  }

  // The week's story idea: chosen once, then built on every day
  sparkFor(monday, theme) {
    const s = this.story.sparks[monday];
    return s ? { hero: theme.heroes[s.h], place: theme.places[s.p], problem: theme.problems[s.x] } : null;
  }

  spin(monday, theme) {
    const pick = (n) => Math.floor(Math.random() * n);
    const value = { h: pick(theme.heroes.length), p: pick(theme.places.length), x: pick(theme.problems.length) };
    this.save(st => { st.sparks[monday] = value; });
    return this.sparkFor(monday, theme);
  }

  promptFor(d) {
    const spark = this.sparkFor(d.monday, d.theme) || { hero: d.theme.heroes[0], place: d.theme.places[0], problem: d.theme.problems[0] };
    const seeds = d.level.id === 'seeds';
    return d.level.prompts[d.skill.key]
      .replace('{Hero}', stCap(`the ${spark.hero.t}`))
      .replace('{hero}', seeds ? `the ${spark.hero.t}` : spark.hero.t)
      .replace('{place}', spark.place.t)
      .replace('{problem}', seeds ? stCap(spark.problem.t) : spark.problem.t);
  }

  dueSentences(limit) {
    const today = this.todayKey();
    const map = new Map(Object.values(ST_LEVELS).flatMap(l => l.allSentences).map(s => [s.id, s]));
    return Object.entries(this.story.bank)
      .filter(([id, b]) => b.due && b.due <= today && map.has(id))
      .sort((a, b) => (a[1].due < b[1].due ? -1 : 1)).slice(0, limit).map(([id]) => map.get(id));
  }

  stats() {
    const days = this.story.days;
    const keys = Object.keys(days).filter(k => WQDate.dow(WQDate.parse(k)) < 5).sort();
    const today = this.todayKey();
    let k = today;
    if (WQDate.dow(WQDate.parse(k)) > 4 || !days[k]) k = WQDate.prevWeekday(k);
    let streak = 0;
    while (days[k]) { streak++; k = WQDate.prevWeekday(k); }
    const bank = Object.values(this.story.bank);
    return {
      stories: keys.length, streak,
      sentences: bank.length,
      mastered: bank.filter(b => b.box >= ST_MASTERED).length,
      stamps: Object.values(this.story.quizzes).filter(q => q.tier).length
    };
  }

  // ---------------------------------------------------------------------------
  // Events & navigation
  // ---------------------------------------------------------------------------
  bind() {
    const onClick = (e) => {
      const el = e.target.closest('[data-st]');
      if (el && !el.disabled) this.act(el.dataset.st, el.dataset, el);
    };
    this.viewEl.addEventListener('click', onClick);
    this.$('modal-wq').addEventListener('click', (e) => {
      if (this.app.quest.modalOwner === 'story') onClick(e);
    });
    this.viewEl.addEventListener('input', (e) => {
      if (e.target.dataset.line !== undefined && this.play) this.play.lines[Number(e.target.dataset.line)] = e.target.value;
    });
    this.viewEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'st-type') { e.preventDefault(); this.act('add-typed', {}); }
    });
    this.$('st-back').addEventListener('click', () => this.back());
    this.$('st-me').addEventListener('click', () => this.go('who'));
  }

  act(a, d, el) {
    if (a !== 'say' && !a.startsWith('mic') && window.soundEngine) window.soundEngine.playClick();
    switch (a) {
      case 'go': return this.go(d.v);
      case 'pick': this.store.select(d.key); return this.open();
      case 'new': return this.toQuest('create');
      case 'signin': return this.toQuest('signin');
      case 'profile': return this.toQuest('profile');
      case 'level': return this.setLevel(d.v);
      case 'say': return WQVoice.say(d.text, Number(d.rate) || 0.82);
      case 'start': return this.startLesson(d.day);
      case 'next': return this.nextStep();
      case 'mic-gym': return this.micGym(el);
      case 'gym-self': return this.gymPass(true);
      case 'slot': return this.chooseSlot(Number(d.s), Number(d.o));
      case 'gym-skip-swap': return this.finishGym();
      case 'practice': return this.startPractice(d.id);
      case 'mic-warm': return this.micWarm(el);
      case 'warm-show': return this.warmShow();
      case 'warm-result': return this.warmResult(d.v === '1');
      case 'spin': return this.doSpin();
      case 'mic-line': return this.micLine(el);
      case 'add-typed': return this.addTyped();
      case 'del-line': this.play.lines.splice(Number(d.i), 1); return this.render();
      case 'to-coach': return this.toCoach();
      case 'finish-better': return this.finishBetter();
      case 'rec': return this.toggleRecord();
      case 'rec-keep': return this.keepRecording();
      case 'rec-again': this.play.clip = null; return this.render();
      case 'check': el.classList.toggle('done'); return null;
      case 'finish-seeds': return this.finishSeeds();
      case 'quiz': return this.startQuiz(d.monday);
      case 'answer': return this.answer(Number(d.i), el);
      case 'order': return this.pickOrder(Number(d.i), el);
      case 'quiz-next': return this.quizNext();
      case 'print-day': return this.printReceipt(d.day || (this.play && this.play.d.dateKey));
      case 'print-book': return this.printBook(d.monday);
      case 'print-stamp': return this.printStamp(d.monday);
      case 'print-bank': return this.printBank();
      case 'mentor': return this.openMentor(d.day || (this.play && this.play.d && this.play.d.dateKey));
      case 'mentor-gate': return this.checkGate();
      case 'mentor-open': return this.openGemini();
      case 'close': return this.app.quest.closeModal();
      case 'play-clip': return this.playClip(d.key, el);
      default: return null;
    }
  }

  toQuest(view) {
    const q = this.app.quest;
    q.returnTo = 'story';
    this.app.showScreen('quest');
    if (view === 'create') q.startCreate();
    else q.go(view);
  }

  open() {
    this.app.showScreen('story');
    if (!this.store.current) this.go('who');
    else if (!this.level) this.go('level');
    else { this.go('dash'); this.store.refresh(); }
  }

  stopAll() {
    STSpeech.stop();
    if (window.speechSynthesis) speechSynthesis.cancel();
    this.stopRecorder();
  }

  back() {
    this.stopAll();
    if (['lesson', 'quiz', 'practice'].includes(this.view)) {
      this.play = null;
      this.gym = null;
      return this.go('dash');
    }
    if (this.view === 'dash' || this.view === 'who') return this.app.showScreen('home');
    return this.go(this.store.current && this.level ? 'dash' : 'who');
  }

  go(view) {
    if (!this.store.current) view = 'who';
    this.view = view;
    this.render();
  }

  render() {
    const views = {
      who: () => this.vWho(), level: () => this.vLevel(), dash: () => this.vDash(), lesson: () => this.vLesson(),
      practice: () => this.vPractice(), quiz: () => this.vQuiz(), bank: () => this.vBank(), library: () => this.vLibrary(),
      growth: () => this.vGrowth(), stamps: () => this.vStamps()
    };
    this.urls.forEach(u => URL.revokeObjectURL(u));
    this.urls = [];
    this.viewEl.dataset.view = this.view;
    this.viewEl.innerHTML = (views[this.view] || views.dash)();
    this.viewEl.scrollTop = 0;
    this.renderChrome();
    if (this.view === 'growth') this.fillGrowth();
    if (this.view === 'library') this.markClips();
  }

  renderChrome() {
    const e = this.store.current;
    const me = this.$('st-me');
    if (!me) return;
    me.innerHTML = e ? `<span>${wqEsc(e.avatar)}</span><b>${wqEsc(e.name)}</b>` : '<span>👤</span><b>Sign in</b>';
    const sync = this.$('st-sync');
    const labels = { local: '📱 On this device', saving: '⏳ Saving…', synced: '☁️ Saved', offline: '📴 Offline · saves later', signin: '🔑 Sign in to save' };
    const state = !e ? null : e.kind === 'guest' ? 'local' : this.store.status;
    sync.hidden = !state;
    if (state) { sync.className = `wq-sync s-${state}`; sync.textContent = labels[state]; }
  }

  // ---------------------------------------------------------------------------
  // Who & level
  // ---------------------------------------------------------------------------
  vWho() {
    const cur = this.store.currentKey;
    const cards = this.store.entries.map(e => {
      const st = this.store.loadData(e.key).progress.story;
      const n = Object.keys(st.days).length;
      return `<button class="wq-learner${e.key === cur ? ' current' : ''}" data-st="pick" data-key="${e.key}" style="--c:#db2777">
        <span class="wq-learner-avatar">${wqEsc(e.avatar)}</span><strong>${wqEsc(e.name)}</strong>
        <small>${n ? `${n} stories told` : 'Ready to start'}</small><em>${e.kind === 'account' ? '🔑 Passkey' : '📱 This device'}</em></button>`;
    }).join('');
    return `<div class="wq-welcome">
      <div class="wq-hero st-hero"><div class="wq-hero-icon">🎙️</div><h2>Story Spark</h2><p>Practise powerful sentences, tell a new story every day, and hear yourself grow.</p></div>
      ${cards ? `<div class="wq-section-title">Who is telling a story today?</div><div class="wq-learners">${cards}</div>` : ''}
      <div class="wq-start-actions">
        <button class="btn btn-primary btn-big" data-st="new">✨ New learner</button>
        <button class="btn btn-ghost btn-big" data-st="signin">🔑 I have a passkey</button>
        ${this.store.current ? `<button class="btn btn-ghost btn-big" data-st="go" data-v="level">🎚️ Change level</button><button class="btn btn-ghost btn-big" data-st="profile">⚙️ Profile</button>` : ''}
      </div></div>`;
  }

  vLevel() {
    const suggested = { tiny: 'seeds', sprout: 'sprouts' }[this.profile.track] || 'explorers';
    const cur = this.story.level || suggested;
    return `<div class="wq-form">
      <h2>🎚️ Choose a storytelling level</h2>
      <div class="wq-tracks st-levels">${Object.values(ST_LEVELS).map(l => `
        <button class="wq-track${l.id === cur ? ' active' : ''}" data-st="level" data-v="${l.id}" style="--c:${l.color}">
          <span class="wq-track-icon">${l.icon}</span><strong>${l.label}</strong><small>${l.who}</small><em>${l.blurb}</em></button>`).join('')}</div>
    </div>`;
  }

  setLevel(id) {
    if (this.story.level === id) return this.go('dash');
    if (this.story.level && !confirm(`Switch to ${ST_LEVELS[id].label}? You start at week 1 of that level. Your stories and sentences stay saved.`)) return null;
    const start = WQDate.monday(this.todayKey());
    this.save(st => { st.level = id; st.start = start; st.levelAt = Date.now(); });
    return this.go('dash');
  }

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  vDash() {
    if (!this.level) return this.vLevel();
    const today = this.todayKey();
    const info = this.weekOf(today);
    if (!info) return '<div class="wq-form narrow center"><h2>Your stories start soon!</h2></div>';
    const p = this.profile;
    const s = this.stats();
    const dow = WQDate.dow(WQDate.parse(today));
    const due = this.dueSentences(99).length;
    return `<div class="wq-dash" style="--c:${info.level.color}">
      <div class="wq-hello">
        <span class="wq-hello-avatar">${wqEsc(p.avatar)}</span>
        <div class="wq-hello-text"><h2>Hello, ${wqEsc(p.name)}! 🎙️</h2><small>${info.level.icon} ${info.level.label} · Week ${info.weekNo}: ${wqEsc(info.theme.title)} ${info.theme.stamp}</small></div>
        <div class="wq-stats">
          <div class="${s.streak ? 'hot' : ''}"><b>🔥 ${s.streak}</b><small>day streak</small></div>
          <div><b>📖 ${s.stories}</b><small>stories</small></div>
          <div><b>💪 ${s.mastered}</b><small>by heart</small></div>
        </div>
      </div>
      ${this.weekStrip(info, today, dow)}
      <div class="wq-dash-main">
        ${dow < 5 ? this.todayCard(today, dow) : this.weekendCard(info.monday)}
        <div class="wq-dash-side">
          ${this.pendingTile(info)}
          <button class="wq-tile${due ? ' pending' : ''}" data-st="go" data-v="bank"><span>💪</span><b>Sentence Gym</b><small>${due ? `${due} ready to practise` : `${s.sentences} sentences learned`}</small></button>
          <button class="wq-tile" data-st="go" data-v="library"><span>📚</span><b>My stories</b><small>${s.stories} told</small></button>
          <button class="wq-tile" data-st="go" data-v="growth"><span>🌱</span><b>Hear how you've grown</b><small>First story and latest</small></button>
          <button class="wq-tile" data-st="go" data-v="stamps"><span>🏅</span><b>Author stamps</b><small>${s.stamps} collected</small></button>
        </div>
      </div>
      <button class="link-btn st-link" data-st="go" data-v="level">🎚️ Change level</button>
    </div>`;
  }

  weekStrip(info, today, dow) {
    const cells = ST_DAYS.map((skill, i) => {
      const key = WQDate.addDays(info.monday, i);
      const rec = this.story.days[key];
      const name = WQ_DAYS[i].slice(0, 3);
      if (rec) return `<button class="wq-day done" data-st="start" data-day="${key}"><small>${name}</small><span class="wq-day-icon">${skill.icon}</span><em>${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}</em></button>`;
      if (key === today) return `<button class="wq-day today" data-st="start" data-day="${key}"><small>${name}</small><span class="wq-day-icon">${skill.icon}</span><em>Today</em></button>`;
      if (key < today) return `<button class="wq-day missed" data-st="start" data-day="${key}"><small>${name}</small><span class="wq-day-icon">↺</span><em>Catch up</em></button>`;
      return `<div class="wq-day locked"><small>${name}</small><span class="wq-day-icon">🔒</span><em>${skill.name.split(' ')[0]}</em></div>`;
    }).join('');
    const q = this.story.quizzes[info.monday];
    const cell = q
      ? `<button class="wq-day quiz done tier-${q.tier}" data-st="quiz" data-monday="${info.monday}"><small>Sat–Sun</small><span class="wq-day-icon">${info.theme.stamp}</span><em>${WQ_TIERS[q.tier].name}</em></button>`
      : dow >= 5
        ? `<button class="wq-day quiz today" data-st="quiz" data-monday="${info.monday}"><small>Sat–Sun</small><span class="wq-day-icon">🏆</span><em>Quiz!</em></button>`
        : '<div class="wq-day quiz locked"><small>Sat–Sun</small><span class="wq-day-icon">🏆</span><em>Quiz</em></div>';
    return `<div class="wq-week">${cells}${cell}</div>`;
  }

  todayCard(today, dow) {
    const rec = this.story.days[today];
    const d = this.dayInfo(today);
    if (rec) {
      return `<div class="wq-today learned">
        <div class="wq-today-label">${WQ_DAYS[dow]} · story told ✓</div>
        <div class="wq-today-stars">${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}</div>
        <h3>“${wqEsc(this.myVersion(d.sentence))}”</h3>
        <p>Say today's Power Sentence three more times before bed. New story tomorrow!</p>
        <div class="wq-row">
          <button class="btn btn-dark" data-st="print-day" data-day="${today}">🖨️ Story Receipt</button>
          <button class="btn btn-ghost" data-st="start" data-day="${today}">🔁 Tell it again</button>
          <button class="btn btn-ghost" data-st="mentor" data-day="${today}">🤖 AI mentor</button>
        </div></div>`;
    }
    return `<div class="wq-today mystery">
      <div class="wq-today-label">${d.skill.icon} ${WQ_DAYS[dow]} · ${d.skill.name}</div>
      <div class="wq-gift">🎙️</div>
      <h3>Today's Power Sentence is waiting!</h3>
      <button class="btn btn-primary btn-big" data-st="start" data-day="${today}">Start today's story →</button>
      <button class="link-btn" data-st="print-day" data-day="${today}">🖨️ Print the Story Receipt</button></div>`;
  }

  weekendCard(monday) {
    const info = this.weekOf(monday);
    const q = this.story.quizzes[monday];
    return `<div class="wq-today ${q ? 'quiz-done' : 'quiz-open'}">
      <div class="wq-today-label">🏆 Weekend · Week ${info.weekNo}</div>
      <div class="wq-sticker-big ${q ? `tier-${q.tier}` : 'locked'}"><span>${info.theme.stamp}</span></div>
      <h3>${q ? `${WQ_TIERS[q.tier].name}! ${q.best} / ${q.total}` : `Win the “${wqEsc(info.theme.title)}” Author Stamp!`}</h3>
      <div class="wq-row">
        <button class="btn btn-primary" data-st="quiz" data-monday="${monday}">${q ? '🔁 Try again' : 'Start the quiz →'}</button>
        ${q ? `<button class="btn btn-dark" data-st="print-stamp" data-monday="${monday}">🖨️ Stamp</button>` : ''}
        <button class="btn btn-ghost" data-st="print-book" data-monday="${monday}">📖 Print my book</button>
      </div></div>`;
  }

  pendingTile(info) {
    const last = WQDate.addDays(info.monday, -7);
    const wk = this.weekOf(last);
    if (!wk || this.story.quizzes[last] || ![0, 1, 2, 3, 4].some(i => this.story.days[WQDate.addDays(last, i)])) return '';
    return `<button class="wq-tile pending" data-st="quiz" data-monday="${last}"><span>${wk.theme.stamp}</span><b>Last week's quiz</b><small>Still waiting for you!</small></button>`;
  }

  // ---------------------------------------------------------------------------
  // Daily lesson
  // ---------------------------------------------------------------------------
  startLesson(dateKey) {
    if (!this.canOpen(dateKey)) { this.app.showToast('That day is not ready yet 🔒'); return; }
    const d = this.dayInfo(dateKey);
    if (!d) return;
    const warm = this.dueSentences(this.isSpeak() ? 2 : 3).filter(s => s.id !== d.sentence.id);
    const steps = [...(warm.length ? ['warm'] : []), 'gym', 'spark', 'tell'];
    if (this.isSpeak()) steps.push('check');
    else steps.push('coach', 'better', 'perform');
    steps.push('done');
    this.play = { d, steps, step: 0, warm, warmI: 0, warmShown: false, lines: [], clip: null };
    this.prepareStep();
    this.go('lesson');
  }

  get stepName() { return this.play.steps[this.play.step]; }

  prepareStep() {
    const p = this.play;
    if (this.stepName === 'gym') this.gym = this.newGym(p.d.sentence, () => this.nextStep());
    if (this.stepName === 'warm') setTimeout(() => this.isSpeak() && this.play && WQVoice.say(p.warm[0].text), 300);
    if (this.stepName === 'spark') setTimeout(() => this.isSpeak() && this.play && this.stepName === 'spark' && WQVoice.say(this.promptFor(p.d)), 300);
  }

  nextStep() {
    this.stopAll();
    this.play.step++;
    this.prepareStep();
    this.render();
  }

  stepDots() {
    const p = this.play;
    const icons = { warm: '🔥', gym: '💪', spark: '✨', tell: '🎙️', check: '⭐', coach: '🧑‍🏫', better: '🚀', perform: '🎬', done: '🏁' };
    return `<div class="wq-progress steps">${p.steps.map((s, i) => `<span class="${i < p.step ? 'good' : i === p.step ? 'now' : ''}">${icons[s]}</span>`).join('')}</div>`;
  }

  vLesson() {
    const p = this.play;
    if (!p) return this.vDash();
    const body = { warm: () => this.vWarm(), gym: () => this.vGym(), spark: () => this.vSpark(), tell: () => this.vTell(), check: () => this.vCheck(), coach: () => this.vCoach(), better: () => this.vBetter(), perform: () => this.vPerform(), done: () => this.vDone() }[this.stepName]();
    return `<div class="wq-lesson" style="--c:${p.d.level.color}">${this.stepDots()}${body}</div>`;
  }

  micButton(action, label) {
    if (!STSpeech.supported()) return '';
    return `<button class="st-mic" data-st="${action}"><span>🎙️</span>${label}</button>`;
  }

  // Warm-up: yesterday's sentences, from memory
  vWarm() {
    const p = this.play;
    const s = p.warm[p.warmI];
    const first = s.text.split(' ')[0];
    const speak = this.isSpeak();
    return `<div class="wq-puzzle st-card">
      <div class="wq-q-tag">🔥 Warm-up ${p.warmI + 1} of ${p.warm.length} · from memory</div>
      <div class="st-sentence">${p.warmShown || speak ? wqEsc(s.text) : `${wqEsc(first)} <span class="st-hidden-line">…</span>`}</div>
      <button class="wq-say big" data-st="say" data-text="${wqEsc(p.warmShown || speak ? s.text : first)}">🔊 ${p.warmShown || speak ? 'Listen' : 'Hear the first word'}</button>
      <div class="st-live" id="st-live"></div>
    </div>
    <div class="st-actions">
      ${speak ? `<button class="btn btn-primary btn-big" data-st="warm-result" data-v="1">✅ I said it!</button>` : p.warmShown
        ? `<button class="btn btn-ghost btn-big" data-st="warm-result" data-v="0">🔁 Not yet</button><button class="btn btn-primary btn-big" data-st="warm-result" data-v="1">✅ I knew it</button>`
        : `${this.micButton('mic-warm', 'Tap and say it')}<button class="btn btn-ghost btn-big" data-st="warm-show">👀 Show me</button>`}
    </div>`;
  }

  micWarm(el) {
    const p = this.play;
    this.listen(el, (text) => {
      if (STCoach.matchScore(text, p.warm[p.warmI].text) >= ST_PASS) {
        if (window.soundEngine) window.soundEngine.playCorrect();
        this.warmResult(true);
      } else {
        p.warmShown = true;
        this.render();
        WQVoice.say(p.warm[p.warmI].text);
      }
    });
  }

  warmShow() {
    this.play.warmShown = true;
    this.render();
    WQVoice.say(this.play.warm[this.play.warmI].text);
  }

  warmResult(known) {
    const p = this.play;
    const s = p.warm[p.warmI];
    this.reviewSentence(s.id, known);
    p.warmI++;
    p.warmShown = false;
    if (p.warmI >= p.warm.length) return this.nextStep();
    this.render();
    if (this.isSpeak()) WQVoice.say(p.warm[p.warmI].text);
    return null;
  }

  // Memory boxes: remembered sentences wait longer each time, forgotten ones come back tomorrow
  reviewSentence(id, known) {
    const today = this.todayKey();
    this.save(st => {
      const b = st.bank[id];
      if (!b) return;
      b.box = known ? Math.min(ST_BOX_DAYS.length - 1, b.box + 1) : 1;
      b.due = WQDate.addDays(today, ST_BOX_DAYS[b.box]);
      b.reps += 1;
      b.last = Date.now();
    });
  }

  // ---------------------------------------------------------------------------
  // Sentence Gym: the memorising ladder
  // ---------------------------------------------------------------------------
  newGym(sentence, onDone, short = false) {
    const speak = ST_LEVELS[sentence.level].mode === 'speak';
    const phases = speak
      ? [{ label: 'Say it with me', reps: short ? 2 : 3, hide: 0, voice: true }, { label: 'Now say it by yourself', reps: short ? 1 : 2, hide: 0, voice: false }]
      : [{ label: 'Listen and repeat', reps: short ? 1 : 3, hide: 0, voice: true }, { label: 'Some words hide', reps: short ? 1 : 2, hide: 0.4, voice: false }, { label: 'More words hide', reps: short ? 1 : 2, hide: 0.75, voice: false }, { label: 'From memory', reps: 1, hide: 1, voice: false }];
    const words = sentence.text.split(' ');
    const rng = wqRng(sentence.id);
    const order = wqShuffle(words.map((_, i) => i).slice(1), rng); // the first word stays as a hint
    const g = { sentence, phases, ph: 0, rep: 0, tries: 0, total: 0, words, order, swap: false, chosen: sentence.slots.map(() => 0), onDone, speak };
    setTimeout(() => this.gym === g && WQVoice.say(sentence.text), 350);
    return g;
  }

  gymText(g) {
    let i = 0;
    return g.sentence.parts.reduce((out, part, n) => out + part + (n < g.sentence.slots.length ? g.sentence.slots[n][g.chosen[i++]].text : ''), '');
  }

  vGym() {
    const g = this.gym;
    if (g.swap) return this.vSwap();
    const phase = g.phases[g.ph];
    const hideCount = Math.round(g.order.length * phase.hide);
    const hidden = new Set(g.order.slice(0, hideCount));
    const line = g.words.map((w, i) => (hidden.has(i) ? `<span class="st-blank" style="min-width:${Math.max(2, w.length * 0.55)}em">&nbsp;</span>` : wqEsc(w))).join(' ');
    const canSelf = g.speak || !STSpeech.supported() || g.tries > 0;
    return `<div class="wq-puzzle st-card">
      <div class="wq-q-tag">💪 Power Sentence · ${phase.label}</div>
      <div class="st-sentence">${line}</div>
      <div class="st-reps">${Array.from({ length: phase.reps }, (_, i) => `<i class="${i < g.rep ? 'on' : ''}"></i>`).join('')}</div>
      <button class="wq-say big" data-st="say" data-text="${wqEsc(g.sentence.text)}">🔊 Listen</button>
      <div class="st-live" id="st-live"></div>
    </div>
    <div class="st-actions">
      ${g.speak ? '' : this.micButton('mic-gym', 'Tap and say it')}
      ${canSelf ? `<button class="btn ${g.speak ? 'btn-primary btn-big' : 'btn-ghost btn-big'}" data-st="gym-self">✅ I said it!</button>` : ''}
    </div>`;
  }

  listen(el, onText) {
    if (STSpeech.rec) { STSpeech.stop(); return; }
    const live = this.$('st-live');
    el.classList.add('on');
    if (live) { live.className = 'st-live'; live.textContent = 'Listening…'; }
    STSpeech.start({
      onInterim: (t) => { const l = this.$('st-live'); if (l) l.textContent = t; },
      onEnd: (t) => {
        el.classList.remove('on');
        if (!t) {
          const l = this.$('st-live');
          if (l) l.textContent = 'I did not hear anything. Tap and try again.';
          return;
        }
        onText(t);
      },
      onError: (code) => {
        el.classList.remove('on');
        const l = this.$('st-live');
        if (l) { l.className = 'st-live bad'; l.textContent = STSpeech.errorText(code); }
        if (this.gym) { this.gym.tries++; }
      }
    });
  }

  micGym(el) {
    const g = this.gym;
    this.listen(el, (text) => {
      const target = g.swap ? this.gymText(g) : g.sentence.text;
      if (STCoach.matchScore(text, target) >= ST_PASS) { this.gymPass(); return; }
      g.tries++;
      if (window.soundEngine) window.soundEngine.playIncorrect();
      this.render();
      const l = this.$('st-live');
      if (l) { l.className = 'st-live hint'; l.textContent = `I heard: “${text}”. Listen once more and try again.`; }
    });
  }

  gymPass() {
    const g = this.gym;
    g.tries = 0;
    g.total++;
    if (g.swap) return this.finishGym();
    if (window.soundEngine) window.soundEngine.playStar(g.rep + 1);
    g.rep++;
    const phase = g.phases[g.ph];
    if (g.rep >= phase.reps) {
      g.rep = 0;
      g.ph++;
      if (g.ph >= g.phases.length) {
        g.swap = true;
        this.render();
        return null;
      }
      this.app.showToast(wqPick(ST_PRAISE));
    }
    this.render();
    if (g.phases[g.ph] && g.phases[g.ph].voice) WQVoice.say(g.sentence.text);
    return null;
  }

  vSwap() {
    const g = this.gym;
    return `<div class="wq-puzzle st-card">
      <div class="wq-q-tag">🔀 Make it yours · swap the words</div>
      <div class="st-sentence">${wqEsc(this.gymText(g))}</div>
      <button class="wq-say big" data-st="say" data-text="${wqEsc(this.gymText(g))}">🔊 Listen</button>
      <div class="st-slots">${g.sentence.slots.map((options, s) => `<div class="st-slot-row">${options.map((o, i) => `<button class="sm-chip big${g.chosen[s] === i ? ' active' : ''}" data-st="slot" data-s="${s}" data-o="${i}">${wqEsc(o.label)}</button>`).join('')}</div>`).join('')}</div>
      <div class="st-live" id="st-live"></div>
    </div>
    <div class="st-actions">
      ${g.speak ? '' : this.micButton('mic-gym', 'Say my version')}
      <button class="btn ${g.speak ? 'btn-primary btn-big' : 'btn-ghost btn-big'}" data-st="gym-self">✅ I said it!</button>
    </div>`;
  }

  chooseSlot(s, o) {
    this.gym.chosen[s] = o;
    this.render();
    WQVoice.say(this.gymText(this.gym));
  }

  finishGym() {
    const g = this.gym;
    const today = this.todayKey();
    const mine = this.gymText(g);
    this.save(st => {
      const b = st.bank[g.sentence.id];
      if (b) { b.reps += g.total; b.mine = mine; b.last = Date.now(); } else {
        st.bank[g.sentence.id] = { box: 1, due: WQDate.addDays(today, 1), reps: g.total, at: Date.now(), last: Date.now(), mine };
      }
    });
    if (window.soundEngine) window.soundEngine.playCorrect();
    const done = g.onDone;
    this.gym = null;
    done();
  }

  startPractice(id) {
    const s = Object.values(ST_LEVELS).flatMap(l => l.allSentences).find(x => x.id === id);
    if (!s) return;
    this.play = { practice: true, d: { level: ST_LEVELS[s.level] } };
    this.gym = this.newGym(s, () => {
      this.reviewSentence(id, true);
      this.play = null;
      this.app.showToast('💪 Stronger every time!');
      this.go('bank');
    }, true);
    this.go('practice');
  }

  vPractice() {
    if (!this.gym) return this.vBank();
    return `<div class="wq-lesson" style="--c:${this.play.d.level.color}">${this.vGym()}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Spark & telling the story
  // ---------------------------------------------------------------------------
  doSpin() {
    const d = this.play.d;
    this.spin(d.monday, d.theme);
    this.render();
    if (this.isSpeak()) WQVoice.say(this.promptFor(d));
  }

  vSpark() {
    const d = this.play.d;
    const r = d.theme.retell;
    const tip = d.level.tips[d.skill.key];
    if (d.skill.key === 'retell') {
      return `<div class="wq-puzzle st-card">
        <div class="wq-q-tag">🔁 Retell · ${wqEsc(r.title)}</div>
        <div class="st-pics">${r.pics.map(e => `<span>${e}</span>`).join('')}</div>
        ${this.isSpeak() ? '' : `<div class="st-retell">${r.lines.map(l => `<p>${wqEsc(l)}</p>`).join('')}</div>`}
        <button class="wq-say big" data-st="say" data-text="${wqEsc(r.lines.join(' '))}" data-rate="0.8">🔊 Read me the story</button>
        <p class="st-tip">💡 ${wqEsc(tip)}</p>
      </div>
      <div class="st-actions"><button class="btn btn-primary btn-big" data-st="next">I'm ready to tell it →</button></div>`;
    }
    const spark = this.sparkFor(d.monday, d.theme);
    if (!spark) {
      return `<div class="wq-puzzle st-card"><div class="wq-q-tag">✨ This week's story</div><div class="wq-gift">🎰</div><h3>Spin to find your character, place and problem!</h3></div>
      <div class="st-actions"><button class="btn btn-primary btn-big" data-st="spin">🎲 Spin my story</button></div>`;
    }
    const prompt = this.promptFor(d);
    return `<div class="wq-puzzle st-card">
      <div class="wq-q-tag">${d.skill.icon} ${d.skill.name}</div>
      <div class="st-spark"><span>${spark.hero.e}<small>${wqEsc(spark.hero.t)}</small></span><span>${spark.place.e}<small>${wqEsc(spark.place.t)}</small></span><span>${spark.problem.e}<small>${wqEsc(spark.problem.t)}</small></span></div>
      <div class="wq-q-ask">${wqEsc(prompt)}</div>
      <button class="wq-say big" data-st="say" data-text="${wqEsc(prompt)}">🔊 Listen</button>
      <p class="st-tip">💡 ${wqEsc(tip)}</p>
    </div>
    <div class="st-actions"><button class="btn btn-primary btn-big" data-st="next">Tell my story →</button></div>`;
  }

  // The child's own swapped version of the sentence, once they have made one
  myVersion(sentence) {
    const b = this.story.bank[sentence.id];
    return b && b.mine ? b.mine : sentence.text;
  }

  storyHelpers() {
    const d = this.play.d;
    const mine = this.myVersion(d.sentence);
    return `<div class="st-helpers">
      <button class="wq-chip" data-st="say" data-text="${wqEsc(d.word)}">📚 Word: <b>${wqEsc(d.word)}</b></button>
      <button class="wq-chip same" data-st="say" data-text="${wqEsc(mine)}">💪 ${wqEsc(mine)}</button>
    </div>`;
  }

  linesEditor() {
    const p = this.play;
    return `<div class="st-lines">${p.lines.map((l, i) => `<div class="st-line"><span>${i + 1}</span><input type="text" data-line="${i}" value="${wqEsc(l)}" maxlength="200" autocomplete="off"><button data-st="del-line" data-i="${i}" title="Remove">✕</button></div>`).join('')}</div>`;
  }

  vTell() {
    const p = this.play;
    const d = p.d;
    if (this.isSpeak()) return this.vRecord('🎙️ Tell your story out loud', this.promptFor(d), 'check');
    return `<div class="st-tell">
      <div class="wq-q-ask st-prompt">${wqEsc(d.skill.key === 'retell' ? `Retell “${d.theme.retell.title}” in your own words.` : this.promptFor(d))}</div>
      ${this.storyHelpers()}
      ${this.linesEditor()}
      <div class="st-live" id="st-live"></div>
      <div class="st-entry">
        ${this.micButton('mic-line', 'Tap and say one sentence')}
        <div class="st-type"><input type="text" id="st-type" maxlength="200" placeholder="${STSpeech.supported() ? 'or type a sentence…' : 'Type a sentence…'}" autocomplete="off" enterkeyhint="done"><button class="btn btn-ghost" data-st="add-typed">Add</button></div>
      </div>
      <div class="st-actions"><button class="btn btn-primary btn-big" data-st="to-coach" ${p.lines.length ? '' : 'disabled'}>Done, show my coach →</button></div>
    </div>`;
  }

  micLine(el) {
    this.listen(el, (text) => {
      this.play.lines.push(stSentence(text));
      this.render();
    });
  }

  addTyped() {
    const i = this.$('st-type');
    if (!i || !i.value.trim()) return;
    this.play.lines.push(stSentence(i.value));
    this.render();
    const again = this.$('st-type');
    if (again) again.focus();
  }

  review() {
    const p = this.play;
    return STCoach.review({ sentences: p.lines, level: p.d.level.id, dayKey: p.d.skill.key, power: { ...p.d.sentence, text: this.myVersion(p.d.sentence) }, word: p.d.word });
  }

  toCoach() {
    const p = this.play;
    p.lines = p.lines.map(stSentence).filter(Boolean);
    if (!p.lines.length) return;
    p.first = this.review();
    p.firstLines = p.lines.slice();
    this.nextStep();
    WQVoice.say(`${p.first.stars.map(s => s.text).join(' ')} My wish: ${p.first.wish.text}`, 0.9);
  }

  vCoach() {
    const r = this.play.first;
    return `<div class="wq-puzzle st-card">
      <div class="wq-q-tag">🧑‍🏫 Story Coach</div>
      <div class="st-feedback">${r.stars.map(s => `<div class="st-star"><b>⭐</b><span>${s.icon} ${wqEsc(s.text)}</span></div>`).join('')}
      <div class="st-wish"><b>🌠 My wish</b><span>${wqEsc(r.wish.text)}${r.wish.example ? ` <em>${wqEsc(r.wish.example)}</em>` : ''}</span></div></div>
    </div>
    <div class="st-actions"><button class="btn btn-primary btn-big" data-st="next">Make it even better →</button></div>`;
  }

  vBetter() {
    const r = this.play.first;
    return `<div class="st-tell">
      <div class="st-wish"><b>🌠 Your wish</b><span>${wqEsc(r.wish.text)}${r.wish.example ? ` <em>${wqEsc(r.wish.example)}</em>` : ''}</span></div>
      ${this.storyHelpers()}
      ${this.linesEditor()}
      <div class="st-live" id="st-live"></div>
      <div class="st-entry">
        ${this.micButton('mic-line', 'Add a sentence')}
        <div class="st-type"><input type="text" id="st-type" maxlength="200" placeholder="Add or fix a sentence…" autocomplete="off" enterkeyhint="done"><button class="btn btn-ghost" data-st="add-typed">Add</button></div>
      </div>
      <div class="st-actions"><button class="btn btn-primary btn-big" data-st="finish-better">Finish my story ✓</button></div>
    </div>`;
  }

  saveDay(fields) {
    const p = this.play;
    const key = p.d.dateKey;
    this.save(st => {
      const old = st.days[key];
      st.days[key] = {
        l: p.d.level.id, wk: p.d.themeIndex, at: old ? old.at : Date.now(), printed: old ? old.printed : 0,
        ...fields, stars: Math.max(fields.stars, old ? old.stars : 0)
      };
    });
  }

  finishBetter() {
    const p = this.play;
    p.lines = p.lines.map(stSentence).filter(Boolean);
    const r = this.review();
    p.final = r;
    const coach = [...r.stars.map(s => s.text), `Wish: ${r.wish.text}`].join('|').slice(0, 300);
    this.saveDay({ stars: r.score, words: r.metrics.words, w0: p.first.metrics.words, senses: r.metrics.senseWords, text: p.lines.join(' ').slice(0, 800), coach });
    this.nextStep();
  }

  // ---------------------------------------------------------------------------
  // Recording
  // ---------------------------------------------------------------------------
  vRecord(tag, ask, nextLabel) {
    const p = this.play;
    const d = p.d;
    let main;
    if (p.recording) main = '<button class="st-mic on big" data-st="rec"><span>⏹️</span>Stop</button>';
    else if (p.clip) {
      const url = URL.createObjectURL(p.clip);
      this.urls.push(url);
      main = `<audio controls src="${url}"></audio><div class="wq-row"><button class="btn btn-ghost" data-st="rec-again">🔁 Say it again</button><button class="btn btn-primary btn-big" data-st="rec-keep">Keep it →</button></div>`;
    } else main = '<button class="st-mic big" data-st="rec"><span>⏺️</span>Start recording</button>';
    return `<div class="wq-puzzle st-card">
      <div class="wq-q-tag">${tag}</div>
      ${this.isSpeak() ? `<div class="st-pics">${this.seedPictures(d).map(e => `<span>${e}</span>`).join('')}</div>` : ''}
      <div class="wq-q-ask">${wqEsc(ask)}</div>
      <button class="wq-say big" data-st="say" data-text="${wqEsc(ask)}">🔊 Listen</button>
      ${this.isSpeak() ? `<div class="st-helpers"><button class="wq-chip same" data-st="say" data-text="${wqEsc(this.myVersion(d.sentence))}">💪 ${wqEsc(this.myVersion(d.sentence))}</button></div>` : ''}
      <div class="st-record">${main}</div>
      <p class="st-live${p.recError ? ' bad' : ''}">${wqEsc(p.recError || '')}</p>
    </div>
    <div class="st-actions"><button class="btn btn-ghost" data-st="next">${nextLabel === 'check' ? 'I told it without recording →' : 'Skip →'}</button></div>`;
  }

  seedPictures(d) {
    if (d.skill.key === 'retell') return d.theme.retell.pics;
    const s = this.sparkFor(d.monday, d.theme);
    return s ? [s.hero.e, s.place.e, s.problem.e] : [];
  }

  async toggleRecord() {
    const p = this.play;
    if (p.recording) { this.stopRecorder(); return; }
    p.recError = '';
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        this.recorder = null;
        if (!this.play) return;
        this.play.recording = false;
        this.play.clip = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        this.render();
      };
      this.recorder = rec;
      rec.start();
      p.recording = true;
      if (window.speechSynthesis) speechSynthesis.cancel();
      this.render();
    } catch (e) {
      p.recError = 'Please allow the microphone to record your story.';
      this.render();
    }
  }

  stopRecorder() {
    if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
  }

  clipPrefix() { return `${this.store.currentKey}:`; }

  async keepRecording() {
    const p = this.play;
    try {
      await STClips.put(this.clipPrefix() + p.d.dateKey, { blob: p.clip, at: Date.now() });
      // Keep the very first story and the most recent ones
      const keys = (await STClips.keys(this.clipPrefix())).sort();
      await Promise.all(keys.slice(1, Math.max(1, keys.length - ST_KEEP_CLIPS)).map(k => STClips.del(k)));
    } catch (e) {
      this.app.showToast('Could not save the recording on this device');
    }
    this.nextStep();
  }

  vPerform() {
    return this.vRecord('🎬 Perform your story', 'Now tell your whole story with your best storytelling voice!', 'skip') + `<div class="st-script">${wqEsc(this.play.lines.join(' '))}</div>`;
  }

  // UKG: a grown-up listens and ticks what they heard
  vCheck() {
    return `<div class="wq-puzzle st-card">
      <div class="wq-q-tag">⭐ Grown-up: tick what you heard</div>
      <div class="st-checks">
        <button class="ra-step" data-st="check"><span class="ra-check">1</span>Spoke in a whole sentence</button>
        <button class="ra-step" data-st="check"><span class="ra-check">2</span>Said today's Power Sentence</button>
        <button class="ra-step" data-st="check"><span class="ra-check">3</span>Told what happens in the story</button>
      </div>
      <p class="st-tip">Praise first. Then ask one question: “What happened next?”</p>
    </div>
    <div class="st-actions"><button class="btn btn-primary btn-big" data-st="finish-seeds">Finish ✓</button></div>`;
  }

  finishSeeds() {
    const ticks = this.viewEl.querySelectorAll('.ra-step.done').length;
    this.saveDay({ stars: Math.max(1, ticks), words: 0, w0: 0, senses: 0, text: '', coach: '' });
    this.play.seedStars = Math.max(1, ticks);
    this.nextStep();
  }

  vDone() {
    const p = this.play;
    const rec = this.story.days[p.d.dateKey];
    const stars = rec ? rec.stars : 1;
    setTimeout(() => { window.confettiEngine.burst(); if (window.soundEngine) window.soundEngine.playFanfare(); }, 200);
    const grew = p.final && p.final.metrics.words > p.first.metrics.words ? `Your story grew from ${p.first.metrics.words} to ${p.final.metrics.words} words!` : 'Every story makes you a stronger storyteller.';
    return `<div class="wq-done">
      <div class="wq-done-stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('')}</div>
      <h2>Story told!</h2>
      <p>${wqEsc(grew)}</p>
      <div class="st-sentence small">💪 “${wqEsc(this.myVersion(p.d.sentence))}”</div>
      <p class="wq-note">Say it three more times today, and use it when you talk to someone!</p>
      <div class="wq-row">
        <button class="btn btn-dark btn-big" data-st="print-day">🖨️ Print my Story Receipt</button>
        ${this.isSpeak() ? '' : '<button class="btn btn-ghost btn-big" data-st="mentor">🤖 Grown-up + AI mentor</button>'}
      </div>
      <button class="btn btn-ghost" data-st="go" data-v="dash">🏠 Back to Story Spark</button>
    </div>`;
  }

  // ---------------------------------------------------------------------------
  // Weekend quiz
  // ---------------------------------------------------------------------------
  startQuiz(monday) {
    const info = this.weekOf(monday);
    if (!info || WQDate.addDays(monday, 5) > this.todayKey()) { this.app.showToast('The quiz opens on Saturday 🏆'); return; }
    const rng = wqRng(`${monday}:${Date.now()}`);
    this.play = { quiz: true, monday, info, qs: this.buildQuiz(info, rng), i: 0, right: 0, answered: false, picked: [], clean: true };
    this.go('quiz');
    this.autoSpeak();
  }

  autoSpeak() {
    const q = this.play && this.play.qs[this.play.i];
    if (q && q.say) setTimeout(() => WQWordSafe(q.say), 300);
  }

  buildQuiz(info, rng) {
    const { theme, level } = info;
    const qs = [];
    const orderQ = level.mode === 'speak'
      ? { type: 'order', ask: 'Tap the pictures in story order', say: theme.retell.lines.join(' '), items: theme.retell.pics, big: true }
      : { type: 'order', ask: 'Put the story back in order', items: theme.retell.lines };
    if (level.mode === 'speak') {
      theme.sentences.forEach(s => {
        const slot = s.slots[0];
        const pick = slot[Math.floor(rng() * slot.length)];
        qs.push({ type: 'choice', layout: 'pics', ask: 'Listen. Which picture do you hear?', say: pick.text, answer: pick.label, options: wqShuffle(slot.map(o => o.label), rng), showAs: (o) => o.split(' ')[0] });
      });
      return [...wqShuffle(qs, rng), orderQ];
    }
    const frameWord = (s) => s.parts.join(' ').split(/\s+/).map(w => w.replace(/[^\p{L}-]/gu, '')).filter(w => w.length >= 4).sort((a, b) => b.length - a.length)[0];
    const pool = level.allSentences.map(frameWord).filter(Boolean);
    theme.sentences.forEach(s => {
      const word = frameWord(s);
      if (!word) return;
      const wrong = wqShuffle([...new Set(pool.filter(w => w.toLowerCase() !== word.toLowerCase()))], rng).slice(0, 2);
      qs.push({ type: 'choice', layout: 'words', ask: 'Which word is missing from your Power Sentence?', quote: s.text.replace(new RegExp(`\\b${word}\\b`), '_____'), answer: word, options: wqShuffle([word, ...wrong], rng), say: '' });
    });
    const short = theme.sentences.map(s => s.text).filter(t => t.split(' ').length <= 11);
    if (short.length) {
      const t = wqPick(short, rng);
      qs.push({ type: 'order', ask: 'Build your sentence', items: t.split(' '), inline: true });
    }
    qs.push(orderQ);
    const sense = wqPick(Object.keys(ST_LEX.senses), rng);
    const senseWord = wqPick(ST_LEX.senses[sense].split(' ').filter(w => w.length >= 4), rng);
    qs.push({ type: 'choice', layout: 'words', ask: `Which sense does “${senseWord}” belong to?`, answer: sense, options: Object.keys(ST_LEX.senses), say: '' });
    const parts = [[3, 'the problem'], [4, 'the ending'], [0, 'the beginning']];
    const [day, partName] = wqPick(parts, rng);
    qs.push({ type: 'choice', layout: 'words', ask: 'Which part of a story is this?', quote: theme.sentences[day].text, answer: partName, options: wqShuffle(parts.map(p => p[1]), rng), say: '' });
    const pair = wqPick(ST_BETTER, rng);
    qs.push({ type: 'choice', layout: 'text', ask: 'Which sentence paints a better picture?', answer: pair[1], options: wqShuffle(pair, rng), say: '' });
    return qs;
  }

  vQuiz() {
    const p = this.play;
    if (!p) return this.vDash();
    const color = p.info.level.color;
    if (p.result) return this.vQuizResult();
    const q = p.qs[p.i];
    const bar = `<div class="wq-progress">${p.qs.map((_, i) => `<span class="${i < p.i ? 'good' : i === p.i ? 'now' : ''}"></span>`).join('')}</div>`;
    const head = `<div class="wq-puzzle"><div class="wq-q-tag">Question ${p.i + 1} of ${p.qs.length}</div><div class="wq-q-ask">${wqEsc(q.ask)}</div>${q.quote ? `<div class="wq-q-quote">${wqEsc(q.quote).replace('_____', '<span class="wq-blank">_____</span>')}</div>` : ''}${q.say ? `<button class="wq-say big" data-st="say" data-text="${wqEsc(q.say)}">🔊 Listen</button>` : ''}</div>`;
    let body;
    if (q.type === 'order') {
      if (!p.shuffled) p.shuffled = wqShuffle(q.items.map((t, i) => ({ t, i })));
      const out = p.picked.map(i => wqEsc(q.items[i]));
      body = `<div class="st-built${q.big ? ' big' : ''}${q.inline ? ' inline' : ''}">${out.map(t => `<span>${t}</span>`).join('') || '<em>Tap below…</em>'}</div>
        <div class="st-tiles${q.big ? ' big' : ''}${q.inline ? ' inline' : ''}">${p.shuffled.map((x, n) => `<button class="wq-opt${p.picked.includes(x.i) ? ' used' : ''}" data-st="order" data-i="${n}" ${p.picked.includes(x.i) ? 'disabled' : ''}>${wqEsc(x.t)}</button>`).join('')}</div>`;
    } else {
      body = `<div class="wq-options layout-${q.layout} n-${q.options.length}">${q.options.map((o, i) => `<button class="wq-opt" data-st="answer" data-i="${i}">${wqEsc(q.showAs ? q.showAs(o) : o)}</button>`).join('')}</div>`;
    }
    return `<div class="wq-lesson" style="--c:${color}">${bar}${head}${body}<div class="wq-feedback" id="st-feedback"></div></div>`;
  }

  answer(i, el) {
    const p = this.play;
    const q = p.qs[p.i];
    if (p.answered) return;
    p.answered = true;
    const ok = q.options[i] === q.answer;
    if (ok) p.right++;
    this.viewEl.querySelectorAll('.wq-opt').forEach((b, j) => { b.disabled = true; if (q.options[j] === q.answer) b.classList.add('good'); });
    if (!ok) el.classList.add('bad', 'shake');
    if (window.soundEngine) window.soundEngine[ok ? 'playCorrect' : 'playIncorrect']();
    this.quizFeedback(ok, ok ? wqPick(ST_PRAISE) : `The answer is “${q.showAs ? q.answer.replace(/^\S+\s/, '') : q.answer}”.`);
  }

  pickOrder(n, el) {
    const p = this.play;
    const q = p.qs[p.i];
    const x = p.shuffled[n];
    if (p.answered) return;
    // Same words can repeat, so any tile showing the next word counts
    const nextIndex = p.picked.length;
    if (x.t !== q.items[nextIndex]) {
      p.clean = false;
      el.classList.remove('shake');
      void el.offsetWidth;
      el.classList.add('shake');
      if (window.soundEngine) window.soundEngine.playIncorrect();
      return;
    }
    p.picked.push(x.i);
    if (window.soundEngine) window.soundEngine.playStar(1);
    if (p.picked.length === q.items.length) {
      p.answered = true;
      if (p.clean) p.right++;
      this.render();
      this.quizFeedback(p.clean, p.clean ? wqPick(ST_PRAISE) : 'You got there. Good thinking!');
    } else this.render();
  }

  quizFeedback(good, text) {
    const fb = this.$('st-feedback');
    fb.className = `wq-feedback show ${good ? 'good' : 'bad'}`;
    fb.innerHTML = `<span class="wq-fb-text">${good ? '✓ ' : ''}${wqEsc(text)}</span><button class="btn btn-primary btn-big" data-st="quiz-next">Next →</button>`;
  }

  quizNext() {
    const p = this.play;
    p.i++;
    p.answered = false;
    p.picked = [];
    p.shuffled = null;
    p.clean = true;
    if (p.i >= p.qs.length) return this.finishQuiz();
    this.render();
    this.autoSpeak();
    return null;
  }

  finishQuiz() {
    const p = this.play;
    const total = p.qs.length;
    const pct = p.right / total;
    const tier = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
    p.result = { score: p.right, total, tier };
    this.store.update(d => {
      d.progress = WQMerge.mergeProgress(d.progress, { story: { quizzes: { [p.monday]: { best: p.right, total, tier, tries: ((d.progress.story.quizzes[p.monday] || {}).tries || 0) + 1, at: Date.now() } } } });
    });
    this.render();
    setTimeout(() => { window.confettiEngine.burst(); if (window.soundEngine) window.soundEngine.playFanfare(); }, 200);
  }

  vQuizResult() {
    const p = this.play;
    const best = this.story.quizzes[p.monday];
    return `<div class="wq-lesson" style="--c:${p.info.level.color}"><div class="wq-done">
      <div class="wq-sticker-big tier-${best.tier} reveal"><span>${p.info.theme.stamp}</span></div>
      <h2>${WQ_TIERS[p.result.tier].name}! ${p.result.score} / ${p.result.total}</h2>
      <p>${p.result.tier === 3 ? 'Those sentences are really yours now!' : 'Practise your sentences in the Gym and try again.'}</p>
      <div class="wq-row">
        <button class="btn btn-dark btn-big" data-st="print-stamp" data-monday="${p.monday}">🖨️ Print my stamp</button>
        <button class="btn btn-ghost btn-big" data-st="print-book" data-monday="${p.monday}">📖 Print my book</button>
        ${best.tier < 3 ? `<button class="btn btn-ghost btn-big" data-st="quiz" data-monday="${p.monday}">🔁 Try again</button>` : ''}
      </div>
      <button class="btn btn-ghost" data-st="go" data-v="dash">🏠 Back to Story Spark</button>
    </div></div>`;
  }

  // ---------------------------------------------------------------------------
  // Sentence bank, library, growth, stamps
  // ---------------------------------------------------------------------------
  vBank() {
    const all = new Map(Object.values(ST_LEVELS).flatMap(l => l.allSentences).map(s => [s.id, s]));
    const rows = Object.entries(this.story.bank).filter(([id]) => all.has(id)).sort((a, b) => b[1].at - a[1].at);
    const today = this.todayKey();
    const s = this.stats();
    return `<div class="wq-book">
      <div class="wq-page-head"><h2>💪 Sentence Gym</h2><small>${s.sentences} learned · ${s.mastered} known by heart. Practise until they come out by themselves, then use them when you talk and write.</small></div>
      ${rows.length ? `<button class="btn btn-dark st-print-bank" data-st="print-bank">🖨️ Print my practice card</button>` : ''}
      <div class="st-bank">${rows.map(([id, b]) => {
        const t = all.get(id);
        const line = b.mine || t.text;
        const due = b.due <= today;
        return `<div class="st-bank-row${due ? ' due' : ''}">
          <button class="st-bank-text" data-st="say" data-text="${wqEsc(line)}"><b>${wqEsc(line)}</b><small>${'●'.repeat(Math.min(b.box, ST_MASTERED))}${'○'.repeat(Math.max(0, ST_MASTERED - b.box))} ${b.box >= ST_MASTERED ? 'by heart!' : due ? 'ready to practise' : `next on ${WQDate.label(b.due)}`} · said ${b.reps} times</small></button>
          <button class="btn ${due ? 'btn-primary' : 'btn-ghost'}" data-st="practice" data-id="${id}">💪 Practise</button></div>`;
      }).join('') || '<p class="st-tip">Your Power Sentences appear here after your first story.</p>'}</div></div>`;
  }

  vLibrary() {
    const days = this.story.days;
    const keys = Object.keys(days).sort().reverse();
    return `<div class="wq-book">
      <div class="wq-page-head"><h2>📚 My stories</h2><small>${keys.length} told. Tap a story to hear it.</small></div>
      <div class="st-bank">${keys.map(k => {
        const d = days[k];
        const lv = ST_LEVELS[d.l];
        const wk = lv && lv.weeks[d.wk];
        const dow = WQDate.dow(WQDate.parse(k));
        return `<div class="st-story">
          <div class="st-story-head"><b>${wk ? wk.stamp : '📖'} ${WQ_DAYS[dow]}, ${WQDate.label(k)}</b><span>${'★'.repeat(d.stars)}</span></div>
          ${d.text ? `<button class="st-bank-text" data-st="say" data-text="${wqEsc(d.text)}"><span>${wqEsc(d.text)}</span></button>` : ''}
          <div class="wq-row left">
            <button class="sm-chip st-clip" data-st="play-clip" data-key="${wqEsc(this.clipPrefix() + k)}" hidden>▶ My recording</button>
            <button class="sm-chip" data-st="print-day" data-day="${k}">🖨️ Receipt</button>
            ${d.text ? `<button class="sm-chip" data-st="mentor" data-day="${k}">🤖 AI mentor</button>` : ''}
          </div></div>`;
      }).join('') || '<p class="st-tip">Your stories will live here.</p>'}</div></div>`;
  }

  async markClips() {
    try {
      const keys = new Set(await STClips.keys(this.clipPrefix()));
      this.viewEl.querySelectorAll('.st-clip').forEach(b => { b.hidden = !keys.has(b.dataset.key); });
    } catch (e) { /* recordings unavailable */ }
  }

  async playClip(key, el) {
    const clip = await STClips.get(key);
    if (!clip) return;
    const url = URL.createObjectURL(clip.blob);
    this.urls.push(url);
    const a = document.createElement('audio');
    a.controls = true;
    a.src = url;
    el.replaceWith(a);
    a.play().catch(() => {});
  }

  vGrowth() {
    const days = Object.values(this.story.days).filter(d => d.words).sort((a, b) => a.at - b.at);
    const avg = (list, k) => (list.length ? Math.round(list.reduce((s, d) => s + d[k], 0) / list.length) : 0);
    const first = days.slice(0, 5);
    const last = days.slice(-5);
    const s = this.stats();
    const compare = days.length >= 6;
    return `<div class="wq-book">
      <div class="wq-page-head"><h2>🌱 Hear how you've grown</h2><small>Listen to your first story, then your latest.</small></div>
      <div class="st-growth" id="st-growth"><p class="st-tip">Looking for your recordings…</p></div>
      ${compare ? `<div class="st-compare">
        <div><small>Words in a story</small><b>${avg(first, 'words')} → ${avg(last, 'words')}</b></div>
        <div><small>Sense words</small><b>${avg(first, 'senses')} → ${avg(last, 'senses')}</b></div>
      </div>` : ''}
      <div class="st-compare">
        <div><small>Stories told</small><b>${s.stories}</b></div>
        <div><small>Sentences learned</small><b>${s.sentences}</b></div>
        <div><small>Known by heart</small><b>${s.mastered}</b></div>
      </div>
    </div>`;
  }

  async fillGrowth() {
    const box = this.$('st-growth');
    let html = '<p class="st-tip">Record a story at the end of a lesson, and it will appear here.</p>';
    try {
      const prefix = this.clipPrefix();
      const keys = (await STClips.keys(prefix)).sort();
      if (keys.length) {
        const row = async (key, label) => {
          const clip = await STClips.get(key);
          const url = URL.createObjectURL(clip.blob);
          this.urls.push(url);
          return `<div class="st-clip-row"><b>${label}</b><small>${WQDate.label(key.slice(prefix.length))}</small><audio controls src="${url}"></audio></div>`;
        };
        html = await row(keys[0], '🐣 My first story');
        if (keys.length > 1) html += await row(keys[keys.length - 1], '🌟 My latest story');
      }
    } catch (e) { /* recordings unavailable */ }
    if (this.view === 'growth' && box.isConnected) box.innerHTML = html;
  }

  vStamps() {
    const level = this.level;
    const start = this.story.start;
    const items = Object.entries(this.story.quizzes).sort((a, b) => (a[0] < b[0] ? -1 : 1));
    return `<div class="wq-book">
      <div class="wq-page-head"><h2>🏅 Author stamps</h2><small>Win one every weekend. Tap to print.</small></div>
      <div class="wq-sticker-grid">${items.map(([monday, q]) => {
        const wk = WQDate.weeksBetween(start, monday);
        const theme = wk >= 0 && level ? level.weeks[wk % level.weeks.length] : null;
        return `<button class="wq-sticker tier-${q.tier}" data-st="print-stamp" data-monday="${monday}"><span class="wq-sticker-face">${theme ? theme.stamp : '🏅'}</span><small>${theme ? wqEsc(theme.title) : 'Author'}</small></button>`;
      }).join('') || '<p class="st-tip">Your first stamp is waiting at the weekend quiz.</p>'}</div></div>`;
  }

  // ---------------------------------------------------------------------------
  // Grown-up + AI mentor: copy a ready prompt and open Gemini
  // ---------------------------------------------------------------------------
  openMentor(dateKey) {
    const rec = this.story.days[dateKey];
    if (!rec || !rec.text) { this.app.showToast('Finish your story first'); return; }
    this.mentorKey = dateKey;
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 3 + Math.floor(Math.random() * 6);
    this.mentorAnswer = a * b;
    this.app.quest.modalOwner = 'story';
    this.app.quest.openModal('🤖 For a grown-up', `
      <div class="wq-modal-center">
        <p>This opens an AI chat outside the app, so a grown-up should sit with the child. Grown-up, what is ${a} × ${b}?</p>
        <input type="number" id="st-gate" class="st-gate" inputmode="numeric" autocomplete="off">
        <button class="btn btn-primary btn-big" data-st="mentor-gate">Continue</button>
        <p class="wq-status bad" id="st-gate-msg"></p>
      </div>`);
  }

  mentorPrompt() {
    const key = this.mentorKey;
    const rec = this.story.days[key];
    const lv = ST_LEVELS[rec.l];
    const s = lv.weeks[rec.wk].sentences[WQDate.dow(WQDate.parse(key))];
    return [
      `You are a warm, patient storytelling mentor. A child in ${lv.who} is sitting with a grown-up and will talk to you. Use short, simple words and stay child-safe.`,
      '',
      'Here is the story the child told today:',
      `"""${rec.text}"""`,
      '',
      `Today's practice sentence is: "${s.text}"`,
      '',
      'Please do this, one step at a time, and wait for the child to answer after each step:',
      '1. Say two specific things you liked about the story.',
      '2. Pick at most two sentences to improve. Show the corrected sentence and explain why in one short line.',
      '3. Ask the child to say the corrected sentence aloud three times. Listen, and gently correct any mistakes.',
      '4. Ask one question that helps the child add a detail they can see, hear or feel.',
      '5. Help the child practise the practice sentence and use it in a new sentence of their own.',
      '',
      'Be encouraging, never rewrite the whole story, and do not ask for the child\'s name, school, address or any other personal details.'
    ].join('\n');
  }

  checkGate() {
    const v = Number((this.$('st-gate') || {}).value);
    if (v !== this.mentorAnswer) { this.$('st-gate-msg').textContent = 'Please ask a grown-up to help.'; return; }
    this.app.quest.openModal('🤖 AI mentor prompt', `
      <div class="st-mentor">
        <p class="wq-note">Copy this, open Gemini, paste it and press send. Then use Gemini's microphone to talk. Remove any names or private details from the story first.</p>
        <textarea id="st-prompt" rows="9">${wqEsc(this.mentorPrompt())}</textarea>
        <button class="btn btn-primary btn-big" data-st="mentor-open">📋 Copy and open Gemini</button>
        <p class="wq-note">Children under 13 need a parent to turn on Gemini in Family Link, or can use a parent's account with the parent present.</p>
      </div>`, 'wide');
  }

  async openGemini() {
    const box = this.$('st-prompt');
    // Open first: browsers only allow a new tab straight after a tap
    window.open('https://gemini.google.com/app', '_blank', 'noopener');
    try {
      await navigator.clipboard.writeText(box.value);
    } catch (e) {
      box.select();
      document.execCommand('copy');
    }
    this.app.showToast('📋 Copied! Paste it into Gemini');
  }

  // ---------------------------------------------------------------------------
  // Printing
  // ---------------------------------------------------------------------------
  print(title, canvas, filename, tip, onPrinted = null) {
    this.app.quest.modalOwner = 'story';
    this.app.quest.openPrint(title, canvas, filename, onPrinted, tip);
  }

  receiptCanvas(dateKey) {
    const rec = this.story.days[dateKey];
    const d = this.dayInfoFor(dateKey, rec);
    const pc = new WQCanvas(2400);
    const mid = WQ_PRINT_W / 2;
    const speak = d.level.mode === 'speak';
    WQPrint.header(pc, 'STORY SPARK', d.skill.name.split(' ')[0].toUpperCase());
    pc.gap(26);
    pc.text(`${WQ_DAYS[d.dow]} · ${WQDate.label(dateKey)}`, mid, pc.y, { size: 19, weight: 800, align: 'center' });
    pc.gap(20);
    pc.fitText(`${this.profile.name} · ${d.level.label} · ${d.theme.title}`, mid, pc.y, WQ_PRINT_W - 28, { size: 14, weight: 600, align: 'center' });

    pc.heading('POWER SENTENCE');
    const bank = this.story.bank[d.sentence.id];
    pc.paragraph(bank && bank.mine ? bank.mine : d.sentence.text, { size: 21, weight: 800 });
    pc.gap(24);
    pc.text('Say it 3 times:', pc.m, pc.y, { size: 15, weight: 700 });
    [0, 1, 2].forEach(i => pc.checkbox(WQ_PRINT_W - pc.m - 18 - i * 30, pc.y));

    pc.heading('TODAY’S STORY IDEA');
    pc.paragraph(d.skill.key === 'retell' ? `Retell: ${d.theme.retell.title}` : this.promptFor(d), { size: 16, weight: 600, align: 'left' });
    pc.paragraph(`Word to use: ${d.word}`, { size: 16, weight: 800, align: 'left' });

    if (speak) {
      pc.heading('DRAW YOUR STORY');
      pc.y += 8;
      const w = (WQ_PRINT_W - pc.m * 2 - 16) / 3;
      ['First', 'Next', 'Last'].forEach((label, i) => {
        const x = pc.m + i * (w + 8);
        pc.ctx.lineWidth = 2.5;
        pc.ctx.strokeStyle = '#000';
        pc.roundRect(x, pc.y, w, 130, 12);
        pc.ctx.stroke();
        pc.text(label, x + w / 2, pc.y + 122, { size: 13, weight: 700, align: 'center' });
      });
      pc.y += 130;
    } else if (rec && rec.text) {
      pc.heading('MY STORY');
      pc.paragraph(rec.text, { size: 16, weight: 500, align: 'left' });
      if (rec.coach) {
        pc.heading('STORY COACH');
        rec.coach.split('|').forEach(line => {
          const wish = line.startsWith('Wish:');
          pc.paragraph(`${wish ? '' : '* '}${line}`, { size: 15, weight: wish ? 800 : 600, align: 'left', gap: 3 });
        });
      }
    } else {
      pc.heading('MY STORY');
      [0, 1, 2, 3].forEach(() => pc.writingLine('', { height: 34 }));
    }

    const review = this.dueSentences(2).filter(s => s.id !== d.sentence.id);
    if (review.length) {
      pc.heading('KEEP PRACTISING');
      review.forEach(s => pc.paragraph(s.text, { size: 15, weight: 700, align: 'left', gap: 3 }));
    }

    pc.gap(34);
    pc.checkbox(pc.m, pc.y);
    pc.text('I told this story at home', pc.m + 26, pc.y, { size: 16, weight: 800 });
    pc.gap(30);
    pc.text('To: ____________', pc.m, pc.y, { size: 15, weight: 600 });
    [0, 1, 2].forEach(i => pc.star(WQ_PRINT_W - pc.m - 16 - i * 34, pc.y - 6, 13, Boolean(rec) && i < rec.stars));
    pc.scissorLine();
    return pc.finish();
  }

  // A saved day keeps the level it was told at, even after changing level
  dayInfoFor(dateKey, rec) {
    const now = this.dayInfo(dateKey);
    if (!rec || !ST_LEVELS[rec.l] || (now && now.level.id === rec.l && now.themeIndex === rec.wk)) return now;
    const level = ST_LEVELS[rec.l];
    const theme = level.weeks[rec.wk];
    const dow = WQDate.dow(WQDate.parse(dateKey));
    return { level, theme, themeIndex: rec.wk, weekNo: rec.wk + 1, monday: WQDate.monday(dateKey), dateKey, dow, skill: ST_DAYS[dow], sentence: theme.sentences[dow], word: WQ_TRACKS[level.wqTrack].weeks[rec.wk].words[dow].w };
  }

  printReceipt(dateKey) {
    if (!dateKey || !this.canOpen(dateKey)) return this.app.showToast('That day is not ready yet 🔒');
    const d = this.dayInfo(dateKey);
    if (d && d.dow > 0 && !this.sparkFor(d.monday, d.theme)) this.spin(d.monday, d.theme);
    return this.print('🖨️ Story Receipt', this.receiptCanvas(dateKey), `StorySpark_${dateKey}`, 'Stick it in your notebook and tell the story to someone at home.', () => {
      if (this.story.days[dateKey]) this.save(st => { st.days[dateKey].printed++; });
    });
  }

  printBook(monday) {
    const info = this.weekOf(monday);
    if (!info) return null;
    const pc = new WQCanvas(3000);
    const mid = WQ_PRINT_W / 2;
    WQPrint.header(pc, 'MY STORY BOOK', `WEEK ${info.weekNo}`);
    pc.gap(90);
    pc.text(info.theme.stamp, mid, pc.y, { size: 72, weight: 400, align: 'center' });
    pc.gap(44);
    pc.fitText(info.theme.title, mid, pc.y, WQ_PRINT_W - 28, { size: 30, weight: 900, align: 'center' });
    pc.gap(26);
    pc.text(`by ${this.profile.name}`, mid, pc.y, { size: 18, weight: 700, align: 'center' });
    ST_DAYS.forEach((skill, i) => {
      const rec = this.story.days[WQDate.addDays(monday, i)];
      pc.heading(skill.name.toUpperCase());
      pc.paragraph(rec && rec.text ? rec.text : info.theme.sentences[i].text, { size: 16, weight: 500, align: 'left' });
    });
    pc.heading('THE SENTENCES I LEARNED');
    info.theme.sentences.forEach(s => pc.paragraph((this.story.bank[s.id] || {}).mine || s.text, { size: 15, weight: 700, align: 'left', gap: 3 }));
    pc.gap(30);
    pc.paragraph('The End', { size: 22, weight: 900 });
    pc.scissorLine();
    return this.print(`📖 ${info.theme.title}`, pc.finish(), `StoryBook_Week${info.weekNo}`, 'Fold it, staple it, and read it to your family!');
  }

  printStamp(monday) {
    const q = this.story.quizzes[monday];
    const info = this.weekOf(monday);
    if (!q || !info) return null;
    const canvas = WQPrint.sticker({
      icon: info.theme.stamp, top: 'STORY SPARK', title: info.theme.title, tier: q.tier, name: this.profile.name,
      dateLabel: WQDate.label(WQDate.key(new Date(q.at || Date.now()))), sub: `Author Stamp · ${WQ_TIERS[q.tier].name}`
    });
    return this.print('🏅 Author Stamp', canvas, `StoryStamp_Week${info.weekNo}`, 'Cut it out and stick it in your notebook!');
  }

  printBank() {
    const all = new Map(Object.values(ST_LEVELS).flatMap(l => l.allSentences).map(s => [s.id, s]));
    const today = this.todayKey();
    const rows = Object.entries(this.story.bank).filter(([id]) => all.has(id))
      .sort((a, b) => (a[1].box - b[1].box) || (a[1].due < b[1].due ? -1 : 1)).slice(0, 10);
    const pc = new WQCanvas(2400);
    WQPrint.header(pc, 'STORY SPARK', 'PRACTICE');
    pc.gap(26);
    pc.text(`${this.profile.name} · ${WQDate.label(today)}`, WQ_PRINT_W / 2, pc.y, { size: 17, weight: 800, align: 'center' });
    pc.heading('SAY EACH ONE 3 TIMES');
    rows.forEach(([id, b]) => {
      pc.paragraph(b.mine || all.get(id).text, { size: 18, weight: 700, align: 'left' });
      pc.gap(22);
      [0, 1, 2].forEach(i => pc.checkbox(pc.m + i * 30, pc.y));
      pc.gap(8);
    });
    pc.scissorLine();
    return this.print('💪 Practice card', pc.finish(), 'StorySpark_Practice', 'Keep it near your bed and say them aloud each morning.');
  }
}

function WQWordSafe(text) { WQVoice.say(text, 0.82); }
