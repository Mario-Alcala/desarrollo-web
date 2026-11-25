/**
 * @file Define el acceso al Catálogo desde la dirección antigua del gestor.
 *
 * @author Equipo de Gestión de Cultivos
 */

/**
 * Abre el catálogo de administración al entrar al gestor anterior.
 */
class AccesoGestor {
    /**
     * Guarda la página de destino.
     *
     * @param {string} rutaCatalogo - Ruta del Catálogo de administración.
     */
    constructor(rutaCatalogo) {
        this.rutaCatalogo = rutaCatalogo;
    }

    /**
     * Abre el catálogo real.
     */
    abrirCatalogo() {
        window.location.replace(this.rutaCatalogo);
    }
}

const accesoGestor = new AccesoGestor('catalogo-admin.html');
