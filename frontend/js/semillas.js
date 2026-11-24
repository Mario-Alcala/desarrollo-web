/* Datos: este archivo muestra el banco de semillas y registra entradas y salidas de los lotes. No recibe atributos. */

const usuarioSemillas = usuarioActual();
const formSemilla = document.getElementById('formulario-semilla');
const selectLoteSemilla = document.getElementById('s-lote');
const selectTipoSemilla = document.getElementById('s-tipo');
const selectCultivoSemilla = document.getElementById('s-cultivo');
const campoCantidadSemilla = document.getElementById('s-cantidad');
const campoNotasSemilla = document.getElementById('s-notas');
const mensajeFormSemilla = document.getElementById('mensaje-semilla');
const mensajeSemillas = document.getElementById('mensaje');
const buscadorSemillas = document.getElementById('buscar-semilla');
const soloUsables = document.getElementById('solo-usables');
let lotesSemilla = [];
let semillasPorId = {};
let proveedoresSemilla = {};
let movimientosSemilla = [];

/* Datos: esta función consulta lotes de semillas, insumos, proveedores, movimientos y cultivos desde la API. No recibe atributos. */
function cargarBanco() {
    mensajeSemillas.textContent = 'Cargando…';
    return Promise.all([
        pedirApi('/inventario/categoria/semilla'),
        pedirApi('/insumos?categoria=semilla'),
        pedirApi('/proveedores'),
        pedirApi('/movimientos-inventario'),
        Campo.cargar()
    ]).then(function (r) {
        lotesSemilla = r[0] || [];
        semillasPorId = {};
        (r[1] || []).forEach(function (s) { semillasPorId[s.idInsumo] = s; });
        proveedoresSemilla = {};
        (r[2] || []).forEach(function (p) { proveedoresSemilla[p.idProveedor] = p.nombreEmpresa; });
        const ids = {};
        lotesSemilla.forEach(function (l) { ids[l.idInventario] = true; });
        movimientosSemilla = (r[3] || []).filter(function (m) { return ids[m.idInventario]; });
        Campo.llenarSelectCultivos(selectCultivoSemilla, { textoInicial: 'Sin cultivo (otro uso)' });
        dibujarBanco();
        llenarLotesSemilla();
        dibujarMovimientosSemilla();
        mensajeSemillas.textContent = '';
    }).catch(function (error) {
        mensajeSemillas.textContent = textoErrorApi(error);
    });
}

/* Datos: esta función muestra los lotes que coinciden con la búsqueda y el filtro. No recibe atributos. */
function dibujarBanco() {
    const cuerpo = document.getElementById('lista-semillas');
    cuerpo.innerHTML = '';
    const hoy = Validacion.hoy();
    const texto = buscadorSemillas.value.trim().toLowerCase();
    const visibles = lotesSemilla.filter(function (lote) {
        const estado = estadoSemilla(lote, hoy);
        const coincide = !texto || (lote.nombreInsumo + ' ' + proveedorDeSemilla(lote)).toLowerCase().indexOf(texto) !== -1;
        return coincide && (!soloUsables.checked || estado.vigente);
    });
    const totales = {};
    visibles.forEach(function (lote) {
        const estado = estadoSemilla(lote, hoy);
        const fila = document.createElement('tr');
        celda(fila, '#' + lote.idInventario);
        celda(fila, lote.nombreInsumo);
        celda(fila, proveedorDeSemilla(lote));
        celda(fila, cantidadTexto(lote.cantidad, lote.unidadMedida));
        celda(fila, lote.fechaIngreso);
        celda(fila, lote.fechaCaducidad);
        const td = celda(fila, '');
        td.textContent = '';
        const insignia = document.createElement('span');
        insignia.className = 'insignia ' + estado.clase;
        insignia.textContent = estado.texto;
        td.appendChild(insignia);
        cuerpo.appendChild(fila);
        if (estado.vigente) {
            const unidad = lote.unidadMedida || '';
            totales[unidad] = (totales[unidad] || 0) + Number(lote.cantidad);
        }
    });
    if (!visibles.length) {
        filaSinDatos(cuerpo, 7, lotesSemilla.length ? 'Ninguna semilla coincide con el filtro.' : 'No hay semillas en el banco. Las da de alta el administrador.');
    }
    const partes = Object.keys(totales).map(function (u) { return cantidadTexto(totales[u], u); });
    document.getElementById('total-semillas').textContent = partes.length ? partes.join(' · ') : '—';
}

