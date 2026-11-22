/*
 * ARCHIVO: js/catalogo-admin.js
 * CAPA: FRONTEND (lógica). ¿ES CASCARÓN? NO: filtra, calcula existencias y maneja el formulario.
 *   Si el cascarón es solo HTML/CSS, este archivo le corresponde a quien haga la lógica.
 * QUÉ USA DEL BACKEND: nada todavía; lee PRODUCTOS y COSECHAS de js/admin-datos.js.
 * REGLA DEL DOCUMENTO: los kilos disponibles y la maduración NO se guardan en el catálogo;
 *   aquí se calculan sumando los lotes (cosechas) de cada producto.
 * LE FALTA: POST y PUT contra la API de productos; imagen como archivo; confirmar antes de desactivar.
 * AÑADIDO POR BACKEND INCOMPLETO: los cambios viven solo en memoria (se pierden al recargar).
 */

const lista = document.getElementById("lista-productos");
const mensaje = document.getElementById("mensaje-catalogo");
const buscador = document.querySelector("#topbar input");
const dialogo = document.getElementById("dialogo-producto");
const formulario = document.getElementById("formulario-producto");
const mensajeFormulario = document.getElementById("mensaje-formulario");

let categoriaActiva = "todos";
let editandoId = null;

function kilosDisponibles(idProducto) {
    return COSECHAS
        .filter(c => c.idProducto === idProducto)
        .reduce((suma, c) => suma + c.kgDisponibles, 0);
}

function maduracionesDisponibles(idProducto) {
    const lotes = COSECHAS.filter(c => c.idProducto === idProducto && c.kgDisponibles > 0);
    return [...new Set(lotes.map(c => c.maduracion))];
}

function tarjetaProducto(p) {
    const tarjeta = crear("article", undefined, "tarjeta-producto" + (p.activo ? "" : " inactivo"));

    const imagen = crear("div", undefined, "imagen-producto " + p.categoria);
    if (/^https?:\/\//i.test(p.imagen || "")) {
        imagen.style.backgroundImage = `url("${encodeURI(p.imagen)}")`;
    } else {
        imagen.textContent = "Sin imagen";
    }

    const cuerpo = crear("div", undefined, "cuerpo-producto");

    const titulo = crear("div", undefined, "fila-titulo");
    titulo.append(crear("h3", nombreProducto(p)), etiqueta(capitalizar(p.categoria)));

    const kg = kilosDisponibles(p.id);
    const madurez = crear("div", undefined, "etiquetas");
    maduracionesDisponibles(p.id).forEach(m => madurez.append(etiqueta(capitalizar(m), m === "maduro" ? "ok" : "aviso")));

    const pie = crear("div", undefined, "pie-producto");
    pie.append(
        p.activo ? etiqueta("Activo", "ok") : etiqueta("Inactivo"),
        crearBoton("Editar", "boton boton-secundario boton-chico", () => abrirFormulario(p))
    );

    cuerpo.append(
        titulo,
        crear("p", p.descripcion || "Sin descripción.", "descripcion-producto"),
        crear("p", fmtMoneda(p.precioPorKg) + " / kg", "precio-producto"),
        crear("p", kg > 0 ? `Disponible: ${fmtNum(kg)} kg` : "Sin existencias", "existencias"),
        madurez,
        pie
    );

    tarjeta.append(imagen, cuerpo);
    return tarjeta;
}

function dibujar() {
    const q = buscador.value.trim().toLowerCase();
    const visibles = PRODUCTOS.filter(p =>
        (categoriaActiva === "todos" || p.categoria === categoriaActiva) &&
        (!q || [p.familia, p.variedad, p.descripcion].some(t => String(t).toLowerCase().includes(q)))
    );
    lista.replaceChildren(...visibles.map(tarjetaProducto));
    if (!visibles.length) mensaje.textContent = "No hay variedades para mostrar.";
    else if (mensaje.textContent === "No hay variedades para mostrar.") mensaje.textContent = "";
}

function valor(id) {
    return document.getElementById(id).value.trim();
}

function abrirFormulario(producto) {
    editandoId = producto ? producto.id : null;
    document.getElementById("titulo-dialogo").textContent = producto ? "Editar variedad" : "Agregar variedad";
    mensajeFormulario.textContent = "";
    formulario.reset();
    if (producto) {
        document.getElementById("p-categoria").value = producto.categoria;
        document.getElementById("p-familia").value = producto.familia;
        document.getElementById("p-variedad").value = producto.variedad;
        document.getElementById("p-descripcion").value = producto.descripcion;
        document.getElementById("p-imagen").value = producto.imagen;
        document.getElementById("p-precio").value = producto.precioPorKg;
        document.getElementById("p-activo").checked = producto.activo;
    }
    dialogo.showModal();
}

formulario.addEventListener("submit", evento => {
    evento.preventDefault();
    mensajeFormulario.textContent = "";

    const datos = {
        categoria: valor("p-categoria"),
        familia: valor("p-familia").toLowerCase(),
        variedad: valor("p-variedad").toLowerCase(),
        descripcion: valor("p-descripcion"),
        imagen: valor("p-imagen"),
        precioPorKg: Number(valor("p-precio")),
        activo: document.getElementById("p-activo").checked
    };

    if (!(datos.precioPorKg > 0)) {
        mensajeFormulario.textContent = "El precio por kilo debe ser mayor que cero.";
        return;
    }
    if (datos.imagen && !/^https?:\/\//i.test(datos.imagen)) {
        mensajeFormulario.textContent = "La imagen debe ser una dirección web que empiece con http:// o https://.";
        return;
    }

    if (editandoId === null) {
        datos.id = Math.max(0, ...PRODUCTOS.map(p => p.id)) + 1;
        PRODUCTOS.push(datos);
    } else {
        Object.assign(PRODUCTOS.find(p => p.id === editandoId), datos);
    }

    dialogo.close();
    mensaje.textContent = MENSAJE_SESION;
    dibujar();
});

document.getElementById("agregar-producto").addEventListener("click", () => abrirFormulario(null));
document.getElementById("cancelar-producto").addEventListener("click", () => dialogo.close());
iniciarFiltros(document.getElementById("filtros-categoria"), valorFiltro => {
    categoriaActiva = valorFiltro;
    dibujar();
});
buscador.addEventListener("input", dibujar);

dibujar();
