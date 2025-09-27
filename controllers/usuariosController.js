// /controllers/usuariosController.js
import { 
  obtenerUsuarioPorEmail, 
  crearUsuario, 
  verificarEmailExistente, 
  crearCliente 
} from '../models/usuarios.js';
import { obtenerMunicipioPorId } from '../models/municipio.js';
import { obtenerDepartamentoPorId } from '../models/departamento.js';

// Iniciar sesión
export const loginUsuario = (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Correo recibido:', email);
    console.log('Contraseña recibida:', password);

    // Verificar que los campos requeridos estén presentes
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos',
        received: { email: !!email, password: !!password }
      });
    }

    // Buscar el usuario por correo electrónico
    obtenerUsuarioPorEmail(email, (err, usuario) => {
      if (err) {
        console.error('Error en la base de datos:', err);
        return res.status(500).json({ error: 'Error al buscar el usuario en la base de datos' });
      }
      
      console.log('Usuario encontrado:', usuario);
      
      if (!usuario) {
        console.log('Usuario no encontrado para email:', email);
        return res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos' });
      }

      console.log('Contraseña en BD:', usuario.password);
      console.log('Contraseña proporcionada:', password);

      // Validar la contraseña (sin encriptar por ahora)
      if (usuario.password !== password) {
        console.log('Contraseña incorrecta');
        return res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos' });
      }

      console.log('Login exitoso para usuario:', usuario.email, 'con rol:', usuario.rol);

      // Determinar la página de redirección basada en el rol
      let redirectUrl = '/dashboard.html';
      
      switch (usuario.rol.toLowerCase()) {
        case 'cliente':
          redirectUrl = '/cliente-dashboard.html';
          break;
        case 'vendedor':
          redirectUrl = '/vendedor-dashboard.html';
          break;
        case 'admin':
          redirectUrl = '/admin-dashboard.html';
          break;
        default:
          redirectUrl = '/dashboard.html';
      }

      console.log('Redirigiendo a:', redirectUrl);

      // Responder con la información del usuario y su rol
      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
        redirectUrl: redirectUrl
      });
    });
    
  } catch (error) {
    console.error('Error general en loginUsuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Registrar nuevo usuario
export const registrarUsuario = (req, res) => {
  try {
    const { 
      nombre, 
      apellido, 
      email, 
      telefono, 
      password, 
      calle, 
      numeroCasa, 
      municipioId, 
      departamentoId 
    } = req.body;

    console.log('Datos recibidos para registro:', {
      nombre, apellido, email, telefono, municipioId, departamentoId
    });

    // Validar campos requeridos
    if (!nombre || !apellido || !email || !telefono || !password || 
        !calle || !numeroCasa || !municipioId || !departamentoId) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Formato de email inválido' 
      });
    }

    // Validar teléfono (8 dígitos)
    const telefonoRegex = /^[0-9]{8}$/;
    if (!telefonoRegex.test(telefono)) {
      return res.status(400).json({ 
        error: 'El teléfono debe tener exactamente 8 dígitos' 
      });
    }

    // Validar contraseña segura
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial' 
      });
    }

    // Verificar que el email no exista
    verificarEmailExistente(email.toLowerCase(), (err, existe) => {
      if (err) {
        console.error('Error al verificar email:', err);
        return res.status(500).json({ error: 'Error al verificar el email' });
      }

      if (existe) {
        return res.status(400).json({ error: 'Este correo electrónico ya está registrado' });
      }

      // Verificar que el municipio y departamento existan y coincidan
      obtenerMunicipioPorId(municipioId, (err, municipio) => {
        if (err) {
          console.error('Error al verificar municipio:', err);
          return res.status(500).json({ error: 'Error al verificar el municipio' });
        }

        if (!municipio) {
          return res.status(400).json({ error: 'Municipio no válido' });
        }

        if (municipio.departamento_id != departamentoId) {
          return res.status(400).json({ error: 'El municipio no pertenece al departamento seleccionado' });
        }

        // Formatear nombre completo
        const nombreCompleto = formatearNombre(nombre) + ' ' + formatearNombre(apellido);
        
        // Construir dirección completa
        const direccionCompleta = `${calle}, ${numeroCasa}, ${municipio.nombre}, ${municipio.departamento_nombre}`;

        // Preparar datos del usuario
        const datosUsuario = {
          nombre: nombreCompleto,
          email: email.toLowerCase(),
          password: password, // En producción deberías encriptar esto
          telefono: telefono,
          direccion: direccionCompleta,
          rol: 'cliente'
        };

        // Crear el usuario
        crearUsuario(datosUsuario, (err, usuarioCreado) => {
          if (err) {
            console.error('Error al crear usuario:', err);
            if (err.code === 'ER_DUP_ENTRY') {
              return res.status(400).json({ error: 'Este correo electrónico ya está registrado' });
            }
            return res.status(500).json({ error: 'Error al crear el usuario' });
          }

          console.log('Usuario creado exitosamente:', usuarioCreado);

          // Crear el registro de cliente
          crearCliente(usuarioCreado.id, (err, clienteCreado) => {
            if (err) {
              console.error('Error al crear cliente:', err);
              // Aunque falle la creación del cliente, el usuario ya está creado
              // Se podría considerar hacer rollback aquí si fuera necesario
              return res.status(500).json({ error: 'Usuario creado pero error al registrar como cliente' });
            }

            console.log('Cliente creado exitosamente:', clienteCreado);

            // Respuesta exitosa
            res.status(201).json({
              message: 'Usuario registrado exitosamente',
              usuario: {
                id: usuarioCreado.id,
                nombre: usuarioCreado.nombre,
                email: usuarioCreado.email,
                rol: usuarioCreado.rol
              },
              cliente: {
                id: clienteCreado.id,
                usuario_id: clienteCreado.usuario_id,
                fecha_registro: clienteCreado.fecha_registro
              }
            });
          });
        });
      });
    });

  } catch (error) {
    console.error('Error general en registrarUsuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

// Función auxiliar para formatear nombres
function formatearNombre(texto) {
  return texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()).trim();
}