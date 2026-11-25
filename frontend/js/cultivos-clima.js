/**
 * Consulta el clima del terreno correspondiente al cultivo seleccionado.
 *
 * @author Equipo de Gestión de Cultivos
 */
class ClimaCultivos {
    /**
     * Prepara la lista de cultivos y la relación entre terrenos y parcelas.
     */
    constructor() {
        this.cultivosActivosClima = [];
        this.terrenosPorParcela = {};
    }

    /**
     * Lee una respuesta JSON de la API.
     *
     * @param url - La URL.
     */
    async consultarJson(url) {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            throw new Error("Error " + respuesta.status + " al consultar el API.");
        }
        return await respuesta.json();
    }

    /**
     * Consulta los cultivos, terrenos y parcelas para llenar el selector.
     */
    async cargarCultivosParaClima() {
        mensajeCultivoClima.textContent = "Cargando cultivos y terrenos…";
        panelDatosClima.hidden = true;

        try {
            const todosCultivos = await this.consultarJson(API_CLIMA + "/cultivos");
            const terrenos = await this.consultarJson(API_CLIMA + "/terrenos");
            const parcelas = [];
            this.terrenosPorParcela = {};

            for (let i = 0; i < terrenos.length; i++) {
                const terreno = terrenos[i];
                const parcelasTerreno = await this.consultarJson(
                    API_CLIMA + "/parcelas/terreno/" + encodeURIComponent(terreno.id)
                );

                for (let j = 0; j < parcelasTerreno.length; j++) {
                    const parcela = parcelasTerreno[j];
                    parcela.nombreTerreno = terreno.nombre;
                    parcelas.push(parcela);
                    this.terrenosPorParcela[String(parcela.idParcela)] = terreno;
                }
            }

            this.cultivosActivosClima = [];
            for (let i = 0; i < todosCultivos.length; i++) {
                if (todosCultivos[i].estado === "activo") {
                    this.cultivosActivosClima.push(todosCultivos[i]);
                }
            }

            selectorCultivoClima.replaceChildren();
            if (this.cultivosActivosClima.length === 0) {
                selectorCultivoClima.add(new Option("No hay cultivos activos", ""));
                mensajeCultivoClima.textContent = "No hay cultivos activos para consultar.";
                return;
            }

            for (let i = 0; i < this.cultivosActivosClima.length; i++) {
                const cultivo = this.cultivosActivosClima[i];
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
            await this.cargarClimaSeleccionado();
        } catch (error) {
            selectorCultivoClima.replaceChildren(new Option("No se pudieron cargar los cultivos", ""));
            if (error instanceof TypeError) {
                mensajeCultivoClima.textContent = "No se pudo conectar con el API. Verifica que Spring Boot esté iniciado en el puerto 8081.";
            } else {
                mensajeCultivoClima.textContent = error.message;
            }
        }
    }

    /**
     * Consulta el clima con las coordenadas del terreno del cultivo elegido.
     */
    async cargarClimaSeleccionado() {
        mensajeCultivoClima.textContent = "";
        panelDatosClima.hidden = true;
        listaSugerenciasClima.replaceChildren();

        const cultivo = this.buscarCultivoSeleccionado();
        if (!cultivo) {
            mensajeCultivoClima.textContent = "Selecciona un cultivo.";
            return;
        }

        const terreno = this.terrenosPorParcela[String(cultivo.idParcela)];
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
            const clima = await this.consultarJson(url);

            this.mostrarValor("clima-temperatura", clima.temperaturaCelsius + " °C");
            this.mostrarValor("clima-humedad", clima.humedadRelativa + " %");
            this.mostrarValor("clima-precipitacion", clima.precipitacionActualMm + " mm");
            this.mostrarValor("clima-probabilidad", clima.probabilidadLluvia + " %");
            this.mostrarValor("clima-lluvia-esperada", clima.lluviaEsperadaMm + " mm");
            this.mostrarValor("clima-viento", clima.vientoKmH + " km/h");
            this.mostrarValor("clima-maxima", clima.temperaturaMaximaCelsius + " °C");

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

    /**
     * Muestra un dato del pronóstico.
     *
     * @param id - Identificador del elemento del pronóstico.
     * @param valor - Valor que se muestra en el elemento.
     */
    mostrarValor(id, valor) {
        document.getElementById(id).textContent = valor;
    }

    /**
     * Busca en la lista el cultivo elegido en el selector.
     */
    buscarCultivoSeleccionado() {
        return this.cultivosActivosClima.find(cultivo => String(cultivo.id) === selectorCultivoClima.value) || null;
    }

    /**
     * Conecta los eventos de esta pantalla y carga los datos.
     */
    iniciarCultivosClima() {
        selectorCultivoClima.addEventListener("change", this.cargarClimaSeleccionado.bind(this));
        document.getElementById("actualizar-clima-cultivo").addEventListener("click", this.cargarClimaSeleccionado.bind(this));
        this.cargarCultivosParaClima();
    }
}

const API_CLIMA = "http://localhost:8081/api";
const selectorCultivoClima = document.getElementById("cultivo-clima");
const mensajeCultivoClima = document.getElementById("mensaje-clima-cultivo");
const panelDatosClima = document.getElementById("datos-clima-cultivo");
const listaSugerenciasClima = document.getElementById("sugerencias-clima-cultivo");

const climaCultivos = new ClimaCultivos();

climaCultivos.iniciarCultivosClima();
