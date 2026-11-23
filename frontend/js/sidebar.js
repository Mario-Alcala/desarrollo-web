/*
 * ARCHIVO: js/sidebar.js
 * CAPA: FRONTEND (JavaScript). ¿ES CASCARÓN? NO ESTRICTAMENTE: dibuja con JS el menú lateral y
 *   la barra superior para no repetir el HTML en cada pantalla. Si el cascarón debe ser solo
 *   HTML y CSS, ese menú y esa barra deben escribirse como HTML estático en cada página.
 * BACKEND: no lo usa.
 * LE FALTA: páginas destino para Resumen y Cultivos (sus enlaces son "#");
 *   sesión y roles reales (el rol se lee de sessionStorage "usuarioSesion"; js/ap.js todavía no la guarda,
 *   y sin sesión se muestra el menú del administrador);
 *   la opción Usuarios del documento del proyecto.
 * AÑADIDO POR BACKEND INCOMPLETO: nada.
 *
 * BARRA SUPERIOR: <header id="topbar" data-placeholder="..." data-local="true">
 *   - data-placeholder: texto del buscador.
 *   - data-local="true": el buscador lo usa la propia página (no redirige a Terrenos).
 *   El script de cada página escucha el evento "input" de "#topbar input".
 */

// Menú del administrador. Para agregar una opción, añade una línea aquí.
const MENU_ADMIN = [
    { id: "resumen",     texto: "Resumen",     href: "#" },
    { id: "terrenos",    texto: "Terrenos y cultivos", href: "terrenos-admin.html" },
    { id: "catalogo",    texto: "Catálogo",    href: "catalogo-admin.html" },
    { id: "proveedores", texto: "Proveedores", href: "proveedores.html" },
    { id: "bodega",      texto: "Bodega",      href: "bodega.html" },
    { id: "inventario",  texto: "Inventario",  href: "inventario-admin.html" },
    { id: "usuarios",    texto: "Usuarios",    href: "usuarios-admin.html" },
    { id: "pedidos",     texto: "Pedidos",     href: "pedidos.html" }
];

// Menú del trabajador: sus pantallas, más Pedidos (que reutiliza las pantallas del administrador).
const MENU_TRABAJADOR = [
    { id: "cultivos",      texto: "Cultivos activos", href: "cultivos.html" },
    { id: "inventario",    texto: "Inventario",       href: "inventario.html" },
    { id: "observaciones", texto: "Observaciones",    href: "observaciones.html" },
    { id: "riegos",        texto: "Riego",            href: "riegos.html" },
    { id: "fertilizantes", texto: "Fertilizantes",    href: "fertilizantes.html" },
    { id: "abonos",        texto: "Abono",            href: "abonos.html" },
    { id: "terrenos",      texto: "Terreno",          href: "terrenos.html" },
    { id: "calendario",    texto: "Calendario",       href: "calendario.html" },
    { id: "pedidos",       texto: "Pedidos",          href: "pedidos.html" }
];

// Rol guardado en la sesión (misma clave que js/sesion.js); null si no hay sesión.
function rolDeSidebar() {
    try {
        const usuario = JSON.parse(sessionStorage.getItem("usuarioSesion"));
        return usuario && typeof usuario.rol === "string" ? usuario.rol : null;
    } catch {
        return null;
    }
}
const SIDEBAR_ES_TRABAJADOR = rolDeSidebar() === "trabajador";
const SIDEBAR_ROL_TEXTO = SIDEBAR_ES_TRABAJADOR ? "Trabajador" : "Administrador / Agricultor";

(function dibujarSidebar() {
    const aside = document.getElementById("sidebar");
    if (!aside) return;
    const activo = aside.dataset.activo;

    const marca = document.createElement("div");
    marca.className = "sidebar-marca";
    const logo = document.createElement("div");
    logo.className = "sidebar-logo";
    logo.textContent = "GC";
    const nombre = document.createElement("span");
    nombre.className = "sidebar-nombre";
    nombre.textContent = "Gestión de Cultivos";
    marca.append(logo, nombre);

    const seccion = document.createElement("div");
    seccion.className = "sidebar-seccion";
    seccion.textContent = SIDEBAR_ES_TRABAJADOR ? "TRABAJADOR" : "ADMINISTRACIÓN";

    const nav = document.createElement("nav");
    nav.className = "sidebar-menu";
    nav.setAttribute("aria-label", SIDEBAR_ES_TRABAJADOR ? "Navegación del trabajador" : "Navegación del administrador");
    (SIDEBAR_ES_TRABAJADOR ? MENU_TRABAJADOR : MENU_ADMIN).forEach(op => {
        const a = document.createElement("a");
        a.href = op.href;
        a.textContent = op.texto;
        if (op.id === activo) a.setAttribute("aria-current", "page");
        nav.append(a);
    });

    const usuario = document.createElement("div");
    usuario.className = "sidebar-usuario";
    usuario.textContent = SIDEBAR_ROL_TEXTO;

    aside.replaceChildren(marca, seccion, nav, usuario);
})();

(function dibujarTopbar() {
    const barra = document.getElementById("topbar");
    if (!barra) return;

    const buscador = document.createElement("input");
    buscador.type = "search";
    buscador.id = "buscar-terreno"; // se conserva el id para js/terrenos.js
    buscador.placeholder = barra.dataset.placeholder || "Buscar terreno o cultivo";
    buscador.setAttribute("aria-label", buscador.placeholder);

    // En las pantallas sin buscador propio, Enter lleva a Terrenos con la búsqueda aplicada.
    if (barra.dataset.local !== "true") {
        buscador.addEventListener("keydown", e => {
            if (e.key === "Enter" && !location.pathname.endsWith("terrenos-admin.html")) {
                location.href = "terrenos-admin.html?q=" + encodeURIComponent(buscador.value.trim());
            }
        });
    }

    const rol = document.createElement("span");
    rol.className = "topbar-rol";
    rol.textContent = SIDEBAR_ROL_TEXTO;

    barra.replaceChildren(buscador, rol);
})();