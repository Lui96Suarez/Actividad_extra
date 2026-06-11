export class AdminView {
    constructor() {
        // Inicializa vacío para preservar el comportamiento SPA asíncrono
    }

    initElements() {
        // Métricas
        this.revenueElement = document.getElementById('metric-revenue');
        this.usersElement = document.getElementById('metric-users');
        this.topProductsElement = document.getElementById('metric-top-products');

        // Formulario de Productos
        this.productForm = document.getElementById('product-form');
        this.idInput = document.getElementById('product-id');
        this.titleInput = document.getElementById('product-title');
        this.priceInput = document.getElementById('product-price');
        this.categoryInput = document.getElementById('product-category');
        this.imageInput = document.getElementById('product-image');
        this.descriptionInput = document.getElementById('product-description');
        this.submitButton = document.getElementById('btn-submit-product');
        this.cancelButton = document.getElementById('btn-cancel-edit');

        // Tablas
        this.inventoryTableBody = document.getElementById('inventory-table-body');
        this.salesTableBody = document.getElementById('sales-table-body');

        // Evento para cancelar edición
        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', () => this.resetForm());
        }
    }

    // --- RENDERIZADO DE MÉTRICAS (MÓDULO 6) ---
    renderMetrics(metrics) {
        if (!this.revenueElement) return;
        this.revenueElement.textContent = `$${metrics.totalRevenue}`;
        this.usersElement.textContent = `${metrics.activeUsers} Activos / ${metrics.totalUsers} Reg.`;

        this.topProductsElement.innerHTML = metrics.topProducts.length > 0 
            ? metrics.topProducts.map(p => `<li>${p.title} (${p.qty} u.)</li>`).join('')
            : '<li>No hay ventas registradas aún.</li>';
    }

    // --- RENDERIZADO DEL CRUD (MÓDULO 4) ---
    renderInventoryTable(products) {
        if (!this.inventoryTableBody) return;
        this.inventoryTableBody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="thumb" class="admin-table-thumb"></td>
                <td><strong>${product.title}</strong></td>
                <td><span class="badge">${product.category}</span></td>
                <td>$${product.price}</td>
                <td>
                    <button class="btn-edit btn-small" data-id="${product.id}">✏️ Editar</button>
                    <button class="btn-delete btn-small" data-id="${product.id}">🗑️ Eliminar</button>
                </td>
            `;
            this.inventoryTableBody.appendChild(row);
        });

        this.setupInlineTableEvents(products);
    }

    // --- RENDERIZADO DEL HISTORIAL DE VENTAS (MÓDULO 6) ---
    renderSalesTable(orders) {
        if (!this.salesTableBody) return;
        this.salesTableBody.innerHTML = '';

        if (orders.length === 0) {
            this.salesTableBody.innerHTML = '<tr><td colspan="6">No se han procesado compras en la tienda.</td></tr>';
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.email}</td>
                <td>${order.date}</td>
                <td><strong>$${order.total}</strong></td>
                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>
                    <select class="change-status-select" data-order-id="${order.id}">
                        <option value="Pendiente" ${order.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="Enviado" ${order.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="Entregado" ${order.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                    </select>
                </td>
            `;
            this.salesTableBody.appendChild(row);
        });
    }

    // --- ENLACE DE EVENTOS CON EL CONTROLADOR ---

    bindCreateProduct(handlerCreate) {
        if (!this.productForm) return;
        this.productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Si el ID oculto está vacío, es una creación pura
            if (this.idInput.value === '') {
                handlerCreate({
                    title: this.titleInput.value,
                    price: parseFloat(this.priceInput.value),
                    category: this.categoryInput.value,
                    image: this.imageInput.value,
                    description: this.descriptionInput.value
                });
                this.resetForm();
            }
        });
    }

    bindUpdateProduct(handlerUpdate) {
        if (!this.productForm) return;
        this.productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Si el ID oculto tiene valor, estamos procesando una actualización
            if (this.idInput.value !== '') {
                const id = parseInt(this.idInput.value);
                handlerUpdate(id, {
                    title: this.titleInput.value,
                    price: parseFloat(this.priceInput.value),
                    category: this.categoryInput.value,
                    image: this.imageInput.value,
                    description: this.descriptionInput.value
                });
                this.resetForm();
            }
        });
    }

    bindDeleteProduct(handlerDelete) {
        this._handlerDelete = handlerDelete; // Guardamos la referencia para usarla internamente
    }

    bindUpdateOrderStatus(handlerStatus) {
        if (!this.salesTableBody) return;
        this.salesTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('change-status-select')) {
                const orderId = parseInt(e.target.getAttribute('data-order-id'));
                const newStatus = e.target.value;
                handlerStatus(orderId, newStatus);
            }
        });
    }

    // Carga los datos de la fila de la tabla hacia los campos del formulario para poder editar
    setupInlineTableEvents(products) {
        this.inventoryTableBody.addEventListener('click', (e) => {
            const target = e.target;
            const id = parseInt(target.getAttribute('data-id'));
            if (!id) return;

            if (target.classList.contains('btn-edit')) {
                const product = products.find(p => p.id === id);
                if (product) {
                    this.idInput.value = product.id;
                    this.titleInput.value = product.title;
                    this.priceInput.value = product.price;
                    this.categoryInput.value = product.category;
                    this.imageInput.value = product.image;
                    this.descriptionInput.value = product.description;
                    
                    this.submitButton.textContent = 'Actualizar Cambios';
                    this.cancelButton.style.display = 'inline-block';
                }
            } else if (target.classList.contains('btn-delete')) {
                if (confirm('¿Estás seguro de que deseas eliminar este producto de la base de datos local?')) {
                    if (this._handlerDelete) this._handlerDelete(id);
                }
            }
        });
    }

    resetForm() {
        if (this.productForm) this.productForm.reset();
        this.idInput.value = '';
        this.submitButton.textContent = 'Guardar Producto';
        this.cancelButton.style.display = 'none';
    }
}