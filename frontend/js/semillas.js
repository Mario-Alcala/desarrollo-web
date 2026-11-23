/*
 * ARCHIVO: js/semillas.js
 * CAPA: FRONTEND (DOM). Banco de semillas del trabajador (empleado/semillas.html).
 * BACKEND (Fetch con pedirApi): GET /inventario/categoria/semilla, /insumos?categoria=semilla, /proveedores,
 *   /movimientos-inventario, /cultivos (+ parcelas); POST /movimientos-inventario.
 * REGLAS: las semillas son insumos de categoría "semilla" y sus existencias son lotes de inventario
 *   (descripción del proyecto). El trabajador consulta y registra salidas (siembra) o entradas sobre lotes
 *   existentes; no crea semillas ni lotes (antes inventario.html?seccion=semillas hacía POST a /semillas).
 *   No se permite sacar más de lo disponible ni usar un lote caducado para sembrar.
 * DEPENDE DE: api.js, sesion.js, validacion.js, datos-campo.js
 */

var usuarioSemillas = usuarioActual();
var formSemilla = document.getElementById('formulario-semilla');
var selectLoteSemilla = document.getElementById('s-lote');
var selectTipoSemilla = document.getElementById('s-tipo');
var selectCultivoSemilla = document.getElementById('s-cultivo');
var campoCantidadSemilla = document.getElementById('s-cantidad');
var campoNotasSemilla = document.getElementById('s-notas');
var mensajeFormSemilla = document.getElementById('mensaje-semilla');
var mensajeSemillas = document.getElementById('mensaje');
var buscadorSemillas = document.getElementById('buscar-semilla');
var soloUsables = document.getElementById('solo-usables');
var lotesSemilla = [];
var semillasPorId = {};
var proveedoresSemilla = {};
var movimientosSemilla = [];

function loteSemilla(id) {
    for (var i = 0; i < lotesSemilla.length; i++) {
        if (String(lotesSemilla[i].idInventario) === String(id)) {
            return lotesSemilla[i];
        }
    }
    return null;
}

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

function proveedorDeSemilla(lote) {
    var semilla = semillasPorId[lote.idInsumo];
    return semilla ? proveedoresSemilla[semilla.idProveedor] || '' : '';
}

function dibujarBanco() {
    var cuerpo = document.getElementById('lista-semillas');
    cuerpo.innerHTML = '';
    var hoy = Validacion.hoy();
    var texto = buscadorSemillas.value.trim().toLowerCase();
    var visibles = lotesSemilla.filter(function (lote) {
        var estado = estadoSemilla(lote, hoy);
        var coincide = !texto || (lote.nombreInsumo + ' ' + proveedorDeSemilla(lote)).toLowerCase().indexOf(texto) !== -1;
        return coincide && (!soloUsables.checked || estado.vigente);
    });
    var totales = {};
    visibles.forEach(function (lote) {
        var estado = estadoSemilla(lote, hoy);
        var fila = document.createElement('tr');
        celda(fila, '#' + lote.idInventario);
        celda(fila, lote.nombreInsumo);
        celda(fila, proveedorDeSemilla(lote));
        celda(fila, cantidadTexto(lote.cantidad, lote.unidadMedida));
        celda(fila, lote.fechaIngreso);
        celda(fila, lote.fechaCaducidad);
        var td = celda(fila, '');
        td.textContent = '';
        var insignia = document.createElement('span');
        insignia.className = 'insignia ' + estado.clase;
        insignia.textContent = estado.texto;
        td.appendChild(insignia);
        cuerpo.appendChild(fila);
        if (estado.vigente) {
            var unidad = lote.unidadMedida || '';
            totales[unidad] = (totales[unidad] || 0) + Number(lote.cantidad);
        }
    });
    if (!visibles.length) {
        filaSinDatos(cuerpo, 7, lotesSemilla.length ? 'Ninguna semilla coincide con el filtro.' : 'No hay semillas en el banco. Las da de alta el administrador.');
    }
    var partes = Object.keys(totales).map(function (u) { return cantidadTexto(totales[u], u); });
    document.getElementById('total-semillas').textContent = partes.length ? partes.join(' · ') : '—';
}

function llenarLotesSemilla() {
    var hoy = Validacion.hoy();
    var esSalida = selectTipoSemilla.value === 'salida';
    var anterior = selectLoteSemilla.value;
    selectLoteSemilla.innerHTML = '<option value="">Selecciona un lote</option>';
    lotesSemilla.forEach(function (lote) {
        var estado = estadoSemilla(lote, hoy);
        if (esSalida && !estado.vigente) {
            return;
        }
        var opcion = document.createElement('option');
        opcion.value = lote.idInventario;
        opcion.textContent = '#' + lote.idInventario + ' · ' + lote.nombreInsumo + ' · ' + cantidadTexto(lote.cantidad, lote.unidadMedida);
        selectLoteSemilla.appendChild(opcion);
    });
    selectLoteSemilla.value = loteSemilla(anterior) ? anterior : '';
    document.getElementById('bloque-cultivo-semilla').hidden = !esSalida;
    mostrarDisponibleSemilla();
}

function mostrarDisponibleSemilla() {
    var lote = loteSemilla(selectLoteSemilla.value);
    document.getElementById('s-disponible').textContent = lote
        ? 'Disponible: ' + cantidadTexto(lote.cantidad, lote.unidadMedida) + (lote.fechaCaducidad ? ' · caduca ' + lote.fechaCaducidad : '')
        : '';
}

function dibujarMovimientosSemilla() {
    var cuerpo = document.getElementById('lista-movimientos-semilla');
    cuerpo.innerHTML = '';
    var visibles = movimientosSemilla.slice(0, 15);
    visibles.forEach(function (m) {
        var lote = loteSemilla(m.idInventario);
        var fila = document.createElement('tr');
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
        var ids = {};
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

formSemilla.addEventListener('submit', function (evento) {
    evento.preventDefault();
    mensajeFormSemilla.textContent = '';
    if (!usuarioSemillas) {
        mensajeFormSemilla.textContent = 'Inicia sesión para registrar movimientos de semillas.';
        return;
    }
    var lote = loteSemilla(selectLoteSemilla.value);
    var esSalida = selectTipoSemilla.value === 'salida';
    var cultivo = esSalida ? Campo.cultivoPorId(selectCultivoSemilla.value) : null;
    var error = Validacion.primerError([
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
    var detalle = esSalida
        ? (cultivo ? 'Siembra en ' + Campo.nombreCultivo(cultivo) : 'Salida de semilla')
        : 'Entrada de semilla';
    if (campoNotasSemilla.value.trim()) {
        detalle += '. ' + campoNotasSemilla.value.trim();
    }
    var boton = document.getElementById('guardar-semilla');
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
});

selectTipoSemilla.addEventListener('change', llenarLotesSemilla);
selectLoteSemilla.addEventListener('change', mostrarDisponibleSemilla);
buscadorSemillas.addEventListener('input', dibujarBanco);
soloUsables.addEventListener('change', dibujarBanco);
document.getElementById('actualizar').onclick = cargarBanco;
cargarBanco();
