// ─── UI / Rendering ───────────────────────────
import { posterUrl, fmtVote } from './tmdb.js';

// ── Stats bar ──────────────────────────────────
export function updateStats(films) {
  const watched = films.filter(f => f.watched).length;
  const rated   = films.filter(f => f.myRating);
  const avg     = rated.length
    ? (rated.reduce((a, f) => a + f.myRating, 0) / rated.length).toFixed(1)
    : '—';

  document.getElementById('s-total').textContent     = films.length;
  document.getElementById('s-watched').textContent   = watched;
  document.getElementById('s-unwatched').textContent = films.length - watched;
  document.getElementById('s-avgscore').textContent  = avg;
}

// ── Film list ──────────────────────────────────
export function renderList(films, filter, sortBy) {
  let list = [...films];

  if (filter === 'watched')   list = list.filter(f => f.watched);
  if (filter === 'unwatched') list = list.filter(f => !f.watched);

  list = sortFilms(list, sortBy);

  const listEl   = document.getElementById('film-list');
  const emptyEl  = document.getElementById('empty-state');
  listEl.innerHTML = '';

  if (!list.length) { emptyEl.classList.remove('hidden'); return; }
  emptyEl.classList.add('hidden');

  list.forEach((film, i) => {
    const li = buildCard(film, i);
    listEl.appendChild(li);
  });
}

function sortFilms(arr, by) {
  return arr.sort((a, b) => {
    if (by === 'title')  return a.title.localeCompare(b.title, 'tr');
    if (by === 'rating') return (b.myRating || 0) - (a.myRating || 0);
    if (by === 'imdb')   return (b.tmdbRating || 0) - (a.tmdbRating || 0);
    if (by === 'year')   return (b.year || '0').localeCompare(a.year || '0');
    return b.addedAt - a.addedAt; // default: added
  });
}

function buildCard(film, index) {
  const li = document.createElement('li');
  li.className = `film-card ${film.watched ? 'is-watched' : 'is-unwatched'}`;
  li.style.animationDelay = `${index * 0.04}s`;

  const stars = film.myRating
    ? '★'.repeat(Math.min(Math.round(film.myRating / 2), 5))
      + '☆'.repeat(5 - Math.min(Math.round(film.myRating / 2), 5))
    : '';

  li.innerHTML = `
    <div class="card-poster-wrap">
      <img class="card-poster"
        src="${posterUrl(film.poster, 'w185')}"
        onerror="this.src='https://via.placeholder.com/74x110/0f0f1a/444?text=?'"
        alt="${film.title}">
      <span class="card-type-badge ${film.type === 'movie' ? 'movie' : 'tv'}">
        ${film.type === 'movie' ? 'Film' : 'Dizi'}
      </span>
    </div>

    <div class="card-body">
      <div class="card-top">
        <div class="card-title">
          ${film.title}
          ${film.year ? `<span class="year">(${film.year})</span>` : ''}
        </div>
        <div class="card-badges">
          <span class="badge-status ${film.watched ? 'watched' : 'unwatched'}">
            ${film.watched ? '✓ İzlendi' : '● İzlenecek'}
          </span>
          ${film.tmdbRating
            ? `<div class="imdb-badge">
                <span class="si">⭐</span>
                <span class="sc">${fmtVote(film.tmdbRating)}</span>
                <span class="src">TMDb</span>
               </div>`
            : ''}
        </div>
      </div>

      <div class="card-meta">
        ${(film.genres || []).slice(0, 2).map(g => `<span class="chip">${g}</span>`).join('')}
        ${film.runtime  ? `<span class="chip">${film.runtime} dk</span>` : ''}
        ${film.seasons  ? `<span class="chip">${film.seasons} sezon</span>` : ''}
      </div>

      ${film.myRating
        ? `<div class="my-score-display">
            <span class="ms-lbl">Puanım:</span>
            <span class="ms-stars">${stars}</span>
            <span class="ms-val">${film.myRating}/10</span>
           </div>`
        : ''}
      ${film.note ? `<div class="card-note">"${film.note}"</div>` : ''}
    </div>

    <div class="card-actions">
      <button class="act-btn btn-toggle toggle" data-id="${film.id}">
        ${film.watched ? '↩ Geri Al' : '✓ İzledim'}
      </button>
      <button class="act-btn btn-detail detail" data-id="${film.id}">Detay</button>
      <button class="act-btn btn-del del" data-id="${film.id}">Sil</button>
    </div>
  `;
  return li;
}

