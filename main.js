const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const electron = require('electron')
const shell = electron.shell;

// ----------------------------------- Diretórios ------------------------------------------------------------------------

const pastaDadosApp = app.getPath('appData');
const pastaProdutos = path.join(pastaDadosApp, 'Formex', 'Dados do App', 'Produtos');
const pastaClientes = path.join(pastaDadosApp, 'Formex', 'Dados do App', 'Clientes');
const pastaRecibos = `C:/Users/${process.env.USERNAME}/AppData/Roaming/Formex/Dados do App/Recibos`;

// Verificar se a pasta de produtos existe, se não, criar
if (!fs.existsSync(pastaProdutos)) {
    fs.mkdirSync(pastaProdutos, { recursive: true });
}

// Verificar se a pasta de clientes existe, se não, criar
if (!fs.existsSync(pastaClientes)) {
    fs.mkdirSync(pastaClientes, { recursive: true });
}

// ------------------------------------- Janela ----------------------------------------------------------------------

// Variaveis
let mainWindow = null;
let appName = "Formex";

async function createWindow() {
    // Logo do app 
    const iconPath = path.join(app.getAppPath(), 'src', 'images', 'icon.png');

    mainWindow = new BrowserWindow({
        width: 1350,
        height: 720,
        minWidth: 1350,
        minHeight: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: iconPath,
    });

    // Arquivo Principal
    await mainWindow.loadFile(path.join(__dirname, 'src', 'pages', 'Principal', 'index.html'));
}


// ----------------------------------------------------- Menu ------------------------------------------------------------------------------------------------------

// Função para carregar páginas HTML
function loadPage(folderName ,pageName) {
    mainWindow.loadFile(path.join(__dirname, 'src', 'pages', `${folderName}`, `${pageName}.html`));
}

// Criar modelo de Menu
const templateMenu = [
    {
        label:'Principal',
        submenu: [
            {
                label: 'Inicio',
                click(){
                    loadPage('Principal', 'index');
                }
            },
            {
                label: 'Clientes',
                click(){
                    loadPage('Clientes', 'clientes');
                }
            },
            {
                label: 'Produtos',
                click(){
                    loadPage('Produtos', 'produtos');
                }
            },
            /* Mostrar configurações
            {
                label: 'Configurações',
                click(){
                    // Levar para a tela de Configurações
                }
            },
            */
            {
                label: 'Fechar',
                role: 'close'
            }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            { 
                label: 'Desfazer',
                role: 'undo' 
            },
            {
                label: 'Refazer',
                role: 'redo' 
            },
            { 
                type: 'separator' 
            },
            { 
                label: 'Cortar',
                role: 'cut' 
            },
            { 
                label: 'Copiar',
                role: 'copy' 
            },
            { 
                label: 'Colar',
                role: 'paste' 
            }
        ]
    },
    {
        label:'Exibir',
        submenu: [
            {
                label: 'Tela Cheia',
                role: 'togglefullscreen'
            }
        ]
    },
    {
        label: 'Sobre',
        click(){
            dialogoSobre();
        }
    },
    {
        label:'Console',
        role: 'toggleDevTools'
    }
];

// Adicionar menu
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);

// --------------------------------------------------- Criar Janela ------------------------------------------------------------------------------------------------------

// Quando estiver pronto
app.whenReady().then(createWindow);

// Activate (Mac)
app.on('activate', () => {
    if (!mainWindow) {
        createWindow();
    }
});

// Encerra a aplicação quando todas as janelas forem fechadas (exceto no macOS).
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Cria uma nova janela quando a aplicação estiver ativa (no macOS, recria a janela no ícone da dock quando clicado).
app.on('activate', () => {
    if (!mainWindow) {
        createWindow();
    }
});

