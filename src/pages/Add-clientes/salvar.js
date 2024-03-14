const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('cliente').addEventListener('input', function() {
        document.getElementById('avisoNomeExistente').style.display = 'none';
    });
});

function salvarDados() {
    const cliente = document.getElementById('cliente').value.trim(); // Remover espaços em branco extras
    if (cliente === '') {
        document.getElementById('avisoNomeExistente').textContent = 'Por favor, preencha este campo';
        document.getElementById('avisoNomeExistente').style.display = 'block';
        return false; // Impede o envio do formulário
    }

    const cnpj = document.getElementById('cnpj').value;
    const cep = document.getElementById('cep').value;
    const bairro = document.getElementById('bairro').value;
    const inscricao = document.getElementById('inscricao').value;
    const endereco = document.getElementById('endereco').value;
    const cidade = document.getElementById('cidade').value;
    const fone = document.getElementById('fone').value;

    const data = `Cliente: ${cliente}\nCNPJ: ${cnpj}\nCEP: ${cep}\nBairro: ${bairro}\n` +
                `Inscrição Estadual: ${inscricao}\nEndereço: ${endereco}\nCidade: ${cidade}\nFone: ${fone}\n`;

    const nomeArquivo = `${cliente}.txt`;
    const caminhoArquivo = path.join('C:', 'Users', process.env.USERNAME, 'AppData', 'Roaming', 'Formex', 'Dados do App', 'Clientes', nomeArquivo);

    if (fs.existsSync(caminhoArquivo)) {
        document.getElementById('avisoNomeExistente').textContent = 'Já existe um cliente com esse nome, por favor use outro nome.';
        document.getElementById('avisoNomeExistente').style.display = 'block';
        return false; // Impede o envio do formulário
    }

    ipcRenderer.send('salvar-clientes', { data, nomeArquivo });
    return true; // Permite o envio do formulário se todos os campos estiverem preenchidos
}
