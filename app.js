/* ════════════════════════════════════════════
   MUSIC PLAYER
════════════════════════════════════════════ */
const musicPlayer = {
  audio: null,
  playlist: [
    'music/laufey1.mp3',
    'music/laufey2.mp3',
    'music/laufey3.mp3',
    'music/laufey4.mp3',
    'music/laufey5.mp3',
    'music/laufey5.mp3'
  ],
  currentTrack: 0,
  isPlaying: false,

  init: function() {
    this.audio = document.createElement('audio');
    this.audio.addEventListener('ended', () => this.playNext());
    this.audio.volume = 0.4; // Default volume 40%
  },

  play: function() {
    if (!this.audio) this.init();
    if (this.currentTrack < this.playlist.length) {
      this.audio.src = this.playlist[this.currentTrack];
      this.audio.play();
      this.isPlaying = true;
    }
  },

  playNext: function() {
    this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
    this.play();
  },

  setVolume: function(vol) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, vol));
    }
  },

  getVolume: function() {
    return this.audio ? this.audio.volume : 0.4;
  }
};

/* ════════════════════════════════════════════
   SPLASH SCREEN WITH PANORAMA VIEWER
════════════════════════════════════════════ */
let splashViewer = null;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize splash panorama
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

  const splashScreen = document.getElementById('splash-screen');
  
  const hideSplash = () => {
    splashScreen.style.animation = 'splash-fade-out 0.8s ease-out forwards';
    setTimeout(() => {
      splashScreen.style.pointerEvents = 'none';
      splashScreen.style.display = 'none';
      // Destroy the splash viewer to free resources
      if (splashViewer) {
        splashViewer.destroy();
        splashViewer = null;
      }
      // Initialize and start music
      musicPlayer.init();
      musicPlayer.play();
      // Auto-open exploration guide after splash fades
      setTimeout(() => {
        openWin('paper4');
      }, 100);
    }, 800);
  };
  
  // Add CSS animation for fade out
  if (!document.querySelector('style[data-splash]')) {
    const style = document.createElement('style');
    style.setAttribute('data-splash', 'true');
    style.textContent = `
      @keyframes splash-fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  splashScreen.addEventListener('click', hideSplash);
  document.addEventListener('keydown', hideSplash);
});/* ════════════════════════════════════════════
   WINDOW SYSTEM
════════════════════════════════════════════ */
let zTop = 100;

function openWin(winId) {
  const win = document.getElementById('win-' + winId);
  if (!win) return;

  // If already open, just bring to front
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
  zTop++;
  document.getElementById('win-' + winId).style.zIndex = zTop;
}

/* ════════════════════════════════════════════
   DRAG TO MOVE WINDOWS
════════════════════════════════════════════ */
function makeDraggable(winId) {
  const win = document.getElementById('win-' + winId);
  const bar = document.getElementById('win-' + winId + '-bar');

  let dragging = false;
  let ox = 0, oy = 0;  // offset from mouse to window top-left

  bar.addEventListener('mousedown', e => {
    if (e.target.closest('.win-dot, .paper-close-btn')) return; // don't drag on window controls

    // On first drag, fix the window position absolutely
    if (!win.classList.contains('moved')) {
      const rect = win.getBoundingClientRect();
      win.style.left = rect.left + 'px';
      win.style.top  = rect.top  + 'px';
      win.classList.add('moved');
    }

    dragging = true;
    const rect = win.getBoundingClientRect();
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
    // clamp to viewport
    nx = Math.max(0, Math.min(nx, window.innerWidth  - win.offsetWidth));
    ny = Math.max(0, Math.min(ny, window.innerHeight - win.offsetHeight));
    win.style.left = nx + 'px';
    win.style.top  = ny + 'px';
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });

  // Click on window brings it to front
  win.addEventListener('mousedown', () => bringToFront(winId));
}

/* ════════════════════════════════════════════
   DRAG TO MOVE WINDOWS
════════════════════════════════════════════ */
function makeDraggable(winId) {
  const win = document.getElementById('win-' + winId);
  const bar = document.getElementById('win-' + winId + '-bar');
  
  if (!win || !bar) return;

  let dragging = false;
  let ox = 0, oy = 0;  // offset from mouse to window top-left

  bar.addEventListener('mousedown', e => {
    if (e.target.classList.contains('win-dot')) return; // don't drag on close btn

    // On first drag, fix the window position absolutely
    if (!win.classList.contains('moved')) {
      const rect = win.getBoundingClientRect();
      win.style.left = rect.left + 'px';
      win.style.top  = rect.top  + 'px';
      win.classList.add('moved');
    }

    dragging = true;
    const rect = win.getBoundingClientRect();
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
    // clamp to viewport
    nx = Math.max(0, Math.min(nx, window.innerWidth  - win.offsetWidth));
    ny = Math.max(0, Math.min(ny, window.innerHeight - win.offsetHeight));
    win.style.left = nx + 'px';
    win.style.top  = ny + 'px';
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });

  // Click on window brings it to front
  win.addEventListener('mousedown', () => bringToFront(winId));
}

/* ════════════════════════════════════════════
   PANNELLUM MAIN VIEWER
════════════════════════════════════════════ */
const viewer = pannellum.viewer('panorama', {
  type: 'equirectangular',
  panorama: 'room_sketch.jpg',
  autoLoad: true,
  autoRotate: -0.5,
  showControls: false,
  hfov: 100,
  yaw: 0,
  pitch: 0
});

let animationFrameId = null;

function updateHotspotPositions() {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const centerX = screenW / 2;
  const centerY = screenH / 2;
  
  const currentYaw = viewer.getYaw();
  const currentPitch = viewer.getPitch();
  const hfov = viewer.getHfov();
  const vfov = hfov / (screenW / screenH); // estimate vertical FOV
  
  // Pixels per degree
  const xPixelsPerDegree = screenW / hfov;
  const yPixelsPerDegree = screenH / vfov;
  
  document.querySelectorAll('.paper-hotspot').forEach(element => {
    const targetYaw = parseFloat(element.dataset.yaw);
    const targetPitch = parseFloat(element.dataset.pitch);
    
    // Calculate angles from center view
    let yawDiff = targetYaw - currentYaw;
    let pitchDiff = targetPitch - currentPitch;
    
    // Normalize yaw to -180 to +180
    if (yawDiff > 180) yawDiff -= 360;
    if (yawDiff < -180) yawDiff += 360;
    
    // Check visibility
    const yawBoundary = (hfov / 2) + 30;
    const pitchBoundary = (vfov / 2) + 30;
    const isVisible = Math.abs(yawDiff) < yawBoundary && Math.abs(pitchDiff) < pitchBoundary;
    
    if (!isVisible) {
      element.classList.add('hidden');
      return;
    }
    
    element.classList.remove('hidden');
    
    // Convert to screen position
    const screenX = centerX + (yawDiff * xPixelsPerDegree);
    const screenY = centerY - (pitchDiff * yPixelsPerDegree);
    
    // Update position - center the 60x60px hotspot
    element.style.left = Math.round(screenX - 30) + 'px';
    element.style.top = Math.round(screenY - 30) + 'px';
  });
  
  animationFrameId = requestAnimationFrame(updateHotspotPositions);
}

// Start animation loop
setTimeout(() => {
  updateHotspotPositions();
}, 100);

/* ════════════════════════════════════════════
   PROGRESS TRACKING
════════════════════════════════════════════ */
const progressTracker = {
  clickedHotspots: new Set(),
  totalHotspots: 6,

  trackClick: function(spotId) {
    this.clickedHotspots.add(spotId);
    this.updateProgress();
  },

  updateProgress: function() {
    const progressBar = document.getElementById('progress-bar');
    const progressLabel = document.getElementById('progress-label');
    
    if (!progressBar || !progressLabel) return;
    
    const progress = (this.clickedHotspots.size / this.totalHotspots) * 100;
    progressBar.style.width = progress + '%';
    progressLabel.textContent = this.clickedHotspots.size + '/' + this.totalHotspots;
  }
};

/* ════════════════════════════════════════════
   INITIALIZE ON DOM READY
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Setup progress tracking on hotspots
  document.querySelectorAll('.paper-hotspot').forEach((hotspot, index) => {
    const originalOnclick = hotspot.onclick;
    hotspot.onclick = function(e) {
      progressTracker.trackClick('paper' + (index + 1));
      if (originalOnclick) originalOnclick.call(this, e);
    };
  });

  // Make all paper windows draggable
  ['paper1', 'paper2', 'paper3', 'paper4', 'paper5', 'paper6'].forEach(id => {
    makeDraggable(id);
  });

  // Setup volume control
  const volumeSlider = document.getElementById('volume-slider');
  const volumeLabel = document.getElementById('volume-label');
  const volumeBtn = document.getElementById('volume-btn');

  if (volumeSlider && volumeLabel) {
    // Update volume and label when slider changes
    volumeSlider.addEventListener('input', (e) => {
      const vol = e.target.value;
      musicPlayer.setVolume(vol / 100);
      volumeLabel.textContent = vol + '%';
    });
  }
});