// ── Autocomplete dropdown ──────────────────────
export function renderAutocomplete(results, container, onSelect) {
  container.innerHTML = '';
  if (!results.length) { container.classList.add('hidden'); return; }

  results.slice(0, 8).forEach(item => {
    const name   = item.title || item.name;
    const year   = (item.release_date || item.first_air_date || '').slice(0, 4);
    const rating = fmtVote(item.vote_average);
    const type   = item.media_type === 'movie' ? '🎬 Film' : '📺 Dizi';

    const div = document.createElement('div');
    div.className = 'ac-item';
    div.innerHTML = `
      <img class="ac-poster"
        src="${posterUrl(item.poster_path, 'w92')}"
        onerror="this.src='https://via.placeholder.com/36x54/1e1e2e/555?text=?'"
        alt="">
      <div class="ac-info">
        <div class="ac-title">${name}</div>
        <div class="ac-meta">${type}${year ? ' · ' + year : ''}</div>
      </div>
      ${rating ? `<div class="ac-rating">⭐ ${rating}</div>` : ''}
    `;
    div.addEventListener('click', () => onSelect(item));
    container.appendChild(div);
  });

  container.classList.remove('hidden');
}

// ── Selected film preview ──────────────────────
export function renderSelectedPreview(film) {
  document.getElementById('sel-poster').src = posterUrl(film.poster, 'w185');
  document.getElementById('sel-title').textContent = film.title;
  document.getElementById('sel-year').textContent =
    `${film.year || ''}${film.type === 'tv' ? ' · Dizi' : ' · Film'}`
    + `${film.runtime ? ' · ' + film.runtime + ' dk' : ''}`
    + `${film.seasons ? ' · ' + film.seasons + ' sezon' : ''}`;
  document.getElementById('sel-overview').textContent = film.overview || 'Açıklama bulunamadı.';

  const tagsEl = document.getElementById('sel-tags');
  tagsEl.innerHTML = '';
  if (film.tmdbRating) tagsEl.innerHTML += `<span class="sel-tag imdb">⭐ TMDb: ${fmtVote(film.tmdbRating)}</span>`;
  (film.genres || []).slice(0, 3).forEach(g => tagsEl.innerHTML += `<span class="sel-tag">${g}</span>`);
  if (film.status) tagsEl.innerHTML += `<span class="sel-tag">${film.status}</span>`;

  document.getElementById('add-star-val').textContent = '—';
  document.querySelectorAll('#add-stars .star').forEach(s => s.classList.remove('active'));
  document.getElementById('selected-preview').classList.remove('hidden');
}

// ── Recommendations ────────────────────────────
export function renderRecs(results, container, onSelect) {
  container.innerHTML = '';
  results.forEach(item => {
    const name = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    const div = document.createElement('div');
    div.className = 'rec-card';
    div.innerHTML = `
      <img class="rec-poster"
        src="${posterUrl(item.poster_path, 'w185')}"
        onerror="this.src='https://via.placeholder.com/100x150/1e1e2e/555?text=?'"
        alt="${name}">
      <div class="rec-name">${name}</div>
      <div class="rec-year">${year}</div>
    `;
    div.addEventListener('click', () => onSelect(item));
    container.appendChild(div);
  });
  document.getElementById('recs-section').classList.remove('hidden');
}

