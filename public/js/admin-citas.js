// admin-citas.js - Gestión completa de citas

// ==================== VARIABLES GLOBALES ====================
let todasLasCitas = [];
let citasFiltradas = [];
let citaActual = null;
let usuarioActual = null;

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', async function() {
  await verificarAutenticacion();
  await cargarCitas();
  configurarEventListeners();
  iniciarActualizacionAutomatica();
});

// ==================== AUTENTICACIÓN ====================

async function verificarAutenticacion() {
  const usuario = sessionStorage.getItem('usuario');
  
  if (!usuario) {
    alert('Debe iniciar sesión para acceder al panel de administración');
    window.location.href = '/';
    return;
  }

  try {
    usuarioActual = JSON.parse(usuario);
    
    if (usuarioActual.rol !== 'admin') {
      alert('No tiene permisos para acceder a esta sección');
      window.location.href = '/';
      return;
    }

    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = usuarioActual.nombre;
    });

    console.log('✅ Admin autenticado:', usuarioActual.nombre);
  } catch (error) {
    console.error('❌ Error al verificar autenticación:', error);
    window.location.href = '/';
  }
}

// ==================== CARGA DE DATOS ====================

async function cargarCitas() {
  try {
    console.log('📅 Cargando citas...');
    mostrarCargando();

    // Actualizar citas pasadas primero
    await actualizarCitasPasadas();

    // Obtener todas las citas
    const response = await fetch('/api/citas');
    if (!response.ok) throw new Error('Error al obtener citas');
    
    todasLasCitas = await response.json();
    console.log(`📊 Total de citas cargadas: ${todasLasCitas.length}`);

    // Actualizar estadísticas
    actualizarEstadisticas();

    // Mostrar citas en el tab activo
    mostrarCitasPorTab('todas');

    actualizarHora();
    console.log('✅ Citas cargadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error al cargar citas:', error);
    mostrarError('Error al cargar las citas. Por favor, recargue la página.');
  }
}

async function actualizarCitasPasadas() {
  try {
    console.log('🔄 Actualizando citas pasadas...');
    
    const response = await fetch('/api/citas/actualizar-pasadas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${result.citasActualizadas || 0} cita(s) actualizada(s)`);
    }
  } catch (error) {
    console.error('⚠️ Error al actualizar citas pasadas:', error);
  }
}

// ==================== ESTADÍSTICAS ====================

function actualizarEstadisticas() {
  const stats = {
    pendientes: todasLasCitas.filter(c => c.estado === 'pendiente').length,
    confirmadas: todasLasCitas.filter(c => c.estado === 'confirmada').length,
    completadas: todasLasCitas.filter(c => c.estado === 'completada').length,
    canceladas: todasLasCitas.filter(c => c.estado === 'cancelada').length
  };

  // Actualizar tarjetas de estadísticas
  document.getElementById('statPendientes').textContent = stats.pendientes;
  document.getElementById('statConfirmadas').textContent = stats.confirmadas;
  document.getElementById('statCompletadas').textContent = stats.completadas;
  document.getElementById('statCanceladas').textContent = stats.canceladas;

  // Actualizar widget del sidebar
  document.getElementById('totalCitasWidget').textContent = todasLasCitas.length;
}

// ==================== MOSTRAR CITAS POR TAB ====================

