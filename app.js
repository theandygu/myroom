const musicPlayer = {
  audio: null,
  playlist: [
    'music/laufey1.mp3',
    'music/laufey2.mp3',
    'music/laufey3.mp3',
    'music/laufey4.mp3',
    'music/laufey5.mp3',
  ],
  currentTrack: 0,
  isPlaying: false,

  init() {
    if (this.audio) return;
    this.audio = document.createElement('audio');
    this.audio.addEventListener('ended', () => this.playNext());
    this.audio.volume = 0.4;
  },

  play() {
    if (!this.audio) this.init();
    if (this.currentTrack < this.playlist.length) {
      this.audio.src = this.playlist[this.currentTrack];
      this.audio.play();
      this.isPlaying = true;
    }
  },

  playNext() {
    this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
    this.play();
  },

  setVolume(vol) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, vol));
    }
  }
};

let splashViewer = null;
let zTop = 100;
let sketchViewer = null;
let realViewer = null;
let hotspotAnimationFrameId = null;
let syncAnimationFrameId = null;

/* ════════════════════════════════
   WINDOW MANAGEMENT
════════════════════════════════ */
function openWin(winId) {
  const win = document.getElementById('win-' + winId);
  if (!win) return;

  if (win.classList.contains('open')) {
    bringToFront(winId);
    return;
  }

  win.classList.add('open');
  bringToFront(winId);
}

function closeWin(winId) {
  const win = document.getElementById('win-' + winId);
  if (!win) return;

  win.style.opacity = '0';
  win.style.transform = win.classList.contains('moved')
    ? 'translateY(8px) scale(0.97)'
    : 'translateX(-50%) translateY(8px) scale(0.97)';

  setTimeout(() => {
    win.classList.remove('open');
    win.style.opacity = '';
    win.style.transform = '';
  }, 220);
}

function bringToFront(winId) {
  const win = document.getElementById('win-' + winId);
  if (!win) return;
  zTop += 1;
  win.style.zIndex = zTop;
}

function switchPane(winId, paneName) {
  const win = document.getElementById('win-' + winId);
  if (!win) return;

  win.querySelectorAll('.win-pane').forEach(pane => pane.classList.remove('active'));
  win.querySelectorAll('.win-nav-btn').forEach(btn => btn.classList.remove('active'));

  const targetPane = win.querySelector('#pane-' + paneName);
  const targetBtn = win.querySelector('.win-nav-btn[data-pane="' + paneName + '"]');

  if (targetPane) targetPane.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');
}

/* ════════════════════════════════
   DRAGGABLE WINDOWS
════════════════════════════════ */
function makeDraggable(winId) {
  const win = document.getElementById('win-' + winId);
  const bar = document.getElementById('win-' + winId + '-bar');
  if (!win || !bar) return;

  let dragging = false;
  let ox = 0;
  let oy = 0;

  bar.addEventListener('mousedown', e => {
    if (e.target.closest('.win-dot, .paper-close-btn, .win-traffic')) return;

    if (!win.classList.contains('moved')) {
      const rect = win.getBoundingClientRect();
      win.style.left = rect.left + 'px';
      win.style.top  = rect.top  + 'px';
      win.classList.add('moved');
    }

    const rect = win.getBoundingClientRect();
    dragging = true;
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    bringToFront(winId);

    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    let nx = e.clientX - ox;
    let ny = e.clientY - oy;
    nx = Math.max(0, Math.min(nx, window.innerWidth  - win.offsetWidth));
    ny = Math.max(0, Math.min(ny, window.innerHeight - win.offsetHeight));
    win.style.left = nx + 'px';
    win.style.top  = ny + 'px';
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });

  win.addEventListener('mousedown', () => bringToFront(winId));
}

/* ════════════════════════════════
   CTMF ACCORDION
════════════════════════════════ */
function toggleCtmf(el) {
  const isOpen = el.classList.contains('open');
  // close all in this popup
  const popup = el.closest('.win-pane, .win-body');
  if (popup) popup.querySelectorAll('.ctmf-item').forEach(i => {
    i.classList.remove('open');
    const chevron = i.querySelector('.ctmf-chevron');
    if (chevron) chevron.textContent = '+';
  });
  // toggle clicked
  if (!isOpen) {
    el.classList.add('open');
    const chevron = el.querySelector('.ctmf-chevron');
    if (chevron) chevron.textContent = '−';
  }
}

