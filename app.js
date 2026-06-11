import { User } from './models/User.js';
import { AuthView } from './view/AuthView.js';
import { AuthController } from './controllers/AuthController.js';
import { Product } from './models/Product.js';
import { Cart } from './models/Cart.js';
import { CatalogView } from './view/CatalogView.js';
import { CatalogController } from './controllers/CatalogController.js';
import { CartView } from './view/CartView.js';
import { CartController } from './controllers/CartController.js';
import { AdminView } from './view/AdminView.js';
import { AdminController } from './controllers/AdminController.js';

// Instancias globales persistentes durante el ciclo de vida de la SPA
const userModel = new User();
const authView = new AuthView();
const authController = new AuthController(userModel, authView);
const productModel = new Product();
const cartModel = new Cart();
const catalogView = new CatalogView();
const catalogController = new CatalogController(productModel, cartModel, catalogView);
const cartView = new CartView();
const cartController = new CartController(cartModel, productModel, cartView);
const adminView = new AdminView();
const adminController = new AdminController(productModel, adminView);

const routes = {
    '#/': './html/landing.html',
    '#/landing': './html/landing.html',
    '#/auth': './html/auth.html',
    '#/catalog': './html/catalog.html',
    '#/cart': './html/cart.html',
    '#/admin': './html/admin.html',
};

async function router() {
    const hash = window.location.hash || '#/';
    const viewContainer = document.getElementById('view-container');
    
    // 1. Verificación de Seguridad / Roles
    const session = userModel.getCurrentSession();
    
    if (hash === '#/admin' && (!session || session.role !== 'Administrador')) {
        window.location.hash = '#/'; // Redirigir al inicio si no es admin 
        alert('Acceso denegado. Se requieren permisos de Administrador.');
        return;
    }

    // 2. Buscar la vista correspondiente
    const viewUrl = routes[hash];
    if (viewUrl) {
        try {
            const response = await fetch(viewUrl);
            
            // CORRECCIÓN: Para obtener el HTML en texto plano se usa response.text() directamente
            const htmlContent = await response.text();
            viewContainer.innerHTML = htmlContent;

            // 3. Inicializar el controlador correspondiente según la ruta
            // Ahora que el HTML ya está inyectado, los controladores podrán encontrar sus botones
            initializeController(hash);
        } catch (error) {
            console.error('Error en el enrutador:', error);
            viewContainer.innerHTML = '<h2>Error al cargar la página</h2>';
        }
    } else {
        viewContainer.innerHTML = '<h2>404 - Página no encontrada</h2>';
    }
}

function initializeController(hash) {
    switch (hash) {
        case '#/':
        case '#/landing':
            // Si en el futuro necesitas un LandingController, lo inicializas aquí.
            console.log('Cargada la página de inicio.');
            break;

        case '#/auth':
            authController.init();
            break;

        case '#/catalog':
            catalogController.init();
            break;

        case '#/cart':
            cartController.init();
            break;

        case '#/admin':
            adminController.init();
            break;

        default:
            console.warn(`Ruta sin inicializador específico: ${hash}`);
            break;
    }
}

// --- DETECTOR DE ESTADO DE RED (ONLINE / OFFLINE) ---
function updateOnlineStatus() {
    const statusEl = document.getElementById('connection-status');
    if (!statusEl) return;

    if (navigator.onLine) {
        statusEl.textContent = "Online";
        statusEl.style.backgroundColor = "var(--success)";
    } else {
        statusEl.textContent = "Modo Offline";
        statusEl.style.backgroundColor = "var(--danger)";
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
// Ejecución inicial por si arranca sin conexión
document.addEventListener('DOMContentLoaded', updateOnlineStatus);

// --- CONTROLADOR DE MODO OSCURO / CLARO ---
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Verificar si el usuario ya tenía una preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            // Persistir la elección en localStorage
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }
});

// Escuchar cambios de ruta y carga inicial
window.addEventListener('hashchange', router);
window.addEventListener('load', router);