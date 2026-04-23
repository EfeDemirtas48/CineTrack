// ─── Main App Controller ───────────────────────
import { search, getDetail, getRecommendations, getSeason, posterUrl } from './tmdb.js';
import { getFilms, setFilms, addFilm, updateFilm, deleteFilm, findFilm } from './storage.js';
import {
  updateStats, renderList, renderAutocomplete, renderSelectedPreview,
  renderRecs, renderSeasonTabs, renderEpisodes, openModal,
  updateModalToggle, toast, fmtDate
} from './ui.js';

// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════
let currentFilter = 'all';
let currentSort   = 'added';
let selectedFilm  = null;   // currently previewed TMDb item
let addMyRating   = 0;
let modalFilmId   = null;
let acTimeout     = null;

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  setupSearch();
  setupAddButtons();
  setupFilterTabs();
  setupSort();
  setupListActions();
  setupModal();
  setupAddStars();
});

function renderAll() {
  const films = getFilms();
  updateStats(films);
  renderList(films, currentFilter, currentSort);
}

// ══════════════════════════════════════════════
//  SEARCH
// ══════════════════════════════════════════════
function setupSearch() {
  const input  = document.getElementById('search-input');
  const acList = document.getElementById('autocomplete-list');
  const btnSearch = document.getElementById('btn-do-search');

  input.addEventListener('input', () => {
    clearTimeout(acTimeout);
    const q = input.value.trim();
    if (q.length < 2) { acList.classList.add('hidden'); return; }
    acTimeout = setTimeout(() => doSearch(q, acList), 320);
  });

  btnSearch.addEventListener('click', () => {
    const q = input.value.trim();
    if (q.length >= 2) doSearch(q, acList);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); const q = input.value.trim(); if (q.length >= 2) doSearch(q, acList); }
  });

  // Close autocomplete on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-row')) acList.classList.add('hidden');
  });
}

async function doSearch(q, acList) {
  try {
    const results = await search(q);
    renderAutocomplete(results, acList, item => selectFilm(item, acList));
  } catch (err) {
    console.error('Arama hatası:', err);
  }
}

// ══════════════════════════════════════════════
//  SELECT FILM
// ══════════════════════════════════════════════
async function selectFilm(item, acList) {
  acList.classList.add('hidden');
  document.getElementById('search-input').value = item.title || item.name;

  try {
    const type   = item.media_type;
    const detail = await getDetail(type, item.id);

    selectedFilm = {
      tmdbId:        item.id,
      type,
      title:         detail.title        || detail.name,
      year:          (detail.release_date || detail.first_air_date || '').slice(0, 4),
      poster:        detail.poster_path,
      backdrop:      detail.backdrop_path,
      overview:      detail.overview,
      tmdbRating:    detail.vote_average,
      genres:        (detail.genres || []).map(g => g.name),
      runtime:       detail.runtime || (detail.episode_run_time || [])[0],
      seasons:       detail.number_of_seasons,
      status:        detail.status,
    };

    addMyRating = 0;
    renderSelectedPreview(selectedFilm);
    document.getElementById('recs-section').classList.add('hidden');
    document.getElementById('seasons-section').classList.add('hidden');

    // Recommendations
    const recs = await getRecommendations(type, item.id);
    if (recs.length) {
      renderRecs(recs, document.getElementById('recs-grid'), rec => {
        selectFilm({ ...rec, media_type: rec.media_type || type }, acList);
      });
    }

    // TV seasons
    if (type === 'tv' && detail.number_of_seasons) {
      renderSeasonTabs(detail.number_of_seasons, s => loadEpisodes(item.id, s));
      await loadEpisodes(item.id, 1);
      document.getElementById('seasons-section').classList.remove('hidden');
    }

  } catch (err) {
    console.error('Film detay hatası:', err);
    toast('Detaylar yüklenemedi. İnternet bağlantınızı kontrol edin.', 'warn');
  }
}

async function loadEpisodes(tvId, season) {
  try {
    const data = await getSeason(tvId, season);
    renderEpisodes(data.episodes || [], ep => {
      // Episode add: just toast for now; full episode tracking can be extended
      toast(`S${String(ep.season_number).padStart(2,'0')}E${String(ep.episode_number).padStart(2,'0')} — "${ep.name}" listede işaretlendi`, 'info');
    });
  } catch (err) {
    console.error('Sezon yükleme hatası:', err);
  }
}

// ══════════════════════════════════════════════
//  ADD FILM
// ══════════════════════════════════════════════
function setupAddButtons() {
  document.getElementById('btn-add-watched').addEventListener('click',   () => doAddFilm(true));
  document.getElementById('btn-add-watchlist').addEventListener('click', () => doAddFilm(false));
}

