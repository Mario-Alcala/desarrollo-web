function mostrarHistorial() {
    var cuerpo = document.getElementById('historial-pedidos');
    var mensaje = document.getElementById('mensaje-historial');
    cuerpo.innerHTML = '';
    mensaje.textContent = '';

    try {
        var pedidos = leerDatos().pedidos;
        // Los pedidos más recientes aparecen primero.
        for (var i = pedidos.length - 1; i >= 0; i--) {
            var pedido = pedidos[i];
            var fecha = pedido.fecha ? pedido.fecha.split(',')[0] : '—';
            pedido.productos.forEach(function (producto) {
                var fila = document.createElement('tr');
                agregarCelda(fila, producto.nombre);
                agregarCelda(fila, producto.kilos + ' kg');
                agregarCelda(fila, fecha);
                agregarCelda(fila, pedido.tipoEntrega || 'No especificado');
                cuerpo.appendChild(fila);
            });
        }
        if (pedidos.length === 0) {
            mensaje.textContent = 'Todavía no tienes pedidos.';
        }
    } catch (error) {
        mensaje.textContent = 'No se pudo consultar el historial.';
    }
}

window.addEventListener('storage', function (evento) {
    if (evento.key === claveDatos || evento.key === null) {
        mostrarHistorial();
    }
});
window.addEventListener('pageshow', mostrarHistorial);
mostrarHistorial();
