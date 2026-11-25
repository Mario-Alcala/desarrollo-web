/**
 * Consulta el rol de la sesión y obtiene las acciones disponibles para cada pedido.
 *
 * @author Equipo de Gestión de Cultivos
 */
class ReglasPedidos {
    /**
     * Define los roles y los estados permitidos en los pedidos.
     */
    constructor() {
        this.ROL_ADMIN = 'administrador_agricultor';
        this.ROL_TRABAJADOR = 'trabajador';
        this.ESTADOS_FINALES = ['entregado', 'cancelado'];
        this.ESTADOS_ENTREGA_TRABAJADOR = ['pendiente', 'en_transito', 'listo_recoleccion'];
        this.ESTADOS_ENTREGA_ADMIN = ['pendiente', 'en_transito', 'listo_recoleccion', 'entregado'];
    }

    /**
     * Recupera el rol de usuarioSesion.
     */
    rolDeSesion() {
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
    accionesPedido(rol, estado) {
        if (rol === null || rol === undefined) {
            rol = SIN_SESION_COMO_ADMIN ? this.ROL_ADMIN : null;
        }
        if (rol !== this.ROL_ADMIN && rol !== this.ROL_TRABAJADOR) {
            return { asignar: false, entrega: false, estadosEntrega: [], aviso: 'Con tu rol solo puedes consultar este pedido.' };
        }
        if (this.ESTADOS_FINALES.includes(estado)) {
            return {
                asignar: false, entrega: false, estadosEntrega: [],
                aviso: 'Este pedido ya está ' + (estado === 'entregado' ? 'entregado' : 'cancelado') + ' y no admite cambios.'
            };
        }
        if (rol === this.ROL_TRABAJADOR) {
            return {
                asignar: true, entrega: true, estadosEntrega: this.ESTADOS_ENTREGA_TRABAJADOR.slice(),
                aviso: 'Preparas el pedido: asigna kilos y márcalo listo para recoger o enviado. El administrador confirma la entrega final.'
            };
        }
        return { asignar: true, entrega: true, estadosEntrega: this.ESTADOS_ENTREGA_ADMIN.slice(), aviso: '' };
    }

    /**
     * Devuelve el texto del enlace al pedido.
     *
     * @param rol - Rol del usuario en la sesión.
     */
    textoAccionPedido(rol) {
        return rol === this.ROL_TRABAJADOR ? 'Preparar pedido →' : 'Ver pedido →';
    }
}

var SIN_SESION_COMO_ADMIN = true;

const reglasPedidos = new ReglasPedidos();

/**
 * Recupera el rol de usuarioSesion.
 */
function rolDeSesion() {
    return reglasPedidos.rolDeSesion();
}

/**
 * Devuelve los controles y estados permitidos.
 *
 * @param rol - Rol del usuario en la sesión.
 * @param estado - Estado actual del pedido.
 */
function accionesPedido(rol, estado) {
    return reglasPedidos.accionesPedido(rol, estado);
}

/**
 * Devuelve el texto del enlace al pedido.
 *
 * @param rol - Rol del usuario en la sesión.
 */
function textoAccionPedido(rol) {
    return reglasPedidos.textoAccionPedido(rol);
}
