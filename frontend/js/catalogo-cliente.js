const API_CATALOGO_CLIENTE = 'http://localhost:8081/api';
const productosCatalogoCliente = document.getElementById('productos');
const detalleCatalogoCliente = document.getElementById('detalle-pedido');
const mensajeCatalogoCliente = document.getElementById('mensaje-catalogo');
const cantidadesCatalogoCliente = {};
let lotesCatalogoCliente = [];

function crearNodo(tag, texto, clase) {
    const nodo = document.createElement(tag);
    if (texto !== undefined) nodo.textContent = texto;
    if (clase) nodo.className = clase;
    return nodo;
}

function dineroCliente(valor) {
    return '$' + Number(valor || 0).toFixed(2);
}

function agruparProductos(lotes) {
    const grupos = {};
    lotes.forEach(function (lote) {
        const llave = String(lote.idVariedad);
        if (!grupos[llave]) grupos[llave] = { idVariedad:lote.idVariedad, familia:lote.familia, variedad:lote.variedad, descripcion:lote.descripcion, imagenUrl:lote.imagenUrl, precioPorKg:Number(lote.precioPorKg), lotes:[] };
        if (lote.idCosecha !== null && lote.idCosecha !== undefined) {
            grupos[llave].lotes.push(lote);
        }
    });
    return Object.values(grupos);
}

function mostrarResumenCliente() {
    detalleCatalogoCliente.replaceChildren();
    let total = 0;
    lotesCatalogoCliente.forEach(function (lote) {
        const kilos = Number(cantidadesCatalogoCliente[lote.idCosecha] || 0);
        if (!kilos) return;
        const subtotal = Number(lote.precioPorKg) * kilos;
        total += subtotal;
        const fila = document.createElement('tr');
        fila.append(crearNodo('td', lote.familia + ' ' + lote.variedad + ' · ' + lote.maduracion + ' · Lote #' + lote.idCosecha),
            crearNodo('td', kilos.toFixed(2) + ' kg'), crearNodo('td', dineroCliente(subtotal)));
        detalleCatalogoCliente.appendChild(fila);
    });
    if (!detalleCatalogoCliente.children.length) {
        const fila = document.createElement('tr');
        const celda = crearNodo('td', 'Todavía no seleccionas productos.');
        celda.colSpan = 3; fila.appendChild(celda); detalleCatalogoCliente.appendChild(fila);
    }
    document.getElementById('total').textContent = dineroCliente(total);
    document.getElementById('finalizar').disabled = total <= 0;
}

function dibujarCatalogoCliente() {
    const texto = document.getElementById('buscar-producto-cliente').value.trim().toLowerCase();
    const maduracion = document.getElementById('filtro-maduracion-cliente').value;
    productosCatalogoCliente.replaceChildren();
    const productos = agruparProductos(lotesCatalogoCliente).filter(function (producto) {
        const coincide = (producto.familia + ' ' + producto.variedad + ' ' + (producto.descripcion || '')).toLowerCase().includes(texto);
        producto.lotes = producto.lotes.filter(function (lote) { return !maduracion || lote.maduracion === maduracion; });
        return coincide && (!maduracion || producto.lotes.length > 0);
    });
    productos.forEach(function (producto) {
        const tarjeta = crearNodo('article', undefined, 'producto');
        const titulo = crearNodo('h2', producto.familia + ' ' + producto.variedad);
        if (producto.imagenUrl) {
            const imagen = document.createElement('img');
            imagen.className = 'producto-imagen';
            imagen.src = producto.imagenUrl;
            imagen.alt = producto.familia + ' ' + producto.variedad;
            imagen.loading = 'lazy';
            imagen.addEventListener('error', function () { imagen.replaceWith(crearNodo('div', 'Imagen no disponible', 'producto-imagen sin-imagen')); });
            tarjeta.appendChild(imagen);
        } else {
            tarjeta.appendChild(crearNodo('div', 'Sin imagen', 'producto-imagen sin-imagen'));
        }
        tarjeta.appendChild(titulo);
        if (producto.descripcion) tarjeta.appendChild(crearNodo('p', producto.descripcion));
        tarjeta.appendChild(crearNodo('p', dineroCliente(producto.precioPorKg) + ' / kg'));
        if (producto.lotes.length === 0) {
            tarjeta.appendChild(crearNodo('p', 'Sin cosecha disponible por el momento.'));
        }
        producto.lotes.forEach(function (lote) {
            const filaLote = crearNodo('div', undefined, 'panel espacio');
            filaLote.appendChild(crearNodo('strong', 'Lote #' + lote.idCosecha + ' · ' + (lote.maduracion || 'Sin clasificar')));
            filaLote.appendChild(crearNodo('p', 'Disponible: ' + Number(lote.kilos).toLocaleString('es-MX') + ' kg'));
            const etiqueta = crearNodo('label', 'Kilos');
            const campo = document.createElement('input');
            campo.type = 'number'; campo.min = '0'; campo.max = String(lote.kilos); campo.step = '0.01';
            campo.value = cantidadesCatalogoCliente[lote.idCosecha] || '';
            campo.setAttribute('aria-label', 'Kilos del lote ' + lote.idCosecha);
            campo.addEventListener('input', function () {
                let valor = Number(campo.value);
                if (!campo.value || valor <= 0) delete cantidadesCatalogoCliente[lote.idCosecha];
                else {
                    valor = Math.min(valor, Number(lote.kilos));
                    cantidadesCatalogoCliente[lote.idCosecha] = Math.round(valor * 100) / 100;
                    campo.value = cantidadesCatalogoCliente[lote.idCosecha];
                }
                mostrarResumenCliente();
            });
            etiqueta.appendChild(campo);
            filaLote.appendChild(etiqueta);
            tarjeta.appendChild(filaLote);
        });
        productosCatalogoCliente.appendChild(tarjeta);
    });
    mensajeCatalogoCliente.textContent = productos.length ? '' : 'No hay lotes disponibles que coincidan con la búsqueda.';
    mostrarResumenCliente();
}

async function cargarCatalogoCliente() {
    mensajeCatalogoCliente.textContent = 'Cargando productos disponibles…';
    try {
        const respuesta = await fetch(API_CATALOGO_CLIENTE + '/catalogo');
        if (!respuesta.ok) throw new Error('No se pudo cargar el catálogo desde el API.');
        lotesCatalogoCliente = await respuesta.json();
        dibujarCatalogoCliente();
    } catch (error) { mensajeCatalogoCliente.textContent = error.message; }
}

document.getElementById('buscar-producto-cliente').addEventListener('input', dibujarCatalogoCliente);
document.getElementById('filtro-maduracion-cliente').addEventListener('change', dibujarCatalogoCliente);
document.getElementById('finalizar').addEventListener('click', function () {
    const usuarioId = sessionStorage.getItem('usuarioId');
    const rol = sessionStorage.getItem('usuarioRol');
    if (!usuarioId || rol !== 'cliente') { mensajeCatalogoCliente.textContent = 'Inicia sesión con una cuenta de cliente para continuar.'; return; }
    const detalles = Object.keys(cantidadesCatalogoCliente).map(function (id) { return { idCosecha:Number(id), kilos:Number(cantidadesCatalogoCliente[id]) }; });
    sessionStorage.setItem('pedidoGestionCultivos', JSON.stringify(detalles));
    window.location.href = 'pago.html';
});
cargarCatalogoCliente();
