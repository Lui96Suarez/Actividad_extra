export class CartView {
    constructor() {
        // Inicializa vacío para la carga asíncrona de la SPA
    }

    initElements() {
        this.itemsContainer = document.getElementById('cart-items-container');
        this.subtotalElement = document.getElementById('cart-subtotal');
        this.totalElement = document.getElementById('cart-total');
        this.checkoutForm = document.getElementById('checkout-form');
        this.checkoutMessage = document.getElementById('checkout-message');
    }

    // Dibuja los productos que están dentro del carrito
    renderCart(items, totals) {
        if (!this.itemsContainer) return;
        this.itemsContainer.innerHTML = '';

        if (items.length === 0) {
            this.itemsContainer.innerHTML = '<p class="empty-cart-text">Tu carrito está vacío. ¡Visita el catálogo!</p>';
            this.subtotalElement.textContent = '$0.00';
            this.totalElement.textContent = '$0.00';
            if (this.checkoutForm) this.checkoutForm.style.opacity = '0.5'; // Deshabilitar visualmente
            return;
        }

        if (this.checkoutForm) this.checkoutForm.style.opacity = '1';

        items.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.className = 'cart-item-row';
            itemRow.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p class="cart-item-price">$${item.price} c/u</p>
                </div>
                <div class="cart-item-actions">
                    <button class="btn-qty-minus" data-id="${item.id}">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="btn-qty-plus" data-id="${item.id}">+</button>
                    <button class="btn-item-remove" data-id="${item.id}">🗑️</button>
                </div>
                <div class="cart-item-subtotal">
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            `;
            this.itemsContainer.appendChild(itemRow);
        });

        // Actualizar los textos de totales de la interfaz
        this.subtotalElement.textContent = `$${totals.subtotal}`;
        this.totalElement.textContent = `$${totals.total}`;
    }

    // Escucha las operaciones de los botones (+, -, eliminar)
    bindCartActions(handlerPlus, handlerMinus, handlerRemove) {
        this.itemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            const productId = parseInt(target.getAttribute('data-id'));

            if (!productId) return;

            if (target.classList.contains('btn-qty-plus')) {
                handlerPlus(productId);
            } else if (target.classList.contains('btn-qty-minus')) {
                handlerMinus(productId);
            } else if (target.classList.contains('btn-item-remove')) {
                handlerRemove(productId);
            }
        });
    }

    // Escucha el envío del formulario de pago (Checkout)
    bindCheckout(handler) {
        if (!this.checkoutForm) return;
        this.checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const cardName = document.getElementById('card-name').value;
            handler({ cardName });
        });
    }

    displayCheckoutMessage(message, isError = false) {
        if (!this.checkoutMessage) return;
        this.checkoutMessage.textContent = message;
        this.checkoutMessage.style.color = isError ? '#e74c3c' : '#2ecc71';
    }
}