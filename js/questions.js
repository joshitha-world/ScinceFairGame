// Scientific Question Bank for Educational Science Fair
// Covers Physics, Chemistry, Biology, Astronomy, and Earth Science

const SYNONYM_QUESTIONS = [
  {
    id: "syn_precip",
    term: "Precipitation",
    category: "Earth Science",
    tagline: "Atmospheric moisture falling to Earth's surface",
    illustration: "precipitation",
    correct: "Rainfall & Hydrometeors",
    options: [
      "Rainfall & Hydrometeors",
      "Thermal Evaporation",
      "Subsurface Permeation",
      "Atmospheric Condensation"
    ],
    explanation: "Precipitation in meteorology is any product of atmospheric water vapor condensation that falls under gravity (rain, drizzle, snow, hail, or sleet)."
  },
  {
    id: "syn_velocity",
    term: "Velocity",
    category: "Physics",
    tagline: "Motion in a specified directional vector",
    illustration: "velocity",
    correct: "Directed Speed",
    options: [
      "Directed Speed",
      "Constant Acceleration",
      "Centrifugal Momentum",
      "Kinetic Friction"
    ],
    explanation: "Velocity is the vector equivalent of speed; it specifies both the rate of change of position and the specific direction of travel."
  },
  {
    id: "syn_photosynth",
    term: "Photosynthesis",
    category: "Biology",
    tagline: "Plants converting radiant energy into chemical bonds",
    illustration: "photosynthesis",
    correct: "Solar Carbon Fixation",
    options: [
      "Solar Carbon Fixation",
      "Mitochondrial Respiration",
      "Anaerobic Fermentation",
      "Hydrothermal Chemosynthesis"
    ],
    explanation: "Photosynthesis fixes inorganic carbon dioxide into organic carbohydrates using photons captured by chlorophyll pigments."
  },
  {
    id: "syn_density",
    term: "Density",
    category: "Physics",
    tagline: "Degree of compactness of substance in space",
    illustration: "density",
    correct: "Mass-to-Volume Ratio",
    options: [
      "Mass-to-Volume Ratio",
      "Gravitational Weight",
      "Tensile Elasticity",
      "Dynamic Viscosity"
    ],
    explanation: "Density (ρ = m/V) quantifies how tightly matter is packed within a unit volume of space."
  },
  {
    id: "syn_thermal",
    term: "Thermal Energy",
    category: "Physics",
    tagline: "Internal kinetic energy of vibrating atoms",
    illustration: "thermal_energy",
    correct: "Heat Energy",
    options: [
      "Heat Energy",
      "Potential Voltage",
      "Nuclear Binding Force",
      "Radiant Luminescence"
    ],
    explanation: "Thermal energy is the microscopic total kinetic energy possessed by constituent atoms and molecules in thermal agitation."
  },
  {
    id: "syn_osmosis",
    term: "Osmosis",
    category: "Biology / Chemistry",
    tagline: "Water diffusion across semipermeable barriers",
    illustration: "osmosis",
    correct: "Solvent Membrane Diffusion",
    options: [
      "Solvent Membrane Diffusion",
      "Active Ion Pumping",
      "Turbulent Fluid Convection",
      "Electrostatic Precipitation"
    ],
    explanation: "Osmosis is the net spontaneous movement of solvent molecules through a selectively permeable membrane toward higher solute concentration."
  },
  {
    id: "syn_combustion",
    term: "Combustion",
    category: "Chemistry",
    tagline: "High-temperature exothermic redox reaction",
    illustration: "combustion",
    correct: "Rapid Oxidation (Burning)",
    options: [
      "Rapid Oxidation (Burning)",
      "Endothermic Dissolution",
      "Catalytic Polymerization",
      "Sublimation Phase Transition"
    ],
    explanation: "Combustion is a rapid exothermic reaction between a fuel and an oxidant (usually oxygen) releasing heat, light, and reaction gases."
  },
  {
    id: "syn_inertia",
    term: "Inertia",
    category: "Physics",
    tagline: "Resistance of any physical object to any change in its velocity",
    illustration: "inertia",
    correct: "Resistance to Acceleration",
    options: [
      "Resistance to Acceleration",
      "Centripetal Propulsion",
      "Frictional Drag",
      "Thermodynamic Entropy"
    ],
    explanation: "Newton's First Law defines inertia as an object's innate tendency to resist changes in its state of rest or uniform motion."
  },
  {
    id: "syn_biodiversity",
    term: "Biodiversity",
    category: "Ecology",
    tagline: "The richness and variety of life within an ecosystem",
    illustration: "biodiversity",
    correct: "Biological Variety",
    options: [
      "Biological Variety",
      "Genetic Homogeneity",
      "Trophic Depletion",
      "Monoculture Farming"
    ],
    explanation: "Biodiversity encompasses the variety of living organisms across all levels: genetic variance, species diversity, and ecosystem richness."
  },
  {
    id: "syn_refraction",
    term: "Refraction",
    category: "Optics / Physics",
    tagline: "Deflection of a wave traveling from one medium into another",
    illustration: "refraction_syn",
    correct: "Wave Ray Bending",
    options: [
      "Wave Ray Bending",
      "Mirror Reflection",
      "Diffraction Grating",
      "Polarized Filtering"
    ],
    explanation: "Refraction is the change in transmission direction of a wave due to change in its phase velocity between different media."
  },
  {
    id: "syn_evaporation",
    term: "Evaporation",
    category: "Chemistry / Earth Science",
    tagline: "Transition of liquid phase surface particles into vapor",
    illustration: "evaporation",
    correct: "Surface Vaporization",
    options: [
      "Surface Vaporization",
      "Frost Deposition",
      "Liquid Solidification",
      "Gas Condensation"
    ],
    explanation: "Evaporation is a type of vaporization that occurs on the liquid surface as energetic molecules overcome intermolecular attraction."
  },
  {
    id: "syn_gravity",
    term: "Gravitation",
    category: "Astrophysics",
    tagline: "Universal attractive force proportional to masses",
    illustration: "gravity",
    correct: "Mutual Mass Attraction",
    options: [
      "Mutual Mass Attraction",
      "Electrostatic Repulsion",
      "Weak Nuclear Decay",
      "Surface Tension Cohesion"
    ],
    explanation: "Gravitation is the universal fundamental interaction causing all bodies possessing mass or energy to attract one another."
  }
];

