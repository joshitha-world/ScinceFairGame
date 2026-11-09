// Story Spark content: storytelling levels, 12 themed weeks each, and the Power Sentences children
// practise until they know them by heart. Every week runs Monday to Friday:
//   Retell → Character → Setting & senses → Problem → Ending, then a weekend quiz and mini book.
//
// W(title, stamp, heroes, places, problems, [retell title, pictures, lines], [5 Power Sentences])
//   heroes / places / problems: 'emoji words|emoji words|…'
//   Power Sentence swap slots:  [first choice|second|third]  (Story Seeds choices start with an emoji)
// To add more weeks, append a W(...) line to a level.

function W(title, stamp, heroes, places, problems, retell, sentences) {
  const list = (s) => s.split('|').map(x => {
    const i = x.indexOf(' ');
    return { e: x.slice(0, i), t: x.slice(i + 1) };
  });
  return {
    title, stamp, heroes: list(heroes), places: list(places), problems: list(problems),
    retell: { title: retell[0], pics: retell[1].split(' '), lines: retell[2].split('|') },
    sentences
  };
}

const ST_DAYS = [
  { key: 'retell', icon: '🔁', name: 'Retell' },
  { key: 'character', icon: '🦸', name: 'Character' },
  { key: 'setting', icon: '🌈', name: 'Setting & senses' },
  { key: 'problem', icon: '😱', name: 'Problem' },
  { key: 'ending', icon: '🎉', name: 'Ending' }
];

