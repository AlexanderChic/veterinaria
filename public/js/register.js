// /public/js/register.js
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const registerBtn = document.getElementById('registerBtn');
    const registerSpinner = document.getElementById('registerSpinner');
    const btnText = document.getElementById('btnText');

    // Cargar departamentos al iniciar
    cargarDepartamentos();

    // Event listeners
    setupEventListeners();

    function setupEventListeners() {
        // Validación de nombre y apellido en tiempo real
        document.getElementById('nombre').addEventListener('input', validarNombre);
        document.getElementById('apellido').addEventListener('input', validarApellido);
        
        // Validación de email
        document.getElementById('email').addEventListener('blur', validarEmail);
        
        // Validación de teléfono
        document.getElementById('telefono').addEventListener('input', validarTelefono);
        
        // Validación de contraseña
        document.getElementById('password').addEventListener('input', validarPassword);
        document.getElementById('confirmPassword').addEventListener('input', validarConfirmPassword);
        
        // Validación de dirección
        document.getElementById('calle').addEventListener('input', validarCalle);
        document.getElementById('numeroCasa').addEventListener('input', validarNumeroCasa);
        
        // Cargar municipios cuando cambie el departamento
        document.getElementById('departamento').addEventListener('change', cargarMunicipios);
        
        // Submit del formulario
        registerForm.addEventListener('submit', handleSubmit);
    }

    function validarNombre() {
        const nombre = document.getElementById('nombre');
        const regex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
        
        if (!regex.test(nombre.value)) {
            mostrarErrorCampo(nombre, 'Solo se permiten letras y tildes');
            return false;
        } else {
            // Formatear nombre: Primera letra mayúscula, resto minúscula
            nombre.value = formatearNombre(nombre.value);
            removerErrorCampo(nombre);
            return true;
        }
    }

    function validarApellido() {
        const apellido = document.getElementById('apellido');
        const regex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
        
        if (!regex.test(apellido.value)) {
            mostrarErrorCampo(apellido, 'Solo se permiten letras y tildes');
            return false;
        } else {
            // Formatear apellido: Primera letra mayúscula, resto minúscula
            apellido.value = formatearNombre(apellido.value);
            removerErrorCampo(apellido);
            return true;
        }
    }

    function formatearNombre(texto) {
        return texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()).trim();
    }

    function validarEmail() {
        const email = document.getElementById('email');
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!regex.test(email.value)) {
            mostrarErrorCampo(email, 'Ingresa un correo electrónico válido');
            return false;
        } else {
            email.value = email.value.toLowerCase().trim();
            removerErrorCampo(email);
            return true;
        }
    }

    function validarTelefono() {
        const telefono = document.getElementById('telefono');
        const regex = /^[0-9]{8}$/;
        
        // Solo permitir números
        telefono.value = telefono.value.replace(/[^0-9]/g, '');
        
        if (!regex.test(telefono.value)) {
            mostrarErrorCampo(telefono, 'Debe tener exactamente 8 dígitos');
            return false;
        } else {
            removerErrorCampo(telefono);
            return true;
        }
    }

    function validarPassword() {
        const password = document.getElementById('password');
        const value = password.value;
        
        // Validaciones de seguridad
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\';/~`]/.test(value);
        const isLongEnough = value.length >= 8;

        let errorMessage = '';
        let isValid = true;

        if (!isLongEnough) {
            errorMessage += 'Mínimo 8 caracteres. ';
            isValid = false;
        }
        if (!hasUpperCase) {
            errorMessage += 'Una mayúscula. ';
            isValid = false;
        }
        if (!hasLowerCase) {
            errorMessage += 'Una minúscula. ';
            isValid = false;
        }
        if (!hasNumbers) {
            errorMessage += 'Un número. ';
            isValid = false;
        }
        if (!hasSpecialChar) {
            errorMessage += 'Un carácter especial. ';
            isValid = false;
        }

        if (!isValid) {
            mostrarErrorCampo(password, `Contraseña débil. Falta: ${errorMessage}`);
            return false;
        } else {
            removerErrorCampo(password);
            // Verificar confirmación de contraseña si existe
            validarConfirmPassword();
            return true;
        }
    }

    function validarConfirmPassword() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const matchIndicator = document.getElementById('passwordMatch');
        const mismatchIndicator = document.getElementById('passwordMismatch');

        if (confirmPassword === '') {
            matchIndicator.classList.add('d-none');
            mismatchIndicator.classList.add('d-none');
            return false;
        }

        if (password === confirmPassword) {
            matchIndicator.classList.remove('d-none');
            mismatchIndicator.classList.add('d-none');
            removerErrorCampo(document.getElementById('confirmPassword'));
            return true;
        } else {
            matchIndicator.classList.add('d-none');
            mismatchIndicator.classList.remove('d-none');
            mostrarErrorCampo(document.getElementById('confirmPassword'), 'Las contraseñas no coinciden');
            return false;
        }
    }

    function validarCalle() {
        const calle = document.getElementById('calle');
        const regex = /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s.,\-]+$/;
        
        if (!regex.test(calle.value)) {
            mostrarErrorCampo(calle, 'Solo letras, números, puntos, comas y guiones');
            return false;
        } else {
            removerErrorCampo(calle);
            return true;
        }
    }

    function validarNumeroCasa() {
        const numeroCasa = document.getElementById('numeroCasa');
        const regex = /^[a-zA-Z0-9\-]+$/;
        
        if (!regex.test(numeroCasa.value)) {
            mostrarErrorCampo(numeroCasa, 'Solo letras, números y guiones');
            return false;
        } else {
            removerErrorCampo(numeroCasa);
            return true;
        }
    }

    function mostrarErrorCampo(campo, mensaje) {
        campo.classList.add('is-invalid');
        
        // Remover mensaje anterior si existe
        const existingError = campo.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
        
        // Crear nuevo mensaje
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = mensaje;
        campo.parentNode.appendChild(errorDiv);
    }

    function removerErrorCampo(campo) {
        campo.classList.remove('is-invalid');
        const existingError = campo.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    }

    async function cargarDepartamentos() {
        try {
            const response = await fetch('/api/departamentos');
            const departamentos = await response.json();
            
            const selectDepartamento = document.getElementById('departamento');
            selectDepartamento.innerHTML = '<option value="">Selecciona departamento</option>';
            
            departamentos.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.nombre;
                selectDepartamento.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar departamentos:', error);
            mostrarError('Error al cargar los departamentos');
        }
    }

    async function cargarMunicipios() {
        const departamentoId = document.getElementById('departamento').value;
        const selectMunicipio = document.getElementById('municipio');
        
        if (!departamentoId) {
            selectMunicipio.innerHTML = '<option value="">Selecciona municipio</option>';
            return;
        }

        try {
            const response = await fetch(`/api/municipios/departamento/${departamentoId}`);
            const municipios = await response.json();
            
            selectMunicipio.innerHTML = '<option value="">Selecciona municipio</option>';
            
            municipios.forEach(mun => {
                const option = document.createElement('option');
                option.value = mun.id;
                option.textContent = mun.nombre;
                selectMunicipio.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar municipios:', error);
            mostrarError('Error al cargar los municipios');
        }
    }

    function validarFormulario() {
        const validaciones = [
            validarNombre(),
            validarApellido(),
            validarEmail(),
            validarTelefono(),
            validarPassword(),
            validarConfirmPassword(),
            validarCalle(),
            validarNumeroCasa(),
            document.getElementById('departamento').value !== '',
            document.getElementById('municipio').value !== ''
        ];

        return validaciones.every(v => v === true);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!validarFormulario()) {
            mostrarError('Por favor, completa todos los campos correctamente');
            return;
        }

        // Mostrar loading
        mostrarLoading(true);

        try {
            // Preparar datos
            const formData = {
                nombre: document.getElementById('nombre').value.trim(),
                apellido: document.getElementById('apellido').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                password: document.getElementById('password').value,
                calle: document.getElementById('calle').value.trim(),
                numeroCasa: document.getElementById('numeroCasa').value.trim(),
                municipioId: document.getElementById('municipio').value,
                departamentoId: document.getElementById('departamento').value
            };

            console.log('Enviando datos:', formData);

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                mostrarExito('¡Cuenta creada exitosamente! Redirigiendo al login...');
                
                // Limpiar formulario
                registerForm.reset();
                
                // Redireccionar después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                mostrarError(result.error || 'Error al crear la cuenta');
            }
        } catch (error) {
            console.error('Error en el registro:', error);
            mostrarError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            mostrarLoading(false);
        }
    }

    function mostrarLoading(show) {
        if (show) {
            registerBtn.disabled = true;
            registerSpinner.classList.remove('d-none');
            btnText.style.opacity = '0.7';
        } else {
            registerBtn.disabled = false;
            registerSpinner.classList.add('d-none');
            btnText.style.opacity = '1';
        }
    }

    function mostrarError(mensaje) {
        errorMessage.textContent = mensaje;
        errorMessage.classList.remove('d-none');
        successMessage.classList.add('d-none');
        
        // Scroll al mensaje
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function mostrarExito(mensaje) {
        successMessage.textContent = mensaje;
        successMessage.classList.remove('d-none');
        errorMessage.classList.add('d-none');
        
        // Scroll al mensaje
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});