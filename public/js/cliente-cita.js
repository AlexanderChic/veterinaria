// /js/cliente-citas.js - VERSIÓN CORREGIDA

// Variables globales
let citasData = [];
let mascotasData = [];
let serviciosData = [];
let sucursalesData = [];
let clienteId = null;
let usuarioActual = null;

// Al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  inicializarPagina();
});

// Función principal de inicialización
async function inicializarPagina() {
  try {
    // Verificar autenticación
    usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
      console.log('Usuario no autenticado, redirigiendo...');
      window.location.href = '/';
      return;
    }

    console.log('Usuario autenticado:', usuarioActual);

    // Actualizar información del usuario en la UI
    actualizarInfoUsuario();

    // Cargar datos necesarios
    await Promise.all([
      cargarClienteId(),
      cargarServicios(),
      cargarSucursales()
    ]);

    // Solo cargar mascotas y citas después de tener el clienteId
    if (clienteId) {
      await Promise.all([
        cargarMascotas(),
        cargarCitas()
      ]);
    } else {
      console.error('No se pudo obtener el ID del cliente');
      mostrarError('Error: No se pudo identificar tu perfil de cliente');
      return;
    }

    // Configurar fecha mínima para nueva cita
    configurarFechaMinima();

    // Configurar event listeners
    configurarEventListeners();

  } catch (error) {
    console.error('Error al inicializar página:', error);
    mostrarError('Error al cargar la página. Por favor, recarga.');
  }
}

// Obtener usuario actual del sessionStorage
function obtenerUsuarioActual() {
  const usuario = sessionStorage.getItem('usuario');
  if (!usuario) {
    console.log('No hay usuario en sessionStorage');
    return null;
  }
  
  try {
    const usuarioObj = JSON.parse(usuario);
    console.log('Usuario parseado:', usuarioObj);
    return usuarioObj;
  } catch (error) {
    console.error('Error al parsear usuario:', error);
    return null;
  }
}

// Actualizar información del usuario en la UI
function actualizarInfoUsuario() {
  if (usuarioActual) {
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = usuarioActual.nombre;
    }
  }
}

// Cargar ID del cliente basado en el usuario
async function cargarClienteId() {
  try {
    console.log('Buscando cliente para usuario ID:', usuarioActual.id);
    
    const response = await fetch(`/api/clientes`);
    if (!response.ok) throw new Error('Error al obtener clientes');
    
    const clientes = await response.json();
    console.log('Clientes obtenidos:', clientes);
    
    const cliente = clientes.find(c => c.usuario_id === usuarioActual.id);
    console.log('Cliente encontrado:', cliente);
    
    if (cliente) {
      clienteId = cliente.id;
      console.log('Cliente ID asignado:', clienteId);
    } else {
      console.error('Cliente no encontrado para usuario ID:', usuarioActual.id);
      throw new Error('Cliente no encontrado');
    }
  } catch (error) {
    console.error('Error al cargar cliente:', error);
    throw error;
  }
}

// Cargar mascotas del cliente específico
async function cargarMascotas() {
  try {
    if (!clienteId) {
      console.error('No hay clienteId para cargar mascotas');
      return;
    }

    console.log('Cargando mascotas para cliente ID:', clienteId);

    // Cambiar la URL para filtrar directamente por cliente
    const response = await fetch(`/api/mascotas/cliente/${clienteId}`);
    
    if (!response.ok) {
      // Si no existe la ruta específica, usar la ruta general y filtrar
      const responseGeneral = await fetch(`/api/mascotas`);
      if (!responseGeneral.ok) throw new Error('Error al obtener mascotas');
      
      const todasMascotas = await responseGeneral.json();
      mascotasData = todasMascotas.filter(mascota => mascota.cliente_id === clienteId);
    } else {
      mascotasData = await response.json();
    }
    
    console.log('Mascotas del cliente cargadas:', mascotasData);
    
    // Actualizar select de mascotas en el modal
    actualizarSelectMascotas();
    
    // Actualizar filtro de mascotas
    actualizarFiltroMascotas();

  } catch (error) {
    console.error('Error al cargar mascotas:', error);
    mostrarError('Error al cargar las mascotas');
  }
}

