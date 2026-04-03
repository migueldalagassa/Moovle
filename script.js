const API_KEY = '7dc850a67b09d8b2f84f78b53deecf5b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentType = 'movie'; 

window.onload = () => {
    const savedUser = localStorage.getItem('moovle_user');
    if(savedUser) document.getElementById('userDisplay').innerText = savedUser.split('@')[0].toUpperCase();
    loadMovies();
};

async function loadMovies(genreId = '') {
    const grid = document.getElementById('mainGrid');
    const endpoint = genreId ? `/discover/${currentType}?with_genres=${genreId}` : `/${currentType}/popular?`;
    
    try {
        const res = await fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}&language=pt-BR`);
        const data = await res.json();
        
        grid.innerHTML = '';
        data.results.forEach(item => {
            if(!item.poster_path) return;
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="${IMG_URL + item.poster_path}" alt="${item.title || item.name}">
                <div style="padding:10px; font-size:12px; text-align:center; font-weight:600; color:#cbd5e1;">
                    ${(item.title || item.name).substring(0, 25)}
                </div>
            `;
            
            // Abre o player ao clicar
            card.onclick = () => openPlayer(item.id);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar:", error);
    }
}

function openPlayer(id) {
    const modal = document.getElementById('playerModal');
    const iframe = document.getElementById('videoPlayer');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Define a URL do Player (Embed)
    let videoUrl = "";
    if(currentType === 'movie') {
        videoUrl = `https://vidsrc.xyz/embed/movie?tmdb=${id}`;
    } else {
        videoUrl = `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=1&episode=1`;
    }

    // Configura o Botão de Download (Link externo de busca por TMDB ID)
    downloadBtn.onclick = () => {
        window.open(`https://getpvid.xyz/download?tmdb=${id}`, '_blank');
    };

    iframe.src = videoUrl;
    modal.style.display = 'flex';
}

function closePlayer() {
    document.getElementById('playerModal').style.display = 'none';
    document.getElementById('videoPlayer').src = ""; 
}

function filterType(type, btn) {
    currentType = type === 'all' ? 'movie' : type;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('shelfTitle').innerText = type === 'tv' ? 'SÉRIES EM ALTA' : 'RECOMENDADOS PARA VOCÊ';
    loadMovies();
}

function filterGenre(id, btn) {
    document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadMovies(id);
}

async function searchMovies() {
    const query = document.getElementById('searchInput').value;
    if(query.length < 3) return;
    const res = await fetch(`${BASE_URL}/search/multi?query=${query}&api_key=${API_KEY}&language=pt-BR`);
    const data = await res.json();
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = '';
    data.results.forEach(item => {
        if(!item.poster_path) return;
        const div = document.createElement('div');
        div.className = 'movie-card';
        div.innerHTML = `<img src="${IMG_URL + item.poster_path}">`;
        div.onclick = () => openPlayer(item.id);
        grid.appendChild(div);
    });
}

// Funções de Login
function openAuth() { document.getElementById('authModal').style.display = 'flex'; }
function closeAuth() { document.getElementById('authModal').style.display = 'none'; }
function doLogin() {
    const email = document.getElementById('emailField').value;
    if(email) {
        localStorage.setItem('moovle_user', email);
        document.getElementById('userDisplay').innerText = email.split('@')[0].toUpperCase();
        closeAuth();
    }
}