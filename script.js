// Game data
let currentGame = {
    homeTeam: 'Flamengo',
    awayTeam: 'Fluminense',
    homeScore: 2,
    awayScore: 0,
    currentTime: "75'",
    date: '17/03/2024',
    time: '16:00',
    location: 'Maracanã'
};

let bets = [
    { id: '1', userName: 'João', homeScore: 2, awayScore: 0 },
    { id: '2', userName: 'Maria', homeScore: 3, awayScore: 1 },
    { id: '3', userName: 'Pedro', homeScore: 1, awayScore: 0 }
];

const BET_PRICE = 5.00;
const HOUSE_FEE = 0.10;

// Calculate total prize
function calculatePrize(totalBets) {
    const totalAmount = totalBets * BET_PRICE;
    const houseFee = totalAmount * HOUSE_FEE;
    return totalAmount - houseFee;
}

// Update game time every minute
function updateGameTime() {
    const timeElement = document.querySelector('.game-time');
    if (timeElement) {
        let minutes = parseInt(currentGame.currentTime);
        setInterval(() => {
            if (minutes < 90) {
                minutes++;
                currentGame.currentTime = minutes + "'";
                timeElement.textContent = currentGame.currentTime;
            }
        }, 60000);
    }
}

// Find closest bet to current score
function findClosestBet() {
    let closestBet = bets[0];
    let smallestDiff = Infinity;

    bets.forEach(bet => {
        const diff = Math.abs(bet.homeScore - currentGame.homeScore) + 
                    Math.abs(bet.awayScore - currentGame.awayScore);
        if (diff < smallestDiff) {
            smallestDiff = diff;
            closestBet = bet;
        }
    });

    return closestBet;
}

// Update stats display
function updateStats() {
    // Update total bets
    const totalBetsElement = document.querySelector('.stat-value');
    if (totalBetsElement) {
        totalBetsElement.textContent = bets.length;
    }

    // Update prize
    const prizeElement = document.querySelectorAll('.stat-value')[1];
    if (prizeElement) {
        const totalPrize = calculatePrize(bets.length);
        prizeElement.textContent = `R$ ${totalPrize.toFixed(2)}`;
    }

    // Update closest bet
    const closestBet = findClosestBet();
    const closestBetElement = document.querySelector('.closest-bet');
    if (closestBetElement) {
        closestBetElement.textContent = `${closestBet.userName} (${closestBet.homeScore}x${closestBet.awayScore})`;
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateGameTime();
    updateStats();
});