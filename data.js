// ===================== DRAGON QUEST KIDS — CONTENT DATA =====================
// All story content, classes, items and enemy pools live here so the whole
// adventure is "mapped out" instantly at load — no network calls during play.

const STATS = ["Might", "Agility", "Magic", "Spirit"];

const STAT_INFO = {
  Might:   {emoji:"💪", color:"#ff5a5a", desc:"Strength in battle & brute force"},
  Agility: {emoji:"🏃", color:"#4ade80", desc:"Speed, stealth & reflexes"},
  Magic:   {emoji:"🔮", color:"#60a5fa", desc:"Spellcraft & arcane power"},
  Spirit:  {emoji:"🌟", color:"#c084fc", desc:"Willpower, luck & charm"}
};

const CLASSES = [
  {
    id:"warrior", name:"Warrior", emoji:"⚔️",
    desc:"Mighty front-liner. Smashes problems head-on.",
    base:{Might:8, Agility:5, Magic:2, Spirit:5}, hp:34,
    color:"#ff5a5a"
  },
  {
    id:"rogue", name:"Rogue", emoji:"🗡️",
    desc:"Quick and sneaky. Finds clever paths around danger.",
    base:{Might:4, Agility:9, Magic:3, Spirit:4}, hp:28,
    color:"#4ade80"
  },
  {
    id:"wizard", name:"Wizard", emoji:"🧙",
    desc:"Master of spells. Solves problems with magic.",
    base:{Might:2, Agility:4, Magic:9, Spirit:5}, hp:24,
    color:"#60a5fa"
  },
  {
    id:"cleric", name:"Cleric", emoji:"✨",
    desc:"Wise and kind. Heals friends and inspires courage.",
    base:{Might:4, Agility:3, Magic:6, Spirit:7}, hp:30,
    color:"#c084fc"
  },
  {
    id:"ranger", name:"Ranger", emoji:"🏹",
    desc:"Balanced and resourceful. Good at everything, master of none.",
    base:{Might:5, Agility:6, Magic:5, Spirit:5}, hp:29,
    color:"#fbbf24"
  }
];

function getClass(id){ return CLASSES.find(c=>c.id===id); }

// -------------------- EQUIPMENT --------------------
const ITEMS = [
  {id:"wood_sword", name:"Wooden Sword", emoji:"🗡️", rarity:"common", bonus:{Might:1}},
  {id:"leather_boots", name:"Leather Boots", emoji:"👢", rarity:"common", bonus:{Agility:1}},
  {id:"apprentice_wand", name:"Apprentice Wand", emoji:"🪄", rarity:"common", bonus:{Magic:1}},
  {id:"lucky_charm", name:"Lucky Charm", emoji:"🍀", rarity:"common", bonus:{Spirit:1}},
  {id:"iron_shield", name:"Iron Shield", emoji:"🛡️", rarity:"rare", bonus:{Might:2, Spirit:1}},
  {id:"swift_cloak", name:"Cloak of Swiftness", emoji:"🧥", rarity:"rare", bonus:{Agility:2, Might:1}},
  {id:"crystal_orb", name:"Crystal Orb", emoji:"🔮", rarity:"rare", bonus:{Magic:2, Spirit:1}},
  {id:"healing_amulet", name:"Healing Amulet", emoji:"📿", rarity:"rare", bonus:{Spirit:2, Magic:1}},
  {id:"dragon_scale_mail", name:"Dragonscale Mail", emoji:"🐲", rarity:"epic", bonus:{Might:3, Spirit:2}},
  {id:"windstep_boots", name:"Windstep Boots", emoji:"🥾", rarity:"epic", bonus:{Agility:3, Magic:1}},
  {id:"staff_of_stars", name:"Staff of Stars", emoji:"⭐", rarity:"epic", bonus:{Magic:3, Agility:1}},
  {id:"phoenix_feather", name:"Phoenix Feather", emoji:"🪶", rarity:"epic", bonus:{Spirit:3, Might:1}}
];

function getItem(id){ return ITEMS.find(i=>i.id===id); }
function randomLoot(rarityWeights){
  // rarityWeights e.g. {common:60, rare:32, epic:8}
  const roll = Math.random()*100;
  let pool;
  if (roll < (rarityWeights.epic||5)) pool = ITEMS.filter(i=>i.rarity==="epic");
  else if (roll < (rarityWeights.epic||5)+(rarityWeights.rare||30)) pool = ITEMS.filter(i=>i.rarity==="rare");
  else pool = ITEMS.filter(i=>i.rarity==="common");
  return pool[Math.floor(Math.random()*pool.length)];
}

// -------------------- FLAVOR POOLS (randomized text seasoning) --------------------
const FLAVOR = {
  weather: ["A cool breeze drifts through", "Thunder rumbles far away over", "Golden afternoon light spills across", "A light mist hangs over", "Birdsong echoes across", "Dark clouds gather above", "A warm hush settles over"],
  villainTitle: ["the Shadow King", "Lord Cinderfang", "the Bone Witch", "Grakthar the Cruel", "the Hollow Sorcerer", "the Crow Queen"],
  dragonName: ["Emberclaw", "Voidscale", "Thornjaw", "Ashwing", "Grimtalon", "Duskfire", "Ironmaw"],
  treasureFlavor: ["glinting with old magic", "humming faintly", "wrapped in cobwebs", "still warm to the touch", "etched with strange runes", "cool despite the heat around it"],
  npcNames: ["an old traveler", "a nervous merchant", "a one-eyed guard", "a cloaked stranger", "a cheerful farmer", "a wandering bard", "a young apprentice", "a retired soldier"]
};
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function pickN(arr,n){ const copy=[...arr]; const out=[]; while(out.length<n && copy.length){ out.push(copy.splice(Math.floor(Math.random()*copy.length),1)[0]); } return out; }

// -------------------- OUTCOME FLAVOR (makes repeat choices feel different) --------------------
// Appended after an outcome line so the SAME choice + SAME result tier never reads identical twice.
const OUTCOME_FLAVOR = {
  crit:    [" The whole party cheers!", " Even you're a little surprised how well that went.", " That's one for the storybooks.", " Everyone grins — that was perfect.", ""],
  success: [" Solid work.", " The party presses on, confident.", " Not bad at all.", " You allow yourselves a small smile.", ""],
  partial: [" Could've gone better.", " Lesson learned, the hard way.", " It'll have to do.", " You shake it off and keep moving.", ""],
  fail:    [" That one stings.", " The party regroups, rattled.", " Everyone's a bit more cautious now.", " Ouch.", ""]
};
// Numeric jitter so the same tier never grants/costs the exact same amount twice.
function jitter(n){ if(!n) return n; const f = 0.8 + Math.random()*0.4; const v = Math.round(n*f); return Math.max(1, v); }

// -------------------- PREPARATION FLAGS --------------------
// These are set by earlier-chapter choices and cashed in during the finale —
// so scouting ahead, learning dragon lore, etc. actually matters mechanically.
const PREP_FLAGS = ["safe_route","dragon_lore","fast_route","village_clue","forest_ward","good_deed",
  "mine_blessing","lake_secret","ruins_lore","mirror_solved","omen_insight","lair_shortcut","dragon_weakness"];

