const API = "http://localhost:8081/api";
const cuerpo = document.getElementById("tabla-cuerpo");
const mensaje = document.getElementById("mensaje-bodega");
const buscador = document.querySelector("#topbar input");
const filtroMaduracion = document.getElementById("filtro-maduracion");
const dialogo = document.getElementById("dialogo-cosecha");
const formulario = document.getElementById("formulario-cosecha");
const msgFormulario = document.getElementById("mensaje-cosecha");
const selectorCultivo = document.getElementById("co-cultivo");
const selectorUsuario = document.getElementById("co-usuario");
let cosechas = [];
let cultivos = [];
let usuarios = [];

function fmtFecha(fecha) {
    if (!fecha) return "—";
    const partes = String(fecha).slice(0, 10).split("-");
    const a = Number(partes[0]);
    const m = Number(partes[1]);
    const d = Number(partes[2]);
    return new Date(a, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

async function pedir(ruta) {
    const respuesta = await fetch(`${API}${ruta}`);
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status} al consultar ${ruta}`);
    return respuesta.json();
}

async function cargar() {
    mensaje.textContent = "Cargando lotes de cosecha…";
    try {
        cosechas = await pedir("/cosechas");
        cultivos = await pedir("/cultivos");
        const todosUsuarios = await pedir("/usuarios");
        usuarios = [];
        for (let i = 0; i < todosUsuarios.length; i++) {
            if (todosUsuarios[i].rol !== "cliente") usuarios.push(todosUsuarios[i]);
        }

        selectorCultivo.replaceChildren();
        for (let i = 0; i < cultivos.length; i++) {
            const opcion = crear("option", cultivos[i].nombre);
            opcion.value = String(cultivos[i].id);
            selectorCultivo.append(opcion);
        }

        selectorUsuario.replaceChildren();
        for (let i = 0; i < usuarios.length; i++) {
            const opcion = crear("option", usuarios[i].nombreUsuario);
            opcion.value = String(usuarios[i].idUsuario);
            selectorUsuario.append(opcion);
        }
        document.querySelector("#formulario-cosecha button[type=submit]").disabled = !cultivos.length || !usuarios.length;
        dibujar();
    } catch (error) {
        cosechas = [];
        dibujar();
        mensaje.textContent = "No se pudieron cargar las cosechas desde el API.";
    }
}

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const madura = filtroMaduracion.value;
    const visibles = [];
    for (let i = 0; i < cosechas.length; i++) {
        const lote = cosechas[i];
        const nombreCultivo = obtenerNombreCultivo(lote.idCultivo);
        const nombre = lote.nombreCultivo || nombreCultivo;
        const coincideTexto = !q || `${nombre} ${lote.ubicacionBodega || ""} ${lote.estadoMaduracion || ""}`.toLowerCase().includes(q);
        const coincideMaduracion = !madura || lote.estadoMaduracion === madura;
        if (coincideTexto && coincideMaduracion) visibles.push(lote);
    }

    cuerpo.replaceChildren();
    for (let i = 0; i < visibles.length; i++) {
        const lote = visibles[i];
        const nombre = lote.nombreCultivo || obtenerNombreCultivo(lote.idCultivo) || "Cultivo";
        const fila = crear("tr");
        fila.append(
            crear("td", `${nombre} · Lote #${lote.idCosecha}`),
            crear("td", fmtFecha(lote.fechaCosecha)),
            crear("td", `${fmtNum(lote.cantidadCosechada)} kg`),
            crear("td", `${fmtNum(lote.cantidadDisponible || 0)} kg`),
            crear("td", capitalizar(lote.estadoMaduracion || "Sin clasificar"))
        );
        cuerpo.append(fila);
    }
    if (visibles.length) mensaje.textContent = `${visibles.length} lotes empacados · disponible para asignar a pedidos`;
    else if (!mensaje.textContent.startsWith("No se pudieron")) mensaje.textContent = "No hay lotes de cosecha para mostrar.";
}

function obtenerNombreCultivo(idCultivo) {
    for (let i = 0; i < cultivos.length; i++) {
        if (cultivos[i].id === idCultivo) return cultivos[i].nombre;
    }
    return "";
}

document.getElementById("registrar-cosecha").addEventListener("click", function () {
    msgFormulario.textContent = "";
    formulario.reset();
    document.getElementById("co-fecha").value = new Date().toISOString().slice(0, 10);
    dialogo.showModal();
});

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    msgFormulario.textContent = "";
    const kg = Number(document.getElementById("co-empacado").value);
    if (!(kg > 0)) {
        msgFormulario.textContent = "Los kilos empacados deben ser mayores que cero.";
        return;
    }
    const datos = {
        idCultivo: Number(selectorCultivo.value),
        idUsuario: Number(selectorUsuario.value),
        fechaCosecha: document.getElementById("co-fecha").value,
        cantidadCosechada: kg,
        cantidadDisponible: kg,
        estadoMaduracion: document.getElementById("co-maduracion").value
    };
    try {
        const respuesta = await fetch(`${API}/cosechas`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos)
        });
        if (!respuesta.ok) {
            let mensajeError = "No se pudo registrar el lote de cosecha.";
            try {
                const error = await respuesta.json();
                mensajeError = error.mensaje || mensajeError;
            } catch (noEsJson) {
                mensajeError = "No se pudo registrar el lote de cosecha.";
            }
            throw new Error(mensajeError);
        }
        dialogo.close();
        await cargar();
    } catch (error) {
        msgFormulario.textContent = error.message;
    }
});

document.getElementById("cancelar-cosecha").addEventListener("click", function () { dialogo.close(); });
buscador.addEventListener("input", dibujar);
filtroMaduracion.addEventListener("change", dibujar);
cargar();
