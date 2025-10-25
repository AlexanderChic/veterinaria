// admin-servicios.js - Gestión completa de servicios y horarios

// ==================== VARIABLES GLOBALES ====================
let todosLosServicios = [];
let todosLosHorarios = [];
let todosLosDiasNoLaborables = [];
let servicioActual = null;
let adminActual = null;
let modoEdicion = false;

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Iniciando admin-servicios.js...');
  await verificarAutenticacion();
  await cargarDatos();
  configurarEventListeners();
});

// ==================== AUTENTICACIÓN ====================

async function verificarAutenticacion() {
  console.log('🔐 Verificando autenticación...');
  const usuario = sessionStorage.getItem('usuario');
  
  if (!usuario) {
    alert('Debe iniciar sesión para acceder al panel de administración');
    window.location.href = '/';
    return;
  }

  try {
    adminActual = JSON.parse(usuario);
    
    if (adminActual.rol !== 'admin') {
      alert('No tiene permisos para acceder a esta sección');
      window.location.href = '/';
      return;
    }

    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = adminActual.nombre;
    });

    console.log('✅ Admin autenticado:', adminActual.nombre);
  } catch (error) {
    console.error('❌ Error al verificar autenticación:', error);
    window.location.href = '/';
  }
}

// ==================== CARGA DE DATOS ====================

async function cargarDatos() {
  await cargarServicios();
  await cargarHorarios();
  await cargarDiasNoLaborables();
  actualizarHora();
}

async function cargarServicios() {
  try {
    console.log('📋 Cargando servicios...');
    
    const response = await fetch('/api/servicios');
    if (!response.ok) throw new Error('Error al obtener servicios');
    
    todosLosServicios = await response.json();
    console.log(`✅ ${todosLosServicios.length} servicios cargados`);
    
    renderizarServicios();
    actualizarEstadisticas();
    
  } catch (error) {
    console.error('❌ Error al cargar servicios:', error);
    mostrarError('Error al cargar los servicios');
  }
}

async function cargarHorarios() {
  try {
    console.log('⏰ Cargando horarios...');
    
    const response = await fetch('/api/horarios');
    if (!response.ok) throw new Error('Error al obtener horarios');
    
    todosLosHorarios = await response.json();
    console.log(`✅ ${todosLosHorarios.length} horarios cargados`);
    
    renderizarHorarios();
    
  } catch (error) {
    console.error('❌ Error al cargar horarios:', error);
    mostrarError('Error al cargar los horarios');
  }
}

async function cargarDiasNoLaborables() {
  try {
    console.log('📅 Cargando días no laborables...');
    
    const response = await fetch('/api/dias-no-laborables');
    if (!response.ok) throw new Error('Error al obtener días no laborables');
    
    todosLosDiasNoLaborables = await response.json();
    console.log(`✅ ${todosLosDiasNoLaborables.length} días no laborables cargados`);
    
    renderizarDiasNoLaborables();
    
  } catch (error) {
    console.error('❌ Error al cargar días no laborables:', error);
    mostrarError('Error al cargar los días no laborables');
  }
}

// ==================== ESTADÍSTICAS ====================

function actualizarEstadisticas() {
  const serviciosActivos = todosLosServicios.filter(s => s.activo).length;
  document.getElementById('totalServiciosWidget').textContent = serviciosActivos;
}

// ==================== RENDERIZAR SERVICIOS ====================

