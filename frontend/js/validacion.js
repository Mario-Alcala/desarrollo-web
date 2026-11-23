/*
 * ARCHIVO: js/validacion.js
 * CAPA: FRONTEND (lógica compartida). Reglas de validación de los formularios del trabajador.
 * Todas las funciones devuelven '' si el dato es válido o el texto del error.
 * Las mismas reglas las vuelve a revisar el backend; aquí se validan antes de llamar al API
 * para avisar al trabajador sin esperar la respuesta.
 * Pruebas: node --test frontend/pruebas/validacion.test.js
 */

var Validacion = (function () {

    function capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function dosDigitos(n) {
        return (n < 10 ? '0' : '') + n;
    }

    /* Fecha local de hoy como AAAA-MM-DD (no usa UTC para no cambiar de día en la noche). */
    function hoy() {
        var d = new Date();
        return d.getFullYear() + '-' + dosDigitos(d.getMonth() + 1) + '-' + dosDigitos(d.getDate());
    }

    function sumarDias(fecha, dias) {
        var p = fecha.split('-');
        var d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + dias));
        return d.getUTCFullYear() + '-' + dosDigitos(d.getUTCMonth() + 1) + '-' + dosDigitos(d.getUTCDate());
    }

    function diasEntre(desde, hasta) {
        var a = desde.split('-');
        var b = hasta.split('-');
        var ms = Date.UTC(Number(b[0]), Number(b[1]) - 1, Number(b[2])) - Date.UTC(Number(a[0]), Number(a[1]) - 1, Number(a[2]));
        return Math.round(ms / 86400000);
    }

    function fechaExiste(texto) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(texto || '')) {
            return false;
        }
        var p = texto.split('-');
        var anio = Number(p[0]);
        var mes = Number(p[1]);
        var dia = Number(p[2]);
        var d = new Date(Date.UTC(anio, mes - 1, dia));
        return anio >= 1900 && d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
    }

    /* opciones: { nombre, noFutura, hoy, minima, nombreMinima } */
    function fecha(texto, opciones) {
        var o = opciones || {};
        var nombre = o.nombre || 'la fecha';
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

    /* opciones: { nombre, decimales (2), maximo, mayorQueCero (true) } */
    function numero(valor, opciones) {
        var o = opciones || {};
        var nombre = o.nombre || 'la cantidad';
        var decimales = o.decimales === undefined ? 2 : o.decimales;
        var texto = String(valor === undefined || valor === null ? '' : valor).trim();
        if (texto === '') {
            return 'Indica ' + nombre + '.';
        }
        var patron = decimales > 0
            ? new RegExp('^\\d+(\\.\\d{1,' + decimales + '})?$')
            : /^\d+$/;
        if (!patron.test(texto)) {
            return decimales > 0
                ? 'Escribe ' + nombre + ' como número positivo con máximo ' + decimales + ' decimales.'
                : 'Escribe ' + nombre + ' como número entero positivo.';
        }
        var n = Number(texto);
        if (o.mayorQueCero !== false && n <= 0) {
            return 'Indica ' + nombre + ' mayor que cero.';
        }
        if (o.maximo !== undefined && o.maximo !== null && n > Number(o.maximo)) {
            return 'Indica ' + nombre + ' de máximo ' + Number(o.maximo).toLocaleString('es-MX') + (o.unidad ? ' ' + o.unidad : '') + '.';
        }
        return '';
    }

    /* opciones: { nombre, maximo, obligatorio (true) } */
    function texto(valor, opciones) {
        var o = opciones || {};
        var limpio = String(valor || '').trim();
        if (o.obligatorio !== false && !limpio) {
            return 'Escribe ' + (o.nombre || 'el texto') + '.';
        }
        if (o.maximo && limpio.length > o.maximo) {
            return 'Escribe máximo ' + o.maximo + ' caracteres en ' + (o.nombre || 'el texto') + '.';
        }
        return '';
    }

    function opcion(valor, permitidas, nombre) {
        return permitidas.indexOf(valor) === -1 ? 'Elige ' + (nombre || 'una opción') + '.' : '';
    }

    function idValido(valor, nombre) {
        var n = Number(valor);
        return valor && Number.isInteger(n) && n > 0 ? '' : 'Selecciona ' + (nombre || 'un registro') + '.';
    }

    /* Recorre una lista de [campo, error] y marca el primero con error (para lectores de pantalla). */
    function primerError(pares) {
        for (var i = 0; i < pares.length; i++) {
            var campo = pares[i][0];
            var error = pares[i][1];
            if (campo && campo.setAttribute) {
                if (error) {
                    campo.setAttribute('aria-invalid', 'true');
                } else {
                    campo.removeAttribute('aria-invalid');
                }
            }
        }
        for (var j = 0; j < pares.length; j++) {
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

/* Mensaje de error de pedirApi() para mostrarlo al usuario. */
function textoErrorApi(error) {
    if (error instanceof TypeError) {
        return 'No hay conexión con el servidor. Revisa que Spring Boot esté corriendo en el puerto 8081.';
    }
    return (error && error.message) || 'No se pudo completar la operación.';
}

if (typeof module !== 'undefined') {
    module.exports = { Validacion: Validacion, textoErrorApi: textoErrorApi };
}
