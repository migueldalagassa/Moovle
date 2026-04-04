const API_KEY = '7dc850a67b09d8b2f84f78b53deecf5b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300'; 

let favorites = JSON.parse(localStorage.getItem('moovle_favs')) || [];
let currentItem = null;
let currentType = 'movie'; 
let currentGenre = '';
let currentPage = 1; // Variável crucial para o "Carregar Mais"

window.onload = () => loadMovies();

async function loadMovies(isNextPage = false) {
    const grid = document.getElementById('mainGrid');
    const loadBtn = document.getElementById('loadMoreBtn');
    
    // Se clicar numa categoria ou mudar de tipo (Filme/Série), reseta a página
    if (!isNextPage) {
        currentPage = 1;
        grid.innerHTML = '<div class="loading-msg" style="color:gray; padding:20px;">Carregando catálogo...</div>';
        if(loadBtn) loadBtn.style.display = 'none';
    } else {
        if(loadBtn) loadBtn.innerText = "CARREGANDO...";
    }

    try {
        let url;
        
        // Lógica de URLs da API
        if (currentGenre === 'anime') {
            // Filtro: Animação (16) + Origem Japão (JP)
            url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&with_genres=16&with_origin_country=JP&language=pt-BR&page=${currentPage}&sort_by=popularity.desc`;
        } else if (currentGenre === '10751') {
            // Filtro Infantil: Família (10751) + Animação (16) - Para Shrek, Toy Story, etc.
            url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&with_genres=10751,16&language=pt-BR&page=${currentPage}&sort_by=popularity.desc`;
        } else if (currentGenre) {
            // Filtros de Gêneros Normais (Ação, Terror, etc.)
            url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&with_genres=${currentGenre}&language=pt-BR&page=${currentPage}&sort_by=popularity.desc`;
        } else {
            // Página Inicial (Populares)
            url = `${BASE_URL}/${currentType}/popular?api_key=${API_KEY}&language=pt-BR&page=${currentPage}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        // Remove a mensagem de carregando inicial
        if (!isNextPage) grid.innerHTML = '';
        
        if (data.results && data.results.length > 0) {
            data.results.forEach(item => {
                if(item.poster_path) createCard(item, grid);
            });

            // Prepara para a próxima página e mostra o botão azul
            currentPage++; 
            if(loadBtn) {
                loadBtn.style.display = 'inline-block';
                loadBtn.innerText = "CARREGAR MAIS";
            }
        } else {
            if(loadBtn) loadBtn.style.display = 'none';
        }

    } catch (e) { 
        console.error("Erro MoovleTV:", e);
        if(grid.innerHTML.includes('Carregando')) grid.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
}

function createCard(item, container) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    // Otimizado para performance no Linux/Mobile
    card.innerHTML = `
        <img src="${IMG_URL + item.poster_path}" loading="lazy" alt="${item.title || item.name}">
        <div class="card-title">${item.title || item.name}</div>
    `;
    card.onclick = () => openPlayer(item);
    container.appendChild(card);
}

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
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <img src="${IMG_URL + item.poster_path}">
                <div class="sug-info">
                    <div class="sug-title">${item.title || item.name}</div>
                </div>
            `;
            div.onclick = () => { 
                openPlayer(item); 
                box.style.display = 'none'; 
                document.getElementById('searchInput').value = ''; 
            };
            box.appendChild(div);
        });
        box.style.display = 'block';
    } catch (e) { console.error(e); }
}

function openPlayer(item) {
    currentItem = item;
    // Identifica se é filme ou série para o embed correto
    currentType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('videoPlayer');
    const titleDisplay = document.getElementById('movieTitleDisplay');
    
    modal.style.display = 'flex';
    if(titleDisplay) titleDisplay.innerText = "CARREGANDO...";
    player.src = ""; // Limpa o player anterior
    
    // Pequeno delay para garantir que o modal abra antes do peso do iframe
    setTimeout(() => {
        if(titleDisplay) titleDisplay.innerText = (item.title || item.name).toUpperCase();
        player.src = `https://vidsrc.me/embed/${currentType}?tmdb=${item.id}`;
    }, 400);

    updateStarUI();
}

function closePlayer() {
    const player = document.getElementById('videoPlayer');
    player.src = ""; 
    document.getElementById('playerModal').style.display = 'none';
}

function filterType(type, el) {
    currentType = type === 'all' ? 'movie' : type;
    currentGenre = ''; // Reseta gênero ao trocar entre Filmes/Séries
    
    // UI Update
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    document.querySelector('.pill:first-child').classList.add('active');
    
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
    const loadBtn = document.getElementById('loadMoreBtn');
    
    if(loadBtn) loadBtn.style.display = 'none';
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    
    grid.innerHTML = favorites.length ? '' : '<p style="padding:20px; color:gray;">Nenhum favorito salvo ainda.</p>';
    favorites.forEach(item => createCard(item, grid));
}

function toggleFavorite() {
    if(!currentItem) return;
    const index = favorites.findIndex(f => f.id === currentItem.id);
    if(index === -1) {
        favorites.push(currentItem);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('moovle_favs', JSON.stringify(favorites));
    updateStarUI();
}

function updateStarUI() {
    if(!currentItem) return;
    const isFav = favorites.some(f => f.id === currentItem.id);
    const starIcon = document.querySelector('#modalFavBtn i');
    if(starIcon) starIcon.style.color = isFav ? "#fbbf24" : "#fff";
}

// Fecha sugestões ao clicar fora (UX de qualidade)
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        const box = document.getElementById('searchSuggestions');
        if(box) box.style.display = 'none';
    }
});
