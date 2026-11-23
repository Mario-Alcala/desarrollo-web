/*
 * ARCHIVO: js/bitacora.js
 * CAPA: FRONTEND (DOM). Observaciones y bitácora del trabajador (empleado/observaciones.html).
 * BACKEND (Fetch con pedirApi):
 *   POST /observaciones-cultivos, POST /incidencias-cultivo, POST /seguimientos-incidencia
 *   GET  /observaciones-cultivos, /incidencias-cultivo, /seguimientos-incidencia, /riegos, /cosechas,
 *        /etapas-cultivo, /usuarios, /cultivos (+ parcelas)
 * DESCRIPCIÓN DEL PROYECTO: "La pantalla de bitácora reúne observaciones, incidencias, seguimientos, riegos y
 *   cosechas. Cada dato se guarda en su propia tabla para no duplicarlo." Aquí solo se juntan para mostrarlos.
 * SESIÓN: quien registra sale de usuarioActual(); ya no hay selector de trabajador.
 * DEPENDE DE: api.js, sesion.js, validacion.js, datos-campo.js
 */

var usuarioBitacora = usuarioActual();
var mensajeBitacora = document.getElementById('mensaje');
var filtroCultivoBitacora = document.getElementById('filtro-cultivo');
var filtroTipoBitacora = document.getElementById('filtro-tipo');
var registrosBitacora = { observaciones: [], incidencias: [], seguimientos: [], riegos: [], cosechas: [], etapas: [] };
var nombresBitacora = {};
var ESTADOS_INCIDENCIA = { abierta: 'Abierta', en_seguimiento: 'En seguimiento', erradicada: 'Erradicada' };

/* ---------- Pestañas de los formularios ---------- */
var botonesPestana = document.querySelectorAll('#pestanas-bitacora button');
botonesPestana.forEach(function (boton) {
    boton.addEventListener('click', function () {
        botonesPestana.forEach(function (otro) {
            var activo = otro === boton;
            otro.setAttribute('aria-pressed', activo ? 'true' : 'false');
            document.getElementById(otro.dataset.panel).hidden = !activo;
        });
    });
});

function avisarBitacora(texto, tipo) {
    mensajeBitacora.textContent = texto;
    mensajeBitacora.className = 'mensaje' + (tipo ? ' ' + tipo : '');
}

function fechaMinima(cultivo) {
    return cultivo && cultivo.fechaSiembra ? cultivo.fechaSiembra : null;
}

function quien(idUsuario) {
    return nombresBitacora[idUsuario] || (idUsuario ? 'Usuario #' + idUsuario : '');
}

function incidenciaPorId(id) {
    for (var i = 0; i < registrosBitacora.incidencias.length; i++) {
        if (String(registrosBitacora.incidencias[i].idIncidencia) === String(id)) {
            return registrosBitacora.incidencias[i];
        }
    }
    return null;
}

function enviar(ruta, datos, boton, mensaje, formulario, textoOk) {
    boton.disabled = true;
    return pedirApi(ruta, 'POST', datos).then(function () {
        formulario.reset();
        formulario.querySelectorAll('input[type="date"]').forEach(function (c) { c.value = Validacion.hoy(); });
        return cargarBitacora();
    }).then(function () {
        avisarBitacora(textoOk, 'ok');
    }).catch(function (fallo) {
        mensaje.textContent = textoErrorApi(fallo);
    }).finally(function () {
        boton.disabled = false;
    });
}

function sinSesion(mensaje) {
    if (!usuarioBitacora) {
        mensaje.textContent = 'Inicia sesión para registrar en la bitácora.';
        return true;
    }
    return false;
}

