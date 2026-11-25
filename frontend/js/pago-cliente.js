/**
 * @file Confirmación y pago del pedido.
 */

/**
 * Actualiza las existencias y registra el pedido con la forma de entrega y pago elegidas.
 *
 * @author Equipo de Gestión de Cultivos
 */
class VistaPagoCliente {
    /** Prepara los controles y el estado de la pantalla. */
    constructor() {
        this.api = 'http://' + window.location.hostname + ':8081/api';
        this.resumen = document.getElementById('resumen-pago');
        this.mensaje = document.getElementById('mensaje-pago');
        this.formulario = document.getElementById('formulario-pago');
        this.detalles = [];
    }

    /**
     * Lee el borrador del cliente y consulta la disponibilidad actual.
     */
    async cargarResumenPago() {
        const borrador = sessionStorage.getItem('pedidoGestionCultivos');
        if (!borrador) throw new Error('No hay productos seleccionados. Regresa al catálogo.');
        this.detalles = JSON.parse(borrador);
        if (!Array.isArray(this.detalles) || this.detalles.length === 0) throw new Error('No hay productos seleccionados. Regresa al catálogo.');
        const respuesta = await fetch(this.api + '/catalogo', { credentials: 'include' });
        if (!respuesta.ok) throw new Error('No se pudo actualizar la disponibilidad del catálogo.');
        const catalogoPagoCliente = await respuesta.json();
        this.mostrarResumenPago(catalogoPagoCliente);
    }

