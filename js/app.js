// Edu Fair 2026 - 60-Second Challenge: Master App Controller

const STREAK_BONUS = 5;              // extra points per answer while on a 3+ streak
const STREAK_MILESTONES = [3, 5, 10, 15, 20];
const ADVANCE_AFTER_CORRECT_MS = 1300;
const ADVANCE_AFTER_WRONG_MS = 2800;
const IDLE_RESET_MS = 120000;        // results screen returns home for the next visitor
const STAR_THRESHOLDS = { two: 6, three: 10 };
const RANK_TITLES = ['RISING STAR', 'RISING STAR', 'BRIGHT SPARK', 'SUPER GENIUS'];

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

class EduFairApp {
  constructor() {
    this.playerName = '';
    this.level = localStorage.getItem('edufair_level') || 'mixed';
    this.hiddenGames = this.loadHiddenGames();
    this.challengeId = null;
    this.deck = new QuestionDeck();
    this.round = null;
    this.activePhotoData = null;
    this.idleTimer = null;

    this.initDOMElements();
    this.buildHome();
    this.buildLeaderboardTabs();
    this.initEventListeners();
    this.initSwipe();
    this.initPrinterHooks();
    this.initNetworkStatus();
    this.updateLeaderboardUI();
    this.soundIcon.textContent = window.soundEngine.isMuted() ? '🔇' : '🔊';
  }

  initDOMElements() {
    const $ = (id) => document.getElementById(id);
    this.$ = $;

    this.screens = { home: $('screen-home'), game: $('screen-game'), results: $('screen-results') };
    this.playerNameInput = $('player-name-input');

    // HUD
    this.hudIcon = $('hud-icon');
    this.hudChallenge = $('hud-challenge');
    this.hudLevel = $('hud-level');
    this.hudScoreText = $('hud-score-text');
    this.hudStreak = $('hud-streak');
    this.hudStreakNum = $('hud-streak-num');
    this.scorePop = $('score-pop');
    this.hudTimerBox = $('hud-timer-box');
    this.hudTimerText = $('hud-timer-text');
    this.timerFill = $('timer-fill');

    // Question
    this.playArea = $('play-area');
    this.qCard = $('q-card');
    this.qTag = $('q-tag');
    this.qIcon = $('q-icon');
    this.qPrompt = $('q-prompt');
    this.qSub = $('q-sub');
    this.optionsContainer = $('options-container');
    this.feedbackBox = $('feedback-box');
    this.feedbackText = $('feedback-text');

    // Countdown
    this.countdown = $('countdown');

    // Results
    this.awardStars = [$('award-star-1'), $('award-star-2'), $('award-star-3')];

    // Webcam & Receipt
    this.cameraVideo = $('camera-video');
    this.photoPreviewImg = $('photo-preview-img');
    this.cameraFlash = $('camera-flash');
    this.receiptPhotoImg = $('receipt-photo-img');

    // Header
    this.headerPrinterDot = $('header-printer-dot');
    this.headerPrinterText = $('header-printer-text');
    this.soundIcon = $('sound-icon');

    // Modal
    this.modalLeaderboard = $('modal-leaderboard');
    this.leaderboardTbody = $('leaderboard-tbody');
    this.toastEl = $('toast');
  }

  // ---------------------------------------------------------------------------
  // Home screen
  // ---------------------------------------------------------------------------
  buildHome() {
    const levelRow = this.$('level-row');
    levelRow.innerHTML = Object.values(LEVELS).map(l => `
      <button class="level-btn level-${l.id}" data-level="${l.id}">
        <span class="level-icon">${l.icon}</span>
        <span class="level-name">${l.label}</span>
        <span class="level-who">${l.who}</span>
      </button>
    `).join('');
    this.setLevel(this.level);

    this.renderGameTiles();
  }

  renderGameTiles() {
    const visible = Object.values(CHALLENGES).filter(c => !this.hiddenGames.includes(c.id));
    const grid = this.$('challenge-grid');
    grid.dataset.count = visible.length;
    grid.innerHTML = visible.map(c => `
      <button class="game-tile" data-challenge="${c.id}" style="--c:${c.color}">
        <span class="game-icon">${c.icon}</span>
        <span class="game-text">
          <span class="game-subject">${c.subject}</span>
          <span class="game-title">${c.title}</span>
        </span>
        <span class="game-play">▶</span>
        ${c.seconds ? `<span class="game-time">⏱️ ${c.seconds}s</span>` : ''}
      </button>
    `).join('');
  }

