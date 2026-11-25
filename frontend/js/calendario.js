/**
 * @file Muestra las etapas, riegos y cosechas del calendario y permite gestionar las etapas.
 *
 * @author Equipo de Gestión de Cultivos
 */

const usuarioCalendario = usuarioActual();
const fuentesCalendario = { cultivos: [], etapas: [], riegos: [], cosechas: [] };
const parametrosCalendario = new URLSearchParams(window.location.search);
let fechaVista = new Date();
let diaElegido = '';
const filtroCultivo = document.getElementById('filtro-cultivo');
const mensajeEtapa = document.getElementById('mensaje-etapa');

const dialogoEtapa = document.getElementById('dialogo-etapa');
const formularioDialogo = document.getElementById('formulario-dialogo-etapa');
const campoDialogoFecha = document.getElementById('dialogo-fecha');
const campoDialogoNotas = document.getElementById('dialogo-notas');
const bloqueDialogoNotas = document.getElementById('bloque-dialogo-notas');
const mensajeDialogo = document.getElementById('mensaje-dialogo-etapa');
let accionDialogo = null;

/**
 * Consulta cultivos, etapas, riegos y cosechas desde la API.
 */
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

/**
 * Muestra los días y eventos del mes elegido.
 */
function dibujarCalendario() {
    const eventos = eventosActuales();
    const contenedor = document.getElementById('dias-calendario');
    contenedor.innerHTML = '';
    const anio = fechaVista.getFullYear();
    const mes = fechaVista.getMonth();
    document.getElementById('anio-calendario').value = anio;
    document.getElementById('titulo-mes').textContent = fechaVista.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    const comienzo = (new Date(anio, mes, 1).getDay() + 6) % 7;
    const dias = new Date(anio, mes + 1, 0).getDate();
    const espacios = Math.ceil((comienzo + dias) / 7) * 7;
    const hoy = Validacion.hoy();

    for (let i = 0; i < espacios; i++) {
        const casilla = document.createElement('div');
        casilla.className = 'dia';
        if (i < comienzo || i >= comienzo + dias) {
            casilla.classList.add('dia-vacio');
            contenedor.appendChild(casilla);
            continue;
        }
        const numero = i - comienzo + 1;
        const fecha = fechaTexto(new Date(anio, mes, numero));
        const delDia = eventos.filter(function (e) { return e.fecha === fecha; });
        const boton = document.createElement('button');
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
            const marca = document.createElement('span');
            marca.className = 'marca-etapa ' + evento.clase + (evento.completada ? ' completada' : '');
            if (evento.tipo === 'etapa' && !evento.completada && evento.fecha < hoy) {
                marca.classList.add('atrasada');
            }
            marca.textContent = evento.texto + (evento.tipo === 'etapa' && evento.completada ? ' ✓' : '');
            casilla.appendChild(marca);
        });
        if (delDia.length > 3) {
            const mas = document.createElement('span');
            mas.className = 'marca-etapa';
            mas.textContent = '+' + (delDia.length - 3) + ' más';
            casilla.appendChild(mas);
        }
        contenedor.appendChild(casilla);
    }
    mostrarTareas(eventos);
}

/**
 * Muestra el estado de cada cultivo y su próxima etapa.
 */
