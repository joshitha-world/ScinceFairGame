// Challenge catalogue, question content and question builders
// Sloka The School - Edu Fair 2026

const LEVELS = {
  easy:   { id: 'easy',   label: 'Easy',   icon: '🌱', who: 'Grades 1–4',          points: 10 },
  medium: { id: 'medium', label: 'Medium', icon: '🚀', who: 'Grades 5–8',          points: 20 },
  hard:   { id: 'hard',   label: 'Hard',   icon: '🧠', who: 'Grade 9+ & grown-ups', points: 30 },
  mixed:  { id: 'mixed',  label: 'Mixed',  icon: '🎲', who: 'Starts easy, gets harder' }
};

const CHALLENGES = {
  fact: {
    id: 'fact', title: 'Fact or Fiction', subject: 'Science & Safety', icon: '🤔', color: '#7c3aed',
    howTo: 'Read the statement. Is it true or made-up? Tap ✅ Fact or ❌ Fiction — or swipe the card!'
  },
  eco: {
    id: 'eco', title: 'Eco Sorter', subject: 'Environment', icon: '♻️', color: '#16a34a',
    howTo: 'Drop each item into the right bin by tapping it. Keep Hyderabad clean!'
  },
  odd: {
    id: 'odd', title: 'Odd One Out', subject: 'Think Smart', icon: '🔍', color: '#0891b2',
    howTo: 'Three of the four belong together. Tap the one that doesn\'t fit!'
  },
  math: {
    id: 'math', title: 'Math Blitz', subject: 'Mental Maths', icon: '⚡', color: '#2563eb',
    howTo: 'Solve it in your head and tap the right answer. Speed counts!'
  },
  word: {
    id: 'word', title: 'Word Wizard', subject: 'English', icon: '📝', color: '#ea580c',
    howTo: 'Fill the blank or pick the right word to fix the sentence.'
  },
  affix: {
    id: 'affix', title: 'Word Builder', subject: 'Prefixes & Suffixes', icon: '🧩', color: '#db2777',
    howTo: 'Snap the right prefix or suffix onto the word to match its meaning. Watch your new word appear!'
  },
  riddle: {
    id: 'riddle', title: 'Riddle Time', subject: 'Traditional Riddles', icon: '🦉', color: '#7c4a1e', seconds: 90,
    howTo: 'Read the riddle and tap the answer. Stuck? Tap 💡 to remove two wrong answers (for half points).'
  },
  mix: {
    id: 'mix', title: 'Mega Mix', subject: 'A bit of everything', icon: '🎲', color: '#e3141c',
    howTo: 'Every question is a surprise from the other games. Stay sharp!'
  }
};

const PLAYABLE_CHALLENGES = ['fact', 'eco', 'odd', 'math', 'word', 'affix', 'riddle'];
const DEFAULT_ROUND_SECONDS = 60;

// ---------------------------------------------------------------------------
// Fact or Fiction: [icon, statement, isFact, explanation]
// ---------------------------------------------------------------------------
const FACT_BANK = {
  easy: [
    ['☀️', 'The Sun is a star.', true, 'It\'s the closest star to Earth — that\'s why it looks so big and bright.'],
    ['🐟', 'Fish breathe air through their noses, just like us.', false, 'Fish use gills to take oxygen out of the water.'],
    ['🌱', 'Plants need sunlight to make their own food.', true, 'Leaves use sunlight, water and air to make food. This is called photosynthesis.'],
    ['🚲', 'A helmet protects your head if you fall off a bicycle.', true, 'Helmets soak up the bump so your head doesn\'t have to.'],
    ['🔌', 'It is safe to touch switches with wet hands.', false, 'Water carries electricity — always dry your hands first!'],
    ['🌙', 'The Moon makes its own light.', false, 'The Moon shines because it reflects light from the Sun.'],
    ['🧊', 'Ice is water in solid form.', true, 'When water gets cold enough (0 °C), it freezes into ice.'],
    ['😁', 'Brushing your teeth twice a day keeps them healthy.', true, 'Brushing removes the germs and food that cause cavities.'],
    ['🦋', 'Butterflies begin life as caterpillars.', true, 'Egg → caterpillar → pupa → butterfly. This change is called metamorphosis.'],
    ['🐸', 'Frogs are mammals.', false, 'Frogs are amphibians — they lay eggs in water and live on land and water.'],
    ['❤️', 'Your heart pumps blood all around your body.', true, 'It beats about 100,000 times every day!'],
    ['🔥', 'Playing with matches is OK if no adult is watching.', false, 'Fire spreads very fast. Only adults should use matches.'],
    ['🌊', 'Throwing plastic into rivers does no harm.', false, 'Plastic hurts fish and animals and stays in water for hundreds of years.'],
    ['💧', 'Drinking enough water helps keep your body healthy.', true, 'More than half of your body is water!'],
    ['🐄', 'Cows eat only plants.', true, 'Animals that eat only plants are called herbivores.'],
    ['🐍', 'Snakes have tiny legs hidden under their bodies.', false, 'Snakes have no legs — they move using muscles and scales.'],
    ['🌍', 'The Earth goes around the Sun.', true, 'One trip around the Sun takes one year — about 365 days.'],
    ['🚗', 'You only need a seatbelt on long trips.', false, 'Seatbelts keep you safe on every trip, even short ones.'],
    ['🕷️', 'A spider has eight legs.', true, 'Insects have six legs, but spiders have eight.'],
    ['🐝', 'Bees help flowers make seeds by carrying pollen.', true, 'Moving pollen from flower to flower is called pollination.']
  ],
  medium: [
    ['⚡', 'Lightning never strikes the same place twice.', false, 'Tall buildings and towers get struck again and again — some many times a year.'],
    ['🔊', 'Sound travels faster than light.', false, 'Light is much faster. That\'s why you see lightning before you hear thunder.'],
    ['🦇', 'Bats are completely blind.', false, 'Bats can see. Many also use echoes (echolocation) to find food in the dark.'],
    ['🕷️', 'Spiders are insects.', false, 'Spiders are arachnids: eight legs and two body parts. Insects have six legs.'],
    ['🦴', 'An adult human has 206 bones.', true, 'Babies are born with about 300 — some join together as we grow.'],
    ['🐠', 'A goldfish can only remember things for 3 seconds.', false, 'Goldfish can remember things for months and can even be trained.'],
    ['♨️', 'Water boils at 100 °C at sea level.', true, 'On high mountains it boils at a lower temperature because the air pressure is lower.'],
    ['🐋', 'Whales are a kind of fish.', false, 'Whales are mammals. They breathe air and feed their babies milk.'],
    ['🐧', 'Penguins live at the North Pole.', false, 'Wild penguins live in the southern half of the world, like Antarctica.'],
    ['☀️', 'Sunlight takes about 8 minutes to reach Earth.', true, 'The Sun is about 150 million km away. Light covers that in around 8 minutes.'],
    ['🪐', 'Pluto is officially the ninth planet.', false, 'Since 2006, Pluto has been classed as a dwarf planet.'],
    ['💎', 'Diamonds are made of carbon.', true, 'Diamond and pencil graphite are both pure carbon — just arranged differently.'],
    ['✋', 'Skin is the largest organ of the human body.', true, 'An adult\'s skin can weigh around 4 kg!'],
    ['🌿', 'Plants give out oxygen during photosynthesis.', true, 'Plants take in carbon dioxide and release the oxygen we breathe.'],
    ['🍅', 'A tomato is a fruit.', true, 'In science, a fruit grows from a flower and holds seeds — just like a tomato.'],
    ['🌑', 'Mercury is the planet closest to the Sun.', true, 'Mercury races around the Sun in just 88 days.'],
    ['🍯', 'Honey can stay safe to eat for thousands of years.', true, 'Edible honey has been found in ancient Egyptian tombs.'],
    ['🐦', 'Ostriches bury their heads in the sand when scared.', false, 'They lie flat on the ground — from far away it only looks like their head is buried.'],
    ['🧠', 'We only use 10% of our brains.', false, 'Brain scans show we use almost every part of our brain.'],
    ['🤧', 'Germs can spread through a sneeze.', true, 'Sneeze into your elbow to stop germs flying around!']
  ],
  hard: [
    ['🟡', 'A day on Venus is longer than a year on Venus.', true, 'Venus spins once in 243 Earth days but goes around the Sun in only 225.'],
    ['🌍', 'We have summer because Earth gets closer to the Sun.', false, 'Seasons come from Earth\'s tilt. Earth is actually closest to the Sun in January!'],
    ['💊', 'Antibiotics can cure the common cold.', false, 'Colds are caused by viruses. Antibiotics only work on bacteria.'],
    ['🐙', 'An octopus has three hearts.', true, 'Two pump blood to the gills, and one pumps it to the rest of the body.'],
    ['🍌', 'Bananas grow on trees.', false, 'The banana plant is a giant herb — its "trunk" is made of tightly rolled leaves.'],
    ['🔥', 'Venus is hotter than Mercury, even though it is farther from the Sun.', true, 'Venus\'s thick carbon-dioxide atmosphere traps heat — a runaway greenhouse effect.'],
    ['🦈', 'Sharks have skeletons made of bone.', false, 'A shark\'s skeleton is made of cartilage — the same bendy material as your ears.'],
    ['🩸', 'Blood in your veins is blue.', false, 'Blood is always red. Veins only look blue through the skin.'],
    ['🧊', 'Water expands when it freezes.', true, 'That\'s why ice floats and frozen pipes can burst.'],
    ['🧱', 'You can see the Great Wall of China from the Moon with your eyes.', false, 'It\'s far too narrow. Astronauts can\'t even spot it easily from low orbit.'],
    ['🌐', 'Earth is a perfect sphere.', false, 'Earth bulges at the equator and is slightly flattened at the poles.'],
    ['🍲', 'Microwave ovens make food radioactive.', false, 'Microwaves just make water molecules jiggle, which heats the food.'],
    ['🤜', 'Cracking your knuckles causes arthritis.', false, 'Studies found no link. The pop is just gas bubbles in the joint fluid.'],
    ['🚀', 'Sound cannot travel through outer space.', true, 'Sound needs something to travel through, like air. Space is almost empty.'],
    ['🦖', 'Early humans lived alongside dinosaurs.', false, 'Dinosaurs (other than birds) died out about 66 million years before humans appeared.'],
    ['🏖️', 'Glass is made mainly from sand.', true, 'Sand (silica) is melted at about 1,700 °C to make glass.'],
    ['🎈', 'Hot air rises because it is less dense than cold air.', true, 'That\'s exactly how hot-air balloons float.'],
    ['✨', 'A teaspoon of neutron star would weigh about a billion tonnes on Earth.', true, 'Neutron stars are the collapsed cores of giant stars — unbelievably dense.'],
    ['🦎', 'Chameleons change colour mainly to hide.', false, 'They mostly change colour to show mood, signal other chameleons and control temperature.'],
    ['🏜️', 'The Sahara is the largest desert on Earth.', false, 'Antarctica is! A desert is any place with very little rain or snow. The Sahara is the largest hot desert.']
  ]
};

