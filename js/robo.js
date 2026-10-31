// Robo Academy: a 24-week self-paced course from electricity basics to an AI robot with a web app.
//   Every day: one lesson. Learn the idea (+ YouTube search), answer 2 quick questions,
//              do the hands-on mission, then print a lab sheet with exercises and a QR video link.
//   Every week: a 10-question test. Pass to earn the week's passport stamp and unlock the next week.
// Learners, passkeys and syncing are shared with Word Quest (same store, same database).

const RA_PASS = 0.6;        // 60% passes the weekly test
const RA_DISTINCTION = 0.9; // 90% earns a gold "distinction" stamp
const RA_TEST_LEN = 10;
const RA_GAMMA = 1.15;
const RA_PRAISE = ['Correct!', 'Spot on!', 'Engineer brain!', 'Nailed it!', 'Brilliant!'];

const raId = (day) => `d${String(day).padStart(3, '0')}`;
const raWeekId = (week) => `w${String(week).padStart(2, '0')}`;
const raYoutube = (phrase) => `https://youtube.com/results?search_query=${encodeURIComponent(phrase).replace(/%20/g, '+')}`;

// Resistor colours for the decoder toy
const RA_COLOURS = [
  ['Black', '#111111'], ['Brown', '#8b4513'], ['Red', '#e3141c'], ['Orange', '#f97316'], ['Yellow', '#facc15'],
  ['Green', '#16a34a'], ['Blue', '#2563eb'], ['Violet', '#7c3aed'], ['Grey', '#9ca3af'], ['White', '#ffffff']
];
const raOhms = (v) => (v >= 1e6 ? `${+(v / 1e6).toFixed(2)} MΩ` : v >= 1000 ? `${+(v / 1000).toFixed(2)} kΩ` : `${v} Ω`);

class RoboAcademy {
  constructor(app) {
    this.app = app;
    this.store = app.quest.store; // shared learners
    this.viewEl = document.getElementById('ra-view');
    this.view = 'dash';
    this.play = null;
    this.toy = null;
    this.store.listeners.push(() => this.renderChrome());
    this.bind();
  }

  $(id) {
    return document.getElementById(id);
  }

  get profile() {
    return this.store.profile;
  }

  get robo() {
    const p = this.store.progress;
    if (!p) return { lessons: {}, tests: {} };
    if (!p.robo) p.robo = { lessons: {}, tests: {} };
    return p.robo;
  }

  todayKey() {
    return this.app.quest.todayKey(); // honours ?wqdate= previews
  }

  fastTrack() {
    try { return localStorage.getItem('ra_fast') === '1'; } catch (e) { return false; }
  }

  // ---------------------------------------------------------------------------
  // Progress rules
  // ---------------------------------------------------------------------------
  lessonRec(day) {
    return this.robo.lessons[raId(day)];
  }

  testRec(week) {
    return this.robo.tests[raWeekId(week)];
  }

  isDone(day) {
    return Boolean(this.lessonRec(day));
  }

  weekPassed(week) {
    const t = this.testRec(week);
    return Boolean(t && t.tier >= 1);
  }

  weekLessonsDone(week) {
    return RA_WEEKS[week].lessons.every(l => this.isDone(l.day));
  }

  nextDay() {
    const i = RA_LESSONS.findIndex(l => !this.isDone(l.day));
    return i === -1 ? RA_LESSONS.length : i;
  }

  doneDate(day) {
    const rec = this.lessonRec(day);
    return rec && rec.at ? WQDate.key(new Date(rec.at)) : '';
  }

  // Why a lesson can't be started yet: '' (it can), 'test', 'tomorrow' or 'locked'
  lockReason(day) {
    if (this.isDone(day)) return '';
    if (day !== this.nextDay()) return 'locked';
    if (day === 0) return '';
    const l = RA_LESSONS[day];
    if (l.slot === 0 && !this.weekPassed(l.week - 1)) return 'test';
    if (!this.fastTrack() && this.doneDate(day - 1) >= this.todayKey()) return 'tomorrow';
    return '';
  }

  // The week the learner is working on (the previous one while its test is still pending)
  currentWeek() {
    const next = this.nextDay();
    if (next >= RA_LESSONS.length) return RA_WEEKS.length - 1;
    const l = RA_LESSONS[next];
    return l.slot === 0 && l.week > 0 && !this.weekPassed(l.week - 1) ? l.week - 1 : l.week;
  }

  stats() {
    const lessons = Object.values(this.robo.lessons);
    const tests = Object.values(this.robo.tests);
    const dates = new Set(Object.keys(this.robo.lessons).map(k => (this.robo.lessons[k].at ? WQDate.key(new Date(this.robo.lessons[k].at)) : '')));
    let k = this.todayKey();
    if (!dates.has(k)) k = WQDate.addDays(k, -1);
    let streak = 0;
    while (dates.has(k)) { streak++; k = WQDate.addDays(k, -1); }
    const stamps = tests.filter(t => t.tier >= 1).length;
    return {
      lessons: lessons.length,
      stamps,
      streak,
      xp: lessons.reduce((s, l) => s + l.stars * 10, 0) + tests.reduce((s, t) => s + (t.tier === 2 ? 100 : t.tier === 1 ? 50 : 0), 0)
    };
  }

  stageOf(week) {
    return RA_STAGES[RA_WEEKS[week].stage - 1];
  }

  // ---------------------------------------------------------------------------
  // Events & navigation
  // ---------------------------------------------------------------------------
  bind() {
    const onClick = (e) => {
      const el = e.target.closest('[data-ra]');
      if (el && !el.disabled) this.act(el.dataset.ra, el);
    };
    this.viewEl.addEventListener('click', onClick);
    this.$('modal-wq').addEventListener('click', (e) => {
      if (this.app.quest.modalOwner === 'robo') onClick(e);
    });
    this.$('modal-wq').addEventListener('input', () => {
      if (this.toy && this.app.quest.modalOwner === 'robo') this.updateToy();
    });
    this.$('ra-back').addEventListener('click', () => this.back());
    this.$('ra-me').addEventListener('click', () => this.go('who'));
  }

  act(a, el) {
    const d = el.dataset;
    if (window.soundEngine) window.soundEngine.playClick();
    switch (a) {
      case 'go': return this.go(d.v);
      case 'pick': this.store.select(d.key); return this.go('dash');
      case 'new': return this.toQuest('create');
      case 'signin': return this.toQuest('signin');
      case 'profile': return this.toQuest('profile');
      case 'start': return this.startLesson(Number(d.day));
      case 'next': return this.nextStep();
      case 'answer': return this.answer(Number(d.i), el);
      case 'tick': el.classList.toggle('done'); return null;
      case 'built': return this.finishMission(true);
      case 'later': return this.finishMission(false);
      case 'youtube': return window.open(raYoutube(d.q), '_blank', 'noopener');
      case 'toy': return this.openToy(d.toy);
      case 'test': return this.startTest(Number(d.week));
      case 'print-day': return this.printLabSheet(Number(d.day));
      case 'print-stamp': return this.printStamp(Number(d.week));
      case 'print-list': return this.printShoppingList(Number(d.week));
      case 'stamp': return this.showStamp(Number(d.week));
      case 'kit': return this.toggleKit(d.item, el);
      case 'settings': return this.openSettings();
      case 'fast': return this.setFast(el.checked);
      case 'close': return this.app.quest.closeModal();
      // toys
      case 'band': return this.setBand(Number(d.band), Number(d.c));
      case 'bit': return this.flipBit(Number(d.bit));
      case 'logic-in': return this.flipLogic(d.in);
      case 'gate': return this.setGate(d.gate);
      case 'toy-new': return this.newToyChallenge();
      default: return null;
    }
  }

  // Sign-up, sign-in and profile screens are shared with Word Quest
  toQuest(view) {
    const q = this.app.quest;
    q.returnTo = 'robo';
    this.app.showScreen('quest');
    if (view === 'create') q.startCreate();
    else q.go(view);
  }

