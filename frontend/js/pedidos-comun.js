/**
 * @file Contiene cálculos y formatos compartidos de pedidos.
 *
 * @author Equipo de Gestión de Cultivos
 */
const HORARIO_RECOLECCION = "7:00 a. m. a 6:00 p. m.";

/**
 * Suma cada cantidad por su precio.
 *
 * @param pedido - Pedido con kilos y precio por kilo en su detalle.
 */
function totalPedido(pedido) {
    let total = 0;
    for (let i = 0; i < pedido.detalle.length; i++) {
        total += pedido.detalle[i].kg * pedido.detalle[i].precioPorKg;
    }
    return total;
}

/**
 * Suma los kilos de cada partida.
 *
 * @param pedido - Pedido con los kilos registrados en su detalle.
 */
function kilosPedido(pedido) {
    let kilos = 0;
    for (let i = 0; i < pedido.detalle.length; i++) {
        kilos += pedido.detalle[i].kg;
    }
    return kilos;
}

/**
 * Muestra una fecha sin desfase de zona horaria.
 *
 * @param iso - Fecha en formato ISO.
 */
function fmtFecha(iso) {
    if (!iso) return "—";
    const partes = String(iso).slice(0, 10).split("-");
    const anio = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);
    return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Elige el tipo de etiqueta.
 *
 * @param estado - Estado actual del pedido.
 */
function tipoEstado(estado) {
    if (estado === "entregado" || estado === "entregada") return "ok";
    if (estado === "enviado" || estado === "en camino" || estado === "en preparación") return "aviso";
    if (estado === "cancelado" || estado === "cancelada") return "error";
    return "";
}