  // ---------------------------------------------------------------------------
  // Settings: which games appear on the home screen
  // ---------------------------------------------------------------------------
  loadHiddenGames() {
    try {
      const saved = JSON.parse(localStorage.getItem('edufair_hidden_games') || '[]');
      return Array.isArray(saved) ? saved.filter(id => CHALLENGES[id]) : [];
    } catch (e) {
      return [];
    }
  }

  saveHiddenGames() {
    localStorage.setItem('edufair_hidden_games', JSON.stringify(this.hiddenGames));
    this.renderGameTiles();
  }

  // Games Mega Mix may draw from: the visible ones, or all of them if none are visible
  mixPool() {
    const visible = PLAYABLE_CHALLENGES.filter(id => !this.hiddenGames.includes(id));
    return visible.length ? visible : PLAYABLE_CHALLENGES;
  }

  openSettings() {
    this.$('settings-games').innerHTML = Object.values(CHALLENGES).map(c => `
      <label class="setting-row" style="--c:${c.color}">
        <span class="setting-icon">${c.icon}</span>
        <span class="setting-text"><strong>${c.title}</strong><small>${c.subject}${c.seconds ? ` · ${c.seconds}s round` : ''}</small></span>
        <input type="checkbox" class="switch" data-game="${c.id}" ${this.hiddenGames.includes(c.id) ? '' : 'checked'}>
      </label>
    `).join('');
    this.$('modal-settings').classList.add('open');
  }

  onSettingToggle(input) {
    const id = input.dataset.game;
    if (input.checked) {
      this.hiddenGames = this.hiddenGames.filter(g => g !== id);
    } else {
      const visibleCount = Object.keys(CHALLENGES).length - this.hiddenGames.length;
      if (visibleCount <= 1) {
        input.checked = true;
        this.showToast('Keep at least one game on the home screen');
        return;
      }
      this.hiddenGames.push(id);
    }
    this.saveHiddenGames();
  }

