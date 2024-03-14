// Selecionar todos os campos de entrada
const campos = document.querySelectorAll('.add-dados');

// Adicionar evento de escuta de teclado a cada campo de entrada
campos.forEach((campo, index) => {
    campo.addEventListener('keypress', (event) => {
        // Verificar se a tecla pressionada é "Enter" (código 13)
        if (event.key === 'Enter') {
            // Impedir o envio do formulário padrão
            event.preventDefault();

            // Mover o foco para o próximo campo de entrada, se não for o último
            if (index < campos.length - 1) {
                const proximoCampo = campos[index + 1];
                proximoCampo.focus();
            } else {
                // Se for o último campo, chamar a função salvarCliente()
                salvarCliente();
            }
        }
    });
});
