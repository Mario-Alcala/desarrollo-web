var botonCrearCuenta = document.getElementById('crear-cuenta');
var formularioLogin = document.getElementById('formulario-login');
var formularioRegistro = document.getElementById('formulario-registro');
if (window.location.hostname === '127.0.0.1') {
    window.location.replace(window.location.href.replace('127.0.0.1', 'localhost'));
}
var hostApiUsuarios = typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname : 'localhost';
var urlUsuarios = 'http://' + hostApiUsuarios + ':8081/api/usuarios';

if (botonCrearCuenta) {
    botonCrearCuenta.addEventListener('click', function () {
        window.location.href = 'crear-cuenta.html';
    });
}

if (formularioLogin && new URLSearchParams(window.location.search).get('motivo') === 'sesion') {
    document.getElementById('mensaje-login').textContent = 'Inicia sesión con una cuenta que tenga acceso a esa pantalla.';
}

if (formularioLogin) {
    formularioLogin.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        var correo = document.getElementById('correo');
        var contrasena = document.getElementById('contrasena');
        var mensaje = document.getElementById('mensaje-login');
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
            var respuesta = await fetch(urlUsuarios + '/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    correoElectronico: correo.value.trim(),
                    contrasena: contrasena.value
                })
            });
            var usuario = await respuesta.json();

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
    });
}

if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', async function (evento) {
        evento.preventDefault();

        var nombre = document.getElementById('nombre-cuenta');
        var correo = document.getElementById('correo-cuenta');
        var contrasena = document.getElementById('contrasena-cuenta');
        var mensaje = document.getElementById('mensaje-registro');
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
            var respuesta = await fetch(urlUsuarios + '/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreUsuario: nombre.value.trim(),
                    correoElectronico: correo.value.trim(),
                    contrasena: contrasena.value
                })
            });
            var resultado = await respuesta.json().catch(function () { return {}; });

            if (!respuesta.ok) {
                throw new Error(resultado.mensaje || resultado.message || 'No se pudo crear la cuenta.');
            }

            alert('Cuenta de cliente creada. Ahora inicia sesión.');
            window.location.href = 'login.html';
        } catch (error) {
            mensaje.textContent = error.message || 'No se pudo conectar con el servidor. Verifica que Spring Boot esté iniciado.';
        }
    });
}
