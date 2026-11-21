var formularioOperacion = document.getElementById('formulario-operacion');
var rutaOperacion = formularioOperacion.dataset.ruta;
var campoId = formularioOperacion.dataset.id;
var idOperacion = null;
var registrosOperacion = [];
var mensajeOperacion = document.getElementById('mensaje-operacion');
var camposOperacion = formularioOperacion.querySelectorAll('[name]');

function cargarRelaciones() {
    var pendientes = [];

    formularioOperacion.querySelectorAll('select[data-ruta]').forEach(function (select) {
        pendientes.push(
            pedirApi(select.dataset.ruta).then(function (datos) {
                select.innerHTML = '<option value="">Selecciona una opción</option>';
                datos.forEach(function (dato) {
                    var opcion = document.createElement('option');
                    opcion.value = dato[select.dataset.id];
                    opcion.textContent = dato[select.dataset.nombre];
                    select.appendChild(opcion);
                });
            })
        );
    });

    if (document.getElementById('proveedorNombre')) {
        pendientes.push(cargarProveedores());
    }
    return Promise.all(pendientes);
}

function cargarRegistros() {
    mensajeOperacion.textContent = '';

    return pedirApi(rutaOperacion).then(function (datos) {
        registrosOperacion = datos || [];
        dibujarRegistros();
        mensajeOperacion.textContent = '';
    });
}

function dibujarRegistros() {
    var cuerpo = document.getElementById('registros-operacion');
    cuerpo.innerHTML = '';
    var columnas = document.querySelectorAll('th[data-campo]');

    registrosOperacion.forEach(function (registro) {
        var fila = document.createElement('tr');

        columnas.forEach(function (columna) {
            var celda = document.createElement('td');
            var valor = registro[columna.dataset.campo];
            if (columna.dataset.campo === 'idProveedor' && document.getElementById('proveedorNombre')) {
                valor = nombreProveedor(registro.idProveedor);
            }
            var select = formularioOperacion.querySelector('select[name="' + columna.dataset.campo + '"]');

            if (select && select.dataset.ruta) {
                for (var i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === String(valor)) {
                        valor = select.options[i].textContent;
                        break;
                    }
                }
            }

            celda.textContent = valor === null || valor === undefined ? '—' : valor;
            fila.appendChild(celda);
        });

        var acciones = document.createElement('td');

        var editar = document.createElement('button');
        editar.className = 'boton boton-secundario';
        editar.textContent = 'Editar';
        editar.onclick = function () {
            idOperacion = registro[campoId];
            camposOperacion.forEach(function (campo) {
                if (campo.name === 'proveedorNombre') {
                    campo.value = nombreProveedor(registro.idProveedor);
                } else {
                    campo.value = registro[campo.name] === null || registro[campo.name] === undefined ? '' : registro[campo.name];
                }
            });
            document.getElementById('guardar-operacion').textContent = 'Guardar cambios';
            camposOperacion[0].focus();
        };

        var eliminar = document.createElement('button');
        eliminar.className = 'boton boton-secundario';
        eliminar.textContent = 'Eliminar';
        eliminar.onclick = function () {
            if (!confirm('¿Eliminar este registro?')) {
                return;
            }
            eliminar.disabled = true;
            pedirApi(rutaOperacion + '/' + registro[campoId], 'DELETE')
                .then(function () {
                    limpiarOperacion();
                    return cargarRegistros();
                })
                .catch(function (error) {
                    mensajeOperacion.textContent = errorApi(error);
                    eliminar.disabled = false;
                });
        };

        acciones.appendChild(editar);
        acciones.appendChild(eliminar);
        fila.appendChild(acciones);
        cuerpo.appendChild(fila);
    });

    if (!registrosOperacion.length) {
        var fila = document.createElement('tr');
        var celda = document.createElement('td');
        celda.colSpan = columnas.length + 1;
        celda.textContent = 'No hay registros.';
        fila.appendChild(celda);
        cuerpo.appendChild(fila);
    }
}

function limpiarOperacion() {
    idOperacion = null;
    formularioOperacion.reset();
    document.getElementById('guardar-operacion').textContent = 'Guardar';
}

formularioOperacion.addEventListener('submit', function (evento) {
    evento.preventDefault();

    camposOperacion.forEach(function (campo) {
        if (campo.type === 'text' || campo.tagName === 'TEXTAREA') {
            campo.value = campo.value.trim();
        }
    });

    if (!formularioOperacion.reportValidity()) {
        return;
    }

    var datos = {};
    camposOperacion.forEach(function (campo) {
        var valor = campo.value;
        datos[campo.name] = valor === ''
            ? null
            : (campo.type === 'number' || campo.dataset.numero ? Number(valor) : valor);
    });

    if (datos.fechaCaducidad && datos.fechaIngreso && datos.fechaCaducidad < datos.fechaIngreso) {
        mensajeOperacion.textContent = 'La caducidad no puede ser anterior al ingreso.';
        return;
    }

    if ((datos.latitud === null) !== (datos.longitud === null)) {
        mensajeOperacion.textContent = 'Completa latitud y longitud juntas, o deja ambas vacías.';
        return;
    }

    var boton = document.getElementById('guardar-operacion');
    boton.disabled = true;
    var ruta = rutaOperacion + (idOperacion === null ? '' : '/' + idOperacion);

    var preparar = document.getElementById('proveedorNombre') ? resolverProveedor(datos) : Promise.resolve(datos);
    preparar.then(function (datosListos) {
        return pedirApi(ruta, idOperacion === null ? 'POST' : 'PUT', datosListos);
    })
        .then(function () {
            limpiarOperacion();
            return cargarRegistros().then(function () {
                mensajeOperacion.textContent = 'Registro guardado en el servidor.';
            });
        })
        .catch(function (error) {
            mensajeOperacion.textContent = errorApi(error);
        })
        .finally(function () {
            boton.disabled = false;
        });
});

function actualizarOperacion() {
    document.getElementById('guardar-operacion').disabled = true;
    return cargarRelaciones()
        .then(cargarRegistros)
        .then(function () {
            document.getElementById('guardar-operacion').disabled = false;
        })
        .catch(function (error) {
            mensajeOperacion.textContent = errorApi(error);
        });
}

document.getElementById('cancelar-operacion').onclick = limpiarOperacion;
document.getElementById('actualizar-operacion').onclick = actualizarOperacion;
actualizarOperacion();