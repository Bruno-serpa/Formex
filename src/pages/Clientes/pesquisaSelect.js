document.addEventListener('DOMContentLoaded', function() {
    const searchIcon = document.getElementById('searchIcon');
    const inputPesquisa = document.getElementById('inputPesquisa');

    // Adiciona um evento de clique à imagem
    searchIcon.addEventListener('click', function() {
        // Define o foco no input quando a imagem é clicada
        inputPesquisa.focus();
    });
});
