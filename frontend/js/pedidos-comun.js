/*
 * ARCHIVO: js/pedidos-comun.js
 * CAPA: FRONTEND (JavaScript de apoyo, solo para Pedidos). ¿ES CASCARÓN? NO: son cálculos y formatos.
 * QUÉ HACE: calcula el total de un pedido, da formato a fechas y decide el color de cada estado.
 *   Lo usan pedidos.js (lista) y pedido-detalle.js (detalle).
 * REGLA DEL DOCUMENTO: el total de un pedido NO se guarda; se calcula sumando kg × precio por kilo
 *   de cada renglón de su detalle.
 * BACKEND: no lo usa.
 * LE FALTA: nada por ahora.
 * AÑADIDO POR BACKEND INCOMPLETO: nada.
 */

const HORARIO_RECOLECCION = "7:00 a. m. a 6:00 p. m.";

function totalPedido(pedido) {
    return pedido.detalle.reduce((suma, renglon) => suma + renglon.kg * renglon.precioPorKg, 0);
}

function kilosPedido(pedido) {
    return pedido.detalle.reduce((suma, renglon) => suma + renglon.kg, 0);
}

// "2026-11-18" -> "18 nov 2026". Se arma con año, mes y día para evitar corrimientos de zona horaria.
function fmtFecha(iso) {
    if (!iso) return "—";
    const [a, m, d] = String(iso).slice(0, 10).split("-").map(Number);
    return new Date(a, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

// Tipo de etiqueta (ver etiqueta() en admin-comun.js) según el estado.
function tipoEstado(estado) {
    if (estado === "entregado" || estado === "entregada") return "ok";
    if (estado === "enviado" || estado === "en camino" || estado === "en preparación") return "aviso";
    if (estado === "cancelado" || estado === "cancelada") return "error";
    return "";
}

function productoPorId(id) {
    return PRODUCTOS.find(p => p.id === id);
}