export class User {
    constructor(){
        this.users = JSON.parse(localStorage.getItem('users')) || []
    }

    registerUser(){
        const userExist = this.users.some(user => user.email === email)
        if (userExist){
            return {
                success: false, mesaage: 'El usuario ya existe'
            }
        }

        const newUSer = { email, password, role}
        this.users.push(newUSer)
        this.saveUsersLocally()
        return {
                success:true, message: 'RegistroExitoso'
        }
    }

    loginUser(email, password){
        const user = this.users.find((u) => u.email === email && u.password === password)
        if(user){
            sessionStorage.setItem('activeSession', JSON.stringify({email: user.email, role: user.role}))
            return {success:true, user:user}
        }
        return {succes: false, message: 'crendenciales invalidas'}
    }

    saveUsersLocally(){
        localStorage.setItem('users', JSON.stringify(this.users))
    }

    getCurrentSession(){
        return JSON.parse(sessionStorage.getItem('activeSession'))
    }

    logoutUser(){
        sessionStorage.removeItem('activeSession')
    }

    recoverPassword(email, newPassword){
        const userIndex = this.users.findIndex(u => u.email === email)
        if(userIndex !== -1){
            this.users[userIndex].password = newPassword
            this.saveUsersLocally()
            return { suucess: true, message: 'Contraseña actualizada correctamente'}
        }
        return {success: flase, message: 'No existe un usuario con ese correo'}
    }

    updateProfile(email, profileData){
        const userIndex = this.users.findIndex(u => u.email === email)
        if(userIndex !== -1){
            this.users[userIndex] = {...this.users[userIndex],...profileData}
            this.saveUsersLocally()
            
            const currentSession = this.getCurrentSession()
            if(currentSession && currentSession.email === email){
                sessionStorage.setItem('activeSession', JSON.stringify({ 
                    ...currentSession, 
                    ...profileData 
                }));
            }
            return {success: true, message: 'Perfil Actualizado con Exito'}
        }
        return {success: false, message: 'Usuario No encontrado'}
    }
}