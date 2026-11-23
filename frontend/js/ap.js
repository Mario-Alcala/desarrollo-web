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
            // El id y el rol salen del backend (GET /api/usuarios) para que las pantallas del trabajador
            // sepan quién registra cosechas y movimientos. La contraseña sigue validándose localmente.
            pedirApi('/usuarios').then(function (usuarios) {
                var sesion = sesionDeTrabajador(usuarios, correo.value);
                if (!sesion) {
                    mensaje.textContent = 'Ese correo no está registrado como trabajador. Pide al administrador que lo registre en Usuarios.';
                    return;
                }
                sessionStorage.setItem('usuarioSesion', JSON.stringify(sesion));
                window.location.href = 'cultivos.html';
            }).catch(function () {
                mensaje.textContent = 'No se pudo conectar con el backend (¿está encendido en el puerto 8081?).';
            });
        } else {
            sessionStorage.removeItem('usuarioSesion');
            window.location.href = 'catalogo.html';
        }
    });
}

// Busca en la lista de usuarios del backend al trabajador que inicia sesión.
// Devuelve { idUsuario, nombre, rol } (el formato que lee js/sesion.js) o null si no existe o no es trabajador.
function sesionDeTrabajador(usuarios, correo) {
    var buscado = String(correo || '').trim().toLowerCase();
    var lista = usuarios || [];
    for (var i = 0; i < lista.length; i++) {
        var u = lista[i];
        if (String(u.correoElectronico || '').trim().toLowerCase() === buscado && u.rol === 'trabajador') {
            return { idUsuario: u.idUsuario, nombre: u.nombreUsuario, rol: u.rol };
        }
    }
    return null;
}