/* ════════════════════════════════
   TUTORIAL COMPLETION
════════════════════════════════ */
function completeTutorial() {
  // Mark tutorial as explored in progress tracker
  progressTracker.trackClick('paper1');

  // Button feedback
  const btn = document.getElementById('tut-done-btn');
  if (btn) {
    btn.textContent = '✓ Tutorial complete!';
    btn.style.background = '#52b552';
    btn.style.color = '#fff';
    btn.style.borderColor = '#3a8a3a';
    btn.disabled = true;
  }

  // Close tutorial after brief delay
  setTimeout(() => closeWin('paper1'), 900);
}

/* ════════════════════════════════
   PROGRESS TRACKER — 7 hotspots
════════════════════════════════ */
const progressTracker = {
  clickedHotspots: new Set(),
  totalHotspots: 0,

  trackClick(spotId) {
    this.clickedHotspots.add(spotId);
    this.updateProgress();
  },

  reset() {
    this.clickedHotspots.clear();
    this.updateProgress();
  },

  updateProgress() {
    const progressBar   = document.getElementById('progress-bar');
    const progressLabel = document.getElementById('progress-label');
    if (!progressBar || !progressLabel) return;

    const progress = (this.clickedHotspots.size / this.totalHotspots) * 100;
    progressBar.style.width = progress + '%';
    progressLabel.textContent = this.clickedHotspots.size + '/' + this.totalHotspots;
  }
};

/* ════════════════════════════════
   PANORAMA PROJECTION
════════════════════════════════ */
function getProjection(viewerRef) {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const hfov = viewerRef.getHfov();
  const vfov = hfov / (screenW / screenH);
  return {
    screenW, screenH,
    centerX: screenW / 2,
    centerY: screenH / 2,
    currentYaw:   viewerRef.getYaw(),
    currentPitch: viewerRef.getPitch(),
    hfov, vfov,
    xPixelsPerDegree: screenW / hfov,
    yPixelsPerDegree: screenH / vfov
  };
}

function projectYawPitch(yaw, pitch, projection, extraBoundary = 0) {
  let yawDiff   = yaw   - projection.currentYaw;
  let pitchDiff = pitch - projection.currentPitch;

  if (yawDiff > 180)  yawDiff -= 360;
  if (yawDiff < -180) yawDiff += 360;

  const yawBoundary   = (projection.hfov / 2) + extraBoundary;
  const pitchBoundary = (projection.vfov / 2) + extraBoundary;
  const isVisible = Math.abs(yawDiff) < yawBoundary && Math.abs(pitchDiff) < pitchBoundary;

  return {
    isVisible,
    x: projection.centerX + (yawDiff   * projection.xPixelsPerDegree),
    y: projection.centerY - (pitchDiff * projection.yPixelsPerDegree)
  };
}

/* ════════════════════════════════
   REVEAL MASK (sketch → real)
════════════════════════════════ */
const revealMask = {
  reveals: new Map(),

  applyMaskSize() {
    const base = document.getElementById('sketch-mask-base');
    if (!base) return;
    base.setAttribute('width',  String(window.innerWidth));
    base.setAttribute('height', String(window.innerHeight));
  },

  createBrush(seedKey) {
    const seedBase = seedKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    let seed = seedBase || 1;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const strokes = [];
    for (let i = 0; i < 16; i++) {
      const angle  = rand() * Math.PI * 2;
      const spread = 90 + rand() * 180;
      strokes.push({
        dx: Math.cos(angle) * spread * 0.68,
        dy: Math.sin(angle) * spread * 0.54,
        rx: 60 + rand() * 96,
        ry: 48 + rand() * 76
      });
    }

    return { rotation: (rand() * 50) - 25, strokes };
  },

  revealAt(id, yaw, pitch) {
    if (this.reveals.has(id)) return;
    this.reveals.set(id, { yaw, pitch, brush: this.createBrush(id) });
    this.render();
  },

  revealAll() {
    const sketchLayer = document.getElementById('panorama-sketch');
    if (sketchLayer) sketchLayer.classList.add('fully-revealed');
  },

  clear() {
    this.reveals.clear();
    this.render();
    const sketchLayer = document.getElementById('panorama-sketch');
    if (sketchLayer) sketchLayer.classList.remove('fully-revealed');
  },

  render() {
    const holes = document.getElementById('sketch-mask-holes');
    if (!holes || !sketchViewer) return;

    const projection = getProjection(sketchViewer);
    holes.innerHTML = '';

    this.reveals.forEach(reveal => {
      const projected = projectYawPitch(reveal.yaw, reveal.pitch, projection, 90);
      if (!projected.isVisible) return;

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform',
        'translate(' + Math.round(projected.x) + ' ' + Math.round(projected.y) + ') rotate(' + reveal.brush.rotation + ')'
      );

      reveal.brush.strokes.forEach(stroke => {
        const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        ellipse.setAttribute('cx', String(Math.round(stroke.dx)));
        ellipse.setAttribute('cy', String(Math.round(stroke.dy)));
        ellipse.setAttribute('rx', String(Math.round(stroke.rx)));
        ellipse.setAttribute('ry', String(Math.round(stroke.ry)));
        ellipse.setAttribute('fill', 'black');
        group.appendChild(ellipse);
      });

      const core = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      core.setAttribute('cx', '0');
      core.setAttribute('cy', '0');
      core.setAttribute('rx', '150');
      core.setAttribute('ry', '116');
      core.setAttribute('fill', 'black');
      group.appendChild(core);

      holes.appendChild(group);
    });
  }
};