const PHENOMENON_QUESTIONS = [
  {
    id: "phenom_eclipse",
    title: "Solar Eclipse",
    category: "Astronomy",
    animationType: "solar_eclipse",
    hint: "Celestial shadow alignment blocking sunlight",
    correct: "Solar Eclipse",
    options: [
      "Solar Eclipse",
      "Aurora Borealis",
      "Lunar Libration",
      "Sunspot Flare"
    ],
    explanation: "A Solar Eclipse occurs when the Moon passes directly between Earth and the Sun, casting its umbra shadow onto Earth's surface and revealing the solar corona."
  },
  {
    id: "phenom_refraction",
    title: "Prism Dispersion & Refraction",
    category: "Optics / Physics",
    animationType: "refraction",
    hint: "White light splitting into spectral wavelengths",
    correct: "Chromatic Dispersion",
    options: [
      "Chromatic Dispersion",
      "Photoelectric Emission",
      "Total Internal Reflection",
      "Rayleigh Scattering"
    ],
    explanation: "Different wavelengths of light travel at different speeds through glass, bending at distinct angles (refraction) to reveal the visible rainbow spectrum."
  },
  {
    id: "phenom_photosynthesis",
    title: "Chloroplast Photosynthesis",
    category: "Biology",
    animationType: "photosynthesis",
    hint: "Photon absorption converting CO2 & H2O into sugar and O2",
    correct: "Photosynthesis",
    options: [
      "Photosynthesis",
      "Cellular Respiration",
      "Transpiration Pull",
      "Nitrogen Fixation"
    ],
    explanation: "Inside plant chloroplasts, photon energy excites chlorophyll electrons to convert carbon dioxide and water into glucose and oxygen."
  },
  {
    id: "phenom_volcano",
    title: "Volcanic Eruption",
    category: "Geology / Earth Science",
    animationType: "volcano",
    hint: "Magma and pyroclastic plume breaching Earth's crust",
    correct: "Volcanic Eruption",
    options: [
      "Volcanic Eruption",
      "Tectonic Subduction",
      "Geothermal Glaciation",
      "Meteorite Impact"
    ],
    explanation: "Buoyant molten rock (magma) and dissolved gases rise from magma chambers, shattering through crust vents to eject lava, tephra, and ash."
  },
  {
    id: "phenom_dna",
    title: "DNA Double Helix",
    category: "Genetics / Molecular Biology",
    animationType: "dna_helix",
    hint: "Rotating dual-stranded antiparallel helical polymer",
    correct: "DNA Double Helix Structure",
    options: [
      "DNA Double Helix Structure",
      "Ribosome Protein Translation",
      "Lipid Bilayer Membrane",
      "Alpha Keratin Filament"
    ],
    explanation: "DNA consists of two polynucleotide strands winding around a central axis, held together by complementary hydrogen bonds between Adenine-Thymine and Guanine-Cytosine."
  },
  {
    id: "phenom_supernova",
    title: "Supernova Nucleosynthesis",
    category: "Astrophysics",
    animationType: "supernova",
    hint: "Cataclysmic core collapse explosion of a massive dying star",
    correct: "Supernova Explosion",
    options: [
      "Supernova Explosion",
      "Protostellar Accretion",
      "Planetary Nebula Ionization",
      "Solar Prominence"
    ],
    explanation: "When a massive star exhausts nuclear fuel in its core, gravitational collapse triggers a colossal relativistic blastwave forging heavy elements and dispersing them across space."
  },
  {
    id: "phenom_brownian",
    title: "Brownian Molecular Motion",
    category: "Physics / Chemistry",
    animationType: "brownian_motion",
    hint: "Random erratic drift of suspended particles colliding with fluid molecules",
    correct: "Brownian Motion",
    options: [
      "Brownian Motion",
      "Laminar Poiseuille Flow",
      "Superfluid Vortex",
      "Quantum Tunneling"
    ],
    explanation: "Suspended micro-particles exhibit random erratic movement due to continuous, asymmetric bombardment by surrounding microscopic liquid or gas molecules."
  },
  {
    id: "phenom_bernoulli",
    title: "Bernoulli Aerodynamic Lift",
    category: "Fluid Dynamics",
    animationType: "bernoulli_lift",
    hint: "Airfoil shape causing pressure differential and upward force",
    correct: "Aerodynamic Lift (Bernoulli's Principle)",
    options: [
      "Aerodynamic Lift (Bernoulli's Principle)",
      "Hydraulic Pressure Pascal Wave",
      "Magnus Gyro Effect",
      "Vortical Cavitation"
    ],
    explanation: "Air moves faster over the curved upper surface of an airfoil, resulting in lower static pressure above than below, generating net upward aerodynamic lift."
  },
  {
    id: "phenom_water_cycle",
    title: "Hydrological Cycle",
    category: "Earth Science",
    animationType: "water_cycle",
    hint: "Continuous circulation: evaporation, condensation, and rain",
    correct: "Hydrological (Water) Cycle",
    options: [
      "Hydrological (Water) Cycle",
      "Carbon-Silicate Cycle",
      "Mantle Convection Current",
      "Oceanic Thermohaline Conveyor"
    ],
    explanation: "Solar heat evaporates ocean and surface water into clouds (condensation), which drift over land and fall as rain or snow (precipitation) back into rivers and seas."
  },
  {
    id: "phenom_magnetic",
    title: "Magnetic Field Lines",
    category: "Electromagnetism",
    animationType: "magnetic_field",
    hint: "Curving dipole force lines aligning microscopic magnetic dipoles",
    correct: "Magnetic Dipole Field",
    options: [
      "Magnetic Dipole Field",
      "Electrostatic Coulomb Lines",
      "Gravitational Isoline Grids",
      "Thermal Flux Isotherms"
    ],
    explanation: "Dipole magnets generate continuous magnetic flux lines emanating from North to South poles, which orient magnetic particles and iron filings."
  }
];

