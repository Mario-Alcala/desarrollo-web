/*
 * ARCHIVO: js/bodega.js
 * CAPA: FRONTEND (lógica). ¿ES CASCARÓN? NO: alterna pestañas, filtra por bodega, calcula caducidades
 *   y valida entradas y salidas.
 * QUÉ USA DEL BACKEND: nada todavía; lee BODEGAS, INVENTARIO, INSUMOS, PROVEEDORES, HERRAMIENTAS,
 *   MOVIMIENTOS, COSECHAS y PRODUCTOS de js/admin-datos.js.
 * REGLAS DEL DOCUMENTO: las entradas y salidas se guardan como movimientos de inventario; la unidad
 *   sale del insumo; la cosecha se consulta aquí como lote disponible y no se edita.
 * LE FALTA: GET y POST contra la API; alta de herramientas; que una salida pida el motivo.
 * AÑADIDO POR BACKEND INCOMPLETO: los cambios viven solo en memoria (se pierden al recargar).
 */

const buscador = document.querySelector("#topbar input");
const mensaje = document.getElementById("mensaje-bodega");
const cabecera = document.getElementById("tabla-cabecera");
const cuerpo = document.getElementById("tabla-cuerpo");
const selectorBodega = document.getElementById("filtro-bodega");
const botonRegistrar = document.getElementById("registrar-movimiento");

const dialogo = document.getElementById("dialogo-movimiento");
const formulario = document.getElementById("formulario-movimiento");
const mensajeFormulario = document.getElementById("mensaje-movimiento");
const selectLote = document.getElementById("mv-lote");
const selectTipo = document.getElementById("mv-tipo");
const campoCantidad = document.getElementById("mv-cantidad");
const ayuda = document.getElementById("mv-ayuda");

let vista = "insumos";
let bodegaActiva = "";

/* ---------- Utilidades ---------- */
function nombreBodega(id) {
    const b = BODEGAS.find(x => x.id === id);
    return b ? b.nombre : "—";
}

function insumoDe(lote) {
    return INSUMOS.find(i => i.id === lote.idInsumo);
}

function proveedorDe(lote) {
    const p = PROVEEDORES.find(x => x.id === lote.idProveedor);
    return p ? p.nombreEmpresa : "—";
}