function doAddFilm(watched) {
  if (!selectedFilm) return;

  const films = getFilms();
  if (films.find(f => f.tmdbId === selectedFilm.tmdbId)) {
    toast('Bu içerik zaten listenizde!', 'warn'); return;
  }

  const film = {
    id:          Date.now(),
    tmdbId:      selectedFilm.tmdbId,
    type:        selectedFilm.type,
    title:       selectedFilm.title,
    year:        selectedFilm.year,
    poster:      selectedFilm.poster,
    backdrop:    selectedFilm.backdrop,
    overview:    selectedFilm.overview,
    tmdbRating:  selectedFilm.tmdbRating,
    genres:      selectedFilm.genres,
    runtime:     selectedFilm.runtime,
    seasons:     selectedFilm.seasons,
    myRating:    addMyRating || null,
    watched,
    note:        '',
    addedAt:     Date.now(),
    watchedAt:   watched ? Date.now() : null,
  };

  addFilm(film);
  renderAll();
  toast(
    watched
      ? `"${film.title}" izlendi olarak eklendi ✓`
      : `"${film.title}" izlenecekler listesine eklendi`,
    watched ? 'success' : 'info'
  );

  // Reset search panel
  selectedFilm = null;
  addMyRating  = 0;
  document.getElementById('search-input').value = '';
  document.getElementById('selected-preview').classList.add('hidden');
  document.getElementById('recs-section').classList.add('hidden');
  document.getElementById('seasons-section').classList.add('hidden');
}

// ══════════════════════════════════════════════
//  ADD PANEL STARS
// ══════════════════════════════════════════════
function setupAddStars() {
  document.querySelectorAll('#add-stars .star').forEach(star => {
    star.addEventListener('click', () => {
      addMyRating = parseInt(star.dataset.v);
      document.querySelectorAll('#add-stars .star').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.v) <= addMyRating);
      });
      document.getElementById('add-star-val').textContent = addMyRating + '/10';
    });
  });
}

// ══════════════════════════════════════════════
//  FILTER & SORT
// ══════════════════════════════════════════════
function setupFilterTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderList(getFilms(), currentFilter, currentSort);
    });
  });
}

function setupSort() {
  document.getElementById('sort-select').addEventListener('change', e => {
    currentSort = e.target.value;
    renderList(getFilms(), currentFilter, currentSort);
  });
}

// ══════════════════════════════════════════════
//  LIST ACTIONS (toggle / delete / detail)
// ══════════════════════════════════════════════
function setupListActions() {
  document.getElementById('film-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-id]');
    if (!btn) return;
    const id = Number(btn.dataset.id);

    if (btn.classList.contains('toggle')) {
      const film = findFilm(id);
      if (!film) return;
      film.watched   = !film.watched;
      film.watchedAt = film.watched ? Date.now() : null;
      updateFilm(film);
      renderAll();
      toast(film.watched ? `"${film.title}" izlendi ✓` : `"${film.title}" izleneceklere alındı`, 'info');
    }

    if (btn.classList.contains('del')) {
      const film = findFilm(id);
      if (!film) return;
      if (!confirm(`"${film.title}" silinsin mi?`)) return;
      deleteFilm(id);
      renderAll();
      toast(`"${film.title}" silindi`, 'warn');
    }

    if (btn.classList.contains('detail')) {
      const film = findFilm(id);
      if (film) { modalFilmId = id; openModal(film); }
    }
  });
}

// ══════════════════════════════════════════════
//  MODAL
// ══════════════════════════════════════════════
function setupModal() {
  // Close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Toggle watched
  document.getElementById('btn-modal-toggle').addEventListener('click', () => {
    if (!modalFilmId) return;
    const film = findFilm(modalFilmId);
    if (!film) return;
    film.watched   = !film.watched;
    film.watchedAt = film.watched ? Date.now() : null;
    updateFilm(film);
    renderAll();
    updateModalToggle(film.watched);
    toast(film.watched ? `"${film.title}" izlendi` : 'Geri alındı', 'info');
  });

  // Stars
  document.querySelectorAll('#modal-stars .modal-star').forEach(star => {
    star.addEventListener('click', () => {
      if (!modalFilmId) return;
      const v    = parseInt(star.dataset.v);
      const film = findFilm(modalFilmId);
      if (!film) return;
      film.myRating = v;
      updateFilm(film);
      renderAll();
      document.querySelectorAll('#modal-stars .modal-star').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.v) <= v);
      });
      document.getElementById('modal-rating-val').textContent = v;
      toast(`Puan verildi: ${v}/10 ⭐`, 'success');
    });
  });

  // Save note
  document.getElementById('btn-save-note').addEventListener('click', () => {
    if (!modalFilmId) return;
    const film = findFilm(modalFilmId);
    if (!film) return;
    film.note = document.getElementById('modal-note').value.trim();
    updateFilm(film);
    renderAll();
    toast('Not kaydedildi ✓', 'success');
  });
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  modalFilmId = null;
}
