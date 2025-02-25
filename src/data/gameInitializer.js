import { Game } from '../models/Game.js';
import { upcomingGames, pastGames } from './flamengoGames.js';

export function initializeGames() {
    try {
        console.log('Inicializando dados dos jogos...');
        
        // Converte os dados iniciais em objetos Game
        const games = [...upcomingGames, ...pastGames].map(gameData => {
            const game = new Game(gameData);
            game.validate();
            return game;
        });
        
        console.log('Jogos inicializados com sucesso:', games);
        return games;
    } catch (error) {
        console.error('Erro ao inicializar jogos:', error);
        throw new Error(`Erro ao inicializar jogos: ${error.message}`);
    }
} 