/* ---------- Observación ---------- */
document.getElementById('formulario-observacion').addEventListener('submit', function (evento) {
    evento.preventDefault();
    var mensaje = document.getElementById('mensaje-observacion');
    mensaje.textContent = '';
    if (sinSesion(mensaje)) {
        return;
    }
    var select = document.getElementById('obs-cultivo');
    var fecha = document.getElementById('obs-fecha');
    var descripcion = document.getElementById('obs-descripcion');
    var cultivo = Campo.cultivoPorId(select.value);
    var error = Validacion.primerError([
        [select, cultivo ? '' : 'Selecciona un cultivo.'],
        [fecha, Validacion.fecha(fecha.value, { nombre: 'la fecha', noFutura: true, minima: fechaMinima(cultivo), nombreMinima: 'la siembra' })],
        [descripcion, Validacion.texto(descripcion.value, { nombre: 'la observación', maximo: 2000 })]
    ]);
    if (error) {
        mensaje.textContent = error;
        return;
    }
    enviar('/observaciones-cultivos', {
        idCultivo: cultivo.id,
        idUsuario: usuarioBitacora.idUsuario,
        fechaObservacion: fecha.value,
        descripcion: descripcion.value.trim()
    }, document.getElementById('guardar-observacion'), mensaje, this, 'Observación registrada.');
});

/* ---------- Plaga o enfermedad ---------- */
document.getElementById('formulario-incidencia').addEventListener('submit', function (evento) {
    evento.preventDefault();
    var mensaje = document.getElementById('mensaje-incidencia');
    mensaje.textContent = '';
    if (sinSesion(mensaje)) {
        return;
    }
    var select = document.getElementById('inc-cultivo');
    var fecha = document.getElementById('inc-fecha');
    var tipo = document.getElementById('inc-tipo');
    var gravedad = document.getElementById('inc-gravedad');
    var descripcion = document.getElementById('inc-descripcion');
    var cultivo = Campo.cultivoPorId(select.value);
    var error = Validacion.primerError([
        [select, cultivo ? '' : 'Selecciona un cultivo.'],
        [fecha, Validacion.fecha(fecha.value, { nombre: 'la fecha', noFutura: true, minima: fechaMinima(cultivo), nombreMinima: 'la siembra' })],
        [tipo, Validacion.opcion(tipo.value, ['plaga', 'enfermedad'], 'si es plaga o enfermedad')],
        [gravedad, Validacion.opcion(gravedad.value, ['bajo', 'medio', 'alto'], 'la gravedad')],
        [descripcion, Validacion.texto(descripcion.value, { nombre: 'la descripción', maximo: 2000 })]
    ]);
    if (error) {
        mensaje.textContent = error;
        return;
    }
    enviar('/incidencias-cultivo', {
        idCultivo: cultivo.id,
        idUsuario: usuarioBitacora.idUsuario,
        fechaIncidencia: fecha.value,
        tipoIncidencia: tipo.value,
        nivelGravedad: gravedad.value,
        descripcion: descripcion.value.trim(),
        estado: 'abierta'
    }, document.getElementById('guardar-incidencia'), mensaje, this, 'Incidencia registrada como abierta.');
});

/* ---------- Seguimiento ---------- */
document.getElementById('formulario-seguimiento').addEventListener('submit', function (evento) {
    evento.preventDefault();
    var mensaje = document.getElementById('mensaje-seguimiento');
    mensaje.textContent = '';
    if (sinSesion(mensaje)) {
        return;
    }
    var select = document.getElementById('seg-incidencia');
    var fecha = document.getElementById('seg-fecha');
    var accion = document.getElementById('seg-accion');
    var observacion = document.getElementById('seg-observacion');
    var estado = document.getElementById('seg-estado');
    var incidencia = incidenciaPorId(select.value);
    var error = Validacion.primerError([
        [select, incidencia ? '' : 'Selecciona una incidencia abierta o en seguimiento.'],
        [fecha, Validacion.fecha(fecha.value, {
            nombre: 'la fecha', noFutura: true,
            minima: incidencia && incidencia.fechaIncidencia, nombreMinima: 'la fecha de la incidencia'
        })],
        [accion, Validacion.texto(accion.value, { nombre: 'la acción realizada', maximo: 2000 })],
        [observacion, Validacion.texto(observacion.value, { nombre: 'la observación', maximo: 2000, obligatorio: false })],
        [estado, Validacion.opcion(estado.value, ['', 'en_seguimiento', 'erradicada'], 'el estado')]
    ]);
    if (error) {
        mensaje.textContent = error;
        return;
    }
    enviar('/seguimientos-incidencia', {
        idIncidencia: incidencia.idIncidencia,
        idUsuario: usuarioBitacora.idUsuario,
        fecha: fecha.value,
        accionRealizada: accion.value.trim(),
        observacion: observacion.value.trim() || null,
        estadoIncidencia: estado.value || null
    }, document.getElementById('guardar-seguimiento'), mensaje, this,
    estado.value === 'erradicada' ? 'Seguimiento registrado. La incidencia quedó erradicada.' : 'Seguimiento registrado.');
});

