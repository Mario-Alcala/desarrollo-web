/**
 * Maneja el pedido en preparación y sus fechas de recolección.
 *
 * @author Equipo de Gestión de Cultivos
 */
class Pedido {
    /** Prepara las claves del pedido que se guarda en la sesión. */
    constructor() {
        this.claveBorrador = 'gestion-cultivos-pedido-actual';
        this.claveSeleccionPedido = 'pedidoGestionCultivos';
        this.claveFechaRecoleccion = 'fechaRecoleccionGestionCultivos';
    }

    /**
     * Lee la selección del pago o un borrador previo.
     */
    leerBorrador() {
        const seleccion = sessionStorage.getItem(this.claveSeleccionPedido);
        if (seleccion) {
            return {
                detalles: JSON.parse(seleccion),
                fechaRecoleccion: sessionStorage.getItem(this.claveFechaRecoleccion) || ''
            };
        }
        const guardado = sessionStorage.getItem(this.claveBorrador);
        return guardado ? JSON.parse(guardado) : { detalles: [], fechaRecoleccion: '' };
    }

    /**
     * Comprueba si hay kilos seleccionados.
     *
     * @param borrador - Selección de productos y fecha de recolección.
     */
    tieneSeleccionPedido(borrador) {
        if (Array.isArray(borrador.detalles)) {
            return borrador.detalles.length > 0;
        }
        return Object.keys(borrador.cantidades || {}).length > 0;
    }

    /**
     * Guarda la fecha de recolección.
     *
     * @param borrador - Selección de productos y fecha de recolección.
     */
    guardarBorrador(borrador) {
        if (Array.isArray(borrador.detalles)) {
            sessionStorage.setItem(this.claveFechaRecoleccion, borrador.fechaRecoleccion);
        } else {
            sessionStorage.setItem(this.claveBorrador, JSON.stringify(borrador));
        }
    }

    /**
     * Convierte una fecha local al formato aaaa-mm-dd.
     *
     * @param fecha - Fecha que se convierte o se valida.
     */
    fechaLocal(fecha) {
        return fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
    }

    /**
     * Obtiene el primer día disponible para recoger un pedido.
     */
    inicioRecoleccion() {
        const inicio = new Date();
        if (inicio.getHours() >= 18) inicio.setDate(inicio.getDate() + 1);
        return inicio;
    }

    /**
     * Obtiene el último día disponible para recoger un pedido.
     */
    limiteRecoleccion() {
        const limite = this.inicioRecoleccion();
        limite.setDate(limite.getDate() + 6);
        return this.fechaLocal(limite);
    }

    /**
     * Comprueba el plazo de siete días.
     *
     * @param fecha - Fecha que se desea validar, en formato aaaa-mm-dd.
     */
    fechaPermitida(fecha) {
        return /^\d{4}-\d{2}-\d{2}$/.test(fecha)
            && fecha >= this.fechaLocal(this.inicioRecoleccion())
            && fecha <= this.limiteRecoleccion();
    }
}

/** Pedido que se está preparando en esta sesión. */
const pedidoEnPreparacion = new Pedido();
