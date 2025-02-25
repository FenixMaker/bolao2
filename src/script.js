import { upcomingGames } from './data/flamengoGames.js';
import { Game } from './models/Game.js';
import { Bet } from './models/Bet.js';
import { StorageService } from './services/StorageService.js';

// Constants
const BET_PRICE = 5.00;
const HOUSE_FEE = 0.10;

// State management
let games = [];
let currentFilter = 'all';
let bets = [];

// Initialize data
async function initializeData() {
    try {
        console.log('Iniciando carregamento de dados...');
        
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

        // Carrega jogo em destaque
        const featuredGameId = StorageService.getFeaturedGame();
        console.log('ID do jogo em destaque:', featuredGameId);
        
        if (featuredGameId) {
            const featuredGame = games.find(game => game.id === parseInt(featuredGameId));
            if (featuredGame) {
                console.log('Jogo em destaque encontrado:', featuredGame);
                updateFeaturedGame(featuredGame);
            }
        }

        // Atualiza as interfaces
        displayGames();
        displayPastGames();
        
        console.log('Dados inicializados com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        showError('Erro ao carregar dados: ' + error.message);
    }
}

// Calculate total prize
function calculatePrize(totalBets) {
    const totalAmount = totalBets * BET_PRICE;
    const houseFee = totalAmount * HOUSE_FEE;
    return totalAmount - houseFee;
}

// Update game time every minute
function updateGameTime(game) {
    if (!game || game.status !== 'in_progress') return;

    const timeElement = document.querySelector('.game-time');
    if (timeElement) {
        setInterval(() => {
            if (game.currentTime < 90) {
                game.currentTime++;
                timeElement.textContent = game.currentTime + "'";
                StorageService.saveGames(games);
            }
        }, 60000);
    }
}

// Find closest bet to current score
function findClosestBet() {
    if (!bets.length) return null;

    return bets.reduce((closest, bet) => {
        const currentDiff = Math.abs(bet.homeScore - currentGame.homeScore) + 
                          Math.abs(bet.awayScore - currentGame.awayScore);
        const closestDiff = Math.abs(closest.homeScore - currentGame.homeScore) + 
                           Math.abs(closest.awayScore - currentGame.awayScore);
        
        return currentDiff < closestDiff ? bet : closest;
    }, bets[0]);
}

// Update featured game display
function updateFeaturedGame(game) {
    const gameContainer = document.querySelector('.games-container');
    if (!gameContainer) return;

    const gameBets = StorageService.getBetsByGame(game.id);
    const totalPrize = StorageService.getTotalPrizeByGame(game.id);

    gameContainer.innerHTML = `
        <div class="game-card">
            <div class="teams-container">
                <div class="team">
                    <img src="${getTeamLogo(game.homeTeam)}" alt="${game.homeTeam}" class="team-logo">
                    <div class="team-name">${game.homeTeam}</div>
                </div>
                <div class="score-container">
                    <span>${game.homeScore}</span>
                    <span class="score-separator">×</span>
                    <span>${game.awayScore}</span>
                </div>
                <div class="team">
                    <img src="${getTeamLogo(game.awayTeam)}" alt="${game.awayTeam}" class="team-logo">
                    <div class="team-name">${game.awayTeam}</div>
                </div>
            </div>

            ${game.status === 'in_progress' ? `
                <div class="current-time">${game.currentTime}'</div>
            ` : ''}

            <div class="game-info">
                <div class="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <div>
                        <div class="info-label">Data e Hora</div>
                        <div class="info-value">${formatDate(game.date)}</div>
                    </div>
                </div>

                <div class="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div>
                        <div class="info-label">Local</div>
                        <div class="info-value">${game.location}</div>
                    </div>
                </div>
            </div>

            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-label">Total de Apostas</div>
                    <div class="stat-value">${gameBets.length}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Prêmio Total</div>
                    <div class="stat-value">R$ ${totalPrize.toFixed(2)}</div>
                </div>
            </div>

            <div class="palpites-section">
                <div class="palpites-header">Palpites</div>
                <div class="palpites-list">
                    ${gameBets.length > 0 ? gameBets.map(bet => `
                        <div class="palpite-item">
                            <span>${bet.userName}</span>
                            <div class="palpite-placar">${bet.homeScore} x ${bet.awayScore}</div>
                        </div>
                    `).join('') : '<div class="palpite-item"><span>Ainda não há palpites</span></div>'}
                </div>
            </div>
        </div>
    `;
}

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const button = document.getElementById('themeToggle');
    if (!button) return;

    button.innerHTML = theme === 'dark' ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    ` : `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle?.addEventListener('click', toggleTheme);
}

