const API_INSUMOS = "http://localhost:8081/api/insumos";
const API_INVENTARIO = "http://localhost:8081/api/inventario";
const API_MOVIMIENTOS = "http://localhost:8081/api/movimientos-inventario";
const buscador = document.querySelector("#topbar input");
const tabla = document.getElementById("tabla-inventario");
const mensaje = document.getElementById("mensaje-inventario");
const selectorInsumo = document.getElementById("entrada-insumo");
const dialogo = document.getElementById("dialogo-entrada");
const formulario = document.getElementById("formulario-entrada");
const msgFormulario = document.getElementById("mensaje-entrada");
const dialogoMovimiento = document.getElementById("dialogo-movimiento-inventario");
const formularioMovimiento = document.getElementById("formulario-movimiento-inventario");
const msgMovimiento = document.getElementById("mensaje-movimiento-inventario");
let usuarios = [];
let insumos = [];
let lotes = [];
let categoria = "todos";
let loteMovimiento = null;

function formatoFecha(fecha) {
    if (!fecha) return "—";
    const [a, m, d] = String(fecha).slice(0, 10).split("-").map(Number);
    return new Date(a, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

async function cargar() {
    mensaje.textContent = "Cargando existencias…";
    try {
        const [resInsumos, resLotes, resUsuarios] = await Promise.all([fetch(API_INSUMOS), fetch(API_INVENTARIO), fetch("http://localhost:8081/api/usuarios")]);
        if (!resInsumos.ok || !resLotes.ok || !resUsuarios.ok) throw new Error();
        [insumos, lotes, usuarios] = await Promise.all([resInsumos.json(), resLotes.json(), resUsuarios.json()]);
        usuarios = usuarios.filter(u => u.rol !== "cliente");
        insumos = insumos.filter(i => ["semilla", "abono", "fertilizante"].includes(i.categoria));
        selectorInsumo.replaceChildren(...insumos.map(i => {
            const opcion = crear("option", `${i.nombre} · ${i.unidadMedida}`);
            opcion.value = String(i.idInsumo);
            return opcion;
        }));
        document.getElementById("usuario-movimiento").replaceChildren(...usuarios.map(u => {
            const opcion = crear("option", u.nombreUsuario);
            opcion.value = String(u.idUsuario);
            return opcion;
        }));
        dibujar();
    } catch {
        insumos = [];
        lotes = [];
        dibujar();
        mensaje.textContent = "No se pudo conectar con el API de inventario.";
    }
}

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const visibles = lotes.filter(l => {
        const tipo = l.categoria || insumos.find(i => i.idInsumo === l.idInsumo)?.categoria;
        const nombre = l.nombreInsumo || insumos.find(i => i.idInsumo === l.idInsumo)?.nombre || "";
        return (categoria === "todos" || tipo === categoria) && (!q || `${nombre} ${tipo}`.toLowerCase().includes(q));
    });
    tabla.replaceChildren(...visibles.map(l => {
        const fila = crear("tr");
        const nombre = l.nombreInsumo || insumos.find(i => i.idInsumo === l.idInsumo)?.nombre || "Insumo";
        const unidad = l.unidadMedida || insumos.find(i => i.idInsumo === l.idInsumo)?.unidadMedida || "";
        const tipo = l.categoria || insumos.find(i => i.idInsumo === l.idInsumo)?.categoria;
        fila.append(
            crear("td", nombre),
            crear("td", etiquetaCategoria(tipo, l.tipoAbono)),
            crear("td", `${fmtNum(l.cantidad)} ${unidad}`),
            crear("td", formatoFecha(l.fechaIngreso)),
            crear("td", formatoFecha(l.fechaCaducidad))
        );
        const acciones = crear("td");
        acciones.append(crearBoton("Movimiento", "boton boton-secundario boton-chico", () => abrirMovimiento(l)));
        fila.append(acciones);
        return fila;
    }));
    if (visibles.length) mensaje.textContent = `${visibles.length} ${visibles.length === 1 ? "lote" : "lotes"} de inventario`;
    else if (!mensaje.textContent.startsWith("No se pudo conectar")) mensaje.textContent = "No hay existencias para mostrar.";
}

function etiquetaCategoria(tipo, tipoAbono) {
    if (tipo === "abono") {
        if (tipoAbono === "organico") return "Abono orgánico";
        if (tipoAbono === "inorganico") return "Abono inorgánico";
        return "Abono";
    }
    return { semilla: "Semilla", fertilizante: "Fertilizante" }[tipo] || "Inventario";
}

document.getElementById("filtros-categoria").addEventListener("click", evento => {
    const boton = evento.target.closest("button[data-valor]");
    if (!boton) return;
    categoria = boton.dataset.valor;
    document.querySelectorAll("#filtros-categoria button").forEach(b => b.setAttribute("aria-pressed", String(b === boton)));
    dibujar();
});

document.getElementById("registrar-entrada").addEventListener("click", () => {
    msgFormulario.textContent = "";
    formulario.reset();
    document.getElementById("entrada-ingreso").value = new Date().toISOString().slice(0, 10);
    dialogo.showModal();
});

formulario.addEventListener("submit", async evento => {
    evento.preventDefault();
    msgFormulario.textContent = "";
    const datos = {
        idInsumo: Number(selectorInsumo.value),
        cantidad: Number(document.getElementById("entrada-cantidad").value),
        fechaIngreso: document.getElementById("entrada-ingreso").value,
        fechaCaducidad: document.getElementById("entrada-caducidad").value || null
    };
    try {
        const respuesta = await fetch(API_INVENTARIO, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos)
        });
        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));
            throw new Error(error.mensaje || "No se pudo guardar la entrada.");
        }
        dialogo.close();
        await cargar();
    } catch (error) {
        msgFormulario.textContent = error.message;
    }
});

document.getElementById("cancelar-entrada").addEventListener("click", () => dialogo.close());

function abrirMovimiento(lote) {
    loteMovimiento = lote;
    msgMovimiento.textContent = "";
    formularioMovimiento.reset();
    const insumo = insumos.find(i => i.idInsumo === lote.idInsumo);
    document.getElementById("lote-movimiento").textContent = `${lote.nombreInsumo || insumo?.nombre || "Abono"} · Disponible: ${fmtNum(lote.cantidad)} ${lote.unidadMedida || insumo?.unidadMedida || ""}`;
    document.querySelector("#formulario-movimiento-inventario button[type=submit]").disabled = !usuarios.length;
    dialogoMovimiento.showModal();
}

formularioMovimiento.addEventListener("submit", async evento => {
    evento.preventDefault();
    msgMovimiento.textContent = "";
    const datos = {
        idInventario: loteMovimiento.idInventario,
        idUsuario: Number(document.getElementById("usuario-movimiento").value),
        tipoMovimiento: document.getElementById("tipo-movimiento").value,
        cantidad: Number(document.getElementById("cantidad-movimiento").value),
        observacion: document.getElementById("nota-movimiento").value.trim()
    };
    try {
        const respuesta = await fetch(API_MOVIMIENTOS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));
            throw new Error(error.mensaje || "No se pudo registrar el movimiento.");
        }
        dialogoMovimiento.close();
        await cargar();
    } catch (error) { msgMovimiento.textContent = error.message; }
});

document.getElementById("cancelar-movimiento-inventario").addEventListener("click", () => dialogoMovimiento.close());
buscador.addEventListener("input", dibujar);
cargar();
