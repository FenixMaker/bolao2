// Game management
let games = [
    {
        id: 1,
        homeTeam: 'Flamengo',
        awayTeam: 'Fluminense',
        date: '2024-03-17T16:00',
        location: 'Maracanã',
        status: 'in_progress',
        homeScore: 2,
        awayScore: 0,
        currentTime: 75
    }
];

// Form handling
document.getElementById('newGameForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const gameData = {
        id: games.length + 1,
        homeTeam: document.getElementById('homeTeam').value,
        awayTeam: document.getElementById('awayTeam').value,
        date: document.getElementById('gameDate').value,
        location: document.getElementById('location').value,
        status: 'not_started',
        homeScore: 0,
        awayScore: 0
    };
    games.push(gameData);
    alert('Jogo cadastrado com sucesso!');
    e.target.reset();
});

document.getElementById('newBetForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const betData = {
        id: Date.now(),
        userName: document.getElementById('userName').value,
        gameId: document.getElementById('betGame').value,
        homeScore: parseInt(document.getElementById('homeScore').value),
        awayScore: parseInt(document.getElementById('awayScore').value)
    };
    // Add bet to storage
    alert('Palpite cadastrado com sucesso!');
    e.target.reset();
});

document.getElementById('updateScoreForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const gameId = document.getElementById('updateGame').value;
    const game = games.find(g => g.id === parseInt(gameId));
    if (game) {
        game.homeScore = parseInt(document.getElementById('updateHomeScore').value);
        game.awayScore = parseInt(document.getElementById('updateAwayScore').value);
        game.status = document.getElementById('gameStatus').value;
        game.currentTime = parseInt(document.getElementById('gameMinute').value);
        alert('Placar atualizado com sucesso!');
    }
    e.target.reset();
});