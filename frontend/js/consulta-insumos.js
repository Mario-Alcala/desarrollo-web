/* Datos: este archivo consulta abonos o fertilizantes según la categoría de la página. No recibe atributos. */

const API_INSUMOS_EMPLEADO = 'http://localhost:8081/api/insumos';
const categoriaInsumoEmpleado = document.body.dataset.categoriaInsumo;
const cuerpoInsumosEmpleado = document.getElementById('lista-insumos-empleado');
const mensajeInsumosEmpleado = document.getElementById('mensaje-insumos-empleado');

/* Datos: esta función consulta los insumos de la API. No recibe atributos. */
async function cargarConsultaInsumos() {
    mensajeInsumosEmpleado.textContent = 'Cargando registros…';
    try {
        const respuesta = await fetch(API_INSUMOS_EMPLEADO);
        if (!respuesta.ok) throw new Error('No se pudieron cargar los registros del inventario.');
        dibujarInsumosEmpleado(await respuesta.json());
    } catch (error) {
        mensajeInsumosEmpleado.textContent = error.message;
    }
}

/* Datos: esta función muestra los insumos de la categoría de la página. Recibe la lista de la API. */
function dibujarInsumosEmpleado(insumos) {
    const lista = insumos.filter(item => item.categoria === categoriaInsumoEmpleado);
    cuerpoInsumosEmpleado.replaceChildren();
    for (const item of lista) {
        const fila = document.createElement('tr');
        agregarDatoInsumo(fila, item.nombre);
        if (categoriaInsumoEmpleado === 'abono') {
            agregarDatoInsumo(fila, item.tipoAbono);
        }
        agregarDatoInsumo(fila, item.unidadMedida);
        cuerpoInsumosEmpleado.appendChild(fila);
    }
    mensajeInsumosEmpleado.textContent = lista.length ? '' : 'No hay registros disponibles.';
}

/* Datos: esta función agrega una celda a un insumo en la tabla. Recibe la fila y el texto. */
function agregarDatoInsumo(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto || '—';
    fila.appendChild(celda);
}

cargarConsultaInsumos();
