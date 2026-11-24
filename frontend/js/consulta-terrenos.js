/* Datos: este archivo consulta terrenos y permite ver las parcelas de cada uno. No recibe atributos. */

const mensajeTerrenos = document.getElementById('mensaje-operacion');
const cuerpoTerrenos = document.getElementById('registros-terrenos');
const cuerpoParcelas = document.getElementById('registros-parcelas');
const tituloParcelas = document.getElementById('titulo-parcelas');

/* Datos: esta función consulta los terrenos de la API y actualiza la tabla. No recibe atributos. */
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

/* Datos: esta función consulta las parcelas del terreno seleccionado. Recibe el terreno y el botón. */
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

/* Datos: esta función muestra la tabla de terrenos. Recibe la lista de la API. */
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

/* Datos: esta función muestra las parcelas del terreno. Recibe el terreno y su lista de parcelas. */
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

/* Datos: esta función prepara un mensaje para errores de consulta o guardado. Recibe el error. */
function textoError(error) {
    if (error instanceof TypeError) {
        return 'No hay conexión con el servidor. Revisa que el backend esté corriendo.';
    }
    return error.message || 'No se pudo cargar la información.';
}

/* Datos: esta función convierte la superficie a metros cuadrados. Recibe el valor en hectáreas. */
function m2DesdeHectareas(ha) {
    if (ha === null || ha === undefined || ha === '') {
        return '—';
    }
    return Math.round(Number(ha) * 10000).toLocaleString('es-MX') + ' m²';
}

/* Datos: esta función formatea la superficie de una parcela. Recibe el valor en metros cuadrados. */
function m2Parcela(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return '—';
    }
    return Number(valor).toLocaleString('es-MX', { maximumFractionDigits: 2 }) + ' m²';
}

/* Datos: esta función agrega una celda de texto. Recibe una fila y su texto. */
function agregarCelda(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto === null || texto === undefined || texto === '' ? '—' : texto;
    fila.appendChild(celda);
}

/* Datos: esta función muestra un mensaje en una fila. Recibe el cuerpo de la tabla, las columnas y el texto. */
function filaMensaje(cuerpo, columnas, texto) {
    const fila = document.createElement('tr');
    const celda = document.createElement('td');
    celda.colSpan = columnas;
    celda.textContent = texto;
    fila.appendChild(celda);
    cuerpo.appendChild(fila);
}

/* Datos: esta función conecta los eventos de esta pantalla y carga los datos. No recibe atributos. */
function iniciarConsultaTerrenos() {
    document.getElementById('actualizar-operacion').onclick = cargarTerrenos;
    cargarTerrenos();
}

iniciarConsultaTerrenos();
