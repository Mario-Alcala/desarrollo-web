/**
 * @file Consulta y registra observaciones e incidencias de cultivos.
 *
 * @author Equipo de Gestión de Cultivos
 */

const API_BITACORA = 'http://localhost:8081/api';
const tipoRegistroBitacora = document.getElementById('tipo-registro-bitacora');
const selectorCultivoBitacora = document.getElementById('cultivo-bitacora');
const listaBitacoraEmpleado = document.getElementById('lista-bitacora-empleado');
const mensajeBitacoraEmpleado = document.getElementById('mensaje-bitacora-empleado');

/**
 * Consulta los cultivos, observaciones e incidencias desde la API.
 */
async function cargarBitacoraEmpleado() {
    mensajeBitacoraEmpleado.textContent = 'Cargando cultivos y bitácora…';
    try {
        const respuestas = await Promise.all([
            fetch(API_BITACORA + '/cultivos'),
            fetch(API_BITACORA + '/observaciones-cultivos'),
            fetch(API_BITACORA + '/incidencias-cultivo')
        ]);
        if (respuestas.some(respuesta => !respuesta.ok)) {
            throw new Error('No se pudieron cargar los registros.');
        }
        const cultivos = await respuestas[0].json();
        const observaciones = await respuestas[1].json();
        const incidencias = await respuestas[2].json();
        dibujarBitacoraEmpleado(cultivos, observaciones, incidencias);
    } catch (error) {
        mensajeBitacoraEmpleado.textContent = error.message;
    }
}

/**
 * Llena el selector y muestra los registros por fecha.
 *
 * @param cultivos - Cultivos devueltos por la API.
 * @param observaciones - Observaciones devueltas por la API.
 * @param incidencias - Incidencias devueltas por la API.
 */
function dibujarBitacoraEmpleado(cultivos, observaciones, incidencias) {
    selectorCultivoBitacora.replaceChildren(new Option('Selecciona un cultivo', ''));
    for (const cultivo of cultivos) {
        selectorCultivoBitacora.add(new Option(cultivo.nombre, String(cultivo.id)));
    }

    listaBitacoraEmpleado.replaceChildren();
    const registros = [];
    for (const observacion of observaciones) {
        registros.push({
            fecha: observacion.fechaObservacion,
            idCultivo: observacion.idCultivo,
            tipo: 'Observación',
            detalle: observacion.descripcion,
            gravedad: ''
        });
    }
    for (const incidencia of incidencias) {
        registros.push({
            fecha: incidencia.fechaIncidencia,
            idCultivo: incidencia.idCultivo,
            tipo: incidencia.tipoIncidencia,
            detalle: incidencia.descripcion,
            gravedad: incidencia.nivelGravedad
        });
    }
    registros.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    for (const item of registros) {
        const cultivo = cultivos.find(c => Number(c.id) === Number(item.idCultivo));
        const fila = document.createElement('tr');
        celdaBitacora(fila, item.fecha);
        celdaBitacora(fila, cultivo ? cultivo.nombre : 'Cultivo #' + item.idCultivo);
        celdaBitacora(fila, item.tipo);
        celdaBitacora(fila, item.detalle);
        celdaBitacora(fila, item.gravedad);
        listaBitacoraEmpleado.appendChild(fila);
    }
    mensajeBitacoraEmpleado.textContent = registros.length ? '' : 'Todavía no hay registros de campo.';
}

/**
 * Agrega una celda de texto a la tabla.
 *
 * @param fila - Fila de la tabla que recibe la celda.
 * @param texto - Texto que se quiere mostrar.
 */
function celdaBitacora(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto || '—';
    fila.appendChild(celda);
}

/**
 * Muestra el tipo y la gravedad cuando se elige registrar una incidencia.
 */
function mostrarCamposIncidencia() {
    const incidencia = tipoRegistroBitacora.value === 'incidencia';
    document.getElementById('campo-tipo-incidencia').hidden = !incidencia;
    document.getElementById('campo-gravedad-incidencia').hidden = !incidencia;
}

/**
 * Guarda una observación o incidencia.
 *
 * @param evento - El evento del formulario.
 */
async function guardarBitacoraEmpleado(evento) {
    evento.preventDefault();
    const error = document.getElementById('error-bitacora-empleado');
    const idUsuario = sessionStorage.getItem('usuarioId');
    if (!idUsuario) {
        error.textContent = 'Inicia sesión para guardar el registro.';
        return;
    }
    const formulario = evento.currentTarget;
    if (!formulario.reportValidity()) return;
    const esIncidencia = tipoRegistroBitacora.value === 'incidencia';
    const datos = esIncidencia ? {
        idCultivo: Number(selectorCultivoBitacora.value),
        idUsuario: Number(idUsuario),
        fechaIncidencia: document.getElementById('fecha-bitacora').value,
        tipoIncidencia: document.getElementById('tipo-incidencia-bitacora').value,
        descripcion: document.getElementById('descripcion-bitacora').value.trim(),
        nivelGravedad: document.getElementById('gravedad-incidencia-bitacora').value
    } : {
        idCultivo: Number(selectorCultivoBitacora.value),
        idUsuario: Number(idUsuario),
        fechaObservacion: document.getElementById('fecha-bitacora').value,
        descripcion: document.getElementById('descripcion-bitacora').value.trim()
    };
    try {
        const respuesta = await fetch(API_BITACORA + (esIncidencia ? '/incidencias-cultivo' : '/observaciones-cultivos'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const resultado = await respuesta.json().catch(function () { return {}; });
        if (!respuesta.ok) throw new Error(resultado.mensaje || resultado.message || 'No se pudo guardar el registro.');
        formulario.reset();
        document.getElementById('fecha-bitacora').value = new Date().toISOString().slice(0, 10);
        mostrarCamposIncidencia();
        error.textContent = '';
        await cargarBitacoraEmpleado();
        mensajeBitacoraEmpleado.textContent = 'Registro agregado a la bitácora del cultivo.';
    } catch (problema) {
        error.textContent = problema.message;
    }
}

/**
 * Conecta los eventos de esta pantalla y carga los datos.
 */
function iniciarBitacoraEmpleado() {
    tipoRegistroBitacora.addEventListener('change', mostrarCamposIncidencia);
    document.getElementById('formulario-bitacora-empleado').addEventListener('submit', guardarBitacoraEmpleado);
    document.getElementById('fecha-bitacora').value = new Date().toISOString().slice(0, 10);
    mostrarCamposIncidencia();
    cargarBitacoraEmpleado();
}

iniciarBitacoraEmpleado();
