

var panelAplicacion = document.getElementById('aplicacion');
var categoriaInsumo = panelAplicacion.dataset.categoria;
var nombreCategoria = panelAplicacion.dataset.nombre;
var usuarioAplicacion = usuarioActual();
var formAplicacion = document.getElementById('formulario-aplicacion');
var selectLoteAp = document.getElementById('ap-lote');
var selectCultivoAp = document.getElementById('ap-cultivo');
var campoCantidadAp = document.getElementById('ap-cantidad');
var campoFechaAp = document.getElementById('ap-fecha');
var campoNotasAp = document.getElementById('ap-notas');
var mensajeAp = document.getElementById('mensaje-aplicacion');
var mensajeInsumos = document.getElementById('mensaje');
var lotesInsumo = [];
var insumosPorId = {};
var proveedoresPorId = {};
var aplicaciones = [];

function loteInsumo(id) {
    for (var i = 0; i < lotesInsumo.length; i++) {
        if (String(lotesInsumo[i].idInventario) === String(id)) {
            return lotesInsumo[i];
        }
    }
    return null;
}

function estadoLote(lote, hoy) {
    if (Number(lote.cantidad) <= 0) {
        return { texto: 'Agotado', clase: 'peligro', usable: false };
    }
    if (lote.fechaCaducidad && lote.fechaCaducidad < hoy) {
        return { texto: 'Caducado', clase: 'peligro', usable: false };
    }
    if (lote.fechaCaducidad && Validacion.diasEntre(hoy, lote.fechaCaducidad) <= 30) {
        return { texto: 'Caduca en ' + Validacion.diasEntre(hoy, lote.fechaCaducidad) + ' día(s)', clase: 'alerta', usable: true };
    }
    return { texto: 'Disponible', clase: 'listo', usable: true };
}

function nombreProveedor(lote) {
    var insumo = insumosPorId[lote.idInsumo];
    return insumo && proveedoresPorId[insumo.idProveedor] ? proveedoresPorId[insumo.idProveedor] : '';
}

function dibujarLotes() {
    var cuerpo = document.getElementById('lista-lotes');
    cuerpo.innerHTML = '';
    var hoy = Validacion.hoy();
    lotesInsumo.forEach(function (lote) {
        var estado = estadoLote(lote, hoy);
        var fila = document.createElement('tr');
        celda(fila, '#' + lote.idInventario);
        celda(fila, lote.nombreInsumo);
        celda(fila, lote.tipoAbono ? (lote.tipoAbono === 'organico' ? 'Orgánico' : 'Inorgánico') : '');
        celda(fila, nombreProveedor(lote));
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
    });
    if (!lotesInsumo.length) {
        filaSinDatos(cuerpo, 8, 'No hay lotes de ' + nombreCategoria + ' en inventario. Los da de alta el administrador.');
    }

    var anterior = selectLoteAp.value;
    selectLoteAp.innerHTML = '<option value="">Selecciona un lote</option>';
    lotesInsumo.filter(function (l) { return estadoLote(l, hoy).usable; }).forEach(function (lote) {
        var opcion = document.createElement('option');
        opcion.value = lote.idInventario;
        opcion.textContent = '#' + lote.idInventario + ' · ' + lote.nombreInsumo + ' · ' + cantidadTexto(lote.cantidad, lote.unidadMedida);
        selectLoteAp.appendChild(opcion);
    });
    selectLoteAp.value = loteInsumo(anterior) ? anterior : '';
    mostrarDisponible();
}

function dibujarAplicaciones() {
    var cuerpo = document.getElementById('lista-aplicaciones');
    cuerpo.innerHTML = '';
    var visibles = aplicaciones.slice(0, 15);
    visibles.forEach(function (m) {
        var lote = loteInsumo(m.idInventario);
        var fila = document.createElement('tr');
        celda(fila, String(m.fechaMovimiento || '').replace('T', ' ').slice(0, 16));
        celda(fila, lote ? lote.nombreInsumo : 'Lote #' + m.idInventario);
        celda(fila, cantidadTexto(m.cantidad, lote && lote.unidadMedida));
        celda(fila, m.observacion);
        cuerpo.appendChild(fila);
    });
    if (!visibles.length) {
        filaSinDatos(cuerpo, 4, 'Todavía no hay aplicaciones de ' + nombreCategoria + '.');
    }
}

