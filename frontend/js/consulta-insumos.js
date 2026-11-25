/**
 * Consulta abonos o fertilizantes según la categoría de la página.
 *
 * @author Equipo de Gestión de Cultivos
 */
class ConsultaInsumosEmpleado {
    /**
     * Ubica la categoría, el cuerpo de la tabla y el campo de avisos.
     */
    constructor() {
        this.categoriaInsumoEmpleado = document.body.dataset.categoriaInsumo;
        this.cuerpoInsumosEmpleado = document.getElementById('lista-insumos-empleado');
        this.mensajeInsumosEmpleado = document.getElementById('mensaje-insumos-empleado');
    }

    /**
     * Consulta los insumos de la API.
     */
    async cargarConsultaInsumos() {
        this.mensajeInsumosEmpleado.textContent = 'Cargando registros…';
        try {
            const respuesta = await fetch(API_INSUMOS_EMPLEADO);
            if (!respuesta.ok) throw new Error('No se pudieron cargar los registros del inventario.');
            this.dibujarInsumosEmpleado(await respuesta.json());
        } catch (error) {
            this.mensajeInsumosEmpleado.textContent = error.message;
        }
    }

    /**
     * Muestra los insumos de la categoría de la página.
     *
     * @param insumos - La lista de la API.
     */
    dibujarInsumosEmpleado(insumos) {
        const lista = insumos.filter(item => item.categoria === this.categoriaInsumoEmpleado);
        this.cuerpoInsumosEmpleado.replaceChildren();
        for (const item of lista) {
            const fila = document.createElement('tr');
            this.agregarDatoInsumo(fila, item.nombre);
            if (this.categoriaInsumoEmpleado === 'abono') {
                this.agregarDatoInsumo(fila, item.tipoAbono);
            }
            this.agregarDatoInsumo(fila, item.unidadMedida);
            this.cuerpoInsumosEmpleado.appendChild(fila);
        }
        this.mensajeInsumosEmpleado.textContent = lista.length ? '' : 'No hay registros disponibles.';
    }

    /**
     * Agrega una celda a un insumo en la tabla.
     *
     * @param fila - Fila de la tabla que recibe la celda.
     * @param texto - Texto que se quiere mostrar.
     */
    agregarDatoInsumo(fila, texto) {
        const celda = document.createElement('td');
        celda.textContent = texto || '—';
        fila.appendChild(celda);
    }
}

const API_INSUMOS_EMPLEADO = 'http://localhost:8081/api/insumos';

const consultaInsumosEmpleado = new ConsultaInsumosEmpleado();

consultaInsumosEmpleado.cargarConsultaInsumos();
