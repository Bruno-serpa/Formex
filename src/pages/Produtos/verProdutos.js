const { ipcRenderer } = require('electron');
const path = require('path'); // Importar o módulo path para lidar com caminhos de arquivo

// Definir o caminho para a pasta de produtos
const pastaProdutos = `C:/Users/${process.env.USERNAME}/AppData/Roaming/Formex/Dados do App/Produtos`;

// Solicitar lista de produtos ao processo principal
ipcRenderer.send('listar-produtos');

// Lidar com a resposta do processo principal
ipcRenderer.on('produtos-listados', (event, produtos) => {
    const listaProdutosElement = document.getElementById('listaProdutos');
    const recibosRecentesDiv = document.querySelector('.recibos-recentes');
    const inputPesquisa = document.getElementById('inputPesquisa');

    // Função para renderizar a lista de produtos com base no termo de pesquisa
    function renderizarLista(produtosFiltrados) {
        listaProdutosElement.innerHTML = '';

        produtosFiltrados.forEach((produto) => {
            // Remover a extensão .txt do nome do arquivo
            const nomeArquivo = path.parse(produto).name; // Usar o método path.parse() para obter o nome do arquivo sem a extensão

            // Criar um elemento de div para o produto
            const produtoDiv = document.createElement('div');
            produtoDiv.classList.add('produto');

            // Construir o caminho completo para o arquivo
            const filePath = path.join(pastaProdutos, produto);
            console.log('Caminho completo do arquivo:', filePath); // Adicionar um console.log para verificar o caminho

            // Extrair a imagem do conteúdo do arquivo
            const xhr = new XMLHttpRequest();
            xhr.open('GET', filePath, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const conteudoArquivo = xhr.responseText;

                    // Extrair a imagem do conteúdo do arquivo
                    const imagemBase64 = conteudoArquivo.match(/Imagem: (.*)/)[1].trim();

                    // Criar um elemento de imagem para exibir a imagem do produto
                    const imagemProdutoElement = document.createElement('img');
                    imagemProdutoElement.src = `data:image/jpeg;base64, ${imagemBase64}`;
                    imagemProdutoElement.alt = 'Imagem do Produto';
                    imagemProdutoElement.style.width = '50px';
                    imagemProdutoElement.style.height = '50px';
                    imagemProdutoElement.style.marginRight = '10px';
                    imagemProdutoElement.style.borderRadius = '10px';

                    // Adicionar a imagem ao elemento da div do produto
                    produtoDiv.appendChild(imagemProdutoElement);

                    // Criar um elemento de parágrafo para exibir o nome do produto
                    const nomeProdutoElement = document.createElement('p');
                    nomeProdutoElement.textContent = nomeArquivo;

                    // Estilizar o parágrafo
                    nomeProdutoElement.style.flexGrow = 1;
                    produtoDiv.style.cursor = 'pointer';
                    produtoDiv.style.display = 'flex';
                    produtoDiv.style.alignItems = 'center';
                    produtoDiv.style.padding = '5px 10px';
                    produtoDiv.style.margin = '5px 0';
                    produtoDiv.style.border = '1px solid #ccc';
                    produtoDiv.style.borderRadius = '5px';

                    // Adicionar evento de clique para lidar com o nome do arquivo clicado
                    produtoDiv.addEventListener('click', () => {
                        // Redirecionar para a página de detalhes do produto com o nome do arquivo como parâmetro
                        window.location.href = `detalhes-produto.html?produto=${produto}`;
                    });

                    // Adicionar o parágrafo ao elemento da div do produto
                    produtoDiv.appendChild(nomeProdutoElement);

                    // Criar um botão de exclusão
                    const botaoExcluir = document.createElement('img');
                    botaoExcluir.src = '../../images/excluir.png';
                    botaoExcluir.style.width = '20px';
                    botaoExcluir.style.height = '20px';
                    botaoExcluir.style.cursor = 'pointer';
                    botaoExcluir.addEventListener('click', (event) => {
                        event.stopPropagation(); // Impedir a propagação do evento para o elemento pai (div do produto)
                        excluirProduto(nomeArquivo);
                    });

                    // Adicionar o botão de exclusão à div do produto
                    produtoDiv.appendChild(botaoExcluir);

                    // Adicionar a div do produto à lista de produtos
                    listaProdutosElement.appendChild(produtoDiv);
                }
            };

            xhr.send();
        });

        // Ocultar a div de recibos recentes se houver produtos
        recibosRecentesDiv.style.display = produtosFiltrados.length > 0 ? 'none' : 'block';
    }

    // Lidar com a entrada do usuário no campo de pesquisa
    inputPesquisa.addEventListener('input', () => {
        const termoPesquisa = inputPesquisa.value.toLowerCase();
        const produtosFiltrados = produtos.filter(produto => produto.toLowerCase().includes(termoPesquisa));
        renderizarLista(produtosFiltrados);
    });

    // Renderizar a lista de produtos inicialmente
    renderizarLista(produtos);
});

// Função para excluir o produto
function excluirProduto(nomeArquivo) {
    // Solicitar ao processo principal para excluir o arquivo
    ipcRenderer.send('excluir-produto', nomeArquivo);
    
    // Após excluir o produto, atualizar a lista de produtos
    ipcRenderer.send('listar-produtos');

    // Limpar o campo de pesquisa
    inputPesquisa.value = '';
}
