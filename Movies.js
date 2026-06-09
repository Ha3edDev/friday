/* ═══════════════════════════════════════════════════════════════
   MOVIES — watchlist page
   depends on: TMDB_KEY, TMDB_IMG, apiFetch, esc (from index.html)
═══════════════════════════════════════════════════════════════ */

async function loadMovies() {
  const data = await apiFetch('watchlist_data');
  const el = document.getElementById('moviesWrap');
  if (!data || !data.length) {
    el.innerHTML = '<div class="empty">// لیست خالیه</div>';
    return;
  }

  el.innerHTML = `<div class="movie-grid">${data.map((m, i) =>
    `<div class="mc">
      <div class="mc-fb" id="mp-${i}">🎬</div>
      <div class="mc-ov">
        <div class="mc-title">${esc(m.title)}</div>
        <div class="mc-meta">
          <span class="mc-rate" id="mr-${i}">${m.rating ? '★ ' + m.rating : ''}</span>
        </div>
      </div>
    </div>`
  ).join('')}</div>`;

  data.forEach(async (m, i) => {
    const el2 = document.getElementById('mp-' + i);
    if (!el2) return;

    // try by tmdb_id first
    if (m.tmdb_id) {
      try {
        const r = await fetch(`https://api.themoviedb.org/3/${m.media_type || 'movie'}/${m.tmdb_id}?api_key=${TMDB_KEY}&language=fa-IR`);
        const d = await r.json();
        if (d.poster_path) {
          el2.outerHTML = `<img class="mc-poster" src="${TMDB_IMG}${d.poster_path}" loading="lazy">`;
          return;
        }
      } catch (e) {}
    }

    // fallback: search by title
    if (m.title) {
      try {
        const r = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(m.title)}&language=fa-IR`);
        const d = await r.json();
        if (d.results && d.results[0] && d.results[0].poster_path) {
          el2.outerHTML = `<img class="mc-poster" src="${TMDB_IMG}${d.results[0].poster_path}" loading="lazy">`;
        }
      } catch (e) {}
    }
  });
}
