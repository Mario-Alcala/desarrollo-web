const API_BITACORA = 'http://localhost:8081/api';
const tipoRegistroBitacora = document.getElementById('tipo-registro-bitacora');
const selectorCultivoBitacora = document.getElementById('cultivo-bitacora');
const listaBitacoraEmpleado = document.getElementById('lista-bitacora-empleado');
const mensajeBitacoraEmpleado = document.getElementById('mensaje-bitacora-empleado');
let cultivosBitacora = [];

function celdaBitacora(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto || '—';
    fila.appendChild(celda);
}

function mostrarCamposIncidencia() {
    const incidencia = tipoRegistroBitacora.value === 'incidencia';
    document.getElementById('campo-tipo-incidencia').hidden = !incidencia;
    document.getElementById('campo-gravedad-incidencia').hidden = !incidencia;
}

async function cargarBitacoraEmpleado() {
    mensajeBitacoraEmpleado.textContent = 'Cargando cultivos y bitácora…';
    try {
        const respuestas = await Promise.all([
            fetch(API_BITACORA + '/cultivos'), fetch(API_BITACORA + '/observaciones-cultivos'), fetch(API_BITACORA + '/incidencias-cultivo')
        ]);
        if (respuestas.some(function (r) { return !r.ok; })) throw new Error('No se pudieron cargar los registros.');
        cultivosBitacora = await respuestas[0].json();
        const observaciones = await respuestas[1].json();
        const incidencias = await respuestas[2].json();
        selectorCultivoBitacora.replaceChildren(new Option('Selecciona un cultivo', ''));
        cultivosBitacora.forEach(function (cultivo) { selectorCultivoBitacora.add(new Option(cultivo.nombre, String(cultivo.id))); });
        listaBitacoraEmpleado.replaceChildren();
        const registros = [];
        observaciones.forEach(function (item) { registros.push({ fecha:item.fechaObservacion, idCultivo:item.idCultivo, tipo:'Observación', detalle:item.descripcion, gravedad:'' }); });
        incidencias.forEach(function (item) { registros.push({ fecha:item.fechaIncidencia, idCultivo:item.idCultivo, tipo:item.tipoIncidencia, detalle:item.descripcion, gravedad:item.nivelGravedad }); });
        registros.sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
        registros.forEach(function (item) {
            const cultivo = cultivosBitacora.find(function (c) { return Number(c.id) === Number(item.idCultivo); });
            const fila = document.createElement('tr');
            celdaBitacora(fila, item.fecha); celdaBitacora(fila, cultivo ? cultivo.nombre : 'Cultivo #' + item.idCultivo);
            celdaBitacora(fila, item.tipo); celdaBitacora(fila, item.detalle); celdaBitacora(fila, item.gravedad);
            listaBitacoraEmpleado.appendChild(fila);
        });
        mensajeBitacoraEmpleado.textContent = registros.length ? '' : 'Todavía no hay registros de campo.';
    } catch (error) { mensajeBitacoraEmpleado.textContent = error.message; }
}

tipoRegistroBitacora.addEventListener('change', mostrarCamposIncidencia);
document.getElementById('formulario-bitacora-empleado').addEventListener('submit', async function (evento) {
    evento.preventDefault();
    const error = document.getElementById('error-bitacora-empleado');
    const idUsuario = sessionStorage.getItem('usuarioId');
    if (!idUsuario) { error.textContent = 'Inicia sesión para guardar el registro.'; return; }
    const formulario = evento.currentTarget;
    if (!formulario.reportValidity()) return;
    const esIncidencia = tipoRegistroBitacora.value === 'incidencia';
    const datos = esIncidencia ? {
        idCultivo:Number(selectorCultivoBitacora.value), idUsuario:Number(idUsuario), fechaIncidencia:document.getElementById('fecha-bitacora').value,
        tipoIncidencia:document.getElementById('tipo-incidencia-bitacora').value, descripcion:document.getElementById('descripcion-bitacora').value.trim(),
        nivelGravedad:document.getElementById('gravedad-incidencia-bitacora').value
    } : {
        idCultivo:Number(selectorCultivoBitacora.value), idUsuario:Number(idUsuario), fechaObservacion:document.getElementById('fecha-bitacora').value,
        descripcion:document.getElementById('descripcion-bitacora').value.trim()
    };
    try {
        const respuesta = await fetch(API_BITACORA + (esIncidencia ? '/incidencias-cultivo' : '/observaciones-cultivos'), {
            method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(datos)
        });
        const resultado = await respuesta.json().catch(function () { return {}; });
        if (!respuesta.ok) throw new Error(resultado.mensaje || resultado.message || 'No se pudo guardar el registro.');
        formulario.reset(); document.getElementById('fecha-bitacora').value = new Date().toISOString().slice(0,10); mostrarCamposIncidencia();
        error.textContent = ''; await cargarBitacoraEmpleado(); mensajeBitacoraEmpleado.textContent = 'Registro agregado a la bitácora del cultivo.';
    } catch (problema) { error.textContent = problema.message; }
});

document.getElementById('fecha-bitacora').value = new Date().toISOString().slice(0,10);
mostrarCamposIncidencia(); cargarBitacoraEmpleado();
