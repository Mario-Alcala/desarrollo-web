/*
 * ARCHIVO: js/calendario.js
 * CAPA: FRONTEND (DOM). Calendario mensual del trabajador (empleado/calendario.html).
 * BACKEND (Fetch con pedirApi): GET /cultivos, /terrenos, /parcelas/terreno/{id}, /etapas-cultivo,
 *   /riegos, /cosechas; PUT /etapas-cultivo/{id}/completar; PUT /etapas-cultivo/{id}; DELETE /etapas-cultivo/{id}.
 * SINCRONIZACIÓN: al completar una etapa, el backend actualiza cultivos.etapa_fenologica, así que la etapa
 *   cambia también en "Cultivos activos" y en el detalle de parcela del administrador. Riegos, cosechas y la
 *   fecha de siembra se leen de sus propias tablas: lo que se registra en otras pantallas aparece aquí.
 * Antes los eventos vivían en localStorage con productos de ejemplo (js/datos.js); ya no se usa.
 * DEPENDE DE: api.js, sesion.js, validacion.js, datos-campo.js, calendario-logica.js
 */

var usuarioCalendario = usuarioActual();
var fuentesCalendario = { cultivos: [], etapas: [], riegos: [], cosechas: [] };
var parametrosCalendario = new URLSearchParams(window.location.search);
var fechaVista = new Date();
var diaElegido = '';
var filtroCultivo = document.getElementById('filtro-cultivo');
var mensajeEtapa = document.getElementById('mensaje-etapa');

var dialogoEtapa = document.getElementById('dialogo-etapa');
var formularioDialogo = document.getElementById('formulario-dialogo-etapa');
var campoDialogoFecha = document.getElementById('dialogo-fecha');
var campoDialogoNotas = document.getElementById('dialogo-notas');
var bloqueDialogoNotas = document.getElementById('bloque-dialogo-notas');
var mensajeDialogo = document.getElementById('mensaje-dialogo-etapa');
var accionDialogo = null; // { modo: 'completar' | 'reprogramar', etapa: {...} }

(function leerParametros() {
    var fecha = parametrosCalendario.get('fecha');
    if (fecha && Validacion.fechaExiste(fecha)) {
        var p = fecha.split('-');
        fechaVista = new Date(Number(p[0]), Number(p[1]) - 1, 1);
        diaElegido = fecha;
    }
})();

function fechaTexto(fecha) {
    return fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
}

function avisar(texto, tipo) {
    mensajeEtapa.textContent = texto;
    mensajeEtapa.className = 'mensaje' + (tipo ? ' ' + tipo : '');
}

function etapaPorId(id) {
    for (var i = 0; i < fuentesCalendario.etapas.length; i++) {
        if (fuentesCalendario.etapas[i].idEtapa === id) {
            return fuentesCalendario.etapas[i];
        }
    }
    return null;
}

function etapasDeCultivo(idCultivo) {
    return fuentesCalendario.etapas.filter(function (e) { return String(e.idCultivo) === String(idCultivo); });
}

function llenarFiltro() {
    var anterior = filtroCultivo.value || parametrosCalendario.get('cultivo') || '';
    filtroCultivo.innerHTML = '<option value="">Todos los cultivos</option>';
    fuentesCalendario.cultivos.forEach(function (cultivo) {
        var opcion = document.createElement('option');
        opcion.value = cultivo.id;
        opcion.textContent = Campo.nombreCultivo(cultivo) + (cultivo.estado === 'finalizado' ? ' · finalizado' : '');
        filtroCultivo.appendChild(opcion);
    });
    filtroCultivo.value = Campo.cultivoPorId(anterior) ? String(anterior) : '';
}

