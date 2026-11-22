var formularioPago = document.getElementById('formulario-pago');
var mensajePago = document.getElementById('mensaje-pago');
var productosPago = [];
var totalPago = 0;

function revisarPedido() {
    var borrador = leerBorrador();
    var datos = leerDatos();
    var productos = [];
    for (var id in borrador.cantidades) {
        var kilos = borrador.cantidades[id];
        var producto = buscarProducto(datos, Number(id));
        if (!producto || !Number.isInteger(kilos) || kilos <= 0 || kilos > producto.stock) {
            throw new Error('El pedido cambió o no hay suficientes kilos. Regresa al catálogo para revisarlo.');
        }
        productos.push({ id: producto.id, nombre: producto.nombre, kilos: kilos, precio: producto.precio });
    }
    if (!productos.length) {
        throw new Error('No tienes productos seleccionados. Regresa al catálogo.');
    }
    return productos;
}

function mostrarPago() {
    try {
        productosPago = revisarPedido();
        var cuerpo = document.getElementById('resumen-pago');
        cuerpo.innerHTML = '';
        var centavos = 0;
        for (var i = 0; i < productosPago.length; i++) {
            var producto = productosPago[i];
            var subtotal = Math.round(producto.precio * 100) * producto.kilos;
            centavos += subtotal;
            var fila = document.createElement('tr');
            agregarCelda(fila, producto.nombre);
            agregarCelda(fila, producto.kilos);
            agregarCelda(fila, dinero(subtotal / 100));
            cuerpo.appendChild(fila);
        }
        totalPago = centavos / 100;
        document.getElementById('total-pago').textContent = dinero(totalPago);
        var fecha = leerBorrador().fechaRecoleccion;
        document.getElementById('fecha-elegida').textContent = fechaPermitida(fecha) ? 'Día de recolección: ' + fecha : 'Selecciona el día de recolección.';
        document.getElementById('vencimiento').min = fechaLocal(new Date()).slice(0, 7);
        document.getElementById('confirmar-pago').disabled = false;
        return true;
    } catch (error) {
        mensajePago.textContent = error.message;
        document.getElementById('confirmar-pago').disabled = true;
        return false;
    }
}

document.getElementById('recoleccion').onclick = function () {
    if (mostrarPago()) {
        window.location.href = 'recoleccion.html';
    }
};

formularioPago.addEventListener('submit', function (evento) {
    evento.preventDefault();
    try {
        var borrador = leerBorrador();
        if (!fechaPermitida(borrador.fechaRecoleccion)) {
            mensajePago.textContent = 'Selecciona una fecha válida con el botón Recolección.';
            return;
        }
        document.getElementById('titular').value = document.getElementById('titular').value.trim();
        document.getElementById('vencimiento').min = fechaLocal(new Date()).slice(0, 7);
        if (!formularioPago.reportValidity()) {
            return;
        }
        var actuales = revisarPedido();
        if (JSON.stringify(actuales) !== JSON.stringify(productosPago)) {
            mostrarPago();
            mensajePago.textContent = 'Los productos o precios cambiaron. Revisa el total antes de confirmar otra vez.';
            return;
        }
        document.getElementById('confirmar-pago').disabled = true;
        var datos = leerDatos();
        var pedido = {
            id: datos.siguientePedido,
            fecha: new Date().toLocaleString('es-MX'),
            fechaRecoleccion: borrador.fechaRecoleccion,
            tipoEntrega: 'Recolección',
            metodoPago: document.getElementById('metodo-pago').value,
            estado: 'Recibido (simulación)',
            productos: actuales,
            total: totalPago
        };
        for (var i = 0; i < actuales.length; i++) {
            var producto = actuales[i];
            buscarProducto(datos, producto.id).stock -= producto.kilos;
        }
        datos.pedidos.push(pedido);
        datos.siguientePedido++;
        // Se guarda el pedido sin los datos de tarjeta.
        guardarDatos(datos);
        sessionStorage.removeItem(claveBorrador);
        formularioPago.reset();
        document.getElementById('contenido-pago').hidden = true;
        document.getElementById('confirmacion-pedido').hidden = false;
        document.getElementById('numero-pedido').textContent = 'Número de pedido: ' + pedido.id;
        document.getElementById('fecha-confirmada').textContent = 'Día de recolección: ' + pedido.fechaRecoleccion + ' · Horario: 6:00 a. m. a 6:00 p. m.';
        mensajePago.textContent = 'Pedido de prueba confirmado.';
    } catch (error) {
        mensajePago.textContent = error.message;
        document.getElementById('confirmar-pago').disabled = false;
    }
});

window.addEventListener('pageshow', function () {
    formularioPago.reset();
    cambiarMetodoPago();
    if (document.getElementById('confirmacion-pedido').hidden) {
        mostrarPago();
    }
});
mostrarPago();

function cambiarMetodoPago() {
    var transferencia = document.getElementById('metodo-pago').value === 'Transferencia';
    document.getElementById('datos-transferencia').hidden = !transferencia;
    document.getElementById('datos-tarjeta').hidden = transferencia;
    var camposTarjeta = document.querySelectorAll('#datos-tarjeta input');
    for (var i = 0; i < camposTarjeta.length; i++) {
        camposTarjeta[i].disabled = transferencia;
    }
}

document.getElementById('metodo-pago').onchange = cambiarMetodoPago;
document.getElementById('entregar-pedido').onclick = function () {
    document.getElementById('confirmacion-pedido').hidden = true;
    document.getElementById('mensaje-pago').textContent = '';
    document.getElementById('seccion-rastreo').hidden = false;
};
cambiarMetodoPago();
