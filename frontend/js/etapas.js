/**
 * Consulta y programa etapas individuales o un calendario sugerido para el cultivo elegido.
 *
 * @author Equipo de Gestión de Cultivos
 */
class ProgramacionEtapas {
    /**
     * Prepara las etapas que se mostrarán para el cultivo elegido.
     */
    constructor() {
        this.etapasCultivoElegido = [];
    }

    /**
     * Consulta las etapas del cultivo seleccionado desde la API.
     */
    cargarEtapasDelCultivo() {
        const pantalla = this;
        const cultivo = this.cultivoElegido();
        this.etapasCultivoElegido = [];
        if (!cultivo) {
            this.dibujarProgramadas();
            this.dibujarSugerido();
            return Promise.resolve();
        }
        return pedirApi('/etapas-cultivo?idCultivo=' + encodeURIComponent(cultivo.id)).then(function (lista) {
            pantalla.etapasCultivoElegido = lista || [];
            document.getElementById('etapa-actual').textContent = 'Etapa actual del cultivo: '
                + (cultivo.etapaFenologica || 'sin registrar')
                + (cultivo.fechaSiembra ? ' · Siembra registrada: ' + cultivo.fechaSiembra : '');
            pantalla.dibujarProgramadas();
            pantalla.proponerFechaBase();
            pantalla.dibujarSugerido();
        }).catch(function (error) {
            pantalla.avisarEtapas(textoErrorApi(error), 'error');
        });
    }

    /**
     * Registra una etapa en la API.
     *
     * @param datos - Los datos de la etapa.
     */
    enviarEtapa(datos) {
        const pantalla = this;
        return pedirApi('/etapas-cultivo', 'POST', datos).then(function (creada) {
            pantalla.etapasCultivoElegido.push(creada);
            return creada;
        });
    }

    /**
     * Muestra las etapas que ya están programadas.
     */
    dibujarProgramadas() {
        const cuerpo = document.getElementById('etapas-programadas');
        cuerpo.innerHTML = '';
        const ordenadas = this.etapasCultivoElegido.slice().sort(function (a, b) {
            return CalendarioLogica.indiceEtapa(a.etapa) - CalendarioLogica.indiceEtapa(b.etapa);
        });
        ordenadas.forEach(function (e) {
            const fila = document.createElement('tr');
            celda(fila, e.etapa);
            celda(fila, e.fechaProgramada);
            celda(fila, e.estado === 'completada' ? 'Completada el ' + e.fechaReal : 'Pendiente');
            celda(fila, e.notas);
            cuerpo.appendChild(fila);
        });
        if (!ordenadas.length) {
            filaSinDatos(cuerpo, 4, this.cultivoElegido() ? 'Este cultivo no tiene etapas programadas.' : 'Selecciona un cultivo.');
        }
    }

    /**
     * Calcula y muestra las fechas propuestas para las etapas.
     */
    dibujarSugerido() {
        const cuerpo = document.getElementById('vista-sugerida');
        cuerpo.innerHTML = '';
        mensajeSugerido.textContent = '';
        if (!this.cultivoElegido() || !Validacion.fechaExiste(campoFechaBase.value)) {
            filaSinDatos(cuerpo, 2, 'Selecciona un cultivo y una fecha base.');
            return null;
        }
        const sugerido = CalendarioLogica.sugerirCalendario(campoFechaBase.value, this.diasSugeridosDelFormulario(), this.etapasCultivoElegido);
        if (sugerido.error) {
            mensajeSugerido.textContent = sugerido.error;
            return null;
        }
        sugerido.etapas.forEach(function (e) {
            const fila = document.createElement('tr');
            celda(fila, e.etapa);
            celda(fila, e.fechaProgramada);
            cuerpo.appendChild(fila);
        });
        if (!sugerido.etapas.length) {
            filaSinDatos(cuerpo, 2, 'Todas las etapas de este cultivo ya están programadas.');
        }
        return sugerido.etapas;
    }

    /**
     * Muestra el mensaje de etapas.
     *
     * @param texto - Texto que se quiere mostrar.
     * @param tipo - Tipo de aviso que se quiere mostrar.
     */
    avisarEtapas(texto, tipo) {
        mensajeEtapas.textContent = texto;
        mensajeEtapas.className = 'mensaje' + (tipo ? ' ' + tipo : '');
    }

    /**
     * Busca el cultivo que se eligió en el formulario.
     */
    cultivoElegido() {
        return Campo.cultivoPorId(selectCultivoEtapa.value);
    }

    /**
     * Lee los días indicados en el formulario de sugerencias.
     */
    diasSugeridosDelFormulario() {
        const dias = {};
        CalendarioLogica.ETAPAS.forEach(function (etapa, i) {
            dias[etapa] = Number(document.getElementById('dias-' + i).value);
        });
        return dias;
    }

    /**
     * Propone una fecha inicial a partir de las fechas del cultivo.
     */
    proponerFechaBase() {
        const cultivo = this.cultivoElegido();
        const dias = this.diasSugeridosDelFormulario();
        const ancla = this.etapasCultivoElegido.slice().sort(function (a, b) {
            return CalendarioLogica.indiceEtapa(a.etapa) - CalendarioLogica.indiceEtapa(b.etapa);
        })[0];
        if (ancla) {
            const etapa = CalendarioLogica.ETAPAS[CalendarioLogica.indiceEtapa(ancla.etapa)];
            campoFechaBase.value = CalendarioLogica.sumarDias(ancla.fechaReal || ancla.fechaProgramada, -(dias[etapa] || 0));
        } else if (cultivo && cultivo.fechaSiembra) {
            campoFechaBase.value = CalendarioLogica.sumarDias(cultivo.fechaSiembra, -(dias['Siembra'] || 0));
        } else if (!campoFechaBase.value) {
            campoFechaBase.value = Validacion.hoy();
        }
    }

