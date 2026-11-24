/* Datos: consulta las cosechas y muestra los lotes disponibles en bodega. No recibe atributos. */

const API_BODEGA = 'http://localhost:8081/api';
const cuerpoBodega = document.getElementById('tabla-cuerpo');
const mensajeBodega = document.getElementById('mensaje-bodega');
const buscarBodega = document.querySelector('#topbar input');
const filtroBodega = document.getElementById('filtro-maduracion');
let lotesBodega = [];

/* Datos: consulta los lotes de cosecha y muestra el resultado. No recibe atributos. */
async function cargarBodega() {
    mensajeBodega.textContent = 'Cargando cosechas…';
    try {
        const respuesta = await fetch(API_BODEGA + '/cosechas');
        if (!respuesta.ok) throw new Error('No se pudieron cargar los lotes.');
        lotesBodega = await respuesta.json();
        dibujarBodega();
    } catch (error) {
        mensajeBodega.textContent = error.message;
    }
}

/* Datos: agrega una celda a la tabla. Recibe la fila y el texto. */
function celdaBodega(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto;
    fila.appendChild(celda);
}

/* Datos: muestra los lotes que coinciden con la búsqueda y la maduración. No recibe atributos. */
function dibujarBodega() {
    const texto = buscarBodega ? buscarBodega.value.trim().toLowerCase() : '';
    const maduracion = filtroBodega.value;
    const visibles = lotesBodega.filter(function (lote) {
        const nombre = lote.nombreCultivo || 'Cultivo';
        return (!maduracion || lote.estadoMaduracion === maduracion)
            && (!texto || (nombre + ' ' + (lote.ubicacionBodega || '') + ' ' + (lote.estadoMaduracion || '')).toLowerCase().includes(texto));
    });
    cuerpoBodega.replaceChildren();
    visibles.forEach(function (lote) {
        const fila = document.createElement('tr');
        celdaBodega(fila, (lote.nombreCultivo || 'Cultivo') + ' · Lote #' + lote.idCosecha);
        celdaBodega(fila, lote.fechaCosecha || '—');
        celdaBodega(fila, Number(lote.cantidadCosechada || 0).toLocaleString('es-MX') + ' kg');
        celdaBodega(fila, Number(lote.cantidadDisponible || 0).toLocaleString('es-MX') + ' kg');
        celdaBodega(fila, lote.estadoMaduracion || '—');
        celdaBodega(fila, lote.ubicacionBodega || '—');
        cuerpoBodega.appendChild(fila);
    });
    mensajeBodega.textContent = visibles.length ? visibles.length + ' lotes disponibles en bodega.' : 'No hay lotes para mostrar.';
}

/* Datos: conecta los controles de la página y ejecuta la carga inicial. No recibe atributos. */
function iniciarBodega() {
    if (buscarBodega) buscarBodega.addEventListener('input', dibujarBodega);
    filtroBodega.addEventListener('change', dibujarBodega);
    cargarBodega();
}

iniciarBodega();