function llenarIncidenciasAbiertas() {
    var select = document.getElementById('seg-incidencia');
    var anterior = select.value;
    select.innerHTML = '';
    var abiertas = registrosBitacora.incidencias.filter(function (i) { return i.estado !== 'erradicada'; });
    var inicial = document.createElement('option');
    inicial.value = '';
    inicial.textContent = abiertas.length ? 'Selecciona una incidencia' : 'No hay incidencias abiertas';
    select.appendChild(inicial);
    abiertas.forEach(function (i) {
        var opcion = document.createElement('option');
        opcion.value = i.idIncidencia;
        opcion.textContent = '#' + i.idIncidencia + ' · ' + (i.tipoIncidencia === 'plaga' ? 'Plaga' : 'Enfermedad')
            + ' (' + i.nivelGravedad + ') · ' + Campo.nombreCultivo(i.idCultivo) + ' · ' + i.fechaIncidencia;
        select.appendChild(opcion);
    });
    select.value = incidenciaPorId(anterior) && incidenciaPorId(anterior).estado !== 'erradicada' ? anterior : '';
}

/* ---------- Bitácora unificada ---------- */
function entradasBitacora() {
    var r = registrosBitacora;
    var lista = [];
    r.observaciones.forEach(function (o) {
        lista.push({ fecha: o.fechaObservacion, tipo: 'observacion', etiqueta: 'Observación', idCultivo: o.idCultivo,
            detalle: o.descripcion, usuario: o.idUsuario });
    });
    r.incidencias.forEach(function (i) {
        lista.push({ fecha: i.fechaIncidencia, tipo: 'incidencia', etiqueta: i.tipoIncidencia === 'plaga' ? 'Plaga' : 'Enfermedad',
            idCultivo: i.idCultivo, detalle: i.descripcion + ' (gravedad ' + i.nivelGravedad + ')', usuario: i.idUsuario,
            estado: ESTADOS_INCIDENCIA[i.estado] || i.estado, claseEstado: i.estado === 'erradicada' ? 'listo' : (i.estado === 'abierta' ? 'peligro' : 'alerta') });
    });
    r.seguimientos.forEach(function (s) {
        var incidencia = incidenciaPorId(s.idIncidencia);
        lista.push({ fecha: s.fecha, tipo: 'incidencia', etiqueta: 'Seguimiento #' + s.idIncidencia,
            idCultivo: incidencia ? incidencia.idCultivo : null,
            detalle: s.accionRealizada + (s.observacion ? ' — ' + s.observacion : ''), usuario: s.idUsuario });
    });
    r.riegos.forEach(function (g) {
        lista.push({ fecha: String(g.fechaRiego).slice(0, 10), tipo: 'riego', etiqueta: 'Riego', idCultivo: g.idCultivo,
            detalle: cantidadTexto(g.cantidadAgua, g.unidadMedida) + (g.metodo ? ' · ' + g.metodo : '') + (g.observaciones ? ' · ' + g.observaciones : ''),
            usuario: g.idUsuario });
    });
    r.cosechas.forEach(function (k) {
        lista.push({ fecha: k.fechaCosecha, tipo: 'cosecha', etiqueta: 'Cosecha', idCultivo: k.idCultivo,
            detalle: 'Lote #' + k.idCosecha + ': ' + cantidadTexto(k.cantidadCosechada, 'kg') + ' · ' + (k.estadoMaduracion || '') + (k.ubicacionBodega ? ' · ' + k.ubicacionBodega : ''),
            usuario: k.idUsuario });
    });
    r.etapas.filter(function (e) { return e.estado === 'completada'; }).forEach(function (e) {
        lista.push({ fecha: e.fechaReal, tipo: 'etapa', etiqueta: 'Etapa', idCultivo: e.idCultivo,
            detalle: e.etapa + ' completada' + (e.notas ? ' · ' + e.notas : ''), usuario: e.idUsuario });
    });
    return lista.sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
}

