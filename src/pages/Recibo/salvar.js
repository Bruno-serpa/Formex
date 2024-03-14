const { ipcRenderer } = require('electron');

function salvarDados() {
    const cliente = document.getElementById('cliente').value;
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

    ipcRenderer.send('salvar-clientes', { data, nomeArquivo });

    window.print();
}
