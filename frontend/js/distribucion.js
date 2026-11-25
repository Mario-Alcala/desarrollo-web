/**
 * Consulta pedidos y cosechas, asigna lotes y actualiza el estado de entrega.
 *
 * @author Equipo de Gestión de Cultivos
 */
class DistribucionPedidos {
    /**
     * Prepara la lista de pedidos que se muestran para distribución.
     */
    constructor() {
        this.pedidosDistribucion = [];
        this.cosechasDisponibles = [];
    }

    /**
     * Consulta pedidos, cosechas y lotes asignados desde la API.
     */
    cargarDistribucion() {
        const pantalla = this;
        this.avisarDistribucion('Cargando pedidos…');
        return Promise.all([pedirApi('/pedidos'), pedirApi('/cosechas')]).then(function (r) {
            pantalla.pedidosDistribucion = r[0] || [];
            pantalla.cosechasDisponibles = (r[1] || []).filter(function (c) { return Number(c.cantidadDisponible) > 0; });
            const conLotes = pantalla.pedidosDistribucion.filter(function (p) { return p.cantidadLotes > 0; });
            return Promise.all(conLotes.map(function (p) {
                return pedirApi('/pedidos/' + p.idPedido + '/lotes').then(function (lotes) {
                    lotesPorPedido[p.idPedido] = lotes || [];
                });
            }));
        }).then(function () {
            pantalla.dibujarPedidos();
            pantalla.avisarDistribucion('');
        }).catch(function (error) {
            pantalla.avisarDistribucion(textoErrorApi(error), 'error');
        });
    }

    /**
     * Actualiza la entrega mediante la API.
     *
     * @param pedido - Pedido al que se aplica la acción.
     * @param estado - Estado de entrega solicitado.
     * @param pregunta - Mensaje de confirmación que se muestra al usuario.
     */
    cambiarEntrega(pedido, estado, pregunta) {
        const pantalla = this;
        if (!usuarioDistribucion) {
            this.avisarDistribucion('Inicia sesión para registrar la entrega.', 'error');
            return;
        }
        if (!confirm(pregunta)) {
            return;
        }
        pedirApi('/pedidos/' + pedido.idPedido + '/entrega', 'PUT', { estado: estado, idUsuario: String(usuarioDistribucion.idUsuario) })
            .then(function () {
                return pantalla.cargarDistribucion();
            })
            .then(function () {
                pantalla.avisarDistribucion('Pedido #' + pedido.idPedido + ': ' + TEXTO_ENTREGA[estado].toLowerCase() + '.', 'ok');
            })
            .catch(function (fallo) {
                pantalla.avisarDistribucion(textoErrorApi(fallo), 'error');
            });
    }

    /**
     * Muestra las tarjetas de los pedidos que cumplen el filtro.
     */
    dibujarPedidos() {
        const pantalla = this;
        contenedorPedidos.innerHTML = '';
        const visibles = this.pedidosDistribucion.filter(this.pedidoVisible.bind(this));
        visibles.forEach(function (pedido) {
            contenedorPedidos.appendChild(pantalla.tarjetaPedido(pedido));
        });
        if (!visibles.length) {
            contenedorPedidos.appendChild(this.parrafo('No hay pedidos que mostrar.'));
        }
    }

    /**
     * Muestra el mensaje de distribución.
     *
     * @param texto - Texto que se quiere mostrar.
     * @param tipo - Tipo de aviso que se quiere mostrar.
     */
    avisarDistribucion(texto, tipo) {
        mensajeDistribucion.textContent = texto;
        mensajeDistribucion.className = 'mensaje' + (tipo ? ' ' + tipo : '');
    }

    /**
     * Obtiene el estado de la entrega.
     *
     * @param pedido - El pedido.
     */
    estadoEntrega(pedido) {
        return pedido.estadoEntrega || 'pendiente';
    }

    /**
     * Decide si el pedido coincide con el filtro de estado.
     *
     * @param pedido - El pedido.
     */
    pedidoVisible(pedido) {
        const entrega = this.estadoEntrega(pedido);
        if (pedido.estado === 'cancelado') {
            return false;
        }
        if (entrega === 'entregado') {
            return mostrarEntregados.checked;
        }
        return true;
    }

