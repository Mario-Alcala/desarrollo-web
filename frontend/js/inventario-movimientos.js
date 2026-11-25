/**
 * @file Consulta lotes de inventario y registra sus movimientos.
 *
 * @author Equipo de Gestión de Cultivos
 */

const mensajeInventario = document.getElementById('mensaje-operacion');
const cuerpoExistencias = document.getElementById('registros-existencias');
const cuerpoMovimientos = document.getElementById('registros-movimientos');
const formularioMovimiento = document.getElementById('formulario-movimiento');
const selectLote = document.getElementById('idInventario');
const selectTipo = document.getElementById('tipoMovimiento');
const campoCantidad = document.getElementById('cantidad');
const campoFecha = document.getElementById('fechaMovimiento');
const campoObservacion = document.getElementById('observacion');
const textoUsuario = document.getElementById('usuario-sesion');
const botonGuardar = document.getElementById('guardar-movimiento');
const ayudaLote = document.getElementById('ayuda-lote');

let lotes = [];
let movimientos = [];
const usuario = usuarioActual();

/**
 * Consulta los lotes y los movimientos desde la API.
 */
function cargarDatos() {
    return Promise.all([pedirApi('/inventario'), pedirApi('/movimientos-inventario')])
        .then(function (resultados) {
            lotes = resultados[0] || [];
            movimientos = resultados[1] || [];
            dibujarExistencias();
            llenarLotes();
            dibujarMovimientos();
        });
}

/**
 * Muestra los lotes con sus cantidades.
 */
function dibujarExistencias() {
    cuerpoExistencias.innerHTML = '';
    lotes.forEach(function (lote) {
        const fila = document.createElement('tr');
        celdaTexto(fila, lote.nombreInsumo);
        celdaTexto(fila, lote.categoria);
        celdaTexto(fila, formatoNumero(lote.cantidad) + unidadDe(lote));
        celdaTexto(fila, lote.fechaIngreso);
        celdaTexto(fila, lote.fechaCaducidad);
        cuerpoExistencias.appendChild(fila);
    });
    if (!lotes.length) {
        filaVacia(cuerpoExistencias, 5, 'No hay existencias registradas. Las da de alta el administrador.');
    }
}

/**
 * Muestra los movimientos de inventario consultados.
 */
