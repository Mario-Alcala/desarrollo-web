const API_INSUMOS = "http://localhost:8081/api/insumos";
const API_INVENTARIO = "http://localhost:8081/api/inventario";
const API_MOVIMIENTOS = "http://localhost:8081/api/movimientos-inventario";
const API_HERRAMIENTAS = "http://localhost:8081/api/herramientas";
const buscador = document.querySelector("#topbar input");
const tabla = document.getElementById("tabla-inventario");
const mensaje = document.getElementById("mensaje-inventario");
const entradaInsumo = document.getElementById("entrada-insumo");
const opcionesInsumo = document.getElementById("opciones-insumo");
const dialogo = document.getElementById("dialogo-entrada");
const formulario = document.getElementById("formulario-entrada");
const msgFormulario = document.getElementById("mensaje-entrada");
const dialogoHerramienta = document.getElementById("dialogo-herramienta");
const formularioHerramienta = document.getElementById("formulario-herramienta");
const msgHerramienta = document.getElementById("mensaje-herramienta");
const dialogoMovimiento = document.getElementById("dialogo-movimiento-inventario");
const formularioMovimiento = document.getElementById("formulario-movimiento-inventario");
const msgMovimiento = document.getElementById("mensaje-movimiento-inventario");
let usuarios = [];
let insumos = [];
let lotes = [];
let herramientas = [];
let categoria = "todos";
let loteMovimiento = null;
let herramientaEditando = null;

