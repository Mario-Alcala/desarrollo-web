// Solo se conserva el borrador. Productos, precios e historial vienen de la API.
var claveBorrador = 'gestion-cultivos-pedido-api';

function leerBorrador() {
    var guardado = sessionStorage.getItem(claveBorrador);
    return guardado ? JSON.parse(guardado) : {
        cantidades: {}, fechaRecoleccion: '', tipoEntrega: 'recoleccion', direccion: '', metodoPago: 'transferencia'
    };
}

function guardarBorrador(borrador) {
    sessionStorage.setItem(claveBorrador, JSON.stringify(borrador));
}

function dinero(valor) {
    return Number(valor).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

function agregarCelda(fila, texto) {
    var celda = document.createElement('td');
    celda.textContent = texto;
    fila.appendChild(celda);
    return celda;
}

function subtotalCentavos(precio, kilos) {
    // El servidor usa DECIMAL; aquí se redondea cada renglón a centavos.
    return Math.round(Math.round(Number(precio) * 100) * Math.round(Number(kilos) * 100) / 100);
}

function fechaLocal(fecha) {
    return fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
}

function limiteRecoleccion() {
    var limite = new Date();
    limite.setDate(limite.getDate() + 13);
    return fechaLocal(limite);
}

function fechaPermitida(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) { return false; }
    var partes = fecha.split('-');
    var valor = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    return fechaLocal(valor) === fecha && fecha >= fechaLocal(new Date()) && fecha <= limiteRecoleccion();
}

function mensajeCliente(error) {
    if (error.estado === 401) { return 'Inicia sesión como cliente para continuar.'; }
    return error instanceof TypeError ? 'No se pudo consultar la información. Intenta nuevamente.' : error.message;
}

function consultarSeleccion() {
    return pedirApi('/catalogo').then(function (lotes) {
        var cantidades = leerBorrador().cantidades;
        var seleccion = [];
        Object.keys(cantidades).forEach(function (id) {
            var lote = lotes.find(function (actual) { return String(actual.idCosecha) === id; });
            var kilos = Number(cantidades[id]);
            if (!lote || !Number.isFinite(kilos) || kilos <= 0 || kilos > Number(lote.kilos)
                    || Math.abs(kilos * 100 - Math.round(kilos * 100)) > 0.000001) {
                throw new Error('El lote o sus existencias cambiaron. Revisa las cantidades en el catálogo.');
            }
            seleccion.push({ idCosecha: lote.idCosecha, nombre: lote.nombre, kilos: kilos, precioKilo: Number(lote.precioKilo) });
        });
        if (!seleccion.length) { throw new Error('Selecciona productos en el catálogo.'); }
        return seleccion;
    });
}
