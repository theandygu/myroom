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
      // Auto-open tutorial after splash fades
      setTimeout(() => {
        openWin('tutorial', 'help');
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
});

/* ════════════════════════════════════════════
   RECORD DATA
════════════════════════════════════════════ */
const RECORDS = [
  {
    id:'bridge', title:'Matboard Bridge', course:'CIV102 · Fall 2025', color:'#C47A3A',
    blurb:'A structural challenge pushing the limits of matboard — testing failure modes, cross-sectional optimisation, and the poetry of how things break.',
    tracks:[
      {num:'01',title:'CTMF Name Here',strand:'Frame',desc:'Lorem ipsum dolor sit amet. How this CTMF shaped how the structural problem was understood and bounded.'},
      {num:'02',title:'CTMF Name Here',strand:'Diverge',desc:'Lorem ipsum dolor sit amet. How this CTMF helped generate a range of structural concepts and forms.'},
      {num:'03',title:'CTMF Name Here',strand:'Converge',desc:'Lorem ipsum dolor sit amet. How this CTMF guided the selection and refinement of the final beam design.'}
    ]
  },
  {
    id:'knee', title:'Knee Sleeve', course:'UTBiome · Fall 2025', color:'#4A8FC0',
    blurb:'Designing at the intersection of biomechanics, material comfort, and human movement — a rehabilitative wearable for recovery.',
    tracks:[
      {num:'01',title:'CTMF Name Here',strand:'Frame',desc:'Lorem ipsum dolor sit amet. How this CTMF helped define the opportunity space for wearable rehab devices.'},
      {num:'02',title:'CTMF Name Here',strand:'Diverge',desc:'Lorem ipsum dolor sit amet. How this CTMF was used to generate diverse material and structural concepts.'},
      {num:'03',title:'CTMF Name Here',strand:'Represent',desc:'Lorem ipsum dolor sit amet. How this CTMF helped communicate the design to stakeholders.'}
    ]
  },
  {
    id:'outlets', title:'Loose Outlets', course:'Praxis I · Fall 2025', color:'#C9B840',
    blurb:'A quiet, invisible hazard — loose power outlets in residential contexts. An electrical safety project about making the unseen visible.',
    tracks:[
      {num:'01',title:'CTMF Name Here',strand:'Frame',desc:'Lorem ipsum dolor sit amet. How this CTMF was used to identify and bound the electrical safety opportunity.'},
      {num:'02',title:'CTMF Name Here',strand:'Converge',desc:'Lorem ipsum dolor sit amet. How this CTMF guided comparison and selection among design concepts.'},
      {num:'03',title:'CTMF Name Here',strand:'Represent',desc:'Lorem ipsum dolor sit amet. How this CTMF helped represent the final design for evaluation.'}
    ]
  },
  {
    id:'swim', title:'Swim Resistance', course:'Praxis II · Winter 2026', color:'#3BA08C',
    blurb:'Adjustable resistance training equipment for competitive swimmers — where drag becomes a design parameter and fluid dynamics becomes intuition.',
    tracks:[
      {num:'01',title:'CTMF Name Here',strand:'Frame',desc:'Lorem ipsum dolor sit amet. How this CTMF shaped the opportunity framing around competitive swimmer needs.'},
      {num:'02',title:'CTMF Name Here',strand:'Diverge',desc:'Lorem ipsum dolor sit amet. How this CTMF generated a wide range of drag-producing mechanisms.'},
      {num:'03',title:'CTMF Name Here',strand:'Represent',desc:'Lorem ipsum dolor sit amet. How this CTMF was used to prototype and communicate the variable-drag concept.'}
    ]
  }
];