function dibujarMovimientos() {
    cuerpoMovimientos.innerHTML = '';
    const ordenados = movimientos.slice().sort(function (a, b) {
        return String(b.fechaMovimiento || '').localeCompare(String(a.fechaMovimiento || ''));
    });
    ordenados.forEach(function (movimiento) {
        const lote = loteDe(movimiento.idInventario);
        const fila = document.createElement('tr');
        celdaTexto(fila, formatoFechaHora(movimiento.fechaMovimiento));
        celdaTexto(fila, lote ? lote.nombreInsumo : 'Lote #' + movimiento.idInventario);
        celdaTexto(fila, movimiento.tipoMovimiento);
        celdaTexto(fila, formatoNumero(movimiento.cantidad) + unidadDe(lote));
        celdaTexto(fila, movimiento.observacion);
        cuerpoMovimientos.appendChild(fila);
    });
    if (!ordenados.length) {
        filaVacia(cuerpoMovimientos, 5, 'Todavía no hay movimientos.');
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
    return error.message || 'No se pudo completar la operación.';
}

/**
 * Obtiene la fecha y hora local para el registro.
 */
function ahoraLocal() {
    const ahora = new Date();
    const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

/**
 * Formatea una cantidad para la tabla.
 *
 * @param valor - El valor numérico.
 */
function formatoNumero(valor) {
    return Number(valor).toLocaleString('es-MX', { maximumFractionDigits: 2 });
}

/**
 * Formatea la fecha y hora para la tabla.
 *
 * @param valor - El valor de la API.
 */
function formatoFechaHora(valor) {
    return valor ? String(valor).replace('T', ' ').slice(0, 16) : '—';
}

/**
 * Agrega un valor a una fila de inventario.
 *
 * @param fila - Fila de la tabla que recibe la celda.
 * @param texto - Texto que se quiere mostrar.
 */
function celdaTexto(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto === null || texto === undefined || texto === '' ? '—' : texto;
    fila.appendChild(celda);
}

/**
 * Muestra un mensaje en la tabla.
 *
 * @param cuerpo - Cuerpo de la tabla.
 * @param columnas - Cantidad de columnas que cubre la celda.
 * @param texto - Texto que se quiere mostrar.
 */
function filaVacia(cuerpo, columnas, texto) {
    const fila = document.createElement('tr');
    const celda = document.createElement('td');
    celda.colSpan = columnas;
    celda.textContent = texto;
    fila.appendChild(celda);
    cuerpo.appendChild(fila);
}

/**
 * Busca el lote en el inventario consultado.
 *
 * @param id - El ID del lote.
 */
function loteDe(id) {
    return lotes.find(lote => lote.idInventario === id) || null;
}

/**
 * Obtiene la unidad de medida.
 *
 * @param lote - El lote.
 */
function unidadDe(lote) {
    return lote && lote.unidadMedida ? ' ' + lote.unidadMedida : '';
}

/**
 * Muestra la cantidad disponible del lote seleccionado.
 */
function actualizarAyuda() {
    const lote = loteDe(Number(selectLote.value));
    ayudaLote.textContent = lote
        ? 'Disponible: ' + formatoNumero(lote.cantidad) + unidadDe(lote) + '. Una salida no puede ser mayor.'
        : '';
}

/**
 * Llena el selector con los lotes consultados.
 */
function llenarLotes() {
    const elegido = selectLote.value;
    selectLote.innerHTML = '<option value="">Selecciona un lote</option>';
    lotes.forEach(function (lote) {
        const opcion = document.createElement('option');
        opcion.value = lote.idInventario;
        opcion.textContent = '#' + lote.idInventario + ' · ' + lote.nombreInsumo + ' · ' + formatoNumero(lote.cantidad) + unidadDe(lote);
        selectLote.appendChild(opcion);
    });
    selectLote.value = elegido;
    actualizarAyuda();
}

/**
 * Valida y registra un movimiento de inventario.
 *
 * @param evento - El evento del formulario.
 */
function guardarMovimientoInventario(evento) {
    evento.preventDefault();
    mensajeInventario.textContent = '';

    if (!usuario) {
        mensajeInventario.textContent = 'No hay sesión iniciada. Inicia sesión para registrar movimientos.';
        return;
    }
    if (!formularioMovimiento.reportValidity()) {
        return;
    }

    const lote = loteDe(Number(selectLote.value));
    const tipo = selectTipo.value;
    const cantidad = Number(campoCantidad.value);

    if (!lote) {
        mensajeInventario.textContent = 'Elige un lote existente.';
        return;
    }
    if (!(cantidad > 0)) {
        mensajeInventario.textContent = 'La cantidad debe ser mayor que cero.';
        return;
    }
    if (tipo === 'salida' && cantidad > Number(lote.cantidad)) {
        mensajeInventario.textContent = 'No hay suficiente: solo quedan ' + formatoNumero(lote.cantidad) + unidadDe(lote) + ' en este lote.';
        return;
    }

    let fecha = campoFecha.value;
    if (fecha.length === 16) {
        fecha += ':00';
    }

    const datos = {
        idInventario: lote.idInventario,
        idUsuario: usuario.idUsuario,
        tipoMovimiento: tipo,
        cantidad: cantidad,
        fechaMovimiento: fecha,
        observacion: campoObservacion.value.trim() || null
    };

    botonGuardar.disabled = true;
    pedirApi('/movimientos-inventario', 'POST', datos)
        .then(function () {
            formularioMovimiento.reset();
            campoFecha.value = ahoraLocal();
            return cargarDatos();
        })
        .then(function () {
            mensajeInventario.textContent = 'Movimiento registrado en el servidor.';
        })
        .catch(function (error) {
            mensajeInventario.textContent = textoError(error);
        })
        .finally(function () {
            botonGuardar.disabled = !usuario;
        });
}

/**
 * Conecta los eventos de esta pantalla y carga los datos.
 */
function iniciarMovimientosInventario() {
    formularioMovimiento.addEventListener('submit', guardarMovimientoInventario);
    selectLote.addEventListener('change', actualizarAyuda);
    document.getElementById('actualizar-operacion').onclick = function () {
        mensajeInventario.textContent = '';
        cargarDatos().catch(function (error) {
            mensajeInventario.textContent = textoError(error);
        });
    };
    campoFecha.value = ahoraLocal();
    if (usuario) {
        textoUsuario.textContent = usuario.nombre || 'Usuario #' + usuario.idUsuario;
    } else {
        textoUsuario.textContent = 'Sin sesión: inicia sesión para registrar movimientos';
        botonGuardar.disabled = true;
    }
    cargarDatos().catch(function (error) {
        mensajeInventario.textContent = textoError(error);
    });
}

iniciarMovimientosInventario();