/* Datos: esta función muestra los movimientos recientes de semillas. No recibe atributos. */
function dibujarMovimientosSemilla() {
    const cuerpo = document.getElementById('lista-movimientos-semilla');
    cuerpo.innerHTML = '';
    const visibles = movimientosSemilla.slice(0, 15);
    visibles.forEach(function (m) {
        const lote = loteSemilla(m.idInventario);
        const fila = document.createElement('tr');
        celda(fila, String(m.fechaMovimiento || '').replace('T', ' ').slice(0, 16));
        celda(fila, lote ? lote.nombreInsumo : 'Lote #' + m.idInventario);
        celda(fila, m.tipoMovimiento === 'salida' ? 'Salida' : 'Entrada');
        celda(fila, cantidadTexto(m.cantidad, lote && lote.unidadMedida));
        celda(fila, m.observacion);
        cuerpo.appendChild(fila);
    });
    if (!visibles.length) {
        filaSinDatos(cuerpo, 5, 'Todavía no hay movimientos de semillas.');
    }
}

/* Datos: esta función busca un lote de semillas. Recibe el ID del lote. */
function loteSemilla(id) {
    return lotesSemilla.find(lote => String(lote.idInventario) === String(id)) || null;
}

/* Datos: esta función determina la disponibilidad de un lote de semillas. Recibe el lote y la fecha de hoy. */
function estadoSemilla(lote, hoy) {
    if (Number(lote.cantidad) <= 0) {
        return { texto: 'Agotada', clase: 'peligro', vigente: false, conExistencia: false };
    }
    if (lote.fechaCaducidad && lote.fechaCaducidad < hoy) {
        return { texto: 'Caducada', clase: 'peligro', vigente: false, conExistencia: true };
    }
    if (lote.fechaCaducidad && Validacion.diasEntre(hoy, lote.fechaCaducidad) <= 30) {
        return { texto: 'Caduca en ' + Validacion.diasEntre(hoy, lote.fechaCaducidad) + ' día(s)', clase: 'alerta', vigente: true, conExistencia: true };
    }
    return { texto: 'Vigente', clase: 'listo', vigente: true, conExistencia: true };
}

/* Datos: esta función busca el proveedor del lote. Recibe el lote de semillas. */
function proveedorDeSemilla(lote) {
    const semilla = semillasPorId[lote.idInsumo];
    return semilla ? proveedoresSemilla[semilla.idProveedor] || '' : '';
}

/* Datos: esta función llena el selector con los lotes que admite el tipo de movimiento. No recibe atributos. */
function llenarLotesSemilla() {
    const hoy = Validacion.hoy();
    const esSalida = selectTipoSemilla.value === 'salida';
    const anterior = selectLoteSemilla.value;
    selectLoteSemilla.innerHTML = '<option value="">Selecciona un lote</option>';
    lotesSemilla.forEach(function (lote) {
        const estado = estadoSemilla(lote, hoy);
        if (esSalida && !estado.vigente) {
            return;
        }
        const opcion = document.createElement('option');
        opcion.value = lote.idInventario;
        opcion.textContent = '#' + lote.idInventario + ' · ' + lote.nombreInsumo + ' · ' + cantidadTexto(lote.cantidad, lote.unidadMedida);
        selectLoteSemilla.appendChild(opcion);
    });
    selectLoteSemilla.value = loteSemilla(anterior) ? anterior : '';
    document.getElementById('bloque-cultivo-semilla').hidden = !esSalida;
    mostrarDisponibleSemilla();
}

