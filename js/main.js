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

  // ---------- icons ----------
  const ICONS = {
    github: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.28 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>',
    steam: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8.6" cy="15.3" r="2.5" fill="currentColor"/><circle cx="15.4" cy="8.4" r="2" fill="currentColor"/><line x1="8.6" y1="15.3" x2="13.3" y2="10.5" stroke="currentColor" stroke-width="1.4"/></svg>',
    patreon: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="3" width="4" height="18" fill="currentColor"/><circle cx="15" cy="9.5" r="6.3" fill="currentColor"/></svg>',
    discord: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M9 3C5 3 2 6.5 2 11c0 3.8 2.1 7.2 5.2 8.8.4.2.8 0 .9-.4l.4-1.4c-3-.9-4.9-3.7-4.9-7 0-3.9 3.1-7.1 7-7.1h3c3.9 0 7 3.2 7 7.1 0 3.3-1.9 6.1-4.9 7l.4 1.4c.1.4.5.6.9.4C19.9 18.2 22 14.8 22 11c0-4.5-3-8-7-8H9z"/><circle cx="9" cy="12" r="1.6" fill="currentColor"/><circle cx="15" cy="12" r="1.6" fill="currentColor"/></svg>',
    tag: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/></svg>'
  };

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
        <div class="faq-a" id="faq-a-${i}">
          <p>${item.a}</p>
          ${item.image ? `<img class="faq-img" src="${item.image}" alt="${item.imageAlt || ''}" loading="lazy">` : ''}
        </div>
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
  const linkTile = (l) => `
    <a class="btn btn-ghost" data-unavailable="${!l.available}" href="${l.available ? l.href : '#'}"
       ${l.available ? 'target="_blank" rel="noopener noreferrer"' : 'onclick="event.preventDefault()" aria-disabled="true"'}>
      ${l.icon && ICONS[l.icon] ? ICONS[l.icon] : ''}
      ${l.label}
      ${l.available ? '' : `<span class="badge-soon">${l.note || 'Soon'}</span>`}
    </a>
  `;
  load('data/links.json').then(links => {
    const grid = document.getElementById('linksGrid');
    grid.innerHTML = Object.values(links).map(linkTile).join('');

    const quickLinks = document.getElementById('installQuickLinks');
    if (quickLinks) {
      quickLinks.innerHTML = [links.repo, links.workshop].map(linkTile).join('');
    }
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

})();
