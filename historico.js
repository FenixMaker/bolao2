// Filter handling
document.getElementById('monthFilter')?.addEventListener('change', (e) => {
    filterGames(e.target.value, document.getElementById('competitionFilter').value);
});

document.getElementById('competitionFilter')?.addEventListener('change', (e) => {
    filterGames(document.getElementById('monthFilter').value, e.target.value);
});

function filterGames(month, competition) {
    // Implementation for filtering games based on month and competition
    console.log('Filtering games:', { month, competition });
}

// Load more games when scrolling
let isLoading = false;
window.addEventListener('scroll', () => {
    if (isLoading) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        loadMoreGames();
    }
});

function loadMoreGames() {
    isLoading = true;
    // Implementation for loading more games
    setTimeout(() => {
        isLoading = false;
    }, 1000);
}