// -------------------- DAMAGE SCALING BY PARTY SIZE --------------------
// Smaller parties have fewer HP pools and no one to help, so incoming damage
// scales down; larger parties can absorb more, so it scales up slightly.
const DAMAGE_SCALE = {1:0.65, 2:0.85, 3:1.0, 4:1.15};

// -------------------- SCENE BACKGROUNDS (inline SVG, no image loading) --------------------
const SCENES = {
  village: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#2b4a6e"/><rect y="150" width="400" height="70" fill="#3a6b3a"/><polygon points="40,150 70,100 100,150" fill="#6b4a3a"/><rect x="55" y="120" width="30" height="30" fill="#8a6a4a"/><polygon points="150,150 190,90 230,150" fill="#7a5a4a"/><rect x="170" y="115" width="40" height="35" fill="#9a7a5a"/><circle cx="330" cy="50" r="24" fill="#ffe9a8"/><polygon points="260,150 290,110 320,150" fill="#6b4a3a"/></svg>`,
  forest: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#1c3b2e"/><rect y="170" width="400" height="50" fill="#163325"/><polygon points="30,170 60,60 90,170" fill="#204d33"/><polygon points="90,170 130,40 170,170" fill="#245a3a"/><polygon points="160,170 200,70 240,170" fill="#1e4a30"/><polygon points="230,170 270,50 310,170" fill="#245a3a"/><polygon points="300,170 340,80 380,170" fill="#204d33"/><circle cx="60" cy="30" r="18" fill="#dfe9c0" opacity="0.7"/></svg>`,
  cave: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#1a1422"/><polygon points="0,0 60,0 10,90" fill="#2a2235"/><polygon points="400,0 340,0 390,80" fill="#2a2235"/><polygon points="0,220 70,220 20,120" fill="#241d30"/><polygon points="400,220 320,220 380,130" fill="#241d30"/><circle cx="200" cy="130" r="40" fill="#5a4a7a" opacity="0.4"/><circle cx="90" cy="60" r="4" fill="#ffd54a"/><circle cx="310" cy="90" r="4" fill="#ffd54a"/><circle cx="200" cy="40" r="4" fill="#ffd54a"/></svg>`,
  ruins: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#3a2e4e"/><rect y="170" width="400" height="50" fill="#2a2038"/><rect x="40" y="60" width="26" height="110" fill="#6a5a7a"/><rect x="110" y="30" width="26" height="140" fill="#75658a"/><rect x="200" y="80" width="26" height="90" fill="#6a5a7a"/><rect x="290" y="50" width="26" height="120" fill="#75658a"/><polygon points="90,170 300,170 320,190 70,190" fill="#241c30"/><circle cx="340" cy="40" r="20" fill="#d8c8ff" opacity="0.5"/></svg>`,
  lair_approach: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#4a1a1a"/><rect y="180" width="400" height="40" fill="#2e0f0f"/><polygon points="0,180 100,40 220,180" fill="#5a2424"/><polygon points="160,180 280,20 400,180" fill="#652a2a"/><circle cx="200" cy="90" r="14" fill="#ff9a4a" opacity="0.8"/><circle cx="130" cy="150" r="6" fill="#ffb84a"/><circle cx="270" cy="150" r="6" fill="#ffb84a"/></svg>`,
  lair_final: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#2a0e0e"/><polygon points="0,220 0,120 120,220" fill="#3a1414"/><polygon points="400,220 400,100 260,220" fill="#3a1414"/><circle cx="200" cy="90" r="55" fill="#ff5a1a" opacity="0.55"/><circle cx="200" cy="90" r="30" fill="#ffd54a" opacity="0.6"/><polygon points="130,220 200,60 270,220" fill="#200a0a" opacity="0.6"/></svg>`,
  victory: `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><rect width="400" height="220" fill="#1a2a4e"/><circle cx="330" cy="50" r="26" fill="#ffe9a8"/><rect y="180" width="400" height="40" fill="#2e5a3a"/><polygon points="30,180 70,100 110,180" fill="#2a6b3a"/><polygon points="250,180 300,90 350,180" fill="#2a6b3a"/><polygon points="150,150 200,60 250,150" fill="#ffd54a" opacity="0.3"/></svg>`
};

// -------------------- CHAPTER / NODE SYSTEM --------------------
// Each chapter is built from "slots". Every slot lists 2 alternative encounter
// definitions — at the start of a run, ONE is picked at random per slot, so
// different playthroughs can show genuinely different scenes (not just the
// same scenes in a different order). Slot order is also shuffled.
//
// Node choice outcome tiers (computed from d10 roll + stat bonus):
//   total >= 11 -> CRIT   (best outcome, bonus reward)
//   total >= 7  -> SUCCESS
//   total >= 4  -> PARTIAL (mixed: progress but a cost)
//   total < 4   -> FAIL (setback: damage or lost opportunity)