  open() {
    this.app.showScreen('robo');
    this.go(this.store.current ? 'dash' : 'who');
    if (this.store.current) this.store.refresh();
  }

  back() {
    if (this.view === 'lesson' || this.view === 'test') {
      if (this.view === 'test' && this.play && this.play.i > 0 && !this.play.finished && !confirm('Leave the test? You can take it again any time.')) return;
      this.play = null;
      return this.go('dash');
    }
    if (this.view === 'dash' || this.view === 'who') return this.app.showScreen('home');
    return this.go(this.store.current ? 'dash' : 'who');
  }

  go(view) {
    if (!this.store.current) view = 'who';
    this.view = view;
    const views = {
      who: () => this.vWho(), dash: () => this.vDash(), lesson: () => this.vLesson(), test: () => this.vTest(),
      passport: () => this.vPassport(), kit: () => this.vKit(), map: () => this.vMap(), lab: () => this.vLab()
    };
    this.viewEl.dataset.view = view;
    this.viewEl.innerHTML = (views[view] || views.dash)();
    this.viewEl.scrollTop = 0;
    this.renderChrome();
  }

  renderChrome() {
    const e = this.store.current;
    const me = this.$('ra-me');
    if (!me) return;
    me.innerHTML = e ? `<span>${wqEsc(e.avatar)}</span><b>${wqEsc(e.name)}</b>` : '<span>👤</span><b>Sign in</b>';
    const sync = this.$('ra-sync');
    const labels = { local: '📱 On this device', saving: '⏳ Saving…', synced: '☁️ Saved', offline: '📴 Offline · saves later', signin: '🔑 Sign in to save' };
    const state = !e ? null : e.kind === 'guest' ? 'local' : this.store.status;
    sync.hidden = !state;
    if (state) {
      sync.className = `wq-sync s-${state}`;
      sync.textContent = labels[state];
    }
  }

