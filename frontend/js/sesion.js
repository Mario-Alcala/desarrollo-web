/*
 * ARCHIVO: js/sesion.js
 * CAPA: FRONTEND (lógica compartida). Lee el usuario que inició sesión y protege las páginas por rol.
 * CONTRATO: js/ap.js guarda al iniciar sesión (POST /api/usuarios/login):
 *   sessionStorage.setItem('usuarioSesion', JSON.stringify({ idUsuario: 1, nombre: 'Ana', rol: 'trabajador' }));
 * USO EN UNA PÁGINA: <body data-roles="trabajador,administrador_agricultor"> y cargar este archivo.
 *   Si no hay sesión o el rol no está permitido, manda a login.html.
 *   Si la barra tiene <span id="usuario-barra"> y <button id="cerrar-sesion">, los llena y los conecta.
 */

var CLAVE_SESION = 'usuarioSesion';

function usuarioActual() {
    try {
        var texto = sessionStorage.getItem(CLAVE_SESION);
        var usuario = texto ? JSON.parse(texto) : null;
        if (usuario && Number.isInteger(usuario.idUsuario)) {
            return usuario;
        }
    } catch (error) {
        // sesión ilegible: se trata como si no hubiera sesión
    }
    return null;
}

function guardarSesion(usuario) {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify({
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombreUsuario || usuario.nombre || '',
        correo: usuario.correoElectronico || '',
        rol: usuario.rol
    }));
}

function cerrarSesion(rutaLogin) {
    sessionStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem('usuarioNombre');
    sessionStorage.removeItem('usuarioRol');
    window.location.href = rutaLogin || '../login.html';
}

/* Devuelve el usuario si su rol está en la lista; si no, redirige al login y devuelve null. */
function exigirSesion(roles, rutaLogin) {
    var usuario = usuarioActual();
    if (!usuario || (roles && roles.length && roles.indexOf(usuario.rol) === -1)) {
        window.location.replace((rutaLogin || '../login.html') + '?motivo=sesion');
        return null;
    }
    return usuario;
}

function prepararBarraSesion(usuario) {
    var nombre = document.getElementById('usuario-barra');
    if (nombre && usuario) {
        nombre.textContent = (usuario.nombre || 'Usuario #' + usuario.idUsuario)
            + (usuario.rol === 'trabajador' ? ' · Trabajador' : ' · Administrador');
    }
    var boton = document.getElementById('cerrar-sesion');
    if (boton) {
        boton.addEventListener('click', function () { cerrarSesion(); });
    }
}

if (typeof document !== 'undefined' && document.body && document.body.dataset.roles) {
    var usuarioDePagina = exigirSesion(document.body.dataset.roles.split(','));
    prepararBarraSesion(usuarioDePagina);
}