const ST_LEVELS = {
  seeds: {
    id: 'seeds', icon: '🐣', label: 'Story Seeds', who: 'UKG · ages 4–6', color: '#f97316', mode: 'speak', wqTrack: 'tiny', minSentences: 1,
    blurb: 'Speak, listen and repeat with pictures. No reading needed.',
    tips: {
      retell: 'Look at the pictures. Say what happens first, then next.',
      character: 'Say who it is, and one thing they can do.',
      setting: 'Say what you can see there. What colour is it?',
      problem: 'Something goes wrong! Start with “Oh no!”',
      ending: 'Say how it ends. Is everyone happy?'
    },
    prompts: {
      retell: 'Look at the pictures and tell the story back!',
      character: 'Tell me about {hero}. What can it do?',
      setting: '{Hero} is at {place}. What can you see?',
      problem: 'Oh no! {problem}! What happens next?',
      ending: 'How does it end? Is {hero} happy now?'
    },
    weeks: [
      W('My Family', '👪', '👶 baby|👵 grandma|👦 big brother', '🏠 our house|🌳 the park|🛒 the shop', '😢 the baby is crying|🔑 the key is lost|🌧️ it is raining',
        ['Getting Ready', '🌞 🍚 🎒', 'The sun comes up.|We eat our food.|We go to school.'],
        ['First, I [🥱 wake up|🪥 brush my teeth|🍚 eat my food].', 'This is my [👩 mother|👨 father|👵 grandma].', 'I can see a [🔴 red|🔵 blue|🟡 yellow] door.', 'Oh no! I [😢 fell down|🧸 lost my toy|💧 got wet].', 'Now we are all [😊 happy|🤗 together|😴 sleepy].']),
      W('My Pet', '🐱', '🐱 little cat|🐶 puppy|🐰 white rabbit', '🛏️ the bed|🌿 the garden|📦 the big box', '🙀 the cat is stuck|🦴 the bone is gone|🏃 the puppy ran away',
        ['Puppy Plays', '🐶 ⚽ 😴', 'The puppy sees a ball.|The puppy runs and plays.|The puppy goes to sleep.'],
        ['Then the puppy [🏃 ran|🦘 jumped|😴 slept].', 'My pet is very [🧸 soft|⚡ fast|🤏 small].', 'I can hear a [🐱 meow|🐶 woof|🐦 tweet].', 'Oh no! Where is my [🐱 cat|🐶 dog|🐰 rabbit]?', 'I gave my pet a big [🤗 hug|😘 kiss|🍪 treat].']),
      W('At The Park', '🛝', '👧 little girl|👦 little boy|🐿️ squirrel', '🛝 the slide|🌳 the big tree|🎠 the swing', '🎈 the balloon flew away|🤕 the boy fell down|🌧️ the rain came',
        ['The Red Balloon', '🎈 💨 🌳', 'I have a red balloon.|The wind blows it away.|It stops in a tree.'],
        ['First, we went to the [🛝 slide|🎠 swing|🌳 tree].', 'My friend can [🏃 run fast|🦘 jump high|🎵 sing well].', 'The grass is so [🟢 green|🧸 soft|💧 wet].', 'Oh no! My [🎈 balloon|⚽ ball|🧢 cap] flew away.', 'We went home and we [😊 smiled|😴 slept|🍚 ate].']),
      W('Rainy Day', '🌧️', '🐸 green frog|🦆 yellow duck|🐌 slow snail', '💧 the puddle|☂️ the big umbrella|🪟 the window', '⚡ there is a big noise|👟 my shoes are wet|🌂 the umbrella broke',
        ['Splash!', '🌧️ 👢 💦', 'The rain comes down.|I put on my boots.|I jump in the water.'],
        ['Then the rain [💧 came down|⛈️ got big|🌈 stopped].', 'The frog can [🦘 hop|🏊 swim|🎵 sing].', 'I can hear the [🌧️ rain|⚡ thunder|🐸 frog].', 'Oh no! My [👟 shoes|👕 shirt|🎒 bag] is wet.', 'The sun came out and I [😊 smiled|🏃 ran out|👏 clapped].']),
      W('Birthday', '🎂', '🎂 birthday girl|🤡 funny clown|🎁 best friend', '🎈 the party|🍰 the table|🏠 my house', '🎈 the balloon went pop|🍰 the cake fell|🎁 the gift is missing',
        ['Happy Birthday', '🎂 🕯️ 🎁', 'Mamma makes a cake.|I blow the candles.|I open my gift.'],
        ['First, I [💨 blew the candles|🍰 cut the cake|🎁 opened my gift].', 'My friend is very [😂 funny|💖 kind|🤩 happy].', 'The cake is so [😋 sweet|🍫 brown|🤏 small].', 'Oh no! The [🎈 balloon|🍰 cake|🥤 cup] fell down.', 'Thank you for my [🎁 gift|🍰 cake|🎈 balloon].']),
      W('On The Farm', '🐄', '🐄 big cow|🐔 small hen|🐐 little goat', '🌾 the field|🏚️ the barn|🚜 the tractor', '🥚 the egg is gone|🐐 the goat ran off|🚜 the tractor stopped',
        ['The Hen', '🐔 🥚 🐥', 'The hen sits down.|The hen lays an egg.|A baby chick comes out.'],
        ['Then the hen [🥚 laid an egg|🏃 ran away|🌾 ate the seeds].', 'The cow is very [🐘 big|🧸 soft|😴 sleepy].', 'I can smell the [🌾 hay|🌸 flowers|🥛 milk].', 'Oh no! The [🐐 goat|🐄 cow|🐔 hen] ran away.', 'The farmer gave us [🥛 milk|🥚 eggs|🍎 apples].']),
      W('Bedtime', '🌙', '🧸 teddy bear|🦉 night owl|🌟 little star', '🛏️ my bed|🌙 the moon|🪟 the window', '🌑 it is too dark|🧸 teddy is lost|😴 I cannot sleep',
        ['Good Night', '🛁 📖 😴', 'I take a warm bath.|Papa reads a book.|I go to sleep.'],
        ['First, I [🛁 took a bath|🪥 brushed my teeth|📖 read a book].', 'My teddy is so [🧸 soft|🤏 small|🤎 brown].', 'I can see the [🌙 moon|⭐ stars|☁️ clouds].', 'Oh no! It is very [🌑 dark|🥶 cold|📢 loud].', 'Good night, my [🧸 teddy|👩 mother|👨 father].']),
      W('At The Zoo', '🦁', '🦁 big lion|🐒 cheeky monkey|🐘 grey elephant', '🌴 the tree|💦 the pond|🚪 the zoo gate', '🍌 the monkey took my banana|🦁 the lion roared|🧢 my cap fell in',
        ['Cheeky Monkey', '🐒 🍌 😂', 'I see a monkey.|He takes my banana.|We all laugh.'],
        ['Then we saw a [🦁 lion|🐘 elephant|🐒 monkey].', 'The elephant has a long [🐘 trunk|🐁 tail|🦵 leg].', 'The lion says [🦁 roar|😴 yawn|🗣️ hello].', 'Oh no! The monkey took my [🍌 banana|🧢 cap|🍪 biscuit].', 'I love the [🦁 lion|🐒 monkey|🐘 elephant] so much.']),
      W('At The Market', '🍎', '👩‍🌾 fruit seller|👩 my mother|🐄 lazy cow', '🍎 the fruit shop|🥕 the vegetable cart|🛺 the auto', '🍊 the oranges rolled away|👛 the purse is lost|🐄 a cow is on the road',
        ['Going Shopping', '🛺 🍎 🏠', 'We go in the auto.|We buy some apples.|We come back home.'],
        ['First, we got [🍎 apples|🍌 bananas|🥕 carrots].', 'The shop man is very [💖 kind|😂 funny|👴 old].', 'The mango is so [🟡 yellow|😋 sweet|🤏 small].', 'Oh no! The [🍊 oranges|🥚 eggs|🍎 apples] fell down.', 'We went home with a [🛍️ big bag|🍎 red apple|😊 big smile].']),
      W('In The Garden', '🌻', '🦋 butterfly|🐝 busy bee|🐛 little worm', '🌻 the flower|🌱 the soil|💧 the watering can', '🌱 the plant is dry|🐝 the bee is lost|🐦 a bird came',
        ['My Little Seed', '🌱 💧 🌻', 'I plant a seed.|I give it water.|A flower comes up.'],
        ['First, I put in a [🌱 seed|💧 little water|🟤 little soil].', 'The butterfly can [🦋 fly|💃 dance|🌸 sit].', 'The flower smells so [😋 sweet|🌸 nice|😊 good].', 'Oh no! My plant is [🥀 dry|😢 sad|🍂 brown].', 'Now my flower is [🌻 big|🟡 yellow|😊 happy].']),
      W('School Day', '🏫', '👩‍🏫 kind teacher|👧 new friend|🐜 tiny ant', '🏫 my class|🛝 the playground|🚌 the school bus', '✏️ my pencil broke|🥪 I forgot my lunch|🚌 we missed the bus',
        ['New Friend', '🚌 🏫 🤝', 'I go on the bus.|I sit in my class.|I make a new friend.'],
        ['First, I got on the [🚌 bus|🛺 auto|🚲 cycle].', 'My teacher is very [💖 kind|😊 happy|🧠 clever].', 'I can see my [🎒 bag|📖 book|✏️ pencil].', 'Oh no! I lost my [✏️ pencil|🥪 lunch|🎒 bag].', 'My friend said [😊 hello|🙏 thank you|👋 bye bye].']),
      W('Festival Time', '🪔', '🪔 little lamp|🎆 bright rocket|🤝 kind neighbour', '🏠 our door|🌃 the street|🍬 the sweet shop', '💨 the lamp went out|🍬 the sweets are gone|🌧️ the rain came down',
        ['Festival Lights', '🪔 🍬 🎆', 'We light the lamps.|We eat some sweets.|We see the lights.'],
        ['First, we lit the [🪔 lamps|🕯️ candles|🌟 lights].', 'My new dress is very [✨ shiny|🔴 red|🌈 pretty].', 'The sky is so [🌟 bright|🌈 colourful|🌃 dark].', 'Oh no! The [🪔 lamp|🕯️ candle|🌟 light] went out.', 'Happy festival to my [👪 family|🤝 friends|🏫 class].'])
    ]
  },

  sprouts: {
    id: 'sprouts', icon: '🌱', label: 'Story Sprouts', who: 'Grades 1–2', color: '#16a34a', mode: 'write', wqTrack: 'sprout', minSentences: 3,
    blurb: 'Beginning, middle and end in three or more sentences.',
    tips: {
      retell: 'Use First, Then and Last to keep the story in order.',
      character: 'Say how your hero looks and how they feel.',
      setting: 'Use your senses: what can you see, hear or smell?',
      problem: 'Use “but” or “suddenly” to show something went wrong.',
      ending: 'Use “finally” and say how everyone felt.'
    },
    prompts: {
      retell: 'Listen to the story, then tell it again in your own words.',
      character: 'Tell me about the {hero}. How does it look? How does it feel?',
      setting: 'The {hero} is in {place}. What can you see, hear and smell?',
      problem: 'Suddenly, {problem}! What goes wrong? What does the {hero} do?',
      ending: 'How does the story end for the {hero}? How does everyone feel?'
    },
    weeks: [
      W('Forest Friends', '🦊', '🦊 clever fox|🐰 shy rabbit|🐻 sleepy bear', '🌲 a deep forest|🕳️ a cosy cave|🏞️ a quiet river', '🌧️ a big storm came|🍯 the honey disappeared|🔥 the path was blocked',
        ['The Lost Cub', '🐻 🌲 😢 🦊 🏠', 'A bear cub walked into the forest.|Soon he was lost and began to cry.|A clever fox heard him crying.|The fox showed him the way home.'],
        ['First, the [little fox|tiny rabbit|sleepy bear] woke up early.', 'The [clever fox|shy rabbit|sleepy bear] had [bright eyes|soft fur|big paws].', 'The forest smelled of [wet leaves|sweet flowers|fresh rain].', 'But suddenly, the sky turned [dark|grey|black].', 'Finally, all the friends felt [safe|happy|proud].']),
      W('Under The Sea', '🐠', '🐠 tiny fish|🐢 old turtle|🐙 friendly octopus', '🪸 a coral reef|🏴‍☠️ a sunken ship|🌊 a deep blue cave', '🕸️ a net fell down|🦈 a shark swam by|🌊 a huge wave came',
        ['The Tiny Fish', '🐠 🕸️ 🐙 🎉', 'A tiny fish swam near a boat.|A net caught her by the tail.|An octopus untied the net.|The tiny fish swam away, free and happy.'],
        ['First, the [tiny fish|old turtle|baby crab] swam out of its home.', 'The octopus had [eight long arms|big round eyes|a kind smile].', 'The water felt [cool|warm|bubbly] on its skin.', 'But suddenly, a [huge shark|dark shadow|big net] came near.', 'Finally, the little fish swam home [safely|happily|quickly].']),
      W('Space Trip', '🚀', '👩‍🚀 young astronaut|👽 small green alien|🤖 helpful robot', '🌕 the silver moon|🪐 a ringed planet|🚀 a shiny rocket', '⛽ the rocket ran out of fuel|☄️ a comet came close|📡 the radio stopped',
        ['Moon Visit', '🚀 🌕 👽 👋', 'A rocket flew up into the sky.|It landed on the silver moon.|A small alien said hello.|They waved goodbye as the rocket left.'],
        ['First, the rocket [zoomed|shot|flew] into the sky.', 'The alien had [three eyes|green skin|long ears] and a big smile.', 'The stars were [shining|twinkling|sparkling] all around.', 'But suddenly, the engine went [bang|quiet|boom].', 'Finally, they landed back on Earth and [cheered|hugged|danced].']),
      W('Monsoon Magic', '🌧️', '🐸 jumping frog|👧 girl with a paper boat|🐦 wet sparrow', '💧 a big puddle|🌴 a dripping tree|🛣️ a flooded street', '🌊 the boat floated away|⚡ thunder shook the trees|🌂 the umbrella turned inside out',
        ['The Paper Boat', '🌧️ ⛵ 🌊 🐸 😊', 'It rained all morning.|Riya made a paper boat.|The water carried it away.|A frog pushed it back to her.'],
        ['First, dark clouds [filled|covered|crossed] the sky.', 'The little girl felt [excited|curious|cheerful] in the rain.', 'The rain went [pitter-patter|splish-splash|drip-drop] on the roof.', 'But suddenly, my paper boat [floated away|sank down|fell apart].', 'Finally, the sun came out and a [rainbow|bright light|warm wind] appeared.']),
      W('Magic Paintbrush', '🖌️', '👦 boy with a paintbrush|🐉 painted dragon|🐦 paper bird', '🖼️ a magic wall|🏡 a tiny village|🎨 an art room', '🐉 the painting came alive|🎨 the paint ran out|🖌️ the brush was stolen',
        ['The Magic Brush', '🖌️ 🐟 💧 😃', 'Ravi found an old brush.|He painted a fish on the wall.|The fish jumped into the water.|Ravi could not stop smiling.'],
        ['First, I picked up the [magic brush|old pencil|shiny crayon].', 'The dragon was [big and green|small and funny|shy and kind].', 'The paint smelled [sharp|strange|sweet] and looked [bright|wet|shiny].', 'But suddenly, my picture started to [move|talk|fly].', 'Finally, I painted a [door|bridge|boat] and we were safe.']),
      W('Toy Town', '🧸', '🧸 brave teddy|🚂 little red train|🪆 dancing doll', '🛏️ under the bed|📦 a toy box|🏠 a tiny house', '🔋 the batteries died|🐱 the cat came in|🧸 teddy lost an arm',
        ['Toys At Night', '🌙 🧸 🐱 📦 😴', 'At night, the toys woke up.|Teddy led them across the room.|A cat came in and they ran.|They hid in the box and fell asleep.'],
        ['First, the toys [woke up|stood up|looked around] at night.', 'The teddy had [one button eye|soft brown fur|a tiny red bow].', 'The room was [dark and quiet|cold and still|warm and cosy].', 'But suddenly, they heard a [loud meow|soft step|big bang].', 'Finally, the toys were back in their [box|beds|places].']),
      W('Jungle Race', '🐯', '🐢 slow tortoise|🐆 fast cheetah|🐒 funny monkey', '🌴 the green jungle|🌉 a shaky bridge|⛰️ a rocky hill', '🌉 the bridge broke|🐍 a snake was on the path|🌧️ the mud was slippery',
        ['The Big Race', '🐆 🐢 😴 🏁 🎉', 'The cheetah raced the tortoise.|The cheetah ran fast and took a nap.|The tortoise kept on walking.|The tortoise won the race!'],
        ['First, all the animals [lined up|got ready|ran fast].', 'The tortoise was slow but very [brave|strong|clever].', 'The jungle was [hot and noisy|green and wet|dark and deep].', 'But suddenly, the [bridge broke|rain came|path ended].', 'Finally, the tortoise felt so [proud|tired|happy].']),
      W('The Kind Giant', '👣', '🧍 kind giant|🐭 tiny mouse|👧 small girl', '⛰️ a tall mountain|🏰 a huge castle|🌾 a golden field', '🌉 the bridge was washed away|🥶 the village froze|👟 the giant lost his shoe',
        ['The Giant Bridge', '👣 🌊 🌉 👏', 'A giant lived near a village.|A flood washed the bridge away.|The giant lay down across the river.|Everyone walked over him and cheered.'],
        ['First, the giant walked with [slow|heavy|gentle] steps.', 'The giant was tall but very [gentle|kind|shy].', 'His voice sounded like [thunder|a big drum|a deep bell].', 'But suddenly, the people began to [shout|run|cry].', 'Finally, the village was safe and everyone [cheered|clapped|sang].']),
      W('Pirate Picnic', '🏴‍☠️', '🦜 chatty parrot|🏴‍☠️ little pirate|🦀 grumpy crab', '🏝️ a tiny island|⛵ an old ship|🏖️ a golden beach', '🗺️ the map blew away|🦀 the crab took the key|🌊 the ship sprang a leak',
        ['The Map', '🗺️ 🏝️ ⛏️ 🍎', 'Pirates found an old map.|They sailed to an island.|They dug a very deep hole.|The treasure was a box of apples!'],
        ['First, the pirates [sailed|rowed|floated] to the island.', 'The parrot had [bright feathers|a loud voice|a sharp beak].', 'The sea tasted [salty|cold|bitter] on my lips.', 'But suddenly, the wind blew the [map|hat|sail] away.', 'Finally, we opened the box and [laughed|shouted|danced].']),
      W('Snow Mountain', '🏔️', '🐧 lost penguin|🐻‍❄️ white bear|⛄ smiling snowman', '🏔️ a snowy peak|🛖 a warm hut|🧊 a frozen lake', '🧊 the ice cracked|🌨️ a snowstorm began|⛄ the snowman started to melt',
        ['The Lost Penguin', '🐧 🌨️ 🐻‍❄️ 🏠', 'A penguin slid down the hill.|Snow began to fall very fast.|A white bear found him.|The bear carried him back home.'],
        ['First, the snow fell [softly|quickly|quietly] on the hill.', 'The penguin felt [cold and tired|lost and scared|small and alone].', 'The snow felt [cold|crunchy|soft] under my feet.', 'But suddenly, the ice began to [crack|shake|break].', 'Finally, we sat by the fire and felt [warm|safe|sleepy].']),
      W('Robot Helper', '🤖', '🤖 tiny robot|👦 clever boy|🐕 metal dog', '🔧 a messy workshop|🏫 a busy school|🏠 a smart house', '🔋 the robot stopped working|💧 water spilled everywhere|🔌 the lights went out',
        ['Tiny Robot', '🔧 🤖 💧 🧹 😊', 'Asha built a tiny robot.|It cleaned the whole room.|Then it spilled a bucket of water.|Asha laughed and helped it mop.'],
        ['First, I [built|fixed|painted] a tiny robot.', 'The robot had [blinking lights|square feet|a funny voice].', 'The machine went [beep beep|whirr|click clack] all day.', 'But suddenly, the robot [stopped|fell over|ran away].', 'Finally, the robot said, “[Thank you|I am happy|Well done]!”']),
      W('The Mango Tree', '🥭', '🐒 hungry monkey|👵 wise grandmother|🐦 little parrot', '🌳 an old mango tree|🏡 a village home|🌾 a green field', '🥭 all the mangoes vanished|🪓 someone came to cut the tree|🌪️ a strong wind blew',
        ['Sweet Mangoes', '🌳 🥭 🐒 🤝', 'An old tree had sweet mangoes.|A monkey ate them all by himself.|He felt sick and very sorry.|Next time he shared with everyone.'],
        ['First, we climbed the [old mango|tall neem|big banyan] tree.', 'My grandmother has [kind eyes|soft hands|a lovely smile].', 'The mango tasted [sweet|juicy|sour] and smelled lovely.', 'But suddenly, a [strong wind|big monkey|loud noise] shook the tree.', 'Finally, we [shared|ate|carried] the mangoes together.'])
    ]
  },

  explorers: {
    id: 'explorers', icon: '🚀', label: 'Story Explorers', who: 'Grades 3–5', color: '#2563eb', mode: 'write', wqTrack: 'explorer', minSentences: 5,
    blurb: 'Vivid characters, senses, problems and satisfying endings.',
    tips: {
      retell: 'Keep only the important events. Use time words like “later” and “after that”.',
      character: 'Show what your hero is like through what they do and say.',
      setting: 'Use at least two senses so we feel we are really there.',
      problem: 'Use “because” and “so” to show why things go wrong.',
      ending: 'Solve the problem, then show what your hero has learned.'
    },
    prompts: {
      retell: 'Listen carefully, then retell the story in your own words.',
      character: 'Bring the {hero} to life. Show us what it does and says.',
      setting: 'Take us to {place}. Use at least two senses to describe it.',
      problem: 'Without warning, {problem}. Why is this a disaster? What does the {hero} try?',
      ending: 'How is the problem solved? What has the {hero} learned?'
    },
    weeks: [
      W('The Secret Door', '🚪', '🧒 curious girl|🐈 mysterious cat|👴 forgetful professor', '📚 a dusty library|🏚️ an empty mansion|🌌 a hidden garden', '🔒 the door locked behind them|🕯️ the only candle went out|🗝️ the key snapped in two',
        ['The Library Door', '📚 🚪 🗝️ 🌌 😮', 'Meera found a tiny door behind the bookshelf.|Later, she noticed a golden key inside an old atlas.|After turning the key, she heard a soft click.|Beyond the door lay a garden full of glowing flowers.|From that day on, the library was her favourite place.'],
        ['Long before anyone woke, [Meera|the old cat|the professor] crept down the [creaking stairs|narrow hallway|dusty corridor].', 'Her eyes [sparkled|widened|gleamed] whenever she discovered a [secret|mystery|clue].', 'The air smelled of [old paper|cold stone|burning wax], and somewhere a clock was [ticking|chiming|whirring].', 'Without warning, the door [slammed shut|vanished|locked itself], so we were trapped.', 'At last, the door swung open, and she realised that [courage|patience|curiosity] had saved her.']),
      W('Storm At Sea', '⛵', '⚓ young sailor|🐬 loyal dolphin|🧓 old captain', '⛵ a creaking ship|🏝️ a stormy island|🌊 a roaring sea', '🌪️ the mast cracked in the storm|🧭 the compass stopped working|💧 water poured into the cabin',
        ['The Young Sailor', '⛵ 🌪️ 🐬 🏝️ 🙏', 'Kiran sailed out on a calm morning.|By noon, black clouds had swallowed the sun.|A huge wave tossed him into the sea.|A dolphin guided him to a nearby island.|After that, he never sailed without checking the sky.'],
        ['As the sun rose, the crew [hoisted the sails|pulled up the anchor|untied the ropes].', 'The captain [gripped the wheel|narrowed his eyes|stood tall] and said, “We will not give up.”', 'Salty spray [stung my face|burned my eyes|soaked my shirt] while the wind [howled|screamed|roared].', 'Because the storm grew stronger, the [mast|sail|rudder] began to [crack|tear|shake].', 'When the sea was calm again, we finally understood the power of [teamwork|courage|patience].']),
      W('Time Machine', '⏰', '👩‍🔬 young inventor|🦖 baby dinosaur|🤖 rusty robot', '🦕 a prehistoric valley|🏰 a medieval castle|🌆 a floating city', '⏰ the machine got stuck in the past|⚡ lightning struck the controls|🦖 a dinosaur swallowed the key',
        ['Back In Time', '🔧 ⏰ 🦖 ⚡ 🏠', 'Tara built a machine from an old clock.|With one push, she landed among dinosaurs.|A baby dinosaur followed her everywhere.|After a flash of lightning, the machine came alive.|Soon she was home, with a tooth to prove it.'],
        ['Moments after I pressed the button, the room began to [spin|glow|tremble].', 'The inventor [scratched her head|tapped her chin|muttered to herself] and grinned at the [broken clock|strange map|glowing wire].', 'The valley [echoed with roars|smelled of smoke|shook beneath our feet].', 'Since the controls were [melted|broken|missing], we could not return home.', 'In the end, she learned that every mistake is a [lesson|gift|step forward].']),
      W('The Silent Village', '🏘️', '🕵️ young detective|🦉 wise owl|🧑‍🌾 worried farmer', '🏘️ a silent village|🌫️ a foggy lane|🏚️ an abandoned mill', '🔕 every sound in the village vanished|👣 strange footprints appeared|🕰️ all the clocks stopped',
        ['The Vanished Bell', '🔔 🕵️ 👣 🦉 🔔', 'One morning, the village bell did not ring.|Anu began to search for clues.|She followed muddy footprints to the old mill.|There, a family of owls had nested inside the bell.|The villagers moved the nest and the bell rang again.'],
        ['Early that morning, a thick fog [crept|rolled|drifted] through the [empty streets|narrow lanes|silent fields].', 'She [studied the ground|raised one eyebrow|tapped her notebook] and whispered, “Something is wrong.”', 'Not a single [bird sang|door creaked|dog barked], and the silence felt [heavy|cold|strange].', 'Although we searched everywhere, the [clue|key|map] had disappeared.', 'Finally, the mystery was solved, and the village was filled with [laughter|music|light] again.']),
      W('The Dragon Who Sneezed', '🐉', '🐉 sneezing dragon|👸 brave princess|🧙 clumsy wizard', '🏰 a stone castle|🌋 a smoking volcano|🌲 an enchanted wood', '🔥 a sneeze set the roof on fire|🧪 the magic potion spilled|🌋 the volcano started to rumble',
        ['Achoo!', '🐉 🤧 🔥 🍯 😊', 'A young dragon caught a terrible cold.|Every sneeze set something on fire.|The frightened villagers hid in their homes.|A brave girl brought him honey and ginger.|From then on, he guarded the village.'],
        ['Once, in a kingdom far away, there lived a [dragon|wizard|princess] who could not [stop sneezing|tell a lie|sit still].', 'The princess [rolled up her sleeves|lifted her chin|drew her sword] and marched toward the [cave|tower|bridge].', 'Smoke [curled around the towers|stung our eyes|hung in the air], and the ground felt [hot|shaky|hard] beneath us.', 'Every time the dragon sneezed, [flames|sparks|smoke] shot out, so everyone ran.', 'From that day on, the dragon and the villagers lived as [friends|neighbours|a family].']),
      W('Lost In The City', '🌆', '🧒 lost tourist boy|🐕 street dog|🛺 kind auto driver', '🚉 a crowded station|🏙️ a noisy market|🌉 a long bridge', '📱 the phone battery died|🚆 the train left without him|💰 the wallet was stolen',
        ['At The Station', '🚉 😟 🐕 🛺 🤗', 'Dev let go of his father at the crowded station.|Within seconds, he could not see anyone he knew.|A street dog stayed beside him.|Later, a kind auto driver called his father.|When they met, Dev hugged him for a long time.'],
        ['As soon as the train stopped, people [rushed|poured|pushed] onto the platform.', 'He [bit his lip|clenched his fists|held his breath] and tried not to [cry|panic|shout].', 'Horns [blared|honked|screamed] and the smell of [hot samosas|diesel smoke|frying onions] filled the air.', 'Because my phone had [died|fallen|broken], nobody knew where I was.', 'When I finally saw my father, I felt [relieved|grateful|safe] and promised to [stay close|be careful|listen].']),
      W('The Inventor Next Door', '💡', '👵 mysterious neighbour|👦 nosy boy|🐦 mechanical bird', '🏡 the house next door|🔧 a cluttered shed|🌉 a rooftop', '💥 an experiment exploded|🐦 the mechanical bird flew off|🚪 he was caught spying',
        ['The Noisy Shed', '🏡 💥 👀 🐦 😃', 'Every night, strange noises came from the shed next door.|Arjun finally climbed the wall to look inside.|Mrs Rao caught him and smiled.|She showed him a bird made of old clock parts.|Soon Arjun was helping her build a second one.'],
        ['Every evening, strange [noises|lights|smells] came from the [shed|attic|garage] next door.', 'She [wiped her glasses|hummed softly|winked at me] and handed me a [spanner|tiny gear|glowing wire].', 'The shed smelled of [oil and sawdust|burnt metal|old rope], and sparks [crackled|fizzed|danced] in the dark.', 'Although we tried again and again, the machine would not [start|fly|move].', 'By the end of the summer, I had learned that failure is only a [first try|lesson|beginning].']),
      W('Desert Journey', '🐪', '🐪 stubborn camel|👧 young traveller|🦎 tiny lizard', '🏜️ an endless desert|🌴 a hidden oasis|⛺ a nomad camp', '💧 the water ran out|🌪️ a sandstorm hid the path|🐪 the camel refused to move',
        ['The Sandstorm', '🐪 🏜️ 🌪️ 🌴 💧', 'Zara and her camel set out across the desert.|On the third day, their water ran low.|A sandstorm hid the path completely.|The camel smelled water and led her forward.|Together they reached a cool green oasis.'],
        ['For three long days, we walked across the [burning|endless|golden] sand.', 'The camel [snorted|stamped its feet|turned its head] and refused to [move|drink|turn back].', 'Hot wind [scratched my cheeks|filled my mouth|burned my lips] and the sand felt like [fire|needles|sugar].', 'Since there was no water left, we had to [keep walking|find shelter|turn around].', 'When we reached the oasis at last, I knew I could [never give up|trust my friend|survive anything].']),
      W('The Haunted Classroom', '👻', '👻 shy ghost|🧑‍🏫 strict teacher|🧒 brave new student', '🏫 an old classroom|🔦 a dark corridor|🗄️ a dusty cupboard', '🔦 the lights flickered and died|📝 the answer sheets disappeared|🚪 the classroom door would not open',
        ['The Friendly Ghost', '🏫 📝 👻 📖 🤝', 'Every night, chalk drawings appeared on the board.|Nisha stayed behind to find out why.|A shy ghost wrote, “I just want to learn.”|She read aloud to him every evening.|At the end of the year, he wrote, “Thank you.”'],
        ['When the last bell rang, the school [fell silent|grew dark|emptied out].', 'The ghost [floated nervously|hid behind the desk|twisted its fingers] and whispered, “Please do not go.”', 'Cold air [brushed my neck|crept along the floor|filled the room], and the chalk began to [squeak|scratch|tap].', 'Because the door [would not open|had vanished|was locked], we had to find another way.', 'Finally, I smiled, because even a ghost only wanted a [friend|teacher|home].']),
      W('The Great Cricket Match', '🏏', '🏏 nervous batsman|🧢 young captain|🐕 ball-stealing dog', '🏟️ a packed stadium|🌳 a dusty ground|🏘️ a narrow gully', '🌧️ rain threatened to stop play|🦴 the captain hurt his ankle|🐕 a dog ran off with the ball',
        ['Last Ball', '🏏 😰 🐕 🏃 🏆', 'The village team needed six runs from the last over.|Their captain had hurt his ankle.|Sami, the youngest player, walked out to bat.|A dog ran away with the ball as the crowd laughed.|On the very last ball, Sami hit the winning shot.'],
        ['With only one ball left, the whole crowd [held its breath|stood up|fell silent].', 'He [wiped his forehead|tightened his grip|took a deep breath] and stared at the [bowler|ball|boundary].', 'The crowd [roared like thunder|clapped in rhythm|chanted my name] and dust [stung my eyes|filled the air|swirled around us].', 'Because the captain was hurt, I had to [bat|bowl|lead] for the first time.', 'As we lifted the trophy, I realised that [practice|teamwork|belief] had made us champions.']),
      W('The River Spirit', '🏞️', '🧜 river spirit|👦 fisherman’s son|🐟 golden fish', '🏞️ a winding river|🌉 an old stone bridge|🌿 a misty bank', '🗑️ the river was filling with rubbish|🌵 the river began to dry up|🎣 the golden fish was caught',
        ['The Golden Fish', '🎣 🐟 🗑️ 🧹 🌊', 'Ravi caught a golden fish in his net.|The fish begged him to clean the river.|He let it go and told the whole village.|Together they carried away the rubbish.|Soon the clear water was full of fish again.'],
        ['Beneath the old bridge, the river [whispered|sparkled|flowed] past [smooth stones|tall reeds|fishing boats].', 'He [knelt beside the water|opened his net gently|looked up in surprise] and said, “I will help you.”', 'The water felt [icy on my fingers|silky and cool|cold as glass], and frogs [croaked|sang|called] in the reeds.', 'Since people kept throwing rubbish, the river grew [dark|thin|sick] and the fish [disappeared|died|left].', 'Now the river runs clear, and nobody in the village ever [forgets|ignores|harms] it.']),
      W('Mission To Mars', '🪐', '👩‍🚀 calm commander|🤖 joking robot|👽 Martian child', '🪐 a red desert|🛰️ a tiny space station|🕳️ a Martian cave', '💨 the oxygen tank began to leak|🛰️ the radio signal was lost|🌪️ a dust storm buried the rover',
        ['Red Planet', '🚀 🪐 🌪️ 👽 🌍', 'Commander Isha landed safely on Mars.|Two days later, a dust storm buried the rover.|She followed a strange light into a cave.|A Martian child helped her dig the rover out.|Before leaving, she promised to come back.'],
        ['Slowly, the rocket [lifted off|rose above the clouds|left the ground], and Earth became a [tiny blue dot|distant marble|fading star].', 'The commander [stayed calm|checked the dials|spoke softly] and said, “We have a plan.”', 'Red dust [covered my visor|swirled around my boots|hung in the air], and all I could hear was my own [breathing|heartbeat|radio].', 'Because the oxygen was [leaking|running out|nearly gone], we had less than an hour.', 'As Earth grew bigger in the window, I understood how [precious|beautiful|fragile] our home really is.'])
    ]
  }
};