    /**
     * Crea un botón de pedido.
     *
     * @param texto - Texto que se quiere mostrar.
     * @param alClic - Función que se ejecuta al pulsar el botón.
     * @param principal - Indica si se aplica el estilo de botón principal.
     */
    boton(texto, alClic, principal) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'boton' + (principal ? '' : ' boton-secundario');
        b.textContent = texto;
        b.onclick = alClic;
        return b;
    }

    /**
     * Crea un párrafo de la tarjeta.
     *
     * @param texto - El texto.
     */
    parrafo(texto) {
        const p = document.createElement('p');
        p.textContent = texto;
        return p;
    }

    /**
     * Crea el formulario para empacar un lote.
     *
     * @param pedido - El pedido.
     */
    formularioAsignar(pedido) {
        const pantalla = this;
        const form = document.createElement('form');
        form.noValidate = true;
        const idBase = 'pedido-' + pedido.idPedido;

        const etiquetaLote = document.createElement('label');
        etiquetaLote.htmlFor = idBase + '-lote';
        etiquetaLote.textContent = 'Lote de cosecha';
        const selectLote = document.createElement('select');
        selectLote.id = idBase + '-lote';
        selectLote.required = true;
        selectLote.add(new Option(this.cosechasDisponibles.length ? 'Selecciona un lote' : 'No hay lotes con kilos disponibles', ''));
        this.cosechasDisponibles.forEach(function (c) {
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
            const lote = pantalla.cosechasDisponibles.filter(function (c) { return String(c.idCosecha) === selectLote.value; })[0];
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
                    return pantalla.cargarDistribucion();
                })
                .then(function () {
                    pantalla.avisarDistribucion('Pedido #' + pedido.idPedido + ': se empacaron ' + campoKilos.value + ' kg del lote #' + lote.idCosecha + '.', 'ok');
                })
                .catch(function (fallo) {
                    error.textContent = textoErrorApi(fallo);
                    enviar.disabled = false;
                });
        });
        return form;
    }

    /**
     * Muestra los datos y acciones de una entrega.
     *
     * @param pedido - El pedido.
     */
    tarjetaPedido(pedido) {
        const pantalla = this;
        const entrega = this.estadoEntrega(pedido);
        const esDomicilio = pedido.tipoEntrega === 'domicilio';
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjeta';

        const titulo = document.createElement('h3');
        titulo.textContent = 'Pedido #' + pedido.idPedido + ' · ' + (pedido.cliente || 'Cliente');
        const insignia = document.createElement('span');
        insignia.className = 'insignia ' + (entrega === 'entregado' ? 'listo' : (entrega === 'pendiente' ? 'alerta' : ''));
        insignia.textContent = TEXTO_ENTREGA[entrega] || entrega;
        tarjeta.append(titulo, insignia);
        tarjeta.appendChild(this.parrafo((esDomicilio ? 'Envío a domicilio' : 'Recolección en bodega (6:00 a. m. a 6:00 p. m.)')
            + ' · Pedido el ' + String(pedido.fechaPedido || '').replace('T', ' ').slice(0, 16)));
        if (pedido.total !== null && pedido.total !== undefined) {
            tarjeta.appendChild(this.parrafo('Total: $' + Number(pedido.total).toFixed(2)));
        }
        if (pedido.responsable) {
            tarjeta.appendChild(this.parrafo('Último responsable: ' + pedido.responsable));
        }
        if (pedido.fechaSalida) {
            tarjeta.appendChild(this.parrafo('Salida: ' + String(pedido.fechaSalida).replace('T', ' ').slice(0, 16)));
        }
        if (pedido.fechaEntrega) {
            tarjeta.appendChild(this.parrafo('Entregado: ' + String(pedido.fechaEntrega).replace('T', ' ').slice(0, 16)));
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
            tarjeta.appendChild(this.parrafo('Todavía no se ha empacado producto.'));
        }

        const acciones = document.createElement('div');
        acciones.className = 'acciones-operacion';
        if (entrega === 'pendiente' && pedido.estado === 'pendiente') {
            tarjeta.appendChild(this.formularioAsignar(pedido));
        }
        if (entrega === 'pendiente' && pedido.cantidadLotes > 0) {
            if (esDomicilio) {
                acciones.appendChild(this.boton('Cargar y registrar salida', function () {
                    pantalla.cambiarEntrega(pedido, 'en_transito', '¿El pedido #' + pedido.idPedido + ' ya salió a reparto?');
                }, true));
            } else {
                acciones.appendChild(this.boton('Dejar listo para recoger', function () {
                    pantalla.cambiarEntrega(pedido, 'listo_recoleccion', '¿El pedido #' + pedido.idPedido + ' ya está listo en bodega?');
                }, true));
            }
        }
        if (entrega === 'en_transito') {
            acciones.appendChild(this.boton('Marcar entregado', function () {
                pantalla.cambiarEntrega(pedido, 'entregado', '¿Se entregó el pedido #' + pedido.idPedido + ' al cliente?');
            }, true));
        }
        if (entrega === 'listo_recoleccion') {
            acciones.appendChild(this.boton('Cliente lo recogió', function () {
                pantalla.cambiarEntrega(pedido, 'entregado', '¿El cliente recogió el pedido #' + pedido.idPedido + '?');
            }, true));
        }
        if (acciones.children.length) {
            tarjeta.appendChild(acciones);
        }
        return tarjeta;
    }

    /**
     * Conecta los eventos de esta pantalla y carga los datos.
     */
    iniciarDistribucion() {
        mostrarEntregados.addEventListener('change', this.dibujarPedidos.bind(this));
        document.getElementById('actualizar').onclick = this.cargarDistribucion.bind(this);
        this.cargarDistribucion();
    }
}

const usuarioDistribucion = usuarioActual();
const mensajeDistribucion = document.getElementById('mensaje');
const contenedorPedidos = document.getElementById('lista-pedidos');
const mostrarEntregados = document.getElementById('mostrar-entregados');

const lotesPorPedido = {};

const TEXTO_ENTREGA = {
    pendiente: 'Por preparar',
    en_transito: 'En camino',
    listo_recoleccion: 'Listo para recoger',
    entregado: 'Entregado'
};

const distribucionPedidos = new DistribucionPedidos();

distribucionPedidos.iniciarDistribucion();
