var claveDatos = 'gestion-cultivos-tienda';

function leerDatos() {
    var guardados = localStorage.getItem(claveDatos);
    if (guardados !== null) {
        return JSON.parse(guardados);
    }

    // valores de ejemplos tal y como lo pidio mario 
    var datos = {
        productos: [
            { id: 1, nombre: 'Maíz criollo', precio: 18, stock: 50 },
            { id: 2, nombre: 'Frijol negro', precio: 35, stock: 40 },
            { id: 3, nombre: 'Tomate saladette', precio: 24, stock: 30 }
        ],
        pedidos: [],
        siguienteId: 4,
        siguientePedido: 1
    };
    guardarDatos(datos);
    return datos;
}

function guardarDatos(datos) {
    localStorage.setItem(claveDatos, JSON.stringify(datos));
}

function dinero(cantidad) {
    return '$' + cantidad.toFixed(2);
}

function buscarProducto(datos, id) {
    for (var i = 0; i < datos.productos.length; i++) {
        if (datos.productos[i].id === id) {
            return datos.productos[i];
        }
    }
    return null;
}

function agregarCelda(fila, texto) {
    var celda = document.createElement('td');
    celda.textContent = texto;
    fila.appendChild(celda);
    return celda;
}