function mostrarCitasPorTab(tab) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaHoy = hoy.toISOString().split('T')[0];

  let citas = [...todasLasCitas];
  let containerId = '';

  switch(tab) {
    case 'todas':
      containerId = 'todasCitasContainer';
      citas.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora || '00:00'}`);
        const fechaB = new Date(`${b.fecha}T${b.hora || '00:00'}`);
        return fechaB - fechaA;
      });
      break;

    case 'hoy':
      containerId = 'hoyCitasContainer';
      citas = citas.filter(c => c.fecha === fechaHoy);
      citas.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
      break;

    case 'proximas':
      containerId = 'proximasCitasContainer';
      citas = citas.filter(c => {
        const fechaCita = new Date(c.fecha);
        fechaCita.setHours(0, 0, 0, 0);
        return fechaCita > hoy && (c.estado === 'pendiente' || c.estado === 'confirmada');
      });
      citas.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora || '00:00'}`);
        const fechaB = new Date(`${b.fecha}T${b.hora || '00:00'}`);
        return fechaA - fechaB;
      });
      break;

    case 'anteriores':
      containerId = 'anterioresCitasContainer';
      citas = citas.filter(c => {
        const fechaCita = new Date(c.fecha);
        fechaCita.setHours(0, 0, 0, 0);
        return fechaCita < hoy;
      });
      citas.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora || '00:00'}`);
        const fechaB = new Date(`${b.fecha}T${b.hora || '00:00'}`);
        return fechaB - fechaA;
      });
      break;
  }

  citasFiltradas = citas;
  renderizarCitas(containerId, citas);
}

// ==================== RENDERIZAR CITAS ====================

function renderizarCitas(containerId, citas) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.warn(`⚠️ Container ${containerId} no encontrado`);
    return;
  }

  if (citas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-calendar-x"></i>
        <h4>No hay citas</h4>
        <p>No se encontraron citas en esta categoría</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-hover align-middle citas-table">
        <thead>
          <tr>
            <th width="10%">Fecha</th>
            <th width="8%">Hora</th>
            <th width="18%">Cliente</th>
            <th width="15%">Mascota</th>
            <th width="20%">Servicio</th>
            <th width="12%">Estado</th>
            <th width="10%">Sucursal</th>
            <th width="7%" class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  citas.forEach(cita => {
    const fecha = new Date(cita.fecha);
    const esHoy = fecha.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
    const estadoBadge = obtenerBadgeEstado(cita.estado);
    
    html += `
      <tr ${esHoy ? 'class="table-warning"' : ''}>
        <td>
          ${esHoy ? '<span class="badge bg-warning text-dark me-2">HOY</span>' : ''}
          <strong>${fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
        </td>
        <td>
          <span class="badge bg-primary">${cita.hora || '--:--'}</span>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <i class="bi bi-person-circle me-2 text-primary"></i>
            <div>
              <div class="fw-semibold">${cita.cliente_nombre || 'N/A'}</div>
              <small class="text-muted">${cita.cliente_telefono || ''}</small>
            </div>
          </div>
        </td>
        <td>
          <div class="d-flex align-items-center">
            <i class="bi bi-heart-fill me-2 text-danger"></i>
            <div>
              <div class="fw-semibold">${cita.mascota_nombre || 'N/A'}</div>
              <small class="text-muted">${cita.mascota_tipo || ''}</small>
            </div>
          </div>
        </td>
        <td>
          <div class="text-truncate" style="max-width: 200px;" title="${cita.servicio_nombre || 'N/A'}">
            <i class="bi bi-clipboard-pulse me-1 text-success"></i>
            ${cita.servicio_nombre || 'N/A'}
          </div>
        </td>
        <td>${estadoBadge}</td>
        <td>
          <small>${cita.sucursal_nombre || 'N/A'}</small>
        </td>
        <td class="text-center">
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-primary" onclick="verDetalleCita(${cita.id})" title="Ver detalles">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-warning" onclick="editarEstadoCita(${cita.id})" title="Editar estado">
              <i class="bi bi-pencil"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
    <div class="table-footer">
      <p class="mb-0 text-muted">Mostrando ${citas.length} cita(s)</p>
    </div>
  `;

  container.innerHTML = html;
}

function obtenerBadgeEstado(estado) {
  const badges = {
    'pendiente': '<span class="badge bg-warning text-dark"><i class="bi bi-clock me-1"></i>Pendiente</span>',
    'confirmada': '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Confirmada</span>',
    'completada': '<span class="badge bg-secondary"><i class="bi bi-check-all me-1"></i>Completada</span>',
    'cancelada': '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Cancelada</span>'
  };
  return badges[estado] || '<span class="badge bg-secondary">Desconocido</span>';
}

// ==================== DETALLES DE CITA ====================

window.verDetalleCita = async function(id) {
  try {
    const cita = todasLasCitas.find(c => c.id === id);
    if (!cita) {
      mostrarError('Cita no encontrada');
      return;
    }

    citaActual = cita;

    const fecha = new Date(cita.fecha);
    const estadoBadge = obtenerBadgeEstado(cita.estado);

    const html = `
      <div class="cita-detalle">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-calendar3 me-2"></i>Fecha</label>
              <p>${fecha.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-clock me-2"></i>Hora</label>
              <p><span class="badge bg-primary fs-6">${cita.hora || '--:--'}</span></p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-person-circle me-2"></i>Cliente</label>
              <p class="fw-semibold">${cita.cliente_nombre || 'N/A'}</p>
              <small class="text-muted">${cita.cliente_email || ''}</small><br>
              <small class="text-muted">${cita.cliente_telefono || ''}</small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-heart-fill text-danger me-2"></i>Mascota</label>
              <p class="fw-semibold">${cita.mascota_nombre || 'N/A'}</p>
              <small class="text-muted">${cita.mascota_tipo || ''} - ${cita.mascota_raza || ''}</small>
            </div>
          </div>
          <div class="col-md-12">
            <div class="info-group">
              <label><i class="bi bi-clipboard-pulse me-2"></i>Servicio</label>
              <p>${cita.servicio_nombre || 'N/A'}</p>
              <small class="text-muted">${cita.servicio_descripcion || ''}</small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-building me-2"></i>Sucursal</label>
              <p>${cita.sucursal_nombre || 'N/A'}</p>
              <small class="text-muted">${cita.sucursal_direccion || ''}</small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-flag me-2"></i>Estado</label>
              <p>${estadoBadge}</p>
            </div>
          </div>
          ${cita.notas ? `
          <div class="col-md-12">
            <div class="info-group">
              <label><i class="bi bi-journal-text me-2"></i>Notas</label>
              <p class="text-muted">${cita.notas}</p>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    document.getElementById('detallesCitaContent').innerHTML = html;
    
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleCita'));
    modal.show();

  } catch (error) {
    console.error('❌ Error al ver detalles:', error);
    mostrarError('Error al cargar los detalles de la cita');
  }
};

// ==================== EDITAR ESTADO ====================

window.editarEstadoCita = function(id) {
  const cita = todasLasCitas.find(c => c.id === id);
  if (!cita) {
    mostrarError('Cita no encontrada');
    return;
  }

  citaActual = cita;

  document.getElementById('editarCitaId').value = id;
  document.getElementById('editarEstado').value = cita.estado;
  document.getElementById('editarNotas').value = '';

  const modal = new bootstrap.Modal(document.getElementById('modalEditarEstado'));
  modal.show();
};

async function guardarEstadoCita() {
  try {
    const id = document.getElementById('editarCitaId').value;
    const nuevoEstado = document.getElementById('editarEstado').value;
    const notas = document.getElementById('editarNotas').value;

    if (!nuevoEstado) {
      mostrarError('Debe seleccionar un estado');
      return;
    }

    const btn = document.getElementById('btnGuardarEstado');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

    const response = await fetch(`/api/citas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: nuevoEstado,
        notas: notas || undefined
      })
    });

    if (!response.ok) throw new Error('Error al actualizar estado');

    mostrarExito('Estado actualizado correctamente');
    
    bootstrap.Modal.getInstance(document.getElementById('modalEditarEstado')).hide();
    
    await cargarCitas();

  } catch (error) {
    console.error('❌ Error al guardar estado:', error);
    mostrarError('Error al actualizar el estado de la cita');
  } finally {
    const btn = document.getElementById('btnGuardarEstado');
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Guardar';
  }
}

