// ============================================================
// Yale Residential College Data
// ============================================================
const colleges = [
  {
    name: "Benjamin Franklin",
    abbr: "BF",
    color: "#00356b",
    accentColor: "#4a90d9",
    founded: "2017",
    motto: "Excelling in all things",
    description: "One of Yale's newest colleges, Benjamin Franklin College sits at the heart of Science Hill. Its modern Gothic architecture blends tradition with innovation.",
    location: "Prospect Street",
    dean: "Residential College",
    symbol: "lightning bolt"
  },
  {
    name: "Berkeley",
    abbr: "BK",
    color: "#c75b12",
    accentColor: "#e8944a",
    founded: "1934",
    motto: "Veritas — Lux et Veritas",
    description: "Named after philosopher George Berkeley, this college is known for its vibrant community, stunning courtyard, and close proximity to the heart of campus.",
    location: "Wall Street",
    dean: "Residential College",
    symbol: "open book"
  },
  {
    name: "Branford",
    abbr: "BR",
    color: "#2c2c2c",
    accentColor: "#888888",
    founded: "1933",
    motto: "Loyalty and service",
    description: "Branford College is one of the original residential colleges, featuring a gorgeous Gothic courtyard and a warm, tight-knit community right on the Old Campus.",
    location: "High Street",
    dean: "Residential College",
    symbol: "tower"
  },
  {
    name: "Davenport",
    abbr: "DC",
    color: "#a51c30",
    accentColor: "#d44a5c",
    founded: "1933",
    motto: "Courage and fellowship",
    description: "Davenport College is famed for its Georgian-style architecture, beautiful courtyards, and spirited traditions including its legendary Halloween party.",
    location: "York Street",
    dean: "Residential College",
    symbol: "shield"
  },
  {
    name: "Ezra Stiles",
    abbr: "ES",
    color: "#2d6a2e",
    accentColor: "#5cb85c",
    founded: "1961",
    motto: "Wisdom through experience",
    description: "Designed by Eero Saarinen, Ezra Stiles features a distinctive modernist design. Its concrete towers and intimate spaces foster a unique community spirit.",
    location: "Tower Parkway",
    dean: "Residential College",
    symbol: "sun"
  },
  {
    name: "Grace Hopper",
    abbr: "GH",
    color: "#d4a843",
    accentColor: "#f0d078",
    founded: "1933",
    motto: "Dare to innovate",
    description: "Renamed in 2017 to honor Rear Admiral Grace Hopper, a Yale PhD and computing pioneer. The college celebrates innovation, leadership, and trailblazing spirit.",
    location: "Wall Street",
    dean: "Residential College",
    symbol: "star"
  },
  {
    name: "Jonathan Edwards",
    abbr: "JE",
    color: "#6b4226",
    accentColor: "#a0724e",
    founded: "1933",
    motto: "Resolve and integrity",
    description: "JE is one of the original residential colleges. It boasts a beautiful courtyard with a distinctive sundial and maintains many beloved traditions.",
    location: "High Street",
    dean: "Residential College",
    symbol: "sundial"
  },
  {
    name: "Morse",
    abbr: "MC",
    color: "#7b1f3a",
    accentColor: "#b34e68",
    founded: "1961",
    motto: "Art and perseverance",
    description: "Morse College, like its neighbor Ezra Stiles, was designed by Eero Saarinen. Known for its strong arts community and distinctive brutalist architecture.",
    location: "Tower Parkway",
    dean: "Residential College",
    symbol: "quill"
  },
  {
    name: "Pauli Murray",
    abbr: "MY",
    color: "#1a8a7d",
    accentColor: "#3dbfb0",
    founded: "2017",
    motto: "Justice and compassion",
    description: "Named for civil rights activist and Yale Law alumna Pauli Murray. One of Yale's newest colleges, it celebrates diversity, justice, and community engagement.",
    location: "Prospect Street",
    dean: "Residential College",
    symbol: "scales"
  },
  {
    name: "Pierson",
    abbr: "PC",
    color: "#5a6e7f",
    accentColor: "#8ba3b8",
    founded: "1933",
    motto: "Strength in unity",
    description: "Pierson College features the famous Pierson-Sage courtyard and the iconic Slave Tower. Its community is known for strong bonds and spirited events.",
    location: "Park Street",
    dean: "Residential College",
    symbol: "key"
  },
  {
    name: "Saybrook",
    abbr: "SY",
    color: "#9b8732",
    accentColor: "#c4b35e",
    founded: "1933",
    motto: "Tradition and honor",
    description: "Saybrook College is named for the historic Collegiate School at Old Saybrook. It features an elegant courtyard and is home to many storied Yale traditions.",
    location: "High Street",
    dean: "Residential College",
    symbol: "crown"
  },
  {
    name: "Silliman",
    abbr: "SM",
    color: "#1756a9",
    accentColor: "#4d8ed9",
    founded: "1940",
    motto: "Discovery and wonder",
    description: "The largest residential college, Silliman offers a spacious courtyard and a warm, inclusive community. Named for Yale chemist Benjamin Silliman.",
    location: "Temple Street",
    dean: "Residential College",
    symbol: "flask"
  },
  {
    name: "Timothy Dwight",
    abbr: "TD",
    color: "#1a6b3c",
    accentColor: "#3da66a",
    founded: "1935",
    motto: "Friendship and loyalty",
    description: "TD is known for its intimate, family-like atmosphere and beautiful Georgian courtyard. The college hosts legendary study breaks and community dinners.",
    location: "Temple Street",
    dean: "Residential College",
    symbol: "torch"
  },
  {
    name: "Trumbull",
    abbr: "TC",
    color: "#4a3b6b",
    accentColor: "#7e6baa",
    founded: "1933",
    motto: "Honor and creativity",
    description: "Trumbull College is one of the original residential colleges, known for its creative community, beautiful dining hall, and the Trumbull Theatre.",
    location: "Elm Street",
    dean: "Residential College",
    symbol: "palette"
  }
];

