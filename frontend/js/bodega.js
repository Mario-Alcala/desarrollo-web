/**
 * Consulta las cosechas y muestra los lotes disponibles en bodega.
 *
 * @author Equipo de Gestión de Cultivos
 */
class BodegaAdmin {
    /**
     * Prepara la lista de lotes que se muestra en Bodega.
     */
    constructor() {
        this.lotesBodega = [];
    }

    /**
     * Consulta los lotes de cosecha y muestra el resultado.
     */
    async cargarBodega() {
        mensajeBodega.textContent = 'Cargando cosechas…';
        try {
            const respuesta = await fetch(API_BODEGA + '/cosechas');
            if (!respuesta.ok) throw new Error('No se pudieron cargar los lotes.');
            this.lotesBodega = await respuesta.json();
            this.dibujarBodega();
        } catch (error) {
            mensajeBodega.textContent = error.message;
        }
    }

    /**
     * Agrega una celda a la tabla.
     *
     * @param fila - Fila de la tabla de bodega.
     * @param texto - Texto que se muestra.
     */
    celdaBodega(fila, texto) {
        const celda = document.createElement('td');
        celda.textContent = texto;
        fila.appendChild(celda);
    }

    /**
     * Muestra los lotes que coinciden con la búsqueda y la maduración.
     */
    dibujarBodega() {
        const pantalla = this;
        const texto = buscarBodega ? buscarBodega.value.trim().toLowerCase() : '';
        const maduracion = filtroBodega.value;
        const visibles = this.lotesBodega.filter(function (lote) {
            const nombre = lote.nombreCultivo || 'Cultivo';
            return (!maduracion || lote.estadoMaduracion === maduracion)
                && (!texto || (nombre + ' ' + (lote.ubicacionBodega || '') + ' ' + (lote.estadoMaduracion || '')).toLowerCase().includes(texto));
        });
        cuerpoBodega.replaceChildren();
        visibles.forEach(function (lote) {
            const fila = document.createElement('tr');
            pantalla.celdaBodega(fila, (lote.nombreCultivo || 'Cultivo') + ' · Lote #' + lote.idCosecha);
            pantalla.celdaBodega(fila, lote.fechaCosecha || '—');
            pantalla.celdaBodega(fila, Number(lote.cantidadCosechada || 0).toLocaleString('es-MX') + ' kg');
            pantalla.celdaBodega(fila, Number(lote.cantidadDisponible || 0).toLocaleString('es-MX') + ' kg');
            pantalla.celdaBodega(fila, lote.estadoMaduracion || '—');
            pantalla.celdaBodega(fila, lote.ubicacionBodega || '—');
            cuerpoBodega.appendChild(fila);
        });
        mensajeBodega.textContent = visibles.length ? visibles.length + ' lotes disponibles en bodega.' : 'No hay lotes para mostrar.';
    }

    /**
     * Conecta los controles de la página y ejecuta la carga inicial.
     */
    iniciarBodega() {
        if (buscarBodega) buscarBodega.addEventListener('input', this.dibujarBodega.bind(this));
        filtroBodega.addEventListener('change', this.dibujarBodega.bind(this));
        this.cargarBodega();
    }
}

const API_BODEGA = 'http://localhost:8081/api';
const cuerpoBodega = document.getElementById('tabla-cuerpo');
const mensajeBodega = document.getElementById('mensaje-bodega');
const buscarBodega = document.querySelector('#topbar input');
const filtroBodega = document.getElementById('filtro-maduracion');

const bodegaAdmin = new BodegaAdmin();

bodegaAdmin.iniciarBodega();