// ── Seasons / Episodes ─────────────────────────
export function renderSeasonTabs(numSeasons, onSelect) {
  const tabsEl = document.getElementById('season-tabs');
  tabsEl.innerHTML = '';
  for (let s = 1; s <= Math.min(numSeasons, 15); s++) {
    const btn = document.createElement('button');
    btn.className = 'season-tab' + (s === 1 ? ' active' : '');
    btn.textContent = `Sezon ${s}`;
    btn.dataset.season = s;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      onSelect(s);
    });
    tabsEl.appendChild(btn);
  }
}

export function renderEpisodes(episodes, onAdd) {
  const listEl = document.getElementById('episodes-list');
  listEl.innerHTML = '';
  episodes.forEach(ep => {
    const div = document.createElement('div');
    div.className = 'ep-item';
    const sn = String(ep.season_number).padStart(2, '0');
    const en = String(ep.episode_number).padStart(2, '0');
    div.innerHTML = `
      <span class="ep-num">S${sn}E${en}</span>
      <span class="ep-name">${ep.name || 'Bölüm ' + ep.episode_number}</span>
      <span class="ep-date">${ep.air_date ? fmtDate(ep.air_date) : ''}</span>
      <button class="btn-add-ep">+ Ekle</button>
    `;
    div.querySelector('.btn-add-ep').addEventListener('click', () => onAdd(ep));
    listEl.appendChild(div);
  });
}

// ── Modal ──────────────────────────────────────
export function openModal(film) {
  const overlay = document.getElementById('modal-overlay');

  const backdropSrc = film.backdrop
    ? 'https://image.tmdb.org/t/p/w780' + film.backdrop
    : posterUrl(film.poster, 'w500');

  document.getElementById('modal-backdrop').src    = backdropSrc;
  document.getElementById('modal-poster').src      = posterUrl(film.poster, 'w185');
  document.getElementById('modal-title').textContent = film.title;
  document.getElementById('modal-sub').textContent =
    `${film.year || ''}${film.type === 'tv' ? ' · Dizi' : ' · Film'}`
    + (film.tmdbRating ? ` · ⭐ ${fmtVote(film.tmdbRating)} TMDb` : '')
    + (film.runtime ? ` · ${film.runtime} dk` : '');
  document.getElementById('modal-overview').textContent = film.overview || 'Açıklama bulunamadı.';

  // Tags
  const tagsEl = document.getElementById('modal-tags');
  tagsEl.innerHTML = '';
  if (film.tmdbRating) tagsEl.innerHTML += `<span class="modal-tag special">⭐ TMDb: ${fmtVote(film.tmdbRating)}</span>`;
  (film.genres || []).forEach(g => tagsEl.innerHTML += `<span class="modal-tag">${g}</span>`);
  if (film.seasons) tagsEl.innerHTML += `<span class="modal-tag">${film.seasons} Sezon</span>`;
  if (film.runtime) tagsEl.innerHTML += `<span class="modal-tag">${film.runtime} dk</span>`;

  // Toggle
  updateModalToggle(film.watched);

  // Stars
  const r = film.myRating || 0;
  document.querySelectorAll('#modal-stars .modal-star').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.v) <= r);
  });
  document.getElementById('modal-rating-val').textContent = r || '—';

  // Note
  document.getElementById('modal-note').value = film.note || '';

  overlay.classList.add('open');
}

export function updateModalToggle(watched) {
  const btn = document.getElementById('btn-modal-toggle');
  const lbl = document.getElementById('modal-toggle-lbl');
  btn.className = 'btn-modal-toggle' + (watched ? ' watched' : '');
  btn.querySelector('.toggle-icon').textContent = watched ? '✓' : '○';
  lbl.textContent = watched ? 'İzlendi ✓ — Geri almak için tıkla' : 'İzlenecek — Tıkla izledim';
}

// ── Toast ──────────────────────────────────────
export function toast(msg, type = 'success') {
  const icons = { success: '✓', info: 'ℹ', warn: '⚠' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || '✓'}</span> ${msg}`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 2700);
}

// ── Utility ─────────────────────────────────────
export function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}
