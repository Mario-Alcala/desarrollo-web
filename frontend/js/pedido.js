/* Datos: conserva la fecha elegida durante el pago y calcula los días de recolección. No recibe atributos. */
const claveBorrador = 'gestion-cultivos-pedido-actual';
const claveSeleccionPedido = 'pedidoGestionCultivos';
const claveFechaRecoleccion = 'fechaRecoleccionGestionCultivos';

/* Datos: lee la selección del pago o un borrador previo. No recibe atributos. */
function leerBorrador() {
    const seleccion = sessionStorage.getItem(claveSeleccionPedido);
    if (seleccion) {
        return {
            detalles: JSON.parse(seleccion),
            fechaRecoleccion: sessionStorage.getItem(claveFechaRecoleccion) || ''
        };
    }
    const guardado = sessionStorage.getItem(claveBorrador);
    return guardado ? JSON.parse(guardado) : { detalles: [], fechaRecoleccion: '' };
}

/* Datos: comprueba si hay kilos seleccionados. Recibe el borrador del pedido. */
function tieneSeleccionPedido(borrador) {
    if (Array.isArray(borrador.detalles)) {
        return borrador.detalles.length > 0;
    }
    return Object.keys(borrador.cantidades || {}).length > 0;
}

/* Datos: guarda la fecha de recolección. Recibe el borrador del pedido. */
function guardarBorrador(borrador) {
    if (Array.isArray(borrador.detalles)) {
        sessionStorage.setItem(claveFechaRecoleccion, borrador.fechaRecoleccion);
    } else {
        sessionStorage.setItem(claveBorrador, JSON.stringify(borrador));
    }
}

function fechaLocal(fecha) {
    return fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
}

function inicioRecoleccion() {
    const inicio = new Date();
    if (inicio.getHours() >= 18) inicio.setDate(inicio.getDate() + 1);
    return inicio;
}

function limiteRecoleccion() {
    const limite = inicioRecoleccion();
    limite.setDate(limite.getDate() + 6);
    return fechaLocal(limite);
}

/* Datos: comprueba el plazo de siete días. Recibe la fecha en formato AAAA-MM-DD. */
function fechaPermitida(fecha) {
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha)
        && fecha >= fechaLocal(inicioRecoleccion())
        && fecha <= limiteRecoleccion();
}
