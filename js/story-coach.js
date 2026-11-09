// Story Coach: friendly feedback that runs on the device, free and instant, with no AI service.
// It looks for concrete storytelling habits (senses, story parts, linking words, the day's word
// and Power Sentence) and always answers with two stars and one wish, never a page of corrections.

const STCoach = {
  norm(text) {
    return String(text || '').toLowerCase().replace(/[’']/g, '').replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter(Boolean);
  },

  hasPhrase(text, phrase) {
    return (` ${this.norm(text).join(' ')} `).includes(` ${this.norm(phrase).join(' ')} `);
  },

  // Longest run of target words said in the right order, ignoring extra words (for "say it" practice)
  matchScore(said, target) {
    const a = this.norm(said);
    const b = this.norm(target);
    if (!b.length) return 0;
    const row = new Array(b.length + 1).fill(0);
    a.forEach(w => {
      let prev = 0;
      for (let j = 1; j <= b.length; j++) {
        const old = row[j];
        row[j] = this.sameWord(w, b[j - 1]) ? prev + 1 : Math.max(row[j], row[j - 1]);
        prev = old;
      }
    });
    return row[b.length] / b.length;
  },

  // Forgiving word match: speech tools often mishear a letter or an ending
  sameWord(a, b) {
    if (a === b) return true;
    if (Math.min(a.length, b.length) < 4) return false;
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i >= Math.max(a.length, b.length) - 2;
  },

  // Did the story use this Power Sentence? Fixed words must appear in order; swap slots can change.
  usedSentence(text, sentence) {
    const frame = this.norm(sentence.parts.join(' '));
    if (frame.length < 2) return this.hasPhrase(text, sentence.text);
    return this.matchScore(text, frame.join(' ')) >= 0.75;
  },

  usedWord(text, word) {
    if (!word) return false;
    const stem = word.toLowerCase().slice(0, Math.max(3, word.length - 2));
    return this.norm(text).some(w => w.startsWith(stem));
  },

  review({ sentences, level, dayKey, power, word }) {
    const lines = sentences.map(s => s.trim()).filter(Boolean);
    const text = lines.join(' ');
    const words = this.norm(text);
    const set = new Set(words);
    const count = (list) => list.filter(x => (x.includes(' ') ? this.hasPhrase(text, x) : set.has(x)));

    const senses = Object.entries(ST_LEX.senses).filter(([, l]) => l.split(' ').some(w => set.has(w))).map(([k]) => k);
    const senseWords = Object.values(ST_LEX.senses).flatMap(l => l.split(' ')).filter(w => set.has(w));
    const feelings = ST_LEX.feelings.split(' ').filter(w => set.has(w));
    const order = count(ST_LEX.order);
    const problem = count(ST_LEX.problem);
    const ending = count(ST_LEX.ending);
    const linkers = count(ST_LEX.linkers);
    const dialogue = count(ST_LEX.dialogue).length > 0 || /["“”]/.test(text);
    const usedPower = power ? this.usedSentence(text, power) : false;
    const usedTheWord = this.usedWord(text, word);
    const andThen = (text.toLowerCase().match(/\band then\b/g) || []).length;
    const starts = lines.map(l => this.norm(l)[0]);
    const repeatedStart = lines.length >= 3 && starts.some((s, i) => i >= 2 && s === starts[i - 1] && s === starts[i - 2]);
    const lengths = lines.map(l => this.norm(l).length);
    const longest = Math.max(0, ...lengths);
    const weak = Object.keys(ST_LEX.swaps).filter(w => words.filter(x => x === w).length >= (w === 'very' || w === 'went' || w === 'said' ? 2 : 1));

    const skillMet = {
      retell: order.length >= (level === 'explorers' ? 2 : 1),
      character: feelings.length > 0 || dialogue || senseWords.length > 0,
      setting: senses.length >= (level === 'explorers' ? 2 : 1),
      problem: problem.length > 0 || (level === 'explorers' && linkers.includes('because')),
      ending: ending.length > 0
    }[dayKey];

    const stars = [];
    const add = (icon, msg) => stars.push({ icon, text: msg });
    if (skillMet) {
      add('🎯', {
        retell: 'You kept the story in order with “' + (order[0] || 'time words') + '”.',
        character: 'I can really imagine your character.',
        setting: `You used your senses (${senses.join(', ') || 'great detail'}). I felt I was there!`,
        problem: 'Your problem made me want to know what happens next.',
        ending: 'That was a satisfying ending.'
      }[dayKey]);
    }
    if (usedPower) add('💪', 'You used your Power Sentence in your story!');
    if (usedTheWord) add('📚', `You used today’s word “${word}”.`);
    if (senses.length && dayKey !== 'setting') add('🌈', `Lovely sense words: ${senseWords.slice(0, 3).join(', ')}.`);
    if (feelings.length && dayKey !== 'character') add('💛', `You told us how someone felt: ${feelings[0]}.`);
    if (dialogue && dayKey !== 'character') add('💬', 'Your characters speak, which brings them to life.');
    if (linkers.some(l => ['because', 'although', 'while', 'since'].includes(l))) add('🔗', `“${linkers.find(l => ['because', 'although', 'while', 'since'].includes(l))}” joined your ideas well.`);
    if (longest >= 12 && andThen < 2) add('📏', 'You told one long, rich sentence.');
    if (lines.length >= (ST_LEVELS[level] || {}).minSentences + 2) add('🏃', `${lines.length} sentences. What a storyteller!`);
    add('👏', lines.length ? `You told a whole story with ${words.length} words.` : 'You tried, and that is how stories start.');
    add('🌱', 'You kept going and finished your story.');

    // One wish only: the most useful next step
    const wishes = [];
    const wish = (msg, try_) => wishes.push({ text: msg, example: try_ });
    const min = (ST_LEVELS[level] || {}).minSentences || 1;
    if (lines.length < min) wish(`Add ${min - lines.length} more sentence${min - lines.length > 1 ? 's' : ''}. What happened next?`, 'Then…');
    if (!skillMet) {
      wish({
        retell: 'Put the story in order with a time word.',
        character: 'Tell us how your character feels or what they say.',
        setting: level === 'explorers' ? 'Add a second sense: what can you hear or smell?' : 'Add something you can see, hear or smell.',
        problem: level === 'explorers' ? 'Say why it went wrong using “because”.' : 'Show the trouble with “but” or “suddenly”.',
        ending: 'End with “finally” and how everyone felt.'
      }[dayKey], { retell: 'First… Then… Last…', character: 'She felt… / “Help!” she cried.', setting: 'I could hear…', problem: 'But suddenly…', ending: 'Finally…' }[dayKey]);
    }
    if (power && !usedPower) wish('Use your Power Sentence somewhere in your story.', power.text);
    if (word && !usedTheWord) wish(`Try to fit in today’s word “${word}”.`, '');
    if (andThen >= 2) wish('You used “and then” a lot. Try “after that”, “suddenly” or “later”.', 'After that…');
    if (repeatedStart) wish(`Three sentences start with “${starts.find((s, i) => i >= 2 && s === starts[i - 1])}”. Start one in a new way.`, 'Suddenly… / Slowly… / At last…');
    if (weak.length) wish(`Swap “${weak[0]}” for a stronger word.`, ST_LEX.swaps[weak[0]]);
    if (!senses.length) wish('Add one thing we could see, hear or smell.', 'The air smelled of…');

    const score = Math.min(3, 1 + (skillMet ? 1 : 0) + (usedPower || usedTheWord ? 1 : 0));
    return {
      stars: stars.slice(0, 2),
      wish: wishes[0] || { text: 'Tell it aloud once more, slowly, with lots of expression.', example: '' },
      score, skillMet, usedPower, usedTheWord,
      metrics: { words: words.length, sentences: lines.length, senses: senses.length, senseWords: senseWords.length, linkers: linkers.length }
    };
  }
};
