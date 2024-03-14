const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

let nomeClienteAnterior = ''; // Armazena o nome do cliente antes da edição

document.getElementById('cliente').addEventListener('input', function() {
    document.getElementById('avisoClienteExistente').style.display = 'none';
});

// Função para verificar se já existe um arquivo com o nome do cliente
function verificarClienteExistente(nomeCliente) {
    const pastaClientes = `C:/Users/${process.env.USERNAME}/AppData/Roaming/Formex/Dados do App/Clientes/`;
    const caminhoArquivo = path.join(pastaClientes, nomeCliente + '.txt');
    
    return fs.existsSync(caminhoArquivo) && nomeCliente !== nomeClienteAnterior;
}

// Função para salvar as alterações no cliente
function salvarCliente() {
    const nomeCliente = document.getElementById('cliente').value.trim(); // Remover espaços em branco no início e no final
    // Verifica se o campo de nome está vazio
    if (nomeCliente === '') {
        document.getElementById('avisoAddNome').style.display = 'block';
        return; // Não permite salvar se o nome estiver vazio
    } else {
        document.getElementById('avisoAddNome').style.display = 'none';
    }

    // Verifica se o nome do cliente já existe e não é o mesmo nome anterior
    if (nomeCliente !== nomeClienteAnterior) {
        const clienteExistente = verificarClienteExistente(nomeCliente);
        if (clienteExistente) {
            document.getElementById('avisoClienteExistente').style.display = 'block';
            return; // Não permite salvar se já existe um cliente com o mesmo nome
        }
    }

    const cnpj = document.getElementById('cnpj').value;
    const cep = document.getElementById('cep').value;
    const inscricaoEstadual = document.getElementById('inscricao').value;
    const cidade = document.getElementById('cidade').value;
    const telefone = document.getElementById('fone').value;
    const bairro = document.getElementById('bairro').value;
    const endereco = document.getElementById('endereco').value;

    // Montando os dados no formato do arquivo
    const dados = `Cliente: ${nomeCliente}\nCNPJ: ${cnpj}\nCEP: ${cep}\nBairro: ${bairro}\nInscrição Estadual: ${inscricaoEstadual}\nEndereço: ${endereco}\nCidade: ${cidade}\nFone: ${telefone}`;

    // Adicionando a extensão .txt ao nome do arquivo
    const nomeArquivo = nomeCliente + '.txt';

    // Obtendo o nome do cliente a partir da URL
    const urlParams = new URLSearchParams(window.location.search);
    const cliente = urlParams.get('cliente');

    // Renomeando o arquivo apenas se o nome do cliente foi alterado
    if (nomeCliente !== nomeClienteAnterior) {
        ipcRenderer.send('renomear-arquivo-cliente', { antigoNome: cliente, novoNome: nomeArquivo });
    }

    // Enviando os dados atualizados para o processo principal
    ipcRenderer.send('atualizar-arquivo-cliente', { cliente: nomeArquivo, dados });

    // Atualiza o nome do cliente anterior para o novo nome
    nomeClienteAnterior = nomeCliente;
}



// Ouvindo a resposta do processo principal após atualizar o arquivo do cliente
ipcRenderer.on('cliente-atualizado', (event, clienteAtualizado) => {
    console.log(`Cliente ${clienteAtualizado} atualizado com sucesso.`);
    // Aqui você pode adicionar qualquer outra lógica necessária após a atualização do cliente, como redirecionar para outra página ou exibir uma mensagem de sucesso.
});
