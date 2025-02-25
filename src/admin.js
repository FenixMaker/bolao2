import { Game } from './models/Game.js';
import { Bet } from './models/Bet.js';
import { StorageService } from './services/StorageService.js';
import { upcomingGames, pastGames } from './data/flamengoGames.js';
import { initializeGames } from './data/gameInitializer.js';

// Variáveis globais
let games = [];
let bets = [];
let currentSection = 'games';

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Iniciando aplicação...');
        
        // Inicializa a navegação e carrega os dados
        initializeNavigation();
        await loadGames();
        loadBets();
        setupEventListeners();
        
        // Mostra a seção inicial
        showSection('games');
        
        console.log('Aplicação inicializada com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        showError('Erro ao inicializar aplicação: ' + error.message);
    }
});

// Setup de event listeners
function setupEventListeners() {
    // Event delegation para botões de edição
    document.getElementById('gamesList')?.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-button');
        if (editButton) {
            const gameId = parseInt(editButton.dataset.gameId);
            if (!isNaN(gameId)) {
                editGame(gameId);
            }
        }
    });

    // Event listeners para formulários
    setupFormListeners();
}

// Setup de listeners dos formulários
function setupFormListeners() {
    // Listener para novo jogo
    document.getElementById('newGameForm')?.addEventListener('submit', handleNewGame);
    
    // Listener para atualização de placar
    document.getElementById('updateScoreForm')?.addEventListener('submit', handleScoreUpdate);
    
    // Listeners para filtros
    document.getElementById('statusFilter')?.addEventListener('change', debounce(updateGamesList, 300));
    document.getElementById('dateFilter')?.addEventListener('change', debounce(updateGamesList, 300));
}

// Função de debounce para otimização
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Navegação entre seções
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            showSection(section);
            
            // Atualiza botões ativos
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
    currentSection = sectionId;

    // Atualiza lista de jogos ou palpites se necessário
    if (sectionId === 'games') {
        loadGames();
    } else if (sectionId === 'update-score') {
        updateGameSelect();
    } else if (sectionId === 'manage-bets') {
        loadBets();
    } else if (sectionId === 'featured-game') {
        updateFeaturedGameSelect();
    }
}

// Manipulação de jogos
async function loadGames() {
    try {
        console.log('Iniciando carregamento dos jogos...');
        
        // Carrega jogos do storage ou inicializa novos
        let storedGames = StorageService.loadGames();
        console.log('Jogos encontrados no storage:', storedGames);
        
        if (!storedGames || storedGames.length === 0) {
            console.log('Nenhum jogo encontrado no storage, inicializando jogos...');
            // Combina jogos futuros e passados
            const allGames = [...upcomingGames, ...pastGames];
            console.log('Total de jogos a serem inicializados:', allGames.length);
            StorageService.saveGames(allGames);
            games = allGames.map(gameData => new Game(gameData));
        } else {
            console.log('Carregando jogos do storage...');
            games = storedGames.map(gameData => new Game(gameData));
        }

        // Ordena os jogos por data
        games = games.sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log('Total de jogos carregados:', games.length);
        
        // Atualiza as interfaces
        updateGamesList();
        updateGameSelect();
        updateBetGameFilter();
        updateFeaturedGameSelect();

        console.log('Jogos carregados com sucesso:', games);
    } catch (error) {
        console.error('Erro ao carregar jogos:', error);
        showError('Erro ao carregar jogos: ' + error.message);
        throw error;
    }
}

