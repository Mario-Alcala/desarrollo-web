/**
 * @file Registro de pedidos por el empleado.
 */

/**
 * Carga clientes y lotes, calcula el total y guarda el pedido desde el formulario.
 *
 * @author Equipo de Gestión de Cultivos
 */
class VistaPedidoEmpleado {
    /** Prepara los controles y el estado de la pantalla. */
    constructor() {
        this.formulario = document.getElementById('formulario-pedido-empleado');
        this.selectorCliente = document.getElementById('cliente-pedido-empleado');
        this.selectorEntrega = document.getElementById('tipo-entrega-pedido-empleado');
        this.detalles = document.getElementById('detalles-pedido-empleado');
        this.mensaje = document.getElementById('mensaje-pedido-empleado');
        this.error = document.getElementById('error-pedido-empleado');
        this.lotes = [];
    }

    /**
     * Consulta clientes y catálogo disponibles.
     */
    async cargarDatosPedidoEmpleado() {
        this.selectorCliente.innerHTML = '<option value="">Cargando clientes…</option>';
        try {
            const resultados = await Promise.all([
                pedirApi('/usuarios'),
                pedirApi('/catalogo')
            ]);
            const clientes = resultados[0].filter((usuario) => {
                return usuario.rol === 'cliente';
            });
            this.lotes = resultados[1];
            this.selectorCliente.innerHTML = '<option value="">Selecciona un cliente</option>';
            clientes.forEach((cliente) => {
                const opcion = document.createElement('option');
                opcion.value = cliente.idUsuario;
                opcion.textContent = cliente.nombreUsuario + ' · ' + cliente.correoElectronico;
                this.selectorCliente.appendChild(opcion);
            });
            if (!clientes.length) this.mensajePedido('No hay clientes registrados para seleccionar.', 'error');
            if (!this.lotesDisponiblesPedido().length) this.mensajePedido('No hay lotes con existencia y precio disponibles en el catálogo.', 'error');
            this.agregarDetallePedido();
        } catch (error) {
            this.mensajePedido(errorApi(error), 'error');
        }
    }

    /**
     * Envía el cliente, los lotes y la forma de entrega.
     *
     * @param evento - Evento de envío del formulario.
     */
    async guardarPedidoEmpleado(evento) {
        evento.preventDefault();
        this.error.textContent = '';
        if (!this.formulario.reportValidity()) return;

        const detalles = [];
        const filas = this.detalles.querySelectorAll('.detalle-pedido-empleado');
        for (let i = 0; i < filas.length; i++) {
            const selector = filas[i].querySelector('select');
            const cantidad = filas[i].querySelector('input');
            const lote = this.lotesDisponiblesPedido().find((item) => {
                return String(item.idCosecha) === selector.value;
            });
            if (!lote || Number(cantidad.value) > Number(lote.kilos)) {
                this.error.textContent = 'Revisa cada lote y no excedas los kilos disponibles.';
                return;
            }
            detalles.push({ idCosecha: Number(lote.idCosecha), kilos: Number(cantidad.value) });
        }
        if (!detalles.length) {
            this.error.textContent = 'Agrega al menos un producto al pedido.';
            return;
        }

        const solicitud = {
            idUsuario: Number(this.selectorCliente.value),
            metodoPago: document.getElementById('metodo-pago-pedido-empleado').value,
            tipoEntrega: this.selectorEntrega.value,
            detalles: detalles
        };
        if (solicitud.tipoEntrega === 'recoleccion') {
            solicitud.fechaRecoleccion = document.getElementById('fecha-pedido-empleado').value;
        } else {
            solicitud.direccion = document.getElementById('direccion-entrega-pedido-empleado').value.trim();
        }

        const botonGuardar = document.getElementById('guardar-pedido-empleado');
        botonGuardar.disabled = true;
        this.mensajePedido('Guardando pedido…');
        try {
            const resultado = await pedirApi('/pedidos/registro', 'POST', solicitud);
            this.mensajePedido('Pedido #' + resultado.idPedido + ' guardado. Total: $' + Number(resultado.total).toFixed(2) + '.', 'ok');
            this.formulario.reset();
            this.detalles.replaceChildren();
            this.agregarDetallePedido();
            this.mostrarCamposEntregaPedido();
            await this.cargarLotesActualizados();
        } catch (error) {
            this.mensajePedido(errorApi(error), 'error');
        } finally {
            botonGuardar.disabled = false;
        }
    }

    /**
     * Actualiza la disponibilidad de las opciones.
     */
    async cargarLotesActualizados() {
        try {
            this.lotes = await pedirApi('/catalogo');
            this.detalles.querySelectorAll('.detalle-pedido-empleado').forEach((fila) => {
                const seleccionado = fila.querySelector('select').value;
                fila.remove();
                this.agregarDetallePedido();
                const nuevaFila = this.detalles.lastElementChild;
                const selector = nuevaFila.querySelector('select');
                if (Array.from(selector.options).some((opcion) => { return opcion.value === seleccionado; })) {
                    selector.value = seleccionado;
                    selector.dispatchEvent(new Event('change'));
                }
            });
        } catch (error) {
            this.mensajePedido(errorApi(error), 'error');
        }
    }

    /**
     * Convierte una fecha local al formato aaaa-mm-dd.
     *
     * @param fecha - Fecha que se convierte o se valida.
     */
    fechaLocalPedidoEmpleado(fecha) {
        return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }

