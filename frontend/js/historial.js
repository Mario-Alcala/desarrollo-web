function mostrarHistorial() {
    var cuerpo = document.getElementById('historial-pedidos');
    var mensaje = document.getElementById('mensaje-historial');
    cuerpo.innerHTML = '';
    mensaje.textContent = 'Consultando pedidos...';
    pedirApi('/pedidos').then(function (detalles) {
        detalles.forEach(function (detalle) {
            var fila = document.createElement('tr');
            agregarCelda(fila, '#' + detalle.idPedido + ' · ' + detalle.nombre + ' · Lote ' + detalle.idCosecha);
            agregarCelda(fila, Number(detalle.kilos).toFixed(2) + ' kg');
            agregarCelda(fila, String(detalle.fechaPedido).slice(0, 10));
            agregarCelda(fila, detalle.tipoEntrega === 'recoleccion' ? 'Recolección: ' + detalle.fechaRecoleccion : 'Domicilio: ' + detalle.direccion);
            agregarCelda(fila, dinero(detalle.precioKilo));
            agregarCelda(fila, dinero(subtotalCentavos(detalle.precioKilo, detalle.kilos) / 100));
            agregarCelda(fila, detalle.estado);
            cuerpo.appendChild(fila);
        });
        mensaje.textContent = detalles.length ? '' : 'Todavía no tienes pedidos.';
    }).catch(function (error) { mensaje.textContent = mensajeCliente(error); });
}
window.addEventListener('pageshow', mostrarHistorial);
