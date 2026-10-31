// Word Quest progress merging, shared by the browser and the Node server.
// Progress only ever grows (days learned, best quiz scores, stickers), so two copies merge
// without conflicts: the union of both, keeping the best result for anything in both.
//
// progress = {
//   days:     { 'YYYY-MM-DD': { t, wk, w, stars, sentence, at, printed } },   t = track, wk = theme index
//   quizzes:  { 'YYYY-MM-DD' (week's Monday): { t, wk, best, total, tier, tries, at } },
//   stickers: { 'track-theme' | badge id: { tier, at } },
//   robo: {   Robo Academy
//     lessons: { 'd001': { stars, built, at, printed } },
//     tests:   { 'w01':  { best, total, tier, tries, at } }   tier 1 = passed, 2 = distinction
//   }
// }

(function (root) {
  const LIMITS = { days: 4000, quizzes: 800, stickers: 400, text: 240 };
  const KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
  const STICKER_RE = /^[a-z0-9-]{1,40}$/;
  const LESSON_RE = /^d\d{3}$/;
  const TEST_RE = /^w\d{2}$/;

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

  function cleanLesson(l) {
    if (!l || typeof l !== 'object') return null;
    return { stars: num(l.stars, 3), built: num(l.built, 1), at: num(l.at, 9e15), printed: num(l.printed, 999) };
  }

  function cleanTest(t) {
    if (!t || typeof t !== 'object') return null;
    return { best: num(t.best, 100), total: num(t.total, 100), tier: num(t.tier, 2), tries: num(t.tries, 9999), at: num(t.at, 9e15) };
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
      stickers: cleanMap(p.stickers, STICKER_RE, cleanSticker, LIMITS.stickers),
      robo: {
        lessons: cleanMap(p.robo && p.robo.lessons, LESSON_RE, cleanLesson, 500),
        tests: cleanMap(p.robo && p.robo.tests, TEST_RE, cleanTest, 100)
      }
    };
  }

  const earliest = (a, b) => (a && b ? Math.min(a, b) : a || b);

  function mergeProgress(a, b) {
    a = cleanProgress(a);
    b = cleanProgress(b);
    const out = {
      days: { ...a.days }, quizzes: { ...a.quizzes }, stickers: { ...a.stickers },
      robo: { lessons: { ...a.robo.lessons }, tests: { ...a.robo.tests } }
    };

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

    Object.entries(b.robo.lessons).forEach(([k, l]) => {
      const o = out.robo.lessons[k];
      out.robo.lessons[k] = !o ? l : {
        stars: Math.max(o.stars, l.stars), built: Math.max(o.built, l.built),
        at: earliest(o.at, l.at), printed: Math.max(o.printed, l.printed)
      };
    });

    Object.entries(b.robo.tests).forEach(([k, t]) => {
      const o = out.robo.tests[k];
      if (!o) { out.robo.tests[k] = t; return; }
      const better = t.best > o.best ? t : o;
      out.robo.tests[k] = { ...better, tier: Math.max(o.tier, t.tier), tries: Math.max(o.tries, t.tries) };
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
