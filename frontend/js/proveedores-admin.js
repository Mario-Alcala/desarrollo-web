const API_PROVEEDORES = "http://localhost:8081/api/proveedores";
const buscador = document.querySelector("#topbar input");
const mensaje = document.getElementById("mensaje-prov");
const cabecera = document.getElementById("tabla-cabecera");
const cuerpo = document.getElementById("tabla-cuerpo");
const dialogo = document.getElementById("dialogo-proveedor");
const formulario = document.getElementById("formulario-proveedor");
const msgFormulario = document.getElementById("mensaje-proveedor");
let proveedores = [];
let editando = null;

async function cargarProveedores() {
    mensaje.textContent = "Cargando proveedores…";
    try {
        const respuesta = await fetch(API_PROVEEDORES);
        if (!respuesta.ok) throw new Error("No se pudo consultar el API de proveedores.");
        proveedores = await respuesta.json();
        dibujar();
    } catch (error) {
        proveedores = [];
        dibujar();
        mensaje.textContent = "No se pudieron cargar los proveedores desde el API. Comprueba que el backend esté conectado.";
    }
}

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const visibles = [];
    for (let i = 0; i < proveedores.length; i++) {
        const proveedor = proveedores[i];
        const texto = `${proveedor.nombreEmpresa || ""} ${proveedor.contacto || ""} ${proveedor.telefono || ""} ${proveedor.email || ""} ${proveedor.direccion || ""}`.toLowerCase();
        if (!q || texto.includes(q)) visibles.push(proveedor);
    }

    cabecera.replaceChildren();
    const nombresColumnas = ["Empresa", "Contacto", "Teléfono", "Correo", "Dirección", "Acciones"];
    for (let i = 0; i < nombresColumnas.length; i++) {
        cabecera.append(crear("th", nombresColumnas[i]));
    }

    cuerpo.replaceChildren();
    for (let i = 0; i < visibles.length; i++) {
        const p = visibles[i];
        const fila = crear("tr");
        fila.append(crear("td", p.nombreEmpresa));
        fila.append(crear("td", p.contacto || "—"));
        fila.append(crear("td", p.telefono || "—"));
        fila.append(crear("td", p.email || "—"));
        fila.append(crear("td", p.direccion || "—"));
        const acciones = crear("td");
        acciones.append(crearBoton("Editar", "boton boton-secundario boton-chico", function () { abrir(p); }));
        fila.append(acciones);
        cuerpo.append(fila);
    }
    if (visibles.length) mensaje.textContent = `${visibles.length} ${visibles.length === 1 ? "proveedor" : "proveedores"}`;
    else if (!mensaje.textContent.startsWith("No se pudieron")) mensaje.textContent = "No hay proveedores para mostrar.";
}

function abrir(p) {
    editando = p ? p.idProveedor : null;
    document.getElementById("titulo-proveedor").textContent = p ? "Editar proveedor" : "Agregar proveedor";
    msgFormulario.textContent = "";
    formulario.reset();
    if (p) {
        document.getElementById("pv-empresa").value = p.nombreEmpresa || "";
        document.getElementById("pv-contacto").value = p.contacto || "";
        document.getElementById("pv-telefono").value = p.telefono || "";
        document.getElementById("pv-email").value = p.email || "";
        document.getElementById("pv-direccion").value = p.direccion || "";
    }
    dialogo.showModal();
}

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    msgFormulario.textContent = "";
    const datos = {
        nombreEmpresa: document.getElementById("pv-empresa").value.trim(),
        contacto: document.getElementById("pv-contacto").value.trim(),
        telefono: document.getElementById("pv-telefono").value.trim(),
        email: document.getElementById("pv-email").value.trim(),
        direccion: document.getElementById("pv-direccion").value.trim()
    };
    try {
        const respuesta = await fetch(editando === null ? API_PROVEEDORES : `${API_PROVEEDORES}/${editando}`, {
            method: editando === null ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        if (!respuesta.ok) {
            let error = {};
            try { error = await respuesta.json(); } catch (noEsJson) { error = {}; }
            throw new Error(error.mensaje || "No se pudo guardar el proveedor.");
        }
        dialogo.close();
        await cargarProveedores();
    } catch (error) {
        msgFormulario.textContent = error.message;
    }
});

document.getElementById("agregar-proveedor").addEventListener("click", function () { abrir(null); });
document.getElementById("cancelar-proveedor").addEventListener("click", function () { dialogo.close(); });
buscador.addEventListener("input", dibujar);
cargarProveedores();