// Helper functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTeamLogo(teamName) {
    // Mapeamento de times para URLs de escudos
    const teamLogos = {
        'Flamengo': 'https://logodetimes.com/times/flamengo/logo-flamengo-256.png',
        'Fluminense': 'https://logodetimes.com/times/fluminense/logo-fluminense-256.png',
        'Nova Iguaçu': 'https://logodetimes.com/times/nova-iguacu/logo-nova-iguacu-256.png',
        'Palestino': 'https://logodetimes.com/times/palestino/logo-palestino-256.png',
        'Atlético-GO': 'https://logodetimes.com/times/atletico-goianiense/logo-atletico-goianiense-256.png',
        'São Paulo': 'https://logodetimes.com/times/sao-paulo/logo-sao-paulo-256.png',
        'Vasco da Gama': 'https://logodetimes.com/times/vasco-da-gama/logo-vasco-da-gama-256.png',
        'Internacional': 'https://logodetimes.com/times/internacional/logo-internacional-256.png',
        'EC Vitória': 'https://logodetimes.com/times/vitoria/logo-vitoria-256.png',
        'Grêmio': 'https://logodetimes.com/times/gremio/logo-gremio-256.png',
        'Juventude': 'https://logodetimes.com/times/juventude/logo-juventude-256.png',
        'Corinthians': 'https://logodetimes.com/times/corinthians/logo-corinthians-256.png',
        'Cruzeiro': 'https://logodetimes.com/times/cruzeiro/logo-cruzeiro-256.png',
        'Bahia': 'https://logodetimes.com/times/bahia/logo-bahia-256.png'
    };

    return teamLogos[teamName] || 'https://logodetimes.com/times/default/logo-default-256.png';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Display games in the UI
function displayGames() {
    try {
        console.log('Atualizando exibição dos jogos...');
        const gamesContainer = document.querySelector('.games-container');
        if (!gamesContainer) {
            console.error('Container de jogos não encontrado');
            return;
        }

        // Busca o jogo em destaque
        const featuredGameId = StorageService.getFeaturedGame();
        console.log('ID do jogo em destaque:', featuredGameId);

        if (!featuredGameId) {
            gamesContainer.innerHTML = '<p class="no-games">Nenhum jogo em destaque no momento.</p>';
            return;
        }

        const game = games.find(g => g.id === parseInt(featuredGameId));
        if (!game) {
            gamesContainer.innerHTML = '<p class="no-games">Jogo em destaque não encontrado.</p>';
            return;
        }

        // Atualiza o container com o jogo em destaque
        updateFeaturedGame(game);
        console.log('Jogo em destaque exibido com sucesso:', game);
    } catch (error) {
        console.error('Erro ao exibir jogos:', error);
        showError('Erro ao exibir jogos: ' + error.message);
    }
}

// Display bets for a game
function displayBets(gameId) {
    try {
        const gameBets = StorageService.getBetsByGame(gameId);
        if (!gameBets || gameBets.length === 0) {
            return '<div class="palpite-item"><span>Ainda não há palpites</span></div>';
        }

        return gameBets.map(bet => `
            <div class="palpite-item">
                <span>${bet.userName}</span>
                <div class="palpite-placar">${bet.homeScore} x ${bet.awayScore}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao exibir palpites:', error);
        return '<div class="palpite-item"><span>Erro ao carregar palpites</span></div>';
    }
}

// Display past games
function displayPastGames() {
    try {
        const pastGames = games.filter(game => game.status === 'finished');
        // Implementation for displaying past games if needed
        console.log('Jogos passados encontrados:', pastGames.length);
    } catch (error) {
        console.error('Erro ao exibir jogos passados:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    initializeTheme();
});

// Export for use in other modules
export {
    bets,
    calculatePrize,
    findClosestBet
}; 