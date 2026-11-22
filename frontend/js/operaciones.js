var formularioOperacion = document.getElementById('formulario-operacion');
var rutaOperacion = formularioOperacion.dataset.ruta;
var campoId = formularioOperacion.dataset.id;
var idOperacion = null;
var registrosOperacion = [];
var mensajeOperacion = document.getElementById('mensaje-operacion');
var camposOperacion = formularioOperacion.querySelectorAll('[name]');

async function cargarRelaciones() {
    var selectores = formularioOperacion.querySelectorAll('select[data-ruta]');
    for (var i = 0; i < selectores.length; i++) {
        var select = selectores[i];
        var datos = await pedirApi(select.dataset.ruta);
        select.innerHTML = '<option value="">Selecciona una opción</option>';
        for (var j = 0; j < datos.length; j++) {
            var opcion = document.createElement('option');
            opcion.value = datos[j][select.dataset.id];
            opcion.textContent = datos[j][select.dataset.nombre];
            select.appendChild(opcion);
        }
    }
    if (document.getElementById('proveedorNombre')) {
        await cargarProveedores();
    }
}

async function cargarRegistros() {
    mensajeOperacion.textContent = '';
    var datos = await pedirApi(rutaOperacion);
    registrosOperacion = datos || [];
    dibujarRegistros();
    mensajeOperacion.textContent = '';
}

function dibujarRegistros() {
    var cuerpo = document.getElementById('registros-operacion');
    cuerpo.innerHTML = '';
    var columnas = document.querySelectorAll('th[data-campo]');

    for (let i = 0; i < registrosOperacion.length; i++) {
        let registro = registrosOperacion[i];
        var fila = document.createElement('tr');

        for (var j = 0; j < columnas.length; j++) {
            var columna = columnas[j];
            var celda = document.createElement('td');
            var valor = registro[columna.dataset.campo];
            if (columna.dataset.campo === 'idProveedor' && document.getElementById('proveedorNombre')) {
                valor = nombreProveedor(registro.idProveedor);
            }
            var select = formularioOperacion.querySelector('select[name="' + columna.dataset.campo + '"]');

            if (select && select.dataset.ruta) {
                for (var k = 0; k < select.options.length; k++) {
                    if (select.options[k].value === String(valor)) {
                        valor = select.options[k].textContent;
                        break;
                    }
                }
            }

            celda.textContent = valor === null || valor === undefined ? '—' : valor;
            fila.appendChild(celda);
        }

        var acciones = document.createElement('td');

        var editar = document.createElement('button');
        editar.className = 'boton boton-secundario';
        editar.textContent = 'Editar';
        editar.onclick = function () {
            idOperacion = registro[campoId];
            for (var i = 0; i < camposOperacion.length; i++) {
                var campo = camposOperacion[i];
                if (campo.name === 'proveedorNombre') {
                    campo.value = nombreProveedor(registro.idProveedor);
                } else {
                    campo.value = registro[campo.name] === null || registro[campo.name] === undefined ? '' : registro[campo.name];
                }
            }
            document.getElementById('guardar-operacion').textContent = 'Guardar cambios';
            camposOperacion[0].focus();
        };

        var eliminar = document.createElement('button');
        eliminar.className = 'boton boton-secundario';
        eliminar.textContent = 'Eliminar';
        eliminar.onclick = async function () {
            if (!confirm('¿Eliminar este registro?')) {
                return;
            }
            eliminar.disabled = true;
            try {
                await pedirApi(rutaOperacion + '/' + registro[campoId], 'DELETE');
                limpiarOperacion();
                await cargarRegistros();
            } catch (error) {
                mensajeOperacion.textContent = errorApi(error);
                eliminar.disabled = false;
            }
        };

        acciones.appendChild(editar);
        acciones.appendChild(eliminar);
        fila.appendChild(acciones);
        cuerpo.appendChild(fila);
    }

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

formularioOperacion.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    for (var i = 0; i < camposOperacion.length; i++) {
        var campo = camposOperacion[i];
        if (campo.type === 'text' || campo.tagName === 'TEXTAREA') {
            campo.value = campo.value.trim();
        }
    }

    if (!formularioOperacion.reportValidity()) {
        return;
    }

    var datos = {};
    for (var i = 0; i < camposOperacion.length; i++) {
        var campo = camposOperacion[i];
        var valor = campo.value;
        datos[campo.name] = valor === ''
            ? null
            : (campo.type === 'number' || campo.dataset.numero ? Number(valor) : valor);
    }

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

    try {
        var datosListos = datos;
        if (document.getElementById('proveedorNombre')) {
            datosListos = await resolverProveedor(datos);
        }
        await pedirApi(ruta, idOperacion === null ? 'POST' : 'PUT', datosListos);
        limpiarOperacion();
        await cargarRegistros();
        mensajeOperacion.textContent = 'Registro guardado en el servidor.';
    } catch (error) {
        mensajeOperacion.textContent = errorApi(error);
    }
    boton.disabled = false;
});

async function actualizarOperacion() {
    document.getElementById('guardar-operacion').disabled = true;
    try {
        await cargarRelaciones();
        await cargarRegistros();
    } catch (error) {
        mensajeOperacion.textContent = errorApi(error);
    }
    document.getElementById('guardar-operacion').disabled = false;
}

document.getElementById('cancelar-operacion').onclick = limpiarOperacion;
document.getElementById('actualizar-operacion').onclick = actualizarOperacion;
actualizarOperacion();
