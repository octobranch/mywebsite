// ========================================
// CONFIGURACIÓN PERSONALIZABLE
// ========================================

const CONFIG = {
    // NÚMERO DE WHATSAPP (incluye código de país sin +)
    whatsappNumber: '5219999999999', // Cambia por tu número
    
    // MENSAJE PREDETERMINADO
    defaultMessage: '¡Hola! Me interesa obtener más información sobre sus servicios.',
    
    // CONFIGURACIÓN DEL PDF
    pdfConfig: {
        fallbackDelay: 3000, // Tiempo en ms antes de mostrar fallback si no carga
        loadingTimeout: 5000  // Tiempo máximo de loading
    },
    
    // TEXTOS PERSONALIZABLES
    texts: {
        whatsappTooltip: '¡Escríbenos!',
        loadingText: 'Cargando PDF...',
        fallbackTitle: 'Ver PDF',
        fallbackDescription: 'Tu dispositivo no puede mostrar el PDF directamente.',
        downloadButton: 'Descargar PDF'
    }
};

// ========================================
// VARIABLES GLOBALES
// ========================================
let isWhatsAppClicked = false;
let pdfLoadTimeout;
let fallbackTimeout;

// ========================================
// INICIALIZACIÓN CUANDO EL DOM ESTÁ LISTO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ========================================
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ========================================
function initializeApp() {
    initializeWhatsApp();
    initializePDF();
    initializeResponsive();
    
    // Actualizar textos personalizables
    updateCustomTexts();
    
    console.log('📱 Plantilla PDF + WhatsApp inicializada correctamente');
}

// ========================================
// CONFIGURACIÓN DEL BOTÓN DE WHATSAPP
// ========================================
function initializeWhatsApp() {
    const whatsappBtn = document.getElementById('whatsappBtn');
    
    if (whatsappBtn) {
        // Event listener para el click
        whatsappBtn.addEventListener('click', handleWhatsAppClick);
        
        // Event listener para hover en desktop
        whatsappBtn.addEventListener('mouseenter', handleWhatsAppHover);
        
        // Event listener para touch en móviles
        whatsappBtn.addEventListener('touchstart', handleWhatsAppTouch, {passive: true});
    }
}

// ========================================
// MANEJO DEL CLICK EN WHATSAPP
// ========================================
function handleWhatsAppClick(e) {
    e.preventDefault();
    
    if (isWhatsAppClicked) return;
    isWhatsAppClicked = true;
    
    // Animación de click
    animateWhatsAppButton();
    
    // Generar URL de WhatsApp
    const whatsappUrl = generateWhatsAppURL();
    
    // Abrir WhatsApp
    openWhatsApp(whatsappUrl);
    
    // Reset del flag después de un tiempo
    setTimeout(() => {
        isWhatsAppClicked = false;
    }, 1000);
}

// ========================================
// GENERAR URL DE WHATSAPP
// ========================================
function generateWhatsAppURL() {
    const message = encodeURIComponent(CONFIG.defaultMessage);
    const number = CONFIG.whatsappNumber;
    
    // Detectar si es móvil para usar la app o web
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        return `https://api.whatsapp.com/send?phone=${number}&text=${message}`;
    } else {
        return `https://web.whatsapp.com/send?phone=${number}&text=${message}`;
    }
}

// ========================================
// ABRIR WHATSAPP
// ========================================
function openWhatsApp(url) {
    try {
        // Intentar abrir en la misma ventana primero
        const whatsappWindow = window.open(url, '_blank', 'noopener,noreferrer');
        
        if (!whatsappWindow) {
            // Si se bloquea el popup, intentar redirección directa
            window.location.href = url;
        }
        
        // Analytics o tracking aquí si es necesario
        trackWhatsAppClick();
        
    } catch (error) {
        console.error('Error al abrir WhatsApp:', error);
        // Fallback: redirección directa
        window.location.href = url;
    }
}

// ========================================
// ANIMACIONES DEL BOTÓN WHATSAPP
// ========================================
function animateWhatsAppButton() {
    const btn = document.getElementById('whatsappBtn');
    if (!btn) return;
    
    // Añadir clase de animación
    btn.style.transform = 'scale(0.95)';
    btn.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 100);
    
    // Efecto de ripple
    createRippleEffect(btn);
}

// ========================================
// EFECTO RIPPLE
// ========================================
function createRippleEffect(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = rect.width / 2;
    const y = rect.height / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x - size / 2 + 'px';
    ripple.style.top = y - size / 2 + 'px';
    ripple.classList.add('ripple');
    
    // Añadir estilos CSS dinámicamente si no existen
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ========================================
// MANEJO DE EVENTOS HOVER Y TOUCH
// ========================================
function handleWhatsAppHover() {
    const btn = document.getElementById('whatsappBtn');
    if (btn && !btn.classList.contains('touching')) {
        // Lógica adicional para hover si es necesaria
    }
}

function handleWhatsAppTouch() {
    const btn = document.getElementById('whatsappBtn');
    if (btn) {
        btn.classList.add('touching');
        setTimeout(() => {
            btn.classList.remove('touching');
        }, 300);
    }
}

// ========================================
// INICIALIZACIÓN DEL PDF
// ========================================
function initializePDF() {
    const pdfEmbed = document.querySelector('.pdf-embed');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const fallback = document.querySelector('.pdf-fallback');
    
    if (!pdfEmbed) return;
    
    // Configurar timeout para loading
    pdfLoadTimeout = setTimeout(() => {
        hideLoading();
    }, CONFIG.pdfConfig.loadingTimeout);
    
    // Configurar timeout para fallback
    fallbackTimeout = setTimeout(() => {
        showFallback();
    }, CONFIG.pdfConfig.fallbackDelay);
    
    // Event listeners para el PDF
    pdfEmbed.addEventListener('load', handlePDFLoad);
    pdfEmbed.addEventListener('error', handlePDFError);
    
    // Detectar si el navegador soporta PDFs embebidos
    if (!supportsPDFEmbeds()) {
        showFallback();
    }
}

// ========================================
// MANEJO DE CARGA DEL PDF
// ========================================
function handlePDFLoad() {
    console.log('📄 PDF cargado correctamente');
    hideLoading();
    clearTimeout(fallbackTimeout);
}

function handlePDFError() {
    console.warn('⚠️ Error al cargar el PDF, mostrando fallback');
    hideLoading();
    showFallback();
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
    }
    clearTimeout(pdfLoadTimeout);
}