    /**
     * Valida y guarda la etapa elegida.
     *
     * @param evento - El evento del formulario.
     */
    guardarEtapa(evento) {
        evento.preventDefault();
        mensajeFormEtapa.textContent = '';
        const cultivo = this.cultivoElegido();
        const datos = {
            idCultivo: cultivo ? cultivo.id : null,
            etapa: selectEtapa.value,
            fechaProgramada: campoFechaEtapa.value,
            notas: campoNotasEtapa.value.trim() || null
        };
        const error = Validacion.primerError([
            [selectCultivoEtapa, cultivo ? '' : 'Selecciona un cultivo.'],
            [selectEtapa, Validacion.opcion(selectEtapa.value, CalendarioLogica.ETAPAS, 'la etapa')],
            [campoFechaEtapa, Validacion.fecha(campoFechaEtapa.value, { nombre: 'la fecha programada' })
                || CalendarioLogica.validarProgramacion(datos, this.etapasCultivoElegido, cultivo)],
            [campoNotasEtapa, Validacion.texto(campoNotasEtapa.value, { nombre: 'las notas', maximo: 500, obligatorio: false })]
        ]);
        if (error) {
            mensajeFormEtapa.textContent = error;
            return;
        }
        const boton = document.getElementById('guardar-etapa');
        boton.disabled = true;
        this.enviarEtapa(datos).then(function () {
            window.location.href = 'calendario.html?cultivo=' + encodeURIComponent(datos.idCultivo) + '&fecha=' + datos.fechaProgramada;
        }).catch(function (fallo) {
            mensajeFormEtapa.textContent = textoErrorApi(fallo);
            boton.disabled = false;
        });
    }

    /**
     * Valida y guarda las etapas sugeridas en orden.
     *
     * @param evento - El evento del botón.
     */
    async guardarEtapasSugeridas(evento) {
        const cultivo = this.cultivoElegido();
        const etapas = this.dibujarSugerido();
        if (!cultivo) {
            mensajeSugerido.textContent = 'Selecciona un cultivo.';
            return;
        }
        if (!etapas || !etapas.length) {
            return;
        }
        for (let i = 0; i < etapas.length; i++) {
            const propuesta = { idCultivo: cultivo.id, etapa: etapas[i].etapa, fechaProgramada: etapas[i].fechaProgramada };
            const error = CalendarioLogica.validarProgramacion(propuesta, this.etapasCultivoElegido.concat(etapas.slice(0, i)), cultivo);
            if (error) {
                mensajeSugerido.textContent = error + ' Ajusta la fecha base o los días.';
                return;
            }
        }
        const boton = evento.currentTarget;
        boton.disabled = true;
        let creadas = 0;
        try {
            for (const etapa of etapas) {
                await this.enviarEtapa({
                    idCultivo: cultivo.id,
                    etapa: etapa.etapa,
                    fechaProgramada: etapa.fechaProgramada,
                    notas: null
                });
                creadas++;
            }
            window.location.href = 'calendario.html?cultivo=' + encodeURIComponent(cultivo.id) + '&fecha=' + etapas[0].fechaProgramada;
        } catch (fallo) {
            mensajeSugerido.textContent = 'Se programaron ' + creadas + ' etapa(s). ' + textoErrorApi(fallo);
            boton.disabled = false;
            this.dibujarProgramadas();
        }
    }

    /**
     * Conecta los eventos de esta pantalla y carga los datos.
     */
    iniciarEtapas() {
        const pantalla = this;
        document.getElementById('formulario-etapa').addEventListener('submit', this.guardarEtapa.bind(this));
        document.getElementById('programar-sugerido').addEventListener('click', this.guardarEtapasSugeridas.bind(this));
        selectCultivoEtapa.addEventListener('change', this.cargarEtapasDelCultivo.bind(this));
        campoFechaBase.addEventListener('change', this.dibujarSugerido.bind(this));
        CalendarioLogica.ETAPAS.forEach(function (etapa, i) {
            const campo = document.getElementById('dias-' + i);
            campo.value = CalendarioLogica.DIAS_SUGERIDOS[etapa];
            campo.addEventListener('input', function () {
                pantalla.proponerFechaBase();
                pantalla.dibujarSugerido();
            });
        });
        this.avisarEtapas('Cargando cultivos…');
        Campo.cargar().then(function () {
            const cantidad = Campo.llenarSelectCultivos(selectCultivoEtapa);
            const pedido = parametrosEtapas.get('cultivo');
            if (pedido && Campo.cultivoPorId(pedido)) {
                selectCultivoEtapa.value = pedido;
            }
            pantalla.avisarEtapas(cantidad ? '' : 'No hay cultivos activos. Los da de alta el administrador.');
            return pantalla.cargarEtapasDelCultivo();
        }).catch(function (error) {
            pantalla.avisarEtapas(textoErrorApi(error), 'error');
        });
    }
}

const parametrosEtapas = new URLSearchParams(window.location.search);
const selectCultivoEtapa = document.getElementById('cultivo');
const selectEtapa = document.getElementById('etapa');
const campoFechaEtapa = document.getElementById('fecha-inicio');
const campoNotasEtapa = document.getElementById('notas');
const mensajeEtapas = document.getElementById('mensaje-etapa');
const mensajeFormEtapa = document.getElementById('mensaje-formulario-etapa');
const mensajeSugerido = document.getElementById('mensaje-sugerido');
const campoFechaBase = document.getElementById('fecha-base');

const programacionEtapas = new ProgramacionEtapas();

programacionEtapas.iniciarEtapas();
