/**
 * @file Consulta abonos o fertilizantes según la categoría de la página.
 *
 * @author Equipo de Gestión de Cultivos
 */

const API_INSUMOS_EMPLEADO = 'http://localhost:8081/api/insumos';
const categoriaInsumoEmpleado = document.body.dataset.categoriaInsumo;
const cuerpoInsumosEmpleado = document.getElementById('lista-insumos-empleado');
const mensajeInsumosEmpleado = document.getElementById('mensaje-insumos-empleado');

/**
 * Consulta los insumos de la API.
 */
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

/**
 * Muestra los insumos de la categoría de la página.
 *
 * @param insumos - La lista de la API.
 */
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

/**
 * Agrega una celda a un insumo en la tabla.
 *
 * @param fila - Fila de la tabla que recibe la celda.
 * @param texto - Texto que se quiere mostrar.
 */
function agregarDatoInsumo(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto || '—';
    fila.appendChild(celda);
}

cargarConsultaInsumos();
