const API_KEY = '7dc850a67b09d8b2f84f78b53deecf5b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300'; 

let favorites = JSON.parse(localStorage.getItem('moovle_favs')) || [];
let currentItem = null;
let currentType = 'movie', currentGenre = '', currentPage = 1;
let isFavPage = false; // Trava contra bug do Carregar Mais nos favoritos

window.onload = () => loadMovies();

// Função principal de carga com ajuste no botão de carregar mais
async function loadMovies(isNext = false) {
    if (isFavPage) return; 

    const grid = document.getElementById('mainGrid');
    const loadArea = document.getElementById('loadMoreArea');
    
    if (!isNext) { currentPage = 1; grid.innerHTML = ''; }

    try {
        let url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&language=pt-BR&page=${currentPage}&sort_by=popularity.desc`;
        if (currentGenre === 'anime') url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&with_genres=16&with_origin_country=JP&language=pt-BR&page=${currentPage}`;
        else if (currentGenre) url += `&with_genres=${currentGenre}`;

        const res = await fetch(url);
        const data = await res.json();

        data.results.forEach(item => { if(item.poster_path) createCard(item, grid); });
        
        currentPage++;
        // Garante que o botão reapareça ao carregar conteúdo da API
        if(loadArea) loadArea.style.display = 'block';
    } catch (e) { console.error(e); }
}

function createCard(item, container) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `<img src="${IMG_URL + item.poster_path}"><div class="card-title">${item.title || item.name}</div>`;
    card.onclick = () => openPlayer(item);
    container.appendChild(card);
}

// Player otimizado para PC e Celular
function openPlayer(item) {
    currentItem = item;
    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('videoPlayer');
    
    modal.style.display = 'flex';
    document.getElementById('movieTitleDisplay').innerText = (item.title || item.name).toUpperCase();
    document.getElementById('movieDescription').innerText = item.overview || "";
    
    player.src = ""; // Limpa para evitar erros de conexão recusada
    setTimeout(() => {
        player.src = `https://vidsrc.to/embed/${type}/${item.id}`;
    }, 400);
    updateStarUI();
}

function closePlayer() {
    document.getElementById('videoPlayer').src = ""; 
    document.getElementById('playerModal').style.display = 'none';
}

// Pesquisa Inteligente com Nota, Ano e Tipo
async function handleSearchInput(query) {
    const box = document.getElementById('searchSuggestions');
    if (query.length < 2) { box.style.display = 'none'; return; }
    
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${query}`);
    const data = await res.json();
    box.innerHTML = '';
    
    data.results.slice(0, 6).forEach(item => {
        if (!item.poster_path) return;
        const date = item.release_date || item.first_air_date || "";
        const year = date ? date.split('-')[0] : "";
        const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";

        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <img src="${IMG_URL + item.poster_path}" style="width:40px; border-radius:4px;">
            <div class="suggestion-info">
                <span style="font-size:0.9rem; font-weight:600;">${item.title || item.name}</span>
                <div class="suggestion-meta">
                    <span>${item.media_type === 'tv' ? 'Série' : 'Filme'}</span>
                    <span>${year}</span>
                    <span class="meta-rating"><i class="fas fa-star"></i> ${rating}</span>
                </div>
            </div>
        `;
        div.onclick = () => { openPlayer(item); box.style.display = 'none'; };
        box.appendChild(div);
    });
    box.style.display = 'block';
}

function filterType(type, el) {
    isFavPage = false; // Permite o carregar mais novamente
    currentType = type === 'all' ? 'movie' : type;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    loadMovies();
}

// CORREÇÃO DO BUG DOS FAVORITOS
function showFavorites(el) {
    isFavPage = true; 
    const grid = document.getElementById('mainGrid');
    const loadArea = document.getElementById('loadMoreArea');
    
    // Esconde o botão carregar mais para não misturar com a API
    if(loadArea) loadArea.style.display = 'none'; 
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    grid.innerHTML = favorites.length ? '' : '<p style="padding:20px; color:gray;">Nenhum favorito.</p>';
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
    const star = document.querySelector('#modalFavBtn i');
    if(star) star.style.color = isFav ? "#fbbf24" : "#fff";
}
