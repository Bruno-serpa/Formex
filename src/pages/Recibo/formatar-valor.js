window.addEventListener('load', function() {
    const valorInput = document.getElementById('frete');

    valorInput.addEventListener('input', function(event) {
        // Remove caracteres não numéricos
        let valorSemMascara = event.target.value.replace(/\D/g, '');

        // Adiciona a máscara (formato de moeda, por exemplo)
        valorSemMascara = (Number(valorSemMascara) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Define o valor formatado no campo de entrada
        event.target.value = valorSemMascara;
    });

    const valorInput2 = document.getElementById('desconto');

    valorInput2.addEventListener('input', function(event) {
        // Remove caracteres não numéricos
        let valorSemMascara = event.target.value.replace(/\D/g, '');

        // Adiciona a máscara (formato de moeda, por exemplo)
        valorSemMascara = (Number(valorSemMascara) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Define o valor formatado no campo de entrada
        event.target.value = valorSemMascara;
    });
});