function formatoFecha(fecha) {
    if (!fecha) return "—";
    const partes = String(fecha).slice(0, 10).split("-");
    const a = Number(partes[0]);
    const m = Number(partes[1]);
    const d = Number(partes[2]);
    return new Date(a, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function buscarInsumo(id) {
    for (let i = 0; i < insumos.length; i++) {
        if (insumos[i].idInsumo === id) return insumos[i];
    }
    return null;
}

async function mensajeError(respuesta, mensajePredeterminado) {
    try {
        const error = await respuesta.json();
        return error.mensaje || mensajePredeterminado;
    } catch (noEsJson) {
        return mensajePredeterminado;
    }
}

async function cargar() {
    mensaje.textContent = "Cargando existencias…";
    try {
        const resInsumos = await fetch(API_INSUMOS);
        const resLotes = await fetch(API_INVENTARIO);
        const resUsuarios = await fetch("http://localhost:8081/api/usuarios");
        const resHerramientas = await fetch(API_HERRAMIENTAS);
        if (!resInsumos.ok || !resLotes.ok || !resUsuarios.ok || !resHerramientas.ok) throw new Error();
        insumos = await resInsumos.json();
        lotes = await resLotes.json();
        const todosUsuarios = await resUsuarios.json();
        herramientas = await resHerramientas.json();

        usuarios = [];
        for (let i = 0; i < todosUsuarios.length; i++) {
            if (todosUsuarios[i].rol !== "cliente") usuarios.push(todosUsuarios[i]);
        }
        const insumosPermitidos = [];
        for (let i = 0; i < insumos.length; i++) {
            const tipo = insumos[i].categoria;
            if (tipo === "semilla" || tipo === "abono" || tipo === "fertilizante") {
                insumosPermitidos.push(insumos[i]);
            }
        }
        insumos = insumosPermitidos;

        opcionesInsumo.replaceChildren();
        for (let i = 0; i < insumos.length; i++) {
            const iActual = insumos[i];
            const opcion = document.createElement("option");
            opcion.value = iActual.nombre;
            opcion.label = iActual.unidadMedida || "";
            opcionesInsumo.append(opcion);
        }

        const selectorUsuario = document.getElementById("usuario-movimiento");
        selectorUsuario.replaceChildren();
        for (let i = 0; i < usuarios.length; i++) {
            const opcion = crear("option", usuarios[i].nombreUsuario);
            opcion.value = String(usuarios[i].idUsuario);
            selectorUsuario.append(opcion);
        }
        dibujar();
    } catch {
        insumos = [];
        lotes = [];
        herramientas = [];
        dibujar();
        mensaje.textContent = "No se pudo conectar con el API de inventario.";
    }
}

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const visibles = [];
    if (categoria !== "herramienta") {
        for (let i = 0; i < lotes.length; i++) {
            const lote = lotes[i];
            const insumo = buscarInsumo(lote.idInsumo);
            let tipo = lote.categoria;
            let nombre = lote.nombreInsumo;
            let subtipoAbono = lote.tipoAbono;
            if (insumo) {
                if (!tipo) tipo = insumo.categoria;
                if (!nombre) nombre = insumo.nombre;
                if (!subtipoAbono) subtipoAbono = insumo.tipoAbono;
            }
            const coincideCategoria = categoria === "todos" || tipo === categoria;
            const texto = `${nombre || ""} ${tipo || ""} ${subtipoAbono || ""}`.toLowerCase();
            const coincideTexto = !q || texto.includes(q);
            if (coincideCategoria && coincideTexto) visibles.push(lote);
        }
    }

    tabla.replaceChildren();
    for (let i = 0; i < visibles.length; i++) {
        const l = visibles[i];
        const fila = crear("tr");
        const insumo = buscarInsumo(l.idInsumo);
        const nombre = l.nombreInsumo || (insumo ? insumo.nombre : "Insumo");
        const unidad = l.unidadMedida || (insumo ? insumo.unidadMedida : "");
        const tipo = l.categoria || (insumo ? insumo.categoria : "");
        const subtipoAbono = l.tipoAbono || (insumo ? insumo.tipoAbono : "");
        fila.append(
            crear("td", nombre),
            crear("td", etiquetaCategoria(tipo, subtipoAbono)),
            crear("td", `${fmtNum(l.cantidad)} ${unidad}`),
            crear("td", formatoFecha(l.fechaIngreso)),
            crear("td", formatoFecha(l.fechaCaducidad))
        );
        const acciones = crear("td");
        acciones.append(
            crearBoton("Registrar salida", "boton boton-secundario boton-chico", function () { abrirMovimiento(l); }),
            crearBoton("Eliminar", "boton boton-secundario boton-chico", function () { eliminarLote(l); })
        );
        fila.append(acciones);
        tabla.append(fila);
    }

    const herramientasVisibles = [];
    if (categoria === "todos" || categoria === "herramienta") {
        for (let i = 0; i < herramientas.length; i++) {
            const h = herramientas[i];
            const texto = `${h.nombre || ""} ${h.tipo || ""} ${h.estado || ""}`.toLowerCase();
            if (!q || texto.includes(q)) herramientasVisibles.push(h);
        }
    }
    for (let i = 0; i < herramientasVisibles.length; i++) {
        const h = herramientasVisibles[i];
        const fila = crear("tr");
        fila.append(
            crear("td", h.nombre || "Herramienta"),
            crear("td", h.tipo || "Herramienta"),
            crear("td", `${fmtNum(h.cantidad)} unidad${h.cantidad === 1 ? "" : "es"}`),
            crear("td", formatoFecha(h.fechaAdquisicion)),
            crear("td", "—")
        );
        const acciones = crear("td");
        acciones.append(
            crear("span", h.estado || "Disponible", "estado-inventario"),
            crearBoton("Editar", "boton boton-secundario boton-chico", function () { editarHerramienta(h); }),
            crearBoton("Eliminar", "boton boton-secundario boton-chico", function () { eliminarHerramienta(h); })
        );
        fila.append(acciones);
        tabla.append(fila);
    }
    const total = visibles.length + herramientasVisibles.length;
    if (total) mensaje.textContent = `${total} ${total === 1 ? "registro" : "registros"} de inventario`;
    else if (!mensaje.textContent.startsWith("No se pudo conectar")) mensaje.textContent = "No hay existencias para mostrar.";
}

function etiquetaCategoria(tipo, subtipoAbono) {
    if (tipo === "abono") {
        return subtipoAbono === "organico" ? "Abono orgánico"
            : subtipoAbono === "inorganico" ? "Abono inorgánico"
                : "Abono sin tipo";
    }
    return { semilla: "Semilla", fertilizante: "Fertilizante" }[tipo] || "Insumo";
}

document.getElementById("filtros-categoria").addEventListener("click", function (evento) {
    const boton = evento.target.closest("button[data-valor]");
    if (!boton) return;
    categoria = boton.dataset.valor;
    const botones = document.querySelectorAll("#filtros-categoria button");
    for (let i = 0; i < botones.length; i++) {
        botones[i].setAttribute("aria-pressed", String(botones[i] === boton));
    }
    dibujar();
});

document.getElementById("registrar-entrada").addEventListener("click", function () {
    msgFormulario.textContent = "";
    formulario.reset();
    document.getElementById("entrada-ingreso").value = new Date().toISOString().slice(0, 10);
    dialogo.showModal();
});

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    msgFormulario.textContent = "";
    const nombreEscrito = entradaInsumo.value.trim().toLocaleLowerCase();
    const coincidencias = [];
    for (let i = 0; i < insumos.length; i++) {
        if (insumos[i].nombre.trim().toLocaleLowerCase() === nombreEscrito) coincidencias.push(insumos[i]);
    }
    if (coincidencias.length !== 1) {
        msgFormulario.textContent = coincidencias.length > 1
            ? "Hay más de un producto con ese nombre. Revisa los nombres registrados para distinguirlos."
            : "No existe un producto con ese nombre. Regístralo primero y luego agrega su existencia.";
        return;
    }
    const datos = {
        idInsumo: coincidencias[0].idInsumo,
        cantidad: Number(document.getElementById("entrada-cantidad").value),
        fechaIngreso: document.getElementById("entrada-ingreso").value,
        fechaCaducidad: document.getElementById("entrada-caducidad").value || null
    };
    try {
        const respuesta = await fetch(API_INVENTARIO, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos)
        });
        if (!respuesta.ok) {
            throw new Error(await mensajeError(respuesta, "No se pudo guardar la entrada."));
        }
        dialogo.close();
        await cargar();
    } catch (error) {
        msgFormulario.textContent = error.message;
    }
});

document.getElementById("cancelar-entrada").addEventListener("click", function () { dialogo.close(); });

