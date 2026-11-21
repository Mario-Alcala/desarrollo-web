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
    const [a, m, d] = valor.slice(0, 10).split("-").map(Number);
    return new Date(a, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function filaPedido(p) {
    const fila = crear("tr");
    const detalle = crear("td");
    const enlace = crear("a", "Ver pedido →", "enlace-pedido");
    enlace.href = `pedido-detalle.html?id=${encodeURIComponent(p.idPedido)}`;
    detalle.append(enlace);
    fila.append(
        crear("td", `#${p.idPedido}`),
        crear("td", p.cliente || `Pedido ${p.idPedido}`),
        crear("td", fechaPedido(p.fechaPedido)),
        crear("td", `${p.cantidadLotes || 0} ${p.cantidadLotes === 1 ? "lote" : "lotes"}`),
        crear("td", p.tipoEntrega === "domicilio" ? "Envío a domicilio" : "Recoger en bodega"),
        (() => { const td = crear("td"); td.append(etiquetaEstado(p)); return td; })(),
        detalle
    );
    return fila;
}

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const visibles = pedidos.filter(p =>
        (estadoFiltro === "todos" || estadoDe(p) === estadoFiltro) &&
        (!q || String(p.idPedido).includes(q) || String(p.cliente || "").toLowerCase().includes(q))
    );
    contenedor.replaceChildren(...visibles.map(filaPedido));
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

document.getElementById("filtros-estado").addEventListener("click", evento => {
    const boton = evento.target.closest("button[data-valor]");
    if (!boton) return;
    estadoFiltro = boton.dataset.valor;
    document.querySelectorAll("#filtros-estado button").forEach(b => b.setAttribute("aria-pressed", String(b === boton)));
    dibujar();
});
buscador.addEventListener("input", dibujar);
cargarPedidos();
