// ─── TMDb API wrapper ─────────────────────────
const API_KEY = '42b5380258138a4db23405c7b3abf551';
const BASE    = 'https://api.themoviedb.org/3';
export const IMG_BASE = 'https://image.tmdb.org/t/p/';

async function get(path, extra = '') {
  const res = await fetch(`${BASE}${path}?api_key=${API_KEY}&language=tr-TR${extra}`);
  return res.json();
}

// Search movies + TV shows
export async function search(query) {
  const data = await get('/search/multi', `&query=${encodeURIComponent(query)}`);
  return (data.results || []).filter(i => i.media_type === 'movie' || i.media_type === 'tv');
}

// Full details for a movie or TV show
export async function getDetail(type, id) {
  return get(`/${type}/${id}`);
}

// Recommendations based on a movie or TV show
export async function getRecommendations(type, id) {
  const data = await get(`/${type}/${id}/recommendations`);
  return (data.results || []).slice(0, 14);
}

// Season details (episodes)
export async function getSeason(tvId, seasonNumber) {
  return get(`/tv/${tvId}/season/${seasonNumber}`);
}

// Helpers
export function posterUrl(path, size = 'w185') {
  return path ? IMG_BASE + size + path : 'https://via.placeholder.com/185x278/0f0f1a/444?text=?';
}

export function backdropUrl(path) {
  return path ? IMG_BASE + 'w780' + path : '';
}

export function fmtVote(v) {
  return (v && v > 0) ? v.toFixed(1) : null;
}