// Word lists Story Coach listens for
const ST_LEX = {
  senses: {
    see: 'see saw look looked looking bright shiny dark golden colourful colorful sparkling sparkled glowing glowed gleamed red blue green yellow orange pink purple black white grey gray silver shadow twinkling shining',
    hear: 'hear heard listen listened loud quiet silent silence noise noisy whisper whispered roar roared howled crash bang boom buzz buzzed splash creak creaked creaking pitter-patter ticking sang singing shouted screamed echoed chirp beep rumble rumbled',
    smell: 'smell smelled smells smelt stink stinky stinking fragrant perfume smoke smoky scent',
    touch: 'soft rough cold hot warm cool wet sticky smooth sharp prickly icy freezing burning silky bumpy crunchy slippery fluffy furry heavy',
    taste: 'taste tasted tastes sweet sour salty bitter spicy yummy delicious juicy'
  },
  feelings: 'happy sad angry scared afraid excited proud worried brave shy nervous surprised lonely tired sleepy glad cheerful grateful relieved curious frightened delighted upset calm safe',
  order: ['first', 'then', 'next', 'after', 'later', 'last', 'finally', 'soon', 'before', 'when', 'once', 'afterwards', 'meanwhile'],
  problem: ['but', 'suddenly', 'oh no', 'unfortunately', 'without warning', 'lost', 'broke', 'broken', 'stuck', 'trapped', 'trouble', 'could not', 'couldn’t', 'although'],
  ending: ['finally', 'at last', 'in the end', 'from that day', 'happily', 'home', 'smiled', 'hugged', 'learned', 'realised', 'realized', 'safe', 'cheered', 'the end'],
  linkers: ['because', 'so', 'but', 'when', 'while', 'although', 'since', 'if', 'until', 'after', 'before'],
  dialogue: ['said', 'asked', 'shouted', 'whispered', 'replied', 'yelled', 'muttered'],
  swaps: {
    nice: 'lovely, kind, wonderful', good: 'wonderful, amazing, excellent', bad: 'terrible, awful, horrible', big: 'huge, enormous, giant',
    small: 'tiny, little, teeny', said: 'whispered, shouted, replied', went: 'raced, tiptoed, marched', got: 'found, grabbed, received',
    very: 'extremely, really (or pick a stronger word)', happy: 'delighted, cheerful, overjoyed', sad: 'miserable, upset, heartbroken', scary: 'terrifying, spooky, chilling'
  }
};

