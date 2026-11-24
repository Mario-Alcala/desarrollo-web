/* Datos: este archivo define las etapas de cultivo y calcula fechas y eventos del calendario. No recibe atributos. */

const CalendarioLogica = crearLogicaCalendario();

/* Datos: reúne las reglas de fechas y etapas del cultivo. No recibe atributos. */
function crearLogicaCalendario() {
    const ETAPAS = ['Germinación', 'Siembra', 'Vegetación/Riego', 'Floración', 'Cosecha'];

    const DIAS_SUGERIDOS = { 'Germinación': 0, 'Siembra': 15, 'Vegetación/Riego': 30, 'Floración': 60, 'Cosecha': 90 };

    /* Datos: esta función normaliza un texto para comparar nombres de etapas. Recibe el texto. */
    function simplificar(texto) {
        return String(texto || '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s/g, '');
    }

    /* Datos: esta función busca la posición de una etapa por su nombre. Recibe el texto de la etapa. */
    function indiceEtapa(texto) {
        const buscado = simplificar(texto);
        if (!buscado) {
            return -1;
        }
        for (let i = 0; i < ETAPAS.length; i++) {
            const etapa = simplificar(ETAPAS[i]);
            if (etapa === buscado || etapa.indexOf(buscado + '/') === 0) {
                return i;
            }
        }
        return -1;
    }

    /* Datos: esta función elige la clase visual de la etapa. Recibe el nombre de la etapa. */
    function claseEtapa(etapa) {
        return ['germinacion', 'siembra', 'riego', 'floracion', 'cosecha'][indiceEtapa(etapa)] || 'riego';
    }

    /* Datos: esta función obtiene la fecha efectiva de la etapa. Recibe la etapa programada. */
    function fechaDe(etapa) {
        return etapa.fechaReal || etapa.fechaProgramada;
    }

    /* Datos: esta función revisa que la fecha y el orden sean válidos. Recibe la nueva etapa, las existentes y el cultivo. */
    function validarProgramacion(nueva, existentes, cultivo) {
        if (!cultivo) {
            return 'Selecciona un cultivo.';
        }
        if (cultivo.estado === 'finalizado') {
            return 'El cultivo está finalizado; no se le pueden programar etapas.';
        }
        const indice = indiceEtapa(nueva.etapa);
        if (indice < 0) {
            return 'Elige la etapa: germinación, siembra, vegetación/riego, floración o cosecha.';
        }
        const fecha = nueva.fechaProgramada;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) {
            return 'Indica la fecha programada.';
        }
        if (indice > indiceEtapa('Siembra') && cultivo.fechaSiembra && fecha < cultivo.fechaSiembra) {
            return 'La ' + ETAPAS[indice] + ' no puede programarse antes de la siembra (' + cultivo.fechaSiembra + ').';
        }
        for (let i = 0; i < (existentes || []).length; i++) {
            const otra = existentes[i];
            if (nueva.idEtapa && otra.idEtapa === nueva.idEtapa) {
                continue;
            }
            const indiceOtra = indiceEtapa(otra.etapa);
            const fechaOtra = fechaDe(otra);
            if (indiceOtra === indice) {
                return 'Este cultivo ya tiene programada la etapa ' + ETAPAS[indice] + ' (' + fechaOtra + '); reprográmala en el calendario.';
            }
            if (indiceOtra < indice && fecha < fechaOtra) {
                return 'La ' + ETAPAS[indice] + ' no puede quedar antes de ' + otra.etapa + ' (' + fechaOtra + ').';
            }
            if (indiceOtra > indice && fecha > fechaOtra) {
                return 'La ' + ETAPAS[indice] + ' no puede quedar después de ' + otra.etapa + ' (' + fechaOtra + ').';
            }
        }
        return '';
    }

    /* Datos: esta función calcula una fecha relativa a otra. Recibe una fecha y la cantidad de días. */
    function sumarDias(fecha, dias) {
        const p = fecha.split('-');
        const d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + Number(dias)));
        const mes = d.getUTCMonth() + 1;
        const dia = d.getUTCDate();
        return d.getUTCFullYear() + '-' + (mes < 10 ? '0' : '') + mes + '-' + (dia < 10 ? '0' : '') + dia;
    }

    /* Datos: esta función calcula las fechas sugeridas de las etapas pendientes. Recibe la fecha base, los días y las etapas existentes. */
    function sugerirCalendario(fechaBase, dias, existentes) {
        const tabla = dias || DIAS_SUGERIDOS;
        const ya = {};
        (existentes || []).forEach(function (e) { ya[indiceEtapa(e.etapa)] = true; });
        const resultado = [];
        let anterior = -1;
        for (let i = 0; i < ETAPAS.length; i++) {
            const n = Number(tabla[ETAPAS[i]]);
            if (!Number.isInteger(n) || n < 0) {
                return { error: 'Los días de ' + ETAPAS[i] + ' deben ser un número entero de 0 en adelante.', etapas: [] };
            }
            if (n < anterior) {
                return { error: 'Los días de ' + ETAPAS[i] + ' no pueden ser menos que los de la etapa anterior.', etapas: [] };
            }
            anterior = n;
            if (!ya[i]) {
                resultado.push({ etapa: ETAPAS[i], fechaProgramada: sumarDias(fechaBase, n) });
            }
        }
        return { error: '', etapas: resultado };
    }

    /* Datos: esta función reúne etapas, riegos, cosechas y siembras para el calendario. Recibe las listas de la API y el filtro. */
    function construirEventos(fuentes, filtro) {
        const eventos = [];
        const coincide = function (idCultivo) { return !filtro || String(idCultivo) === String(filtro); };
        const nombres = {};
        (fuentes.cultivos || []).forEach(function (c) { nombres[c.id] = c.nombre; });
        const siembraCompletada = {};

        (fuentes.etapas || []).forEach(function (e) {
            if (!coincide(e.idCultivo)) {
                return;
            }
            const completada = e.estado === 'completada';
            if (completada && indiceEtapa(e.etapa) === indiceEtapa('Siembra')) {
                siembraCompletada[e.idCultivo] = true;
            }
            eventos.push({
                tipo: 'etapa', idEtapa: e.idEtapa, idCultivo: e.idCultivo, etapa: e.etapa,
                fecha: fechaDe(e), fechaProgramada: e.fechaProgramada, completada: completada,
                clase: claseEtapa(e.etapa), notas: e.notas || '',
                texto: (e.nombreCultivo || nombres[e.idCultivo] || 'Cultivo') + ' · ' + e.etapa
            });
        });
        (fuentes.cultivos || []).forEach(function (c) {
            if (coincide(c.id) && c.fechaSiembra && !siembraCompletada[c.id]) {
                eventos.push({
                    tipo: 'siembra', idCultivo: c.id, etapa: 'Siembra', fecha: c.fechaSiembra, completada: true,
                    clase: 'siembra', texto: c.nombre + ' · Siembra registrada'
                });
            }
        });
        (fuentes.riegos || []).forEach(function (r) {
            if (coincide(r.idCultivo) && r.fechaRiego) {
                eventos.push({
                    tipo: 'riego', idCultivo: r.idCultivo, fecha: String(r.fechaRiego).slice(0, 10), completada: true,
                    clase: 'actividad-riego',
                    texto: (nombres[r.idCultivo] || 'Cultivo') + ' · Riego ' + Number(r.cantidadAgua).toLocaleString('es-MX') + ' ' + (r.unidadMedida || '')
                });
            }
        });
        (fuentes.cosechas || []).forEach(function (k) {
            if (coincide(k.idCultivo) && k.fechaCosecha) {
                eventos.push({
                    tipo: 'cosecha', idCultivo: k.idCultivo, fecha: k.fechaCosecha, completada: true,
                    clase: 'cosecha',
                    texto: (k.nombreCultivo || nombres[k.idCultivo] || 'Cultivo') + ' · Corte ' + Number(k.cantidadCosechada).toLocaleString('es-MX') + ' kg'
                });
            }
        });
        eventos.sort(function (a, b) {
            return a.fecha.localeCompare(b.fecha) || (a.tipo === 'etapa' ? -1 : 1);
        });
        return eventos;
    }

    /* Datos: esta función busca la etapa pendiente más cercana. Recibe las etapas del cultivo y la fecha de hoy. */
    function proximaEtapa(etapasCultivo, hoy) {
        const pendientes = (etapasCultivo || []).filter(function (e) { return e.estado !== 'completada'; });
        pendientes.sort(function (a, b) { return indiceEtapa(a.etapa) - indiceEtapa(b.etapa); });
        if (!pendientes.length) {
            return null;
        }
        const e = pendientes[0];
        const a = hoy.split('-');
        const b = e.fechaProgramada.split('-');
        const dias = Math.round((Date.UTC(+b[0], +b[1] - 1, +b[2]) - Date.UTC(+a[0], +a[1] - 1, +a[2])) / 86400000);
        return { etapa: e.etapa, fecha: e.fechaProgramada, dias: dias, atrasada: dias < 0, idEtapa: e.idEtapa };
    }

    return {
        ETAPAS: ETAPAS,
        DIAS_SUGERIDOS: DIAS_SUGERIDOS,
        indiceEtapa: indiceEtapa,
        claseEtapa: claseEtapa,
        validarProgramacion: validarProgramacion,
        sugerirCalendario: sugerirCalendario,
        construirEventos: construirEventos,
        proximaEtapa: proximaEtapa,
        sumarDias: sumarDias
    };
}

if (typeof module !== 'undefined') {
    module.exports = { CalendarioLogica: CalendarioLogica };
}
