export class AdminController {
    constructor(productModel, adminView) {
        this.productModel = productModel;
        this.adminView = adminView;

        // Vinculamos los eventos de la interfaz de administración con este controlador
        this.adminView.bindCreateProduct(this.handleCreateProduct);
        this.adminView.bindUpdateProduct(this.handleUpdateProduct);
        this.adminView.bindDeleteProduct(this.handleDeleteProduct);
        this.adminView.bindUpdateOrderStatus(this.handleUpdateOrderStatus);
    }

    // Arranca el panel de administración cargando tablas y métricas
    init() {
        this.renderDashboard();
        this.renderInventory();
        this.renderSalesHistory();
    }

    // --- 1. MÓDULO DE RESEÑAS Y PANEL VISUAL (MÉTRICAS) ---
    renderDashboard() {
        // Obtenemos las órdenes de compra y los usuarios para calcular estadísticas
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Métrica A: Total de ingresos generados
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        // Métrica B: Contador de usuarios registrados vs. activos (simulación basada en sesión)
        const totalUsers = users.length;
        const activeSession = sessionStorage.getItem('activeSession');
        // Simulamos usuarios activos contando al actual y a los que tengan órdenes recientes
        const activeUsers = users.filter(u => u.email === (activeSession ? JSON.parse(activeSession).email : '') || orders.some(o => o.email === u.email)).length;

        // Métrica C: Top 3 productos más vendidos
        const productCounts = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                productCounts[item.title] = (productCounts[item.title] || 0) + item.quantity;
            });
        });

        const topProducts = Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1]) // Ordenamos de mayor a menor cantidad
            .slice(0, 3)                // Tomamos solo los 3 primeros
            .map(([title, qty]) => ({ title, qty }));

        // Enviamos todo empaquetado a la vista para que dibuje las gráficas/tarjetas
        this.adminView.renderMetrics({
            totalRevenue: Number(totalRevenue.toFixed(2)),
            totalUsers,
            activeUsers,
            topProducts
        });
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
            this.renderSalesHistory(); // Refrescamos la tabla de ventas
        }
    };
}