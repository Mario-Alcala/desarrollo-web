var hostApi = window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
var urlApi = 'http://' + hostApi + ':8081/api';

function pedirApi(ruta, metodo, datos) {
    var opciones = { method: metodo || 'GET', credentials: 'include' };
    if (datos) {
        opciones.headers = { 'Content-Type': 'application/json' };
        opciones.body = JSON.stringify(datos);
    }
    return fetch(urlApi + ruta, opciones).then(function (respuesta) {
        return respuesta.text().then(function (texto) {
            var contenido = null;
            try { contenido = texto ? JSON.parse(texto) : null; } catch (error) { contenido = null; }
            if (!respuesta.ok) {
                var error = new Error(contenido && contenido.mensaje ? contenido.mensaje : 'No se pudo completar la solicitud (' + respuesta.status + ').');
                error.estado = respuesta.status;
                throw error;
            }
            return contenido;
        });
    });
}

function errorApi(error) {
    if (error instanceof TypeError) {
        return '';
    }
    return 'No se pudo completar la operación.';
}