// ---------------------------------------------------------------------------
// Eco Sorter: [icon, item, bin, tip]  bin: wet | dry | haz
// ---------------------------------------------------------------------------
const ECO_BINS = {
  wet: { value: 'wet', label: 'Wet Waste', sub: 'Food & garden', icon: '🟢', color: '#16a34a' },
  dry: { value: 'dry', label: 'Dry Waste', sub: 'Paper · plastic · metal · glass', icon: '🔵', color: '#2563eb' },
  haz: { value: 'haz', label: 'Hazardous', sub: 'Batteries · bulbs · medicines · e-waste', icon: '🔴', color: '#dc2626' }
};

const ECO_BANK = {
  easy: [
    ['🍌', 'Banana peel', 'wet', 'Peels rot into compost that feeds plants.'],
    ['🧴', 'Plastic bottle', 'dry', 'Clean plastic bottles can be recycled into new bottles — even T-shirts!'],
    ['🍏', 'Apple core', 'wet', 'Food scraps are wet waste — they become rich soil.'],
    ['📰', 'Old newspaper', 'dry', 'Recycling paper saves trees.'],
    ['🥕', 'Vegetable peels', 'wet', 'Kitchen peels make great compost.'],
    ['📦', 'Cardboard box', 'dry', 'Flatten boxes so they take less space in the bin.'],
    ['🍚', 'Leftover rice', 'wet', 'Cooked food is wet waste. Better still — take only what you can eat!'],
    ['🥫', 'Metal tin can', 'dry', 'Metal can be recycled again and again without losing quality.'],
    ['🥚', 'Eggshells', 'wet', 'Crushed eggshells add calcium to compost.'],
    ['🍵', 'Used tea leaves', 'wet', 'Tea leaves break down quickly and help plants grow.'],
    ['🥛', 'Rinsed milk packet', 'dry', 'Rinse it first so it can be recycled!'],
    ['🍂', 'Dry leaves', 'wet', 'Garden waste is organic — it goes with wet waste for composting.'],
    ['🌼', 'Old flowers & garlands', 'wet', 'Pooja flowers make lovely compost.'],
    ['📒', 'Old notebook', 'dry', 'Paper can be recycled 5 to 7 times.'],
    ['🍉', 'Watermelon rind', 'wet', 'Fruit skins are organic and compost easily.'],
    ['🛍️', 'Plastic carry bag', 'dry', 'Plastic bags are dry waste — carry a cloth bag instead!']
  ],
  medium: [
    ['🔋', 'Used battery', 'haz', 'Batteries leak harmful chemicals — drop them at a collection point.'],
    ['💊', 'Expired medicines', 'haz', 'Never throw medicines in the drain — they pollute water.'],
    ['💡', 'Broken CFL bulb', 'haz', 'CFL bulbs contain a little mercury — keep them separate and handle with care.'],
    ['📱', 'Old mobile phone', 'haz', 'Phones are e-waste: they hold valuable metals and harmful chemicals.'],
    ['🥥', 'Coconut shell', 'wet', 'Coconut shells are natural and slowly compost.'],
    ['🍟', 'Chips packet', 'dry', 'Shiny multi-layer packets are dry waste — keep them clean and dry.'],
    ['🧃', 'Juice carton', 'dry', 'Cartons (Tetra Paks) can be recycled into boards and paper.'],
    ['🍗', 'Chicken bones', 'wet', 'Bones are food waste, so they go with wet waste.'],
    ['🎨', 'Leftover paint tin', 'haz', 'Paint contains chemicals that must not reach soil or water.'],
    ['👕', 'Torn old T-shirt', 'dry', 'Cloth is dry waste — good clothes can be donated instead!'],
    ['🌽', 'Corn cob', 'wet', 'Corn cobs are plant material and compost well.'],
    ['🧸', 'Broken plastic toy', 'dry', 'Hard plastic is dry waste.'],
    ['🔌', 'Old charger & cable', 'haz', 'Chargers and cables are e-waste.'],
    ['🍶', 'Glass bottle', 'dry', 'Glass can be melted and reshaped forever.'],
    ['🧅', 'Onion skins', 'wet', 'Peels and skins are wet waste.'],
    ['🖊️', 'Empty pen', 'dry', 'Pens are plastic — dry waste.']
  ],
  hard: [
    ['✏️', 'Pencil shavings', 'wet', 'Shavings are mostly wood, so they compost!'],
    ['💇', 'Hair clippings', 'wet', 'Hair is natural and slowly breaks down in compost.'],
    ['🌡️', 'Broken mercury thermometer', 'haz', 'Mercury is poisonous — never touch it or throw it in a regular bin.'],
    ['💅', 'Nail polish bottle', 'haz', 'Nail polish is a flammable chemical.'],
    ['🦟', 'Mosquito-repellent refill', 'haz', 'Refills contain insecticide chemicals.'],
    ['🥤', 'Paper coffee cup', 'dry', 'Paper cups have a thin plastic lining, so they can\'t be composted.'],
    ['🧽', 'Old kitchen sponge', 'dry', 'Most sponges are made of plastic foam.'],
    ['🖨️', 'Printer ink cartridge', 'haz', 'Ink cartridges are e-waste — many can be refilled or returned.'],
    ['🧯', 'Empty spray can', 'haz', 'Pressurised cans can burst if crushed or heated.'],
    ['☕', 'Used coffee grounds', 'wet', 'Coffee grounds are a favourite food for compost worms.'],
    ['🥜', 'Peanut shells', 'wet', 'Nut shells are plant material — wet waste.'],
    ['💻', 'Old laptop', 'haz', 'Laptops are e-waste with batteries inside.'],
    ['🧤', 'Rubber gloves', 'dry', 'Rubber doesn\'t compost — it\'s dry waste.'],
    ['🎈', 'Burst balloon', 'dry', 'Balloons are dry waste — and dangerous for animals if littered.'],
    ['🍫', 'Chocolate wrapper', 'dry', 'Foil wrappers are dry waste.'],
    ['🦐', 'Prawn shells', 'wet', 'Seafood shells are food waste.']
  ]
};