// ==========================================
// ENGLISH LANGUAGE ARTS QUESTION BANKS
// ==========================================

const ENGLISH_SYNONYM_QUESTIONS = [
  {
    id: "eng_syn_meticulous",
    term: "Meticulous",
    category: "Vocabulary (Adjective)",
    tagline: "Showing great attention to detail; very careful and precise",
    illustration: "eng_meticulous",
    correct: "Painstaking & Thorough",
    options: [
      "Painstaking & Thorough",
      "Careless & Hasty",
      "Vague & Indefinite",
      "Gloomy & Somber"
    ],
    explanation: "'Meticulous' originates from Latin 'meticulosus'. It refers to someone who is exceptionally careful, scrupulous, and painstaking in handling every detail."
  },
  {
    id: "eng_syn_ephemeral",
    term: "Ephemeral",
    category: "Vocabulary (Adjective)",
    tagline: "Lasting for a very short, fleeting period of time",
    illustration: "eng_ephemeral",
    correct: "Transient & Fleeting",
    options: [
      "Transient & Fleeting",
      "Eternal & Everlasting",
      "Heavy & Dense",
      "Stubborn & Rigid"
    ],
    explanation: "'Ephemeral' comes from Greek 'ephēmeros' (lasting only a day). It describes transitory, short-lived, or fleeting beauty, moments, and phenomena."
  },
  {
    id: "eng_syn_resilient",
    term: "Resilient",
    category: "Vocabulary (Adjective)",
    tagline: "Able to withstand or recover quickly from difficult conditions",
    illustration: "eng_resilient",
    correct: "Tenacious & Adaptable",
    options: [
      "Tenacious & Adaptable",
      "Fragile & Brittle",
      "Timid & Hesitant",
      "Passive & Resigned"
    ],
    explanation: "'Resilient' signifies the psychological or physical capacity to bounce back, adapt, and regain strength after facing adversity or stress."
  },
  {
    id: "eng_syn_eloquent",
    term: "Eloquent",
    category: "Vocabulary (Adjective)",
    tagline: "Fluent, graceful, and persuasive in speaking or writing",
    illustration: "eng_eloquent",
    correct: "Articulate & Expressive",
    options: [
      "Articulate & Expressive",
      "Incoherent & Muffled",
      "Monotonous & Dull",
      "Hostile & Belligerent"
    ],
    explanation: "'Eloquent' describes rhetoric or prose that is vividly expressive, captivating, persuasive, articulate, and deeply moving."
  },
  {
    id: "eng_syn_ubiquitous",
    term: "Ubiquitous",
    category: "Vocabulary (Adjective)",
    tagline: "Present, appearing, or found everywhere simultaneously",
    illustration: "eng_ubiquitous",
    correct: "Omnipresent & Pervasive",
    options: [
      "Omnipresent & Pervasive",
      "Rare & Elusive",
      "Concealed & Hidden",
      "Remote & Isolated"
    ],
    explanation: "'Ubiquitous' from Latin 'ubique' (everywhere) denotes something so widespread that it seems to exist everywhere at once."
  },
  {
    id: "eng_syn_serendipity",
    term: "Serendipity",
    category: "Vocabulary (Noun)",
    tagline: "The occurrence of events by happy chance in a fortunate way",
    illustration: "eng_serendipity",
    correct: "Fortunate Coincidence",
    options: [
      "Fortunate Coincidence",
      "Calculated Planning",
      "Catastrophic Calamity",
      "Monotonous Routine"
    ],
    explanation: "Coined by Horace Walpole in 1754 from a Persian fairy tale, 'serendipity' is the delightful knack of making pleasant discoveries purely by accident."
  },
  {
    id: "eng_syn_benevolent",
    term: "Benevolent",
    category: "Vocabulary (Adjective)",
    tagline: "Well-meaning, kindly, and motivated by charitable goodwill",
    illustration: "eng_benevolent",
    correct: "Altruistic & Kind-Hearted",
    options: [
      "Altruistic & Kind-Hearted",
      "Malevolent & Spiteful",
      "Greedy & Avaricious",
      "Arrogant & Snobbish"
    ],
    explanation: "'Benevolent' (Latin 'bene' = well + 'volens' = wishing) represents a generous disposition to promote the happiness and welfare of others."
  },
  {
    id: "eng_syn_cacophony",
    term: "Cacophony",
    category: "Vocabulary (Noun)",
    tagline: "A harsh, discordant, jarring mixture of chaotic sounds",
    illustration: "eng_cacophony",
    correct: "Jarring Din & Clatter",
    options: [
      "Jarring Din & Clatter",
      "Harmonious Symphony",
      "Peaceful Silence",
      "Gentle Lullaby"
    ],
    explanation: "'Cacophony' (Greek 'kakos' = bad + 'phone' = voice) describes an unpleasantly noisy, chaotic, and jarring clash of sounds."
  },
  {
    id: "eng_syn_pragmatic",
    term: "Pragmatic",
    category: "Vocabulary (Adjective)",
    tagline: "Dealing with situations sensibly based on practical results",
    illustration: "eng_pragmatic",
    correct: "Practical & Sensible",
    options: [
      "Practical & Sensible",
      "Idealistic & Theoretical",
      "Impulsive & Reckless",
      "Fanciful & Mythical"
    ],
    explanation: "A 'pragmatic' thinker focuses on what works in practical reality rather than clinging to abstract dogmas or impossible ideals."
  },
  {
    id: "eng_syn_tenacious",
    term: "Tenacious",
    category: "Vocabulary (Adjective)",
    tagline: "Holding firmly; persistent, stubborn, and determined",
    illustration: "eng_tenacious",
    correct: "Persistent & Resolute",
    options: [
      "Persistent & Resolute",
      "Fragile & Yielding",
      "Apathetic & Indifferent",
      "Shallow & Superficial"
    ],
    explanation: "'Tenacious' (Latin 'tenere' = to hold) describes dogged perseverance, unyielding willpower, and refusing to surrender."
  }
];

