var crearCuenta = document.getElementById('crear-cuenta');
var formulario = document.getElementById('formulario-login');

if (crearCuenta) {
    crearCuenta.addEventListener('click', function () {
        document.getElementById('mensaje-registro').textContent = ""
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

        // ruta que envia a la siguiente pantalla
        window.location.href = 'catalogo.html';
    });
}
