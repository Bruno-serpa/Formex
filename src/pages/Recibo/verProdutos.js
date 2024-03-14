// Definir o caminho para a pasta de produtos
const pastaProdutos = `C:/Users/${process.env.USERNAME}/AppData/Roaming/Formex/Dados do App/Produtos`;

let orcamento = 'Produtos';

document.addEventListener('DOMContentLoaded', function () {
    const toggleInput = document.getElementById('toggleInput');
    const textToToggle = document.getElementById('textToToggle');
  
    toggleInput.addEventListener('change', function () {
      if (toggleInput.checked) {
        textToToggle.textContent = 'Orçamento';
        orcamento = 'Orçamento';
      } else {
        textToToggle.textContent = 'Produtos';
        orcamento = 'Produtos';
      }
    });
  });

  const dataEHora = document.getElementById('data').textContent;

// Lista de produtos selecionados na tabela
const produtosSelecionados = [];

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

            // Extrair a imagem do conteúdo do arquivo
            const xhr = new XMLHttpRequest();
            xhr.open('GET', filePath, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const conteudoArquivo = xhr.responseText;

                    // Usar expressões regulares para extrair os valores específicos do arquivo de texto
                    const nomeProduto = conteudoArquivo.match(/Nome do Produto: (.*)/)[1].trim();
                    const valorString = conteudoArquivo.match(/Valor: (.*)/)[1].trim(); // Extrair o valor como uma string
                    const valorLimpo = valorString.replace('R$', '').replace('.', '').replace(',', '.'); // Remover 'R$' e os pontos e substituir ',' por '.'
                    const valorProduto = parseFloat(valorLimpo); // Converter a string para um número
                    const descricaoProduto = conteudoArquivo.match(/Descrição: (.*)/)[1].trim();
                    const imagemBase64 = conteudoArquivo.match(/Imagem: (.*)/)[1].trim();

                    // Criar um elemento de div para o produto
                    const produtoDiv = document.createElement('div');
                    produtoDiv.classList.add('produto');

                    // Construir o caminho completo para a imagem do produto
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
                    nomeProdutoElement.textContent = nomeProduto;

                    // Estilizar o parágrafo
                    nomeProdutoElement.style.flexGrow = 1;
                    produtoDiv.style.width = '250px';
                    produtoDiv.style.cursor = 'pointer';
                    produtoDiv.style.display = 'flex';
                    produtoDiv.style.alignItems = 'center';
                    produtoDiv.style.padding = '5px 10px';
                    produtoDiv.style.margin = '5px 0';
                    produtoDiv.style.border = '1px solid #ccc';
                    produtoDiv.style.borderRadius = '5px';

                    // Adicionar um ouvinte de eventos de clique a cada produto na lista de produtos
                    produtoDiv.addEventListener('click', () => {
                        // Verificar se o produto já foi selecionado
                        const produtoSelecionado = produtosSelecionados.find(item => item.nome === nomeProduto);
                        if (produtoSelecionado) {
                            // Aumentar a quantidade do produto na lista de produtos selecionados
                            produtoSelecionado.quantidade++;

                            // Atualizar a quantidade na tabela
                            const tabelaProdutosSelecionados = document.getElementById('tabelaProdutosSelecionados').querySelector('tbody');
                            const linhaExistente = tabelaProdutosSelecionados.rows[produtosSelecionados.indexOf(produtoSelecionado)];
                            const quantidadeCelula = linhaExistente.cells[3];
                            const totalCelula = linhaExistente.cells[4];
                            quantidadeCelula.textContent = produtoSelecionado.quantidade;

                            // Recalcular o total com base na nova quantidade
                            const novoTotal = produtoSelecionado.quantidade * valorProduto;
                            totalCelula.textContent = `R$ ${novoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            // Chame a função de atualização do total após renderizar a lista de produtos
                           atualizarTotal();
                           atualizarTotalFinal();
                        } else {
                            // Adicionar o produto à lista de produtos selecionados
                            produtosSelecionados.push({ nome: nomeProduto, quantidade: 1, preco: valorString });

                            // Crie uma nova linha na tabela para o produto selecionado
                            const tabelaProdutosSelecionados = document.getElementById('tabelaProdutosSelecionados').querySelector('tbody');
                            const novaLinha = tabelaProdutosSelecionados.insertRow();

                            // Adicione as células à nova linha da tabela
                            const imagemCelula = novaLinha.insertCell();
                            const nomeCelula = novaLinha.insertCell();
                            const precoCelula = novaLinha.insertCell();
                            const quantidadeCelula = novaLinha.insertCell();
                            const totalCelula = novaLinha.insertCell();
                            const excluirCelula = novaLinha.insertCell();

                            // Construir o caminho completo para a imagem do produto
                            const imgTabela = document.createElement('img');
                            imgTabela.src = `data:image/jpeg;base64, ${imagemBase64}`;
                            imgTabela.alt = 'Imagem do Produto';
                            imgTabela.style.width = '50px';
                            imgTabela.style.height = '50px';
                            imgTabela.style.marginRight = '10px';
                            imgTabela.style.borderRadius = '10px';

                            // Defina o conteúdo das células com as informações do produto
                            imagemCelula.appendChild(imgTabela);
                            nomeCelula.textContent = nomeProduto;
                            precoCelula.textContent = `${valorString}`;
                            quantidadeCelula.textContent = '1'; // Você pode definir a quantidade como desejado
                            quantidadeCelula.style.textAlign = 'center'; // Centralizar o conteúdo da célula
                            totalCelula.textContent = `${valorString}`; // O total inicialmente será igual ao preço

                            // Criar um elemento de imagem para o botão de exclusão
                            const imagemExcluirElement = document.createElement('img');
                            imagemExcluirElement.src = '../../images/excluir.png';
                            imagemExcluirElement.alt = 'Remover Produto';
                            imagemExcluirElement.style.width = '20px';
                            imagemExcluirElement.style.height = '20px';
                            imagemExcluirElement.style.cursor = 'pointer';
                            imagemExcluirElement.addEventListener('click', () => {
                                // Remover o produto da lista de produtos selecionados
                                const index = produtosSelecionados.findIndex(item => item.nome === nomeProduto);
                                if (index !== -1) {
                                    produtosSelecionados.splice(index, 1);
                                }

                                // Remover a linha correspondente da tabela
                                novaLinha.remove();

                                // Chame a função de atualização do total após a remoção do produto
                                atualizarTotal();
                                atualizarTotalFinal();
                            });

                            // Adicionar a imagem de exclusão à célula correspondente
                            excluirCelula.appendChild(imagemExcluirElement);

                            // Chame a função de atualização do total após a adição do produto
                            atualizarTotal();
                            atualizarTotalFinal();
                        }
                    });

                    // Adicionar o parágrafo ao elemento da div do produto
                    produtoDiv.appendChild(nomeProdutoElement);

                    // Adicionar a div do produto à lista de produtos
                    listaProdutosElement.appendChild(produtoDiv);
                }
            };

            xhr.send();
        });

        // Ocultar a div de recibos recentes se houver produtos
        recibosRecentesDiv.style.display = produtosFiltrados.length > 0 ? 'none' : 'block';

        // Chame a função de atualização do total após renderizar a lista de produtos
        atualizarTotal();
        atualizarTotalFinal();
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


// Definir a função calcularTotal
function calcularTotal() {
    let total = 0;
    produtosSelecionados.forEach(produto => {
        const totalProduto = parseFloat(produto.preco.replace('R$', '').replace('.', '').replace(',', '.')) * produto.quantidade;
        total += totalProduto;
    });
    return total;
}

// Definir a função atualizarTotal
function atualizarTotal() {
    const total = calcularTotal();
    const paragrafoValorTotal = document.getElementById('valor_total');
    paragrafoValorTotal.textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Definir a função calcularTotalFinal
function calcularTotalFinal() {
    let totalFinal = calcularTotal();
    const freteInput = document.getElementById('frete');
    const freteValue = parseFloat(freteInput.value.replace('R$', '').replace(',', '.'));
    totalFinal += freteValue;

    const descontoInput = document.getElementById('desconto');
    const descontoValue = parseFloat(descontoInput.value.replace('R$', '').replace(',', '.'));
    totalFinal -= descontoValue;

    return totalFinal;
}

// Definir a função atualizarTotalFinal
function atualizarTotalFinal() {
    const totalFinal = calcularTotalFinal();
    const paragrafoValorTotal = document.getElementById('valor_total');
    paragrafoValorTotal.textContent = `R$ ${totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Lidar com alterações nos campos de frete e desconto
const freteInput = document.getElementById('frete');
freteInput.addEventListener('input', () => {
    setTimeout(() => {
        atualizarTotalFinal();
    }, 300); // Espera 300 milissegundos (ou 0.3 segundos) antes de atualizar o total
});

const descontoInput = document.getElementById('desconto');
descontoInput.addEventListener('input', () => {
    setTimeout(() => {
        atualizarTotalFinal();
    }, 100); // Espera 300 milissegundos (ou 0.3 segundos) antes de atualizar o total
});




















// Salvar arquivo .txt

// Função para criar a pasta de destino, se não existir
function criarPastaDestino(caminhoPasta) {
    // Verificar se a pasta existe
    if (!fs.existsSync(caminhoPasta)) {
        // Criar a pasta se não existir
        fs.mkdirSync(caminhoPasta, { recursive: true });
    }
}

// Função para extrair a imagem do conteúdo do arquivo e convertê-la para base64
function extrairImagemBase64(conteudoArquivo) {
    const imagemBase64Match = conteudoArquivo.match(/Imagem: (.*)/);
    if (imagemBase64Match) {
        return imagemBase64Match[1].trim();
    }
    return null;
}

// Função para salvar os dados em um arquivo de texto
function salvarDadosEmArquivo(dados) {
    // Construir o caminho completo para a pasta e o arquivo
    const pastaRecibos = `C:/Users/${process.env.USERNAME}/AppData/Roaming/Formex/Dados do App/Recibos`;
    const nomeArquivo = `recibo_${new Date().getTime()}.txt`;
    const caminhoPasta = path.join(pastaRecibos);

    // Criar a pasta de destino, se não existir
    criarPastaDestino(caminhoPasta);

    const caminhoArquivo = path.join(caminhoPasta, nomeArquivo);

    // Converter os dados em formato de texto
    let textoDados = '';

    // Adicionar o status do orçamento
    textoDados += `Orcamento: ${dados.orcamento}\n`;
    textoDados += `Data: ${dados.data}\n\n`;

    // Adicionar os dados do cliente
    textoDados += `cliente: ${dados.cliente}\n`;
    textoDados += `CNPJ: ${dados.cnpj}\n`;
    textoDados += `CEP: ${dados.cep}\n`;
    textoDados += `Inscrição: ${dados.inscricao}\n`;
    textoDados += `Cidade: ${dados.cidade}\n`;
    textoDados += `Fone: ${dados.fone}\n`;
    textoDados += `Bairro: ${dados.bairro}\n`;
    textoDados += `Endereço: ${dados.endereco}\n\n`;

    // Adicionar os dados dos produtos selecionados
    textoDados += '--- Produtos ---\n';
    dados.produtos.forEach((produto) => {
        textoDados += `Nome: ${produto.nome}\n`;
        textoDados += `Preço: ${produto.preco}\n`;
        textoDados += `Quantidade: ${produto.quantidade}\n`;
        textoDados += `Total: ${produto.total}\n`;
        textoDados += `Imagem: ${produto.imagemBase64}\n\n`;
    });

    // Adicionar os dados de frete, desconto e valor total
    textoDados += 'Frete: ' + dados.frete + '\n';
    textoDados += 'Desconto: ' + dados.desconto + '\n';
    textoDados += 'Valor: ' + dados.valorTotal + '\n';

    // Escrever os dados em um arquivo de texto
    fs.writeFile(caminhoArquivo, textoDados, (err) => {
        if (err) {
            console.error('Erro ao salvar o arquivo:', err);
            return;
        }
        console.log('Arquivo salvo com sucesso:', caminhoArquivo);
        // Após salvar o arquivo, redirecione para a página verRecibo.html com o caminho do arquivo como parâmetro de consulta na URL
        window.location.href = `verRecibo.html?caminho=${encodeURIComponent(caminhoArquivo)}`;
    });
}

// Função para coletar todos os dados da página
function coletarDadosPagina() {
    const dados = {};

    // Coletar os dados do cliente
    dados.cliente = document.getElementById('cliente').value;
    dados.cnpj = document.getElementById('cnpj').value;
    dados.cep = document.getElementById('cep').value;
    dados.inscricao = document.getElementById('inscricao').value;
    dados.cidade = document.getElementById('cidade').value;
    dados.fone = document.getElementById('fone').value;
    dados.bairro = document.getElementById('bairro').value;
    dados.endereco = document.getElementById('endereco').value;

    // Coletar os dados dos produtos selecionados na tabela
    const tabelaProdutos = document.getElementById('tabelaProdutosSelecionados').querySelectorAll('tbody tr');
    dados.produtos = [];
    tabelaProdutos.forEach((linha) => {
        const produto = {
            nome: linha.cells[1].textContent,
            preco: linha.cells[2].textContent,
            quantidade: linha.cells[3].textContent,
            total: linha.cells[4].textContent,
            imagemBase64: linha.cells[0].querySelector('img').src.replace('data:image/jpeg;base64,', '') // Extrair a imagem em base64
        };
        dados.produtos.push(produto);
    });

    // Coletar o status do orçamento
    dados.orcamento = orcamento;

    // Coletar o status do orçamento
    dados.data = dataEHora;

    // Coletar os dados de frete, desconto e valor total
    dados.frete = document.getElementById('frete').value;
    dados.desconto = document.getElementById('desconto').value;
    dados.valorTotal = document.getElementById('valor_total').textContent;

    return dados;
}

// Seletor para o botão "Salvar"
const botaoSalvar = document.querySelector('button[type="button"]');

// Adicionar evento de clique ao botão "Salvar"
botaoSalvar.addEventListener('click', () => {
    // Coletar todos os dados da página
    const dados = coletarDadosPagina();

    // Chamar função para salvar os dados em um arquivo de texto
    salvarDadosEmArquivo(dados);
});
