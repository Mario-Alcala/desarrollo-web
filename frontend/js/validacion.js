/* Datos: valida los campos de formularios y maneja fechas locales. Devuelve un mensaje vacío para los campos válidos. No recibe atributos. */

const Validacion = (function () {

    /* Datos: pone en mayúscula la primera letra. Recibe el texto. */
    function capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    /* Datos: completa un número con cero. Recibe el número. */
    function dosDigitos(n) {
        return (n < 10 ? '0' : '') + n;
    }

        /* Datos: devuelve la fecha local de hoy con formato AAAA-MM-DD. No recibe atributos. */
        function hoy() {
        const d = new Date();
        return d.getFullYear() + '-' + dosDigitos(d.getMonth() + 1) + '-' + dosDigitos(d.getDate());
    }

    /* Datos: calcula una fecha desplazada. Recibe la fecha y los días. */
    function sumarDias(fecha, dias) {
        const p = fecha.split('-');
        const d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + dias));
        return d.getUTCFullYear() + '-' + dosDigitos(d.getUTCMonth() + 1) + '-' + dosDigitos(d.getUTCDate());
    }

    /* Datos: calcula los días entre dos fechas. Recibe las dos fechas. */
    function diasEntre(desde, hasta) {
        const a = desde.split('-');
        const b = hasta.split('-');
        const ms = Date.UTC(Number(b[0]), Number(b[1]) - 1, Number(b[2])) - Date.UTC(Number(a[0]), Number(a[1]) - 1, Number(a[2]));
        return Math.round(ms / 86400000);
    }

    /* Datos: comprueba que la fecha exista. Recibe el texto de la fecha. */
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

        /* Datos: valida una fecha y sus límites. Recibe el texto y las opciones. */
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

        /* Datos: valida cantidades y decimales. Recibe el valor y las opciones. */
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

        /* Datos: valida si el texto está completo y cumple su longitud. Recibe el valor y las opciones. */
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

    /* Datos: comprueba si la opción está permitida. Recibe el valor, la lista y su nombre. */
    function opcion(valor, permitidas, nombre) {
        return permitidas.indexOf(valor) === -1 ? 'Elige ' + (nombre || 'una opción') + '.' : '';
    }

    /* Datos: comprueba que el identificador sea un entero positivo. Recibe el valor y el nombre del registro. */
    function idValido(valor, nombre) {
        const n = Number(valor);
        return valor && Number.isInteger(n) && n > 0 ? '' : 'Selecciona ' + (nombre || 'un registro') + '.';
    }

        /* Datos: marca los campos inválidos y enfoca el primero. Recibe pares de campo y mensaje. */
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

/* Datos: elige el mensaje que se muestra al fallar una solicitud. Recibe el error. */
function textoErrorApi(error) {
    if (error instanceof TypeError) {
        return 'No hay conexión con el servidor. Revisa que Spring Boot esté corriendo en el puerto 8081.';
    }
    return (error && error.message) || 'No se pudo completar la operación.';
}

if (typeof module !== 'undefined') {
    module.exports = { Validacion: Validacion, textoErrorApi: textoErrorApi };
}