// Cargar servicios disponibles
async function cargarServicios() {
  try {
    const response = await fetch(`/api/servicios`);
    if (!response.ok) throw new Error('Error al obtener servicios');
    
    serviciosData = await response.json();
    console.log('Servicios cargados:', serviciosData);
    
    // Actualizar select de servicios
    actualizarSelectServicios();

  } catch (error) {
    console.error('Error al cargar servicios:', error);
    mostrarError('Error al cargar los servicios');
  }
}

// Cargar sucursales disponibles
async function cargarSucursales() {
  try {
    const response = await fetch(`/api/sucursales`);
    if (!response.ok) throw new Error('Error al obtener sucursales');
    
    sucursalesData = await response.json();
    console.log('Sucursales cargadas:', sucursalesData);
    
    // Actualizar select de sucursales
    actualizarSelectSucursales();

  } catch (error) {
    console.error('Error al cargar sucursales:', error);
    mostrarError('Error al cargar las sucursales');
  }
}

// Cargar citas del cliente específico
async function cargarCitas() {
  try {
    if (!clienteId) {
      console.error('No hay clienteId para cargar citas');
      return;
    }

    mostrarEstadoCarga(true);
    console.log('Cargando citas para cliente ID:', clienteId);

    // Primero intentar la ruta específica del cliente
    let response = await fetch(`/api/citas/cliente/${clienteId}`);
    
    if (!response.ok) {
      // Si no existe la ruta específica, usar la ruta general y filtrar
      response = await fetch(`/api/citas`);
      if (!response.ok) throw new Error('Error al obtener citas');
      
      const todasCitas = await response.json();
      citasData = todasCitas.filter(cita => cita.cliente_id === clienteId);
    } else {
      citasData = await response.json();
    }
    
    console.log('Citas del cliente cargadas:', citasData);
    
    // Actualizar UI
    actualizarEstadisticas();
    mostrarCitas();
    actualizarProximaCita();
    actualizarNotificaciones();
    
    mostrarEstadoCarga(false);

  } catch (error) {
    console.error('Error al cargar citas:', error);
    mostrarEstadoCarga(false);
    mostrarError('Error al cargar las citas');
  }
}

// Mostrar/ocultar estado de carga
function mostrarEstadoCarga(mostrar) {
  const loadingState = document.getElementById('loadingState');
  const filtrosSection = document.getElementById('filtrosSection');
  const citasSection = document.getElementById('citasSection');
  const sinCitasState = document.getElementById('sinCitasState');
  
  if (mostrar) {
    loadingState.style.display = 'block';
    filtrosSection.style.display = 'none';
    citasSection.style.display = 'none';
    sinCitasState.style.display = 'none';
  } else {
    loadingState.style.display = 'none';
    
    if (citasData.length > 0) {
      filtrosSection.style.display = 'block';
      citasSection.style.display = 'block';
      sinCitasState.style.display = 'none';
    } else {
      filtrosSection.style.display = 'none';
      citasSection.style.display = 'none';
      sinCitasState.style.display = 'block';
    }
  }
}

// Actualizar estadísticas
function actualizarEstadisticas() {
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  
  // Filtrar citas del cliente actual
  const citasProgramadas = citasData.filter(cita => 
    cita.estado === 'pendiente' || cita.estado === 'confirmada'
  );
  const citasCompletadas = citasData.filter(cita => cita.estado === 'confirmada');
  const citasHoy = citasData.filter(cita => {
    const fechaCita = new Date(cita.fecha);
    return fechaCita.toDateString() === hoy.toDateString();
  });
  const citasSemana = citasData.filter(cita => {
    const fechaCita = new Date(cita.fecha);
    return fechaCita >= inicioSemana && fechaCita <= hoy;
  });

  // Actualizar elementos
  document.getElementById('citasProgramadas').textContent = citasProgramadas.length;
  document.getElementById('citasCompletadas').textContent = citasCompletadas.length;
  document.getElementById('citasHoy').textContent = citasHoy.length;
  document.getElementById('citasSemana').textContent = citasSemana.length;
  document.getElementById('citasCount').textContent = citasProgramadas.length;

  // Actualizar cambios (estos serían calculados comparando con períodos anteriores)
  document.getElementById('cambioSemanal').textContent = '+2 esta semana';
  document.getElementById('cambioMensual').textContent = '+15% vs mes anterior';
  
  if (citasHoy.length > 0) {
    const primeraCitaHoy = citasHoy[0];
    document.getElementById('horariosHoy').textContent = primeraCitaHoy.hora;
  }
}

