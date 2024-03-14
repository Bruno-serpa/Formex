window.addEventListener('load', function() {
    const valorInput = document.getElementById('valor');

    valorInput.addEventListener('input', function(event) {
        // Remove caracteres não numéricos
        let valorSemMascara = event.target.value.replace(/\D/g, '');

        // Adiciona a máscara (formato de moeda, por exemplo)
        valorSemMascara = (Number(valorSemMascara) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Define o valor formatado no campo de entrada
        event.target.value = valorSemMascara;
    });
});