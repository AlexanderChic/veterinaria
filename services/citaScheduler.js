// /services/citaScheduler.js
import * as Cita from '../models/cita.js';

// Función para actualizar citas pasadas
export const verificarYActualizarCitas = () => {
  const ahora = new Date();
  const fechaHora = ahora.toLocaleString('es-GT', { 
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  console.log(`\n🔄 [${fechaHora}] Verificando citas pasadas...`);
  
  Cita.actualizarCitasPasadas((err, result) => {
    if (err) {
      console.error('❌ Error al actualizar citas:', err);
      return;
    }
    
    if (result.affectedRows > 0) {
      console.log(`✅ ${result.affectedRows} cita(s) actualizada(s) a completada`);
    } else {
      console.log('✓ No hay citas pendientes para actualizar');
    }
  });
};

// Ejecutar verificación cada hora (3600000 ms = 1 hora)
export const iniciarScheduler = () => {
  console.log('\n═══════════════════════════════════════════════');
  console.log('📅 SCHEDULER DE CITAS INICIADO');
  console.log('═══════════════════════════════════════════════');
  console.log('⏰ Frecuencia: Cada 1 hora');
  console.log('🌙 Verificación especial: A medianoche (00:00)');
  console.log('═══════════════════════════════════════════════\n');
  
  // Ejecutar inmediatamente al iniciar el servidor
  verificarYActualizarCitas();
  
  // Ejecutar cada hora (3600000 ms)
  const intervaloHora = setInterval(verificarYActualizarCitas, 3600000);
  
  // Verificar cada minuto si es medianoche para ejecutar verificación especial
  const intervaloMedianoche = setInterval(() => {
    const ahora = new Date();
    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    
    // Si es exactamente medianoche (00:00)
    if (horas === 0 && minutos === 0) {
      console.log('\n🌙 ═══════════════════════════════════════════════');
      console.log('   MEDIANOCHE - VERIFICACIÓN AUTOMÁTICA DEL DÍA');
      console.log('   ═══════════════════════════════════════════════');
      verificarYActualizarCitas();
    }
  }, 60000); // Verificar cada minuto (60000 ms)
  
  // Retornar función para detener el scheduler si es necesario
  return () => {
    clearInterval(intervaloHora);
    clearInterval(intervaloMedianoche);
    console.log('\n🛑 Scheduler de citas detenido');
  };
};

// Función auxiliar para ejecutar verificación manual (útil para debugging)
export const ejecutarVerificacionManual = () => {
  console.log('\n🔧 VERIFICACIÓN MANUAL SOLICITADA');
  console.log('═══════════════════════════════════════════════');
  verificarYActualizarCitas();
};