/**
 * Muestra un terreno, sus parcelas y su bitácora, y conecta los formularios de edición.
 *
 * @author Equipo de Gestión de Cultivos
 */
class DetalleTerrenoAdmin {
    /**
     * Prepara la selección de parcela, pestaña y registros del terreno.
     */
    constructor() {
        this.terreno = null;
        this.parcelaActual = null;
        this.pestana = "cultivo";
        this.registroBitacoraActual = null;
    }

    /**
     * Consulta una ruta de la API del proyecto.
     *
     * @param ruta - La ruta.
     */
    async pedir(ruta) {
        const respuesta = await fetch(`${API}${ruta}`);
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        return respuesta.json();
    }

    /**
     * Combina el terreno y sus parcelas con los registros de la bitácora.
     */
    async cargarTerreno() {
        try {
            const registro = await this.pedir(`/terrenos/${encodeURIComponent(idTerreno)}`);
            const parcelas = await this.pedir(`/parcelas/terreno/${encodeURIComponent(idTerreno)}`);
            const observaciones = await this.pedir("/observaciones-cultivos");
            const riegos = await this.pedir("/riegos");
            const incidencias = await this.pedir("/incidencias-cultivo");

            this.terreno = registro;
            this.terreno.parcelas = parcelas;
            let idParcelaSeleccionada = null;
            if (this.parcelaActual !== null) {
                idParcelaSeleccionada = this.parcelaActual.idParcela;
            }
            const registros = [];
            for (let i = 0; i < observaciones.length; i++) {
                observaciones[i].entidad = "observacion";
                registros.push(observaciones[i]);
            }
            for (let i = 0; i < riegos.length; i++) {
                riegos[i].entidad = "riego";
                registros.push(riegos[i]);
            }
            for (let i = 0; i < incidencias.length; i++) {
                incidencias[i].entidad = "incidencia";
                registros.push(incidencias[i]);
            }

            for (let i = 0; i < this.terreno.parcelas.length; i++) {
                const p = this.terreno.parcelas[i];
                const bitacora = [];
                for (let j = 0; j < registros.length; j++) {
                    const r = registros[j];
                    if (String(r.idCultivo) !== String(p.idCultivo)) {
                        continue;
                    }
                    const esObs = r.fechaObservacion != null;
                    const esRiego = r.fechaRiego != null;
                    const item = {
                        id: esObs ? r.idObservacion : esRiego ? r.idRiego : r.idIncidencia,
                        entidad: r.entidad,
                        registro: r,
                        fecha: r.fechaObservacion || r.fechaRiego || r.fechaIncidencia,
                        titulo: esObs ? "Observación" : esRiego ? "Riego registrado" : `${this.capitalizar(r.tipoIncidencia || "Incidencia")}: ${r.nivelGravedad || ""}`,
                        detalle: r.descripcion || r.observaciones || (esRiego ? `${r.cantidadAgua} ${r.unidadMedida || ""} · ${r.metodo || ""}` : ""),
                        tipo: esObs ? "Observación" : esRiego ? "Riego" : "Incidencia"
                    };
                    if (item.fecha) bitacora.push(item);
                }
                bitacora.sort(function (a, b) {
                    return String(b.fecha).localeCompare(String(a.fecha));
                });
                p.clave = p.nombre;
                p.cultivo = null;
                if (p.idCultivo != null) {
                    p.cultivo = {
                        id: p.idCultivo,
                        idVariedad: p.idVariedad,
                        nombre: p.cultivoNombre,
                        familia: p.cultivoFamilia,
                        etapa: p.etapaFenologica,
                        fechaSiembra: p.fechaSiembra,
                        estado: p.estadoCultivo
                    };
                }
                p.bitacora = bitacora;
            }
            this.parcelaActual = null;
            for (let i = 0; i < this.terreno.parcelas.length; i++) {
                if (this.terreno.parcelas[i].idParcela === idParcelaSeleccionada) {
                    this.parcelaActual = this.terreno.parcelas[i];
                    break;
                }
            }
            document.getElementById("mensaje-detalle").textContent = "";
            this.dibujarTerreno();
        } catch (error) {
            document.getElementById("mensaje-detalle").textContent = "No se pudieron cargar el terreno, sus parcelas y la bitácora desde el API.";
            document.getElementById("nombre-terreno").textContent = "Terreno no disponible";
            document.getElementById("miga-terreno").textContent = "Error de conexión";
        }
    }