function dibujarSeguimiento() {
    var lista = document.getElementById('cultivos-seguimiento');
    lista.innerHTML = '';
    var hoy = Validacion.hoy();
    var visibles = Campo.activos().filter(function (c) {
        return !filtroCultivo.value || String(c.id) === filtroCultivo.value;
    });
    visibles.forEach(function (cultivo) {
        var tarjeta = document.createElement('div');
        tarjeta.className = 'cultivo-seguimiento';
        var nombre = document.createElement('strong');
        nombre.textContent = cultivo.nombre;
        var lugar = document.createElement('p');
        lugar.textContent = Campo.ubicacion(cultivo);
        var etapa = document.createElement('p');
        etapa.textContent = 'Etapa actual: ' + (cultivo.etapaFenologica || 'sin registrar');
        var siguiente = document.createElement('p');
        var proxima = CalendarioLogica.proximaEtapa(etapasDeCultivo(cultivo.id), hoy);
        if (!proxima) {
            var enlace = document.createElement('a');
            enlace.href = 'etapas.html?cultivo=' + encodeURIComponent(cultivo.id);
            enlace.textContent = 'Programar etapas';
            siguiente.appendChild(document.createTextNode('Sin etapas pendientes. '));
            siguiente.appendChild(enlace);
        } else {
            var insignia = document.createElement('span');
            insignia.className = 'insignia' + (proxima.atrasada ? ' peligro' : (proxima.dias <= 3 ? ' alerta' : ''));
            insignia.textContent = proxima.atrasada
                ? 'atrasada ' + Math.abs(proxima.dias) + ' día(s)'
                : (proxima.dias === 0 ? 'hoy' : 'en ' + proxima.dias + ' día(s)');
            siguiente.appendChild(document.createTextNode('Próxima: ' + proxima.etapa + ' (' + proxima.fecha + ') '));
            siguiente.appendChild(insignia);
        }
        tarjeta.append(nombre, lugar, etapa, siguiente);
        lista.appendChild(tarjeta);
    });
    if (!visibles.length) {
        lista.textContent = 'No hay cultivos activos para mostrar.';
    }
}

function eventosActuales() {
    return CalendarioLogica.construirEventos(fuentesCalendario, filtroCultivo.value);
}

function dibujarCalendario() {
    var eventos = eventosActuales();
    var contenedor = document.getElementById('dias-calendario');
    contenedor.innerHTML = '';
    var anio = fechaVista.getFullYear();
    var mes = fechaVista.getMonth();
    document.getElementById('anio-calendario').value = anio;
    document.getElementById('titulo-mes').textContent = fechaVista.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    var comienzo = (new Date(anio, mes, 1).getDay() + 6) % 7;
    var dias = new Date(anio, mes + 1, 0).getDate();
    var espacios = Math.ceil((comienzo + dias) / 7) * 7;
    var hoy = Validacion.hoy();

    for (var i = 0; i < espacios; i++) {
        var casilla = document.createElement('div');
        casilla.className = 'dia';
        if (i < comienzo || i >= comienzo + dias) {
            casilla.classList.add('dia-vacio');
            contenedor.appendChild(casilla);
            continue;
        }
        var numero = i - comienzo + 1;
        var fecha = fechaTexto(new Date(anio, mes, numero));
        var delDia = eventos.filter(function (e) { return e.fecha === fecha; });
        var boton = document.createElement('button');
        boton.type = 'button';
        boton.textContent = numero;
        boton.dataset.fecha = fecha;
        boton.setAttribute('aria-label', 'Ver el ' + fecha + (delDia.length ? ' (' + delDia.length + ' evento(s))' : ''));
        boton.onclick = function () {
            diaElegido = diaElegido === this.dataset.fecha ? '' : this.dataset.fecha;
            dibujarCalendario();
        };
        casilla.appendChild(boton);
        if (fecha === hoy) {
            casilla.classList.add('hoy');
        }
        if (fecha === diaElegido) {
            casilla.classList.add('seleccionado');
        }
        delDia.slice(0, 3).forEach(function (evento) {
            var marca = document.createElement('span');
            marca.className = 'marca-etapa ' + evento.clase + (evento.completada ? ' completada' : '');
            if (evento.tipo === 'etapa' && !evento.completada && evento.fecha < hoy) {
                marca.classList.add('atrasada');
            }
            marca.textContent = evento.texto + (evento.tipo === 'etapa' && evento.completada ? ' ✓' : '');
            casilla.appendChild(marca);
        });
        if (delDia.length > 3) {
            var mas = document.createElement('span');
            mas.className = 'marca-etapa';
            mas.textContent = '+' + (delDia.length - 3) + ' más';
            casilla.appendChild(mas);
        }
        contenedor.appendChild(casilla);
    }
    mostrarTareas(eventos);
}

function crearBoton(texto, alClic, secundario) {
    var boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'boton' + (secundario === false ? '' : ' boton-secundario');
    boton.textContent = texto;
    boton.onclick = alClic;
    return boton;
}