// Actualizar select de mascotas del modal (SOLO las del cliente actual)
function actualizarSelectMascotas() {
  const select = document.getElementById('mascotaSelect');
  if (!select) return;
  
  select.innerHTML = '<option value="">Selecciona una mascota</option>';
  
  if (mascotasData.length === 0) {
    select.innerHTML += '<option value="" disabled>No tienes mascotas registradas</option>';
    console.log('No hay mascotas para el cliente ID:', clienteId);
    return;
  }
  
  mascotasData.forEach(mascota => {
    select.innerHTML += `<option value="${mascota.id}">${mascota.nombre} - ${mascota.especie} ${mascota.raza}</option>`;
  });
  
  console.log('Select de mascotas actualizado con', mascotasData.length, 'mascotas');
}

function actualizarSelectServicios() {
  const select = document.getElementById('servicioSelect');
  if (!select) return;
  
  select.innerHTML = '<option value="">Selecciona un servicio</option>';
  
  serviciosData.forEach(servicio => {
    select.innerHTML += `<option value="${servicio.id}">${servicio.nombre}</option>`;
  });
}

function actualizarSelectSucursales() {
  const select = document.getElementById('sucursalSelect');
  if (!select) return;
  
  select.innerHTML = '<option value="">Selecciona una sucursal</option>';
  
  sucursalesData.forEach(sucursal => {
    select.innerHTML += `<option value="${sucursal.id}">${sucursal.nombre} - ${sucursal.direccion}</option>`;
  });
}

function actualizarFiltroMascotas() {
  const select = document.getElementById('filtroMascota');
  if (!select) return;
  
  select.innerHTML = '<option value="">Todas las mascotas</option>';
  
  mascotasData.forEach(mascota => {
    select.innerHTML += `<option value="${mascota.id}">${mascota.nombre}</option>`;
  });
}

