import { UserService } from '../services/UserService.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const result = await UserService.login(email, password);
            
            if (result.success) {
                // Save user data to localStorage
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // Show success message
                showSuccess('Login realizado com sucesso!');
                
                // Redirect to homepage after a short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            }
        } catch (error) {
            showError(error.message || 'Erro ao fazer login');
        }
    });
});

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