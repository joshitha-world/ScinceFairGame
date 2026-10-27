// Science Fair Educational Game - Master App Controller

class ScienceFairApp {
  constructor() {
    this.playerName = localStorage.getItem('science_fair_player_name') || '';
    this.currentMode = 'synonym'; // 'synonym' or 'phenomenon'
    this.questions = [];
    this.currentQIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.timerSeconds = 60;
    this.timerInterval = null;
    this.isAnsweringLocked = false;
    this.stars = 0;
    this.activePhotoData = null;

    this.phenomenonCanvas = document.getElementById('phenomenon-canvas');
    this.phenomenonCtrl = new PhenomenonCanvasController(this.phenomenonCanvas);

    this.initDOMElements();
    this.initEventListeners();
    this.initPrinterHooks();
    this.updateLeaderboardUI();
  }

  initDOMElements() {
    // Screens
    this.screens = {
      home: document.getElementById('screen-home'),
      game: document.getElementById('screen-game'),
      results: document.getElementById('screen-results')
    };

    // Home inputs
    this.playerNameInput = document.getElementById('player-name-input');
    if (this.playerName) {
      this.playerNameInput.value = this.playerName;
    }

    // HUD Elements
    this.hudModeBadge = document.getElementById('hud-mode-badge');
    this.hudPlayerName = document.getElementById('hud-player-name');
    this.hudTimerBox = document.getElementById('hud-timer-box');
    this.hudTimerText = document.getElementById('hud-timer-text');
    this.hudScoreText = document.getElementById('hud-score-text');
    this.liveStars = [
      document.getElementById('star-1'),
      document.getElementById('star-2'),
      document.getElementById('star-3')
    ];

    // Question Display Elements
    this.visualCategoryTag = document.getElementById('visual-category-tag');
    this.visualQuestionCounter = document.getElementById('visual-question-counter');
    this.synonymSvgWrapper = document.getElementById('synonym-svg-wrapper');
    this.termEyebrow = document.getElementById('term-eyebrow-text');
    this.termTitle = document.getElementById('term-title-text');
    this.termTagline = document.getElementById('term-tagline-text');
    this.optionsContainer = document.getElementById('options-container');
    this.feedbackBox = document.getElementById('feedback-box');
    this.feedbackText = document.getElementById('feedback-text');
    this.choicesPromptTitle = document.getElementById('choices-prompt-title');

    // Results Elements
    this.resultsCadetName = document.getElementById('results-cadet-name');
    this.awardStars = [
      document.getElementById('award-star-1'),
      document.getElementById('award-star-2'),
      document.getElementById('award-star-3')
    ];
    this.awardRankTitle = document.getElementById('award-rank-title');
    this.resScoreVal = document.getElementById('res-score-val');
    this.resCorrectVal = document.getElementById('res-correct-val');
    this.resAccuracyVal = document.getElementById('res-accuracy-val');

    // Webcam & Receipt
    this.cameraVideo = document.getElementById('camera-video');
    this.photoPreviewImg = document.getElementById('photo-preview-img');
    this.cameraFlash = document.getElementById('camera-flash');
    this.receiptPlayerName = document.getElementById('receipt-player-name');
    this.receiptModeName = document.getElementById('receipt-mode-name');
    this.receiptScore = document.getElementById('receipt-score');
    this.receiptDate = document.getElementById('receipt-date');
    this.receiptPhotoImg = document.getElementById('receipt-photo-img');
    this.receiptStars = document.getElementById('receipt-stars');
    this.receiptRank = document.getElementById('receipt-rank');

    // Header Controls
    this.headerPrinterDot = document.getElementById('header-printer-dot');
    this.headerPrinterText = document.getElementById('header-printer-text');
    this.soundIcon = document.getElementById('sound-icon');

    // Modals
    this.modalLeaderboard = document.getElementById('modal-leaderboard');
    this.leaderboardTbody = document.getElementById('leaderboard-tbody');
  }

