const API_KEY = '7dc850a67b09d8b2f84f78b53deecf5b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300'; 

let favorites = JSON.parse(localStorage.getItem('moovle_favs')) || [];
let currentItem = null;
let currentType = 'movie'; 
let currentGenre = '';
let currentPage = 1;
let isFavActive = false; // FLAG PARA CORRIGIR O BUG DOS FAVORITOS

window.onload = () => loadMovies();

async function loadMovies(isNextPage = false) {
    if (isFavActive) return; // Impede a API de rodar se estiver na aba de favoritos

    const grid = document.getElementById('mainGrid');
    const loadBtn = document.getElementById('loadMoreBtn');
    
    if (!isNextPage) {
        currentPage = 1;
        grid.innerHTML = '<div style="color:gray; padding:20px;">Sintonizando...</div>';
    }

    try {
        let url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&language=pt-BR&page=${currentPage}&sort_by=popularity.desc`;
        
        if (currentGenre === 'anime') {
            url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&with_genres=16&with_origin_country=JP&language=pt-BR&page=${currentPage}`;
        } else if (currentGenre) {
            url += `&with_genres=${currentGenre}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!isNextPage) grid.innerHTML = '';
        
        data.results.forEach(item => {
            if(item.poster_path) createCard(item, grid);
        });

        currentPage++;
        if(loadBtn) loadBtn.style.display = 'block';
    } catch (e) {
        console.error("Erro ao carregar:", e);
    }
}

function createCard(item, container) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <img src="${IMG_URL + item.poster_path}" loading="lazy">
        <div class="card-title">${item.title || item.name}</div>
    `;
    card.onclick = () => openPlayer(item);
    container.appendChild(card);
}

function openPlayer(item) {
    currentItem = item;
    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('videoPlayer');
    
    modal.style.display = 'flex';
    document.getElementById('movieTitleDisplay').innerText = (item.title || item.name).toUpperCase();
    document.getElementById('movieDescription').innerText = item.overview || "";
    
    player.src = ""; 
    setTimeout(() => {
        // Link vidsrc.to é o mais estável para PC e Mobile
        player.src = `https://vidsrc.to/embed/${type}/${item.id}`;
    }, 400);

    updateStarUI();
}

function closePlayer() {
    document.getElementById('videoPlayer').src = ""; 
    document.getElementById('playerModal').style.display = 'none';
}

function filterType(type, el) {
    isFavActive = false; // Desativa a trava de favoritos
    currentType = type === 'all' ? 'movie' : type;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    loadMovies();
}

function filterGenre(id, btn) {
    isFavActive = false;
    currentGenre = id;
    document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadMovies();
}

function showFavorites(el) {
    isFavActive = true; // ATIVA A TRAVA: Impede o carregamento da API
    const grid = document.getElementById('mainGrid');
    const loadBtn = document.getElementById('loadMoreBtn');
    
    if(loadBtn) loadBtn.style.display = 'none'; // Esconde o botão para não bugar
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    
    grid.innerHTML = favorites.length ? '' : '<p style="padding:20px; color:gray;">Sua lista está vazia.</p>';
    favorites.forEach(item => createCard(item, grid));
}

function toggleFavorite() {
    const index = favorites.findIndex(f => f.id === currentItem.id);
    if(index === -1) favorites.push(currentItem);
    else favorites.splice(index, 1);
    localStorage.setItem('moovle_favs', JSON.stringify(favorites));
    updateStarUI();
}

function updateStarUI() {
    const isFav = favorites.some(f => f.id === currentItem.id);
    const star = document.querySelector('#modalFavBtn i');
    if(star) star.style.color = isFav ? "#fbbf24" : "#fff";
}

async function handleSearchInput(query) {
    const box = document.getElementById('searchSuggestions');
    if (query.length < 2) { box.style.display = 'none'; return; }
    
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${query}`);
    const data = await res.json();
    box.innerHTML = '';
    
    data.results.slice(0, 6).forEach(item => {
        if (!item.poster_path) return;
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `<img src="${IMG_URL + item.poster_path}" style="width:40px; border-radius:4px;"><span style="margin-left:10px;">${item.title || item.name}</span>`;
        div.onclick = () => { openPlayer(item); box.style.display = 'none'; };
        box.appendChild(div);
    });
    box.style.display = 'block';
}
