/**
 * @file Consulta existencias y permite registrar entradas y salidas de inventario.
 *
 * @author Equipo de Gestión de Cultivos
 */

const API_MOVIMIENTOS_EMPLEADO = 'http://localhost:8081/api';
const selectorLoteEmpleado = document.getElementById('lote-movimiento');
const cuerpoExistenciasEmpleado = document.getElementById('existencias-empleado');
const cuerpoMovimientosEmpleado = document.getElementById('lista-movimientos-empleado');
const mensajeMovimientoEmpleado = document.getElementById('mensaje-movimiento-empleado');
const formularioMovimientoEmpleado = document.getElementById('formulario-movimiento-empleado');
let inventarioEmpleado = [];
let movimientosEmpleado = [];

/**
 * Consulta existencias y movimientos desde la API.
 */
async function cargarInventarioEmpleado() {
    mensajeMovimientoEmpleado.textContent = 'Cargando existencias y movimientos…';
    try {
        const resultados = await Promise.all([
            fetch(API_MOVIMIENTOS_EMPLEADO + '/inventario'),
            fetch(API_MOVIMIENTOS_EMPLEADO + '/movimientos-inventario')
        ]);
        if (!resultados[0].ok || !resultados[1].ok) throw new Error('No se pudieron consultar las existencias o sus movimientos.');
        inventarioEmpleado = await resultados[0].json();
        movimientosEmpleado = await resultados[1].json();
        dibujarInventarioEmpleado();
        dibujarMovimientosEmpleado();
        mensajeMovimientoEmpleado.textContent = '';
    } catch (error) {
        mensajeMovimientoEmpleado.textContent = error.message;
    }
}

/**
 * Muestra las existencias y llena el selector de lotes.
 */
function dibujarInventarioEmpleado() {
    cuerpoExistenciasEmpleado.replaceChildren();
    selectorLoteEmpleado.replaceChildren(new Option('Selecciona un lote', ''));
    inventarioEmpleado.forEach(function (lote) {
        const nombre = lote.nombreInsumo || ('Insumo #' + lote.idInsumo);
        selectorLoteEmpleado.add(new Option('#' + lote.idInventario + ' · ' + nombre + ' · ' + lote.cantidad + ' ' + lote.unidadMedida, String(lote.idInventario)));
        const fila = document.createElement('tr');
        ponerCeldaMovimiento(fila, '#' + lote.idInventario);
        ponerCeldaMovimiento(fila, nombre);
        ponerCeldaMovimiento(fila, lote.categoria);
        ponerCeldaMovimiento(fila, Number(lote.cantidad || 0).toLocaleString('es-MX'));
        ponerCeldaMovimiento(fila, lote.unidadMedida);
        ponerCeldaMovimiento(fila, lote.fechaCaducidad);
        cuerpoExistenciasEmpleado.appendChild(fila);
    });
}

/**
 * Muestra las entradas y salidas registradas.
 */
function dibujarMovimientosEmpleado() {
    cuerpoMovimientosEmpleado.replaceChildren();
    movimientosEmpleado.forEach(function (movimiento) {
        const fila = document.createElement('tr');
        const lote = inventarioEmpleado.find(function (item) { return Number(item.idInventario) === Number(movimiento.idInventario); });
        ponerCeldaMovimiento(fila, movimiento.fechaMovimiento ? String(movimiento.fechaMovimiento).replace('T', ' ') : '—');
        ponerCeldaMovimiento(fila, '#' + movimiento.idInventario + (lote ? ' · ' + lote.nombreInsumo : ''));
        ponerCeldaMovimiento(fila, movimiento.tipoMovimiento);
        ponerCeldaMovimiento(fila, movimiento.cantidad);
        ponerCeldaMovimiento(fila, movimiento.observacion);
        cuerpoMovimientosEmpleado.appendChild(fila);
    });
}

/**
 * Agrega una celda a la tabla de inventario.
 *
 * @param fila - Fila de la tabla que recibe la celda.
 * @param texto - Texto que se quiere mostrar.
 */
function ponerCeldaMovimiento(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto == null || texto === '' ? '—' : texto;
    fila.appendChild(celda);
}

/**
 * Coloca la fecha y hora locales en el formulario.
 */
function establecerFechaMovimiento() {
    const ahora = new Date();
    const desfase = ahora.getTimezoneOffset() * 60000;
    document.getElementById('fecha-movimiento').value = new Date(ahora - desfase).toISOString().slice(0, 16);
}

/**
 * Envía la entrada o salida de inventario.
 *
 * @param evento - El evento del formulario.
 */
async function guardarMovimientoEmpleado(evento) {
    evento.preventDefault();
    const error = document.getElementById('error-movimiento-empleado');
    const usuarioId = sessionStorage.getItem('usuarioId');
    if (!usuarioId) { error.textContent = 'Inicia sesión para registrar movimientos.'; return; }
    if (!formularioMovimientoEmpleado.reportValidity()) return;
    const datos = {
        idInventario: Number(selectorLoteEmpleado.value),
        idUsuario: Number(usuarioId),
        tipoMovimiento: document.getElementById('tipo-movimiento').value,
        cantidad: Number(document.getElementById('cantidad-movimiento').value),
        fechaMovimiento: document.getElementById('fecha-movimiento').value,
        observacion: document.getElementById('observacion-movimiento').value.trim()
    };
    const boton = document.getElementById('guardar-movimiento-empleado');
    boton.disabled = true;
    error.textContent = '';
    try {
        const respuesta = await fetch(API_MOVIMIENTOS_EMPLEADO + '/movimientos-inventario', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos)
        });
        const resultado = await respuesta.json().catch(function () { return {}; });
        if (!respuesta.ok) throw new Error(resultado.mensaje || resultado.message || 'No se pudo registrar el movimiento.');
        formularioMovimientoEmpleado.reset();
        establecerFechaMovimiento();
        await cargarInventarioEmpleado();
        mensajeMovimientoEmpleado.textContent = 'Movimiento guardado y existencia actualizada.';
    } catch (problema) {
        error.textContent = problema.message;
    }
    boton.disabled = false;
}

/**
 * Conecta los eventos de esta pantalla y carga los datos.
 */
function iniciarMovimientosEmpleado() {
    formularioMovimientoEmpleado.addEventListener('submit', guardarMovimientoEmpleado);
    establecerFechaMovimiento();
    cargarInventarioEmpleado();
}

iniciarMovimientosEmpleado();