    /**
     * Consulta la temperatura y precipitación del terreno con Open-Meteo.
     */
    async cargarClima() {
        const detalle = document.getElementById("clima-detalle");
        const temp = document.getElementById("clima-temp");
        if (this.terreno.latitud == null || this.terreno.longitud == null) {
            detalle.textContent = "Este terreno no tiene coordenadas registradas.";
            return;
        }
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.terreno.latitud}&longitude=${this.terreno.longitud}&current=temperature_2m,precipitation&timezone=auto`;
            const d = await (await fetch(url)).json();
            temp.textContent = `${Math.round(d.current.temperature_2m)} °C`;
            detalle.textContent = `Precipitación actual: ${d.current.precipitation} mm`;
        } catch {
            detalle.textContent = "No se pudo consultar el clima.";
        }
    }

    /**
     * Envía los cambios del terreno a la API.
     *
     * @param evento - El evento del formulario.
     */
    async guardarTerrenoEditado(evento) {
        evento.preventDefault();
        mensajeEditarTerreno.textContent = "";
        const latitudTexto = document.getElementById("e-latitud").value;
        const longitudTexto = document.getElementById("e-longitud").value;
        const datos = {
            nombre: document.getElementById("e-nombre").value.trim(),
            ubicacion: document.getElementById("e-ubicacion").value.trim(),
            superficieHa: Number(document.getElementById("e-superficie").value) / 10000,
            latitud: latitudTexto === "" ? null : Number(latitudTexto),
            longitud: longitudTexto === "" ? null : Number(longitudTexto),
            estado: document.getElementById("e-estado").value
        };
        if ((datos.latitud === null) !== (datos.longitud === null)) {
            mensajeEditarTerreno.textContent = "Ingresa latitud y longitud juntas, o deja ambas vacías.";
            return;
        }
        try {
            const respuesta = await fetch(`${API}/terrenos/${encodeURIComponent(idTerreno)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
            if (!respuesta.ok) {
                throw new Error(await this.mensajeError(respuesta, "No se pudo actualizar el terreno."));
            }
            const terrenoActualizado = await respuesta.json();
            for (const propiedad in terrenoActualizado) {
                this.terreno[propiedad] = terrenoActualizado[propiedad];
            }
            dialogoEditarTerreno.close();
            this.dibujarTerreno();
        } catch (error) {
            mensajeEditarTerreno.textContent = error.message;
        }
    }

    /**
     * Registra una parcela dentro del terreno.
     *
     * @param evento - El evento del formulario.
     */
    async guardarParcela(evento) {
        evento.preventDefault();
        mensajeParcela.textContent = "";
        const datos = {
            idTerreno: Number(idTerreno),
            nombre: document.getElementById("p-nombre").value.trim(),
            superficieM2: Number(document.getElementById("p-superficie").value)
        };
        try {
            const respuesta = await fetch(`${API}/parcelas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
            if (!respuesta.ok) {
                throw new Error(await this.mensajeError(respuesta, "No se pudo guardar la parcela."));
            }
            const parcelaCreada = await respuesta.json();
            this.parcelaActual = { idParcela: parcelaCreada.idParcela };
            await this.cargarTerreno();
            this.pestana = "cultivo";
            if (this.parcelaActual) this.dibujarPanelParcela();
            dialogoParcela.close();
        } catch (error) {
            mensajeParcela.textContent = error.message;
        }
    }

    /**
     * Guarda los datos del cultivo de la parcela elegida.
     *
     * @param evento - El evento del formulario.
     */
    async guardarCultivo(evento) {
        evento.preventDefault();
        if (!this.parcelaActual) return;
        mensajeCultivo.textContent = "";
        const datos = {
            idParcela: this.parcelaActual.idParcela,
            idVariedad: Number(document.getElementById("c-variedad").value),
            nombre: "",
            familia: null,
            etapaFenologica: document.getElementById("c-etapa").value.trim() || null,
            fechaSiembra: document.getElementById("c-fecha-siembra").value || null,
            estado: document.getElementById("c-estado").value
        };
        const seleccion = document.getElementById("c-variedad");
        const variedadElegida = seleccion.options[seleccion.selectedIndex];
        if (!datos.idVariedad || !variedadElegida || !variedadElegida.value) {
            mensajeCultivo.textContent = "Selecciona un producto existente del catálogo.";
            return;
        }
        datos.familia = variedadElegida.dataset.familia;
        datos.nombre = datos.familia + " " + variedadElegida.dataset.nombre;
        const cultivoExistente = this.parcelaActual.cultivo;
        const ruta = cultivoExistente
            ? `${API}/cultivos/${encodeURIComponent(cultivoExistente.id)}`
            : `${API}/cultivos`;
        try {
            const respuesta = await fetch(ruta, {
                method: cultivoExistente ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
            if (!respuesta.ok) {
                throw new Error(await this.mensajeError(respuesta, "No se pudo guardar la información del cultivo."));
            }
            dialogoCultivo.close();
            await this.cargarTerreno();
            if (this.parcelaActual) this.pestana = "cultivo";
            this.dibujarPanelParcela();
        } catch (error) {
            mensajeCultivo.textContent = error.message;
        }
    }

    /**
     * Guarda una observación, una incidencia o un riego.
     *
     * @param evento - El evento del formulario.
     */
    async guardarRegistroBitacora(evento) {
        evento.preventDefault();
        if (!this.registroBitacoraActual) return;
        mensajeBitacora.textContent = "";
        const entidad = this.registroBitacoraActual.entidad;
        const registro = this.registroBitacoraActual.registro;
        const fecha = document.getElementById("b-fecha").value;
        let ruta;
        let datos;

        if (entidad === "observacion") {
            ruta = "observaciones-cultivos";
            datos = {
                idCultivo: registro.idCultivo,
                idUsuario: registro.idUsuario,
                fechaObservacion: fecha,
                descripcion: document.getElementById("b-descripcion").value.trim()
            };
        } else if (entidad === "incidencia") {
            ruta = "incidencias-cultivo";
            datos = {
                idCultivo: registro.idCultivo,
                idUsuario: registro.idUsuario,
                fechaIncidencia: fecha,
                tipoIncidencia: document.getElementById("b-tipo-incidencia").value,
                nivelGravedad: document.getElementById("b-gravedad").value,
                descripcion: document.getElementById("b-descripcion-incidencia").value.trim()
            };
        } else {
            ruta = "riegos";
            datos = {
                idCultivo: registro.idCultivo,
                idUsuario: registro.idUsuario,
                fechaRiego: fecha,
                cantidadAgua: Number(document.getElementById("b-cantidad-agua").value),
                unidadMedida: document.getElementById("b-unidad-agua").value.trim(),
                metodo: document.getElementById("b-metodo-riego").value.trim(),
                observaciones: document.getElementById("b-observaciones-riego").value.trim()
            };
        }

        try {
            const respuesta = await fetch(`${API}/${ruta}/${encodeURIComponent(this.registroBitacoraActual.id)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
            if (!respuesta.ok) throw new Error(`No se pudo guardar el cambio (HTTP ${respuesta.status}).`);
            dialogoBitacora.close();
            this.pestana = "bitacora";
            await this.cargarTerreno();
        } catch (error) {
            mensajeBitacora.textContent = error.message;
        }
    }

    /**
     * Muestra la pestaña elegida de la parcela.
     *
     * @param e - El evento del botón.
     */
    cambiarPestanaParcela(e) {
        if (e.target.dataset.tab && this.parcelaActual) {
            this.pestana = e.target.dataset.tab;
            this.dibujarPanelParcela();
        }
    }

    /**
     * Rellena y abre el formulario de edición de terreno.
     */
    abrirEdicionTerreno() {
        if (!this.terreno) return;
        mensajeEditarTerreno.textContent = "";
        document.getElementById("e-nombre").value = this.terreno.nombre || "";
        document.getElementById("e-ubicacion").value = this.terreno.ubicacion || "";
        document.getElementById("e-superficie").value = this.terreno.superficieHa == null ? "" : this.terreno.superficieHa * 10000;
        document.getElementById("e-latitud").value = this.terreno.latitud == null ? "" : this.terreno.latitud;
        document.getElementById("e-longitud").value = this.terreno.longitud == null ? "" : this.terreno.longitud;
        document.getElementById("e-estado").value = this.terreno.estado || "disponible";
        dialogoEditarTerreno.showModal();
    }

    /**
     * Muestra el formulario y calcula la superficie libre.
     */
    abrirNuevaParcela() {
        if (!this.terreno) return;
        mensajeParcela.textContent = "";
        formularioParcela.reset();
        const total = Number(this.terreno.superficieHa || 0) * 10000;
        let ocupada = 0;
        for (let i = 0; i < this.terreno.parcelas.length; i++) {
            ocupada += Number(this.terreno.parcelas[i].superficieM2 || 0);
        }
        const disponible = Math.max(0, total - ocupada);
        document.getElementById("p-superficie").max = disponible.toFixed(2);
        superficieDisponible.textContent = `Superficie disponible: ${disponible.toLocaleString("es-MX", { maximumFractionDigits: 2 })} m² de ${total.toLocaleString("es-MX", { maximumFractionDigits: 2 })} m².`;
        if (disponible <= 0) {
            mensajeParcela.textContent = "Este terreno ya no tiene superficie disponible para otra parcela.";
        }
        dialogoParcela.showModal();
    }

    /**
     * Carga las variedades y abre el formulario del cultivo.
     */
    async abrirFormularioCultivo() {
        if (!this.parcelaActual) return;
        mensajeCultivo.textContent = "";
        formularioCultivo.reset();
        document.getElementById("titulo-dialogo-cultivo").textContent = this.parcelaActual.cultivo
            ? "Editar cultivo de la parcela"
            : "Asignar cultivo a la parcela";
        document.getElementById("guardar-cultivo-parcela").textContent = this.parcelaActual.cultivo
            ? "Guardar cambios"
            : "Guardar cultivo";
        const cultivo = this.parcelaActual.cultivo;
        const selectorVariedad = document.getElementById("c-variedad");
        selectorVariedad.replaceChildren(new Option("Cargando variedades…", ""));
        try {
            const variedades = await this.pedir("/variedades-producto");
            selectorVariedad.replaceChildren(new Option("Selecciona un producto del catálogo", ""));
            variedades.forEach(function (variedad) {
                const opcion = new Option(variedad.nombreFamilia + " · " + variedad.nombre, String(variedad.idVariedad));
                opcion.dataset.familia = variedad.nombreFamilia;
                opcion.dataset.nombre = variedad.nombre;
                selectorVariedad.add(opcion);
            });
            selectorVariedad.value = cultivo && cultivo.idVariedad ? String(cultivo.idVariedad) : "";
        } catch (error) {
            selectorVariedad.replaceChildren(new Option("No se pudieron cargar productos", ""));
            mensajeCultivo.textContent = "No se pudo consultar el catálogo para asignar este cultivo.";
        }
        document.getElementById("c-etapa").value = cultivo ? cultivo.etapa || "" : "";
        document.getElementById("c-fecha-siembra").value = cultivo ? cultivo.fechaSiembra || "" : "";
        document.getElementById("c-estado").value = cultivo ? cultivo.estado || "activo" : "activo";
        dialogoCultivo.showModal();
    }

    /**
     * Crea un elemento HTML.
     *
     * @param etiqueta - Nombre de la etiqueta HTML.
     * @param [texto] - Contenido visible del elemento.
     * @param [clase] - Clase CSS que se asigna al elemento.
     */
    crear(etiqueta, texto, clase) {
        const el = document.createElement(etiqueta);
        if (texto !== undefined && texto !== null) el.textContent = texto;
        if (clase) el.className = clase;
        return el;
    }

    /**
     * Pone en mayúscula la primera letra.
     *
     * @param texto - El texto.
     */
    capitalizar(texto) {
        const valor = String(texto || "");
        return valor.charAt(0).toUpperCase() + valor.slice(1);
    }

    /**
     * Convierte una superficie de hectáreas a metros cuadrados.
     *
     * @param ha - La superficie en hectáreas.
     */
    m2(ha) {
        return ha == null ? "—" : Math.round(ha * 10000).toLocaleString("es-MX") + " m²";
    }

    /**
     * Da formato a una fecha de la parcela.
     *
     * @param fecha - La fecha.
     */
    fechaCorta(fecha) {
        if (!fecha) return "Sin registrar";
        const partes = String(fecha).slice(0, 10).split("-");
        const anio = Number(partes[0]);
        const mes = Number(partes[1]);
        const dia = Number(partes[2]);
        return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX");
    }

    /**
     * Lee un mensaje de error devuelto por el backend.
     *
     * @param respuesta - Respuesta recibida de la API.
     * @param mensajePredeterminado - Mensaje que se usa si la respuesta no trae un detalle.
     */
    async mensajeError(respuesta, mensajePredeterminado) {
        try {
            const error = await respuesta.json();
            return error.mensaje || mensajePredeterminado;
        } catch (noEsJson) {
            return mensajePredeterminado;
        }
    }

    /**
     * Muestra los datos y conteos del terreno.
     */
    dibujarTerreno() {
        document.getElementById("miga-terreno").textContent = this.terreno.nombre;
        document.getElementById("nombre-terreno").textContent = this.terreno.nombre;
        const coordenadas = this.terreno.latitud == null || this.terreno.longitud == null
            ? "Coordenadas sin registrar"
            : `Coordenadas: ${this.terreno.latitud}, ${this.terreno.longitud}`;
        document.getElementById("datos-terreno").textContent =
            `${this.terreno.ubicacion || "Ubicación sin registrar"} · Superficie total: ${this.m2(this.terreno.superficieHa)} · ${coordenadas}`;

        let ocupadas = 0;
        for (let i = 0; i < this.terreno.parcelas.length; i++) {
            if (this.terreno.parcelas[i].cultivo) ocupadas++;
        }
        const disponibles = this.terreno.parcelas.length - ocupadas;
        const resumen = document.getElementById("resumen-terreno");
        resumen.replaceChildren();
        resumen.append(this.crear("span", `${this.terreno.parcelas.length} parcelas`, "chip"));
        resumen.append(this.crear("span", `${ocupadas} ${ocupadas === 1 ? "ocupada" : "ocupadas"}`, "chip"));
        resumen.append(this.crear("span", `${disponibles} ${disponibles === 1 ? "disponible" : "disponibles"}`, "chip"));
        document.getElementById("clima-lugar").textContent = this.terreno.ubicacion;
        this.dibujarParcelas();
        if (this.parcelaActual) this.dibujarPanelParcela();
        this.cargarClima();
    }

    /**
     * Dibuja la lista de parcelas del terreno.
     */
    dibujarParcelas() {
        const pantalla = this;
        const cont = document.getElementById("lista-parcelas");
        cont.replaceChildren();
        for (let i = 0; i < this.terreno.parcelas.length; i++) {
            const p = this.terreno.parcelas[i];
            const ocupada = !!p.cultivo;
            const boton = this.crear("button", undefined, "parcela" + (p === this.parcelaActual ? " seleccionada" : ""));
            boton.type = "button";
            const fila = this.crear("div", undefined, "fila");
            fila.append(
                this.crear("strong", `${p.clave} · ${Number(p.superficieM2).toLocaleString("es-MX")} m²`),
                this.crear("span", ocupada ? "Con cultivo" : "Disponible", "insignia" + (ocupada ? " activa" : ""))
            );
            let cultivoResumen = "Sin cultivo";
            if (ocupada) {
                cultivoResumen = p.cultivo.nombre;
                if (p.cultivo.familia) cultivoResumen += " · " + p.cultivo.familia;
                cultivoResumen += " · " + (p.cultivo.etapa || "Etapa sin registrar");
            }
            boton.append(fila, this.crear("small", cultivoResumen));
            boton.addEventListener("click", function () {
                pantalla.parcelaActual = p;
                pantalla.pestana = "cultivo";
                pantalla.dibujarParcelas();
                pantalla.dibujarPanelParcela();
            });
            cont.append(boton);
        }
    }

    /**
     * Muestra el cultivo y la bitácora de la parcela elegida.
     */
    dibujarPanelParcela() {
        const pantalla = this;
        const p = this.parcelaActual;
        const botonCultivo = document.getElementById("gestionar-cultivo");
        botonCultivo.hidden = false;
        botonCultivo.textContent = p.cultivo ? "Editar cultivo" : "Asignar cultivo";
        const pestanas = document.getElementById("pestanas-parcela");
        const contenido = document.getElementById("contenido-parcela");
        pestanas.hidden = false;
        const botonesPestana = pestanas.querySelectorAll("button");
        for (let i = 0; i < botonesPestana.length; i++) {
            botonesPestana[i].classList.toggle("activa", botonesPestana[i].dataset.tab === this.pestana);
        }
        document.getElementById("titulo-parcela").textContent = p.cultivo ? `${p.clave} · ${p.cultivo.nombre}` : p.clave;
        const insignia = document.getElementById("insignia-parcela");
        insignia.textContent = p.cultivo ? "Cultivo" : "";
        insignia.className = p.cultivo ? "insignia activa" : "";
        document.getElementById("info-parcela").textContent = `${Number(p.superficieM2).toLocaleString("es-MX")} m² · ${p.cultivo ? "Con cultivo asignado" : "Sin cultivo"}`;
        contenido.replaceChildren();
        if (this.pestana === "cultivo") {
            if (!p.cultivo) {
                contenido.append(this.crear("p", "No hay un cultivo asignado a esta parcela. Usa «Asignar cultivo» para registrarlo.", "nota"));
                return;
            }
            const datos = this.crear("div", undefined, "datos-cultivo");
            const etiquetas = ["Nombre", "Familia", "Etapa fenológica", "Fecha de siembra", "Estado"];
            const valores = [
                p.cultivo.nombre,
                p.cultivo.familia || "Sin registrar",
                p.cultivo.etapa || "Sin registrar",
                this.fechaCorta(p.cultivo.fechaSiembra),
                this.capitalizar(p.cultivo.estado || "activo")
            ];
            for (let i = 0; i < etiquetas.length; i++) {
                const dato = this.crear("div", undefined, "dato-cultivo");
                dato.append(this.crear("span", etiquetas[i]), this.crear("strong", valores[i]));
                datos.append(dato);
            }
            contenido.append(datos);
            return;
        }
        if (!p.cultivo) {
            contenido.append(this.crear("p", "La bitácora aparecerá aquí cuando la parcela tenga un cultivo registrado.", "nota"));
            return;
        }
        if (!p.bitacora.length) {
            contenido.append(this.crear("p", "Este cultivo aún no tiene registros en la bitácora.", "nota"));
            return;
        }
        for (let i = 0; i < p.bitacora.length; i++) {
            const b = p.bitacora[i];
            const fila = this.crear("div", undefined, "registro");
            const texto = this.crear("div");
            texto.append(this.crear("strong", b.titulo), this.crear("p", b.detalle));
            const acciones = this.crear("div", undefined, "acciones-registro");
            const editar = this.crear("button", "Editar", "boton boton-secundario");
            editar.type = "button";
            editar.addEventListener("click", function () { pantalla.abrirEdicionBitacora(b); });
            acciones.append(this.crear("span", b.tipo, "tipo"), editar);
            fila.append(this.crear("span", this.fechaCorta(b.fecha), "fecha-registro"), texto, acciones);
            contenido.append(fila);
        }
    }

    /**
     * Prepara el formulario para editar el registro elegido.
     *
     * @param bitacora - La entrada de bitácora.
     */
    abrirEdicionBitacora(bitacora) {
        this.registroBitacoraActual = bitacora;
        const r = bitacora.registro;
        mensajeBitacora.textContent = "";
        document.getElementById("tipo-registro-bitacora").textContent = `Tipo de registro: ${bitacora.tipo}`;
        document.getElementById("b-fecha").value = String(bitacora.fecha).slice(0, 10);
        const observacionVisible = bitacora.entidad === "observacion";
        const incidenciaVisible = bitacora.entidad === "incidencia";
        const riegoVisible = bitacora.entidad === "riego";
        document.getElementById("campos-observacion").hidden = !observacionVisible;
        document.getElementById("campos-incidencia").hidden = !incidenciaVisible;
        document.getElementById("campos-riego").hidden = !riegoVisible;
        document.getElementById("b-descripcion").disabled = !observacionVisible;
        document.getElementById("b-tipo-incidencia").disabled = !incidenciaVisible;
        document.getElementById("b-gravedad").disabled = !incidenciaVisible;
        document.getElementById("b-descripcion-incidencia").disabled = !incidenciaVisible;
        document.getElementById("b-cantidad-agua").disabled = !riegoVisible;
        document.getElementById("b-unidad-agua").disabled = !riegoVisible;
        document.getElementById("b-metodo-riego").disabled = !riegoVisible;
        document.getElementById("b-observaciones-riego").disabled = !riegoVisible;

        if (bitacora.entidad === "observacion") {
            document.getElementById("b-descripcion").value = r.descripcion || "";
        } else if (bitacora.entidad === "incidencia") {
            document.getElementById("b-tipo-incidencia").value = r.tipoIncidencia || "plaga";
            document.getElementById("b-gravedad").value = r.nivelGravedad || "bajo";
            document.getElementById("b-descripcion-incidencia").value = r.descripcion || "";
        } else {
            document.getElementById("b-cantidad-agua").value = r.cantidadAgua == null ? "" : r.cantidadAgua;
            document.getElementById("b-unidad-agua").value = r.unidadMedida || "";
            document.getElementById("b-metodo-riego").value = r.metodo || "";
            document.getElementById("b-observaciones-riego").value = r.observaciones || "";
        }
        dialogoBitacora.showModal();
    }

    /**
     * Conecta los controles de la página y ejecuta la carga inicial.
     */
    iniciarDetalleTerreno() {
        document.getElementById("cancelar-bitacora").addEventListener("click", function () { dialogoBitacora.close(); });

        formularioBitacora.addEventListener("submit", this.guardarRegistroBitacora.bind(this));

        document.getElementById("pestanas-parcela").addEventListener("click", this.cambiarPestanaParcela.bind(this));

        document.getElementById("editar-terreno").addEventListener("click", this.abrirEdicionTerreno.bind(this));

        document.getElementById("cancelar-editar-terreno").addEventListener("click", function () { dialogoEditarTerreno.close(); });

        formularioEditarTerreno.addEventListener("submit", this.guardarTerrenoEditado.bind(this));

        document.getElementById("agregar-parcela").addEventListener("click", this.abrirNuevaParcela.bind(this));

        document.getElementById("cancelar-parcela").addEventListener("click", function () { dialogoParcela.close(); });

        formularioParcela.addEventListener("submit", this.guardarParcela.bind(this));

        document.getElementById("gestionar-cultivo").addEventListener("click", this.abrirFormularioCultivo.bind(this));

        document.getElementById("cancelar-cultivo-parcela").addEventListener("click", function () { dialogoCultivo.close(); });

        formularioCultivo.addEventListener("submit", this.guardarCultivo.bind(this));

        this.cargarTerreno();
    }
}

const API = "http://localhost:8081/api";
const idTerreno = new URLSearchParams(location.search).get("id");

const dialogoBitacora = document.getElementById("dialogo-bitacora");
const formularioBitacora = document.getElementById("formulario-bitacora");
const mensajeBitacora = document.getElementById("mensaje-bitacora");

const dialogoEditarTerreno = document.getElementById("dialogo-editar-terreno");
const formularioEditarTerreno = document.getElementById("formulario-editar-terreno");
const mensajeEditarTerreno = document.getElementById("mensaje-editar-terreno");
const dialogoParcela = document.getElementById("dialogo-parcela");
const formularioParcela = document.getElementById("formulario-parcela");
const mensajeParcela = document.getElementById("mensaje-parcela");
const superficieDisponible = document.getElementById("superficie-disponible");
const dialogoCultivo = document.getElementById("dialogo-cultivo");
const formularioCultivo = document.getElementById("formulario-cultivo-parcela");
const mensajeCultivo = document.getElementById("mensaje-cultivo-parcela");

const detalleTerrenoAdmin = new DetalleTerrenoAdmin();

detalleTerrenoAdmin.iniciarDetalleTerreno();
