const API_KEY = '7dc850a67b09d8b2f84f78b53deecf5b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300'; 

let favorites = JSON.parse(localStorage.getItem('moovle_favs')) || [];
let currentItem = null;
let currentType = 'movie'; 
let currentGenre = '';
let currentPage = 1;

window.onload = () => loadMovies();

async function loadMovies(isNextPage = false) {
    const grid = document.getElementById('mainGrid');
    if (!isNextPage) { currentPage = 1; grid.innerHTML = ''; }

    let url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&language=pt-BR&page=${currentPage}&sort_by=popularity.desc`;
    if (currentGenre === 'anime') url += '&with_genres=16&with_origin_country=JP';
    else if (currentGenre) url += `&with_genres=${currentGenre}`;

    const res = await fetch(url);
    const data = await res.json();
    data.results.forEach(item => { if(item.poster_path) createCard(item, grid); });
    currentPage++;
}

function createCard(item, container) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `<img src="${IMG_URL + item.poster_path}" loading="lazy"><div class="card-title">${item.title || item.name}</div>`;
    card.onclick = () => openPlayer(item);
    container.appendChild(card);
}

function openPlayer(item) {
    currentItem = item;
    const type = item.first_air_date ? 'tv' : 'movie';
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('videoPlayer');
    
    modal.style.display = 'flex';
    document.getElementById('movieTitleDisplay').innerText = (item.title || item.name).toUpperCase();
    document.getElementById('movieDescription').innerText = item.overview || "";
    
    player.src = ""; 
    // USANDO vidsrc.to PARA MELHOR FUNCIONAMENTO EM CELULARES
    setTimeout(() => {
        player.src = `https://vidsrc.to/embed/${type}/${item.id}`;
    }, 300);

    updateStarUI();
}

function closePlayer() {
    document.getElementById('videoPlayer').src = ""; 
    document.getElementById('playerModal').style.display = 'none';
}

function filterGenre(id, btn) {
    currentGenre = id;
    document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadMovies();
}

function filterType(type, el) {
    currentType = type === 'all' ? 'movie' : type;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    loadMovies();
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

async function handleSearchInput(query) {
    if (query.length < 2) return;
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${query}`);
    const data = await res.json();
    const box = document.getElementById('searchSuggestions');
    box.innerHTML = '';
    data.results.slice(0, 5).forEach(item => {
        if(!item.poster_path) return;
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `<img src="${IMG_URL + item.poster_path}"><span>${item.title || item.name}</span>`;
        div.onclick = () => { openPlayer(item); box.style.display = 'none'; };
        box.appendChild(div);
    });
    box.style.display = 'block';
}
