/* Datos: reúne los registros de campo y prepara los formularios de observaciones, incidencias y seguimientos. No recibe atributos. */

const usuarioBitacora = usuarioActual();
const mensajeBitacora = document.getElementById('mensaje');
const filtroCultivoBitacora = document.getElementById('filtro-cultivo');
const filtroTipoBitacora = document.getElementById('filtro-tipo');
const registrosBitacora = { observaciones: [], incidencias: [], seguimientos: [], riegos: [], cosechas: [], etapas: [] };
let nombresBitacora = {};
const ESTADOS_INCIDENCIA = { abierta: 'Abierta', en_seguimiento: 'En seguimiento', erradicada: 'Erradicada' };
const botonesPestana = document.querySelectorAll('#pestanas-bitacora button');

/* Datos: consulta todos los tipos de registros y actualiza la lista y los filtros. No recibe atributos. */
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

/* Datos: guarda un registro de bitácora y actualiza la tabla. Recibe ruta, datos, botón, mensaje, formulario y aviso de éxito. */
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

/* Datos: valida y envía una observación. Recibe el evento del formulario. */
function registrarObservacion(evento) {
    evento.preventDefault();
    const mensaje = document.getElementById('mensaje-observacion');
    mensaje.textContent = '';
    if (sinSesion(mensaje)) {
        return;
    }
    const select = document.getElementById('obs-cultivo');
    const fecha = document.getElementById('obs-fecha');
    const descripcion = document.getElementById('obs-descripcion');
    const cultivo = Campo.cultivoPorId(select.value);
    const error = Validacion.primerError([
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
}

/* Datos: valida y envía una plaga o enfermedad. Recibe el evento del formulario. */
function registrarIncidencia(evento) {
    evento.preventDefault();
    const mensaje = document.getElementById('mensaje-incidencia');
    mensaje.textContent = '';
    if (sinSesion(mensaje)) {
        return;
    }
    const select = document.getElementById('inc-cultivo');
    const fecha = document.getElementById('inc-fecha');
    const tipo = document.getElementById('inc-tipo');
    const gravedad = document.getElementById('inc-gravedad');
    const descripcion = document.getElementById('inc-descripcion');
    const cultivo = Campo.cultivoPorId(select.value);
    const error = Validacion.primerError([
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
}

/* Datos: valida y envía el seguimiento de una incidencia. Recibe el evento del formulario. */
function registrarSeguimiento(evento) {
    evento.preventDefault();
    const mensaje = document.getElementById('mensaje-seguimiento');
    mensaje.textContent = '';
    if (sinSesion(mensaje)) {
        return;
    }
    const select = document.getElementById('seg-incidencia');
    const fecha = document.getElementById('seg-fecha');
    const accion = document.getElementById('seg-accion');
    const observacion = document.getElementById('seg-observacion');
    const estado = document.getElementById('seg-estado');
    const incidencia = incidenciaPorId(select.value);
    const error = Validacion.primerError([
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
}

/* Datos: muestra un aviso de estado. Recibe el texto y el tipo. */
function avisarBitacora(texto, tipo) {
    mensajeBitacora.textContent = texto;
    mensajeBitacora.className = 'mensaje' + (tipo ? ' ' + tipo : '');
}

/* Datos: obtiene la fecha de siembra para validar la fecha del registro. Recibe el cultivo. */
function fechaMinima(cultivo) {
    return cultivo && cultivo.fechaSiembra ? cultivo.fechaSiembra : null;
}

/* Datos: busca el nombre del usuario que hizo un registro. Recibe el ID del usuario. */
function quien(idUsuario) {
    return nombresBitacora[idUsuario] || (idUsuario ? 'Usuario #' + idUsuario : '');
}

/* Datos: busca una incidencia en la lista cargada. Recibe el ID de la incidencia. */
function incidenciaPorId(id) {
    return registrosBitacora.incidencias.find(function (incidencia) {
        return String(incidencia.idIncidencia) === String(id);
    }) || null;
}

/* Datos: comprueba si hay una sesión activa. Recibe el elemento para mostrar el aviso. */
function sinSesion(mensaje) {
    if (!usuarioBitacora) {
        mensaje.textContent = 'Inicia sesión para registrar en la bitácora.';
        return true;
    }
    return false;
}

/* Datos: rellena el selector con incidencias pendientes. No recibe atributos. */
function llenarIncidenciasAbiertas() {
    const select = document.getElementById('seg-incidencia');
    const anterior = select.value;
    select.innerHTML = '';
    const abiertas = registrosBitacora.incidencias.filter(function (i) { return i.estado !== 'erradicada'; });
    const inicial = document.createElement('option');
    inicial.value = '';
    inicial.textContent = abiertas.length ? 'Selecciona una incidencia' : 'No hay incidencias abiertas';
    select.appendChild(inicial);
    abiertas.forEach(function (i) {
        const opcion = document.createElement('option');
        opcion.value = i.idIncidencia;
        opcion.textContent = '#' + i.idIncidencia + ' · ' + (i.tipoIncidencia === 'plaga' ? 'Plaga' : 'Enfermedad')
            + ' (' + i.nivelGravedad + ') · ' + Campo.nombreCultivo(i.idCultivo) + ' · ' + i.fechaIncidencia;
        select.appendChild(opcion);
    });
    select.value = incidenciaPorId(anterior) && incidenciaPorId(anterior).estado !== 'erradicada' ? anterior : '';
}

/* Datos: ordena y combina las entradas por fecha. No recibe atributos. */
function entradasBitacora() {
    const r = registrosBitacora;
    const lista = [];
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
        const incidencia = incidenciaPorId(s.idIncidencia);
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

/* Datos: muestra los registros que coinciden con el cultivo y el tipo seleccionados. No recibe atributos. */
function dibujarBitacora() {
    const cuerpo = document.getElementById('lista-bitacora');
    cuerpo.innerHTML = '';
    const visibles = entradasBitacora().filter(function (e) {
        return (!filtroCultivoBitacora.value || String(e.idCultivo) === filtroCultivoBitacora.value)
            && (!filtroTipoBitacora.value || e.tipo === filtroTipoBitacora.value);
    });
    visibles.slice(0, 200).forEach(function (e) {
        const fila = document.createElement('tr');
        celda(fila, e.fecha);
        celda(fila, e.etiqueta);
        celda(fila, e.idCultivo ? Campo.nombreCultivo(e.idCultivo) : '');
        celda(fila, e.detalle);
        celda(fila, quien(e.usuario));
        const td = celda(fila, '');
        if (e.estado) {
            td.textContent = '';
            const insignia = document.createElement('span');
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

/* Datos: conecta los controles de la página y ejecuta la carga inicial. No recibe atributos. */
function iniciarBitacora() {
    botonesPestana.forEach(function (boton) {
        boton.addEventListener('click', function () {
            botonesPestana.forEach(function (otro) {
                const activo = otro === boton;
                otro.setAttribute('aria-pressed', activo ? 'true' : 'false');
                document.getElementById(otro.dataset.panel).hidden = !activo;
            });
        });
    });

    document.getElementById('formulario-observacion').addEventListener('submit', registrarObservacion);
    document.getElementById('formulario-incidencia').addEventListener('submit', registrarIncidencia);
    document.getElementById('formulario-seguimiento').addEventListener('submit', registrarSeguimiento);

    filtroCultivoBitacora.addEventListener('change', dibujarBitacora);
    filtroTipoBitacora.addEventListener('change', dibujarBitacora);
    document.getElementById('actualizar').onclick = cargarBitacora;
    document.querySelectorAll('#formularios-bitacora input[type="date"]').forEach(function (campo) {
        campo.value = Validacion.hoy();
        campo.max = Validacion.hoy();
    });
    cargarBitacora();
}

iniciarBitacora();
