var idEdicion = null;
var formularioCultivo = document.getElementById('formulario-cultivo');
var nombreCultivo = document.getElementById('nombre-cultivo');
var precioCultivo = document.getElementById('precio');
var stockCultivo = document.getElementById('stock');
var mensajeGestor = document.getElementById('mensaje-gestor');

function mostrarCultivos() {
    try {
        var datos = leerDatos();
        var lista = document.getElementById('lista-cultivos');
        lista.innerHTML = '';
        if (datos.productos.length === 0) {
            var vacia = document.createElement('tr');
            agregarCelda(vacia, 'No hay cultivos registrados.').colSpan = 4;
            lista.appendChild(vacia);
        }
        for (let i = 0; i < datos.productos.length; i++) {
            let producto = datos.productos[i];
            var fila = document.createElement('tr');
            agregarCelda(fila, producto.nombre);
            agregarCelda(fila, dinero(producto.precio));
            agregarCelda(fila, producto.stock + ' kg');
            var acciones = agregarCelda(fila, '');
            var editar = document.createElement('button');
            editar.textContent = 'Editar';
            editar.className = 'boton boton-secundario';
            editar.onclick = function () { editarCultivo(producto.id); };
            var borrar = document.createElement('button');
            borrar.textContent = 'Borrar';
            borrar.className = 'boton boton-secundario';
            borrar.onclick = function () { borrarCultivo(producto.id); };
            acciones.appendChild(editar);
            acciones.appendChild(borrar);
            lista.appendChild(fila);
        }
    } catch (error) {
        mensajeGestor.textContent = 'No se pudieron leer los datos guardados del navegador.';
    }
}

function cancelarEdicion() {
    idEdicion = null;
    formularioCultivo.reset();
    document.getElementById('titulo-formulario').textContent = 'Agregar cultivo';
    document.getElementById('guardar-cultivo').textContent = 'Agregar cultivo';
    document.getElementById('cancelar-edicion').hidden = true;
}

function editarCultivo(id) {
    try {
        var producto = buscarProducto(leerDatos(), id);
        if (!producto) { mostrarCultivos(); return; }
        idEdicion = id;
        nombreCultivo.value = producto.nombre;
        precioCultivo.value = producto.precio;
        stockCultivo.value = producto.stock;
        document.getElementById('titulo-formulario').textContent = 'Editar cultivo';
        document.getElementById('guardar-cultivo').textContent = 'Guardar cambios';
        document.getElementById('cancelar-edicion').hidden = false;
        nombreCultivo.focus();
    } catch (error) {
        mensajeGestor.textContent = 'No se pudo cargar el cultivo.';
    }
}

function borrarCultivo(id) {
    if (!confirm('¿Borrar este cultivo del catálogo?')) { return; }
    try {
        var datos = leerDatos();
        var productosRestantes = [];
        for (var i = 0; i < datos.productos.length; i++) {
            if (datos.productos[i].id !== id) {
                productosRestantes.push(datos.productos[i]);
            }
        }
        datos.productos = productosRestantes;
        guardarDatos(datos);
        if (idEdicion === id) { cancelarEdicion(); }
        mostrarCultivos();
        mensajeGestor.textContent = 'Cultivo eliminado.';
    } catch (error) {
        mensajeGestor.textContent = 'No se pudo guardar el cambio. Revisa el almacenamiento del navegador.';
    }
}

formularioCultivo.addEventListener('submit', function (evento) {
    evento.preventDefault();
    var nombre = nombreCultivo.value.trim();
    var precio = Number(precioCultivo.value);
    var stock = Number(stockCultivo.value);
    if (!nombre || !formularioCultivo.checkValidity() || !Number.isFinite(precio) || !Number.isInteger(stock)) {
        mensajeGestor.textContent = 'Escribe un nombre, un precio mayor que cero y un stock entero desde cero.';
        return;
    }
    try {
        var datos = leerDatos();
        if (idEdicion === null) {
            datos.productos.push({ id: datos.siguienteId, nombre: nombre, precio: precio, stock: stock });
            datos.siguienteId++;
        } else {
            var producto = buscarProducto(datos, idEdicion);
            if (!producto) {
                mensajeGestor.textContent = 'Este cultivo fue borrado en otra pestaña. Puedes agregarlo de nuevo.';
                cancelarEdicion();
                mostrarCultivos();
                return;
            }
            producto.nombre = nombre;
            producto.precio = precio;
            producto.stock = stock;
        }
        guardarDatos(datos);
        cancelarEdicion();
        mostrarCultivos();
        mensajeGestor.textContent = 'Cultivo guardado. El catálogo ya está actualizado.';
    } catch (error) {
        mensajeGestor.textContent = 'No se pudo guardar. Revisa el almacenamiento del navegador.';
    }
});

document.getElementById('cancelar-edicion').onclick = cancelarEdicion;
window.addEventListener('storage', function (evento) {
    if (evento.key === claveDatos || evento.key === null) {
        cancelarEdicion();
        mostrarCultivos();
        mensajeGestor.textContent = 'Los datos cambiaron en otra pestaña. Se actualizó la lista.';
    }
});
mostrarCultivos();