// Lidar com a mensagem para criar o PDF
ipcMain.on('print-to-pdf', (event) => {
    const options = {
        title: 'Salvar PDF',
        defaultPath: path.join(app.getPath('documents'), 'orcamento.pdf'), // Definir o local padrão para salvar o PDF
        filters: [
            { name: 'PDF', extensions: ['pdf'] }
        ]
    };

    // Abrir o diálogo para escolher o local para salvar o PDF
    dialog.showSaveDialog(mainWindow, options).then(result => {
        if (!result.canceled && result.filePath) {
            const win = BrowserWindow.fromWebContents(event.sender);

            // Imprimir para PDF
            win.webContents.printToPDF({}).then(data => {
                // Salvar o PDF no local escolhido pelo usuário
                fs.writeFile(result.filePath, data, (err) => {
                    if (err) {
                        console.error('Erro ao salvar o PDF:', err);
                        event.sender.send('wrote-pdf', null);
                    } else {
                        event.sender.send('wrote-pdf', result.filePath);
                    }
                });
            }).catch(error => {
                console.error('Erro ao imprimir para PDF:', error);
                event.sender.send('wrote-pdf', null);
            });
        }
    });
});

// ------------------------------------------------------ Dialogos ------------------------------------------------------------------------------------------------------

// Dialogo sobre
function dialogoSobre() {
    const appVersion = app.getVersion();
  
    const options = {
      type: 'info', // tipo do dialogo
      title: ` ${appName}`,
      message: 'Sobre',
      detail: `App desktop projetado para desenvolver orçamentos.\n\nDesenvolvido por: Bruno Serpa\nE-mail: bruno30.serpa@gmail.com\nVersão: ${appVersion}`,
      buttons: ['OK'],
      defaultId: 0,
      modal: true
    };
  
    dialog.showMessageBox(options).then(() => {});
}

// ------------------------------------------------------ IpcMain ------------------------------------------------------------------------------------------------------

//-------------- Salvar Clientes --------------

ipcMain.on('salvar-clientes', (event, { data, nomeArquivo}) => {
    // Certifique-se de que a pasta de clientes exista, se não, crie-a
    if (!fs.existsSync(pastaClientes)) {
        fs.mkdirSync(pastaClientes, { recursive: true });
    }

    const filePath = path.join(pastaClientes, nomeArquivo);

    fs.writeFile(filePath, data, (err) => {
        if (err) {
            console.error('Erro ao salvar cliente:', err);
            dialog.showMessageBox({
                type: 'error',
                title: 'Erro',
                message: `Ocorreu um erro: ${err}`,
                buttons: ['OK']
            });
        } else {
            console.log('cliente registrado com sucesso em:', filePath);
            dialog.showMessageBox({
                type: 'info',
                title: 'Cliente Registrado',
                message: 'Seu cliente foi registrado com sucesso!',
                buttons: ['OK']
            });
        }
    });
});

// -------------- Salvar produtos --------------

ipcMain.on('salvar-produtos', (event, { data, nomeArquivo, imagemData }) => {
    // Certifique-se de que a pasta de produtos exista, se não, crie-a
    if (!fs.existsSync(pastaProdutos)) {
        fs.mkdirSync(pastaProdutos, { recursive: true });
    }

    const filePath = path.join(pastaProdutos, nomeArquivo);

    fs.writeFile(filePath, data, (err) => {
        if (err) {
            console.error('Erro ao salvar o produto:', err);
            dialog.showMessageBox({
                type: 'error',
                title: 'Erro',
                message: `Ocorreu um erro: ${err}`,
                buttons: ['OK']
            });
        } else {
            console.log('produto salvo com sucesso em:', filePath);
            dialog.showMessageBox({
                type: 'info',
                title: 'Produto Salvo',
                message: 'Seu Produto foi salvo com sucesso!',
                buttons: ['OK']
            });
        }
    });
});

// ------------------------------------------------------ Lista Produtos ------------------------------------------------------------------------------------------------------

