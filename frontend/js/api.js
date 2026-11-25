/**
 * Envía solicitudes a Spring Boot y prepara los mensajes de error.
 *
 * @author Equipo de Gestión de Cultivos
 */
class Api {
    /**
     * Prepara el cliente de la API.
     *
     * @param {string} urlBase - Dirección base de la API.
     */
    constructor(urlBase) {
        this.urlBase = urlBase;
    }

    /**
     * Envía la solicitud y devuelve el contenido de la respuesta.
     *
     * @param {string} ruta - Ruta de la operación, después de la URL base.
     * @param {string} [metodo=GET] - Método HTTP.
     * @param {Object} [datos] - Cuerpo de la solicitud.
     */
    async pedir(ruta, metodo, datos) {
        const opciones = { method: metodo || 'GET', credentials: 'include' };
        if (datos) {
            opciones.headers = { 'Content-Type': 'application/json' };
            opciones.body = JSON.stringify(datos);
        }
        const respuesta = await fetch(this.urlBase + ruta, opciones);
        const texto = await respuesta.text();
        let contenido = null;
        try {
            contenido = texto ? JSON.parse(texto) : null;
        } catch (error) {
            contenido = null;
        }
        if (!respuesta.ok) {
            throw new Error(contenido && contenido.mensaje
                ? contenido.mensaje
                : 'No se pudo completar la solicitud (' + respuesta.status + ').');
        }
        return contenido;
    }

    /**
     * Prepara el mensaje cuando falla una solicitud.
     *
     * @param {Error} error - Error al intentar la solicitud.
     */
    mensajeError(error) {
        if (error instanceof TypeError) {
            return 'No se pudo conectar con el API. Verifica que Spring Boot esté iniciado en http://localhost:8081.';
        }
        return error && error.message ? error.message : 'No se pudo completar la operación.';
    }
}

/** Cliente de la API que comparten las pantallas. */
const apiCultivos = new Api('http://localhost:8081/api');

/**
 * Envía una solicitud desde las pantallas que usan la API compartida.
 *
 * @param {string} ruta - Ruta de la operación, después de la URL base.
 * @param {string} [metodo=GET] - Método HTTP.
 * @param {Object} [datos] - Cuerpo de la solicitud.
 */
async function pedirApi(ruta, metodo, datos) {
    return apiCultivos.pedir(ruta, metodo, datos);
}

/**
 * Devuelve el mensaje que la pantalla puede mostrar.
 *
 * @param {Error} error - Error al intentar la solicitud.
 */
function errorApi(error) {
    return apiCultivos.mensajeError(error);
}