// ---------------------------------------------------------------------------
// Odd One Out: { odd: [icon, label], rest: [[icon, label] x3], why }
// An icon may be short text (e.g. a chemical symbol) or '' for label-only tiles.
// ---------------------------------------------------------------------------
const ODD_BANK = {
  easy: [
    { odd: ['🥕', 'Carrot'], rest: [['🍎', 'Apple'], ['🍌', 'Banana'], ['🍇', 'Grapes']], why: 'Carrot is a vegetable — the others are fruits.' },
    { odd: ['🚗', 'Car'], rest: [['🐶', 'Dog'], ['🐱', 'Cat'], ['🐄', 'Cow']], why: 'A car is not alive — the others are living animals.' },
    { odd: ['🐟', 'Fish'], rest: [['☀️', 'Sun'], ['🌙', 'Moon'], ['⭐', 'Star']], why: 'We see the others in the sky — fish live in water.' },
    { odd: ['🐘', 'Elephant'], rest: [['🐠', 'Fish'], ['🐙', 'Octopus'], ['🐬', 'Dolphin']], why: 'Elephants live on land — the others live in the sea.' },
    { odd: ['✈️', 'Aeroplane'], rest: [['🚲', 'Bicycle'], ['🚗', 'Car'], ['🚌', 'Bus']], why: 'Aeroplanes fly — the others travel on roads.' },
    { odd: ['🐍', 'Snake'], rest: [['🦆', 'Duck'], ['🦜', 'Parrot'], ['🦉', 'Owl']], why: 'A snake is a reptile — the others are birds with feathers.' },
    { odd: ['🔥', 'Fire'], rest: [['🧊', 'Ice'], ['❄️', 'Snow'], ['⛄', 'Snowman']], why: 'Fire is hot — the others are cold and frozen.' },
    { odd: ['🧦', 'Socks'], rest: [['👀', 'Eyes'], ['👂', 'Ear'], ['👃', 'Nose']], why: 'Socks are clothes — the others are parts of your body.' },
    { odd: ['🍞', 'Bread'], rest: [['🥛', 'Milk'], ['🧃', 'Juice'], ['💧', 'Water']], why: 'Bread is food you eat — the others are drinks.' },
    { odd: ['🍄', 'Mushroom'], rest: [['🌹', 'Rose'], ['🌻', 'Sunflower'], ['🌷', 'Tulip']], why: 'A mushroom is a fungus — the others are flowers.' },
    { odd: ['🐕', 'Dog'], rest: [['🐝', 'Bee'], ['🦋', 'Butterfly'], ['🐞', 'Ladybird']], why: 'The others are insects with six legs — a dog is not.' },
    { odd: ['🐅', 'Tiger'], rest: [['🐄', 'Cow'], ['🐐', 'Goat'], ['🐇', 'Rabbit']], why: 'Tigers eat meat — the others eat only plants.' },
    { odd: ['🍕', 'Pizza'], rest: [['✏️', 'Pencil'], ['📏', 'Ruler'], ['📚', 'Books']], why: 'The others are things we use to study.' },
    { odd: ['🌳', 'Tree'], rest: [['🧸', 'Teddy'], ['⚽', 'Ball'], ['📱', 'Phone']], why: 'A tree is living — it grows, breathes and needs water.' }
  ],
  medium: [
    { odd: ['🦈', 'Shark'], rest: [['🐋', 'Whale'], ['🐬', 'Dolphin'], ['🦇', 'Bat']], why: 'A shark is a fish — whales, dolphins and bats are mammals that feed their babies milk.' },
    { odd: ['🎈', 'Rubber balloon'], rest: [['🥄', 'Steel spoon'], ['🔩', 'Iron nail'], ['🔑', 'Metal key']], why: 'Metals conduct electricity — rubber does not.' },
    { odd: ['🌙', 'Moon'], rest: [['🔴', 'Mars'], ['🟡', 'Venus'], ['🪐', 'Jupiter']], why: 'The Moon is a satellite — the others are planets.' },
    { odd: ['🧊', 'Ice'], rest: [['💧', 'Water'], ['🧃', 'Juice'], ['🥛', 'Milk']], why: 'Ice is a solid — the others are liquids.' },
    { odd: ['🐸', 'Frog'], rest: [['🐊', 'Crocodile'], ['🐍', 'Snake'], ['🦎', 'Lizard']], why: 'Frogs are amphibians — the others are reptiles with dry, scaly skin.' },
    { odd: ['🐧', 'Penguin'], rest: [['🦅', 'Eagle'], ['🦉', 'Owl'], ['🦜', 'Parrot']], why: 'Penguins can\'t fly — they swim instead!' },
    { odd: ['⛽', 'Petrol'], rest: [['☀️', 'Solar'], ['🌬️', 'Wind'], ['💧', 'Hydro']], why: 'Petrol comes from oil, which will run out — the others are renewable energy.' },
    { odd: ['🦴', 'Bone'], rest: [['👁️', 'Eye'], ['👂', 'Ear'], ['👃', 'Nose']], why: 'Eyes, ears and nose are sense organs — bones are not.' },
    { odd: ['🌈', 'Rainbow'], rest: [['🌋', 'Volcano'], ['🌪️', 'Tornado'], ['🌊', 'Tsunami']], why: 'A rainbow is harmless — the others are natural disasters.' },
    { odd: ['9', 'Nine'], rest: [['2', 'Two'], ['3', 'Three'], ['5', 'Five']], why: '2, 3 and 5 are prime numbers — 9 is 3 × 3.' },
    { odd: ['🥚', 'Egg'], rest: [['🍚', 'Rice'], ['🍞', 'Bread'], ['🥔', 'Potato']], why: 'Eggs are rich in protein — the others are mostly carbohydrates.' },
    { odd: ['🍚', 'Rice'], rest: [['🍊', 'Orange'], ['🍋', 'Lemon'], ['🥝', 'Kiwi']], why: 'Orange, lemon and kiwi are packed with vitamin C — rice is not.' },
    { odd: ['🐔', 'Hen'], rest: [['🐄', 'Cow'], ['🐐', 'Goat'], ['🐕', 'Dog']], why: 'A hen is a bird — the others are mammals.' },
    { odd: ['🌙', 'Moon'], rest: [['☀️', 'Sun'], ['🔥', 'Fire'], ['💡', 'Bulb']], why: 'The Moon only reflects sunlight — the others make their own light.' }
  ],
  hard: [
    { odd: ['🥔', 'Potato'], rest: [['🥕', 'Carrot'], ['🍠', 'Sweet potato'], ['🌱', 'Radish']], why: 'A potato is a stem (tuber) — carrot, sweet potato and radish are roots.' },
    { odd: ['🕷️', 'Spider'], rest: [['🐜', 'Ant'], ['🐝', 'Bee'], ['🦗', 'Cricket']], why: 'Spiders are arachnids with 8 legs — the others are insects with 6.' },
    { odd: ['🥕', 'Carrot'], rest: [['🍅', 'Tomato'], ['🥒', 'Cucumber'], ['🌶️', 'Chilli']], why: 'In botany, tomato, cucumber and chilli are fruits (they hold seeds). A carrot is a root.' },
    { odd: ['N', 'Nitrogen'], rest: [['He', 'Helium'], ['Ne', 'Neon'], ['Ar', 'Argon']], why: 'Helium, neon and argon are noble gases — nitrogen is not.' },
    { odd: ['🐊', 'Crocodile'], rest: [['🐋', 'Whale'], ['🐧', 'Penguin'], ['🦇', 'Bat']], why: 'Crocodiles are cold-blooded — the others are warm-blooded.' },
    { odd: ['🪐', 'Jupiter'], rest: [['🌑', 'Mercury'], ['🟡', 'Venus'], ['🔴', 'Mars']], why: 'Jupiter is a gas giant — the others are rocky planets.' },
    { odd: ['Hg', 'Mercury'], rest: [['Fe', 'Iron'], ['Cu', 'Copper'], ['Al', 'Aluminium']], why: 'Mercury is the only metal here that is liquid at room temperature.' },
    { odd: ['W', 'Watt'], rest: [['J', 'Joule'], ['cal', 'Calorie'], ['kWh', 'Kilowatt-hour']], why: 'Watt measures power — the others measure energy.' },
    { odd: ['🦠', 'Malaria'], rest: [['🦠', 'Flu'], ['🦠', 'COVID-19'], ['🦠', 'Chickenpox']], why: 'Malaria is caused by a parasite spread by mosquitoes — the others are caused by viruses.' },
    { odd: ['🔥', 'Biogas'], rest: [['🔥', 'Coal'], ['🔥', 'Petroleum'], ['🔥', 'Natural gas']], why: 'Biogas is renewable (made from waste) — the others are fossil fuels.' },
    { odd: ['⛰️', 'Marble'], rest: [['⛰️', 'Granite'], ['⛰️', 'Basalt'], ['⛰️', 'Pumice']], why: 'Granite, basalt and pumice are igneous rocks (from cooled magma) — marble is metamorphic.' },
    { odd: ['36', ''], rest: [['1', ''], ['8', ''], ['27', '']], why: '1, 8 and 27 are cubes (1³, 2³, 3³) — 36 is 6², a square.' },
    { odd: ['', 'Aorta'], rest: [['', 'Femur'], ['', 'Tibia'], ['', 'Radius']], why: 'The aorta is the body\'s biggest artery — the others are bones.' },
    { odd: ['🌊', 'Caspian'], rest: [['🌊', 'Pacific'], ['🌊', 'Atlantic'], ['🌊', 'Indian']], why: 'The Caspian Sea is really a huge lake — the others are oceans.' }
  ]
};

