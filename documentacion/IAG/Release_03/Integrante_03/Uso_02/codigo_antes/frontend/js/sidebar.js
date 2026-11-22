/*
 * LE FALTA: páginas destino para Resumen, Cultivos, Bodega y Pedidos (sus enlaces son "#");
 *   sesión y roles reales (el rol "Administrador / Agricultor" está escrito fijo);
 *   el buscador solo filtra terrenos
 */
const MENU_ADMIN = [
    { id: "resumen",  texto: "Resumen",  href: "#" },
    { id: "terrenos", texto: "Terrenos", href: "terrenos.html" },
    { id: "cultivos", texto: "Cultivos", href: "#" },
    { id: "catalogo", texto: "Catálogo", href: "gestor.html" },
    { id: "bodega",   texto: "Bodega",   href: "#" },
    { id: "pedidos",  texto: "Pedidos",  href: "#" }
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
    buscador.id = "buscar-terreno";
    buscador.placeholder = "Buscar terreno o cultivo";
    buscador.setAttribute("aria-label", "Buscar terreno o cultivo");

    // Fuera de la lista de terrenos, Enter lleva a la lista con la búsqueda aplicada.
    buscador.addEventListener("keydown", e => {
        if (e.key === "Enter" && !location.pathname.endsWith("terrenos.html")) {
            location.href = "terrenos.html?q=" + encodeURIComponent(buscador.value.trim());
        }
    });

    const rol = document.createElement("span");
    rol.className = "topbar-rol";
    rol.textContent = "Administrador / Agricultor";

    barra.replaceChildren(buscador, rol);
})();
