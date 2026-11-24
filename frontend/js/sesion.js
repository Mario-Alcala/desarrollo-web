/* Datos: revisa la sesión iniciada y conecta el cierre de sesión. No recibe atributos. */

const CLAVE_SESION = 'usuarioSesion';
const redirigiendoAlHostLocal = window.location.hostname === '127.0.0.1';

/* Datos: lee la cuenta guardada en la sesión del navegador. No recibe atributos. */
function usuarioActual() {
    try {
        const texto = sessionStorage.getItem(CLAVE_SESION);
        const usuario = texto ? JSON.parse(texto) : null;
        if (usuario && Number.isInteger(usuario.idUsuario)) {
            return usuario;
        }
    } catch (error) {
        return null;
    }
    return null;
}

/* Datos: guarda el identificador, nombre, correo y rol. Recibe el usuario. */
function guardarSesion(usuario) {
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify({
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombreUsuario || usuario.nombre || '',
        correo: usuario.correoElectronico || '',
        rol: usuario.rol
    }));
}

/* Datos: cierra la sesión en la API y en el navegador. Recibe una ruta de regreso opcional. */
function cerrarSesion(rutaLogin) {
    const destino = rutaLogin || '../login.html';
    const host = window.location.hostname || 'localhost';
    fetch('http://' + host + ':8081/api/usuarios/logout', {
        method: 'POST',
        credentials: 'include'
    }).catch(function () {}).finally(function () {
        sessionStorage.removeItem(CLAVE_SESION);
        sessionStorage.removeItem('usuarioNombre');
        sessionStorage.removeItem('usuarioRol');
        sessionStorage.removeItem('usuarioId');
        window.location.href = destino;
    });
}

/* Datos: revisa si la cuenta tiene acceso a la página. Recibe los roles y una ruta de regreso opcional. */
function exigirSesion(roles, rutaLogin) {
    const usuario = usuarioActual();
    if (!usuario || (roles && roles.length && roles.indexOf(usuario.rol) === -1)) {
        window.location.replace((rutaLogin || '../login.html') + '?motivo=sesion');
        return null;
    }
    return usuario;
}

/* Datos: muestra la cuenta y conecta el botón de salida. Recibe el usuario. */
function prepararBarraSesion(usuario) {
    const nombre = document.getElementById('usuario-barra');
    if (nombre && usuario) {
        nombre.textContent = (usuario.nombre || 'Usuario #' + usuario.idUsuario)
            + (usuario.rol === 'trabajador' ? ' · Trabajador' : ' · Administrador');
    }
    const boton = document.getElementById('cerrar-sesion');
    if (boton) {
        boton.addEventListener('click', function () { cerrarSesion(); });
    }
}

/* Datos: revisa la sesión y prepara la barra al abrir la página. No recibe atributos. */
function iniciarSesionPagina() {
    if (redirigiendoAlHostLocal) {
        window.location.replace(window.location.href.replace('127.0.0.1', 'localhost'));
        return;
    }
    if (typeof document !== 'undefined' && document.body && document.body.dataset.roles) {
        const usuarioDePagina = exigirSesion(document.body.dataset.roles.split(','));
        prepararBarraSesion(usuarioDePagina);
    }
}

iniciarSesionPagina();
