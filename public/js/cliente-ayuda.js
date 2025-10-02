// cliente-ayuda.js

let usuarioActual = null;

// Al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarAyuda();
    configurarEventListeners();
});

// Inicializar página de ayuda
function inicializarAyuda() {
    try {
        // Verificar autenticación
        usuarioActual = obtenerUsuarioActual();
        if (!usuarioActual) {
            window.location.href = '/';
            return;
        }

        console.log('Usuario autenticado:', usuarioActual);

        // Actualizar nombre del usuario en la UI
        actualizarNombreUsuario();

    } catch (error) {
        console.error('Error al inicializar ayuda:', error);
    }
}

// Obtener usuario actual
function obtenerUsuarioActual() {
    const usuario = sessionStorage.getItem('usuario');
    if (!usuario) return null;
    
    try {
        return JSON.parse(usuario);
    } catch (error) {
        console.error('Error al parsear usuario:', error);
        return null;
    }
}

// Actualizar nombre del usuario
function actualizarNombreUsuario() {
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = usuarioActual.nombre;
    });
}

// Configurar event listeners
function configurarEventListeners() {
    // Búsqueda en ayuda
    const searchInput = document.getElementById('searchHelp');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Links de ayuda rápida
    const helpLinks = document.querySelectorAll('.help-link');
    helpLinks.forEach(link => {
        link.addEventListener('click', handleHelpLinkClick);
    });

    // Cerrar sesión
    const cerrarSesionBtn = document.getElementById('cerrarSesionBtn');
    if (cerrarSesionBtn) {
        cerrarSesionBtn.addEventListener('click', handleCerrarSesion);
    }
}

// Continuación de cliente-ayuda.js

// Manejar búsqueda
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const button = item.querySelector('.accordion-button');
        const body = item.querySelector('.accordion-body');
        const text = (button.textContent + body.textContent).toLowerCase();

        if (text.includes(searchTerm)) {
            item.style.display = '';
            // Resaltar coincidencias
            if (searchTerm.length > 2) {
                item.classList.add('highlight-match');
            } else {
                item.classList.remove('highlight-match');
            }
        } else {
            item.style.display = 'none';
        }
    });

    // Mensaje si no hay resultados
    const visibleItems = Array.from(accordionItems).filter(item => item.style.display !== 'none');
    
    let noResultsMessage = document.getElementById('noResultsMessage');
    
    if (visibleItems.length === 0 && searchTerm.length > 0) {
        if (!noResultsMessage) {
            noResultsMessage = document.createElement('div');
            noResultsMessage.id = 'noResultsMessage';
            noResultsMessage.className = 'alert alert-warning text-center';
            noResultsMessage.innerHTML = `
                <i class="bi bi-search me-2"></i>
                No se encontraron resultados para "<strong>${searchTerm}</strong>"
            `;
            document.querySelector('.accordion').before(noResultsMessage);
        }
    } else {
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
}

// Manejar clic en enlaces de ayuda rápida
function handleHelpLinkClick(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
        // Scroll suave al elemento
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Abrir el acordeón si está cerrado
        const collapseButton = targetElement.querySelector('.accordion-button');
        const collapseElement = targetElement.querySelector('.accordion-collapse');

        if (collapseButton && collapseElement) {
            if (collapseElement.classList.contains('collapse') && 
                !collapseElement.classList.contains('show')) {
                collapseButton.click();
            }

            // Agregar efecto de resaltado temporal
            setTimeout(() => {
                targetElement.classList.add('highlight-temp');
                setTimeout(() => {
                    targetElement.classList.remove('highlight-temp');
                }, 2000);
            }, 500);
        }
    }
}

// Manejar formulario de contacto
async function handleContactForm(e) {
    e.preventDefault();

    const asunto = document.getElementById('asunto').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    if (!asunto || !mensaje) {
        mostrarAlerta('Por favor completa todos los campos', 'warning');
        return;
    }

    try {
        // Aquí podrías hacer una llamada a la API para enviar el mensaje
        // Por ahora simularemos el envío
        
        const datosContacto = {
            usuario_id: usuarioActual.id,
            nombre: usuarioActual.nombre,
            email: usuarioActual.email,
            asunto: asunto,
            mensaje: mensaje,
            fecha: new Date().toISOString()
        };

        console.log('Datos de contacto:', datosContacto);

        // Simular envío exitoso
        await new Promise(resolve => setTimeout(resolve, 1000));

        mostrarAlerta('Mensaje enviado correctamente. Te responderemos pronto.', 'success');
        
        // Limpiar formulario
        document.getElementById('contactForm').reset();

        // En producción, aquí harías:
        /*
        const response = await fetch('/api/contacto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosContacto)
        });

        if (!response.ok) throw new Error('Error al enviar mensaje');
        */

    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        mostrarAlerta('Error al enviar el mensaje. Inténtalo de nuevo.', 'danger');
    }
}

// Manejar cerrar sesión
function handleCerrarSesion(e) {
    e.preventDefault();
    
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        sessionStorage.removeItem('usuario');
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = '/';
    }
}

// Mostrar alerta
function mostrarAlerta(mensaje, tipo) {
    // Crear elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Función para rastrear interacciones (opcional, para analytics)
function trackHelpInteraction(action, details) {
    console.log('Help Interaction:', {
        usuario: usuarioActual.nombre,
        action: action,
        details: details,
        timestamp: new Date().toISOString()
    });
    
    // Aquí podrías enviar estos datos a un servicio de analytics
}

// Event listener para tracking de acordeones
document.addEventListener('shown.bs.collapse', function(e) {
    const accordionButton = e.target.previousElementSibling.querySelector('.accordion-button');
    if (accordionButton) {
        const question = accordionButton.textContent.trim();
        trackHelpInteraction('faq_opened', question);
    }
});

// Event listener para tracking de búsqueda
let searchTimeout;
document.getElementById('searchHelp')?.addEventListener('input', function(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (e.target.value.length > 2) {
            trackHelpInteraction('search', e.target.value);
        }
    }, 1000);
});