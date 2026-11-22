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
    var total = 0;
    for (var i = 0; i < pedido.detalle.length; i++) {
        total += pedido.detalle[i].kg * pedido.detalle[i].precioPorKg;
    }
    return total;
}

function kilosPedido(pedido) {
    var kilos = 0;
    for (var i = 0; i < pedido.detalle.length; i++) {
        kilos += pedido.detalle[i].kg;
    }
    return kilos;
}

// "2026-11-18" -> "18 nov 2026". Se arma con año, mes y día para evitar corrimientos de zona horaria.
function fmtFecha(iso) {
    if (!iso) return "—";
    const partes = String(iso).slice(0, 10).split("-");
    const a = Number(partes[0]);
    const m = Number(partes[1]);
    const d = Number(partes[2]);
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
    for (var i = 0; i < PRODUCTOS.length; i++) {
        if (PRODUCTOS[i].id === id) return PRODUCTOS[i];
    }
    return null;
}
