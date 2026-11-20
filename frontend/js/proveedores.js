/*
 * ARCHIVO: js/proveedores.js
 * CAPA: FRONTEND (lógica). ¿ES CASCARÓN? NO: alterna pestañas, filtra, valida y maneja formularios.
 * QUÉ USA DEL BACKEND: nada todavía; lee PROVEEDORES e INSUMOS de js/admin-datos.js.
 * REGLA DEL DOCUMENTO: semilla, abono y fertilizante son categorías de una sola tabla (insumos).
 * LE FALTA: GET, POST y PUT contra la API; desactivar proveedores; mostrar existencias por insumo.
 * AÑADIDO POR BACKEND INCOMPLETO: los cambios viven solo en memoria (se pierden al recargar).
 */

const buscador = document.querySelector("#topbar input");
const mensaje = document.getElementById("mensaje-prov");
const cabecera = document.getElementById("tabla-cabecera");
const cuerpo = document.getElementById("tabla-cuerpo");
const filtrosCategoria = document.getElementById("filtros-categoria");
const botonAgregar = document.getElementById("agregar");

const dlgProveedor = document.getElementById("dialogo-proveedor");
const formProveedor = document.getElementById("formulario-proveedor");
const msgProveedor = document.getElementById("mensaje-proveedor");
const dlgInsumo = document.getElementById("dialogo-insumo");
const formInsumo = document.getElementById("formulario-insumo");
const msgInsumo = document.getElementById("mensaje-insumo");

let vista = "proveedores";
let categoriaActiva = "todos";
let editandoProveedor = null;
let editandoInsumo = null;

function texto(id) {
    return document.getElementById(id).value.trim();
}

function coincide(q, campos) {
    return !q || campos.some(c => String(c || "").toLowerCase().includes(q));
}

function dibujarTabla(columnas, filas) {
    cabecera.replaceChildren(...columnas.map(c => crear("th", c)));
    cuerpo.replaceChildren(...filas.map(celdas => {
        const tr = crear("tr");
        celdas.forEach(c => {
            const td = crear("td");
            td.append(c);
            tr.append(td);
        });
        return tr;
    }));
}

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    let total;

    if (vista === "proveedores") {
        const filas = PROVEEDORES
            .filter(p => coincide(q, [p.nombreEmpresa, p.contacto, p.email, p.direccion]))
            .map(p => [
                p.nombreEmpresa, p.contacto || "—", p.telefono || "—", p.email || "—", p.direccion || "—",
                crearBoton("Editar", "boton boton-secundario boton-chico", () => abrirProveedor(p))
            ]);
        dibujarTabla(["Empresa", "Contacto", "Teléfono", "Correo", "Dirección", "Acciones"], filas);
        total = filas.length;
    } else {
        const filas = INSUMOS
            .filter(i => (categoriaActiva === "todos" || i.categoria === categoriaActiva) &&
                         coincide(q, [i.nombre, i.varTipo, i.categoria]))
            .map(i => [
                i.nombre,
                etiqueta(capitalizar(i.categoria), i.categoria === "semilla" ? "ok" : i.categoria === "abono" ? "aviso" : ""),
                i.varTipo || "—",
                i.unidad,
                i.activo ? etiqueta("Activo", "ok") : etiqueta("Inactivo"),
                crearBoton("Editar", "boton boton-secundario boton-chico", () => abrirInsumo(i))
            ]);
        dibujarTabla(["Nombre", "Categoría", "Variedad o tipo", "Unidad", "Estado", "Acciones"], filas);
        total = filas.length;
    }

    if (!total) mensaje.textContent = "No hay registros para mostrar.";
    else if (mensaje.textContent === "No hay registros para mostrar.") mensaje.textContent = "";
}

/* ---------- Proveedores ---------- */
function abrirProveedor(p) {
    editandoProveedor = p ? p.id : null;
    document.getElementById("titulo-proveedor").textContent = p ? "Editar proveedor" : "Agregar proveedor";
    msgProveedor.textContent = "";
    formProveedor.reset();
    if (p) {
        document.getElementById("pv-empresa").value = p.nombreEmpresa;
        document.getElementById("pv-contacto").value = p.contacto;
        document.getElementById("pv-telefono").value = p.telefono;
        document.getElementById("pv-email").value = p.email;
        document.getElementById("pv-direccion").value = p.direccion;
    }
    dlgProveedor.showModal();
}

formProveedor.addEventListener("submit", e => {
    e.preventDefault();
    msgProveedor.textContent = "";
    const datos = {
        nombreEmpresa: texto("pv-empresa"),
        contacto: texto("pv-contacto"),
        telefono: texto("pv-telefono"),
        email: texto("pv-email"),
        direccion: texto("pv-direccion")
    };
    if (datos.telefono && !/^[0-9+\s-]{7,15}$/.test(datos.telefono)) {
        msgProveedor.textContent = "El teléfono solo puede llevar números, espacios, + o guiones (7 a 15 caracteres).";
        return;
    }
    if (editandoProveedor === null) {
        datos.id = Math.max(0, ...PROVEEDORES.map(p => p.id)) + 1;
        PROVEEDORES.push(datos);
    } else {
        Object.assign(PROVEEDORES.find(p => p.id === editandoProveedor), datos);
    }
    dlgProveedor.close();
    mensaje.textContent = MENSAJE_SESION;
    dibujar();
});

/* ---------- Insumos ---------- */
function abrirInsumo(i) {
    editandoInsumo = i ? i.id : null;
    document.getElementById("titulo-insumo").textContent = i ? "Editar insumo" : "Agregar insumo";
    msgInsumo.textContent = "";
    formInsumo.reset();
    if (i) {
        document.getElementById("in-nombre").value = i.nombre;
        document.getElementById("in-categoria").value = i.categoria;
        document.getElementById("in-unidad").value = i.unidad;
        document.getElementById("in-tipo").value = i.varTipo;
        document.getElementById("in-activo").checked = i.activo;
    }
    dlgInsumo.showModal();
}

formInsumo.addEventListener("submit", e => {
    e.preventDefault();
    msgInsumo.textContent = "";
    const datos = {
        nombre: texto("in-nombre"),
        categoria: texto("in-categoria"),
        unidad: texto("in-unidad"),
        varTipo: texto("in-tipo"),
        activo: document.getElementById("in-activo").checked
    };
    if (editandoInsumo === null) {
        datos.id = Math.max(0, ...INSUMOS.map(i => i.id)) + 1;
        INSUMOS.push(datos);
    } else {
        Object.assign(INSUMOS.find(i => i.id === editandoInsumo), datos);
    }
    dlgInsumo.close();
    mensaje.textContent = MENSAJE_SESION;
    dibujar();
});

/* ---------- Eventos generales ---------- */
botonAgregar.addEventListener("click", () => (vista === "proveedores" ? abrirProveedor(null) : abrirInsumo(null)));
document.getElementById("cancelar-proveedor").addEventListener("click", () => dlgProveedor.close());
document.getElementById("cancelar-insumo").addEventListener("click", () => dlgInsumo.close());

iniciarFiltros(document.getElementById("pestanas"), valor => {
    vista = valor;
    filtrosCategoria.hidden = valor !== "insumos";
    botonAgregar.textContent = valor === "insumos" ? "Agregar insumo" : "Agregar proveedor";
    mensaje.textContent = "";
    dibujar();
});
iniciarFiltros(filtrosCategoria, valor => {
    categoriaActiva = valor;
    dibujar();
});
buscador.addEventListener("input", dibujar);

dibujar();