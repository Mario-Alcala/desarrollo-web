/*
 * ARCHIVO: js/distribucion.js
 * CAPA: FRONTEND (DOM). Preparación y entrega de pedidos por el personal.
 * BACKEND (Fetch con pedirApi):
 *   GET  /pedidos, /pedidos/{id}/lotes, /cosechas
 *   POST /pedidos/{id}/lotes     { idCosecha, kilos }              -> agrega productos al pedido
 *   PUT  /pedidos/{id}/entrega   { estado, idUsuario }             -> actualiza la entrega
 *        estados: en_transito (envío), listo_recoleccion (recolección), entregado
 * REGLAS (PedidoService): solo se asignan kilos a pedidos pendientes y sin entrega registrada; no más de lo
 *   disponible del lote; la entrega pasa pendiente -> en_transito/listo_recoleccion -> entregado.
 *   El trabajador que registra cada paso queda como responsable (distribuciones.id_usuario).
 * DEPENDE DE: api.js, sesion.js, validacion.js, datos-campo.js
 */

var usuarioDistribucion = usuarioActual();
var mensajeDistribucion = document.getElementById('mensaje');
var contenedorPedidos = document.getElementById('lista-pedidos');
var mostrarEntregados = document.getElementById('mostrar-entregados');
var pedidosDistribucion = [];
var lotesPorPedido = {};
var cosechasDisponibles = [];

var TEXTO_ENTREGA = {
    pendiente: 'Por preparar',
    en_transito: 'En camino',
    listo_recoleccion: 'Listo para recoger',
    entregado: 'Entregado'
};

function avisarDistribucion(texto, tipo) {
    mensajeDistribucion.textContent = texto;
    mensajeDistribucion.className = 'mensaje' + (tipo ? ' ' + tipo : '');
}

function estadoEntrega(pedido) {
    return pedido.estadoEntrega || 'pendiente';
}

function pedidoVisible(pedido) {
    var entrega = estadoEntrega(pedido);
    if (pedido.estado === 'cancelado') {
        return false;
    }
    if (entrega === 'entregado') {
        return mostrarEntregados.checked;
    }
    return true;
}

function boton(texto, alClic, principal) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'boton' + (principal ? '' : ' boton-secundario');
    b.textContent = texto;
    b.onclick = alClic;
    return b;
}

function parrafo(texto) {
    var p = document.createElement('p');
    p.textContent = texto;
    return p;
}

function formularioAsignar(pedido) {
    var form = document.createElement('form');
    form.noValidate = true;
    var idBase = 'pedido-' + pedido.idPedido;

    var etiquetaLote = document.createElement('label');
    etiquetaLote.htmlFor = idBase + '-lote';
    etiquetaLote.textContent = 'Lote de cosecha';
    var selectLote = document.createElement('select');
    selectLote.id = idBase + '-lote';
    selectLote.required = true;
    selectLote.add(new Option(cosechasDisponibles.length ? 'Selecciona un lote' : 'No hay lotes con kilos disponibles', ''));
    cosechasDisponibles.forEach(function (c) {
        selectLote.add(new Option('#' + c.idCosecha + ' · ' + (c.nombreCultivo || 'Cultivo ' + c.idCultivo) + ' · '
            + (c.estadoMaduracion || '') + ' · ' + cantidadTexto(c.cantidadDisponible, 'kg'), c.idCosecha));
    });

    var etiquetaKilos = document.createElement('label');
    etiquetaKilos.htmlFor = idBase + '-kilos';
    etiquetaKilos.textContent = 'Kilos a empacar';
    var campoKilos = document.createElement('input');
    campoKilos.id = idBase + '-kilos';
    campoKilos.type = 'number';
    campoKilos.min = '0.01';
    campoKilos.step = '0.01';
    campoKilos.required = true;

    var error = document.createElement('p');
    error.className = 'mensaje error';
    error.setAttribute('role', 'alert');
    var acciones = document.createElement('div');
    acciones.className = 'acciones-operacion';
    var enviar = document.createElement('button');
    enviar.type = 'submit';
    enviar.className = 'boton';
    enviar.textContent = 'Agregar al pedido';
    acciones.appendChild(enviar);
    form.append(etiquetaLote, selectLote, etiquetaKilos, campoKilos, error, acciones);

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();
        error.textContent = '';
        var lote = cosechasDisponibles.filter(function (c) { return String(c.idCosecha) === selectLote.value; })[0];
        var mensaje = Validacion.primerError([
            [selectLote, lote ? '' : 'Selecciona un lote con kilos disponibles.'],
            [campoKilos, Validacion.numero(campoKilos.value, {
                nombre: 'los kilos', maximo: lote ? Number(lote.cantidadDisponible) : undefined, unidad: 'kg'
            })]
        ]);
        if (mensaje) {
            error.textContent = mensaje;
            return;
        }
        enviar.disabled = true;
        pedirApi('/pedidos/' + pedido.idPedido + '/lotes', 'POST', { idCosecha: lote.idCosecha, kilos: Number(campoKilos.value) })
            .then(function () {
                return cargarDistribucion();
            })
            .then(function () {
                avisarDistribucion('Pedido #' + pedido.idPedido + ': se empacaron ' + campoKilos.value + ' kg del lote #' + lote.idCosecha + '.', 'ok');
            })
            .catch(function (fallo) {
                error.textContent = textoErrorApi(fallo);
                enviar.disabled = false;
            });
    });
    return form;
}