document.getElementById("registrar-herramienta").addEventListener("click", function () {
    herramientaEditando = null;
    msgHerramienta.textContent = "";
    formularioHerramienta.reset();
    document.getElementById("titulo-herramienta").textContent = "Registrar herramienta";
    formularioHerramienta.querySelector("button[type=submit]").textContent = "Guardar herramienta";
    document.getElementById("herramienta-cantidad").value = "1";
    dialogoHerramienta.showModal();
});

formularioHerramienta.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    msgHerramienta.textContent = "";
    const fecha = document.getElementById("herramienta-fecha").value;
    const datos = {
        nombre: document.getElementById("herramienta-nombre").value.trim(),
        tipo: document.getElementById("herramienta-tipo").value.trim(),
        cantidad: Number(document.getElementById("herramienta-cantidad").value),
        estado: document.getElementById("herramienta-estado").value,
        fechaAdquisicion: fecha || null
    };
    try {
        const respuesta = await fetch(herramientaEditando ? `${API_HERRAMIENTAS}/${herramientaEditando.id}` : API_HERRAMIENTAS, {
            method: herramientaEditando ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos)
        });
        if (!respuesta.ok) {
            throw new Error(await mensajeError(respuesta, "No se pudo guardar la herramienta."));
        }
        dialogoHerramienta.close();
        herramientaEditando = null;
        document.getElementById("titulo-herramienta").textContent = "Registrar herramienta";
        formularioHerramienta.querySelector("button[type=submit]").textContent = "Guardar herramienta";
        categoria = "herramienta";
        const botones = document.querySelectorAll("#filtros-categoria button");
        for (let i = 0; i < botones.length; i++) {
            botones[i].setAttribute("aria-pressed", String(botones[i].dataset.valor === categoria));
        }
        await cargar();
    } catch (error) {
        msgHerramienta.textContent = error.message;
    }
});

document.getElementById("cancelar-herramienta").addEventListener("click", function () { dialogoHerramienta.close(); });

function editarHerramienta(herramienta) {
    herramientaEditando = herramienta;
    msgHerramienta.textContent = "";
    document.getElementById("titulo-herramienta").textContent = "Editar herramienta";
    document.getElementById("herramienta-nombre").value = herramienta.nombre || "";
    document.getElementById("herramienta-tipo").value = herramienta.tipo || "";
    document.getElementById("herramienta-cantidad").value = herramienta.cantidad == null ? 1 : herramienta.cantidad;
    document.getElementById("herramienta-estado").value = herramienta.estado || "Disponible";
    document.getElementById("herramienta-fecha").value = herramienta.fechaAdquisicion || "";
    formularioHerramienta.querySelector("button[type=submit]").textContent = "Guardar cambios";
    dialogoHerramienta.showModal();
}

async function eliminarHerramienta(herramienta) {
    if (!confirm(`¿Eliminar completamente la herramienta “${herramienta.nombre}”?`)) return;
    await eliminarRegistro(`${API_HERRAMIENTAS}/${herramienta.id}`, "la herramienta");
}

async function eliminarLote(lote) {
    const nombre = lote.nombreInsumo || "este lote";
    if (!confirm(`¿Eliminar completamente “${nombre}” de inventario?`)) return;
    await eliminarRegistro(`${API_INVENTARIO}/${lote.idInventario}`, "el lote");
}

async function eliminarRegistro(url, nombre) {
    mensaje.textContent = "";
    try {
        const respuesta = await fetch(url, { method: "DELETE" });
        if (!respuesta.ok) {
            const textoError = `No se pudo eliminar ${nombre}. Si tiene movimientos registrados, conserva ese historial y no se puede borrar directamente.`;
            throw new Error(await mensajeError(respuesta, textoError));
        }
        await cargar();
    } catch (error) {
        mensaje.textContent = error.message || `No se pudo eliminar ${nombre}.`;
    }
}

function abrirMovimiento(lote) {
    loteMovimiento = lote;
    msgMovimiento.textContent = "";
    formularioMovimiento.reset();
    document.getElementById("tipo-movimiento").value = "salida";
    const insumo = buscarInsumo(lote.idInsumo);
    const nombre = lote.nombreInsumo || (insumo ? insumo.nombre : "Abono");
    const unidad = lote.unidadMedida || (insumo ? insumo.unidadMedida : "");
    document.getElementById("lote-movimiento").textContent = `${nombre} · Disponible: ${fmtNum(lote.cantidad)} ${unidad}`;
    document.querySelector("#formulario-movimiento-inventario button[type=submit]").disabled = !usuarios.length;
    dialogoMovimiento.showModal();
}

formularioMovimiento.addEventListener("submit", async function (evento) {
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
            throw new Error(await mensajeError(respuesta, "No se pudo registrar el movimiento."));
        }
        dialogoMovimiento.close();
        await cargar();
    } catch (error) {
        msgMovimiento.textContent = error.message;
    }
});

document.getElementById("cancelar-movimiento-inventario").addEventListener("click", function () { dialogoMovimiento.close(); });
buscador.addEventListener("input", dibujar);
cargar();
