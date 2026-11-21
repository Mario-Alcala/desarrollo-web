var crearCuenta = document.getElementById('crear-cuenta');
var formulario = document.getElementById('formulario-login');

if (crearCuenta) {
    crearCuenta.addEventListener('click', function () {
        window.location.href = 'crear-cuenta.html';
    });
}

if (formulario) {
    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();

        var nombre = document.getElementById('nombre');
        var correo = document.getElementById('correo');
        var contrasena = document.getElementById('contrasena');
        var mensaje = document.getElementById('mensaje-login');

        // estar llenotodo
        if (nombre.value.trim() === '') {
            mensaje.textContent = 'Escribe tu nombre.';
            nombre.focus();
            return;
        }

        if (correo.value.trim() === '') {
            mensaje.textContent = 'Escribe tu correo.';
            correo.focus();
            return;
        }

        if (contrasena.value.trim() === '') {
            mensaje.textContent = 'Escribe tu contraseña.';
            contrasena.focus();
            return;
        }

        if (!correo.checkValidity()) {
            mensaje.textContent = 'Escribe un correo válido.';
            correo.focus();
            return;
        }

        var tipoAcceso = document.getElementById('tipo-acceso').value;

        // Cuenta de prueba local; pendiente conectar al login del backend.
        if (tipoAcceso === 'trabajador') {
            if (correo.value.trim().toLowerCase() !== 'trabajador@gmail.com' || contrasena.value !== '1234') {
                mensaje.textContent = 'Correo o contraseña del trabajador incorrectos.';
                return;
            }
            window.location.href = 'cultivos.html';
        } else {
            window.location.href = 'catalogo.html';
        }
    });
}