    /**
     * Registra el pedido con sus lotes y datos de entrega.
     *
     * @param evento - Evento de envío del formulario.
     */
    async confirmarPagoCliente(evento) {
        evento.preventDefault();
        const usuarioId = sessionStorage.getItem('usuarioId');
        if (!usuarioId || sessionStorage.getItem('usuarioRol') !== 'cliente') {
            this.mensaje.textContent = 'Inicia sesión con una cuenta de cliente para crear el pedido.';
            return;
        }
        if (!this.formulario.reportValidity()) return;
        const tipoEntrega = document.querySelector('input[name="tipo-entrega"]:checked').value;
        const solicitud = {
            idUsuario: Number(usuarioId),
            metodoPago: document.getElementById('metodo-pago').value,
            tipoEntrega: tipoEntrega,
            detalles: this.detalles
        };
        if (tipoEntrega === 'domicilio') solicitud.direccion = document.getElementById('direccion-entrega').value.trim();
        else solicitud.fechaRecoleccion = document.getElementById('fecha-recoleccion').value;

        const boton = document.getElementById('confirmar-pago');
        boton.disabled = true;
        this.mensaje.textContent = 'Registrando pedido…';
        try {
            const respuesta = await fetch(this.api + '/pedidos', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(solicitud)
            });
            const resultado = await respuesta.json().catch(() => { return {}; });
            if (!respuesta.ok) throw new Error(resultado.mensaje || resultado.message || 'No se pudo registrar el pedido.');
            sessionStorage.removeItem('pedidoGestionCultivos');
            sessionStorage.removeItem('fechaRecoleccionGestionCultivos');
            this.mostrarConfirmacionPago(resultado, solicitud);
        } catch (error) {
            this.mensaje.textContent = error.message;
            boton.disabled = false;
        }
    }

    /**
     * Dibuja los renglones y el total del pedido.
     *
     * @param catalogo - Lotes actualizados del catálogo.
     */
    mostrarResumenPago(catalogo) {
        this.resumen.replaceChildren();
        let total = 0;
        for (const detalle of this.detalles) {
            const lote = catalogo.find(item => Number(item.idCosecha) === Number(detalle.idCosecha));
            if (!lote || Number(detalle.kilos) > Number(lote.kilos)) {
                throw new Error('La existencia de uno de los lotes cambió. Vuelve al catálogo y revisa los kilos.');
            }
            const subtotal = Number(lote.precioPorKg) * Number(detalle.kilos);
            total += subtotal;
            const fila = document.createElement('tr');
            const columnas = [
                lote.familia + ' ' + lote.variedad + ' · ' + lote.maduracion,
                Number(detalle.kilos).toFixed(2) + ' kg',
                this.formatoDineroPago(subtotal)
            ];
            for (const texto of columnas) {
                const celda = document.createElement('td');
                celda.textContent = texto;
                fila.appendChild(celda);
            }
            this.resumen.appendChild(fila);
        }
        document.getElementById('total-pago').textContent = this.formatoDineroPago(total);
    }

    /**
     * Muestra número, total y entrega.
     *
     * @param resultado - Confirmación devuelta por la API.
     * @param solicitud - Datos del pedido enviado, incluida su forma de entrega.
     */
    mostrarConfirmacionPago(resultado, solicitud) {
        const entrega = solicitud.tipoEntrega === 'domicilio'
            ? 'Envío a domicilio'
            : 'Recolección el ' + solicitud.fechaRecoleccion + ', de 6:00 a. m. a 6:00 p. m.';
        this.formulario.hidden = true;
        document.getElementById('contenido-pago').hidden = true;
        document.getElementById('confirmacion-pedido').hidden = false;
        document.getElementById('numero-pedido').textContent = 'Número de pedido: #' + resultado.idPedido;
        document.getElementById('detalle-confirmacion').textContent =
            'Total: ' + this.formatoDineroPago(resultado.total) + ' · Estado: pendiente · ' + entrega;
        this.mensaje.textContent = 'El pedido se guardó correctamente.';
    }

    /**
     * Muestra los campos de la forma de entrega seleccionada.
     */
    mostrarEntregaPago() {
        const tipo = document.querySelector('input[name="tipo-entrega"]:checked').value;
        const domicilio = tipo === 'domicilio';
        document.getElementById('datos-domicilio').hidden = !domicilio;
        document.getElementById('datos-recoleccion').hidden = domicilio;
        document.getElementById('direccion-entrega').required = domicilio;
        document.getElementById('fecha-recoleccion').required = !domicilio;
    }

    /**
     * Muestra las indicaciones del método de pago seleccionado.
     */
    mostrarMetodoPago() {
        const transferencia = document.getElementById('metodo-pago').value === 'transferencia';
        document.getElementById('datos-transferencia').hidden = !transferencia;
        document.getElementById('datos-tarjeta').hidden = transferencia;
    }

    /**
     * Muestra un importe con dos posiciones decimales.
     *
     * @param valor - Importe en pesos.
     */
    formatoDineroPago(valor) {
        return '$' + Number(valor || 0).toFixed(2);
    }

    /**
     * Convierte una fecha local al formato aaaa-mm-dd.
     *
     * @param fecha - Fecha que se convierte o se valida.
     */
    fechaLocalPago(fecha) {
        const ajuste = fecha.getTimezoneOffset() * 60000;
        return new Date(fecha - ajuste).toISOString().slice(0, 10);
    }

    /**
     * Conecta los controles y carga el borrador al abrir.
     */
    iniciarPagoCliente() {
        const radiosEntrega = document.querySelectorAll('input[name="tipo-entrega"]');
        for (const radio of radiosEntrega) {
            radio.addEventListener('change', () => this.mostrarEntregaPago());
        }
        document.getElementById('metodo-pago').addEventListener('change', () => this.mostrarMetodoPago());
        this.formulario.addEventListener('submit', evento => this.confirmarPagoCliente(evento));

        const hoy = new Date();
        const campoFechaRecogida = document.getElementById('fecha-recoleccion');
        const maximo = new Date(hoy);
        maximo.setDate(maximo.getDate() + 7);
        campoFechaRecogida.min = this.fechaLocalPago(hoy);
        campoFechaRecogida.max = this.fechaLocalPago(maximo);
        const fechaElegida = sessionStorage.getItem('fechaRecoleccionGestionCultivos');
        if (fechaElegida && fechaElegida >= campoFechaRecogida.min && fechaElegida <= campoFechaRecogida.max) {
            campoFechaRecogida.value = fechaElegida;
            document.querySelector('input[name="tipo-entrega"][value="recoleccion"]').checked = true;
        }
        this.mostrarEntregaPago();
        this.mostrarMetodoPago();
        this.cargarResumenPago().catch((error) => {
            this.mensaje.textContent = error.message;
            document.getElementById('confirmar-pago').disabled = true;
        });
    }
}

const vistaPagoCliente = new VistaPagoCliente();
vistaPagoCliente.iniciarPagoCliente();