function updateGamesList() {
    const gamesContainer = document.getElementById('gamesList');
    if (!gamesContainer) return;

    const statusFilter = document.getElementById('statusFilter')?.value;
    const dateFilter = document.getElementById('dateFilter')?.value;

    let filteredGames = games;

    // Aplicar filtros
    if (statusFilter) {
        filteredGames = filteredGames.filter(game => game.status === statusFilter);
    }
    if (dateFilter) {
        const filterDate = new Date(dateFilter).toDateString();
        filteredGames = filteredGames.filter(game => 
            new Date(game.date).toDateString() === filterDate
        );
    }

    gamesContainer.innerHTML = filteredGames.map(game => `
        <div class="game-item ${game.status}">
            <span class="status-badge ${getStatusClass(game.status)}">
                ${getStatusIcon(game.status)}
                ${getStatusText(game.status)}
            </span>
            <h3>${game.homeTeam} vs ${game.awayTeam}</h3>
            <p class="game-info-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${formatDate(game.date)}
            </p>
            <p class="game-info-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${game.location}
            </p>
            <p class="game-info-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${game.competition} - ${game.round}
            </p>
            ${game.status !== 'not_started' ? `
                <div class="score">
                    ${game.homeScore} × ${game.awayScore}
                    ${game.status === 'in_progress' ? `
                        <span class="game-time">${game.currentTime}'</span>
                    ` : ''}
                </div>
            ` : ''}
            <button class="edit-button" data-game-id="${game.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Editar
            </button>
        </div>
    `).join('');
}

// Atualização do select de jogos
function updateGameSelect() {
    const gameSelect = document.getElementById('updateGame');
    if (!gameSelect) return;

    const futureGames = games.filter(game => new Date(game.date) >= new Date());
    
    gameSelect.innerHTML = `
        <option value="">Selecione um jogo</option>
        ${futureGames.map(game => `
            <option value="${game.id}">
                ${game.homeTeam} vs ${game.awayTeam} - ${formatDate(game.date)}
            </option>
        `).join('')}
    `;
}

// Handlers de formulários
async function handleNewGame(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        // Validação dos campos obrigatórios
        const requiredFields = ['homeTeam', 'awayTeam', 'gameDate', 'location', 'competition', 'round', 'broadcastInfo'];
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                throw new Error(`Campo ${field} é obrigatório`);
            }
        }

        const gameData = {
            id: Date.now(),
            homeTeam: formData.get('homeTeam'),
            awayTeam: formData.get('awayTeam'),
            date: formData.get('gameDate'),
            location: formData.get('location'),
            competition: formData.get('competition'),
            round: formData.get('round'),
            broadcastInfo: formData.get('broadcastInfo'),
            ticketInfo: 'A confirmar',
            status: 'not_started',
            homeScore: 0,
            awayScore: 0,
            currentTime: 0
        };

        const game = new Game(gameData);
        game.validate();
        
        games.push(game);
        StorageService.saveGames(games.map(g => g.toJSON()));
        
        showSuccess('Jogo cadastrado com sucesso!');
        e.target.reset();
        loadGames();
    } catch (error) {
        showError('Erro ao cadastrar jogo: ' + error.message);
    }
}

async function handleScoreUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const gameId = parseInt(formData.get('updateGame'));
        if (isNaN(gameId)) {
            throw new Error('Selecione um jogo válido');
        }

        const gameIndex = games.findIndex(g => g.id === gameId);
        if (gameIndex === -1) {
            throw new Error('Jogo não encontrado');
        }

        // Validação dos campos numéricos
        const homeScore = parseInt(formData.get('updateHomeScore'));
        const awayScore = parseInt(formData.get('updateAwayScore'));
        const currentTime = parseInt(formData.get('gameMinute')) || 0;

        if (isNaN(homeScore) || homeScore < 0) {
            throw new Error('Placar do time da casa inválido');
        }
        if (isNaN(awayScore) || awayScore < 0) {
            throw new Error('Placar do time visitante inválido');
        }
        if (currentTime < 0 || currentTime > 90) {
            throw new Error('Minuto de jogo inválido');
        }

        const status = formData.get('gameStatus');
        if (!['not_started', 'in_progress', 'finished'].includes(status)) {
            throw new Error('Status de jogo inválido');
        }

        // Atualiza o jogo
        const updatedGame = new Game({
            ...games[gameIndex].toJSON(),
            homeScore,
            awayScore,
            status,
            currentTime
        });

        games[gameIndex] = updatedGame;
        StorageService.saveGames(games.map(g => g.toJSON()));
        
        showSuccess('Placar atualizado com sucesso!');
        loadGames();
    } catch (error) {
        showError('Erro ao atualizar placar: ' + error.message);
    }
}