  initEventListeners() {
    // Brand click -> Return to Home
    document.getElementById('btn-brand-home').addEventListener('click', () => {
      if (this.timerInterval) {
        if (!confirm('Leave current research round? Progress will be lost.')) return;
      }
      this.showScreen('home');
    });

    // Player name change
    this.playerNameInput.addEventListener('input', (e) => {
      this.playerName = e.target.value.trim();
      localStorage.setItem('science_fair_player_name', this.playerName);
    });

    // Mode Selection Buttons
    document.getElementById('card-start-synonym').addEventListener('click', () => {
      this.startGame('synonym');
    });
    document.getElementById('card-start-phenomenon').addEventListener('click', () => {
      this.startGame('phenomenon');
    });
    const cardEngSyn = document.getElementById('card-start-eng-synonym');
    if (cardEngSyn) {
      cardEngSyn.addEventListener('click', () => {
        this.startGame('eng_synonym');
      });
    }
    const cardEngIdiom = document.getElementById('card-start-eng-idiom');
    if (cardEngIdiom) {
      cardEngIdiom.addEventListener('click', () => {
        this.startGame('eng_idiom');
      });
    }

    // Subject Filter Tabs (All / Science / English)
    document.querySelectorAll('.subject-pill-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.subject-pill-btn').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const subject = pill.getAttribute('data-subject');
        document.querySelectorAll('.mode-card').forEach(card => {
          if (subject === 'all' || card.getAttribute('data-subject') === subject) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Sound Toggle
    document.getElementById('btn-sound-toggle').addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    // Printer Connection in Header
    document.getElementById('btn-bluetooth-printer').addEventListener('click', async () => {
      if (window.printerController.isConnected) {
        if (confirm(`Connected to ${window.printerController.deviceName}. Disconnect?`)) {
          await window.printerController.disconnect();
        }
      } else {
        await window.printerController.connect();
      }
    });

    // Leaderboard Modal Open/Close
    document.getElementById('btn-open-leaderboard').addEventListener('click', () => {
      this.openLeaderboardModal('all');
    });
    const btnViewAll = document.getElementById('btn-view-all-scores');
    if (btnViewAll) {
      btnViewAll.addEventListener('click', () => {
        this.openLeaderboardModal('all');
      });
    }
    document.getElementById('btn-close-leaderboard').addEventListener('click', () => {
      this.modalLeaderboard.classList.remove('open');
    });
    this.modalLeaderboard.addEventListener('click', (e) => {
      if (e.target === this.modalLeaderboard) {
        this.modalLeaderboard.classList.remove('open');
      }
    });

    // Leaderboard Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderLeaderboardTable(btn.getAttribute('data-mode'));
      });
    });

    // Results Screen Controls
    document.getElementById('btn-results-play-again').addEventListener('click', () => {
      this.startGame(this.currentMode);
    });
    document.getElementById('btn-results-home').addEventListener('click', () => {
      this.showScreen('home');
    });

    // Camera Controls
    document.getElementById('btn-take-selfie').addEventListener('click', () => {
      this.snapWebcamPhoto();
    });
    document.getElementById('btn-retake-photo').addEventListener('click', async () => {
      await this.startLiveWebcam();
    });

    // Printing Controls
    document.getElementById('btn-print-thermal').addEventListener('click', () => {
      this.handleBluetoothPrint();
    });
    document.getElementById('btn-browser-print').addEventListener('click', () => {
      window.print();
    });

    // Keyboard Shortcuts [A, B, C, D] or [1, 2, 3, 4] for Rapid Selection
    window.addEventListener('keydown', (e) => {
      if (this.screens.game.classList.contains('active') && !this.isAnsweringLocked) {
        const key = e.key.toUpperCase();
        const map = { 'A': 0, '1': 0, 'B': 1, '2': 1, 'C': 2, '3': 2, 'D': 3, '4': 3 };
        if (map[key] !== undefined) {
          const btn = document.getElementById(`choice-opt-${map[key]}`);
          if (btn) btn.click();
        }
      }
    });
  }

  initPrinterHooks() {
    window.printerController.onStatusChange = ({ connected, statusText, deviceName }) => {
      if (connected) {
        this.headerPrinterDot.className = 'printer-status-dot connected';
        this.headerPrinterText.textContent = `🖨️ ${deviceName}`;
      } else {
        this.headerPrinterDot.className = 'printer-status-dot';
        this.headerPrinterText.textContent = '🖨️ POS58 Printer';
      }
    };
  }

  showScreen(screenName) {
    // Stop any ongoing phenomenon animation if leaving game screen
    if (screenName !== 'game') {
      this.phenomenonCtrl.stop();
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
    // Stop camera if leaving results
    if (screenName !== 'results') {
      window.cameraController.stopCamera();
    }

    Object.keys(this.screens).forEach(key => {
      this.screens[key].classList.toggle('active', key === screenName);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Start 60-Second Timed Round
  startGame(mode) {
    this.currentMode = mode;
    this.score = 0;
    this.correctCount = 0;
    this.totalAnswered = 0;
    this.timerSeconds = 60;
    this.stars = 0;
    this.isAnsweringLocked = false;
    this.activePhotoData = null;

    const displayName = (this.playerName && this.playerName.trim()) ? this.playerName.trim() : 'Sloka Student';
    this.hudPlayerName.textContent = displayName;
    this.hudScoreText.textContent = '0';
    this.updateLiveStars(0);

    // Prepare questions queue based on mode
    let bank = SYNONYM_QUESTIONS;
    if (mode === 'phenomenon') {
      bank = PHENOMENON_QUESTIONS;
    } else if (mode === 'eng_synonym') {
      bank = ENGLISH_SYNONYM_QUESTIONS;
    } else if (mode === 'eng_idiom') {
      bank = ENGLISH_IDIOM_QUESTIONS;
    }
    this.questions = shuffleArray(bank);
    this.currentQIndex = 0;

    // Setup mode-specific HUD
    if (mode === 'synonym') {
      this.hudModeBadge.textContent = 'SCI SYNONYMS';
      this.choicesPromptTitle.textContent = 'Select the Correct Scientific Synonym:';
      this.synonymSvgWrapper.style.display = 'block';
      this.phenomenonCanvas.style.display = 'none';
      this.termEyebrow.textContent = 'SCIENTIFIC TERM';
    } else if (mode === 'phenomenon') {
      this.hudModeBadge.textContent = 'SCI PHENOMENA';
      this.choicesPromptTitle.textContent = 'Identify this Scientific Event:';
      this.synonymSvgWrapper.style.display = 'none';
      this.phenomenonCanvas.style.display = 'block';
      this.termEyebrow.textContent = 'OBSERVED EVENT';
    } else if (mode === 'eng_synonym') {
      this.hudModeBadge.textContent = 'ENG SYNONYMS';
      this.choicesPromptTitle.textContent = 'Select the Closest English Synonym:';
      this.synonymSvgWrapper.style.display = 'block';
      this.phenomenonCanvas.style.display = 'none';
      this.termEyebrow.textContent = 'ENGLISH VOCABULARY';
    } else if (mode === 'eng_idiom') {
      this.hudModeBadge.textContent = 'ENG IDIOMS';
      this.choicesPromptTitle.textContent = 'Identify the Figurative Meaning:';
      this.synonymSvgWrapper.style.display = 'none';
      this.phenomenonCanvas.style.display = 'block';
      this.termEyebrow.textContent = 'ILLUSTRATED EXPRESSION';
    }

    this.showScreen('game');
    this.renderCurrentQuestion();
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      this.updateTimerDisplay();

      // Sound and warning feedback
      if (this.timerSeconds <= 10 && this.timerSeconds > 0) {
        window.soundEngine.playTick(true);
      } else if (this.timerSeconds > 10 && this.timerSeconds % 10 === 0) {
        window.soundEngine.playTick(false);
      }

      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.endGame();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timerSeconds / 60);
    const secs = this.timerSeconds % 60;
    this.hudTimerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Visual styles based on remaining time
    this.hudTimerBox.classList.remove('warning', 'critical');
    if (this.timerSeconds <= 10) {
      this.hudTimerBox.classList.add('critical');
    } else if (this.timerSeconds <= 20) {
      this.hudTimerBox.classList.add('warning');
    }
  }

  renderCurrentQuestion() {
    if (this.currentQIndex >= this.questions.length) {
      // Loop or re-shuffle if user answers faster than bank size
      let bank = SYNONYM_QUESTIONS;
      if (this.currentMode === 'phenomenon') bank = PHENOMENON_QUESTIONS;
      else if (this.currentMode === 'eng_synonym') bank = ENGLISH_SYNONYM_QUESTIONS;
      else if (this.currentMode === 'eng_idiom') bank = ENGLISH_IDIOM_QUESTIONS;
      this.questions = shuffleArray(bank);
      this.currentQIndex = 0;
    }

    const q = this.questions[this.currentQIndex];
    this.isAnsweringLocked = false;
    this.feedbackBox.classList.remove('show', 'correct-text', 'incorrect-text');

    this.visualCategoryTag.textContent = q.category.toUpperCase();
    this.visualQuestionCounter.textContent = `Challenge #${this.totalAnswered + 1}`;

    if (this.currentMode === 'synonym' || this.currentMode === 'eng_synonym') {
      this.termTitle.textContent = q.term;
      this.termTagline.textContent = q.tagline;
      this.synonymSvgWrapper.innerHTML = getSynonymIllustration(q.illustration);
    } else {
      this.termTitle.textContent = q.title;
      this.termTagline.textContent = q.hint;
      this.phenomenonCtrl.start(q.animationType);
    }

    // Render 4 Options
    this.optionsContainer.innerHTML = '';
    const shuffledOpts = shuffleArray(q.options);
    const keys = ['A', 'B', 'C', 'D'];

    shuffledOpts.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.id = `choice-opt-${idx}`;
      btn.innerHTML = `
        <span class="choice-key">${keys[idx]}</span>
        <span class="choice-text">${optText}</span>
      `;

      btn.addEventListener('click', () => {
        this.handleOptionSelect(optText, q, btn);
      });

      this.optionsContainer.appendChild(btn);
    });
  }

  handleOptionSelect(selectedText, q, clickedBtn) {
    if (this.isAnsweringLocked) return;
    this.isAnsweringLocked = true;
    this.totalAnswered++;

    const isCorrect = (selectedText === q.correct);
    const allChoiceBtns = this.optionsContainer.querySelectorAll('.choice-btn');

    if (isCorrect) {
      this.correctCount++;
      this.score += 10;
      this.hudScoreText.textContent = this.score;
      window.soundEngine.playCorrect();

      clickedBtn.classList.add('correct');
      this.feedbackBox.className = 'feedback-box show correct-text';
      this.feedbackText.innerHTML = `<strong>✓ Correct!</strong> ${q.explanation}`;

      // Update Stars and confetti burst on star progression
      const prevStars = this.stars;
      this.stars = this.calculateStars(this.correctCount);
      this.updateLiveStars(this.stars);

      if (this.stars > prevStars) {
        window.soundEngine.playStar(this.stars);
        window.confettiEngine.burst();
      }
    } else {
      window.soundEngine.playIncorrect();
      clickedBtn.classList.add('incorrect');

      // Highlight the correct answer
      allChoiceBtns.forEach(btn => {
        const text = btn.querySelector('.choice-text').textContent;
        if (text === q.correct) {
          btn.classList.add('correct');
        }
      });

      this.feedbackBox.className = 'feedback-box show incorrect-text';
      this.feedbackText.innerHTML = `<strong>✗ Incorrect.</strong> Correct answer: <em>${q.correct}</em>. ${q.explanation}`;
    }

    // Advance to next question after a brief delay so user can read explanation
    setTimeout(() => {
      this.currentQIndex++;
      this.renderCurrentQuestion();
    }, 1300);
  }

  calculateStars(correctMatches) {
    if (correctMatches >= 7) return 3;
    if (correctMatches >= 4) return 2;
    if (correctMatches >= 1) return 1;
    return 0;
  }

  updateLiveStars(starCount) {
    this.liveStars.forEach((starEl, index) => {
      starEl.classList.toggle('inactive', index >= starCount);
    });
  }

  // End of strict 60 seconds
  async endGame() {
    this.phenomenonCtrl.stop();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const finalStars = Math.max(1, this.calculateStars(this.correctCount)); // grant at least 1 star for participating
    this.stars = finalStars;

    // Sound fanfare & confetti
    window.soundEngine.playFanfare();
    window.confettiEngine.burst(window.innerWidth / 2, window.innerHeight * 0.35, 120);

    const displayName = (this.playerName && this.playerName.trim()) ? this.playerName.trim() : 'Sloka Student';
    const accuracy = this.totalAnswered > 0 ? Math.round((this.correctCount / this.totalAnswered) * 100) + '%' : '0%';

    // Populate Results Screen
    this.resultsCadetName.textContent = `Cadet ${displayName}`;
    this.resScoreVal.textContent = this.score;
    this.resCorrectVal.textContent = this.correctCount;
    this.resAccuracyVal.textContent = accuracy;

    // Star rank title
    let rankTitle = 'NOVICE RESEARCHER';
    if (finalStars === 2) rankTitle = 'LAB SPECIALIST';
    if (finalStars === 3) rankTitle = 'SCIENCE FAIR GENIUS';
    this.awardRankTitle.textContent = rankTitle;

    // Animate Award Stars
    this.awardStars.forEach((starEl, i) => {
      starEl.classList.remove('earned');
      if (i < finalStars) {
        setTimeout(() => {
          starEl.classList.add('earned');
          window.soundEngine.playStar(i + 1);
        }, (i + 1) * 350);
      }
    });

    // Save score to leaderboard
    window.leaderboardManager.addScore({
      name: displayName,
      mode: this.currentMode,
      score: this.score,
      stars: finalStars,
      accuracy: accuracy
    });
    this.updateLeaderboardUI();

    // Populate Virtual 58mm Thermal Receipt
    let modeTitleForReceipt = 'SCI SYNONYM MATCH';
    if (this.currentMode === 'phenomenon') modeTitleForReceipt = 'SCI PHENOMENON GUESS';
    else if (this.currentMode === 'eng_synonym') modeTitleForReceipt = 'ENG SYNONYM MATCH';
    else if (this.currentMode === 'eng_idiom') modeTitleForReceipt = 'ENG IDIOM GUESS';

    this.receiptPlayerName.textContent = displayName.toUpperCase();
    this.receiptModeName.textContent = modeTitleForReceipt;
    this.receiptScore.textContent = `${this.score} PTS`;
    this.receiptDate.textContent = new Date().toLocaleDateString();
    this.receiptStars.textContent = '★ '.repeat(finalStars) + '☆ '.repeat(3 - finalStars);
    this.receiptRank.textContent = rankTitle;

    // Immediate photo initialization (either preserved from quick snap or scientist avatar)
    const initialPhoto = this.activePhotoData || window.cameraController.capturePhoto();
    this.receiptPhotoImg.src = initialPhoto;
    this.photoPreviewImg.src = initialPhoto;

    this.showScreen('results');

    // Start Live Camera Preview for Keepsake Selfie
    await this.startLiveWebcam();
  }

  async startLiveWebcam() {
    window.cameraController.setVideoElement(this.cameraVideo);
    const cameraStarted = await window.cameraController.startCamera();

    if (cameraStarted) {
      this.cameraVideo.style.display = 'block';
      this.photoPreviewImg.style.display = 'none';
    } else {
      // Fallback: Generate science avatar badge
      this.snapWebcamPhoto();
    }
  }

  snapWebcamPhoto() {
    // Flash effect
    this.cameraFlash.classList.add('flash');
    setTimeout(() => this.cameraFlash.classList.remove('flash'), 350);

    const photoDataUrl = window.cameraController.capturePhoto();
    this.activePhotoData = photoDataUrl;

    // Stop video stream and show frozen photo
    window.cameraController.stopCamera();
    this.cameraVideo.style.display = 'none';
    this.photoPreviewImg.style.display = 'block';
    this.photoPreviewImg.src = photoDataUrl;

    // Update receipt photo
    this.receiptPhotoImg.src = photoDataUrl;
  }

  async handleBluetoothPrint() {
    const displayName = (this.playerName && this.playerName.trim()) ? this.playerName.trim() : 'Sloka Student';
    let modeTitle = 'SCI SYNONYM MATCH';
    if (this.currentMode === 'phenomenon') modeTitle = 'SCI PHENOMENON GUESS';
    else if (this.currentMode === 'eng_synonym') modeTitle = 'ENG SYNONYM MATCH';
    else if (this.currentMode === 'eng_idiom') modeTitle = 'ENG IDIOM GUESS';

    if (!window.printerController.isConnected) {
      const connectSuccess = await window.printerController.connect();
      if (!connectSuccess) {
        alert('Could not establish Bluetooth connection to POS-58 printer.\nYou can use the "Print Keepsake Slip (Browser Print)" option below to print on any printer or thermal spool!');
        return;
      }
    }

    const printSuccess = await window.printerController.printReceipt({
      playerName: displayName,
      modeTitle: modeTitle,
      score: this.score,
      stars: this.stars,
      dateStr: new Date().toLocaleDateString(),
      imageElement: this.receiptPhotoImg
    });

    if (printSuccess) {
      window.confettiEngine.burst();
      alert('Keepsake sent to POS-58 thermal printer successfully!');
    } else {
      alert('Printing via Bluetooth completed or printer queued. If paper did not feed, verify POS58 is powered on with paper roll inserted.');
    }
  }

  // Leaderboard Modal & UI
  updateLeaderboardUI() {
    // Mini leaderboard on home screen
    const miniScores = window.leaderboardManager.getScores('all', 3);
    const miniContainer = document.querySelector('.mini-leaderboard-list');
    if (miniContainer) {
      miniContainer.innerHTML = '';
      miniScores.forEach((s, idx) => {
        const medals = ['🥇', '🥈', '🥉'];
        const row = document.createElement('div');
        row.className = 'mini-score-row';
        row.innerHTML = `
          <span class="mini-score-rank">${medals[idx] || (idx + 1)}</span>
          <span class="mini-score-name">${s.name}</span>
          <span class="mini-score-pts">${s.score} pts</span>
        `;
        miniContainer.appendChild(row);
      });
    }
  }

  openLeaderboardModal(mode = 'all') {
    this.renderLeaderboardTable(mode);
    this.modalLeaderboard.classList.add('open');
  }

  renderLeaderboardTable(mode = 'all') {
    const scores = window.leaderboardManager.getScores(mode, 15);
    this.leaderboardTbody.innerHTML = '';

    if (scores.length === 0) {
      this.leaderboardTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#94a3b8;">No research records yet. Be the first!</td></tr>`;
      return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    const modeBadgeMap = {
      'synonym': '🔬 Sci Syn',
      'phenomenon': '🌌 Sci Phen',
      'eng_synonym': '📖 Eng Syn',
      'eng_idiom': '🎭 Eng Idiom'
    };

    scores.forEach((s, index) => {
      const tr = document.createElement('tr');
      const starStr = '★'.repeat(s.stars);
      const modeBadge = modeBadgeMap[s.mode] || s.mode;

      tr.innerHTML = `
        <td><span class="rank-badge">${medals[index] || '#' + (index + 1)}</span></td>
        <td><strong>${s.name}</strong></td>
        <td><span style="font-size:0.8rem; color:var(--cyan-glow);">${modeBadge}</span></td>
        <td style="color:var(--amber-gold);">${starStr}</td>
        <td><strong style="color:var(--emerald-glow); font-family:var(--font-mono);">${s.score}</strong></td>
      `;
      this.leaderboardTbody.appendChild(tr);
    });
  }
}

// Initialize Application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.scienceApp = new ScienceFairApp();
});
