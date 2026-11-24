/* Datos: este archivo consulta pedidos y cosechas, asigna lotes y actualiza el estado de entrega. No recibe atributos. */

const usuarioDistribucion = usuarioActual();
const mensajeDistribucion = document.getElementById('mensaje');
const contenedorPedidos = document.getElementById('lista-pedidos');
const mostrarEntregados = document.getElementById('mostrar-entregados');
let pedidosDistribucion = [];
const lotesPorPedido = {};
let cosechasDisponibles = [];

const TEXTO_ENTREGA = {
    pendiente: 'Por preparar',
    en_transito: 'En camino',
    listo_recoleccion: 'Listo para recoger',
    entregado: 'Entregado'
};

/* Datos: esta función consulta pedidos, cosechas y lotes asignados desde la API. No recibe atributos. */
function cargarDistribucion() {
    avisarDistribucion('Cargando pedidos…');
    return Promise.all([pedirApi('/pedidos'), pedirApi('/cosechas')]).then(function (r) {
        pedidosDistribucion = r[0] || [];
        cosechasDisponibles = (r[1] || []).filter(function (c) { return Number(c.cantidadDisponible) > 0; });
        const conLotes = pedidosDistribucion.filter(function (p) { return p.cantidadLotes > 0; });
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

/* Datos: esta función actualiza la entrega mediante la API. Recibe el pedido, el estado y el texto de confirmación. */
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

/* Datos: esta función muestra las tarjetas de los pedidos que cumplen el filtro. No recibe atributos. */
function dibujarPedidos() {
    contenedorPedidos.innerHTML = '';
    const visibles = pedidosDistribucion.filter(pedidoVisible);
    visibles.forEach(function (pedido) {
        contenedorPedidos.appendChild(tarjetaPedido(pedido));
    });
    if (!visibles.length) {
        contenedorPedidos.appendChild(parrafo('No hay pedidos que mostrar.'));
    }
}

/* Datos: esta función muestra el mensaje de distribución. Recibe el texto y el tipo de mensaje. */
function avisarDistribucion(texto, tipo) {
    mensajeDistribucion.textContent = texto;
    mensajeDistribucion.className = 'mensaje' + (tipo ? ' ' + tipo : '');
}

/* Datos: esta función obtiene el estado de la entrega. Recibe el pedido. */
function estadoEntrega(pedido) {
    return pedido.estadoEntrega || 'pendiente';
}

/* Datos: esta función decide si el pedido coincide con el filtro de estado. Recibe el pedido. */
function pedidoVisible(pedido) {
    const entrega = estadoEntrega(pedido);
    if (pedido.estado === 'cancelado') {
        return false;
    }
    if (entrega === 'entregado') {
        return mostrarEntregados.checked;
    }
    return true;
}

/* Datos: esta función crea un botón de pedido. Recibe el texto, la función y si es una acción principal. */
function boton(texto, alClic, principal) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'boton' + (principal ? '' : ' boton-secundario');
    b.textContent = texto;
    b.onclick = alClic;
    return b;
}

/* Datos: esta función crea un párrafo de la tarjeta. Recibe el texto. */
function parrafo(texto) {
    const p = document.createElement('p');
    p.textContent = texto;
    return p;
}

/* Datos: esta función crea el formulario para empacar un lote. Recibe el pedido. */
function formularioAsignar(pedido) {
    const form = document.createElement('form');
    form.noValidate = true;
    const idBase = 'pedido-' + pedido.idPedido;

    const etiquetaLote = document.createElement('label');
    etiquetaLote.htmlFor = idBase + '-lote';
    etiquetaLote.textContent = 'Lote de cosecha';
    const selectLote = document.createElement('select');
    selectLote.id = idBase + '-lote';
    selectLote.required = true;
    selectLote.add(new Option(cosechasDisponibles.length ? 'Selecciona un lote' : 'No hay lotes con kilos disponibles', ''));
    cosechasDisponibles.forEach(function (c) {
        selectLote.add(new Option('#' + c.idCosecha + ' · ' + (c.nombreCultivo || 'Cultivo ' + c.idCultivo) + ' · '
            + (c.estadoMaduracion || '') + ' · ' + cantidadTexto(c.cantidadDisponible, 'kg'), c.idCosecha));
    });

    const etiquetaKilos = document.createElement('label');
    etiquetaKilos.htmlFor = idBase + '-kilos';
    etiquetaKilos.textContent = 'Kilos a empacar';
    const campoKilos = document.createElement('input');
    campoKilos.id = idBase + '-kilos';
    campoKilos.type = 'number';
    campoKilos.min = '0.01';
    campoKilos.step = '0.01';
    campoKilos.required = true;

    const error = document.createElement('p');
    error.className = 'mensaje error';
    error.setAttribute('role', 'alert');
    const acciones = document.createElement('div');
    acciones.className = 'acciones-operacion';
    const enviar = document.createElement('button');
    enviar.type = 'submit';
    enviar.className = 'boton';
    enviar.textContent = 'Agregar al pedido';
    acciones.appendChild(enviar);
    form.append(etiquetaLote, selectLote, etiquetaKilos, campoKilos, error, acciones);

    form.addEventListener('submit', function (evento) {
        evento.preventDefault();
        error.textContent = '';
        const lote = cosechasDisponibles.filter(function (c) { return String(c.idCosecha) === selectLote.value; })[0];
        const mensaje = Validacion.primerError([
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

/* Datos: esta función muestra los datos y acciones de una entrega. Recibe el pedido. */
function tarjetaPedido(pedido) {
    const entrega = estadoEntrega(pedido);
    const esDomicilio = pedido.tipoEntrega === 'domicilio';
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';

    const titulo = document.createElement('h3');
    titulo.textContent = 'Pedido #' + pedido.idPedido + ' · ' + (pedido.cliente || 'Cliente');
    const insignia = document.createElement('span');
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

    const lotes = lotesPorPedido[pedido.idPedido] || [];
    const subtitulo = document.createElement('strong');
    subtitulo.textContent = 'Producto empacado';
    tarjeta.appendChild(subtitulo);
    if (lotes.length) {
        const lista = document.createElement('ul');
        lista.className = 'lista-simple';
        lotes.forEach(function (l) {
            const item = document.createElement('li');
            item.textContent = (l.producto || 'Lote') + ' · lote #' + l.idCosecha + ' · ' + (l.maduracion || '') + ' · ' + cantidadTexto(l.cantidad, 'kg');
            lista.appendChild(item);
        });
        tarjeta.appendChild(lista);
    } else {
        tarjeta.appendChild(parrafo('Todavía no se ha empacado producto.'));
    }

    const acciones = document.createElement('div');
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

/* Datos: esta función conecta los eventos de esta pantalla y carga los datos. No recibe atributos. */
function iniciarDistribucion() {
    mostrarEntregados.addEventListener('change', dibujarPedidos);
    document.getElementById('actualizar').onclick = cargarDistribucion;
    cargarDistribucion();
}

iniciarDistribucion();