// Função para listar todos os arquivos em uma pasta
function listarProdutos() {
    let produtos = [];

    try {
        const arquivos = fs.readdirSync(pastaProdutos);
        
        arquivos.forEach((arquivo) => {
            const caminhoCompleto = path.join(pastaProdutos, arquivo);
            const stats = fs.statSync(caminhoCompleto);
            if (stats.isFile()) {
                produtos.push(arquivo);
            }
        });
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
    }

    return produtos;
}

ipcMain.on('listar-produtos', (event) => {
    const produtos = listarProdutos();
    event.reply('produtos-listados', produtos);
});

// Função para excluir o produto
function excluirProduto(nomeArquivo) {
    const caminhoArquivo = path.join(pastaProdutos, nomeArquivo + '.txt'); // Adiciona a extensão .txt ao nome do arquivo

    try {
        fs.unlinkSync(caminhoArquivo);
        console.log(`Arquivo ${nomeArquivo} excluido com sucesso.`);
    } catch (err) {
        console.error(`Erro ao excluir o arquivo ${nomeArquivo}:`, err);
    }
}

// Ouvir a mensagem para excluir o produto
ipcMain.on('excluir-produto', (event, nomeArquivo) => {
    excluirProduto(nomeArquivo);
    // Após excluir o produto, enviar uma mensagem de confirmação para o processo de renderização
    event.reply('produto-excluido', nomeArquivo);
});


// Ouvir a mensagem para renomear o arquivo
ipcMain.on('renomear-arquivo', (event, { antigoNome, novoNome }) => {
    const antigoCaminhoArquivo = path.join(pastaProdutos, antigoNome);
    const novoCaminhoArquivo = path.join(pastaProdutos, novoNome);

    try {
        fs.renameSync(antigoCaminhoArquivo, novoCaminhoArquivo);
        console.log(`Arquivo renomeado de ${antigoNome} para ${novoNome} com sucesso.`);
    } catch (err) {
        console.error(`Erro ao renomear o arquivo ${antigoNome}:`, err);
        dialog.showMessageBox({
            type: 'error',
            title: 'Erro',
            message: `Ocorreu um erro ao renomear produto: ${err}`,
            buttons: ['OK']
        });
    }
});

// Ouvir a mensagem para atualizar o arquivo
ipcMain.on('atualizar-arquivo', (event, { produto, dados }) => {
    const caminhoArquivo = path.join(pastaProdutos, produto);

    try {
        fs.writeFileSync(caminhoArquivo, dados);
        console.log(`Arquivo ${produto} atualizado com sucesso.`);
        dialog.showMessageBox({
            type: 'info',
            title: 'Produto atualizado',
            message: 'Seu Produto foi atualizado com sucesso!',
            buttons: ['OK']
        });
        
    } catch (err) {
        console.error(`Erro ao atualizar o arquivo ${produto}:`, err);
        dialog.showMessageBox({
            type: 'error',
            title: 'Erro',
            message: `Ocorreu um erro ao atualizar produto: ${err}`,
            buttons: ['OK']
        });
    }
});

// ------------------------------------------------------ Lista Clientes ------------------------------------------------------------------------------------------------------

// Função para listar todos os arquivos em uma pasta de clientes
function listarClientes() {
    let clientes = [];

    try {
        const arquivos = fs.readdirSync(pastaClientes);
        
        arquivos.forEach((arquivo) => {
            const caminhoCompleto = path.join(pastaClientes, arquivo);
            const stats = fs.statSync(caminhoCompleto);
            if (stats.isFile()) {
                clientes.push(arquivo);
            }
        });
    } catch (error) {
        console.error('Erro ao listar clientes:', error);
    }

    return clientes;
}

ipcMain.on('listar-clientes', (event) => {
    const clientes = listarClientes();
    event.reply('clientes-listados', clientes);
});

