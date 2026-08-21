/* ==========================================================================
   CYPHERVERSE 3D CARD VIEWER & DYNAMIC 4K WALLPAPER ENGINE (MOBILE ENHANCED)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Pool of dossier cards (strictly matched front N to back N, 1 through 6)
  const cardsList = [
    { id: 1, front: "front 1.png", back: "back 1.png" },
    { id: 2, front: "front 2.png", back: "back 2.png" },
    { id: 3, front: "front 3.png", back: "back 3.png" },
    { id: 4, front: "front 4.png", back: "back 4.png" },
    { id: 5, front: "front 5.png", back: "back 5.png" },
    { id: 6, front: "front 6.png", back: "back 6.png" }
  ];

  // Pick a random card pair on load (front N <-> back N)
  const currentCardIndex = Math.floor(Math.random() * cardsList.length);
  let isFlipped = false;

  // Initialize selected card images directly without flash/glitch
  const frontImg = document.getElementById('frontImg');
  const backImg = document.getElementById('backImg');
  const selectedCard = cardsList[currentCardIndex];
  
  if (frontImg && backImg) {
    frontImg.src = selectedCard.front;
    backImg.src = selectedCard.back;
  }

  // ==========================================================================
  // PERMANENT BACKGROUND MUSIC ENGINE (NON-STOPPING LOOP)
  // ==========================================================================
  const bgMusic = document.getElementById('bgMusic') || new Audio('spiderman_nwh.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.7;

  const playBackgroundMusic = () => {
    bgMusic.play().catch(() => {
      // Browser autoplay restriction will be lifted on user's first touch/click
    });
  };

  // Attempt immediate autoplay
  playBackgroundMusic();

  // Enforce continuous playback on any user interaction (touch, click, keydown, scroll)
  const unlockAudio = () => {
    playBackgroundMusic();
    initAudioContext();
  };

  ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { passive: true });
    document.addEventListener(evt, unlockAudio, { passive: true });
  });

  // Ensure audio cannot be paused by user or system
  bgMusic.addEventListener('pause', () => {
    playBackgroundMusic();
  });

  bgMusic.addEventListener('ended', () => {
    bgMusic.currentTime = 0;
    playBackgroundMusic();
  });

  // Audio FX State (Web Thwip FX)
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
  // CANVAS BACKGROUND WEB PARTICLE SYSTEM (RESPONSIVE FOR MOBILE)
  // ==========================================================================
  const canvas = document.getElementById('webCanvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const resizeCanvas = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', resizeCanvas);

  const mouse = { x: width / 2, y: height / 2, active: false };

  const updatePointer = (clientX, clientY) => {
    mouse.x = clientX;
    mouse.y = clientY;
    mouse.active = true;
  };

  window.addEventListener('mousemove', (e) => updatePointer(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  const numNodes = Math.min(Math.floor(width / 24), 40);
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
  // CARD FLIP & 3D TILT MECHANICS (MOBILE TOUCH FRIENDLY)
  // ==========================================================================
  const cardContainer = document.getElementById('cardContainer');
  const flipCard = document.getElementById('flipCard');

  function toggleCardFlip(e) {
    isFlipped = !isFlipped;
    flipCard.classList.toggle('flipped', isFlipped);

    playWebThwipSound(1400);
    const rect = cardContainer.getBoundingClientRect();
    let clickX = rect.left + rect.width / 2;
    let clickY = rect.top + rect.height / 2;

    if (e) {
      if (e.clientX !== undefined) {
        clickX = e.clientX;
        clickY = e.clientY;
      } else if (e.changedTouches && e.changedTouches[0]) {
        clickX = e.changedTouches[0].clientX;
        clickY = e.changedTouches[0].clientY;
      }
    }
    triggerWebBurst(clickX, clickY);
  }

  if (cardContainer) {
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    // Handle touch tap cleanly on mobile devices without tap delay or ghost clicks
    cardContainer.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    cardContainer.addEventListener('touchend', (e) => {
      const duration = Date.now() - touchStartTime;
      let endX = touchStartX;
      let endY = touchStartY;
      if (e.changedTouches && e.changedTouches[0]) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
      }
      const moveDistance = Math.hypot(endX - touchStartX, endY - touchStartY);

      // If quick tap with minimal movement (<12px), trigger card flip
      if (duration < 400 && moveDistance < 12) {
        e.preventDefault();
        toggleCardFlip(e);
      }
    });

    // Mouse click for desktop
    cardContainer.addEventListener('click', (e) => {
      // Prevent double trigger on touch devices
      if (Date.now() - touchStartTime > 500) {
        toggleCardFlip(e);
      }
    });

    // Also allow clicking directly on the blinking tap hint
    const tapHint = document.getElementById('tapHint');
    if (tapHint) {
      tapHint.addEventListener('click', (e) => {
        toggleCardFlip(e);
      });
      tapHint.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleCardFlip();
        }
      });
    }

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

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      const baseRotationY = isFlipped ? 180 : 0;
      const finalRotateY = baseRotationY + rotateY;

      flipCard.style.transform = `rotateY(${finalRotateY}deg) rotateX(${rotateX}deg) scale(1.02)`;
    });

    cardContainer.addEventListener('mouseleave', () => {
      const baseRotationY = isFlipped ? 180 : 0;
      flipCard.style.transform = `rotateY(${baseRotationY}deg) rotateX(0deg) scale(1)`;
    });
  }

  // ==========================================================================
  // DYNAMIC 4K WALLPAPER BACKGROUND ENGINE (AUTO ROTATES EVERY 2.5 SECONDS)
  // ==========================================================================
  const wallpapersCollection = [
    "background/marvels-spider-man-3840x2160-12554.jpeg",
    "background/marvels-spider-man-4096x1738-13276.jpeg",
    "background/miles-morales-spider-man-minimal-art-marvel-superheroes-3840x4733-5769.png",
    "background/spider-man-across-7680x4320-11773.jpg",
    "background/spider-man-black-suit-spider-man-far-from-home-black-3840x2458-658.jpg",
    "background/spider-man-dark-artwork-3300x5500-1894.jpg",
    "background/spider-man-far-from-home-5k-5100x6691-947.jpg",
    "background/spider-man-marvel-superheroes-red-background-marvel-comics-3840x2160-7494.jpg",
    "background/spider-man-miles-morales-lightning-playstation-4-3840x2160-7705.jpg",
    "background/spider-man-night-monkey-spider-man-far-from-home-artwork-3686x4479-110.jpg",
    "background/spider-man-venom-marvel-comics-3840x4956-588.jpg",
    "background/spider-noir-2026-5120x2880-24881.jpg"
  ];

  let currentWallpaperIndex = 0;
  let activeLayerIsA = true;

  const layerA = document.getElementById('wallpaperLayerA');
  const layerB = document.getElementById('wallpaperLayerB');

  // Apply Background Wallpaper
  function applyWallpaper(index) {
    if (!layerA || !layerB) return;
    if (index < 0) index = wallpapersCollection.length - 1;
    if (index >= wallpapersCollection.length) index = 0;

    currentWallpaperIndex = index;
    const bgFile = wallpapersCollection[currentWallpaperIndex];

    const activeLayer = activeLayerIsA ? layerA : layerB;
    const nextLayer = activeLayerIsA ? layerB : layerA;

    nextLayer.style.backgroundImage = `url('${bgFile}')`;
    nextLayer.classList.add('active');
    activeLayer.classList.remove('active');
    activeLayerIsA = !activeLayerIsA;

    try {
      sessionStorage.setItem('lastWallpaperIndex', currentWallpaperIndex.toString());
    } catch (e) {}
  }

  // Randomize wallpaper selection
  function randomizeWallpaper() {
    if (wallpapersCollection.length <= 1) return;
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * wallpapersCollection.length);
    } while (nextIdx === currentWallpaperIndex);

    applyWallpaper(nextIdx);
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

    applyWallpaper(initialIdx);
  }

  // Start background engine & set 2.5 second auto-rotation interval
  initRandomWallpaper();
  setInterval(randomizeWallpaper, 2500);
});
