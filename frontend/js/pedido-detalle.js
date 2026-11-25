/**
 * @file Detalle de un pedido para administración.
 */

/**
 * Consulta el pedido y permite asignar lotes y actualizar la entrega.
 *
 * @author Equipo de Gestión de Cultivos
 */
class VistaDetallePedido {
    /** Prepara los controles y el estado de la pantalla. */
    constructor() {
        this.api = "http://" + window.location.hostname + ":8081/api";
        this.idPedido = new URLSearchParams(location.search).get("id");
        this.filas = document.getElementById("lotes-pedido");
        this.mensaje = document.getElementById("mensaje-pedido");
        this.selectorLote = document.getElementById("asignacion-lote");
        this.selectorEstado = document.getElementById("estado-entrega");
        this.formAsignacion = document.getElementById("formulario-asignacion");
    }

    /**
     * Envía solicitudes de pedidos o cosechas.
     *
     * @param url - Ruta que se agrega a la dirección base de la API.
     * @param [opciones] - Opciones de la solicitud.
     */
    async pedir(url, opciones) {
        opciones = opciones || {};
        opciones.credentials = 'include';
        const respuesta = await fetch(`${this.api}${url}`, opciones);
        if (!respuesta.ok) {
            let mensajeError = `Error ${respuesta.status}`;
            try {
                const error = await respuesta.json();
                mensajeError = error.mensaje || mensajeError;
            } catch (noEsJson) {
                mensajeError = `Error ${respuesta.status}`;
            }
            throw new Error(mensajeError);
        }
        return respuesta.status === 204 ? null : respuesta.json();
    }

    /**
     * Consulta el pedido de la URL, sus cosechas y lotes.
     */
    async cargar() {
        this.mensaje.textContent = "Cargando pedido…";
        try {
            const pedido = await this.pedir(`/pedidos/${encodeURIComponent(this.idPedido)}`);
            const cosechas = await this.pedir("/cosechas");
            this.mostrarPedido(pedido, cosechas);
            await this.actualizarLotes();
            document.querySelector("#formulario-asignacion button[type=submit]").disabled = !this.selectorLote.options.length;
            this.mensaje.textContent = "";
        } catch (error) {
            this.mensaje.textContent = "No se pudo cargar el pedido y sus lotes desde el API.";
        }
    }

    /**
     * Consulta los lotes asignados al pedido actual.
     */
    async actualizarLotes() {
        const lotes = await this.pedir(`/pedidos/${encodeURIComponent(this.idPedido)}/lotes`);
        this.dibujarLotes(lotes);
    }

