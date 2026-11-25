/**
 * @file Lista de pedidos para administración.
 */

/**
 * Consulta los pedidos, aplica los filtros y dibuja la tabla.
 *
 * @author Equipo de Gestión de Cultivos
 */
class VistaPedidosAdmin {
    /** Prepara los controles y el estado de la pantalla. */
    constructor() {
        this.api = "http://" + window.location.hostname + ":8081/api/pedidos";
        this.contenedor = document.getElementById("lista-pedidos");
        this.mensaje = document.getElementById("mensaje-pedidos");
        this.buscador = document.querySelector("#topbar input");
        this.pedidos = [];
        this.estadoFiltro = "todos";
    }

    /**
     * Carga la lista de pedidos desde la API.
     */
    async cargarPedidos() {
        this.mensaje.textContent = "Cargando pedidos…";
        try {
            const respuesta = await fetch(this.api, { credentials: 'include' });
            if (!respuesta.ok) throw new Error();
            this.pedidos = await respuesta.json();
            this.dibujar();
        } catch {
            this.pedidos = [];
            this.dibujar();
            this.mensaje.textContent = "No se pudieron cargar los pedidos desde el API.";
        }
    }

    /**
     * Obtiene el estado de entrega del pedido.
     *
     * @param p - Pedido devuelto por la API.
     */
    estadoDe(p) {
        return p.estadoEntrega || p.estado || "pendiente";
    }

    /**
     * Crea la etiqueta que identifica el estado del pedido.
     *
     * @param p - Pedido devuelto por la API.
     */
    etiquetaEstado(p) {
        const estado = this.estadoDe(p);
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

    /**
     * Formatea la fecha del pedido para presentarla en la tabla.
     *
     * @param valor - Fecha del pedido en formato ISO.
     */
    fechaPedido(valor) {
        if (!valor) return "—";
        const partes = valor.slice(0, 10).split("-");
        const anio = Number(partes[0]);
        const mes = Number(partes[1]);
        const dia = Number(partes[2]);
        return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
    }

    /**
     * Arma una fila con los datos y el enlace de un pedido.
     *
     * @param p - Pedido devuelto por la API.
     */
    filaPedido(p) {
        const fila = crear("tr");
        const detalle = crear("td");
        const enlace = crear("a", textoAccionPedido(rolDeSesion()), "enlace-pedido");
        enlace.href = `pedido-detalle.html?id=${encodeURIComponent(p.idPedido)}`;
        detalle.append(enlace);
        fila.append(crear("td", `#${p.idPedido}`));
        fila.append(crear("td", p.cliente || `Pedido ${p.idPedido}`));
        fila.append(crear("td", this.fechaPedido(p.fechaPedido)));
        fila.append(crear("td", `${p.cantidadLotes || 0} ${p.cantidadLotes === 1 ? "lote" : "lotes"}`));
        fila.append(crear("td", p.tipoEntrega === "domicilio" ? "Envío a domicilio" : "Recoger en bodega"));
        const celdaEstado = crear("td");
        celdaEstado.append(this.etiquetaEstado(p));
        fila.append(celdaEstado, detalle);
        return fila;
    }

    /**
     * Dibuja los pedidos que coinciden con los filtros actuales.
     */
    dibujar() {
        const texto = this.buscador.value.trim().toLowerCase();
        const visibles = this.filtrarPedidos(texto);
        this.contenedor.replaceChildren();
        for (const pedido of visibles) {
            this.contenedor.append(this.filaPedido(pedido));
        }
        if (visibles.length) this.mensaje.textContent = `${visibles.length} ${visibles.length === 1 ? "pedido" : "pedidos"}`;
        else if (!this.mensaje.textContent.startsWith("No se pudo")) this.mensaje.textContent = "No hay pedidos para mostrar.";
    }

    /**
     * Filtra por estado, número o cliente.
     *
     * @param texto - Texto para buscar el número o el cliente del pedido.
     */
    filtrarPedidos(texto) {
        return this.pedidos.filter((pedido) => {
            const coincideEstado = this.estadoFiltro === "todos" || this.estadoDe(pedido) === this.estadoFiltro;
            const coincideTexto = !texto || String(pedido.idPedido).includes(texto)
                || String(pedido.cliente || "").toLowerCase().includes(texto);
            return coincideEstado && coincideTexto;
        });
    }

    /**
     * Aplica el estado del botón elegido.
     *
     * @param evento - Evento de clic en el filtro de estado.
     */
    cambiarFiltroPedidos(evento) {
        const boton = evento.target.closest("button[data-valor]");
        if (!boton) return;
        this.estadoFiltro = boton.dataset.valor;
        const botones = document.querySelectorAll("#filtros-estado button");
        for (const opcion of botones) {
            opcion.setAttribute("aria-pressed", String(opcion === boton));
        }
        this.dibujar();
    }

    /**
     * Conecta los filtros y carga los pedidos.
     */
    iniciarPedidos() {
        document.getElementById("filtros-estado").addEventListener("click", evento => this.cambiarFiltroPedidos(evento));
        this.buscador.addEventListener("input", () => this.dibujar());
        this.cargarPedidos();
    }
}

const vistaPedidosAdmin = new VistaPedidosAdmin();
vistaPedidosAdmin.iniciarPedidos();
