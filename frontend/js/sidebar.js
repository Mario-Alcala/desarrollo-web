/*
 * ARCHIVO: js/sidebar.js
 * CAPA: FRONTEND (JavaScript). ¿ES CASCARÓN? NO ESTRICTAMENTE: dibuja con JS el menú lateral y
 *   la barra superior para no repetir el HTML en cada pantalla. Si el cascarón debe ser solo
 *   HTML y CSS, ese menú y esa barra deben escribirse como HTML estático en cada página.
 * BACKEND: no lo usa.
 * LE FALTA: páginas destino para Resumen y Cultivos (sus enlaces son "#");
 *   sesión y roles reales (el rol "Administrador / Agricultor" está escrito fijo);
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
    { id: "terrenos",    texto: "Terrenos y cultivos", href: "terrenos.html" },
    { id: "catalogo",    texto: "Catálogo",    href: "catalogo-admin.html" },
    { id: "proveedores", texto: "Proveedores", href: "proveedores.html" },
    { id: "bodega",      texto: "Bodega",      href: "bodega.html" },
    { id: "inventario",  texto: "Inventario",  href: "inventario.html" },
    { id: "pedidos",     texto: "Pedidos",     href: "pedidos.html" }
];

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
    seccion.textContent = "ADMINISTRACIÓN";

    const nav = document.createElement("nav");
    nav.className = "sidebar-menu";
    nav.setAttribute("aria-label", "Navegación del administrador");
    MENU_ADMIN.forEach(op => {
        const a = document.createElement("a");
        a.href = op.href;
        a.textContent = op.texto;
        if (op.id === activo) a.setAttribute("aria-current", "page");
        nav.append(a);
    });

    const usuario = document.createElement("div");
    usuario.className = "sidebar-usuario";
    usuario.textContent = "Administrador / Agricultor";

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
            if (e.key === "Enter" && !location.pathname.endsWith("terrenos.html")) {
                location.href = "terrenos.html?q=" + encodeURIComponent(buscador.value.trim());
            }
        });
    }

    const rol = document.createElement("span");
    rol.className = "topbar-rol";
    rol.textContent = "Administrador / Agricultor";

    barra.replaceChildren(buscador, rol);
})();
