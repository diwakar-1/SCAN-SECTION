/* ==========================================================================
   SPIDER-VERSE MINIMAL 3D MULTI-CARD INTERACTION & PHYSICS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Card Collection Data
  const cardsCollection = [
    { id: 1, name: "CARD 01", front: "front_image.png", back: "back_image.png" },
    { id: 2, name: "CARD 02", front: "front 2.png", back: "back 2.png" },
    { id: 3, name: "CARD 03", front: "front 3.png", back: "back 3.png" },
    { id: 4, name: "CARD 04", front: "front 4.png", back: "back 4.png" }
  ];

  let currentCardIndex = 0;
  let isFlipped = false;

  // Sound FX State
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

  // Synthesize Distinct Comic "Whoosh" & "Thwip" Web Sound Effect for Card Flips
  function playCardFlipWhoosh() {
    if (!soundEnabled) return;
    try {
      initAudioContext();
      const now = audioCtx.currentTime;

      // 1. High-tension Web Whip Sweep (Sawtooth)
      const oscHigh = audioCtx.createOscillator();
      const gainHigh = audioCtx.createGain();
      oscHigh.type = 'sawtooth';
      oscHigh.frequency.setValueAtTime(2400, now);
      oscHigh.frequency.exponentialRampToValueAtTime(160, now + 0.16);
      gainHigh.gain.setValueAtTime(0.38, now);
      gainHigh.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      oscHigh.connect(gainHigh);
      gainHigh.connect(audioCtx.destination);
      oscHigh.start(now);
      oscHigh.stop(now + 0.16);

      // 2. Air Displacement Comic Page / Card Whoosh (Triangle Sweep)
      const oscLow = audioCtx.createOscillator();
      const gainLow = audioCtx.createGain();
      oscLow.type = 'triangle';
      oscLow.frequency.setValueAtTime(540, now);
      oscLow.frequency.exponentialRampToValueAtTime(65, now + 0.22);
      gainLow.gain.setValueAtTime(0.42, now);
      gainLow.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      oscLow.connect(gainLow);
      gainLow.connect(audioCtx.destination);
      oscLow.start(now);
      oscLow.stop(now + 0.22);

      // 3. Web Shooter Burst Noise Snap
      const bufferSize = audioCtx.sampleRate * 0.08;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2600;
      filter.Q.value = 4.0;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.48, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.08);
    } catch (err) {
      console.warn("Card flip whoosh audio notice:", err);
    }
  }

  // Synthesize Radio / Spider-Sense Chime when Hero Voice Plays
  function playSpiderSenseChime() {
    if (!soundEnabled) return;
    try {
      initAudioContext();
      const now = audioCtx.currentTime;
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.25, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } catch (e) {}
  }

  // Standard Web SFX (Tab switches, clicks)
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
  // CARD COLLECTION SWITCHER & 3D FLIP MECHANICS
  // ==========================================================================
  const cardContainer = document.getElementById('cardContainer');
  const flipCard = document.getElementById('flipCard');
  const frontImg = document.getElementById('frontImg');
  const backImg = document.getElementById('backImg');
  const flipPromptBtn = document.getElementById('flipPromptBtn');
  const statusText = document.getElementById('statusText');
  const statusBadge = document.getElementById('cardStatusBadge');
  const prevCardBtn = document.getElementById('prevCardBtn');
  const nextCardBtn = document.getElementById('nextCardBtn');
  const tabBtns = document.querySelectorAll('.selector-tab');

  // Update Status Display Badge
  function updateStatusBadge() {
    const cardData = cardsCollection[currentCardIndex];
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

  // Hero Voice Lines Collection
  const heroVoiceLines = [
    {
      hero: "PETER B. PARKER (EARTH-616)",
      quote: "With great power comes great responsibility. No matter how many hits I take, I always find a way to come back.",
      pitch: 0.95,
      rate: 1.05
    },
    {
      hero: "MILES MORALES (EARTH-1610)",
      quote: "Nah, I'mma do my own thing. Everyone keeps telling me how my story is supposed to go... not this time!",
      pitch: 1.15,
      rate: 1.1
    },
    {
      hero: "GWEN STACY (EARTH-65)",
      quote: "In my universe, I couldn't save my best friend. But being Ghost-Spider taught me that we're never truly alone in the multiverse.",
      pitch: 1.25,
      rate: 1.05
    },
    {
      hero: "MIGUEL O'HARA (EARTH-928)",
      quote: "You have a choice between saving one person and saving an entire universe. That is the canon event.",
      pitch: 0.82,
      rate: 0.98
    }
  ];

  const heroVoiceBtn = document.getElementById('heroVoiceBtn');
  const heroQuoteBubble = document.getElementById('heroQuoteBubble');
  const quoteSpeaker = document.getElementById('quoteSpeaker');
  const quoteText = document.getElementById('quoteText');
  let speechTimeout = null;

  // Update Voice Quote Text for Active Card
  function updateHeroVoiceLine() {
    const data = heroVoiceLines[currentCardIndex];
    if (data) {
      if (quoteSpeaker) quoteSpeaker.textContent = data.hero;
      if (quoteText) quoteText.textContent = `"${data.quote}"`;
    }
  }

  // Play Hero Voice Line Quote
  function playHeroVoiceQuote() {
    const data = heroVoiceLines[currentCardIndex];
    if (!data) return;

    playSpiderSenseChime();
    updateHeroVoiceLine();

    if (heroQuoteBubble) heroQuoteBubble.classList.add('active');
    if (heroVoiceBtn) heroVoiceBtn.classList.add('speaking');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(data.quote);
      utterance.pitch = data.pitch;
      utterance.rate = data.rate;

      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      if (englishVoices.length > 0) {
        if (currentCardIndex === 2) { // Gwen
          const femaleVoice = englishVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('victoria'));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else {
          const maleVoice = englishVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('alex'));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

      utterance.onend = () => {
        if (heroVoiceBtn) heroVoiceBtn.classList.remove('speaking');
        if (speechTimeout) clearTimeout(speechTimeout);
        speechTimeout = setTimeout(() => {
          if (heroQuoteBubble) heroQuoteBubble.classList.remove('active');
        }, 2500);
      };

      utterance.onerror = () => {
        if (heroVoiceBtn) heroVoiceBtn.classList.remove('speaking');
      };

      window.speechSynthesis.speak(utterance);
    }

    if (speechTimeout) clearTimeout(speechTimeout);
    speechTimeout = setTimeout(() => {
      if (heroQuoteBubble) heroQuoteBubble.classList.remove('active');
      if (heroVoiceBtn) heroVoiceBtn.classList.remove('speaking');
    }, 6000);
  }

  if (heroVoiceBtn) {
    heroVoiceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playHeroVoiceQuote();
    });
  }

  // Switch Active Card with Smooth Transition
  function selectCard(newIndex) {
    if (newIndex < 0) newIndex = cardsCollection.length - 1;
    if (newIndex >= cardsCollection.length) newIndex = 0;
    if (newIndex === currentCardIndex && !isFlipped) return;

    currentCardIndex = newIndex;
    isFlipped = false;

    // Reset quote bubble on card change
    if (heroQuoteBubble) heroQuoteBubble.classList.remove('active');
    if (heroVoiceBtn) heroVoiceBtn.classList.remove('speaking');

    // Trigger visual switch animation
    cardContainer.classList.add('switching');
    playWebThwipSound(1800);

    setTimeout(() => {
      // Reset flip rotation
      flipCard.classList.remove('flipped');
      flipCard.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';

      // Update image sources
      const data = cardsCollection[currentCardIndex];
      frontImg.src = data.front;
      backImg.src = data.back;

      // Update active tab buttons
      tabBtns.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === currentCardIndex);
      });

      updateStatusBadge();
      updateHeroVoiceLine();

      // Fade back in
      cardContainer.classList.remove('switching');
    }, 150);
  }

  // Toggle Card Flip with Distinct Comic "Whoosh" & "Thwip" SFX
  function toggleCardFlip(e) {
    isFlipped = !isFlipped;

    // Toggle CSS class
    flipCard.classList.toggle('flipped', isFlipped);

    // Play Distinct Comic Web Whoosh & Card Flip SFX
    playCardFlipWhoosh();

    const rect = cardContainer.getBoundingClientRect();
    const clickX = e && e.clientX ? e.clientX : rect.left + rect.width / 2;
    const clickY = e && e.clientY ? e.clientY : rect.top + rect.height / 2;
    triggerWebBurst(clickX, clickY);

    updateStatusBadge();
  }

  // Selector Tab Click Listeners
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.getAttribute('data-index'), 10);
      selectCard(index);
    });
  });

  // Navigation Buttons
  prevCardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectCard(currentCardIndex - 1);
  });

  nextCardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectCard(currentCardIndex + 1);
  });

  // Card & Prompt Button Clicks
  cardContainer.addEventListener('click', (e) => {
    toggleCardFlip(e);
  });

  flipPromptBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCardFlip(e);
  });

  // Keyboard Navigation & Accessibility
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      selectCard(currentCardIndex - 1);
    } else if (e.key === 'ArrowRight') {
      selectCard(currentCardIndex + 1);
    } else if (e.key === ' ' || e.key === 'Enter') {
      if (document.activeElement === cardContainer || document.activeElement === document.body) {
        e.preventDefault();
        toggleCardFlip();
      }
    }
  });

  // Touch Swipe Gesture Navigation
  let touchStartX = 0;
  cardContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  cardContainer.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diffX = touchEndX - touchStartX;
    if (Math.abs(diffX) > 50) {
      if (diffX < 0) {
        selectCard(currentCardIndex + 1);
      } else {
        selectCard(currentCardIndex - 1);
      }
    }
  }, { passive: true });

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

  // Sound FX Toggle Button
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  soundToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEnabled = !soundEnabled;
    soundToggleBtn.querySelector('.btn-text').textContent = soundEnabled ? 'FX: ON' : 'FX: OFF';
    soundToggleBtn.querySelector('.sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled) playWebThwipSound(1600);
  });

  // ==========================================================================
  // LOOPING BACKGROUND THEME MUSIC PLAYLIST ENGINE (from music/ folder)
  // ==========================================================================
  const musicPlaylist = [
    { id: 1, title: "Spider-Man Theme Song", file: "music/spiderman_theme_song.mp3" },
    { id: 2, title: "Bully Maguire Theme", file: "music/bully_maguire_theme.mp3" },
    { id: 3, title: "Spider-Verse Ambience", file: "music/Audio 2026-08-20 at 12.22.53 PM.mpeg" }
  ];

  let currentTrackIndex = 0;
  const bgThemeAudio = document.getElementById('bgThemeAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicBtnText = document.getElementById('musicBtnText');

  let isMusicPlaying = false;
  let hasUserInteractedForMusic = false;

  if (bgThemeAudio) {
    bgThemeAudio.loop = true;
    bgThemeAudio.volume = 0.55;
    bgThemeAudio.src = musicPlaylist[0].file;
  }

  function switchTrack(index) {
    if (index < 0) index = musicPlaylist.length - 1;
    if (index >= musicPlaylist.length) index = 0;
    currentTrackIndex = index;
    const track = musicPlaylist[currentTrackIndex];
    if (bgThemeAudio) {
      const wasPlaying = !bgThemeAudio.paused;
      bgThemeAudio.src = track.file;
      bgThemeAudio.load();
      if (wasPlaying) {
        bgThemeAudio.play().then(() => updateMusicUI(true)).catch(() => {});
      }
    }
  }

  function updateMusicUI(playing) {
    isMusicPlaying = playing;
    if (musicToggleBtn) {
      const track = musicPlaylist[currentTrackIndex];
      if (playing) {
        musicToggleBtn.classList.remove('is-paused');
        musicToggleBtn.classList.add('is-playing');
        if (musicBtnText) musicBtnText.textContent = `MUSIC: ON`;
        musicToggleBtn.title = `Now Playing: ${track.title} (Click to Pause, Press M)`;
      } else {
        musicToggleBtn.classList.remove('is-playing');
        musicToggleBtn.classList.add('is-paused');
        if (musicBtnText) musicBtnText.textContent = 'MUSIC: OFF';
        musicToggleBtn.title = `Music Paused (Click to Play, Press M)`;
      }
    }
  }

  // Safely attempt autoplay on load
  async function safePlayThemeMusic() {
    if (!bgThemeAudio) return;
    try {
      await bgThemeAudio.play();
      updateMusicUI(true);
    } catch (err) {
      // Autoplay blocked by browser policy; wait for first user gesture
      updateMusicUI(false);
      console.info('Background music autoplay awaiting first user interaction.');
    }
  }

  // Toggle Theme Music Play/Pause
  function toggleThemeMusic() {
    if (!bgThemeAudio) return;
    if (bgThemeAudio.paused) {
      bgThemeAudio.play()
        .then(() => updateMusicUI(true))
        .catch(err => console.warn('Audio play error:', err));
    } else {
      bgThemeAudio.pause();
      updateMusicUI(false);
    }
  }

  // First user interaction fallback to start background audio
  function handleFirstMusicGesture() {
    if (hasUserInteractedForMusic) return;
    hasUserInteractedForMusic = true;

    // Clean up one-time listeners
    document.removeEventListener('pointerdown', handleFirstMusicGesture);
    document.removeEventListener('touchstart', handleFirstMusicGesture);
    document.removeEventListener('keydown', handleFirstMusicGesture);

    if (bgThemeAudio && bgThemeAudio.paused && !musicToggleBtn.classList.contains('manual-paused')) {
      bgThemeAudio.play()
        .then(() => updateMusicUI(true))
        .catch(() => {});
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hasUserInteractedForMusic = true;
      if (!bgThemeAudio.paused) {
        musicToggleBtn.classList.add('manual-paused');
      } else {
        musicToggleBtn.classList.remove('manual-paused');
      }
      toggleThemeMusic();
    });
  }

  // ==========================================================================
  // REAL-TIME WEB AUDIO SPECTRUM VISUALIZER
  // ==========================================================================
  const vizCanvas = document.getElementById('visualizerCanvas');
  let vizCtx = null;
  let audioAnalyser = null;
  let audioSourceNode = null;
  let frequencyData = null;

  function initAudioVisualizer() {
    if (!vizCanvas) return;
    vizCtx = vizCanvas.getContext('2d');

    if (!audioCtx) initAudioContext();

    if (bgThemeAudio && !audioSourceNode && audioCtx) {
      try {
        audioAnalyser = audioCtx.createAnalyser();
        audioAnalyser.fftSize = 64;
        audioAnalyser.smoothingTimeConstant = 0.82;

        audioSourceNode = audioCtx.createMediaElementSource(bgThemeAudio);
        audioSourceNode.connect(audioAnalyser);
        audioAnalyser.connect(audioCtx.destination);

        frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount);
      } catch (e) {
        console.warn("Visualizer audio source hook notice:", e);
      }
    }
  }

  let vizTime = 0;
  function renderVisualizer() {
    requestAnimationFrame(renderVisualizer);
    if (!vizCanvas || !vizCtx) return;

    const w = vizCanvas.width;
    const h = vizCanvas.height;
    vizCtx.clearRect(0, 0, w, h);

    const numBars = 32;
    const barWidth = (w / numBars) - 3;
    const isPlaying = bgThemeAudio && !bgThemeAudio.paused;

    if (audioAnalyser && isPlaying && frequencyData) {
      audioAnalyser.getByteFrequencyData(frequencyData);
    }

    vizTime += 0.04;

    for (let i = 0; i < numBars; i++) {
      let barHeight;
      if (audioAnalyser && isPlaying && frequencyData) {
        const val = frequencyData[i % frequencyData.length] / 255;
        barHeight = Math.max(val * (h - 6), 4);
      } else {
        // Ambient breathing pulse when audio is paused or loading
        const wave = Math.sin(vizTime + i * 0.25) * 0.5 + 0.5;
        barHeight = 4 + wave * 7;
      }

      const x = i * (barWidth + 3) + 2;
      const y = h - barHeight;

      // Glowing Neon Gradient (Cyan -> Spider-Blue -> Spider-Red)
      const gradient = vizCtx.createLinearGradient(0, h, 0, 0);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
      gradient.addColorStop(0.5, 'rgba(0, 102, 255, 0.85)');
      gradient.addColorStop(1, 'rgba(230, 0, 18, 0.95)');

      vizCtx.fillStyle = gradient;
      vizCtx.beginPath();
      if (vizCtx.roundRect) {
        vizCtx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
      } else {
        vizCtx.rect(x, y, barWidth, barHeight);
      }
      vizCtx.fill();

      // Top Peak White Glow Cap
      vizCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      vizCtx.fillRect(x, y, barWidth, 2);
    }
  }

  // Hook visualizer when audio starts
  function startVisualizerEngine() {
    initAudioVisualizer();
    renderVisualizer();
  }

  if (bgThemeAudio) {
    bgThemeAudio.addEventListener('play', () => {
      initAudioVisualizer();
      updateMusicUI(true);
    });
    bgThemeAudio.addEventListener('pause', () => updateMusicUI(false));
  }

  // Register first gesture listeners for autoplay fallback
  document.addEventListener('pointerdown', () => {
    initAudioContext();
    initAudioVisualizer();
    handleFirstMusicGesture();
  }, { once: true });
  document.addEventListener('touchstart', () => {
    initAudioContext();
    initAudioVisualizer();
    handleFirstMusicGesture();
  }, { once: true });
  document.addEventListener('keydown', () => {
    initAudioContext();
    initAudioVisualizer();
    handleFirstMusicGesture();
  }, { once: true });

  // Start visualizer loop
  startVisualizerEngine();

  // Attempt initial playback on load
  safePlayThemeMusic();

  // ==========================================================================
  // EXCLUSIVE BACKGROUND FOLDER WALLPAPERS COLLECTION & DYNAMIC ENGINE
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

  // Update Navbar Button Text with Dynamic Wallpaper Count
  if (galleryBtnText) {
    galleryBtnText.textContent = `WALLPAPERS (${wallpapersCollection.length})`;
  }
  const modalSubtitle = document.querySelector('.modal-subtitle');
  if (modalSubtitle) {
    modalSubtitle.textContent = `${wallpapersCollection.length} Ultra-HD Wallpapers • Random on Every Launch`;
  }

  // Apply Wallpaper with Smooth Dual-Layer Crossfade
  function applyWallpaper(index, playSound = true) {
    if (index < 0) index = wallpapersCollection.length - 1;
    if (index >= wallpapersCollection.length) index = 0;

    currentWallpaperIndex = index;
    const wp = wallpapersCollection[currentWallpaperIndex];

    // Alternating crossfade between Layer A and Layer B
    const activeLayer = activeLayerIsA ? layerA : layerB;
    const nextLayer = activeLayerIsA ? layerB : layerA;

    nextLayer.style.backgroundImage = `url('${wp.file}')`;
    nextLayer.classList.add('active');
    activeLayer.classList.remove('active');
    activeLayerIsA = !activeLayerIsA;

    // Update Header / Info Bar
    if (bgTitleText) bgTitleText.textContent = wp.title;
    if (downloadBgBtn) {
      downloadBgBtn.href = wp.file;
      const ext = wp.file.split('.').pop() || 'jpg';
      downloadBgBtn.download = `SpiderVerse_${wp.title.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
    }

    // Save to sessionStorage so on next reload we guarantee a DIFFERENT image
    try {
      sessionStorage.setItem('lastWallpaperIndex', currentWallpaperIndex.toString());
    } catch (e) {}

    // Update active highlight in Modal Grid
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

  // Initialize Wallpaper on Page Load: Pick a fresh random one every time!
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

  // Render Wallpapers Grid in Gallery Modal
  function populateWallpapersModal() {
    wallpapersGrid.innerHTML = '';
    wallpapersCollection.forEach((wp, idx) => {
      const card = document.createElement('div');
      card.className = `wp-card ${idx === currentWallpaperIndex ? 'active-wp' : ''}`;
      card.innerHTML = `
        <div class="wp-thumb-wrapper">
          <img src="${wp.file}" alt="${wp.title}" class="wp-thumb-img" loading="lazy" />
          <span class="wp-active-badge">✓ ACTIVE</span>
          <span class="wp-quality-badge">4K UHD</span>
        </div>
        <div class="wp-info">
          <div class="wp-title" title="${wp.title}">${wp.title}</div>
          <div class="wp-actions">
            <button class="wp-btn apply-btn" data-index="${idx}">APPLY</button>
            <a class="wp-btn dl-btn" href="${wp.file}" download="${wp.file.split('/').pop()}" target="_blank">📥 4K</a>
          </div>
        </div>
      `;

      // Click card to apply
      card.addEventListener('click', (e) => {
        if (e.target.closest('.dl-btn')) return; // let download link work
        applyWallpaper(idx, true);
        closeModal();
      });

      wallpapersGrid.appendChild(card);
    });
  }

  // Modal Open / Close Handlers
  function openModal() {
    populateWallpapersModal();
    wallpaperModal.classList.add('open');
    playWebThwipSound(1500);
  }

  function closeModal() {
    wallpaperModal.classList.remove('open');
  }

  // Event Listeners for Wallpaper Controls
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

  // Global Keyboard Shortcuts for Wallpapers
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wallpaperModal.classList.contains('open')) {
      closeModal();
    } else if (e.key === 'w' || e.key === 'W') {
      if (document.activeElement.tagName !== 'INPUT') {
        randomizeWallpaper();
      }
    } else if (e.key === 'm' || e.key === 'M') {
      if (document.activeElement.tagName !== 'INPUT') {
        toggleThemeMusic();
      }
    }
  });

  // Run on startup
  initRandomWallpaper();
});