  // ---------------------------------------------------------------------------
  // Who's learning
  // ---------------------------------------------------------------------------
  vWho() {
    const cur = this.store.currentKey;
    const cards = this.store.entries.map(e => {
      const robo = (this.store.loadData(e.key).progress.robo || { lessons: {} });
      const done = Object.keys(robo.lessons).length;
      return `
        <button class="wq-learner${e.key === cur ? ' current' : ''}" data-ra="pick" data-key="${e.key}" style="--c:#0f766e">
          <span class="wq-learner-avatar">${wqEsc(e.avatar)}</span>
          <strong>${wqEsc(e.name)}</strong>
          <small>${done ? `Day ${done} of ${RA_LESSONS.length}` : 'Ready to start'}</small>
          <em>${e.kind === 'account' ? '🔑 Passkey' : '📱 This device'}</em>
        </button>`;
    }).join('');
    return `
      <div class="wq-welcome">
        <div class="wq-hero ra-hero">
          <div class="wq-hero-icon">🤖</div>
          <h2>Robo Academy</h2>
          <p>From your first LED to an AI robot with its own app, one lesson a day.</p>
        </div>
        ${cards ? `<div class="wq-section-title">Who's learning today?</div><div class="wq-learners">${cards}</div>` : ''}
        <div class="wq-start-actions">
          <button class="btn btn-primary btn-big" data-ra="new">✨ New learner</button>
          <button class="btn btn-ghost btn-big" data-ra="signin">🔑 I have a passkey</button>
          ${this.store.current ? '<button class="btn btn-ghost btn-big" data-ra="profile">⚙️ Profile & passkey</button>' : ''}
        </div>
        <div class="wq-how ra-how">
          ${RA_STAGES.map(s => `<div style="--c:${s.color}"><span>${s.icon}</span><b>${s.name}</b><small>${s.about}</small></div>`).join('')}
        </div>
        <p class="wq-note center">Learners are shared with Word Quest: one learner card and one passkey for both.</p>
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  vDash() {
    const p = this.profile;
    const s = this.stats();
    const week = this.currentWeek();
    const stage = this.stageOf(week);
    const pct = Math.round((s.lessons / RA_LESSONS.length) * 100);
    const segs = RA_STAGES.map(st => {
      const days = RA_LESSONS.filter(l => l.stage === st.id);
      const done = days.filter(l => this.isDone(l.day)).length;
      return `<div class="ra-seg" style="--c:${st.color}" title="${st.name}"><i style="width:${(done / days.length) * 100}%"></i><span>${st.icon}</span></div>`;
    }).join('');
    const next = RA_WEEKS[week + 1];
    return `
      <div class="wq-dash ra-dash" style="--c:${stage.color}">
        <div class="wq-hello">
          <span class="wq-hello-avatar">${wqEsc(p.avatar)}</span>
          <div class="wq-hello-text">
            <h2>Hi ${wqEsc(p.name)}! 👋</h2>
            <small>${stage.icon} Rank: ${stage.name} · Week ${week + 1}: ${wqEsc(RA_WEEKS[week].title)}</small>
          </div>
          <div class="wq-stats">
            <div class="${s.streak ? 'hot' : ''}"><b>🔥 ${s.streak}</b><small>day streak</small></div>
            <div><b>⭐ ${s.xp}</b><small>XP</small></div>
            <div><b>🛂 ${s.stamps}</b><small>stamps</small></div>
          </div>
        </div>
        <div class="ra-progress"><div class="ra-segs">${segs}</div><small>${s.lessons} of ${RA_LESSONS.length} lessons · ${pct}% of the way to AI Roboticist</small></div>
        ${this.weekStrip(week)}
        <div class="wq-dash-main">
          ${this.todayCard()}
          <div class="wq-dash-side">
            <button class="wq-tile" data-ra="go" data-v="passport"><span>🛂</span><b>Stamp passport</b><small>${s.stamps} of ${RA_WEEKS.length} stamps</small></button>
            <button class="wq-tile${next && next.parts.length ? ' pending' : ''}" data-ra="go" data-v="kit"><span>🛒</span><b>Parts list</b><small>${next && next.parts.length ? `Order for week ${week + 2}: ${next.parts.length} items` : 'Everything you will need'}</small></button>
            <button class="wq-tile" data-ra="go" data-v="lab"><span>🧪</span><b>Lab simulators</b><small>Play with circuits on screen</small></button>
            <button class="wq-tile" data-ra="go" data-v="map"><span>🗺️</span><b>Course map</b><small>All 6 stages, 24 weeks</small></button>
          </div>
        </div>
        <button class="link-btn ra-settings-link" data-ra="settings">⚙️ Grown-up settings</button>
      </div>`;
  }

  weekStrip(week) {
    const w = RA_WEEKS[week];
    const cells = w.lessons.map(l => {
      const rec = this.lessonRec(l.day);
      if (rec) return `<button class="wq-day done" data-ra="start" data-day="${l.day}"><small>Day ${l.day + 1}</small><span class="wq-day-icon">${l.e}</span><em>${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}</em></button>`;
      const why = this.lockReason(l.day);
      if (!why) return `<button class="wq-day today" data-ra="start" data-day="${l.day}"><small>Day ${l.day + 1}</small><span class="wq-day-icon">🎁</span><em>Today</em></button>`;
      return `<div class="wq-day locked"><small>Day ${l.day + 1}</small><span class="wq-day-icon">${why === 'tomorrow' ? '🌙' : '🔒'}</span><em>${why === 'tomorrow' ? 'Tomorrow' : 'Soon'}</em></div>`;
    }).join('');
    const t = this.testRec(week);
    const ready = this.weekLessonsDone(week);
    const testCell = t && t.tier
      ? `<button class="wq-day quiz done tier-${t.tier === 2 ? 3 : 2}" data-ra="stamp" data-week="${week}"><small>Test</small><span class="wq-day-icon">${w.stamp}</span><em>${t.tier === 2 ? 'Distinction' : 'Passed'}</em></button>`
      : ready
        ? `<button class="wq-day quiz today" data-ra="test" data-week="${week}"><small>Test</small><span class="wq-day-icon">📝</span><em>Ready!</em></button>`
        : `<div class="wq-day quiz locked"><small>Test</small><span class="wq-day-icon">🛂</span><em>Stamp</em></div>`;
    return `<div class="wq-week">${cells}${testCell}</div>`;
  }

  todayCard() {
    const day = this.nextDay();
    if (day >= RA_LESSONS.length) {
      const last = RA_WEEKS.length - 1;
      if (!this.weekPassed(last)) return this.testCard(last);
      return `
        <div class="wq-today learned">
          <div class="wq-today-label">Course complete</div>
          <div class="wq-gift">🎓</div>
          <h3>You are an AI Roboticist!</h3>
          <p>All 120 lessons and 24 stamps. Keep inventing, and teach someone else what you learned!</p>
          <button class="btn btn-dark" data-ra="go" data-v="passport">🛂 See my passport</button>
        </div>`;
    }
    const l = RA_LESSONS[day];
    const why = this.lockReason(day);
    if (why === 'test') return this.testCard(l.week - 1);
    const stage = RA_STAGES[l.stage - 1];
    if (why === 'tomorrow') {
      const prev = RA_LESSONS[day - 1];
      return `
        <div class="wq-today learned">
          <div class="wq-today-label">Today's mission complete ✓</div>
          <div class="wq-gift">🌙</div>
          <h3>Day ${day + 1} unlocks tomorrow</h3>
          <p>Coming up: <b>${l.e} ${wqEsc(l.t)}</b>. Finish today's mission and exercises on your lab sheet!</p>
          <div class="wq-row">
            <button class="btn btn-dark" data-ra="print-day" data-day="${prev.day}">🖨️ Print lab sheet</button>
            <button class="btn btn-ghost" data-ra="start" data-day="${prev.day}">🔁 Review Day ${prev.day + 1}</button>
          </div>
        </div>`;
    }
    return `
      <div class="wq-today mystery">
        <div class="wq-today-label">${stage.icon} Day ${day + 1} · Week ${l.week + 1} · Lesson ${l.slot + 1} of 5</div>
        <div class="wq-gift ra-today-emoji">${l.e}</div>
        <h3>${wqEsc(l.t)}</h3>
        <button class="btn btn-primary btn-big" data-ra="start" data-day="${day}">Start today's lesson →</button>
        <button class="link-btn" data-ra="print-day" data-day="${day}">🖨️ Print today's lab sheet</button>
      </div>`;
  }

  testCard(week) {
    const w = RA_WEEKS[week];
    const t = this.testRec(week);
    return `
      <div class="wq-today quiz-open">
        <div class="wq-today-label">📝 Weekly test · Week ${week + 1}</div>
        <div class="ra-stamp big locked" style="--c:${this.stageOf(week).color}"><span>${w.stamp}</span><small>WEEK ${week + 1}</small></div>
        <h3>Collect the “${wqEsc(w.title)}” stamp!</h3>
        <p>${RA_TEST_LEN} questions · pass with 60% · 90% for a gold distinction stamp${t ? ` · best so far ${t.best}/${t.total}` : ''}</p>
        <button class="btn btn-primary btn-big" data-ra="test" data-week="${week}">Take the test →</button>
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Lesson: learn → 2 questions → mission → done
  // ---------------------------------------------------------------------------
  startLesson(day) {
    const why = this.lockReason(day);
    if (why) {
      this.app.showToast(why === 'tomorrow' ? '🌙 This lesson unlocks tomorrow' : why === 'test' ? '📝 Pass the weekly test first' : '🔒 Finish the earlier lessons first');
      return;
    }
    const l = RA_LESSONS[day];
    const rng = wqRng(`${day}:${Date.now()}`);
    const qs = wqShuffle(l.q, rng).slice(0, 2).map(q => ({ ...q, options: wqShuffle([q.a, ...q.w], rng) }));
    this.play = { mode: 'lesson', l, step: 'learn', qs, qi: 0, firstTry: [], answered: false, again: this.isDone(day) };
    this.go('lesson');
  }

  stepBar() {
    const p = this.play;
    const steps = [['learn', '📖', 'Learn'], ['q0', '1', 'Quiz'], ['q1', '2', 'Quiz'], ['mission', '🔧', 'Mission'], ['done', '🏁', 'Done']];
    const order = steps.map(s => s[0]);
    const cur = order.indexOf(p.step === 'quiz' ? `q${p.qi}` : p.step);
    return `<div class="wq-progress steps">${steps.map((s, i) => `<span class="${i < cur ? 'good' : i === cur ? 'now' : ''}" title="${s[2]}">${s[1]}</span>`).join('')}</div>`;
  }

  vLesson() {
    const p = this.play;
    if (!p) return this.vDash();
    const l = p.l;
    const stage = RA_STAGES[l.stage - 1];
    const wrap = (inner) => `<div class="wq-lesson ra-lesson" style="--c:${stage.color}">${this.stepBar()}${inner}</div>`;

    if (p.step === 'learn') {
      return wrap(`
        <div class="ra-learn">
          <div class="ra-learn-head">
            <span class="ra-learn-emoji">${l.e}</span>
            <div><div class="wq-q-tag">${stage.icon} ${stage.name} · Day ${l.day + 1} · Week ${l.week + 1}</div><h2>${wqEsc(l.t)}</h2></div>
          </div>
          <p class="ra-concept">${wqEsc(l.c)}</p>
          <div class="ra-facts">${l.k.map(k => `<div class="ra-fact">💡 ${wqEsc(k)}</div>`).join('')}</div>
          ${l.code ? `<pre class="ra-code">${wqEsc(l.code)}</pre>` : ''}
          ${l.fun ? `<div class="ra-fun">🤩 <b>Fun fact:</b> ${wqEsc(l.fun)}</div>` : ''}
          <div class="wq-row ra-learn-links">
            <button class="btn btn-ghost" data-ra="youtube" data-q="${wqEsc(l.yt)}">🎬 Watch videos: “${wqEsc(l.yt)}”</button>
            ${l.toy ? `<button class="btn btn-ghost" data-ra="toy" data-toy="${l.toy}">🧪 Try it in the Lab</button>` : ''}
          </div>
        </div>
        <div class="wq-lesson-actions">
          <button class="btn btn-ghost" data-ra="print-day" data-day="${l.day}">🖨️ Print lab sheet</button>
          <button class="btn btn-primary btn-big" data-ra="next">Quick quiz →</button>
        </div>`);
    }

    if (p.step === 'quiz') {
      const q = p.qs[p.qi];
      return wrap(`
        <div class="wq-puzzle">
          <div class="wq-q-tag">Question ${p.qi + 1} of 2</div>
          <div class="wq-q-ask">${wqEsc(q.q)}</div>
        </div>
        <div class="wq-options layout-words n-3">${q.options.map((o, i) => `<button class="wq-opt" data-ra="answer" data-i="${i}">${wqEsc(o)}</button>`).join('')}</div>
        <div class="wq-feedback" id="ra-feedback"></div>`);
    }

    if (p.step === 'mission') {
      const w = RA_WEEKS[l.week];
      return wrap(`
        <div class="ra-mission">
          <div class="wq-q-tag">🔧 Today's mission · ${wqEsc(l.t)}</div>
          <h3>Hands-on time! Tick each step as you do it.</h3>
          <div class="ra-steps">${l.m.map((m, i) => `<button class="ra-step" data-ra="tick"><span class="ra-check">${i + 1}</span>${wqEsc(m)}</button>`).join('')}</div>
          ${w.parts.length && l.slot === 0 ? `<div class="ra-parts">🧰 <b>Parts for this week:</b> ${w.parts.map(wqEsc).join(' · ')}</div>` : ''}
          <div class="ra-exercise">✏️ <b>Exercise for your lab sheet:</b><ol>${l.x.map(([q]) => `<li>${wqEsc(q)}</li>`).join('')}</ol></div>
          <p class="wq-note">Ask a grown-up to help with anything hot, sharp or powered. Can't build today? Do the paper parts and build it later.</p>
        </div>
        <div class="wq-lesson-actions">
          <button class="btn btn-ghost" data-ra="later">📝 I'll build it later</button>
          <button class="btn btn-primary btn-big" data-ra="built">✅ I did the mission!</button>
        </div>`);
    }

    return this.vLessonDone();
  }

  answer(i, el) {
    const p = this.play;
    if (!p || p.answered) return;
    const q = p.mode === 'test' ? p.qs[p.i] : p.qs[p.qi];
    const idx = p.mode === 'test' ? p.i : p.qi;
    const correct = q.options[i] === q.a;
    if (p.firstTry[idx] === undefined) p.firstTry[idx] = correct;
    const fb = this.$('ra-feedback');
    if (correct) {
      el.classList.add('good');
      p.answered = true;
      this.viewEl.querySelectorAll('.wq-opt').forEach(b => { b.disabled = true; });
      if (window.soundEngine) window.soundEngine.playCorrect();
      fb.className = 'wq-feedback show good';
      fb.innerHTML = `<span class="wq-fb-text">✓ ${wqPick(RA_PRAISE)}</span><button class="btn btn-primary btn-big" data-ra="next">Next →</button>`;
      return;
    }
    el.classList.add('bad', 'shake');
    el.disabled = true;
    if (window.soundEngine) window.soundEngine.playIncorrect();
    if (p.mode === 'test') {
      p.answered = true;
      this.viewEl.querySelectorAll('.wq-opt').forEach((b, j) => {
        b.disabled = true;
        if (q.options[j] === q.a) b.classList.add('good');
      });
      fb.className = 'wq-feedback show bad';
      fb.innerHTML = `<span class="wq-fb-text">The answer is “${wqEsc(q.a)}”.</span><button class="btn btn-primary btn-big" data-ra="next">Next →</button>`;
    } else {
      fb.className = 'wq-feedback show hint';
      fb.innerHTML = '<span class="wq-fb-text">Not quite. Think about the key facts and try again! 💪</span>';
    }
  }

  nextStep() {
    const p = this.play;
    if (!p) return;
    p.answered = false;
    if (p.mode === 'test') {
      p.i++;
      if (p.i >= p.qs.length) return this.finishTest();
      return this.go('test');
    }
    if (p.step === 'learn') p.step = 'quiz';
    else if (p.step === 'quiz') {
      if (p.qi < p.qs.length - 1) p.qi++;
      else p.step = 'mission';
    }
    this.go('lesson');
  }

  finishMission(built) {
    const p = this.play;
    const quizStars = p.firstTry.filter(Boolean).length;
    const stars = Math.max(1, quizStars + (built ? 1 : 0));
    const id = raId(p.l.day);
    const before = this.stats().xp;
    this.store.update(d => {
      d.progress = WQMerge.mergeProgress(d.progress, { robo: { lessons: { [id]: { stars, built: built ? 1 : 0, at: Date.now(), printed: 0 } }, tests: {} } });
    });
    p.stars = this.lessonRec(p.l.day).stars;
    p.xp = this.stats().xp - before;
    p.built = built;
    p.step = 'done';
    this.go('lesson');
    setTimeout(() => {
      window.confettiEngine.burst();
      if (window.soundEngine) window.soundEngine.playFanfare();
    }, 250);
  }

  vLessonDone() {
    const p = this.play;
    const l = p.l;
    const nextWeek = RA_WEEKS[l.week + 1];
    const weekDone = this.weekLessonsDone(l.week);
    const nextLesson = RA_LESSONS[l.day + 1];
    const fast = this.fastTrack();
    return `
      <div class="wq-done">
        <div class="wq-done-stars">${[1, 2, 3].map(i => `<span class="${i <= p.stars ? 'on' : ''}">★</span>`).join('')}</div>
        <div class="wq-done-word"><span>${l.e}</span>${wqEsc(l.t)}</div>
        <h2>${p.again ? 'Lesson reviewed!' : `Day ${l.day + 1} complete!`}${p.xp > 0 ? ` +${p.xp} XP` : ''}</h2>
        <p>${p.built ? 'Mission built. You are thinking like a real engineer!' : 'Remember to build the mission when you can. Your lab sheet has the steps.'}</p>
        <div class="wq-row">
          <button class="btn btn-dark btn-big" data-ra="print-day" data-day="${l.day}">🖨️ Print my lab sheet</button>
          ${weekDone && !this.weekPassed(l.week) ? `<button class="btn btn-primary btn-big" data-ra="test" data-week="${l.week}">📝 Weekly test →</button>` : ''}
          ${!weekDone && nextLesson && fast ? `<button class="btn btn-primary btn-big" data-ra="start" data-day="${nextLesson.day}">Next lesson →</button>` : ''}
        </div>
        ${nextWeek && nextWeek.parts.length && l.slot >= 2 ? `
          <div class="ra-order">🛒 <b>Ask a grown-up to order for next week (${wqEsc(nextWeek.title)}):</b> ${nextWeek.parts.map(wqEsc).join(' · ')}
            <button class="link-btn" data-ra="print-list" data-week="${l.week + 1}">🖨️ Print the list</button></div>` : ''}
        <p class="wq-note">${!weekDone && nextLesson && !fast ? `🌙 Day ${l.day + 2} unlocks tomorrow. ` : ''}Solve the exercise on your lab sheet and stick it in your engineering notebook!</p>
        <button class="btn btn-ghost" data-ra="go" data-v="dash">🏠 Back to my academy</button>
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Weekly test
  // ---------------------------------------------------------------------------
  startTest(week) {
    if (!this.weekLessonsDone(week)) {
      this.app.showToast('📚 Finish all 5 lessons of the week first');
      return;
    }
    const w = RA_WEEKS[week];
    const rng = wqRng(`${week}:${Date.now()}`);
    const pool = w.lessons.flatMap(l => l.q.map(q => ({ ...q, e: l.e })));
    const qs = wqShuffle(pool, rng).slice(0, RA_TEST_LEN).map(q => ({ ...q, options: wqShuffle([q.a, ...q.w], rng) }));
    this.play = { mode: 'test', week, qs, i: -1, firstTry: [], answered: false };
    this.go('test');
  }

  vTest() {
    const p = this.play;
    if (!p) return this.vDash();
    const w = RA_WEEKS[p.week];
    const color = this.stageOf(p.week).color;
    if (p.i === -1) {
      const t = this.testRec(p.week);
      return `
        <div class="wq-lesson" style="--c:${color}">
          <div class="wq-quiz-intro">
            <div class="wq-q-tag">📝 Weekly test · Week ${p.week + 1}</div>
            <div class="ra-stamp big ${t && t.tier ? `tier-${t.tier}` : 'locked'}" style="--c:${color}"><span>${w.stamp}</span><small>WEEK ${p.week + 1}</small></div>
            <h2>${wqEsc(w.title)}</h2>
            <p>${p.qs.length} questions from this week's 5 lessons. One try each, no timer. Pass with ${Math.ceil(p.qs.length * RA_PASS)} correct to collect your stamp; ${Math.ceil(p.qs.length * RA_DISTINCTION)} or more earns the gold distinction stamp!</p>
            <div class="wq-quiz-words">${w.lessons.map(l => `<span class="wq-chip">${l.e} ${wqEsc(l.t)}</span>`).join('')}</div>
            <button class="btn btn-primary btn-big" data-ra="next">Start the test →</button>
          </div>
        </div>`;
    }
    if (p.finished) return this.vTestResult();
    const q = p.qs[p.i];
    return `
      <div class="wq-lesson" style="--c:${color}">
        <div class="wq-progress">${p.qs.map((_, i) => `<span class="${i < p.i ? (p.firstTry[i] ? 'good' : 'bad') : i === p.i ? 'now' : ''}"></span>`).join('')}</div>
        <div class="wq-puzzle">
          <div class="wq-q-tag">Question ${p.i + 1} of ${p.qs.length}</div>
          <div class="wq-q-emoji small">${q.e}</div>
          <div class="wq-q-ask">${wqEsc(q.q)}</div>
        </div>
        <div class="wq-options layout-words n-3">${q.options.map((o, i) => `<button class="wq-opt" data-ra="answer" data-i="${i}">${wqEsc(o)}</button>`).join('')}</div>
        <div class="wq-feedback" id="ra-feedback"></div>
      </div>`;
  }

  finishTest() {
    const p = this.play;
    const score = p.firstTry.filter(Boolean).length;
    const total = p.qs.length;
    const tier = score / total >= RA_DISTINCTION ? 2 : score / total >= RA_PASS ? 1 : 0;
    const id = raWeekId(p.week);
    const old = this.testRec(p.week);
    p.finished = true;
    p.result = { score, total, tier, firstStamp: tier >= 1 && !(old && old.tier >= 1) };
    this.store.update(d => {
      d.progress = WQMerge.mergeProgress(d.progress, {
        robo: { lessons: {}, tests: { [id]: { best: score, total, tier, tries: ((old && old.tries) || 0) + 1, at: Date.now() } } }
      });
    });
    this.go('test');
    if (tier >= 1) {
      setTimeout(() => {
        window.confettiEngine.burst();
        if (window.soundEngine) window.soundEngine.playFanfare();
      }, 250);
    }
  }

  vTestResult() {
    const p = this.play;
    const { score, total, tier } = p.result;
    const best = this.testRec(p.week);
    const w = RA_WEEKS[p.week];
    const color = this.stageOf(p.week).color;
    const next = RA_WEEKS[p.week + 1];
    const stageUp = next && next.stage !== w.stage;
    const msg = tier === 2 ? 'Distinction! A gold stamp for your passport!' : tier === 1 ? 'Passed! The stamp is yours and next week is unlocked.' : `So close! You need ${Math.ceil(total * RA_PASS)} to pass. Review the lessons and try again, as many times as you like.`;
    return `
      <div class="wq-lesson" style="--c:${color}">
        <div class="wq-done">
          <div class="ra-stamp big ${best.tier ? `tier-${best.tier} reveal` : 'locked'}" style="--c:${color}"><span>${w.stamp}</span><small>${best.tier === 2 ? 'DISTINCTION' : best.tier ? 'PASSED' : `WEEK ${p.week + 1}`}</small></div>
          <h2>${score} / ${total}</h2>
          <p>${msg}${tier === 0 && best.tier ? ` (Your stamp from an earlier try is safe: ${best.best}/${best.total}.)` : ''}</p>
          ${tier >= 1 && stageUp ? `<div class="ra-order">🎉 <b>New rank unlocked:</b> ${RA_STAGES[next.stage - 1].icon} ${RA_STAGES[next.stage - 1].name}!</div>` : ''}
          <div class="wq-row">
            ${best.tier ? `<button class="btn btn-dark btn-big" data-ra="print-stamp" data-week="${p.week}">🖨️ Print my stamp</button>` : ''}
            ${best.tier < 2 ? `<button class="btn btn-ghost btn-big" data-ra="test" data-week="${p.week}">🔁 Try again</button>` : ''}
          </div>
          ${next && next.parts.length && tier >= 1 ? `<div class="ra-order">🛒 <b>Parts for week ${p.week + 2}:</b> ${next.parts.map(wqEsc).join(' · ')}</div>` : ''}
          <div class="wq-row">
            <button class="btn btn-ghost" data-ra="go" data-v="passport">🛂 My passport</button>
            <button class="btn btn-ghost" data-ra="go" data-v="dash">🏠 My academy</button>
          </div>
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Passport, parts list, course map
  // ---------------------------------------------------------------------------
  stampCell(week) {
    const w = RA_WEEKS[week];
    const t = this.testRec(week);
    const got = t && t.tier >= 1;
    return `
      <button class="ra-stamp ${got ? `tier-${t.tier}` : 'locked'}" style="--c:${this.stageOf(week).color}; --r:${((week * 37) % 9) - 4}deg" data-ra="stamp" data-week="${week}">
        <span>${w.stamp}</span><small>WEEK ${week + 1}</small><em>${wqEsc(w.title)}</em>
      </button>`;
  }

  vPassport() {
    const s = this.stats();
    return `
      <div class="wq-book">
        <div class="wq-page-head"><h2>🛂 Engineer's Passport</h2><small>${s.stamps} of ${RA_WEEKS.length} stamps · pass each weekly test to collect its stamp · tap one to print it</small></div>
        ${RA_STAGES.map(st => `
          <div class="wq-section-title">${st.icon} Stage ${st.id}: ${st.name}</div>
          <div class="ra-stamp-grid">${RA_WEEKS.map((w, i) => (w.stage === st.id ? this.stampCell(i) : '')).join('')}</div>`).join('')}
      </div>`;
  }

  showStamp(week) {
    const t = this.testRec(week);
    if (t && t.tier >= 1) return this.printStamp(week);
    const w = RA_WEEKS[week];
    const ready = this.weekLessonsDone(week);
    this.app.quest.modalOwner = 'robo';
    this.app.quest.openModal('🔒 Not collected yet', `
      <div class="wq-modal-center">
        <div class="ra-stamp big locked" style="--c:${this.stageOf(week).color}"><span>${w.stamp}</span><small>WEEK ${week + 1}</small></div>
        <h3>${wqEsc(w.title)}</h3>
        <p>${ready ? 'All lessons are done. Take the weekly test to collect this stamp!' : 'Finish the 5 lessons of this week, then pass the weekly test.'}</p>
        ${ready ? `<button class="btn btn-primary" data-ra="test" data-week="${week}">📝 Take the test</button>` : '<button class="btn btn-primary" data-ra="close">OK</button>'}
      </div>`);
    return null;
  }

  kitKey() {
    return `ra_kit_${this.store.currentKey}`;
  }

  kitHave() {
    try { return JSON.parse(localStorage.getItem(this.kitKey()) || '{}'); } catch (e) { return {}; }
  }

  toggleKit(item, el) {
    const have = this.kitHave();
    if (have[item]) delete have[item];
    else have[item] = 1;
    try { localStorage.setItem(this.kitKey(), JSON.stringify(have)); } catch (e) { /* private mode */ }
    el.classList.toggle('done', Boolean(have[item]));
  }

  vKit() {
    const cur = this.currentWeek();
    const have = this.kitHave();
    return `
      <div class="wq-book">
        <div class="wq-page-head"><h2>🛒 Parts list</h2><small>Order each week's parts a week ahead. Tick what you already have. Most parts for weeks 2–13 come in a standard “Arduino Uno starter kit”.</small></div>
        ${RA_WEEKS.map((w, i) => {
          if (!w.parts.length) return '';
          const tag = i === cur ? '<b class="ra-tag now">This week</b>' : i === cur + 1 ? '<b class="ra-tag next">Order now for next week</b>' : i < cur ? '<b class="ra-tag done">Done</b>' : '';
          return `
            <div class="ra-kit-week${i === cur + 1 ? ' next' : ''}${i < cur ? ' past' : ''}">
              <div class="ra-kit-head"><span>${w.stamp}</span><b>Week ${i + 1}: ${wqEsc(w.title)}</b>${tag}
                <button class="link-btn" data-ra="print-list" data-week="${i}">🖨️ Print</button></div>
              <div class="ra-kit-items">${w.parts.map((p, j) => {
                const key = `${i}-${j}`;
                return `<button class="ra-step${have[key] ? ' done' : ''}" data-ra="kit" data-item="${key}"><span class="ra-check">✓</span>${wqEsc(p)}</button>`;
              }).join('')}</div>
            </div>`;
        }).join('')}
        <p class="wq-note">Safety: buy from trusted shops, let a grown-up handle lithium batteries and chargers, and never connect projects to mains power.</p>
      </div>`;
  }

  vMap() {
    return `
      <div class="wq-book">
        <div class="wq-page-head"><h2>🗺️ Course map</h2><small>6 stages · 24 weeks · 120 daily lessons. Tap a finished lesson to review it.</small></div>
        ${RA_STAGES.map(st => `
          <div class="ra-map-stage" style="--c:${st.color}">
            <div class="ra-map-head"><span>${st.icon}</span><div><b>Stage ${st.id}: ${st.name}</b><small>${st.about}</small></div></div>
            ${RA_WEEKS.map((w, wi) => (w.stage !== st.id ? '' : `
              <div class="ra-map-week">
                <div class="ra-map-title">${this.weekPassed(wi) ? '🛂' : w.stamp} Week ${wi + 1}: ${wqEsc(w.title)}</div>
                <div class="ra-map-days">${w.lessons.map(l => {
                  const done = this.isDone(l.day);
                  const open = !this.lockReason(l.day);
                  return `<button class="ra-map-day${done ? ' done' : open ? ' open' : ''}" data-ra="start" data-day="${l.day}" ${done || open ? '' : 'disabled'}><span>${l.e}</span>${wqEsc(l.t)}</button>`;
                }).join('')}</div>
              </div>`)).join('')}
          </div>`).join('')}
      </div>`;
  }

  // ---------------------------------------------------------------------------
  // Grown-up settings
  // ---------------------------------------------------------------------------
  openSettings() {
    this.app.quest.modalOwner = 'robo';
    this.app.quest.openModal('⚙️ Grown-up settings', `
      <div class="wq-modal-center">
        <label class="setting-row" style="--c:#0f766e">
          <span class="setting-icon">⏩</span>
          <span class="setting-text"><strong>Allow more than one lesson a day</strong><small>Normally one new lesson unlocks each day, giving time for the hands-on mission. Turn on for holidays or older learners.</small></span>
          <input type="checkbox" class="switch" data-ra="fast" ${this.fastTrack() ? 'checked' : ''}>
        </label>
        <button class="btn btn-primary" data-ra="close">Done</button>
      </div>`);
  }

  setFast(on) {
    try { localStorage.setItem('ra_fast', on ? '1' : '0'); } catch (e) { /* private mode */ }
    this.app.showToast(on ? '⏩ More than one lesson a day allowed' : '🌙 One new lesson a day');
    this.go('dash');
  }

  // ---------------------------------------------------------------------------
  // Lab simulators
  // ---------------------------------------------------------------------------
  vLab() {
    const toys = [
      ['ohm', '🔺', "Ohm's Law Playground", 'Change voltage and resistance, watch the current and the LED'],
      ['resistor', '🌈', 'Resistor Decoder', 'Pick colour bands, read the value, then take the challenge'],
      ['binary', '🔢', 'Binary Switches', 'Flip 8 bits to make numbers from 0 to 255'],
      ['logic', '🚪', 'Logic Gate Lab', 'AND, OR, NOT, NAND and XOR with real switches'],
      ['pwm', '〰️', 'PWM Dimmer', 'See how fast on/off switching dims an LED']
    ];
    return `
      <div class="wq-book">
        <div class="wq-page-head"><h2>🧪 Lab simulators</h2><small>Experiment on screen first, then build it for real.</small></div>
        <div class="ra-lab-grid">${toys.map(([id, icon, name, about]) => `
          <button class="wq-tile ra-lab-tile" data-ra="toy" data-toy="${id}"><span>${icon}</span><b>${name}</b><small>${about}</small></button>`).join('')}</div>
      </div>`;
  }

  openToy(id) {
    this.toy = { id, bands: [2, 2, 1], bits: 0, a: 0, b: 0, gate: 'AND', target: null };
    const titles = { ohm: "🔺 Ohm's Law Playground", resistor: '🌈 Resistor Decoder', binary: '🔢 Binary Switches', logic: '🚪 Logic Gate Lab', pwm: '〰️ PWM Dimmer' };
    this.app.quest.modalOwner = 'robo';
    this.app.quest.openModal(titles[id], `<div class="ra-toy" id="ra-toy">${this.toyHtml()}</div>`, 'wide');
    this.updateToy();
  }

  toyHtml() {
    const t = this.toy;
    if (t.id === 'ohm') {
      return `
        <div class="ra-toy-led"><div class="ra-led" id="ra-led"></div><div class="ra-readout" id="ra-ohm-out"></div></div>
        <label class="ra-slider">Voltage <b id="ra-v-val"></b><input type="range" id="ra-v" min="0" max="12" step="0.5" value="5"></label>
        <label class="ra-slider">Resistance <b id="ra-r-val"></b><input type="range" id="ra-r" min="0" max="9" step="1" value="3"></label>
        <p class="wq-note">An LED is happy at about 10–20 mA. Above 30 mA it burns out! (We ignore the LED's own 2 V drop to keep it simple.)</p>`;
    }
    if (t.id === 'resistor') {
      const picker = (band, label) => `
        <div class="ra-band-row"><small>${label}</small>${RA_COLOURS.map(([n, c], i) => (band === 2 && i > 6 ? '' : `<button class="ra-band-btn${t.bands[band] === i ? ' active' : ''}" data-ra="band" data-band="${band}" data-c="${i}" style="background:${c}" title="${n}"></button>`)).join('')}</div>`;
      return `
        <div class="ra-resistor"><span class="ra-lead"></span><div class="ra-body">${[0, 1, 2].map(b => `<i style="background:${RA_COLOURS[t.bands[b]][1]}"></i>`).join('')}<i class="gold"></i></div><span class="ra-lead"></span></div>
        <div class="ra-readout" id="ra-res-out"></div>
        ${picker(0, '1st digit')}${picker(1, '2nd digit')}${picker(2, 'Multiplier (zeros)')}
        <div class="wq-row"><button class="btn btn-primary" data-ra="toy-new">🎯 Challenge me</button></div>
        <div class="ra-challenge" id="ra-challenge"></div>`;
    }
    if (t.id === 'binary') {
      return `
        <div class="ra-bits">${[7, 6, 5, 4, 3, 2, 1, 0].map(b => `<button class="ra-bit${(t.bits >> b) & 1 ? ' on' : ''}" data-ra="bit" data-bit="${b}"><b>${(t.bits >> b) & 1}</b><small>${1 << b}</small></button>`).join('')}</div>
        <div class="ra-readout" id="ra-bin-out"></div>
        <div class="wq-row"><button class="btn btn-primary" data-ra="toy-new">🎯 Challenge me</button></div>
        <div class="ra-challenge" id="ra-challenge"></div>`;
    }
    if (t.id === 'logic') {
      return `
        <div class="ra-gates">${['AND', 'OR', 'NOT', 'NAND', 'XOR'].map(g => `<button class="opt-pill${t.gate === g ? ' active' : ''}" data-ra="gate" data-gate="${g}">${g}</button>`).join('')}</div>
        <div class="ra-logic">
          <div class="ra-inputs">
            <button class="ra-switch${t.a ? ' on' : ''}" data-ra="logic-in" data-in="a">A = ${t.a}</button>
            ${t.gate !== 'NOT' ? `<button class="ra-switch${t.b ? ' on' : ''}" data-ra="logic-in" data-in="b">B = ${t.b}</button>` : ''}
          </div>
          <div class="ra-gate-box">${t.gate}</div>
          <div class="ra-toy-led"><div class="ra-led" id="ra-led"></div><div class="ra-readout" id="ra-logic-out"></div></div>
        </div>
        <div id="ra-truth"></div>`;
    }
    return `
      <div class="ra-toy-led"><div class="ra-led" id="ra-led"></div><div class="ra-readout" id="ra-pwm-out"></div></div>
      <svg class="ra-wave" id="ra-wave" viewBox="0 0 400 80" preserveAspectRatio="none"></svg>
      <label class="ra-slider">Duty cycle <b id="ra-duty-val"></b><input type="range" id="ra-duty" min="0" max="100" step="1" value="50"></label>
      <p class="wq-note">The pin is only ever fully ON (5 V) or OFF (0 V), but it switches 490 times a second, so your eyes see the average brightness.</p>`;
  }

  rerenderToy() {
    const el = this.$('ra-toy');
    if (el) el.innerHTML = this.toyHtml();
    this.updateToy();
  }

  updateToy() {
    const t = this.toy;
    if (!t || !this.$('ra-toy')) return;
    const led = this.$('ra-led');
    if (t.id === 'ohm') {
      const R = [10, 47, 100, 220, 330, 470, 1000, 2200, 4700, 10000];
      const v = Number(this.$('ra-v').value);
      const r = R[Number(this.$('ra-r').value)];
      const ma = (v / r) * 1000;
      this.$('ra-v-val').textContent = `${v} V`;
      this.$('ra-r-val').textContent = raOhms(r);
      const burnt = ma > 30;
      led.className = `ra-led${burnt ? ' burnt' : ''}`;
      led.style.setProperty('--glow', burnt ? 0 : Math.min(1, ma / 20).toFixed(2));
      this.$('ra-ohm-out').innerHTML = `I = V ÷ R = ${v} ÷ ${r} = <b>${ma < 1 ? ma.toFixed(2) : ma.toFixed(1)} mA</b><br>${burnt ? '💥 Too much current! The LED burns out.' : ma >= 5 ? '✅ The LED glows nicely.' : ma > 0 ? '🌑 Very dim: not enough current.' : '⚫ No voltage, no current.'}`;
    } else if (t.id === 'resistor') {
      const [a, b, m] = t.bands;
      const val = (a * 10 + b) * 10 ** m;
      this.$('ra-res-out').innerHTML = `${RA_COLOURS[a][0]} · ${RA_COLOURS[b][0]} · ${RA_COLOURS[m][0]} = <b>${raOhms(val)}</b>`;
      if (t.target != null) {
        const ok = val === t.target;
        this.$('ra-challenge').innerHTML = `🎯 Make <b>${raOhms(t.target)}</b> ${ok ? '— ✅ Correct! Well done!' : ''}`;
        if (ok && !t.solved && window.soundEngine) { window.soundEngine.playCorrect(); t.solved = true; }
      }
    } else if (t.id === 'binary') {
      this.$('ra-bin-out').innerHTML = `${t.bits.toString(2).padStart(8, '0')} in binary = <b>${t.bits}</b>`;
      if (t.target != null) {
        const ok = t.bits === t.target;
        this.$('ra-challenge').innerHTML = `🎯 Make the number <b>${t.target}</b> ${ok ? '— ✅ Correct!' : ''}`;
        if (ok && !t.solved && window.soundEngine) { window.soundEngine.playCorrect(); t.solved = true; }
      }
    } else if (t.id === 'logic') {
      const f = { AND: (a, b) => a & b, OR: (a, b) => a | b, NOT: (a) => 1 - a, NAND: (a, b) => 1 - (a & b), XOR: (a, b) => a ^ b }[t.gate];
      const out = f(t.a, t.b);
      led.className = 'ra-led';
      led.style.setProperty('--glow', out);
      this.$('ra-logic-out').innerHTML = `Output = <b>${out}</b>`;
      const rows = t.gate === 'NOT' ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
      this.$('ra-truth').innerHTML = `<table class="ra-truth"><tr><th>A</th>${t.gate === 'NOT' ? '' : '<th>B</th>'}<th>Out</th></tr>${rows.map(([a, b]) => {
        const cur = a === t.a && (t.gate === 'NOT' || b === t.b);
        return `<tr class="${cur ? 'cur' : ''}"><td>${a}</td>${t.gate === 'NOT' ? '' : `<td>${b}</td>`}<td>${f(a, b)}</td></tr>`;
      }).join('')}</table>`;
    } else if (t.id === 'pwm') {
      const duty = Number(this.$('ra-duty').value);
      this.$('ra-duty-val').textContent = `${duty}%`;
      led.className = 'ra-led';
      led.style.setProperty('--glow', (duty / 100).toFixed(2));
      this.$('ra-pwm-out').innerHTML = `analogWrite(9, <b>${Math.round(duty * 2.55)}</b>)`;
      let d = 'M0 70';
      for (let c = 0; c < 4; c++) {
        const x0 = c * 100;
        const on = duty;
        d += duty === 0 ? ` L${x0 + 100} 70` : duty === 100 ? ` L${x0} 10 L${x0 + 100} 10` : ` L${x0} 10 L${x0 + on} 10 L${x0 + on} 70 L${x0 + 100} 70`;
      }
      this.$('ra-wave').innerHTML = `<path d="${d}" fill="none" stroke="currentColor" stroke-width="4"/>`;
    }
  }

  setBand(band, c) {
    this.toy.bands[band] = c;
    this.rerenderToy();
  }

  flipBit(bit) {
    this.toy.bits ^= 1 << bit;
    this.rerenderToy();
  }

  flipLogic(which) {
    this.toy[which] = 1 - this.toy[which];
    this.rerenderToy();
  }

  setGate(g) {
    this.toy.gate = g;
    this.rerenderToy();
  }

  newToyChallenge() {
    const t = this.toy;
    t.solved = false;
    if (t.id === 'resistor') {
      // Real resistors come in standard (E12) values, so challenges use those
      const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
      t.target = E12[Math.floor(Math.random() * E12.length)] * 10 ** Math.floor(Math.random() * 5);
    } else {
      t.target = Math.floor(Math.random() * 256);
    }
    this.rerenderToy();
  }

  // ---------------------------------------------------------------------------
  // Printing: lab sheets, stamps and shopping lists (thermal, 384 dots wide)
  // ---------------------------------------------------------------------------
  drawQr(pc, text, x, y, px) {
    const m = qrMatrix(text);
    const scale = Math.max(2, Math.floor(px / (m.length + 4)));
    const size = (m.length + 4) * scale;
    pc.ctx.fillStyle = '#fff';
    pc.ctx.fillRect(x, y, size, size);
    pc.ctx.fillStyle = '#000';
    m.forEach((row, ry) => row.forEach((dark, rx) => {
      if (dark) pc.ctx.fillRect(x + (rx + 2) * scale, y + (ry + 2) * scale, scale, scale);
    }));
    return size;
  }

  // Left-aligned wrapped lines with a checkbox (mission steps, shopping items)
  checkLine(pc, text, size = 15) {
    const lines = pc.wrap(text, WQ_PRINT_W - pc.m * 2 - 28, size, 600);
    pc.y += size + 8;
    pc.checkbox(pc.m, pc.y + 1, 16);
    lines.forEach((ln, i) => {
      if (i) pc.y += size + 4;
      pc.text(ln, pc.m + 26, pc.y, { size, weight: 600 });
    });
    pc.y += 2;
  }

  labSheet(day) {
    const l = RA_LESSONS[day];
    const w = RA_WEEKS[l.week];
    const stage = RA_STAGES[l.stage - 1];
    const pc = new WQCanvas(3200);
    const mid = WQ_PRINT_W / 2;
    WQPrint.header(pc, 'ROBO ACADEMY', `DAY ${day + 1}`);
    pc.gap(26);
    pc.text(`${this.profile.name} · ${WQDate.label(this.todayKey())}`, mid, pc.y, { size: 17, weight: 800, align: 'center' });
    pc.gap(20);
    pc.fitText(`Stage ${stage.id}: ${stage.name} · Week ${l.week + 1}: ${w.title}`, mid, pc.y, WQ_PRINT_W - 28, { size: 14, weight: 600, align: 'center' });
    pc.gap(76);
    pc.text(l.e, mid, pc.y, { size: 64, weight: 400, align: 'center' });
    pc.gap(44);
    pc.fitText(l.t, mid, pc.y, WQ_PRINT_W - 28, { size: 30, weight: 900, align: 'center' });

    pc.heading('THE IDEA');
    pc.paragraph(l.c, { size: 15, weight: 500, align: 'left' });
    pc.heading('KEY FACTS');
    l.k.forEach(k => pc.paragraph(`• ${k}`, { size: 15, weight: 700, align: 'left', gap: 3 }));

    if (l.code) {
      pc.heading('CODE');
      const lines = l.code.split('\n');
      const top = pc.y + 8;
      lines.forEach((ln, i) => pc.fitText(ln || ' ', pc.m + 10, top + 18 + i * 18, WQ_PRINT_W - pc.m * 2 - 20, { size: 14, weight: 700, family: WQ_MONO }));
      const h = lines.length * 18 + 12;
      pc.ctx.lineWidth = 2;
      pc.ctx.strokeStyle = '#000';
      pc.roundRect(pc.m, top, WQ_PRINT_W - pc.m * 2, h, 8);
      pc.ctx.stroke();
      pc.y = top + h;
    }

    pc.heading("TODAY'S MISSION");
    l.m.forEach(m => this.checkLine(pc, m));
    if (l.slot === 0 && w.parts.length) {
      pc.heading('PARTS FOR THIS WEEK');
      pc.paragraph(w.parts.join(' · '), { size: 14, weight: 600, align: 'left' });
    }
    const next = RA_WEEKS[l.week + 1];
    if (l.slot === 3 && next && next.parts.length) {
      pc.heading('ASK A GROWN-UP TO ORDER');
      pc.paragraph(`For next week (${next.title}): ${next.parts.join(' · ')}`, { size: 14, weight: 600, align: 'left' });
    }

    pc.heading('EXERCISE');
    l.x.forEach(([q], i) => {
      pc.paragraph(`${i + 1}. ${q}`, { size: 15, weight: 700, align: 'left' });
      pc.writingLine('', { height: 30 });
    });
    pc.heading('SKETCH IT / MY NOTES');
    pc.box(130);

    pc.heading('WATCH & LEARN');
    const top = pc.y + 10;
    const qrSize = this.drawQr(pc, raYoutube(l.yt), pc.m, top, 150);
    const tx = pc.m + qrSize + 12;
    const tw = WQ_PRINT_W - tx - pc.m;
    let ty = top + 22;
    pc.text('Scan with a phone to', tx, ty, { size: 14, weight: 700 });
    ty += 18;
    pc.text('find videos about:', tx, ty, { size: 14, weight: 700 });
    pc.wrap(`“${l.yt}”`, tw, 15, 800).forEach(ln => { ty += 20; pc.text(ln, tx, ty, { size: 15, weight: 800 }); });
    ty += 20;
    pc.text('on YouTube', tx, ty, { size: 13, weight: 600 });
    pc.y = Math.max(top + qrSize, ty) + 4;

    pc.gap(26);
    pc.text('Colour a star for each step:', pc.m, pc.y, { size: 15, weight: 700 });
    [0, 1, 2].forEach(i => pc.star(WQ_PRINT_W - pc.m - 16 - i * 34, pc.y - 6, 13, false));
    pc.gap(32);
    pc.checkbox(pc.m, pc.y);
    pc.text('Mission done!', pc.m + 26, pc.y, { size: 16, weight: 800 });
    pc.text('Mentor: _________', WQ_PRINT_W - pc.m, pc.y, { size: 15, weight: 600, align: 'right' });

    // Answers upside down, so learners can check after trying
    const answers = pc.wrap(`Answers: ${l.x.map(([, a], i) => `${i + 1}) ${a}`).join('  ')}`, WQ_PRINT_W - pc.m * 2, 13, 600);
    pc.y += 14 + answers.length * 17;
    pc.ctx.save();
    pc.ctx.translate(WQ_PRINT_W / 2, pc.y);
    pc.ctx.rotate(Math.PI);
    answers.forEach((ln, i) => pc.text(ln, 0, i * 17, { size: 13, weight: 600, align: 'center' }));
    pc.ctx.restore();
    pc.scissorLine();
    return pc.finish();
  }

  printLabSheet(day) {
    if (this.lockReason(day) === 'locked') return this.app.showToast('🔒 That lesson isn\'t open yet');
    const l = RA_LESSONS[day];
    const id = raId(day);
    return this.openPrint(`🖨️ Day ${day + 1} lab sheet`, this.labSheet(day), `RoboAcademy_Day${day + 1}`, () => {
      if (this.robo.lessons[id]) this.store.update(d => { d.progress.robo.lessons[id].printed++; });
    }, `Stick it in your engineering notebook. Scan the QR code to find videos about “${l.yt}”.`);
  }

  stampCanvas(week) {
    const w = RA_WEEKS[week];
    const t = this.testRec(week);
    const stage = this.stageOf(week);
    const pc = new WQCanvas(420);
    const c = pc.ctx;
    const mid = WQ_PRINT_W / 2;
    c.save();
    c.translate(mid, 180);
    c.rotate(-0.05);
    c.strokeStyle = '#000';
    c.lineWidth = 6;
    pc.roundRect(-165, -150, 330, 300, 26);
    c.stroke();
    c.lineWidth = 2;
    pc.roundRect(-152, -137, 304, 274, 18);
    c.stroke();
    if (t.tier === 2) {
      c.setLineDash([3, 5]);
      pc.roundRect(-144, -129, 288, 258, 14);
      c.stroke();
      c.setLineDash([]);
    }
    pc.text('ROBO ACADEMY', 0, -104, { size: 22, weight: 900, align: 'center' });
    pc.text(`STAGE ${stage.id} · WEEK ${week + 1}`, 0, -80, { size: 14, weight: 800, align: 'center' });
    pc.text(w.stamp, 0, 4, { size: 70, weight: 400, align: 'center' });
    pc.fitText(w.title.toUpperCase(), 0, 48, 280, { size: 22, weight: 900, align: 'center' });
    c.fillStyle = '#000';
    pc.roundRect(-110, 64, 220, 38, 8);
    c.fill();
    pc.text(t.tier === 2 ? 'DISTINCTION' : 'PASSED', 0, 92, { size: 24, weight: 900, align: 'center', color: '#fff' });
    pc.text(`${t.best}/${t.total} · ${WQDate.label(WQDate.key(new Date(t.at || Date.now())))}`, 0, 126, { size: 14, weight: 700, align: 'center' });
    c.restore();
    pc.y = 362;
    pc.text(`${this.profile.name} · ${stage.icon} ${stage.name}`, mid, pc.y, { size: 17, weight: 800, align: 'center' });
    pc.scissorLine();
    return pc.finish();
  }

  printStamp(week) {
    const t = this.testRec(week);
    if (!t || !t.tier) return this.showStamp(week);
    const w = RA_WEEKS[week];
    return this.openPrint(`🛂 Week ${week + 1} stamp`, this.stampCanvas(week), `RoboAcademy_Stamp_Week${week + 1}`, null,
      'Cut it out and stick it in your engineering notebook or passport page!');
  }

  printShoppingList(week) {
    const w = RA_WEEKS[week];
    if (!w || !w.parts.length) return null;
    const pc = new WQCanvas(1200);
    WQPrint.header(pc, 'ROBO ACADEMY', 'PARTS LIST');
    pc.gap(28);
    pc.fitText(`Week ${week + 1}: ${w.title}`, WQ_PRINT_W / 2, pc.y, WQ_PRINT_W - 28, { size: 20, weight: 900, align: 'center' });
    pc.gap(20);
    pc.text(`For ${this.profile.name}`, WQ_PRINT_W / 2, pc.y, { size: 15, weight: 700, align: 'center' });
    pc.heading('TO GET');
    w.parts.forEach(p => this.checkLine(pc, p, 16));
    pc.gap(10);
    pc.paragraph('Buy from trusted shops. A grown-up should handle lithium batteries and chargers.', { size: 13, weight: 600 });
    pc.scissorLine();
    return this.openPrint(`🛒 Week ${week + 1} parts`, pc.finish(), `RoboAcademy_Parts_Week${week + 1}`, null, 'Give this to a grown-up so the parts arrive in time.');
  }

  // Reuses Word Quest's print preview modal (thermal, normal printer, save picture)
  openPrint(title, canvas, filename, onPrinted, tip) {
    this.app.quest.modalOwner = 'robo';
    this.app.quest.openPrint(title, canvas, filename, onPrinted, tip);
  }
}
