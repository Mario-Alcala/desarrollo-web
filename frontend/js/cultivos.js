
var tablaCultivos = document.getElementById('tabla-cultivos');
var mensajeCultivos = document.getElementById('mensaje-cultivos');
var seleccionarCultivo = document.getElementById('cultivo-cosecha');

function agregarCelda(fila, valor) {
    var celda = document.createElement('td');
    celda.textContent = valor == null ? '-' : valor;
    fila.appendChild(celda);
}

function cargarCultivos() {
    mensajeCultivos.textContent = 'Cargando cultivos...';

    pedirApi('/cultivos', 'GET')
        .then(function(cultivos) {

            tablaCultivos.innerHTML = '';

            seleccionarCultivo.innerHTML =
                '<option value="">Selecciona un cultivo</option>';

            var activos = cultivos.filter(function(cultivo) {
                return cultivo.estado === 'activo';
            });

            if (activos.length === 0) {
                mensajeCultivos.textContent =
                    'No hay cultivos activos registrados.';
                return;
            }

            mensajeCultivos.textContent =
                'Se encontraron ' + activos.length + ' cultivos activos.';

            activos.forEach(function(cultivo) {

                // Mostrar cultivo en la tabla.
                var fila = document.createElement('tr');

                agregarCelda(fila, cultivo.id);
                agregarCelda(fila, cultivo.nombre);
                agregarCelda(fila, cultivo.familia);
                agregarCelda(fila, cultivo.idParcela);
                agregarCelda(fila, cultivo.etapaFenologica);
                agregarCelda(fila, cultivo.fechaSiembra);
                agregarCelda(fila, cultivo.estado);

                tablaCultivos.appendChild(fila);

                // Agregar cultivo al selector de cosecha.
                var opcion = document.createElement('option');

                opcion.value = cultivo.id;
                opcion.textContent =
                    cultivo.nombre + ' - Parcela ' + cultivo.idParcela;

                seleccionarCultivo.appendChild(opcion);
            });

        })
        .catch(function(error) {
            mensajeCultivos.textContent =
                'No se pudieron cargar los cultivos: ' + error.message;
        });
}

document.getElementById('actualizar-cultivos')
    .addEventListener('click', cargarCultivos);

cargarCultivos();