/* Datos: esta función muestra la cantidad disponible del lote de semillas elegido. No recibe atributos. */
function mostrarDisponibleSemilla() {
    const lote = loteSemilla(selectLoteSemilla.value);
    document.getElementById('s-disponible').textContent = lote
        ? 'Disponible: ' + cantidadTexto(lote.cantidad, lote.unidadMedida) + (lote.fechaCaducidad ? ' · caduca ' + lote.fechaCaducidad : '')
        : '';
}

/* Datos: esta función registra una entrada o salida de semillas. Recibe el evento del formulario. */
function guardarMovimientoSemilla(evento) {
    evento.preventDefault();
    mensajeFormSemilla.textContent = '';
    if (!usuarioSemillas) {
        mensajeFormSemilla.textContent = 'Inicia sesión para registrar movimientos de semillas.';
        return;
    }
    const lote = loteSemilla(selectLoteSemilla.value);
    const esSalida = selectTipoSemilla.value === 'salida';
    const cultivo = esSalida ? Campo.cultivoPorId(selectCultivoSemilla.value) : null;
    const error = Validacion.primerError([
        [selectTipoSemilla, Validacion.opcion(selectTipoSemilla.value, ['salida', 'entrada'], 'el tipo de movimiento')],
        [selectLoteSemilla, lote ? '' : 'Selecciona un lote del banco.'],
        [campoCantidadSemilla, Validacion.numero(campoCantidadSemilla.value, {
            nombre: 'la cantidad', unidad: lote && lote.unidadMedida,
            maximo: esSalida && lote ? Number(lote.cantidad) : 99999999.99
        })],
        [selectLoteSemilla, esSalida && lote && lote.fechaCaducidad && lote.fechaCaducidad < Validacion.hoy()
            ? 'Ese lote está caducado; no se puede usar para sembrar.' : ''],
        [campoNotasSemilla, Validacion.texto(campoNotasSemilla.value, { nombre: 'las notas', maximo: 120, obligatorio: false })]
    ]);
    if (error) {
        mensajeFormSemilla.textContent = error;
        return;
    }
    let detalle = esSalida
        ? (cultivo ? 'Siembra en ' + Campo.nombreCultivo(cultivo) : 'Salida de semilla')
        : 'Entrada de semilla';
    if (campoNotasSemilla.value.trim()) {
        detalle += '. ' + campoNotasSemilla.value.trim();
    }
    const boton = document.getElementById('guardar-semilla');
    boton.disabled = true;
    pedirApi('/movimientos-inventario', 'POST', {
        idInventario: lote.idInventario,
        idUsuario: usuarioSemillas.idUsuario,
        tipoMovimiento: selectTipoSemilla.value,
        cantidad: Number(campoCantidadSemilla.value),
        observacion: detalle.slice(0, 255)
    }).then(function () {
        formSemilla.reset();
        return cargarBanco();
    }).then(function () {
        mensajeSemillas.textContent = 'Movimiento registrado en el banco de semillas.';
        mensajeSemillas.className = 'mensaje ok';
    }).catch(function (fallo) {
        mensajeFormSemilla.textContent = textoErrorApi(fallo);
    }).finally(function () {
        boton.disabled = false;
    });
}

/* Datos: esta función conecta los eventos de esta pantalla y carga los datos. No recibe atributos. */
function iniciarSemillas() {
    formSemilla.addEventListener('submit', guardarMovimientoSemilla);
    selectTipoSemilla.addEventListener('change', llenarLotesSemilla);
    selectLoteSemilla.addEventListener('change', mostrarDisponibleSemilla);
    buscadorSemillas.addEventListener('input', dibujarBanco);
    soloUsables.addEventListener('change', dibujarBanco);
    document.getElementById('actualizar').onclick = cargarBanco;
    cargarBanco();
}

iniciarSemillas();
