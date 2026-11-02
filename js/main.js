(() => {
  'use strict';

  document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- nav toggle ----------
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  // ---------- data loading ----------
  const base = document.body.dataset.base || '';
  const load = (path) => fetch(path).then(r => r.json());

  const statusLabel = (s) => ({
    available: 'Available',
    complete: 'Complete',
    'in-progress': 'In progress',
    planned: 'Planned',
    'under-consideration': 'Under consideration'
  }[s] || s);

  // ---------- features ----------
  load('data/features.json').then(features => {
    const grid = document.getElementById('featureGrid');
    grid.innerHTML = features.map(f => `
      <div class="feature-card">
        <span class="status-pill" data-status="${f.status}">${statusLabel(f.status)}</span>
        <h3>${f.title}</h3>
        <p>${f.desc}</p>
      </div>
    `).join('');
  }).catch(() => {});

  // ---------- roadmap ----------
  load('data/roadmap.json').then(data => {
    const grid = document.getElementById('roadmapGrid');
    grid.innerHTML = data.categories.map(cat => `
      <div class="roadmap-card">
        <h3>${cat.name}</h3>
        ${cat.items.map(item => `
          <div class="roadmap-item">
            <div class="roadmap-item-head">
              <span class="title">${item.title}</span>
              <span class="status-pill" data-status="${item.status}">${statusLabel(item.status)}</span>
            </div>
            <p>${item.note}</p>
          </div>
        `).join('')}
      </div>
    `).join('');
  }).catch(() => {});

  // ---------- faq ----------
  load('data/faq.json').then(items => {
    const list = document.getElementById('faqList');
    list.innerHTML = items.map((item, i) => `
      <div class="faq-item" data-open="false">
        <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">
          ${item.q}
        </button>
        <div class="faq-a" id="faq-a-${i}"><p>${item.a}</p></div>
      </div>
    `).join('');
    list.querySelectorAll('.faq-item').forEach(el => {
      const btn = el.querySelector('.faq-q');
      btn.addEventListener('click', () => {
        const isOpen = el.dataset.open === 'true';
        el.dataset.open = String(!isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }).catch(() => {});

  // ---------- links ----------
  load('data/links.json').then(links => {
    const grid = document.getElementById('linksGrid');
    grid.innerHTML = Object.values(links).map(l => `
      <a class="btn btn-ghost" data-unavailable="${!l.available}" href="${l.available ? l.href : '#'}"
         ${l.available ? '' : 'onclick="event.preventDefault()" aria-disabled="true"'}>
        ${l.label}
        ${l.available ? '' : `<span class="badge-soon">${l.note || 'Soon'}</span>`}
      </a>
    `).join('');
  }).catch(() => {});

  // ---------- copy buttons ----------
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.copyTarget;
      const target = document.getElementById(targetId);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.textContent);
        btn.textContent = 'Copied!';
        btn.dataset.copied = 'true';
        setTimeout(() => { btn.textContent = 'Copy'; btn.dataset.copied = 'false'; }, 1800);
      } catch (e) {
        btn.textContent = 'Press Ctrl+C';
      }
    });
  });

  // ---------- demo journey ----------
  load('data/demo-journey.json').then(journey => {
    const svg = document.getElementById('demoSvg');
    const scrub = document.getElementById('demoScrub');
    const playBtn = document.getElementById('demoPlay');
    const timeLabel = document.getElementById('demoTime');

    document.getElementById('statName').textContent = journey.playerName;
    document.getElementById('statDuration').textContent = journey.durationLabel;
    document.getElementById('statDistance').textContent = journey.distanceLabel;
    document.getElementById('statCause').textContent = journey.cause;

    const pts = journey.points;
    scrub.max = String(pts.length - 1);

    const ns = 'http://www.w3.org/2000/svg';
    const bgTerrain = `
      <rect width="800" height="600" fill="#0b0d11"/>
      <path d="M0 500 Q 200 420 400 480 T 800 440 V600 H0 Z" fill="#141a16"/>
      <path d="M0 520 Q 250 460 500 510 T 800 480 V600 H0 Z" fill="#101512"/>
      <circle cx="660" cy="250" r="26" fill="#1c2027" stroke="#2a2f3a" stroke-width="1"/>
      <circle cx="30" cy="240" r="20" fill="#1c2027" stroke="#2a2f3a" stroke-width="1"/>
    `;
    const grid = Array.from({ length: 9 }).map((_, i) => `
      <line x1="${i * 100}" y1="0" x2="${i * 100}" y2="600" stroke="#1d212a" stroke-width="1"/>
      <line x1="0" y1="${i * 75}" x2="800" y2="${i * 75}" stroke="#1d212a" stroke-width="1"/>
    `).join('');

    svg.innerHTML = bgTerrain + grid;

    const routePath = document.createElementNS(ns, 'path');
    routePath.setAttribute('fill', 'none');
    routePath.setAttribute('stroke', '#ff3b30');
    routePath.setAttribute('stroke-width', '3');
    routePath.setAttribute('stroke-linecap', 'round');
    routePath.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(routePath);

    const startDot = document.createElementNS(ns, 'circle');
    startDot.setAttribute('r', '6');
    startDot.setAttribute('fill', '#6ea8ff');
    startDot.setAttribute('cx', pts[0].x);
    startDot.setAttribute('cy', pts[0].y);
    svg.appendChild(startDot);

    const marker = document.createElementNS(ns, 'circle');
    marker.setAttribute('r', '7');
    marker.setAttribute('fill', '#ff3b30');
    svg.appendChild(marker);

    const glow = document.createElementNS(ns, 'circle');
    glow.setAttribute('r', '13');
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', '#ff3b30');
    glow.setAttribute('stroke-width', '1.5');
    glow.setAttribute('opacity', '0.5');
    svg.insertBefore(glow, marker);

    function render(idx) {
      const upto = pts.slice(0, idx + 1);
      const d = upto.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
      routePath.setAttribute('d', d);
      const cur = pts[idx];
      marker.setAttribute('cx', cur.x);
      marker.setAttribute('cy', cur.y);
      glow.setAttribute('cx', cur.x);
      glow.setAttribute('cy', cur.y);
      const mins = Math.floor(idx * 6.7 / 60);
      const secs = Math.floor(idx * 6.7 % 60);
      timeLabel.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
    }

    render(0);

    scrub.addEventListener('input', () => {
      stopPlayback();
      render(Number(scrub.value));
    });

    let playTimer = null;
    function stopPlayback() {
      if (playTimer) { clearInterval(playTimer); playTimer = null; playBtn.textContent = '▶'; }
    }
    playBtn.addEventListener('click', () => {
      if (playTimer) { stopPlayback(); return; }
      playBtn.textContent = '⏸';
      if (Number(scrub.value) >= pts.length - 1) scrub.value = '0';
      playTimer = setInterval(() => {
        const next = Number(scrub.value) + 1;
        if (next > pts.length - 1) { stopPlayback(); return; }
        scrub.value = String(next);
        render(next);
      }, 450);
    });
  }).catch(() => {});
})();