  setLevel(level) {
    this.level = LEVELS[level] ? level : 'mixed';
    localStorage.setItem('edufair_level', this.level);
    document.querySelectorAll('.level-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.level === this.level);
    });
  }

  buildLeaderboardTabs() {
    const tabs = [{ id: 'all', label: 'All games' }, ...Object.values(CHALLENGES).map(c => ({ id: c.id, label: `${c.icon} ${c.title}` }))];
    this.$('leaderboard-tabs').innerHTML = tabs.map((t, i) =>
      `<button class="tab-btn${i === 0 ? ' active' : ''}" data-mode="${t.id}">${t.label}</button>`
    ).join('');
  }

  initEventListeners() {
    const $ = this.$;

    $('btn-brand-home').addEventListener('click', () => this.confirmLeaveRound() && this.showScreen('home'));

    this.playerNameInput.addEventListener('input', (e) => {
      this.playerName = e.target.value.trim();
    });
    this.playerNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.playerNameInput.blur();
    });

    $('level-row').addEventListener('click', (e) => {
      const btn = e.target.closest('.level-btn');
      if (!btn) return;
      window.soundEngine.playClick();
      this.setLevel(btn.dataset.level);
    });

    $('challenge-grid').addEventListener('click', (e) => {
      const tile = e.target.closest('.game-tile');
      if (!tile) return;
      window.soundEngine.playClick();
      this.startChallenge(tile.dataset.challenge);
    });

    // Header
    $('btn-sound-toggle').addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });
    $('btn-fullscreen').addEventListener('click', () => this.toggleFullscreen());
    $('btn-bluetooth-printer').addEventListener('click', async () => {
      if (window.printerController.isConnected) {
        if (confirm(`Connected to ${window.printerController.deviceName}. Disconnect?`)) {
          await window.printerController.disconnect();
        }
      } else {
        await window.printerController.connect();
      }
    });

    // Settings modal
    $('btn-settings').addEventListener('click', () => this.openSettings());
    $('btn-close-settings').addEventListener('click', () => $('modal-settings').classList.remove('open'));
    $('btn-settings-done').addEventListener('click', () => $('modal-settings').classList.remove('open'));
    $('modal-settings').addEventListener('click', (e) => {
      if (e.target.id === 'modal-settings') e.target.classList.remove('open');
    });
    $('settings-games').addEventListener('change', (e) => {
      if (e.target.matches('.switch')) this.onSettingToggle(e.target);
    });
    $('btn-settings-show-all').addEventListener('click', () => {
      this.hiddenGames = [];
      this.saveHiddenGames();
      this.openSettings();
    });

    // Leaderboard modal
    $('btn-open-leaderboard').addEventListener('click', () => this.openLeaderboardModal('all'));
    $('btn-view-all-scores').addEventListener('click', () => this.openLeaderboardModal('all'));
    $('btn-close-leaderboard').addEventListener('click', () => this.modalLeaderboard.classList.remove('open'));
    this.modalLeaderboard.addEventListener('click', (e) => {
      if (e.target === this.modalLeaderboard) this.modalLeaderboard.classList.remove('open');
    });
    $('leaderboard-tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      this.setLeaderboardTab(btn.dataset.mode);
    });
    $('btn-export-csv').addEventListener('click', () => window.leaderboardManager.exportScoresToCSV());
    $('btn-sync-scores').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.textContent = '🔄 Syncing…';
      const ok = await window.leaderboardManager.syncScoresWithServer();
      btn.textContent = ok ? '✓ Synced!' : '⚠️ Sync failed';
      setTimeout(() => { btn.textContent = '🔄 Sync to server'; }, 2000);
    });
    $('btn-clear-scores').addEventListener('click', () => {
      if (window.leaderboardManager.clearScores()) {
        this.setLeaderboardTab('all');
        this.updateLeaderboardUI();
      }
    });

    // Game
    $('btn-quit').addEventListener('click', () => this.confirmLeaveRound() && this.showScreen('home'));
    $('btn-next').addEventListener('click', () => this.nextQuestion());
    this.feedbackText.addEventListener('click', (e) => {
      if (e.target.closest('#btn-hint')) this.useHint();
    });
    this.optionsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-value]');
      if (btn) this.handleAnswer(btn.dataset.value);
    });

    // Results
    $('btn-results-play-again').addEventListener('click', () => this.startChallenge(this.challengeId));
    $('btn-results-home').addEventListener('click', () => this.showScreen('home'));
    $('btn-results-new-player').addEventListener('click', () => this.newPlayer());
    $('btn-take-selfie').addEventListener('click', () => this.snapWebcamPhoto());
    $('btn-retake-photo').addEventListener('click', () => this.startLiveWebcam());
    $('btn-print-thermal').addEventListener('click', () => this.handleBluetoothPrint());
    $('btn-browser-print').addEventListener('click', () => window.print());

    // Keyboard: A-D / 1-4 to answer, arrows for Fact or Fiction, Enter/Space for next
    window.addEventListener('keydown', (e) => {
      if (!this.screens.game.classList.contains('active') || !this.round) return;
      if (e.target === this.playerNameInput) return;
      if (this.round.locked) {
        if (e.key === 'Enter' || e.key === ' ') this.nextQuestion();
        return;
      }
      const q = this.round.q;
      const key = e.key.toUpperCase();
      if (q.kind === 'binary' && (key === 'ARROWLEFT' || key === 'ARROWRIGHT')) {
        this.handleAnswer(key === 'ARROWRIGHT' ? 'fact' : 'fiction');
        return;
      }
      const idx = { A: 0, '1': 0, B: 1, '2': 1, C: 2, '3': 2, D: 3, '4': 3 }[key];
      if (idx !== undefined && q.options[idx]) this.handleAnswer(String(q.options[idx].value));
    });

    // Any touch on the results screen keeps it alive
    this.screens.results.addEventListener('pointerdown', () => this.armIdleReset());
  }

  // Drag the Fact or Fiction card left/right to answer
  initSwipe() {
    let startX = null;
    let dx = 0;
    const card = this.qCard;
    const THRESHOLD = 110;

    card.addEventListener('pointerdown', (e) => {
      if (!this.round || this.round.locked || this.round.q.kind !== 'binary') return;
      startX = e.clientX;
      dx = 0;
      card.setPointerCapture(e.pointerId);
      card.classList.add('dragging');
    });
    card.addEventListener('pointermove', (e) => {
      if (startX === null) return;
      dx = e.clientX - startX;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 25}deg)`;
      card.style.setProperty('--fact-o', Math.max(0, Math.min(1, dx / THRESHOLD)));
      card.style.setProperty('--fiction-o', Math.max(0, Math.min(1, -dx / THRESHOLD)));
    });
    const end = () => {
      if (startX === null) return;
      startX = null;
      card.classList.remove('dragging');
      card.style.transform = '';
      card.style.setProperty('--fact-o', 0);
      card.style.setProperty('--fiction-o', 0);
      if (Math.abs(dx) >= THRESHOLD) this.handleAnswer(dx > 0 ? 'fact' : 'fiction');
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  }

  initPrinterHooks() {
    window.printerController.onStatusChange = ({ connected, deviceName }) => {
      this.headerPrinterDot.className = connected ? 'printer-status-dot connected' : 'printer-status-dot';
      this.headerPrinterText.textContent = connected ? `🖨️ ${deviceName}` : '🖨️';
    };
  }

  confirmLeaveRound() {
    if (this.round && this.round.timer) {
      return confirm('Leave this round? Your score will not be saved.');
    }
    return true;
  }

  showScreen(screenName) {
    if (screenName !== 'game') this.stopRound();
    if (screenName !== 'results') {
      window.cameraController.stopCamera();
      clearTimeout(this.idleTimer);
    }
    if (screenName === 'home') this.updateLeaderboardUI();

    Object.keys(this.screens).forEach(key => {
      this.screens[key].classList.toggle('active', key === screenName);
    });
    document.body.dataset.screen = screenName;
  }

  newPlayer() {
    this.playerName = '';
    this.playerNameInput.value = '';
    this.showScreen('home');
  }

  toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    }
  }

  showToast(text) {
    this.toastEl.textContent = text;
    this.toastEl.classList.remove('show');
    void this.toastEl.offsetWidth;
    this.toastEl.classList.add('show');
  }

  // ---------------------------------------------------------------------------
  // Round flow
  // ---------------------------------------------------------------------------
  startChallenge(challengeId) {
    this.challengeId = challengeId;
    const c = CHALLENGES[challengeId];
    const l = LEVELS[this.level];

    this.$('countdown-icon').textContent = c.icon;
    this.$('countdown-title').textContent = c.title;
    this.$('countdown-level').textContent = `${l.icon} ${l.label} · ${l.who} · ⏱️ ${c.seconds || DEFAULT_ROUND_SECONDS}s`;
    this.$('countdown-howto').textContent = c.howTo;
    this.countdown.style.setProperty('--c', c.color);
    this.countdown.classList.add('open');
    this.modalLeaderboard.classList.remove('open');
    document.activeElement && document.activeElement.blur();

    const numEl = this.$('countdown-num');
    const steps = ['3', '2', '1', 'GO!'];
    let i = 0;
    const tick = () => {
      numEl.textContent = steps[i];
      numEl.classList.remove('pop');
      void numEl.offsetWidth;
      numEl.classList.add('pop');
      window.soundEngine.playTick(i === steps.length - 1);
      i++;
      if (i < steps.length) {
        this.countdownTimer = setTimeout(tick, 900);
      } else {
        this.countdownTimer = setTimeout(() => {
          this.countdown.classList.remove('open');
          this.beginRound();
        }, 600);
      }
    };
    // Give players a moment to read how to play before counting down
    this.countdownTimer = setTimeout(tick, 1600);
  }

  beginRound() {
    this.stopRound();
    const c = CHALLENGES[this.challengeId];
    this.round = {
      score: 0, correct: 0, answered: 0, streak: 0, bestStreak: 0,
      totalSeconds: c.seconds || DEFAULT_ROUND_SECONDS, timer: null, advanceTimer: null, q: null, locked: false, lastChallenge: null
    };
    this.round.timeLeft = this.round.totalSeconds;
    this.activePhotoData = null;

    this.screens.game.style.setProperty('--c', c.color);
    this.hudIcon.textContent = c.icon;
    this.hudChallenge.textContent = c.title;
    this.hudScoreText.textContent = '0';
    this.updateStreak();

    this.showScreen('game');
    this.startTimer();
    this.nextQuestion();
  }

  stopRound() {
    clearTimeout(this.countdownTimer);
    this.countdown.classList.remove('open');
    if (!this.round) return;
    clearInterval(this.round.timer);
    clearTimeout(this.round.advanceTimer);
    this.round.timer = null;
  }

  startTimer() {
    const r = this.round;
    this.updateTimerDisplay();
    r.timer = setInterval(() => {
      r.timeLeft--;
      this.updateTimerDisplay();
      if (r.timeLeft <= 10 && r.timeLeft > 0) window.soundEngine.playTick(true);
      if (r.timeLeft <= 0) this.endRound();
    }, 1000);
  }

  updateTimerDisplay() {
    const t = this.round.timeLeft;
    this.hudTimerText.textContent = t;
    this.timerFill.style.width = `${(t / this.round.totalSeconds) * 100}%`;
    this.hudTimerBox.classList.toggle('warning', t <= 20 && t > 10);
    this.hudTimerBox.classList.toggle('critical', t <= 10);
  }

  // In "Mixed", questions get harder as the player keeps scoring
  currentQuestionLevel() {
    if (this.level !== 'mixed') return this.level;
    const c = this.round.correct;
    if (c < 3) return 'easy';
    if (c < 7) return 'medium';
    return 'hard';
  }

  nextQuestion() {
    const r = this.round;
    if (!r || !r.timer) return;
    clearTimeout(r.advanceTimer);

    let challenge = this.challengeId;
    if (challenge === 'mix') {
      const pool = this.mixPool();
      const choices = pool.length > 1 ? pool.filter(id => id !== r.lastChallenge) : pool;
      challenge = pick(choices);
    }
    r.lastChallenge = challenge;

    const level = this.currentQuestionLevel();
    r.q = buildQuestion(challenge, level, this.deck, { binCount: this.level === 'easy' ? 2 : 3 });
    r.locked = false;
    r.hintUsed = false;
    this.renderQuestion(r.q);
  }

  renderQuestion(q) {
    const c = CHALLENGES[q.challenge];
    const l = LEVELS[q.level];

    this.playArea.dataset.kind = q.kind;
    this.playArea.dataset.variant = q.variant || '';
    this.playArea.style.setProperty('--qc', c.color);
    this.hudLevel.textContent = this.level === 'mixed' ? `🎲 Mixed · now ${l.label}` : `${l.icon} ${l.label}`;

    const tagParts = [this.challengeId === 'mix' ? `${c.icon} ${c.title}` : `Question ${this.round.answered + 1}`];
    if (q.tag) tagParts.push(q.tag);
    this.qTag.textContent = tagParts.join(' · ');
    this.qIcon.textContent = q.icon || '';
    this.qIcon.style.display = q.icon ? '' : 'none';
    this.qPrompt.innerHTML = q.build ? this.buildPromptHtml(q.build) : escapeHtml(q.prompt).replace('___', '<span class="blank" id="q-blank">?</span>');
    this.qSub.textContent = q.sub || '';
    if (q.build) {
      this.qSub.innerHTML = `Make a word that means<span class="build-meaning">"${escapeHtml(q.build.meaning)}"</span>`;
    }

    this.qCard.classList.remove('shake', 'enter');
    void this.qCard.offsetWidth;
    this.qCard.classList.add('enter');

    this.feedbackBox.className = 'feedback';
    if (q.kind === 'binary') {
      this.feedbackText.innerHTML = '👈 Swipe or tap 👉';
    } else if (q.hintable) {
      this.feedbackText.innerHTML = '<button class="hint-btn" id="btn-hint">💡 Hint: remove 2 wrong answers <small>(half points)</small></button>';
    } else {
      this.feedbackText.innerHTML = `<span class="feedback-hint">${escapeHtml(c.howTo.split('.')[0])}.</span>`;
    }

    this.optionsContainer.className = `answers answers-${q.kind} count-${q.options.length}`;
    this.optionsContainer.innerHTML = q.options.map((o, i) => this.renderOption(q, o, i)).join('');
  }

  renderOption(q, o, i) {
    const value = escapeHtml(o.value);
    if (q.kind === 'binary') {
      return `<button class="ans ans-${o.value}" data-value="${value}">
        <span class="ans-icon">${o.icon}</span><span class="ans-label">${o.label}</span></button>`;
    }
    if (q.kind === 'bins') {
      return `<button class="ans ans-bin" data-value="${value}" style="--bin:${o.color}">
        <span class="bin-lid"></span>
        <span class="bin-body">
          <span class="ans-icon">🗑️</span>
          <span class="ans-label">${o.label}</span>
          <span class="ans-sub">${o.sub}</span>
        </span></button>`;
    }
    if (q.kind === 'grid') {
      const isText = o.icon && !/\p{Extended_Pictographic}/u.test(o.icon);
      return `<button class="ans ans-tile" data-value="${value}">
        ${o.icon ? `<span class="ans-icon${isText ? ' ans-icon-text' : ''}">${escapeHtml(o.icon)}</span>` : ''}
        ${o.label ? `<span class="ans-label">${escapeHtml(o.label)}</span>` : ''}</button>`;
    }
    return `<button class="ans ans-choice" data-value="${value}">
      <span class="ans-key">${'ABCD'[i]}</span><span class="ans-label">${escapeHtml(o.label)}</span></button>`;
  }

  handleAnswer(value) {
    const r = this.round;
    if (!r || r.locked || !r.timer) return;
    r.locked = true;
    r.answered++;

    const q = r.q;
    const isCorrect = String(value) === String(q.answer);
    const buttons = [...this.optionsContainer.querySelectorAll('[data-value]')];
    const chosenBtn = buttons.find(b => b.dataset.value === String(value));
    const correctBtn = buttons.find(b => b.dataset.value === String(q.answer));
    buttons.forEach(b => b.classList.add('locked'));

    if (isCorrect) {
      r.correct++;
      r.streak++;
      r.bestStreak = Math.max(r.bestStreak, r.streak);
      const base = LEVELS[q.level].points;
      const pts = (r.hintUsed ? base / 2 : base) + (r.streak >= 3 ? STREAK_BONUS : 0);
      r.score += pts;
      this.hudScoreText.textContent = r.score;
      this.popScore(`+${pts}`);
      window.soundEngine.playCorrect();
      chosenBtn && chosenBtn.classList.add('correct');
      this.qCard.classList.add('correct-glow');
      setTimeout(() => this.qCard.classList.remove('correct-glow'), 600);

      const blank = document.getElementById('q-blank');
      if (blank && !q.build) { blank.textContent = q.answer; blank.classList.add('filled'); }

      if (STREAK_MILESTONES.includes(r.streak)) {
        this.showToast(`🔥 ${r.streak} in a row! Bonus points!`);
        window.soundEngine.playStar(Math.min(3, STREAK_MILESTONES.indexOf(r.streak) + 1));
        const rect = this.hudStreak.getBoundingClientRect();
        window.confettiEngine.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
      }

      this.feedbackBox.className = 'feedback show good';
      this.feedbackText.innerHTML = `<strong>✓ Correct!</strong> ${escapeHtml(q.why)}`;
    } else {
      r.streak = 0;
      window.soundEngine.playIncorrect();
      chosenBtn && chosenBtn.classList.add('incorrect');
      correctBtn && correctBtn.classList.add('correct');
      this.qCard.classList.add('shake');

      const answerOpt = q.options.find(o => String(o.value) === String(q.answer)) || {};
      const answerLabel = answerOpt.label || answerOpt.icon;
      this.feedbackBox.className = 'feedback show bad';
      this.feedbackText.innerHTML = `<strong>✗ It's ${escapeHtml(answerLabel)}.</strong> ${escapeHtml(q.why)}`;
    }
    if (q.build) this.revealBuiltWord(q, isCorrect);
    this.updateStreak();

    r.advanceTimer = setTimeout(() => this.nextQuestion(), isCorrect ? ADVANCE_AFTER_CORRECT_MS : ADVANCE_AFTER_WRONG_MS);
  }

  // Word Builder: [slot] + root  (or root + [slot]) = ?
  buildPromptHtml({ type, root }) {
    const slot = '<span class="build-tile build-slot blank" id="q-blank">?</span>';
    const rootTile = `<span class="build-tile build-root">${escapeHtml(root)}</span>`;
    const parts = type === 'pre' ? [slot, rootTile] : [rootTile, slot];
    return `<span class="build-eq">${parts.join('<span class="build-op">+</span>')}</span>
      <span class="build-result" id="build-result">= <span class="build-word">?</span></span>`;
  }

  revealBuiltWord(q, isCorrect) {
    const slot = document.getElementById('q-blank');
    if (slot) {
      slot.textContent = q.options.find(o => o.value === q.answer).label;
      slot.classList.add('filled');
    }
    const result = document.getElementById('build-result');
    if (!result) return;
    result.innerHTML = `= <span class="build-word">${escapeHtml(q.build.word)}</span>${isCorrect ? ' ✨' : ''}`;
    result.classList.add('revealed', isCorrect ? 'good' : 'bad');
  }

  // Riddle hint: knock out two wrong answers; the answer is then worth half
  useHint() {
    const r = this.round;
    if (!r || r.locked || r.hintUsed) return;
    r.hintUsed = true;
    const wrong = [...this.optionsContainer.querySelectorAll('[data-value]')]
      .filter(b => b.dataset.value !== String(r.q.answer));
    shuffleArray(wrong).slice(0, 2).forEach(b => b.classList.add('eliminated'));
    window.soundEngine.playClick();
    this.feedbackText.innerHTML = '<span class="feedback-hint">💡 Two wrong answers removed — now pick!</span>';
  }

  popScore(text) {
    this.scorePop.textContent = text;
    this.scorePop.classList.remove('pop');
    void this.scorePop.offsetWidth;
    this.scorePop.classList.add('pop');
  }

  updateStreak() {
    const s = this.round ? this.round.streak : 0;
    this.hudStreakNum.textContent = s;
    this.hudStreak.classList.toggle('hot', s >= 3);
  }

  calculateStars(correct) {
    if (correct >= STAR_THRESHOLDS.three) return 3;
    if (correct >= STAR_THRESHOLDS.two) return 2;
    return 1; // everyone who plays earns a star
  }

  async endRound() {
    const r = this.round;
    this.stopRound();
    this.updateTimerDisplay();

    const c = CHALLENGES[this.challengeId];
    const l = LEVELS[this.level];
    const stars = this.calculateStars(r.correct);
    r.stars = stars;
    const displayName = this.playerName || 'Sloka Star';
    const accuracy = r.answered > 0 ? Math.round((r.correct / r.answered) * 100) : 0;
    const rankTitle = RANK_TITLES[stars];

    window.soundEngine.playFanfare();
    window.confettiEngine.burst(window.innerWidth / 2, window.innerHeight * 0.3, 120);

    const $ = this.$;
    $('results-player-name').textContent = this.playerName ? `Well played, ${this.playerName}!` : 'Well played!';
    $('results-game-label').textContent = `${c.icon} ${c.title} · ${l.icon} ${l.label}`;
    $('res-score-val').textContent = r.score;
    $('res-correct-val').textContent = r.correct;
    $('res-accuracy-val').textContent = `${accuracy}%`;
    $('res-streak-val').textContent = r.bestStreak;
    $('award-rank-title').textContent = rankTitle;

    this.awardStars.forEach((starEl, i) => {
      starEl.classList.remove('earned');
      if (i < stars) {
        setTimeout(() => {
          starEl.classList.add('earned');
          window.soundEngine.playStar(i + 1);
        }, 400 + i * 350);
      }
    });

    const entry = window.leaderboardManager.addScore({
      name: displayName, mode: this.challengeId, level: this.level,
      score: r.score, stars, accuracy: `${accuracy}%`, correct: r.correct
    });
    const rank = window.leaderboardManager.getRank(entry);
    let message;
    if (r.score > 0 && rank === 1) message = `🥇 New #1 in ${c.title}!`;
    else if (r.score > 0 && rank <= 10) message = `🏅 You're #${rank} in ${c.title}!`;
    else if (stars < 3) message = `Get ${stars === 1 ? STAR_THRESHOLDS.two : STAR_THRESHOLDS.three} correct for ${'★'.repeat(stars + 1)} — try again!`;
    else message = 'Amazing — all three stars!';
    $('results-message').textContent = message;

    // Virtual thermal receipt
    $('receipt-player-name').textContent = displayName.toUpperCase();
    $('receipt-mode-name').textContent = c.title.toUpperCase();
    $('receipt-level').textContent = l.label.toUpperCase();
    $('receipt-score').textContent = `${r.score} PTS`;
    $('receipt-date').textContent = new Date().toLocaleDateString();
    $('receipt-stars').textContent = '★ '.repeat(stars) + '☆ '.repeat(3 - stars);
    $('receipt-rank').textContent = rankTitle;

    const initialPhoto = window.cameraController.capturePhoto();
    this.receiptPhotoImg.src = initialPhoto;
    this.photoPreviewImg.src = initialPhoto;

    this.showScreen('results');
    this.armIdleReset();
    await this.startLiveWebcam();
  }

  armIdleReset() {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.screens.results.classList.contains('active')) this.newPlayer();
    }, IDLE_RESET_MS);
  }

  // ---------------------------------------------------------------------------
  // Webcam & printing
  // ---------------------------------------------------------------------------
  async startLiveWebcam() {
    window.cameraController.setVideoElement(this.cameraVideo);
    const cameraStarted = await window.cameraController.startCamera();
    if (cameraStarted) {
      this.cameraVideo.style.display = 'block';
      this.photoPreviewImg.style.display = 'none';
    } else {
      this.cameraVideo.style.display = 'none';
      this.photoPreviewImg.style.display = 'block';
    }
  }

  snapWebcamPhoto() {
    this.cameraFlash.classList.add('flash');
    setTimeout(() => this.cameraFlash.classList.remove('flash'), 350);

    const photoDataUrl = window.cameraController.capturePhoto();
    this.activePhotoData = photoDataUrl;

    window.cameraController.stopCamera();
    this.cameraVideo.style.display = 'none';
    this.photoPreviewImg.style.display = 'block';
    this.photoPreviewImg.src = photoDataUrl;
    this.receiptPhotoImg.src = photoDataUrl;
  }

  async handleBluetoothPrint() {
    if (window.cameraController.isActive) this.snapWebcamPhoto();

    if (!window.printerController.isConnected) {
      const connected = await window.printerController.connect();
      if (!connected) {
        alert('Could not connect to the POS-58 printer.\nYou can still use "or use a normal printer" below.');
        return;
      }
    }

    const c = CHALLENGES[this.challengeId];
    const ok = await window.printerController.printReceipt({
      playerName: this.playerName || 'Sloka Star',
      modeTitle: c.title.toUpperCase(),
      levelLabel: LEVELS[this.level].label.toUpperCase(),
      score: this.round.score,
      stars: this.round.stars,
      rankTitle: RANK_TITLES[this.round.stars],
      dateStr: new Date().toLocaleDateString(),
      imageElement: this.receiptPhotoImg
    });

    if (ok) {
      window.confettiEngine.burst();
      this.showToast('🖨️ Printing your keepsake!');
    } else {
      alert('Printing failed. Check the POS-58 is switched on and has paper.');
    }
  }

  // ---------------------------------------------------------------------------
  // Leaderboard
  // ---------------------------------------------------------------------------
  updateLeaderboardUI() {
    const miniScores = window.leaderboardManager.getScores('all', 3);
    const miniContainer = document.querySelector('.mini-leaderboard-list');
    if (miniScores.length === 0) {
      miniContainer.innerHTML = '<span class="mini-empty">Be the first champion today! 🌟</span>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    miniContainer.innerHTML = miniScores.map((s, i) => `
      <span class="mini-score">
        <span>${medals[i]}</span>
        <span class="mini-name">${escapeHtml(s.name)}</span>
        <strong>${s.score}</strong>
      </span>
    `).join('');
  }

  openLeaderboardModal(mode = 'all') {
    this.setLeaderboardTab(mode);
    this.modalLeaderboard.classList.add('open');
  }

  setLeaderboardTab(mode) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    this.renderLeaderboardTable(mode);
  }

  renderLeaderboardTable(mode = 'all') {
    const scores = window.leaderboardManager.getScores(mode, 50);
    if (scores.length === 0) {
      this.leaderboardTbody.innerHTML = `
        <tr><td colspan="6" class="lb-empty">🌟 <strong>No scores yet!</strong><br>Play any game to claim the #1 spot.</td></tr>`;
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    this.leaderboardTbody.innerHTML = scores.map((s, i) => {
      const c = CHALLENGES[s.mode];
      const l = LEVELS[s.level];
      return `<tr>
        <td class="lb-rank">${medals[i] || i + 1}</td>
        <td class="lb-name">${escapeHtml(s.name)}</td>
        <td>${c ? `${c.icon} ${c.title}` : escapeHtml(s.mode)}</td>
        <td>${l ? `${l.icon} ${l.label}` : '-'}</td>
        <td class="lb-stars">${'★'.repeat(s.stars)}</td>
        <td class="lb-score">${s.score}</td>
      </tr>`;
    }).join('');
  }

  initNetworkStatus() {
    const dot = this.$('network-status-dot');
    const text = this.$('network-status-text');
    const updateStatus = () => {
      dot.className = navigator.onLine ? 'net-dot' : 'net-dot offline';
      text.textContent = navigator.onLine ? 'Online' : 'Offline';
    };
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  }
}

// Register PWA ServiceWorker for 100% offline kiosk operation
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('[PWA] ServiceWorker registration failed:', err);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.eduFairApp = new EduFairApp();
});
