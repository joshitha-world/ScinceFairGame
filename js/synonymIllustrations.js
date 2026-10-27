// High-Resolution Scientific Diagrams for Synonym Matching Game
// Rendered cleanly as responsive inline SVG visuals

const SYNONYM_ILLUSTRATIONS = {
  precipitation: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#90caf9"/>
          <stop offset="100%" stop-color="#37474f"/>
        </linearGradient>
        <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#0288d1" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
      <!-- Background Sky -->
      <rect width="320" height="220" rx="12" fill="#0d1b2a"/>
      <!-- Cloud -->
      <path d="M 70,100 A 30,30 0 0,1 110,65 A 45,45 0 0,1 185,55 A 40,40 0 0,1 245,85 A 35,35 0 0,1 250,120 L 70,120 Z" fill="url(#cloudGrad)" filter="drop-shadow(0 4px 10px rgba(0,229,255,0.2))"/>
      <!-- Rain Droplets with Animation CSS class -->
      <g class="rain-drops">
        <line x1="85" y1="130" x2="75" y2="170" stroke="url(#rainGrad)" stroke-width="3" stroke-linecap="round"/>
        <line x1="120" y1="135" x2="110" y2="185" stroke="url(#rainGrad)" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="155" y1="130" x2="145" y2="175" stroke="url(#rainGrad)" stroke-width="3" stroke-linecap="round"/>
        <line x1="190" y1="140" x2="180" y2="190" stroke="url(#rainGrad)" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="225" y1="135" x2="215" y2="175" stroke="url(#rainGrad)" stroke-width="3" stroke-linecap="round"/>
        <line x1="100" y1="155" x2="90" y2="195" stroke="url(#rainGrad)" stroke-width="3" stroke-linecap="round"/>
        <line x1="170" y1="150" x2="160" y2="200" stroke="url(#rainGrad)" stroke-width="3" stroke-linecap="round"/>
      </g>
      <!-- Ground Puddle / Accumulation -->
      <ellipse cx="160" cy="205" rx="110" ry="10" fill="#0277bd" opacity="0.6"/>
      <!-- Labels -->
      <text x="160" y="35" text-anchor="middle" fill="#81d4fa" font-size="11" font-weight="bold" letter-spacing="1">ATMOSPHERIC MOISTURE → RAINFALL</text>
    </svg>
  `,

  velocity: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vectGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ff9100"/>
          <stop offset="100%" stop-color="#ff1744"/>
        </linearGradient>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff1744"/>
        </marker>
      </defs>
      <rect width="320" height="220" rx="12" fill="#0f172a"/>
      <!-- Grid Lines -->
      <path d="M 20 60 H 300 M 20 110 H 300 M 20 160 H 300" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
      <path d="M 60 20 V 200 M 160 20 V 200 M 260 20 V 200" stroke="#334155" stroke-width="1" stroke-dasharray="4,4"/>
      <!-- Vector Line -->
      <line x1="60" y1="150" x2="240" y2="70" stroke="url(#vectGrad)" stroke-width="5" marker-end="url(#arrow)"/>
      <!-- Moving Object Probe -->
      <circle cx="60" cy="150" r="16" fill="#00e5ff" filter="drop-shadow(0 0 8px #00e5ff)"/>
      <circle cx="60" cy="150" r="7" fill="#ffffff"/>
      <!-- Angle / Direction arc -->
      <path d="M 120 150 A 60 60 0 0,0 115 125" fill="none" stroke="#ffd600" stroke-width="2"/>
      <text x="135" y="140" fill="#ffd600" font-size="12" font-weight="bold">θ (Direction)</text>
      <!-- Label -->
      <text x="160" y="85" fill="#ff5252" font-size="14" font-weight="bold">v = Δx / Δt (Speed + Vector)</text>
      <text x="160" y="200" text-anchor="middle" fill="#94a3b8" font-size="11">MAGNITUDE + EXPLICIT DIRECTION</text>
    </svg>
  `,

  photosynthesis: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fff59d"/>
          <stop offset="60%" stop-color="#ffd600"/>
          <stop offset="100%" stop-color="#ff6f00" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="320" height="220" rx="12" fill="#061e12"/>
      <!-- Sun -->
      <circle cx="50" cy="45" r="26" fill="url(#sunGlow)"/>
      <!-- Sun Rays to Leaf -->
      <line x1="68" y1="62" x2="115" y2="105" stroke="#ffd600" stroke-width="3" stroke-dasharray="4,2"/>
      <line x1="50" y1="75" x2="85" y2="125" stroke="#ffd600" stroke-width="2.5" stroke-dasharray="4,2"/>
      <!-- Plant Leaf -->
      <path d="M 90,170 C 80,90 220,80 250,150 C 220,195 130,200 90,170 Z" fill="#2e7d32" stroke="#4caf50" stroke-width="3"/>
      <path d="M 100,165 Q 170,145 240,150" stroke="#81c784" stroke-width="2.5" fill="none"/>
      <!-- Inputs & Outputs -->
      <rect x="25" y="170" width="60" height="22" rx="4" fill="#1b5e20"/>
      <text x="55" y="185" fill="#a5d6a7" font-size="11" font-weight="bold" text-anchor="middle">6CO₂ + 6H₂O</text>
      <!-- Arrow -->
      <path d="M 195 105 L 210 90" stroke="#00e5ff" stroke-width="2.5" marker-end="url(#arrow)"/>
      <rect x="200" y="65" width="85" height="22" rx="4" fill="#006064"/>
      <text x="242" y="80" fill="#80deea" font-size="10" font-weight="bold" text-anchor="middle">C₆H₁₂O₆ (Glucose)</text>
      <rect x="220" y="170" width="55" height="22" rx="4" fill="#0277bd"/>
      <text x="247" y="185" fill="#e1f5fe" font-size="11" font-weight="bold" text-anchor="middle">6O₂ ↑</text>
      <text x="160" y="30" text-anchor="middle" fill="#69f0ae" font-size="12" font-weight="bold">SOLAR ENERGY → CHEMICAL BONDS</text>
    </svg>
  `,

  density: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#0b132b"/>
      <!-- Low Density Box -->
      <rect x="35" y="55" width="105" height="110" rx="8" fill="none" stroke="#48cae4" stroke-width="2"/>
      <!-- Loose atoms -->
      <circle cx="65" cy="80" r="8" fill="#00b4d8"/>
      <circle cx="110" cy="95" r="8" fill="#00b4d8"/>
      <circle cx="75" cy="135" r="8" fill="#00b4d8"/>
      <circle cx="115" cy="145" r="8" fill="#00b4d8"/>
      <text x="87" y="185" fill="#90e0ef" font-size="11" text-anchor="middle">Low Density (ρ₁)</text>
      
      <!-- High Density Box -->
      <rect x="180" y="55" width="105" height="110" rx="8" fill="none" stroke="#ff007f" stroke-width="2"/>
      <!-- Tightly packed atoms -->
      <g fill="#ff007f">
        <circle cx="200" cy="75" r="7"/><circle cx="220" cy="75" r="7"/><circle cx="240" cy="75" r="7"/><circle cx="260" cy="75" r="7"/>
        <circle cx="200" cy="95" r="7"/><circle cx="220" cy="95" r="7"/><circle cx="240" cy="95" r="7"/><circle cx="260" cy="95" r="7"/>
        <circle cx="200" cy="115" r="7"/><circle cx="220" cy="115" r="7"/><circle cx="240" cy="115" r="7"/><circle cx="260" cy="115" r="7"/>
        <circle cx="200" cy="135" r="7"/><circle cx="220" cy="135" r="7"/><circle cx="240" cy="135" r="7"/><circle cx="260" cy="135" r="7"/>
      </g>
      <text x="232" y="185" fill="#ff70a6" font-size="11" text-anchor="middle">High Density (ρ₂)</text>
      <!-- Title -->
      <text x="160" y="32" text-anchor="middle" fill="#caf0f8" font-size="13" font-weight="bold">ρ = MASS / VOLUME</text>
    </svg>
  `,

  thermal_energy: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#1c0a00"/>
      <!-- Container -->
      <path d="M 60 40 L 60 170 Q 60 185 80 185 L 240 185 Q 260 185 260 170 L 260 40" fill="none" stroke="#ff9100" stroke-width="3"/>
      <!-- Heat particles with vibration trails -->
      <g fill="#ff3d00" stroke="#ff9e80" stroke-width="1.5">
        <circle cx="95" cy="140" r="11"/>
        <path d="M 80 140 Q 85 130 90 140" fill="none"/>
        <circle cx="150" cy="110" r="11"/>
        <path d="M 135 110 Q 140 100 145 110" fill="none"/>
        <circle cx="215" cy="145" r="11"/>
        <path d="M 230 145 Q 225 155 220 145" fill="none"/>
        <circle cx="120" cy="80" r="10"/>
        <circle cx="190" cy="90" r="10"/>
        <circle cx="170" cy="155" r="11"/>
      </g>
      <!-- Heat radiation waves below -->
      <path d="M 100 205 Q 120 195 140 205 Q 160 215 180 205 Q 200 195 220 205" fill="none" stroke="#ff1744" stroke-width="3"/>
      <text x="160" y="25" text-anchor="middle" fill="#ffab40" font-size="13" font-weight="bold">MICROSCOPIC KINETIC HEAT ENERGY</text>
    </svg>
  `,

  osmosis: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#081b29"/>
      <!-- U-Tube shape -->
      <path d="M 60 40 V 150 Q 60 190 100 190 H 220 Q 260 190 260 150 V 40" fill="none" stroke="#00b4d8" stroke-width="3"/>
      <!-- Semi-permeable membrane in center -->
      <line x1="160" y1="120" x2="160" y2="190" stroke="#ffd600" stroke-width="4" stroke-dasharray="6,4"/>
      <!-- Solute molecules on right (large green dots) -->
      <g fill="#76ff03">
        <circle cx="190" cy="140" r="7"/><circle cx="225" cy="155" r="7"/>
        <circle cx="210" cy="170" r="7"/><circle cx="240" cy="135" r="7"/>
      </g>
      <!-- Solvent (water) molecules passing left to right -->
      <g fill="#00e5ff">
        <circle cx="90" cy="150" r="4"/><circle cx="110" cy="165" r="4"/><circle cx="130" cy="140" r="4"/>
        <circle cx="120" cy="175" r="4"/><circle cx="80" cy="165" r="4"/>
      </g>
      <!-- Direction arrow -->
      <path d="M 135 150 L 180 150" stroke="#00e5ff" stroke-width="3" marker-end="url(#arrow)"/>
      <text x="160" y="28" text-anchor="middle" fill="#80d8ff" font-size="12" font-weight="bold">NET SOLVENT PASSAGE THROUGH MEMBRANE</text>
      <text x="160" y="210" text-anchor="middle" fill="#ffd600" font-size="10">Selectively Permeable Barrier</text>
    </svg>
  `,

  combustion: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="flameGrad" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#ffea00"/>
          <stop offset="60%" stop-color="#ff6d00"/>
          <stop offset="90%" stop-color="#dd2c00"/>
          <stop offset="100%" stop-color="#3e2723" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="320" height="220" rx="12" fill="#140804"/>
      <!-- Flame Body -->
      <path d="M 160 35 C 190 80 230 110 215 160 C 200 195 120 195 105 160 C 90 110 130 80 160 35 Z" fill="url(#flameGrad)"/>
      <!-- Core Inner Flame -->
      <path d="M 160 90 C 175 115 195 130 185 165 C 175 185 145 185 135 165 C 125 130 145 115 160 90 Z" fill="#fff9c4"/>
      <!-- Fuel & Oxygen text -->
      <text x="40" y="195" fill="#ffab91" font-size="11" font-weight="bold">FUEL + O₂</text>
      <text x="280" y="195" text-anchor="end" fill="#ffab91" font-size="11" font-weight="bold">CO₂ + H₂O + HEAT</text>
      <text x="160" y="25" text-anchor="middle" fill="#ff7043" font-size="12" font-weight="bold">EXOTHERMIC REDOX (RAPID OXIDATION)</text>
    </svg>
  `,

  inertia: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#0f172a"/>
      <!-- Track / Floor -->
      <rect x="20" y="160" width="280" height="8" fill="#475569" rx="2"/>
      <!-- Barrier that stops cart -->
      <rect x="230" y="115" width="18" height="45" fill="#ef4444" rx="2"/>
      <!-- Cart -->
      <rect x="140" y="130" width="75" height="25" fill="#3b82f6" rx="4"/>
      <circle cx="155" cy="158" r="7" fill="#94a3b8"/>
      <circle cx="200" cy="158" r="7" fill="#94a3b8"/>
      <!-- Ball launched forward due to inertia -->
      <circle cx="245" cy="95" r="14" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
      <!-- Forward motion trail -->
      <path d="M 175 125 Q 210 110 235 98" fill="none" stroke="#fcd34d" stroke-width="2" stroke-dasharray="3,3"/>
      <line x1="245" y1="95" x2="280" y2="80" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrow)"/>
      <text x="160" y="30" text-anchor="middle" fill="#60a5fa" font-size="12" font-weight="bold">NEWTON'S 1ST LAW: RESISTANCE TO CHANGE</text>
      <text x="160" y="200" text-anchor="middle" fill="#94a3b8" font-size="10">Objects in motion stay in motion unless acted upon</text>
    </svg>
  `,

  biodiversity: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#061c14"/>
      <!-- Biosphere Circle -->
      <circle cx="160" cy="115" r="75" fill="#0f3e2b" stroke="#10b981" stroke-width="2"/>
      <!-- Species Icons inside -->
      <!-- Tree -->
      <path d="M 130 145 L 130 115 L 115 115 L 130 85 L 145 115 L 130 115 Z" fill="#34d399"/>
      <!-- Fish -->
      <path d="M 185 130 Q 170 120 185 110 Q 205 120 185 130 Z M 198 120 L 210 110 L 210 130 Z" fill="#38bdf8"/>
      <!-- Bird/Wing -->
      <path d="M 150 75 Q 165 65 180 75 Q 165 72 150 75 Z" fill="#fbbf24"/>
      <!-- DNA strand hint -->
      <circle cx="160" cy="155" r="5" fill="#f43f5e"/>
      <circle cx="175" cy="150" r="5" fill="#a855f7"/>
      <text x="160" y="30" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="bold">VARIETY OF ECOSYSTEM & GENETIC LIFE</text>
    </svg>
  `,

  refraction_syn: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#030712"/>
      <!-- Glass block in middle -->
      <rect x="100" y="60" width="120" height="100" fill="#1e293b" stroke="#38bdf8" stroke-width="2" fill-opacity="0.8"/>
      <text x="160" y="115" text-anchor="middle" fill="#94a3b8" font-size="11">Glass Medium (n₂ &gt; n₁)</text>
      <!-- Incident Ray -->
      <line x1="30" y1="35" x2="100" y2="100" stroke="#f43f5e" stroke-width="3"/>
      <!-- Refracted Bent Ray -->
      <line x1="100" y1="100" x2="220" y2="135" stroke="#f43f5e" stroke-width="3"/>
      <!-- Emerging Ray -->
      <line x1="220" y1="135" x2="290" y2="200" stroke="#f43f5e" stroke-width="3"/>
      <!-- Normal dotted lines -->
      <line x1="100" y1="70" x2="100" y2="130" stroke="#64748b" stroke-dasharray="3,3"/>
      <line x1="220" y1="105" x2="220" y2="165" stroke="#64748b" stroke-dasharray="3,3"/>
      <text x="160" y="30" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="bold">LIGHT BENDING ACROSS BOUNDARIES</text>
    </svg>
  `,

  evaporation: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#082f49"/>
      <!-- Water body -->
      <path d="M 20 140 Q 90 135 160 140 T 300 140 V 200 H 20 Z" fill="#0284c7"/>
      <!-- Energetic molecules escaping upward -->
      <g fill="#38bdf8">
        <circle cx="80" cy="100" r="5"/><path d="M 80 120 Q 75 110 80 100" fill="none" stroke="#7dd3fc" stroke-width="1.5"/>
        <circle cx="130" cy="70" r="5"/><path d="M 130 110 Q 125 90 130 70" fill="none" stroke="#7dd3fc" stroke-width="1.5"/>
        <circle cx="180" cy="85" r="5"/><path d="M 180 125 Q 185 105 180 85" fill="none" stroke="#7dd3fc" stroke-width="1.5"/>
        <circle cx="230" cy="65" r="5"/><path d="M 230 115 Q 235 90 230 65" fill="none" stroke="#7dd3fc" stroke-width="1.5"/>
      </g>
      <text x="160" y="35" text-anchor="middle" fill="#bae6fd" font-size="12" font-weight="bold">SURFACE LIQUID ESCAPING AS GAS</text>
    </svg>
  `,

  gravity: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="earthGrad" cx="30%" cy="30%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="60%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </radialGradient>
      </defs>
      <rect width="320" height="220" rx="12" fill="#020617"/>
      <!-- Spacetime curvature lines -->
      <path d="M 20 160 Q 110 190 200 160 Q 250 175 300 160" fill="none" stroke="#334155" stroke-width="1.5"/>
      <path d="M 20 180 Q 110 215 200 180 Q 250 195 300 180" fill="none" stroke="#1e293b" stroke-width="1.5"/>
      <!-- Earth -->
      <circle cx="110" cy="110" r="42" fill="url(#earthGrad)" filter="drop-shadow(0 0 10px rgba(56,189,248,0.4))"/>
      <circle cx="95" cy="95" r="14" fill="#22c55e" opacity="0.7"/>
      <!-- Moon -->
      <circle cx="245" cy="85" r="16" fill="#cbd5e1"/>
      <circle cx="240" cy="80" r="4" fill="#94a3b8"/>
      <!-- Attraction arrows -->
      <line x1="160" y1="105" x2="195" y2="95" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrow)"/>
      <line x1="220" y1="90" x2="185" y2="100" stroke="#f59e0b" stroke-width="3" marker-end="url(#arrow)"/>
      <text x="160" y="30" text-anchor="middle" fill="#fde047" font-size="12" font-weight="bold">MUTUAL MASS ATTRACTION (F = G·m₁m₂/r²)</text>
    </svg>
  `,

  eng_meticulous: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#0f172a"/>
      <!-- Blueprint grid -->
      <path d="M 20 50 H 300 M 20 100 H 300 M 20 150 H 300" stroke="#1e293b" stroke-width="1"/>
      <path d="M 70 20 V 200 M 150 20 V 200 M 230 20 V 200" stroke="#1e293b" stroke-width="1"/>
      <!-- Intricate watch gear -->
      <circle cx="130" cy="115" r="45" fill="none" stroke="#f59e0b" stroke-width="3"/>
      <circle cx="130" cy="115" r="20" fill="none" stroke="#d97706" stroke-width="2"/>
      <circle cx="130" cy="115" r="6" fill="#f59e0b"/>
      <!-- Gear teeth -->
      <line x1="130" y1="65" x2="130" y2="70" stroke="#f59e0b" stroke-width="4"/>
      <line x1="130" y1="160" x2="130" y2="165" stroke="#f59e0b" stroke-width="4"/>
      <line x1="80" y1="115" x2="85" y2="115" stroke="#f59e0b" stroke-width="4"/>
      <line x1="175" y1="115" x2="180" y2="115" stroke="#f59e0b" stroke-width="4"/>
      <!-- Magnifying Glass focused on detail -->
      <circle cx="170" cy="95" r="38" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="4"/>
      <line x1="198" y1="123" x2="245" y2="170" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>
      <text x="160" y="30" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="bold">METICULOUS: PAINSTAKING & THOROUGH</text>
      <text x="160" y="202" text-anchor="middle" fill="#94a3b8" font-size="10">Scrupulous precision in every microscopic detail</text>
    </svg>
  `,

  eng_ephemeral: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#090d16"/>
      <!-- Dandelion stem -->
      <path d="M 80 200 Q 95 140 100 110" stroke="#22c55e" stroke-width="3" fill="none"/>
      <!-- Dandelion Head -->
      <circle cx="100" cy="105" r="14" fill="#a7f3d0"/>
      <!-- Drifting seeds in breeze -->
      <g stroke="#e0e7ff" stroke-width="1.5" fill="#f8fafc">
        <line x1="100" y1="105" x2="135" y2="85"/><circle cx="135" cy="85" r="2"/>
        <line x1="100" y1="105" x2="120" y2="60"/><circle cx="120" cy="60" r="2"/>
        <line x1="100" y1="105" x2="80" y2="70"/><circle cx="80" cy="70" r="2"/>
        <!-- Airborne seeds flying away -->
        <line x1="165" y1="75" x2="185" y2="60"/><circle cx="185" cy="60" r="2.5"/>
        <line x1="210" y1="90" x2="235" y2="70"/><circle cx="235" cy="70" r="2.5"/>
        <line x1="250" y1="60" x2="280" y2="45"/><circle cx="280" cy="45" r="2.5"/>
      </g>
      <!-- Wind curves -->
      <path d="M 120 130 Q 180 110 260 120" stroke="rgba(165, 180, 252, 0.4)" stroke-width="1.5" stroke-dasharray="4,4" fill="none"/>
      <text x="160" y="30" text-anchor="middle" fill="#a5b4fc" font-size="12" font-weight="bold">EPHEMERAL: TRANSIENT & FLEETING</text>
      <text x="160" y="202" text-anchor="middle" fill="#94a3b8" font-size="10">Moments that vanish as quickly as a summer breeze</text>
    </svg>
  `,

  eng_resilient: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#131926"/>
      <!-- Cracked solid rocks -->
      <path d="M 30 180 L 130 180 L 145 150 L 105 130 L 40 150 Z" fill="#334155" stroke="#475569" stroke-width="2"/>
      <path d="M 180 180 L 290 180 L 270 140 L 210 130 L 170 160 Z" fill="#334155" stroke="#475569" stroke-width="2"/>
      <!-- Vibrant green sprout breaking through the stone crack -->
      <path d="M 155 180 Q 150 135 158 90" stroke="#22c55e" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- Leaves unfurling -->
      <path d="M 158 90 Q 130 80 125 100 Q 140 105 158 90 Z" fill="#4ade80" stroke="#16a34a" stroke-width="1.5"/>
      <path d="M 158 90 Q 185 75 195 95 Q 180 102 158 90 Z" fill="#4ade80" stroke="#16a34a" stroke-width="1.5"/>
      <circle cx="158" cy="85" r="4" fill="#facc15"/>
      <text x="160" y="30" text-anchor="middle" fill="#4ade80" font-size="12" font-weight="bold">RESILIENT: TENACIOUS & ADAPTABLE</text>
      <text x="160" y="202" text-anchor="middle" fill="#94a3b8" font-size="10">Enduring adversity and thriving against all odds</text>
    </svg>
  `,

  eng_eloquent: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#140f24"/>
      <!-- Parchment Scroll -->
      <rect x="50" y="55" width="220" height="120" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <!-- Calligraphy strokes on parchment -->
      <path d="M 75 85 Q 120 75 160 85 T 225 80" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M 75 110 Q 135 100 180 110 T 235 105" stroke="#78350f" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M 75 135 Q 110 130 150 135" stroke="#78350f" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <!-- Golden Feather Quill Pen -->
      <path d="M 195 40 Q 235 75 220 145 L 205 140 Q 215 95 195 40 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
      <line x1="205" y1="140" x2="198" y2="152" stroke="#1e293b" stroke-width="2.5"/>
      <!-- Musical resonance notes -->
      <text x="245" y="65" fill="#f59e0b" font-size="16">♪</text>
      <text x="260" y="100" fill="#fbbf24" font-size="20">♫</text>
      <text x="160" y="30" text-anchor="middle" fill="#fde68a" font-size="12" font-weight="bold">ELOQUENT: ARTICULATE & PERSUASIVE</text>
    </svg>
  `,

  eng_ubiquitous: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#04121f"/>
      <!-- Planet Earth globe -->
      <circle cx="160" cy="115" r="55" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="140" cy="100" r="16" fill="#22c55e" opacity="0.8"/>
      <circle cx="180" cy="125" r="22" fill="#22c55e" opacity="0.8"/>
      <!-- Beacon dots everywhere across continents & satellites -->
      <g fill="#00e5ff">
        <circle cx="50" cy="65" r="4"/><circle cx="110" cy="45" r="4"/><circle cx="210" cy="40" r="4"/>
        <circle cx="270" cy="70" r="4"/><circle cx="280" cy="150" r="4"/><circle cx="230" cy="180" r="4"/>
        <circle cx="90" cy="180" r="4"/><circle cx="40" cy="140" r="4"/>
      </g>
      <!-- Interconnecting constellation network -->
      <path d="M 50 65 L 110 45 L 210 40 L 270 70 L 280 150 L 230 180 L 90 180 L 40 140 Z" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>
      <text x="160" y="30" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="bold">UBIQUITOUS: OMNIPRESENT EVERYWHERE</text>
    </svg>
  `,

  eng_serendipity: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#061e12"/>
      <!-- Rainbow arc -->
      <path d="M 40 180 Q 160 40 280 180" stroke="rgba(255, 235, 59, 0.3)" stroke-width="8" fill="none"/>
      <!-- Lucky 4-Leaf Clover in Center -->
      <g transform="translate(160, 115)">
        <circle cx="0" cy="-20" r="16" fill="#10b981" stroke="#34d399" stroke-width="2"/>
        <circle cx="0" cy="20" r="16" fill="#10b981" stroke="#34d399" stroke-width="2"/>
        <circle cx="-20" cy="0" r="16" fill="#10b981" stroke="#34d399" stroke-width="2"/>
        <circle cx="20" cy="0" r="16" fill="#10b981" stroke="#34d399" stroke-width="2"/>
        <circle cx="0" cy="0" r="6" fill="#ffd600"/>
      </g>
      <!-- Stem -->
      <path d="M 160 135 Q 165 170 175 190" stroke="#059669" stroke-width="3" fill="none"/>
      <!-- Golden sparks -->
      <circle cx="100" cy="80" r="3" fill="#ffd600"/>
      <circle cx="225" cy="85" r="3" fill="#ffd600"/>
      <circle cx="195" cy="50" r="3" fill="#ffd600"/>
      <text x="160" y="30" text-anchor="middle" fill="#6ee7b7" font-size="12" font-weight="bold">SERENDIPITY: FORTUNATE COINCIDENCE</text>
    </svg>
  `,

  eng_benevolent: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#1f0919"/>
      <!-- Glowing Heart in Center -->
      <path d="M 160 145 C 160 145 95 105 95 68 C 95 48 112 35 133 35 C 147 35 156 42 160 48 C 164 42 173 35 187 35 C 208 35 225 48 225 68 C 225 105 160 145 160 145 Z" fill="#f43f5e" filter="drop-shadow(0 0 12px rgba(244,63,94,0.6))"/>
      <!-- Supporting outstretched hands below -->
      <path d="M 80 185 Q 120 160 150 165 L 140 185 Q 105 180 80 185 Z" fill="#fda4af"/>
      <path d="M 240 185 Q 200 160 170 165 L 180 185 Q 215 180 240 185 Z" fill="#fda4af"/>
      <text x="160" y="25" text-anchor="middle" fill="#fda4af" font-size="12" font-weight="bold">BENEVOLENT: ALTRUISTIC & KIND-HEARTED</text>
    </svg>
  `,

  eng_cacophony: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#1c0707"/>
      <!-- Megaphone Horn blasting -->
      <path d="M 60 115 L 115 85 V 145 Z" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
      <rect x="40" y="105" width="22" height="20" rx="3" fill="#64748b"/>
      <!-- Jagged loud sound lightning waves -->
      <path d="M 130 115 L 155 70 L 175 130 L 205 60 L 225 150 L 255 80 L 285 130" stroke="#ef4444" stroke-width="4" fill="none" stroke-linejoin="bevel"/>
      <!-- Clashing notes & exclamation marks -->
      <text x="170" y="60" fill="#f87171" font-size="20" font-weight="900">⚡</text>
      <text x="240" y="60" fill="#facc15" font-size="20" font-weight="900">BANG!</text>
      <text x="210" y="185" fill="#f87171" font-size="16" font-weight="900">CLATTER!</text>
      <text x="160" y="28" text-anchor="middle" fill="#f87171" font-size="12" font-weight="bold">CACOPHONY: JARRING DIN & CLATTER</text>
    </svg>
  `,

  eng_pragmatic: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#0f172a"/>
      <!-- Sturdy brick foundation / bridge -->
      <rect x="50" y="145" width="220" height="40" rx="4" fill="#475569" stroke="#64748b" stroke-width="2"/>
      <line x1="120" y1="145" x2="120" y2="185" stroke="#334155" stroke-width="2"/>
      <line x1="190" y1="145" x2="190" y2="185" stroke="#334155" stroke-width="2"/>
      <!-- Drafting Triangle & Architect Compass -->
      <polygon points="90,130 150,55 150,130" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <!-- Level tool bubble -->
      <rect x="170" y="90" width="75" height="24" rx="12" fill="#0284c7"/>
      <circle cx="207" cy="102" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
      <text x="160" y="30" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="bold">PRAGMATIC: PRACTICAL & RESULTS-ORIENTED</text>
    </svg>
  `,

  eng_tenacious: `
    <svg viewBox="0 0 320 220" class="sci-illustration-svg" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="220" rx="12" fill="#17120a"/>
      <!-- Sheer vertical mountain cliff -->
      <path d="M 40 200 L 140 20 L 170 20 L 160 200 Z" fill="#292524" stroke="#44403c" stroke-width="2"/>
      <!-- Heavy Iron Anchor Grapple Gripping Cliff -->
      <path d="M 155 70 Q 185 70 195 100 Q 200 130 180 150" stroke="#f59e0b" stroke-width="5" fill="none"/>
      <circle cx="155" cy="70" r="7" fill="#f59e0b"/>
      <!-- Sturdy Climbing Rope held taut -->
      <line x1="180" y1="150" x2="250" y2="190" stroke="#eab308" stroke-width="4" stroke-dasharray="6,2"/>
      <text x="160" y="30" text-anchor="middle" fill="#fde047" font-size="12" font-weight="bold">TENACIOUS: PERSISTENT & UNYIELDING</text>
      <text x="160" y="202" text-anchor="middle" fill="#94a3b8" font-size="10">Holding fast with unyielding grip despite hardships</text>
    </svg>
  `
};

function getSynonymIllustration(key) {
  return SYNONYM_ILLUSTRATIONS[key] || SYNONYM_ILLUSTRATIONS.precipitation;
}

