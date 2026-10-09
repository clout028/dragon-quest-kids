// ===================== PIXEL ART RENDERER =====================
// True retro 8-bit look: we draw scenes at a tiny internal canvas resolution
// (no anti-aliasing) and let CSS scale them up with image-rendering:pixelated,
// so every shape resolves into chunky square pixels like an NES/Game Boy
// dungeon-crawler, instead of smooth vector gradients.

const PX = {
  // internal draw resolution — small on purpose, this IS the pixel size
  W: 80, H: 45,

  ctxFor(canvas){
    const ctx = canvas.getContext('2d');
    canvas.width = PX.W; canvas.height = PX.H;
    ctx.imageSmoothingEnabled = false;
    canvas.style.imageRendering = 'pixelated';
    return ctx;
  },

  rect(ctx,x,y,w,h,c){ ctx.fillStyle = c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); },

  // stepped (pixel-stair) triangle/mountain, avoids smooth diagonals
  stairTri(ctx, cx, baseY, topY, halfW, c){
    const steps = Math.max(4, Math.round(halfW));
    for(let i=0;i<steps;i++){
      const t = i/steps;
      const y = baseY - (baseY-topY)*t;
      const w = halfW * (1-t);
      PX.rect(ctx, cx-w, y, w*2, (baseY-topY)/steps + 1, c);
    }
  },

  stars(ctx, n, xRange, yRange, c, seedOffset){
    for(let i=0;i<n;i++){
      const x = (xRange[0] + ((i*37+seedOffset*13)%(xRange[1]-xRange[0])));
      const y = (yRange[0] + ((i*19+seedOffset*7)%(yRange[1]-yRange[0])));
      PX.rect(ctx, x, y, 1, 1, c);
    }
  },

  // ---------------- SCENES ----------------
  scenes: {
    village(ctx){
      PX.rect(ctx,0,0,80,45,'#4a7bb5');
      PX.rect(ctx,0,0,80,10,'#6a9bd5');
      PX.rect(ctx,60,6,8,8,'#fff3c4'); // sun
      PX.rect(ctx,10,8,10,3,'#ffffff'); PX.rect(ctx,40,5,12,3,'#ffffff'); // clouds
      PX.rect(ctx,0,30,80,15,'#3f6b3f'); // ground
      PX.rect(ctx,0,26,80,4,'#4a8a4a');
      // houses
      PX.rect(ctx,8,20,14,10,'#9a7a52'); PX.rect(ctx,8,14,14,6,'#b4512f'); PX.rect(ctx,13,24,4,6,'#5c4530');
      PX.rect(ctx,30,17,16,13,'#8a6a46'); PX.rect(ctx,29,10,18,7,'#c45a38'); PX.rect(ctx,36,22,5,8,'#5c4530'); PX.rect(ctx,44,19,3,3,'#ffd96b');
      PX.rect(ctx,54,21,12,9,'#9a7a52'); PX.rect(ctx,53,15,14,6,'#b4512f'); PX.rect(ctx,58,25,4,5,'#5c4530');
      // tree
      PX.rect(ctx,70,28,2,8,'#6b4a2e'); PX.rect(ctx,65,20,12,10,'#4a8a4a');
      PX.rect(ctx,0,40,80,5,'#2f5c2f');
    },
    forest(ctx){
      PX.rect(ctx,0,0,80,45,'#16321f');
      PX.rect(ctx,0,0,80,8,'#1d4228');
      PX.rect(ctx,14,6,6,6,'#dfe9c0'); // moon
      PX.stairTri(ctx,10,40,6,10,'#1d4a2c');
      PX.stairTri(ctx,25,42,2,13,'#255a34');
      PX.stairTri(ctx,42,40,8,11,'#1a4228');
      PX.stairTri(ctx,58,42,4,13,'#255a34');
      PX.stairTri(ctx,72,40,10,9,'#1d4a2c');
      PX.rect(ctx,0,40,80,5,'#132c1c');
      PX.rect(ctx,20,42,8,2,'#0f2417'); PX.rect(ctx,50,42,10,2,'#0f2417');
    },
    cave(ctx){
      PX.rect(ctx,0,0,80,45,'#161020');
      PX.rect(ctx,0,0,14,10,'#241c33');
      PX.rect(ctx,66,0,14,9,'#241c33');
      PX.rect(ctx,0,36,16,9,'#1e1729');
      PX.rect(ctx,64,37,16,8,'#1e1729');
      for(let r=18;r>0;r-=3){ PX.rect(ctx,40-r/2,24-r/2,r,r,'rgba(106,90,154,0.08)'); }
      PX.rect(ctx,18,10,2,2,'#ffd54a'); PX.rect(ctx,62,16,2,2,'#ffd54a'); PX.rect(ctx,40,6,2,2,'#ffd54a');
      PX.rect(ctx,0,39,80,6,'#0f0a18');
    },
    ruins(ctx){
      PX.rect(ctx,0,0,80,45,'#2c2140');
      PX.rect(ctx,0,0,80,8,'#4a3a60');
      PX.rect(ctx,64,6,6,6,'#d8c8ff');
      PX.rect(ctx,0,36,80,9,'#231a34');
      PX.rect(ctx,7,11,6,25,'#6a5a7f'); PX.rect(ctx,6,9,8,3,'#584a70');
      PX.rect(ctx,21,5,6,31,'#78678f'); PX.rect(ctx,20,3,8,3,'#584a70');
      PX.rect(ctx,39,15,6,21,'#6a5a7f');
      PX.rect(ctx,57,9,6,27,'#78678f'); PX.rect(ctx,56,7,8,3,'#584a70');
      PX.rect(ctx,17,36,62,4,'#201830');
      PX.rect(ctx,30,28,2,2,'#ffd54a'); PX.rect(ctx,52,30,2,2,'#d8c8ff');
    },
    lair_approach(ctx){
      PX.rect(ctx,0,0,80,45,'#5a1c1c');
      PX.rect(ctx,0,0,80,20,'#8a3020');
      PX.rect(ctx,33,16,10,10,'#ff8a3a');
      PX.stairTri(ctx,20,38,8,22,'#5a2424');
      PX.stairTri(ctx,56,38,3,24,'#652a2a');
      PX.rect(ctx,0,37,80,8,'#2e0f0f');
      PX.rect(ctx,26,30,2,2,'#ffb84a'); PX.rect(ctx,54,30,2,2,'#ffb84a'); PX.rect(ctx,40,35,2,2,'#ffb84a');
    },
    lair_final(ctx){
      PX.rect(ctx,0,0,80,45,'#1c0808');
      PX.rect(ctx,0,22,26,23,'#3a1414');
      PX.rect(ctx,54,19,26,26,'#3a1414');
      for(let r=28;r>0;r-=3){ const a=0.10; PX.rect(ctx,40-r/2,19-r/2,r,r, r>16?'rgba(255,90,26,'+a+')':'rgba(255,213,74,'+a+')'); }
      PX.rect(ctx,22,40,36,4,'#ffd54a');
      PX.rect(ctx,26,30,2,2,'#ffb84a'); PX.rect(ctx,54,28,2,2,'#ffb84a'); PX.rect(ctx,40,34,2,2,'#ffb84a');
    },
    victory(ctx){
      PX.rect(ctx,0,0,80,45,'#1a2a55');
      PX.rect(ctx,0,0,80,10,'#3a5aa0');
      PX.rect(ctx,62,6,8,8,'#ffe9a8');
      PX.rect(ctx,16,12,12,3,'#ffd54a');
      PX.rect(ctx,0,36,80,9,'#2e5a3a');
      PX.stairTri(ctx,14,36,9,8,'#2a6b3a');
      PX.stairTri(ctx,58,36,6,10,'#2a6b3a');
      PX.stairTri(ctx,38,31,6,10,'#ffd54a');
      PX.rect(ctx,18,24,2,2,'#ffe9a8'); PX.rect(ctx,32,20,2,2,'#ffe9a8'); PX.rect(ctx,60,22,2,2,'#ffe9a8');
    }
  },

  render(canvas, sceneId){
    const ctx = PX.ctxFor(canvas);
    const fn = PX.scenes[sceneId] || PX.scenes.village;
    fn(ctx);
  }
};
