const { ipcRenderer } = require('electron');

document.getElementById('nome').addEventListener('input', function() {
    document.getElementById('avisoNomeExistente').style.display = 'none';
});


function limparCampos() {
    document.getElementById('nome').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('imagem').value = '';
    var imgPadrao = document.getElementById('previewImagem');
    imgPadrao.setAttribute('src', '../../images/add-imagem.jpeg'); // Definir a imagem padrão
}

function salvarDados() {
    const nome = document.getElementById('nome').value;
    const valor = document.getElementById('valor').value;
    const descricao = document.getElementById('descricao').value;

    const imagemInput = document.getElementById('imagem');

    // Verificar se o nome do arquivo já existe
    const nomeArquivo = `${nome}.txt`;
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', `C:/Users/${process.env.USERNAME}/AppData/Roaming/Formex/Dados do App/Produtos/${nomeArquivo}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Se o arquivo já existe, exibir uma mensagem de erro
                document.getElementById('avisoNomeExistente').style.display = 'block';
                return false; // Retornar false para interromper o envio do formulário
            } 
            // Se o arquivo não existe, continuar salvando o novo produto
            // Salvando a imagem em base64
            if (imagemInput.files.length > 0) {
                const file = imagemInput.files[0];
                const reader = new FileReader();

                reader.onload = () => {
                    const imagemData = reader.result.split(',')[1];
                    const data = `Nome do Produto: ${nome}\nValor: ${valor}\nDescrição: ${descricao}\nImagem: ${imagemData}\n`;

                    ipcRenderer.send('salvar-produtos', { data, nomeArquivo });
                    limparCampos(); // Limpar os campos após o envio bem-sucedido
                };

                reader.readAsDataURL(file);
            } else {
                const data = `Nome do Produto: ${nome}\nValor: ${valor}\nDescrição: ${descricao}\nImagem: (sem imagem)\n`;

                ipcRenderer.send('salvar-produtos', { data, nomeArquivo });
                limparCampos(); // Limpar os campos após o envio bem-sucedido
            }
        }
    };
    xhr.send();
    return false; // Retornar false para interromper o envio do formulário
}
