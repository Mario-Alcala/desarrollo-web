/*
 * ARCHIVO: js/permisos-pedidos.js
 * CAPA: FRONTEND (lógica compartida). Define qué acciones ve cada rol en pedidos.html y pedido-detalle.html.
 *       Así el trabajador y el administrador usan las MISMAS pantallas, sin una segunda lista de pedidos.
 * CASCARÓN?: NO. Solo decide qué se muestra; los datos vienen del API real (/api/pedidos).
 * REGLAS (ajustables en las constantes de abajo):
 *   - administrador_agricultor: asigna kilos y puede dejar cualquier estado de entrega, incluido el final.
 *   - trabajador: prepara el pedido (asigna kilos y lo marca "listo para recoger" o "enviado"); el estado final
 *     "entregado/recogido" lo confirma el administrador.
 *   - cliente u otro rol: solo consulta.
 *   - pedidos ya entregados o cancelados no admiten cambios para nadie.
 * LE FALTA: js/ap.js todavía no guarda la sesión. Mientras no haya sesión, SIN_SESION_COMO_ADMIN = true
 *   mantiene el comportamiento anterior (se ve todo). Cuando el login guarde la sesión, ponerlo en false.
 *   Esto solo oculta botones: el backend todavía no valida permisos por rol.
 */

var SIN_SESION_COMO_ADMIN = true;
var ROL_ADMIN = 'administrador_agricultor';
var ROL_TRABAJADOR = 'trabajador';
var ESTADOS_FINALES = ['entregado', 'cancelado'];
var ESTADOS_ENTREGA_TRABAJADOR = ['pendiente', 'en_transito', 'listo_recoleccion'];
var ESTADOS_ENTREGA_ADMIN = ['pendiente', 'en_transito', 'listo_recoleccion', 'entregado'];

/* Rol guardado en la sesión (misma clave que js/sesion.js), o null si no hay sesión. */
function rolDeSesion() {
    try {
        var usuario = JSON.parse(sessionStorage.getItem('usuarioSesion'));
        return usuario && typeof usuario.rol === 'string' ? usuario.rol : null;
    } catch (error) {
        return null;
    }
}

/* Qué puede hacer `rol` sobre un pedido cuyo estado actual es `estado`. */
function accionesPedido(rol, estado) {
    if (rol === null || rol === undefined) {
        rol = SIN_SESION_COMO_ADMIN ? ROL_ADMIN : null;
    }
    if (rol !== ROL_ADMIN && rol !== ROL_TRABAJADOR) {
        return { asignar: false, entrega: false, estadosEntrega: [], aviso: 'Con tu rol solo puedes consultar este pedido.' };
    }
    if (ESTADOS_FINALES.indexOf(estado) !== -1) {
        return {
            asignar: false, entrega: false, estadosEntrega: [],
            aviso: 'Este pedido ya está ' + (estado === 'entregado' ? 'entregado' : 'cancelado') + ' y no admite cambios.'
        };
    }
    if (rol === ROL_TRABAJADOR) {
        return {
            asignar: true, entrega: true, estadosEntrega: ESTADOS_ENTREGA_TRABAJADOR.slice(),
            aviso: 'Preparas el pedido: asigna kilos y márcalo listo para recoger o enviado. El administrador confirma la entrega final.'
        };
    }
    return { asignar: true, entrega: true, estadosEntrega: ESTADOS_ENTREGA_ADMIN.slice(), aviso: '' };
}

/* Texto del enlace de la lista de pedidos según el rol. */
function textoAccionPedido(rol) {
    return rol === ROL_TRABAJADOR ? 'Preparar pedido →' : 'Ver pedido →';
}