// ============================================================
// SVG Crest Generator
// ============================================================
function generateCrest(college, size = 80) {
  const { color, accentColor, abbr, name } = college;

  // Pick a unique shield shape variation based on college index
  const idx = colleges.indexOf(college);
  const shieldPaths = [
    // Classic pointed
    "M10,5 Q50,0 90,5 L90,55 Q50,95 10,55 Z",
    // Rounded bottom
    "M10,5 L90,5 L90,55 Q90,90 50,92 Q10,90 10,55 Z",
    // Wide base
    "M15,5 Q50,0 85,5 L92,50 Q50,95 8,50 Z",
    // Tall shield
    "M10,3 L90,3 L88,60 Q50,97 12,60 Z",
    // Angular
    "M10,8 L50,2 L90,8 L85,58 L50,92 L15,58 Z",
    // Ornate top
    "M5,12 Q50,-3 95,12 L90,55 Q50,95 10,55 Z",
    // Square top
    "M8,5 L92,5 L90,58 Q50,95 10,58 Z",
    // Narrow
    "M18,5 Q50,0 82,5 L80,60 Q50,95 20,60 Z",
    // Pentagon-ish
    "M50,2 L92,20 L82,65 Q50,95 18,65 L8,20 Z",
    // Classic 2
    "M12,8 Q50,0 88,8 L88,52 Q50,92 12,52 Z",
    // Pointed deep
    "M10,5 Q50,-2 90,5 L88,50 Q50,98 12,50 Z",
    // Broad
    "M5,8 L95,8 L88,55 Q50,93 12,55 Z",
    // Elegant
    "M15,3 Q50,-2 85,3 L90,45 Q85,92 50,95 Q15,92 10,45 Z",
    // Compact
    "M12,6 Q50,0 88,6 L86,55 Q50,90 14,55 Z"
  ];

  const shieldPath = shieldPaths[idx % shieldPaths.length];

  // Inner decorative elements
  const decorations = [
    `<line x1="50" y1="20" x2="50" y2="70" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>
     <line x1="25" y1="45" x2="75" y2="45" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>`,
    `<circle cx="50" cy="42" r="18" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.35"/>`,
    `<path d="M50,18 L50,72 M30,30 L70,55 M70,30 L30,55" stroke="${accentColor}" stroke-width="1" opacity="0.25"/>`,
    `<rect x="30" y="25" width="40" height="35" rx="3" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>`,
    `<polygon points="50,18 62,38 82,38 66,52 72,72 50,60 28,72 34,52 18,38 38,38" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>`,
    `<path d="M35,25 Q50,15 65,25 Q65,50 50,65 Q35,50 35,25" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>`,
    `<line x1="30" y1="30" x2="70" y2="30" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>
     <line x1="30" y1="55" x2="70" y2="55" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>`,
    `<circle cx="50" cy="35" r="10" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>
     <circle cx="50" cy="55" r="8" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.3"/>`,
    `<path d="M50,20 L38,45 L62,45 Z" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>
     <path d="M50,70 L38,45 L62,45 Z" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>`,
    `<path d="M30,22 Q50,45 70,22" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>
     <path d="M30,62 Q50,40 70,62" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>`,
    `<ellipse cx="50" cy="40" rx="22" ry="28" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.25"/>`,
    `<path d="M50,15 L55,35 L75,35 L60,48 L65,68 L50,55 L35,68 L40,48 L25,35 L45,35 Z" fill="${accentColor}" opacity="0.15"/>`,
    `<rect x="35" y="22" width="30" height="42" rx="15" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>`,
    `<path d="M25,40 Q50,15 75,40 Q50,65 25,40" fill="none" stroke="${accentColor}" stroke-width="1.5" opacity="0.3"/>`
  ];

  const decoration = decorations[idx % decorations.length];

  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-${idx}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.9"/>
        <stop offset="100%" style="stop-color:${color};stop-opacity:1"/>
      </linearGradient>
      <linearGradient id="shine-${idx}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:white;stop-opacity:0.2"/>
        <stop offset="50%" style="stop-color:white;stop-opacity:0"/>
        <stop offset="100%" style="stop-color:black;stop-opacity:0.1"/>
      </linearGradient>
      <filter id="shadow-${idx}">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
      </filter>
    </defs>
    <!-- Shield body -->
    <path d="${shieldPath}" fill="url(#grad-${idx})" stroke="${accentColor}" stroke-width="2.5" filter="url(#shadow-${idx})"/>
    <!-- Shield shine -->
    <path d="${shieldPath}" fill="url(#shine-${idx})"/>
    <!-- Decoration -->
    ${decoration}
    <!-- Border inner highlight -->
    <path d="${shieldPath}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" transform="scale(0.92) translate(4.3, 4)"/>
    <!-- College abbreviation -->
    <text x="50" y="48" text-anchor="middle" dominant-baseline="middle"
      font-family="'Playfair Display', serif" font-weight="900" font-size="22"
      fill="white" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"
      style="text-shadow: 0 1px 3px rgba(0,0,0,0.4)">${abbr}</text>
  </svg>`;
}

// ============================================================
// Initialize Reels
// ============================================================
const ITEM_HEIGHT_DESKTOP = 180;
const ITEM_HEIGHT_MOBILE = 140;
const ITEM_HEIGHT_SMALL = 120;

function getItemHeight() {
  if (window.innerWidth <= 400) return ITEM_HEIGHT_SMALL;
  if (window.innerWidth <= 640) return ITEM_HEIGHT_MOBILE;
  return ITEM_HEIGHT_DESKTOP;
}

function getCrestSize() {
  if (window.innerWidth <= 400) return 45;
  if (window.innerWidth <= 640) return 55;
  return 80;
}

function populateReel(reelEl) {
  reelEl.innerHTML = '';
  const crestSize = getCrestSize();
  // Add multiple copies for continuous spinning effect
  for (let cycle = 0; cycle < 6; cycle++) {
    const shuffled = [...colleges].sort(() => Math.random() - 0.5);
    shuffled.forEach(college => {
      const item = document.createElement('div');
      item.className = 'reel-item';
      item.innerHTML = `
        <div class="crest">${generateCrest(college, crestSize)}</div>
        <div class="college-label">${college.name}</div>
      `;
      item.dataset.college = college.name;
      reelEl.appendChild(item);
    });
  }
}

function initReels() {
  const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
  ];
  reels.forEach(reel => populateReel(reel));
}

// ============================================================
// Slot Machine Spin Logic
// ============================================================
let isSpinning = false;

function spin() {
  if (isSpinning) return;
  isSpinning = true;

  const btn = document.getElementById('spinBtn');
  btn.disabled = true;
  btn.querySelector('.spin-btn-text').textContent = 'SPINNING...';
  btn.querySelector('.spin-btn-sub').textContent = '';

  // Hide result panel
  document.getElementById('resultPanel').classList.remove('visible');

  // Pick a random winning college
  const winnerIdx = Math.floor(Math.random() * colleges.length);
  const winner = colleges[winnerIdx];

  // Re-populate reels to ensure the winner ends up at the right place
  const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
  ];

  const itemHeight = getItemHeight();
  const crestSize = getCrestSize();

  reels.forEach((reel, i) => {
    reel.innerHTML = '';
    reel.style.transition = 'none';
    reel.style.transform = 'translateY(0)';

    // Build reel items: lots of random ones, then the winner at a known position
    const totalItems = 40 + (i * 8); // Stagger reel lengths
    const winnerPosition = totalItems - 3; // Winner near the end

    for (let j = 0; j < totalItems; j++) {
      const item = document.createElement('div');
      item.className = 'reel-item';
      let college;
      if (j === winnerPosition) {
        college = winner;
      } else {
        college = colleges[Math.floor(Math.random() * colleges.length)];
      }
      item.innerHTML = `
        <div class="crest">${generateCrest(college, crestSize)}</div>
        <div class="college-label">${college.name}</div>
      `;
      item.dataset.college = college.name;
      reel.appendChild(item);
    }

    // Calculate target position (center the winner in the window)
    const targetY = -(winnerPosition * itemHeight) + (itemHeight * 0);

    // Animate with staggered timing
    const delay = i * 400;
    const duration = 2500 + (i * 800);

    setTimeout(() => {
      reel.style.transition = `transform ${duration}ms cubic-bezier(0.15, 0.85, 0.35, 1)`;
      reel.style.transform = `translateY(${targetY}px)`;

      // Play a subtle tick sound effect via oscillator
      playTickSound(duration);
    }, delay);
  });

  // Show result after all reels stop
  const totalDuration = 2500 + (2 * 800) + 400 + 600;
  setTimeout(() => {
    showResult(winner);
    isSpinning = false;
  }, totalDuration);
}

// ============================================================
// Sound Effects (Web Audio API)
// ============================================================
let audioCtx = null;

function playTickSound(duration) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ticks = Math.floor(duration / 80);
    for (let i = 0; i < Math.min(ticks, 30); i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 800 + Math.random() * 400;
      osc.type = 'sine';
      gain.gain.value = 0.02;
      const t = audioCtx.currentTime + (i * duration / 1000 / ticks);
      osc.start(t);
      osc.stop(t + 0.03);
    }
  } catch(e) {
    // Audio not available, continue silently
  }
}

function playWinSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = 0.08;
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15 * (i + 1) + 0.5);
      osc.start(audioCtx.currentTime + 0.15 * i);
      osc.stop(audioCtx.currentTime + 0.15 * i + 0.6);
    });
  } catch(e) {}
}

// ============================================================
// Show Result
// ============================================================
function showResult(college) {
  const panel = document.getElementById('resultPanel');
  const crestEl = document.getElementById('resultCrest');
  const nameEl = document.getElementById('resultName');
  const mottoEl = document.getElementById('resultMotto');
  const descEl = document.getElementById('resultDesc');
  const detailsEl = document.getElementById('resultDetails');

  crestEl.innerHTML = generateCrest(college, window.innerWidth <= 640 ? 110 : 140);
  nameEl.textContent = college.name + ' College';
  mottoEl.textContent = `"${college.motto}"`;
  descEl.textContent = college.description;
  detailsEl.innerHTML = `
    <div class="detail-badge"><span class="badge-icon">📍</span> ${college.location}</div>
    <div class="detail-badge"><span class="badge-icon">📅</span> Est. ${college.founded}</div>
    <div class="detail-badge"><span class="badge-icon">🏛️</span> ${college.dean}</div>
  `;

  panel.classList.add('visible');
  playWinSound();
  launchConfetti(college.color, college.accentColor);

  // Scroll to result
  setTimeout(() => {
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

// ============================================================
// Reset
// ============================================================
function reset() {
  document.getElementById('resultPanel').classList.remove('visible');
  const btn = document.getElementById('spinBtn');
  btn.disabled = false;
  btn.querySelector('.spin-btn-text').textContent = 'FIND MY COLLEGE';
  btn.querySelector('.spin-btn-sub').textContent = 'Pull the lever!';
  initReels();

  // Scroll back to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// Confetti
// ============================================================
function launchConfetti(primaryColor, secondaryColor) {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = [primaryColor, secondaryColor, '#FFD700', '#FFFFFF', '#00356b', '#e8d48b'];
  const particles = [];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 300,
      w: 4 + Math.random() * 8,
      h: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  let frame = 0;
  const maxFrames = 180;

  function animate() {
    if (frame > maxFrames) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.rotation += p.rotationSpeed;
      p.vx *= 0.99;

      // Fade out near the end
      if (frame > maxFrames - 40) {
        p.opacity = Math.max(0, p.opacity - 0.025);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
}

// ============================================================
// Init
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  initReels();
});

window.addEventListener('resize', () => {
  if (!isSpinning) initReels();
});
