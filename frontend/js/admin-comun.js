/*
 * ARCHIVO: js/admin-comun.js
 * CAPA: FRONTEND (JavaScript de apoyo). ¿ES CASCARÓN? NO: son funciones auxiliares (no diseño).
 * QUÉ HACE: utilidades que comparten Catálogo, Proveedores, Bodega y Pedidos: crear elementos,
 *   dar formato a dinero y kilos, etiquetas de estado y filtros.
 * BACKEND: no lo usa.
 * LE FALTA: nada por ahora; si el equipo prefiere un framework, esto se reemplaza.
 * AÑADIDO POR BACKEND INCOMPLETO: nada.
 */

function crear(etiqueta, texto, clase) {
    const el = document.createElement(etiqueta);
    if (texto !== undefined && texto !== null) el.textContent = texto;
    if (clase) el.className = clase;
    return el;
}

function capitalizar(texto) {
    const t = String(texto || "");
    return t.charAt(0).toUpperCase() + t.slice(1);
}

function fmtMoneda(n) {
    return Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function fmtNum(n) {
    return Number(n).toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

function nombreProducto(p) {
    return capitalizar(p.familia) + " " + p.variedad;
}

// Etiqueta de color. tipo: "ok", "aviso", "error" o vacío (neutra).
function etiqueta(texto, tipo) {
    return crear("span", texto, "etq" + (tipo ? " etq-" + tipo : ""));
}

function crearBoton(texto, clase, alClic) {
    const b = crear("button", texto, clase);
    b.type = "button";
    b.addEventListener("click", alClic);
    return b;
}

// Botones de filtro (chips). Llama alElegir(valor) al cambiar.
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

const MENSAJE_SESION = "Guardado solo en esta sesión: al recargar la página vuelven los datos de ejemplo.";