// "Which sentence paints a better picture?" for the weekend quiz: [plain, vivid]
const ST_BETTER = [
  ['The dog ran.', 'The muddy dog raced across the garden.'],
  ['It was raining.', 'Heavy rain drummed on the tin roof.'],
  ['The cake was good.', 'The warm cake tasted sweet and soft.'],
  ['He was scared.', 'His hands shook and his heart thumped.'],
  ['The room was dark.', 'Shadows crept across the silent room.'],
  ['She was happy.', 'She jumped up and clapped her hands.'],
  ['The bird sang.', 'A tiny bird sang from the mango tree.'],
  ['The wind blew.', 'The cold wind howled through the trees.'],
  ['The sea was big.', 'The endless blue sea sparkled in the sun.'],
  ['We went home.', 'Tired and smiling, we walked slowly home.'],
  ['The food smelled nice.', 'The smell of hot samosas filled the air.'],
  ['The boy was angry.', 'The boy stamped his foot and folded his arms.']
];

// Parse a Power Sentence into its words, frame and swap slots (done once at load)
(function expandStorySpark() {
  Object.values(ST_LEVELS).forEach(level => {
    level.weeks.forEach((week, wi) => {
      week.index = wi;
      week.sentences = week.sentences.map((raw, day) => {
        const slots = [];
        const clean = (o) => o.replace(/^[^\s\p{L}]+\s+/u, '').trim();
        const text = raw.replace(/\[([^\]]+)\]/g, (_, group) => {
          const options = group.split('|').map(o => ({ label: o.trim(), text: clean(o) }));
          slots.push(options);
          return options[0].text;
        });
        const parts = raw.split(/\[[^\]]+\]/);
        return { id: `${level.id}-${wi}-${day}`, raw, text, parts, slots, level: level.id, week: wi, day };
      });
    });
    level.allSentences = level.weeks.flatMap(w => w.sentences);
  });
})();
