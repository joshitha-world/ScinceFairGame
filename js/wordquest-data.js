// Word Quest content: one learning track per age group, 12 themed weeks each, 5 words a week
// (Monday to Friday). Each week ends with a weekend quiz and a collectible sticker.
//
// Word format: 'word|emoji|part of speech|meaning|example sentence|synonym|opposite|rhyme'
// The example sentence must contain the word itself (it becomes the fill-the-blank puzzle).
// Leave a field empty when it doesn't apply. To add more weeks, append to a track's weeks list.

const WQ_TRACKS = {
  tiny: {
    id: 'tiny', icon: '🐣', label: 'Tiny Words', who: 'KG · ages 4–6', color: '#f97316',
    blurb: 'Two- and three-letter words with pictures, sounds and tracing.',
    weeks: [
      { title: 'Hello Words', sticker: '👋', words: [
        'hi|👋||A happy word to greet someone.|Hi, Mom!|||my',
        'up|⬆️||Toward the sky.|Look up at the sky!|||pup',
        'go|🟢||To move away from here.|We go to school.|||no',
        'no|🙅||The opposite of yes.|No, thank you!|||go',
        'me|🙋||The word for yourself.|Pick me, pick me!|||we'] },
      { title: 'Little Words', sticker: '🐞', words: [
        'in|📦||Inside something.|The toy is in the box.|||pin',
        'on|🛏️||Sitting on top of something.|The cat is on the bed.|||',
        'we|👫||You and me together.|We like to play.|||me',
        'it|🎁||A word for a thing.|I love it!|||sit',
        'ox|🐂||A big, strong farm animal.|The ox pulls the cart.|||box'] },
      { title: 'Short A', sticker: '🐱', words: [
        'cat|🐱||A furry pet that says meow.|The cat sat on a mat.|||hat',
        'hat|🎩||You wear it on your head.|Dad has a red hat.|||cat',
        'bat|🦇||An animal that flies at night.|The bat can fly in the dark.|||mat',
        'van|🚐||A big car that carries many people.|We sat in the van.|||fan',
        'map|🗺️||A picture that shows places.|Look at the map!|||cap'] },
      { title: 'Short A Fun', sticker: '🐜', words: [
        'ant|🐜||A tiny insect that works hard.|An ant is very small.|||pant',
        'pan|🍳||A flat pot for cooking.|Mom cooks eggs in a pan.|||van',
        'bag|👜||You carry things in it.|My bag has books.|||tag',
        'cap|🧢||A soft hat with a peak.|I wear a cap in the sun.|||map',
        'ram|🐏||A male sheep with curly horns.|The ram has big horns.|||jam'] },
      { title: 'Short E', sticker: '🐔', words: [
        'hen|🐔||A mother bird on a farm.|The hen lays an egg.|||ten',
        'bed|🛏️||Where you sleep at night.|I go to bed at night.|||red',
        'egg|🥚||A hen lays it.|I eat an egg.|||leg',
        'net|🥅||Used to catch a ball or fish.|The ball went in the net.|||wet',
        'jet|✈️||A very fast plane.|The jet flies high.|||net'] },
      { title: 'Short E Fun', sticker: '🕸️', words: [
        'red|🔴||The colour of a tomato.|The apple is red.|||bed',
        'ten|🔟||The number after nine.|I have ten toes.|||hen',
        'pen|🖊️||You write with it.|I write with a pen.|||ten',
        'web|🕸️||A spider makes it.|The spider spins a web.|||',
        'wet|💧||Covered in water.|My shoes are wet.|||pet'] },
      { title: 'Short I', sticker: '🐷', words: [
        'pig|🐷||A pink farm animal that says oink.|The pig rolls in mud.|||big',
        'six|6️⃣||The number after five.|I am six years old.|||mix',
        'pin|📌||A small sharp thing that holds paper.|Put a pin on the board.|||win',
        'fin|🦈||A fish swims with it.|The shark has a big fin.|||pin',
        'win|🏆||To come first.|I can win the race!|||fin'] },
      { title: 'Short O', sticker: '🦊', words: [
        'dog|🐶||A pet that barks.|The dog wags its tail.|||log',
        'box|📦||You keep things in it.|The gift is in a box.|||fox',
        'fox|🦊||A wild animal with a bushy tail.|The fox is red.|||box',
        'pot|🍲||You cook food in it.|Soup is in the pot.|||hot',
        'log|🪵||A big piece of a tree.|The frog sits on a log.|||dog'] },
      { title: 'Short U', sticker: '☀️', words: [
        'sun|☀️||It shines in the sky in the day.|The sun is hot.|||run',
        'bus|🚌||A big vehicle that takes us to school.|I go to school by bus.|||us',
        'cup|☕||You drink from it.|Milk is in my cup.|||pup',
        'bug|🐛||A tiny crawling creature.|A bug is on the leaf.|||hug',
        'nut|🥜||A seed with a hard shell.|The squirrel eats a nut.|||cut'] },
      { title: 'Short U Fun', sticker: '🐻', words: [
        'tub|🛁||You take a bath in it.|The duck is in the tub.|||cub',
        'hug|🤗||Holding someone close with love.|Give me a hug!|||bug',
        'cub|🐻||A baby bear or lion.|The cub plays with its mom.|||tub',
        'run|🏃||To move very fast on your feet.|I can run fast.|||sun',
        'bud|🌱||A flower before it opens.|The bud will be a rose.|||mud'] },
      { title: 'Animal Friends', sticker: '🦉', words: [
        'cow|🐄||A farm animal that gives milk.|The cow says moo.|||now',
        'owl|🦉||A bird that hoots at night.|The owl is awake at night.|||',
        'bee|🐝||An insect that makes honey.|The bee buzzes.|||see',
        'pup|🐕||A baby dog.|The pup is so cute.|||cup',
        'rat|🐀||A small animal with a long tail.|The rat ran fast.|||cat'] },
      { title: 'My Body', sticker: '💪', words: [
        'eye|👁️||You see with it.|I shut one eye.|||',
        'ear|👂||You hear with it.|I hear with my ear.|||near',
        'arm|💪||It joins your hand to your body.|I lift my arm up.|||farm',
        'leg|🦵||You walk with it.|I hop on one leg.|||egg',
        'lip|👄||The soft edge of your mouth.|I put my finger on my lip.|||hip'] }
    ]
  },

  sprout: {
    id: 'sprout', icon: '🌱', label: 'Word Sprouts', who: 'Grades 1–2', color: '#16a34a',
    blurb: 'Everyday words with pictures, spelling and opposites.',
    weeks: [
      { title: 'Feelings', sticker: '😊', words: [
        'happy|😊|adjective|Feeling good and full of joy.|I feel happy when I play.|glad|sad|',
        'sad|😢|adjective|Feeling unhappy.|I was sad when my toy broke.|unhappy|happy|',
        'angry|😠|adjective|Feeling very cross.|The angry boy stamped his foot.|cross|calm|',
        'scared|😨|adjective|Feeling afraid.|The kitten was scared of the thunder.|afraid|brave|',
        'calm|😌|adjective|Quiet and peaceful.|Take a deep breath and stay calm.|peaceful|angry|'] },
      { title: 'Weather', sticker: '⛅', words: [
        'rain|🌧️|noun|Water that falls from the clouds.|The rain made puddles.|shower||train',
        'wind|🌬️|noun|Moving air you can feel.|The wind blew my hat away.|breeze||',
        'snow|❄️|noun|Soft white ice that falls when it is very cold.|We made a snowman out of snow.|||glow',
        'cloud|☁️|noun|A white or grey shape floating in the sky.|A big cloud covered the sun.|||loud',
        'storm|⛈️|noun|Bad weather with strong wind and rain.|The storm had loud thunder.|||'] },
      { title: 'Action Words', sticker: '🏃', words: [
        'jump|🦘|verb|To push off the ground with your legs.|I can jump over the rope.|hop||bump',
        'clap|👏|verb|To hit your hands together.|We clap at the end of the song.|||tap',
        'swim|🏊|verb|To move through water.|Fish swim in the pond.|||',
        'climb|🧗|verb|To go up using your hands and feet.|The monkey can climb the tree.|||',
        'kick|⚽|verb|To hit something with your foot.|Kick the ball into the goal.|||pick'] },
      { title: 'Opposites', sticker: '🐢', words: [
        'tall|🦒|adjective|Very high from bottom to top.|The giraffe is very tall.|high|short|ball',
        'fast|🐆|adjective|Moving very quickly.|The cheetah is very fast.|quick|slow|last',
        'slow|🐢|adjective|Not quick.|The tortoise is slow.||fast|grow',
        'hot|🔥|adjective|Very warm.|The tea is too hot to drink.|warm|cold|pot',
        'cold|🥶|adjective|Not warm at all.|Ice cream is cold.|chilly|hot|gold'] },
      { title: 'Yummy Food', sticker: '🍎', words: [
        'apple|🍎|noun|A round red or green fruit.|I eat an apple every day.|||',
        'bread|🍞|noun|Food made from flour and baked.|Mom made bread for breakfast.|||',
        'juice|🧃|noun|A drink made from fruit.|Orange juice is my favourite drink.|||',
        'rice|🍚|noun|Small white grains we cook and eat.|We eat rice and dal for lunch.|||mice',
        'milk|🥛|noun|A white drink that comes from cows.|Milk makes my bones strong.|||silk'] },
      { title: 'My Home', sticker: '🏠', words: [
        'door|🚪|noun|You open it to go in or out.|Please shut the door.|||floor',
        'chair|🪑|noun|A seat with a back.|Sit on the chair.|seat||hair',
        'clock|⏰|noun|It shows the time.|The clock says it is eight.|||sock',
        'lamp|💡|noun|It gives light in a room.|Switch on the lamp to read.|light||camp',
        'sofa|🛋️|noun|A long soft seat for many people.|We sit on the sofa to watch TV.|couch||'] },
      { title: 'Nature', sticker: '🌳', words: [
        'tree|🌳|noun|A tall plant with a trunk and leaves.|Birds live in the tree.|||bee',
        'leaf|🍃|noun|A flat green part of a plant.|A leaf fell from the tree.|||',
        'rock|🪨|noun|A hard piece of stone.|I sat on a big rock.|stone||sock',
        'river|🏞️|noun|A long stream of flowing water.|Ducks swim in the river.|stream||',
        'seed|🌰|noun|A plant grows from it.|I planted a seed in a pot.|||feed'] },
      { title: 'Under the Sea', sticker: '🐠', words: [
        'fish|🐟|noun|An animal that lives and swims in water.|The fish has shiny scales.|||dish',
        'crab|🦀|noun|A sea animal that walks sideways.|The crab has two big claws.|||',
        'shell|🐚|noun|A hard cover some sea animals live in.|I found a shell on the beach.|||bell',
        'whale|🐋|noun|The biggest animal in the sea.|A whale is bigger than a bus.|||tail',
        'wave|🌊|noun|Water that moves up and down in the sea.|A big wave splashed us.|||cave'] },
      { title: 'At School', sticker: '🏫', words: [
        'book|📖|noun|Pages with words and pictures to read.|I read a book every night.|||cook',
        'pencil|✏️|noun|You write and draw with it.|My pencil needs sharpening.|||',
        'teacher|🧑‍🏫|noun|A person who helps you learn.|My teacher reads us stories.|||',
        'bell|🔔|noun|It rings to make a sound.|The bell rings at lunch time.|||shell',
        'paint|🎨|verb|To put colour on something with a brush.|Let us paint a rainbow.|colour||'] },
      { title: 'Describing Words', sticker: '✨', words: [
        'shiny|✨|adjective|Bright and sparkling.|My new shoes are shiny.|bright|dull|',
        'soft|🧸|adjective|Nice and gentle to touch.|My teddy is soft.|smooth|hard|',
        'loud|📢|adjective|Making a big noise.|The drum is very loud.|noisy|quiet|cloud',
        'tiny|🐜|adjective|Very, very small.|An ant is tiny.|little|huge|',
        'round|⚽|adjective|Shaped like a circle or a ball.|The ball is round.|||sound'] },
      { title: 'Into Space', sticker: '🚀', words: [
        'moon|🌙|noun|It shines in the sky at night.|The moon is bright tonight.|||spoon',
        'star|⭐|noun|A tiny twinkling light in the night sky.|I wished on a star.|||car',
        'planet|🪐|noun|A big round world that moves around the sun.|We live on planet Earth.|||',
        'rocket|🚀|noun|A machine that flies into space.|The rocket zoomed into space.|||pocket',
        'sky|🌌|noun|The space above us where clouds float.|The sky is blue today.|||fly'] },
      { title: 'Kind Words', sticker: '💖', words: [
        'kind|💖|adjective|Nice and caring to others.|It is kind to share your toys.|nice|mean|find',
        'share|🤝|verb|To let others use what you have.|I share my crayons with my friend.|||care',
        'help|🙋|verb|To make things easier for someone.|I help Dad wash the car.|||',
        'please|🙏|word|A magic word for asking nicely.|Can I have some water, please?|||',
        'friend|👫|noun|Someone you like and play with.|My friend and I play every day.|pal||'] }
    ]
  },

  explorer: {
    id: 'explorer', icon: '🚀', label: 'Word Explorers', who: 'Grades 3–5', color: '#2563eb',
    blurb: 'Interesting words, meanings, synonyms and your own sentences.',
    weeks: [
      { title: 'Brave Hearts', sticker: '🦁', words: [
        'brave|🦁|adjective|Ready to face danger or pain without fear.|The brave firefighter saved the kitten.|fearless|cowardly|',
        'curious|🧐|adjective|Eager to know or learn something.|The curious girl asked many questions.|inquisitive|uninterested|',
        'gentle|🕊️|adjective|Kind, calm and soft.|Be gentle with the baby bird.|tender|rough|',
        'honest|😇|adjective|Always telling the truth.|An honest boy returned the lost wallet.|truthful|dishonest|',
        'patient|⏳|adjective|Able to wait calmly without getting upset.|Be patient while the cake bakes.|calm|impatient|'] },
      { title: 'Big and Small', sticker: '🐘', words: [
        'enormous|🐘|adjective|Very, very big.|An elephant is an enormous animal.|huge|tiny|',
        'miniature|🧸|adjective|A very small copy of something.|She has a miniature train set.|small|giant|',
        'vast|🌌|adjective|Extremely wide and large.|The desert is vast and empty.|immense|small|',
        'narrow|🛤️|adjective|Not wide; with little space from side to side.|The path was too narrow for a car.|thin|wide|',
        'heavy|🏋️|adjective|Weighing a lot; hard to lift.|This box of books is heavy.|weighty|light|'] },
      { title: 'On the Move', sticker: '🏃', words: [
        'dash|💨|verb|To run somewhere very quickly.|I had to dash to catch the bus.|rush|stroll|',
        'wander|🚶|verb|To walk around slowly with no plan.|We like to wander in the park.|roam|hurry|',
        'creep|🐈|verb|To move slowly and quietly.|The cat began to creep towards the bird.|sneak|stomp|',
        'soar|🦅|verb|To fly high in the sky.|Eagles soar above the mountains.|glide|sink|',
        'tumble|🤸|verb|To fall over and roll.|The puppy took a tumble down the hill.|topple||'] },
      { title: 'Weather Watch', sticker: '🌦️', words: [
        'drizzle|🌦️|noun|Very light rain in tiny drops.|A drizzle started as we left school.|sprinkle|downpour|',
        'breeze|🍃|noun|A light, gentle wind.|A cool breeze came from the sea.|wind|gale|',
        'scorching|🔥|adjective|Extremely hot.|It was a scorching day in May.|blazing|freezing|',
        'frosty|❄️|adjective|Very cold, with ice on the ground.|The grass was frosty in the morning.|icy|warm|',
        'gloomy|🌫️|adjective|Dark and grey; not bright.|The sky looked gloomy before the storm.|dull|bright|'] },
      { title: 'Super Sounds', sticker: '🔔', words: [
        'whisper|🤫|verb|To speak very softly.|Please whisper in the library.|murmur|shout|',
        'giggle|🤭|verb|To laugh in a silly, quiet way.|The joke made us giggle.|chuckle||',
        'rumble|🌋|verb|To make a deep, rolling sound.|My tummy began to rumble at lunch time.|roll||',
        'chirp|🐦|verb|The short, high sound a bird makes.|Birds chirp in the morning.|tweet||',
        'roar|🦁|verb|To make a loud, deep sound.|The lion let out a mighty roar.|bellow|whisper|'] },
      { title: 'Super Senses', sticker: '👀', words: [
        'glimpse|👀|noun|A very quick look.|I caught a glimpse of the rainbow.|peek|stare|',
        'fragrant|🌸|adjective|Having a sweet, pleasant smell.|The jasmine flowers are fragrant.|sweet-smelling|smelly|',
        'crunchy|🥕|adjective|Making a loud noise when you bite it.|Carrots are crunchy and fresh.|crisp|soggy|',
        'soggy|🥣|adjective|Very wet and soft.|My cereal went soggy in the milk.|mushy|dry|',
        'smooth|🪨|adjective|Flat and even, with no bumps.|The river stone was smooth.|even|rough|'] },
      { title: 'Thinking Words', sticker: '💭', words: [
        'imagine|💭|verb|To make a picture in your mind.|Imagine you can fly like a bird.|picture||',
        'discover|🔍|verb|To find something for the first time.|They hope to discover a new planet.|find|lose|',
        'decide|🤔|verb|To make up your mind.|I could not decide which book to read.|choose||',
        'remember|🧠|verb|To keep something in your mind.|Remember to bring your water bottle.|recall|forget|',
        'explain|🗣️|verb|To make something clear and easy to understand.|Can you explain how rain forms?|describe||'] },
      { title: 'Wild World', sticker: '🌿', words: [
        'habitat|🌿|noun|The natural home of an animal or plant.|The forest is the tiger\'s habitat.|home||',
        'blossom|🌸|noun|A flower on a tree or plant.|The mango tree is full of blossom.|bloom||',
        'harvest|🌾|noun|The time when crops are gathered.|Farmers celebrate the harvest.|crop||',
        'burrow|🐇|noun|A hole in the ground where an animal lives.|The rabbit hid in its burrow.|tunnel||',
        'shelter|⛺|noun|A place that keeps you safe from weather or danger.|We found shelter from the rain.|cover||'] },
      { title: 'How People Act', sticker: '😇', words: [
        'generous|🎁|adjective|Happy to give and share.|My generous aunt gave us all gifts.|giving|selfish|',
        'polite|🙇|adjective|Having good manners.|It is polite to say thank you.|courteous|rude|',
        'cheerful|😄|adjective|Happy and full of smiles.|Our cheerful neighbour always waves.|jolly|grumpy|',
        'grumpy|😤|adjective|In a bad mood.|Grandpa is grumpy before his tea.|cranky|cheerful|',
        'clumsy|🤕|adjective|Often dropping or bumping into things.|The clumsy waiter dropped a plate.|awkward|graceful|'] },
      { title: 'Story Time', sticker: '📚', words: [
        'adventure|🗺️|noun|An exciting journey or experience.|The trip to the jungle was a real adventure.|quest||',
        'mystery|🕵️|noun|Something strange that is hard to explain.|Who ate the cake is still a mystery.|puzzle||',
        'treasure|💰|noun|Gold, jewels or other precious things.|The pirates buried their treasure.|riches||',
        'legend|🐉|noun|An old, famous story from long ago.|The legend tells of a golden deer.|myth||',
        'rescue|🚒|verb|To save someone from danger.|The lifeguard swam to rescue the swimmer.|save|abandon|'] },
      { title: 'Time Travellers', sticker: '⏰', words: [
        'ancient|🏛️|adjective|Very, very old.|We visited an ancient temple.|old|modern|',
        'modern|📱|adjective|New and up to date.|The new school has modern classrooms.|new|ancient|',
        'sudden|⚡|adjective|Happening quickly with no warning.|A sudden noise made me jump.|unexpected|gradual|',
        'rapid|🐆|adjective|Very fast.|The river has a rapid current.|quick|slow|',
        'seldom|🌗|adverb|Not often.|We seldom see snow in Hyderabad.|rarely|often|'] },
      { title: 'Super Doers', sticker: '💪', words: [
        'attempt|🎯|verb|To try to do something.|I will attempt the hard puzzle.|try|quit|',
        'achieve|🏆|verb|To do something well after hard work.|You can achieve your goals if you practise.|accomplish|fail|',
        'protect|🛡️|verb|To keep someone or something safe.|Helmets protect our heads.|guard|harm|',
        'gather|🧺|verb|To bring things together in one place.|Let us gather the leaves into a pile.|collect|scatter|',
        'observe|🔭|verb|To watch something carefully.|Scientists observe the stars at night.|watch|ignore|'] }
    ]
  },

  master: {
    id: 'master', icon: '🦉', label: 'Word Masters', who: 'Grades 6–8', color: '#7c3aed',
    blurb: 'Rich vocabulary, word families and writing practice.',
    weeks: [
      { title: 'Strong Character', sticker: '🦸', words: [
        'resilient|🌱|adjective|Able to recover quickly from difficulties.|The resilient team bounced back after losing.|tough|fragile|',
        'diligent|📝|adjective|Working hard and carefully.|A diligent student checks her work twice.|hardworking|lazy|',
        'humble|🙏|adjective|Not proud; not thinking you are better than others.|Despite winning, she stayed humble.|modest|arrogant|',
        'compassionate|💗|adjective|Feeling and showing care for others who suffer.|The compassionate nurse comforted the child.|caring|cruel|',
        'candid|🗨️|adjective|Honest and direct in what you say.|He gave a candid opinion about my essay.|frank|evasive|'] },
      { title: 'Paint a Picture', sticker: '🎨', words: [
        'vivid|🌈|adjective|Very bright and clear.|She described the festival in vivid detail.|bright|dull|',
        'cluttered|🧺|adjective|Messy and filled with too many things.|My desk is cluttered with old papers.|messy|tidy|',
        'immaculate|✨|adjective|Perfectly clean and neat.|Her uniform was immaculate on the first day.|spotless|filthy|',
        'serene|🏞️|adjective|Calm, peaceful and quiet.|The lake looked serene at sunrise.|tranquil|chaotic|',
        'chaotic|🌪️|adjective|In complete confusion and disorder.|The classroom was chaotic before the bell.|disorderly|orderly|'] },
      { title: 'Think Like a Scientist', sticker: '🔬', words: [
        'analyse|📊|verb|To examine something in detail to understand it.|We will analyse the results of the experiment.|examine||',
        'predict|🔮|verb|To say what will happen in the future.|Can you predict the ending of the story?|forecast||',
        'infer|🕵️|verb|To work something out from clues.|From the wet ground, we can infer it rained.|deduce||',
        'evaluate|⚖️|verb|To judge how good or useful something is.|Evaluate both answers before you choose.|assess||',
        'hypothesis|💡|noun|An idea you test to see if it is true.|Our hypothesis was that plants need light.|theory||'] },
      { title: 'Say It Well', sticker: '🗣️', words: [
        'persuade|🤝|verb|To make someone agree by giving good reasons.|She tried to persuade her parents to get a puppy.|convince|dissuade|',
        'exaggerate|🎣|verb|To make something sound bigger than it really is.|Don\'t exaggerate, the fish was not that big!|overstate|understate|',
        'mumble|😶|verb|To speak quietly and unclearly.|Speak up, please don\'t mumble.|mutter|articulate|',
        'declare|📣|verb|To say something firmly and officially.|The judge will declare the winner.|announce||',
        'insist|☝️|verb|To demand something firmly and not give up.|Mom will insist that we finish our homework.|demand||'] },
      { title: 'Shades of Feeling', sticker: '💭', words: [
        'anxious|😟|adjective|Worried and nervous.|I felt anxious before my exam.|nervous|relaxed|',
        'elated|🥳|adjective|Extremely happy and excited.|We were elated when our team won.|overjoyed|miserable|',
        'frustrated|😣|adjective|Upset because you cannot do something.|He was frustrated by the tricky puzzle.|annoyed|satisfied|',
        'content|😌|adjective|Happy and satisfied with what you have.|The cat looked content by the fire.|satisfied|discontented|',
        'nostalgic|📷|adjective|Thinking happily about the past.|Old photos make Grandma nostalgic.|wistful||'] },
      { title: 'How Much?', sticker: '📏', words: [
        'abundant|🍇|adjective|Existing in large amounts; more than enough.|Fruit is abundant in summer.|plentiful|scarce|',
        'scarce|🏜️|adjective|Hard to find; not enough.|Water is scarce in the desert.|rare|abundant|',
        'colossal|🗿|adjective|Extremely large.|A colossal statue stood at the gate.|gigantic|tiny|',
        'sufficient|✅|adjective|Enough for what is needed.|We have sufficient food for the trip.|adequate|insufficient|',
        'excessive|📦|adjective|Much more than is needed.|Excessive screen time can hurt your eyes.|extreme|moderate|'] },
      { title: 'Science Lab', sticker: '🧪', words: [
        'evaporate|♨️|verb|To change from a liquid into a gas.|Puddles evaporate in the sun.|vaporise|condense|',
        'transparent|🪟|adjective|Clear enough to see through.|Glass is transparent.|clear|opaque|',
        'fragile|🥚|adjective|Easily broken or damaged.|Handle the fragile vase with care.|delicate|sturdy|',
        'absorb|🧽|verb|To soak up a liquid.|A sponge can absorb a lot of water.|soak up|repel|',
        'durable|🧱|adjective|Able to last a long time without breaking.|These durable shoes lasted three years.|sturdy|flimsy|'] },
      { title: 'All Change', sticker: '🦋', words: [
        'transform|🦋|verb|To change completely.|A caterpillar will transform into a butterfly.|convert||',
        'adapt|🦎|verb|To change to suit a new situation.|Camels adapt to life in the desert.|adjust||',
        'decline|📉|verb|To become less or worse.|The number of tigers began to decline.|decrease|increase|',
        'expand|🎈|verb|To become bigger.|A balloon will expand when you blow into it.|grow|shrink|',
        'restore|🛠️|verb|To bring something back to how it was.|Workers will restore the old fort.|repair|damage|'] },
      { title: 'Truth and Trust', sticker: '🤝', words: [
        'genuine|💎|adjective|Real and true, not fake.|This is a genuine diamond.|authentic|fake|',
        'reliable|⏰|adjective|Able to be trusted to do the right thing.|Our reliable bus is always on time.|dependable|unreliable|',
        'deceive|🎭|verb|To make someone believe something that is not true.|The fox tried to deceive the crow.|trick||',
        'sincere|💌|adjective|Honest and meaning what you say.|Please accept my sincere apology.|heartfelt|fake|',
        'loyal|🐕|adjective|Always supporting a friend or group.|A loyal friend sticks by you.|faithful|disloyal|'] },
      { title: 'Time and Order', sticker: '⏳', words: [
        'temporary|⛺|adjective|Lasting only for a short time.|The tent is a temporary home.|short-term|permanent|',
        'permanent|🗿|adjective|Lasting forever or for a very long time.|A permanent marker will not wash off.|lasting|temporary|',
        'frequent|🔁|adjective|Happening often.|We make frequent trips to the library.|regular|rare|',
        'previous|⏮️|adjective|Coming before this one.|The previous owner left a cat.|earlier|next|',
        'simultaneous|👯|adjective|Happening at the same time.|There were two simultaneous goals in the match.|concurrent||'] },
      { title: 'Get It Done', sticker: '🏆', words: [
        'accomplish|🏁|verb|To succeed in doing something.|We can accomplish a lot as a team.|achieve|fail|',
        'collaborate|🤝|verb|To work together with others.|The classes will collaborate on a play.|cooperate||',
        'initiative|🚀|noun|The ability to act without being told.|She showed initiative by cleaning up.|enterprise||',
        'procrastinate|🛋️|verb|To keep delaying something you should do.|Don\'t procrastinate, start your project today.|delay||',
        'prioritise|📋|verb|To decide what is most important and do it first.|Prioritise your homework before games.|rank||'] },
      { title: 'Storytellers', sticker: '✍️', words: [
        'narrate|📖|verb|To tell a story.|Grandpa loves to narrate tales of his village.|recount||',
        'summarise|📝|verb|To give the main points in a few words.|Summarise the chapter in three sentences.|sum up|expand|',
        'conclude|🔚|verb|To bring something to an end.|Let us conclude the meeting with a song.|finish|begin|',
        'dilemma|🤷|noun|A difficult choice between two options.|Choosing between the two gifts was a dilemma.|predicament||',
        'climax|🎢|noun|The most exciting part of a story.|The climax of the film was the race.|peak||'] }
    ]
  },

  champion: {
    id: 'champion', icon: '🧠', label: 'Word Champions', who: 'Grade 9+ & grown-ups', color: '#be123c',
    blurb: 'Advanced vocabulary to speak and write with power.',
    weeks: [
      { title: 'Rare Gems', sticker: '💎', words: [
        'ubiquitous|📱|adjective|Found everywhere.|Mobile phones are ubiquitous today.|omnipresent|rare|',
        'ephemeral|🫧|adjective|Lasting a very short time.|The beauty of a soap bubble is ephemeral.|fleeting|lasting|',
        'serendipity|🍀|noun|Finding something good by happy chance.|Meeting my best friend was pure serendipity.|luck||',
        'eloquent|🎙️|adjective|Speaking or writing beautifully and persuasively.|Her eloquent speech moved the audience.|articulate|inarticulate|',
        'pragmatic|🧰|adjective|Dealing with things in a sensible, practical way.|We need a pragmatic solution, not a dream.|practical|idealistic|'] },
      { title: 'Sharp Minds', sticker: '🧠', words: [
        'meticulous|🔎|adjective|Showing great attention to detail.|He keeps meticulous notes in class.|thorough|careless|',
        'astute|🦉|adjective|Quick to notice and understand things.|An astute reader spots the clue early.|shrewd|naive|',
        'inquisitive|❓|adjective|Eager to learn and ask questions.|Inquisitive children make great scientists.|curious|indifferent|',
        'perceptive|👁️|adjective|Good at noticing and understanding.|A perceptive teacher knew I was upset.|insightful|oblivious|',
        'rational|🧮|adjective|Based on clear thinking and reason.|Let us make a rational decision.|logical|irrational|'] },
      { title: 'The Power of Speech', sticker: '🎤', words: [
        'articulate|🗣️|adjective|Able to express ideas clearly.|She is an articulate debater.|eloquent|inarticulate|',
        'verbose|📜|adjective|Using more words than needed.|The verbose essay could be half as long.|wordy|concise|',
        'succinct|✂️|adjective|Brief and clearly expressed.|Give a succinct answer in one line.|concise|verbose|',
        'rhetoric|🏛️|noun|Language designed to persuade or impress.|The leader\'s rhetoric stirred the crowd.|oratory||',
        'euphemism|🌸|noun|A gentle word used instead of a harsh one.|"Passed away" is a euphemism for "died".|||'] },
      { title: 'Outlook', sticker: '😎', words: [
        'benevolent|🤲|adjective|Kind and wanting to help others.|A benevolent donor built the library.|charitable|malevolent|',
        'cynical|🙄|adjective|Believing people act only for selfish reasons.|He was cynical about the free offer.|sceptical|trusting|',
        'optimistic|🌅|adjective|Hopeful and confident about the future.|Stay optimistic, the results will be good.|hopeful|pessimistic|',
        'apathetic|😑|adjective|Showing no interest or concern.|Apathetic voters stayed at home.|indifferent|enthusiastic|',
        'tenacious|🧗|adjective|Holding on firmly; not giving up easily.|The tenacious climber reached the summit.|persistent|irresolute|'] },
      { title: 'Growth and Change', sticker: '🌱', words: [
        'catalyst|⚗️|noun|Something that causes an important change.|The new coach was a catalyst for success.|spark||',
        'stagnant|🪣|adjective|Not moving or growing; still and stale.|Mosquitoes breed in stagnant water.|still|flowing|',
        'flourish|🌻|verb|To grow or develop well.|Plants flourish in rich soil.|thrive|wither|',
        'revitalise|🔋|verb|To give new life and energy to.|A walk can revitalise a tired mind.|refresh|weaken|',
        'obsolete|📼|adjective|No longer used; out of date.|Video tapes are now obsolete.|outdated|current|'] },
      { title: 'People and Power', sticker: '🏛️', words: [
        'diplomatic|🕊️|adjective|Dealing with people tactfully.|She gave a diplomatic reply to avoid an argument.|tactful|tactless|',
        'autonomous|🤖|adjective|Able to act or govern independently.|Autonomous cars drive themselves.|independent|dependent|',
        'unanimous|✋|adjective|Agreed by everyone.|The vote was unanimous.|united|divided|',
        'hierarchy|🪜|noun|A system with levels of rank or importance.|The army has a strict hierarchy.|ranking||',
        'advocate|📢|verb|To publicly support an idea or cause.|Doctors advocate regular exercise.|support|oppose|'] },
      { title: 'Seeking Truth', sticker: '🔍', words: [
        'ambiguous|🌗|adjective|Having more than one possible meaning.|The ambiguous message confused everyone.|unclear|clear|',
        'plausible|🤔|adjective|Seeming reasonable or likely to be true.|His excuse sounded plausible.|believable|unlikely|',
        'verify|✅|verb|To check that something is true.|Always verify news before you share it.|confirm||',
        'fallacy|❌|noun|A mistaken belief or wrong argument.|It is a fallacy that goldfish forget in seconds.|myth|truth|',
        'objective|⚖️|adjective|Based on facts, not personal feelings.|A judge must stay objective.|impartial|biased|'] },
      { title: 'Deep Feelings', sticker: '🎭', words: [
        'melancholy|🌧️|noun|A deep, long-lasting sadness.|A quiet melancholy filled the empty house.|sorrow|joy|',
        'euphoria|🎉|noun|A feeling of intense happiness.|The win brought euphoria to the fans.|elation|despair|',
        'apprehensive|😬|adjective|Worried that something bad may happen.|I was apprehensive about the interview.|uneasy|confident|',
        'indifferent|😐|adjective|Not caring either way.|He seemed indifferent to the result.|unconcerned|eager|',
        'empathy|🫂|noun|Understanding and sharing the feelings of others.|Empathy helps us become better friends.|compassion|indifference|'] },
      { title: 'Taking Action', sticker: '⚡', words: [
        'alleviate|💊|verb|To make pain or a problem less severe.|Rest will alleviate your headache.|ease|worsen|',
        'mitigate|🧯|verb|To make something less harmful.|Trees help mitigate air pollution.|reduce|aggravate|',
        'scrutinise|🔬|verb|To examine very closely.|Editors scrutinise every sentence.|inspect|overlook|',
        'contemplate|🧘|verb|To think deeply about something.|She sat by the sea to contemplate life.|ponder||',
        'expedite|🚀|verb|To make something happen faster.|Online forms expedite the process.|hasten|delay|'] },
      { title: 'Measuring Quality', sticker: '⭐', words: [
        'impeccable|💯|adjective|Perfect, with no faults.|His manners are impeccable.|flawless|flawed|',
        'mediocre|😕|adjective|Only average; not very good.|The food was mediocre at best.|ordinary|excellent|',
        'exemplary|🏅|adjective|So good it is an example for others.|Her exemplary behaviour won an award.|model|poor|',
        'superfluous|➕|adjective|More than is needed; unnecessary.|Remove the superfluous words from your essay.|unnecessary|essential|',
        'versatile|🔧|adjective|Able to do many different things well.|A versatile player can play any position.|adaptable|limited|'] },
      { title: 'Our Planet', sticker: '🌍', words: [
        'sustainable|♻️|adjective|Able to continue without harming the environment.|Solar power is a sustainable energy source.|renewable||',
        'biodiversity|🦜|noun|The variety of plant and animal life in a place.|Rainforests have amazing biodiversity.|||',
        'arid|🏜️|adjective|Very dry, with little rain.|Cacti grow in arid regions.|dry|humid|',
        'deplete|🪫|verb|To use up the supply of something.|Overfishing can deplete the oceans.|exhaust|replenish|',
        'conserve|💧|verb|To protect something from being wasted.|Turn off taps to conserve water.|preserve|waste|'] },
      { title: 'Across Time', sticker: '⏳', words: [
        'chronological|📅|adjective|Arranged in the order things happened.|List the events in chronological order.|sequential||',
        'perpetual|♾️|adjective|Never ending or changing.|The city lives in perpetual traffic.|endless|temporary|',
        'imminent|⏱️|adjective|About to happen very soon.|Dark clouds warned of an imminent storm.|impending|distant|',
        'archaic|📜|adjective|Very old and no longer used.|"Thou" is an archaic word for "you".|ancient|modern|',
        'contemporary|🏙️|adjective|Belonging to the present time.|The museum shows contemporary art.|modern|archaic|'] }
    ]
  }
};