function showFallback() {
    const fallback = document.querySelector('.pdf-fallback');
    const pdfEmbed = document.querySelector('.pdf-embed');
    
    if (fallback && pdfEmbed) {
        pdfEmbed.style.display = 'none';
        fallback.style.display = 'flex';
    }
    
    hideLoading();
}

// ========================================
// DETECTAR SOPORTE PARA PDF EMBEBIDOS
// ========================================
function supportsPDFEmbeds() {
    // Detectar navegadores que no soportan PDFs embebidos
    const unsupportedBrowsers = /Edge|Trident|MSIE/i;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (unsupportedBrowsers.test(navigator.userAgent)) {
        return false;
    }
    
    // En móviles, muchos navegadores no soportan PDFs embebidos
    if (isMobile) {
        return false;
    }
    
    return true;
}

// ========================================
// FUNCIONALIDAD RESPONSIVE
// ========================================
function initializeResponsive() {
    // Ajustar altura en móviles considerando la barra de navegación
    adjustMobileHeight();
    
    // Event listener para cambios de orientación
    window.addEventListener('orientationchange', () => {
        setTimeout(adjustMobileHeight, 100);
    });
    
    // Event listener para resize
    window.addEventListener('resize', debounce(adjustMobileHeight, 250));
}

function adjustMobileHeight() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // Ajustar altura considerando viewport height real en móviles
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Actualizar altura del PDF wrapper
        const pdfWrapper = document.querySelector('.pdf-wrapper');
        if (pdfWrapper) {
            pdfWrapper.style.height = `calc(var(--vh, 1vh) * 100 - 20px)`;
        }
    }
}

// ========================================
// ACTUALIZAR TEXTOS PERSONALIZABLES
// ========================================
function updateCustomTexts() {
    // Actualizar tooltip de WhatsApp
    const tooltip = document.querySelector('.whatsapp-tooltip');
    if (tooltip) {
        tooltip.textContent = CONFIG.texts.whatsappTooltip;
    }
    
    // Actualizar textos de loading
    const loadingText = document.querySelector('.loading-spinner p');
    if (loadingText) {
        loadingText.textContent = CONFIG.texts.loadingText;
    }
    
    // Actualizar textos de fallback
    const fallbackTitle = document.querySelector('.fallback-content h3');
    const fallbackDesc = document.querySelector('.fallback-content p');
    const downloadBtn = document.querySelector('.pdf-download-btn');
    
    if (fallbackTitle) fallbackTitle.textContent = CONFIG.texts.fallbackTitle;
    if (fallbackDesc) fallbackDesc.textContent = CONFIG.texts.fallbackDescription;
    if (downloadBtn) {
        downloadBtn.innerHTML = `<i class="fas fa-download"></i> ${CONFIG.texts.downloadButton}`;
    }
}

// ========================================
// UTILIDADES
// ========================================

// Función debounce para optimizar eventos de resize
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Tracking de clicks en WhatsApp (opcional)
function trackWhatsAppClick() {
    // Aquí puedes añadir Google Analytics, Facebook Pixel, etc.
    console.log('📊 Click en WhatsApp registrado');
    
    // Ejemplo para Google Analytics (si está configurado)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            event_category: 'WhatsApp',
            event_label: 'Floating Button',
            value: 1
        });
    }
}

// ========================================
// API PÚBLICA PARA PERSONALIZACIÓN
// ========================================
window.PDFWhatsAppTemplate = {
    // Cambiar número de WhatsApp
    setWhatsAppNumber: function(number) {
        CONFIG.whatsappNumber = number;
        console.log(`📱 Número de WhatsApp actualizado: ${number}`);
    },
    
    // Cambiar mensaje predeterminado
    setDefaultMessage: function(message) {
        CONFIG.defaultMessage = message;
        console.log(`💬 Mensaje predeterminado actualizado: ${message}`);
    },
    
    // Abrir WhatsApp programáticamente
    openWhatsApp: function(customMessage) {
        const originalMessage = CONFIG.defaultMessage;
        if (customMessage) {
            CONFIG.defaultMessage = customMessage;
        }
        
        const url = generateWhatsAppURL();
        openWhatsApp(url);
        
        CONFIG.defaultMessage = originalMessage;
    },
    
    // Mostrar/ocultar botón de WhatsApp
    toggleWhatsAppButton: function(show = true) {
        const btn = document.getElementById('whatsappBtn');
        if (btn) {
            btn.style.display = show ? 'flex' : 'none';
        }
    },
    
    // Obtener configuración actual
    getConfig: function() {
        return { ...CONFIG };
    }
};

// ========================================
// MANEJO DE ERRORES GLOBALES
// ========================================
window.addEventListener('error', function(e) {
    console.error('💥 Error en la plantilla:', e.error);
    
    // Si hay problemas con el PDF, mostrar fallback
    if (e.error && e.error.message && e.error.message.includes('pdf')) {
        showFallback();
    }
});

// Logs de inicialización
console.log('🚀 Script de plantilla PDF + WhatsApp cargado');
console.log('📋 Configuración actual:', CONFIG);