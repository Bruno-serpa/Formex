const fs = require('fs');

// Extrair o caminho do arquivo de recibo da URL
const urlParams = new URLSearchParams(window.location.search);
const caminhoArquivoRecibo = urlParams.get('caminho');

console.log('Caminho do arquivo de recibo:', caminhoArquivoRecibo);

// Função para ler os dados do arquivo de recibo
function lerDadosDoArquivo(caminhoArquivo) {
    return new Promise((resolve, reject) => {
        fs.readFile(caminhoArquivo, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

// Função para preencher os campos na página com os dados do recibo
function preencherCampos(dadosRecibo) {
    // Preencher os campos de frete, desconto e total do pedido
    document.getElementById('frete').value = dadosRecibo.frete || '';
    document.getElementById('desconto').value = dadosRecibo.desconto || '';
    document.getElementById('valor_total').value = dadosRecibo.valorTotal || '';

    document.getElementById('cliente').value = dadosRecibo.cliente || '';
    document.getElementById('cnpj').value = dadosRecibo.cnpj || '';
    document.getElementById('cep').value = dadosRecibo.cep || '';
    document.getElementById('inscricao').value = dadosRecibo.inscricao || '';
    document.getElementById('cidade').value = dadosRecibo.cidade || '';
    document.getElementById('fone').value = dadosRecibo.fone || '';
    document.getElementById('bairro').value = dadosRecibo.bairro || '';
    document.getElementById('endereco').value = dadosRecibo.endereco || '';

    // Preencher os produtos na tabela
    const tabelaProdutos = document.getElementById('tabelaProdutosSelecionados').querySelector('tbody');
    tabelaProdutos.innerHTML = ''; // Limpar a tabela antes de preencher os produtos novamente

    dadosRecibo.produtos.forEach((produto) => {
        const novaLinha = tabelaProdutos.insertRow();

        // Adicionar célula para a imagem
        const imagemCell = novaLinha.insertCell();
        const imagemProduto = document.createElement('img');
        if (produto.imagemBase64) {
            imagemProduto.src = `data:image/jpeg;base64,${produto.imagemBase64}`;
        }
        imagemCell.appendChild(imagemProduto);

        // Adicionar células para os outros dados do produto
        const nomeCell = novaLinha.insertCell();
        nomeCell.textContent = produto.nome || '';

        const precoCell = novaLinha.insertCell();
        precoCell.textContent = produto.preco || '';

        const quantidadeCell = novaLinha.insertCell();
        quantidadeCell.textContent = produto.quantidade || '';

        const totalCell = novaLinha.insertCell();
        totalCell.textContent = produto.total || '';
    });

    // Preencher o valor do orçamento
    document.getElementById('orc_prod').textContent = `${dadosRecibo.orcamento}`;

    // Preencher a data
    document.getElementById('data').textContent = `${dadosRecibo.data.replace(/;/g, ':')}`;
}

function parsearDados(data) {
    const linhas = data.split('\n');
    if (linhas.length < 14) {
        return null;
    }

    const dados = {
        cliente: '',
        cnpj: '',
        cep: '',
        inscricao: '',
        cidade: '',
        fone: '',
        bairro: '',
        endereco: '',
        produtos: [],
        frete: '',
        desconto: '',
        valorTotal: ''
    };

    let secaoProdutos = false; // Variável para verificar se estamos na seção de produtos

    linhas.forEach((linha, index) => {
        if (linha.startsWith('Orcamento:')) {
            dados.orcamento = linha.split(':')[1]?.trim();
        } else if (linha.startsWith('Data:')) {
            dados.data = linha.split(':')[1]?.trim();
        } else if (linha.startsWith('cliente:')) {
            dados.cliente = linha.split(':')[1]?.trim();
        } else if (linha.startsWith('CNPJ:')) {
            dados.cnpj = linha.split(':')[1]?.trim();
        } else if (linha.startsWith('CEP:')) {
            dados.cep = linha.split(':')[1]?.trim();
        } else if (linha.startsWith('Inscrição:')) {
            dados.inscricao = linha.split(':')[1]?.trim();
        } else if (linha.startsWith('Cidade:')) {
            dados.cidade = linha.split(':')[1]?.trim();
        } else if (linha.startsWith('Fone:')) {
            dados.fone = linha.split(':')[1]?.trim();
        } else if (linha.startsWith('Bairro:')) {
            dados.bairro = linha.split(':')[1]?.trim();
        } else if (linha.startsWith('Endereço:')) {
            dados.endereco = linha.split(':')[1]?.trim();
        } else if (linha.startsWith('--- Produtos ---')) {
            secaoProdutos = true; // Entramos na seção de produtos
        } else if (secaoProdutos && linha.startsWith('Frete:')) {
            dados.frete = linha.split(':')[1]?.trim();
        } else if (secaoProdutos && linha.startsWith('Desconto:')) {
            dados.desconto = linha.split(':')[1]?.trim();
        } else if (secaoProdutos && linha.startsWith('Valor:')) {
            dados.valorTotal = linha.split(':')[1]?.trim();
        } else if (secaoProdutos && linha.trim() !== '') {
            // Verificar se a linha atual contém dados de um produto
            if (linhas[index - 1].startsWith('--- Produtos ---') || linhas[index - 1].trim() === '') {
                const produto = {
                    nome: linha.split(':')[1]?.trim(),
                    preco: linhas[index + 1].split(':')[1]?.trim(),
                    quantidade: linhas[index + 2].split(':')[1]?.trim(),
                    total: linhas[index + 3].split(':')[1]?.trim(),
                    imagemBase64: linhas[index + 4].split(':')[1]?.trim() // Adicionamos aqui a extração da imagem em base64
                };
                dados.produtos.push(produto);
            }
        }
    });

    return dados;
}

// Função para ler os dados do arquivo de recibo e preencher os campos na página
function lerEpreencherCampos(caminhoArquivo) {
    lerDadosDoArquivo(caminhoArquivo)
        .then((data) => {
            const dadosRecibo = parsearDados(data);
            if (dadosRecibo) {
                preencherCampos(dadosRecibo);
            } else {
                console.error('Erro ao analisar os dados do recibo');
            }
        })
        .catch((err) => {
            console.error('Erro ao ler o arquivo de recibo:', err);
        });
}

// Chamada da função para ler e preencher os campos
lerEpreencherCampos(caminhoArquivoRecibo);
