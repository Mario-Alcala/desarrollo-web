/*
 * ARCHIVO: js/consulta-terrenos.js
 * CAPA: FRONTEND (lógica). Pantalla de SOLO CONSULTA de terrenos y parcelas del trabajador.
 * QUÉ USA DEL BACKEND: GET /terrenos y GET /parcelas/terreno/{id}, con pedirApi() de js/api.js.
 *   No hace POST, PUT ni DELETE: los terrenos los da de alta el administrador.
 * SUPERFICIE: Terreno.java sigue guardando hectáreas (superficieHa) y Parcela.java ya usa m2
 *   (superficieM2). Aquí se convierte a m2 (hectáreas x 10,000) para mostrar lo mismo que el administrador.
 *   El arreglo de fondo es del backend.
 * ESTADO DE LA PARCELA: se calcula (ocupada si tiene cultivo, disponible si no), como pide el documento; no se usa el valor guardado, que no se actualiza.
 */

var mensajeTerrenos = document.getElementById('mensaje-operacion');
var cuerpoTerrenos = document.getElementById('registros-terrenos');
var cuerpoParcelas = document.getElementById('registros-parcelas');
var tituloParcelas = document.getElementById('titulo-parcelas');

function textoError(error) {
    if (error instanceof TypeError) {
        return 'No hay conexión con el servidor. Revisa que el backend esté corriendo.';
    }
    return error.message || 'No se pudo cargar la información.';
}

function m2DesdeHectareas(ha) {
    if (ha === null || ha === undefined || ha === '') {
        return '—';
    }
    return Math.round(Number(ha) * 10000).toLocaleString('es-MX') + ' m²';
}

function m2Parcela(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return '—';
    }
    return Number(valor).toLocaleString('es-MX', { maximumFractionDigits: 2 }) + ' m²';
}

function agregarCelda(fila, texto) {
    var celda = document.createElement('td');
    celda.textContent = texto === null || texto === undefined || texto === '' ? '—' : texto;
    fila.appendChild(celda);
}

function filaMensaje(cuerpo, columnas, texto) {
    var fila = document.createElement('tr');
    var celda = document.createElement('td');
    celda.colSpan = columnas;
    celda.textContent = texto;
    fila.appendChild(celda);
    cuerpo.appendChild(fila);
}

function dibujarTerrenos(terrenos) {
    cuerpoTerrenos.innerHTML = '';

    terrenos.forEach(function (terreno) {
        var fila = document.createElement('tr');
        agregarCelda(fila, terreno.nombre);
        agregarCelda(fila, terreno.ubicacion);
        agregarCelda(fila, m2DesdeHectareas(terreno.superficieHa));
        agregarCelda(fila, terreno.estado);

        var celdaBoton = document.createElement('td');
        var boton = document.createElement('button');
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

function dibujarParcelas(terreno, parcelas) {
    tituloParcelas.textContent = 'Parcelas de ' + terreno.nombre;
    cuerpoParcelas.innerHTML = '';

    parcelas.forEach(function (parcela) {
        var fila = document.createElement('tr');
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

document.getElementById('actualizar-operacion').onclick = cargarTerrenos;
cargarTerrenos();