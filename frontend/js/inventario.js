/**
 * @file Prepara los campos del inventario cuando se abre la sección de semillas.
 *
 * @author Equipo de Gestión de Cultivos
 */

/**
 * Configura la ruta y los campos de semillas.
 */
function prepararInventarioSemillas() {
    const seccionInventario = new URLSearchParams(window.location.search).get('seccion');
    if (seccionInventario !== 'semillas') return;

    document.querySelector('h1').textContent = 'Inventario · Semillas';
    const formularioSemillas = document.getElementById('formulario-operacion');
    formularioSemillas.dataset.ruta = '/semillas';
    formularioSemillas.dataset.id = 'id';
    formularioSemillas.querySelector('.campos-operacion').innerHTML = `
        <div>
            <label for="nombre">Nombre de la semilla</label>
            <input id="nombre" name="nombre" type="text" maxlength="100" required>
        </div>
        <div>
            <label for="unidadMedida">Unidad de medida</label>
            <input id="unidadMedida" name="unidadMedida" type="text" maxlength="20" required>
        </div>
        <div>
            <label for="proveedorNombre">Proveedor</label>
            <input id="proveedorNombre" name="proveedorNombre" type="text" maxlength="100" required>
        </div>`;
    document.querySelector('thead tr').innerHTML = `
        <th data-campo="nombre">Semilla</th>
        <th data-campo="unidadMedida">Unidad</th>
        <th data-campo="idProveedor">Proveedor</th>
        <th>Acciones</th>`;
}

prepararInventarioSemillas();
