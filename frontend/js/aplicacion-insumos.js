/**
 * @file Consulta lotes de abono o fertilizante y registra su aplicación como salida de inventario.
 *
 * @author Equipo de Gestión de Cultivos
 */

const panelAplicacion = document.getElementById('aplicacion');
const categoriaInsumo = panelAplicacion.dataset.categoria;
const nombreCategoria = panelAplicacion.dataset.nombre;
const usuarioAplicacion = usuarioActual();
const formAplicacion = document.getElementById('formulario-aplicacion');
const selectLoteAp = document.getElementById('ap-lote');
const selectCultivoAp = document.getElementById('ap-cultivo');
const campoCantidadAp = document.getElementById('ap-cantidad');
const campoFechaAp = document.getElementById('ap-fecha');
const campoNotasAp = document.getElementById('ap-notas');
const mensajeAp = document.getElementById('mensaje-aplicacion');
const mensajeInsumos = document.getElementById('mensaje');
let lotesInsumo = [];
let insumosPorId = {};
let proveedoresPorId = {};
let aplicaciones = [];

/**
 * Consulta lotes, insumos, proveedores, movimientos y cultivos desde la API.
 */
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
        const ids = {};
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

/**
 * Muestra los lotes y llena el selector de lotes disponibles.
 */
function dibujarLotes() {
    const cuerpo = document.getElementById('lista-lotes');
    cuerpo.innerHTML = '';
    const hoy = Validacion.hoy();
    lotesInsumo.forEach(function (lote) {
        const estado = estadoLote(lote, hoy);
        const fila = document.createElement('tr');
        celda(fila, '#' + lote.idInventario);
        celda(fila, lote.nombreInsumo);
        celda(fila, lote.tipoAbono ? (lote.tipoAbono === 'organico' ? 'Orgánico' : 'Inorgánico') : '');
        celda(fila, nombreProveedor(lote));
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
    });
    if (!lotesInsumo.length) {
        filaSinDatos(cuerpo, 8, 'No hay lotes de ' + nombreCategoria + ' en inventario. Los da de alta el administrador.');
    }

    const anterior = selectLoteAp.value;
    selectLoteAp.innerHTML = '<option value="">Selecciona un lote</option>';
    lotesInsumo.filter(function (l) { return estadoLote(l, hoy).usable; }).forEach(function (lote) {
        const opcion = document.createElement('option');
        opcion.value = lote.idInventario;
        opcion.textContent = '#' + lote.idInventario + ' · ' + lote.nombreInsumo + ' · ' + cantidadTexto(lote.cantidad, lote.unidadMedida);
        selectLoteAp.appendChild(opcion);
    });
    selectLoteAp.value = loteInsumo(anterior) ? anterior : '';
    mostrarDisponible();
}

/**
 * Muestra las últimas salidas de los lotes de la categoría.
 */
function dibujarAplicaciones() {
    const cuerpo = document.getElementById('lista-aplicaciones');
    cuerpo.innerHTML = '';
    const visibles = aplicaciones.slice(0, 15);
    visibles.forEach(function (m) {
        const lote = loteInsumo(m.idInventario);
        const fila = document.createElement('tr');
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

/**
 * Busca un lote de insumo en el inventario consultado.
 *
 * @param id - El ID del lote.
 */
function loteInsumo(id) {
    return lotesInsumo.find(lote => String(lote.idInventario) === String(id)) || null;
}

/**
 * Indica si un lote está disponible, agotado o caducado.
 *
 * @param lote - Lote de inventario que se está consultando.
 * @param hoy - Fecha actual en formato AAAA-MM-DD.
 */
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

/**
 * Obtiene el proveedor del insumo.
 *
 * @param lote - El lote de inventario.
 */
function nombreProveedor(lote) {
    const insumo = insumosPorId[lote.idInsumo];
    return insumo && proveedoresPorId[insumo.idProveedor] ? proveedoresPorId[insumo.idProveedor] : '';
}

/**
 * Muestra cuánto queda del lote seleccionado.
 */
function mostrarDisponible() {
    const lote = loteInsumo(selectLoteAp.value);
    document.getElementById('ap-disponible').textContent = lote
        ? 'Disponible: ' + cantidadTexto(lote.cantidad, lote.unidadMedida) + (lote.fechaCaducidad ? ' · caduca ' + lote.fechaCaducidad : '')
        : '';
}

/**
 * Valida el formulario y registra una salida de inventario.
 *
 * @param evento - El evento del formulario.
 */
function guardarAplicacion(evento) {
    evento.preventDefault();
    mensajeAp.textContent = '';
    if (!usuarioAplicacion) {
        mensajeAp.textContent = 'Inicia sesión para registrar aplicaciones.';
        return;
    }
    const lote = loteInsumo(selectLoteAp.value);
    const cultivo = Campo.cultivoPorId(selectCultivoAp.value);
    const fecha = campoFechaAp.value;
    const error = Validacion.primerError([
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
    const detalle = 'Aplicación en ' + Campo.nombreCultivo(cultivo) + ' el ' + fecha
        + (campoNotasAp.value.trim() ? '. ' + campoNotasAp.value.trim() : '');
    const boton = document.getElementById('guardar-aplicacion');
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
}

/**
 * Conecta los eventos de esta pantalla y carga los datos.
 */
function iniciarAplicacionInsumos() {
    formAplicacion.addEventListener('submit', guardarAplicacion);
    selectLoteAp.addEventListener('change', mostrarDisponible);
    document.getElementById('actualizar').onclick = cargarInsumos;
    campoFechaAp.value = Validacion.hoy();
    campoFechaAp.max = Validacion.hoy();
    cargarInsumos();
}

iniciarAplicacionInsumos();
