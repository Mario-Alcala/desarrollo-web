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
    { id: "resumen",     texto: "Resumen",     href: "resumen.html" },
    { id: "terrenos",    texto: "Terrenos y cultivos", href: "terrenos-admin.html" },
    { id: "catalogo",    texto: "Catálogo",    href: "catalogo-admin.html" },
    { id: "proveedores", texto: "Proveedores", href: "proveedores.html" },
    { id: "bodega",      texto: "Bodega",      href: "bodega.html" },
    { id: "inventario",  texto: "Inventario",  href: "inventario-admin.html" },
    { id: "pedidos",     texto: "Pedidos",     href: "pedidos.html" },
    { id: "usuarios",    texto: "Usuarios",    href: "usuarios.html" }
];

// El empleado reutiliza las pantallas de pedidos del administrador, con su menú de trabajo.
const MENU_EMPLEADO = [
    { id: "cultivos", texto: "Cultivos y cosecha", href: "../empleado/cultivos.html" },
    { id: "terrenos", texto: "Terrenos", href: "../empleado/terrenos.html" },
    { id: "inventario", texto: "Inventario", href: "../empleado/inventario.html" },
    { id: "bitacora", texto: "Bitácora", href: "../empleado/observaciones.html" },
    { id: "riegos", texto: "Riegos", href: "../empleado/riegos.html" },
    { id: "abonos", texto: "Abono", href: "../empleado/abonos.html" },
    { id: "fertilizantes", texto: "Fertilizantes", href: "../empleado/fertilizantes.html" },
    { id: "pedidos", texto: "Preparar pedidos", href: "pedidos.html" }
];

function dibujarSidebar() {
    const aside = document.getElementById("sidebar");
    if (!aside) return;
    const activo = aside.dataset.activo;
    const rol = sessionStorage.getItem("usuarioRol") || "administrador_agricultor";
    const esEmpleado = rol === "trabajador";
    const menu = esEmpleado ? MENU_EMPLEADO : MENU_ADMIN;

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
    seccion.textContent = esEmpleado ? "TRABAJO DE CAMPO" : "ADMINISTRACIÓN";

    const nav = document.createElement("nav");
    nav.className = "sidebar-menu";
    nav.setAttribute("aria-label", esEmpleado ? "Navegación del empleado" : "Navegación del administrador");
    for (let i = 0; i < menu.length; i++) {
        const op = menu[i];
        const a = document.createElement("a");
        a.href = op.href;
        a.textContent = op.texto;
        if (op.id === activo) a.setAttribute("aria-current", "page");
        nav.append(a);
    }

    const usuario = document.createElement("div");
    usuario.className = "sidebar-usuario";
    usuario.textContent = sessionStorage.getItem("usuarioNombre") || (esEmpleado ? "Empleado" : "Administrador / Agricultor");

    aside.replaceChildren(marca, seccion, nav, usuario);
}

function dibujarTopbar() {
    const barra = document.getElementById("topbar");
    if (!barra) return;

    if (barra.dataset.sinBuscador !== "true") {
        const buscador = document.createElement("input");
        buscador.type = "search";
        buscador.id = "buscar-terreno"; // se conserva el id para js/terrenos.js
        buscador.placeholder = barra.dataset.placeholder || "Buscar terreno o cultivo";
        buscador.setAttribute("aria-label", buscador.placeholder);

        // En las pantallas sin buscador propio, Enter lleva a Terrenos con la búsqueda aplicada.
        if (barra.dataset.local !== "true") {
            buscador.addEventListener("keydown", function (evento) {
                if (evento.key === "Enter" && !location.pathname.endsWith("terrenos-admin.html")) {
                    location.href = "terrenos-admin.html?q=" + encodeURIComponent(buscador.value.trim());
                }
            });
        }
        barra.append(buscador);
    }

    const rol = document.createElement("span");
    rol.className = "topbar-rol";
    const tipoUsuario = sessionStorage.getItem("usuarioRol") === "trabajador" ? "Empleado" : "Administrador / Agricultor";
    const nombreUsuario = sessionStorage.getItem("usuarioNombre");
    rol.textContent = nombreUsuario ? `${nombreUsuario} · ${tipoUsuario}` : tipoUsuario;
    barra.append(rol);
}

dibujarSidebar();
dibujarTopbar();
