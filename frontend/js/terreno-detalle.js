const API = "http://localhost:8081/api";
const idTerreno = new URLSearchParams(location.search).get("id");
let terreno = null;
let parcelaActual = null;
let pestana = "bitacora";

function crear(etiqueta, texto, clase) {
    const el = document.createElement(etiqueta);
    if (texto !== undefined && texto !== null) el.textContent = texto;
    if (clase) el.className = clase;
    return el;
}

function capitalizar(texto) {
    const valor = String(texto || "");
    return valor.charAt(0).toUpperCase() + valor.slice(1);
}

function m2(ha) {
    return ha == null ? "—" : Math.round(ha * 10000).toLocaleString("es-MX") + " m²";
}

async function pedir(ruta) {
    const respuesta = await fetch(`${API}${ruta}`);
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
    return respuesta.json();
}

async function cargarTerreno() {
    try {
        const [registro, parcelas, observaciones, riegos, incidencias] = await Promise.all([
            pedir(`/terrenos/${encodeURIComponent(idTerreno)}`),
            pedir(`/parcelas/terreno/${encodeURIComponent(idTerreno)}`),
            pedir("/observaciones-cultivos"), pedir("/riegos"), pedir("/incidencias-cultivo")
        ]);
        terreno = { ...registro, parcelas };
        const registros = [...observaciones, ...riegos, ...incidencias];
        terreno.parcelas = parcelas.map(p => {
            const relacionados = registros.filter(r => String(r.idCultivo) === String(p.idCultivo));
            const bitacora = relacionados.map(r => {
                const esObs = r.fechaObservacion != null;
                const esRiego = r.fechaRiego != null;
                return {
                    fecha: r.fechaObservacion || r.fechaRiego || r.fechaIncidencia,
                    titulo: esObs ? "Observación" : esRiego ? "Riego registrado" : `${capitalizar(r.tipoIncidencia || "Incidencia")}: ${r.nivelGravedad || ""}`,
                    detalle: r.descripcion || r.observaciones || (esRiego ? `${r.cantidadAgua} ${r.unidadMedida || ""} · ${r.metodo || ""}` : ""),
                    tipo: esObs ? "Observación" : esRiego ? "Riego" : "Incidencia"
                };
            }).filter(r => r.fecha).sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
            return {
                ...p,
                clave: p.nombre,
                cultivo: p.idCultivo == null ? null : { id: p.idCultivo, nombre: p.cultivoNombre, etapa: p.etapaFenologica },
                bitacora
            };
        });
        document.getElementById("mensaje-detalle").textContent = "";
        dibujarTerreno();
    } catch (error) {
        document.getElementById("mensaje-detalle").textContent = "No se pudieron cargar el terreno, sus parcelas y la bitácora desde el API.";
        document.getElementById("nombre-terreno").textContent = "Terreno no disponible";
        document.getElementById("miga-terreno").textContent = "Error de conexión";
    }
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
            crear("strong", `${p.clave} · ${Number(p.superficieM2).toLocaleString("es-MX")} m²`),
            crear("span", ocupada ? "Con cultivo" : "Disponible", "insignia" + (ocupada ? " activa" : ""))
        );
        boton.append(fila, crear("small", ocupada ? `${p.cultivo.nombre} · ${p.cultivo.etapa || "Etapa sin registrar"}` : "Sin cultivo"));
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
    pestanas.querySelectorAll("button").forEach(b => b.classList.toggle("activa", b.dataset.tab === pestana));
    document.getElementById("titulo-parcela").textContent = p.cultivo ? `${p.clave} · ${p.cultivo.nombre}` : p.clave;
    const insignia = document.getElementById("insignia-parcela");
    insignia.textContent = p.cultivo ? "Cultivo" : "";
    insignia.className = p.cultivo ? "insignia activa" : "";
    document.getElementById("info-parcela").textContent = p.cultivo
        ? `${Number(p.superficieM2).toLocaleString("es-MX")} m² · Etapa: ${p.cultivo.etapa || "Sin registrar"}`
        : `${Number(p.superficieM2).toLocaleString("es-MX")} m² · Sin cultivo`;
    contenido.replaceChildren();
    if (pestana === "resumen") {
        contenido.append(crear("p", p.cultivo ? `Cultivo: ${p.cultivo.nombre}. Etapa fenológica: ${p.cultivo.etapa || "Sin registrar"}.` : "Esta parcela no tiene un cultivo registrado.", "nota"));
        return;
    }
    if (!p.cultivo) {
        contenido.append(crear("p", "La bitácora aparecerá aquí cuando la parcela tenga un cultivo registrado.", "nota"));
        return;
    }
    if (!p.bitacora.length) {
        contenido.append(crear("p", "Este cultivo aún no tiene registros en la bitácora.", "nota"));
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
    } catch {
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
