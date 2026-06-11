export class CatalogView {
    constructor() {
        // Se inicializa vacío debido a la carga asíncrona de la SPA
    }

    // El controlador llama a este método justo después de inyectar el HTML
    initElements() {
        this.searchInput = document.getElementById('search-input');
        this.categorySelect = document.getElementById('category-select');
        this.priceRange = document.getElementById('price-range');
        this.priceValue = document.getElementById('price-value');
        this.productsContainer = document.getElementById('products-container');
        this.loadingIndicator = document.getElementById('catalog-loading');
    }

    // Rellena el selector de categorías dinámicamente basándose en los datos existentes
    renderCategoryOptions(categories) {
        if (!this.categorySelect) return;
        
        // Resetear manteniendo la opción por defecto
        this.categorySelect.innerHTML = '<option value="all">Todas las categorías</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            this.categorySelect.appendChild(option);
        });
    }

    // Renderiza las tarjetas de los productos en la cuadrícula 
    renderProducts(products) {
        if (!this.productsContainer) return;
        this.productsContainer.innerHTML = '';

        if (products.length === 0) {
            this.productsContainer.innerHTML = '<p class="no-products">No se encontraron productos con los filtros seleccionados.</p>';
            return;
        }

        products.forEach(product => {
            // Recuperar reseñas locales específicas de este producto para renderizarlas
            const reviews = JSON.parse(localStorage.getItem(`reviews_${product.id}`)) || [];
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.title}" class="product-img">
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-category"><span>${product.category}</span></p>
                    <p class="product-description">${product.description.substring(0, 100)}...</p>
                    <p class="product-price">$${product.price}</p>
                    <button class="btn-add-cart" data-id="${product.id}">Agregar al carrito</button>
                </div>
                
                <div class="product-feedback">
                    <h4>Opiniones de clientes</h4>
                    <div class="reviews-list" id="reviews-${product.id}">
                        ${reviews.map(r => `<p>⭐ ${r.stars}/5 - <em>"${r.comment}"</em></p>`).join('') || '<p class="empty-text">Sin opiniones aún.</p>'}
                    </div>
                    <form class="review-form" data-product-id="${product.id}">
                        <select class="review-stars" required>
                            <option value="">Estrellas</option>
                            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                            <option value="4">⭐⭐⭐⭐ (4)</option>
                            <option value="3">⭐⭐⭐ (3)</option>
                            <option value="2">⭐⭐ (2)</option>
                            <option value="1">⭐ (1)</option>
                        </select>
                        <input type="text" class="review-comment" placeholder="Deja tu comentario..." required>
                        <button type="submit">Enviar</button>
                    </form>
                </div>
            `;
            this.productsContainer.appendChild(productCard);
        });
    }

    // Agrupa y expone los cambios en los filtros al controlador en tiempo real 
    bindFilters(handler) {
        // Escucha cada tecla presionada en el buscador
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                handler({
                    searchTerm: this.searchInput.value.trim(),
                    category: this.categorySelect.value,
                    maxPrice: this.priceRange.value
                });
            });
        }
        
        // Escucha cambios en el select de categorías
        if (this.categorySelect) {
            this.categorySelect.addEventListener('change', () => {
                handler({
                    searchTerm: this.searchInput.value.trim(),
                    category: this.categorySelect.value,
                    maxPrice: this.priceRange.value
                });
            });
        }
        
        // Escucha el deslizamiento del rango de precio
        if (this.priceRange) {
            this.priceRange.addEventListener('input', () => {
                if (this.priceValue) this.priceValue.textContent = this.priceRange.value;
                handler({
                    searchTerm: this.searchInput.value.trim(),
                    category: this.categorySelect.value,
                    maxPrice: this.priceRange.value
                });
            });
        }
    }

    // Escucha los clics en los botones de "Agregar al carrito" [cite: 28]
    bindAddToCart(handler) {
        const catalogContainer = document.getElementById('catalog-container');
        
        // Si no está el contenedor en el DOM, no asignes el listener
        if (!catalogContainer) return; 

        catalogContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-cart')) {
                const productId = e.target.getAttribute('data-id');
                handler(productId);
            }
        });
    }

    // Escucha el envío de nuevos comentarios y estrellas (Módulo 5) 
    bindAddReview(handler) {
        this.productsContainer.addEventListener('submit', (e) => {
            if (e.target.classList.contains('review-form')) {
                e.preventDefault();
                const productId = e.target.getAttribute('data-product-id');
                const stars = e.target.querySelector('.review-stars').value;
                const comment = e.target.querySelector('.review-comment').value;
                
                handler(productId, { stars: parseInt(stars), comment });
                e.target.reset(); // Limpia el formulario interno
            }
        });
    }

    showLoading(show) {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        if (this.productsContainer) {
            this.productsContainer.innerHTML = `<p class="error-message">Error: ${message}</p>`;
        }
    }
}