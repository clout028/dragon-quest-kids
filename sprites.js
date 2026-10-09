// ===================== PIXEL SPRITES (character classes & encounter icons) =====================
// Hand-authored pixel grids (each row = string, each char = palette key, '.' = transparent).
// Rendered at native pixel size then scaled up with image-rendering:pixelated
// for a true blocky retro look (NES/Game Boy era), not smooth icons.

const SPRITE_PALETTE = {
  k:'#1a1030', K:'#000000', w:'#f4f0ff', W:'#ffffff',
  r:'#ff5a5a', R:'#a02020', g:'#4ade80', G:'#1f6b35',
  b:'#60a5fa', B:'#2a5a9a', y:'#ffd54a', Y:'#b8860b',
  o:'#ff9a4a', O:'#a0501a', p:'#c084fc', P:'#6a3a9a',
  n:'#8a6a46', N:'#5c4530', s:'#9aa0b0', S:'#555b66',
  e:'#2f5c2f', f:'#ff2a2a', c:'#d8c8ff', m:'#6b4a2e', '.':null
};

function drawSprite(canvas, grid, scale){
  const rows = grid.length, cols = grid[0].length;
  const ctx = canvas.getContext('2d');
  canvas.width = cols; canvas.height = rows;
  ctx.imageSmoothingEnabled = false;
  canvas.style.imageRendering = 'pixelated';
  canvas.style.width = (cols*(scale||1))+'px';
  canvas.style.height = (rows*(scale||1))+'px';
  ctx.clearRect(0,0,cols,rows);
  for(let y=0;y<rows;y++){
    for(let x=0;x<cols;x++){
      const ch = grid[y][x];
      const color = SPRITE_PALETTE[ch];
      if(!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x,y,1,1);
    }
  }
}

// -------- CLASS PORTRAIT SPRITES (16x16) --------
const CLASS_SPRITES = {
  warrior:[
    "....kkkkkkkk....",
    "...ksssssssk....",
    "..ksWWWWWWsk....",
    "..ksWwwwwwsk....",
    "..ksWkkkkwsk....",
    "...kWwwwWk......",
    "....kssssk......",
    "..NNkkkkkkNN....",
    ".Nnnnksssknnn...",
    "Nnnnnnkskkknnn..",
    "Nnnnnn.sk.nnnnN.",
    ".Nnnn..sk..nnN..",
    "...ss..sk..ss...",
    "...ss..sk..ss...",
    "..SSS...SSS.....",
    "................"
  ],
  rogue:[
    "................",
    "....kkkkkkkk....",
    "...kGGGGGGGk....",
    "..kGwwwwwwGk....",
    "..kGwkkkkwGk....",
    "...kGffGGk......",
    "....kGGGk.......",
    "..GGkkkkkkGG....",
    ".GgggkssskgggG..",
    "Gggggg.sk.ggggG.",
    "ggggg..sk..ggggg",
    ".gggg..sk..gggg.",
    "...ss..sk..ss...",
    "...ss......ss...",
    "..SSS......SSS..",
    "................"
  ],
  wizard:[
    "......byyb......",
    ".....byyyyb.....",
    "....bBBBBBBb....",
    "...bBwwwwwwBb...",
    "..kBwkkkkwBk....",
    "...kWkbbkWk.....",
    "....kbbbbk......",
    "..BBkkkkkkBB....",
    ".BbbbkssskbbbB..",
    "Bbbbbb.sk.bbbbB.",
    "bbbbb..sk..bbbbb",
    ".bbbb..sk..bbbb.",
    "...ss..sk..ss...",
    "...ss..yy..ss...",
    "..SSS..yy..SSS..",
    "........y........"
  ],
  cleric:[
    "......wwww......",
    ".....wyyyyw.....",
    "....wPPPPPPw....",
    "...wPwwwwwwPw...",
    "..kPwkkkkwPk....",
    "...kWwppwWk.....",
    "....kppppk......",
    "..PPkkkkkkPP....",
    ".PpppkssskpppP..",
    "Ppppppp sk ppppP",
    "ppppp..sk..ppppp",
    ".pppp..sk..pppp.",
    "...ss..sk..ss...",
    "...ss..ww..ss...",
    "..SSS..ww..SSS..",
    "................"
  ],
  ranger:[
    "................",
    "....kkkkkkkk....",
    "...keeeeeeek....",
    "..keWwwwwwek....",
    "..keWkkkkwek....",
    "...kWooooWk.....",
    "....keeeek......",
    "..eekkkkkkee....",
    ".eeeekssskeeee..",
    "eeeeee.sk.eeeeee",
    "eeeee..sk..eeeee",
    ".eeee..sk..eeee.",
    "...ss..sk..ss...",
    "...ss..nn..ss...",
    "..SSS..nn..SSS..",
    "................"
  ]
};

