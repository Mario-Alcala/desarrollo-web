/**
 * @file Registra pedidos del empleado con usuarios y lotes de la API.
 *
 * @author Equipo de Gestión de Cultivos
 */
const formularioPedidoEmpleado = document.getElementById('formulario-pedido-empleado');
const selectorClienteEmpleado = document.getElementById('cliente-pedido-empleado');
const selectorEntregaEmpleado = document.getElementById('tipo-entrega-pedido-empleado');
const cajaDetallesEmpleado = document.getElementById('detalles-pedido-empleado');
const mensajePedidoEmpleado = document.getElementById('mensaje-pedido-empleado');
const errorPedidoEmpleado = document.getElementById('error-pedido-empleado');
let lotesPedidoEmpleado = [];

/**
 * Consulta clientes y catálogo disponibles.
 */
async function cargarDatosPedidoEmpleado() {
    selectorClienteEmpleado.innerHTML = '<option value="">Cargando clientes…</option>';
    try {
        const resultados = await Promise.all([
            pedirApi('/usuarios'),
            pedirApi('/catalogo')
        ]);
        const clientes = resultados[0].filter(function (usuario) {
            return usuario.rol === 'cliente';
        });
        lotesPedidoEmpleado = resultados[1];
        selectorClienteEmpleado.innerHTML = '<option value="">Selecciona un cliente</option>';
        clientes.forEach(function (cliente) {
            const opcion = document.createElement('option');
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

/**
 * Envía el cliente, los lotes y la forma de entrega.
 *
 * @param evento - Evento de envío del formulario.
 */
async function guardarPedidoEmpleado(evento) {
    evento.preventDefault();
    errorPedidoEmpleado.textContent = '';
    if (!formularioPedidoEmpleado.reportValidity()) return;

    const detalles = [];
    const filas = cajaDetallesEmpleado.querySelectorAll('.detalle-pedido-empleado');
    for (let i = 0; i < filas.length; i++) {
        const selector = filas[i].querySelector('select');
        const cantidad = filas[i].querySelector('input');
        const lote = lotesDisponiblesPedido().find(function (item) {
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

    const solicitud = {
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

    const botonGuardar = document.getElementById('guardar-pedido-empleado');
    botonGuardar.disabled = true;
    mensajePedido('Guardando pedido…');
    try {
        const resultado = await pedirApi('/pedidos/registro', 'POST', solicitud);
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
}

/**
 * Actualiza la disponibilidad de las opciones.
 */
async function cargarLotesActualizados() {
    try {
        lotesPedidoEmpleado = await pedirApi('/catalogo');
        cajaDetallesEmpleado.querySelectorAll('.detalle-pedido-empleado').forEach(function (fila) {
            const seleccionado = fila.querySelector('select').value;
            fila.remove();
            agregarDetallePedido();
            const nuevaFila = cajaDetallesEmpleado.lastElementChild;
            const selector = nuevaFila.querySelector('select');
            if (Array.from(selector.options).some(function (opcion) { return opcion.value === seleccionado; })) {
                selector.value = seleccionado;
                selector.dispatchEvent(new Event('change'));
            }
        });
    } catch (error) {
        mensajePedido(errorApi(error), 'error');
    }
}

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

/**
 * Suma precio por kilo por cantidad elegida.
 */
function actualizarTotalPedido() {
    let total = 0;
    cajaDetallesEmpleado.querySelectorAll('.detalle-pedido-empleado').forEach(function (fila) {
        const selector = fila.querySelector('select');
        const cantidad = fila.querySelector('input');
        const lote = lotesDisponiblesPedido().find(function (item) {
            return String(item.idCosecha) === selector.value;
        });
        if (lote && Number(cantidad.value) > 0) {
            total += Number(lote.precioPorKg) * Number(cantidad.value);
        }
    });
    document.getElementById('total-pedido-empleado').textContent = '$' + total.toFixed(2);
}

/**
 * Crea un renglón para elegir lote y kilos.
 */
function agregarDetallePedido() {
    const fila = document.createElement('div');
    fila.className = 'campos-operacion detalle-pedido-empleado espacio';

    const bloqueLote = document.createElement('div');
    const etiquetaLote = document.createElement('label');
    etiquetaLote.textContent = 'Producto y lote';
    const selectorLote = document.createElement('select');
    selectorLote.required = true;
    const opcionInicial = document.createElement('option');
    opcionInicial.value = '';
    opcionInicial.textContent = 'Selecciona un lote disponible';
    selectorLote.appendChild(opcionInicial);
    lotesDisponiblesPedido().forEach(function (lote) {
        const opcion = document.createElement('option');
        opcion.value = lote.idCosecha;
        opcion.textContent = (lote.familia || '') + ' ' + (lote.variedad || 'Producto')
            + ' · ' + (lote.maduracion || 'Sin clasificar') + ' · Lote #' + lote.idCosecha
            + ' · ' + lote.kilos + ' kg disponibles · $' + Number(lote.precioPorKg).toFixed(2) + '/kg';
        selectorLote.appendChild(opcion);
    });
    etiquetaLote.appendChild(selectorLote);
    bloqueLote.appendChild(etiquetaLote);

    const bloqueCantidad = document.createElement('div');
    const etiquetaCantidad = document.createElement('label');
    etiquetaCantidad.textContent = 'Kilos';
    const campoCantidad = document.createElement('input');
    campoCantidad.type = 'number';
    campoCantidad.min = '0.01';
    campoCantidad.step = '0.01';
    campoCantidad.required = true;
    campoCantidad.addEventListener('input', actualizarTotalPedido);
    selectorLote.addEventListener('change', function () {
        const lote = lotesDisponiblesPedido().find(function (item) {
            return String(item.idCosecha) === selectorLote.value;
        });
        campoCantidad.max = lote ? lote.kilos : '';
        actualizarTotalPedido();
    });
    etiquetaCantidad.appendChild(campoCantidad);
    bloqueCantidad.appendChild(etiquetaCantidad);

    const botonQuitar = document.createElement('button');
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

/**
 * Muestra los campos de la entrega elegida.
 */
function mostrarCamposEntregaPedido() {
    const recoger = selectorEntregaEmpleado.value === 'recoleccion';
    document.getElementById('fecha-recoleccion-pedido-empleado').hidden = !recoger;
    document.getElementById('direccion-pedido-empleado').hidden = recoger;
    document.getElementById('fecha-pedido-empleado').required = recoger;
    document.getElementById('direccion-entrega-pedido-empleado').required = !recoger;
}

/**
 * Conecta los controles y carga los datos iniciales.
 */
function iniciarPedidoEmpleado() {
    document.getElementById('agregar-producto-pedido-empleado').addEventListener('click', agregarDetallePedido);
    selectorEntregaEmpleado.addEventListener('change', mostrarCamposEntregaPedido);
    formularioPedidoEmpleado.addEventListener('submit', guardarPedidoEmpleado);

    const hoyPedidoEmpleado = new Date();
    const fechaMinimaPedidoEmpleado = fechaLocalPedidoEmpleado(hoyPedidoEmpleado);
    const fechaMaximaPedidoEmpleado = new Date(hoyPedidoEmpleado);
    fechaMaximaPedidoEmpleado.setDate(fechaMaximaPedidoEmpleado.getDate() + 7);
    document.getElementById('fecha-pedido-empleado').min = fechaMinimaPedidoEmpleado;
    document.getElementById('fecha-pedido-empleado').max = fechaLocalPedidoEmpleado(fechaMaximaPedidoEmpleado);
    mostrarCamposEntregaPedido();
    cargarDatosPedidoEmpleado();
}

iniciarPedidoEmpleado();
