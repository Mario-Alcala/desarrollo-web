/**
 * Reúne utilidades para dibujar controles y dar formato a los datos de administración.
 *
 * @author Equipo de Gestión de Cultivos
 */
class UtilidadesAdmin {
    /**
     * Guarda el documento que usa esta pantalla.
     *
     * @param {Document} documento - Documento de la página.
     */
    constructor(documento) {
        this.documento = documento;
    }

    /**
     * Crea un elemento HTML.
     *
     * @param etiqueta - Nombre de la etiqueta HTML.
     * @param [texto] - Contenido visible del elemento.
     * @param [clase] - Clase CSS que se asigna al elemento.
     */
    crear(etiqueta, texto, clase) {
        const el = this.documento.createElement(etiqueta);
        if (texto !== undefined && texto !== null) el.textContent = texto;
        if (clase) el.className = clase;
        return el;
    }

    /**
     * Pone en mayúscula la primera letra.
     *
     * @param texto - El texto.
     */
    capitalizar(texto) {
        const t = String(texto || "");
        return t.charAt(0).toUpperCase() + t.slice(1);
    }

    /**
     * Muestra una cantidad en pesos mexicanos.
     *
     * @param n - El número.
     */
    fmtMoneda(n) {
        return Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
    }

    /**
     * Muestra un número con hasta dos decimales.
     *
     * @param n - El número.
     */
    fmtNum(n) {
        return Number(n).toLocaleString("es-MX", { maximumFractionDigits: 2 });
    }

    /**
     * Une familia y variedad para mostrar el producto.
     *
     * @param p - El producto.
     */
    nombreProducto(p) {
        return this.capitalizar(p.familia) + " " + p.variedad;
    }

    /**
     * Crea una insignia de estado.
     *
     * @param texto - Texto que se muestra.
     * @param [tipo] - Categoría o tipo visual del elemento.
     */
    etiqueta(texto, tipo) {
        return this.crear("span", texto, "etq" + (tipo ? " etq-" + tipo : ""));
    }

    /**
     * Crea un botón listo para usar.
     *
     * @param texto - Texto que se muestra.
     * @param clase - Clase CSS del elemento.
     * @param alClic - Función que se ejecuta al dar clic.
     */
    crearBoton(texto, clase, alClic) {
        const b = this.crear("button", texto, clase);
        b.type = "button";
        b.addEventListener("click", alClic);
        return b;
    }

    /**
     * Conecta los botones de filtro.
     *
     * @param contenedor - Elemento que contiene los botones de filtro.
     * @param alElegir - Función que aplica el filtro elegido.
     */
    iniciarFiltros(contenedor, alElegir) {
        contenedor.addEventListener("click", function (evento) {
            const b = evento.target.closest("button[data-valor]");
            if (!b) return;
            const botones = contenedor.querySelectorAll("button");
            for (let i = 0; i < botones.length; i++) {
                botones[i].setAttribute("aria-pressed", String(botones[i] === b));
            }
            alElegir(b.dataset.valor);
        });
    }
}

const utilidadesAdmin = new UtilidadesAdmin(document);

/**
 * Crea un elemento HTML.
 *
 * @param etiqueta - Nombre de la etiqueta HTML.
 * @param [texto] - Contenido visible del elemento.
 * @param [clase] - Clase CSS que se asigna al elemento.
 */
function crear(etiqueta, texto, clase) {
    return utilidadesAdmin.crear(etiqueta, texto, clase);
}

/**
 * Pone en mayúscula la primera letra.
 *
 * @param texto - El texto.
 */
function capitalizar(texto) {
    return utilidadesAdmin.capitalizar(texto);
}

/**
 * Muestra una cantidad en pesos mexicanos.
 *
 * @param n - El número.
 */
function fmtMoneda(n) {
    return utilidadesAdmin.fmtMoneda(n);
}

/**
 * Muestra un número con hasta dos decimales.
 *
 * @param n - El número.
 */
function fmtNum(n) {
    return utilidadesAdmin.fmtNum(n);
}

/**
 * Une familia y variedad para mostrar el producto.
 *
 * @param p - El producto.
 */
function nombreProducto(p) {
    return utilidadesAdmin.nombreProducto(p);
}

/**
 * Crea una insignia de estado.
 *
 * @param texto - Texto que se muestra.
 * @param [tipo] - Categoría o tipo visual del elemento.
 */
function etiqueta(texto, tipo) {
    return utilidadesAdmin.etiqueta(texto, tipo);
}

/**
 * Crea un botón listo para usar.
 *
 * @param texto - Texto que se muestra.
 * @param clase - Clase CSS del elemento.
 * @param alClic - Función que se ejecuta al dar clic.
 */
function crearBoton(texto, clase, alClic) {
    return utilidadesAdmin.crearBoton(texto, clase, alClic);
}

/**
 * Conecta los botones de filtro.
 *
 * @param contenedor - Elemento que contiene los botones de filtro.
 * @param alElegir - Función que aplica el filtro elegido.
 */
function iniciarFiltros(contenedor, alElegir) {
    return utilidadesAdmin.iniciarFiltros(contenedor, alElegir);
}
