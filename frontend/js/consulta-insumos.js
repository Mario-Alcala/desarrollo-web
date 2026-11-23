const API_INSUMOS_EMPLEADO = 'http://localhost:8081/api/insumos';
const categoriaInsumoEmpleado = document.body.dataset.categoriaInsumo;
const cuerpoInsumosEmpleado = document.getElementById('lista-insumos-empleado');
const mensajeInsumosEmpleado = document.getElementById('mensaje-insumos-empleado');

function agregarDatoInsumo(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto || '—';
    fila.appendChild(celda);
}

async function cargarConsultaInsumos() {
    mensajeInsumosEmpleado.textContent = 'Cargando registros…';
    try {
        const respuesta = await fetch(API_INSUMOS_EMPLEADO);
        if (!respuesta.ok) throw new Error('No se pudieron cargar los registros del inventario.');
        const todos = await respuesta.json();
        const lista = todos.filter(function (item) { return item.categoria === categoriaInsumoEmpleado; });
        cuerpoInsumosEmpleado.replaceChildren();
        lista.forEach(function (item) {
            const fila = document.createElement('tr');
            agregarDatoInsumo(fila, item.nombre);
            if (categoriaInsumoEmpleado === 'abono') agregarDatoInsumo(fila, item.tipoAbono);
            agregarDatoInsumo(fila, item.unidadMedida);
            cuerpoInsumosEmpleado.appendChild(fila);
        });
        mensajeInsumosEmpleado.textContent = lista.length ? '' : 'No hay registros disponibles.';
    } catch (error) {
        mensajeInsumosEmpleado.textContent = error.message;
    }
}

cargarConsultaInsumos();
