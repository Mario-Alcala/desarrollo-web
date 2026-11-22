var urlApi = 'http://localhost:8081/api';

async function pedirApi(ruta, metodo, datos) {
    var opciones = { method: metodo || 'GET' };
    if (datos) {
        opciones.headers = { 'Content-Type': 'application/json' };
        opciones.body = JSON.stringify(datos);
    }
    var respuesta = await fetch(urlApi + ruta, opciones);
    var texto = await respuesta.text();
    var contenido = null;
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

function errorApi(error) {
    if (error instanceof TypeError) {
        return 'No se pudo conectar con el API. Verifica que Spring Boot esté iniciado en http://localhost:8081.';
    }
    return error && error.message ? error.message : 'No se pudo completar la operación.';
}