// -------- ENCOUNTER SPRITES (small scene icons, 16x16 or 18x14) --------
const ENCOUNTER_SPRITES = {
  market_choice:[
    "................",
    "....kkkkkkkk....",
    "...knnnnnnnk....",
    "..knyynnnnynk...",
    "..knnnnnnnnnk...",
    "..kNNNNNNNNNk...",
    "...k.k.k.k.k....",
    "................"
  ],
  wolf_pack:[
    "..k.......k.....",
    ".kyk.....kyk....",
    "kkkkk...kkkkk...",
    "kwwwkk.kkwwwk...",
    "kwwwwkkkwwwwk...",
    ".kkkkkkkkkkk....",
    "..kkk...kkk.....",
    "................"
  ],
  spider_ambush:[
    ".k.k.k.k.k.k....",
    "..kkkkkkkkk.....",
    ".kkkRRRRRkk.....",
    "kkkRRyyRRkkk....",
    ".kkkRRRRRkk.....",
    "..kkkkkkkkk.....",
    ".k.k.k.k.k.k....",
    "................"
  ],
  ancient_tree:[
    "....gggggg......",
    "...gggggggg.....",
    "..gggyygggg.....",
    "...gggggggg.....",
    "....nnnnnn......",
    "....nnnnnn......",
    "....NNNNNN......",
    "................"
  ],
  river_crossing:[
    "................",
    "bbbbbbbbbbbbbbbb",
    "bwbbbbwbbbbwbbbb",
    "bbbbwbbbbbwbbbbb",
    "bwbbbbwbbbbwbbbb",
    "bbbbbbbbbbbbbbbb",
    "................",
    "................"
  ],
  cave_collapse:[
    "ssss..ss..ssss..",
    ".ss....ss..ss...",
    "..s..ss..s..ss..",
    "...............", 
    "..NNNNNNNNNN....",
    ".NnnnnnnnnnnN...",
    "................",
    "................"
  ],
  crystal_puzzle:[
    "......bb........",
    ".....bccb.......",
    "....bccccb......",
    ".....bccb.......",
    "......bb........",
    "................",
    "................",
    "................"
  ],
  guardian_statue:[
    "....ssssss......",
    "...sWWWWWWs.....",
    "...sWkkkkWs.....",
    "....ssssss......",
    "....ss..ss......",
    "...sss..sss.....",
    "...SSS..SSS.....",
    "................"
  ],
  cursed_relic:[
    "......PP........",
    ".....PffP.......",
    ".....PffP.......",
    "......PP........",
    "......yy........",
    "................",
    "................",
    "................"
  ],
  villain_lieutenant:[
    "....KKKKKKKK....",
    "...KfRfRfRfK....",
    "..KRRRRRRRRK....",
    "..KRkkkkkkRK....",
    "...KRRRRRRK.....",
    "..RRKKKKKKRR....",
    ".RrrrkssskrrrR..",
    "................"
  ],
  dragon_phase1:[
    "..g.........g...",
    ".ggg..gggg.ggg..",
    "ggggggGGGGggggg.",
    "gggGGrrrrGGggggg",
    ".ggGrfyyfrGgggg.",
    "..gGrrrrrrGgg...",
    "...gGGggGGg.....",
    "................"
  ],
  dragon_final:[
    "..g.ff.....ff.g.",
    ".ggg..gggg.ggg..",
    "ggggggGGGGggggg.",
    "gggGGrrrrGGggggg",
    ".ggGrfyyfrGgggg.",
    "..gGrrrrrrGgg...",
    "...gGGyyGGg.....",
    "....yyyyyy......"
  ],
  default:[
    "........yy......",
    ".......yyyy.....",
    "......yyyyyy....",
    "yyyyyyyyyyyyyyyy",
    ".yyyyyyyyyyyyyy.",
    "..yyyy....yyyy..",
    ".yyy........yyy.",
    "................"
  ]
};

function getEncounterSprite(id){
  return ENCOUNTER_SPRITES[id] || ENCOUNTER_SPRITES.default;
}

// -------- TITLE SCREEN DRAGON (bigger, 24x24) --------
const TITLE_DRAGON_SPRITE = [
  "........gg..............",
  ".......gGGg.............",
  "......gGGGGg...ff.......",
  ".....gGGGGGg..ffff......",
  "....gGGGGGGGgffff.......",
  "...gGGGyyGGGGGg.........",
  "..gGGGGyyGGGGGGg........",
  ".gGGGGGGGGGGGGGGg.......",
  "gGGGGrrrrrrGGGGGGg......",
  "gGGGrrffffrrGGGGGg......",
  ".gGGrrffffrrGGGGg.......",
  "..gGGrrrrrrGGGGg........",
  "...gGGGGGGGGGGg.........",
  "....ggGGGGGGgg..........",
  "......ggggggg...........",
  "......gg...gg...........",
  ".....ggg...ggg..........",
  ".....SS.....SS..........",
  ".........................",
  "........................."
];
