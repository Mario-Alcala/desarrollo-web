/**
 * @file Valida los campos de formularios y maneja fechas locales. Devuelve un mensaje vacío para los campos válidos.
 *
 * @author Equipo de Gestión de Cultivos
 */

const Validacion = (function () {

    /**
     * Pone en mayúscula la primera letra.
     *
     * @param {string} texto - Texto que se muestra.
     */
    function capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    /**
     * Completa un número con cero.
     *
     * @param {number} n - Número que se formatea.
     */
    function dosDigitos(n) {
        return (n < 10 ? '0' : '') + n;
    }

        /**
         * Devuelve la fecha local de hoy con formato AAAA-MM-DD.
         */
        function hoy() {
        const d = new Date();
        return d.getFullYear() + '-' + dosDigitos(d.getMonth() + 1) + '-' + dosDigitos(d.getDate());
    }

    /**
     * Calcula una fecha desplazada.
     *
     * @param {string} fecha - Fecha inicial en formato AAAA-MM-DD.
     * @param {number} dias - Días que se agregan.
     */
    function sumarDias(fecha, dias) {
        const p = fecha.split('-');
        const d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + dias));
        return d.getUTCFullYear() + '-' + dosDigitos(d.getUTCMonth() + 1) + '-' + dosDigitos(d.getUTCDate());
    }

    /**
     * Calcula los días entre dos fechas.
     *
     * @param {string} desde - Fecha inicial en formato AAAA-MM-DD.
     * @param {string} hasta - Fecha final en formato AAAA-MM-DD.
     */
    function diasEntre(desde, hasta) {
        const a = desde.split('-');
        const b = hasta.split('-');
        const ms = Date.UTC(Number(b[0]), Number(b[1]) - 1, Number(b[2])) - Date.UTC(Number(a[0]), Number(a[1]) - 1, Number(a[2]));
        return Math.round(ms / 86400000);
    }

    /**
     * Comprueba que la fecha exista.
     *
     * @param {string} texto - Fecha que se comprueba.
     */
    function fechaExiste(texto) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(texto || '')) {
            return false;
        }
        const p = texto.split('-');
        const anio = Number(p[0]);
        const mes = Number(p[1]);
        const dia = Number(p[2]);
        const d = new Date(Date.UTC(anio, mes - 1, dia));
        return anio >= 1900 && d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
    }

        /**
         * Valida una fecha y sus límites.
         *
         * @param {string} texto - Fecha en formato AAAA-MM-DD.
         * @param {Object} [opciones] - Nombre del campo y reglas de fecha.
         */
        function fecha(texto, opciones) {
        const o = opciones || {};
        const nombre = o.nombre || 'la fecha';
        if (!texto) {
            return 'Indica ' + nombre + '.';
        }
        if (!fechaExiste(texto)) {
            return 'Indica ' + nombre + ' válida (AAAA-MM-DD).';
        }
        if (o.noFutura && texto > (o.hoy || hoy())) {
            return capitalizar(nombre) + ' no puede ser futura.';
        }
        if (o.minima && texto < o.minima) {
            return capitalizar(nombre) + ' no puede ser anterior a ' + (o.nombreMinima || o.minima) + '.';
        }
        return '';
    }

        /**
         * Valida cantidades y decimales.
         *
         * @param {number|string} valor - Cantidad que se revisa.
         * @param {Object} [opciones] - Nombre, máximo y decimales permitidos.
         */
        function numero(valor, opciones) {
        const o = opciones || {};
        const nombre = o.nombre || 'la cantidad';
        const decimales = o.decimales === undefined ? 2 : o.decimales;
        const texto = String(valor === undefined || valor === null ? '' : valor).trim();
        if (texto === '') {
            return 'Indica ' + nombre + '.';
        }
        const patron = decimales > 0
            ? new RegExp('^\\d+(\\.\\d{1,' + decimales + '})?$')
            : /^\d+$/;
        if (!patron.test(texto)) {
            return decimales > 0
                ? 'Escribe ' + nombre + ' como número positivo con máximo ' + decimales + ' decimales.'
                : 'Escribe ' + nombre + ' como número entero positivo.';
        }
        const n = Number(texto);
        if (o.mayorQueCero !== false && n <= 0) {
            return 'Indica ' + nombre + ' mayor que cero.';
        }
        if (o.maximo !== undefined && o.maximo !== null && n > Number(o.maximo)) {
            return 'Indica ' + nombre + ' de máximo ' + Number(o.maximo).toLocaleString('es-MX') + (o.unidad ? ' ' + o.unidad : '') + '.';
        }
        return '';
    }

        /**
         * Valida si el texto está completo y cumple su longitud.
         *
         * @param {string} valor - Texto del campo.
         * @param {Object} [opciones] - Nombre, longitud máxima y obligatoriedad.
         */
        function texto(valor, opciones) {
        const o = opciones || {};
        const limpio = String(valor || '').trim();
        if (o.obligatorio !== false && !limpio) {
            return 'Escribe ' + (o.nombre || 'el texto') + '.';
        }
        if (o.maximo && limpio.length > o.maximo) {
            return 'Escribe máximo ' + o.maximo + ' caracteres en ' + (o.nombre || 'el texto') + '.';
        }
        return '';
    }

    /**
     * Comprueba si la opción está permitida.
     *
     * @param {string} valor - Valor elegido.
     * @param {string[]} permitidas - Opciones válidas.
     * @param {string} [nombre] - Nombre del campo.
     */
    function opcion(valor, permitidas, nombre) {
        return permitidas.indexOf(valor) === -1 ? 'Elige ' + (nombre || 'una opción') + '.' : '';
    }

    /**
     * Comprueba que el identificador sea un entero positivo.
     *
     * @param {number|string} valor - Identificador que se revisa.
     * @param {string} [nombre] - Nombre del registro.
     */
    function idValido(valor, nombre) {
        const n = Number(valor);
        return valor && Number.isInteger(n) && n > 0 ? '' : 'Selecciona ' + (nombre || 'un registro') + '.';
    }

        /**
         * Marca los campos inválidos y enfoca el primero.
         *
         * @param {Array} pares - Pares de campo y mensaje de error.
         */
        function primerError(pares) {
        for (let i = 0; i < pares.length; i++) {
            const campo = pares[i][0];
            const error = pares[i][1];
            if (campo && campo.setAttribute) {
                if (error) {
                    campo.setAttribute('aria-invalid', 'true');
                } else {
                    campo.removeAttribute('aria-invalid');
                }
            }
        }
        for (let j = 0; j < pares.length; j++) {
            if (pares[j][1]) {
                if (pares[j][0] && pares[j][0].focus) {
                    pares[j][0].focus();
                }
                return pares[j][1];
            }
        }
        return '';
    }

    return {
        hoy: hoy,
        sumarDias: sumarDias,
        diasEntre: diasEntre,
        fechaExiste: fechaExiste,
        fecha: fecha,
        numero: numero,
        texto: texto,
        opcion: opcion,
        idValido: idValido,
        primerError: primerError
    };
})();

/**
 * Elige el mensaje que se muestra al fallar una solicitud.
 *
 * @param {Error} error - Error que ocurrió al realizar la solicitud.
 */
function textoErrorApi(error) {
    if (error instanceof TypeError) {
        return 'No hay conexión con el servidor. Revisa que Spring Boot esté corriendo en el puerto 8081.';
    }
    return (error && error.message) || 'No se pudo completar la operación.';
}

if (typeof module !== 'undefined') {
    module.exports = { Validacion: Validacion, textoErrorApi: textoErrorApi };
}
