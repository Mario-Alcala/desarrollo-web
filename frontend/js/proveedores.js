/* Datos: consulta proveedores y obtiene su identificador para formularios. No recibe atributos. */

let proveedores = [];

/* Datos: obtiene los proveedores registrados en la API. No recibe atributos. */
async function cargarProveedores() {
    const datos = await pedirApi('/proveedores');
    proveedores = datos || [];
}

/* Datos: obtiene el nombre de un proveedor. Recibe su identificador. */
function nombreProveedor(id) {
    const proveedor = proveedores.find(registro => registro.idProveedor === id);
    return proveedor ? proveedor.nombreEmpresa : '';
}

/* Datos: busca el identificador de un proveedor. Recibe su nombre. */
function buscarProveedorNombre(nombre) {
    const nombreBuscado = nombre.toLowerCase();
    const proveedor = proveedores.find(registro => registro.nombreEmpresa.trim().toLowerCase() === nombreBuscado);
    return proveedor ? proveedor.idProveedor : null;
}

/* Datos: asigna el identificador de un proveedor existente o lo registra. Recibe los datos del formulario. */
async function resolverProveedor(datos) {
    const campo = document.getElementById('proveedorNombre');
    if (!campo) {
        return datos;
    }
    const nombre = campo.value.trim();
    delete datos.proveedorNombre;
    await cargarProveedores();
    let id = buscarProveedorNombre(nombre);
    if (id === null) {
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
