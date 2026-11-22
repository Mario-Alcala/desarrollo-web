var botonCrearCuenta = document.getElementById('crear-cuenta');
var formularioLogin = document.getElementById('formulario-login');
var formularioRegistro = document.getElementById('formulario-registro');
var urlUsuarios = 'http://localhost:8081/api/usuarios';

if (botonCrearCuenta) {
    botonCrearCuenta.addEventListener('click', function () {
        window.location.href = 'crear-cuenta.html';
    });
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

            sessionStorage.setItem('usuarioNombre', usuario.nombreUsuario);
            sessionStorage.setItem('usuarioRol', usuario.rol);

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