// Mostrar citas en la UI (SOLO las del cliente actual)
function mostrarCitas() {
  const container = document.getElementById('citasListContainer');
  
  if (!citasData || citasData.length === 0) {
    container.innerHTML = '';
    return;
  }

  // Ordenar citas por fecha (más recientes primero)
  const citasOrdenadas = [...citasData].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  
  let html = '';
  
  citasOrdenadas.forEach(cita => {
    const mascota = mascotasData.find(m => m.id === cita.mascota_id);
    const servicio = serviciosData.find(s => s.id === cita.servicio_id);
    const fecha = new Date(cita.fecha);
    
    const estadoBadge = obtenerBadgeEstado(cita.estado);
    const avatarMascota = obtenerAvatarMascota(mascota?.especie);
    
    html += `
      <div class="cita-item border rounded-3 p-3 mb-3 ${cita.estado}" data-cita-id="${cita.id}">
        <div class="row align-items-center">
          <div class="col-md-2">
            <div class="fecha-cita text-center">
              <div class="dia">${fecha.getDate()}</div>
              <div class="mes">${obtenerMesAbrev(fecha.getMonth())}</div>
              <div class="hora">${cita.hora}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="mascota-info">
              <div class="d-flex align-items-center mb-2">
                <div class="mascota-avatar me-2">${avatarMascota}</div>
                <div>
                  <h6 class="mb-0">${mascota ? mascota.nombre : 'Mascota no encontrada'}</h6>
                  <small class="text-muted">${mascota ? `${mascota.especie} - ${mascota.raza}` : 'Sin información'}</small>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="servicio-info">
              <h6 class="mb-1">${servicio ? servicio.nombre : 'Servicio no encontrado'}</h6>
              <small class="text-muted">${cita.veterinario || 'Sin asignar'}</small>
            </div>
          </div>
          <div class="col-md-2">
            ${estadoBadge}
          </div>
          <div class="col-md-2 text-end">
            <div class="btn-group" role="group">
              <button class="btn btn-sm btn-outline-primary" onclick="verDetalles(${cita.id})" title="Ver detalles">
                <i class="bi bi-eye"></i>
              </button>
              ${cita.estado !== 'confirmada' && cita.estado !== 'cancelada' ? 
                `<button class="btn btn-sm btn-outline-warning" onclick="editarCita(${cita.id})" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="cancelarCita(${cita.id})" title="Cancelar">
                  <i class="bi bi-x-circle"></i>
                </button>` : 
                cita.estado === 'confirmada' ?
                `<button class="btn btn-sm btn-outline-secondary" disabled title="Confirmada">
                  <i class="bi bi-check-circle"></i>
                </button>` :
                `<button class="btn btn-sm btn-outline-secondary" disabled title="Cancelada">
                  <i class="bi bi-x-circle"></i>
                </button>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Función para agendar nueva cita (asegurando que sea del cliente actual)
window.agendarCita = async function() {
  try {
    const form = document.getElementById('formNuevaCita');
    
    // Verificar que tenemos el clienteId
    if (!clienteId) {
      mostrarError('Error: No se pudo identificar tu perfil de cliente');
      return;
    }
    
    // Obtener datos del formulario
    const mascotaId = document.getElementById('mascotaSelect').value;
    const servicioId = document.getElementById('servicioSelect').value;
    const sucursalId = document.getElementById('sucursalSelect')?.value;
    const fecha = document.getElementById('fechaCita').value;
    const hora = document.getElementById('horaCita').value;
    const motivo = document.getElementById('motivoConsulta')?.value || '';
    const observaciones = document.getElementById('observaciones')?.value || '';
    
    console.log('Datos del formulario:', {
      clienteId, mascotaId, servicioId, sucursalId, fecha, hora
    });
    
    // Validar campos requeridos
    if (!mascotaId || !servicioId || !fecha || !hora) {
      mostrarError('Por favor, completa todos los campos obligatorios');
      return;
    }

    // Verificar que la mascota pertenece al cliente actual
    const mascotaSeleccionada = mascotasData.find(m => m.id == mascotaId);
    if (!mascotaSeleccionada) {
      mostrarError('La mascota seleccionada no es válida');
      return;
    }

    // Validar que la fecha no sea en el pasado
    const fechaCita = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaCita < hoy) {
      mostrarError('No se pueden agendar citas en fechas pasadas');
      return;
    }

    // Preparar datos para enviar (SIEMPRE con el clienteId actual)
    const datosCita = {
      cliente_id: clienteId, // FORZAR el cliente actual
      mascota_id: parseInt(mascotaId),
      servicio_id: parseInt(servicioId),
      fecha: fecha,
      hora: hora,
      estado: 'pendiente',
      motivo: motivo,
      observaciones: observaciones
    };

    // Agregar sucursal_id solo si existe y está seleccionada
    if (sucursalId) {
      datosCita.sucursal_id = parseInt(sucursalId);
    }

    console.log('Enviando datos de cita:', datosCita);

    // Enviar petición al servidor
    const response = await fetch('/api/citas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosCita)
    });

    const result = await response.json();
    console.log('Respuesta del servidor:', result);

    if (!response.ok) throw new Error(result.error || 'Error al crear la cita');
    
    // Actualizar datos locales
    citasData.push(result.data || result);
    
    // Actualizar UI
    actualizarEstadisticas();
    mostrarCitas();
    actualizarProximaCita();
    actualizarNotificaciones();
    
    // Cerrar modal y limpiar formulario
    const modal = bootstrap.Modal.getInstance(document.getElementById('nuevaCitaModal'));
    if (modal) modal.hide();
    form.reset();
    
    mostrarExito('Cita agendada exitosamente');
    
    // Si era la primera cita, ocultar estado vacío y mostrar secciones
    if (citasData.length === 1) {
      document.getElementById('sinCitasState').style.display = 'none';
      document.getElementById('filtrosSection').style.display = 'block';
      document.getElementById('citasSection').style.display = 'block';
    }

  } catch (error) {
    console.error('Error al agendar cita:', error);
    mostrarError(error.message || 'Error al agendar la cita. Por favor, intenta de nuevo.');
  }
};

// Funciones auxiliares
function obtenerBadgeEstado(estado) {
  const badges = {
    'pendiente': '<span class="badge bg-warning rounded-pill">Pendiente</span>',
    'confirmada': '<span class="badge bg-success rounded-pill">Confirmada</span>',
    'cancelada': '<span class="badge bg-danger rounded-pill">Cancelada</span>'
  };
  return badges[estado] || '<span class="badge bg-secondary rounded-pill">Desconocido</span>';
}

function obtenerAvatarMascota(especie) {
  const avatares = {
    'perro': '🐕',
    'gato': '🐱',
    'ave': '🐦',
    'conejo': '🐰',
    'hamster': '🐹',
    'pez': '🐠'
  };
  return avatares[especie?.toLowerCase()] || '🐾';
}

function obtenerMesAbrev(mes) {
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
                 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return meses[mes];
}

// Actualizar próxima cita en sidebar
function actualizarProximaCita() {
  const widget = document.getElementById('proximaCitaWidget');
  if (!widget) return;
  
  const hoy = new Date();
  
  // Buscar la próxima cita del cliente actual
  const proximasCitas = citasData
    .filter(cita => new Date(cita.fecha) >= hoy && (cita.estado === 'pendiente' || cita.estado === 'confirmada'))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  
  if (proximasCitas.length > 0) {
    const proxima = proximasCitas[0];
    const servicio = serviciosData.find(s => s.id === proxima.servicio_id);
    const fecha = new Date(proxima.fecha);
    const esManana = fecha.toDateString() === new Date(hoy.getTime() + 24*60*60*1000).toDateString();
    
    widget.innerHTML = `
      <p class="mb-1"><strong>${servicio ? servicio.nombre : 'Consulta'}</strong></p>
      <small class="text-muted">${esManana ? 'Mañana' : fecha.toLocaleDateString()} a las ${proxima.hora}</small>
    `;
  } else {
    widget.innerHTML = '<p class="text-muted">No hay citas próximas</p>';
  }
}

// Actualizar notificaciones
function actualizarNotificaciones() {
  const badge = document.getElementById('notificationCount');
  const list = document.getElementById('notificationList');
  
  if (!badge || !list) return;
  
  // Calcular notificaciones (citas próximas del cliente actual)
  const hoy = new Date();
  const manana = new Date(hoy.getTime() + 24*60*60*1000);
  
  const citasHoy = citasData.filter(cita => {
    const fechaCita = new Date(cita.fecha);
    return fechaCita.toDateString() === hoy.toDateString() && 
           (cita.estado === 'pendiente' || cita.estado === 'confirmada');
  });
  
  const citasManana = citasData.filter(cita => {
    const fechaCita = new Date(cita.fecha);
    return fechaCita.toDateString() === manana.toDateString() && 
           (cita.estado === 'pendiente' || cita.estado === 'confirmada');
  });
  
  let notificaciones = [];
  
  citasHoy.forEach(cita => {
    notificaciones.push({
      tipo: 'cita-hoy',
      mensaje: `Cita hoy a las ${cita.hora}`,
      icono: 'bi-calendar-check'
    });
  });
  
  citasManana.forEach(cita => {
    notificaciones.push({
      tipo: 'cita-manana',
      mensaje: `Cita mañana a las ${cita.hora}`,
      icono: 'bi-calendar-event'
    });
  });
  
  // Actualizar badge
  badge.textContent = notificaciones.length;
  badge.style.display = notificaciones.length > 0 ? 'flex' : 'none';
  
  // Actualizar lista
  if (notificaciones.length > 0) {
    let html = '<li><h6 class="dropdown-header">Notificaciones</h6></li>';
    notificaciones.forEach(notif => {
      html += `<li><a class="dropdown-item" href="#"><i class="${notif.icono} me-2"></i>${notif.mensaje}</a></li>`;
    });
    list.innerHTML = html;
  } else {
    list.innerHTML = `
      <li><h6 class="dropdown-header">Notificaciones</h6></li>
      <li class="dropdown-item text-muted">No hay notificaciones</li>
    `;
  }
}

// Configurar fecha mínima para nueva cita
function configurarFechaMinima() {
  const fechaInput = document.getElementById('fechaCita');
  if (fechaInput) {
    const hoy = new Date();
    fechaInput.min = hoy.toISOString().split('T')[0];
  }
}

// Configurar event listeners
function configurarEventListeners() {
  // Cambio de vista
  const vistaLista = document.getElementById('vista-lista');
  const vistaCalendario = document.getElementById('vista-calendario');
  
  if (vistaLista && vistaCalendario) {
    vistaLista.addEventListener('change', function() {
      if (this.checked) {
        document.getElementById('vista-lista-content').style.display = 'block';
        document.getElementById('vista-calendario-content').style.display = 'none';
      }
    });

    vistaCalendario.addEventListener('change', function() {
      if (this.checked) {
        document.getElementById('vista-lista-content').style.display = 'none';
        document.getElementById('vista-calendario-content').style.display = 'block';
      }
    });
  }

  // Filtros
  document.getElementById('buscarCitas')?.addEventListener('input', aplicarFiltros);
  document.getElementById('filtroEstado')?.addEventListener('change', aplicarFiltros);
  document.getElementById('filtroMascota')?.addEventListener('change', aplicarFiltros);
  document.getElementById('filtroFecha')?.addEventListener('change', aplicarFiltros);
}

// Aplicar filtros (solo sobre las citas del cliente actual)
function aplicarFiltros() {
  const termino = document.getElementById('buscarCitas')?.value.toLowerCase() || '';
  const estadoFiltro = document.getElementById('filtroEstado')?.value || '';
  const mascotaFiltro = document.getElementById('filtroMascota')?.value || '';
  const fechaFiltro = document.getElementById('filtroFecha')?.value || '';

  const citasFiltradas = citasData.filter(cita => {
    const mascota = mascotasData.find(m => m.id === cita.mascota_id);
    const servicio = serviciosData.find(s => s.id === cita.servicio_id);
    
    // Filtro de búsqueda
    if (termino) {
      const textoCompleto = `${mascota?.nombre || ''} ${mascota?.especie || ''} ${mascota?.raza || ''} ${servicio?.nombre || ''} ${cita.veterinario || ''}`.toLowerCase();
      if (!textoCompleto.includes(termino)) return false;
    }
    
    // Filtro de estado
    if (estadoFiltro && cita.estado !== estadoFiltro) return false;
    
    // Filtro de mascota
    if (mascotaFiltro && cita.mascota_id != mascotaFiltro) return false;
    
    // Filtro de fecha
    if (fechaFiltro && cita.fecha !== fechaFiltro) return false;
    
    return true;
  });

  // Mostrar resultados filtrados
  mostrarCitasFiltradas(citasFiltradas);
}

// Mostrar citas filtradas
function mostrarCitasFiltradas(citasFiltradas) {
  const container = document.getElementById('citasListContainer');
  
  if (citasFiltradas.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-search display-1 text-muted mb-3"></i>
        <h5 class="text-muted">No se encontraron citas</h5>
        <p class="text-muted">Intenta ajustar los filtros de búsqueda</p>
      </div>
    `;
    return;
  }

  // Reutilizar la lógica de mostrarCitas pero con las citas filtradas
  const citasOrdenadas = [...citasFiltradas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  
  let html = '';
  
  citasOrdenadas.forEach(cita => {
    const mascota = mascotasData.find(m => m.id === cita.mascota_id);
    const servicio = serviciosData.find(s => s.id === cita.servicio_id);
    const fecha = new Date(cita.fecha);
    
    const estadoBadge = obtenerBadgeEstado(cita.estado);
    const avatarMascota = obtenerAvatarMascota(mascota?.especie);
    
    html += `
      <div class="cita-item border rounded-3 p-3 mb-3 ${cita.estado}" data-cita-id="${cita.id}">
        <div class="row align-items-center">
          <div class="col-md-2">
            <div class="fecha-cita text-center">
              <div class="dia">${fecha.getDate()}</div>
              <div class="mes">${obtenerMesAbrev(fecha.getMonth())}</div>
              <div class="hora">${cita.hora}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="mascota-info">
              <div class="d-flex align-items-center mb-2">
                <div class="mascota-avatar me-2">${avatarMascota}</div>
                <div>
                  <h6 class="mb-0">${mascota ? mascota.nombre : 'Mascota no encontrada'}</h6>
                  <small class="text-muted">${mascota ? `${mascota.especie} - ${mascota.raza}` : 'Sin información'}</small>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="servicio-info">
              <h6 class="mb-1">${servicio ? servicio.nombre : 'Servicio no encontrado'}</h6>
              <small class="text-muted">${cita.veterinario || 'Sin asignar'}</small>
            </div>
          </div>
          <div class="col-md-2">
            ${estadoBadge}
          </div>
          <div class="col-md-2 text-end">
            <div class="btn-group" role="group">
              <button class="btn btn-sm btn-outline-primary" onclick="verDetalles(${cita.id})" title="Ver detalles">
                <i class="bi bi-eye"></i>
              </button>
              ${cita.estado !== 'confirmada' && cita.estado !== 'cancelada' ? 
                `<button class="btn btn-sm btn-outline-warning" onclick="editarCita(${cita.id})" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="cancelarCita(${cita.id})" title="Cancelar">
                  <i class="bi bi-x-circle"></i>
                </button>` : 
                `<button class="btn btn-sm btn-outline-secondary" disabled title="Completada">
                  <i class="bi bi-check-circle"></i>
                </button>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Limpiar filtros
window.limpiarFiltros = function() {
  document.getElementById('buscarCitas').value = '';
  document.getElementById('filtroEstado').value = '';
  document.getElementById('filtroMascota').value = '';
  document.getElementById('filtroFecha').value = '';
  
  // Mostrar todas las citas del cliente actual
  mostrarCitas();
};

// Ver detalles de cita (verificando que sea del cliente actual)
window.verDetalles = function(citaId) {
  const cita = citasData.find(c => c.id === citaId);
  if (!cita) {
    mostrarError('Cita no encontrada');
    return;
  }
  
  // Verificar que la cita pertenece al cliente actual
  if (cita.cliente_id !== clienteId) {
    mostrarError('No tienes permisos para ver esta cita');
    return;
  }
  
  const mascota = mascotasData.find(m => m.id === cita.mascota_id);
  const servicio = serviciosData.find(s => s.id === cita.servicio_id);
  const fecha = new Date(cita.fecha);
  
  const estadoBadge = obtenerBadgeEstado(cita.estado);
  const avatarMascota = obtenerAvatarMascota(mascota?.especie);

  document.getElementById('detallesCitaContent').innerHTML = `
    <div class="row g-4">
      <div class="col-md-6">
        <h6>Información de la Mascota</h6>
        <div class="d-flex align-items-center mb-3">
          <div class="me-3" style="font-size: 2rem;">${avatarMascota}</div>
          <div>
            <h5 class="mb-1">${mascota ? mascota.nombre : 'No disponible'}</h5>
            <p class="text-muted mb-0">${mascota ? `${mascota.especie} - ${mascota.raza}` : 'Información no disponible'}</p>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <h6>Estado de la Cita</h6>
        <div class="mb-3">${estadoBadge}</div>
      </div>
      <div class="col-md-6">
        <h6>Fecha y Hora</h6>
        <div class="mb-3">
          <i class="bi bi-calendar-event me-2"></i>${fecha.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
          <br><i class="bi bi-clock me-2"></i>${cita.hora}
        </div>
      </div>
      <div class="col-md-6">
        <h6>Servicio</h6>
        <div class="mb-3">
          <i class="bi bi-clipboard-pulse me-2"></i>${servicio ? servicio.nombre : 'No disponible'}
        </div>
      </div>
      <div class="col-md-6">
        <h6>Veterinario</h6>
        <div class="mb-3">
          <i class="bi bi-person-badge me-2"></i>${cita.veterinario || 'Sin asignar'}
        </div>
      </div>
      <div class="col-md-6">
        <h6>Prioridad</h6>
        <div class="mb-3">
          <span class="badge bg-${cita.prioridad === 'urgente' ? 'danger' : cita.prioridad === 'alta' ? 'warning' : 'secondary'}">${cita.prioridad || 'Normal'}</span>
        </div>
      </div>
      ${cita.motivo ? `
      <div class="col-12">
        <h6>Motivo de la Consulta</h6>
        <div class="mb-3">
          <p class="text-muted">${cita.motivo}</p>
        </div>
      </div>
      ` : ''}
      ${cita.observaciones ? `
      <div class="col-12">
        <h6>Observaciones</h6>
        <div class="mb-3">
          <p class="text-muted">${cita.observaciones}</p>
        </div>
      </div>
      ` : ''}
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById('detallesCitaModal'));
  modal.show();
};

// Editar cita (verificando que sea del cliente actual)
window.editarCita = function(citaId) {
  const cita = citasData.find(c => c.id === citaId);
  if (!cita) {
    mostrarError('Cita no encontrada');
    return;
  }
  
  // Verificar que la cita pertenece al cliente actual
  if (cita.cliente_id !== clienteId) {
    mostrarError('No tienes permisos para editar esta cita');
    return;
  }
  
  if (cita.estado === 'confirmada' || cita.estado === 'cancelada') {
    mostrarError('No se puede editar esta cita');
    return;
  }
  
  // Aquí implementarías la lógica para editar la cita
  mostrarInfo('Función de edición en desarrollo');
};

// Cancelar cita (verificando que sea del cliente actual)
window.cancelarCita = async function(citaId) {
  const cita = citasData.find(c => c.id === citaId);
  if (!cita) {
    mostrarError('Cita no encontrada');
    return;
  }
  
  // Verificar que la cita pertenece al cliente actual
  if (cita.cliente_id !== clienteId) {
    mostrarError('No tienes permisos para cancelar esta cita');
    return;
  }
  
  if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
    return;
  }

  try {
    const response = await fetch(`/api/citas/${citaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estado: 'cancelada'
      })
    });

    if (!response.ok) throw new Error('Error al cancelar la cita');

    // Actualizar datos locales
    const citaIndex = citasData.findIndex(c => c.id === citaId);
    if (citaIndex !== -1) {
      citasData[citaIndex].estado = 'cancelada';
    }

    // Actualizar UI
    actualizarEstadisticas();
    mostrarCitas();
    actualizarProximaCita();
    actualizarNotificaciones();
    
    mostrarExito('Cita cancelada exitosamente');

  } catch (error) {
    console.error('Error al cancelar cita:', error);
    mostrarError('Error al cancelar la cita. Por favor, intenta de nuevo.');
  }
};

// Cerrar sesión
window.cerrarSesion = function() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = '/';
  }
};

// Funciones de utilidad para mostrar mensajes
function mostrarError(mensaje) {
  console.error('Error:', mensaje);
  alert('Error: ' + mensaje);
}

function mostrarExito(mensaje) {
  console.log('Éxito:', mensaje);
  alert('Éxito: ' + mensaje);
}

function mostrarInfo(mensaje) {
  console.log('Info:', mensaje);
  alert('Info: ' + mensaje);
}