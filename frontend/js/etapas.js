/*
 * ARCHIVO: js/etapas.js
 * CAPA: FRONTEND (DOM). Programación de etapas del calendario (empleado/etapas.html).
 * BACKEND (Fetch con pedirApi): GET /cultivos, /terrenos, /parcelas/terreno/{id}, /etapas-cultivo?idCultivo=;
 *   POST /etapas-cultivo (una etapa o cada etapa del calendario sugerido, en orden).
 * VALIDACIÓN: CalendarioLogica.validarProgramacion (mismo orden de fechas que el backend) y Validacion.fecha.
 * DEPENDE DE: api.js, sesion.js, validacion.js, datos-campo.js, calendario-logica.js
 */

var parametrosEtapas = new URLSearchParams(window.location.search);
var selectCultivoEtapa = document.getElementById('cultivo');
var selectEtapa = document.getElementById('etapa');
var campoFechaEtapa = document.getElementById('fecha-inicio');
var campoNotasEtapa = document.getElementById('notas');
var mensajeEtapas = document.getElementById('mensaje-etapa');
var mensajeFormEtapa = document.getElementById('mensaje-formulario-etapa');
var mensajeSugerido = document.getElementById('mensaje-sugerido');
var campoFechaBase = document.getElementById('fecha-base');
var etapasCultivoElegido = [];

function avisarEtapas(texto, tipo) {
    mensajeEtapas.textContent = texto;
    mensajeEtapas.className = 'mensaje' + (tipo ? ' ' + tipo : '');
}

function cultivoElegido() {
    return Campo.cultivoPorId(selectCultivoEtapa.value);
}

function diasSugeridosDelFormulario() {
    var dias = {};
    CalendarioLogica.ETAPAS.forEach(function (etapa, i) {
        dias[etapa] = Number(document.getElementById('dias-' + i).value);
    });
    return dias;
}

function dibujarProgramadas() {
    var cuerpo = document.getElementById('etapas-programadas');
    cuerpo.innerHTML = '';
    var ordenadas = etapasCultivoElegido.slice().sort(function (a, b) {
        return CalendarioLogica.indiceEtapa(a.etapa) - CalendarioLogica.indiceEtapa(b.etapa);
    });
    ordenadas.forEach(function (e) {
        var fila = document.createElement('tr');
        celda(fila, e.etapa);
        celda(fila, e.fechaProgramada);
        celda(fila, e.estado === 'completada' ? 'Completada el ' + e.fechaReal : 'Pendiente');
        celda(fila, e.notas);
        cuerpo.appendChild(fila);
    });
    if (!ordenadas.length) {
        filaSinDatos(cuerpo, 4, cultivoElegido() ? 'Este cultivo no tiene etapas programadas.' : 'Selecciona un cultivo.');
    }
}

/*
 * Fecha base sugerida para que el calendario sugerido coincida con lo que ya existe:
 *  1) si el cultivo ya tiene etapas, se ancla en la primera (fecha real o programada);
 *  2) si no, que la Siembra caiga en la fecha de siembra registrada del cultivo;
 *  3) si no hay nada, hoy.
 */
function proponerFechaBase() {
    var cultivo = cultivoElegido();
    var dias = diasSugeridosDelFormulario();
    var ancla = etapasCultivoElegido.slice().sort(function (a, b) {
        return CalendarioLogica.indiceEtapa(a.etapa) - CalendarioLogica.indiceEtapa(b.etapa);
    })[0];
    if (ancla) {
        var etapa = CalendarioLogica.ETAPAS[CalendarioLogica.indiceEtapa(ancla.etapa)];
        campoFechaBase.value = CalendarioLogica.sumarDias(ancla.fechaReal || ancla.fechaProgramada, -(dias[etapa] || 0));
    } else if (cultivo && cultivo.fechaSiembra) {
        campoFechaBase.value = CalendarioLogica.sumarDias(cultivo.fechaSiembra, -(dias['Siembra'] || 0));
    } else if (!campoFechaBase.value) {
        campoFechaBase.value = Validacion.hoy();
    }
}

function dibujarSugerido() {
    var cuerpo = document.getElementById('vista-sugerida');
    cuerpo.innerHTML = '';
    mensajeSugerido.textContent = '';
    if (!cultivoElegido() || !Validacion.fechaExiste(campoFechaBase.value)) {
        filaSinDatos(cuerpo, 2, 'Selecciona un cultivo y una fecha base.');
        return null;
    }
    var sugerido = CalendarioLogica.sugerirCalendario(campoFechaBase.value, diasSugeridosDelFormulario(), etapasCultivoElegido);
    if (sugerido.error) {
        mensajeSugerido.textContent = sugerido.error;
        return null;
    }
    sugerido.etapas.forEach(function (e) {
        var fila = document.createElement('tr');
        celda(fila, e.etapa);
        celda(fila, e.fechaProgramada);
        cuerpo.appendChild(fila);
    });
    if (!sugerido.etapas.length) {
        filaSinDatos(cuerpo, 2, 'Todas las etapas de este cultivo ya están programadas.');
    }
    return sugerido.etapas;
}

