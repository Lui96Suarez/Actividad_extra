export class AuthView {
    constructor() {
        // El constructor queda vacío porque el HTML se genera dinámicamente
    }

    // Se ejecuta inmediatamente después de inyectar el HTML en el contenedor principal
    initElements() {
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.loginButton = document.getElementById('btn-login');
        this.registerButton = document.getElementById('btn-register');
        this.recoverButton = document.getElementById('btn-recover'); 
        this.messageContainer = document.getElementById('auth-messages');
    }

    bindLogin(handler) {
        if (this.loginButton) {
            this.loginButton.addEventListener('click', (e) => {
                e.preventDefault();
                handler(this.emailInput.value, this.passwordInput.value);
            });
        }
    }

    bindRegister(handler) {
        if (this.registerButton) {
            this.registerButton.addEventListener('click', (e) => {
                e.preventDefault();
                handler(this.emailInput.value, this.passwordInput.value);
            });
        }
    }

    bindForgotPassword(handler) {
        if (this.recoverButton) {
            this.recoverButton.addEventListener('click', (e) => {
                e.preventDefault();
                handler(this.emailInput.value, this.passwordInput.value);
            });
        }
    }

    displayMessage(message, isError = false) {
        if (this.messageContainer) {
            this.messageContainer.textContent = message;
            this.messageContainer.style.color = isError ? '#e74c3c' : '#2ecc71';
        }
    }
}