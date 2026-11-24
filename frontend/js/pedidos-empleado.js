var formularioPedidoEmpleado = document.getElementById('formulario-pedido-empleado');
var selectorClienteEmpleado = document.getElementById('cliente-pedido-empleado');
var selectorEntregaEmpleado = document.getElementById('tipo-entrega-pedido-empleado');
var cajaDetallesEmpleado = document.getElementById('detalles-pedido-empleado');
var mensajePedidoEmpleado = document.getElementById('mensaje-pedido-empleado');
var errorPedidoEmpleado = document.getElementById('error-pedido-empleado');
var lotesPedidoEmpleado = [];

function fechaLocalPedidoEmpleado(fecha) {
    return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function mensajePedido(texto, tipo) {
    mensajePedidoEmpleado.textContent = texto;
    mensajePedidoEmpleado.className = 'mensaje' + (tipo ? ' ' + tipo : '');
}

function lotesDisponiblesPedido() {
    return lotesPedidoEmpleado.filter(function (lote) {
        return Number(lote.kilos) > 0 && Number(lote.precioPorKg) > 0;
    });
}

function actualizarTotalPedido() {
    var total = 0;
    cajaDetallesEmpleado.querySelectorAll('.detalle-pedido-empleado').forEach(function (fila) {
        var selector = fila.querySelector('select');
        var cantidad = fila.querySelector('input');
        var lote = lotesDisponiblesPedido().find(function (item) {
            return String(item.idCosecha) === selector.value;
        });
        if (lote && Number(cantidad.value) > 0) {
            total += Number(lote.precioPorKg) * Number(cantidad.value);
        }
    });
    document.getElementById('total-pedido-empleado').textContent = '$' + total.toFixed(2);
}

function agregarDetallePedido() {
    var fila = document.createElement('div');
    fila.className = 'campos-operacion detalle-pedido-empleado espacio';

    var bloqueLote = document.createElement('div');
    var etiquetaLote = document.createElement('label');
    etiquetaLote.textContent = 'Producto y lote';
    var selectorLote = document.createElement('select');
    selectorLote.required = true;
    var opcionInicial = document.createElement('option');
    opcionInicial.value = '';
    opcionInicial.textContent = 'Selecciona un lote disponible';
    selectorLote.appendChild(opcionInicial);
    lotesDisponiblesPedido().forEach(function (lote) {
        var opcion = document.createElement('option');
        opcion.value = lote.idCosecha;
        opcion.textContent = (lote.familia || '') + ' ' + (lote.variedad || 'Producto')
            + ' · ' + (lote.maduracion || 'Sin clasificar') + ' · Lote #' + lote.idCosecha
            + ' · ' + lote.kilos + ' kg disponibles · $' + Number(lote.precioPorKg).toFixed(2) + '/kg';
        selectorLote.appendChild(opcion);
    });
    etiquetaLote.appendChild(selectorLote);
    bloqueLote.appendChild(etiquetaLote);

    var bloqueCantidad = document.createElement('div');
    var etiquetaCantidad = document.createElement('label');
    etiquetaCantidad.textContent = 'Kilos';
    var campoCantidad = document.createElement('input');
    campoCantidad.type = 'number';
    campoCantidad.min = '0.01';
    campoCantidad.step = '0.01';
    campoCantidad.required = true;
    campoCantidad.addEventListener('input', actualizarTotalPedido);
    selectorLote.addEventListener('change', function () {
        var lote = lotesDisponiblesPedido().find(function (item) {
            return String(item.idCosecha) === selectorLote.value;
        });
        campoCantidad.max = lote ? lote.kilos : '';
        actualizarTotalPedido();
    });
    etiquetaCantidad.appendChild(campoCantidad);
    bloqueCantidad.appendChild(etiquetaCantidad);

    var botonQuitar = document.createElement('button');
    botonQuitar.type = 'button';
    botonQuitar.className = 'boton boton-secundario';
    botonQuitar.textContent = 'Quitar producto';
    botonQuitar.addEventListener('click', function () {
        fila.remove();
        actualizarTotalPedido();
    });
    fila.append(bloqueLote, bloqueCantidad, botonQuitar);
    cajaDetallesEmpleado.appendChild(fila);
}

function mostrarCamposEntregaPedido() {
    var recoger = selectorEntregaEmpleado.value === 'recoleccion';
    document.getElementById('fecha-recoleccion-pedido-empleado').hidden = !recoger;
    document.getElementById('direccion-pedido-empleado').hidden = recoger;
    document.getElementById('fecha-pedido-empleado').required = recoger;
    document.getElementById('direccion-entrega-pedido-empleado').required = !recoger;
}

async function cargarDatosPedidoEmpleado() {
    selectorClienteEmpleado.innerHTML = '<option value="">Cargando clientes…</option>';
    try {
        var resultados = await Promise.all([
            pedirApi('/usuarios'),
            pedirApi('/catalogo')
        ]);
        var clientes = resultados[0].filter(function (usuario) {
            return usuario.rol === 'cliente';
        });
        lotesPedidoEmpleado = resultados[1];
        selectorClienteEmpleado.innerHTML = '<option value="">Selecciona un cliente</option>';
        clientes.forEach(function (cliente) {
            var opcion = document.createElement('option');
            opcion.value = cliente.idUsuario;
            opcion.textContent = cliente.nombreUsuario + ' · ' + cliente.correoElectronico;
            selectorClienteEmpleado.appendChild(opcion);
        });
        if (!clientes.length) mensajePedido('No hay clientes registrados para seleccionar.', 'error');
        if (!lotesDisponiblesPedido().length) mensajePedido('No hay lotes con existencia y precio disponibles en el catálogo.', 'error');
        agregarDetallePedido();
    } catch (error) {
        mensajePedido(errorApi(error), 'error');
    }
}

document.getElementById('agregar-producto-pedido-empleado').addEventListener('click', agregarDetallePedido);
selectorEntregaEmpleado.addEventListener('change', mostrarCamposEntregaPedido);

formularioPedidoEmpleado.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    errorPedidoEmpleado.textContent = '';
    if (!formularioPedidoEmpleado.reportValidity()) return;

    var detalles = [];
    var filas = cajaDetallesEmpleado.querySelectorAll('.detalle-pedido-empleado');
    for (var i = 0; i < filas.length; i++) {
        var selector = filas[i].querySelector('select');
        var cantidad = filas[i].querySelector('input');
        var lote = lotesDisponiblesPedido().find(function (item) {
            return String(item.idCosecha) === selector.value;
        });
        if (!lote || Number(cantidad.value) > Number(lote.kilos)) {
            errorPedidoEmpleado.textContent = 'Revisa cada lote y no excedas los kilos disponibles.';
            return;
        }
        detalles.push({ idCosecha: Number(lote.idCosecha), kilos: Number(cantidad.value) });
    }
    if (!detalles.length) {
        errorPedidoEmpleado.textContent = 'Agrega al menos un producto al pedido.';
        return;
    }

    var solicitud = {
        idUsuario: Number(selectorClienteEmpleado.value),
        metodoPago: document.getElementById('metodo-pago-pedido-empleado').value,
        tipoEntrega: selectorEntregaEmpleado.value,
        detalles: detalles
    };
    if (solicitud.tipoEntrega === 'recoleccion') {
        solicitud.fechaRecoleccion = document.getElementById('fecha-pedido-empleado').value;
    } else {
        solicitud.direccion = document.getElementById('direccion-entrega-pedido-empleado').value.trim();
    }

    var botonGuardar = document.getElementById('guardar-pedido-empleado');
    botonGuardar.disabled = true;
    mensajePedido('Guardando pedido…');
    try {
        var resultado = await pedirApi('/pedidos/registro', 'POST', solicitud);
        mensajePedido('Pedido #' + resultado.idPedido + ' guardado. Total: $' + Number(resultado.total).toFixed(2) + '.', 'ok');
        formularioPedidoEmpleado.reset();
        cajaDetallesEmpleado.replaceChildren();
        agregarDetallePedido();
        mostrarCamposEntregaPedido();
        await cargarLotesActualizados();
    } catch (error) {
        mensajePedido(errorApi(error), 'error');
    } finally {
        botonGuardar.disabled = false;
    }
});

