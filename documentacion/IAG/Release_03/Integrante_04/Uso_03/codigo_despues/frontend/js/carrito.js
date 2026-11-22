var carrito = {};
var datosCatalogo;
var totalCentavos = 0;
var mensajeCatalogo = document.getElementById('mensaje-catalogo');



function mostrarCatalogo() {
    try {
        datosCatalogo = leerDatos();

        // Ajustar el pedido si el gestor cambia o elimina un producto.
        for (var id in carrito) {
            var actual = buscarProducto(datosCatalogo, Number(id));
            if (!actual) {
                delete carrito[id];
            } else {
                carrito[id] = Math.min(carrito[id], actual.stock);
            }
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
            stock.textContent = producto.stock === 0
                ? 'Agotado'
                : 'Disponible: ' + producto.stock + ' kg';

            var controles = document.createElement('div');
            controles.className = 'cantidad';

            var menos = document.createElement('button');
            menos.textContent = '−';
            menos.className = 'boton boton-secundario';
            menos.setAttribute('aria-label', 'Restar un kilo de ' + producto.nombre);
            menos.disabled = !carrito[producto.id];
            menos.onclick = function () {
                cambiarCantidad(producto.id, -1);
            };

            var cantidad = document.createElement('span');
            cantidad.textContent = (carrito[producto.id] || 0) + ' kg';

            var mas = document.createElement('button');
            mas.textContent = '+';
            mas.className = 'boton';
            mas.setAttribute('aria-label', 'Sumar un kilo de ' + producto.nombre);
            mas.disabled = (carrito[producto.id] || 0) >= producto.stock;
            mas.onclick = function () {
                cambiarCantidad(producto.id, 1);
            };

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
        guardarCarrito();
        return true;
    } catch (error) {
        mensajeCatalogo.textContent = 'No se pudieron cargar los datos del navegador.';
        document.getElementById('finalizar').disabled = true;
        return false;
    }
}

function cambiarCantidad(id, cambio) {
    if (!mostrarCatalogo()) {
        return;
    }

    var producto = buscarProducto(datosCatalogo, id);
    if (!producto) {
        return;
    }

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

function guardarCarrito() {
    var borrador = leerBorrador();
    borrador.cantidades = {};
    for (var id in carrito) {
        if (carrito[id] > 0) {
            borrador.cantidades[id] = carrito[id];
        }
    }
    guardarBorrador(borrador);
}

document.getElementById('finalizar').onclick = function () {
    if (!mostrarCatalogo() || totalCentavos === 0) {
        return;
    }
    try {
        guardarCarrito();
        window.location.href = 'pago.html';
    } catch (error) {
        mensajeCatalogo.textContent = 'No se pudo guardar el pedido para continuar.';
    }
};

window.addEventListener('storage', function (evento) {
    if (evento.key === claveDatos || evento.key === null) {
        mostrarCatalogo();
        mensajeCatalogo.textContent = 'El catálogo se actualizó. Revisa las cantidades y el total de tu pedido.';
    }
});

window.addEventListener('pageshow', function () {
    try {
        carrito = leerBorrador().cantidades;
        mostrarCatalogo();
    } catch (error) {
        mensajeCatalogo.textContent = 'No se pudo recuperar el pedido.';
    }
});