function dibujarBitacora() {
    var cuerpo = document.getElementById('lista-bitacora');
    cuerpo.innerHTML = '';
    var visibles = entradasBitacora().filter(function (e) {
        return (!filtroCultivoBitacora.value || String(e.idCultivo) === filtroCultivoBitacora.value)
            && (!filtroTipoBitacora.value || e.tipo === filtroTipoBitacora.value);
    });
    visibles.slice(0, 200).forEach(function (e) {
        var fila = document.createElement('tr');
        celda(fila, e.fecha);
        celda(fila, e.etiqueta);
        celda(fila, e.idCultivo ? Campo.nombreCultivo(e.idCultivo) : '');
        celda(fila, e.detalle);
        celda(fila, quien(e.usuario));
        var td = celda(fila, '');
        if (e.estado) {
            td.textContent = '';
            var insignia = document.createElement('span');
            insignia.className = 'insignia ' + e.claseEstado;
            insignia.textContent = e.estado;
            td.appendChild(insignia);
        }
        cuerpo.appendChild(fila);
    });
    if (!visibles.length) {
        filaSinDatos(cuerpo, 6, 'No hay registros para esta selección.');
    }
}

function cargarBitacora() {
    avisarBitacora('Cargando bitácora…');
    return Promise.all([
        Campo.cargar(),
        pedirApi('/observaciones-cultivos'),
        pedirApi('/incidencias-cultivo'),
        pedirApi('/seguimientos-incidencia'),
        pedirApi('/riegos'),
        pedirApi('/cosechas'),
        pedirApi('/etapas-cultivo'),
        Campo.cargarNombresUsuarios()
    ]).then(function (r) {
        registrosBitacora.observaciones = r[1] || [];
        registrosBitacora.incidencias = r[2] || [];
        registrosBitacora.seguimientos = r[3] || [];
        registrosBitacora.riegos = r[4] || [];
        registrosBitacora.cosechas = r[5] || [];
        registrosBitacora.etapas = r[6] || [];
        nombresBitacora = r[7];
        ['obs-cultivo', 'inc-cultivo'].forEach(function (id) {
            Campo.llenarSelectCultivos(document.getElementById(id));
        });
        Campo.llenarSelectCultivos(filtroCultivoBitacora, { todos: true, textoInicial: 'Todos los cultivos' });
        llenarIncidenciasAbiertas();
        dibujarBitacora();
        avisarBitacora('');
    }).catch(function (error) {
        avisarBitacora(textoErrorApi(error), 'error');
    });
}

filtroCultivoBitacora.addEventListener('change', dibujarBitacora);
filtroTipoBitacora.addEventListener('change', dibujarBitacora);
document.getElementById('actualizar').onclick = cargarBitacora;
document.querySelectorAll('#formularios-bitacora input[type="date"]').forEach(function (campo) {
    campo.value = Validacion.hoy();
    campo.max = Validacion.hoy();
});
cargarBitacora();
