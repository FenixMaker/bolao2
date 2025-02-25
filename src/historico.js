import { Game } from './models/Game.js';
import { Bet } from './models/Bet.js';
import { StorageService } from './services/StorageService.js';
import { upcomingGames, pastGames } from './data/flamengoGames.js';

// Constants
const ITEMS_PER_PAGE = 10;

// State management
let games = [];
let bets = [];
let currentPage = 1;
let filteredGames = [];
let currentFilter = 'all';
let currentMonth = new Date().getMonth();

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
        games = games.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('Total de jogos carregados:', games.length);

        // Atualiza a interface
        filterGames();
        setupEventListeners();
        
        console.log('Dados inicializados com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        showError('Erro ao carregar dados: ' + error.message);
    }
}

// Filter games based on month and competition
function filterGames() {
    const gamesList = document.getElementById('gamesList');
    if (!gamesList) return;

    const filteredGames = games.filter(game => {
        const gameDate = new Date(game.date);
        const monthMatch = gameDate.getMonth() === currentMonth;
        const competitionMatch = currentFilter === 'all' || 
                               getCompetitionClass(game.competition) === currentFilter;
        return monthMatch && competitionMatch;
    });

    gamesList.innerHTML = filteredGames.map(game => `
        <div class="game-card">
            <div class="game-header">
                <span class="competition-badge ${getCompetitionClass(game.competition)}">
                    ${game.competition}
                </span>
                <span class="round-info">${game.round}</span>
            </div>

            <div class="teams-container">
                <div class="team">
                    <img src="${getTeamLogo(game.homeTeam)}" alt="${game.homeTeam}" class="team-logo">
                    <div class="team-name">${game.homeTeam}</div>
                </div>
                <div class="versus">VS</div>
                <div class="team">
                    <img src="${getTeamLogo(game.awayTeam)}" alt="${game.awayTeam}" class="team-logo">
                    <div class="team-name">${game.awayTeam}</div>
                </div>
            </div>

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

                <div class="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path>
                    </svg>
                    <div>
                        <div class="info-label">Transmissão</div>
                        <div class="info-value">${game.broadcastInfo}</div>
                    </div>
                </div>

                <div class="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <div>
                        <div class="info-label">Ingressos</div>
                        <div class="info-value">${game.ticketInfo}</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Competition filter
    const filterButtons = document.querySelectorAll('.competition-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.competition;
            filterGames();
        });
    });

    // Month filter
    const monthSelect = document.getElementById('monthFilter');
    if (monthSelect) {
        monthSelect.value = currentMonth;
        monthSelect.addEventListener('change', (e) => {
            currentMonth = parseInt(e.target.value);
            filterGames();
        });
    }
}

// Update games list with pagination
function updateGamesList(games = upcomingGames) {
    const gamesHistory = document.getElementById('gamesHistory');
    gamesHistory.innerHTML = '';

    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-history-item';
        
        const competitionClass = game.competition.toLowerCase().replace(/\s+/g, '-');
        const gameDate = new Date(game.date);
        const isUpcoming = gameDate > new Date();
        
        gameElement.innerHTML = `
            <div class="game-info-container">
                <div class="game-header">
                    <span class="competition-badge ${competitionClass}">${game.competition}</span>
                    <span class="game-round">${game.round}</span>
                </div>
                <h3 class="game-title">${game.homeTeam} vs ${game.awayTeam}</h3>
                <div class="game-details">
                    <div class="game-detail-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${formatDate(game.date)}
                    </div>
                    <div class="game-detail-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${game.location}
                    </div>
                </div>
            </div>
            <div class="game-info">
                <div class="info-item">
                    <span class="info-label">Transmissão</span>
                    <span class="info-value">${game.broadcastInfo}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ingressos</span>
                    <span class="info-value">${game.ticketInfo}</span>
                </div>
                ${isUpcoming ? `
                <button class="bet-button">
                    Fazer Aposta
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                ` : ''}
            </div>
        `;
        
        gamesHistory.appendChild(gameElement);
    });
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
    const paginationContainer = document.querySelector('#pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Anterior</button>
        <span>Página ${currentPage} de ${totalPages}</span>
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Próxima</button>
    `;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    updateGamesList();
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Event listeners
document.getElementById('monthFilter').addEventListener('change', filterGames);
document.getElementById('competitionFilter').addEventListener('change', filterGames);

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeData);

// Export functions for use in HTML
window.changePage = changePage;
window.showGameDetails = (gameId) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    // Implement game details modal or navigation
    console.log('Show game details:', game);
};

function getCompetitionClass(competition) {
    const classes = {
        'Campeonato Carioca': 'carioca',
        'Copa Libertadores': 'libertadores',
        'Brasileirão': 'brasileirao',
        'Copa do Brasil': 'copa-brasil'
    };
    return classes[competition] || '';
}

function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };
    return new Date(date).toLocaleDateString('pt-BR', options);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function getTeamLogo(teamName) {
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