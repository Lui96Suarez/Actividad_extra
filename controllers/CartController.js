export class CartController {
    constructor(cartModel, productModel, cartView) {
        this.cartModel = cartModel;
        this.productModel = productModel; // Lo necesitaremos para clonar/añadir ítems válidos
        this.cartView = cartView;
    }

    // Refresca la vista leyendo el estado actual del modelo
    init() {
        // 1. Escaneamos los elementos del nuevo HTML del carrito
        this.cartView.initElements();

        // 2. Conectamos los listeners ahora que el DOM está listo
        this.cartView.bindCartActions(this.handlePlus, this.handleMinus, this.handleRemove);
        this.cartView.bindCheckout(this.handleCheckout);

        this.updateView();
    }

    updateView() {
        const items = this.cartModel.getItems();
        const totals = this.cartModel.getTotals();
        this.cartView.renderCart(items, totals);
    }

    handlePlus = (productId) => {
        // Convertimos a entero para garantizar que machee con el ID numérico del modelo
        const idNumeric = parseInt(productId); 
        const products = this.productModel.getProducts();
        const product = products.find(p => p.id === idNumeric);
        if (product) {
            this.cartModel.addProduct(product);
            this.updateView();
        }
    };

    handleMinus = (productId) => {
        this.cartModel.subtractProduct(parseInt(productId)); // Convertir a entero
        this.updateView();
    };

    handleRemove = (productId) => {
        this.cartModel.removeProduct(parseInt(productId)); // Convertir a entero
        this.updateView();
    };
    
    handleCheckout = (formData) => {
        const items = this.cartModel.getItems();
        if (items.length === 0) {
            this.cartView.displayCheckoutMessage('El carrito está vacío.', true);
            return;
        }

        const activeSession = JSON.parse(sessionStorage.getItem('activeSession'));
        if (!activeSession) {
            this.cartView.displayCheckoutMessage('Debes iniciar sesión para completar la compra.', true);
            return;
        }

        const totals = this.cartModel.getTotals();

        // Creamos una orden estructurada para alimentar el módulo de administración de ventas posterior
        const newOrder = {
            id: Date.now(), // ID único basado en timestamp
            email: activeSession.email,
            items: items,
            total: totals.total,
            status: 'Pendiente', // Estados pedidos en rúbrica: Pendiente, Enviado, Entregado
            date: new Date().toLocaleDateString()
        };

        // Guardamos la orden en el localStorage global de pedidos
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Vaciamos el modelo y limpiamos la interfaz
        this.cartModel.clearCart();
        this.updateView();
        
        this.cartView.displayCheckoutMessage(`¡Pago Procesado! Gracias por tu compra, ${formData.cardName}. Tu pedido está ${newOrder.status}.`);
    };
}