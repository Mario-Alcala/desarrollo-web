/* Datos: contiene las solicitudes compartidas a Spring Boot y sus mensajes de error. No recibe atributos. */

const urlApi = 'http://localhost:8081/api';

/* Datos: envía una solicitud a la API y devuelve su respuesta. Recibe ruta, método y datos opcionales. */
async function pedirApi(ruta, metodo, datos) {
    const opciones = { method: metodo || 'GET', credentials: 'include' };
    if (datos) {
        opciones.headers = { 'Content-Type': 'application/json' };
        opciones.body = JSON.stringify(datos);
    }
    const respuesta = await fetch(urlApi + ruta, opciones);
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

/* Datos: prepara un mensaje para mostrar cuando falla la solicitud. Recibe el error. */
function errorApi(error) {
    if (error instanceof TypeError) {
        return 'No se pudo conectar con el API. Verifica que Spring Boot esté iniciado en http://localhost:8081.';
    }
    return error && error.message ? error.message : 'No se pudo completar la operación.';
}