function renderizarServicios() {
  const container = document.getElementById('serviciosContainer');
  
  if (todosLosServicios.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-clipboard-x"></i>
        <h4>No hay servicios</h4>
        <p>No se han agregado servicios todavía</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="row g-3">
  `;

  todosLosServicios.forEach(servicio => {
    const estadoBadge = servicio.activo 
      ? '<span class="badge bg-success">Activo</span>' 
      : '<span class="badge bg-secondary">Inactivo</span>';
    
    html += `
      <div class="col-md-6 col-lg-4">
        <div class="card servicio-card ${!servicio.activo ? 'inactive' : ''}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="servicio-icon bg-${servicio.color}">
                <i class="bi ${servicio.icono}"></i>
              </div>
              ${estadoBadge}
            </div>
            
            <h5 class="card-title">${servicio.nombre}</h5>
            <p class="card-text text-muted small mb-3">${servicio.descripcion || 'Sin descripción'}</p>
            
            <div class="servicio-info mb-3">
              <div class="info-item">
                <i class="bi bi-cash text-success"></i>
                <strong>Q${parseFloat(servicio.precio).toFixed(2)}</strong>
              </div>
              <div class="info-item">
                <i class="bi bi-clock text-primary"></i>
                <span>${servicio.duracion_minutos} min</span>
              </div>
            </div>
            
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary flex-fill" onclick="editarServicio(${servicio.id})">
                <i class="bi bi-pencil"></i> Editar
              </button>
              <button class="btn btn-sm btn-outline-${servicio.activo ? 'warning' : 'success'}" onclick="toggleServicio(${servicio.id}, ${!servicio.activo})">
                <i class="bi bi-${servicio.activo ? 'pause' : 'play'}-circle"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarServicio(${servicio.id})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// ==================== RENDERIZAR HORARIOS ====================

function renderizarHorarios() {
  const container = document.getElementById('horariosContainer');
  
  if (todosLosHorarios.length === 0) {
    container.innerHTML = `
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        No se han configurado horarios de atención
      </div>
    `;
    return;
  }

  const diasNombres = {
    'lunes': 'Lunes',
    'martes': 'Martes',
    'miercoles': 'Miércoles',
    'jueves': 'Jueves',
    'viernes': 'Viernes',
    'sabado': 'Sábado',
    'domingo': 'Domingo'
  };

  let html = `
    <div class="horarios-grid">
  `;

  todosLosHorarios.forEach(horario => {
    const horaInicio = horario.hora_inicio.substring(0, 5); // HH:MM
    const horaFin = horario.hora_fin.substring(0, 5);
    
    html += `
      <div class="horario-card">
        <div class="horario-header">
          <h6 class="mb-0">${diasNombres[horario.dia_semana]}</h6>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="activo_${horario.id}" 
              ${horario.activo ? 'checked' : ''} 
              onchange="cambiarEstadoDia(${horario.id}, this.checked)">
          </div>
        </div>
        
        <div class="horario-body ${!horario.activo ? 'disabled' : ''}">
          <div class="row g-2">
            <div class="col-6">
              <label class="form-label small">Inicio</label>
              <input type="time" class="form-control form-control-sm" 
                id="inicio_${horario.id}" 
                value="${horaInicio}"
                ${!horario.activo ? 'disabled' : ''}>
            </div>
            <div class="col-6">
              <label class="form-label small">Fin</label>
              <input type="time" class="form-control form-control-sm" 
                id="fin_${horario.id}" 
                value="${horaFin}"
                ${!horario.activo ? 'disabled' : ''}>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// ==================== RENDERIZAR DÍAS NO LABORABLES ====================

function renderizarDiasNoLaborables() {
  const container = document.getElementById('diasNoLaborablesContainer');
  
  if (todosLosDiasNoLaborables.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-calendar-check"></i>
        <h4>No hay días no laborables</h4>
        <p>No se han configurado días festivos o de descanso</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th width="20%">Fecha</th>
            <th width="60%">Motivo</th>
            <th width="20%" class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  todosLosDiasNoLaborables.forEach(dia => {
    const fecha = new Date(dia.fecha + 'T00:00:00');
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    html += `
      <tr>
        <td>
          <strong>${fechaFormateada}</strong><br>
          <small class="text-muted">${dia.fecha}</small>
        </td>
        <td>
          <i class="bi bi-calendar-x text-danger me-2"></i>
          ${dia.descripcion}
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger" onclick="eliminarDiaNoLaborable(${dia.id})">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = html;
}

// ==================== FUNCIONES DE SERVICIOS ====================

function nuevoServicio() {
  modoEdicion = false;
  servicioActual = null;
  
  document.getElementById('tituloFormServicio').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Servicio';
  document.getElementById('formServicio').reset();
  document.getElementById('servicioId').value = '';
  document.getElementById('servicioDuracion').value = '30';
  document.getElementById('servicioActivo').value = 'true';
  document.getElementById('servicioIcono').value = 'bi-heart-pulse';
  document.getElementById('servicioColor').value = 'primary';
  
  const modal = new bootstrap.Modal(document.getElementById('modalFormServicio'));
  modal.show();
}

window.editarServicio = function(id) {
  const servicio = todosLosServicios.find(s => s.id === id);
  if (!servicio) {
    mostrarError('Servicio no encontrado');
    return;
  }
  
  modoEdicion = true;
  servicioActual = servicio;
  
  document.getElementById('tituloFormServicio').innerHTML = '<i class="bi bi-pencil-square me-2"></i>Editar Servicio';
  document.getElementById('servicioId').value = servicio.id;
  document.getElementById('servicioNombre').value = servicio.nombre;
  document.getElementById('servicioPrecio').value = servicio.precio;
  document.getElementById('servicioDuracion').value = servicio.duracion_minutos;
  document.getElementById('servicioActivo').value = servicio.activo.toString();
  document.getElementById('servicioIcono').value = servicio.icono;
  document.getElementById('servicioColor').value = servicio.color;
  document.getElementById('servicioDescripcion').value = servicio.descripcion || '';
  
  const modal = new bootstrap.Modal(document.getElementById('modalFormServicio'));
  modal.show();
};

async function guardarServicio() {
  try {
    const form = document.getElementById('formServicio');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const id = document.getElementById('servicioId').value;
    const datos = {
      nombre: document.getElementById('servicioNombre').value.trim(),
      precio: parseFloat(document.getElementById('servicioPrecio').value),
      duracion_minutos: parseInt(document.getElementById('servicioDuracion').value),
      activo: document.getElementById('servicioActivo').value === 'true',
      icono: document.getElementById('servicioIcono').value,
      color: document.getElementById('servicioColor').value,
      descripcion: document.getElementById('servicioDescripcion').value.trim()
    };

    const btn = document.getElementById('btnGuardarServicio');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

    let response;
    if (modoEdicion) {
      response = await fetch(`/api/servicios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
    } else {
      response = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al guardar servicio');
    }

    mostrarExito(modoEdicion ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente');
    
    bootstrap.Modal.getInstance(document.getElementById('modalFormServicio')).hide();
    await cargarServicios();

  } catch (error) {
    console.error('❌ Error al guardar servicio:', error);
    mostrarError(error.message);
  } finally {
    const btn = document.getElementById('btnGuardarServicio');
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-save me-1"></i>Guardar';
  }
}

window.toggleServicio = async function(id, activo) {
  try {
    const accion = activo ? 'activar' : 'desactivar';
    if (!confirm(`¿Está seguro de ${accion} este servicio?`)) return;

    const response = await fetch(`/api/servicios/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    mostrarExito(`Servicio ${activo ? 'activado' : 'desactivado'} correctamente`);
    await cargarServicios();

  } catch (error) {
    console.error('❌ Error al cambiar estado:', error);
    mostrarError(error.message);
  }
};

window.eliminarServicio = async function(id) {
  try {
    const servicio = todosLosServicios.find(s => s.id === id);
    if (!confirm(`¿Está seguro de eliminar el servicio "${servicio.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    const response = await fetch(`/api/servicios/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    mostrarExito('Servicio eliminado correctamente');
    await cargarServicios();

  } catch (error) {
    console.error('❌ Error al eliminar servicio:', error);
    mostrarError(error.message);
  }
};

// ==================== FUNCIONES DE HORARIOS ====================

window.cambiarEstadoDia = function(id, activo) {
  const inicioInput = document.getElementById(`inicio_${id}`);
  const finInput = document.getElementById(`fin_${id}`);
  
  inicioInput.disabled = !activo;
  finInput.disabled = !activo;
};

async function guardarHorarios() {
  try {
    const horarios = [];
    
    todosLosHorarios.forEach(h => {
      const activo = document.getElementById(`activo_${h.id}`).checked;
      const inicio = document.getElementById(`inicio_${h.id}`).value;
      const fin = document.getElementById(`fin_${h.id}`).value;
      
      horarios.push({
        id: h.id,
        hora_inicio: inicio,
        hora_fin: fin,
        activo: activo
      });
    });

    const btn = document.getElementById('btnGuardarHorarios');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

    const response = await fetch('/api/horarios-masivo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ horarios })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    mostrarExito('Horarios actualizados correctamente');
    await cargarHorarios();

  } catch (error) {
    console.error('❌ Error al guardar horarios:', error);
    mostrarError(error.message);
  } finally {
    const btn = document.getElementById('btnGuardarHorarios');
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-save me-1"></i>Guardar Cambios';
  }
}

// ==================== FUNCIONES DE DÍAS NO LABORABLES ====================

function nuevoDiaNoLaborable() {
  document.getElementById('formDiaNoLaborable').reset();
  
  // Establecer fecha mínima como hoy
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('diaNoLaborableFecha').min = hoy;
  
  const modal = new bootstrap.Modal(document.getElementById('modalDiaNoLaborable'));
  modal.show();
}

async function guardarDiaNoLaborable() {
  try {
    const form = document.getElementById('formDiaNoLaborable');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const datos = {
      fecha: document.getElementById('diaNoLaborableFecha').value,
      descripcion: document.getElementById('diaNoLaborableMotivo').value.trim()
    };

    const btn = document.getElementById('btnGuardarDiaNoLaborable');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

    const response = await fetch('/api/dias-no-laborables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    mostrarExito('Día no laborable agregado correctamente');
    
    bootstrap.Modal.getInstance(document.getElementById('modalDiaNoLaborable')).hide();
    await cargarDiasNoLaborables();

  } catch (error) {
    console.error('❌ Error al guardar día no laborable:', error);
    mostrarError(error.message);
  } finally {
    const btn = document.getElementById('btnGuardarDiaNoLaborable');
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-save me-1"></i>Guardar';
  }
}

window.eliminarDiaNoLaborable = async function(id) {
  try {
    const dia = todosLosDiasNoLaborables.find(d => d.id === id);
    if (!confirm(`¿Está seguro de eliminar el día no laborable "${dia.descripcion}"?`)) {
      return;
    }

    const response = await fetch(`/api/dias-no-laborables/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    mostrarExito('Día no laborable eliminado correctamente');
    await cargarDiasNoLaborables();

  } catch (error) {
    console.error('❌ Error al eliminar día no laborable:', error);
    mostrarError(error.message);
  }
};

// ==================== EVENT LISTENERS ====================

function configurarEventListeners() {
  // Cerrar sesión
  document.getElementById('cerrarSesionBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('¿Está seguro de cerrar sesión?')) {
      sessionStorage.clear();
      window.location.href = '/';
    }
  });

  // Actualizar servicios
  document.getElementById('btnActualizarServicios')?.addEventListener('click', async () => {
    await cargarDatos();
    mostrarExito('Datos actualizados correctamente');
  });

  // Nuevo servicio
  document.getElementById('btnNuevoServicio')?.addEventListener('click', nuevoServicio);

  // Guardar servicio
  document.getElementById('btnGuardarServicio')?.addEventListener('click', guardarServicio);

  // Guardar horarios
  document.getElementById('btnGuardarHorarios')?.addEventListener('click', guardarHorarios);

  // Nuevo día no laborable
  document.getElementById('btnNuevoDiaNoLaborable')?.addEventListener('click', nuevoDiaNoLaborable);

  // Guardar día no laborable
  document.getElementById('btnGuardarDiaNoLaborable')?.addEventListener('click', guardarDiaNoLaborable);

  console.log('✅ Event listeners configurados');
}

// ==================== UTILIDADES ====================

function actualizarHora() {
  const ahora = new Date();
  const hora = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('horaActualizacion').textContent = hora;
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