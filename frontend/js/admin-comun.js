/* Datos: reúne utilidades para dibujar controles y dar formato a los datos de administración. No recibe atributos. */

/* Datos: crea un elemento HTML. Recibe la etiqueta, el texto y la clase. */
function crear(etiqueta, texto, clase) {
    const el = document.createElement(etiqueta);
    if (texto !== undefined && texto !== null) el.textContent = texto;
    if (clase) el.className = clase;
    return el;
}

/* Datos: pone en mayúscula la primera letra. Recibe el texto. */
function capitalizar(texto) {
    const t = String(texto || "");
    return t.charAt(0).toUpperCase() + t.slice(1);
}

/* Datos: muestra una cantidad en pesos mexicanos. Recibe el número. */
function fmtMoneda(n) {
    return Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

/* Datos: muestra un número con hasta dos decimales. Recibe el número. */
function fmtNum(n) {
    return Number(n).toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

/* Datos: une familia y variedad para mostrar el producto. Recibe el producto. */
function nombreProducto(p) {
    return capitalizar(p.familia) + " " + p.variedad;
}

/* Datos: crea una insignia de estado. Recibe el texto y el tipo. */
function etiqueta(texto, tipo) {
    return crear("span", texto, "etq" + (tipo ? " etq-" + tipo : ""));
}

/* Datos: crea un botón listo para usar. Recibe el texto, la clase y la función al dar clic. */
function crearBoton(texto, clase, alClic) {
    const b = crear("button", texto, clase);
    b.type = "button";
    b.addEventListener("click", alClic);
    return b;
}

/* Datos: conecta los botones de filtro. Recibe el contenedor y la función que aplica el filtro. */
function iniciarFiltros(contenedor, alElegir) {
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
