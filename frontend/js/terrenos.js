/*
 * USA DEL BACKEND: GET y POST http://localhost:8081/api/terrenos
 *   (TerrenoController y TerrenoRepository). corre en 8081.
 * Las fichas cargan los terrenos y el conteo de parcelas desde el API REST.
 */

const API_TERRENOS = "http://localhost:8081/api/terrenos";

const lista = document.getElementById("lista-terrenos");
const mensaje = document.getElementById("mensaje-terrenos");
const buscador = document.getElementById("buscar-terreno");
const dialogo = document.getElementById("dialogo-terreno");
const formulario = document.getElementById("formulario-terreno");
const mensajeFormulario = document.getElementById("mensaje-formulario");

let terrenos = [];

function crear(etiqueta, texto, clase) {
    const el = document.createElement(etiqueta);
    if (texto !== undefined) el.textContent = texto;
    if (clase) el.className = clase;
    return el;
}

function m2(ha) {
    return ha == null ? "—" : Math.round(ha * 10000).toLocaleString("es-MX") + " m²";
}

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const visibles = terrenos.filter(t =>
        !q ||
        String(t.nombre).toLowerCase().includes(q) ||
        String(t.ubicacion).toLowerCase().includes(q) ||
        (t.parcelas || []).some(p => String(p.cultivoNombre || "").toLowerCase().includes(q))
    );

    lista.replaceChildren();
    visibles.forEach(t => {
        const tarjeta = crear("article", undefined, "tarjeta-terreno");

        const vista = crear("div", "Terreno registrado", "vista");

        const chips = crear("div", undefined, "chips");
        const pie = crear("div", undefined, "pie-tarjeta");
        const activos = t.parcelas.filter(p => p.idCultivo != null).length;
        chips.append(
            crear("span", `${t.parcelas.length} ${t.parcelas.length === 1 ? "parcela" : "parcelas"}`, "chip"),
            crear("span", `${activos} ${activos === 1 ? "cultivo" : "cultivos"}`, "chip")
        );
        pie.append(crear("span", t.estado ? t.estado.charAt(0).toUpperCase() + t.estado.slice(1) : ""));

        const enlace = crear("a", "Ver terreno →", "ver-terreno");
        enlace.href = "terreno-detalle.html?id=" + encodeURIComponent(t.id);
        pie.append(enlace);

        const cuerpo = crear("div", undefined, "cuerpo");
        cuerpo.append(
            crear("h3", t.nombre),
            crear("p", `${t.ubicacion} · ${m2(t.superficieHa)}`, "datos"),
            chips,
            pie
        );

        tarjeta.append(vista, cuerpo);
        lista.append(tarjeta);
    });

    if (!visibles.length) {
        if (!mensaje.textContent.startsWith("No se pudieron")) mensaje.textContent = "No hay terrenos para mostrar.";
    } else {
        mensaje.textContent = "";
    }
}

async function cargarTerrenos() {
    mensaje.textContent = "Cargando terrenos y parcelas…";
    try {
        const respuesta = await fetch(API_TERRENOS);
        if (!respuesta.ok) throw new Error("Error " + respuesta.status);
        terrenos = await respuesta.json();
        terrenos = await Promise.all(terrenos.map(async terreno => {
            const r = await fetch(`http://localhost:8081/api/parcelas/terreno/${encodeURIComponent(terreno.id)}`);
            if (!r.ok) throw new Error("No se pudieron cargar las parcelas");
            return { ...terreno, parcelas: await r.json() };
        }));
    } catch (error) {
        terrenos = [];
        mensaje.textContent = "No se pudieron cargar los terrenos y sus parcelas desde el API.";
    }
    dibujar();
}

async function guardarTerreno(evento) {
    evento.preventDefault();
    mensajeFormulario.textContent = "";

    const datos = {
        nombre: document.getElementById("t-nombre").value.trim(),
        ubicacion: document.getElementById("t-ubicacion").value.trim(),
        superficieHa: Number(document.getElementById("t-superficie").value) / 10000,
        estado: document.getElementById("t-estado").value
    };

    try {
        const respuesta = await fetch(API_TERRENOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));
            throw new Error(error.mensaje || "El servidor no pudo guardar el terreno.");
        }
        dialogo.close();
        formulario.reset();
        await cargarTerrenos();
    } catch (error) {
        mensajeFormulario.textContent = error.message;
    }
}

document.getElementById("agregar-terreno").addEventListener("click", () => {
    mensajeFormulario.textContent = "";
    dialogo.showModal();
});
document.getElementById("cancelar-terreno").addEventListener("click", () => dialogo.close());
formulario.addEventListener("submit", guardarTerreno);
buscador.addEventListener("input", dibujar);

const busquedaInicial = new URLSearchParams(location.search).get("q");
if (busquedaInicial) buscador.value = busquedaInicial;

cargarTerrenos();
