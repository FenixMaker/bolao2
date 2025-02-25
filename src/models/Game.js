export class Game {
    constructor({
        id,
        homeTeam,
        awayTeam,
        date,
        location,
        competition,
        round,
        broadcastInfo,
        ticketInfo,
        status = 'scheduled',
        currentTime = 0,
        homeScore = 0,
        awayScore = 0,
        featured = false
    }) {
        this.id = id;
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.date = new Date(date);
        this.location = location;
        this.competition = competition;
        this.round = round;
        this.broadcastInfo = broadcastInfo;
        this.ticketInfo = ticketInfo;
        this.status = status;
        this.currentTime = currentTime;
        this.homeScore = homeScore;
        this.awayScore = awayScore;
        this.featured = featured;
    }

    toJSON() {
        return {
            id: this.id,
            homeTeam: this.homeTeam,
            awayTeam: this.awayTeam,
            date: this.date.toISOString(),
            location: this.location,
            competition: this.competition,
            round: this.round,
            broadcastInfo: this.broadcastInfo,
            ticketInfo: this.ticketInfo,
            status: this.status,
            currentTime: this.currentTime,
            homeScore: this.homeScore,
            awayScore: this.awayScore,
            featured: this.featured
        };
    }

    validate() {
        if (!this.homeTeam || !this.awayTeam) {
            throw new Error('Times da casa e visitante são obrigatórios');
        }
        if (!this.date || isNaN(this.date.getTime())) {
            throw new Error('Data inválida');
        }
        if (!this.location) {
            throw new Error('Local é obrigatório');
        }
        if (!this.competition) {
            throw new Error('Competição é obrigatória');
        }
    }
} 