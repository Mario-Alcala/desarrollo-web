/* Datos: este archivo consulta el clima del terreno correspondiente al cultivo seleccionado. No recibe atributos. */

const API_CLIMA = "http://localhost:8081/api";
const selectorCultivoClima = document.getElementById("cultivo-clima");
const mensajeCultivoClima = document.getElementById("mensaje-clima-cultivo");
const panelDatosClima = document.getElementById("datos-clima-cultivo");
const listaSugerenciasClima = document.getElementById("sugerencias-clima-cultivo");
let cultivosActivosClima = [];
let terrenosPorParcela = {};

/* Datos: esta función lee una respuesta JSON de la API. Recibe la URL. */
async function consultarJson(url) {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error("Error " + respuesta.status + " al consultar el API.");
    }
    return await respuesta.json();
}

/* Datos: esta función consulta los cultivos, terrenos y parcelas para llenar el selector. No recibe atributos. */
async function cargarCultivosParaClima() {
    mensajeCultivoClima.textContent = "Cargando cultivos y terrenos…";
    panelDatosClima.hidden = true;

    try {
        const todosCultivos = await consultarJson(API_CLIMA + "/cultivos");
        const terrenos = await consultarJson(API_CLIMA + "/terrenos");
        const parcelas = [];
        terrenosPorParcela = {};

        for (let i = 0; i < terrenos.length; i++) {
            const terreno = terrenos[i];
            const parcelasTerreno = await consultarJson(
                API_CLIMA + "/parcelas/terreno/" + encodeURIComponent(terreno.id)
            );

            for (let j = 0; j < parcelasTerreno.length; j++) {
                const parcela = parcelasTerreno[j];
                parcela.nombreTerreno = terreno.nombre;
                parcelas.push(parcela);
                terrenosPorParcela[String(parcela.idParcela)] = terreno;
            }
        }

        cultivosActivosClima = [];
        for (let i = 0; i < todosCultivos.length; i++) {
            if (todosCultivos[i].estado === "activo") {
                cultivosActivosClima.push(todosCultivos[i]);
            }
        }

        selectorCultivoClima.replaceChildren();
        if (cultivosActivosClima.length === 0) {
            selectorCultivoClima.add(new Option("No hay cultivos activos", ""));
            mensajeCultivoClima.textContent = "No hay cultivos activos para consultar.";
            return;
        }

        for (let i = 0; i < cultivosActivosClima.length; i++) {
            const cultivo = cultivosActivosClima[i];
            let parcelaEncontrada = null;

            for (let j = 0; j < parcelas.length; j++) {
                if (String(parcelas[j].idParcela) === String(cultivo.idParcela)) {
                    parcelaEncontrada = parcelas[j];
                    break;
                }
            }

            let nombreParcela = "Parcela " + cultivo.idParcela;
            let nombreTerreno = "";
            if (parcelaEncontrada) {
                nombreParcela = parcelaEncontrada.nombre;
                nombreTerreno = parcelaEncontrada.nombreTerreno;
            }

            let texto = cultivo.nombre + " · " + nombreParcela;
            if (nombreTerreno) texto += " · " + nombreTerreno;
            selectorCultivoClima.add(new Option(texto, String(cultivo.id)));
        }

        mensajeCultivoClima.textContent = "";
        await cargarClimaSeleccionado();
    } catch (error) {
        selectorCultivoClima.replaceChildren(new Option("No se pudieron cargar los cultivos", ""));
        if (error instanceof TypeError) {
            mensajeCultivoClima.textContent = "No se pudo conectar con el API. Verifica que Spring Boot esté iniciado en el puerto 8081.";
        } else {
            mensajeCultivoClima.textContent = error.message;
        }
    }
}

/* Datos: esta función consulta el clima con las coordenadas del terreno del cultivo elegido. No recibe atributos. */
async function cargarClimaSeleccionado() {
    mensajeCultivoClima.textContent = "";
    panelDatosClima.hidden = true;
    listaSugerenciasClima.replaceChildren();

    const cultivo = buscarCultivoSeleccionado();
    if (!cultivo) {
        mensajeCultivoClima.textContent = "Selecciona un cultivo.";
        return;
    }

    const terreno = terrenosPorParcela[String(cultivo.idParcela)];
    if (!terreno) {
        mensajeCultivoClima.textContent = "No se encontró el terreno relacionado con la parcela de este cultivo.";
        return;
    }

    if (terreno.latitud == null || terreno.longitud == null) {
        mensajeCultivoClima.textContent = "El terreno «" + terreno.nombre
            + "» no tiene coordenadas. Agrégalas desde Terrenos, en el detalle del terreno, con el botón Editar terreno.";
        return;
    }

    mensajeCultivoClima.textContent = "Consultando el clima…";
    try {
        const url = API_CLIMA + "/clima?latitud=" + encodeURIComponent(terreno.latitud)
            + "&longitud=" + encodeURIComponent(terreno.longitud);
        const clima = await consultarJson(url);

        mostrarValor("clima-temperatura", clima.temperaturaCelsius + " °C");
        mostrarValor("clima-humedad", clima.humedadRelativa + " %");
        mostrarValor("clima-precipitacion", clima.precipitacionActualMm + " mm");
        mostrarValor("clima-probabilidad", clima.probabilidadLluvia + " %");
        mostrarValor("clima-lluvia-esperada", clima.lluviaEsperadaMm + " mm");
        mostrarValor("clima-viento", clima.vientoKmH + " km/h");
        mostrarValor("clima-maxima", clima.temperaturaMaximaCelsius + " °C");

        const fecha = clima.fechaPronostico || "sin fecha";
        const actualizado = clima.horaActualizacion || "sin dato";
        listaSugerenciasClima.textContent = "Pronóstico: " + fecha + " · Actualizado: " + actualizado;

        if (clima.sugerencias && clima.sugerencias.length > 0) {
            const lista = document.createElement("ul");
            for (let i = 0; i < clima.sugerencias.length; i++) {
                const item = document.createElement("li");
                item.textContent = clima.sugerencias[i];
                lista.append(item);
            }
            listaSugerenciasClima.append(lista);
        }

        panelDatosClima.hidden = false;
        mensajeCultivoClima.textContent = "Clima para " + terreno.nombre + " · "
            + terreno.latitud + ", " + terreno.longitud;
    } catch (error) {
        if (error instanceof TypeError) {
            mensajeCultivoClima.textContent = "No se pudo consultar el clima. Verifica la conexión del backend con el servicio meteorológico.";
        } else {
            mensajeCultivoClima.textContent = error.message;
        }
    }
}

/* Datos: esta función muestra un dato del pronóstico. Recibe el ID del elemento y el valor. */
function mostrarValor(id, valor) {
    document.getElementById(id).textContent = valor;
}

/* Datos: esta función busca en la lista el cultivo elegido en el selector. No recibe atributos. */
function buscarCultivoSeleccionado() {
    return cultivosActivosClima.find(cultivo => String(cultivo.id) === selectorCultivoClima.value) || null;
}

/* Datos: esta función conecta los eventos de esta pantalla y carga los datos. No recibe atributos. */
function iniciarCultivosClima() {
    selectorCultivoClima.addEventListener("change", cargarClimaSeleccionado);
    document.getElementById("actualizar-clima-cultivo").addEventListener("click", cargarClimaSeleccionado);
    cargarCultivosParaClima();
}

iniciarCultivosClima();
