// ===================== DRAGON QUEST KIDS — GAME ENGINE =====================
'use strict';

const VILLAGE_NAMES = ["Millbrook", "Oakhaven", "Stonewell", "Larkspur Hollow", "Grey Bridge"];

const STATE = {
  partySize: 1,
  heroes: [],          // {name, classId, stats, hp, maxHp, level, xp, items:[]}
  gold: 0,
  creatingIndex: 0,
  selectedClassId: null,
  chapterIdx: 0,
  nodeIdx: 0,
  chapterPlan: [],      // [{def, nodes:[nodeDef,...]}]
  turnCounter: 0,
  run: {},              // flavor for this playthrough
  pendingLevelQueue: [],
  pendingLootQueue: [],
  currentChoiceCtx: null,
  reviveUsedThisChapter: false,
  pendingRevive: null
};

const SAVE_KEY = 'dqk_save_v1';
const STATS_KEY = 'dqk_lifetime_stats_v1';

function loadLifetimeStats(){
  try{
    const raw = localStorage.getItem(STATS_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {gamesPlayed:0, victories:0, defeats:0, dragonsDefeated:0, classCounts:{}, totalGold:0, highestLevel:1};
}
function saveLifetimeStats(stats){
  try{ localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }catch(e){}
}

function saveGame(){
  try{
    const snapshot = {
      partySize: STATE.partySize, heroes: STATE.heroes, gold: STATE.gold,
      chapterIdx: STATE.chapterIdx, nodeIdx: STATE.nodeIdx, chapterPlan: STATE.chapterPlan,
      turnCounter: STATE.turnCounter, run: STATE.run, reviveUsedThisChapter: STATE.reviveUsedThisChapter
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
  }catch(e){ /* storage full or unavailable — fail silently, not critical */ }
}
function clearSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
function loadSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return null;
}

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function heroEffectiveStat(hero, stat){
  let v = hero.stats[stat];
  hero.items.forEach(itId=>{
    const it = getItem(itId);
    if(it && it.bonus[stat]) v += it.bonus[stat];
  });
  return v;
}

function livingHeroes(){ return STATE.heroes.filter(h=>h.hp>0); }

// Prep flags collected in earlier chapters pay off as a roll bonus in the
// finale (last chapter) — so scouting ahead, learning dragon lore, etc.
// actually matters mechanically instead of being purely decorative.
function prepBonus(chapterIdx){
  if(!STATE.chapterPlan.length || chapterIdx !== STATE.chapterPlan.length - 1) return 0;
  const count = PREP_FLAGS.filter(f => STATE.run[f]).length;
  return Math.min(3, count); // up to +3 in the final chapter
}

function oddsHint(mod){
  // quick read on how good a d10+mod roll is, without spelling out exact math
  if(mod >= 4) return "Great odds!";
  if(mod >= 2) return "Good odds";
  if(mod >= 0) return "Fair odds";
  return "Risky";
}

function template(str){
  const r = STATE.run;
  return str
    .replace(/\{weather\}/g, pick(FLAVOR.weather))
    .replace(/\{village\}/g, r.village)
    .replace(/\{villainTitle\}/g, r.villainTitle)
    .replace(/\{dragonName\}/g, r.dragonName)
    .replace(/\{treasureFlavor\}/g, pick(FLAVOR.treasureFlavor))
    .replace(/\{mentor\}/g, r.mentor)
    .replace(/\{npc\}/g, pick(FLAVOR.npcNames));
}

// ===================== UI OBJECT =====================
const UI = {

  startSetup(){
    SFX.click();
    const wrap = document.getElementById('partyCountBtns');
    wrap.innerHTML = '';
    [1,2,3,4].forEach(n=>{
      const b = document.createElement('button');
      b.className = 'btn count-btn' + (n===STATE.partySize ? '' : ' secondary');
      b.textContent = n;
      b.onclick = ()=>{ SFX.click(); STATE.partySize = n; this.startSetup(); };
      wrap.appendChild(b);
    });
    showScreen('screen-partysize');
  },

  checkResume(){
    const save = loadSave();
    const btn = document.getElementById('resumeBtn');
    if(save && btn){ btn.style.display = 'inline-flex'; } else if(btn){ btn.style.display = 'none'; }
  },

  resumeGame(){
    const save = loadSave();
    if(!save){ this.checkResume(); return; }
    STATE.partySize = save.partySize;
    STATE.heroes = save.heroes;
    STATE.gold = save.gold;
    STATE.chapterIdx = save.chapterIdx;
    STATE.nodeIdx = save.nodeIdx;
    STATE.chapterPlan = save.chapterPlan;
    STATE.turnCounter = save.turnCounter;
    STATE.run = save.run;
    STATE.reviveUsedThisChapter = save.reviveUsedThisChapter || false;
    showScreen('gameScreen');
    if(STATE.nodeIdx < 0){ this.renderChapterIntro(); }
    else { this.renderNode(); }
  },

  showStats(){
    const stats = loadLifetimeStats();
    const el = document.getElementById('statsContent');
    const favClass = Object.entries(stats.classCounts).sort((a,b)=>b[1]-a[1])[0];
    const favLabel = favClass ? (getClass(favClass[0]) ? getClass(favClass[0]).name : favClass[0]) : '—';
    el.innerHTML = `
      <div class="stat-card"><span>🎮 Games Played</span><span class="big">${stats.gamesPlayed}</span></div>
      <div class="stat-card"><span>🏆 Victories</span><span class="big">${stats.victories}</span></div>
      <div class="stat-card"><span>💀 Defeats</span><span class="big">${stats.defeats}</span></div>
      <div class="stat-card"><span>🐉 Dragons Defeated</span><span class="big">${stats.dragonsDefeated}</span></div>
      <div class="stat-card"><span>⭐ Highest Level Reached</span><span class="big">${stats.highestLevel}</span></div>
      <div class="stat-card"><span>💰 Total Gold Earned</span><span class="big">${stats.totalGold}</span></div>
      <div class="stat-card"><span>❤️ Favorite Class</span><span class="big" style="font-size:1.1em;">${favLabel}</span></div>
    `;
    showScreen('screen-stats');
  },

  confirmPartySize(){
    STATE.heroes = [];
    STATE.creatingIndex = 0;
    showScreen('screen-create');
    this.renderCreate();
  },

  renderCreate(resetSelection){
    // tabs
    const tabs = document.getElementById('playerTabs');
    tabs.innerHTML = '';
    for(let i=0;i<STATE.partySize;i++){
      const t = document.createElement('div');
      t.className = 'player-tab' + (i===STATE.creatingIndex ? ' active':'') + (i<STATE.heroes.length ? ' done':'');
      t.textContent = 'Player ' + (i+1);
      tabs.appendChild(t);
    }
    const existing = STATE.heroes[STATE.creatingIndex];
    if(resetSelection !== false){
      document.getElementById('nameInput').value = existing ? existing.name : '';
      STATE.selectedClassId = existing ? existing.classId : null;
    }

    const grid = document.getElementById('classGrid');
    grid.innerHTML = '';
    CLASSES.forEach(c=>{
      const card = document.createElement('div');
      card.className = 'class-card' + (STATE.selectedClassId===c.id ? ' selected':'');
      card.innerHTML = `
        <div class="class-sprite-wrap"><canvas class="class-sprite-canvas" data-cls="${c.id}"></canvas></div>
        <div class="class-name" style="color:${c.color}">${c.name}</div>
        <div class="class-desc">${c.desc}</div>
        <div class="stat-bars">
          ${STATS.map(s=>`<div class="stat-bar-row"><span class="stat-bar-label">${s}</span>
            <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${c.base[s]*9}%;background:${STAT_INFO[s].color}"></div></div></div>`).join('')}
        </div>
        <div class="small" style="margin-top:4px;">HP ${c.hp}</div>
      `;
      card.onclick = ()=>{ SFX.click(); STATE.selectedClassId = c.id; this.renderCreate(false); };
      grid.appendChild(card);
      const cv = card.querySelector('canvas');
      drawSprite(cv, CLASS_SPRITES[c.id] || CLASS_SPRITES.warrior, 4);
    });

    const btn = document.getElementById('createNextBtn');
    btn.textContent = (STATE.creatingIndex === STATE.partySize-1) ? 'Start Adventure!' : 'Next Hero →';
  },

  confirmCharacter(){
    const name = document.getElementById('nameInput').value.trim() || ('Hero ' + (STATE.creatingIndex+1));
    if(!STATE.selectedClassId){
      flashInvalid(); return;
    }
    const cls = getClass(STATE.selectedClassId);
    STATE.heroes[STATE.creatingIndex] = {
      name, classId: cls.id,
      stats: {...cls.base},
      hp: cls.hp, maxHp: cls.hp,
      level: 1, items: []
    };
    if(STATE.creatingIndex < STATE.partySize-1){
      STATE.creatingIndex++;
      this.renderCreate();
    } else {
      this.beginGame();
    }
  },

  beginGame(){
    STATE.gold = 0;
    STATE.chapterIdx = 0;
    STATE.turnCounter = 0;
    STATE.reviveUsedThisChapter = false;
    STATE.run = {
      village: pick(VILLAGE_NAMES),
      villainTitle: pick(FLAVOR.villainTitle),
      dragonName: pick(FLAVOR.dragonName),
      mentor: pick(MENTOR_NAMES)
    };
    // build chapter plan: for each slot, randomly pick ONE of its alternative
    // encounters, then shuffle slot order — so both WHICH scenes appear and
    // their order differ between playthroughs, even on repeat choices.
    STATE.chapterPlan = CHAPTERS.map(ch=>{
      const nodes = shuffle(ch.slots.map(slot => pick(slot)));
      return {def: ch, nodes};
    });
    showScreen('gameScreen');
    this.renderChapterIntro();
    saveGame();
  },

  renderChapterIntro(){
    const plan = STATE.chapterPlan[STATE.chapterIdx];
    STATE.nodeIdx = -1; // -1 = showing intro
    STATE.reviveUsedThisChapter = false;
    document.getElementById('hudChapter').textContent = STATE.chapterIdx+1;
    document.getElementById('hudTotal').textContent = STATE.chapterPlan.length;
    document.getElementById('hudGold').textContent = '💰 ' + STATE.gold;
    PX.render(document.getElementById('sceneCanvas'), plan.def.scene);
    document.getElementById('sceneIconCanvas').getContext('2d').clearRect(0,0,999,999);
    document.getElementById('turnBanner').textContent = 'Chapter ' + (STATE.chapterIdx+1) + ': ' + plan.def.title;
    const mentorLine = MENTOR_LINES[plan.def.id] ? ' ' + template(pick(MENTOR_LINES[plan.def.id])) : '';
    document.getElementById('storyText').textContent = template(pick(plan.def.intro)) + mentorLine;
    this.renderPartyStrip();
    const choices = document.getElementById('choices');
    choices.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.style.width = '100%';
    btn.textContent = 'Continue →';
    btn.onclick = ()=>{ SFX.click(); STATE.nodeIdx = 0; this.renderNode(); };
    choices.appendChild(btn);
    saveGame();
  },

  renderPartyStrip(){
    const strip = document.getElementById('partyStrip');
    strip.innerHTML = '';
    const activeHero = this.getActiveHero();
    STATE.heroes.forEach(h=>{
      const cls = getClass(h.classId);
      const div = document.createElement('div');
      div.className = 'mini-hero' + (h===activeHero ? ' active':'');
      div.innerHTML = `${cls.emoji} <b>${h.name}</b> Lv${h.level}
        <div class="mini-hp"><div class="mini-hp-fill" style="width:${Math.max(0,100*h.hp/h.maxHp)}%"></div></div>`;
      strip.appendChild(div);
    });
  },

  getActiveHero(){
    const living = livingHeroes();
    if(living.length===0) return null;
    return living[STATE.turnCounter % living.length];
  },

  renderNode(){
    const plan = STATE.chapterPlan[STATE.chapterIdx];
    if(STATE.nodeIdx >= plan.nodes.length){
      this.endOfChapter();
      return;
    }
    const node = plan.nodes[STATE.nodeIdx];
    const hero = this.getActiveHero();
    if(!hero){ this.gameOver(false); return; }

    document.getElementById('turnBanner').textContent = `${hero.name}'s Turn`;
    document.getElementById('storyText').textContent = template(pick(node.text));
    document.getElementById('hudGold').textContent = '💰 ' + STATE.gold;
    this.renderPartyStrip();

    const iconEl = document.getElementById('sceneIcon');
    drawSprite(document.getElementById('sceneIconCanvas'), getEncounterSprite(node.id), 3);
    iconEl.classList.remove('pulse');
    void iconEl.offsetWidth; // restart animation
    iconEl.classList.add('pulse');

    const choicesEl = document.getElementById('choices');
    choicesEl.innerHTML = '';
    node.choices.forEach((choice, idx)=>{
      const b = document.createElement('button');
      b.className = 'choice-btn';
      const statVal = heroEffectiveStat(hero, choice.stat);
      const mod = Math.floor(statVal/3) + prepBonus(STATE.chapterIdx);
      const oddsLabel = oddsHint(mod);
      b.innerHTML = `<div><div>${choice.label}</div><div class="odds-hint">${oddsLabel}</div></div><span class="tag ${choice.tag}">${choice.tag} ${statVal}</span>`;
      b.onclick = ()=>{ SFX.click(); this.resolveChoice(node, choice, hero); };
      choicesEl.appendChild(b);
    });
  },

  resolveChoice(node, choice, hero){
    STATE.currentChoiceCtx = {node, choice, hero};
    const statVal = heroEffectiveStat(hero, choice.stat);
    const prep = prepBonus(STATE.chapterIdx);
    const mod = Math.floor(statVal/3) + prep;
    const roll = 1 + Math.floor(Math.random()*10);
    const total = roll + mod;
    let tier;
    if(total >= 11) tier = 'crit';
    else if(total >= 7) tier = 'success';
    else if(total >= 4) tier = 'partial';
    else tier = 'fail';
    STATE.currentChoiceCtx.tier = tier;
    STATE.currentChoiceCtx.roll = roll;
    STATE.currentChoiceCtx.mod = mod;
    STATE.currentChoiceCtx.total = total;
    this.showDice(hero, choice, roll, mod, total, tier, prep);
  },

  showDice(hero, choice, roll, mod, total, tier, prep){
    const overlay = document.getElementById('diceOverlay');
    overlay.classList.add('show');
    const prepNote = prep > 0 ? ` (includes +${prep} from earlier preparation!)` : '';
    document.getElementById('diceWho').textContent = `${hero.name} rolls for ${choice.tag} (+${mod})${prepNote}`;
    const die = document.getElementById('dieEl');
    const resultEl = document.getElementById('dieResult');
    die.classList.add('rolling');
    resultEl.textContent = '';
    document.getElementById('rollMath').textContent = '';
    document.getElementById('rollOutcome').textContent = '';
    document.getElementById('rollOutcome').className = 'roll-outcome';
    document.getElementById('diceContinueBtn').style.display = 'none';

    let ticks = 0;
    const spin = setInterval(()=>{
      resultEl.textContent = 1 + Math.floor(Math.random()*10);
      SFX.diceTick();
      ticks++;
      if(ticks > 10){
        clearInterval(spin);
        die.classList.remove('rolling');
        resultEl.textContent = roll;
        document.getElementById('rollMath').textContent = `🎲 ${roll}  +  ${choice.tag} bonus ${mod}  =  ${total}`;
        const outcomeEl = document.getElementById('rollOutcome');
        const labels = {crit:'⭐ CRITICAL SUCCESS!', success:'✅ Success!', partial:'➗ Partial Success', fail:'❌ Failed!'};
        outcomeEl.textContent = labels[tier];
        outcomeEl.classList.add('outcome-'+tier);
        document.getElementById('diceContinueBtn').style.display = 'inline-flex';
        SFX[tier] && SFX[tier]();
        if(tier === 'crit'){ Confetti.burst(70); }
      }
    }, 90);
  },

  afterRoll(){
    document.getElementById('diceOverlay').classList.remove('show');
    const {node, choice, hero, tier} = STATE.currentChoiceCtx;
    this.applyOutcome(node, choice, hero, tier);
  },

  applyOutcome(node, choice, hero, tier){
    let narrative, dmg = 0, bonusGold = 0;
    if(tier === 'crit'){
      narrative = '⭐ ' + choice.success;
      bonusGold = jitter(10);
    } else if(tier === 'success'){
      narrative = choice.success;
    } else if(tier === 'partial'){
      narrative = choice.partial;
      dmg = jitter(choice.partialDamage || 4);
    } else {
      narrative = choice.fail;
      dmg = jitter(choice.failDamage || 8);
    }
    narrative += pick(OUTCOME_FLAVOR[tier]);

    // scale incoming damage by party size: solo heroes take less, big parties
    // (who can absorb more and get revived) take a bit more.
    if(dmg > 0){
      dmg = Math.max(1, Math.round(dmg * (DAMAGE_SCALE[STATE.partySize] || 1)));
      hero.hp = Math.max(0, hero.hp - dmg);
    }

    let rewardText = '';
    if(tier === 'crit' || tier === 'success'){
      const rw = choice.reward;
      if(rw){
        if(rw.gold){
          const g = jitter(rw.gold) + (tier==='crit'?5:0);
          STATE.gold += g; rewardText += ` (+${g} gold)`;
        }
        if(rw.healAll){
          const h = jitter(rw.healAll);
          STATE.heroes.forEach(hr=>{ if(hr.hp>0) hr.hp = Math.min(hr.maxHp, hr.hp + h); });
          rewardText += ` (party heals ${h})`;
        }
        if(rw.flag){ STATE.run[rw.flag] = true; }
        if(rw.item){
          const item = randomLoot(tier==='crit' ? {epic:20,rare:40,common:40} : {epic:8,rare:32,common:60});
          STATE.pendingLootQueue.push(item);
        }
      }
    }
    if(tier === 'crit' && bonusGold){ STATE.gold += bonusGold; rewardText += ` (+${bonusGold} bonus gold)`; }

    document.getElementById('storyText').textContent = template(narrative) + rewardText;
    document.getElementById('choices').innerHTML = '';
    this.renderPartyStrip();
    document.getElementById('hudGold').textContent = '💰 ' + STATE.gold;

    const sceneArt = document.getElementById('sceneArt');
    if(dmg > 0){ sceneArt.classList.add('shake'); setTimeout(()=>sceneArt.classList.remove('shake'), 400); }
    if(tier==='crit'){ sceneArt.classList.add('flash-gold'); setTimeout(()=>sceneArt.classList.remove('flash-gold'), 900); }

    const justFellHero = (hero.hp === 0 && dmg > 0) ? hero : null;

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.style.width = '100%';
    btn.textContent = 'Continue →';
    btn.onclick = ()=>{
      SFX.click();
      STATE.turnCounter++;
      STATE.nodeIdx++;
      saveGame();
      if(justFellHero && !STATE.reviveUsedThisChapter && livingHeroes().length > 0){
        this.offerRevive(justFellHero);
      } else if(STATE.pendingLootQueue.length){
        this.showLoot();
      } else if(livingHeroes().length === 0){
        this.gameOver(false);
      } else {
        this.renderNode();
      }
    };
    document.getElementById('choices').appendChild(btn);
  },

  offerRevive(fallenHero){
    STATE.pendingRevive = fallenHero;
    document.getElementById('reviveWho').textContent = `${fallenHero.name} has fallen in battle!`;
    const modal = document.getElementById('reviveModal');
    const yesBtn = document.getElementById('reviveYesBtn');
    const noBtn = document.getElementById('reviveNoBtn');
    yesBtn.onclick = ()=>{
      SFX.success();
      fallenHero.hp = Math.max(1, Math.floor(fallenHero.maxHp/2));
      STATE.reviveUsedThisChapter = true;
      modal.classList.remove('show');
      STATE.pendingRevive = null;
      saveGame();
      this.renderPartyStrip();
      if(STATE.pendingLootQueue.length){ this.showLoot(); }
      else if(livingHeroes().length === 0){ this.gameOver(false); }
      else { this.renderNode(); }
    };
    noBtn.onclick = ()=>{
      modal.classList.remove('show');
      STATE.pendingRevive = null;
      if(STATE.pendingLootQueue.length){ this.showLoot(); }
      else if(livingHeroes().length === 0){ this.gameOver(false); }
      else { this.renderNode(); }
    };
    modal.classList.add('show');
  },

  showLoot(){
    const item = STATE.pendingLootQueue.shift();
    STATE._lootItem = item;
    SFX.loot();
    const modal = document.getElementById('lootModal');
    const list = document.getElementById('lootList');
    list.innerHTML = `
      <div class="item-card">
        <div class="item-emoji">${item.emoji}</div>
        <div>
          <div class="item-rarity-${item.rarity}" style="font-weight:800;">${item.name}</div>
          <div class="small">${item.rarity.toUpperCase()} · ${Object.entries(item.bonus).map(([k,v])=>`+${v} ${k}`).join(', ')}</div>
        </div>
      </div>
      <div class="small" style="text-align:center;margin:8px 0 4px;">Who equips this?</div>
      <div class="row" id="equipRow" style="justify-content:center;"></div>
    `;
    const row = document.getElementById('equipRow');
    livingHeroes().forEach(h=>{
      const b = document.createElement('button');
      b.className = 'btn secondary';
      b.textContent = h.name;
      b.onclick = ()=>{ SFX.click(); h.items.push(item.id); saveGame(); UI.closeLoot(); };
      row.appendChild(b);
    });
    modal.classList.add('show');
  },

  closeLoot(){
    document.getElementById('lootModal').classList.remove('show');
    if(STATE.pendingLootQueue.length){
      this.showLoot();
    } else if(livingHeroes().length === 0){
      this.gameOver(false);
    } else {
      this.renderNode();
    }
  },

  endOfChapter(){
    // queue level-ups for all living heroes, then move on
    STATE.pendingLevelQueue = livingHeroes();
    this.nextLevelUp();
  },

  nextLevelUp(){
    if(STATE.pendingLevelQueue.length === 0){
      STATE.chapterIdx++;
      saveGame();
      if(STATE.chapterIdx >= STATE.chapterPlan.length){
        this.gameOver(true);
      } else {
        this.renderChapterIntro();
      }
      return;
    }
    const hero = STATE.pendingLevelQueue.shift();
    hero.level++;
    hero.maxHp += 4;
    hero.hp = Math.min(hero.maxHp, hero.hp + 4);
    SFX.levelUp();
    this.showLevelModal(hero, 2);
  },

  showLevelModal(hero, points){
    STATE._levelHero = hero;
    STATE._levelPoints = points;
    STATE._levelAlloc = {Might:0, Agility:0, Magic:0, Spirit:0};
    document.getElementById('levelWho').textContent = `${hero.name} reached Level ${hero.level}!`;
    document.getElementById('pointsLeft').textContent = points;
    document.getElementById('levelDoneBtn').disabled = true;
    const rows = document.getElementById('allocRows');
    rows.innerHTML = '';
    STATS.forEach(s=>{
      const row = document.createElement('div');
      row.className = 'alloc-row';
      row.innerHTML = `
        <span>${STAT_INFO[s].emoji} ${s} <b id="statval-${s}">${hero.stats[s]}</b></span>
        <span class="row">
          <button class="btn secondary alloc-btn" data-s="${s}" data-d="-1">−</button>
          <button class="btn alloc-btn" data-s="${s}" data-d="1">+</button>
        </span>`;
      rows.appendChild(row);
    });
    rows.querySelectorAll('.alloc-btn').forEach(b=>{
      b.onclick = ()=>{
        SFX.click();
        const s = b.dataset.s, d = parseInt(b.dataset.d);
        const used = Object.values(STATE._levelAlloc).reduce((a,c)=>a+c,0);
        if(d>0 && used >= STATE._levelPoints) return;
        if(d<0 && STATE._levelAlloc[s] <= 0) return;
        STATE._levelAlloc[s] += d;
        document.getElementById('statval-'+s).textContent = hero.stats[s] + STATE._levelAlloc[s];
        const remain = STATE._levelPoints - Object.values(STATE._levelAlloc).reduce((a,c)=>a+c,0);
        document.getElementById('pointsLeft').textContent = remain;
        document.getElementById('levelDoneBtn').disabled = remain !== 0;
      };
    });
    document.getElementById('levelModal').classList.add('show');
  },

  finishLevelUp(){
    SFX.click();
    const hero = STATE._levelHero;
    STATS.forEach(s=>{ hero.stats[s] += STATE._levelAlloc[s]; });
    document.getElementById('levelModal').classList.remove('show');
    saveGame();
    this.nextLevelUp();
  },

  gameOver(victory){
    showScreen('screen-end');
    PX.render(document.getElementById('endSceneCanvas'), victory ? 'victory' : 'lair_final');
    document.getElementById('endEmoji').textContent = victory ? '🏆' : '💀';
    document.getElementById('endTitle').textContent = victory ? 'Victory!' : 'Defeated...';
    const flagsHit = PREP_FLAGS.filter(f => STATE.run[f]);
    let recap = '';
    if(flagsHit.length){
      const labels = flagsHit.map(f => PREP_FLAG_LABELS[f]).filter(Boolean);
      recap = ' Along the way, your party ' + labels.join(', ') + (labels.length>1 ? ', and more' : '') + ' — choices that shaped everything that followed.';
    }
    document.getElementById('endText').textContent = template(pick(victory ? ENDINGS_VICTORY : ENDINGS_DEFEAT)) + recap;
    const statsEl = document.getElementById('endStats');
    statsEl.innerHTML = STATE.heroes.map(h=>{
      const cls = getClass(h.classId);
      return `${cls.emoji} ${h.name} — Lv${h.level} — ${h.hp}/${h.maxHp} HP — ${h.items.length} items`;
    }).join('<br>') + `<br>💰 Gold collected: ${STATE.gold}`;

    if(victory){ SFX.victory(); Confetti.burst(120); } else { SFX.defeat(); }
    clearSave();

    // update lifetime stats
    const stats = loadLifetimeStats();
    stats.gamesPlayed++;
    if(victory){ stats.victories++; stats.dragonsDefeated++; } else { stats.defeats++; }
    stats.totalGold += STATE.gold;
    STATE.heroes.forEach(h=>{
      stats.classCounts[h.classId] = (stats.classCounts[h.classId]||0) + 1;
      if(h.level > stats.highestLevel) stats.highestLevel = h.level;
    });
    saveLifetimeStats(stats);
  },

  restart(){
    STATE.heroes = [];
    STATE.gold = 0;
    STATE.pendingLootQueue = [];
    STATE.pendingLevelQueue = [];
    STATE.reviveUsedThisChapter = false;
    showScreen('screen-title');
    this.checkResume();
  }
};

function flashInvalid(){
  const grid = document.getElementById('classGrid');
  grid.classList.add('shake');
  setTimeout(()=>grid.classList.remove('shake'), 400);
}

// -------------------- BOOTSTRAP --------------------
document.addEventListener('DOMContentLoaded', ()=>{
  SFX.initToggleIcon();
  UI.checkResume();
  const titleCanvas = document.getElementById('titleDragonCanvas');
  if(titleCanvas) drawSprite(titleCanvas, TITLE_DRAGON_SPRITE, 4);
});
