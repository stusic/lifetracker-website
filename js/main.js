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
  const linkTile = (l) => `
    <a class="btn btn-ghost" data-unavailable="${!l.available}" href="${l.available ? l.href : '#'}"
       ${l.available ? '' : 'onclick="event.preventDefault()" aria-disabled="true"'}>
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
