export class AuthController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    // El enrutador llamará a este método tras renderizar el HTML de auth
    init() {
        this.view.initElements(); 
        this.view.bindLogin(this.handleLogin);
        this.view.bindRegister(this.handleRegister);
        this.view.bindForgotPassword(this.handleForgotPassword);
    }

    handleLogin = (email, password) => {
        if (!email || !password) {
            this.view.displayMessage('Por favor, llena todos los campos.', true);
            return;
        }

        const response = this.model.loginUser(email, password);
        if (response.success) {
            this.view.displayMessage(`¡Bienvenido! Rol: ${response.user.role}`);
            
            // Actualizamos la barra de navegación global de la SPA
            this.updateGlobalNavbar(response.user.role);

            // Redirección estricta según requerimientos de seguridad [cite: 18, 19]
            if (response.user.role === 'Administrador') {
                window.location.hash = '#/admin';
            } else {
                window.location.hash = '#/catalog';
            }
        } else {
            this.view.displayMessage(response.message, true);
        }
    };

    handleRegister = (email, password) => {
        if (!email || !password) {
            this.view.displayMessage('Por favor, llena todos los campos.', true);
            return;
        }

        // Persiste en localStorage automáticamente a través del modelo 
        const response = this.model.registerUser(email, password, 'Cliente');
        if (response.success) {
            this.view.displayMessage(response.message, false);
        } else {
            this.view.displayMessage(response.message, true);
        }
    };

    // Flujo de recuperación de contraseña 
    handleForgotPassword = (email, newPassword) => {
        if (!email || !newPassword) {
            this.view.displayMessage('Digita tu correo y la NUEVA contraseña en los campos superiores para reestablecer.', true);
            return;
        }

        const response = this.model.recoverPassword(email, newPassword);
        if (response.success) {
            this.view.displayMessage(response.message, false);
        } else {
            this.view.displayMessage(response.message, true);
        }
    };

    // Modifica visualmente el header común de la SPA
    updateGlobalNavbar(role) {
        const adminLink = document.getElementById('nav-admin');
        const authLink = document.getElementById('nav-auth');
        
        const activeSession = JSON.parse(sessionStorage.getItem('activeSession'));

        if (activeSession) {
            if (authLink) {
                // En vez de decir "Iniciar Sesión", ahora va a su Perfil
                authLink.textContent = 'Mi Perfil';
                authLink.setAttribute('href', '#/profile'); 
            }
            if (role === 'Administrador' && adminLink) {
                adminLink.style.display = 'inline-block';
            }
        } else {
            if (authLink) {
                authLink.textContent = 'Iniciar Sesión';
                authLink.setAttribute('href', '#/auth');
            }
            if (adminLink) adminLink.style.display = 'none';
        }
    }
}