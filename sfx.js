// ===================== SFX & VFX MODULE =====================
// Web Audio synthesized sound effects (no audio files to load) plus a tiny
// canvas confetti burst for crits/victory. Mute state persists via localStorage.
'use strict';

const SFX = {
  ctx: null,
  muted: (localStorage.getItem('dqk_muted') === '1'),

  ensureCtx(){
    if(!this.ctx){
      try{ this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e){ this.ctx = null; }
    }
    if(this.ctx && this.ctx.state === 'suspended'){ this.ctx.resume(); }
    return this.ctx;
  },

  toggle(){
    this.muted = !this.muted;
    localStorage.setItem('dqk_muted', this.muted ? '1' : '0');
    const btn = document.getElementById('soundToggle');
    if(btn) btn.textContent = this.muted ? '🔇' : '🔊';
  },

  initToggleIcon(){
    const btn = document.getElementById('soundToggle');
    if(btn) btn.textContent = this.muted ? '🔇' : '🔊';
  },

  // simple tone: freq in Hz, duration in seconds, type oscillator shape
  tone(freq, dur, type, gainStart, delay){
    if(this.muted) return;
    const ctx = this.ensureCtx();
    if(!ctx) return;
    const t0 = ctx.currentTime + (delay||0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(gainStart||0.15, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  },

  click(){ this.tone(520, 0.07, 'square', 0.08); },
  diceTick(){ this.tone(300 + Math.random()*200, 0.04, 'square', 0.06); },
  crit(){
    this.tone(660, 0.12, 'triangle', 0.18);
    this.tone(880, 0.15, 'triangle', 0.16, 0.1);
    this.tone(1100, 0.2, 'triangle', 0.14, 0.2);
  },
  success(){ this.tone(520, 0.12, 'triangle', 0.14); this.tone(700, 0.15, 'triangle', 0.12, 0.08); },
  partial(){ this.tone(400, 0.15, 'sine', 0.12); },
  fail(){ this.tone(180, 0.25, 'sawtooth', 0.14); this.tone(140, 0.3, 'sawtooth', 0.1, 0.08); },
  levelUp(){
    [440,554,659,880].forEach((f,i)=>this.tone(f, 0.18, 'triangle', 0.15, i*0.09));
  },
  loot(){ this.tone(740, 0.08, 'sine', 0.12); this.tone(988, 0.12, 'sine', 0.1, 0.07); },
  victory(){
    [523,659,784,1046].forEach((f,i)=>this.tone(f, 0.3, 'triangle', 0.15, i*0.12));
  },
  defeat(){
    [400,340,280,220].forEach((f,i)=>this.tone(f, 0.35, 'sawtooth', 0.12, i*0.15));
  }
};

// -------------------- CONFETTI --------------------
const Confetti = {
  particles: [],
  running: false,
  colors: ['#ffd54a','#ff5a5a','#4ade80','#60a5fa','#c084fc'],

  burst(count){
    const canvas = document.getElementById('confettiCanvas');
    if(!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const n = count || 60;
    for(let i=0;i<n;i++){
      this.particles.push({
        x: window.innerWidth/2 + (Math.random()-0.5)*80,
        y: window.innerHeight*0.3,
        vx: (Math.random()-0.5)*6,
        vy: -4 - Math.random()*5,
        size: 4 + Math.random()*5,
        color: this.colors[Math.floor(Math.random()*this.colors.length)],
        rot: Math.random()*Math.PI*2,
        vrot: (Math.random()-0.5)*0.3,
        life: 0
      });
    }
    if(!this.running){ this.running = true; this.tick(); }
  },

  tick(){
    const canvas = document.getElementById('confettiCanvas');
    if(!canvas){ this.running = false; return; }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    this.particles.forEach(p=>{
      p.vy += 0.15; // gravity
      p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.life/90);
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    });
    this.particles = this.particles.filter(p => p.life < 90 && p.y < window.innerHeight+40);
    if(this.particles.length > 0){
      requestAnimationFrame(()=>this.tick());
    } else {
      this.running = false;
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  }
};
