const API_HISTORIAL_CLIENTE = 'http://localhost:8081/api';
const cuerpoHistorialCliente = document.getElementById('historial-pedidos');
const mensajeHistorialCliente = document.getElementById('mensaje-historial');

function ponerCeldaHistorial(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto || '—';
    if (String(texto || '').includes('\n')) celda.style.whiteSpace = 'pre-line';
    fila.appendChild(celda);
}

async function cargarHistorialCliente() {
    const idUsuario = sessionStorage.getItem('usuarioId');
    if (!idUsuario || sessionStorage.getItem('usuarioRol') !== 'cliente') {
        mensajeHistorialCliente.textContent = 'Inicia sesión con tu cuenta de cliente para ver tus pedidos.';
        return;
    }
    mensajeHistorialCliente.textContent = 'Cargando pedidos…';
    try {
        const respuesta = await fetch(API_HISTORIAL_CLIENTE + '/pedidos/cliente/' + encodeURIComponent(idUsuario));
        if (!respuesta.ok) throw new Error('No se pudo cargar tu historial de pedidos.');
        const pedidos = await respuesta.json();
        cuerpoHistorialCliente.replaceChildren();
        const porPedido = {};
        pedidos.forEach(function (pedido) {
            if (!porPedido[pedido.idPedido]) porPedido[pedido.idPedido] = { ...pedido, productos: [] };
            porPedido[pedido.idPedido].productos.push((pedido.familia ? pedido.familia + ' ' : '') + (pedido.variedad || 'Producto') + ' · Lote #' + pedido.idCosecha + ' · ' + Number(pedido.kilos || 0).toFixed(2) + ' kg · ' + (pedido.maduracion || ''));
        });
        Object.values(porPedido).forEach(function (pedido) {
            const fila = document.createElement('tr');
            ponerCeldaHistorial(fila, '#' + pedido.idPedido + ' · ' + String(pedido.fechaPedido || '').replace('T', ' '));
            ponerCeldaHistorial(fila, pedido.productos.join('\n'));
            ponerCeldaHistorial(fila, pedido.productos.length + (pedido.productos.length === 1 ? ' producto' : ' productos'));
            ponerCeldaHistorial(fila, '$' + Number(pedido.total || 0).toFixed(2));
            const entrega = pedido.tipoEntrega === 'domicilio'
                ? 'Domicilio · ' + (pedido.direccion || 'Dirección registrada')
                : 'Recolección · ' + (pedido.fechaRecoleccion || 'Fecha pendiente');
            ponerCeldaHistorial(fila, entrega);
            ponerCeldaHistorial(fila, pedido.estadoEntrega || pedido.estadoPedido);
            ponerCeldaHistorial(fila, pedido.numeroRastreo || 'Se mostrará cuando se asigne');
            cuerpoHistorialCliente.appendChild(fila);
        });
        mensajeHistorialCliente.textContent = pedidos.length ? '' : 'Todavía no tienes pedidos registrados.';
    } catch (error) { mensajeHistorialCliente.textContent = error.message; }
}

cargarHistorialCliente();
