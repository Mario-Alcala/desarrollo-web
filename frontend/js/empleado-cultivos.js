const API_EMPLEADO = 'http://localhost:8081/api';
const listaCultivosEmpleado = document.getElementById('lista-cultivos-empleado');
const mensajeCultivosEmpleado = document.getElementById('mensaje-cultivos-empleado');
const formularioCosechaEmpleado = document.getElementById('formulario-cosecha-empleado');
const selectorCosechaEmpleado = document.getElementById('cosecha-cultivo');
let cultivosEmpleado = [];

function ponerCelda(fila, valor) {
    const celda = document.createElement('td');
    celda.textContent = valor == null || valor === '' ? '—' : valor;
    fila.appendChild(celda);
}

async function cargarCultivosEmpleado() {
    mensajeCultivosEmpleado.textContent = 'Cargando cultivos…';
    try {
        const respuesta = await fetch(API_EMPLEADO + '/cultivos');
        if (!respuesta.ok) throw new Error('No se pudieron cargar los cultivos desde el API.');
        cultivosEmpleado = await respuesta.json();
        listaCultivosEmpleado.replaceChildren();
        selectorCosechaEmpleado.replaceChildren(new Option('Selecciona un cultivo activo', ''));
        cultivosEmpleado.forEach(function (cultivo) {
            const fila = document.createElement('tr');
            ponerCelda(fila, cultivo.nombre);
            ponerCelda(fila, 'Parcela #' + cultivo.idParcela);
            ponerCelda(fila, cultivo.familia || cultivo.tipo);
            ponerCelda(fila, cultivo.etapaFenologica);
            ponerCelda(fila, cultivo.fechaSiembra || cultivo.fechaRegistro);
            ponerCelda(fila, cultivo.estado);
            listaCultivosEmpleado.appendChild(fila);
            if (cultivo.estado === 'activo') selectorCosechaEmpleado.add(new Option(cultivo.nombre + ' · Parcela #' + cultivo.idParcela, String(cultivo.id)));
        });
        mensajeCultivosEmpleado.textContent = cultivosEmpleado.length ? '' : 'No hay cultivos registrados.';
        if (cultivosEmpleado.length === 0) {
            const fila = document.createElement('tr');
            const celda = document.createElement('td');
            celda.colSpan = 6;
            celda.textContent = 'No hay cultivos para mostrar.';
            fila.appendChild(celda);
            listaCultivosEmpleado.appendChild(fila);
        }
    } catch (error) {
        mensajeCultivosEmpleado.textContent = error.message;
    }
}

formularioCosechaEmpleado.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    const mensaje = document.getElementById('mensaje-formulario-cosecha');
    const idUsuario = sessionStorage.getItem('usuarioId');
    if (!idUsuario) {
        mensaje.textContent = 'Inicia sesión para registrar la cosecha.';
        return;
    }
    if (!formularioCosechaEmpleado.reportValidity()) return;
    const cultivoId = Number(selectorCosechaEmpleado.value);
    const cultivo = cultivosEmpleado.find(function (item) { return Number(item.id) === cultivoId; });
    if (!cultivo || cultivo.estado !== 'activo') {
        mensaje.textContent = 'Selecciona un cultivo activo existente.';
        return;
    }
    const datos = {
        idCultivo: cultivoId,
        idUsuario: Number(idUsuario),
        fechaCosecha: document.getElementById('cosecha-fecha').value,
        cantidadCosechada: Number(document.getElementById('cosecha-kilos').value),
        estadoMaduracion: document.getElementById('cosecha-maduracion').value,
        ubicacionBodega: document.getElementById('cosecha-bodega').value.trim()
    };
    const boton = document.getElementById('guardar-cosecha-empleado');
    boton.disabled = true;
    mensaje.textContent = '';
    try {
        const respuesta = await fetch(API_EMPLEADO + '/cosechas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos)
        });
        const resultado = await respuesta.json().catch(function () { return {}; });
        if (!respuesta.ok) throw new Error(resultado.mensaje || resultado.message || 'No se pudo guardar la cosecha.');
        formularioCosechaEmpleado.reset();
        document.getElementById('cosecha-fecha').value = new Date().toISOString().slice(0, 10);
        mensaje.textContent = 'Cosecha guardada. El lote ya aparece en Bodega con todos sus kilos disponibles.';
        await cargarCultivosEmpleado();
    } catch (error) {
        mensaje.textContent = error.message;
    }
    boton.disabled = false;
});

document.getElementById('cosecha-fecha').value = new Date().toISOString().slice(0, 10);
cargarCultivosEmpleado();
