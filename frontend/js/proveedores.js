/**
 * @file Consulta proveedores y obtiene su identificador para formularios.
 *
 * @author Equipo de Gestión de Cultivos
 */

let proveedores = [];

/**
 * Obtiene los proveedores registrados en la API.
 */
async function cargarProveedores() {
    const datos = await pedirApi('/proveedores');
    proveedores = datos || [];
}

/**
 * Obtiene el nombre de un proveedor.
 *
 * @param {number} id - Identificador del proveedor.
 */
function nombreProveedor(id) {
    const proveedor = proveedores.find(registro => registro.idProveedor === id);
    return proveedor ? proveedor.nombreEmpresa : '';
}

/**
 * Busca el identificador de un proveedor.
 *
 * @param {string} nombre - Nombre del proveedor que se busca.
 */
function buscarProveedorNombre(nombre) {
    const nombreBuscado = nombre.toLowerCase();
    const proveedor = proveedores.find(registro => registro.nombreEmpresa.trim().toLowerCase() === nombreBuscado);
    return proveedor ? proveedor.idProveedor : null;
}

/**
 * Asigna el identificador de un proveedor existente o lo registra.
 *
 * @param {Object} datos - Datos que se guardarán en el formulario.
 */
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
