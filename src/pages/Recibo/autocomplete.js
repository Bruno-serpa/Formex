const fs = require('fs');
const path = require('path');

const clientesDir = `C:/Users/${process.env.USERNAME}/AppData/Roaming/Formex/Dados do App/Clientes/`;
const datalist = document.getElementById('clientes-datalist');
const clienteInput = document.getElementById('cliente');
const cnpjInput = document.getElementById('cnpj');
const cepInput = document.getElementById('cep');
const inscricaoInput = document.getElementById('inscricao');
const cidadeInput = document.getElementById('cidade');
const foneInput = document.getElementById('fone');
const bairroInput = document.getElementById('bairro');
const enderecoInput = document.getElementById('endereco');

function listarClientes() {
    fs.readdir(clientesDir, (err, files) => {
        if (err) {
            console.error('Erro ao ler diretório de clientes:', err);
            return;
        }

        // Limpar datalist antes de adicionar novas opções
        datalist.innerHTML = '';

        // Adicionar cada arquivo como uma opção no datalist
        files.forEach(file => {
            // Remover a extensão .txt do nome do arquivo
            const fileName = path.parse(file).name;
            
            const option = document.createElement('option');
            option.value = fileName;
            datalist.appendChild(option);
        });
    });
}

function preencherCamposComDadosDoCliente(cliente) {
    const filePath = path.join(clientesDir, cliente + '.txt');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler arquivo do cliente:', err);
            return;
        }

        // Separar os dados do cliente em linhas
        const linhas = data.split('\n');
        
        // Preencher os inputs com os dados do cliente
        cnpjInput.value = linhas[1].split(':')[1].trim();
        cepInput.value = linhas[2].split(':')[1].trim();
        bairroInput.value = linhas[3].split(':')[1].trim();
        inscricaoInput.value = linhas[4].split(':')[1].trim();
        enderecoInput.value = linhas[5].split(':')[1].trim();
        cidadeInput.value = linhas[6].split(':')[1].trim();
        foneInput.value = linhas[7].split(':')[1].trim();
    });
}

// Chamar a função para listar os clientes quando a página carregar
listarClientes();

// Atualizar os campos com os dados do cliente selecionado quando o input for alterado
clienteInput.addEventListener('input', () => {
    const clienteSelecionado = clienteInput.value;
    if (clienteSelecionado) {
        preencherCamposComDadosDoCliente(clienteSelecionado);
    }
});
