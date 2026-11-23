
var tablaCultivos = document.getElementById('tabla-cultivos');
var mensajeCultivos = document.getElementById('mensaje-cultivos');
var seleccionarCultivo = document.getElementById('cultivo-cosecha');
var formularioCosecha = document.getElementById('formulario-cosecha');
var mensajeCosecha = document.getElementById('mensaje-cosecha');
var botonGuardarCosecha = document.getElementById('guardar-cosecha');

// Agregar una celda a la tabla.
function agregarCeldaCultivo(fila, valor) {
    var celda = document.createElement('td');
    celda.textContent = valor == null || valor === '' ? '-' : valor;
    fila.appendChild(celda);
}

// Obtener una propiedad aunque el backend use otro formato.
function obtenerCampo(datos, campoJava, campoSql) {
    if (datos[campoJava] !== undefined) {
        return datos[campoJava];
    }

    return datos[campoSql];
}

// Consultar los cultivos existentes.
function cargarCultivos() {
    mensajeCultivos.textContent = 'Cargando cultivos...';

    tablaCultivos.innerHTML = '';
    seleccionarCultivo.innerHTML =
        '<option value="">Selecciona un cultivo</option>';

    botonGuardarCosecha.disabled = true;

    return pedirApi('/cultivos', 'GET')
        .then(function(cultivos) {

            if (!Array.isArray(cultivos)) {
                throw new Error('La API no devolvió una lista de cultivos.');
            }

            // Mostrar solamente cultivos activos.
            var activos = cultivos;


            mensajeCultivos.textContent =
                'Se encontraron ' + activos.length + ' cultivos activos.';

            activos.forEach(function(cultivo) {

                var id = obtenerCampo(cultivo, 'id', 'id');
                var parcela = obtenerCampo(
                    cultivo, 'idParcela', 'id_parcela'
                );
                var etapa = obtenerCampo(
                    cultivo, 'etapaFenologica', 'etapa_fenologica'
                );
                var fecha = obtenerCampo(
                    cultivo, 'fechaSiembra', 'fecha_siembra'
                );

                // Mostrar datos en la tabla.
                var fila = document.createElement('tr');

                agregarCeldaCultivo(fila, id);
                agregarCeldaCultivo(fila, cultivo.nombre);
                agregarCeldaCultivo(fila, cultivo.familia);
                agregarCeldaCultivo(fila, parcela);
                agregarCeldaCultivo(fila, etapa);
                agregarCeldaCultivo(fila, fecha);
                agregarCeldaCultivo(fila, cultivo.estado);

                tablaCultivos.appendChild(fila);

                // Agregar el cultivo al selector.
                if (id != null) {
                    var opcion = document.createElement('option');

                    opcion.value = id;
                    opcion.textContent =
                        cultivo.nombre + ' - Parcela ' + parcela;

                    seleccionarCultivo.appendChild(opcion);
                }
            });

            botonGuardarCosecha.disabled =
                seleccionarCultivo.options.length <= 1;
        })
        .catch(function(error) {
            mensajeCultivos.textContent =
                'No se pudieron cargar los cultivos: ' + error.message;

            console.error('Error consultando cultivos:', error);
        });
}

// Actualizar cultivos.
document.getElementById('actualizar-cultivos')
    .addEventListener('click', cargarCultivos);

// Registrar cosecha.
formularioCosecha.addEventListener('submit', function(evento) {
    evento.preventDefault();

    if (!formularioCosecha.reportValidity()) {
        return;
    }

    var kilos = document.getElementById('kilos-cosecha').value;

    var datos = {
        idCultivo: Number(seleccionarCultivo.value),
        fechaCosecha: document.getElementById('fecha-cosecha').value,
        cantidadCosechada: Number(kilos),
        estadoMaduracion:
            document.getElementById('maduracion-cosecha').value,
        ubicacionBodega:
            document.getElementById('bodega-cosecha').value.trim()
    };

    if (datos.idCultivo <= 0 || datos.cantidadCosechada <= 0 ||
        !Number.isFinite(datos.cantidadCosechada) ||
        !/^\d+(\.\d{1,2})?$/.test(kilos) ||
        !datos.ubicacionBodega) {
        mensajeCosecha.textContent =
            'Revisa el cultivo, los kilos y la ubicación en bodega.';
        return;
    }

    botonGuardarCosecha.disabled = true;
    mensajeCosecha.textContent = 'Guardando cosecha...';

    pedirApi('/cosechas', 'POST', datos)
        .then(function() {
            mensajeCosecha.textContent =
                'Cosecha registrada correctamente.';

            formularioCosecha.reset();
        })
        .catch(function(error) {
            mensajeCosecha.textContent =
                'No se pudo guardar la cosecha: ' + error.message;
        })
        .finally(function() {
            botonGuardarCosecha.disabled = false;
        });
});

// Cargar cultivos al abrir la página.
cargarCultivos();