// Função para excluir o cliente
function excluirCliente(nomeArquivo) {
    const caminhoArquivo = path.join(pastaClientes, nomeArquivo + '.txt'); // Adiciona a extensão .txt ao nome do arquivo

    try {
        fs.unlinkSync(caminhoArquivo);
        console.log(`Arquivo ${nomeArquivo} excluido com sucesso.`);
    } catch (err) {
        console.error(`Erro ao excluir o arquivo ${nomeArquivo}:`, err);
    }
}

// Ouvir a mensagem para excluir o cliente
ipcMain.on('excluir-cliente', (event, nomeArquivo) => {
    excluirCliente(nomeArquivo);
    // Após excluir o cliente, enviar uma mensagem de confirmação para o processo de renderização
    event.reply('cliente-excluido', nomeArquivo);
});

// Ouvir a mensagem para renomear o arquivo do cliente
ipcMain.on('renomear-arquivo-cliente', (event, { antigoNome, novoNome }) => {
    const antigoCaminhoArquivo = path.join(pastaClientes, antigoNome);
    const novoCaminhoArquivo = path.join(pastaClientes, novoNome);

    try {
        fs.renameSync(antigoCaminhoArquivo, novoCaminhoArquivo);
        console.log(`Arquivo renomeado de ${antigoNome} para ${novoNome} com sucesso.`);
    } catch (err) {
        console.error(`Erro ao renomear o arquivo ${antigoNome}:`, err);
        dialog.showMessageBox({
            type: 'error',
            title: 'Erro',
            message: `Ocorreu um erro ao renomear cliente: ${err}`,
            buttons: ['OK']
        });
    }
});

// Ouvir a mensagem para atualizar o arquivo do cliente
ipcMain.on('atualizar-arquivo-cliente', (event, { cliente, dados }) => {
    const caminhoArquivo = path.join(pastaClientes, cliente);

    try {
        fs.writeFileSync(caminhoArquivo, dados);
        console.log(`Arquivo ${cliente} atualizado com sucesso.`);
        dialog.showMessageBox({
            type: 'info',
            title: 'Cliente atualizado',
            message: 'Seu cliente foi atualizado com sucesso!',
            buttons: ['OK']
        });
        
    } catch (err) {
        console.error(`Erro ao atualizar o arquivo ${cliente}:`, err);
        dialog.showMessageBox({
            type: 'error',
            title: 'Erro',
            message: `Ocorreu um erro ao atualizar cliente: ${err}`,
            buttons: ['OK']
        });
    }
});


// ------------------------------------- Recibos -------------------------------------------------------------------

// Ver recibos na pagina principal
ipcMain.on('get-recibos', (event) => {
    
    // Verificar se a pasta de recibos existe
    if (!fs.existsSync(pastaRecibos)) {
        event.reply('recibos-list', []);
        return;
    }

    // Ler os arquivos na pasta de recibos
    fs.readdir(pastaRecibos, (err, files) => {
        if (err) {
            console.error('Erro ao ler a pasta de recibos:', err);
            event.reply('recibos-list', []);
            return;
        }

        // Enviar a lista de arquivos para a página HTML
        event.reply('recibos-list', files);
    });
});


// Função para excluir o recibo
function excluirRecibo(event, nomeArquivo) {
    const caminhoArquivo = path.join(pastaRecibos, nomeArquivo); // Adiciona a extensão .txt ao nome do arquivo

    try {
        fs.unlinkSync(caminhoArquivo);
        console.log(`Recibo ${nomeArquivo} excluído com sucesso.`);
        event.reply('recibo-excluido', nomeArquivo); // Envia uma mensagem de evento para notificar a janela renderer sobre a exclusão bem-sucedida
    } catch (err) {
        console.error(`Erro ao excluir ${nomeArquivo}:`, err);
    }
}

// Recebe a solicitação para excluir um recibo
ipcMain.on('excluir-recibo', (event, nomeRecibo) => {
    excluirRecibo(event, nomeRecibo); // Passa o objeto event para a função excluirRecibo
});