// Funções auxiliares
function formatDate(date) {
    const options = { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('pt-BR', options);
}

function getStatusText(status) {
    switch (status) {
        case 'not_started': return 'Não Iniciado';
        case 'in_progress': return 'Em Andamento';
        case 'finished': return 'Finalizado';
        default: return status;
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'not_started':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="6" x2="12" y2="12"></line><line x1="12" y1="12" x2="16" y2="14"></line></svg>';
        case 'in_progress':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>';
        case 'finished':
            return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        default:
            return '';
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'not_started': return 'status-not-started';
        case 'in_progress': return 'status-in-progress';
        case 'finished': return 'status-finished';
        default: return '';
    }
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Função para editar jogo
function editGame(gameId) {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    showSection('update-score');
    document.getElementById('updateGame').value = gameId;
    document.getElementById('updateHomeScore').value = game.homeScore || 0;
    document.getElementById('updateAwayScore').value = game.awayScore || 0;
    document.getElementById('gameStatus').value = game.status;
    document.getElementById('gameMinute').value = game.currentTime || '';
}

// Carregamento e gerenciamento de palpites
function loadBets() {
    try {
        bets = StorageService.loadBets().map(bet => new Bet(bet));
        updateBetsList();
        updateBetGameFilter();
    } catch (error) {
        showError('Erro ao carregar palpites: ' + error.message);
    }
}

function updateBetGameFilter() {
    const gameFilter = document.getElementById('betGameFilter');
    if (!gameFilter) return;

    const futureGames = games.filter(game => 
        game.status === 'not_started' || 
        new Date(game.date) >= new Date()
    );
    
    gameFilter.innerHTML = `
        <option value="">Todos os Jogos</option>
        ${futureGames.map(game => `
            <option value="${game.id}">
                ${game.homeTeam} vs ${game.awayTeam} - ${formatDate(game.date)}
            </option>
        `).join('')}
    `;
}

function updateBetsList() {
    const betsList = document.getElementById('betsList');
    if (!betsList) return;

    const gameFilter = document.getElementById('betGameFilter')?.value;
    let filteredBets = bets;
    let selectedGame = null;

    if (gameFilter) {
        selectedGame = games.find(g => g.id === parseInt(gameFilter));
        filteredBets = bets.filter(bet => bet.gameId === parseInt(gameFilter));
    }

    // Se um jogo está selecionado, mostra o formulário de aposta
    const betForm = document.getElementById('newBetForm');
    if (betForm) {
        if (selectedGame) {
            betForm.style.display = 'block';
            betForm.dataset.gameId = selectedGame.id;
        } else {
            betForm.style.display = 'none';
            delete betForm.dataset.gameId;
        }
    }

    // Primeiro mostra o jogo selecionado
    betsList.innerHTML = `
        ${selectedGame ? `
            <div class="selected-game">
                <h3>${selectedGame.homeTeam} vs ${selectedGame.awayTeam}</h3>
                <p>${formatDate(selectedGame.date)} - ${selectedGame.location}</p>
            </div>
        ` : ''}
    `;

    // Adiciona a grid de palpites
    const betsGrid = document.createElement('div');
    betsGrid.className = 'bets-grid';

    if (filteredBets.length === 0) {
        betsGrid.innerHTML = '<div class="no-bets">Ainda não há palpites para este jogo</div>';
    } else {
        betsGrid.innerHTML = filteredBets.map(bet => {
            const game = games.find(g => g.id === bet.gameId);
            if (!game) return '';

            return `
                <div class="bet-item">
                    <div class="bet-header">
                        <span class="bet-game">${game.homeTeam} vs ${game.awayTeam}</span>
                        <span class="bet-date">${formatDate(game.date)}</span>
                    </div>
                    <div class="bet-info">
                        <span class="bet-user">${bet.userName}</span>
                        <span class="bet-score">${bet.homeScore} x ${bet.awayScore}</span>
                    </div>
                    <button class="delete-button" onclick="deleteBet(${bet.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                        Excluir
                    </button>
                </div>
            `;
        }).join('');
    }

    betsList.appendChild(betsGrid);
}

// Event Listeners para palpites
document.getElementById('betGameFilter')?.addEventListener('change', (e) => {
    const selectedGameId = e.target.value;
    if (selectedGameId) {
        const game = games.find(g => g.id === parseInt(selectedGameId));
        if (game) {
            document.getElementById('newBetForm').style.display = 'block';
            document.getElementById('newBetForm').dataset.gameId = game.id;
        }
    }
    updateBetsList();
});

document.getElementById('newBetForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const gameId = parseInt(e.target.dataset.gameId);
    
    if (!gameId) {
        showError('Selecione um jogo para fazer o palpite');
        return;
    }
    
    const betData = {
        id: Date.now(),
        gameId: gameId,
        userName: formData.get('betUserName'),
        homeScore: parseInt(formData.get('betHomeScore')),
        awayScore: parseInt(formData.get('betAwayScore')),
        createdAt: new Date().toISOString()
    };

    try {
        const bet = new Bet(betData);
        bet.validate();
        
        bets.push(bet);
        StorageService.saveBets(bets.map(b => b.toJSON()));
        
        showSuccess('Palpite cadastrado com sucesso!');
        e.target.reset();
        updateBetsList();
    } catch (error) {
        showError('Erro ao cadastrar palpite: ' + error.message);
    }
});

// Função para deletar palpite
function deleteBet(betId) {
    if (!confirm('Tem certeza que deseja excluir este palpite?')) return;

    const betIndex = bets.findIndex(b => b.id === betId);
    if (betIndex === -1) {
        showError('Palpite não encontrado');
        return;
    }

    bets.splice(betIndex, 1);
    StorageService.saveBets(bets.map(b => b.toJSON()));
    showSuccess('Palpite excluído com sucesso!');
    updateBetsList();
}

// Exportar função para uso global
window.editGame = editGame;
window.deleteBet = deleteBet;

// Update featured game select
function updateFeaturedGameSelect() {
    try {
        console.log('Atualizando seleção de jogo em destaque...');
        console.log('Total de jogos disponíveis:', games.length);
        
        const featuredGameSelect = document.getElementById('featuredGame');
        if (!featuredGameSelect) {
            throw new Error('Elemento de seleção de jogo em destaque não encontrado');
        }

        // Limpa as opções atuais
        featuredGameSelect.innerHTML = '<option value="">Selecione um jogo</option>';

        // Obtém o jogo em destaque atual
        const currentFeaturedGame = StorageService.getFeaturedGame();
        console.log('Jogo em destaque atual:', currentFeaturedGame);

        // Filtra jogos disponíveis (apenas não finalizados)
        const availableGames = games.filter(game => game.status !== 'finished')
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log('Jogos disponíveis para destaque:', availableGames);

        // Adiciona as opções de jogos
        availableGames.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = `${game.homeTeam} x ${game.awayTeam} - ${formatDate(game.date)}`;
            
            // Marca como selecionado se for o jogo em destaque atual
            if (currentFeaturedGame && currentFeaturedGame.id === game.id) {
                option.selected = true;
            }
            
            featuredGameSelect.appendChild(option);
        });

        // Adiciona o event listener para o botão de salvar
        const saveButton = document.getElementById('saveFeaturedGame');
        if (saveButton && !saveButton.hasAttribute('data-listener-added')) {
            saveButton.setAttribute('data-listener-added', 'true');
            saveButton.addEventListener('click', () => {
                try {
                    const selectedGameId = featuredGameSelect.value;
                    if (!selectedGameId) {
                        throw new Error('Selecione um jogo para destacar');
                    }

                    StorageService.setFeaturedGame(parseInt(selectedGameId));
                    showSuccess('Jogo em destaque atualizado com sucesso!');
                    console.log('Jogo em destaque salvo:', selectedGameId);
                    
                    // Redireciona para a página inicial após um breve delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } catch (error) {
                    console.error('Erro ao salvar jogo em destaque:', error);
                    showError('Erro ao salvar jogo em destaque: ' + error.message);
                }
            });
        }

        console.log('Seleção de jogo em destaque atualizada com sucesso');
    } catch (error) {
        console.error('Erro ao atualizar seleção de jogo em destaque:', error);
        showError('Erro ao atualizar seleção de jogo em destaque: ' + error.message);
    }
} 