// ---------------------------------------------------------------------------
// Word Wizard: [prompt (use ___ for the blank), [correct, ...wrong], tip]
// ---------------------------------------------------------------------------
const WORD_BANK = {
  easy: [
    ['I saw ___ elephant at the zoo.', ['an', 'a', 'two', 'many'], 'Use "an" before a vowel sound: an elephant.'],
    ['One mouse, two ___.', ['mice', 'mouses', 'mices', 'mousies'], 'Mouse has a special plural: mice.'],
    ['She ___ to school every day.', ['goes', 'go', 'going', 'gone'], 'With he, she or it, add -es or -s: she goes.'],
    ['Yesterday, we ___ a big cake.', ['ate', 'eat', 'eating', 'eats'], '"Yesterday" means the past, so we use "ate".'],
    ['A baby dog is called a ___.', ['puppy', 'kitten', 'calf', 'cub'], 'Puppy! A kitten is a baby cat and a calf is a baby cow.'],
    ['The opposite of "hot" is ___.', ['cold', 'warm', 'big', 'wet'], 'Hot ↔ cold are opposites (antonyms).'],
    ['One child, many ___.', ['children', 'childs', 'childrens', 'childes'], 'Child has a special plural: children.'],
    ['They ___ playing football now.', ['are', 'is', 'am', 'be'], '"They" goes with "are".'],
    ['Which word rhymes with "cat"?', ['hat', 'cup', 'dog', 'sun'], 'Cat and hat both end with the "-at" sound.'],
    ['Which spelling is correct?', ['friend', 'freind', 'frend', 'frien'], 'Remember: a friend is with you till the "end".'],
    ['The cat is hiding ___ the table.', ['under', 'happy', 'quickly', 'eat'], '"Under" tells us where — it\'s a preposition.'],
    ['The opposite of "big" is ___.', ['small', 'tall', 'long', 'heavy'], 'Big ↔ small are opposites.'],
    ['___ owl hoots at night.', ['An', 'A', 'Some', 'Many'], '"Owl" starts with a vowel sound, so we say "an owl".'],
    ['Which spelling is correct?', ['school', 'skool', 'scool', 'shcool'], 'School is spelt s-c-h-o-o-l.'],
    ['One box, two ___.', ['boxes', 'boxs', 'boxies', 'box'], 'Words ending in -x add -es: boxes.'],
    ['He ___ a book right now.', ['is reading', 'are reading', 'am reading', 'reading'], '"He" + "is" + -ing for something happening now.']
  ],
  medium: [
    ['She ___ to the market yesterday to buy fruit.', ['walked', 'walk', 'walks', 'walking'], '"Yesterday" tells us to use the past tense: walked.'],
    ['They ___ working on their project all afternoon.', ['were', 'was', 'is', 'be'], '"They" takes "were" in the past tense.'],
    ['Wash your hands ___ eating lunch.', ['before', 'behind', 'under', 'beside'], '"Before" shows the order of time.'],
    ['This solar panel turns sunlight ___ electricity.', ['into', 'onto', 'over', 'at'], '"Into" shows something changing into something else.'],
    ['Which spelling is correct?', ['necessary', 'neccessary', 'necesary', 'neccesary'], 'One Collar, two Sleeves: one c, double s.'],
    ['Which word means the same as "happy"?', ['joyful', 'angry', 'tired', 'silent'], 'Happy and joyful are synonyms.'],
    ['Which word is the opposite of "ancient"?', ['modern', 'old', 'broken', 'huge'], 'Ancient means very old; modern means new.'],
    ['This book is ___ than the movie.', ['better', 'more better', 'gooder', 'best'], 'Good → better → best. Never "more better"!'],
    ['I have lived in Hyderabad ___ 2015.', ['since', 'for', 'from', 'by'], 'Use "since" with a point in time and "for" with a length of time.'],
    ['___ bag is this? It\'s Riya\'s.', ['Whose', 'Who\'s', 'Who', 'Whom'], '"Whose" asks who owns something. "Who\'s" means "who is".'],
    ['The children ___ their lunch already.', ['have eaten', 'has eaten', 'eats', 'eating'], 'Plural "children" takes "have".'],
    ['One leaf, many ___.', ['leaves', 'leafs', 'leafes', 'leavs'], 'Many words ending in -f change to -ves: leaf → leaves.'],
    ['If it rains tomorrow, we ___ stay indoors.', ['will', 'would', 'were', 'did'], 'Real future possibility: if + present, will + verb.'],
    ['"It\'s a piece of cake" means the task is ___.', ['very easy', 'delicious', 'broken', 'sweet'], 'This idiom means something is very easy to do.'],
    ['Which spelling is correct?', ['beautiful', 'beutiful', 'beautifull', 'beatiful'], 'B-E-A-U: "Big Elephants Are Useful" — then -tiful.'],
    ['Neither Ravi nor Sam ___ finished the test.', ['has', 'have', 'are', 'were'], 'With neither…nor, the verb matches the nearer subject: Sam has.']
  ],
  hard: [
    ['The loud noise will ___ the baby\'s sleep.', ['affect', 'effect', 'affection', 'effective'], '"Affect" is usually a verb (to change); "effect" is usually a noun (the result).'],
    ['There are ___ students in class today than yesterday.', ['fewer', 'less', 'lesser', 'little'], 'Use "fewer" for things you can count, "less" for things you can\'t.'],
    ['___ going to the science fair tomorrow.', ['They\'re', 'Their', 'There', 'Theyre'], '"They\'re" = they are. "Their" shows ownership; "there" is a place.'],
    ['If I ___ a bird, I would fly over the mountains.', ['were', 'am', 'be', 'will be'], 'Imaginary situations use "were" — the subjunctive mood.'],
    ['Each of the students ___ a project.', ['has submitted', 'have submitted', 'are submitting', 'submit'], '"Each" is singular, so it takes "has".'],
    ['Which spelling is correct?', ['accommodate', 'accomodate', 'acommodate', 'acomodate'], 'Accommodate has room for double c AND double m.'],
    ['Which spelling is correct?', ['occurrence', 'occurence', 'ocurrence', 'occurance'], 'Double c, double r, and it ends in -ence.'],
    ['Which word means "lasting a very short time"?', ['ephemeral', 'eternal', 'enormous', 'eloquent'], 'Ephemeral comes from Greek "lasting a day" — like a soap bubble.'],
    ['Between you and ___, this is a secret.', ['me', 'I', 'myself', 'mine'], 'After a preposition like "between", use the object pronoun "me".'],
    ['The team ___ celebrating its victory.', ['is', 'are', 'were', 'have'], '"Its" shows the team is treated as one unit, so use "is".'],
    ['The principal, along with the teachers, ___ visiting the fair.', ['is', 'are', 'were', 'have'], '"Along with…" doesn\'t change the subject — the principal is.'],
    ['Hardly ___ the bell rung when everyone rushed out.', ['had', 'has', 'did', 'was'], 'After "hardly" at the start, flip the order: hardly had … when.'],
    ['Which word is the opposite of "benevolent"?', ['malevolent', 'generous', 'kind', 'benign'], 'Bene- means good; male- means bad.'],
    ['To ___ should I address this letter?', ['whom', 'who', 'whose', 'who\'s'], 'After a preposition (to), use "whom".'],
    ['"To bite the bullet" means to ___.', ['face a hard situation bravely', 'eat very quickly', 'get very angry', 'give up easily'], 'Long ago, patients bit on a bullet to bear pain bravely.'],
    ['She has been learning the violin ___ three years.', ['for', 'since', 'from', 'by'], 'Use "for" with a length of time (three years).']
  ]
};

