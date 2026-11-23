const API_PEDIDOS = "http://localhost:8081/api/pedidos";
const contenedor = document.getElementById("lista-pedidos");
const mensaje = document.getElementById("mensaje-pedidos");
const buscador = document.querySelector("#topbar input");
let pedidos = [];
let estadoFiltro = "todos";

function estadoDe(p) {
    return p.estadoEntrega || p.estado || "pendiente";
}

function etiquetaEstado(p) {
    const estado = estadoDe(p);
    const nombres = { pendiente: p.cantidadLotes > 0 ? "Asignado · falta entrega" : "Pendiente de asignación", en_transito: "Enviado", listo_recoleccion: "Listo para recoger", entregado: "Entregado", cancelado: "Cancelado" };
    const tipo = estado === "entregado" ? "ok" : estado === "cancelado" ? "error" : estado === "pendiente" ? "" : "aviso";
    return etiqueta(nombres[estado] || capitalizar(estado), tipo);
}

function fechaPedido(valor) {
    if (!valor) return "—";
    const partes = valor.slice(0, 10).split("-");
    const a = Number(partes[0]);
    const m = Number(partes[1]);
    const d = Number(partes[2]);
    return new Date(a, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function filaPedido(p) {
    const fila = crear("tr");
    const detalle = crear("td");
    const enlace = crear("a", textoAccionPedido(rolDeSesion()), "enlace-pedido");
    enlace.href = `pedido-detalle.html?id=${encodeURIComponent(p.idPedido)}`;
    detalle.append(enlace);
    fila.append(crear("td", `#${p.idPedido}`));
    fila.append(crear("td", p.cliente || `Pedido ${p.idPedido}`));
    fila.append(crear("td", fechaPedido(p.fechaPedido)));
    fila.append(crear("td", `${p.cantidadLotes || 0} ${p.cantidadLotes === 1 ? "lote" : "lotes"}`));
    fila.append(crear("td", p.tipoEntrega === "domicilio" ? "Envío a domicilio" : "Recoger en bodega"));
    const celdaEstado = crear("td");
    celdaEstado.append(etiquetaEstado(p));
    fila.append(celdaEstado, detalle);
    return fila;
}

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const visibles = [];
    for (let i = 0; i < pedidos.length; i++) {
        const pedido = pedidos[i];
        const coincideEstado = estadoFiltro === "todos" || estadoDe(pedido) === estadoFiltro;
        const coincideTexto = !q || String(pedido.idPedido).includes(q)
            || String(pedido.cliente || "").toLowerCase().includes(q);
        if (coincideEstado && coincideTexto) visibles.push(pedido);
    }
    contenedor.replaceChildren();
    for (let i = 0; i < visibles.length; i++) {
        contenedor.append(filaPedido(visibles[i]));
    }
    if (visibles.length) mensaje.textContent = `${visibles.length} ${visibles.length === 1 ? "pedido" : "pedidos"}`;
    else if (!mensaje.textContent.startsWith("No se pudo")) mensaje.textContent = "No hay pedidos para mostrar.";
}

async function cargarPedidos() {
    mensaje.textContent = "Cargando pedidos…";
    try {
        const respuesta = await fetch(API_PEDIDOS);
        if (!respuesta.ok) throw new Error();
        pedidos = await respuesta.json();
        dibujar();
    } catch {
        pedidos = [];
        dibujar();
        mensaje.textContent = "No se pudieron cargar los pedidos desde el API.";
    }
}

document.getElementById("filtros-estado").addEventListener("click", function (evento) {
    const boton = evento.target.closest("button[data-valor]");
    if (!boton) return;
    estadoFiltro = boton.dataset.valor;
    const botones = document.querySelectorAll("#filtros-estado button");
    for (let i = 0; i < botones.length; i++) {
        botones[i].setAttribute("aria-pressed", String(botones[i] === boton));
    }
    dibujar();
});
buscador.addEventListener("input", dibujar);
cargarPedidos();