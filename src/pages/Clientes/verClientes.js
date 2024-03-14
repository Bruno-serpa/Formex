const { ipcRenderer } = require('electron');
const path = require('path');

// Definir o caminho para a pasta de clientes
const pastaClientes = `C:/Users/${process.env.USERNAME}/AppData/Roaming/Formex/Dados do App/Clientes`;

// Solicitar lista de clientes ao processo principal
ipcRenderer.send('listar-clientes');

// Lidar com a resposta do processo principal
ipcRenderer.on('clientes-listados', (event, clientes) => {
    const listaClientesElement = document.getElementById('listaClientes');
    const clientesRecentesDiv = document.querySelector('.clientes-recentes');
    const inputPesquisa = document.getElementById('inputPesquisa');

    // Função para renderizar a lista de clientes com base no termo de pesquisa
    function renderizarLista(clientesFiltrados) {
        // Limpar a lista de clientes antes de renderizar os novos
        listaClientesElement.innerHTML = '';

        // Iterar sobre os clientes filtrados e criar elementos para cada um
        clientesFiltrados.forEach((cliente) => {
            // Remover a extensão .txt do nome do arquivo
            const nomeArquivo = path.parse(cliente).name;
            // Criar um elemento de div para representar o cliente
            const clienteDiv = document.createElement('div');
            clienteDiv.classList.add('cliente');

            // Obter a primeira letra do nome do cliente para exibir como avatar
            const primeiraLetra = nomeArquivo.charAt(0).toUpperCase();
            // Criar um parágrafo para exibir a primeira letra como avatar
            const avatarCliente = document.createElement('p');
            avatarCliente.textContent = primeiraLetra;
            avatarCliente.classList.add('inicial-cliente'); // Adicionar classe para estilização

            // Estilizar avatar
            avatarCliente.style.padding = '10px';
            avatarCliente.style.marginRight = '10px';
            avatarCliente.style.color = 'red';
            avatarCliente.style.fontSize = '16px';
            avatarCliente.style.fontWeight ='bold';
            avatarCliente.style.borderRadius = '7px';
            avatarCliente.style.border = '1px solid gray';
            avatarCliente.style.marginTop = '5px';
            avatarCliente.style.marginBottom = '5px'

            // Adicionar o avatar do cliente ao elemento da div do cliente
            clienteDiv.appendChild(avatarCliente);

            // Criar um elemento de parágrafo para exibir o nome do cliente
            const nomeClienteElement = document.createElement('p');
            nomeClienteElement.textContent = nomeArquivo;

            // Estilizar o parágrafo
            nomeClienteElement.style.flexGrow = 1;
            clienteDiv.style.cursor = 'pointer';
            clienteDiv.style.display = 'flex';
            clienteDiv.style.alignItems = 'center';
            clienteDiv.style.padding = '5px 10px';
            clienteDiv.style.margin = '5px 0';
            clienteDiv.style.border = '1px solid #ccc';
            clienteDiv.style.borderRadius = '5px';

            // Adicionar evento de clique para redirecionar para os detalhes do cliente ao clicar no cliente
            clienteDiv.addEventListener('click', () => {
                window.location.href = `detalhes-cliente.html?cliente=${cliente}`;
            });

            // Adicionar o parágrafo ao elemento da div do cliente
            clienteDiv.appendChild(nomeClienteElement);

            // Criar um botão de exclusão para cada cliente
            const botaoExcluir = document.createElement('img');
            botaoExcluir.src = '../../images/excluir.png';
            botaoExcluir.style.width = '20px';
            botaoExcluir.style.height = '20px';
            botaoExcluir.style.cursor = 'pointer';
            botaoExcluir.addEventListener('click', (event) => {
                event.stopPropagation(); // Impedir a propagação do evento para o elemento pai (div do cliente)
                excluirCliente(nomeArquivo);
            });

            // Adicionar o botão de exclusão à div do cliente
            clienteDiv.appendChild(botaoExcluir);

            // Adicionar o elemento da div do cliente à lista de clientes
            listaClientesElement.appendChild(clienteDiv);
        });

        // Ocultar a mensagem de clientes recentes se houver clientes na lista
        clientesRecentesDiv.style.display = clientesFiltrados.length > 0 ? 'none' : 'block';
    }

    // Lidar com a entrada do usuário no campo de pesquisa
    inputPesquisa.addEventListener('input', () => {
        // Converter o termo de pesquisa para minúsculas para facilitar a comparação
        const termoPesquisa = inputPesquisa.value.toLowerCase();
        // Filtrar os clientes com base no termo de pesquisa
        const clientesFiltrados = clientes.filter(cliente => cliente.toLowerCase().includes(termoPesquisa));
        // Renderizar a lista de clientes filtrados
        renderizarLista(clientesFiltrados);
    });

    // Renderizar a lista de clientes inicialmente
    renderizarLista(clientes);
});

// Função para excluir o cliente
function excluirCliente(nomeArquivo) {
    // Solicitar ao processo principal para excluir o cliente
    ipcRenderer.send('excluir-cliente', nomeArquivo);
    // Após excluir o cliente, atualizar a lista de clientes
    ipcRenderer.send('listar-clientes');
    // Limpar o campo de pesquisa
    inputPesquisa.value = '';
}
