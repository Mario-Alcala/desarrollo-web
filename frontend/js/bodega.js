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
    const [a, m, d] = String(fecha).slice(0, 10).split("-").map(Number);
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
        [cosechas, cultivos, usuarios] = await Promise.all([
            pedir("/cosechas"), pedir("/cultivos"), pedir("/usuarios")
        ]);
        usuarios = usuarios.filter(u => u.rol !== "cliente");
        selectorCultivo.replaceChildren(...cultivos.map(c => {
            const o = crear("option", c.nombre);
            o.value = String(c.id);
            return o;
        }));
        selectorUsuario.replaceChildren(...usuarios.map(u => {
            const o = crear("option", u.nombreUsuario);
            o.value = String(u.idUsuario);
            return o;
        }));
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
    const visibles = cosechas.filter(l => {
        const nombre = l.nombreCultivo || cultivos.find(c => c.id === l.idCultivo)?.nombre || "";
        return (!q || `${nombre} ${l.ubicacionBodega || ""} ${l.estadoMaduracion || ""}`.toLowerCase().includes(q)) &&
            (!madura || l.estadoMaduracion === madura);
    });
    cuerpo.replaceChildren(...visibles.map(l => {
        const nombre = l.nombreCultivo || cultivos.find(c => c.id === l.idCultivo)?.nombre || "Cultivo";
        const fila = crear("tr");
        fila.append(
            crear("td", `${nombre} · Lote #${l.idCosecha}`),
            crear("td", fmtFecha(l.fechaCosecha)),
            crear("td", `${fmtNum(l.cantidadCosechada)} kg`),
            crear("td", `${fmtNum(l.cantidadDisponible || 0)} kg`),
            crear("td", capitalizar(l.estadoMaduracion || "Sin clasificar"))
        );
        return fila;
    }));
    if (visibles.length) mensaje.textContent = `${visibles.length} lotes empacados · disponible para asignar a pedidos`;
    else if (!mensaje.textContent.startsWith("No se pudieron")) mensaje.textContent = "No hay lotes de cosecha para mostrar.";
}

document.getElementById("registrar-cosecha").addEventListener("click", () => {
    msgFormulario.textContent = "";
    formulario.reset();
    document.getElementById("co-fecha").value = new Date().toISOString().slice(0, 10);
    dialogo.showModal();
});

formulario.addEventListener("submit", async evento => {
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
            const error = await respuesta.json().catch(() => ({}));
            throw new Error(error.mensaje || "No se pudo registrar el lote de cosecha.");
        }
        dialogo.close();
        await cargar();
    } catch (error) {
        msgFormulario.textContent = error.message;
    }
});

document.getElementById("cancelar-cosecha").addEventListener("click", () => dialogo.close());
buscador.addEventListener("input", dibujar);
filtroMaduracion.addEventListener("change", dibujar);
cargar();
