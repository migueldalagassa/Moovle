function openPlayer(id, title, type) {
    const modal = document.getElementById('playerModal');
    const iframe = document.getElementById('videoPlayer');
    const titleDisplay = document.getElementById('movieTitleDisplay');

    titleDisplay.innerText = title.toUpperCase();
    
    // Define a URL apenas para Vidsrc
    let url = "";
    if (type === 'movie') {
        url = `https://vidsrc.me/embed/movie?tmdb=${id}&lang=pt`;
    } else {
        url = `https://vidsrc.me/embed/tv?tmdb=${id}&lang=pt`;
    }

    iframe.src = url;
    modal.style.display = 'flex';
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    const iframe = document.getElementById('videoPlayer');
    iframe.src = ""; // Para o som do filme ao fechar
    modal.style.display = 'none';
}