function dibujarSeguimiento() {
    const lista = document.getElementById('cultivos-seguimiento');
    lista.innerHTML = '';
    const hoy = Validacion.hoy();
    let visibles = Campo.activos().filter(function (c) {
        return !filtroCultivo.value || String(c.id) === filtroCultivo.value;
    });
    visibles.forEach(function (cultivo) {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'cultivo-seguimiento';
        const nombre = document.createElement('strong');
        nombre.textContent = cultivo.nombre;
        const lugar = document.createElement('p');
        lugar.textContent = Campo.ubicacion(cultivo);
        const etapa = document.createElement('p');
        etapa.textContent = 'Etapa actual: ' + (cultivo.etapaFenologica || 'sin registrar');
        const siguiente = document.createElement('p');
        const proxima = CalendarioLogica.proximaEtapa(etapasDeCultivo(cultivo.id), hoy);
        if (!proxima) {
            const enlace = document.createElement('a');
            enlace.href = 'etapas.html?cultivo=' + encodeURIComponent(cultivo.id);
            enlace.textContent = 'Programar etapas';
            siguiente.appendChild(document.createTextNode('Sin etapas pendientes. '));
            siguiente.appendChild(enlace);
        } else {
            const insignia = document.createElement('span');
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

/**
 * Muestra las actividades del día elegido.
 *
 * @param eventos - Los eventos del calendario.
 */
function mostrarTareas(eventos) {
    const lista = document.getElementById('tareas-calendario');
    const titulo = document.getElementById('titulo-tareas');
    lista.innerHTML = '';
    const hoy = Validacion.hoy();
    const prefijoMes = fechaTexto(fechaVista).slice(0, 7);
    let visibles;

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
        const bloque = document.createElement('article');
        bloque.className = 'tarea';
        const h3 = document.createElement('h3');
        h3.textContent = evento.texto;
        const detalle = document.createElement('p');
        if (evento.tipo === 'etapa') {
            if (evento.completada) {
                detalle.textContent = 'Completada el ' + evento.fecha + ' (programada para ' + evento.fechaProgramada + ').';
            } else {
                const atraso = Validacion.diasEntre(evento.fecha, hoy);
                detalle.textContent = 'Programada para ' + evento.fecha + (atraso > 0 ? ' · atrasada ' + atraso + ' día(s)' : '') + '.';
            }
        } else {
            detalle.textContent = 'Registrado el ' + evento.fecha + '.';
        }
        bloque.append(h3, detalle);
        if (evento.notas) {
            const notas = document.createElement('p');
            notas.textContent = 'Notas: ' + evento.notas;
            bloque.appendChild(notas);
        }
        if (evento.tipo === 'etapa' && !evento.completada) {
            const etapa = etapaPorId(evento.idEtapa);
            bloque.appendChild(crearBoton('Completar', function () { abrirDialogo('completar', etapa); }, false));
            bloque.appendChild(crearBoton('Reprogramar', function () { abrirDialogo('reprogramar', etapa); }));
            bloque.appendChild(crearBoton('Eliminar', function () { eliminarEtapa(etapa); }));
        }
        lista.appendChild(bloque);
    });
}

/**
 * Lee la fecha indicada en la URL para abrir el mes correspondiente.
 */
function leerParametros() {
    const fecha = parametrosCalendario.get('fecha');
    if (fecha && Validacion.fechaExiste(fecha)) {
        const p = fecha.split('-');
        fechaVista = new Date(Number(p[0]), Number(p[1]) - 1, 1);
        diaElegido = fecha;
    }
}

/**
 * Formatea la fecha como año, mes y día.
 *
 * @param fecha - Una fecha.
 */
function fechaTexto(fecha) {
    return fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
}

/**
 * Muestra el mensaje del calendario.
 *
 * @param texto - Texto que se quiere mostrar.
 * @param tipo - Tipo de aviso que se quiere mostrar.
 */
function avisar(texto, tipo) {
    mensajeEtapa.textContent = texto;
    mensajeEtapa.className = 'mensaje' + (tipo ? ' ' + tipo : '');
}

/**
 * Busca una etapa programada.
 *
 * @param id - El ID de la etapa.
 */
function etapaPorId(id) {
    return fuentesCalendario.etapas.find(etapa => etapa.idEtapa === id) || null;
}

/**
 * Filtra las etapas programadas de un cultivo.
 *
 * @param idCultivo - El ID del cultivo.
 */
function etapasDeCultivo(idCultivo) {
    return fuentesCalendario.etapas.filter(function (e) { return String(e.idCultivo) === String(idCultivo); });
}

/**
 * Llena el selector de cultivos a partir de la consulta.
 */
function llenarFiltro() {
    const anterior = filtroCultivo.value || parametrosCalendario.get('cultivo') || '';
    filtroCultivo.innerHTML = '<option value="">Todos los cultivos</option>';
    fuentesCalendario.cultivos.forEach(function (cultivo) {
        const opcion = document.createElement('option');
        opcion.value = cultivo.id;
        opcion.textContent = Campo.nombreCultivo(cultivo) + (cultivo.estado === 'finalizado' ? ' · finalizado' : '');
        filtroCultivo.appendChild(opcion);
    });
    filtroCultivo.value = Campo.cultivoPorId(anterior) ? String(anterior) : '';
}

/**
 * Prepara los eventos visibles con el filtro de cultivo.
 */
function eventosActuales() {
    return CalendarioLogica.construirEventos(fuentesCalendario, filtroCultivo.value);
}

/**
 * Crea un botón del calendario.
 *
 * @param texto - Texto que se quiere mostrar.
 * @param alClic - Función que se ejecuta al pulsar el botón.
 * @param secundario - Indica si se aplica el estilo de botón secundario.
 */
function crearBoton(texto, alClic, secundario) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'boton' + (secundario === false ? '' : ' boton-secundario');
    boton.textContent = texto;
    boton.onclick = alClic;
    return boton;
}

/**
 * Abre el formulario para completar o reprogramar una etapa.
 *
 * @param modo - Acción que se realiza con la etapa, completar o reprogramar.
 * @param etapa - Etapa del cultivo seleccionada.
 */
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

/**
 * Pide confirmación y elimina una etapa mediante la API.
 *
 * @param etapa - La etapa.
 */
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

/**
 * Valida y guarda una etapa completada o reprogramada.
 *
 * @param evento - El evento del formulario.
 */
function guardarCambioEtapa(evento) {
    evento.preventDefault();
    const etapa = accionDialogo.etapa;
    const fecha = campoDialogoFecha.value;
    let error;
    let peticion;

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
        const cambio = { idEtapa: etapa.idEtapa, idCultivo: etapa.idCultivo, etapa: etapa.etapa, fechaProgramada: fecha };
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
    const boton = document.getElementById('guardar-dialogo-etapa');
    boton.disabled = true;
    peticion().then(function () {
        dialogoEtapa.close();
        const texto = accionDialogo.modo === 'completar'
            ? 'Etapa completada. El cultivo quedó en etapa ' + etapa.etapa + ' (también en Cultivos activos).'
            : 'Etapa reprogramada para el ' + fecha + '.';
        return cargarCalendario().then(function () { avisar(texto, 'ok'); });
    }).catch(function (fallo) {
        mensajeDialogo.textContent = textoErrorApi(fallo);
    }).finally(function () {
        boton.disabled = false;
    });
}

/**
 * Conecta los eventos de esta pantalla y carga los datos.
 */
function iniciarCalendario() {
    leerParametros();
    formularioDialogo.addEventListener('submit', guardarCambioEtapa);
    document.getElementById('cancelar-dialogo-etapa').onclick = function () { dialogoEtapa.close(); };
    document.getElementById('anio-calendario').onchange = function () {
        const anio = Number(this.value);
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
}

iniciarCalendario();
