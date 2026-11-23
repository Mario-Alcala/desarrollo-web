
var formularioParcela = document.getElementById('formulario-parcela');
var mensajeParcela = document.getElementById('mensaje-parcela');
var listaParcelas = document.getElementById('lista-parcelas');
var terrenosSelect = document.getElementById('terreno-parcela');

var parcelasGuardadas = [];
var idEditando = null;

// Cargar terrenos registrados por el administrador.
function cargarTerrenos() {
    return pedirApi('/terrenos', 'GET').then(function(terrenos) {
        terrenosSelect.innerHTML =
            '<option value="">Selecciona un terreno</option>';

        terrenos.forEach(function(terreno) {
            var opcion = document.createElement('option');
            opcion.value = terreno.id;
            opcion.textContent = terreno.nombre;
            terrenosSelect.appendChild(opcion);
        });
    }).catch(function(error) {
        mensajeParcela.textContent =
            'No se pudieron cargar los terrenos: ' + error.message;
    });
}

// Crear una celda para la tabla.
function agregarTexto(fila, texto) {
    var celda = document.createElement('td');
    celda.textContent = texto;
    fila.appendChild(celda);
}

// Consultar las parcelas reales.
function cargarParcelas() {
    return pedirApi('/parcelas', 'GET').then(function(parcelas) {
        parcelasGuardadas = parcelas;
        listaParcelas.innerHTML = '';

        if (parcelas.length === 0) {
            var filaVacia = document.createElement('tr');
            var celda = document.createElement('td');
            celda.colSpan = 5;
            celda.textContent = 'No hay parcelas registradas.';
            filaVacia.appendChild(celda);
            listaParcelas.appendChild(filaVacia);
            return;
        }

        parcelas.forEach(function(parcela) {
            var fila = document.createElement('tr');

            agregarTexto(fila, parcela.nombreTerreno);
            agregarTexto(fila, parcela.nombre);
            agregarTexto(fila, Number(parcela.superficieM2).toFixed(2));
            agregarTexto(fila, parcela.estado);

            var acciones = document.createElement('td');

            var editar = document.createElement('button');
            editar.type = 'button';
            editar.textContent = 'Editar';
            editar.className = 'boton boton-secundario';
            editar.onclick = function() {
                editarParcela(parcela.idParcela);
            };

            var eliminar = document.createElement('button');
            eliminar.type = 'button';
            eliminar.textContent = 'Eliminar';
            eliminar.className = 'boton boton-secundario';
            eliminar.onclick = function() {
                eliminarParcela(parcela.idParcela);
            };

            acciones.appendChild(editar);
            acciones.appendChild(eliminar);
            fila.appendChild(acciones);
            listaParcelas.appendChild(fila);
        });
    }).catch(function(error) {
        mensajeParcela.textContent =
            'No se pudieron consultar las parcelas: ' + error.message;
    });
}

// Registrar o actualizar una parcela.
formularioParcela.addEventListener('submit', function(evento) {
    evento.preventDefault();

    if (!formularioParcela.reportValidity()) {
        return;
    }

    var datos = {
        idTerreno: Number(terrenosSelect.value),
        nombre: document.getElementById('nombre-parcela').value.trim(),
        superficieM2: document.getElementById('superficie-parcela').value,
        estado: document.getElementById('estado-parcela').value
    };

    var editando = idEditando !== null;
    var ruta = editando ? '/parcelas/' + idEditando : '/parcelas';
    var metodo = editando ? 'PUT' : 'POST';
    var boton = formularioParcela.querySelector('button[type="submit"]');

    boton.disabled = true;
    mensajeParcela.textContent = 'Guardando parcela...';

    pedirApi(ruta, metodo, datos)
        .then(function() {
            cancelarEdicion();
            return cargarParcelas();
        })
        .then(function() {
            mensajeParcela.textContent =
                'Parcela guardada correctamente.';
        })
        .catch(function(error) {
            mensajeParcela.textContent =
                'No se pudo guardar: ' + error.message;
        })
        .finally(function() {
            boton.disabled = false;
        });
});

// Mostrar los datos en el formulario.
function editarParcela(id) {
    var parcela = parcelasGuardadas.find(function(p) {
        return Number(p.idParcela) === Number(id);
    });

    if (!parcela) {
        return;
    }

    idEditando = id;

    terrenosSelect.value = parcela.idTerreno;
    document.getElementById('nombre-parcela').value = parcela.nombre;
    document.getElementById('superficie-parcela').value =
        parcela.superficieM2;
    document.getElementById('estado-parcela').value = parcela.estado;

    mensajeParcela.textContent = 'Editando parcela seleccionada.';
    formularioParcela.scrollIntoView({ behavior: 'smooth' });
}

// Eliminar una parcela.
function eliminarParcela(id) {
    if (!confirm('¿Deseas eliminar esta parcela?')) {
        return;
    }

    pedirApi('/parcelas/' + id, 'DELETE')
        .then(function() {
            return cargarParcelas();
        })
        .then(function() {
            mensajeParcela.textContent = 'Parcela eliminada.';
        })
        .catch(function(error) {
            mensajeParcela.textContent =
                'No se pudo eliminar: ' + error.message;
        });
}

function cancelarEdicion() {
    idEditando = null;
    formularioParcela.reset();
}

document.getElementById('cancelar-parcela').onclick = cancelarEdicion;
document.getElementById('actualizar-parcelas').onclick = cargarParcelas;

// Cargar datos al abrir la página.
cargarTerrenos();
cargarParcelas();
