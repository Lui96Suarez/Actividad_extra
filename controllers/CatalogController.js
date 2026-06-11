export class CatalogController {
    constructor(productModel, cartModel, catalogView) {
        this.productModel = productModel;
        this.cartModel = cartModel;
        this.catalogView = catalogView;
        // Quitamos los binds de aquí para que no busquen en un DOM vacío al iniciar la SPA
    }

    // Método para arrancar el catálogo al cargar la página
    async init() {
        // 1. Escaneamos los elementos del nuevo HTML inyectado
        this.catalogView.initElements();

        // 2. Vinculamos los eventos ahora que los botones ya existen en la pantalla
        this.catalogView.bindFilters(this.handleFilterChange);
        this.catalogView.bindAddToCart(this.handleAddToCart);
        this.catalogView.bindAddReview(this.handleIdAddReview);

        this.catalogView.showLoading(true);
        
        // Inicializa los productos (consume la API externa si es la primera vez)
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

    handleFilterChange = (filters) => {
        const { searchTerm, category, maxPrice } = filters;
        let filteredProducts = this.productModel.getProducts();

        // Filtro por texto de búsqueda
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(p => 
                p.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro por categoría selecta
        if (category && category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        // Filtro por rango de precio máximo
        if (maxPrice) {
            filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Le mandamos los productos filtrados finales a la vista para que los dibuje
        this.catalogView.renderProducts(filteredProducts);
    };

    // Maneja la acción cuando el usuario hace clic en "Agregar al carrito" desde una tarjeta de producto
    handleAddToCart = (productId) => {
        const products = this.productModel.getProducts();
        const product = products.find(p => p.id === parseInt(productId));
        
        if (product) {
            this.cartModel.addProduct(product);
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