function mostrarTareas(eventos) {
    var lista = document.getElementById('tareas-calendario');
    var titulo = document.getElementById('titulo-tareas');
    lista.innerHTML = '';
    var hoy = Validacion.hoy();
    var prefijoMes = fechaTexto(fechaVista).slice(0, 7);
    var visibles;

    if (diaElegido) {
        titulo.textContent = 'Actividades del ' + diaElegido;
        visibles = eventos.filter(function (e) { return e.fecha === diaElegido; });
    } else {
        titulo.textContent = 'Etapas del mes y pendientes atrasadas';
        visibles = eventos.filter(function (e) {
            return e.tipo === 'etapa' && (e.fecha.slice(0, 7) === prefijoMes || (!e.completada && e.fecha < hoy));
        });
    }

    if (!visibles.length) {
        lista.textContent = diaElegido ? 'No hay actividades este día.' : 'No hay etapas programadas en este mes.';
        return;
    }

    visibles.forEach(function (evento) {
        var bloque = document.createElement('article');
        bloque.className = 'tarea';
        var h3 = document.createElement('h3');
        h3.textContent = evento.texto;
        var detalle = document.createElement('p');
        if (evento.tipo === 'etapa') {
            if (evento.completada) {
                detalle.textContent = 'Completada el ' + evento.fecha + ' (programada para ' + evento.fechaProgramada + ').';
            } else {
                var atraso = Validacion.diasEntre(evento.fecha, hoy);
                detalle.textContent = 'Programada para ' + evento.fecha + (atraso > 0 ? ' · atrasada ' + atraso + ' día(s)' : '') + '.';
            }
        } else {
            detalle.textContent = 'Registrado el ' + evento.fecha + '.';
        }
        bloque.append(h3, detalle);
        if (evento.notas) {
            var notas = document.createElement('p');
            notas.textContent = 'Notas: ' + evento.notas;
            bloque.appendChild(notas);
        }
        if (evento.tipo === 'etapa' && !evento.completada) {
            var etapa = etapaPorId(evento.idEtapa);
            bloque.appendChild(crearBoton('Completar', function () { abrirDialogo('completar', etapa); }, false));
            bloque.appendChild(crearBoton('Reprogramar', function () { abrirDialogo('reprogramar', etapa); }));
            bloque.appendChild(crearBoton('Eliminar', function () { eliminarEtapa(etapa); }));
        }
        lista.appendChild(bloque);
    });
}

function abrirDialogo(modo, etapa) {
    accionDialogo = { modo: modo, etapa: etapa };
    mensajeDialogo.textContent = '';
    campoDialogoFecha.removeAttribute('aria-invalid');
    document.getElementById('detalle-dialogo-etapa').textContent = Campo.nombreCultivo(etapa.idCultivo) + ' · ' + etapa.etapa;
    if (modo === 'completar') {
        document.getElementById('titulo-dialogo-etapa').textContent = 'Completar etapa';
        document.getElementById('etiqueta-dialogo-fecha').textContent = 'Fecha en que se cumplió';
        campoDialogoFecha.value = Validacion.hoy() < etapa.fechaProgramada ? Validacion.hoy() : etapa.fechaProgramada;
        campoDialogoFecha.max = Validacion.hoy();
        bloqueDialogoNotas.hidden = true;
    } else {
        document.getElementById('titulo-dialogo-etapa').textContent = 'Reprogramar etapa';
        document.getElementById('etiqueta-dialogo-fecha').textContent = 'Nueva fecha programada';
        campoDialogoFecha.value = etapa.fechaProgramada;
        campoDialogoFecha.removeAttribute('max');
        campoDialogoNotas.value = etapa.notas || '';
        bloqueDialogoNotas.hidden = false;
    }
    dialogoEtapa.showModal();
}

