const { ipcRenderer } = require('electron');

// Enviar uma solicitação para obter a lista de recibos
ipcRenderer.send('get-recibos');

// Lidar com a resposta contendo a lista de recibos
ipcRenderer.on('recibos-list', (event, recibos) => {
    exibirRecibos(recibos);
});

function exibirRecibos(recibos) {
    const recibosRecentes = document.getElementById('recibosRecentes');

    // Limpar qualquer conteúdo existente na div de recibos
    recibosRecentes.innerHTML = '';

    // Se não houver recibos, exibir a mensagem "Sem recibos recentes"
    if (recibos.length === 0) {
        recibosRecentes.innerHTML = '<p>Sem recibos recentes</p>';
        return;
    }

    // Iterar sobre a lista de recibos e criar divs para cada um
    recibos.forEach(recibo => {
        const reciboDiv = document.createElement('div');
        reciboDiv.classList.add('recibo-item');
        reciboDiv.textContent = recibo;

        const excluirBtn = document.createElement('div');
        excluirBtn.classList.add('excluir-btn');

        const excluirImg = document.createElement('img');
        excluirImg.src = '../../images/excluir.png';
        excluirImg.alt = 'Excluir';
        excluirImg.addEventListener('click', () => excluirRecibo(recibo));

        excluirBtn.appendChild(excluirImg);
        reciboDiv.appendChild(excluirBtn);

        recibosRecentes.appendChild(reciboDiv);
    });

    // Adicionar um ouvinte de eventos de clique a cada div de recibo
    recibosRecentes.addEventListener('click', (event) => {
        // Verificar se o clique ocorreu na div do recibo
        if (event.target.classList.contains('recibo-item')) {
            // Extrair o nome do recibo do texto da div
            const nomeRecibo = event.target.textContent;

            // Montar o caminho do arquivo com base no nome do recibo
            const caminhoArquivo = `C:/Users/${process.env.USERNAME}/AppData/Roaming/Formex/Dados do App/Recibos/${nomeRecibo}`; // Substitua CAMINHO_DA_PASTA pelo caminho correto

            // Navegar para a página verRecibo.html com o caminho do arquivo como parâmetro de consulta na URL
            window.location.href = `../Recibo/verRecibo.html?caminho=${encodeURIComponent(caminhoArquivo)}`;
        }
    });
}

function excluirRecibo(nomeRecibo) {
        ipcRenderer.send('excluir-recibo', nomeRecibo);
}

// Lidar com a resposta após excluir o recibo
ipcRenderer.on('recibo-excluido', (event, nomeReciboExcluido) => {
    // Enviar uma nova solicitação para obter a lista atualizada de recibos
    ipcRenderer.send('get-recibos');
});
