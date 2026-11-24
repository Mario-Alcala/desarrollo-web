/* Datos: contiene cálculos y formatos compartidos de pedidos. No recibe atributos. */
const HORARIO_RECOLECCION = "7:00 a. m. a 6:00 p. m.";

/* Datos: suma cada cantidad por su precio. Recibe un pedido con detalle, kg y precioPorKg. */
function totalPedido(pedido) {
    let total = 0;
    for (let i = 0; i < pedido.detalle.length; i++) {
        total += pedido.detalle[i].kg * pedido.detalle[i].precioPorKg;
    }
    return total;
}

/* Datos: suma los kilos de cada partida. Recibe un pedido con detalle y kg. */
function kilosPedido(pedido) {
    let kilos = 0;
    for (let i = 0; i < pedido.detalle.length; i++) {
        kilos += pedido.detalle[i].kg;
    }
    return kilos;
}

/* Datos: muestra una fecha sin desfase de zona horaria. Recibe una fecha ISO. */
function fmtFecha(iso) {
    if (!iso) return "—";
    const partes = String(iso).slice(0, 10).split("-");
    const anio = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);
    return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/* Datos: elige el tipo de etiqueta. Recibe el estado del pedido. */
function tipoEstado(estado) {
    if (estado === "entregado" || estado === "entregada") return "ok";
    if (estado === "enviado" || estado === "en camino" || estado === "en preparación") return "aviso";
    if (estado === "cancelado" || estado === "cancelada") return "error";
    return "";
}
