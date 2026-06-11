export class CatalogController {
    constructor(productModel, cartModel, catalogView) {
        this.productModel = productModel;
        this.cartModel = cartModel;
        this.catalogView = catalogView;

        // Vinculamos los eventos que ocurrirán en la interfaz con la lógica de este controlador
        this.catalogView.bindFilters(this.handleFilterChange);
        this.catalogView.bindAddToCart(this.handleAddToCart);
        this.catalogView.bindAddReview(this.handleIdAddReview);
    }

    // Método para arrancar el catálogo al cargar la página
    async init() {
        this.catalogView.showLoading(true);
        
        // Inicializa los productos (consume la API externa si es la primera vez) [cite: 47, 56]
        const response = await this.productModel.initCatalog();
        
        this.catalogView.showLoading(false);

        if (response.success) {
            this.renderFullCatalog();
        } else {
            this.catalogView.showError(response.message);
        }
    }

    // Carga inicial de todos los productos y preparación de filtros
    renderFullCatalog() {
        const products = this.productModel.getProducts();
        this.catalogView.renderProducts(products);
        
        // Extraemos las categorías únicas de los productos para rellenar el selector select/dropdown dinámicamente
        const categories = [...new Set(products.map(p => p.category))];
        this.catalogView.renderCategoryOptions(categories);
    }

    // Escucha los cambios en el buscador, el select de categoría o el rango de precio 
    handleFilterChange = (filters) => {
        const { searchTerm, category, maxPrice } = filters;
        let filteredProducts = this.productModel.getProducts();

        // 1. Buscador en tiempo real (por título o descripción) 
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.description.toLowerCase().includes(query)
            );
        }

        // 2. Filtro por categoría 
        if (category && category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        // 3. Filtro por rango de precios 
        if (maxPrice && !isNaN(maxPrice)) {
            filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Le mandamos los productos filtrados finales a la vista para que los dibuje
        this.catalogView.renderProducts(filteredProducts);
    };

    // Maneja la acción cuando el usuario hace clic en "Agregar al carrito" desde una tarjeta de producto [cite: 28]
    handleAddToCart = (productId) => {
        const products = this.productModel.getProducts();
        const product = products.find(p => p.id === parseInt(productId));
        
        if (product) {
            this.cartModel.addProduct(product);
            
            // Opcional: Aquí podrías disparar una alerta visual estética o actualizar 
            // el contador del carrito en el header si tienes acceso a esa vista.
            console.log(`Producto agregado: ${product.title}`);
        }
    };

    handleIdAddReview = (productId, reviewData) => {
        const storageKey = `reviews_${productId}`;
        const existingReviews = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        existingReviews.push(reviewData);
        localStorage.setItem(storageKey, JSON.stringify(existingReviews));
        
        // Forzamos el refresco visual inmediato de los productos para mostrar la nueva opinión
        this.handleFilterChange({
            searchTerm: this.catalogView.searchInput.value,
            category: this.catalogView.categorySelect.value,
            maxPrice: this.catalogView.priceRange.value
        });
    }
}