/* ════════════════════════════════
   SYNC VIEWERS
════════════════════════════════ */
function syncRealToSketch() {
  if (!sketchViewer || !realViewer) return;
  realViewer.setYaw(sketchViewer.getYaw(), false);
  realViewer.setPitch(sketchViewer.getPitch(), false);
  realViewer.setHfov(sketchViewer.getHfov(), false);
}

function runSyncLoop() {
  syncRealToSketch();
  syncAnimationFrameId = requestAnimationFrame(runSyncLoop);
}

/* ════════════════════════════════
   HOTSPOT POSITION LOOP
════════════════════════════════ */
function updateHotspotPositions() {
  if (!sketchViewer) return;
  const projection = getProjection(sketchViewer);

  document.querySelectorAll('.paper-hotspot').forEach(element => {
    const targetYaw   = parseFloat(element.dataset.yaw);
    const targetPitch = parseFloat(element.dataset.pitch);
    const projected   = projectYawPitch(targetYaw, targetPitch, projection, 30);

    if (!projected.isVisible) {
      element.classList.add('hidden');
      return;
    }

    element.classList.remove('hidden');
    element.style.left = Math.round(projected.x - 30) + 'px';
    element.style.top  = Math.round(projected.y - 30) + 'px';
  });

  revealMask.render();
  hotspotAnimationFrameId = requestAnimationFrame(updateHotspotPositions);
}

/* ════════════════════════════════
   INIT PANORAMA VIEWERS
════════════════════════════════ */
function initializeMainViewers() {
  sketchViewer = pannellum.viewer('panorama-sketch', {
    type: 'equirectangular',
    panorama: 'room_sketch.jpg',
    autoLoad: true,
    autoRotate: -0.5,
    showControls: false,
    hfov: 100,
    yaw: 0,
    pitch: 0
  });

  realViewer = pannellum.viewer('panorama-real', {
    type: 'equirectangular',
    panorama: 'room_real.jpg',
    autoLoad: true,
    autoRotate: -0.5,
    showControls: false,
    hfov: 100,
    yaw: 0,
    pitch: 0
  });

  realViewer.stopAutoRotate();
  syncRealToSketch();
  runSyncLoop();
  updateHotspotPositions();
}

