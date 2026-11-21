/*
 * ARCHIVO: js/pedidos.js
 * CAPA: FRONTEND (lógica). ¿ES CASCARÓN? NO: filtra la lista, busca y calcula totales.
 * QUÉ USA DEL BACKEND: nada todavía; lee PEDIDOS de js/admin-datos.js.
 * REGLA DEL DOCUMENTO: el total de cada pedido se calcula con su detalle (totalPedido).
 * LE FALTA: leer los pedidos de la API; paginación; cambiar el estado desde la lista.
 * AÑADIDO POR BACKEND INCOMPLETO: los datos de ejemplo de PEDIDOS.
 */

const contenedor = document.getElementById("lista-pedidos");
const mensajePedidos = document.getElementById("mensaje-pedidos");
const buscadorPedidos = document.querySelector("#topbar input");

let estadoActivo = "todos";

function filaPedido(p) {
    const fila = crear("tr");
    const entrega = p.entrega.tipo === "domicilio" ? "A domicilio" : "Recolección";

    const celdaEnlace = crear("td");
    const enlace = crear("a", "Ver detalle →", "enlace-pedido");
    enlace.href = "pedido-detalle.html?id=" + p.id;
    celdaEnlace.append(enlace);

    const celdaEstado = crear("td");
    celdaEstado.append(etiqueta(capitalizar(p.estado), tipoEstado(p.estado)));

    fila.append(
        crear("td", "#" + p.id),
        crear("td", p.cliente),
        crear("td", fmtFecha(p.fecha)),
        crear("td", p.detalle.length + (p.detalle.length === 1 ? " producto" : " productos")),
        crear("td", entrega),
        celdaEstado,
        crear("td", fmtMoneda(totalPedido(p)), "celda-total"),
        celdaEnlace
    );
    return fila;
}

function dibujarPedidos() {
    const q = buscadorPedidos.value.trim().toLowerCase();
    const visibles = PEDIDOS.filter(p =>
        (estadoActivo === "todos" || p.estado === estadoActivo) &&
        (!q || p.cliente.toLowerCase().includes(q) || String(p.id).includes(q))
    );

    contenedor.replaceChildren(...visibles.map(filaPedido));

    if (!visibles.length) {
        mensajePedidos.textContent = "No hay pedidos para mostrar.";
    } else {
        const suma = visibles.reduce((s, p) => s + (p.estado === "cancelado" ? 0 : totalPedido(p)), 0);
        mensajePedidos.textContent = `${visibles.length} ${visibles.length === 1 ? "pedido" : "pedidos"} · Total sin cancelados: ${fmtMoneda(suma)}`;
    }
}

iniciarFiltros(document.getElementById("filtros-estado"), valorFiltro => {
    estadoActivo = valorFiltro;
    dibujarPedidos();
});
buscadorPedidos.addEventListener("input", dibujarPedidos);

dibujarPedidos();