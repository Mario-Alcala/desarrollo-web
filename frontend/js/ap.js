/**
 * @file Conecta el inicio de sesión y el registro de clientes con la API de usuarios.
 *
 * @author Equipo de Gestión de Cultivos
 */

const botonCrearCuenta = document.getElementById('crear-cuenta');
const formularioLogin = document.getElementById('formulario-login');
const formularioRegistro = document.getElementById('formulario-registro');
const hostAcceso = window.location.hostname || 'localhost';
const urlUsuarios = 'http://' + (hostAcceso === '127.0.0.1' ? 'localhost' : hostAcceso) + ':8081/api/usuarios';

/**
 * Valida el formulario, autentica al usuario y abre la pantalla de su rol.
 *
 * @param {SubmitEvent} evento - Evento de envío del formulario.
 */
async function iniciarSesionDesdeFormulario(evento) {
    evento.preventDefault();

    const correo = document.getElementById('correo');
    const contrasena = document.getElementById('contrasena');
    const mensaje = document.getElementById('mensaje-login');
    mensaje.textContent = '';

    if (!correo.checkValidity()) {
        mensaje.textContent = 'Escribe un correo válido.';
        correo.focus();
        return;
    }
    if (contrasena.value.trim() === '') {
        mensaje.textContent = 'Escribe tu contraseña.';
        contrasena.focus();
        return;
    }

    try {
        const respuesta = await fetch(urlUsuarios + '/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                correoElectronico: correo.value.trim(),
                contrasena: contrasena.value
            })
        });
        const usuario = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(usuario.message || usuario.mensaje || 'Correo o contraseña incorrectos.');
        }

        // Sesión que leen las pantallas (js/sesion.js): id, nombre y rol del usuario.
        sessionStorage.setItem('usuarioSesion', JSON.stringify({
            idUsuario: usuario.idUsuario,
            nombre: usuario.nombreUsuario,
            correo: usuario.correoElectronico,
            rol: usuario.rol
        }));
        sessionStorage.setItem('usuarioNombre', usuario.nombreUsuario);
        sessionStorage.setItem('usuarioRol', usuario.rol);
        sessionStorage.setItem('usuarioId', usuario.idUsuario);

        if (usuario.rol === 'administrador_agricultor' || usuario.rol === 'agricultor') {
            window.location.href = 'administrador-agricultor/resumen.html';
        } else if (usuario.rol === 'trabajador') {
            window.location.href = 'empleado/cultivos.html';
        } else if (usuario.rol === 'cliente') {
            window.location.href = 'cliente/catalogo.html';
        } else {
            mensaje.textContent = 'La cuenta tiene un rol no reconocido.';
        }
    } catch (error) {
        mensaje.textContent = error.message || 'No se pudo conectar con el servidor. Verifica que Spring Boot esté iniciado.';
    }
}

/**
 * Valida y registra una cuenta de cliente en la API.
 *
 * @param {SubmitEvent} evento - Evento de envío del formulario.
 */
async function registrarClienteDesdeFormulario(evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombre-cuenta');
    const correo = document.getElementById('correo-cuenta');
    const contrasena = document.getElementById('contrasena-cuenta');
    const mensaje = document.getElementById('mensaje-registro');
    mensaje.textContent = '';

    if (nombre.value.trim() === '') {
        mensaje.textContent = 'Escribe tu nombre.';
        nombre.focus();
        return;
    }
    if (!correo.checkValidity()) {
        mensaje.textContent = 'Escribe un correo válido.';
        correo.focus();
        return;
    }
    if (contrasena.value.trim() === '') {
        mensaje.textContent = 'Escribe una contraseña.';
        contrasena.focus();
        return;
    }

    try {
        const respuesta = await fetch(urlUsuarios + '/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombreUsuario: nombre.value.trim(),
                correoElectronico: correo.value.trim(),
                contrasena: contrasena.value
            })
        });
        const resultado = await respuesta.json().catch(function () { return {}; });

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || resultado.message || 'No se pudo crear la cuenta.');
        }

        alert('Cuenta de cliente creada. Ahora inicia sesión.');
        window.location.href = 'login.html';
    } catch (error) {
        mensaje.textContent = error.message || 'No se pudo conectar con el servidor. Verifica que Spring Boot esté iniciado.';
    }
}

/**
 * Abre el formulario de registro.
 */
function abrirRegistro() {
    window.location.href = 'crear-cuenta.html';
}

/**
 * Prepara los controles de acceso disponibles en esta página.
 */
function iniciarAcceso() {
    if (hostAcceso === '127.0.0.1') {
        window.location.replace(window.location.href.replace('127.0.0.1', 'localhost'));
    }

    if (botonCrearCuenta) {
        botonCrearCuenta.addEventListener('click', abrirRegistro);
    }
    if (formularioLogin) {
        const motivo = new URLSearchParams(window.location.search).get('motivo');
        if (motivo === 'sesion') {
            document.getElementById('mensaje-login').textContent = 'Inicia sesión con una cuenta que tenga acceso a esa pantalla.';
        }
        formularioLogin.addEventListener('submit', iniciarSesionDesdeFormulario);
    }
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', registrarClienteDesdeFormulario);
    }
}

iniciarAcceso();
