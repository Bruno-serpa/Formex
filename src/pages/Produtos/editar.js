const { ipcRenderer } = require('electron');

document.getElementById('nomeProduto').addEventListener('input', function() {
    document.getElementById('avisoNomeExistente').style.display = 'none';
});

function carregarImagem() {
    const input = document.getElementById('inputImagem');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imagem = e.target.result;
            document.getElementById('imagemProduto').src = imagem;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function salvarProduto() {
    // Obter os valores dos campos
    const nomeProduto = document.getElementById('nomeProduto').value;
    let nomeAntigo = document.getElementById('nomeArquivoAtual').value;
    console.log(nomeAntigo);
    const valorProduto = document.getElementById('valorProduto').value;
    const descricaoProduto = document.getElementById('descricaoProduto').value;
    let imagemBase64 = document.getElementById('imagemProduto').src.split(',')[1]; // Obtém apenas o conteúdo base64 da imagem

    // Verificar se o nome do arquivo já existe
    const novoNomeArquivo = nomeProduto + '.txt';
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', `C:/Users/${process.env.USERNAME}/AppData/Roaming/Formex/Dados do App/Produtos/${novoNomeArquivo}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 && nomeProduto == nomeAntigo) {
                // Atualizar os dados no arquivo
                nomeAntigo = document.getElementById('nomeProduto').value;
                document.getElementById('nomeArquivoAtual').value = document.getElementById('nomeProduto').value;
                console.log(nomeAntigo);
                const dadosAtualizados = `Nome do Produto: ${nomeProduto}\nValor: ${valorProduto}\nDescrição: ${descricaoProduto}\nImagem: ${imagemBase64}`;
                ipcRenderer.send('atualizar-arquivo', { produto, dados: dadosAtualizados, novoNome: novoNomeArquivo });

                // Renomear o arquivo com o novo nome do produto
                ipcRenderer.send('renomear-arquivo', { antigoNome: produto, novoNome: novoNomeArquivo });
            } else if(xhr.status === 200 && nomeProduto !== nomeAntigo) {
                document.getElementById('avisoNomeExistente').style.display = 'block';
            } else {
                // Atualizar os dados no arquivo
                nomeAntigo = document.getElementById('nomeProduto').value;
                document.getElementById('nomeArquivoAtual').value = document.getElementById('nomeProduto').value;
                console.log(nomeAntigo);
                const dadosAtualizados = `Nome do Produto: ${nomeProduto}\nValor: ${valorProduto}\nDescrição: ${descricaoProduto}\nImagem: ${imagemBase64}`;
                ipcRenderer.send('atualizar-arquivo', { produto, dados: dadosAtualizados, novoNome: novoNomeArquivo });

                // Renomear o arquivo com o novo nome do produto
                ipcRenderer.send('renomear-arquivo', { antigoNome: produto, novoNome: novoNomeArquivo });
            }
        }
    };
    xhr.send();
}

