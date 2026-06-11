export class Product {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
    }

    async initCatalog() {
        // CORRECCIÓN: Se cambió 'lenght' por 'length'
        if (this.products.length === 0) {
            try {
                const response = await fetch('https://fakestoreapi.com/products');
                const data = await response.json();

                this.products = data;
                this.saveLocally();
                return { success: true, message: 'Catálogo inicial cargado desde la API' };
            } catch (error) {
                return { success: false, message: 'Error al cargar la API' };
            }
        }

        return { success: true, message: 'Catálogo cargado desde local.' };
    }

    saveLocally() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    getProducts() {
        return this.products;
    }

    addProduct(productData) {
        // CORRECCIÓN: Se cambió 'lenght' por 'length'
        const newID = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
        const newProduct = { id: newID, ...productData };

        this.products.push(newProduct);
        this.saveLocally();
        return { success: true, product: newProduct };
    }

    updateProduct(id, updateData) {
        const index = this.products.findIndex((p) => p.id === id);
        if (index !== -1) {
            // CORRECCIÓN: Se cambió 'this.prodcuts' por 'this.products'
            this.products[index] = { ...this.products[index], ...updateData };
            this.saveLocally();
            return { success: true, product: this.products[index] };
        }
        return { success: false, message: 'Producto no encontrado' };
    }

    deleteProduct(id) {
        // CORRECCIÓN: Se cambió 'lenght' por 'length'
        const initialLength = this.products.length;
        
        // CORRECCIÓN: Se cambió 'this.prodcuts' por 'this.products'
        this.products = this.products.filter(p => p.id !== id);
        
        if (this.products.length < initialLength) {
            this.saveLocally();
            return { success: true, message: 'Producto eliminado con éxito' };
        }
        return { success: false, message: 'Producto no encontrado' };
    }
}