async function cargarLotesActualizados() {
    try {
        lotesPedidoEmpleado = await pedirApi('/catalogo');
        cajaDetallesEmpleado.querySelectorAll('.detalle-pedido-empleado').forEach(function (fila) {
            var seleccionado = fila.querySelector('select').value;
            fila.remove();
            agregarDetallePedido();
            var nuevaFila = cajaDetallesEmpleado.lastElementChild;
            var selector = nuevaFila.querySelector('select');
            if (Array.from(selector.options).some(function (opcion) { return opcion.value === seleccionado; })) {
                selector.value = seleccionado;
                selector.dispatchEvent(new Event('change'));
            }
        });
    } catch (error) {
        mensajePedido(errorApi(error), 'error');
    }
}

var hoyPedidoEmpleado = new Date();
var fechaMinimaPedidoEmpleado = fechaLocalPedidoEmpleado(hoyPedidoEmpleado);
var fechaMaximaPedidoEmpleado = new Date(hoyPedidoEmpleado);
fechaMaximaPedidoEmpleado.setDate(fechaMaximaPedidoEmpleado.getDate() + 7);
document.getElementById('fecha-pedido-empleado').min = fechaMinimaPedidoEmpleado;
document.getElementById('fecha-pedido-empleado').max = fechaLocalPedidoEmpleado(fechaMaximaPedidoEmpleado);
mostrarCamposEntregaPedido();
cargarDatosPedidoEmpleado();
