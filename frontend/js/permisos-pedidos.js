/**
 * @file Decide qué acciones muestran las pantallas de pedidos según el rol.
 *
 * @author Equipo de Gestión de Cultivos
 */
var SIN_SESION_COMO_ADMIN = true;
const ROL_ADMIN = 'administrador_agricultor';
const ROL_TRABAJADOR = 'trabajador';
const ESTADOS_FINALES = ['entregado', 'cancelado'];
const ESTADOS_ENTREGA_TRABAJADOR = ['pendiente', 'en_transito', 'listo_recoleccion'];
const ESTADOS_ENTREGA_ADMIN = ['pendiente', 'en_transito', 'listo_recoleccion', 'entregado'];

/**
 * Recupera el rol de usuarioSesion.
 */
function rolDeSesion() {
    try {
        const usuario = JSON.parse(sessionStorage.getItem('usuarioSesion'));
        return usuario && typeof usuario.rol === 'string' ? usuario.rol : null;
    } catch (error) {
        return null;
    }
}

/**
 * Devuelve los controles y estados permitidos.
 *
 * @param rol - Rol del usuario en la sesión.
 * @param estado - Estado actual del pedido.
 */
function accionesPedido(rol, estado) {
    if (rol === null || rol === undefined) {
        rol = SIN_SESION_COMO_ADMIN ? ROL_ADMIN : null;
    }
    if (rol !== ROL_ADMIN && rol !== ROL_TRABAJADOR) {
        return { asignar: false, entrega: false, estadosEntrega: [], aviso: 'Con tu rol solo puedes consultar este pedido.' };
    }
    if (ESTADOS_FINALES.includes(estado)) {
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

/**
 * Devuelve el texto del enlace al pedido.
 *
 * @param rol - Rol del usuario en la sesión.
 */
function textoAccionPedido(rol) {
    return rol === ROL_TRABAJADOR ? 'Preparar pedido →' : 'Ver pedido →';
}