function mostrarDisponible() {
    var lote = loteInsumo(selectLoteAp.value);
    document.getElementById('ap-disponible').textContent = lote
        ? 'Disponible: ' + cantidadTexto(lote.cantidad, lote.unidadMedida) + (lote.fechaCaducidad ? ' · caduca ' + lote.fechaCaducidad : '')
        : '';
}

function cargarInsumos() {
    mensajeInsumos.textContent = 'Cargando…';
    return Promise.all([
        pedirApi('/inventario/categoria/' + categoriaInsumo),
        pedirApi('/insumos?categoria=' + categoriaInsumo),
        pedirApi('/proveedores'),
        pedirApi('/movimientos-inventario'),
        Campo.cargar()
    ]).then(function (r) {
        lotesInsumo = r[0] || [];
        insumosPorId = {};
        (r[1] || []).forEach(function (i) { insumosPorId[i.idInsumo] = i; });
        proveedoresPorId = {};
        (r[2] || []).forEach(function (p) { proveedoresPorId[p.idProveedor] = p.nombreEmpresa; });
        var ids = {};
        lotesInsumo.forEach(function (l) { ids[l.idInventario] = true; });
        aplicaciones = (r[3] || []).filter(function (m) {
            return ids[m.idInventario] && m.tipoMovimiento === 'salida';
        });
        Campo.llenarSelectCultivos(selectCultivoAp);
        dibujarLotes();
        dibujarAplicaciones();
        mensajeInsumos.textContent = '';
    }).catch(function (error) {
        mensajeInsumos.textContent = textoErrorApi(error);
    });
}

formAplicacion.addEventListener('submit', function (evento) {
    evento.preventDefault();
    mensajeAp.textContent = '';
    if (!usuarioAplicacion) {
        mensajeAp.textContent = 'Inicia sesión para registrar aplicaciones.';
        return;
    }
    var lote = loteInsumo(selectLoteAp.value);
    var cultivo = Campo.cultivoPorId(selectCultivoAp.value);
    var fecha = campoFechaAp.value;
    var error = Validacion.primerError([
        [selectLoteAp, lote ? '' : 'Selecciona un lote con existencias.'],
        [selectCultivoAp, cultivo ? '' : 'Selecciona el cultivo donde se aplicó.'],
        [campoCantidadAp, Validacion.numero(campoCantidadAp.value, {
            nombre: 'la cantidad aplicada', maximo: lote ? Number(lote.cantidad) : undefined, unidad: lote && lote.unidadMedida
        })],
        [campoFechaAp, Validacion.fecha(fecha, { nombre: 'la fecha de aplicación', noFutura: true })
            || (lote && lote.fechaCaducidad && fecha > lote.fechaCaducidad ? 'El lote caducó el ' + lote.fechaCaducidad + '; elige otro lote.' : '')],
        [campoNotasAp, Validacion.texto(campoNotasAp.value, { nombre: 'las notas', maximo: 120, obligatorio: false })]
    ]);
    if (error) {
        mensajeAp.textContent = error;
        return;
    }
    var detalle = 'Aplicación en ' + Campo.nombreCultivo(cultivo) + ' el ' + fecha
        + (campoNotasAp.value.trim() ? '. ' + campoNotasAp.value.trim() : '');
    var boton = document.getElementById('guardar-aplicacion');
    boton.disabled = true;
    pedirApi('/movimientos-inventario', 'POST', {
        idInventario: lote.idInventario,
        idUsuario: usuarioAplicacion.idUsuario,
        tipoMovimiento: 'salida',
        cantidad: Number(campoCantidadAp.value),
        observacion: detalle.slice(0, 255)
    }).then(function () {
        formAplicacion.reset();
        campoFechaAp.value = Validacion.hoy();
        return cargarInsumos();
    }).then(function () {
        mensajeInsumos.textContent = 'Aplicación registrada: se descontó del lote en inventario.';
        mensajeInsumos.className = 'mensaje ok';
    }).catch(function (fallo) {
        mensajeAp.textContent = textoErrorApi(fallo);
    }).finally(function () {
        boton.disabled = false;
    });
});

selectLoteAp.addEventListener('change', mostrarDisponible);
document.getElementById('actualizar').onclick = cargarInsumos;
campoFechaAp.value = Validacion.hoy();
campoFechaAp.max = Validacion.hoy();
cargarInsumos();
