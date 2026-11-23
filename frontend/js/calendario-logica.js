/*
 * ARCHIVO: js/calendario-logica.js
 * CAPA: FRONTEND (lógica pura, sin DOM). Reglas del calendario de etapas y armado de eventos.
 * La usan js/calendario.js (calendario.html y etapas.html) y las pruebas:
 *   node --test frontend/pruebas/calendario.test.js
 * Las reglas de orden de fechas son las mismas que valida EtapaCultivoService en el backend.
 */

var CalendarioLogica = (function () {

    var ETAPAS = ['Germinación', 'Siembra', 'Vegetación/Riego', 'Floración', 'Cosecha'];

    /* Días sugeridos desde la fecha base (inicio de la germinación). Se pueden cambiar en etapas.html. */
    var DIAS_SUGERIDOS = { 'Germinación': 0, 'Siembra': 15, 'Vegetación/Riego': 30, 'Floración': 60, 'Cosecha': 90 };

    function simplificar(texto) {
        return String(texto || '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s/g, '');
    }

    /* Índice de la etapa sin importar acentos ni mayúsculas ("floracion" = "Floración", "Vegetación" = "Vegetación/Riego"). */
    function indiceEtapa(texto) {
        var buscado = simplificar(texto);
        if (!buscado) {
            return -1;
        }
        for (var i = 0; i < ETAPAS.length; i++) {
            var etapa = simplificar(ETAPAS[i]);
            if (etapa === buscado || etapa.indexOf(buscado + '/') === 0) {
                return i;
            }
        }
        return -1;
    }

    function claseEtapa(etapa) {
        return ['germinacion', 'siembra', 'riego', 'floracion', 'cosecha'][indiceEtapa(etapa)] || 'riego';
    }

    function fechaDe(etapa) {
        return etapa.fechaReal || etapa.fechaProgramada;
    }

    /*
     * Revisa una etapa antes de enviarla al API. Devuelve '' o el texto del error.
     * nueva: { idCultivo, etapa, fechaProgramada, idEtapa? }
     * existentes: etapas del mismo cultivo (GET /etapas-cultivo?idCultivo=)
     * cultivo: { estado, fechaSiembra }
     */
    function validarProgramacion(nueva, existentes, cultivo) {
        if (!cultivo) {
            return 'Selecciona un cultivo.';
        }
        if (cultivo.estado === 'finalizado') {
            return 'El cultivo está finalizado; no se le pueden programar etapas.';
        }
        var indice = indiceEtapa(nueva.etapa);
        if (indice < 0) {
            return 'Elige la etapa: germinación, siembra, vegetación/riego, floración o cosecha.';
        }
        var fecha = nueva.fechaProgramada;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) {
            return 'Indica la fecha programada.';
        }
        if (indice > indiceEtapa('Siembra') && cultivo.fechaSiembra && fecha < cultivo.fechaSiembra) {
            return 'La ' + ETAPAS[indice] + ' no puede programarse antes de la siembra (' + cultivo.fechaSiembra + ').';
        }
        for (var i = 0; i < (existentes || []).length; i++) {
            var otra = existentes[i];
            if (nueva.idEtapa && otra.idEtapa === nueva.idEtapa) {
                continue;
            }
            var indiceOtra = indiceEtapa(otra.etapa);
            var fechaOtra = fechaDe(otra);
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

    function sumarDias(fecha, dias) {
        var p = fecha.split('-');
        var d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + Number(dias)));
        var mes = d.getUTCMonth() + 1;
        var dia = d.getUTCDate();
        return d.getUTCFullYear() + '-' + (mes < 10 ? '0' : '') + mes + '-' + (dia < 10 ? '0' : '') + dia;
    }

    /*
     * Calendario sugerido a partir de una fecha base. dias: { 'Germinación': 0, ... } (cada valor >= anterior).
     * Omite las etapas que el cultivo ya tiene programadas.
     */
    function sugerirCalendario(fechaBase, dias, existentes) {
        var tabla = dias || DIAS_SUGERIDOS;
        var ya = {};
        (existentes || []).forEach(function (e) { ya[indiceEtapa(e.etapa)] = true; });
        var resultado = [];
        var anterior = -1;
        for (var i = 0; i < ETAPAS.length; i++) {
            var n = Number(tabla[ETAPAS[i]]);
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

    /*
     * Junta en una sola lista los eventos del calendario:
     *  - etapas programadas o completadas (GET /etapas-cultivo)
     *  - siembra registrada del cultivo (cultivos.fecha_siembra) si no hay etapa Siembra completada
     *  - riegos (GET /riegos) y cosechas (GET /cosechas) ya registrados
     * filtro: id de cultivo como texto ('' = todos)
     */
    function construirEventos(fuentes, filtro) {
        var eventos = [];
        var coincide = function (idCultivo) { return !filtro || String(idCultivo) === String(filtro); };
        var nombres = {};
        (fuentes.cultivos || []).forEach(function (c) { nombres[c.id] = c.nombre; });
        var siembraCompletada = {};

        (fuentes.etapas || []).forEach(function (e) {
            if (!coincide(e.idCultivo)) {
                return;
            }
            var completada = e.estado === 'completada';
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

    /* Siguiente etapa pendiente de un cultivo y cuántos días faltan (negativo = atrasada). */
    function proximaEtapa(etapasCultivo, hoy) {
        var pendientes = (etapasCultivo || []).filter(function (e) { return e.estado !== 'completada'; });
        pendientes.sort(function (a, b) { return indiceEtapa(a.etapa) - indiceEtapa(b.etapa); });
        if (!pendientes.length) {
            return null;
        }
        var e = pendientes[0];
        var a = hoy.split('-');
        var b = e.fechaProgramada.split('-');
        var dias = Math.round((Date.UTC(+b[0], +b[1] - 1, +b[2]) - Date.UTC(+a[0], +a[1] - 1, +a[2])) / 86400000);
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
})();

if (typeof module !== 'undefined') {
    module.exports = { CalendarioLogica: CalendarioLogica };
}
