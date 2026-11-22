var proveedores = [];

async function cargarProveedores() {
    var datos = await pedirApi('/proveedores');
    proveedores = datos || [];
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

async function resolverProveedor(datos) {
    var campo = document.getElementById('proveedorNombre');
    if (!campo) {
        return datos;
    }
    var nombre = campo.value.trim();
    delete datos.proveedorNombre;
    await cargarProveedores();
    var id = buscarProveedorNombre(nombre);
    if (id === null) {
        // Registrar el nombre nuevo y recuperar el ID asignado por Java.
        await pedirApi('/proveedores', 'POST', { nombreEmpresa: nombre });
        await cargarProveedores();
        id = buscarProveedorNombre(nombre);
        if (id === null) {
            throw new Error('No se pudo registrar el proveedor.');
        }
    }
    datos.idProveedor = id;
    return datos;
}
