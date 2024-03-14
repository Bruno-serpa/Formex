document.addEventListener('DOMContentLoaded', () => {
    const inputImagem = document.getElementById('imagem');
    const previewImagem = document.getElementById('previewImagem');

    inputImagem.addEventListener('change', (event) => {
        previewImage(event.target);
    });

    function previewImage(input) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            previewImagem.src = e.target.result;
        };

        if (file) {
            reader.readAsDataURL(file);
        } else {
            previewImagem.src = '../../images/add-imagem.jpeg'; // Limpa a preview se não houver imagem selecionada
        }
    }
});
