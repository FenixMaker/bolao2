export class Bet {
    constructor(data) {
        this.id = data.id || Date.now();
        this.gameId = data.gameId;
        this.userName = data.userName;
        this.homeScore = data.homeScore;
        this.awayScore = data.awayScore;
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    validate() {
        if (!this.gameId) {
            throw new Error('O jogo é obrigatório');
        }
        if (!this.userName || this.userName.trim().length === 0) {
            throw new Error('O nome do apostador é obrigatório');
        }
        if (typeof this.homeScore !== 'number' || this.homeScore < 0) {
            throw new Error('O placar do time da casa deve ser um número positivo');
        }
        if (typeof this.awayScore !== 'number' || this.awayScore < 0) {
            throw new Error('O placar do time visitante deve ser um número positivo');
        }
    }

    toJSON() {
        return {
            id: this.id,
            gameId: this.gameId,
            userName: this.userName,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            createdAt: this.createdAt
        };
    }
} 