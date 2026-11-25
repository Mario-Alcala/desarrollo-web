/**
 * @file Consulta y registra terrenos y muestra sus parcelas y cultivos.
 *
 * @author Equipo de Gestión de Cultivos
 */

const API_TERRENOS = "http://localhost:8081/api/terrenos";

const lista = document.getElementById("lista-terrenos");
const mensaje = document.getElementById("mensaje-terrenos");
const buscador = document.getElementById("buscar-terreno");
const dialogo = document.getElementById("dialogo-terreno");
const formulario = document.getElementById("formulario-terreno");
const mensajeFormulario = document.getElementById("mensaje-formulario");

let terrenos = [];

/**
 * Consulta los terrenos y las parcelas de cada terreno.
 */
async function cargarTerrenos() {
    mensaje.textContent = "Cargando terrenos y parcelas…";
    try {
        const respuesta = await fetch(API_TERRENOS);
        if (!respuesta.ok) throw new Error("Error " + respuesta.status);
        terrenos = await respuesta.json();
        for (let i = 0; i < terrenos.length; i++) {
            const r = await fetch(`http://localhost:8081/api/parcelas/terreno/${encodeURIComponent(terrenos[i].id)}`);
            if (!r.ok) throw new Error("No se pudieron cargar las parcelas");
            terrenos[i].parcelas = await r.json();
        }
    } catch (error) {
        terrenos = [];
        mensaje.textContent = "No se pudieron cargar los terrenos y sus parcelas desde el API.";
    }
    dibujar();
}

/**
 * Registra un terreno y actualiza la lista.
 *
 * @param evento - El evento del formulario.
 */
async function guardarTerreno(evento) {
    evento.preventDefault();
    mensajeFormulario.textContent = "";

    const datos = {
        nombre: document.getElementById("t-nombre").value.trim(),
        ubicacion: document.getElementById("t-ubicacion").value.trim(),
        superficieHa: Number(document.getElementById("t-superficie").value) / 10000,
        latitud: document.getElementById("t-latitud").value === "" ? null : Number(document.getElementById("t-latitud").value),
        longitud: document.getElementById("t-longitud").value === "" ? null : Number(document.getElementById("t-longitud").value),
        estado: document.getElementById("t-estado").value
    };

    if ((datos.latitud === null) !== (datos.longitud === null)) {
        mensajeFormulario.textContent = "Ingresa latitud y longitud juntas, o deja ambas vacías.";
        return;
    }

    try {
        const respuesta = await fetch(API_TERRENOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        if (!respuesta.ok) {
            let mensajeError = "El servidor no pudo guardar el terreno.";
            try {
                const error = await respuesta.json();
                mensajeError = error.mensaje || mensajeError;
            } catch (noEsJson) {
                mensajeError = "El servidor no pudo guardar el terreno.";
            }
            throw new Error(mensajeError);
        }
        dialogo.close();
        formulario.reset();
        await cargarTerrenos();
    } catch (error) {
        mensajeFormulario.textContent = error.message;
    }
}

/**
 * Crea un elemento HTML.
 *
 * @param etiqueta - Nombre de la etiqueta HTML.
 * @param [texto] - Contenido visible del elemento.
 * @param [clase] - Clase CSS que se asigna al elemento.
 */
function crear(etiqueta, texto, clase) {
    const el = document.createElement(etiqueta);
    if (texto !== undefined) el.textContent = texto;
    if (clase) el.className = clase;
    return el;
}

/**
 * Convierte una superficie de hectáreas a metros cuadrados.
 *
 * @param ha - La superficie en hectáreas.
 */
function m2(ha) {
    return ha == null ? "—" : Math.round(ha * 10000).toLocaleString("es-MX") + " m²";
}

/**
 * Muestra los terrenos que coinciden con el texto buscado.
 */
function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const visibles = [];
    for (let i = 0; i < terrenos.length; i++) {
        const terreno = terrenos[i];
        let coincide = !q || String(terreno.nombre || "").toLowerCase().includes(q)
            || String(terreno.ubicacion || "").toLowerCase().includes(q);
        for (let j = 0; !coincide && j < terreno.parcelas.length; j++) {
            if (String(terreno.parcelas[j].cultivoNombre || "").toLowerCase().includes(q)) {
                coincide = true;
            }
        }
        if (coincide) visibles.push(terreno);
    }

    lista.replaceChildren();
    for (let i = 0; i < visibles.length; i++) {
        const t = visibles[i];
        const tarjeta = crear("article", undefined, "tarjeta-terreno");

        const vista = crear("div", "Terreno registrado", "vista");

        const chips = crear("div", undefined, "chips");
        const pie = crear("div", undefined, "pie-tarjeta");
        let activos = 0;
        for (let j = 0; j < t.parcelas.length; j++) {
            if (t.parcelas[j].idCultivo != null) activos++;
        }
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
    }

    if (!visibles.length) {
        if (!mensaje.textContent.startsWith("No se pudieron")) mensaje.textContent = "No hay terrenos para mostrar.";
    } else {
        mensaje.textContent = "";
    }
}

/**
 * Conecta los controles de la página y ejecuta la carga inicial.
 */
function iniciarTerrenos() {
    document.getElementById("agregar-terreno").addEventListener("click", function () {
        mensajeFormulario.textContent = "";
        dialogo.showModal();
    });
    document.getElementById("cancelar-terreno").addEventListener("click", function () { dialogo.close(); });
    formulario.addEventListener("submit", guardarTerreno);
    buscador.addEventListener("input", dibujar);

    const parametros = new URLSearchParams(location.search);
    const busquedaInicial = parametros.get("q");
    if (busquedaInicial) buscador.value = busquedaInicial;

    cargarTerrenos();
}

iniciarTerrenos();
