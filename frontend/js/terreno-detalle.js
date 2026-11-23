const API = "http://localhost:8081/api";
const idTerreno = new URLSearchParams(location.search).get("id");
let terreno = null;
let parcelaActual = null;
let pestana = "cultivo";

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

function fechaCorta(fecha) {
    if (!fecha) return "Sin registrar";
    const partes = String(fecha).slice(0, 10).split("-");
    const anio = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);
    return new Date(anio, mes - 1, dia).toLocaleDateString("es-MX");
}

async function mensajeError(respuesta, mensajePredeterminado) {
    try {
        const error = await respuesta.json();
        return error.mensaje || mensajePredeterminado;
    } catch (noEsJson) {
        return mensajePredeterminado;
    }
}

async function pedir(ruta) {
    const respuesta = await fetch(`${API}${ruta}`);
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
    return respuesta.json();
}

async function cargarTerreno() {
    try {
        const registro = await pedir(`/terrenos/${encodeURIComponent(idTerreno)}`);
        const parcelas = await pedir(`/parcelas/terreno/${encodeURIComponent(idTerreno)}`);
        const observaciones = await pedir("/observaciones-cultivos");
        const riegos = await pedir("/riegos");
        const incidencias = await pedir("/incidencias-cultivo");

        terreno = registro;
        terreno.parcelas = parcelas;
        let idParcelaSeleccionada = null;
        if (parcelaActual !== null) {
            idParcelaSeleccionada = parcelaActual.idParcela;
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

        for (let i = 0; i < terreno.parcelas.length; i++) {
            const p = terreno.parcelas[i];
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
                    titulo: esObs ? "Observación" : esRiego ? "Riego registrado" : `${capitalizar(r.tipoIncidencia || "Incidencia")}: ${r.nivelGravedad || ""}`,
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
        parcelaActual = null;
        for (let i = 0; i < terreno.parcelas.length; i++) {
            if (terreno.parcelas[i].idParcela === idParcelaSeleccionada) {
                parcelaActual = terreno.parcelas[i];
                break;
            }
        }
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
    const coordenadas = terreno.latitud == null || terreno.longitud == null
        ? "Coordenadas sin registrar"
        : `Coordenadas: ${terreno.latitud}, ${terreno.longitud}`;
    document.getElementById("datos-terreno").textContent =
        `${terreno.ubicacion || "Ubicación sin registrar"} · Superficie total: ${m2(terreno.superficieHa)} · ${coordenadas}`;

    let ocupadas = 0;
    for (let i = 0; i < terreno.parcelas.length; i++) {
        if (terreno.parcelas[i].cultivo) ocupadas++;
    }
    const disponibles = terreno.parcelas.length - ocupadas;
    const resumen = document.getElementById("resumen-terreno");
    resumen.replaceChildren();
    resumen.append(crear("span", `${terreno.parcelas.length} parcelas`, "chip"));
    resumen.append(crear("span", `${ocupadas} ${ocupadas === 1 ? "ocupada" : "ocupadas"}`, "chip"));
    resumen.append(crear("span", `${disponibles} ${disponibles === 1 ? "disponible" : "disponibles"}`, "chip"));
    document.getElementById("clima-lugar").textContent = terreno.ubicacion;
    dibujarParcelas();
    if (parcelaActual) dibujarPanelParcela();
    cargarClima();
}

function dibujarParcelas() {
    const cont = document.getElementById("lista-parcelas");
    cont.replaceChildren();
    for (let i = 0; i < terreno.parcelas.length; i++) {
        const p = terreno.parcelas[i];
        const ocupada = !!p.cultivo;
        const boton = crear("button", undefined, "parcela" + (p === parcelaActual ? " seleccionada" : ""));
        boton.type = "button";
        const fila = crear("div", undefined, "fila");
        fila.append(
            crear("strong", `${p.clave} · ${Number(p.superficieM2).toLocaleString("es-MX")} m²`),
            crear("span", ocupada ? "Con cultivo" : "Disponible", "insignia" + (ocupada ? " activa" : ""))
        );
        let cultivoResumen = "Sin cultivo";
        if (ocupada) {
            cultivoResumen = p.cultivo.nombre;
            if (p.cultivo.familia) cultivoResumen += " · " + p.cultivo.familia;
            cultivoResumen += " · " + (p.cultivo.etapa || "Etapa sin registrar");
        }
        boton.append(fila, crear("small", cultivoResumen));
        boton.addEventListener("click", function () {
            parcelaActual = p;
            pestana = "cultivo";
            dibujarParcelas();
            dibujarPanelParcela();
        });
        cont.append(boton);
    }
}

function dibujarPanelParcela() {
    const p = parcelaActual;
    const botonCultivo = document.getElementById("gestionar-cultivo");
    botonCultivo.hidden = false;
    botonCultivo.textContent = p.cultivo ? "Editar cultivo" : "Asignar cultivo";
    const pestanas = document.getElementById("pestanas-parcela");
    const contenido = document.getElementById("contenido-parcela");
    pestanas.hidden = false;
    const botonesPestana = pestanas.querySelectorAll("button");
    for (let i = 0; i < botonesPestana.length; i++) {
        botonesPestana[i].classList.toggle("activa", botonesPestana[i].dataset.tab === pestana);
    }
    document.getElementById("titulo-parcela").textContent = p.cultivo ? `${p.clave} · ${p.cultivo.nombre}` : p.clave;
    const insignia = document.getElementById("insignia-parcela");
    insignia.textContent = p.cultivo ? "Cultivo" : "";
    insignia.className = p.cultivo ? "insignia activa" : "";
    document.getElementById("info-parcela").textContent = `${Number(p.superficieM2).toLocaleString("es-MX")} m² · ${p.cultivo ? "Con cultivo asignado" : "Sin cultivo"}`;
    contenido.replaceChildren();
    if (pestana === "cultivo") {
        if (!p.cultivo) {
            contenido.append(crear("p", "No hay un cultivo asignado a esta parcela. Usa «Asignar cultivo» para registrarlo.", "nota"));
            return;
        }
        const datos = crear("div", undefined, "datos-cultivo");
        const etiquetas = ["Nombre", "Familia", "Etapa fenológica", "Fecha de siembra", "Estado"];
        const valores = [
            p.cultivo.nombre,
            p.cultivo.familia || "Sin registrar",
            p.cultivo.etapa || "Sin registrar",
            fechaCorta(p.cultivo.fechaSiembra),
            capitalizar(p.cultivo.estado || "activo")
        ];
        for (let i = 0; i < etiquetas.length; i++) {
            const dato = crear("div", undefined, "dato-cultivo");
            dato.append(crear("span", etiquetas[i]), crear("strong", valores[i]));
            datos.append(dato);
        }
        contenido.append(datos);
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
    for (let i = 0; i < p.bitacora.length; i++) {
        const b = p.bitacora[i];
        const fila = crear("div", undefined, "registro");
        const texto = crear("div");
        texto.append(crear("strong", b.titulo), crear("p", b.detalle));
        const acciones = crear("div", undefined, "acciones-registro");
        const editar = crear("button", "Editar", "boton boton-secundario");
        editar.type = "button";
        editar.addEventListener("click", function () { abrirEdicionBitacora(b); });
        acciones.append(crear("span", b.tipo, "tipo"), editar);
        fila.append(crear("span", fechaCorta(b.fecha), "fecha-registro"), texto, acciones);
        contenido.append(fila);
    }
}

const dialogoBitacora = document.getElementById("dialogo-bitacora");
const formularioBitacora = document.getElementById("formulario-bitacora");
const mensajeBitacora = document.getElementById("mensaje-bitacora");
let registroBitacoraActual = null;

function abrirEdicionBitacora(bitacora) {
    registroBitacoraActual = bitacora;
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

document.getElementById("cancelar-bitacora").addEventListener("click", function () { dialogoBitacora.close(); });

formularioBitacora.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    if (!registroBitacoraActual) return;
    mensajeBitacora.textContent = "";
    const entidad = registroBitacoraActual.entidad;
    const registro = registroBitacoraActual.registro;
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
        const respuesta = await fetch(`${API}/${ruta}/${encodeURIComponent(registroBitacoraActual.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        if (!respuesta.ok) throw new Error(`No se pudo guardar el cambio (HTTP ${respuesta.status}).`);
        dialogoBitacora.close();
        pestana = "bitacora";
        await cargarTerreno();
    } catch (error) {
        mensajeBitacora.textContent = error.message;
    }
});

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

document.getElementById("pestanas-parcela").addEventListener("click", function (e) {
    if (e.target.dataset.tab && parcelaActual) {
        pestana = e.target.dataset.tab;
        dibujarPanelParcela();
    }
});

const dialogoEditarTerreno = document.getElementById("dialogo-editar-terreno");
const formularioEditarTerreno = document.getElementById("formulario-editar-terreno");
const mensajeEditarTerreno = document.getElementById("mensaje-editar-terreno");

document.getElementById("editar-terreno").addEventListener("click", function () {
    if (!terreno) return;
    mensajeEditarTerreno.textContent = "";
    document.getElementById("e-nombre").value = terreno.nombre || "";
    document.getElementById("e-ubicacion").value = terreno.ubicacion || "";
    document.getElementById("e-superficie").value = terreno.superficieHa == null ? "" : terreno.superficieHa * 10000;
    document.getElementById("e-latitud").value = terreno.latitud == null ? "" : terreno.latitud;
    document.getElementById("e-longitud").value = terreno.longitud == null ? "" : terreno.longitud;
    document.getElementById("e-estado").value = terreno.estado || "disponible";
    dialogoEditarTerreno.showModal();
});

document.getElementById("cancelar-editar-terreno").addEventListener("click", function () { dialogoEditarTerreno.close(); });

formularioEditarTerreno.addEventListener("submit", async function (evento) {
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
            throw new Error(await mensajeError(respuesta, "No se pudo actualizar el terreno."));
        }
        const terrenoActualizado = await respuesta.json();
        for (const propiedad in terrenoActualizado) {
            terreno[propiedad] = terrenoActualizado[propiedad];
        }
        dialogoEditarTerreno.close();
        dibujarTerreno();
    } catch (error) {
        mensajeEditarTerreno.textContent = error.message;
    }
});

const dialogoParcela = document.getElementById("dialogo-parcela");
const formularioParcela = document.getElementById("formulario-parcela");
const mensajeParcela = document.getElementById("mensaje-parcela");
const superficieDisponible = document.getElementById("superficie-disponible");

document.getElementById("agregar-parcela").addEventListener("click", function () {
    if (!terreno) return;
    mensajeParcela.textContent = "";
    formularioParcela.reset();
    const total = Number(terreno.superficieHa || 0) * 10000;
    let ocupada = 0;
    for (let i = 0; i < terreno.parcelas.length; i++) {
        ocupada += Number(terreno.parcelas[i].superficieM2 || 0);
    }
    const disponible = Math.max(0, total - ocupada);
    document.getElementById("p-superficie").max = disponible.toFixed(2);
    superficieDisponible.textContent = `Superficie disponible: ${disponible.toLocaleString("es-MX", { maximumFractionDigits: 2 })} m² de ${total.toLocaleString("es-MX", { maximumFractionDigits: 2 })} m².`;
    if (disponible <= 0) {
        mensajeParcela.textContent = "Este terreno ya no tiene superficie disponible para otra parcela.";
    }
    dialogoParcela.showModal();
});

document.getElementById("cancelar-parcela").addEventListener("click", function () { dialogoParcela.close(); });

formularioParcela.addEventListener("submit", async function (evento) {
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
            throw new Error(await mensajeError(respuesta, "No se pudo guardar la parcela."));
        }
        const parcelaCreada = await respuesta.json();
        parcelaActual = { idParcela: parcelaCreada.idParcela };
        await cargarTerreno();
        pestana = "cultivo";
        if (parcelaActual) dibujarPanelParcela();
        dialogoParcela.close();
    } catch (error) {
        mensajeParcela.textContent = error.message;
    }
});

const dialogoCultivo = document.getElementById("dialogo-cultivo");
const formularioCultivo = document.getElementById("formulario-cultivo-parcela");
const mensajeCultivo = document.getElementById("mensaje-cultivo-parcela");

document.getElementById("gestionar-cultivo").addEventListener("click", async function () {
    if (!parcelaActual) return;
    mensajeCultivo.textContent = "";
    formularioCultivo.reset();
    document.getElementById("titulo-dialogo-cultivo").textContent = parcelaActual.cultivo
        ? "Editar cultivo de la parcela"
        : "Asignar cultivo a la parcela";
    document.getElementById("guardar-cultivo-parcela").textContent = parcelaActual.cultivo
        ? "Guardar cambios"
        : "Guardar cultivo";
    const cultivo = parcelaActual.cultivo;
    const selectorVariedad = document.getElementById("c-variedad");
    selectorVariedad.replaceChildren(new Option("Cargando variedades…", ""));
    try {
        const variedades = await pedir("/variedades-producto");
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
});

document.getElementById("cancelar-cultivo-parcela").addEventListener("click", function () { dialogoCultivo.close(); });

formularioCultivo.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    if (!parcelaActual) return;
    mensajeCultivo.textContent = "";
    const datos = {
        idParcela: parcelaActual.idParcela,
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
    const cultivoExistente = parcelaActual.cultivo;
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
            throw new Error(await mensajeError(respuesta, "No se pudo guardar la información del cultivo."));
        }
        dialogoCultivo.close();
        await cargarTerreno();
        if (parcelaActual) pestana = "cultivo";
        dibujarPanelParcela();
    } catch (error) {
        mensajeCultivo.textContent = error.message;
    }
});

cargarTerreno();
