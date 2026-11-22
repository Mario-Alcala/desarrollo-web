/*
 * ARCHIVO: js/sesion.js
 * CAPA: FRONTEND (lógica compartida). Lee el usuario que inició sesión.
 * CONTRATO: el login debe guardar, al iniciar sesión, algo como
 *   sessionStorage.setItem('usuarioSesion', JSON.stringify({ idUsuario: 1, nombre: 'Ana', rol: 'trabajador' }));
 * LE FALTA: js/ap.js todavía no guarda la sesión (usa una cuenta de prueba local); hay que conectarlo.
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