var carrito = {};
var datosCatalogo;
var totalCentavos = 0;
var mensajeCatalogo = document.getElementById('mensaje-catalogo');
var pago = document.getElementById('pago');
var formularioPago = document.getElementById('formulario-pago');


function mostrarCatalogo() {
    try {
        datosCatalogo = leerDatos();
        // Ajustar el pedido si el gestor cambia o elimina un producto.
        for (var id in carrito) {
            var actual = buscarProducto(datosCatalogo, Number(id));
            if (!actual) { delete carrito[id]; }
            else { carrito[id] = Math.min(carrito[id], actual.stock); }
        }
        var lista = document.getElementById('productos');
        lista.innerHTML = '';
        if (datosCatalogo.productos.length === 0) {
            lista.textContent = 'No hay productos disponibles por el momento.';
        }
        datosCatalogo.productos.forEach(function (producto) {
            var tarjeta = document.createElement('article');
            tarjeta.className = 'producto';
            var nombre = document.createElement('h2');
            nombre.textContent = producto.nombre;
            var precio = document.createElement('p');
            precio.textContent = dinero(producto.precio) + ' / kg';
            var stock = document.createElement('p');
            stock.textContent = producto.stock === 0 ? 'Agotado' : 'Disponible: ' + producto.stock + ' kg';
            var controles = document.createElement('div');
            controles.className = 'cantidad';
            var menos = document.createElement('button');
            menos.textContent = '−';
            menos.className = 'boton boton-secundario';
            menos.setAttribute('aria-label', 'Restar un kilo de ' + producto.nombre);
            menos.disabled = !carrito[producto.id];
            menos.onclick = function () { cambiarCantidad(producto.id, -1); };
            var cantidad = document.createElement('span');
            cantidad.textContent = (carrito[producto.id] || 0) + ' kg';
            var mas = document.createElement('button');
            mas.textContent = '+';
            mas.className = 'boton';
            mas.setAttribute('aria-label', 'Sumar un kilo de ' + producto.nombre);
            mas.disabled = (carrito[producto.id] || 0) >= producto.stock;
            mas.onclick = function () { cambiarCantidad(producto.id, 1); };
            controles.appendChild(menos);
            controles.appendChild(cantidad);
            controles.appendChild(mas);
            tarjeta.appendChild(nombre);
            tarjeta.appendChild(precio);
            tarjeta.appendChild(stock);
            tarjeta.appendChild(controles);
            lista.appendChild(tarjeta);
        });
        mostrarResumen();
        return true;
    } catch (error) {
        mensajeCatalogo.textContent = 'No se pudieron cargar los datos del navegador.';
        document.getElementById('finalizar').disabled = true;
        return false;
    }
}

function cambiarCantidad(id, cambio) {
    if (!mostrarCatalogo()) { return; }
    var producto = buscarProducto(datosCatalogo, id);
    if (!producto) { return; }
    var cantidad = (carrito[id] || 0) + cambio;
    if (cantidad >= 0 && cantidad <= producto.stock) {
        carrito[id] = cantidad;
    }
    mostrarCatalogo();
}

function mostrarResumen() {
    var detalle = document.getElementById('detalle-pedido');
    detalle.innerHTML = '';
    totalCentavos = 0;
    datosCatalogo.productos.forEach(function (producto) {
        var kilos = carrito[producto.id] || 0;
        if (kilos > 0) {
            var subtotal = Math.round(producto.precio * 100) * kilos;
            totalCentavos += subtotal;
            var fila = document.createElement('tr');
            agregarCelda(fila, producto.nombre);
            agregarCelda(fila, kilos + ' kg');
            agregarCelda(fila, dinero(subtotal / 100));
            detalle.appendChild(fila);
        }
    });
    if (totalCentavos === 0) {
        var fila = document.createElement('tr');
        agregarCelda(fila, 'Todavía no agregas productos.').colSpan = 3;
        detalle.appendChild(fila);
    }
    document.getElementById('total').textContent = dinero(totalCentavos / 100);
    document.getElementById('finalizar').disabled = totalCentavos === 0;
}

document.getElementById('finalizar').onclick = function () {
    if (!mostrarCatalogo() || totalCentavos === 0) { return; }
    document.getElementById('total-pago').textContent = dinero(totalCentavos / 100);
    document.getElementById('mensaje-pago').textContent = '';
    var hoy = new Date();
    document.getElementById('vencimiento').min = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0');
    pago.showModal();
};

document.getElementById('cancelar-pago').onclick = function () { pago.close(); };
pago.addEventListener('close', function () { formularioPago.reset(); });

formularioPago.addEventListener('submit', function (evento) {
    evento.preventDefault();
    var mensaje = document.getElementById('mensaje-pago');
    if (!document.getElementById('titular').value.trim() || !formularioPago.checkValidity()) {
        mensaje.textContent = 'Completa los datos ficticios de la tarjeta y revisa el vencimiento.';
        return;
    }
    try {
        var datos = leerDatos();
        // Volver a comprobar precio y stock antes de confirmar.
        if (JSON.stringify(datos.productos) !== JSON.stringify(datosCatalogo.productos)) {
            pago.close();
            mostrarCatalogo();
            mensajeCatalogo.textContent = 'El catálogo cambió. Revisa tu pedido y vuelve a finalizar.';
            return;
        }
        if (totalCentavos === 0) { pago.close(); return; }
        var pedido = {
            id: datos.siguientePedido,
            fecha: new Date().toLocaleString('es-MX'),
            estado: 'Recibido (simulación)',
            productos: [],
            total: totalCentavos / 100
        };
        datos.productos.forEach(function (producto) {
            var kilos = carrito[producto.id] || 0;
            if (kilos > 0) {
                pedido.productos.push({ nombre: producto.nombre, kilos: kilos, precio: producto.precio });
                producto.stock -= kilos;
            }
        });
        // Solo se guarda el pedido, nunca los datos de tarjeta.
        datos.pedidos.push(pedido);
        datos.siguientePedido++;
        guardarDatos(datos);
        carrito = {};
        pago.close();
        mostrarCatalogo();
        mensajeCatalogo.textContent = 'Pedido de prueba #' + pedido.id + ' confirmado.';
    } catch (error) {
        mensaje.textContent = 'No se pudo guardar el pedido. Intenta de nuevo.';
    }
});

window.addEventListener('storage', function (evento) {
    if (evento.key === claveDatos || evento.key === null) {
        if (pago.open) { pago.close(); }
        mostrarCatalogo();

        mensajeCatalogo.textContent = 'El catálogo se actualizó. Revisa las cantidades y el total de tu pedido.';
    }
});
window.addEventListener('pageshow', function () { mostrarCatalogo(); });
mostrarCatalogo();
