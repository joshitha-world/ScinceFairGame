// Word Quest progress merging, shared by the browser and the Node server.
// Progress only ever grows (days learned, best quiz scores, stickers), so two copies merge
// without conflicts: the union of both, keeping the best result for anything in both.
//
// progress = {
//   days:     { 'YYYY-MM-DD': { t, wk, w, stars, sentence, at, printed } },   t = track, wk = theme index
//   quizzes:  { 'YYYY-MM-DD' (week's Monday): { t, wk, best, total, tier, tries, at } },
//   stickers: { 'track-theme' | badge id: { tier, at } }
// }

(function (root) {
  const LIMITS = { days: 4000, quizzes: 800, stickers: 400, text: 240 };
  const KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const STICKER_RE = /^[a-z0-9-]{1,40}$/;

  const num = (v, max) => {
    const n = Math.floor(Number(v));
    return Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
  };
  const str = (v, max = LIMITS.text) => (typeof v === 'string' ? v.slice(0, max) : '');

  function cleanDay(d) {
    if (!d || typeof d !== 'object') return null;
    return {
      t: str(d.t, 20), wk: num(d.wk, 999), w: str(d.w, 40),
      stars: num(d.stars, 3), sentence: str(d.sentence), at: num(d.at, 9e15), printed: num(d.printed, 999)
    };
  }

  function cleanQuiz(q) {
    if (!q || typeof q !== 'object') return null;
    return {
      t: str(q.t, 20), wk: num(q.wk, 999), best: num(q.best, 100), total: num(q.total, 100),
      tier: num(q.tier, 3), tries: num(q.tries, 9999), at: num(q.at, 9e15)
    };
  }

  function cleanSticker(s) {
    if (!s || typeof s !== 'object') return null;
    return { tier: num(s.tier, 3), at: num(s.at, 9e15) };
  }

  function cleanMap(map, keyRe, clean, limit) {
    const out = {};
    if (!map || typeof map !== 'object') return out;
    Object.keys(map).slice(0, limit).forEach(k => {
      if (!keyRe.test(k)) return;
      const v = clean(map[k]);
      if (v) out[k] = v;
    });
    return out;
  }

  function cleanProgress(p) {
    p = p && typeof p === 'object' ? p : {};
    return {
      days: cleanMap(p.days, KEY_RE, cleanDay, LIMITS.days),
      quizzes: cleanMap(p.quizzes, KEY_RE, cleanQuiz, LIMITS.quizzes),
      stickers: cleanMap(p.stickers, STICKER_RE, cleanSticker, LIMITS.stickers)
    };
  }

  const earliest = (a, b) => (a && b ? Math.min(a, b) : a || b);

  function mergeProgress(a, b) {
    a = cleanProgress(a);
    b = cleanProgress(b);
    const out = { days: { ...a.days }, quizzes: { ...a.quizzes }, stickers: { ...a.stickers } };

    Object.entries(b.days).forEach(([k, d]) => {
      const o = out.days[k];
      out.days[k] = !o ? d : {
        ...o,
        stars: Math.max(o.stars, d.stars),
        sentence: d.sentence.length > o.sentence.length ? d.sentence : o.sentence,
        at: earliest(o.at, d.at),
        printed: Math.max(o.printed, d.printed)
      };
    });

    Object.entries(b.quizzes).forEach(([k, q]) => {
      const o = out.quizzes[k];
      if (!o) { out.quizzes[k] = q; return; }
      const better = q.best > o.best ? q : o;
      out.quizzes[k] = { ...better, tier: Math.max(o.tier, q.tier), tries: Math.max(o.tries, q.tries) };
    });

    Object.entries(b.stickers).forEach(([k, s]) => {
      const o = out.stickers[k];
      out.stickers[k] = !o ? s : { tier: Math.max(o.tier, s.tier), at: earliest(o.at, s.at) };
    });
    return out;
  }

  // Profile is last-writer-wins on updatedAt
  function cleanProfile(p) {
    p = p && typeof p === 'object' ? p : {};
    return {
      name: str(p.name, 24).trim() || 'Learner',
      avatar: str(p.avatar, 16) || '🦁',
      track: str(p.track, 20) || 'explorer',
      trackStart: KEY_RE.test(p.trackStart) ? p.trackStart : '',
      updatedAt: num(p.updatedAt, 9e15)
    };
  }

  function mergeProfile(a, b) {
    a = cleanProfile(a);
    b = cleanProfile(b);
    return b.updatedAt > a.updatedAt ? b : a;
  }

  const api = { cleanProgress, mergeProgress, cleanProfile, mergeProfile };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WQMerge = api;
})(typeof window !== 'undefined' ? window : globalThis);
