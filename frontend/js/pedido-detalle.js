const API = "http://localhost:8081/api";
const idPedido = new URLSearchParams(location.search).get("id");
const filas = document.getElementById("lotes-pedido");
const mensaje = document.getElementById("mensaje-pedido");
const selectorLote = document.getElementById("asignacion-lote");
const selectorEstado = document.getElementById("estado-entrega");
const formAsignacion = document.getElementById("formulario-asignacion");
let pedido;
let cosechas = [];

async function pedir(url, opciones) {
    const respuesta = await fetch(`${API}${url}`, opciones);
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

function formatoFecha(valor) {
    if (!valor) return "—";
    const partes = valor.slice(0, 10).split("-");
    const a = Number(partes[0]);
    const m = Number(partes[1]);
    const d = Number(partes[2]);
    return new Date(a, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function formatoFechaHora(valor) {
    if (!valor) return "";
    return new Date(valor).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

function dibujarLotes(lotes) {
    filas.replaceChildren();
    for (let i = 0; i < lotes.length; i++) {
        const l = lotes[i];
        const fila = crear("tr");
        fila.append(
            crear("td", `${l.producto} · Lote #${l.idCosecha}`),
            crear("td", l.maduracion ? capitalizar(l.maduracion) : "—"),
            crear("td", `${fmtNum(l.cantidad)} kg`)
        );
        filas.append(fila);
    }
    if (!lotes.length) {
        const fila = crear("tr");
        const celda = crear("td", "Aún no hay kilos asignados.");
        celda.colSpan = 3;
        fila.append(celda);
        filas.append(fila);
    }
}

function prepararEstado() {
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
    selectorEstado.replaceChildren();
    for (let i = 0; i < estados.length; i++) {
        const opcion = crear("option", estados[i].texto);
        opcion.value = estados[i].valor;
        selectorEstado.append(opcion);
    }
    const actual = pedido.estadoEntrega || pedido.estado;
    for (let i = 0; i < estados.length; i++) {
        if (estados[i].valor === actual) selectorEstado.value = actual;
    }
}

async function cargar() {
    mensaje.textContent = "Cargando pedido…";
    try {
        pedido = await pedir(`/pedidos/${encodeURIComponent(idPedido)}`);
        cosechas = await pedir("/cosechas");
        document.getElementById("miga-pedido").textContent = `#${pedido.idPedido}`;
        document.getElementById("titulo-pedido").textContent = `Pedido #${pedido.idPedido}`;
        const datosEntrega = document.getElementById("datos-entrega-pedido");
        datosEntrega.textContent = pedido.tipoEntrega === "domicilio"
            ? `Dirección: ${pedido.direccionEntrega || "No registrada"}${pedido.numeroRastreo ? ` · Rastreo: ${pedido.numeroRastreo}` : ""}`
            : `Recolección en bodega: ${formatoFecha(pedido.fechaRecoleccion)} · Horario de 6:00 a. m. a 6:00 p. m.`;
        document.getElementById("etiqueta-rastreo").hidden = pedido.tipoEntrega !== "domicilio";
        document.getElementById("numero-rastreo").hidden = pedido.tipoEntrega !== "domicilio";
        document.getElementById("numero-rastreo").value = pedido.numeroRastreo || "";
        document.getElementById("formulario-asignacion").hidden = pedido.compraCatalogo === true;
        document.getElementById("aviso-asignacion-catalogo").hidden = pedido.compraCatalogo !== true;
        const trazaEntrega = pedido.fechaEntrega
            ? ` · ${pedido.tipoEntrega === "domicilio" ? "Entregado" : "Recogido"}: ${formatoFechaHora(pedido.fechaEntrega)}`
            : pedido.fechaSalida ? ` · Enviado: ${formatoFechaHora(pedido.fechaSalida)}` : "";
        document.getElementById("datos-pedido").textContent = `${pedido.cliente} · ${formatoFecha(pedido.fechaPedido)} · ${pedido.tipoEntrega === "domicilio" ? "Envío a domicilio" : "Recoger en bodega"}${trazaEntrega}`;
        selectorLote.replaceChildren();
        for (let i = 0; i < cosechas.length; i++) {
            const c = cosechas[i];
            if (Number(c.cantidadDisponible) <= 0) continue;
            const nombre = c.nombreCultivo || `Cultivo ${c.idCultivo}`;
            const o = crear("option", `${nombre} · ${capitalizar(c.estadoMaduracion || "lote")} · ${fmtNum(c.cantidadDisponible)} kg disponibles`);
            o.value = String(c.idCosecha);
            selectorLote.append(o);
        }
        prepararEstado();
        await actualizarLotes();
        document.querySelector("#formulario-asignacion button[type=submit]").disabled = !selectorLote.options.length;
        mensaje.textContent = "";
    } catch (error) {
        mensaje.textContent = "No se pudo cargar el pedido y sus lotes desde el API.";
    }
}

async function actualizarLotes() {
    const lotes = await pedir(`/pedidos/${encodeURIComponent(idPedido)}/lotes`);
    dibujarLotes(lotes);
}

formAsignacion.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    const aviso = document.getElementById("mensaje-asignacion");
    aviso.textContent = "";
    try {
        await pedir(`/pedidos/${encodeURIComponent(idPedido)}/lotes`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idCosecha: Number(selectorLote.value), kilos: Number(document.getElementById("asignacion-kilos").value) })
        });
        formAsignacion.reset();
        await cargar();
    } catch (error) {
        aviso.textContent = error.message;
    }
});

document.getElementById("formulario-entrega").addEventListener("submit", async function (evento) {
    evento.preventDefault();
    const aviso = document.getElementById("mensaje-entrega");
    aviso.textContent = "";
    try {
        await pedir(`/pedidos/${encodeURIComponent(idPedido)}/entrega`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                estado: selectorEstado.value,
                numeroRastreo: document.getElementById("numero-rastreo").value.trim(),
                idUsuario: sessionStorage.getItem("usuarioId")
            })
        });
        await cargar();
    } catch (error) {
        aviso.textContent = error.message;
    }
});

cargar();
