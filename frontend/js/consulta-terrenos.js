/**
 * @file Consulta terrenos y permite ver las parcelas de cada uno.
 *
 * @author Equipo de Gestión de Cultivos
 */

const mensajeTerrenos = document.getElementById('mensaje-operacion');
const cuerpoTerrenos = document.getElementById('registros-terrenos');
const cuerpoParcelas = document.getElementById('registros-parcelas');
const tituloParcelas = document.getElementById('titulo-parcelas');

/**
 * Consulta los terrenos de la API y actualiza la tabla.
 */
function cargarTerrenos() {
    mensajeTerrenos.textContent = 'Cargando...';
    tituloParcelas.textContent = 'Parcelas';
    cuerpoParcelas.innerHTML = '';
    filaMensaje(cuerpoParcelas, 5, 'Elige un terreno para ver sus parcelas.');

    return pedirApi('/terrenos')
        .then(function (terrenos) {
            dibujarTerrenos(terrenos || []);
            mensajeTerrenos.textContent = '';
        })
        .catch(function (error) {
            mensajeTerrenos.textContent = textoError(error);
        });
}

/**
 * Consulta las parcelas del terreno seleccionado.
 *
 * @param terreno - Terreno al que pertenecen las parcelas.
 * @param boton - Botón asociado a la acción.
 */
function verParcelas(terreno, boton) {
    boton.disabled = true;
    mensajeTerrenos.textContent = '';
    pedirApi('/parcelas/terreno/' + terreno.id)
        .then(function (parcelas) {
            dibujarParcelas(terreno, parcelas || []);
        })
        .catch(function (error) {
            mensajeTerrenos.textContent = textoError(error);
        })
        .finally(function () {
            boton.disabled = false;
        });
}

/**
 * Muestra la tabla de terrenos.
 *
 * @param terrenos - La lista de la API.
 */
function dibujarTerrenos(terrenos) {
    cuerpoTerrenos.innerHTML = '';

    terrenos.forEach(function (terreno) {
        const fila = document.createElement('tr');
        agregarCelda(fila, terreno.nombre);
        agregarCelda(fila, terreno.ubicacion);
        agregarCelda(fila, m2DesdeHectareas(terreno.superficieHa));
        agregarCelda(fila, terreno.estado);

        const celdaBoton = document.createElement('td');
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'boton boton-secundario';
        boton.textContent = 'Ver parcelas';
        boton.onclick = function () {
            verParcelas(terreno, boton);
        };
        celdaBoton.appendChild(boton);
        fila.appendChild(celdaBoton);

        cuerpoTerrenos.appendChild(fila);
    });

    if (!terrenos.length) {
        filaMensaje(cuerpoTerrenos, 5, 'No hay terrenos registrados. Los da de alta el administrador.');
    }
}

/**
 * Muestra las parcelas del terreno.
 *
 * @param terreno - Terreno al que pertenecen las parcelas.
 * @param parcelas - Parcelas registradas en el terreno.
 */
function dibujarParcelas(terreno, parcelas) {
    tituloParcelas.textContent = 'Parcelas de ' + terreno.nombre;
    cuerpoParcelas.innerHTML = '';

    parcelas.forEach(function (parcela) {
        const fila = document.createElement('tr');
        agregarCelda(fila, parcela.nombre);
        agregarCelda(fila, m2Parcela(parcela.superficieM2));
        agregarCelda(fila, parcela.idCultivo ? 'ocupada' : 'disponible');
        agregarCelda(fila, parcela.cultivoNombre);
        agregarCelda(fila, parcela.etapaFenologica);
        cuerpoParcelas.appendChild(fila);
    });

    if (!parcelas.length) {
        filaMensaje(cuerpoParcelas, 5, 'Este terreno no tiene parcelas registradas.');
    }
}

/**
 * Prepara un mensaje para errores de consulta o guardado.
 *
 * @param error - El error.
 */
function textoError(error) {
    if (error instanceof TypeError) {
        return 'No hay conexión con el servidor. Revisa que el backend esté corriendo.';
    }
    return error.message || 'No se pudo cargar la información.';
}

/**
 * Convierte la superficie a metros cuadrados.
 *
 * @param ha - El valor en hectáreas.
 */
function m2DesdeHectareas(ha) {
    if (ha === null || ha === undefined || ha === '') {
        return '—';
    }
    return Math.round(Number(ha) * 10000).toLocaleString('es-MX') + ' m²';
}

/**
 * Formatea la superficie de una parcela.
 *
 * @param valor - El valor en metros cuadrados.
 */
function m2Parcela(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return '—';
    }
    return Number(valor).toLocaleString('es-MX', { maximumFractionDigits: 2 }) + ' m²';
}

/**
 * Agrega una celda de texto.
 *
 * @param fila - Fila de la tabla que recibe la celda.
 * @param texto - Texto que se quiere mostrar.
 */
function agregarCelda(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto === null || texto === undefined || texto === '' ? '—' : texto;
    fila.appendChild(celda);
}

/**
 * Muestra un mensaje en una fila.
 *
 * @param cuerpo - Cuerpo de la tabla.
 * @param columnas - Cantidad de columnas que cubre la celda.
 * @param texto - Texto que se quiere mostrar.
 */
function filaMensaje(cuerpo, columnas, texto) {
    const fila = document.createElement('tr');
    const celda = document.createElement('td');
    celda.colSpan = columnas;
    celda.textContent = texto;
    fila.appendChild(celda);
    cuerpo.appendChild(fila);
}

/**
 * Conecta los eventos de esta pantalla y carga los datos.
 */
function iniciarConsultaTerrenos() {
    document.getElementById('actualizar-operacion').onclick = cargarTerrenos;
    cargarTerrenos();
}

iniciarConsultaTerrenos();
