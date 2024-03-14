function atualizarDataHora() {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    let hora = agora.toLocaleTimeString('pt-BR');
    
    // Substituir os ':' por ';'
    hora = hora.replace(/:/g, ';');

    let mostrar_data = document.getElementById('data').innerHTML = `Emitido em ${data} às ${hora}`;
}

// Chama a função inicialmente para exibir a data/hora inicial
atualizarDataHora();

// Atualiza a cada segundo
setInterval(atualizarDataHora, 1000);