    /**
     * Formatea una fecha del pedido para mostrarla al usuario.
     *
     * @param valor - Fecha del pedido en formato ISO.
     */
    formatoFecha(valor) {
        if (!valor) return "—";
        const partes = valor.slice(0, 10).split("-");
        const a = Number(partes[0]);
        const m = Number(partes[1]);
        const d = Number(partes[2]);
        return new Date(a, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
    }

    /**
     * Formatea la fecha y la hora de una entrega.
     *
     * @param valor - Fecha y hora registradas en la API.
     */
    formatoFechaHora(valor) {
        if (!valor) return "";
        return new Date(valor).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
    }

    /**
     * Muestra los renglones con los kilos asignados.
     *
     * @param lotes - Lotes ya asignados al pedido.
     */
    dibujarLotes(lotes) {
        this.filas.replaceChildren();
        for (let i = 0; i < lotes.length; i++) {
            const l = lotes[i];
            const fila = crear("tr");
            fila.append(
                crear("td", `${l.producto} · Lote #${l.idCosecha}`),
                crear("td", l.maduracion ? capitalizar(l.maduracion) : "—"),
                crear("td", `${fmtNum(l.cantidad)} kg`)
            );
            this.filas.append(fila);
        }
        if (!lotes.length) {
            const fila = crear("tr");
            const celda = crear("td", "Aún no hay kilos asignados.");
            celda.colSpan = 3;
            fila.append(celda);
            this.filas.append(fila);
        }
    }

    /**
     * Muestra las opciones de entrega.
     *
     * @param pedido - Registro del pedido.
     * @param permisos - Acciones y estados que puede usar el rol actual.
     */
    prepararEstado(pedido, permisos) {
        const textoPendiente = pedido.cantidadLotes > 0 ? "Asignado · falta entrega" : "Pendiente de asignación";
        let estados;
        if (pedido.tipoEntrega === "domicilio") {
            estados = [
                { valor: "pendiente", texto: textoPendiente },
                { valor: "en_transito", texto: "Enviado" },
                { valor: "entregado", texto: "Entregado" }
            ];
        } else {
            estados = [
                { valor: "pendiente", texto: textoPendiente },
                { valor: "listo_recoleccion", texto: "Listo para recoger" },
                { valor: "entregado", texto: "Recogido" }
            ];
        }
        this.selectorEstado.replaceChildren();
        estados = estados.filter((estado) => {
            return permisos.estadosEntrega.indexOf(estado.valor) !== -1;
        });
        for (let i = 0; i < estados.length; i++) {
            const opcion = crear("option", estados[i].texto);
            opcion.value = estados[i].valor;
            this.selectorEstado.append(opcion);
        }
        const actual = pedido.estadoEntrega || pedido.estado;
        for (let i = 0; i < estados.length; i++) {
            if (estados[i].valor === actual) this.selectorEstado.value = actual;
        }
    }

    /**
     * Muestra los formularios según las acciones disponibles.
     *
     * @param permisos - Acciones y estados que puede usar el rol actual.
     */
    aplicarPermisosPedido(permisos) {
        this.formAsignacion.closest("section").hidden = !permisos.asignar;
        document.getElementById("formulario-entrega").closest("section").hidden = !permisos.entrega;
        document.getElementById("aviso-rol").textContent = permisos.aviso;
    }

    /**
     * Llena el detalle del pedido.
     *
     * @param pedido - Registro del pedido.
     * @param cosechas - Lista de cosechas devuelta por la API.
     */
    mostrarPedido(pedido, cosechas) {
        const permisos = accionesPedido(rolDeSesion(), pedido.estadoEntrega || pedido.estado);
        document.getElementById("miga-pedido").textContent = `#${pedido.idPedido}`;
        document.getElementById("titulo-pedido").textContent = `Pedido #${pedido.idPedido}`;
        const datosEntrega = document.getElementById("datos-entrega-pedido");
        datosEntrega.textContent = pedido.tipoEntrega === "domicilio"
            ? `Dirección: ${pedido.direccionEntrega || "No registrada"}${pedido.numeroRastreo ? ` · Rastreo: ${pedido.numeroRastreo}` : ""}`
            : `Recolección en bodega: ${this.formatoFecha(pedido.fechaRecoleccion)} · Horario de 6:00 a. m. a 6:00 p. m.`;
        document.getElementById("etiqueta-rastreo").hidden = pedido.tipoEntrega !== "domicilio";
        document.getElementById("numero-rastreo").hidden = pedido.tipoEntrega !== "domicilio";
        document.getElementById("numero-rastreo").value = pedido.numeroRastreo || "";
        document.getElementById("formulario-asignacion").hidden = pedido.compraCatalogo === true;
        document.getElementById("aviso-asignacion-catalogo").hidden = pedido.compraCatalogo !== true;
        const trazaEntrega = pedido.fechaEntrega
            ? ` · ${pedido.tipoEntrega === "domicilio" ? "Entregado" : "Recogido"}: ${this.formatoFechaHora(pedido.fechaEntrega)}`
            : pedido.fechaSalida ? ` · Enviado: ${this.formatoFechaHora(pedido.fechaSalida)}` : "";
        document.getElementById("datos-pedido").textContent = `${pedido.cliente} · ${this.formatoFecha(pedido.fechaPedido)} · ${pedido.tipoEntrega === "domicilio" ? "Envío a domicilio" : "Recoger en bodega"}${trazaEntrega}`;
        this.aplicarPermisosPedido(permisos);
        this.selectorLote.replaceChildren();
        for (let i = 0; i < cosechas.length; i++) {
            const c = cosechas[i];
            if (Number(c.cantidadDisponible) <= 0) continue;
            const nombre = c.nombreCultivo || `Cultivo ${c.idCultivo}`;
            const o = crear("option", `${nombre} · ${capitalizar(c.estadoMaduracion || "lote")} · ${fmtNum(c.cantidadDisponible)} kg disponibles`);
            o.value = String(c.idCosecha);
            this.selectorLote.append(o);
        }
        this.prepararEstado(pedido, permisos);
    }

    /**
     * Envía idCosecha y kilos para asignarlos al pedido.
     *
     * @param evento - Evento de envío del formulario.
     */
    async guardarAsignacion(evento) {
        evento.preventDefault();
        const aviso = document.getElementById("mensaje-asignacion");
        aviso.textContent = "";
        try {
            await this.pedir(`/pedidos/${encodeURIComponent(this.idPedido)}/lotes`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idCosecha: Number(this.selectorLote.value), kilos: Number(document.getElementById("asignacion-kilos").value) })
            });
            this.formAsignacion.reset();
            await this.cargar();
        } catch (error) {
            aviso.textContent = error.message;
        }
    }

    /**
     * Guarda el estado y número de rastreo.
     *
     * @param evento - Evento de envío del formulario.
     */
    async guardarEntrega(evento) {
        evento.preventDefault();
        const aviso = document.getElementById("mensaje-entrega");
        aviso.textContent = "";
        try {
            await this.pedir(`/pedidos/${encodeURIComponent(this.idPedido)}/entrega`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estado: this.selectorEstado.value,
                    numeroRastreo: document.getElementById("numero-rastreo").value.trim(),
                    idUsuario: sessionStorage.getItem("usuarioId")
                })
            });
            await this.cargar();
        } catch (error) {
            aviso.textContent = error.message;
        }
    }

    /**
     * Conecta los formularios y abre el pedido.
     */
    iniciarDetallePedido() {
        this.formAsignacion.addEventListener("submit", evento => this.guardarAsignacion(evento));
        document.getElementById("formulario-entrega").addEventListener("submit", evento => this.guardarEntrega(evento));
        this.cargar();
    }
}

const vistaDetallePedido = new VistaDetallePedido();
vistaDetallePedido.iniciarDetallePedido();