// ---------------------------------------------------------------------------
// Word Builder: [pre|suf, root, correct affix, [3 wrong affixes], meaning, built word, tip]
// Each clue is written so only one option makes a real word with that meaning.
// ---------------------------------------------------------------------------
const AFFIX_BANK = {
  easy: [
    ['pre', 'happy', 'un', ['re', 'dis', 'pre'], 'not happy', 'unhappy', '"Un-" means not.'],
    ['pre', 'play', 're', ['un', 'dis', 'mis'], 'play again', 'replay', '"Re-" means again.'],
    ['pre', 'lock', 'un', ['re', 'pre', 'mis'], 'open the lock', 'unlock', '"Un-" can mean to undo something.'],
    ['pre', 'fair', 'un', ['re', 'pre', 'mis'], 'not fair', 'unfair', '"Un-" means not.'],
    ['pre', 'write', 're', ['un', 'dis', 'mis'], 'write again', 'rewrite', '"Re-" means again.'],
    ['suf', 'help', 'ful', ['less', 'ness', 'ly'], 'full of help', 'helpful', '"-ful" means full of.'],
    ['suf', 'care', 'less', ['ful', 'ness', 'ing'], 'without care', 'careless', '"-less" means without.'],
    ['suf', 'fear', 'less', ['ful', 'ly', 'er'], 'without fear', 'fearless', '"-less" means without.'],
    ['suf', 'teach', 'er', ['ful', 'less', 'ly'], 'a person who teaches', 'teacher', '"-er" can mean a person who does something.'],
    ['suf', 'paint', 'er', ['ful', 'less', 'ly'], 'a person who paints', 'painter', '"-er" can mean a person who does something.'],
    ['suf', 'quick', 'ly', ['er', 'ness', 'ful'], 'in a quick way', 'quickly', '"-ly" tells us how something is done.'],
    ['suf', 'tall', 'est', ['er', 'ly', 'ness'], 'the most tall', 'tallest', '"-est" means the most.'],
    ['suf', 'big', 'er', ['est', 'ly', 'ful'], 'more big', 'bigger', '"-er" means more. Double the g: big → bigger!'],
    ['suf', 'jump', 'ed', ['ing', 'er', 'ly'], 'it already happened', 'jumped', '"-ed" shows something happened in the past.'],
    ['suf', 'colour', 'ful', ['less', 'ly', 'er'], 'full of colour', 'colourful', '"-ful" means full of.']
  ],
  medium: [
    ['pre', 'agree', 'dis', ['un', 'mis', 're'], 'not agree', 'disagree', '"Dis-" means not, or the opposite of.'],
    ['pre', 'spell', 'mis', ['dis', 'un', 'pre'], 'spell wrongly', 'misspell', '"Mis-" means wrongly. Keep both s\'s: mis + spell.'],
    ['pre', 'view', 'pre', ['re', 'dis', 'mis'], 'see before', 'preview', '"Pre-" means before. (Review means see again.)'],
    ['pre', 'possible', 'im', ['un', 'in', 'dis'], 'not possible', 'impossible', 'Before p, b or m, "in-" changes to "im-".'],
    ['pre', 'correct', 'in', ['un', 'dis', 'im'], 'not correct', 'incorrect', '"In-" means not.'],
    ['pre', 'sleep', 'over', ['under', 'mis', 're'], 'sleep too long', 'oversleep', '"Over-" means too much.'],
    ['pre', 'marine', 'sub', ['super', 'inter', 're'], 'under the sea', 'submarine', '"Sub-" means under.'],
    ['pre', 'national', 'inter', ['sub', 'super', 'un'], 'between nations', 'international', '"Inter-" means between.'],
    ['suf', 'kind', 'ness', ['ful', 'less', 'ly'], 'the quality of being kind', 'kindness', '"-ness" turns a describing word into a noun.'],
    ['suf', 'read', 'able', ['ful', 'less', 'ness'], 'can be read', 'readable', '"-able" means can be done.'],
    ['suf', 'enjoy', 'ment', ['ful', 'ness', 'less'], 'the act of enjoying', 'enjoyment', '"-ment" turns an action into a noun.'],
    ['suf', 'happy', 'ness', ['ful', 'ly', 'less'], 'the feeling of being happy', 'happiness', 'Change y to i: happy → happiness.'],
    ['suf', 'danger', 'ous', ['ful', 'less', 'ness'], 'full of danger', 'dangerous', '"-ous" means full of.'],
    ['suf', 'child', 'hood', ['ish', 'less', 'ful'], 'the time of being a child', 'childhood', '"-hood" means a time or state of being.'],
    ['suf', 'power', 'ful', ['less', 'ness', 'ly'], 'having lots of power', 'powerful', '"-ful" means full of.']
  ],
  hard: [
    ['pre', 'legal', 'il', ['un', 'in', 'im'], 'not legal', 'illegal', 'Before l, "in-" changes to "il-".'],
    ['pre', 'regular', 'ir', ['un', 'in', 'im'], 'not regular', 'irregular', 'Before r, "in-" changes to "ir-".'],
    ['pre', 'function', 'mal', ['mis', 'dis', 'un'], 'work badly', 'malfunction', '"Mal-" means badly.'],
    ['pre', 'circle', 'semi', ['bi', 'tri', 'sub'], 'half a circle', 'semicircle', '"Semi-" means half.'],
    ['pre', 'cycle', 'bi', ['tri', 'uni', 'semi'], 'a cycle with two wheels', 'bicycle', '"Bi-" means two (tri- is three, uni- is one).'],
    ['pre', 'biography', 'auto', ['bio', 'tele', 'micro'], 'a life story written by that person', 'autobiography', '"Auto-" means self.'],
    ['pre', 'scope', 'tele', ['micro', 'peri', 'stetho'], 'a tool to see far away', 'telescope', '"Tele-" means far (micro- means small).'],
    ['pre', 'septic', 'anti', ['pro', 'auto', 'micro'], 'fights germs', 'antiseptic', '"Anti-" means against.'],
    ['pre', 'human', 'super', ['sub', 'inter', 'anti'], 'beyond normal human powers', 'superhuman', '"Super-" means above or beyond.'],
    ['pre', 'understand', 'mis', ['dis', 'un', 're'], 'understand wrongly', 'misunderstand', '"Mis-" means wrongly.'],
    ['suf', 'simple', 'ify', ['ness', 'ism', 'ment'], 'to make simple', 'simplify', '"-ify" means to make. Drop the e: simple → simplify.'],
    ['suf', 'art', 'ist', ['ful', 'less', 'ism'], 'a person who makes art', 'artist', '"-ist" means a person who does or makes something.'],
    ['suf', 'appear', 'ance', ['ment', 'ness', 'ful'], 'the act of appearing', 'appearance', '"-ance" turns an action into a noun.'],
    ['suf', 'fame', 'ous', ['ful', 'less', 'ly'], 'having fame', 'famous', '"-ous" means having. Drop the e: fame → famous.'],
    ['suf', 'friend', 'ship', ['hood', 'ness', 'less'], 'the bond between friends', 'friendship', '"-ship" means a state or bond.']
  ]
};

