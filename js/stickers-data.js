// Sticker Maker data: fonts, borders, clip art and ready-made templates.
// Sizes are in millimetres. A 58 mm thermal roll prints 48 mm wide (384 dots, 8 dots per mm).

const SM_DPM = 8;          // printer dots per mm
const SM_PAPER_MM = 48;    // printable width of a 58 mm roll
const SM_GAP_X = 2;        // mm between stickers printed side by side

const SM_FONTS = {
  round: { label: 'Rounded', css: '"Segoe UI", Roboto, "Noto Sans", Arial, sans-serif' },
  hand: { label: 'Handwriting', css: '"Comic Sans MS", "Segoe Print", "Chalkboard SE", casual, cursive' },
  fancy: { label: 'Fancy', css: '"Segoe Script", "Brush Script MT", "Dancing Script", cursive' },
  poster: { label: 'Poster', css: 'Impact, "Arial Black", "Roboto Condensed", sans-serif' },
  classic: { label: 'Classic', css: 'Georgia, "Times New Roman", "Noto Serif", serif' },
  type: { label: 'Typewriter', css: '"Courier New", "Roboto Mono", monospace' }
};
const SM_EMOJI_FONT = '"Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji"';

const SM_FRAMES = [
  ['none', 'None'], ['line', 'Line'], ['thick', 'Thick'], ['double', 'Double'], ['rounded', 'Rounded'],
  ['dashed', 'Dashed'], ['dots', 'Dots'], ['scallop', 'Scallop'], ['ticket', 'Ticket'], ['circle', 'Circle'],
  ['stars', 'Stars ⭐'], ['flowers', 'Flowers 🌸'], ['hearts', 'Hearts ❤️']
];

const SM_LENGTHS = [15, 20, 25, 30, 40, 50, 60, 80, 100, 120];

const SM_CLIPART = [
  ['🌸', 'Flowers', '🌸 🌺 🌻 🌼 🌷 🌹 💐 🪷 🪻 🌱 🌿 🍀 🍁 🍂 🌵 🌴 🌾 🍄'],
  ['🐦', 'Birds', '🐦 🦜 🦉 🦅 🦆 🦢 🐧 🐤 🐣 🐥 🕊️ 🦩 🦚 🐓 🪿 🪶'],
  ['🐶', 'Animals', '🐶 🐱 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🦄 🐢 🐬 🐳 🐠 🦋 🐝 🐞 🦒 🐘 🦓'],
  ['⭐', 'Stars & hearts', '⭐ 🌟 ✨ 💫 ❤️ 🧡 💛 💚 💙 💜 💖 💕 💗 🌈 ☀️ 🌙 ☁️ ⚡ 🔥 💎'],
  ['✏️', 'School', '✏️ 📚 📖 📒 📓 📘 📗 📕 🖍️ 🖊️ 📐 📏 ✂️ 🎒 🧮 🔬 🔭 🧪 🌍 🎓 🏫 💡 🧠 🖥️'],
  ['🚀', 'Space', '🚀 🪐 🌙 ⭐ 🌟 ☄️ 🛸 👽 🌍 🌕 🔭 👩‍🚀 🛰️'],
  ['⚽', 'Sports', '⚽ 🏀 🏏 🏸 🎾 🏐 🏓 🥇 🏆 🎯 🥋 🏊 🚴 ⛸️ 🪁 🛹'],
  ['🍎', 'Food', '🍎 🍌 🍓 🍉 🍇 🍒 🥭 🍕 🍩 🍪 🧁 🍰 🍫 🍦 🥪 🍱 🥛 🧃'],
  ['🎨', 'Art & music', '🎨 🖌️ 🎵 🎶 🎸 🎹 🥁 🎤 🎭 🎬 📷 🧩 🎮'],
  ['🎂', 'Party', '🎂 🎈 🎉 🎁 🎀 🪅 🎊 🥳 👑 🍭 🍬 🪄'],
  ['😊', 'Faces', '😀 😃 😊 😍 🤩 😎 🥳 🤓 😇 🤗 👍 👏 🙌 ✌️ 🫶 💪'],
  ['🚗', 'Vehicles', '🚗 🚌 🚓 🚑 🚒 🚜 🚂 ✈️ 🚁 ⛵ 🚲 🛵 🏎️ 🚀'],
  ['🌳', 'Nature', '☀️ ⛅ 🌧️ ⛄ ❄️ 🌈 🌊 🏔️ 🌳 🌲 🐚 🪨 🌋 🏝️'],
  ['🤖', 'Science & tech', '🤖 🔋 💡 🔌 🧲 ⚙️ 🔧 🔬 🧬 🧪 💻 📱 🛰️ ⚛️']
].map(([icon, name, list]) => ({ icon, name, items: list.split(' ') }));

