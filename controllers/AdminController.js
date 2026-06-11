export class AdminController {
    constructor(productModel, adminView) {
        this.productModel = productModel;
        this.adminView = adminView;
    }

    // Arranca el panel de administración cargando tablas y métricas
    init() {
        // 1. Escaneamos los elementos del HTML del administrador recién inyectado
        this.adminView.initElements();

        // 2. Vinculamos los eventos de la interfaz con los manejadores
        this.adminView.bindCreateProduct(this.handleCreateProduct);
        this.adminView.bindUpdateProduct(this.handleUpdateProduct);
        this.adminView.bindDeleteProduct(this.handleDeleteProduct);
        this.adminView.bindUpdateOrderStatus(this.handleUpdateOrderStatus);

        // 3. Renderizamos la información inicial del panel
        this.renderDashboard();
        this.renderInventory();
        this.renderSalesHistory();
    }

    // --- 1. MÓDULO DE RESEÑAS Y PANEL VISUAL (MÉTRICAS) --
    renderDashboard() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Métrica A: Total de ingresos generados
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        // Métrica B: Contador de usuarios registrados vs. activos
        const totalUsers = users.length;
        const activeSession = sessionStorage.getItem('activeSession');
        const activeUsersCount = activeSession ? 1 : 0; 

        this.adminView.renderMetrics(totalRevenue, activeUsersCount, totalUsers);
    }

    // --- 2. GESTIÓN DE INVENTARIO (CRUD) ---
    renderInventory() {
        const products = this.productModel.getProducts();
        this.adminView.renderInventoryTable(products);
    }

    handleCreateProduct = (productData) => {
        const response = this.productModel.addProduct(productData);
        if (response.success) {
            this.renderInventory(); // Refrescamos la tabla de productos
            this.renderDashboard(); // Refrescamos las métricas por si acaso
        }
    };

    handleUpdateProduct = (id, updatedData) => {
        const response = this.productModel.updateProduct(id, updatedData);
        if (response.success) {
            this.renderInventory();
        }
    };

    handleDeleteProduct = (id) => {
        const response = this.productModel.deleteProduct(id);
        if (response.success) {
            this.renderInventory();
            this.renderDashboard();
        }
    };

    // --- 3. ADMINISTRACIÓN DE VENTAS (HISTORIAL) ---
    renderSalesHistory() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.adminView.renderSalesTable(orders);
    }

    handleUpdateOrderStatus = (orderId, newStatus) => {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus; // 'Pendiente', 'Enviado' o 'Entregado'
            localStorage.setItem('orders', JSON.stringify(orders));
            this.renderSalesHistory(); // Actualizamos la tabla visual de órdenes
        }
    };
}