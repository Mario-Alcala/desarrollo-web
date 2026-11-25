/**
 * @file Inicia sesión y registra clientes mediante la API de usuarios.
 *
 * @author Equipo de Gestión de Cultivos
 */

/**
 * Maneja los formularios de acceso y registro.
 */
class AccesoUsuarios {
    /**
     * Ubica los controles y prepara la dirección de la API de usuarios.
     */
    constructor() {
        this.botonCrearCuenta = document.getElementById('crear-cuenta');
        this.formularioLogin = document.getElementById('formulario-login');
        this.formularioRegistro = document.getElementById('formulario-registro');
        this.host = window.location.hostname || 'localhost';
        const hostApi = this.host === '127.0.0.1' ? 'localhost' : this.host;
        this.urlUsuarios = 'http://' + hostApi + ':8081/api/usuarios';
    }

    /**
     * Valida el acceso y dirige al usuario a la pantalla de su rol.
     *
     * @param {SubmitEvent} evento - Evento de envío del formulario.
     */
    async iniciarSesionDesdeFormulario(evento) {
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
            const respuesta = await fetch(this.urlUsuarios + '/login', {
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
     * Valida el formulario y registra una cuenta de cliente.
     *
     * @param {SubmitEvent} evento - Evento de envío del formulario.
     */
    async registrarClienteDesdeFormulario(evento) {
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
            const respuesta = await fetch(this.urlUsuarios + '/registro', {
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
    abrirRegistro() {
        window.location.href = 'crear-cuenta.html';
    }

    /**
     * Conecta los controles de inicio de sesión y registro.
     */
    iniciarAcceso() {
        if (this.host === '127.0.0.1') {
            window.location.replace(window.location.href.replace('127.0.0.1', 'localhost'));
        }

        if (this.botonCrearCuenta) {
            this.botonCrearCuenta.addEventListener('click', () => this.abrirRegistro());
        }
        if (this.formularioLogin) {
            const motivo = new URLSearchParams(window.location.search).get('motivo');
            if (motivo === 'sesion') {
                document.getElementById('mensaje-login').textContent = 'Inicia sesión con una cuenta que tenga acceso a esa pantalla.';
            }
            this.formularioLogin.addEventListener('submit', evento => this.iniciarSesionDesdeFormulario(evento));
        }
        if (this.formularioRegistro) {
            this.formularioRegistro.addEventListener('submit', evento => this.registrarClienteDesdeFormulario(evento));
        }
    }
}

const accesoUsuarios = new AccesoUsuarios();
accesoUsuarios.iniciarAcceso();
