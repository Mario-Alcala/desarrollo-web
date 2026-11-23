const API_PAGO_CLIENTE = 'http://localhost:8081/api';
const cuerpoResumenPago = document.getElementById('resumen-pago');
const mensajePagoCliente = document.getElementById('mensaje-pago');
const formularioPagoCliente = document.getElementById('formulario-pago');
let detallesPagoCliente = [];
let catalogoPagoCliente = [];

function formatoDineroPago(valor) { return '$' + Number(valor || 0).toFixed(2); }
function fechaLocalPago(fecha) {
    const ajuste = fecha.getTimezoneOffset() * 60000;
    return new Date(fecha - ajuste).toISOString().slice(0, 10);
}

function mostrarEntregaPago() {
    const tipo = document.querySelector('input[name="tipo-entrega"]:checked').value;
    const domicilio = tipo === 'domicilio';
    document.getElementById('datos-domicilio').hidden = !domicilio;
    document.getElementById('datos-recoleccion').hidden = domicilio;
    document.getElementById('direccion-entrega').required = domicilio;
    document.getElementById('fecha-recoleccion').required = !domicilio;
}

function mostrarMetodoPago() {
    const transferencia = document.getElementById('metodo-pago').value === 'transferencia';
    document.getElementById('datos-transferencia').hidden = !transferencia;
    document.getElementById('datos-tarjeta').hidden = transferencia;
}

async function cargarResumenPago() {
    const borrador = sessionStorage.getItem('pedidoGestionCultivos');
    if (!borrador) throw new Error('No hay productos seleccionados. Regresa al catálogo.');
    detallesPagoCliente = JSON.parse(borrador);
    if (!Array.isArray(detallesPagoCliente) || detallesPagoCliente.length === 0) throw new Error('No hay productos seleccionados. Regresa al catálogo.');
    const respuesta = await fetch(API_PAGO_CLIENTE + '/catalogo');
    if (!respuesta.ok) throw new Error('No se pudo actualizar la disponibilidad del catálogo.');
    catalogoPagoCliente = await respuesta.json();
    cuerpoResumenPago.replaceChildren();
    let total = 0;
    detallesPagoCliente.forEach(function (detalle) {
        const lote = catalogoPagoCliente.find(function (item) { return Number(item.idCosecha) === Number(detalle.idCosecha); });
        if (!lote || Number(detalle.kilos) > Number(lote.kilos)) throw new Error('La existencia de uno de los lotes cambió. Vuelve al catálogo y revisa los kilos.');
        const subtotal = Number(lote.precioPorKg) * Number(detalle.kilos);
        total += subtotal;
        const fila = document.createElement('tr');
        const columnas = [lote.familia + ' ' + lote.variedad + ' · ' + lote.maduracion, Number(detalle.kilos).toFixed(2) + ' kg', formatoDineroPago(subtotal)];
        columnas.forEach(function (texto) { const td = document.createElement('td'); td.textContent = texto; fila.appendChild(td); });
        cuerpoResumenPago.appendChild(fila);
    });
    document.getElementById('total-pago').textContent = formatoDineroPago(total);
}

document.querySelectorAll('input[name="tipo-entrega"]').forEach(function (radio) { radio.addEventListener('change', mostrarEntregaPago); });
document.getElementById('metodo-pago').addEventListener('change', mostrarMetodoPago);

formularioPagoCliente.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    const usuarioId = sessionStorage.getItem('usuarioId');
    if (!usuarioId || sessionStorage.getItem('usuarioRol') !== 'cliente') {
        mensajePagoCliente.textContent = 'Inicia sesión con una cuenta de cliente para crear el pedido.';
        return;
    }
    if (!formularioPagoCliente.reportValidity()) return;
    const tipoEntrega = document.querySelector('input[name="tipo-entrega"]:checked').value;
    const solicitud = {
        idUsuario:Number(usuarioId),
        metodoPago:document.getElementById('metodo-pago').value,
        tipoEntrega:tipoEntrega,
        detalles:detallesPagoCliente
    };
    if (tipoEntrega === 'domicilio') solicitud.direccion = document.getElementById('direccion-entrega').value.trim();
    else solicitud.fechaRecoleccion = document.getElementById('fecha-recoleccion').value;

    const boton = document.getElementById('confirmar-pago');
    boton.disabled = true;
    mensajePagoCliente.textContent = 'Registrando pedido…';
    try {
        const respuesta = await fetch(API_PAGO_CLIENTE + '/pedidos', {
            method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(solicitud)
        });
        const resultado = await respuesta.json().catch(function () { return {}; });
        if (!respuesta.ok) throw new Error(resultado.mensaje || resultado.message || 'No se pudo registrar el pedido.');
        sessionStorage.removeItem('pedidoGestionCultivos');
        formularioPagoCliente.hidden = true;
        document.getElementById('contenido-pago').hidden = true;
        document.getElementById('confirmacion-pedido').hidden = false;
        document.getElementById('numero-pedido').textContent = 'Número de pedido: #' + resultado.idPedido;
        document.getElementById('detalle-confirmacion').textContent = 'Total: ' + formatoDineroPago(resultado.total) + ' · Estado: pendiente · ' + (tipoEntrega === 'domicilio' ? 'Envío a domicilio' : 'Recolección el ' + solicitud.fechaRecoleccion + ', de 6:00 a. m. a 6:00 p. m.');
        mensajePagoCliente.textContent = 'El pedido se guardó correctamente.';
    } catch (error) { mensajePagoCliente.textContent = error.message; boton.disabled = false; }
});

const hoy = new Date();
const campoFechaRecogida = document.getElementById('fecha-recoleccion');
campoFechaRecogida.min = fechaLocalPago(hoy);
const maximo = new Date(hoy); maximo.setDate(maximo.getDate() + 7);
campoFechaRecogida.max = fechaLocalPago(maximo);
mostrarEntregaPago(); mostrarMetodoPago();
cargarResumenPago().catch(function (error) { mensajePagoCliente.textContent = error.message; document.getElementById('confirmar-pago').disabled = true; });
