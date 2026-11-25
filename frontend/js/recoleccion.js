/**
 * @file Calendario de recolección de pedidos.
 */

/**
 * Muestra los días disponibles y guarda en el borrador la fecha seleccionada.
 *
 * @author Equipo de Gestión de Cultivos
 */
class CalendarioRecoleccion {
    /** Prepara los controles y el estado de la pantalla. */
    constructor() {
        this.fechaVista = new Date();
        this.fechaElegida = '';
        this.mensaje = document.getElementById('mensaje-recoleccion');
    }

    /**
     * Dibuja el mes y habilita sus días disponibles.
     */
    mostrarRecoleccion() {
        const anio = this.fechaVista.getFullYear();
        const mes = this.fechaVista.getMonth();
        document.getElementById('nombre-mes').textContent = this.fechaVista.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        const lista = document.getElementById('dias-recoleccion');
        lista.innerHTML = '';
        const inicio = new Date(anio, mes, 1).getDay();
        const cantidad = new Date(anio, mes + 1, 0).getDate();

        for (let espacio = 0; espacio < inicio; espacio++) {
            lista.appendChild(document.createElement('span'));
        }

        for (let dia = 1; dia <= cantidad; dia++) {
            const fecha = pedidoEnPreparacion.fechaLocal(new Date(anio, mes, dia));
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.textContent = dia;
            boton.dataset.fecha = fecha;
            boton.disabled = !pedidoEnPreparacion.fechaPermitida(fecha);
            boton.setAttribute('aria-label', 'Recoger el ' + fecha);
            boton.setAttribute('aria-pressed', fecha === this.fechaElegida ? 'true' : 'false');
            if (fecha === this.fechaElegida) {
                boton.className = 'elegido';
            }
            boton.onclick = () => {
                this.fechaElegida = boton.dataset.fecha;
                this.mostrarRecoleccion();
            };
            lista.appendChild(boton);
        }

        document.getElementById('dia-seleccionado').textContent = this.fechaElegida ? 'Fecha seleccionada: ' + this.fechaElegida : 'Aún no seleccionas una fecha.';
        document.getElementById('guardar-fecha').disabled = !pedidoEnPreparacion.fechaPermitida(this.fechaElegida);
        const hoy = new Date();
        const limite = pedidoEnPreparacion.inicioRecoleccion();
        limite.setDate(limite.getDate() + 6);
        document.getElementById('mes-anterior').disabled = anio * 12 + mes <= hoy.getFullYear() * 12 + hoy.getMonth();
        document.getElementById('mes-siguiente').disabled = anio * 12 + mes >= limite.getFullYear() * 12 + limite.getMonth();
    }

    /**
     * Abre otro mes del calendario.
     *
     * @param cambio - Cantidad de meses que se avanza o retrocede.
     */
    cambiarMesRecoleccion(cambio) {
        this.fechaVista = new Date(this.fechaVista.getFullYear(), this.fechaVista.getMonth() + cambio, 1);
        this.mostrarRecoleccion();
    }

    /**
     * Guarda la fecha elegida en el borrador y vuelve al pago.
     */
    guardarFechaRecoleccion() {
        if (!pedidoEnPreparacion.fechaPermitida(this.fechaElegida)) {
            this.mensaje.textContent = 'Selecciona una fecha disponible.';
            return;
        }
        try {
            const borrador = pedidoEnPreparacion.leerBorrador();
            if (!pedidoEnPreparacion.tieneSeleccionPedido(borrador)) {
                this.mensaje.textContent = 'Primero selecciona productos en el catálogo.';
                return;
            }
            borrador.fechaRecoleccion = this.fechaElegida;
            pedidoEnPreparacion.guardarBorrador(borrador);
            window.location.href = 'pago.html';
        } catch (error) {
            this.mensaje.textContent = 'No se pudo guardar la fecha.';
        }
    }

    /**
     * Conecta el calendario y recupera la selección del pago.
     */
    iniciarRecoleccion() {
        document.getElementById('mes-anterior').onclick = () => { this.cambiarMesRecoleccion(-1); };
        document.getElementById('mes-siguiente').onclick = () => { this.cambiarMesRecoleccion(1); };
        document.getElementById('guardar-fecha').onclick = () => this.guardarFechaRecoleccion();
        try {
            const borrador = pedidoEnPreparacion.leerBorrador();
            if (!pedidoEnPreparacion.tieneSeleccionPedido(borrador)) {
                window.location.replace('catalogo.html');
                return;
            }
            this.fechaElegida = pedidoEnPreparacion.fechaPermitida(borrador.fechaRecoleccion) ? borrador.fechaRecoleccion : '';
            if (this.fechaElegida) {
                const partes = this.fechaElegida.split('-');
                this.fechaVista = new Date(Number(partes[0]), Number(partes[1]) - 1, 1);
            }
            this.mostrarRecoleccion();
        } catch (error) {
            this.mensaje.textContent = 'No se pudo consultar el pedido.';
        }
    }
}

const vistaCalendarioRecoleccion = new CalendarioRecoleccion();
vistaCalendarioRecoleccion.iniciarRecoleccion();
