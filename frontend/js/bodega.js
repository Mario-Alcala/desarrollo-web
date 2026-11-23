const API_BODEGA = 'http://localhost:8081/api';
const cuerpoBodega = document.getElementById('tabla-cuerpo');
const mensajeBodega = document.getElementById('mensaje-bodega');
const buscarBodega = document.querySelector('#topbar input');
const filtroBodega = document.getElementById('filtro-maduracion');
let lotesBodega = [];

function celdaBodega(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto;
    fila.appendChild(celda);
}

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

if (buscarBodega) buscarBodega.addEventListener('input', dibujarBodega);
filtroBodega.addEventListener('change', dibujarBodega);
cargarBodega();
