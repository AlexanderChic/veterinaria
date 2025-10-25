// admin-mascotas.js - Gestión completa de mascotas

// ==================== VARIABLES GLOBALES ====================
let todasLasMascotas = [];
let mascotasFiltradas = [];
let mascotaActual = null;
let usuarioActual = null;
let clientesData = [];
let razasUnicas = [];

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', async function() {
  await verificarAutenticacion();
  await cargarDatos();
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

async function cargarDatos() {
  try {
    console.log('🐾 Cargando datos...');
    mostrarCargando();

    // Cargar mascotas y clientes en paralelo
    const [mascotasRes, clientesRes] = await Promise.all([
      fetch('/api/mascotas'),
      fetch('/api/clientes')
    ]);

    if (!mascotasRes.ok) throw new Error('Error al obtener mascotas');
    if (!clientesRes.ok) throw new Error('Error al obtener clientes');
    
    todasLasMascotas = await mascotasRes.json();
    clientesData = await clientesRes.json();

    console.log(`📊 Total de mascotas: ${todasLasMascotas.length}`);
    console.log(`👥 Total de clientes: ${clientesData.length}`);

    // Procesar datos
    procesarDatos();
    
    // Actualizar estadísticas
    actualizarEstadisticas();
    
    // Cargar selectores
    cargarSelectores();

    // Mostrar mascotas
    mascotasFiltradas = [...todasLasMascotas];
    mostrarMascotasPorVista('tarjetas');

    actualizarHora();
    console.log('✅ Datos cargados exitosamente');
    
  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    mostrarError('Error al cargar los datos. Por favor, recargue la página.');
  }
}

function procesarDatos() {
  // Extraer razas únicas
  razasUnicas = [...new Set(todasLasMascotas
    .map(m => m.raza)
    .filter(r => r && r.trim() !== '')
  )].sort();

  console.log(`📋 Razas únicas encontradas: ${razasUnicas.length}`);
}

function cargarSelectores() {
  // Cargar selector de clientes
  const filtroCliente = document.getElementById('filtroCliente');
  filtroCliente.innerHTML = '<option value="">Todos los clientes</option>';
  
  clientesData.forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente.id;
    option.textContent = `${cliente.nombre} ${cliente.apellido}`;
    filtroCliente.appendChild(option);
  });

  // Cargar selector de razas
  const filtroRaza = document.getElementById('filtroRaza');
  filtroRaza.innerHTML = '<option value="">Todas las razas</option>';
  
  razasUnicas.forEach(raza => {
    const option = document.createElement('option');
    option.value = raza;
    option.textContent = raza;
    filtroRaza.appendChild(option);
  });
}

// ==================== ESTADÍSTICAS ====================

function actualizarEstadisticas() {
  const stats = {
    total: todasLasMascotas.length,
    perros: todasLasMascotas.filter(m => m.tipo?.toLowerCase() === 'perro').length,
    gatos: todasLasMascotas.filter(m => m.tipo?.toLowerCase() === 'gato').length,
    otros: todasLasMascotas.filter(m => {
      const tipo = m.tipo?.toLowerCase();
      return tipo && tipo !== 'perro' && tipo !== 'gato';
    }).length
  };

  document.getElementById('statTotalMascotas').textContent = stats.total;
  document.getElementById('statPerros').textContent = stats.perros;
  document.getElementById('statGatos').textContent = stats.gatos;
  document.getElementById('statOtros').textContent = stats.otros;
  document.getElementById('totalMascotasWidget').textContent = stats.total;
  document.getElementById('contadorMascotas').textContent = `${mascotasFiltradas.length} mascota${mascotasFiltradas.length !== 1 ? 's' : ''}`;
}

// ==================== MOSTRAR MASCOTAS POR VISTA ====================

function mostrarMascotasPorVista(vista) {
  switch(vista) {
    case 'tarjetas':
      renderizarTarjetas();
      break;
    case 'lista':
      renderizarLista();
      break;
    case 'por-cliente':
      renderizarPorCliente();
      break;
  }
}

// ==================== VISTA DE TARJETAS ====================

