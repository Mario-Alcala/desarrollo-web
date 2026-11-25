/**
 * Maneja la sesión en las pantallas que requieren acceso.
 */
class SesionNavegador {
    /**
     * Prepara la clave de sesión e identifica cuándo se debe abrir localhost.
     */
    constructor() {
        this.CLAVE_SESION = 'usuarioSesion';
        this.redirigiendoAlHostLocal = window.location.hostname === '127.0.0.1';
    }

    /**
     * Lee la cuenta activa del almacenamiento de sesión.
     */
    usuarioActual() {
        try {
            const texto = sessionStorage.getItem(this.CLAVE_SESION);
            const usuario = texto ? JSON.parse(texto) : null;
            if (usuario && Number.isInteger(usuario.idUsuario)) {
                return usuario;
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    /**
     * Guarda el identificador, nombre, correo y rol de la cuenta.
     *
     * @param {Object} usuario - Datos de la cuenta guardada o devuelta por la API.
     */
    guardarSesion(usuario) {
        sessionStorage.setItem(this.CLAVE_SESION, JSON.stringify({
            idUsuario: usuario.idUsuario,
            nombre: usuario.nombreUsuario || usuario.nombre || '',
            correo: usuario.correoElectronico || '',
            rol: usuario.rol
        }));
    }

    /**
     * Cierra la sesión en la API y borra los datos del navegador.
     *
     * @param {string} [rutaLogin] - Página a la que vuelve el usuario.
     */
    cerrarSesion(rutaLogin) {
        const pantalla = this;
        const destino = rutaLogin || '../login.html';
        const host = window.location.hostname || 'localhost';
        fetch('http://' + host + ':8081/api/usuarios/logout', {
            method: 'POST',
            credentials: 'include'
        }).catch(function () {}).finally(function () {
            sessionStorage.removeItem(pantalla.CLAVE_SESION);
            sessionStorage.removeItem('usuarioNombre');
            sessionStorage.removeItem('usuarioRol');
            sessionStorage.removeItem('usuarioId');
            window.location.href = destino;
        });
    }

    /**
     * Comprueba si la cuenta tiene permiso para abrir la página.
     *
     * @param {string[]} [roles] - Roles que pueden abrir la página.
     * @param {string} [rutaLogin] - Página a la que vuelve el usuario.
     */
    exigirSesion(roles, rutaLogin) {
        const usuario = this.usuarioActual();
        if (!usuario || (roles && roles.length && roles.indexOf(usuario.rol) === -1)) {
            window.location.replace((rutaLogin || '../login.html') + '?motivo=sesion');
            return null;
        }
        return usuario;
    }

    /**
     * Muestra el usuario y conecta el botón para salir.
     *
     * @param {Object} usuario - Datos de la cuenta guardada o devuelta por la API.
     */
    prepararBarraSesion(usuario) {
        const pantalla = this;
        const nombre = document.getElementById('usuario-barra');
        if (nombre && usuario) {
            nombre.textContent = (usuario.nombre || 'Usuario #' + usuario.idUsuario)
                + (usuario.rol === 'trabajador' ? ' · Trabajador' : ' · Administrador');
        }
        const boton = document.getElementById('cerrar-sesion');
        if (boton) {
            boton.addEventListener('click', function () { pantalla.cerrarSesion(); });
        }
    }

    /**
     * Comprueba el rol y prepara los controles de sesión al abrir la página.
     */
    iniciarSesionPagina() {
        if (this.redirigiendoAlHostLocal) {
            window.location.replace(window.location.href.replace('127.0.0.1', 'localhost'));
            return;
        }
        if (typeof document !== 'undefined' && document.body && document.body.dataset.roles) {
            const usuarioDePagina = this.exigirSesion(document.body.dataset.roles.split(','));
            this.prepararBarraSesion(usuarioDePagina);
        }
    }
}

const sesionNavegador = new SesionNavegador();

/**
 * Lee la cuenta activa del almacenamiento de sesión.
 */
function usuarioActual() {
    return sesionNavegador.usuarioActual();
}

/**
 * Guarda el identificador, nombre, correo y rol de la cuenta.
 *
 * @param {Object} usuario - Datos de la cuenta guardada o devuelta por la API.
 */
function guardarSesion(usuario) {
    return sesionNavegador.guardarSesion(usuario);
}

/**
 * Cierra la sesión en la API y borra los datos del navegador.
 *
 * @param {string} [rutaLogin] - Página a la que vuelve el usuario.
 */
function cerrarSesion(rutaLogin) {
    return sesionNavegador.cerrarSesion(rutaLogin);
}

/**
 * Comprueba si la cuenta tiene permiso para abrir la página.
 *
 * @param {string[]} [roles] - Roles que pueden abrir la página.
 * @param {string} [rutaLogin] - Página a la que vuelve el usuario.
 */
function exigirSesion(roles, rutaLogin) {
    return sesionNavegador.exigirSesion(roles, rutaLogin);
}

/**
 * Muestra el usuario y conecta el botón para salir.
 *
 * @param {Object} usuario - Datos de la cuenta guardada o devuelta por la API.
 */
function prepararBarraSesion(usuario) {
    return sesionNavegador.prepararBarraSesion(usuario);
}

sesionNavegador.iniciarSesionPagina();
