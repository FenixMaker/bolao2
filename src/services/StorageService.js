export class StorageService {
    static GAMES_KEY = 'games';
    static BETS_KEY = 'bets';
    static FEATURED_GAME_KEY = 'featured_game';
    static INITIALIZED_KEY = 'games_initialized';

    static loadGames() {
        try {
            const gamesJson = localStorage.getItem(this.GAMES_KEY);
            if (!gamesJson) {
                console.log('Nenhum jogo encontrado no storage');
                return [];
            }
            const games = JSON.parse(gamesJson);
            if (!Array.isArray(games)) {
                console.error('Dados de jogos inválidos no storage');
                return [];
            }
            console.log('Jogos carregados do storage:', games.length);
            return games;
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
            return [];
        }
    }

    static saveGames(games) {
        try {
            if (!Array.isArray(games)) {
                throw new Error('Os jogos devem ser um array');
            }
            localStorage.setItem(this.GAMES_KEY, JSON.stringify(games));
            localStorage.setItem(this.INITIALIZED_KEY, 'true');
            console.log('Jogos salvos com sucesso:', games.length);
        } catch (error) {
            console.error('Erro ao salvar jogos:', error);
            throw error;
        }
    }

    static loadBets() {
        try {
            const betsJson = localStorage.getItem(this.BETS_KEY);
            if (!betsJson) return [];

            const bets = JSON.parse(betsJson);
            if (!Array.isArray(bets)) {
                throw new Error('Formato inválido de dados dos palpites');
            }
            
            return bets;
        } catch (error) {
            console.error('Erro ao carregar palpites:', error);
            return [];
        }
    }

    static saveBets(bets) {
        try {
            if (!Array.isArray(bets)) {
                throw new Error('Dados de palpites devem ser um array');
            }
            localStorage.setItem(this.BETS_KEY, JSON.stringify(bets));
        } catch (error) {
            console.error('Erro ao salvar palpites:', error);
            throw new Error('Falha ao salvar palpites: ' + error.message);
        }
    }

    static clearAll() {
        localStorage.removeItem(this.GAMES_KEY);
        localStorage.removeItem(this.BETS_KEY);
        localStorage.removeItem(this.FEATURED_GAME_KEY);
        localStorage.removeItem(this.INITIALIZED_KEY);
        console.log('Storage limpo com sucesso');
    }

    static getBetsByGame(gameId) {
        try {
            if (!gameId) {
                throw new Error('ID do jogo é obrigatório');
            }
            const bets = this.loadBets();
            return bets.filter(bet => bet.gameId === gameId);
        } catch (error) {
            console.error('Erro ao buscar palpites do jogo:', error);
            return [];
        }
    }

    static getTotalBetsByGame(gameId) {
        try {
            if (!gameId) {
                throw new Error('ID do jogo é obrigatório');
            }
            return this.getBetsByGame(gameId).length;
        } catch (error) {
            console.error('Erro ao contar palpites do jogo:', error);
            return 0;
        }
    }

    static getTotalPrizeByGame(gameId) {
        try {
            if (!gameId) {
                throw new Error('ID do jogo é obrigatório');
            }
            const bets = this.getBetsByGame(gameId);
            return bets.length * 10; // Considerando R$ 10 por aposta
        } catch (error) {
            console.error('Erro ao calcular prêmio do jogo:', error);
            return 0;
        }
    }

    static getWinnersByGame(gameId, homeScore, awayScore) {
        try {
            if (!gameId) {
                throw new Error('ID do jogo é obrigatório');
            }
            if (typeof homeScore !== 'number' || typeof awayScore !== 'number') {
                throw new Error('Placares devem ser números');
            }
            
            const bets = this.getBetsByGame(gameId);
            return bets.filter(bet => 
                bet.homeScore === homeScore && 
                bet.awayScore === awayScore
            );
        } catch (error) {
            console.error('Erro ao buscar vencedores do jogo:', error);
            return [];
        }
    }

    static getFeaturedGame() {
        try {
            const featuredGameId = localStorage.getItem(this.FEATURED_GAME_KEY);
            console.log('ID do jogo em destaque carregado:', featuredGameId);
            return featuredGameId;
        } catch (error) {
            console.error('Erro ao carregar jogo em destaque:', error);
            return null;
        }
    }

    static setFeaturedGame(gameId) {
        try {
            if (!gameId) {
                throw new Error('ID do jogo é obrigatório');
            }
            localStorage.setItem(this.FEATURED_GAME_KEY, gameId);
            console.log('Jogo em destaque salvo:', gameId);
        } catch (error) {
            console.error('Erro ao salvar jogo em destaque:', error);
            throw error;
        }
    }
} 