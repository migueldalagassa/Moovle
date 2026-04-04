const API_KEY = '7dc850a67b09d8b2f84f78b53deecf5b';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300';
let currentType = 'movie', currentGenre = '', currentPage = 1;

window.onload = () => loadMovies();

async function loadMovies(isNext = false) {
    if (!isNext) { currentPage = 1; document.getElementById('mainGrid').innerHTML = ''; }
    let url = `${BASE_URL}/discover/${currentType}?api_key=${API_KEY}&language=pt-BR&page=${currentPage}&sort_by=popularity.desc`;
    if (currentGenre === 'anime') url += '&with_genres=16&with_origin_country=JP';
    else if (currentGenre) url += `&with_genres=${currentGenre}`;

    const res = await fetch(url);
    const data = await res.json();
    data.results.forEach(item => createCard(item));
    currentPage++;
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `<img src="${IMG_URL + item.poster_path}" alt="poster">`;
    card.onclick = () => openPlayer(item);
    document.getElementById('mainGrid').appendChild(card);
}

function openPlayer(item) {
    const type = item.first_air_date ? 'tv' : 'movie';
    document.getElementById('playerModal').style.display = 'flex';
    document.getElementById('movieTitleDisplay').innerText = (item.title || item.name).toUpperCase();
    document.getElementById('movieDescription').innerText = item.overview || "";
    // vidsrc.to é o link mais estável para evitar erros no celular
    document.getElementById('videoPlayer').src = `https://vidsrc.to/embed/${type}/${item.id}`;
}

function closePlayer() {
    document.getElementById('playerModal').style.display = 'none';
    document.getElementById('videoPlayer').src = "";
}

function filterGenre(id, btn) {
    currentGenre = id;
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    loadMovies();
}

function filterType(type, btn) {
    currentType = type === 'all' ? 'movie' : type;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    btn.classList.add('active');
    loadMovies();
}
