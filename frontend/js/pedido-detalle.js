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
        const error = await respuesta.json().catch(() => ({}));
        throw new Error(error.mensaje || `Error ${respuesta.status}`);
    }
    return respuesta.status === 204 ? null : respuesta.json();
}

function formatoFecha(valor) {
    if (!valor) return "—";
    const [a, m, d] = valor.slice(0, 10).split("-").map(Number);
    return new Date(a, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function formatoFechaHora(valor) {
    if (!valor) return "";
    return new Date(valor).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

function dibujarLotes(lotes) {
    const filasLotes = lotes.map(l => {
        const fila = crear("tr");
        fila.append(
            crear("td", `${l.producto} · Lote #${l.idCosecha}`),
            crear("td", l.maduracion ? capitalizar(l.maduracion) : "—"),
            crear("td", `${fmtNum(l.cantidad)} kg`)
        );
        return fila;
    });
    if (!lotes.length) {
        const fila = crear("tr");
        const celda = crear("td", "Aún no hay kilos asignados.");
        celda.colSpan = 3;
        fila.append(celda);
        filasLotes.push(fila);
    }
    filas.replaceChildren(...filasLotes);
}

function prepararEstado(permisos) {
    const estados = pedido.tipoEntrega === "domicilio"
        ? [["pendiente", pedido.cantidadLotes > 0 ? "Asignado · falta entrega" : "Pendiente de asignación"], ["en_transito", "Enviado"], ["entregado", "Entregado"]]
        : [["pendiente", pedido.cantidadLotes > 0 ? "Asignado · falta entrega" : "Pendiente de asignación"], ["listo_recoleccion", "Listo para recoger"], ["entregado", "Recogido"]];
    selectorEstado.replaceChildren(...estados.filter(([valor]) => permisos.estadosEntrega.includes(valor)).map(([valor, texto]) => {
        const opcion = crear("option", texto);
        opcion.value = valor;
        return opcion;
    }));
    const actual = pedido.estadoEntrega || pedido.estado;
    if (actual && estados.some(([valor]) => valor === actual)) selectorEstado.value = actual;
}

// Muestra u oculta las secciones de preparación según el rol (reglas en js/permisos-pedidos.js).
function aplicarPermisos(permisos) {
    formAsignacion.closest("section").style.display = permisos.asignar ? "" : "none";
    document.getElementById("formulario-entrega").closest("section").style.display = permisos.entrega ? "" : "none";
    document.getElementById("aviso-rol").textContent = permisos.aviso;
}

async function cargar() {
    mensaje.textContent = "Cargando pedido…";
    try {
        [pedido, cosechas] = await Promise.all([pedir(`/pedidos/${encodeURIComponent(idPedido)}`), pedir("/cosechas")]);
        document.getElementById("miga-pedido").textContent = `#${pedido.idPedido}`;
        document.getElementById("titulo-pedido").textContent = `Pedido #${pedido.idPedido}`;
        const trazaEntrega = pedido.fechaEntrega
            ? ` · ${pedido.tipoEntrega === "domicilio" ? "Entregado" : "Recogido"}: ${formatoFechaHora(pedido.fechaEntrega)}`
            : pedido.fechaSalida ? ` · Enviado: ${formatoFechaHora(pedido.fechaSalida)}` : "";
        document.getElementById("datos-pedido").textContent = `${pedido.cliente} · ${formatoFecha(pedido.fechaPedido)} · ${pedido.tipoEntrega === "domicilio" ? "Envío a domicilio" : "Recoger en bodega"}${trazaEntrega}`;
        selectorLote.replaceChildren(...cosechas.filter(c => Number(c.cantidadDisponible) > 0).map(c => {
            const nombre = c.nombreCultivo || `Cultivo ${c.idCultivo}`;
            const o = crear("option", `${nombre} · ${capitalizar(c.estadoMaduracion || "lote")} · ${fmtNum(c.cantidadDisponible)} kg disponibles`);
            o.value = String(c.idCosecha);
            return o;
        }));
        const permisos = accionesPedido(rolDeSesion(), pedido.estadoEntrega || pedido.estado);
        prepararEstado(permisos);
        aplicarPermisos(permisos);
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

formAsignacion.addEventListener("submit", async evento => {
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
    } catch (error) { aviso.textContent = error.message; }
});

document.getElementById("formulario-entrega").addEventListener("submit", async evento => {
    evento.preventDefault();
    const aviso = document.getElementById("mensaje-entrega");
    aviso.textContent = "";
    try {
        await pedir(`/pedidos/${encodeURIComponent(idPedido)}/entrega`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: selectorEstado.value })
        });
        await cargar();
    } catch (error) { aviso.textContent = error.message; }
});

cargar();