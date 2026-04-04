const API_KEY = '7dc850a67b09d8b2f84f78b53deecf5b';
const BASE_URL = 'https://api.themoviedb.org/3';
// Reduzido para w200 para voar no celular
const IMG_URL = 'https://image.tmdb.org/t/p/w200'; 

let favorites = JSON.parse(localStorage.getItem('moovle_favs')) || [];
let currentItem = null;
let currentType = 'movie';
let currentPage = 1;
let currentGenre = '';

window.onload = () => loadMovies();

async function loadMovies(isNext = false) {
    const grid = document.getElementById('mainGrid');
    const loadBtn = document.getElementById('loadMoreBtn');
    
    if (!isNext) { 
        currentPage = 1; 
        grid.innerHTML = ''; 
    } else {
        loadBtn.innerText = "CARREGANDO...";
    }

    let url = `${BASE_URL}/${currentType}/popular?api_key=${API_KEY}&language=pt-BR&page=${currentPage}`;
    if (currentGenre) {
        let genreQuery = currentGenre === 'anime' ? 'with_genres=16&with_origin_country=JP' : `with_genres=${currentGenre}`;
        url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&${genreQuery}&language=pt-BR&page=${currentPage}&sort_by=popularity.desc`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        data.results.forEach(item => { if(item.poster_path) createCard(item); });
        
        currentPage++;
        if(loadBtn) {
            loadBtn.innerText = "CARREGAR MAIS";
            loadBtn.style.display = data.results.length ? 'inline-block' : 'none';
        }
    } catch (e) {
        console.error(e);
        if(loadBtn) loadBtn.innerText = "CARREGAR MAIS";
    }
}

// Função com Lazy Loading para performance máxima
function createCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const title = item.title || item.name;
    card.innerHTML = `<img src="${IMG_URL + item.poster_path}" alt="${title}" loading="lazy">`;
    card.onclick = () => openPlayer(item);
    document.getElementById('mainGrid').appendChild(card);
}

async function handleSearchInput(query) {
    const box = document.getElementById('searchSuggestions');
    if (query.length < 2) { box.style.display = 'none'; return; }
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${query}`);
    const data = await res.json();
    box.innerHTML = '';
    const results = data.results.filter(i => i.poster_path && i.media_type !== 'person').slice(0, 6);
    if (!results.length) { box.style.display = 'none'; return; }

    results.forEach(item => {
        const year = (item.release_date || item.first_air_date || "").split('-')[0] || "N/A";
        const type = item.media_type === 'tv' ? 'Série' : 'Filme';
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <img src="${IMG_URL + item.poster_path}" loading="lazy">
            <div class="sug-info">
                <div class="sug-title">${item.title || item.name}</div>
                <div class="sug-meta">
                    <span class="sug-tag">${type}</span>
                    <span>${year}</span>
                    <span class="sug-rating"><i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}</span>
                </div>
            </div>`;
        div.onclick = () => { openPlayer(item); box.style.display = 'none'; document.getElementById('searchInput').value = ''; };
        box.appendChild(div);
    });
    box.style.display = 'block';
}

function openPlayer(item) {
    currentItem = item;
    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const modal = document.getElementById('playerModal');
    document.getElementById('movieTitleDisplay').innerText = (item.title || item.name).toUpperCase();
    document.getElementById('movieDescription').innerText = item.overview || "";
    modal.style.display = 'flex';
    document.getElementById('videoPlayer').src = `https://vidsrc.me/embed/${type}?tmdb=${item.id}`;
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
    const idx = favorites.findIndex(f => f.id === currentItem.id);
    idx === -1 ? favorites.push(currentItem) : favorites.splice(idx, 1);
    localStorage.setItem('moovle_favs', JSON.stringify(favorites));
    updateStarUI();
}

function updateStarUI() {
    const isFav = favorites.some(f => f.id === currentItem.id);
    document.querySelector('#modalFavBtn i').style.color = isFav ? "#fbbf24" : "#fff";
}

function showFavorites(el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = favorites.length ? '' : '<p style="padding:20px; color:gray;">Vazio.</p>';
    favorites.forEach(item => createCard(item));
    document.getElementById('loadMoreBtn').style.display = 'none';
}

document.addEventListener('click', (e) => { if (!e.target.closest('.search-box')) document.getElementById('searchSuggestions').style.display = 'none'; });
