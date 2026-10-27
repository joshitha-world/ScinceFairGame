// Leaderboard Management with LocalStorage & Offline-First Sync Support
// Sloka The School - Edu Fair 2026

const LEADERBOARD_KEY = 'sloka_edufair_leaderboard_v2';
const DEFAULT_LEADERBOARD = []; // Clean empty start for real event participants

class LeaderboardManager {
  constructor() {
    this.scores = this.loadScores();
    this.isOnline = navigator.onLine;
    this.initNetworkListeners();
  }

  initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncScoresWithServer();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
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
      id: 'sloka_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: cleanName,
      mode: mode, // 'synonym', 'phenomenon', 'eng_synonym', 'eng_idiom'
      score: score || 0,
      stars: stars || 1,
      accuracy: accuracy || '100%',
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      photo: photo || null,
      synced: false
    };

    this.scores.push(entry);
    // Sort descending by score
    this.scores.sort((a, b) => b.score - a.score);
    // Keep top 100
    if (this.scores.length > 100) {
      this.scores = this.scores.slice(0, 100);
    }
    this.saveScores(this.scores);

    // Attempt online sync in background if internet is active
    if (this.isOnline) {
      this.syncScoresWithServer();
    }

    return entry;
  }

  getScores(mode = 'all', limit = 10) {
    let list = this.scores;
    if (mode && mode !== 'all') {
      list = list.filter(item => item.mode === mode);
    }
    return list.slice(0, limit);
  }

  // Sync offline-collected scores to the server when connection is available
  async syncScoresWithServer() {
    if (!navigator.onLine) return false;

    const unsynced = this.scores.filter(s => !s.synced);
    if (unsynced.length === 0) return true;

    try {
      const response = await fetch('/api/sync-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: unsynced })
      });

      if (response.ok) {
        const result = await response.json();
        // Mark as synced locally
        this.scores.forEach(s => { s.synced = true; });
        this.saveScores(this.scores);
        console.log('[Leaderboard] Synced scores to server successfully:', result);
        return true;
      }
    } catch (err) {
      console.warn('[Leaderboard] Background sync deferred (offline or server unreachable):', err);
    }
    return false;
  }

  // Export full leaderboard to CSV for teachers/organizers without needing internet
  exportScoresToCSV() {
    if (this.scores.length === 0) {
      alert('No scores recorded yet to export.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rank,Student Name,Challenge Mode,Stars,Score (PTS),Accuracy,Date\n";

    this.scores.forEach((entry, index) => {
      const modeLabel = {
        'synonym': 'Science Synonym Match',
        'phenomenon': 'Science Phenomenon Guess',
        'eng_synonym': 'English Synonym Match',
        'eng_idiom': 'English Idiom Guess'
      }[entry.mode] || entry.mode;

      const safeName = `"${entry.name.replace(/"/g, '""')}"`;
      csvContent += `${index + 1},${safeName},"${modeLabel}",${entry.stars},${entry.score},${entry.accuracy},${entry.date}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sloka_EduFair_2026_Scores_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  clearScores() {
    if (confirm('Clear all local leaderboard records? This cannot be undone.')) {
      this.scores = [];
      this.saveScores(this.scores);
      return true;
    }
    return false;
  }
}

window.leaderboardManager = new LeaderboardManager();
