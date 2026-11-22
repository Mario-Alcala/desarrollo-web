/*
 * USA DEL BACKEND: GET y POST http://localhost:8081/api/terrenos
 *   (TerrenoController y TerrenoRepository). corre en 8081.
 * LE FALTA: editar y eliminar terrenos (PUT y DELETE existen en la API, pero no hay botones);
 *   validaciones más completas; que las fichas muestren parcelas y cultivos reales.
 * AÑADIDO POR BACKEND INCOMPLETO:
 *   - Si la API falla o devuelve una lista vacía, se muestran los datos de terrenos-datos.js.
 *   - Conversión de hectáreas a m², porque la API usa superficieHa y el diseño muestra m².
 * PROBLEMA CONOCIDO DEL BACKEND: el POST falla porque TerrenoRepository inserta superficie_ha,
 *   tipo_suelo, latitud y longitud, pero la tabla terrenos tiene superficie_m2 y un estado
 *   limitado a disponible/ocupado. Hay que alinear el Java con init.sql (o al revés).
 */

const API_TERRENOS = "http://localhost:8081/api/terrenos";

const lista = document.getElementById("lista-terrenos");
const mensaje = document.getElementById("mensaje-terrenos");
const buscador = document.getElementById("buscar-terreno");
const dialogo = document.getElementById("dialogo-terreno");
const formulario = document.getElementById("formulario-terreno");
const mensajeFormulario = document.getElementById("mensaje-formulario");

let terrenos = [];
let usandoEjemplo = false;

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
        (t.parcelas || []).some(p => p.cultivo && p.cultivo.nombre.toLowerCase().includes(q))
    );

    lista.replaceChildren();
    visibles.forEach(t => {
        const tarjeta = crear("article", undefined, "tarjeta-terreno");

        const vista = crear("div", "Vista general del terreno · Ejemplo", "vista");

        const chips = crear("div", undefined, "chips");
        const pie = crear("div", undefined, "pie-tarjeta");
        if (t.parcelas) {
            const activos = t.parcelas.filter(p => p.cultivo);
            chips.append(
                crear("span", `${t.parcelas.length} parcelas`, "chip"),
                crear("span", `${activos.length} ${activos.length === 1 ? "cultivo activo" : "cultivos activos"}`, "chip")
            );
            pie.append(crear("span", activos.map(p => p.cultivo.nombre).join(" · ") || "Sin cultivos activos"));
        } else {
            chips.append(crear("span", t.estado, "chip"), crear("span", t.tipoSuelo || "—", "chip"));
            pie.append(crear("span", ""));
        }

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
        mensaje.textContent = "No hay terrenos para mostrar.";
    } else if (usandoEjemplo) {
        mensaje.textContent = "Mostrando datos de ejemplo: no hay conexión con la API.";
    } else {
        mensaje.textContent = "";
    }
}

async function cargarTerrenos() {
    try {
        const respuesta = await fetch(API_TERRENOS);
        if (!respuesta.ok) throw new Error("Error " + respuesta.status);
        terrenos = await respuesta.json();
        usandoEjemplo = false;
        if (!terrenos.length) {
            terrenos = TERRENOS_EJEMPLO;
            usandoEjemplo = true;
        }
    } catch (error) {
        terrenos = TERRENOS_EJEMPLO;
        usandoEjemplo = true;
    }
    dibujar();
}

async function guardarTerreno(evento) {
    evento.preventDefault();
    mensajeFormulario.textContent = "";

    const datos = {
        nombre: document.getElementById("t-nombre").value.trim(),
        ubicacion: document.getElementById("t-ubicacion").value.trim(),
        superficieHa: Number(document.getElementById("t-superficie").value),
        tipoSuelo: document.getElementById("t-suelo").value.trim(),
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
