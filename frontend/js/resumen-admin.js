/* Datos: consulta los registros de administración y el pronóstico del tiempo para el resumen. No recibe atributos. */

const API_RESUMEN = "http://" + window.location.hostname + ":8081/api";
const mensajeResumen = document.getElementById("mensaje-resumen");
const mensajeClima = document.getElementById("mensaje-clima");
let terrenosResumen = [];

/* Datos: pide datos al backend y procesa posibles errores. Recibe la URL. */
async function consultar(url) {
    const respuesta = await fetch(url, { credentials: 'include' });
    const contenido = await respuesta.text();
    let datos = null;

    try {
        datos = contenido ? JSON.parse(contenido) : null;
    } catch (error) {
        datos = contenido;
    }

    if (!respuesta.ok) {
        if (respuesta.status === 401) {
            sessionStorage.removeItem("usuarioSesion");
            sessionStorage.removeItem("usuarioNombre");
            sessionStorage.removeItem("usuarioRol");
            sessionStorage.removeItem("usuarioId");
            window.location.replace("../login.html?motivo=sesion");
            throw new Error("Tu sesión terminó. Inicia sesión de nuevo.");
        }
        const mensaje = datos && datos.mensaje ? datos.mensaje : "Error al consultar el API";
        const detalle = datos && datos.detalle ? " " + datos.detalle : "";
        throw new Error(mensaje + detalle);
    }

    return datos;
}

/* Datos: actualiza los totales del panel. Recibe una indicación de si también debe consultar el clima. */
async function cargarResumen(actualizarClima) {
    mensajeResumen.textContent = "Cargando información…";

    try {
        const terrenos = await consultar(API_RESUMEN + "/terrenos");
        const productos = await consultar(API_RESUMEN + "/variedades-producto");
        const pedidos = await consultar(API_RESUMEN + "/pedidos");
        const cosechas = await consultar(API_RESUMEN + "/cosechas");
        terrenosResumen = terrenos;

        let parcelas = [];
        for (let i = 0; i < terrenos.length; i++) {
            const terreno = terrenos[i];
            const parcelasTerreno = await consultar(
                API_RESUMEN + "/parcelas/terreno/" + encodeURIComponent(terreno.id)
            );
            for (let j = 0; j < parcelasTerreno.length; j++) {
                parcelas.push(parcelasTerreno[j]);
            }
        }

        let ocupadas = 0;
        let cultivosActivos = 0;
        for (let i = 0; i < parcelas.length; i++) {
            const parcela = parcelas[i];
            if ((parcela.idCultivo !== null && parcela.idCultivo !== undefined)
                    || parcela.estado === "ocupada") {
                ocupadas++;
            }
            if (parcela.idCultivo !== null && parcela.idCultivo !== undefined
                    && (parcela.estadoCultivo || "activo") === "activo") {
                cultivosActivos++;
            }
        }

        let kilosDisponibles = 0;
        for (let i = 0; i < cosechas.length; i++) {
            kilosDisponibles += Number(cosechas[i].cantidadDisponible || 0);
        }

        let pedidosAbiertos = 0;
        let recolecciones = 0;
        for (let i = 0; i < pedidos.length; i++) {
            const pedido = pedidos[i];
            const estado = String(pedido.estado || "").toLowerCase();
            if (estado !== "cancelado" && estado !== "entregado") {
                pedidosAbiertos++;
                if (String(pedido.tipoEntrega || "").toLowerCase() === "recoleccion") {
                    recolecciones++;
                }
            }
        }

        document.getElementById("total-terrenos").textContent = numero(terrenos.length);
        document.getElementById("total-parcelas").textContent = numero(parcelas.length);
        document.getElementById("parcelas-ocupadas").textContent = numero(ocupadas)
            + " ocupadas · " + numero(parcelas.length - ocupadas) + " disponibles";
        document.getElementById("total-cultivos").textContent = numero(cultivosActivos);
        document.getElementById("total-productos").textContent = numero(productos.length);
        document.getElementById("total-cosecha").textContent = numero(kilosDisponibles, 2) + " kg";
        document.getElementById("total-pedidos").textContent = numero(pedidosAbiertos);
        document.getElementById("total-recolecciones").textContent = numero(recolecciones);

        if (recolecciones > 0) {
            document.getElementById("nota-recolecciones").textContent =
                "El cliente selecciona una fecha dentro de los próximos siete días.";
        } else {
            document.getElementById("nota-recolecciones").textContent = "No hay recolecciones pendientes.";
        }

        mensajeResumen.textContent = "Información actualizada desde el API.";
        if (actualizarClima) {
            await cargarClima(terrenos);
        }
    } catch (error) {
        if (String(error.message).includes("id_variedad")) {
            mensajeResumen.textContent = "La base de datos está desactualizada: falta la relación del cultivo con el catálogo. Ejecuta de nuevo backend/database/init.sql desde la carpeta backend y recarga esta página.";
        } else {
            mensajeResumen.textContent = "No se pudo cargar el resumen: "
                + (error.message || "revisa la conexión con el API.");
        }
        document.getElementById("total-terrenos").textContent = "—";
        document.getElementById("total-parcelas").textContent = "—";
        document.getElementById("total-cultivos").textContent = "—";
        document.getElementById("total-productos").textContent = "—";
        document.getElementById("total-cosecha").textContent = "—";
        document.getElementById("total-pedidos").textContent = "—";
        document.getElementById("total-recolecciones").textContent = "—";
    }
}

