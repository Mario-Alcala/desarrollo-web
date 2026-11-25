/**
 * Abre el catálogo desde la dirección anterior del gestor.
 *
 * @author Equipo de Gestión de Cultivos
 */
class Gestor {
    /**
     * Guarda el acceso al catálogo.
     *
     * @param {AccesoGestor} acceso - Objeto que conoce la ruta del catálogo.
     */
    constructor(acceso) {
        this.acceso = acceso;
    }

    /** Abre el catálogo de administración. */
    iniciar() {
        this.acceso.abrirCatalogo();
    }
}

const gestor = new Gestor(accesoGestor);
gestor.iniciar();