formularioDialogo.addEventListener('submit', function (evento) {
    evento.preventDefault();
    var etapa = accionDialogo.etapa;
    var fecha = campoDialogoFecha.value;
    var error;
    var peticion;

    if (accionDialogo.modo === 'completar') {
        error = Validacion.primerError([[campoDialogoFecha, Validacion.fecha(fecha, { nombre: 'la fecha en que se cumplió', noFutura: true })]]);
        if (!error && !usuarioCalendario) {
            error = 'Inicia sesión para completar etapas.';
        }
        peticion = function () {
            return pedirApi('/etapas-cultivo/' + etapa.idEtapa + '/completar', 'PUT', {
                idUsuario: usuarioCalendario.idUsuario, fechaReal: fecha
            });
        };
    } else {
        var cambio = { idEtapa: etapa.idEtapa, idCultivo: etapa.idCultivo, etapa: etapa.etapa, fechaProgramada: fecha };
        error = Validacion.primerError([
            [campoDialogoFecha, Validacion.fecha(fecha, { nombre: 'la nueva fecha' })
                || CalendarioLogica.validarProgramacion(cambio, etapasDeCultivo(etapa.idCultivo), Campo.cultivoPorId(etapa.idCultivo))],
            [campoDialogoNotas, Validacion.texto(campoDialogoNotas.value, { nombre: 'las notas', maximo: 500, obligatorio: false })]
        ]);
        peticion = function () {
            return pedirApi('/etapas-cultivo/' + etapa.idEtapa, 'PUT', {
                etapa: etapa.etapa, fechaProgramada: fecha, notas: campoDialogoNotas.value.trim() || null
            });
        };
    }
    if (error) {
        mensajeDialogo.textContent = error;
        return;
    }
    var boton = document.getElementById('guardar-dialogo-etapa');
    boton.disabled = true;
    peticion().then(function () {
        dialogoEtapa.close();
        var texto = accionDialogo.modo === 'completar'
            ? 'Etapa completada. El cultivo quedó en etapa ' + etapa.etapa + ' (también en Cultivos activos).'
            : 'Etapa reprogramada para el ' + fecha + '.';
        return cargarCalendario().then(function () { avisar(texto, 'ok'); });
    }).catch(function (fallo) {
        mensajeDialogo.textContent = textoErrorApi(fallo);
    }).finally(function () {
        boton.disabled = false;
    });
});

document.getElementById('cancelar-dialogo-etapa').onclick = function () { dialogoEtapa.close(); };

function eliminarEtapa(etapa) {
    if (!confirm('¿Eliminar la etapa ' + etapa.etapa + ' de ' + Campo.nombreCultivo(etapa.idCultivo) + '?')) {
        return;
    }
    pedirApi('/etapas-cultivo/' + etapa.idEtapa, 'DELETE').then(function () {
        return cargarCalendario().then(function () { avisar('Etapa eliminada.', 'ok'); });
    }).catch(function (fallo) {
        avisar(textoErrorApi(fallo), 'error');
    });
}

function cargarCalendario() {
    avisar('Cargando calendario…');
    return Promise.all([Campo.cargar(), pedirApi('/etapas-cultivo'), pedirApi('/riegos'), pedirApi('/cosechas')])
        .then(function (r) {
            fuentesCalendario.cultivos = r[0].cultivos;
            fuentesCalendario.etapas = r[1] || [];
            fuentesCalendario.riegos = r[2] || [];
            fuentesCalendario.cosechas = r[3] || [];
            llenarFiltro();
            dibujarSeguimiento();
            dibujarCalendario();
            avisar(fuentesCalendario.cultivos.length ? '' : 'No hay cultivos registrados. Los da de alta el administrador.');
        })
        .catch(function (error) {
            avisar(textoErrorApi(error), 'error');
        });
}

document.getElementById('anio-calendario').onchange = function () {
    var anio = Number(this.value);
    if (!Number.isInteger(anio) || anio < 1900 || anio > 9999) {
        return;
    }
    fechaVista = new Date(anio, fechaVista.getMonth(), 1);
    diaElegido = '';
    dibujarCalendario();
};
document.getElementById('mes-anterior').onclick = function () {
    fechaVista = new Date(fechaVista.getFullYear(), fechaVista.getMonth() - 1, 1);
    diaElegido = '';
    dibujarCalendario();
};
document.getElementById('mes-siguiente').onclick = function () {
    fechaVista = new Date(fechaVista.getFullYear(), fechaVista.getMonth() + 1, 1);
    diaElegido = '';
    dibujarCalendario();
};
document.getElementById('mes-actual').onclick = function () {
    fechaVista = new Date();
    diaElegido = Validacion.hoy();
    dibujarCalendario();
};
document.getElementById('actualizar-calendario').onclick = cargarCalendario;
filtroCultivo.onchange = function () {
    diaElegido = '';
    dibujarSeguimiento();
    dibujarCalendario();
};

cargarCalendario();
