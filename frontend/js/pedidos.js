/* Datos: consulta los pedidos de administración y permite filtrarlos. No recibe atributos. */
const API_PEDIDOS = "http://" + window.location.hostname + ":8081/api/pedidos";
const contenedor = document.getElementById("lista-pedidos");
const mensaje = document.getElementById("mensaje-pedidos");
const buscador = document.querySelector("#topbar input");
let pedidos = [];
let estadoFiltro = "todos";

/* Datos: carga la lista de pedidos desde la API. No recibe atributos. */
async function cargarPedidos() {
    mensaje.textContent = "Cargando pedidos…";
    try {
        const respuesta = await fetch(API_PEDIDOS, { credentials: 'include' });
        if (!respuesta.ok) throw new Error();
        pedidos = await respuesta.json();
        dibujar();
    } catch {
        pedidos = [];
        dibujar();
        mensaje.textContent = "No se pudieron cargar los pedidos desde el API.";
    }
}

function estadoDe(p) {
    return p.estadoEntrega || p.estado || "pendiente";
}

function etiquetaEstado(p) {
    const estado = estadoDe(p);
    const nombres = {
        pendiente: p.cantidadLotes > 0 ? "Asignado · falta entrega" : "Pendiente de asignación",
        en_transito: "Enviado",
        listo_recoleccion: "Listo para recoger",
        entregado: "Entregado",
        cancelado: "Cancelado"
    };
    const tipo = estado === "entregado" ? "ok" : estado === "cancelado" ? "error" : estado === "pendiente" ? "" : "aviso";
    return etiqueta(nombres[estado] || capitalizar(estado), tipo);
}

function fechaPedido(valor) {
    if (!valor) return "—";
    const partes = valor.slice(0, 10).split("-");
    const anio = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);
    return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/* Datos: arma una fila con los datos y el enlace de un pedido. Recibe un pedido de la API. */
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

/* Datos: dibuja los pedidos que coinciden con los filtros actuales. No recibe atributos. */
function dibujar() {
    const texto = buscador.value.trim().toLowerCase();
    const visibles = filtrarPedidos(texto);
    contenedor.replaceChildren();
    for (const pedido of visibles) {
        contenedor.append(filaPedido(pedido));
    }
    if (visibles.length) mensaje.textContent = `${visibles.length} ${visibles.length === 1 ? "pedido" : "pedidos"}`;
    else if (!mensaje.textContent.startsWith("No se pudo")) mensaje.textContent = "No hay pedidos para mostrar.";
}

/* Datos: filtra por estado, número o cliente. Recibe el texto de búsqueda. */
function filtrarPedidos(texto) {
    return pedidos.filter(function (pedido) {
        const coincideEstado = estadoFiltro === "todos" || estadoDe(pedido) === estadoFiltro;
        const coincideTexto = !texto || String(pedido.idPedido).includes(texto)
            || String(pedido.cliente || "").toLowerCase().includes(texto);
        return coincideEstado && coincideTexto;
    });
}

/* Datos: aplica el estado del botón elegido. Recibe el evento de clic. */
function cambiarFiltroPedidos(evento) {
    const boton = evento.target.closest("button[data-valor]");
    if (!boton) return;
    estadoFiltro = boton.dataset.valor;
    const botones = document.querySelectorAll("#filtros-estado button");
    for (const opcion of botones) {
        opcion.setAttribute("aria-pressed", String(opcion === boton));
    }
    dibujar();
}

/* Datos: conecta los filtros y carga los pedidos. No recibe atributos. */
function iniciarPedidos() {
    document.getElementById("filtros-estado").addEventListener("click", cambiarFiltroPedidos);
    buscador.addEventListener("input", dibujar);
    cargarPedidos();
}

iniciarPedidos();
