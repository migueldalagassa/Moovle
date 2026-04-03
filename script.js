const API_KEY = '7dc850a67b09d8b2f84f78b53deecf5b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let favorites = JSON.parse(localStorage.getItem('moovle_favs')) || [];
let currentItem = null;
let currentType = 'movie'; 
let currentGenre = '';

window.onload = () => loadMovies();

// CARREGAR FILMES
async function loadMovies() {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = '<div style="color:gray; padding:20px;">Carregando...</div>';
    const promises = [];
    for (let i = 1; i <= 5; i++) {
        const url = currentGenre 
            ? `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&with_genres=${currentGenre}&language=pt-BR&page=${i}`
            : `${BASE_URL}/${currentType}/popular?api_key=${API_KEY}&language=pt-BR&page=${i}`;
        promises.push(fetch(url).then(res => res.json()));
    }
    const results = await Promise.all(promises);
    grid.innerHTML = '';
    results.forEach(data => data.results.forEach(item => item.poster_path && createCard(item, grid)));
}

function createCard(item, container) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `<img src="${IMG_URL + item.poster_path}" loading="lazy"><div class="card-title">${item.title || item.name}</div>`;
    card.onclick = () => openPlayer(item);
    container.appendChild(card);
}

// BUSCA COM INFORMAÇÕES
async function handleSearchInput(query) {
    const box = document.getElementById('searchSuggestions');
    if (query.length < 2) { box.style.display = 'none'; return; }
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${query}`);
    const data = await res.json();
    box.innerHTML = '';
    data.results.slice(0, 6).forEach(item => {
        if (!item.poster_path) return;
        const year = (item.release_date || item.first_air_date || "").split('-')[0] || "N/A";
        const rating = item.vote_average ? item.vote_average.toFixed(1) : "0.0";
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <img src="${IMG_URL + item.poster_path}">
            <div class="suggestion-info">
                <span class="suggestion-title">${item.title || item.name}</span>
                <div class="suggestion-meta">
                    <span class="rating-star"><i class="fas fa-star"></i> ${rating}</span>
                    <span>${year}</span>
                    <span style="background:#334155; padding:1px 4px; border-radius:3px; font-size:10px">${item.media_type === 'tv' ? 'Série' : 'Filme'}</span>
                </div>
            </div>`;
        div.onclick = () => { openPlayer(item); box.style.display = 'none'; };
        box.appendChild(div);
    });
    box.style.display = 'block';
}

// PLAYER E FAVORITOS
function openPlayer(item) {
    currentItem = item;
    currentType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    document.getElementById('playerModal').style.display = 'flex';
    document.getElementById('movieTitleDisplay').innerText = (item.title || item.name).toUpperCase();
    updateStarUI();
    changeSource('vidsrc', document.querySelector('.source-btn'));
}

function toggleFavorite() {
    if (!currentItem) return;
    const index = favorites.findIndex(f => f.id === currentItem.id);
    index === -1 ? favorites.push(currentItem) : favorites.splice(index, 1);
    localStorage.setItem('moovle_favs', JSON.stringify(favorites));
    updateStarUI();
}

function updateStarUI() {
    const btnIcon = document.querySelector('#modalFavBtn i');
    const isFav = favorites.some(f => f.id === currentItem.id);
    btnIcon.style.color = isFav ? "#fbbf24" : "#ffffff";
}

function showFavorites(el) {
    const grid = document.getElementById('mainGrid');
    document.getElementById('shelfTitle').innerText = "MINHA LISTA";
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    grid.innerHTML = '';
    if (favorites.length === 0) { grid.innerHTML = '<p style="color:gray; padding:40px;">Sua lista está vazia.</p>'; return; }
    favorites.forEach(item => createCard(item, grid));
}

function changeSource(source, btn) {
    const player = document.getElementById('videoPlayer');
    document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sources = {
        vidsrc: `https://vidsrc.me/embed/${currentType}?tmdb=${currentItem.id}`,
        superembed: `https://multiembed.mov/?video_id=${currentItem.id}&tmdb=1`,
        embedvip: `https://embed.smashystream.com/playere.php?tmdb=${currentItem.id}`
    };
    player.src = sources[source];
}

function closePlayer() { document.getElementById('playerModal').style.display = 'none'; document.getElementById('videoPlayer').src = ''; }
function filterGenre(id, btn) { currentGenre = id; document.querySelectorAll('.pill').forEach(b => b.classList.remove('active')); btn.classList.add('active'); loadMovies(); }
function filterType(type, el) { currentType = type === 'all' ? 'movie' : type; document.getElementById('shelfTitle').innerText = type === 'tv' ? "SÉRIES POPULARES" : "FILMES POPULARES"; document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); el.classList.add('active'); loadMovies(); }

document.addEventListener('click', (e) => { if (!e.target.closest('.search-box')) document.getElementById('searchSuggestions').style.display = 'none'; });