    /**
     * Muestra un aviso en el formulario del empleado.
     *
     * @param texto - Texto que se muestra en el elemento.
     * @param [tipo] - Tipo de aviso.
     */
    mensajePedido(texto, tipo) {
        this.mensaje.textContent = texto;
        this.mensaje.className = 'mensaje' + (tipo ? ' ' + tipo : '');
    }

    /**
     * Filtra los lotes que tienen kilos disponibles y precio.
     */
    lotesDisponiblesPedido() {
        return this.lotes.filter((lote) => {
            return Number(lote.kilos) > 0 && Number(lote.precioPorKg) > 0;
        });
    }

    /**
     * Suma precio por kilo por cantidad elegida.
     */
    actualizarTotalPedido() {
        let total = 0;
        this.detalles.querySelectorAll('.detalle-pedido-empleado').forEach((fila) => {
            const selector = fila.querySelector('select');
            const cantidad = fila.querySelector('input');
            const lote = this.lotesDisponiblesPedido().find((item) => {
                return String(item.idCosecha) === selector.value;
            });
            if (lote && Number(cantidad.value) > 0) {
                total += Number(lote.precioPorKg) * Number(cantidad.value);
            }
        });
        document.getElementById('total-pedido-empleado').textContent = '$' + total.toFixed(2);
    }

    /**
     * Crea un renglón para elegir lote y kilos.
     */
    agregarDetallePedido() {
        const fila = document.createElement('div');
        fila.className = 'campos-operacion detalle-pedido-empleado espacio';

        const bloqueLote = document.createElement('div');
        const etiquetaLote = document.createElement('label');
        etiquetaLote.textContent = 'Producto y lote';
        const selectorLote = document.createElement('select');
        selectorLote.required = true;
        const opcionInicial = document.createElement('option');
        opcionInicial.value = '';
        opcionInicial.textContent = 'Selecciona un lote disponible';
        selectorLote.appendChild(opcionInicial);
        this.lotesDisponiblesPedido().forEach((lote) => {
            const opcion = document.createElement('option');
            opcion.value = lote.idCosecha;
            opcion.textContent = (lote.familia || '') + ' ' + (lote.variedad || 'Producto')
                + ' · ' + (lote.maduracion || 'Sin clasificar') + ' · Lote #' + lote.idCosecha
                + ' · ' + lote.kilos + ' kg disponibles · $' + Number(lote.precioPorKg).toFixed(2) + '/kg';
            selectorLote.appendChild(opcion);
        });
        etiquetaLote.appendChild(selectorLote);
        bloqueLote.appendChild(etiquetaLote);

        const bloqueCantidad = document.createElement('div');
        const etiquetaCantidad = document.createElement('label');
        etiquetaCantidad.textContent = 'Kilos';
        const campoCantidad = document.createElement('input');
        campoCantidad.type = 'number';
        campoCantidad.min = '0.01';
        campoCantidad.step = '0.01';
        campoCantidad.required = true;
        campoCantidad.addEventListener('input', () => this.actualizarTotalPedido());
        selectorLote.addEventListener('change', () => {
            const lote = this.lotesDisponiblesPedido().find((item) => {
                return String(item.idCosecha) === selectorLote.value;
            });
            campoCantidad.max = lote ? lote.kilos : '';
            this.actualizarTotalPedido();
        });
        etiquetaCantidad.appendChild(campoCantidad);
        bloqueCantidad.appendChild(etiquetaCantidad);

        const botonQuitar = document.createElement('button');
        botonQuitar.type = 'button';
        botonQuitar.className = 'boton boton-secundario';
        botonQuitar.textContent = 'Quitar producto';
        botonQuitar.addEventListener('click', () => {
            fila.remove();
            this.actualizarTotalPedido();
        });
        fila.append(bloqueLote, bloqueCantidad, botonQuitar);
        this.detalles.appendChild(fila);
    }

    /**
     * Muestra los campos de la entrega elegida.
     */
    mostrarCamposEntregaPedido() {
        const recoger = this.selectorEntrega.value === 'recoleccion';
        document.getElementById('fecha-recoleccion-pedido-empleado').hidden = !recoger;
        document.getElementById('direccion-pedido-empleado').hidden = recoger;
        document.getElementById('fecha-pedido-empleado').required = recoger;
        document.getElementById('direccion-entrega-pedido-empleado').required = !recoger;
    }

    /**
     * Conecta los controles y carga los datos iniciales.
     */
    iniciarPedidoEmpleado() {
        document.getElementById('agregar-producto-pedido-empleado').addEventListener('click', () => this.agregarDetallePedido());
        this.selectorEntrega.addEventListener('change', () => this.mostrarCamposEntregaPedido());
        this.formulario.addEventListener('submit', evento => this.guardarPedidoEmpleado(evento));

        const hoyPedidoEmpleado = new Date();
        const fechaMinimaPedidoEmpleado = this.fechaLocalPedidoEmpleado(hoyPedidoEmpleado);
        const fechaMaximaPedidoEmpleado = new Date(hoyPedidoEmpleado);
        fechaMaximaPedidoEmpleado.setDate(fechaMaximaPedidoEmpleado.getDate() + 7);
        document.getElementById('fecha-pedido-empleado').min = fechaMinimaPedidoEmpleado;
        document.getElementById('fecha-pedido-empleado').max = this.fechaLocalPedidoEmpleado(fechaMaximaPedidoEmpleado);
        this.mostrarCamposEntregaPedido();
        this.cargarDatosPedidoEmpleado();
    }
}

const vistaPedidoEmpleado = new VistaPedidoEmpleado();
vistaPedidoEmpleado.iniciarPedidoEmpleado();
