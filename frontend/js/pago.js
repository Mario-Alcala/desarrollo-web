var formularioPago = document.getElementById('formulario-pago');
var mensajePago = document.getElementById('mensaje-pago');
var seleccionPago = [];
var enviandoPedido = false;

function mostrarResumenPago(seleccion) {
    var cuerpo = document.getElementById('resumen-pago'); cuerpo.innerHTML = '';
    var total = 0;
    seleccion.forEach(function (lote) {
        var subtotal = subtotalCentavos(lote.precioKilo, lote.kilos); total += subtotal;
        var fila = document.createElement('tr');
        agregarCelda(fila, lote.nombre + ' · Lote ' + lote.idCosecha);
        agregarCelda(fila, lote.kilos.toFixed(2)); agregarCelda(fila, dinero(subtotal / 100)); cuerpo.appendChild(fila);
    });
    document.getElementById('total-pago').textContent = dinero(total / 100);
}

function guardarOpciones() {
    var borrador = leerBorrador();
    borrador.tipoEntrega = document.getElementById('tipo-entrega').value;
    borrador.direccion = document.getElementById('direccion').value.trim();
    borrador.metodoPago = document.getElementById('metodo-pago').value;
    guardarBorrador(borrador);
}

function mostrarOpciones() {
    var domicilio = document.getElementById('tipo-entrega').value === 'domicilio';
    document.getElementById('datos-domicilio').hidden = !domicilio;
    document.getElementById('direccion').required = domicilio;
    document.getElementById('direccion').disabled = !domicilio;
    document.getElementById('datos-recoleccion').hidden = domicilio;
    document.getElementById('datos-transferencia').hidden = document.getElementById('metodo-pago').value !== 'transferencia';
    guardarOpciones();
}

document.getElementById('tipo-entrega').onchange = mostrarOpciones;
document.getElementById('metodo-pago').onchange = mostrarOpciones;
document.getElementById('direccion').onchange = guardarOpciones;
document.getElementById('recoleccion').onclick = function () {
    guardarOpciones(); window.location.href = 'recoleccion.html';
};

formularioPago.addEventListener('submit', function (evento) {
    evento.preventDefault();
    if (enviandoPedido || !formularioPago.reportValidity()) { return; }
    guardarOpciones();
    var borrador = leerBorrador();
    if (borrador.tipoEntrega === 'domicilio' && !borrador.direccion) {
        mensajePago.textContent = 'Escribe la dirección de entrega.'; return;
    }
    if (borrador.tipoEntrega === 'recoleccion' && !fechaPermitida(borrador.fechaRecoleccion)) {
        mensajePago.textContent = 'Selecciona una fecha de recolección válida.'; return;
    }
    enviandoPedido = true;
    document.getElementById('confirmar-pago').disabled = true;
    mensajePago.textContent = 'Guardando pedido...';
    consultarSeleccion().then(function (actuales) {
        if (JSON.stringify(actuales) !== JSON.stringify(seleccionPago)) {
            seleccionPago = actuales; mostrarResumenPago(actuales);
            throw new Error('Los precios cambiaron. Revisa el resumen y vuelve a confirmar.');
        }
        return pedirApi('/pedidos', 'POST', {
            metodoPago: borrador.metodoPago,
            tipoEntrega: borrador.tipoEntrega,
            direccion: borrador.tipoEntrega === 'domicilio' ? borrador.direccion : null,
            fechaRecoleccion: borrador.tipoEntrega === 'recoleccion' ? borrador.fechaRecoleccion : null,
            detalles: actuales.map(function (lote) { return { idCosecha: lote.idCosecha, kilos: lote.kilos }; })
        });
    }).then(function (pedido) {
        sessionStorage.removeItem(claveBorrador);
        document.getElementById('contenido-pago').hidden = true;
        document.getElementById('confirmacion-pedido').hidden = false;
        document.getElementById('numero-pedido').textContent = 'Pedido #' + pedido.idPedido + ' · Total: ' + dinero(pedido.total);
        document.getElementById('fecha-confirmada').textContent = borrador.tipoEntrega === 'recoleccion' ?
            'Recolección: ' + borrador.fechaRecoleccion : 'Entrega en: ' + borrador.direccion;
        mensajePago.textContent = 'Pedido registrado. El pago está pendiente de confirmación.';
    }).catch(function (error) {
        mensajePago.textContent = mensajeCliente(error);
        if (error instanceof TypeError) {
            mensajePago.textContent += ' Consulta tu historial antes de reintentar para evitar un pedido duplicado.';
        }
    }).finally(function () {
        enviandoPedido = false;
        document.getElementById('confirmar-pago').disabled = false;
    });
});

document.getElementById('entregar-pedido').onclick = function () {
    document.getElementById('confirmacion-pedido').hidden = true;
    mensajePago.textContent = '';
    document.getElementById('seccion-rastreo').hidden = false;
};

window.addEventListener('pageshow', function () {
    if (!document.getElementById('confirmacion-pedido').hidden || !document.getElementById('seccion-rastreo').hidden) { return; }
    var borrador = leerBorrador();
    document.getElementById('tipo-entrega').value = borrador.tipoEntrega || 'recoleccion';
    document.getElementById('direccion').value = borrador.direccion || '';
    document.getElementById('metodo-pago').value = borrador.metodoPago || 'transferencia';
    document.getElementById('fecha-elegida').textContent = fechaPermitida(borrador.fechaRecoleccion) ?
        'Día de recolección: ' + borrador.fechaRecoleccion : 'Selecciona el día de recolección.';
    mostrarOpciones();
    document.getElementById('confirmar-pago').disabled = true;
    consultarSeleccion().then(function (seleccion) {
        seleccionPago = seleccion; mostrarResumenPago(seleccion);
        document.getElementById('confirmar-pago').disabled = false;
    }).catch(function (error) { mensajePago.textContent = mensajeCliente(error); });
});
