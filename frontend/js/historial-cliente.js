/**
 * @file Consulta y muestra los pedidos de la cuenta del cliente.
 *
 * @author Equipo de Gestión de Cultivos
 */
const API_HISTORIAL_CLIENTE = 'http://' + window.location.hostname + ':8081/api';
const cuerpoHistorialCliente = document.getElementById('historial-pedidos');
const mensajeHistorialCliente = document.getElementById('mensaje-historial');

/**
 * Pide el historial por id de la cuenta en sesión.
 */
async function cargarHistorialCliente() {
    const idUsuario = sessionStorage.getItem('usuarioId');
    if (!idUsuario || sessionStorage.getItem('usuarioRol') !== 'cliente') {
        mensajeHistorialCliente.textContent = 'Inicia sesión con tu cuenta de cliente para ver tus pedidos.';
        return;
    }
    mensajeHistorialCliente.textContent = 'Cargando pedidos…';
    try {
        const ruta = API_HISTORIAL_CLIENTE + '/pedidos/cliente/' + encodeURIComponent(idUsuario);
        const respuesta = await fetch(ruta, { credentials: 'include' });
        if (!respuesta.ok) throw new Error('No se pudo cargar tu historial de pedidos.');
        const pedidos = await respuesta.json();
        mostrarHistorialCliente(pedidos);
    } catch (error) {
        mensajeHistorialCliente.textContent = error.message;
    }
}

/**
 * Muestra una fila por pedido.
 *
 * @param pedidos - Registros de pedidos devueltos por la API.
 */
function mostrarHistorialCliente(pedidos) {
    cuerpoHistorialCliente.replaceChildren();
    for (const pedido of agruparHistorialCliente(pedidos)) {
        const fila = document.createElement('tr');
        ponerCeldaHistorial(fila, '#' + pedido.idPedido + ' · ' + String(pedido.fechaPedido || '').replace('T', ' '));
        ponerCeldaHistorial(fila, pedido.productos.join('\n'));
        const cantidad = pedido.productos.length;
        ponerCeldaHistorial(fila, cantidad + (cantidad === 1 ? ' producto' : ' productos'));
        ponerCeldaHistorial(fila, '$' + Number(pedido.total || 0).toFixed(2));
        const entrega = pedido.tipoEntrega === 'domicilio'
            ? 'Domicilio · ' + (pedido.direccion || 'Dirección registrada')
            : 'Recolección · ' + (pedido.fechaRecoleccion || 'Fecha pendiente');
        ponerCeldaHistorial(fila, entrega);
        ponerCeldaHistorial(fila, pedido.estadoEntrega || pedido.estadoPedido);
        ponerCeldaHistorial(fila, pedido.numeroRastreo || 'Se mostrará cuando se asigne');
        cuerpoHistorialCliente.appendChild(fila);
    }
    mensajeHistorialCliente.textContent = pedidos.length ? '' : 'Todavía no tienes pedidos registrados.';
}

function ponerCeldaHistorial(fila, texto) {
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
function agruparHistorialCliente(pedidos) {
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

cargarHistorialCliente();
