/* ==========================================================================
   SPIDER-VERSE MINIMAL RANDOM 3D FLIP CARD INTERACTION & PHYSICS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Pool of available dossier cards in the list
  const cardsList = [
    { id: 1, name: "CARD 01", front: "front_image.png", back: "back_image.png" },
    { id: 2, name: "CARD 02", front: "front 2.png", back: "back 2.png" },
    { id: 3, name: "CARD 03", front: "front 3.png", back: "back 3.png" },
    { id: 4, name: "CARD 04", front: "front 4.png", back: "back 4.png" }
  ];

  let currentCardIndex = Math.floor(Math.random() * cardsList.length);
  let isFlipped = false;

  // Audio FX State
  let soundEnabled = true;
  let audioCtx = null;

  // Initialize Web Audio API Synth
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

  // Nodes for floating web network
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

  // Web Burst Click Particles
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

  // Render Loop
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
  // RANDOM CARD SELECTION & 3D FLIP MECHANICS
  // ==========================================================================
  const cardContainer = document.getElementById('cardContainer');
  const flipCard = document.getElementById('flipCard');
  const frontImg = document.getElementById('frontImg');
  const backImg = document.getElementById('backImg');
  const flipPromptBtn = document.getElementById('flipPromptBtn');
  const statusText = document.getElementById('statusText');
  const statusBadge = document.getElementById('cardStatusBadge');
  const cardListSelect = document.getElementById('cardListSelect');
  const drawRandomBtn = document.getElementById('drawRandomBtn');
  const secondaryRandomBtn = document.getElementById('secondaryRandomBtn');

  // Update Status Badge UI
  function updateStatusBadge() {
    const cardData = cardsList[currentCardIndex];
    if (isFlipped) {
      statusText.textContent = `${cardData.name} • SIDE B (BACK SPECS)`;
      statusBadge.style.borderColor = 'rgba(230, 0, 18, 0.4)';
      statusBadge.style.boxShadow = '0 0 15px rgba(230, 0, 18, 0.2)';
    } else {
      statusText.textContent = `${cardData.name} • SIDE A (FRONT COVER)`;
      statusBadge.style.borderColor = 'rgba(0, 240, 255, 0.3)';
      statusBadge.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.15)';
    }
  }

  // Load Specific Card by Index
  function loadCard(index) {
    currentCardIndex = index;
    isFlipped = false;

    // Trigger visual switch animation
    cardContainer.classList.add('switching');
    playWebThwipSound(1800);

    setTimeout(() => {
      // Reset flip rotation
      flipCard.classList.remove('flipped');
      flipCard.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';

      // Update image sources
      const data = cardsList[currentCardIndex];
      frontImg.src = data.front;
      backImg.src = data.back;

      // Sync dropdown select element
      cardListSelect.value = currentCardIndex;

      updateStatusBadge();

      // Fade back in
      cardContainer.classList.remove('switching');
    }, 150);
  }

  // Pick a Random Card from the List
  function drawRandomCard() {
    let nextIndex = Math.floor(Math.random() * cardsList.length);
    // Ensure we pick a different card if possible
    if (cardsList.length > 1 && nextIndex === currentCardIndex) {
      nextIndex = (currentCardIndex + 1) % cardsList.length;
    }
    loadCard(nextIndex);
    const rect = cardContainer.getBoundingClientRect();
    triggerWebBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  // Initial Load with Random Card Selection
  loadCard(currentCardIndex);

  // Toggle Single Card Flip
  function toggleCardFlip(e) {
    isFlipped = !isFlipped;

    // Toggle CSS class
    flipCard.classList.toggle('flipped', isFlipped);

    // Sound & Particle Burst
    playWebThwipSound(1400);
    const rect = cardContainer.getBoundingClientRect();
    const clickX = e && e.clientX ? e.clientX : rect.left + rect.width / 2;
    const clickY = e && e.clientY ? e.clientY : rect.top + rect.height / 2;
    triggerWebBurst(clickX, clickY);

    updateStatusBadge();
  }

  // Event Listeners
  drawRandomBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    drawRandomCard();
  });

  secondaryRandomBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    drawRandomCard();
  });

  cardListSelect.addEventListener('change', (e) => {
    const selectedIdx = parseInt(e.target.value, 10);
    loadCard(selectedIdx);
  });

  cardContainer.addEventListener('click', (e) => {
    toggleCardFlip(e);
  });

  flipPromptBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCardFlip(e);
  });

  // Keyboard Navigation (Space/Enter to flip, 'r' or 'R' or Arrow keys to pick random)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      drawRandomCard();
    } else if (e.key === ' ' || e.key === 'Enter') {
      if (document.activeElement === cardContainer || document.activeElement === document.body) {
        e.preventDefault();
        toggleCardFlip();
      }
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

  // Sound Toggle Button
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  soundToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEnabled = !soundEnabled;
    soundToggleBtn.querySelector('.btn-text').textContent = soundEnabled ? 'THWIP FX: ON' : 'THWIP FX: OFF';
    soundToggleBtn.querySelector('.sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled) playWebThwipSound(1600);
  });
});