// ==================== CANCELAR CITA ====================

async function cancelarCita() {
  if (!citaActual) return;

  if (!confirm('¿Está seguro de cancelar esta cita?')) return;

  try {
    const response = await fetch(`/api/citas/${citaActual.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: 'cancelada',
        notas: 'Cancelada por administrador'
      })
    });

    if (!response.ok) throw new Error('Error al cancelar cita');

    mostrarExito('Cita cancelada correctamente');
    
    bootstrap.Modal.getInstance(document.getElementById('modalDetalleCita')).hide();
    
    await cargarCitas();

  } catch (error) {
    console.error('❌ Error al cancelar cita:', error);
    mostrarError('Error al cancelar la cita');
  }
}

// ==================== FILTROS Y BÚSQUEDA ====================

function aplicarFiltros() {
  const estado = document.getElementById('filtroEstado').value;
  const busqueda = document.getElementById('buscarCita').value.toLowerCase();

  let citas = [...citasFiltradas];

  // Filtrar por estado
  if (estado) {
    citas = citas.filter(c => c.estado === estado);
  }

  // Filtrar por búsqueda
  if (busqueda) {
    citas = citas.filter(c => 
      (c.cliente_nombre || '').toLowerCase().includes(busqueda) ||
      (c.mascota_nombre || '').toLowerCase().includes(busqueda) ||
      (c.servicio_nombre || '').toLowerCase().includes(busqueda)
    );
  }

  // Determinar qué tab está activo
  const activeTab = document.querySelector('#citasTabs .nav-link.active').id.replace('-tab', '');
  const containerId = activeTab + 'CitasContainer';
  
  renderizarCitas(containerId, citas);
}

// ==================== EVENT LISTENERS ====================

function configurarEventListeners() {
  // Cerrar sesión
  const cerrarSesionBtn = document.getElementById('cerrarSesionBtn');
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener('click', cerrarSesion);
  }

  // Actualizar citas
  const btnActualizar = document.getElementById('btnActualizarCitas');
  if (btnActualizar) {
    btnActualizar.addEventListener('click', async (e) => {
      e.preventDefault();
      btnActualizar.disabled = true;
      btnActualizar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Actualizando...';
      
      await cargarCitas();
      
      btnActualizar.disabled = false;
      btnActualizar.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Actualizar';
      mostrarExito('Citas actualizadas correctamente');
    });
  }

  // Nueva cita
  const btnNuevaCita = document.getElementById('btnNuevaCita');
  if (btnNuevaCita) {
    btnNuevaCita.addEventListener('click', () => {
      alert('Funcionalidad de nueva cita en desarrollo');
    });
  }

  // Tabs
  const tabs = document.querySelectorAll('#citasTabs button[data-bs-toggle="tab"]');
  tabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', (e) => {
      const tabId = e.target.id.replace('-tab', '');
      mostrarCitasPorTab(tabId);
    });
  });

  // Filtros
  const filtroEstado = document.getElementById('filtroEstado');
  if (filtroEstado) {
    filtroEstado.addEventListener('change', aplicarFiltros);
  }

  // Búsqueda
  const buscarCita = document.getElementById('buscarCita');
  if (buscarCita) {
    buscarCita.addEventListener('input', debounce(aplicarFiltros, 300));
  }

  // Guardar estado
  const btnGuardarEstado = document.getElementById('btnGuardarEstado');
  if (btnGuardarEstado) {
    btnGuardarEstado.addEventListener('click', guardarEstadoCita);
  }

  // Cancelar cita
  const btnCancelarCita = document.getElementById('btnCancelarCita');
  if (btnCancelarCita) {
    btnCancelarCita.addEventListener('click', cancelarCita);
  }

  // Editar cita (desde modal de detalles)
  const btnEditarCita = document.getElementById('btnEditarCita');
  if (btnEditarCita) {
    btnEditarCita.addEventListener('click', () => {
      if (citaActual) {
        bootstrap.Modal.getInstance(document.getElementById('modalDetalleCita')).hide();
        editarEstadoCita(citaActual.id);
      }
    });
  }

  console.log('✅ Event listeners configurados');
}

function cerrarSesion(e) {
  e.preventDefault();
  
  if (confirm('¿Está seguro de cerrar sesión?')) {
    sessionStorage.clear();
    window.location.href = '/';
  }
}

// ==================== UTILIDADES ====================

function mostrarCargando() {
  const containers = [
    'todasCitasContainer',
    'hoyCitasContainer',
    'proximasCitasContainer',
    'anterioresCitasContainer'
  ];

  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      `;
    }
  });
}

