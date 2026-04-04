function openPlayer(item) {
    const type = item.first_air_date ? 'tv' : 'movie';
    const modal = document.getElementById('playerModal');
    const player = document.getElementById('videoPlayer');
    const titleDisplay = document.getElementById('movieTitleDisplay');
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Impede rolar a página de trás
    
    if(titleDisplay) titleDisplay.innerText = "CARREGANDO...";
    player.src = ""; // Reseta o player

    // vidsrc.to é o link mais estável para mobile
    player.src = `https://vidsrc.to/embed/${type}/${item.id}`;
    
    setTimeout(() => {
        if(titleDisplay) titleDisplay.innerText = (item.title || item.name).toUpperCase();
    }, 400);
}

function closePlayer() {
    document.getElementById('videoPlayer').src = ""; 
    document.getElementById('playerModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Reativa rolar a página
}
