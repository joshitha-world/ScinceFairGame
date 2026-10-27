// Dynamic 60-FPS Canvas Physics & Natural Phenomena Animations
// Educational animations for Phenomenon Guessing Mode

class PhenomenonCanvasController {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationId = null;
    this.currentType = null;
    this.time = 0;
    this.particles = [];
  }

  start(type) {
    this.stop();
    this.currentType = type;
    this.time = 0;
    this.particles = [];
    this.initParticles(type);

    const render = () => {
      this.time += 0.025;
      this.draw(this.currentType);
      this.animationId = requestAnimationFrame(render);
    };
    this.animationId = requestAnimationFrame(render);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  initParticles(type) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    if (type === 'brownian_motion') {
      // Big pollen grain in center
      this.bigParticle = { x: w / 2, y: h / 2, vx: 0, vy: 0, r: 24, trail: [] };
      // Fast solvent molecules
      for (let i = 0; i < 45; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          r: 4,
          color: '#38bdf8'
        });
      }
    } else if (type === 'volcano') {
      for (let i = 0; i < 80; i++) {
        this.particles.push({
          x: w / 2 + (Math.random() - 0.5) * 20,
          y: h * 0.5,
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 7 - 3,
          r: Math.random() * 5 + 2,
          life: Math.random(),
          maxLife: 1.0,
          color: Math.random() > 0.4 ? '#ff3d00' : '#ffea00'
        });
      }
    } else if (type === 'bernoulli_lift') {
      for (let i = 0; i < 70; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          speed: 3
        });
      }
    } else if (type === 'magnetic_field') {
      for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 120;
        this.particles.push({
          x: w / 2 + Math.cos(angle) * dist,
          y: h / 2 + Math.sin(angle) * dist * 0.65,
          angle: 0
        });
      }
    } else if (type === 'photosynthesis') {
      for (let i = 0; i < 40; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vy: (Math.random() - 0.5) * 1.5,
          type: Math.random() > 0.5 ? 'photon' : 'o2',
          phase: Math.random() * Math.PI * 2
        });
      }
    } else if (type === 'idiom_spill_beans') {
      const beanColors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
      for (let i = 0; i < 45; i++) {
        this.particles.push({
          x: w * 0.38 + Math.random() * 20,
          y: h * 0.45 + Math.random() * 20,
          vx: Math.random() * 5 + 1.5,
          vy: (Math.random() - 0.7) * 4,
          r: 6,
          color: beanColors[Math.floor(Math.random() * beanColors.length)]
        });
      }
    } else if (type === 'idiom_raining_cats_dogs') {
      for (let i = 0; i < 50; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          speed: Math.random() * 6 + 5,
          isPaw: Math.random() > 0.6,
          pawType: Math.random() > 0.5 ? 'cat' : 'dog'
        });
      }
    }
  }

  draw(type) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const t = this.time;

    ctx.clearRect(0, 0, w, h);

    switch (type) {
      case 'solar_eclipse':
        this.drawSolarEclipse(ctx, w, h, t);
        break;
      case 'refraction':
        this.drawRefraction(ctx, w, h, t);
        break;
      case 'photosynthesis':
        this.drawPhotosynthesis(ctx, w, h, t);
        break;
      case 'volcano':
        this.drawVolcano(ctx, w, h, t);
        break;
      case 'dna_helix':
        this.drawDNAHelix(ctx, w, h, t);
        break;
      case 'supernova':
        this.drawSupernova(ctx, w, h, t);
        break;
      case 'brownian_motion':
        this.drawBrownianMotion(ctx, w, h, t);
        break;
      case 'bernoulli_lift':
        this.drawBernoulliLift(ctx, w, h, t);
        break;
      case 'water_cycle':
        this.drawWaterCycle(ctx, w, h, t);
        break;
      case 'magnetic_field':
        this.drawMagneticField(ctx, w, h, t);
        break;
      // English Idiom / Metaphor Animations
      case 'idiom_break_ice':
        this.drawBreakIce(ctx, w, h, t);
        break;
      case 'idiom_midnight_oil':
        this.drawMidnightOil(ctx, w, h, t);
        break;
      case 'idiom_spill_beans':
        this.drawSpillBeans(ctx, w, h, t);
        break;
      case 'idiom_cloud_nine':
        this.drawCloudNine(ctx, w, h, t);
        break;
      case 'idiom_piece_of_cake':
        this.drawPieceOfCake(ctx, w, h, t);
        break;
      case 'idiom_time_flies':
        this.drawTimeFlies(ctx, w, h, t);
        break;
      case 'idiom_raining_cats_dogs':
        this.drawRainingCatsDogs(ctx, w, h, t);
        break;
      case 'idiom_bite_bullet':
        this.drawBiteBullet(ctx, w, h, t);
        break;
      default:
        this.drawDefault(ctx, w, h, t);
    }
  }

  // 1. Solar Eclipse: Moon transiting in front of Sun with Glowing Corona
  drawSolarEclipse(ctx, w, h, t) {
    // Deep Space Background with Stars
    ctx.fillStyle = '#050814';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const sunR = 52;

    // Glowing Corona Filaments
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI) / 18 + t * 0.1;
      const len = sunR + 15 + Math.sin(t * 3 + i) * 14;
      ctx.strokeStyle = 'rgba(255, 235, 150, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * sunR, Math.sin(angle) * sunR);
      ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
      ctx.stroke();
    }
    ctx.restore();

    // Sun Body
    const sunGrad = ctx.createRadialGradient(cx, cy, sunR * 0.4, cx, cy, sunR * 1.6);
    sunGrad.addColorStop(0, '#fffde7');
    sunGrad.addColorStop(0.5, '#ffd600');
    sunGrad.addColorStop(0.8, '#ff9100');
    sunGrad.addColorStop(1, 'rgba(255,109,0,0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, sunR * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Moving Moon (oscillates across Sun)
    const moonProgress = (Math.sin(t * 0.8) + 1) / 2; // 0 to 1
    const moonX = cx - 110 + moonProgress * 220;
    const moonY = cy;
    const moonR = 51;

    // Moon Shadow & Disc
    ctx.fillStyle = '#0a0d18';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Diamond Ring / Totality Flare if near center
    const distFromCenter = Math.abs(moonX - cx);
    if (distFromCenter < 12) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx + sunR * 0.9, cy - sunR * 0.3, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Overlay Badge
    this.drawSimulationBanner(ctx, 'TOTAL SOLAR ECLIPSE IN PROGRESS', '#ffd600');
  }

  // 2. Prism Dispersion / Light Refraction
  drawRefraction(ctx, w, h, t) {
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, w, h);

    // Prism triangle
    const p1 = { x: w / 2, y: 40 };
    const p2 = { x: w / 2 - 80, y: 190 };
    const p3 = { x: w / 2 + 80, y: 190 };

    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Incident White Light Ray
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(30, 150 + Math.sin(t) * 8);
    ctx.lineTo(p2.x + 28, 140);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Rainbow colors exiting prism
    const colors = [
      { name: 'Red', col: '#ef4444', angle: 0.10 },
      { name: 'Orange', col: '#f97316', angle: 0.16 },
      { name: 'Yellow', col: '#eab308', angle: 0.22 },
      { name: 'Green', col: '#22c55e', angle: 0.28 },
      { name: 'Cyan', col: '#06b6d4', angle: 0.34 },
      { name: 'Blue', col: '#3b82f6', angle: 0.40 },
      { name: 'Violet', col: '#a855f7', angle: 0.46 }
    ];

    const enterX = p2.x + 28;
    const enterY = 140;

    colors.forEach(c => {
      const exitX = p1.x + 25 + c.angle * 45;
      const exitY = 135 + c.angle * 60;
      // Ray inside glass
      ctx.strokeStyle = c.col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(enterX, enterY);
      ctx.lineTo(exitX, exitY);
      ctx.stroke();

      // Ray exiting glass into air
      ctx.beginPath();
      ctx.moveTo(exitX, exitY);
      ctx.lineTo(w - 20, exitY + (c.angle * 95) + Math.sin(t * 2) * 4);
      ctx.stroke();
    });

    this.drawSimulationBanner(ctx, 'PRISM LIGHT REFRACTION & DISPERSION', '#38bdf8');
  }

  // 3. Photosynthesis Chloroplast
  drawPhotosynthesis(ctx, w, h, t) {
    ctx.fillStyle = '#03170e';
    ctx.fillRect(0, 0, w, h);

    // Chloroplast Organelle Membrane
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.38, h * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Thylakoid Stacks (Grana)
    const granaX = [w / 2 - 60, w / 2, w / 2 + 60];
    granaX.forEach(gx => {
      for (let k = 0; k < 4; k++) {
        const gy = h / 2 - 35 + k * 22;
        ctx.fillStyle = '#15803d';
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(gx, gy, 28, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });

    // Photon beams arriving from top left
    for (let i = 0; i < 5; i++) {
      const px = 40 + i * 25 + Math.sin(t * 3 + i) * 6;
      const py = 20 + ((t * 80 + i * 35) % (h * 0.45));
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Oxygen bubbles escaping upward
    for (let j = 0; j < 6; j++) {
      const ox = w * 0.7 + Math.sin(t * 2 + j) * 20;
      const oy = h - 30 - ((t * 40 + j * 30) % (h - 50));
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ox, oy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    this.drawSimulationBanner(ctx, 'CHLOROPLAST: PHOTONS + CO₂ → O₂ + GLUCOSE', '#4ade80');
  }

  // 4. Volcanic Eruption
  drawVolcano(ctx, w, h, t) {
    ctx.fillStyle = '#110503';
    ctx.fillRect(0, 0, w, h);

    // Mountain silhouette
    ctx.fillStyle = '#26120c';
    ctx.beginPath();
    ctx.moveTo(30, h);
    ctx.lineTo(w / 2 - 35, h * 0.48);
    ctx.lineTo(w / 2 + 35, h * 0.48);
    ctx.lineTo(w - 30, h);
    ctx.closePath();
    ctx.fill();

    // Caldera crater glow
    ctx.fillStyle = '#ff3d00';
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.48, 35, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Smoke plume
    for (let s = 0; s < 12; s++) {
      const sy = h * 0.45 - (s * 15 + (t * 25) % 15);
      const sx = w / 2 + Math.sin(t + s) * (15 + s * 5);
      const sr = 14 + s * 4;
      ctx.fillStyle = `rgba(100, 90, 85, ${0.45 - s * 0.03})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lava Particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.life -= 0.015;

      if (p.life <= 0 || p.y > h * 0.75) {
        p.x = w / 2 + (Math.random() - 0.5) * 20;
        p.y = h * 0.48;
        p.vx = (Math.random() - 0.5) * 5;
        p.vy = -Math.random() * 8 - 3;
        p.life = 1.0;
      }

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    this.drawSimulationBanner(ctx, 'MAGMA ASCENT & EXPLOSIVE PYROCLASTIC ERUPTION', '#ff5722');
  }

  // 5. DNA Double Helix
  drawDNAHelix(ctx, w, h, t) {
    ctx.fillStyle = '#060a18';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const numRungs = 20;
    const strandRadius = 75;

    for (let i = 0; i < numRungs; i++) {
      const y = 30 + i * 9.5;
      const angle = (i * 0.38) + t * 2.2;
      
      const x1 = cx + Math.cos(angle) * strandRadius;
      const z1 = Math.sin(angle); // depth
      const x2 = cx + Math.cos(angle + Math.PI) * strandRadius;

      // Color base pairs: A-T (Yellow/Red), G-C (Cyan/Green)
      const basePairType = i % 2;
      const color1 = basePairType === 0 ? '#ffd600' : '#00e5ff';
      const color2 = basePairType === 0 ? '#ff1744' : '#00e676';

      // Connecting rungs (Hydrogen bonds)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();

      // Base nodes
      const r1 = 6 + z1 * 2;
      const r2 = 6 - z1 * 2;

      ctx.fillStyle = color1;
      ctx.beginPath();
      ctx.arc(x1, y, Math.max(3, r1), 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color2;
      ctx.beginPath();
      ctx.arc(x2, y, Math.max(3, r2), 0, Math.PI * 2);
      ctx.fill();
    }

    this.drawSimulationBanner(ctx, 'DNA COMPLEMENTARY BASE-PAIRED HELIX', '#00e5ff');
  }

  // 6. Supernova Explosion
  drawSupernova(ctx, w, h, t) {
    ctx.fillStyle = '#03030c';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const blastPhase = (t * 0.8) % 3; // cycle explosion

    // Shockwaves
    const maxR = blastPhase * 110;
    const shockGrad = ctx.createRadialGradient(cx, cy, maxR * 0.3, cx, cy, maxR);
    shockGrad.addColorStop(0, '#ffffff');
    shockGrad.addColorStop(0.3, '#f43f5e');
    shockGrad.addColorStop(0.7, '#8b5cf6');
    shockGrad.addColorStop(1, 'rgba(11, 15, 25, 0)');

    ctx.fillStyle = shockGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.fill();

    // Star core remnant / Pulsar
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(cx, cy, 14 - blastPhase * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ejecta jets
    for (let k = 0; k < 16; k++) {
      const angle = (k * Math.PI) / 8 + t * 0.3;
      const dist = 30 + blastPhase * 95;
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
      ctx.stroke();
    }

    this.drawSimulationBanner(ctx, 'CORE COLLAPSE & RELATIVISTIC BLASTWAVE', '#ec4899');
  }

  // 7. Brownian Motion
  drawBrownianMotion(ctx, w, h, t) {
    ctx.fillStyle = '#07101e';
    ctx.fillRect(0, 0, w, h);

    const big = this.bigParticle;
    if (!big) return;

    // Small solvent particles bouncing
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 5 || p.x > w - 5) p.vx *= -1;
      if (p.y < 5 || p.y > h - 5) p.vy *= -1;

      // Collision with big particle
      const dx = p.x - big.x;
      const dy = p.y - big.y;
      const dist = Math.hypot(dx, dy);
      if (dist < big.r + p.r) {
        // Momentum transfer
        big.vx += (p.vx * 0.12);
        big.vy += (p.vy * 0.12);
        p.vx *= -1;
        p.vy *= -1;
      }

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Update big particle
    big.x += big.vx;
    big.y += big.vy;
    big.vx *= 0.94; // fluid friction damping
    big.vy *= 0.94;

    // Keep big particle in frame
    if (big.x < big.r + 10) { big.x = big.r + 10; big.vx *= -1; }
    if (big.x > w - big.r - 10) { big.x = w - big.r - 10; big.vx *= -1; }
    if (big.y < big.r + 10) { big.y = big.r + 10; big.vy *= -1; }
    if (big.y > h - big.r - 10) { big.y = h - big.r - 10; big.vy *= -1; }

    // Big particle trail
    big.trail.push({ x: big.x, y: big.y });
    if (big.trail.length > 25) big.trail.shift();

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    big.trail.forEach((pos, idx) => {
      if (idx === 0) ctx.moveTo(pos.x, pos.y);
      else ctx.lineTo(pos.x, pos.y);
    });
    ctx.stroke();

    // Draw big suspended colloidal grain
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(big.x, big.y, big.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    this.drawSimulationBanner(ctx, 'RANDOM DRIFT VIA MOLECULAR COLLISIONS', '#f59e0b');
  }

  // 8. Bernoulli Aerodynamic Lift
  drawBernoulliLift(ctx, w, h, t) {
    ctx.fillStyle = '#06101e';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 10;

    // Airfoil cross section
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy);
    // Upper curve (camber)
    ctx.bezierCurveTo(cx - 30, cy - 40, cx + 20, cy - 35, cx + 80, cy);
    // Lower curve (flat)
    ctx.bezierCurveTo(cx + 20, cy + 12, cx - 30, cy + 8, cx - 70, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Streamline particles
    this.particles.forEach(p => {
      // If above airfoil, moves faster
      const isAbove = p.y < cy;
      const speed = isAbove ? 6.5 : 3.5;
      p.x += speed;
      if (p.x > w) {
        p.x = 0;
        p.y = 30 + Math.random() * (h - 60);
      }

      // Deflect around airfoil
      let drawY = p.y;
      if (p.x > cx - 70 && p.x < cx + 80) {
        if (isAbove) drawY -= Math.sin(((p.x - (cx - 70)) / 150) * Math.PI) * 22;
        else drawY += Math.sin(((p.x - (cx - 70)) / 150) * Math.PI) * 8;
      }

      ctx.fillStyle = isAbove ? '#38bdf8' : '#60a5fa';
      ctx.beginPath();
      ctx.arc(p.x, drawY, isAbove ? 2.5 : 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Lift vector arrow pointing up
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy - 65);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 75);
    ctx.lineTo(cx - 8, cy - 60);
    ctx.lineTo(cx + 8, cy - 60);
    ctx.closePath();
    ctx.fill();

    this.drawSimulationBanner(ctx, 'FASTER AIR ABOVE = LOWER PRESSURE → UPWARD LIFT', '#38bdf8');
  }

  // 9. Hydrological Water Cycle
  drawWaterCycle(ctx, w, h, t) {
    ctx.fillStyle = '#061a29';
    ctx.fillRect(0, 0, w, h);

    // Ocean body at bottom
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);

    // Sun at top right
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(w - 45, 45, 24, 0, Math.PI * 2);
    ctx.fill();

    // Evaporating steam particles going up from ocean
    for (let i = 0; i < 8; i++) {
      const ex = w * 0.7 + Math.sin(t * 3 + i) * 25;
      const ey = h * 0.72 - ((t * 40 + i * 22) % (h * 0.45));
      ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cloud at upper left
    const cloudX = w * 0.28 + Math.sin(t * 0.5) * 12;
    const cloudY = 65;
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(cloudX - 25, cloudY, 20, 0, Math.PI * 2);
    ctx.arc(cloudX, cloudY - 12, 26, 0, Math.PI * 2);
    ctx.arc(cloudX + 28, cloudY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Rain falling from cloud
    for (let r = 0; r < 10; r++) {
      const rx = cloudX - 35 + (r * 8);
      const ry = cloudY + 22 + ((t * 90 + r * 15) % (h * 0.55));
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2, ry + 8);
      ctx.stroke();
    }

    this.drawSimulationBanner(ctx, 'EVAPORATION → CONDENSATION → PRECIPITATION', '#38bdf8');
  }

  // 10. Magnetic Field Lines
  drawMagneticField(ctx, w, h, t) {
    ctx.fillStyle = '#050c18';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    // Field curves (loops from N to S)
    for (let r = 35; r <= 110; r += 24) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      // Top loop
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.4, r * 0.75, 0, 0, Math.PI);
      ctx.stroke();
      // Bottom loop
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.4, r * 0.75, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    // Bar Magnet in center
    const barW = 100;
    const barH = 32;

    // North Pole (Red)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - barW / 2, cy - barH / 2, barW / 2, barH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', cx - barW / 4, cy + 5);

    // South Pole (Blue)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(cx, cy - barH / 2, barW / 2, barH);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('S', cx + barW / 4, cy + 5);

    // Iron filing particles aligning
    this.particles.forEach(p => {
      // Angle towards poles
      const angle = Math.atan2(p.y - cy, p.x - cx);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-4, -1, 8, 2);
      ctx.restore();
    });

    this.drawSimulationBanner(ctx, 'MAGNETIC FLUX DIPOLE VECTOR FIELD', '#38bdf8');
  }

  // ==========================================
  // ENGLISH IDIOM & FIGURATIVE LANGUAGE ANIMATIONS
  // ==========================================

  // 11. Break the Ice: Ice cracking under a mallet to reveal warm conversation
  drawBreakIce(ctx, w, h, t) {
    ctx.fillStyle = '#071626';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 10;
    const crackCycle = (t * 0.8) % 2; // cycles every 2.5s
    const isCracked = crackCycle > 0.6;

    // Glowing ice cube block
    const iceGrad = ctx.createLinearGradient(cx - 70, cy - 70, cx + 70, cy + 70);
    iceGrad.addColorStop(0, 'rgba(186, 230, 253, 0.7)');
    iceGrad.addColorStop(1, 'rgba(2, 132, 199, 0.5)');

    ctx.save();
    ctx.fillStyle = iceGrad;
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 3;

    if (!isCracked) {
      // Solid ice block
      ctx.fillRect(cx - 65, cy - 60, 130, 120);
      ctx.strokeRect(cx - 65, cy - 60, 130, 120);
    } else {
      // Cracked split ice halves
      const spread = (crackCycle - 0.6) * 45;
      // Left half
      ctx.beginPath();
      ctx.moveTo(cx - 65 - spread, cy - 60);
      ctx.lineTo(cx - spread, cy - 60);
      ctx.lineTo(cx - 15 - spread, cy);
      ctx.lineTo(cx - spread, cy + 60);
      ctx.lineTo(cx - 65 - spread, cy + 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right half
      ctx.beginPath();
      ctx.moveTo(cx + spread, cy - 60);
      ctx.lineTo(cx + 65 + spread, cy - 60);
      ctx.lineTo(cx + 65 + spread, cy + 60);
      ctx.lineTo(cx + spread, cy + 60);
      ctx.lineTo(cx - 15 + spread, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Warm conversation bubble appearing in center
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💬 "Hello Friend!"', cx, cy - 10);
      ctx.fillText('🤝 Warm Dialogue', cx, cy + 15);
    }
    ctx.restore();

    // Friendly Wooden Mallet tapping ice
    const malletAngle = isCracked ? -0.2 : Math.sin(t * 8) * 0.35 - 0.3;
    ctx.save();
    ctx.translate(cx + 50, cy - 75);
    ctx.rotate(malletAngle);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-8, -45, 16, 50); // handle
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-22, -65, 44, 25); // hammer head
    ctx.restore();

    this.drawSimulationBanner(ctx, 'IDIOM: BREAK THE ICE (INITIATING DIALOGUE)', '#38bdf8');
  }

  // 12. Burn the Midnight Oil: Glowing desk lamp & clock past midnight
  drawMidnightOil(ctx, w, h, t) {
    ctx.fillStyle = '#060714';
    ctx.fillRect(0, 0, w, h);

    // Deep night sky stars
    for (let s = 0; s < 25; s++) {
      const sx = (s * 37) % w;
      const sy = (s * 23) % (h * 0.5);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(t * 3 + s) * 0.3})`;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Crescent Moon in top left
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(60, 50, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#060714';
    ctx.beginPath();
    ctx.arc(68, 46, 20, 0, Math.PI * 2);
    ctx.fill();

    // Study desk surface
    ctx.fillStyle = '#29180f';
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, h * 0.72, w, 5);

    // Stack of classic leather books
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(80, h * 0.72 - 20, 95, 20);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(90, h * 0.72 - 38, 85, 18);
    ctx.fillStyle = '#047857';
    ctx.fillRect(100, h * 0.72 - 54, 70, 16);

    // Antique Brass Oil Lamp
    const lampX = w * 0.65;
    const lampY = h * 0.72;

    // Lamp Base
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(lampX, lampY - 8, 32, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glass Chimney & Flame
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(lampX - 16, lampY - 65, 32, 55);

    // Pulsing Oil Wick Flame
    const flameH = 18 + Math.sin(t * 12) * 4;
    const flameGrad = ctx.createRadialGradient(lampX, lampY - 35, 2, lampX, lampY - 35, 45);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, '#fde047');
    flameGrad.addColorStop(0.7, '#f97316');
    flameGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(lampX, lampY - 35, 45, 0, Math.PI * 2);
    ctx.fill();

    // Wall Clock on Right ticking past 12:00
    const clockX = w - 60;
    const clockY = 55;
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(clockX, clockY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Clock Hands (Past midnight)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    // Hour hand at 1
    ctx.beginPath(); ctx.moveTo(clockX, clockY); ctx.lineTo(clockX + 7, clockY - 14); ctx.stroke();
    // Minute hand moving
    const minAngle = t * 1.5;
    ctx.beginPath();
    ctx.moveTo(clockX, clockY);
    ctx.lineTo(clockX + Math.cos(minAngle) * 19, clockY + Math.sin(minAngle) * 19);
    ctx.stroke();

    this.drawSimulationBanner(ctx, 'METAPHOR: BURN THE MIDNIGHT OIL (LATE STUDY)', '#f59e0b');
  }

  // 13. Spill the Beans: Tipping jar scattering colorful beans
  drawSpillBeans(ctx, w, h, t) {
    ctx.fillStyle = '#120b08';
    ctx.fillRect(0, 0, w, h);

    // Table Floor
    ctx.fillStyle = '#292524';
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, h * 0.78); ctx.lineTo(w, h * 0.78); ctx.stroke();

    // Tipping glass jar on left
    const jarAngle = 0.55 + Math.sin(t * 2) * 0.1;
    ctx.save();
    ctx.translate(w * 0.28, h * 0.55);
    ctx.rotate(jarAngle);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.fillRect(-35, -55, 70, 110);
    ctx.strokeRect(-35, -55, 70, 110);
    // Jar label "SECRET"
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TOP SECRET', 0, 0);
    ctx.restore();

    // Spilled beans bouncing across the table
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity

      // Bounce on floor
      if (p.y > h * 0.78 - p.r) {
        p.y = h * 0.78 - p.r;
        p.vy *= -0.55;
        p.vx *= 0.95;
      }

      // Loop if rolling off edge
      if (p.x > w + 20) {
        p.x = w * 0.32;
        p.y = h * 0.55;
        p.vx = Math.random() * 4 + 2;
        p.vy = (Math.random() - 0.7) * 4;
      }

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * 1.3, p.r * 0.8, p.vx * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    this.drawSimulationBanner(ctx, 'IDIOM: SPILL THE BEANS (REVEALING SECRETS)', '#ef4444');
  }

  // 14. On Cloud Nine: Joyful character bobbing on golden Cloud 9
  drawCloudNine(ctx, w, h, t) {
    // Dreamy sunset twilight gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#312e81');
    skyGrad.addColorStop(0.6, '#4c1d95');
    skyGrad.addColorStop(1, '#831843');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + Math.sin(t * 2) * 12;

    // Glowing Golden Cloud Nine
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.arc(cx - 50, cy + 10, 36, 0, Math.PI * 2);
    ctx.arc(cx - 15, cy - 20, 48, 0, Math.PI * 2);
    ctx.arc(cx + 35, cy - 10, 42, 0, Math.PI * 2);
    ctx.arc(cx + 65, cy + 15, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Cloud Number "9"
    ctx.fillStyle = '#7c2d12';
    ctx.font = '900 38px "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('9', cx, cy + 22);

    // Smiling happy mascot on top
    const starY = cy - 65;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, starY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Smile & eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx - 6, starY - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 6, starY - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, starY + 2, 7, 0, Math.PI);
    ctx.stroke();

    // Floating euphoria sparkles
    for (let i = 0; i < 8; i++) {
      const sx = cx + Math.sin(t * 3 + i) * (90 + i * 8);
      const sy = cy - 30 + Math.cos(t * 2 + i) * 50;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('✨', sx, sy);
    }

    this.drawSimulationBanner(ctx, 'HYPERBOLE: ON CLOUD NINE (SUPREME EUPHORIA)', '#facc15');
  }

  // 15. A Piece of Cake: Luscious cake with sparkler & easy celebration
  drawPieceOfCake(ctx, w, h, t) {
    ctx.fillStyle = '#170919';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h * 0.65;

    // Banquet plate
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 45, 120, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3-Tier Celebratory Cake
    // Tier 1 (Base)
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(cx - 75, cy - 10, 150, 45);
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(cx - 75, cy + 8, 150, 8); // cream line

    // Tier 2 (Middle)
    ctx.fillStyle = '#fb7185';
    ctx.fillRect(cx - 55, cy - 45, 110, 35);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 55, cy - 30, 110, 6);

    // Tier 3 (Top)
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(cx - 35, cy - 70, 70, 25);

    // Sparkler Candle on Top
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, cy - 70); ctx.lineTo(cx, cy - 95); ctx.stroke();

    // Sparkling flame sparks
    for (let s = 0; s < 12; s++) {
      const angle = s * (Math.PI / 6) + t * 4;
      const dist = 14 + Math.sin(t * 10 + s) * 6;
      ctx.fillStyle = s % 2 === 0 ? '#fde047' : '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * dist, cy - 95 + Math.sin(angle) * dist, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Easy celebration ribbon
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍰 "SO EASY TO ACHIEVE!"', cx, cy + 35);

    this.drawSimulationBanner(ctx, 'COLLOQUIALISM: A PIECE OF CAKE (EFFORTLESS)', '#fb7185');
  }

  // 16. Time Flies: Flying winged alarm clock with feather trails
  drawTimeFlies(ctx, w, h, t) {
    ctx.fillStyle = '#061324';
    ctx.fillRect(0, 0, w, h);

    // Drifting clouds in background
    for (let c = 0; c < 3; c++) {
      const cloudX = ((c * 170 + t * 25) % (w + 120)) - 60;
      const cloudY = 40 + c * 55;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 30, 0, Math.PI * 2);
      ctx.arc(cloudX + 30, cloudY - 10, 40, 0, Math.PI * 2);
      ctx.arc(cloudX + 65, cloudY, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    const clockX = w / 2;
    const clockY = h / 2 + Math.sin(t * 3) * 14;

    // Flapping Angel Wings
    const wingFlap = Math.sin(t * 8) * 0.45;

    // Left Wing
    ctx.save();
    ctx.translate(clockX - 25, clockY - 10);
    ctx.rotate(-wingFlap - 0.3);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-35, -15, 45, 18, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Wing
    ctx.save();
    ctx.translate(clockX + 25, clockY - 10);
    ctx.rotate(wingFlap + 0.3);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(35, -15, 45, 18, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Golden Alarm Clock body
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(clockX, clockY, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Clock Face Dial
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(clockX, clockY, 28, 0, Math.PI * 2);
    ctx.fill();

    // Fast Spinning Hands
    const spinH = t * 6;
    const spinM = t * 22;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    // Hour
    ctx.beginPath(); ctx.moveTo(clockX, clockY); ctx.lineTo(clockX + Math.cos(spinH) * 14, clockY + Math.sin(spinH) * 14); ctx.stroke();
    // Minute
    ctx.beginPath(); ctx.moveTo(clockX, clockY); ctx.lineTo(clockX + Math.cos(spinM) * 22, clockY + Math.sin(spinM) * 22); ctx.stroke();

    this.drawSimulationBanner(ctx, 'PERSONIFICATION: TIME FLIES (SPEEDING MOMENTS)', '#f59e0b');
  }

  // 17. Raining Cats and Dogs: Torrential downpour with pawprints and umbrellas
  drawRainingCatsDogs(ctx, w, h, t) {
    ctx.fillStyle = '#060f1c';
    ctx.fillRect(0, 0, w, h);

    // Heavy dark storm clouds across top
    ctx.fillStyle = '#334155';
    for (let c = 0; c < 5; c++) {
      ctx.beginPath();
      ctx.arc(40 + c * 90, 30, 45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Occasional lightning flash
    if (Math.sin(t * 5) > 0.94) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, w, h);
    }

    // Raining particles
    this.particles.forEach(p => {
      p.y += p.speed;
      p.x -= 1.5; // wind drift

      if (p.y > h) {
        p.y = 40;
        p.x = Math.random() * (w + 50);
      }

      if (p.isPaw) {
        ctx.fillStyle = p.pawType === 'cat' ? '#f472b6' : '#60a5fa';
        ctx.font = '12px sans-serif';
        ctx.fillText(p.pawType === 'cat' ? '🐱' : '🐶', p.x, p.y);
      } else {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 3, p.y + 12);
        ctx.stroke();
      }
    });

    this.drawSimulationBanner(ctx, 'HYPERBOLE: RAINING CATS & DOGS (TORRENTIAL RAIN)', '#38bdf8');
  }

  // 18. Bite the Bullet: Knight shield deflecting fiery obstacles bravely
  drawBiteBullet(ctx, w, h, t) {
    ctx.fillStyle = '#140c0c';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 10;

    // Glowing Knight's Shield
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 55);
    ctx.lineTo(cx + 50, cy - 55);
    ctx.lineTo(cx + 45, cy + 20);
    ctx.lineTo(cx, cy + 70);
    ctx.lineTo(cx - 45, cy + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden Crest in Shield Center
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FORTITUDE', cx, cy + 28);

    // Incoming obstacle bolts hitting shield & sparking
    const blastPhase = (t * 4) % 1;
    const impactX = cx - 35 + blastPhase * 35;
    const impactY = cy - 25;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(impactX - 45, impactY - 15);
    ctx.lineTo(impactX, impactY);
    ctx.stroke();

    // Deflection sparks
    for (let s = 0; s < 8; s++) {
      const angle = (s * Math.PI) / 4 + t * 6;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(impactX + Math.cos(angle) * (blastPhase * 30), impactY + Math.sin(angle) * (blastPhase * 30), 2, 0, Math.PI * 2);
      ctx.fill();
    }

    this.drawSimulationBanner(ctx, 'IDIOM: BITE THE BULLET (COURAGE UNDER FIRE)', '#f59e0b');
  }

  drawDefault(ctx, w, h) {
    ctx.fillStyle = '#0b132b';
    ctx.fillRect(0, 0, w, h);
    this.drawSimulationBanner(ctx, 'DYNAMIC PHENOMENON SIMULATION', '#00e5ff');
  }

  drawSimulationBanner(ctx, label, color) {
    const w = this.canvas.width;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(10, 8, w - 20, 26);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 8, w - 20, 26);
    ctx.fillStyle = color;
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, w / 2, 21);
    ctx.restore();
  }
}

window.PhenomenonCanvasController = PhenomenonCanvasController;

