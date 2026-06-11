export class Cart {
    constructor() {
        // Cargamos el carrito guardado en localStorage o iniciamos uno vacío
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Agregar producto o incrementar cantidad si ya existe (Clonar)
    addProduct(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // Guardamos una copia del producto y le añadimos la propiedad de cantidad
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveLocally();
    }

    // Restar cantidad de un producto
    subtractProduct(productId) {
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity -= 1;
            // Si la cantidad llega a 0, lo eliminamos por completo
            if (existingItem.quantity <= 0) {
                this.removeProduct(productId);
                return;
            }
        }
        this.saveLocally();
    }

    // Eliminar completamente un producto del carrito
    removeProduct(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveLocally();
    }

    // Calcular el subtotal y el total automáticamente
    getTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // Puedes asimilar el total igual al subtotal o sumarle un envío simulado más adelante
        const total = subtotal; 
        
        // Redondeamos a 2 decimales para evitar problemas flotantes de JS
        return {
            subtotal: Number(subtotal.toFixed(2)),
            total: Number(total.toFixed(2))
        };
    }

    // Vaciar el carrito (útil para cuando se complete la pasarela de pago)
    clearCart() {
        this.items = [];
        this.saveLocally();
    }

    // Obtener los artículos actuales
    getItems() {
        return this.items;
    }

    // Guardar en el almacenamiento local para persistencia
    saveLocally() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
}