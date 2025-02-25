export function updateAuthUI() {
    const authButtonsContainer = document.querySelector('.auth-buttons');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!authButtonsContainer) return;

    if (user) {
        // User is logged in
        authButtonsContainer.innerHTML = `
            <span class="user-name">Olá, ${user.username}</span>
            <button class="auth-button logout" onclick="handleLogout()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sair
            </button>
        `;
    } else {
        // User is not logged in
        authButtonsContainer.innerHTML = `
            <a href="/login.html" class="auth-button login">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Entrar
            </a>
            <a href="/register.html" class="auth-button register">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Cadastrar
            </a>
        `;
    }
}

window.handleLogout = function() {
    localStorage.removeItem('user');
    updateAuthUI();
    window.location.href = '/';
}

// Update UI when the page loads
document.addEventListener('DOMContentLoaded', updateAuthUI); 