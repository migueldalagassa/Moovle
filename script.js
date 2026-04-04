const API_KEY = '7dc850a67b09d8b2f84f78b53deecf5b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let favorites = JSON.parse(localStorage.getItem('moovle_favs')) || [];
let currentItem = null;
let currentType = 'movie'; 
let currentGenre = '';

window.onload = () => loadMovies();

async function loadMovies() {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = '<p style="color:gray; padding:20px;">Carregando...</p>';
    try {
        let allResults = [];
        for(let i = 1; i <= 5; i++) {
            const url = currentGenre 
                ? `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&with_genres=${currentGenre}&language=pt-BR&page=${i}`
                : `${BASE_URL}/${currentType}/popular?api_key=${API_KEY}&language=pt-BR&page=${i}`;
            const res = await fetch(url);
            const data = await res.json();
            allResults = allResults.concat(data.results);
        }
        grid.innerHTML = '';
        allResults.forEach(item => item.poster_path && createCard(item, grid));
    } catch (e) { console.error(e); }
}

function createCard(item, container) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `<img src="${IMG_URL + item.poster_path}"><div class="card-title">${item.title || item.name}</div>`;
    card.onclick = () => openPlayer(item);
    container.appendChild(card);
}

// BUSCA INTELIGENTE COM SUGESTÕES COMPLETAS
async function handleSearchInput(query) {
    const box = document.getElementById('searchSuggestions');
    if (query.length < 2) { box.style.display = 'none'; return; }
    
    try {
        const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${query}`);
        const data = await res.json();
        
        box.innerHTML = '';
        const results = data.results.filter(i => i.poster_path).slice(0, 6);

        if (results.length === 0) { box.style.display = 'none'; return; }

        results.forEach(item => {
            const date = item.release_date || item.first_air_date || '----';
            const year = date.split('-')[0];
            const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
            const type = item.media_type === 'tv' ? 'Série' : 'Filme';

            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <img src="${IMG_URL + item.poster_path}">
                <div class="sug-info">
                    <div class="sug-title">${item.title || item.name}</div>
                    <div class="sug-meta">
                        <span class="sug-rating"><i class="fas fa-star"></i> ${rating}</span>
                        <span>${year}</span>
                        <span class="sug-tag">${type}</span>
                    </div>
                </div>
            `;
            div.onclick = () => { openPlayer(item); box.style.display = 'none'; document.getElementById('searchInput').value = ''; };
            box.appendChild(div);
        });
        box.style.display = 'block';
    } catch (e) { console.error(e); }
}

function openPlayer(item) {
    currentItem = item;
    currentType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('videoPlayer');
    modal.style.display = 'flex';
    document.getElementById('movieTitleDisplay').innerText = "AGUARDE...";
    player.src = "";
    setTimeout(() => {
        document.getElementById('movieTitleDisplay').innerText = (item.title || item.name).toUpperCase();
        player.src = `https://vidsrc.me/embed/${currentType}?tmdb=${item.id}`;
    }, 1500);
    updateStarUI();
}

function closePlayer() {
    document.getElementById('videoPlayer').src = "";
    document.getElementById('playerModal').style.display = 'none';
}

function filterType(type, el) {
    currentType = type === 'all' ? 'movie' : type;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    loadMovies();
}

function filterGenre(id, btn) {
    currentGenre = id;
    document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadMovies();
}

function showFavorites(el) {
    const grid = document.getElementById('mainGrid');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    grid.innerHTML = favorites.length ? '' : '<p style="padding:20px;">Vazio.</p>';
    favorites.forEach(item => createCard(item, grid));
}

function toggleFavorite() {
    const index = favorites.findIndex(f => f.id === currentItem.id);
    index === -1 ? favorites.push(currentItem) : favorites.splice(index, 1);
    localStorage.setItem('moovle_favs', JSON.stringify(favorites));
    updateStarUI();
}

function updateStarUI() {
    const isFav = favorites.some(f => f.id === currentItem.id);
    document.querySelector('#modalFavBtn i').style.color = isFav ? "#fbbf24" : "#fff";
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) document.getElementById('searchSuggestions').style.display = 'none';
});