// Kid-friendly sample answers for template previews
const SM_SAMPLE = { name: 'Joshitha', class: '6B', section: 'B', roll: '12', subject: 'Science', school: 'Sloka The School', phone: '98765 43210' };

const SM_FIELD_LABELS = {
  name: 'Name', class: 'Class', section: 'Section', roll: 'Roll No.', subject: 'Subject', school: 'School', phone: 'Phone'
};

// Element helpers (x, y are the centre of the element, in mm)
const smText = (text, x, y, o = {}) => ({ type: 'text', text, x, y, rot: 0, font: 'round', size: 4, bold: false, italic: false, align: 'center', width: 0, invert: false, ...o });
const smEmoji = (char, x, y, size, o = {}) => ({ type: 'emoji', char, x, y, size, rot: 0, ...o });

// Each template sets its best size and lays itself out for that size (W × H mm)
const SM_TEMPLATES = [
  {
    id: 'notebook', icon: '📒', name: 'Notebook label', about: 'Name, class, roll no., subject and school',
    geom: { orient: 'portrait', length: 40, across: 1 }, frame: 'double',
    fields: ['name', 'class', 'section', 'roll', 'subject', 'school'],
    build: (W, H) => [
      smEmoji('📘', 6.5, 6.8, 6),
      smEmoji('✏️', W - 6.5, 6.8, 6),
      smText('{subject}', W / 2, 6.8, { size: 4.6, bold: true, font: 'hand' }),
      smText('Name: {name}', W / 2, H * 0.38, { size: 3.4, bold: true, align: 'left', width: W - 7 }),
      smText('Class: {class}   Sec: {section}', W / 2, H * 0.53, { size: 3.2, align: 'left', width: W - 7 }),
      smText('Roll No: {roll}', W / 2, H * 0.68, { size: 3.2, align: 'left', width: W - 7 }),
      smText('{school}', W / 2, H * 0.85, { size: 2.8, italic: true, width: W - 7 })
    ]
  },
  {
    id: 'subject', icon: '🔬', name: 'Subject label', about: 'Big subject name with an icon',
    geom: { orient: 'portrait', length: 30, across: 1 }, frame: 'rounded',
    fields: ['subject', 'name', 'class'],
    build: (W, H) => [
      smEmoji('🔬', W * 0.2, H / 2, Math.min(H * 0.55, 14)),
      smText('{subject}', W * 0.62, H * 0.36, { size: 5.5, bold: true, font: 'hand', width: W * 0.6 }),
      smText('{name}', W * 0.62, H * 0.62, { size: 3.2, bold: true, width: W * 0.6 }),
      smText('Class {class}', W * 0.62, H * 0.8, { size: 2.8, width: W * 0.6 })
    ]
  },
  {
    id: 'nametag', icon: '👋', name: 'Name tag', about: 'Hello, I am…',
    geom: { orient: 'landscape', length: 70, across: 1 }, frame: 'flowers',
    fields: ['name', 'class'],
    build: (W, H) => [
      smText("Hello, I'm", W / 2, H * 0.24, { size: 4, italic: true }),
      smText('{name}', W / 2, H * 0.52, { size: Math.min(11, H * 0.24), bold: true, font: 'hand' }),
      smText('Class {class}', W / 2, H * 0.79, { size: 3.6 })
    ]
  },
  {
    id: 'bookplate', icon: '📖', name: 'This book belongs to', about: 'Book-plate for your favourite books',
    geom: { orient: 'portrait', length: 55, across: 1 }, frame: 'scallop',
    fields: ['name', 'class'],
    build: (W, H) => [
      smText('This book belongs to', W / 2, H * 0.17, { size: 3.6, font: 'fancy', bold: true }),
      smEmoji('📖', W / 2, H * 0.42, 13),
      smEmoji('⭐', W * 0.18, H * 0.42, 5),
      smEmoji('⭐', W * 0.82, H * 0.42, 5),
      smText('{name}', W / 2, H * 0.68, { size: 6.5, bold: true, font: 'hand', width: W - 8 }),
      smText('{class}', W / 2, H * 0.83, { size: 3.4 })
    ]
  },
  {
    id: 'pencil', icon: '✏️', name: 'Pencil labels', about: '3 tiny name strips across the paper',
    geom: { orient: 'landscape', length: 45, across: 3 }, frame: 'line',
    fields: ['name'],
    build: (W, H) => [
      smEmoji('✏️', 5.5, H / 2, Math.min(7, H * 0.55)),
      smText('{name}', W * 0.58, H / 2, { size: Math.min(5, H * 0.38), bold: true, width: W * 0.72 })
    ]
  },
  {
    id: 'bottle', icon: '💧', name: 'Bottle & lunch box', about: '2 labels across for bottles and boxes',
    geom: { orient: 'landscape', length: 70, across: 2 }, frame: 'rounded',
    fields: ['name', 'class'],
    build: (W, H) => [
      smEmoji('💧', 8, H / 2, Math.min(10, H * 0.5)),
      smEmoji('🍱', W - 8, H / 2, Math.min(9, H * 0.45)),
      smText('{name}', W / 2, H * 0.4, { size: Math.min(6, H * 0.27), bold: true, font: 'hand', width: W - 30 }),
      smText('Class {class}', W / 2, H * 0.74, { size: 3.2 })
    ]
  },
  {
    id: 'bagtag', icon: '🎒', name: 'If found, return to', about: 'Bag tag with phone number and QR code',
    geom: { orient: 'portrait', length: 55, across: 1 }, frame: 'double',
    fields: ['name', 'class', 'school', 'phone'],
    build: (W, H) => [
      smText('IF FOUND, PLEASE RETURN TO', W / 2, 6, { size: 2.8, bold: true, invert: true }),
      smText('{name}', W / 2, H * 0.27, { size: 6, bold: true, font: 'hand', width: W - 8 }),
      smText('Class {class} · {school}', W / 2, H * 0.39, { size: 2.8, width: W - 8 }),
      smText('📞 {phone}', W / 2, H * 0.5, { size: 3.8, bold: true }),
      { type: 'qr', text: 'tel:{phone}', x: W / 2, y: H * 0.77, size: Math.min(20, H * 0.36), rot: 0 }
    ]
  },
  {
    id: 'birthday', icon: '🎂', name: 'Birthday & gift tag', about: 'For gifts and party bags',
    geom: { orient: 'portrait', length: 50, across: 1 }, frame: 'ticket',
    fields: ['name'],
    build: (W, H) => [
      smEmoji('🎂', W / 2, H * 0.27, 13),
      smText('Happy Birthday!', W / 2, H * 0.56, { size: 5, bold: true, font: 'fancy' }),
      smText('{name}', W / 2, H * 0.74, { size: 6, bold: true, font: 'hand', width: W - 10 }),
      smEmoji('🎈', 7, H - 8, 6),
      smEmoji('🎉', W - 7, H - 8, 6)
    ]
  },
  {
    id: 'reward', icon: '⭐', name: 'Reward sticker', about: 'Round "Super Star" badge',
    geom: { orient: 'portrait', length: 48, across: 1 }, frame: 'circle',
    fields: ['name'],
    build: (W, H) => [
      smEmoji('⭐', W / 2, H * 0.38, 17),
      smText('SUPER STAR', W / 2, H * 0.66, { size: 5.2, bold: true, font: 'poster' }),
      smText('{name}', W / 2, H * 0.79, { size: 3.4, bold: true, width: W - 16 })
    ]
  },
  {
    id: 'kind', icon: '🌈', name: 'Happy note', about: 'A cheerful message with decorations',
    geom: { orient: 'landscape', length: 80, across: 1 }, frame: 'stars',
    fields: [],
    build: (W, H) => [
      smEmoji('🌈', W / 2, H * 0.3, 11),
      smText('You are amazing!', W / 2, H * 0.62, { size: 7, bold: true, font: 'fancy' }),
      smText('Keep shining ✨', W / 2, H * 0.82, { size: 3.6 })
    ]
  },
  {
    id: 'blank', icon: '⬜', name: 'Blank sticker', about: 'Start from scratch',
    geom: { orient: 'portrait', length: 30, across: 1 }, frame: 'none',
    fields: [],
    build: () => []
  }
];

// Words we never search for online (kids' safety; Iconify and Commons clip art are fairly safe already)
const SM_BLOCKED = /\b(sex\w*|nud\w*|naked|porn\w*|kill\w*|gun|guns|blood\w*|drug\w*|alcohol|beer|wine|cigar\w*|smok\w*|weapon\w*|violen\w*|dead|death|horror|gore|bikini|lingerie|kiss\w*|bomb\w*|knife|knives|hate)\b/i;
