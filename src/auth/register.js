import { UserService } from '../services/UserService.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validate password match
            if (password !== confirmPassword) {
                throw new Error('As senhas não coincidem');
            }

            // Validate password strength
            if (password.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres');
            }

            const result = await UserService.register(username, email, password);
            
            if (result.success) {
                // Show success message
                showSuccess('Cadastro realizado com sucesso!');
                
                // Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            }
        } catch (error) {
            showError(error.message || 'Erro ao realizar cadastro');
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