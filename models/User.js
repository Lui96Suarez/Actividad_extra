export class User {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }

    // CORRECCIÓN: Ahora el método acepta los parámetros necesarios para crear el usuario
    registerUser(email, password, role = 'Cliente') {
        const userExist = this.users.some(user => user.email === email);
        if (userExist) {
            return {
                // CORRECCIÓN: Se cambió 'mesaage' por 'message'
                success: false, message: 'El usuario ya existe'
            };
        }

        // CORRECCIÓN: Se unificó a 'newUser' en minúsculas
        const newUser = { email, password, role };
        this.users.push(newUser);
        this.saveUsersLocally();
        return {
            success: true, message: 'Registro Exitoso'
        };
    }

    loginUser(email, password) {
        const user = this.users.find((u) => u.email === email && u.password === password);
        if (user) {
            sessionStorage.setItem('activeSession', JSON.stringify({ email: user.email, role: user.role }));
            return { success: true, user: user };
        }
        // CORRECCIÓN: Se cambió 'succes' por 'success'
        return { success: false, message: 'Credenciales inválidas' };
    }

    saveUsersLocally() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    getCurrentSession() {
        return JSON.parse(sessionStorage.getItem('activeSession'));
    }

    logoutUser() {
        sessionStorage.removeItem('activeSession');
    }

    recoverPassword(email, newPassword) {
        const userIndex = this.users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            this.users[userIndex].password = newPassword;
            this.saveUsersLocally();
            // CORRECCIÓN: Se cambió 'suucess' por 'success'
            return { success: true, message: 'Contraseña actualizada correctamente' };
        }
        // CORRECCIÓN: Se cambió 'flase' por 'false'
        return { success: false, message: 'No existe un usuario con ese correo' };
    }

    updateProfile(email, profileData) {
        const userIndex = this.users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...profileData };
            this.saveUsersLocally();
            
            const currentSession = this.getCurrentSession();
            if (currentSession && currentSession.email === email) {
                sessionStorage.setItem('activeSession', JSON.stringify({ 
                    ...currentSession, 
                    ...profileData 
                }));
            }
            return { success: true, message: 'Perfil Actualizado con Éxito' };
        }
        return { success: false, message: 'Usuario no encontrado' };
    }
}