/* ════════════════════════════════════════════
   SVG VINYL
════════════════════════════════════════════ */
function makeVinyl(color, label, sub, size=90) {
  const cx=size/2, oR=cx-2, lR=oR*0.38;
  const uid='v'+Math.random().toString(36).slice(2,7);
  let g='';
  for(let i=1;i<=8;i++){const r=oR*(0.97-i*0.046);if(r<lR+3)break;g+=`<circle cx="${cx}" cy="${cx}" r="${r.toFixed(1)}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.7"/>`;}
  const dl=label.length>10?label.slice(0,10)+'…':label;
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="${uid}" cx="38%" cy="32%" r="65%"><stop offset="0%" stop-color="#3a3a3a"/><stop offset="100%" stop-color="#0d0d0d"/></radialGradient></defs>
    <circle cx="${cx}" cy="${cx}" r="${oR}" fill="url(#${uid})"/>${g}
    <circle cx="${cx}" cy="${cx}" r="${(lR+2).toFixed(1)}" fill="rgba(0,0,0,0.22)"/>
    <circle cx="${cx}" cy="${cx}" r="${lR}" fill="${color}"/>
    <text x="${cx}" y="${(cx-lR*0.08).toFixed(1)}" text-anchor="middle" font-family="'IM Fell French Canon',serif" font-size="${(lR*0.33).toFixed(1)}" fill="white">${dl}</text>
    <text x="${cx}" y="${(cx+lR*0.4).toFixed(1)}" text-anchor="middle" font-family="'IM Fell DW Pica',serif" font-size="${(lR*0.22).toFixed(1)}" fill="rgba(255,255,255,0.7)">${sub}</text>
    <circle cx="${cx}" cy="${cx}" r="${(lR*0.11).toFixed(1)}" fill="#0a0a12"/>
  </svg>`;
}

/* ════════════════════════════════════════════
   BUILD CRATE
════════════════════════════════════════════ */
function buildCrate() {
  const crate = document.getElementById('crate');
  RECORDS.forEach(r => {
    const card = document.createElement('div');
    card.className = 'vinyl-card';
    card.id = 'card-' + r.id;
    const shortCourse = r.course.split('·')[0].trim();
    card.innerHTML = `
      <div class="vc-preview">${makeVinyl(r.color, r.title.split(' ')[0].toUpperCase(), shortCourse)}</div>
      <div class="vc-name">${r.title}</div>
      <div class="vc-course">${r.course}</div>
      <div class="vc-play">▶ play</div>`;
    card.addEventListener('click', () => selectRecord(r.id));
    crate.appendChild(card);
  });
}

/* ════════════════════════════════════════════
   SELECT RECORD
════════════════════════════════════════════ */
function selectRecord(id) {
  const r = RECORDS.find(x => x.id === id);
  if (!r) return;

  document.querySelectorAll('.vinyl-card').forEach(c => c.classList.remove('active'));
  document.getElementById('card-' + id).classList.add('active');

  const platter = document.getElementById('platter');
  const svgStr = makeVinyl(r.color, r.title.split(' ')[0].toUpperCase(), r.course.split('·')[0].trim(), 160);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  platter.innerHTML = `<img class="platter-record spinning" src="${url}" alt="${r.title}">`;

  document.getElementById('tonearm').classList.add('playing');
  document.getElementById('tt-light').classList.add('on');

  const led = document.getElementById('np-led');
  led.style.background = r.color;
  led.classList.add('active');
  document.getElementById('np-title').textContent = r.title;
  document.getElementById('np-sub').textContent = r.course;

  const shortCourse = r.course.split('·')[0].trim();
  document.getElementById('liner-disc').innerHTML = makeVinyl(r.color, r.title.split(' ')[0].toUpperCase(), shortCourse, 54);
  document.getElementById('liner-title').textContent = r.title;
  document.getElementById('liner-course').textContent = r.course;
  document.getElementById('liner-blurb').textContent = r.blurb;

  const tl = document.getElementById('tracklist');
  tl.innerHTML = '';
  r.tracks.forEach(t => {
    const item = document.createElement('div');
    item.className = 'track-item';
    item.innerHTML = `<div class="track-num">track ${t.num}</div><div class="track-title">${t.title}</div><span class="track-strand">${t.strand}</span><p class="track-desc">${t.desc}</p>`;
    tl.appendChild(item);
  });

  document.getElementById('liner-wrap').classList.add('open');
}

/* ════════════════════════════════════════════
   WINDOW SYSTEM
════════════════════════════════════════════ */
let zTop = 100;

function openWin(winId, pane) {
  const win = document.getElementById('win-' + winId);

  // If already open, just switch pane
  if (win.classList.contains('open')) {
    switchPane(winId, pane);
    bringToFront(winId);
    return;
  }

  win.classList.add('open');
  switchPane(winId, pane);
  bringToFront(winId);
}

function closeWin(winId) {
  const win = document.getElementById('win-' + winId);
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

function switchPane(winId, paneId) {
  const win = document.getElementById('win-' + winId);

  // Update nav buttons
  win.querySelectorAll('.win-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.pane === paneId);
  });

  // Update panes
  win.querySelectorAll('.win-pane').forEach(p => {
    p.classList.toggle('active', p.id === 'pane-' + paneId);
  });

  // Update title bar label
  const titles = { studio: 'the studio', gallery: 'gallery', about: 'about', position: 'position statement', help: 'how to explore' };
  const titleEl = document.getElementById('win-' + winId + '-title');
  if (titleEl) titleEl.textContent = titles[paneId] || paneId;
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
  
  document.querySelectorAll('.hotspot-fixed').forEach(element => {
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
    
    // Update position
    element.style.left = Math.round(screenX - 90) + 'px';
    element.style.top = Math.round(screenY - 80) + 'px';
  });
  
  animationFrameId = requestAnimationFrame(updateHotspotPositions);
}

// Start animation loop
setTimeout(() => {
  updateHotspotPositions();
}, 100);

/* ════════════════════════════════════════════
   INITIALIZE ON DOM READY
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  buildCrate();
  makeDraggable('main');
  makeDraggable('tutorial');
});