// ---------------------------------------------------------------------------
// Riddle Time: [riddle, [icon, answer], [[icon, wrong] x3], explanation, origin?]
// ---------------------------------------------------------------------------
const RIDDLE_BANK = {
  easy: [
    ['I have hands but I cannot clap. I tell you something new every minute.', ['⏰', 'A clock'], [['🌳', 'A tree'], ['🧤', 'A glove'], ['🤖', 'A robot']], 'A clock has hands that point to the time.'],
    ['I have lots of keys, but I can\'t open a single lock.', ['🎹', 'A piano'], [['🚪', 'A door'], ['🚗', 'A car'], ['🧰', 'A toolbox']], 'A piano\'s keys make music, not open doors!'],
    ['What has to be broken before you can use it?', ['🥚', 'An egg'], [['🥛', 'A glass'], ['📦', 'A box'], ['✏️', 'A pencil']], 'You crack an egg before cooking it.'],
    ['I\'m tall when I\'m young and short when I\'m old.', ['🕯️', 'A candle'], [['🌳', 'A tree'], ['🎈', 'A balloon'], ['🦒', 'A giraffe']], 'A candle melts shorter as it burns.'],
    ['What has legs but cannot walk?', ['🪑', 'A chair'], [['🐕', 'A dog'], ['🐦', 'A bird'], ['🐜', 'An ant']], 'A chair stands on legs but never moves.'],
    ['What goes up but never comes down?', ['🎂', 'Your age'], [['🎈', 'A balloon'], ['🚀', 'A rocket'], ['⚽', 'A ball']], 'Every birthday, your age goes up — never down!'],
    ['I am full of holes, but I can still hold water.', ['🧽', 'A sponge'], [['🥅', 'A net'], ['🧺', 'A basket'], ['🧀', 'Cheese']], 'A sponge soaks water into its tiny holes.'],
    ['I run but never walk. I have a mouth but never talk.', ['🏞️', 'A river'], [['🐕', 'A dog'], ['⏰', 'A clock'], ['🚗', 'A car']], 'Rivers "run" and flow out at a "mouth".'],
    ['What can you catch but never throw?', ['🤧', 'A cold'], [['⚽', 'A ball'], ['🐟', 'A fish'], ['🥏', 'A frisbee']], 'You can catch a cold, but you can\'t throw one!'],
    ['I have a neck but no head, and I wear a cap.', ['🍾', 'A bottle'], [['🦒', 'A giraffe'], ['👕', 'A shirt'], ['🖊️', 'A pen']], 'A bottle has a narrow neck and a cap on top.'],
    ['A plate full of pearls is held upside down over everyone\'s head.', ['🌌', 'The starry sky'], [['☂️', 'An umbrella'], ['🌧️', 'A rain cloud'], ['💡', 'A lamp']], 'The night sky is the plate, and the stars are its pearls.', 'Traditional Indian paheli'],
    ['What has words but never speaks?', ['📖', 'A book'], [['🦜', 'A parrot'], ['📻', 'A radio'], ['📱', 'A phone']], 'A book is full of words but is always silent.'],
    ['What has an eye but cannot see?', ['🧵', 'A needle'], [['🦉', 'An owl'], ['📷', 'A camera'], ['🐟', 'A fish']], 'The thread goes through the needle\'s "eye".'],
    ['What gets bigger the more you take away from it?', ['🕳️', 'A hole'], [['🍰', 'A cake'], ['🎈', 'A balloon'], ['🌳', 'A tree']], 'Dig more out and the hole grows bigger!']
  ],
  medium: [
    ['The more you take, the more you leave behind.', ['👣', 'Footsteps'], [['📸', 'Photos'], ['🍪', 'Cookies'], ['💰', 'Money']], 'Every step you take leaves a footprint behind.'],
    ['I have cities but no houses, forests but no trees, and rivers but no water.', ['🗺️', 'A map'], [['🖼️', 'A painting'], ['💭', 'A dream'], ['📺', 'A TV']], 'A map shows cities, forests and rivers — but only as drawings.'],
    ['I can travel around the world while staying in a corner.', ['✉️', 'A stamp'], [['✈️', 'An aeroplane'], ['🕷️', 'A spider'], ['🛰️', 'A satellite']], 'A postage stamp sits in the corner of a letter that travels the world.'],
    ['Green she stands in the king\'s garden, wrapped in a shawl, hiding a lakh of pearls.', ['🌽', 'A corn cob'], [['🍉', 'A watermelon'], ['🦚', 'A peacock'], ['🥬', 'A cabbage']], 'The husk is the shawl and the kernels are the pearls.', 'Traditional Indian paheli'],
    ['Black but not a crow, long but not a snake, it twists but is not a rope.', ['👧', 'A hair plait'], [['🛣️', 'A road'], ['👤', 'A shadow'], ['🐛', 'A caterpillar']], 'A plait (choti) is black, long and twisted.', 'Traditional Indian paheli'],
    ['A tree has twelve branches. Each branch has about thirty leaves, half dark and half light.', ['📆', 'A year'], [['🌳', 'A banyan tree'], ['⏰', 'A clock'], ['🌴', 'A coconut tree']], '12 months, about 30 days each, and every day has a night and a day.', 'Traditional riddle'],
    ['What has a head and a tail but no body?', ['💰', 'A coin'], [['🐍', 'A snake'], ['🐟', 'A fish'], ['🦎', 'A lizard']], 'Coins have "heads" on one side and "tails" on the other.'],
    ['What month has 28 days?', ['📅', 'All of them'], [['❄️', 'February'], ['🗓️', 'Only leap years'], ['🚫', 'None']], 'Every month has at least 28 days!'],
    ['What belongs to you, but other people use it more than you do?', ['🏷️', 'Your name'], [['🧸', 'Your toys'], ['📱', 'Your phone'], ['🏠', 'Your house']], 'Other people say your name far more often than you do.'],
    ['I am so fragile that if you say my name, you break me.', ['🤫', 'Silence'], [['🥛', 'A glass'], ['🥚', 'An egg'], ['💡', 'A bulb']], 'Saying "silence" out loud breaks the silence!'],
    ['I am as light as a feather, yet the strongest person can\'t hold me for five minutes.', ['🌬️', 'Your breath'], [['🎈', 'A balloon'], ['☁️', 'A cloud'], ['🐦', 'A bird']], 'Nobody can hold their breath for five minutes.'],
    ['I have one head, one foot and four legs.', ['🛏️', 'A bed'], [['🐄', 'A cow'], ['🕷️', 'A spider'], ['🪑', 'A chair']], 'A bed has a headboard, a foot end and four legs.'],
    ['Two brothers live on either side of a hill, yet they never see each other.', ['👀', 'Your eyes'], [['👟', 'Your shoes'], ['🦶', 'Your feet'], ['🤲', 'Your hands']], 'Your eyes sit on each side of your nose and can\'t see each other.', 'Traditional riddle'],
    ['What goes through towns and fields but never moves?', ['🛣️', 'A road'], [['🚆', 'A train'], ['🌬️', 'The wind'], ['🐄', 'A cow']], 'A road passes through places while staying still.']
  ],
  hard: [
    ['Forward I am heavy, but backward I am not.', ['⚖️', 'A ton'], [['🐘', 'An elephant'], ['⛰️', 'A stone'], ['🏋️', 'A weight']], 'Spell "ton" backwards and you get "not"!'],
    ['What can fill a room but takes up no space?', ['💡', 'Light'], [['💨', 'Air'], ['💧', 'Water'], ['🛋️', 'Furniture']], 'Light fills a room but takes up no space. (Air does take up space!)'],
    ['What word becomes shorter when you add two letters to it?', ['📏', 'Short'], [['📐', 'Long'], ['🔎', 'Small'], ['🐜', 'Tiny']], 'Short + "er" = shorter!'],
    ['I speak without a mouth and hear without ears. Mountains are where I like to call out.', ['🏔️', 'An echo'], [['📻', 'A radio'], ['👻', 'A ghost'], ['🦜', 'A parrot']], 'An echo repeats your voice back from mountains and walls.'],
    ['I have keys but no locks, space but no room. You can enter, but you can\'t go inside.', ['⌨️', 'A keyboard'], [['🎹', 'A piano'], ['🏨', 'A hotel'], ['🔐', 'A safe']], 'A keyboard has keys, a space bar and an Enter key.'],
    ['What comes once in a minute, twice in a moment, but never in a thousand years?', ['🔤', 'The letter M'], [['⏱️', 'A second'], ['👁️', 'A blink'], ['🌠', 'A shooting star']], 'Look at the spelling: Minute, MoMent — but no M in "a thousand years".'],
    ['I have branches but no fruit, trunk or leaves.', ['🏦', 'A bank'], [['🌳', 'A tree'], ['🌵', 'A cactus'], ['🥥', 'A coconut']], 'Banks have branches in many cities.'],
    ['If you have me, you want to share me. Once you share me, you no longer have me.', ['🤫', 'A secret'], [['💰', 'Money'], ['🍕', 'A pizza'], ['🧸', 'A toy']], 'Once you tell a secret, it isn\'t a secret any more.'],
    ['What can you hold in your right hand but never in your left hand?', ['💪', 'Your left elbow'], [['🖊️', 'A pen'], ['⚽', 'A ball'], ['📱', 'A phone']], 'Try it — your left hand can\'t reach your own left elbow!'],
    ['What has thirteen hearts but no other organs?', ['🃏', 'A deck of cards'], [['🐙', 'An octopus'], ['💝', 'A gift box'], ['🏥', 'A hospital']], 'A deck has 13 cards in the hearts suit. (An octopus has 3 hearts!)'],
    ['A man walked in the pouring rain with no umbrella or hat, yet not a single hair on his head got wet.', ['🧑', 'He was bald'], [['🏃', 'He ran fast'], ['🌦️', 'It was light rain'], ['🧥', 'He wore a coat']], 'No hair on his head means none of it could get wet!'],
    ['What has a bottom at the top?', ['🦵', 'Your legs'], [['⛰️', 'A mountain'], ['🍾', 'A bottle'], ['🥛', 'A glass']], 'Your legs have your "bottom" at the top of them!'],
    ['The more of me there is, the less you see.', ['🌑', 'Darkness'], [['🔭', 'A telescope'], ['💡', 'Light'], ['👓', 'Glasses']], 'The darker it gets, the less you can see.'],
    ['I am always coming, but I never arrive.', ['📅', 'Tomorrow'], [['🚌', 'The bus'], ['🌅', 'Sunrise'], ['🎁', 'A parcel']], 'When tomorrow comes, it becomes today!']
  ]
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

// Draws items without repeats until a pool runs dry, then reshuffles
class QuestionDeck {
  constructor() { this.piles = {}; }

  draw(key, pool) {
    if (!this.piles[key] || this.piles[key].length === 0) {
      this.piles[key] = shuffleArray(pool);
    }
    return this.piles[key].pop();
  }
}

// ---------------------------------------------------------------------------
// Math Blitz generator (endless, never repeats a fixed list)
// ---------------------------------------------------------------------------
function numberOptions(answer, likelyMistakes = []) {
  const allowNegative = answer < 0;
  const opts = new Set([answer]);
  const candidates = [
    ...shuffleArray(likelyMistakes),
    ...shuffleArray([answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10]),
    ...shuffleArray([answer + 3, answer - 3, answer + 5, answer - 5, answer + 4, answer + 6])
  ];
  for (const c of candidates) {
    if (opts.size >= 4) break;
    if (!Number.isInteger(c) || (!allowNegative && c < 0)) continue;
    opts.add(c);
  }
  return [...opts].map(String);
}

const MATH_EMOJIS = ['🍎', '⭐', '🐟', '🎈', '🍪', '🌸'];

const MATH_GENERATORS = {
  easy: [
    () => {
      const a = rand(1, 10), b = rand(1, 10);
      return { prompt: `${a} + ${b}`, answer: a + b, why: `${a} + ${b} = ${a + b}` };
    },
    () => {
      const a = rand(6, 20), b = rand(1, a - 1);
      return { prompt: `${a} − ${b}`, answer: a - b, why: `${a} − ${b} = ${a - b}` };
    },
    () => {
      const e = pick(MATH_EMOJIS), n1 = rand(1, 5), n2 = rand(1, 4);
      return {
        prompt: `${e.repeat(n1)} + ${e.repeat(n2)}`, sub: 'How many altogether?',
        answer: n1 + n2, why: `${n1} + ${n2} = ${n1 + n2}`, small: true
      };
    },
    () => {
      const step = pick([2, 5, 10]), start = rand(1, 10);
      const seq = [start, start + step, start + 2 * step];
      return {
        prompt: `${seq.join(', ')}, ?`, sub: 'What comes next?',
        answer: start + 3 * step, why: `The numbers go up by ${step} each time.`, small: true
      };
    },
    () => {
      const nums = new Set();
      while (nums.size < 4) nums.add(rand(10, 99));
      const list = [...nums];
      const max = Math.max(...list);
      return { prompt: 'Which is the biggest?', options: list.map(String), answer: max, why: `${max} is bigger than the others.`, small: true };
    }
  ],
  medium: [
    () => {
      const a = rand(3, 12), b = rand(3, 12);
      return { prompt: `${a} × ${b}`, answer: a * b, mistakes: [a * (b + 1), a * (b - 1), a + b], why: `${a} × ${b} = ${a * b}` };
    },
    () => {
      const b = rand(2, 10), q = rand(3, 12);
      return { prompt: `${b * q} ÷ ${b}`, answer: q, why: `${b} × ${q} = ${b * q}, so ${b * q} ÷ ${b} = ${q}` };
    },
    () => {
      const a = rand(15, 69), b = rand(15, 99 - a);
      return { prompt: `${a} + ${b}`, answer: a + b, mistakes: [a + b - 10, a + b + 10], why: `${a} + ${b} = ${a + b}` };
    },
    () => {
      const a = rand(40, 99), b = rand(11, a - 10);
      return { prompt: `${a} − ${b}`, answer: a - b, mistakes: [a - b + 10, a - b - 10], why: `${a} − ${b} = ${a - b}` };
    },
    () => {
      const b = rand(3, 9), x = rand(3, 12);
      return { prompt: `? × ${b} = ${x * b}`, answer: x, sub: 'Find the missing number', why: `${x} × ${b} = ${x * b}` };
    },
    () => {
      const n = rand(11, 49) * 2;
      return { prompt: `Half of ${n}`, answer: n / 2, mistakes: [n * 2], why: `${n} ÷ 2 = ${n / 2}` };
    }
  ],
  hard: [
    () => {
      const a = rand(2, 20), b = rand(2, 9), c = rand(2, 9);
      return {
        prompt: `${a} + ${b} × ${c}`, answer: a + b * c, mistakes: [(a + b) * c],
        why: `Multiply first (BODMAS): ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}`
      };
    },
    () => {
      const p = pick([10, 20, 25, 50, 75]);
      const unit = 100 / gcd(p, 100);
      const n = unit * rand(Math.ceil(20 / unit), Math.floor(400 / unit));
      const ans = (p * n) / 100;
      return { prompt: `${p}% of ${n}`, answer: ans, why: `${p}% = ${p}/100, and ${p}/100 × ${n} = ${ans}` };
    },
    () => {
      const n = rand(11, 20);
      return { prompt: `${n}²`, answer: n * n, mistakes: [n * 2, n * n + n], why: `${n} × ${n} = ${n * n}` };
    },
    () => {
      const n = rand(11, 20);
      return { prompt: `√${n * n}`, answer: n, why: `${n} × ${n} = ${n * n}` };
    },
    () => {
      const d = pick([3, 4, 5, 8]), num = rand(1, d - 1), n = d * rand(5, 15);
      const ans = (n / d) * num;
      return { prompt: `${num}/${d} of ${n}`, answer: ans, mistakes: [n / d], why: `${n} ÷ ${d} = ${n / d}, then × ${num} = ${ans}` };
    },
    () => {
      const a = rand(23, 99), b = rand(3, 9);
      return { prompt: `${a} × ${b}`, answer: a * b, mistakes: [a * b + 10, a * b - 10], why: `${a} × ${b} = ${a * b}` };
    },
    () => {
      const a = -rand(3, 15), b = rand(5, 20);
      return { prompt: `${a} + ${b}`, answer: a + b, mistakes: [-(a + b), a - b], why: `Start at ${a} and move ${b} steps up: ${a + b}` };
    }
  ]
};

// ---------------------------------------------------------------------------
// Question builders. Every question has the same shape:
// { challenge, level, kind, icon, prompt, sub, options:[{value,label,icon}], answer, why }
// kind: binary (Fact/Fiction) | bins | grid | choice
// ---------------------------------------------------------------------------
const QUESTION_BUILDERS = {
  fact(level, deck) {
    const [icon, statement, isFact, why] = deck.draw(`fact:${level}`, FACT_BANK[level]);
    return {
      kind: 'binary', icon, prompt: statement,
      options: [
        { value: 'fiction', label: 'Fiction', icon: '❌' },
        { value: 'fact', label: 'Fact', icon: '✅' }
      ],
      answer: isFact ? 'fact' : 'fiction', why
    };
  },

  eco(level, deck, { binCount }) {
    const [icon, item, bin, why] = deck.draw(`eco:${level}`, ECO_BANK[level]);
    const bins = binCount === 2 ? [ECO_BINS.wet, ECO_BINS.dry] : [ECO_BINS.wet, ECO_BINS.dry, ECO_BINS.haz];
    return { kind: 'bins', icon, prompt: item, sub: 'Which bin does it go in?', options: bins, answer: bin, why };
  },

  odd(level, deck) {
    const q = deck.draw(`odd:${level}`, ODD_BANK[level]);
    const tiles = shuffleArray([q.odd, ...q.rest]).map(([icon, label], i) => ({ value: String(i), icon, label, isOdd: icon === q.odd[0] && label === q.odd[1] }));
    const oddTile = tiles.find(t => t.isOdd);
    return { kind: 'grid', prompt: 'Which one is the odd one out?', options: tiles, answer: oddTile.value, why: q.why };
  },

  math(level) {
    const g = pick(MATH_GENERATORS[level])();
    const labels = g.options ? shuffleArray(g.options) : shuffleArray(numberOptions(g.answer, g.mistakes || []));
    return {
      kind: 'choice', variant: g.small ? 'math-small' : 'math', prompt: g.prompt, sub: g.sub || 'Tap the answer',
      options: labels.map(l => ({ value: l, label: l })), answer: String(g.answer), why: g.why
    };
  },

  word(level, deck) {
    const [prompt, opts, why] = deck.draw(`word:${level}`, WORD_BANK[level]);
    return {
      kind: 'choice', variant: 'word', prompt,
      sub: prompt.includes('___') ? 'Pick the word that fits the blank' : 'Tap the correct answer',
      options: shuffleArray(opts).map(o => ({ value: o, label: o })), answer: opts[0], why
    };
  },

  affix(level, deck) {
    const [type, root, correct, wrong, meaning, word, why] = deck.draw(`affix:${level}`, AFFIX_BANK[level]);
    const label = (a) => (type === 'pre' ? `${a}-` : `-${a}`);
    return {
      kind: 'choice', variant: 'build', prompt: word, sub: `Make a word that means "${meaning}"`,
      build: { type, root, word, meaning },
      options: shuffleArray([correct, ...wrong]).map(a => ({ value: a, label: label(a) })), answer: correct, why
    };
  },

  riddle(level, deck) {
    const [riddle, [icon, answer], wrong, why, origin] = deck.draw(`riddle:${level}`, RIDDLE_BANK[level]);
    const tiles = shuffleArray([[icon, answer], ...wrong]).map(([i, l]) => ({ value: l, icon: i, label: l }));
    return { kind: 'grid', variant: 'riddle', prompt: riddle, tag: origin, hintable: true, options: tiles, answer, why };
  }
};

function buildQuestion(challengeId, level, deck, settings) {
  const q = QUESTION_BUILDERS[challengeId](level, deck, settings);
  q.challenge = challengeId;
  q.level = level;
  return q;
}