function cargarEtapasDelCultivo() {
    var cultivo = cultivoElegido();
    etapasCultivoElegido = [];
    if (!cultivo) {
        dibujarProgramadas();
        dibujarSugerido();
        return Promise.resolve();
    }
    return pedirApi('/etapas-cultivo?idCultivo=' + encodeURIComponent(cultivo.id)).then(function (lista) {
        etapasCultivoElegido = lista || [];
        document.getElementById('etapa-actual').textContent = 'Etapa actual del cultivo: '
            + (cultivo.etapaFenologica || 'sin registrar')
            + (cultivo.fechaSiembra ? ' · Siembra registrada: ' + cultivo.fechaSiembra : '');
        dibujarProgramadas();
        proponerFechaBase();
        dibujarSugerido();
    }).catch(function (error) {
        avisarEtapas(textoErrorApi(error), 'error');
    });
}

function enviarEtapa(datos) {
    return pedirApi('/etapas-cultivo', 'POST', datos).then(function (creada) {
        etapasCultivoElegido.push(creada);
        return creada;
    });
}

document.getElementById('formulario-etapa').addEventListener('submit', function (evento) {
    evento.preventDefault();
    mensajeFormEtapa.textContent = '';
    var cultivo = cultivoElegido();
    var datos = {
        idCultivo: cultivo ? cultivo.id : null,
        etapa: selectEtapa.value,
        fechaProgramada: campoFechaEtapa.value,
        notas: campoNotasEtapa.value.trim() || null
    };
    var error = Validacion.primerError([
        [selectCultivoEtapa, cultivo ? '' : 'Selecciona un cultivo.'],
        [selectEtapa, Validacion.opcion(selectEtapa.value, CalendarioLogica.ETAPAS, 'la etapa')],
        [campoFechaEtapa, Validacion.fecha(campoFechaEtapa.value, { nombre: 'la fecha programada' })
            || CalendarioLogica.validarProgramacion(datos, etapasCultivoElegido, cultivo)],
        [campoNotasEtapa, Validacion.texto(campoNotasEtapa.value, { nombre: 'las notas', maximo: 500, obligatorio: false })]
    ]);
    if (error) {
        mensajeFormEtapa.textContent = error;
        return;
    }
    var boton = document.getElementById('guardar-etapa');
    boton.disabled = true;
    enviarEtapa(datos).then(function () {
        window.location.href = 'calendario.html?cultivo=' + encodeURIComponent(datos.idCultivo) + '&fecha=' + datos.fechaProgramada;
    }).catch(function (fallo) {
        mensajeFormEtapa.textContent = textoErrorApi(fallo);
        boton.disabled = false;
    });
});

document.getElementById('programar-sugerido').addEventListener('click', function () {
    var cultivo = cultivoElegido();
    var etapas = dibujarSugerido();
    if (!cultivo) {
        mensajeSugerido.textContent = 'Selecciona un cultivo.';
        return;
    }
    if (!etapas || !etapas.length) {
        return;
    }
    for (var i = 0; i < etapas.length; i++) {
        var prueba = { idCultivo: cultivo.id, etapa: etapas[i].etapa, fechaProgramada: etapas[i].fechaProgramada };
        var error = CalendarioLogica.validarProgramacion(prueba, etapasCultivoElegido.concat(etapas.slice(0, i)), cultivo);
        if (error) {
            mensajeSugerido.textContent = error + ' Ajusta la fecha base o los días.';
            return;
        }
    }
    var boton = this;
    boton.disabled = true;
    var creadas = 0;
    // Se envían en orden para que el backend valide cada una contra las anteriores.
    etapas.reduce(function (cadena, e) {
        return cadena.then(function () {
            return enviarEtapa({ idCultivo: cultivo.id, etapa: e.etapa, fechaProgramada: e.fechaProgramada, notas: null })
                .then(function () { creadas++; });
        });
    }, Promise.resolve()).then(function () {
        window.location.href = 'calendario.html?cultivo=' + encodeURIComponent(cultivo.id) + '&fecha=' + etapas[0].fechaProgramada;
    }).catch(function (fallo) {
        mensajeSugerido.textContent = 'Se programaron ' + creadas + ' etapa(s). ' + textoErrorApi(fallo);
        boton.disabled = false;
        dibujarProgramadas();
    });
});

selectCultivoEtapa.addEventListener('change', cargarEtapasDelCultivo);
campoFechaBase.addEventListener('change', dibujarSugerido);
CalendarioLogica.ETAPAS.forEach(function (etapa, i) {
    var campo = document.getElementById('dias-' + i);
    campo.value = CalendarioLogica.DIAS_SUGERIDOS[etapa];
    campo.addEventListener('input', function () {
        proponerFechaBase();
        dibujarSugerido();
    });
});

avisarEtapas('Cargando cultivos…');
Campo.cargar().then(function () {
    var cantidad = Campo.llenarSelectCultivos(selectCultivoEtapa);
    var pedido = parametrosEtapas.get('cultivo');
    if (pedido && Campo.cultivoPorId(pedido)) {
        selectCultivoEtapa.value = pedido;
    }
    avisarEtapas(cantidad ? '' : 'No hay cultivos activos. Los da de alta el administrador.');
    return cargarEtapasDelCultivo();
}).catch(function (error) {
    avisarEtapas(textoErrorApi(error), 'error');
});