/* Datos: consulta el pronóstico con las coordenadas de un terreno. Recibe la lista de terrenos. */
async function cargarClima(terrenos) {
    let terrenoConCoordenadas = null;

    for (let i = 0; i < terrenos.length; i++) {
        const terreno = terrenos[i];
        if (terreno.latitud !== null && terreno.latitud !== undefined
                && terreno.longitud !== null && terreno.longitud !== undefined) {
            terrenoConCoordenadas = terreno;
            break;
        }
    }

    const ubicacion = document.getElementById("clima-ubicacion");
    if (terrenoConCoordenadas === null) {
        ubicacion.textContent = "Sin terreno con coordenadas registradas";
        mensajeClima.textContent = "Agrega latitud y longitud a un terreno para consultar el pronóstico.";
        document.getElementById("pronostico-semanal").replaceChildren();
        return;
    }

    ubicacion.textContent = terrenoConCoordenadas.nombre + " · "
        + (terrenoConCoordenadas.ubicacion || "Ubicación registrada");

    try {
        const url = API_RESUMEN + "/clima?latitud="
            + encodeURIComponent(terrenoConCoordenadas.latitud)
            + "&longitud=" + encodeURIComponent(terrenoConCoordenadas.longitud);
        const clima = await consultar(url);
        dibujarPronostico(clima.pronostico);

        if (clima.horaActualizacion) {
            const hora = new Date(clima.horaActualizacion);
            document.getElementById("clima-actualizado").textContent =
                "Datos meteorológicos actualizados: "
                + hora.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" }) + ".";
        }
    } catch (error) {
        if (document.getElementById("pronostico-semanal").children.length > 0) {
            mensajeClima.textContent = "No se pudo actualizar; se conserva el último pronóstico cargado.";
        } else {
            mensajeClima.textContent = "No se pudo consultar el clima. Revisa que Spring Boot esté activo.";
        }
    }
}

/* Datos: da formato a un número para el resumen. Recibe el valor y los decimales. */
function numero(valor, decimales) {
    if (decimales === undefined) decimales = 0;
    return Number(valor || 0).toLocaleString("es-MX", { maximumFractionDigits: decimales });
}

/* Datos: da formato a la fecha de una tarjeta del pronóstico. Recibe la fecha. */
function fechaPronostico(fecha) {
    const partes = fecha.split("-");
    const anio = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const dia = Number(partes[2]);
    return new Date(anio, mes, dia).toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric"
    });
}

/* Datos: muestra las tarjetas del pronóstico semanal. Recibe la lista de días. */
function dibujarPronostico(dias) {
    const contenedor = document.getElementById("pronostico-semanal");
    contenedor.replaceChildren();

    if (!dias || dias.length === 0) {
        mensajeClima.textContent = "El servicio no devolvió el pronóstico diario.";
        return;
    }

    mensajeClima.textContent = "Temperatura máxima, probabilidad de lluvia y lluvia esperada.";

    for (let i = 0; i < dias.length; i++) {
        const dia = dias[i];
        const tarjeta = document.createElement("article");
        tarjeta.className = "dia-pronostico";

        const fecha = document.createElement("strong");
        fecha.textContent = fechaPronostico(dia.fecha);

        const temperatura = document.createElement("span");
        temperatura.className = "temp-pronostico";
        temperatura.textContent = numero(dia.temperaturaMaximaCelsius) + " °C";

        const probabilidad = document.createElement("span");
        probabilidad.textContent = numero(dia.probabilidadLluvia) + "% lluvia";

        const lluvia = document.createElement("span");
        lluvia.textContent = numero(dia.lluviaEsperadaMm, 1) + " mm";

        tarjeta.append(fecha, temperatura, probabilidad, lluvia);
        contenedor.append(tarjeta);
    }
}

/* Datos: programa la siguiente consulta de clima a medianoche. No recibe atributos. */
function programarActualizacionDelClima() {
    const ahora = new Date();
    const medianoche = new Date(
        ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, 0, 0
    );
    const milisegundosHastaMedianoche = medianoche.getTime() - ahora.getTime();

    setTimeout(async function () {
        if (terrenosResumen.length > 0) {
            await cargarClima(terrenosResumen);
        }
        programarActualizacionDelClima();
    }, milisegundosHastaMedianoche);
}

/* Datos: conecta los controles de la página y ejecuta la carga inicial. No recibe atributos. */
function iniciarResumen() {
    const usuarioResumen = usuarioActual();
    if (window.location.hostname === "127.0.0.1") {
        window.location.replace(window.location.href.replace("127.0.0.1", "localhost"));
    } else if (usuarioResumen && (usuarioResumen.rol === "administrador_agricultor" || usuarioResumen.rol === "agricultor")) {
        setInterval(function () {
            cargarResumen(false);
        }, 60000);

        programarActualizacionDelClima();
        cargarResumen(true);
    } else {
        window.location.replace("../login.html?motivo=sesion");
    }
}

iniciarResumen();
