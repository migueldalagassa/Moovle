// CONFIGURAÇÕES DA API (The Movie DB)
const API_KEY = '7dc850a67b09d8b2f84f78b53deecf5b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w200'; // w200 é leve para carregar rápido no celular

// VARIÁVEIS DE CONTROLE
let favorites = JSON.parse(localStorage.getItem('moovle_favs')) || []; // Carrega favoritos salvos no navegador
let currentItem = null;  // Guarda o filme/série que está aberto no player no momento
let currentType = 'movie'; // 'movie' para filmes, 'tv' para séries
let currentPage = 1;     // Controla qual página da API estamos vendo
let currentGenre = '';   // Guarda o gênero selecionado nos botões (pills)

// Inicia o site carregando os filmes populares
window.onload = () => loadMovies();

// FUNÇÃO PRINCIPAL: Busca filmes na API e coloca na tela
async function loadMovies(isNext = false) {
    const grid = document.getElementById('mainGrid');
    const loadBtn = document.getElementById('loadMoreBtn');
    
    // Se não for "carregar mais", limpa a tela e volta para a página 1
    if (!isNext) { 
        currentPage = 1; 
        grid.innerHTML = ''; 
    } else {
        loadBtn.innerText = "CARREGANDO...";
    }

    // Monta a URL dependendo se há um gênero escolhido ou se é busca geral
    let url = `${BASE_URL}/${currentType}/popular?api_key=${API_KEY}&language=pt-BR&page=${currentPage}`;
    if (currentGenre) {
        let genreQuery = currentGenre === 'anime' ? 'with_genres=16&with_origin_country=JP' : `with_genres=${currentGenre}`;
        url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&${genreQuery}&language=pt-BR&page=${currentPage}&sort_by=popularity.desc`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        // Para cada resultado, cria um quadradinho (card) no site
        data.results.forEach(item => { if(item.poster_path) createCard(item); });
        
        currentPage++; // Prepara para a próxima página
        if(loadBtn) {
            loadBtn.innerText = "CARREGAR MAIS";
            loadBtn.style.display = data.results.length ? 'inline-block' : 'none';
        }
    } catch (e) {
        console.error("Erro ao carregar filmes:", e);
    }
}

// FUNÇÃO: Cria o HTML do cartaz do filme
function createCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const title = item.title || item.name;
    // 'loading="lazy"' faz com que a imagem só baixe quando aparecer na tela (economiza dados)
    card.innerHTML = `<img src="${IMG_URL + item.poster_path}" alt="${title}" loading="lazy">`;
    card.onclick = () => openPlayer(item);
    document.getElementById('mainGrid').appendChild(card);
}

// FUNÇÃO: Acionada ao apertar ENTER no campo de busca
async function handleSearchSubmit() {
    const query = document.getElementById('searchInput').value;
    if (query.length < 2) return;

    // Fecha as sugestões e esconde o teclado no celular
    document.getElementById('searchSuggestions').style.display = 'none';
    document.getElementById('searchInput').blur();

    const grid = document.getElementById('mainGrid');
    const title = document.getElementById('shelfTitle');

    grid.innerHTML = '<p style="padding:20px; color:var(--accent);">Buscando...</p>';
    title.innerText = `RESULTADOS: ${query.toUpperCase()}`;

    try {
        const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${query}`);
        const data = await res.json();
        grid.innerHTML = '';
        
        const results = data.results.filter(i => i.poster_path && i.media_type !== 'person');
        if(results.length === 0) {
            grid.innerHTML = '<p style="padding:20px; color:gray;">Nenhum resultado encontrado.</p>';
        } else {
            results.forEach(item => createCard(item));
        }
    } catch (e) {
        grid.innerHTML = '<p style="padding:20px; color:red;">Erro na conexão.</p>';
    }
}

// FUNÇÃO: Busca rápida (Sugestões que aparecem enquanto você digita)
async function handleSearchInput(query) {
    const box = document.getElementById('searchSuggestions');
    if (query.length < 2) { box.style.display = 'none'; return; }
    
    try {
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
                <img src="${IMG_URL + item.poster_path}">
                <div class="sug-info">
                    <div class="sug-title">${item.title || item.name}</div>
                    <div class="sug-meta">
                        <span class="sug-tag">${type}</span>
                        <span>${year}</span>
                    </div>
                </div>`;
            div.onclick = () => { openPlayer(item); box.style.display = 'none'; };
            box.appendChild(div);
        });
        box.style.display = 'block';
    } catch(e) {}
}

// FUNÇÃO: Abre o player e monta o link do vídeo
function openPlayer(item) {
    currentItem = item;
    // Verifica se é série ou filme para montar o link do player corretamente
    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const modal = document.getElementById('playerModal');
    
    document.getElementById('movieTitleDisplay').innerText = (item.title || item.name).toUpperCase();
    document.getElementById('movieDescription').innerText = item.overview || "Sem descrição disponível.";
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Trava o scroll da página atrás do modal

    // URL do Player (VidSrc é um dos mais usados para streaming gratuito)
    const videoUrl = `https://vidsrc.me/embed/${type}?tmdb=${item.id}&color=0062ff`;
    document.getElementById('videoPlayer').src = videoUrl;
    
    updateStarUI();
}

// FUNÇÃO: Fecha o player e limpa o iframe para parar o som do vídeo
function closePlayer() {
    document.getElementById('videoPlayer').src = "";
    document.getElementById('playerModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Libera o scroll novamente
}

// FUNÇÃO: Filtra por categorias (Ação, Terror, etc)
function filterGenre(id, btn) {
    currentGenre = id;
    // Remove a cor azul de todos os botões e coloca apenas no que foi clicado
    document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('shelfTitle').innerText = btn.innerText.toUpperCase();
    loadMovies();
}

// FUNÇÃO: Alterna entre seção de FILMES ou SÉRIES no menu lateral
function filterType(type, el) {
    currentType = type === 'all' ? 'movie' : type;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    loadMovies();
}

// FUNÇÃO: Adiciona ou remove da lista de Favoritos (salva no navegador)
function toggleFavorite() {
    const idx = favorites.findIndex(f => f.id === currentItem.id);
    if (idx === -1) {
        favorites.push(currentItem);
    } else {
        favorites.splice(idx, 1);
    }
    localStorage.setItem('moovle_favs', JSON.stringify(favorites));
    updateStarUI();
}

// FUNÇÃO: Muda a cor da estrelinha se o filme for favorito
function updateStarUI() {
    const isFav = favorites.some(f => f.id === currentItem.id);
    document.querySelector('#modalFavBtn i').style.color = isFav ? "#fbbf24" : "#fff";
}

// FUNÇÃO: Mostra apenas os filmes que o usuário favoritou
function showFavorites(el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = favorites.length ? '' : '<p style="padding:20px; color:gray;">Nenhum favorito salvo.</p>';
    favorites.forEach(item => createCard(item));
    document.getElementById('loadMoreBtn').style.display = 'none';
}

// Fecha as sugestões de busca se clicar em qualquer lugar fora da caixa
document.addEventListener('click', (e) => { 
    if (!e.target.closest('.search-box')) document.getElementById('searchSuggestions').style.display = 'none'; 
});
