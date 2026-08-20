/* ==========================================================================
   SPIDER-VERSE 3D CARD VIEWER & DYNAMIC 4K WALLPAPER ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Pool of dossier cards (randomly selected 1 card on load)
  const cardsList = [
    { id: 1, front: "front_image.png", back: "back_image.png" },
    { id: 2, front: "front 2.png", back: "back 2.png" },
    { id: 3, front: "front 3.png", back: "back 3.png" },
    { id: 4, front: "front 4.png", back: "back 4.png" }
  ];

  // Pick a random card on load
  const currentCardIndex = Math.floor(Math.random() * cardsList.length);
  let isFlipped = false;

  // Initialize selected card images
  const frontImg = document.getElementById('frontImg');
  const backImg = document.getElementById('backImg');
  const selectedCard = cardsList[currentCardIndex];
  
  if (frontImg && backImg) {
    frontImg.src = selectedCard.front;
    backImg.src = selectedCard.back;
  }

  // Audio FX State
  let soundEnabled = true;
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize Web-Shooter / Card Flip "THWIP!" Sound Effect
  function playWebThwipSound(pitch = 1500) {
    if (!soundEnabled) return;
    try {
      initAudioContext();
      const now = audioCtx.currentTime;

      // 1. High Whip Pitch Sweep (Oscillator)
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.14);

      oscGain.gain.setValueAtTime(0.35, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.14);

      // 2. Air Displacement Noise Burst
      const bufferSize = audioCtx.sampleRate * 0.09;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 3.5;

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);

      noise.start(now);
      noise.stop(now + 0.09);

    } catch (err) {
      console.warn("Audio synthesis notice:", err);
    }
  }

  // ==========================================================================
  // CANVAS BACKGROUND WEB PARTICLE SYSTEM
  // ==========================================================================
  const canvas = document.getElementById('webCanvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: width / 2, y: height / 2, active: false };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  const numNodes = Math.min(Math.floor(width / 24), 55);
  const nodes = [];

  class WebNode {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
      this.radius = Math.random() * 2 + 1.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          this.x += (dx / dist) * 0.7;
          this.y += (dy / dist) * 0.7;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230, 0, 18, 0.7)';
      ctx.fill();
    }
  }

  for (let i = 0; i < numNodes; i++) {
    nodes.push(new WebNode());
  }

  const bursts = [];

  class WebBurstParticle {
    constructor(x, y, angle, speed) {
      this.x = x;
      this.y = y;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.life = 1.0;
      this.decay = Math.random() * 0.035 + 0.02;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(mouse.x, mouse.y);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.life * 0.8})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function triggerWebBurst(x, y) {
    const numFibers = 16;
    for (let i = 0; i < numFibers; i++) {
      const angle = (Math.PI * 2 / numFibers) * i + (Math.random() - 0.5) * 0.2;
      const speed = Math.random() * 8 + 6;
      bursts.push(new WebBurstParticle(x, y, angle, speed));
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].update();
      nodes[i].draw();

      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0, 81, 186, ${1 - dist / 130})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      if (mouse.active) {
        const mdx = nodes[i].x - mouse.x;
        const mdy = nodes[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * (1 - mdist / 140)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    for (let i = bursts.length - 1; i >= 0; i--) {
      bursts[i].update();
      bursts[i].draw();
      if (bursts[i].life <= 0) {
        bursts.splice(i, 1);
      }
    }

    requestAnimationFrame(animateCanvas);
  }

  animateCanvas();

  // ==========================================================================
  // CARD FLIP & 3D TILT MECHANICS
  // ==========================================================================
  const cardContainer = document.getElementById('cardContainer');
  const flipCard = document.getElementById('flipCard');

  function toggleCardFlip(e) {
    isFlipped = !isFlipped;
    flipCard.classList.toggle('flipped', isFlipped);

    playWebThwipSound(1400);
    const rect = cardContainer.getBoundingClientRect();
    const clickX = e && e.clientX ? e.clientX : rect.left + rect.width / 2;
    const clickY = e && e.clientY ? e.clientY : rect.top + rect.height / 2;
    triggerWebBurst(clickX, clickY);
  }

  cardContainer.addEventListener('click', (e) => {
    toggleCardFlip(e);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleCardFlip();
    }
  });

  // Interactive 3D Perspective Tilt Tracking
  cardContainer.addEventListener('mousemove', (e) => {
    const rect = cardContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    const baseRotationY = isFlipped ? 180 : 0;
    const finalRotateY = baseRotationY + rotateY;

    flipCard.style.transform = `rotateY(${finalRotateY}deg) rotateX(${rotateX}deg) scale(1.02)`;
  });

  cardContainer.addEventListener('mouseleave', () => {
    const baseRotationY = isFlipped ? 180 : 0;
    flipCard.style.transform = `rotateY(${baseRotationY}deg) rotateX(0deg) scale(1)`;
  });

  // ==========================================================================
  // DYNAMIC 4K WALLPAPER BACKGROUND ENGINE & GALLERY VAULT (FROM BRANCH RAJAT)
  // ==========================================================================
  const wallpapersCollection = [
    {
      id: 1,
      title: "01 • Marvel's Spider-Man Action (4K)",
      file: "background/marvels-spider-man-3840x2160-12554.jpeg",
      tag: "4K UHD",
      desc: "High-flying action Spider-Man in 4K resolution"
    },
    {
      id: 2,
      title: "02 • Marvel's Spider-Man Cinematic (4K)",
      file: "background/marvels-spider-man-4096x1738-13276.jpeg",
      tag: "Cinematic 4K",
      desc: "Widescreen cinematic Spider-Man dynamic pose"
    },
    {
      id: 3,
      title: "03 • Miles Morales Minimal Art (4K Mobile)",
      file: "background/miles-morales-spider-man-minimal-art-marvel-superheroes-3840x4733-5769.png",
      tag: "Mobile 4K",
      desc: "Stylized minimal pop art portrait of Miles Morales"
    },
    {
      id: 4,
      title: "04 • Across the Spider-Verse (8K Ultra)",
      file: "background/spider-man-across-7680x4320-11773.jpg",
      tag: "8K Ultra-HD",
      desc: "Epic multiverse spider-society battle across dimensions"
    },
    {
      id: 5,
      title: "05 • Spider-Man Stealth Black Suit (4K)",
      file: "background/spider-man-black-suit-spider-man-far-from-home-black-3840x2458-658.jpg",
      tag: "Stealth 4K",
      desc: "Tactical stealth black suit night surveillance"
    },
    {
      id: 6,
      title: "06 • Spider-Man Dark Artwork (5K Mobile)",
      file: "background/spider-man-dark-artwork-3300x5500-1894.jpg",
      tag: "Mobile 5K",
      desc: "Moody dark aesthetic illustration of Spider-Man"
    },
    {
      id: 7,
      title: "07 • Spider-Man: Far From Home (5K Mobile)",
      file: "background/spider-man-far-from-home-5k-5100x6691-947.jpg",
      tag: "Mobile 5K",
      desc: "Vertical ultra-high-resolution movie poster artwork"
    },
    {
      id: 8,
      title: "08 • Spider-Man Classic Red Background (4K)",
      file: "background/spider-man-marvel-superheroes-red-background-marvel-comics-3840x2160-7494.jpg",
      tag: "Marvel 4K",
      desc: "Classic Marvel comics spider-hero on crimson backdrop"
    },
    {
      id: 9,
      title: "09 • Miles Morales Venom Lightning (4K)",
      file: "background/spider-man-miles-morales-lightning-playstation-4-3840x2160-7705.jpg",
      tag: "Venom Power",
      desc: "Miles Morales bio-electric lightning charge attack"
    },
    {
      id: 10,
      title: "10 • Night Monkey Stealth Artwork (4K Mobile)",
      file: "background/spider-man-night-monkey-spider-man-far-from-home-artwork-3686x4479-110.jpg",
      tag: "Mobile 4K",
      desc: "European stealth mission Night Monkey hero artwork"
    },
    {
      id: 11,
      title: "11 • Spider-Man & Venom Marvel Comics (5K)",
      file: "background/spider-man-venom-marvel-comics-3840x4956-588.jpg",
      tag: "Mobile 5K",
      desc: "Dynamic face-off artwork between Spider-Man and Venom"
    },
    {
      id: 12,
      title: "12 • Spider-Noir 2026 Edition (5K UHD)",
      file: "background/spider-noir-2026-5120x2880-24881.jpg",
      tag: "5K Noir",
      desc: "1930s noir detective trench-coat hero in 5K ultra definition"
    }
  ];

  let currentWallpaperIndex = 0;
  let activeLayerIsA = true;

  const layerA = document.getElementById('wallpaperLayerA');
  const layerB = document.getElementById('wallpaperLayerB');
  const bgTitleText = document.getElementById('bgTitleText');
  const downloadBgBtn = document.getElementById('downloadBgBtn');
  const randomBgBtn = document.getElementById('randomBgBtn');
  const galleryToggleBtn = document.getElementById('galleryToggleBtn');
  const galleryBtnText = document.getElementById('galleryBtnText');
  const prevBgBtn = document.getElementById('prevBgBtn');
  const nextBgBtn = document.getElementById('nextBgBtn');
  const wallpaperModal = document.getElementById('wallpaperModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const wallpapersGrid = document.getElementById('wallpapersGrid');

  if (galleryBtnText) {
    galleryBtnText.textContent = `WALLPAPERS (${wallpapersCollection.length})`;
  }

  // Apply Wallpaper with Dual-Layer Crossfade Transition
  function applyWallpaper(index, playSound = true) {
    if (index < 0) index = wallpapersCollection.length - 1;
    if (index >= wallpapersCollection.length) index = 0;

    currentWallpaperIndex = index;
    const wp = wallpapersCollection[currentWallpaperIndex];

    const activeLayer = activeLayerIsA ? layerA : layerB;
    const nextLayer = activeLayerIsA ? layerB : layerA;

    nextLayer.style.backgroundImage = `url('${wp.file}')`;
    nextLayer.classList.add('active');
    activeLayer.classList.remove('active');
    activeLayerIsA = !activeLayerIsA;

    if (bgTitleText) bgTitleText.textContent = wp.title;
    if (downloadBgBtn) {
      downloadBgBtn.href = wp.file;
      const ext = wp.file.split('.').pop() || 'jpg';
      downloadBgBtn.download = `SpiderVerse_${wp.title.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
    }

    try {
      sessionStorage.setItem('lastWallpaperIndex', currentWallpaperIndex.toString());
    } catch (e) {}

    document.querySelectorAll('.wp-card').forEach((card, idx) => {
      card.classList.toggle('active-wp', idx === currentWallpaperIndex);
    });

    if (playSound) playWebThwipSound(1900);
  }

  // Randomize Background
  function randomizeWallpaper() {
    if (wallpapersCollection.length <= 1) return;
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * wallpapersCollection.length);
    } while (nextIdx === currentWallpaperIndex);

    applyWallpaper(nextIdx, true);
  }

  // Pick a fresh random background on page load
  function initRandomWallpaper() {
    let lastIdx = -1;
    try {
      const stored = sessionStorage.getItem('lastWallpaperIndex');
      if (stored !== null) lastIdx = parseInt(stored, 10);
    } catch (e) {}

    let initialIdx;
    if (wallpapersCollection.length > 1) {
      do {
        initialIdx = Math.floor(Math.random() * wallpapersCollection.length);
      } while (initialIdx === lastIdx);
    } else {
      initialIdx = 0;
    }

    applyWallpaper(initialIdx, false);
  }

  // Populate Wallpapers Gallery Modal
  function populateWallpapersModal() {
    if (!wallpapersGrid) return;
    wallpapersGrid.innerHTML = '';
    wallpapersCollection.forEach((wp, idx) => {
      const card = document.createElement('div');
      card.className = `wp-card ${idx === currentWallpaperIndex ? 'active-wp' : ''}`;
      card.innerHTML = `
        <div class="wp-thumb-wrapper">
          <img src="${wp.file}" alt="${wp.title}" class="wp-thumb-img" loading="lazy" />
          <span class="wp-active-badge">✓ ACTIVE</span>
          <span class="wp-quality-badge">${wp.tag}</span>
        </div>
        <div class="wp-info">
          <div class="wp-title" title="${wp.title}">${wp.title}</div>
          <div class="wp-actions">
            <button class="wp-btn apply-btn" data-index="${idx}">APPLY</button>
            <a class="wp-btn dl-btn" href="${wp.file}" download="${wp.file.split('/').pop()}" target="_blank">📥 4K</a>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.dl-btn')) return;
        applyWallpaper(idx, true);
        closeModal();
      });

      wallpapersGrid.appendChild(card);
    });
  }

  function openModal() {
    populateWallpapersModal();
    if (wallpaperModal) wallpaperModal.classList.add('open');
    playWebThwipSound(1500);
  }

  function closeModal() {
    if (wallpaperModal) wallpaperModal.classList.remove('open');
  }

  if (randomBgBtn) {
    randomBgBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      randomizeWallpaper();
    });
  }

  if (galleryToggleBtn) {
    galleryToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal();
    });
  }

  if (prevBgBtn) {
    prevBgBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      applyWallpaper(currentWallpaperIndex - 1, true);
    });
  }

  if (nextBgBtn) {
    nextBgBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      applyWallpaper(currentWallpaperIndex + 1, true);
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Sound Toggle Button
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEnabled = !soundEnabled;
      soundToggleBtn.querySelector('.btn-text').textContent = soundEnabled ? 'FX: ON' : 'FX: OFF';
      soundToggleBtn.querySelector('.sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
      if (soundEnabled) playWebThwipSound(1600);
    });
  }

  // Keyboard Shortcuts for Wallpapers
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wallpaperModal && wallpaperModal.classList.contains('open')) {
      closeModal();
    } else if (e.key === 'w' || e.key === 'W') {
      if (document.activeElement.tagName !== 'INPUT') {
        randomizeWallpaper();
      }
    }
  });

  // Start random wallpaper background engine
  initRandomWallpaper();
});
