// Leaderboard Management with LocalStorage persistence

const LEADERBOARD_KEY = 'science_fair_leaderboard_v1';

const DEFAULT_LEADERBOARD = [
  { name: 'Marie Curie', mode: 'synonym', score: 120, stars: 3, accuracy: '100%', date: '2026-10-25' },
  { name: 'William Shakespeare', mode: 'eng_idiom', score: 115, stars: 3, accuracy: '95%', date: '2026-10-25' },
  { name: 'Albert Einstein', mode: 'phenomenon', score: 110, stars: 3, accuracy: '92%', date: '2026-10-26' },
  { name: 'Maya Angelou', mode: 'eng_synonym', score: 105, stars: 3, accuracy: '94%', date: '2026-10-26' },
  { name: 'Ada Lovelace', mode: 'synonym', score: 95, stars: 3, accuracy: '88%', date: '2026-10-26' },
  { name: 'Jane Austen', mode: 'eng_idiom', score: 90, stars: 3, accuracy: '90%', date: '2026-10-26' },
  { name: 'Carl Sagan', mode: 'phenomenon', score: 85, stars: 2, accuracy: '80%', date: '2026-10-27' },
  { name: 'Mark Twain', mode: 'eng_synonym', score: 80, stars: 2, accuracy: '82%', date: '2026-10-27' },
  { name: 'Rosalind Franklin', mode: 'synonym', score: 70, stars: 2, accuracy: '75%', date: '2026-10-27' },
  { name: 'Isaac Newton', mode: 'phenomenon', score: 60, stars: 2, accuracy: '70%', date: '2026-10-27' }
];

class LeaderboardManager {
  constructor() {
    this.scores = this.loadScores();
  }

  loadScores() {
    try {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse leaderboard from localStorage:', e);
    }
    // Seed initial inspiring scores
    this.saveScores(DEFAULT_LEADERBOARD);
    return [...DEFAULT_LEADERBOARD];
  }

  saveScores(scores) {
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores));
    } catch (e) {
      console.warn('Failed to save leaderboard to localStorage:', e);
    }
  }

  addScore({ name, mode, score, stars, accuracy, photo }) {
    const cleanName = (name && name.trim()) ? name.trim() : 'Sloka Student';
    const entry = {
      id: 'entry_' + Date.now(),
      name: cleanName,
      mode: mode, // 'synonym' or 'phenomenon'
      score: score || 0,
      stars: stars || 1,
      accuracy: accuracy || '100%',
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      photo: photo || null
    };

    this.scores.push(entry);
    // Sort descending by score
    this.scores.sort((a, b) => b.score - a.score);
    // Keep top 50
    if (this.scores.length > 50) {
      this.scores = this.scores.slice(0, 50);
    }
    this.saveScores(this.scores);
    return entry;
  }

  getScores(mode = 'all', limit = 10) {
    let list = this.scores;
    if (mode && mode !== 'all') {
      list = list.filter(item => item.mode === mode);
    }
    return list.slice(0, limit);
  }

  resetLeaderboard() {
    this.scores = [...DEFAULT_LEADERBOARD];
    this.saveScores(this.scores);
    return this.scores;
  }
}

window.leaderboardManager = new LeaderboardManager();