// Special stickers earned for habits, not quizzes. test(stats) decides when one is unlocked.
const WQ_BADGES = [
  { id: 'first-word', icon: '🌟', title: 'First Word', how: 'Learn your very first word', test: s => s.words >= 1 },
  { id: 'early-bird', icon: '🐦', title: 'Early Bird', how: 'Finish a word before 8 am', test: s => s.earlyBird },
  { id: 'streak-5', icon: '🔥', title: 'On Fire', how: 'Learn words 5 school days in a row', test: s => s.bestStreak >= 5 },
  { id: 'words-10', icon: '📚', title: 'Word Collector', how: 'Learn 10 words', test: s => s.words >= 10 },
  { id: 'perfect-week', icon: '🗓️', title: 'Perfect Week', how: 'All 5 words and the quiz in one week', test: s => s.perfectWeeks >= 1 },
  { id: 'gold', icon: '🥇', title: 'Gold Medal', how: 'Score Gold in a weekend quiz', test: s => s.golds >= 1 },
  { id: 'writer', icon: '✍️', title: 'Young Writer', how: 'Write 5 of your own sentences', test: s => s.sentences >= 5 },
  { id: 'paper', icon: '🖨️', title: 'Paper Champ', how: 'Print 5 worksheets for your notebook', test: s => s.printed >= 5 },
  { id: 'streak-10', icon: '⚡', title: 'Unstoppable', how: 'Learn words 10 school days in a row', test: s => s.bestStreak >= 10 },
  { id: 'words-25', icon: '🎒', title: 'Word Explorer', how: 'Learn 25 words', test: s => s.words >= 25 },
  { id: 'words-50', icon: '🏅', title: 'Word Wizard', how: 'Learn 50 words', test: s => s.words >= 50 },
  { id: 'words-100', icon: '👑', title: 'Word Royalty', how: 'Learn 100 words', test: s => s.words >= 100 }
];

const WQ_AVATARS = ['🦁', '🐯', '🐼', '🦊', '🐨', '🐸', '🐵', '🦄', '🐙', '🦋', '🐢', '🦉', '🐬', '🐝', '🦖', '🐧'];

const WQ_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WQ_TIERS = [
  null,
  { id: 1, name: 'Bronze', stars: 1 },
  { id: 2, name: 'Silver', stars: 2 },
  { id: 3, name: 'Gold', stars: 3 }
];

// Expand the compact strings once, so the rest of the app works with plain objects
(function expandWordQuest() {
  const keys = ['w', 'e', 'pos', 'm', 's', 'syn', 'ant', 'rhyme'];
  Object.values(WQ_TRACKS).forEach(track => {
    track.weeks.forEach((week, wi) => {
      week.index = wi;
      week.words = week.words.map((line, di) => {
        const parts = line.split('|');
        const o = {};
        keys.forEach((k, i) => { o[k] = (parts[i] || '').trim(); });
        o.track = track.id;
        o.week = wi;
        o.day = di;
        return o;
      });
    });
    track.allWords = track.weeks.flatMap(w => w.words);
  });
})();
