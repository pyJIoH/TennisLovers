// Small, dependency-free helpers: mobile menu, level filter, table of contents, search.
(function () {
  var base = document.body.getAttribute('data-baseurl') || '';

  // Mobile menu
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setPressed(group, button) {
    group.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', b === button ? 'true' : 'false');
    });
  }

  // Level filter on section pages
  var levelFilter = document.querySelector('[data-level-filter]');
  var guideList = document.querySelector('[data-guide-list]');
  if (levelFilter && guideList) {
    levelFilter.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      setPressed(levelFilter, btn);
      var level = btn.getAttribute('data-level');
      var anyShown = false;
      guideList.querySelectorAll('.topic-group').forEach(function (group) {
        var cards = group.querySelectorAll('.guide-card');
        var shown = 0;
        cards.forEach(function (card) {
          var match = !level || card.getAttribute('data-level') === level;
          card.hidden = !match;
          if (match) shown++;
        });
        // With a filter on, hide topics that have nothing at that level.
        group.hidden = !!level && shown === 0;
        if (shown) anyShown = true;
      });
      var empty = guideList.querySelector('[data-filter-empty]');
      if (empty) empty.hidden = !level || anyShown;
    });
  }

  // "On this page" list built from the guide's h2 headings
  var toc = document.querySelector('[data-toc]');
  var tocSource = document.querySelector('[data-toc-source]');
  if (toc && tocSource) {
    var heads = tocSource.querySelectorAll('h2[id]');
    heads.forEach(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      toc.appendChild(a);
    });
    if (heads.length > 1) toc.hidden = false;
  }

  // Search page
  var resultsEl = document.querySelector('[data-search-results]');
  if (!resultsEl) return;
  var form = document.querySelector('[data-search-form]');
  var input = document.getElementById('q');
  var countEl = document.querySelector('[data-search-count]');
  var sectionGroup = document.querySelector('[data-search-sections]');
  var levelGroup = document.querySelector('[data-search-levels]');
  var params = new URLSearchParams(location.search);
  var state = { q: params.get('q') || '', section: params.get('section') || '', level: params.get('level') || '' };
  var guides = [];

  input.value = state.q;
  [[sectionGroup, 'section'], [levelGroup, 'level']].forEach(function (pair) {
    var group = pair[0], key = pair[1];
    var current = group.querySelector('[data-' + key + '="' + state[key] + '"]');
    if (current) setPressed(group, current);
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      setPressed(group, btn);
      state[key] = btn.getAttribute('data-' + key);
      render();
    });
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  input.addEventListener('input', function () { state.q = input.value; render(); });

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function highlight(text, words) {
    var out = escapeHtml(text);
    words.forEach(function (w) {
      if (w.length < 2) return;
      var re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }
  function score(g, words) {
    if (!words.length) return 1;
    var title = (g.title || '').toLowerCase();
    var meta = ((g.topic || '') + ' ' + (g.tags || '') + ' ' + (g.summary || '')).toLowerCase();
    var text = (g.text || '').toLowerCase();
    var total = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      var s = (title.indexOf(w) > -1 ? 5 : 0) + (meta.indexOf(w) > -1 ? 3 : 0) + (text.indexOf(w) > -1 ? 1 : 0);
      if (!s) return 0; // every word must match somewhere
      total += s;
    }
    return total;
  }
  function updateUrl() {
    var p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.section) p.set('section', state.section);
    if (state.level) p.set('level', state.level);
    var qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }
  function render() {
    var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    var hits = guides
      .filter(function (g) { return (!state.section || g.section === state.section) && (!state.level || g.level === state.level); })
      .map(function (g) { return { g: g, s: score(g, words) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });
    countEl.textContent = hits.length + (hits.length === 1 ? ' result' : ' results') + (state.q.trim() ? ' for “' + state.q.trim() + '”' : '');
    resultsEl.innerHTML = hits.length ? hits.map(function (r) {
      var g = r.g;
      return '<a class="card" href="' + escapeHtml(g.url) + '">' +
        '<span class="card-meta"><span class="level level-' + escapeHtml((g.level || '').toLowerCase()) + '">' + escapeHtml(g.level) + '</span>' + escapeHtml(g.section_title) + ' · ' + escapeHtml(g.topic) + '</span>' +
        '<strong class="card-title">' + highlight(g.title, words) + '</strong>' +
        '<span class="card-text">' + highlight(g.summary, words) + '</span></a>';
    }).join('') : '<p class="empty-note">No guides match that yet. Try a stroke name like “serve”, or browse the sections from the menu.</p>';
    updateUrl();
  }

  fetch(base + '/search.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { guides = data; render(); })
    .catch(function () { countEl.textContent = 'Search is unavailable right now.'; });
})();
