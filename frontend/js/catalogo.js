function mostrarCatalogo() {
    var lista = document.getElementById('productos');
    var mensaje = document.getElementById('mensaje-catalogo');
    lista.innerHTML = '';
    try {
        var datos = leerDatos();
        mensaje.textContent = '';
        if (datos.productos.length === 0) {
            mensaje.textContent = 'No hay productos disponibles por el momento.';
        }

        // Mostrar la información; las cantidades se eligen en el carrito.
        for (var i = 0; i < datos.productos.length; i++) {
            var producto = datos.productos[i];
            var tarjeta = document.createElement('article');
            tarjeta.className = 'producto';
            var nombre = document.createElement('h2');
            nombre.textContent = producto.nombre;
            var precio = document.createElement('p');
            precio.textContent = dinero(producto.precio) + ' / kg';
            var stock = document.createElement('p');
            stock.textContent = producto.stock === 0 ? 'Agotado' : 'Disponible: ' + producto.stock + ' kg';
            tarjeta.appendChild(nombre);
            tarjeta.appendChild(precio);
            tarjeta.appendChild(stock);
            lista.appendChild(tarjeta);
        }
    } catch (error) {
        mensaje.textContent = 'No se pudieron cargar los datos del navegador.';
    }
}

window.addEventListener('storage', function (evento) {
    if (evento.key === claveDatos || evento.key === null) {
        mostrarCatalogo();
    }
});
window.addEventListener('pageshow', mostrarCatalogo);
mostrarCatalogo();