function fecha(iso) {
    if (!iso) return "—";
    const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function fechaHora(iso) {
    const d = new Date(iso);
    return d.toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function etiquetaCaducidad(iso) {
    if (!iso) return crear("span", "Sin caducidad");
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const dias = Math.ceil((new Date(iso + "T00:00:00") - hoy) / 86400000);
    if (dias < 0) return etiqueta("Caducado · " + fecha(iso), "error");
    if (dias <= 30) return etiqueta("Caduca en " + dias + " d · " + fecha(iso), "aviso");
    return crear("span", fecha(iso));
}

function coincide(q, campos) {
    return !q || campos.some(c => String(c || "").toLowerCase().includes(q));
}

function enBodega(idBodega) {
    return !bodegaActiva || idBodega === Number(bodegaActiva);
}

function dibujarTabla(columnas, filas) {
    cabecera.replaceChildren(...columnas.map(c => {
        const th = crear("th", c.texto);
        if (c.numero) th.className = "numero";
        return th;
    }));
    cuerpo.replaceChildren(...filas.map(celdas => {
        const tr = crear("tr");
        celdas.forEach((c, i) => {
            const td = crear("td");
            if (columnas[i].numero) td.className = "numero";
            td.append(c);
            tr.append(td);
        });
        return tr;
    }));
}

/* ---------- Dibujo de cada pestaña ---------- */
function filasInsumos(q) {
    return INVENTARIO
        .filter(l => enBodega(l.idBodega) && coincide(q, [insumoDe(l).nombre, insumoDe(l).categoria, proveedorDe(l), nombreBodega(l.idBodega)]))
        .map(l => {
            const insumo = insumoDe(l);
            return [
                insumo.nombre,
                etiqueta(capitalizar(insumo.categoria), insumo.categoria === "semilla" ? "ok" : insumo.categoria === "abono" ? "aviso" : ""),
                nombreBodega(l.idBodega),
                proveedorDe(l),
                crear("strong", fmtNum(l.cantidadDisponible) + " " + insumo.unidad),
                fecha(l.fechaIngreso),
                etiquetaCaducidad(l.fechaCaducidad),
                crearBoton("Movimiento", "boton boton-secundario boton-chico", () => abrirMovimiento(l))
            ];
        });
}

function filasHerramientas(q) {
    const tipoEstado = { "Disponible": "ok", "En uso": "aviso", "Mantenimiento": "error" };
    return HERRAMIENTAS
        .filter(h => enBodega(h.idBodega) && coincide(q, [h.nombre, h.tipo, h.estado, nombreBodega(h.idBodega)]))
        .map(h => [h.nombre, h.tipo || "—", nombreBodega(h.idBodega), String(h.cantidad), etiqueta(h.estado, tipoEstado[h.estado])]);
}

function filasCosechas(q) {
    return COSECHAS
        .filter(c => enBodega(c.idBodega))
        .map(c => ({ c, producto: PRODUCTOS.find(p => p.id === c.idProducto) }))
        .filter(({ c, producto }) => coincide(q, [nombreProducto(producto), c.origen, c.maduracion, nombreBodega(c.idBodega)]))
        .map(({ c, producto }) => [
            nombreProducto(producto),
            c.origen,
            nombreBodega(c.idBodega),
            fecha(c.fecha),
            fmtNum(c.kgCosechados) + " kg",
            crear("strong", fmtNum(c.kgDisponibles) + " kg"),
            etiqueta(capitalizar(c.maduracion), c.maduracion === "maduro" ? "ok" : "aviso"),
            c.kgDisponibles > 0 ? etiqueta("Disponible para venta", "ok") : etiqueta("Agotado")
        ]);
}

function filasMovimientos(q) {
    return [...MOVIMIENTOS]
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .map(m => ({ m, lote: INVENTARIO.find(l => l.id === m.idInventario) }))
        .filter(({ lote }) => lote && enBodega(lote.idBodega))
        .filter(({ m, lote }) => coincide(q, [insumoDe(lote).nombre, m.tipo, m.usuario, nombreBodega(lote.idBodega)]))
        .map(({ m, lote }) => [
            fechaHora(m.fecha),
            insumoDe(lote).nombre,
            nombreBodega(lote.idBodega),
            etiqueta(capitalizar(m.tipo), m.tipo === "entrada" ? "ok" : "aviso"),
            fmtNum(m.cantidad) + " " + insumoDe(lote).unidad,
            m.usuario
        ]);
}

const COLUMNAS = {
    insumos: [{ texto: "Insumo" }, { texto: "Categoría" }, { texto: "Bodega" }, { texto: "Proveedor" }, { texto: "Disponible", numero: true }, { texto: "Ingreso" }, { texto: "Caducidad" }, { texto: "Acciones" }],
    herramientas: [{ texto: "Herramienta" }, { texto: "Tipo" }, { texto: "Bodega" }, { texto: "Cantidad", numero: true }, { texto: "Estado" }],
    cosechas: [{ texto: "Producto" }, { texto: "Origen" }, { texto: "Bodega" }, { texto: "Fecha de cosecha" }, { texto: "Cosechado", numero: true }, { texto: "Disponible", numero: true }, { texto: "Maduración" }, { texto: "Venta" }],
    movimientos: [{ texto: "Fecha" }, { texto: "Insumo" }, { texto: "Bodega" }, { texto: "Tipo" }, { texto: "Cantidad", numero: true }, { texto: "Registró" }]
};

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const generadores = { insumos: filasInsumos, herramientas: filasHerramientas, cosechas: filasCosechas, movimientos: filasMovimientos };
    const filas = generadores[vista](q);
    dibujarTabla(COLUMNAS[vista], filas);

    if (!filas.length) mensaje.textContent = "No hay registros para mostrar.";
    else if (mensaje.textContent === "No hay registros para mostrar.") mensaje.textContent = "";
}

/* ---------- Movimientos de inventario ---------- */
function llenarLotes(seleccionado) {
    selectLote.replaceChildren(...INVENTARIO.map(l => {
        const insumo = insumoDe(l);
        const opcion = crear("option", `${insumo.nombre} · ${nombreBodega(l.idBodega)} · ${fmtNum(l.cantidadDisponible)} ${insumo.unidad}`);
        opcion.value = String(l.id);
        return opcion;
    }));
    if (seleccionado) selectLote.value = String(seleccionado.id);
}

function actualizarAyuda() {
    const lote = INVENTARIO.find(l => l.id === Number(selectLote.value));
    if (!lote) return;
    const insumo = insumoDe(lote);
    ayuda.textContent = `Disponible: ${fmtNum(lote.cantidadDisponible)} ${insumo.unidad}. Una salida no puede ser mayor que lo disponible.`;
}

function abrirMovimiento(lote) {
    mensajeFormulario.textContent = "";
    formulario.reset();
    llenarLotes(lote);
    actualizarAyuda();
    dialogo.showModal();
}

formulario.addEventListener("submit", evento => {
    evento.preventDefault();
    mensajeFormulario.textContent = "";

    const lote = INVENTARIO.find(l => l.id === Number(selectLote.value));
    const tipo = selectTipo.value;
    const cantidad = Number(campoCantidad.value);

    if (!lote) {
        mensajeFormulario.textContent = "Elige un lote de insumo.";
        return;
    }
    if (!(cantidad > 0)) {
        mensajeFormulario.textContent = "La cantidad debe ser mayor que cero.";
        return;
    }
    if (tipo === "salida" && cantidad > lote.cantidadDisponible) {
        mensajeFormulario.textContent = "No hay suficiente: solo quedan " + fmtNum(lote.cantidadDisponible) + " " + insumoDe(lote).unidad + " en este lote.";
        return;
    }

    lote.cantidadDisponible = Math.round((lote.cantidadDisponible + (tipo === "entrada" ? cantidad : -cantidad)) * 100) / 100;
    MOVIMIENTOS.push({
        id: Math.max(0, ...MOVIMIENTOS.map(m => m.id)) + 1,
        idInventario: lote.id,
        usuario: "Administrador / Agricultor",
        tipo,
        cantidad,
        fecha: new Date().toISOString().slice(0, 16)
    });

    dialogo.close();
    mensaje.textContent = MENSAJE_SESION;
    dibujar();
});

selectLote.addEventListener("change", actualizarAyuda);

/* ---------- Eventos generales ---------- */
BODEGAS.forEach(b => {
    const opcion = crear("option", b.nombre);
    opcion.value = String(b.id);
    selectorBodega.append(opcion);
});

selectorBodega.addEventListener("change", () => {
    bodegaActiva = selectorBodega.value;
    dibujar();
});

iniciarFiltros(document.getElementById("pestanas"), valor => {
    vista = valor;
    botonRegistrar.hidden = !(valor === "insumos" || valor === "movimientos");
    mensaje.textContent = "";
    dibujar();
});

botonRegistrar.addEventListener("click", () => abrirMovimiento(null));
document.getElementById("cancelar-movimiento").addEventListener("click", () => dialogo.close());
buscador.addEventListener("input", dibujar);

dibujar();
