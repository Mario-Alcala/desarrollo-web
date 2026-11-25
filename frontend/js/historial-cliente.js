/**
 * @file Historial de compras del cliente.
 */

/**
 * Consulta los pedidos del cliente y agrupa sus productos para mostrarlos en la tabla.
 *
 * @author Equipo de Gestión de Cultivos
 */
class VistaHistorialCliente {
    /** Prepara los controles y el estado de la pantalla. */
    constructor() {
        this.api = 'http://' + window.location.hostname + ':8081/api';
        this.cuerpo = document.getElementById('historial-pedidos');
        this.mensaje = document.getElementById('mensaje-historial');
    }

    /**
     * Pide el historial por id de la cuenta en sesión.
     */
    async cargarHistorialCliente() {
        const idUsuario = sessionStorage.getItem('usuarioId');
        if (!idUsuario || sessionStorage.getItem('usuarioRol') !== 'cliente') {
            this.mensaje.textContent = 'Inicia sesión con tu cuenta de cliente para ver tus pedidos.';
            return;
        }
        this.mensaje.textContent = 'Cargando pedidos…';
        try {
            const ruta = this.api + '/pedidos/cliente/' + encodeURIComponent(idUsuario);
            const respuesta = await fetch(ruta, { credentials: 'include' });
            if (!respuesta.ok) throw new Error('No se pudo cargar tu historial de pedidos.');
            const pedidos = await respuesta.json();
            this.mostrarHistorialCliente(pedidos);
        } catch (error) {
            this.mensaje.textContent = error.message;
        }
    }

    /**
     * Muestra una fila por pedido.
     *
     * @param pedidos - Registros de pedidos devueltos por la API.
     */
    mostrarHistorialCliente(pedidos) {
        this.cuerpo.replaceChildren();
        for (const pedido of this.agruparHistorialCliente(pedidos)) {
            const fila = document.createElement('tr');
            this.ponerCeldaHistorial(fila, '#' + pedido.idPedido + ' · ' + String(pedido.fechaPedido || '').replace('T', ' '));
            this.ponerCeldaHistorial(fila, pedido.productos.join('\n'));
            const cantidad = pedido.productos.length;
            this.ponerCeldaHistorial(fila, cantidad + (cantidad === 1 ? ' producto' : ' productos'));
            this.ponerCeldaHistorial(fila, '$' + Number(pedido.total || 0).toFixed(2));
            const entrega = pedido.tipoEntrega === 'domicilio'
                ? 'Domicilio · ' + (pedido.direccion || 'Dirección registrada')
                : 'Recolección · ' + (pedido.fechaRecoleccion || 'Fecha pendiente');
            this.ponerCeldaHistorial(fila, entrega);
            this.ponerCeldaHistorial(fila, pedido.estadoEntrega || pedido.estadoPedido);
            this.ponerCeldaHistorial(fila, pedido.numeroRastreo || 'Se mostrará cuando se asigne');
            this.cuerpo.appendChild(fila);
        }
        this.mensaje.textContent = pedidos.length ? '' : 'Todavía no tienes pedidos registrados.';
    }

    /**
     * Agrega una celda a la fila del historial.
     *
     * @param fila - Fila de la tabla.
     * @param texto - Texto que se muestra en el elemento.
     */
    ponerCeldaHistorial(fila, texto) {
        const celda = document.createElement('td');
        celda.textContent = texto || '—';
        if (String(texto || '').includes('\n')) celda.style.whiteSpace = 'pre-line';
        fila.appendChild(celda);
    }

    /**
     * Reúne los productos de cada compra.
     *
     * @param pedidos - Registros de pedidos devueltos por la API.
     */
    agruparHistorialCliente(pedidos) {
        const porPedido = {};
        for (const pedido of pedidos) {
            if (!porPedido[pedido.idPedido]) {
                porPedido[pedido.idPedido] = { ...pedido, productos: [] };
            }
            const producto = (pedido.familia ? pedido.familia + ' ' : '') + (pedido.variedad || 'Producto');
            const kilos = Number(pedido.kilos || 0).toFixed(2);
            const detalle = producto + ' · Lote #' + pedido.idCosecha + ' · ' + kilos + ' kg · ' + (pedido.maduracion || '');
            porPedido[pedido.idPedido].productos.push(detalle);
        }
        return Object.values(porPedido);
    }
}

const vistaHistorialCliente = new VistaHistorialCliente();
vistaHistorialCliente.cargarHistorialCliente();
