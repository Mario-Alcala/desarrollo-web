var proveedores = [];

function cargarProveedores() {
    return pedirApi('/proveedores').then(function (datos) {
        proveedores = datos || [];
    });
}

function nombreProveedor(id) {
    for (var i = 0; i < proveedores.length; i++) {
        if (proveedores[i].idProveedor === id) {
            return proveedores[i].nombreEmpresa;
        }
    }
    return '';
}

function buscarProveedorNombre(nombre) {
    for (var i = 0; i < proveedores.length; i++) {
        if (proveedores[i].nombreEmpresa.trim().toLowerCase() === nombre.toLowerCase()) {
            return proveedores[i].idProveedor;
        }
    }
    return null;
}

function resolverProveedor(datos) {
    var campo = document.getElementById('proveedorNombre');
    if (!campo) {
        return Promise.resolve(datos);
    }
    var nombre = campo.value.trim();
    delete datos.proveedorNombre;
    return cargarProveedores().then(function () {
        var id = buscarProveedorNombre(nombre);
        if (id !== null) {
            return id;
        }
        // Registrar el nombre nuevo y recuperar el ID asignado por Java.
        return pedirApi('/proveedores', 'POST', { nombreEmpresa: nombre })
            .then(cargarProveedores)
            .then(function () {
                var nuevoId = buscarProveedorNombre(nombre);
                if (nuevoId === null) {
                    throw new Error('No se pudo registrar el proveedor.');
                }
                return nuevoId;
            });
    }).then(function (id) {
        datos.idProveedor = id;
        return datos;
    });
}
