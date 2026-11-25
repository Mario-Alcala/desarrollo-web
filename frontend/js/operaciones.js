/**
 * @file Carga y guarda registros usando la ruta del formulario, incluida la pantalla de riegos.
 *
 * @author Equipo de Gestión de Cultivos
 */

const formularioOperacion = document.getElementById('formulario-operacion');
const rutaOperacion = formularioOperacion.dataset.ruta;
const campoId = formularioOperacion.dataset.id;
let idOperacion = null;
let registrosOperacion = [];
const mensajeOperacion = document.getElementById('mensaje-operacion');
const camposOperacion = formularioOperacion.querySelectorAll('[name]');

/**
 * Consulta la API para llenar los selectores relacionados con el formulario.
 */
async function cargarRelaciones() {
    const selectores = formularioOperacion.querySelectorAll('select[data-ruta]');
    for (let i = 0; i < selectores.length; i++) {
        const select = selectores[i];
        const datos = await pedirApi(select.dataset.ruta);
        select.innerHTML = '<option value="">Selecciona una opción</option>';
        for (let j = 0; j < datos.length; j++) {
            const opcion = document.createElement('option');
            opcion.value = datos[j][select.dataset.id];
            opcion.textContent = datos[j][select.dataset.nombre];
            select.appendChild(opcion);
        }
    }
    if (document.getElementById('proveedorNombre')) {
        await cargarProveedores();
    }
}

/**
 * Consulta los registros de la ruta que usa el formulario.
 */
async function cargarRegistros() {
    mensajeOperacion.textContent = '';
    const datos = await pedirApi(rutaOperacion);
    registrosOperacion = datos || [];
    dibujarRegistros();
    mensajeOperacion.textContent = '';
}

/**
 * Actualiza los selectores y la lista de registros.
 */
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

/**
 * Muestra los registros con sus acciones de edición y eliminación.
 */
function dibujarRegistros() {
    const cuerpo = document.getElementById('registros-operacion');
    cuerpo.innerHTML = '';
    const columnas = document.querySelectorAll('th[data-campo]');

    for (let i = 0; i < registrosOperacion.length; i++) {
        let registro = registrosOperacion[i];
        const fila = document.createElement('tr');

        for (let j = 0; j < columnas.length; j++) {
            const columna = columnas[j];
            const celda = document.createElement('td');
            let valor = registro[columna.dataset.campo];
            if (columna.dataset.campo === 'idProveedor' && document.getElementById('proveedorNombre')) {
                valor = nombreProveedor(registro.idProveedor);
            }
            const select = formularioOperacion.querySelector('select[name="' + columna.dataset.campo + '"]');

            if (select && select.dataset.ruta) {
                for (let k = 0; k < select.options.length; k++) {
                    if (select.options[k].value === String(valor)) {
                        valor = select.options[k].textContent;
                        break;
                    }
                }
            }

            celda.textContent = valor === null || valor === undefined ? '—' : valor;
            fila.appendChild(celda);
        }

        const acciones = document.createElement('td');

        const editar = document.createElement('button');
        editar.className = 'boton boton-secundario';
        editar.textContent = 'Editar';
        editar.onclick = function () {
            idOperacion = registro[campoId];
            for (let i = 0; i < camposOperacion.length; i++) {
                const campo = camposOperacion[i];
                if (campo.name === 'proveedorNombre') {
                    campo.value = nombreProveedor(registro.idProveedor);
                } else {
                    campo.value = registro[campo.name] === null || registro[campo.name] === undefined ? '' : registro[campo.name];
                }
            }
            document.getElementById('guardar-operacion').textContent = 'Guardar cambios';
            camposOperacion[0].focus();
        };

        const eliminar = document.createElement('button');
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
        const fila = document.createElement('tr');
        const celda = document.createElement('td');
        celda.colSpan = columnas.length + 1;
        celda.textContent = 'No hay registros.';
        fila.appendChild(celda);
        cuerpo.appendChild(fila);
    }
}

/**
 * Limpia el formulario y vuelve al modo de registro.
 */
function limpiarOperacion() {
    idOperacion = null;
    formularioOperacion.reset();
    document.getElementById('guardar-operacion').textContent = 'Guardar';
}

/**
 * Registra o actualiza los datos en la ruta del formulario.
 *
 * @param evento - El evento del formulario.
 */
async function guardarOperacion(evento) {
    evento.preventDefault();

    for (let i = 0; i < camposOperacion.length; i++) {
        const campo = camposOperacion[i];
        if (campo.type === 'text' || campo.tagName === 'TEXTAREA') {
            campo.value = campo.value.trim();
        }
    }

    if (!formularioOperacion.reportValidity()) {
        return;
    }

    const datos = {};
    for (let i = 0; i < camposOperacion.length; i++) {
        const campo = camposOperacion[i];
        let valor = campo.value;
        datos[campo.name] = valor === ''
            ? null
            : (campo.type === 'number' || campo.dataset.numero ? Number(valor) : valor);
    }

    if (['/riegos', '/observaciones-cultivos', '/incidencias-cultivo', '/cosechas', '/movimientos-inventario'].includes(rutaOperacion)) {
        const idUsuarioSesion = sessionStorage.getItem('usuarioId');
        if (!idUsuarioSesion) {
            mensajeOperacion.textContent = 'Inicia sesión para registrar esta actividad.';
            return;
        }
        datos.idUsuario = Number(idUsuarioSesion);
    }

    if (datos.fechaCaducidad && datos.fechaIngreso && datos.fechaCaducidad < datos.fechaIngreso) {
        mensajeOperacion.textContent = 'La caducidad no puede ser anterior al ingreso.';
        return;
    }

    if ((datos.latitud === null) !== (datos.longitud === null)) {
        mensajeOperacion.textContent = 'Completa latitud y longitud juntas, o deja ambas vacías.';
        return;
    }

    const boton = document.getElementById('guardar-operacion');
    boton.disabled = true;
    const ruta = rutaOperacion + (idOperacion === null ? '' : '/' + idOperacion);

    try {
        let datosListos = datos;
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
}

/**
 * Conecta los eventos de esta pantalla y carga los datos.
 */
function iniciarOperaciones() {
    formularioOperacion.addEventListener('submit', guardarOperacion);
    document.getElementById('cancelar-operacion').onclick = limpiarOperacion;
    document.getElementById('actualizar-operacion').onclick = actualizarOperacion;
    actualizarOperacion();
}

iniciarOperaciones();