function renderizarTarjetas() {
  const container = document.getElementById('mascotasTarjetasContainer');
  
  if (mascotasFiltradas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-emoji-frown"></i>
        <h4>No se encontraron mascotas</h4>
        <p>No hay mascotas que coincidan con los filtros seleccionados</p>
      </div>
    `;
    return;
  }

  let html = '<div class="row g-4">';

  mascotasFiltradas.forEach(mascota => {
    const edad = calcularEdad(mascota.fecha_nacimiento);
    const iconoTipo = obtenerIconoTipo(mascota.tipo);
    const colorTipo = obtenerColorTipo(mascota.tipo);

    html += `
      <div class="col-xl-3 col-lg-4 col-md-6">
        <div class="mascota-card" onclick="verDetalleMascota(${mascota.id})">
          <div class="mascota-card-header ${colorTipo}">
            <div class="mascota-icon">
              ${iconoTipo}
            </div>
            <div class="mascota-tipo-badge">
              ${mascota.tipo || 'N/A'}
            </div>
          </div>
          <div class="mascota-card-body">
            <h5 class="mascota-nombre">${mascota.nombre || 'Sin nombre'}</h5>
            <p class="mascota-info">
              <i class="bi bi-award me-1"></i>
              <strong>Raza:</strong> ${mascota.raza || 'Mixta'}
            </p>
            <p class="mascota-info">
              <i class="bi bi-calendar3 me-1"></i>
              <strong>Edad:</strong> ${edad}
            </p>
            <p class="mascota-info">
              <i class="bi bi-person me-1"></i>
              <strong>Dueño:</strong> ${mascota.cliente_nombre || 'N/A'}
            </p>
            ${mascota.peso ? `
            <p class="mascota-info">
              <i class="bi bi-speedometer2 me-1"></i>
              <strong>Peso:</strong> ${mascota.peso} kg
            </p>
            ` : ''}
          </div>
          <div class="mascota-card-footer">
            <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); verDetalleMascota(${mascota.id})">
              <i class="bi bi-eye me-1"></i>Ver Detalles
            </button>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

// ==================== VISTA DE LISTA ====================

function renderizarLista() {
  const container = document.getElementById('mascotasListaContainer');
  
  if (mascotasFiltradas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-emoji-frown"></i>
        <h4>No se encontraron mascotas</h4>
        <p>No hay mascotas que coincidan con los filtros seleccionados</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-hover align-middle mascotas-table">
        <thead>
          <tr>
            <th width="5%">#</th>
            <th width="20%">Nombre</th>
            <th width="12%">Tipo</th>
            <th width="15%">Raza</th>
            <th width="10%">Edad</th>
            <th width="8%">Peso</th>
            <th width="20%">Dueño</th>
            <th width="10%" class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  mascotasFiltradas.forEach((mascota, index) => {
    const edad = calcularEdad(mascota.fecha_nacimiento);
    const iconoTipo = obtenerIconoTipo(mascota.tipo);

    html += `
      <tr onclick="verDetalleMascota(${mascota.id})" style="cursor: pointer;">
        <td><strong>${index + 1}</strong></td>
        <td>
          <div class="d-flex align-items-center">
            <span class="mascota-icon-small me-2">${iconoTipo}</span>
            <strong>${mascota.nombre || 'Sin nombre'}</strong>
          </div>
        </td>
        <td>
          <span class="badge bg-${obtenerColorBadge(mascota.tipo)}">${mascota.tipo || 'N/A'}</span>
        </td>
        <td>${mascota.raza || 'Mixta'}</td>
        <td>${edad}</td>
        <td>${mascota.peso ? mascota.peso + ' kg' : 'N/A'}</td>
        <td>
          <i class="bi bi-person-circle me-1 text-primary"></i>
          ${mascota.cliente_nombre || 'N/A'}
        </td>
        <td class="text-center">
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-primary" onclick="event.stopPropagation(); verDetalleMascota(${mascota.id})" title="Ver detalles">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-info" onclick="event.stopPropagation(); verHistorialCitas(${mascota.id}, '${mascota.nombre}')" title="Historial">
              <i class="bi bi-clock-history"></i>
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
  `;

  container.innerHTML = html;
}

// ==================== VISTA POR CLIENTE ====================

function renderizarPorCliente() {
  const container = document.getElementById('mascotasPorClienteContainer');
  
  // Agrupar mascotas por cliente
  const mascotasPorCliente = {};
  
  mascotasFiltradas.forEach(mascota => {
    const clienteId = mascota.cliente_id;
    if (!mascotasPorCliente[clienteId]) {
      mascotasPorCliente[clienteId] = {
        cliente: mascota.cliente_nombre || 'Cliente Desconocido',
        mascotas: []
      };
    }
    mascotasPorCliente[clienteId].mascotas.push(mascota);
  });

  if (Object.keys(mascotasPorCliente).length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-emoji-frown"></i>
        <h4>No se encontraron mascotas</h4>
        <p>No hay mascotas que coincidan con los filtros seleccionados</p>
      </div>
    `;
    return;
  }

  let html = '<div class="accordion" id="accordionClientes">';

  Object.entries(mascotasPorCliente).forEach(([clienteId, data], index) => {
    const collapseId = `collapse${clienteId}`;
    const totalMascotas = data.mascotas.length;

    html += `
      <div class="accordion-item cliente-accordion">
        <h2 class="accordion-header">
          <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
            <div class="d-flex align-items-center w-100">
              <i class="bi bi-person-circle me-3 text-primary" style="font-size: 1.5rem;"></i>
              <div class="flex-grow-1">
                <strong>${data.cliente}</strong>
                <small class="d-block text-muted">${totalMascotas} mascota${totalMascotas !== 1 ? 's' : ''}</small>
              </div>
              <span class="badge bg-primary me-3">${totalMascotas}</span>
            </div>
          </button>
        </h2>
        <div id="${collapseId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#accordionClientes">
          <div class="accordion-body">
            <div class="row g-3">
    `;

    data.mascotas.forEach(mascota => {
      const edad = calcularEdad(mascota.fecha_nacimiento);
      const iconoTipo = obtenerIconoTipo(mascota.tipo);
      const colorTipo = obtenerColorTipo(mascota.tipo);

      html += `
        <div class="col-lg-4 col-md-6">
          <div class="mascota-card-mini" onclick="verDetalleMascota(${mascota.id})">
            <div class="mascota-mini-icon ${colorTipo}">
              ${iconoTipo}
            </div>
            <div class="mascota-mini-info">
              <h6>${mascota.nombre || 'Sin nombre'}</h6>
              <p class="mb-1"><small><strong>${mascota.tipo || 'N/A'}</strong> • ${mascota.raza || 'Mixta'}</small></p>
              <p class="mb-0"><small class="text-muted">${edad}</small></p>
            </div>
            <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); verDetalleMascota(${mascota.id})">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>
      `;
    });

    html += `
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

// ==================== DETALLES DE MASCOTA ====================

window.verDetalleMascota = async function(id) {
  try {
    const mascota = todasLasMascotas.find(m => m.id === id);
    if (!mascota) {
      mostrarError('Mascota no encontrada');
      return;
    }

    mascotaActual = mascota;
    const edad = calcularEdad(mascota.fecha_nacimiento);
    const iconoTipo = obtenerIconoTipo(mascota.tipo);
    const colorTipo = obtenerColorTipo(mascota.tipo);

    const html = `
      <div class="mascota-detalle">
        <div class="text-center mb-4">
          <div class="mascota-icon-large ${colorTipo}">
            ${iconoTipo}
          </div>
          <h3 class="mt-3">${mascota.nombre || 'Sin nombre'}</h3>
          <span class="badge bg-${obtenerColorBadge(mascota.tipo)} fs-6">${mascota.tipo || 'N/A'}</span>
        </div>
        
        <div class="row g-3">
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-award me-2"></i>Raza</label>
              <p>${mascota.raza || 'Mixta'}</p>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-calendar3 me-2"></i>Edad</label>
              <p>${edad}</p>
            </div>
          </div>

          ${mascota.fecha_nacimiento ? `
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-cake2 me-2"></i>Fecha de Nacimiento</label>
              <p>${new Date(mascota.fecha_nacimiento).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
          </div>
          ` : ''}

          ${mascota.peso ? `
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-speedometer2 me-2"></i>Peso</label>
              <p>${mascota.peso} kg</p>
            </div>
          </div>
          ` : ''}

          ${mascota.color ? `
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-palette me-2"></i>Color</label>
              <p>${mascota.color}</p>
            </div>
          </div>
          ` : ''}

          ${mascota.sexo ? `
          <div class="col-md-6">
            <div class="info-group">
              <label><i class="bi bi-gender-ambiguous me-2"></i>Sexo</label>
              <p>${mascota.sexo === 'M' ? 'Macho' : 'Hembra'}</p>
            </div>
          </div>
          ` : ''}

          <div class="col-md-12">
            <div class="info-group">
              <label><i class="bi bi-person-circle me-2"></i>Dueño</label>
              <p class="fw-semibold">${mascota.cliente_nombre || 'N/A'}</p>
              ${mascota.cliente_telefono ? `<small class="text-muted"><i class="bi bi-telephone me-1"></i>${mascota.cliente_telefono}</small>` : ''}
              ${mascota.cliente_email ? `<br><small class="text-muted"><i class="bi bi-envelope me-1"></i>${mascota.cliente_email}</small>` : ''}
            </div>
          </div>

          ${mascota.observaciones ? `
          <div class="col-md-12">
            <div class="info-group">
              <label><i class="bi bi-journal-text me-2"></i>Observaciones</label>
              <p class="text-muted">${mascota.observaciones}</p>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    document.getElementById('detallesMascotaContent').innerHTML = html;
    
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleMascota'));
    modal.show();

  } catch (error) {
    console.error('❌ Error al ver detalles:', error);
    mostrarError('Error al cargar los detalles de la mascota');
  }
};

// ==================== HISTORIAL DE CITAS ====================

window.verHistorialCitas = async function(mascotaId, nombreMascota) {
  try {
    document.getElementById('nombreMascotaHistorial').textContent = nombreMascota;
    
    const response = await fetch('/api/citas');
    if (!response.ok) throw new Error('Error al obtener citas');
    
    const todasCitas = await response.json();
    const citasMascota = todasCitas.filter(c => c.mascota_id === mascotaId);
    
    citasMascota.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora || '00:00'}`);
      const fechaB = new Date(`${b.fecha}T${b.hora || '00:00'}`);
      return fechaB - fechaA;
    });

    let html = '';

    if (citasMascota.length === 0) {
      html = `
        <div class="empty-state">
          <i class="bi bi-calendar-x"></i>
          <h4>Sin historial</h4>
          <p>Esta mascota no tiene citas registradas</p>
        </div>
      `;
    } else {
      html = `
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Sucursal</th>
                <th>Estado</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
      `;

      citasMascota.forEach(cita => {
        const fecha = new Date(cita.fecha);
        const estadoBadge = obtenerBadgeEstado(cita.estado);

        html += `
          <tr>
            <td><strong>${fecha.toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}</strong></td>
            <td><span class="badge bg-primary">${cita.hora || '--:--'}</span></td>
            <td>${cita.servicio_nombre || 'N/A'}</td>
            <td><small>${cita.sucursal_nombre || 'N/A'}</small></td>
            <td>${estadoBadge}</td>
            <td><small class="text-muted">${cita.notas || '-'}</small></td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
        <div class="alert alert-info mt-3">
          <i class="bi bi-info-circle me-2"></i>
          <strong>Total de citas:</strong> ${citasMascota.length}
        </div>
      `;
    }

    document.getElementById('historialCitasContent').innerHTML = html;
    
    const modal = new bootstrap.Modal(document.getElementById('modalHistorialCitas'));
    modal.show();

  } catch (error) {
    console.error('❌ Error al cargar historial:', error);
    mostrarError('Error al cargar el historial de citas');
  }
};

function obtenerBadgeEstado(estado) {
  const badges = {
    'pendiente': '<span class="badge bg-warning text-dark">Pendiente</span>',
    'confirmada': '<span class="badge bg-success">Confirmada</span>',
    'completada': '<span class="badge bg-secondary">Completada</span>',
    'cancelada': '<span class="badge bg-danger">Cancelada</span>'
  };
  return badges[estado] || '<span class="badge bg-secondary">Desconocido</span>';
}

// ==================== FILTROS ====================

function aplicarFiltros() {
  const clienteId = document.getElementById('filtroCliente').value;
  const tipo = document.getElementById('filtroTipo').value;
  const raza = document.getElementById('filtroRaza').value;
  const rangoEdad = document.getElementById('filtroEdad').value;
  const busqueda = document.getElementById('buscarMascota').value.toLowerCase();

  mascotasFiltradas = todasLasMascotas.filter(mascota => {
    // Filtro por cliente
    if (clienteId && mascota.cliente_id != clienteId) return false;

    // Filtro por tipo
    if (tipo && mascota.tipo !== tipo) return false;

    // Filtro por raza
    if (raza && mascota.raza !== raza) return false;

    // Filtro por edad
    if (rangoEdad) {
      const edad = calcularEdadEnAnios(mascota.fecha_nacimiento);
      const [min, max] = rangoEdad.split('-').map(v => v.replace('+', ''));
      
      if (rangoEdad.includes('+')) {
        if (edad < parseInt(min)) return false;
      } else {
        if (edad < parseInt(min) || edad > parseInt(max)) return false;
      }
    }

    // Filtro por búsqueda
    if (busqueda) {
      const nombre = (mascota.nombre || '').toLowerCase();
      if (!nombre.includes(busqueda)) return false;
    }

    return true;
  });

  console.log(`🔍 Filtros aplicados: ${mascotasFiltradas.length} mascotas`);

  // Actualizar vista activa
  const activeTab = document.querySelector('#mascotasTabs .nav-link.active').id.replace('-tab', '');
  
  if (activeTab === 'todas') {
    renderizarTarjetas();
  } else if (activeTab === 'lista') {
    renderizarLista();
  } else if (activeTab === 'por-cliente') {
    renderizarPorCliente();
  }

  // Actualizar contador
  document.getElementById('contadorMascotas').textContent = `${mascotasFiltradas.length} mascota${mascotasFiltradas.length !== 1 ? 's' : ''}`;
  
  mostrarExito(`Se encontraron ${mascotasFiltradas.length} mascota${mascotasFiltradas.length !== 1 ? 's' : ''}`);
}

function limpiarFiltros() {
  document.getElementById('filtroCliente').value = '';
  document.getElementById('filtroTipo').value = '';
  document.getElementById('filtroRaza').value = '';
  document.getElementById('filtroEdad').value = '';
  document.getElementById('buscarMascota').value = '';

  mascotasFiltradas = [...todasLasMascotas];
  
  const activeTab = document.querySelector('#mascotasTabs .nav-link.active').id.replace('-tab', '');
  
  if (activeTab === 'todas') {
    renderizarTarjetas();
  } else if (activeTab === 'lista') {
    renderizarLista();
  } else if (activeTab === 'por-cliente') {
    renderizarPorCliente();
  }

  document.getElementById('contadorMascotas').textContent = `${mascotasFiltradas.length} mascota${mascotasFiltradas.length !== 1 ? 's' : ''}`;
  
  mostrarExito('Filtros limpiados');
}

// ==================== UTILIDADES ====================

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'Edad desconocida';

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  
  if (meses < 0) {
    años--;
    meses += 12;
  }

  if (años === 0) {
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  } else if (meses === 0) {
    return `${años} ${años === 1 ? 'año' : 'años'}`;
  } else {
    return `${años} ${años === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }
}

function calcularEdadEnAnios(fechaNacimiento) {
  if (!fechaNacimiento) return 0;

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    años--;
  }

  return años;
}

function obtenerIconoTipo(tipo) {
  const iconos = {
    'Perro': '<i class="bi bi-emoji-smile"></i>',
    'Gato': '<i class="bi bi-heart"></i>',
    'Ave': '<i class="bi bi-egg"></i>',
    'Reptil': '<i class="bi bi-bug"></i>',
    'Conejo': '<i class="bi bi-egg-fried"></i>',
    'Hamster': '<i class="bi bi-circle"></i>',
    'Otro': '<i class="bi bi-star"></i>'
  };
  return iconos[tipo] || '<i class="bi bi-question-circle"></i>';
}

function obtenerColorTipo(tipo) {
  const colores = {
    'Perro': 'bg-warning',
    'Gato': 'bg-info',
    'Ave': 'bg-primary',
    'Reptil': 'bg-success',
    'Conejo': 'bg-danger',
    'Hamster': 'bg-secondary',
    'Otro': 'bg-dark'
  };
  return colores[tipo] || 'bg-secondary';
}

function obtenerColorBadge(tipo) {
  const colores = {
    'Perro': 'warning',
    'Gato': 'info',
    'Ave': 'primary',
    'Reptil': 'success',
    'Conejo': 'danger',
    'Hamster': 'secondary',
    'Otro': 'dark'
  };
  return colores[tipo] || 'secondary';
}

function mostrarCargando() {
  const containers = ['mascotasTarjetasContainer', 'mascotasListaContainer', 'mascotasPorClienteContainer'];
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
  if (elemento) elemento.textContent = hora;
}

// ==================== EXPORTAR DATOS ====================

function exportarMascotas() {
  try {
    let csv = 'ID,Nombre,Tipo,Raza,Edad,Peso,Color,Sexo,Dueño,Teléfono,Email\n';
    
    mascotasFiltradas.forEach(m => {
      const edad = calcularEdadEnAnios(m.fecha_nacimiento);
      csv += `${m.id},"${m.nombre || ''}","${m.tipo || ''}","${m.raza || ''}",${edad},"${m.peso || ''}","${m.color || ''}","${m.sexo || ''}","${m.cliente_nombre || ''}","${m.cliente_telefono || ''}","${m.cliente_email || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `mascotas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarExito('Datos exportados correctamente');
  } catch (error) {
    console.error('Error al exportar:', error);
    mostrarError('Error al exportar los datos');
  }
}

// ==================== EVENT LISTENERS ====================

function configurarEventListeners() {
  // Cerrar sesión
  const cerrarSesionBtn = document.getElementById('cerrarSesionBtn');
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener('click', cerrarSesion);
  }

  // Actualizar mascotas
  const btnActualizar = document.getElementById('btnActualizarMascotas');
  if (btnActualizar) {
    btnActualizar.addEventListener('click', async () => {
      btnActualizar.disabled = true;
      btnActualizar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Actualizando...';
      await cargarDatos();
      btnActualizar.disabled = false;
      btnActualizar.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Actualizar';
      mostrarExito('Datos actualizados correctamente');
    });
  }

  // Exportar
  const btnExportar = document.getElementById('btnExportarMascotas');
  if (btnExportar) {
    btnExportar.addEventListener('click', exportarMascotas);
  }

  // Aplicar filtros
  const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
  if (btnAplicarFiltros) {
    btnAplicarFiltros.addEventListener('click', aplicarFiltros);
  }

  // Limpiar filtros
  const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
  if (btnLimpiarFiltros) {
    btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
  }

  // Búsqueda en tiempo real
  const buscarMascota = document.getElementById('buscarMascota');
  if (buscarMascota) {
    buscarMascota.addEventListener('input', debounce(aplicarFiltros, 500));
  }

  // Tabs
  const tabs = document.querySelectorAll('#mascotasTabs button[data-bs-toggle="tab"]');
  tabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', (e) => {
      const tabId = e.target.id.replace('-tab', '');
      mostrarMascotasPorVista(tabId);
    });
  });

  // Ver historial desde modal de detalles
  const btnVerHistorial = document.getElementById('btnVerHistorial');
  if (btnVerHistorial) {
    btnVerHistorial.addEventListener('click', () => {
      if (mascotaActual) {
        bootstrap.Modal.getInstance(document.getElementById('modalDetalleMascota')).hide();
        verHistorialCitas(mascotaActual.id, mascotaActual.nombre);
      }
    });
  }

  // Editar mascota
  const btnEditarMascota = document.getElementById('btnEditarMascota');
  if (btnEditarMascota) {
    btnEditarMascota.addEventListener('click', () => {
      alert('Funcionalidad de edición en desarrollo');
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
    console.log('🔄 Actualización automática...');
    await cargarDatos();
  }, 180000); // Cada 3 minutos

  console.log('✅ Actualización automática iniciada');
}

// ==================== LIMPIEZA ====================

window.addEventListener('beforeunload', () => {
  console.log('🧹 Limpieza al salir');
});