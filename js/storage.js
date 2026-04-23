// ─── localStorage helpers ─────────────────────
const STORAGE_KEY = 'ct_films';

export function getFilms() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function setFilms(films) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(films));
}

export function addFilm(film) {
  const films = getFilms();
  films.push(film);
  setFilms(films);
}

export function updateFilm(updated) {
  const films = getFilms().map(f => f.id === updated.id ? updated : f);
  setFilms(films);
}

export function deleteFilm(id) {
  setFilms(getFilms().filter(f => f.id !== id));
}

export function findFilm(id) {
  return getFilms().find(f => f.id === id) || null;
}
