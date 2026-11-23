/*
 * ARCHIVO: js/inventario-movimientos.js
 * CAPA: FRONTEND (lógica). Pantalla de inventario del trabajador.
 * QUÉ USA DEL BACKEND: GET /inventario, GET /movimientos-inventario y POST /movimientos-inventario
 *   (con pedirApi() de js/api.js). Nunca crea artículos ni existencias: no hace POST a /inventario.
 * SESIÓN: el usuario sale de usuarioActual() (js/sesion.js); no hay campo ni selector de usuario.
 * LE FALTA: que el login guarde la sesión (hoy js/ap.js no lo hace).
 * NO CONFIRMADO: si el servicio del backend actualiza la cantidad del lote y valida las salidas
 *   (no se vio MovimientoInventarioService).
 */

var mensajeInventario = document.getElementById('mensaje-operacion');
var cuerpoExistencias = document.getElementById('registros-existencias');
var cuerpoMovimientos = document.getElementById('registros-movimientos');
var formularioMovimiento = document.getElementById('formulario-movimiento');
var selectLote = document.getElementById('idInventario');
var selectTipo = document.getElementById('tipoMovimiento');
var campoCantidad = document.getElementById('cantidad');
var campoFecha = document.getElementById('fechaMovimiento');
var campoObservacion = document.getElementById('observacion');
var textoUsuario = document.getElementById('usuario-sesion');
var botonGuardar = document.getElementById('guardar-movimiento');
var ayudaLote = document.getElementById('ayuda-lote');

var lotes = [];
var movimientos = [];
var usuario = usuarioActual();

function textoError(error) {
    if (error instanceof TypeError) {
        return 'No hay conexión con el servidor. Revisa que el backend esté corriendo.';
    }
    return error.message || 'No se pudo completar la operación.';
}

function ahoraLocal() {
    var ahora = new Date();
    var local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function formatoNumero(valor) {
    return Number(valor).toLocaleString('es-MX', { maximumFractionDigits: 2 });
}

function formatoFechaHora(valor) {
    return valor ? String(valor).replace('T', ' ').slice(0, 16) : '—';
}

function celdaTexto(fila, texto) {
    var celda = document.createElement('td');
    celda.textContent = texto === null || texto === undefined || texto === '' ? '—' : texto;
    fila.appendChild(celda);
}

function filaVacia(cuerpo, columnas, texto) {
    var fila = document.createElement('tr');
    var celda = document.createElement('td');
    celda.colSpan = columnas;
    celda.textContent = texto;
    fila.appendChild(celda);
    cuerpo.appendChild(fila);
}

function loteDe(id) {
    for (var i = 0; i < lotes.length; i++) {
        if (lotes[i].idInventario === id) {
            return lotes[i];
        }
    }
    return null;
}

function unidadDe(lote) {
    return lote && lote.unidadMedida ? ' ' + lote.unidadMedida : '';
}

function dibujarExistencias() {
    cuerpoExistencias.innerHTML = '';
    lotes.forEach(function (lote) {
        var fila = document.createElement('tr');
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

function actualizarAyuda() {
    var lote = loteDe(Number(selectLote.value));
    ayudaLote.textContent = lote
        ? 'Disponible: ' + formatoNumero(lote.cantidad) + unidadDe(lote) + '. Una salida no puede ser mayor.'
        : '';
}

function llenarLotes() {
    var elegido = selectLote.value;
    selectLote.innerHTML = '<option value="">Selecciona un lote</option>';
    lotes.forEach(function (lote) {
        var opcion = document.createElement('option');
        opcion.value = lote.idInventario;
        opcion.textContent = '#' + lote.idInventario + ' · ' + lote.nombreInsumo + ' · ' + formatoNumero(lote.cantidad) + unidadDe(lote);
        selectLote.appendChild(opcion);
    });
    selectLote.value = elegido;
    actualizarAyuda();
}

function dibujarMovimientos() {
    cuerpoMovimientos.innerHTML = '';
    var ordenados = movimientos.slice().sort(function (a, b) {
        return String(b.fechaMovimiento || '').localeCompare(String(a.fechaMovimiento || ''));
    });
    ordenados.forEach(function (movimiento) {
        var lote = loteDe(movimiento.idInventario);
        var fila = document.createElement('tr');
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

formularioMovimiento.addEventListener('submit', function (evento) {
    evento.preventDefault();
    mensajeInventario.textContent = '';

    if (!usuario) {
        mensajeInventario.textContent = 'No hay sesión iniciada. Inicia sesión para registrar movimientos.';
        return;
    }
    if (!formularioMovimiento.reportValidity()) {
        return;
    }

    var lote = loteDe(Number(selectLote.value));
    var tipo = selectTipo.value;
    var cantidad = Number(campoCantidad.value);

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

    var fecha = campoFecha.value;
    if (fecha.length === 16) {
        fecha += ':00';
    }

    var datos = {
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
});

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