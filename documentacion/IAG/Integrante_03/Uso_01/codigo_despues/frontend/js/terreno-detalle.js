/*
 * USA DEL BACKEND: GET http://localhost:8081/api/terrenos/{id} (datos básicos del terreno).
 *   Clima: API pública Open-Meteo (necesita internet y la latitud y longitud del terreno).
 * LE FALTA: botón "Editar terreno"; pestaña Cosechas con lotes reales; mostrar riegos,
 *   incidencias y seguimientos como en el diseño final.
 * AÑADIDO POR BACKEND INCOMPLETO:
 *   - Las parcelas, la bitácora y las cosechas no existen en la API: salen de terrenos-datos.js.
 *   - Si la API no responde, todo el terreno sale de los datos de ejemplo.
 *   - Conversión de hectáreas a m².
 */

const API = "http://localhost:8081/api/terrenos";
const idTerreno = new URLSearchParams(location.search).get("id");

let terreno = null;
let parcelaActual = null;
let pestana = "bitacora";

function crear(etiqueta, texto, clase) {
    const el = document.createElement(etiqueta);
    if (texto !== undefined) el.textContent = texto;
    if (clase) el.className = clase;
    return el;
}

function m2(ha) {
    return ha == null ? "—" : Math.round(ha * 10000).toLocaleString("es-MX") + " m²";
}

async function cargarTerreno() {
    const ejemplo = TERRENOS_EJEMPLO.find(t => String(t.id) === String(idTerreno));
    let real = null;
    try {
        const r = await fetch(`${API}/${encodeURIComponent(idTerreno)}`);
        if (r.ok) real = await r.json();
    } catch (e) { /* se usa el ejemplo */ }

    // Las parcelas aún no existen en la API: siempre vienen del ejemplo.
    terreno = real ? { ...real, parcelas: ejemplo ? ejemplo.parcelas : [] } : ejemplo;
    document.getElementById("mensaje-detalle").textContent = real
        ? "Las parcelas, la bitácora y las cosechas son de ejemplo hasta que el backend las incluya."
        : "Mostrando datos de ejemplo: no hay conexión con la API.";

    if (!terreno) {
        document.getElementById("nombre-terreno").textContent = "Terreno no encontrado";
        document.getElementById("miga-terreno").textContent = "No encontrado";
        return;
    }
    dibujarTerreno();
}

function dibujarTerreno() {
    document.getElementById("miga-terreno").textContent = terreno.nombre;
    document.getElementById("nombre-terreno").textContent = terreno.nombre;
    document.getElementById("datos-terreno").textContent =
        `${terreno.ubicacion} · Superficie total: ${m2(terreno.superficieHa)}`;

    const ocupadas = terreno.parcelas.filter(p => p.cultivo).length;
    const disponibles = terreno.parcelas.length - ocupadas;
    document.getElementById("resumen-terreno").replaceChildren(
        crear("span", `${terreno.parcelas.length} parcelas`, "chip"),
        crear("span", `${ocupadas} ${ocupadas === 1 ? "ocupada" : "ocupadas"}`, "chip"),
        crear("span", `${disponibles} ${disponibles === 1 ? "disponible" : "disponibles"}`, "chip")
    );

    document.getElementById("clima-lugar").textContent = terreno.ubicacion;
    dibujarParcelas();
    cargarClima();
}

function dibujarParcelas() {
    const cont = document.getElementById("lista-parcelas");
    cont.replaceChildren();
    terreno.parcelas.forEach(p => {
        const ocupada = !!p.cultivo;
        const boton = crear("button", undefined, "parcela" + (p === parcelaActual ? " seleccionada" : ""));
        boton.type = "button";

        const fila = crear("div", undefined, "fila");
        fila.append(
            crear("strong", `${p.clave} · ${p.superficieM2} m²`),
            crear("span", ocupada ? "Ocupada" : "Disponible", "insignia" + (ocupada ? " activa" : ""))
        );
        boton.append(fila, crear("small", ocupada ? `${p.cultivo.nombre} · ${p.cultivo.etapa}` : "Sin cultivo activo"));

        boton.addEventListener("click", () => {
            parcelaActual = p;
            pestana = "bitacora";
            dibujarParcelas();
            dibujarPanelParcela();
        });
        cont.append(boton);
    });
}

function dibujarPanelParcela() {
    const p = parcelaActual;
    const pestanas = document.getElementById("pestanas-parcela");
    const contenido = document.getElementById("contenido-parcela");
    pestanas.hidden = false;
    pestanas.querySelectorAll("button").forEach(b =>
        b.classList.toggle("activa", b.dataset.tab === pestana));

    document.getElementById("titulo-parcela").textContent =
        p.cultivo ? `${p.clave} · ${p.cultivo.nombre}` : p.clave;

    const insignia = document.getElementById("insignia-parcela");
    insignia.textContent = p.cultivo ? "Cultivo activo" : "";
    insignia.className = p.cultivo ? "insignia activa" : "";

    document.getElementById("info-parcela").textContent = p.cultivo
        ? `${p.superficieM2} m² · Etapa: ${p.cultivo.etapa} · Ciclo activo`
        : `${p.superficieM2} m² · Sin cultivo activo`;

    contenido.replaceChildren();

    if (pestana === "resumen") {
        contenido.append(crear("p", p.cultivo
            ? `Cultivo: ${p.cultivo.nombre}. Etapa fenológica: ${p.cultivo.etapa}.`
            : "Esta parcela está disponible para sembrar.", "nota"));
        return;
    }
    if (pestana === "cosechas") {
        contenido.append(crear("p", "Las cosechas se consultan por lote. Aún no hay lotes registrados.", "nota"));
        return;
    }
    if (!p.bitacora.length) {
        contenido.append(crear("p", "Sin registros en la bitácora.", "nota"));
        return;
    }
    p.bitacora.forEach(b => {
        const fila = crear("div", undefined, "registro");
        const texto = crear("div");
        texto.append(crear("strong", b.titulo), crear("p", b.detalle));
        fila.append(crear("span", b.fecha, "fecha-registro"), texto, crear("span", b.tipo, "tipo"));
        contenido.append(fila);
    });
}

// Clima con Open-Meteo (gratis, sin clave). Necesita latitud y longitud del terreno.
async function cargarClima() {
    const detalle = document.getElementById("clima-detalle");
    const temp = document.getElementById("clima-temp");
    if (terreno.latitud == null || terreno.longitud == null) {
        detalle.textContent = "Este terreno no tiene coordenadas registradas.";
        return;
    }
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${terreno.latitud}&longitude=${terreno.longitud}&current=temperature_2m,precipitation&timezone=auto`;
        const d = await (await fetch(url)).json();
        temp.textContent = `${Math.round(d.current.temperature_2m)} °C`;
        detalle.textContent = `Precipitación actual: ${d.current.precipitation} mm`;
    } catch (e) {
        detalle.textContent = "No se pudo consultar el clima.";
    }
}

document.getElementById("pestanas-parcela").addEventListener("click", e => {
    if (e.target.dataset.tab && parcelaActual) {
        pestana = e.target.dataset.tab;
        dibujarPanelParcela();
    }
});

cargarTerreno();