/* ════════════════════════════════
   DOM READY
════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const hotspotElements = Array.from(document.querySelectorAll('.paper-hotspot'));
  progressTracker.totalHotspots = hotspotElements.length;

  splashViewer = pannellum.viewer('splash-panorama', {
    type: 'equirectangular',
    panorama: 'room_real.jpg',
    autoLoad: true,
    autoRotate: -1.5,
    showControls: false,
    hfov: 100,
    yaw: 0,
    pitch: 0
  });

  initializeMainViewers();

  revealMask.applyMaskSize();
  revealMask.clear();
  window.addEventListener('resize', () => {
    revealMask.applyMaskSize();
    revealMask.render();
  });

  /* ── SPLASH DISMISS ── */
  const splashScreen  = document.getElementById('splash-screen');
  let splashDismissed = false;

  const hideSplash = () => {
    if (splashDismissed || !splashScreen) return;
    splashDismissed = true;

    splashScreen.style.animation = 'splash-fade-out 0.8s ease-out forwards';
    setTimeout(() => {
      splashScreen.style.pointerEvents = 'none';
      splashScreen.style.display = 'none';

      if (splashViewer) {
        splashViewer.destroy();
        splashViewer = null;
      }

      musicPlayer.init();
      musicPlayer.play();

      // Auto-open tutorial and trigger reveal effect for paper1
      setTimeout(() => {
        openWin('paper1');
        // Simulate hotspot click for paper1 to trigger reveal
        const paper1Hotspot = Array.from(document.querySelectorAll('.paper-hotspot')).find(h => (h.dataset.yaw === '0' && h.dataset.pitch === '0'));
        if (paper1Hotspot && !paper1Hotspot.dataset.revealed) {
          const yaw = parseFloat(paper1Hotspot.dataset.yaw || '0');
          const pitch = parseFloat(paper1Hotspot.dataset.pitch || '0');
          revealMask.revealAt('paper1', yaw, pitch);
          paper1Hotspot.dataset.revealed = 'true';
          // Update progress bar as if user clicked
          progressTracker.trackClick('paper1');
        }
      }, 100);
    }, 800);
  };

  if (!document.querySelector('style[data-splash]')) {
    const style = document.createElement('style');
    style.setAttribute('data-splash', 'true');
    style.textContent = '@keyframes splash-fade-out { from { opacity: 1; } to { opacity: 0; } }';
    document.head.appendChild(style);
  }

  splashScreen?.addEventListener('click', hideSplash);
  document.addEventListener('keydown', hideSplash);

  /* ── HOTSPOT CLICK TRACKING ── */
  const activateHotspot = hotspot => {
    const spotId = hotspot.dataset.winId;
    if (!spotId) return;

    progressTracker.trackClick(spotId);
    if (!hotspot.dataset.revealed) {
      const yaw = parseFloat(hotspot.dataset.yaw || '0');
      const pitch = parseFloat(hotspot.dataset.pitch || '0');
      revealMask.revealAt(spotId, yaw, pitch);
      hotspot.dataset.revealed = 'true';
    }
    if (progressTracker.clickedHotspots.size === progressTracker.totalHotspots) {
      revealMask.revealAll();
    }
    openWin(spotId);
  };

  hotspotElements.forEach(hotspot => {
    let lastActivation = 0;

    const handleActivation = e => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastActivation < 250) return;
      lastActivation = now;

      activateHotspot(hotspot);
    };

    ['pointerdown', 'mousedown', 'touchstart'].forEach(eventName => {
      hotspot.addEventListener(eventName, e => {
        e.stopPropagation();
      }, { passive: false });
    });

    ['pointerup', 'touchend', 'click'].forEach(eventName => {
      hotspot.addEventListener(eventName, handleActivation, { passive: false });
    });
  });

  /* ── MAKE ALL WINDOWS DRAGGABLE ── */
  ['paper1','paper2','paper3','paper4','paper5','paper6','paper7','main'].forEach(id => {
    makeDraggable(id);
  });

  /* ── VOLUME SLIDER ── */
  const volumeSlider = document.getElementById('volume-slider');
  const volumeLabel  = document.getElementById('volume-label');
  if (volumeSlider && volumeLabel) {
    volumeSlider.addEventListener('input', e => {
      const vol = e.target.value;
      musicPlayer.setVolume(vol / 100);
      volumeLabel.textContent = vol + '%';
    });
  }

  /* ── RESTART BUTTON ── */
  const restartBtn = document.getElementById('restart-btn');
  restartBtn?.addEventListener('click', () => {
    progressTracker.reset();
    revealMask.clear();

    document.querySelectorAll('.paper-hotspot').forEach(hotspot => {
      delete hotspot.dataset.revealed;
    });

    // Re-enable tutorial button
    const tutBtn = document.getElementById('tut-done-btn');
    if (tutBtn) {
      tutBtn.textContent = "I'm ready — start exploring →";
      tutBtn.style.background = '';
      tutBtn.style.color      = '';
      tutBtn.style.borderColor = '';
      tutBtn.disabled = false;
    }

    ['paper1','paper2','paper3','paper4','paper5','paper6','paper7'].forEach(id => {
      closeWin(id);
    });
  });

  progressTracker.updateProgress();
});