function actualizarHora() {
  const ahora = new Date();
  const hora = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  
  const elemento = document.getElementById('horaActualizacion');
  if (elemento) {
    elemento.textContent = hora;
  }
}

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

function mostrarError(mensaje) {
  const toast = document.createElement('div');
  toast.className = 'position-fixed bottom-0 end-0 p-3';
  toast.style.zIndex = '11';
  toast.innerHTML = `
    <div class="toast show bg-danger text-white" role="alert">
      <div class="toast-header bg-danger text-white">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <strong class="me-auto">Error</strong>
        <button type="button" class="btn-close btn-close-white" onclick="this.closest('.position-fixed').remove()"></button>
      </div>
      <div class="toast-body">${mensaje}</div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function mostrarExito(mensaje) {
  const toast = document.createElement('div');
  toast.className = 'position-fixed bottom-0 end-0 p-3';
  toast.style.zIndex = '11';
  toast.innerHTML = `
    <div class="toast show bg-success text-white" role="alert">
      <div class="toast-header bg-success text-white">
        <i class="bi bi-check-circle me-2"></i>
        <strong class="me-auto">Éxito</strong>
        <button type="button" class="btn-close btn-close-white" onclick="this.closest('.position-fixed').remove()"></button>
      </div>
      <div class="toast-body">${mensaje}</div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ==================== ACTUALIZACIÓN AUTOMÁTICA ====================

function iniciarActualizacionAutomatica() {
  setInterval(async () => {
    console.log('🔄 Actualización automática de citas...');
    await cargarCitas();
  }, 120000); // Cada 2 minutos

  console.log('✅ Actualización automática iniciada');
}

// ==================== LIMPIEZA ====================

window.addEventListener('beforeunload', () => {
  console.log('🧹 Limpieza al salir');
});