function cambiarEntrega(pedido, estado, pregunta) {
    if (!usuarioDistribucion) {
        avisarDistribucion('Inicia sesión para registrar la entrega.', 'error');
        return;
    }
    if (!confirm(pregunta)) {
        return;
    }
    pedirApi('/pedidos/' + pedido.idPedido + '/entrega', 'PUT', { estado: estado, idUsuario: String(usuarioDistribucion.idUsuario) })
        .then(function () {
            return cargarDistribucion();
        })
        .then(function () {
            avisarDistribucion('Pedido #' + pedido.idPedido + ': ' + TEXTO_ENTREGA[estado].toLowerCase() + '.', 'ok');
        })
        .catch(function (fallo) {
            avisarDistribucion(textoErrorApi(fallo), 'error');
        });
}

function tarjetaPedido(pedido) {
    var entrega = estadoEntrega(pedido);
    var esDomicilio = pedido.tipoEntrega === 'domicilio';
    var tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';

    var titulo = document.createElement('h3');
    titulo.textContent = 'Pedido #' + pedido.idPedido + ' · ' + (pedido.cliente || 'Cliente');
    var insignia = document.createElement('span');
    insignia.className = 'insignia ' + (entrega === 'entregado' ? 'listo' : (entrega === 'pendiente' ? 'alerta' : ''));
    insignia.textContent = TEXTO_ENTREGA[entrega] || entrega;
    tarjeta.append(titulo, insignia);
    tarjeta.appendChild(parrafo((esDomicilio ? 'Envío a domicilio' : 'Recolección en bodega (6:00 a. m. a 6:00 p. m.)')
        + ' · Pedido el ' + String(pedido.fechaPedido || '').replace('T', ' ').slice(0, 16)));
    if (pedido.total !== null && pedido.total !== undefined) {
        tarjeta.appendChild(parrafo('Total: $' + Number(pedido.total).toFixed(2)));
    }
    if (pedido.responsable) {
        tarjeta.appendChild(parrafo('Último responsable: ' + pedido.responsable));
    }
    if (pedido.fechaSalida) {
        tarjeta.appendChild(parrafo('Salida: ' + String(pedido.fechaSalida).replace('T', ' ').slice(0, 16)));
    }
    if (pedido.fechaEntrega) {
        tarjeta.appendChild(parrafo('Entregado: ' + String(pedido.fechaEntrega).replace('T', ' ').slice(0, 16)));
    }

    var lotes = lotesPorPedido[pedido.idPedido] || [];
    var subtitulo = document.createElement('strong');
    subtitulo.textContent = 'Producto empacado';
    tarjeta.appendChild(subtitulo);
    if (lotes.length) {
        var lista = document.createElement('ul');
        lista.className = 'lista-simple';
        lotes.forEach(function (l) {
            var item = document.createElement('li');
            item.textContent = (l.producto || 'Lote') + ' · lote #' + l.idCosecha + ' · ' + (l.maduracion || '') + ' · ' + cantidadTexto(l.cantidad, 'kg');
            lista.appendChild(item);
        });
        tarjeta.appendChild(lista);
    } else {
        tarjeta.appendChild(parrafo('Todavía no se ha empacado producto.'));
    }

    var acciones = document.createElement('div');
    acciones.className = 'acciones-operacion';
    if (entrega === 'pendiente' && pedido.estado === 'pendiente') {
        tarjeta.appendChild(formularioAsignar(pedido));
    }
    if (entrega === 'pendiente' && pedido.cantidadLotes > 0) {
        if (esDomicilio) {
            acciones.appendChild(boton('Cargar y registrar salida', function () {
                cambiarEntrega(pedido, 'en_transito', '¿El pedido #' + pedido.idPedido + ' ya salió a reparto?');
            }, true));
        } else {
            acciones.appendChild(boton('Dejar listo para recoger', function () {
                cambiarEntrega(pedido, 'listo_recoleccion', '¿El pedido #' + pedido.idPedido + ' ya está listo en bodega?');
            }, true));
        }
    }
    if (entrega === 'en_transito') {
        acciones.appendChild(boton('Marcar entregado', function () {
            cambiarEntrega(pedido, 'entregado', '¿Se entregó el pedido #' + pedido.idPedido + ' al cliente?');
        }, true));
    }
    if (entrega === 'listo_recoleccion') {
        acciones.appendChild(boton('Cliente lo recogió', function () {
            cambiarEntrega(pedido, 'entregado', '¿El cliente recogió el pedido #' + pedido.idPedido + '?');
        }, true));
    }
    if (acciones.children.length) {
        tarjeta.appendChild(acciones);
    }
    return tarjeta;
}

function dibujarPedidos() {
    contenedorPedidos.innerHTML = '';
    var visibles = pedidosDistribucion.filter(pedidoVisible);
    visibles.forEach(function (pedido) {
        contenedorPedidos.appendChild(tarjetaPedido(pedido));
    });
    if (!visibles.length) {
        contenedorPedidos.appendChild(parrafo('No hay pedidos que mostrar.'));
    }
}

function cargarDistribucion() {
    avisarDistribucion('Cargando pedidos…');
    return Promise.all([pedirApi('/pedidos'), pedirApi('/cosechas')]).then(function (r) {
        pedidosDistribucion = r[0] || [];
        cosechasDisponibles = (r[1] || []).filter(function (c) { return Number(c.cantidadDisponible) > 0; });
        var conLotes = pedidosDistribucion.filter(function (p) { return p.cantidadLotes > 0; });
        return Promise.all(conLotes.map(function (p) {
            return pedirApi('/pedidos/' + p.idPedido + '/lotes').then(function (lotes) {
                lotesPorPedido[p.idPedido] = lotes || [];
            });
        }));
    }).then(function () {
        dibujarPedidos();
        avisarDistribucion('');
    }).catch(function (error) {
        avisarDistribucion(textoErrorApi(error), 'error');
    });
}

mostrarEntregados.addEventListener('change', dibujarPedidos);
document.getElementById('actualizar').onclick = cargarDistribucion;
cargarDistribucion();