const ENGLISH_IDIOM_QUESTIONS = [
  {
    id: "eng_idiom_break_ice",
    title: "Break the Ice",
    category: "Idioms & Expressions",
    animationType: "idiom_break_ice",
    hint: "Shattering a cold frozen barrier to start friendly conversation",
    correct: "To ease tension & initiate social conversation",
    options: [
      "To ease tension & initiate social conversation",
      "To store frozen food during winter",
      "To cancel a scheduled meeting abruptly",
      "To argue aggressively over a dispute"
    ],
    explanation: "'Break the ice' references icebreaker vessels that cleared shipping routes; figuratively, it means breaking awkward silence to establish a warm dialogue."
  },
  {
    id: "eng_idiom_midnight_oil",
    title: "Burn the Midnight Oil",
    category: "Idioms & Metaphors",
    animationType: "idiom_midnight_oil",
    hint: "An antique lamp glowing late into the night during deep study",
    correct: "To study or work diligently late into the night",
    options: [
      "To study or work diligently late into the night",
      "To waste lamp fuel needlessly",
      "To accidentally start an oil fire",
      "To wake up early before sunrise"
    ],
    explanation: "Before electric lightbulbs, scholars burned oil in desk lamps to study past midnight. It symbolizes passionate, late-night academic dedication."
  },
  {
    id: "eng_idiom_spill_beans",
    title: "Spill the Beans",
    category: "Idioms & Figures of Speech",
    animationType: "idiom_spill_beans",
    hint: "A jar tumbling over and scattering colorful hidden beans",
    correct: "To reveal a secret prematurely or by accident",
    options: [
      "To reveal a secret prematurely or by accident",
      "To prepare a vegetable soup recipe",
      "To clean up a cluttered workspace",
      "To forget a forgotten childhood memory"
    ],
    explanation: "Dating to early democratic voting ceremonies using colored beans, 'spill the beans' means inadvertently revealing confidential or secret details."
  },
  {
    id: "eng_idiom_cloud_nine",
    title: "On Cloud Nine",
    category: "Idioms & Hyperbole",
    animationType: "idiom_cloud_nine",
    hint: "Floating blissfully atop a golden radiant cloud in sheer joy",
    correct: "A state of pure happiness, bliss & euphoria",
    options: [
      "A state of pure happiness, bliss & euphoria",
      "Feeling confused, daydreaming or lost",
      "Experiencing rainy, gloomy bad weather",
      "Falling asleep unexpectedly during class"
    ],
    explanation: "Derived from meteorological classifications where the ninth cloud type was the towering, majestic cumulonimbus, this idiom expresses ecstatic bliss."
  },
  {
    id: "eng_idiom_piece_of_cake",
    title: "A Piece of Cake",
    category: "Idioms & Colloquialisms",
    animationType: "idiom_piece_of_cake",
    hint: "Slicing through a sweet dessert effortlessly with celebration candles",
    correct: "A task that is simple, effortless & easy to achieve",
    options: [
      "A task that is simple, effortless & easy to achieve",
      "A rare and expensive gourmet banquet",
      "A difficult and convoluted math puzzle",
      "An impossible ambition never to be reached"
    ],
    explanation: "Originating in 1930s English, eating cake is universally effortless and enjoyable, so any endeavor that is easily accomplished is 'a piece of cake'."
  },
  {
    id: "eng_idiom_time_flies",
    title: "Time Flies",
    category: "Personification & Metaphor",
    animationType: "idiom_time_flies",
    hint: "A winged clock soaring through the sky above clouds",
    correct: "Time seems to pass remarkably quickly",
    options: [
      "Time seems to pass remarkably quickly",
      "Mechanical clocks are malfunctioning",
      "Traveling through a science-fiction time warp",
      "Feeling trapped in endless boredom"
    ],
    explanation: "From the Latin adage 'Tempus fugit', this classic personification conveys how swiftly hours and minutes slip away when one is deeply engaged."
  },
  {
    id: "eng_idiom_raining_cats_dogs",
    title: "Raining Cats and Dogs",
    category: "Idioms & Hyperbole",
    animationType: "idiom_raining_cats_dogs",
    hint: "A torrential stormy downpour tumbling from heavy thunderclouds",
    correct: "Raining unusually hard with torrential downpours",
    options: [
      "Raining unusually hard with torrential downpours",
      "Pets running outdoors in excitement",
      "A gentle morning spring mist",
      "An unexpected freezing hail flurry"
    ],
    explanation: "First recorded in 17th-century British poetry, this vivid hyperbole humorously describes an overwhelming, ferocious torrent of rain."
  },
  {
    id: "eng_idiom_bite_bullet",
    title: "Bite the Bullet",
    category: "Idioms & Tenacity",
    animationType: "idiom_bite_bullet",
    hint: "Steeling oneself with courage to face an unavoidable hardship",
    correct: "To face an unpleasant situation with courage & grit",
    options: [
      "To face an unpleasant situation with courage & grit",
      "To behave recklessly in a confrontation",
      "To taste an unappetizing dish",
      "To surrender immediately without trying"
    ],
    explanation: "Historically, soldiers bit on a lead bullet to withstand agonizing field surgery without screaming; today it means confronting a tough ordeal bravely."
  }
];

// Helper to shuffle questions and options
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

