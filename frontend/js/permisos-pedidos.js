/* Datos: decide qué acciones muestran las pantallas de pedidos según el rol. No recibe atributos. */
var SIN_SESION_COMO_ADMIN = true;
const ROL_ADMIN = 'administrador_agricultor';
const ROL_TRABAJADOR = 'trabajador';
const ESTADOS_FINALES = ['entregado', 'cancelado'];
const ESTADOS_ENTREGA_TRABAJADOR = ['pendiente', 'en_transito', 'listo_recoleccion'];
const ESTADOS_ENTREGA_ADMIN = ['pendiente', 'en_transito', 'listo_recoleccion', 'entregado'];

/* Datos: recupera el rol de usuarioSesion. No recibe atributos. */
function rolDeSesion() {
    try {
        const usuario = JSON.parse(sessionStorage.getItem('usuarioSesion'));
        return usuario && typeof usuario.rol === 'string' ? usuario.rol : null;
    } catch (error) {
        return null;
    }
}

/* Datos: devuelve los controles y estados permitidos. Recibe el rol y el estado del pedido. */
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

/* Datos: devuelve el texto del enlace al pedido. Recibe el rol. */
function textoAccionPedido(rol) {
    return rol === ROL_TRABAJADOR ? 'Preparar pedido →' : 'Ver pedido →';
}