const CHAPTERS = [
  { // CH 1
    id:"village", title:"The Call to Adventure", scene:"village",
    intro:[
      "{weather} {village}. The village elder gathers the heroes in the square: dark smoke has been seen rising from the old ruins, and the great dragon {dragonName} has not been seen in its mountain for three days. Something is wrong.",
      "{village} buzzes with worry. Crops are failing, wells run dry, and {npc} swears they saw shadow-wolves at the forest's edge. The heroes are the village's only hope.",
      "Bells ring out across {village} at dawn. {npc} says it's been years since the warning bell last sounded. The heroes gather, uncertain but ready."
    ],
    slots:[
      [
        { id:"market_choice", text:["Before leaving, you pass the market. A trader offers to sell supplies, but his prices are strange, and his eyes keep darting to the door.","At the market stalls, {npc} haggles loudly while watching your party with curiosity."],
          choices:[
            {label:"Haggle sharply for a better price", stat:"Spirit", tag:"Spirit",
              success:"You charm the trader into a generous discount — the party pockets extra coin!", reward:{gold:15},
              partial:"You get a fair price, nothing special.", fail:"The trader senses you're new to this and overcharges you.", failPenalty:{gold:-5}},
            {label:"Inspect the goods carefully for quality", stat:"Magic", tag:"Magic",
              success:"You sense a faint enchantment on a dusty pendant — it's worth far more than he's asking!", reward:{item:true},
              partial:"The goods seem ordinary but serviceable.", fail:"You misjudge an item and it breaks the moment you pick it up."},
            {label:"Just grab basic supplies and move on", stat:"Agility", tag:"Agility",
              success:"Quick and efficient — you're stocked up with time to spare.", reward:{gold:5},
              partial:"You get the basics.", fail:"You trip over a crate, scattering goods everywhere. Embarrassing."}
          ]},
        { id:"festival_prep", text:["{npc} is frantically packing a cart of festival supplies, worried the celebration will be ruined before anyone notices the real danger.","Decorations for a half-finished festival flap in the wind, abandoned when the warning bells rang."],
          choices:[
            {label:"Help calm the frightened crowd", stat:"Spirit", tag:"Spirit",
              success:"Your steady words settle the crowd, and a grateful baker presses coin into your hands.", reward:{gold:12},
              partial:"The crowd calms a little, but stays nervous.", fail:"Your words come out wrong and panic spreads faster."},
            {label:"Quickly identify what supplies are actually useful", stat:"Magic", tag:"Magic",
              success:"You spot enchanted lanterns among the festival gear — perfect for the road ahead!", reward:{item:true},
              partial:"You grab a few ordinary useful things.", fail:"You grab the wrong crate entirely and waste precious time."},
            {label:"Race to warn the outer farms before you leave", stat:"Agility", tag:"Agility",
              success:"You sprint the farm circuit in record time — everyone's accounted for and safe.", reward:{gold:8},
              partial:"You warn most of the farms, but miss one.", fail:"You exhaust yourself and barely finish in time."}
          ]}
      ],
      [
        { id:"elder_warning", text:["The elder pulls you aside. \"The old roads split three ways past the forest. Choose your approach wisely, young heroes.\"","An old guard leans in. \"Rumor says {villainTitle} stirs again. Be ready for anything out there.\""],
          choices:[
            {label:"Ask for the safest, slower route", stat:"Spirit", tag:"Spirit",
              success:"The elder respects your caution and shares a hidden shortcut that avoids danger later.", reward:{flag:"safe_route"},
              partial:"You get vague directions.", fail:"The elder is unimpressed by your hesitation and shares nothing extra."},
            {label:"Ask about the dragon's weaknesses", stat:"Magic", tag:"Magic",
              success:"You learn an old legend: the dragon fears a song sung under starlight. You'll remember this.", reward:{flag:"dragon_lore"},
              partial:"You hear only vague old rhymes.", fail:"The elder's story confuses more than it helps."},
            {label:"Offer to scout ahead yourself", stat:"Agility", tag:"Agility",
              success:"You dash ahead and spot a faster trail, saving the party time and energy.", reward:{flag:"fast_route"},
              partial:"You scout a little, but nothing useful.", fail:"You get turned around and have to backtrack, tiring the party."}
          ]},
        { id:"worried_parent", text:["{npc} grabs your arm before you leave. \"My child went missing near the old well two nights ago. Please — is there anything you can do?\"","A worried voice calls out from a doorway, begging for news of a missing neighbor."],
          choices:[
            {label:"Comfort them and promise to look along the way", stat:"Spirit", tag:"Spirit",
              success:"Your promise steadies them, and they slip you a keepsake for luck on the road.", reward:{item:true},
              partial:"They nod, uncertain but a little comforted.", fail:"Your words ring hollow and they walk away in tears."},
            {label:"Ask clever questions to narrow down where to look", stat:"Magic", tag:"Magic",
              success:"Piecing together the details, you're confident the child wandered toward the forest, not harm.", reward:{flag:"village_clue"},
              partial:"You get a few useful but incomplete details.", fail:"The questions only confuse and upset them further."},
            {label:"Run and check the old well yourself right now", stat:"Agility", tag:"Agility",
              success:"You find the child safe, just hiding and scared — a joyful reunion before you even leave town!", reward:{gold:10},
              partial:"You check but find nothing, costing some time.", fail:"You slip on wet stones at the well and hurt yourself.", failDamage:4}
          ]}
      ]
    ]
  },
  { // CH 2
    id:"forest", title:"The Whispering Forest", scene:"forest",
    intro:[
      "{weather} the Whispering Forest. Twisted roots grip the path and the trees seem to lean in, listening. Somewhere deep in the green, something growls.",
      "The forest canopy swallows the daylight. Strange carvings mark old trees — warnings, maybe, or welcomes. {npc} once said travelers who stray from the path rarely return the same.",
      "{weather} the Whispering Forest, where even the wind seems to whisper half-finished words. The path forward is narrow and overgrown."
    ],
    slots:[
      [
        { id:"wolf_pack", text:["A pack of shadow-wolves bursts from the underbrush, eyes glowing faintly violet, blocking the only path forward!","Yellow eyes ring the clearing — shadow-wolves, patient and hungry, pace just out of reach."],
          choices:[
            {label:"Charge the lead wolf head-on", stat:"Might", tag:"Might",
              success:"A mighty blow sends the lead wolf fleeing, and the rest scatter in fear!", damage:0,
              partial:"You drive them back but take a nasty bite.", partialDamage:6,
              fail:"The wolves swarm before you can land a hit.", failDamage:12},
            {label:"Use the terrain to slip past quietly", stat:"Agility", tag:"Agility",
              success:"You weave through the pack like a shadow yourself — not a single wolf notices!", damage:0,
              partial:"You sneak past most of them but one catches your scent.", partialDamage:5,
              fail:"You snap a branch and the whole pack turns on you.", failDamage:10},
            {label:"Cast a spell of flickering light to scare them", stat:"Magic", tag:"Magic",
              success:"Brilliant light floods the clearing — the wolves flee, yipping, into the dark.", damage:0,
              partial:"The light startles some, but a few stay bold.", partialDamage:4,
              fail:"The spell fizzles and the wolves press the attack.", failDamage:11}
          ]},
        { id:"spider_ambush", text:["Thick webbing stretches between the trees overhead — too late, you notice the massive spider dropping toward the party!","Something skitters just out of sight, and sticky strands brush your shoulders before you see the source."],
          choices:[
            {label:"Smash the webbing and fight it head-on", stat:"Might", tag:"Might",
              success:"One solid hit and the spider retreats into the canopy, wounded and wary.", damage:0,
              partial:"You fend it off but get tangled and bitten.", partialDamage:6,
              fail:"The spider's venom catches you before you land a hit.", failDamage:12},
            {label:"Dodge the webs and circle behind it", stat:"Agility", tag:"Agility",
              success:"You slip past every strand and vanish from its senses entirely — clean escape.", damage:0,
              partial:"You dodge most webbing but get a sticky graze.", partialDamage:5,
              fail:"You get caught fast in the webbing, unable to move freely.", failDamage:10},
            {label:"Burn the webbing with a quick spell", stat:"Magic", tag:"Magic",
              success:"Flame races up the silk, and the spider flees from the light and heat.", damage:0,
              partial:"The webbing burns slowly, giving you only partial relief.", partialDamage:4,
              fail:"The spell catches the wrong branch and smoke fills the air, confusing everyone.", failDamage:9}
          ]}
      ],
      [
        { id:"ancient_tree", text:["You find a massive hollow tree, its bark carved with glowing runes that pulse faintly. A voice seems to murmur just beyond hearing.","Deep moss covers an ancient tree-shrine, humming with a strange, old magic."],
          choices:[
            {label:"Speak a greeting to the spirit within", stat:"Spirit", tag:"Spirit",
              success:"The forest spirit blesses your party with renewed vigor — everyone heals a little!", reward:{healAll:8},
              partial:"The spirit murmurs something unclear, but seems calm.", fail:"The spirit is offended by your intrusion and the runes flare painfully.", failDamage:7},
            {label:"Study the runes to decode their meaning", stat:"Magic", tag:"Magic",
              success:"You decipher a protective ward — knowledge that will help in chapters ahead.", reward:{flag:"forest_ward"},
              partial:"You understand fragments, but nothing actionable.", fail:"The runes release a burst of static magic that stings.", failDamage:5},
            {label:"Carefully climb up to see what's hidden above", stat:"Agility", tag:"Agility",
              success:"Tucked in the branches you find a small hidden cache of treasure!", reward:{gold:20, item:true},
              partial:"You climb up but find nothing of note.", fail:"You slip and tumble down, bruised.", failDamage:6}
          ]},
        { id:"river_crossing", text:["A swift, cold river blocks the path. The only crossing is a half-rotted log bridge swaying in the wind.","Rushing water cuts across the trail — too deep to wade, too wide to easily jump."],
          choices:[
            {label:"Force a path straight through the current", stat:"Might", tag:"Might",
              success:"You power through the current and anchor a rope for the rest of the party to cross safely.", damage:0,
              partial:"You make it across, exhausted and soaked.", partialDamage:5,
              fail:"The current sweeps your footing out and you're bashed against rocks.", failDamage:11},
            {label:"Balance carefully across the rotted log", stat:"Agility", tag:"Agility",
              success:"Light and sure-footed, you cross the log without a single creak of warning.", damage:0,
              partial:"You cross, but the log cracks loudly beneath you near the end.", partialDamage:4,
              fail:"The log snaps and you tumble into the frigid water.", failDamage:10},
            {label:"Use magic to freeze a safe path across", stat:"Magic", tag:"Magic",
              success:"A shimmering path of ice forms perfectly across the river — an easy crossing!", damage:0,
              partial:"The ice holds, but just barely, cracking as you cross.", partialDamage:4,
              fail:"The spell fizzles halfway and you're dumped straight into the river.", failDamage:9}
          ]}
      ],
      [
        { id:"lost_traveler", text:["{npc} stumbles out of the brush, pale and frightened, begging for help finding the way out.","A frightened trader, lost for days, grabs your sleeve, pleading for directions."],
          choices:[
            {label:"Calm them and guide them to safety yourself", stat:"Spirit", tag:"Spirit",
              success:"Grateful beyond words, they gift you a family heirloom before you part.", reward:{item:true},
              partial:"You help them, but it costs precious time.", fail:"They panic and run off before you can help, into deeper danger."},
            {label:"Give them a map and quick instructions", stat:"Magic", tag:"Magic",
              success:"Your clear, clever directions get them home safely and you keep moving fast.", reward:{gold:10},
              partial:"They shrug and wander off, unsure if it'll work.", fail:"Your directions are confusing and they get even more lost, upset."},
            {label:"Escort them partway before returning to the path", stat:"Agility", tag:"Agility",
              success:"You swiftly guide them to a safe fork and return without losing any time.", reward:{flag:"good_deed"},
              partial:"It takes longer than expected but they're safe.", fail:"You both get turned around in the dense woods, tiring everyone.", failDamage:4}
          ]},
        { id:"fey_trickster", text:["A small, glowing fey creature perches on a branch, grinning. \"I'll let you pass... for a price, or a riddle, or maybe just a laugh.\"","Mischievous lights dance around a fey sprite blocking the narrow trail, clearly enjoying the attention."],
          choices:[
            {label:"Charm it with kindness and good humor", stat:"Spirit", tag:"Spirit",
              success:"The fey giggles, delighted, and gifts you a shimmering trinket before vanishing.", reward:{item:true},
              partial:"The fey is amused enough to let you pass, nothing more.", fail:"The fey takes offense and curses your boots with mud that won't come off.", failDamage:3},
            {label:"Answer its riddle with careful logic", stat:"Magic", tag:"Magic",
              success:"Your answer is perfect — the fey claps and rewards you with a pouch of gold!", reward:{gold:18},
              partial:"Your answer is close enough; the fey shrugs and steps aside.", fail:"Your answer is wrong and the fey's laughter turns sharp, a small shock zapping you.", failDamage:5},
            {label:"Dart past before it can react", stat:"Agility", tag:"Agility",
              success:"You're through the trail before the fey even finishes its sentence!", damage:0,
              partial:"You get past, but the fey nips at your heels with tiny pranks.", partialDamage:3,
              fail:"The fey tangles your feet in vines just for fun.", failDamage:6}
          ]}
      ]
    ]
  },
  { // CH 3
    id:"mine", title:"The Sunken Mines", scene:"cave",
    intro:[
      "{weather} the mouth of the Sunken Mines. Cold air rushes up from the dark, carrying the smell of old iron and something sharper underneath — sulfur, maybe, or something worse.",
      "Rickety support beams creak overhead. Faint glowing crystals light the way down into the Sunken Mines, where the old maps say {villainTitle}'s scouts once dug for something terrible.",
      "The Sunken Mines swallow sound entirely. Every footstep feels too loud in the dark, glowing passage ahead."
    ],
    slots:[
      [
        { id:"cave_collapse", text:["A tremor shakes the tunnel — rocks begin to fall from the ceiling ahead!","The ground groans ominously. Dust sifts down. This passage is not stable."],
          choices:[
            {label:"Brace the ceiling with brute strength", stat:"Might", tag:"Might",
              success:"You hold the ceiling up long enough for everyone to scramble through safely!", damage:0,
              partial:"You hold it, but a chunk of rock clips your shoulder.", partialDamage:6,
              fail:"The ceiling gives way faster than you can react.", failDamage:14},
            {label:"Sprint through the collapsing passage", stat:"Agility", tag:"Agility",
              success:"You dash through with perfect timing, not a scratch on anyone!", damage:0,
              partial:"You make it through but debris grazes the party.", partialDamage:5,
              fail:"You're too slow and get buried under falling rubble.", failDamage:13},
            {label:"Cast a spell to stabilize the rock", stat:"Magic", tag:"Magic",
              success:"Arcane energy knits the rock together just in time — a clean escape!", damage:0,
              partial:"The spell slows the collapse but doesn't stop it fully.", partialDamage:4,
              fail:"The spell backfires, shaking loose even more rock.", failDamage:12}
          ]},
        { id:"gas_pocket", text:["A faint hiss gives away a pocket of strange, glowing gas seeping from a crack ahead — one wrong move could be very bad.","The air shimmers oddly down one passage; something about it makes your skin crawl."],
          choices:[
            {label:"Push through fast before it spreads", stat:"Might", tag:"Might",
              success:"You barrel through before the gas thickens, coughing but unharmed.", damage:0,
              partial:"You get through but breathe in a little too much.", partialDamage:5,
              fail:"The gas catches you fully, and your head spins painfully.", failDamage:11},
            {label:"Carefully pick a path around the gas pocket", stat:"Agility", tag:"Agility",
              success:"You thread a narrow dry path around it without disturbing a thing.", damage:0,
              partial:"You mostly avoid it but a stray wisp catches you.", partialDamage:4,
              fail:"You misjudge the gap and stumble right into the cloud.", failDamage:10},
            {label:"Identify the gas and neutralize it with magic", stat:"Magic", tag:"Magic",
              success:"You recognize the compound and disperse it harmlessly with a flick of magic.", damage:0,
              partial:"Your spell thins the gas but doesn't fully clear it.", partialDamage:4,
              fail:"Your spell reacts badly with the gas, causing a small flash.", failDamage:9}
          ]}
      ],
      [
        { id:"crystal_puzzle", text:["A chamber of glowing crystals hums with a locked magical gate. Ancient symbols suggest a puzzle must be solved to pass.","Five crystal pillars pulse in sequence, guarding a sealed door deeper into the mine."],
          choices:[
            {label:"Carefully study the pattern before acting", stat:"Magic", tag:"Magic",
              success:"You solve the puzzle elegantly — the gate opens and a hidden treasure room reveals itself!", reward:{gold:25, item:true},
              partial:"You solve it after a few tries, no extra reward.", fail:"You trigger a minor trap, a spark of static energy zaps you.", failDamage:6},
            {label:"Trust your gut and smash a pattern through", stat:"Might", tag:"Might",
              success:"Against all odds your forceful approach works, and the gate shatters open!", reward:{gold:10},
              partial:"The gate opens, but the effort exhausts you.", partialDamage:5,
              fail:"The gate's magic lashes back at your forceful attempt.", failDamage:10},
            {label:"Pray for guidance from the old spirits", stat:"Spirit", tag:"Spirit",
              success:"A calm clarity washes over you, and the correct sequence becomes obvious.", reward:{flag:"mine_blessing"},
              partial:"Nothing happens, but you don't lose anything trying.", fail:"The silence that answers you feels heavier than before."}
          ]},
        { id:"underground_lake", text:["A still, black underground lake stretches across the passage, its surface unnervingly smooth. Something pale moves just beneath.","The tunnel opens into a vast cavern lake. The only way onward seems to be across or around it."],
          choices:[
            {label:"Swim straight across with powerful strokes", stat:"Might", tag:"Might",
              success:"You power across quickly before anything beneath notices.", damage:0,
              partial:"You make it across but something brushes your leg, unnerving everyone.", partialDamage:5,
              fail:"Something grabs at you from below before you reach the far shore.", failDamage:12},
            {label:"Find a narrow dry ledge around the lake's edge", stat:"Agility", tag:"Agility",
              success:"You balance along the ledge perfectly, never touching the water at all.", damage:0,
              partial:"You make it around, slipping once but catching yourself.", partialDamage:4,
              fail:"You lose your footing and splash into the cold water.", failDamage:10},
            {label:"Light the cavern to see what's really down there", stat:"Magic", tag:"Magic",
              success:"Your light reveals a safe shallow path hidden beneath the glare — easy crossing.", reward:{flag:"lake_secret"},
              partial:"The light helps a little, but the way across is still tricky.", partialDamage:3,
              fail:"The light disturbs something that clearly didn't want to be seen.", failDamage:11}
          ]}
      ],
      [
        { id:"miner_ghosts", text:["Pale, translucent figures of long-dead miners drift through the tunnel, moaning about unfinished work.","Ghostly miners flicker in the crystal light, trapped between duty and rest."],
          choices:[
            {label:"Offer them words of peace and release", stat:"Spirit", tag:"Spirit",
              success:"The ghosts sigh in relief and fade peacefully, leaving behind their old tools as a gift.", reward:{item:true},
              partial:"They seem calmer but don't fully depart.", fail:"Your words anger them and cold spectral hands claw at you.", failDamage:8},
            {label:"Investigate what work they left unfinished", stat:"Magic", tag:"Magic",
              success:"You find and complete their last task — a sealed vein of enchanted ore, now yours.", reward:{gold:20},
              partial:"You find clues but can't finish the task.", fail:"Disturbing their work stirs a vengeful chill.", failDamage:6},
            {label:"Quietly slip past without disturbing them", stat:"Agility", tag:"Agility",
              success:"You pass through like a held breath — undisturbed and unnoticed.", damage:0,
              partial:"You mostly avoid them but a cold hand brushes your arm.", partialDamage:3,
              fail:"You bump a cart and the ghosts shriek, lashing out.", failDamage:9}
          ]},
        { id:"ore_golem", text:["A hulking golem of fused ore and crystal grinds to life, blocking a vein of precious metal it was built to guard.","Rocky plates shift and grind as an old guardian construct rises from a pile of ore, eyes flaring."],
          choices:[
            {label:"Match its strength blow for blow", stat:"Might", tag:"Might",
              success:"You find the crack in its armor and the golem crumbles apart, leaving its ore trove behind.", reward:{gold:15},
              partial:"You beat it down but take some hard hits in the process.", partialDamage:7,
              fail:"The golem's fists prove too much to withstand.", failDamage:13},
            {label:"Dodge its heavy strikes and look for a weak point", stat:"Agility", tag:"Agility",
              success:"You spot a joint in its armor and slip a weapon straight into it — golem down, ore claimed!", reward:{item:true},
              partial:"You avoid the worst of it but get clipped once.", partialDamage:5,
              fail:"You misjudge its speed for something so large and get swatted hard.", failDamage:11},
            {label:"Disrupt the magic animating it", stat:"Magic", tag:"Magic",
              success:"Your spell unravels the binding magic instantly — the golem freezes mid-swing, harmless.", reward:{gold:12},
              partial:"The magic weakens but doesn't fully stop the golem.", partialDamage:5,
              fail:"The golem resists your spell entirely and slams into you.", failDamage:12}
          ]}
      ]
    ]
  },
  { // CH 4
    id:"ruins", title:"The Forgotten Ruins", scene:"ruins",
    intro:[
      "{weather} the Forgotten Ruins, where crumbling stone pillars once held a great temple. {villainTitle}'s mark is scrawled across broken altars here.",
      "Vines swallow broken statues in the Forgotten Ruins. The air hums with residual magic — someone powerful has been here recently.",
      "Fallen pillars and shattered mosaics cover the floor of the Forgotten Ruins, ancient and uneasy underfoot."
    ],
    slots:[
      [
        { id:"guardian_statue", text:["A towering stone guardian stirs to life, its eyes glowing as it blocks the inner sanctum.","An ancient construct rumbles awake, demanding a trial before it will let you pass."],
          choices:[
            {label:"Answer its riddle with sharp wit", stat:"Magic", tag:"Magic",
              success:"The guardian is pleased with your cleverness and steps aside, revealing a treasure alcove.", reward:{item:true, gold:15},
              partial:"You answer well enough; it grudgingly lets you pass.", fail:"Your answer is wrong and the guardian swings a stone fist.", failDamage:11},
            {label:"Prove your strength in a trial of force", stat:"Might", tag:"Might",
              success:"You best the guardian's test of strength, earning its respect and a token of passage.", reward:{item:true},
              partial:"You pass the trial but it costs you dearly.", partialDamage:7,
              fail:"The guardian overpowers you completely.", failDamage:12},
            {label:"Show reverence and offer a respectful bow", stat:"Spirit", tag:"Spirit",
              success:"The guardian recognizes true respect and grants safe passage plus its blessing.", reward:{healAll:10},
              partial:"The guardian is unmoved but doesn't attack.", fail:"The guardian interprets your gesture as mockery.", failDamage:9}
          ]},
        { id:"collapsed_library", text:["Shelves of crumbling scrolls fill a half-collapsed library chamber, fragile and ready to fall at the slightest disturbance.","Ancient texts lie scattered beneath a cracked, unstable ceiling. Some of them might be worth the risk."],
          choices:[
            {label:"Carefully brace the shelves while searching", stat:"Might", tag:"Might",
              success:"You hold the structure steady long enough to find a genuinely useful old tome.", reward:{item:true},
              partial:"You find a few readable pages before the shelves groan a warning.", partialDamage:4,
              fail:"The shelves give way, burying you briefly under old scrolls.", failDamage:9},
            {label:"Move quickly and quietly through the stacks", stat:"Agility", tag:"Agility",
              success:"You dart between unstable shelves and emerge with a pocketful of ancient coins.", reward:{gold:18},
              partial:"You grab what you can before retreating carefully.", fail:"A shelf topples right as you pass beneath it.", failDamage:10},
            {label:"Use magic to sense which texts matter most", stat:"Magic", tag:"Magic",
              success:"You pinpoint a genuinely powerful scroll of forgotten magic among the rubble.", reward:{flag:"ruins_lore"},
              partial:"You sense something useful but can't quite locate it in time.", fail:"Your detection spell stirs dust that triggers a coughing fit and a small collapse.", failDamage:8}
          ]}
      ],
      [
        { id:"trapped_hallway", text:["A long hallway lined with pressure plates and faint dart-holes in the walls stretches ahead.","The hallway floor is subtly uneven — a telltale sign of old traps still armed."],
          choices:[
            {label:"Carefully pick your way across", stat:"Agility", tag:"Agility",
              success:"You thread the hallway perfectly, triggering nothing at all.", damage:0,
              partial:"You trigger one dart trap but shrug it off.", partialDamage:4,
              fail:"You misstep and trigger a volley of darts.", failDamage:10},
            {label:"Sense the magic woven into the traps", stat:"Magic", tag:"Magic",
              success:"You detect and disarm every trap with a wave of your hand.", damage:0,
              partial:"You disarm most traps, but one slips by.", partialDamage:5,
              fail:"Your detection spell misreads the traps entirely.", failDamage:11},
            {label:"Push through quickly, trusting your resilience", stat:"Might", tag:"Might",
              success:"You power through, shrugging off the minor traps that do trigger.", damage:0,
              partial:"You take a few hits but make it through.", partialDamage:6,
              fail:"You're caught by multiple traps at once.", failDamage:13}
          ]},
        { id:"mirror_maze", text:["A chamber of tall, cracked mirrors confuses every sense of direction — and some reflections don't quite match your movements.","Dozens of mirror shards reflect the party a hundred times over, some moving a half-second too late to be right."],
          choices:[
            {label:"Trust your instincts and push straight through", stat:"Might", tag:"Might",
              success:"You barrel through the confusing reflections by sheer determination, cracking a path clear.", damage:0,
              partial:"You push through but bruise yourself on unseen mirror edges.", partialDamage:5,
              fail:"You swing at a reflection and the real wall hits back.", failDamage:10},
            {label:"Move carefully, watching for mismatched reflections", stat:"Agility", tag:"Agility",
              success:"You spot the one true path by watching which reflections lag behind.", damage:0,
              partial:"You find the way but it takes a few wrong turns first.", partialDamage:4,
              fail:"You follow a false reflection and crash into broken glass.", failDamage:9},
            {label:"Cast a spell to reveal the true path", stat:"Magic", tag:"Magic",
              success:"A pulse of magic makes the real path glow gold — straightforward from here!", reward:{flag:"mirror_solved"},
              partial:"The spell reveals part of the path, the rest is guesswork.", partialDamage:3,
              fail:"The spell instead doubles the confusing reflections.", failDamage:10}
          ]}
      ],
      [
        { id:"cursed_relic", text:["A glowing relic sits atop a pedestal, {treasureFlavor}. Taking it feels like it would come at a price.","An ornate box pulses with dark and light energy intertwined — clearly cursed, clearly valuable."],
          choices:[
            {label:"Purify the curse with a ritual", stat:"Spirit", tag:"Spirit",
              success:"You cleanse the relic completely — it's now a safe, powerful item for the party!", reward:{item:true},
              partial:"You weaken the curse but it's not fully gone.", fail:"The curse lashes back violently as you attempt the ritual.", failDamage:10},
            {label:"Analyze the magic before touching it", stat:"Magic", tag:"Magic",
              success:"You understand the curse completely and bypass it safely, relic in hand.", reward:{item:true},
              partial:"You get a partial read and proceed cautiously, but take some backlash.", partialDamage:5,
              fail:"You misjudge the magic and the curse backfires badly.", failDamage:12},
            {label:"Just grab it fast and deal with consequences later", stat:"Agility", tag:"Agility",
              success:"Your speed outpaces the curse's trigger — clean grab, no consequence!", reward:{item:true},
              partial:"You grab it but the curse nicks you on the way out.", partialDamage:6,
              fail:"The curse detonates in your hands before you can let go.", failDamage:13}
          ]},
        { id:"sealed_tomb", text:["A heavy stone sarcophagus, sealed with old wards, sits at the center of a quiet chamber — too quiet, somehow.","Faint whispers seem to come from a sealed tomb, as if something inside is waiting, patiently, for a very long time."],
          choices:[
            {label:"Force the heavy seal open", stat:"Might", tag:"Might",
              success:"You break the seal cleanly — inside is ancient treasure, untouched for centuries.", reward:{gold:22},
              partial:"You force it open, but the effort drains you.", partialDamage:5,
              fail:"The seal resists and the backlash knocks you flat.", failDamage:11},
            {label:"Carefully disable the wards first", stat:"Magic", tag:"Magic",
              success:"You dismantle the protective wards perfectly, revealing a pristine enchanted item inside.", reward:{item:true},
              partial:"You disable most wards but one triggers a small shock.", partialDamage:4,
              fail:"The wards flare violently against your fumbled attempt.", failDamage:11},
            {label:"Leave it be and quietly move on", stat:"Spirit", tag:"Spirit",
              success:"Your respect for the dead is noted somehow — a faint blessing settles over the party as you leave.", reward:{healAll:6},
              partial:"Nothing happens either way, but nothing is lost.", fail:"Walking away still stirs something uneasy that lingers with you.", failDamage:3}
          ]}
      ]
    ]
  },
  { // CH 5
    id:"approach", title:"The Dragon's Approach", scene:"lair_approach",
    intro:[
      "{weather} the scorched foothills leading to {dragonName}'s lair. The ground is littered with scorched stone and the air shimmers with heat even in shadow.",
      "Ash drifts like snow near the mountain pass. {dragonName} has clearly been busy — and {villainTitle}'s banners now fly over the old watchtowers.",
      "The air grows hotter with every step toward {dragonName}'s mountain. Scorched trees mark how close you've come."
    ],
    slots:[
      [
        { id:"villain_lieutenant", text:["A lieutenant of {villainTitle}, clad in dark armor, steps out to bar the final approach, flanked by snarling beasts.","A fearsome enforcer blocks the mountain path, sneering down at your party."],
          choices:[
            {label:"Challenge them to single combat", stat:"Might", tag:"Might",
              success:"A decisive, powerful victory! The lieutenant flees, beasts scattering.", damage:0,
              partial:"You win, but barely, and it costs stamina.", partialDamage:8,
              fail:"The lieutenant proves stronger than expected.", failDamage:14},
            {label:"Outmaneuver them and slip past the guard", stat:"Agility", tag:"Agility",
              success:"You dance past their strikes entirely and reach the pass untouched!", damage:0,
              partial:"You get past but take a glancing blow.", partialDamage:6,
              fail:"They anticipate your move and strike hard.", failDamage:12},
            {label:"Unleash a powerful spell barrage", stat:"Magic", tag:"Magic",
              success:"Your spellwork overwhelms them completely — a clean, dazzling win!", damage:0,
              partial:"Your spells land but their armor absorbs most of it, and they strike back.", partialDamage:7,
              fail:"Your magic fizzles against their enchanted armor.", failDamage:13}
          ]},
        { id:"ambush_archers", text:["Arrows hiss down from hidden perches along the cliffside — {villainTitle}'s archers have been waiting for you.","Shadows shift among the rocks above; you're walking straight into an ambush."],
          choices:[
            {label:"Charge the cliffside to close the distance fast", stat:"Might", tag:"Might",
              success:"You scale the rocks in a flash and scatter the archers before they can reload.", damage:0,
              partial:"You reach them, but take a couple of arrows on the way up.", partialDamage:7,
              fail:"The climb is slow and the arrows find their mark repeatedly.", failDamage:13},
            {label:"Weave through cover to avoid the volley", stat:"Agility", tag:"Agility",
              success:"You dart from rock to rock, untouched, and the archers lose track of you completely.", damage:0,
              partial:"You dodge most shots but one grazes you.", partialDamage:5,
              fail:"An arrow catches you in the open before you reach cover.", failDamage:11},
            {label:"Blind them with a flash of magical light", stat:"Magic", tag:"Magic",
              success:"A brilliant flash blinds the archers completely — you pass by without a single shot fired.", damage:0,
              partial:"The flash disrupts most of their aim, but not all.", partialDamage:5,
              fail:"The spell fizzles and the archers have a clear shot.", failDamage:12}
          ]}
      ],
      [
        { id:"final_prep", text:["Before the last climb, your party finds a quiet hollow to rest and prepare. This may be your last calm moment before {dragonName}.","A hidden shrine near the summit offers a final chance to steady your nerves."],
          choices:[
            {label:"Meditate and steel your resolve", stat:"Spirit", tag:"Spirit",
              success:"Deep calm settles over the party — everyone heals and feels ready for anything.", reward:{healAll:15},
              partial:"You feel somewhat steadier.", fail:"Doubt creeps in despite your efforts."},
            {label:"Study what you know of the dragon's weaknesses", stat:"Magic", tag:"Magic",
              success:"Everything clicks into place — you understand exactly how to face {dragonName}.", reward:{flag:"dragon_weakness"},
              partial:"You recall fragments of old lore.", fail:"Your focus slips and the knowledge stays just out of reach."},
            {label:"Scout the lair's entrance for the best approach", stat:"Agility", tag:"Agility",
              success:"You find a hidden side passage that will give the party an advantage in the final battle.", reward:{flag:"lair_shortcut"},
              partial:"You get a rough idea of the layout.", fail:"You're nearly spotted by a sentry and have to retreat quickly.", failDamage:5}
          ]},
        { id:"omen_reading", text:["A strange old shrine along the path is covered in carved omens — some travelers say reading them right can change your fortune ahead.","Weathered stones etched with symbols mark a crossroads just before the final climb."],
          choices:[
            {label:"Offer a quiet prayer at the shrine", stat:"Spirit", tag:"Spirit",
              success:"A warm feeling of protection settles over the whole party before the final climb.", reward:{healAll:12},
              partial:"You feel a small comfort, nothing more.", fail:"The omens seem to turn sour, unsettling everyone.", failDamage:4},
            {label:"Decipher the omens for useful knowledge", stat:"Magic", tag:"Magic",
              success:"The omens reveal the dragon's exact pattern of attack — invaluable for the fight ahead.", reward:{flag:"omen_insight"},
              partial:"You decipher only fragments of the meaning.", fail:"You misread the omens entirely, and the misreading costs you confidence.", failDamage:3},
            {label:"Skip the shrine and press on quickly", stat:"Agility", tag:"Agility",
              success:"You make excellent time and arrive at the lair with energy to spare.", reward:{gold:10},
              partial:"You press on, saving some time but no real gain.", fail:"Rushing past, you trip on loose scree and take a tumble.", failDamage:6}
          ]}
      ]
    ]
  },
  { // CH 6 — FINAL BOSS
    id:"finale", title:"The Dragon's Lair", scene:"lair_final",
    intro:[
      "{weather} the heart of the mountain. {dragonName} coils atop a hoard of gold and bone, eyes opening slowly as your party enters. \"So,\" it rumbles, \"more heroes come to die.\"",
      "The final chamber glows with heat. {dragonName} rises to full height, wings unfurling, and {villainTitle}'s dark magic crackles around its scales.",
      "Heat rolls off the chamber walls in waves. {dragonName} watches from atop its hoard, utterly unafraid of one more band of heroes."
    ],
    slots:[
      [
        { id:"dragon_phase1", text:["{dragonName} rakes the ground with massive claws, sizing up the party for its first strike.","The dragon circles, flame building in its throat."],
          choices:[
            {label:"Stand your ground and strike hard", stat:"Might", tag:"Might",
              success:"A solid hit lands on an exposed scale — {dragonName} roars in pain!", damage:0,
              partial:"You land a hit but take a swipe of claws in return.", partialDamage:9,
              fail:"The dragon's hide shrugs off your attack and retaliates.", failDamage:15},
            {label:"Dodge and strike from an opening", stat:"Agility", tag:"Agility",
              success:"You dart between its legs and strike a tender spot — critical damage!", damage:0,
              partial:"You land a glancing hit but get caught by the tail.", partialDamage:8,
              fail:"You misjudge the dragon's speed and get knocked back hard.", failDamage:14},
            {label:"Hurl a blast of arcane energy", stat:"Magic", tag:"Magic",
              success:"Your spell detonates against its chest, staggering the great beast!", damage:0,
              partial:"The spell connects weakly; the dragon shrugs and breathes fire near you.", partialDamage:10,
              fail:"The dragon resists your magic entirely and blasts you with flame.", failDamage:16}
          ]},
        { id:"dragon_phase1_alt", text:["{dragonName} slams its tail across the chamber, scattering loose gold and sending a shockwave through the floor.","With a deafening roar, {dragonName} rears up, daring the party to make the first move."],
          choices:[
            {label:"Smash through the falling debris to strike", stat:"Might", tag:"Might",
              success:"You power through the chaos and land a heavy blow right on an old scar in its hide!", damage:0,
              partial:"You connect, but debris batters you on the way.", partialDamage:9,
              fail:"The shockwave throws you off balance completely before you can strike.", failDamage:15},
            {label:"Use the scattering gold as cover and strike fast", stat:"Agility", tag:"Agility",
              success:"You vanish into the gold-dust chaos and strike from an angle it never saw coming!", damage:0,
              partial:"You strike but a loose coin pile trips you up afterward.", partialDamage:8,
              fail:"You're caught in the open as the tail sweeps back around.", failDamage:14},
            {label:"Channel magic through the chaos for a precise strike", stat:"Magic", tag:"Magic",
              success:"Your spell cuts clean through the dust and chaos, striking true!", damage:0,
              partial:"Your aim is thrown off by the shaking ground, only a partial hit lands.", partialDamage:9,
              fail:"The dragon's roar disrupts your spellcasting entirely.", failDamage:16}
          ]}
      ],
      [
        { id:"dragon_phase2", text:["Wounded and furious, {dragonName} takes to the air, circling for a devastating dive.","The dragon's roar shakes dust from the ceiling as it prepares its next assault."],
          choices:[
            {label:"Hold firm and brace for impact, then counter", stat:"Might", tag:"Might",
              success:"You weather the dive and land a crushing counterblow as it lands!", damage:0,
              partial:"You brace but still take heavy impact.", partialDamage:9,
              fail:"The dive flattens you before you can react.", failDamage:15},
            {label:"Use the terrain to evade the dive entirely", stat:"Agility", tag:"Agility",
              success:"You roll clear at the last second and the dragon crashes into rubble, stunned!", damage:0,
              partial:"You mostly dodge but debris catches you.", partialDamage:7,
              fail:"You're caught in the dragon's wake, slammed into the wall.", failDamage:14},
            {label:"Weave a protective ward over the party", stat:"Spirit", tag:"Spirit",
              success:"The ward holds perfectly — the whole party is shielded from the dive!", reward:{healAll:5},
              partial:"The ward partially holds, softening the blow.", partialDamage:6,
              fail:"The ward crumbles instantly under the dragon's fury.", failDamage:13}
          ]},
        { id:"dragon_phase2_alt", text:["{dragonName} rakes the chamber with a sweeping gout of flame, forcing the party to scatter.","Burning cracks spread across the floor as {dragonName} unleashes a wave of fire across the chamber."],
          choices:[
            {label:"Push through the flame wall with raw grit", stat:"Might", tag:"Might",
              success:"You shoulder through the firestorm and land a massive blow before it can recover!", damage:0,
              partial:"You push through, singed but still standing.", partialDamage:9,
              fail:"The flame wave is too intense and washes over you fully.", failDamage:16},
            {label:"Sprint along the chamber's edge to avoid the flame", stat:"Agility", tag:"Agility",
              success:"You skirt the very edge of the inferno, untouched, and strike from the side!", damage:0,
              partial:"You mostly avoid the flame but your sleeve catches fire briefly.", partialDamage:7,
              fail:"You misjudge the flame's spread and get caught in the heat.", failDamage:15},
            {label:"Raise a shield of cool arcane mist", stat:"Spirit", tag:"Spirit",
              success:"Your shield of mist holds strong, protecting the whole party from the inferno!", reward:{healAll:4},
              partial:"The mist helps, but some heat gets through regardless.", partialDamage:6,
              fail:"The mist evaporates instantly against the dragon's fire.", failDamage:14}
          ]}
      ],
      [
        { id:"dragon_final", text:["{dragonName} rears back for one last, desperate breath of flame, {villainTitle}'s magic swirling furiously around it. This is the moment that decides everything.","Weakened but still dangerous, the dragon gathers every last bit of its power for a final strike."],
          choices:[
            {label:"Deliver the final blow with raw power", stat:"Might", tag:"Might",
              success:"A legendary strike! {dragonName} roars one last time and collapses — victory is yours!", damage:0,
              partial:"You land the blow, but it costs the party dearly in the process.", partialDamage:10,
              fail:"The dragon's last breath catches you fully.", failDamage:18},
            {label:"Find the one weak point and strike true", stat:"Magic", tag:"Magic",
              success:"Your spell finds the exact weak point in its scales — a spectacular, clean finish!", damage:0,
              partial:"You hit close to the mark, enough to finish it, but barely.", partialDamage:9,
              fail:"Your spell goes wide and the dragon's flame engulfs the party.", failDamage:17},
            {label:"Trust your spirit and strike with everything you have", stat:"Spirit", tag:"Spirit",
              success:"Fueled by courage and heart, your strike ends the battle in a blaze of light!", damage:0,
              partial:"Your courage carries you through, though wounded.", partialDamage:9,
              fail:"Even your resolve isn't enough this time.", failDamage:17}
          ]},
        { id:"dragon_final_alt", text:["{dragonName}, bleeding and furious, slams down for one last crushing strike, {villainTitle}'s magic flaring wildly around it.","The cavern shakes as {dragonName} gathers everything it has left for a final, desperate assault."],
          choices:[
            {label:"Meet the final strike head-on with everything you have", stat:"Might", tag:"Might",
              success:"You meet the blow and answer with one of your own — {dragonName} finally falls!", damage:0,
              partial:"You hold your ground, but the clash leaves you battered.", partialDamage:10,
              fail:"The final strike is simply too much to withstand.", failDamage:18},
            {label:"Outlast it with speed, waiting for the perfect opening", stat:"Agility", tag:"Agility",
              success:"You slip the final blow entirely and strike the one unguarded moment it has left!", damage:0,
              partial:"You find an opening but pay for it with a glancing hit.", partialDamage:9,
              fail:"You misjudge the timing and the strike catches you fully.", failDamage:17},
            {label:"Pour every bit of magic you have into one last spell", stat:"Magic", tag:"Magic",
              success:"Your spell erupts with everything you have — {dragonName} collapses in a final blaze of light!", damage:0,
              partial:"The spell connects but drains you nearly dry.", partialDamage:9,
              fail:"Your magic falters at the worst possible moment.", failDamage:17}
          ]}
      ]
    ]
  }
];

// -------------------- ENDING VARIANTS --------------------
const ENDINGS_VICTORY = [
  "The dragon {dragonName} is defeated! {villainTitle}'s dark magic unravels into harmless smoke. The village, and the whole realm, will sing songs of this day for generations.",
  "With {dragonName} fallen, the shadow over the land lifts at once. Villagers emerge from hiding, cheering as your party returns home as true legends.",
  "As {dragonName} collapses, its hoard scatters across the cavern floor. {villainTitle}'s plans lie in ruins, and peace returns to the realm — thanks to you."
];
const ENDINGS_DEFEAT = [
  "The party fights valiantly, but is overwhelmed. Still, word of your courage spreads, and new heroes will rise to finish what you started.",
  "Though wounded and weary, your party retreats to fight another day. {dragonName} roars in triumph, but the story isn't over yet."
];
