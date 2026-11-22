/*
 * ARCHIVO: js/consulta-insumos.js
 * CAPA: FRONTEND (lógica). Pantalla de SOLO CONSULTA del trabajador (abonos y fertilizantes).
 * QUÉ USA DEL BACKEND: GET <data-ruta> (/abonos o /fertilizantes) y GET /proveedores, con pedirApi() de js/api.js.
 * REGLA DEL DOCUMENTO: el trabajador no define productos ni escribe proveedores; eso lo administra el
 *   administrador desde el inventario. Aquí solo se consulta.
 * POR QUÉ NO USA operaciones.js: ese motor exige un formulario y siempre agrega Editar y Eliminar.
 * LE FALTA: mostrar existencias por lote (hay que confirmar los campos de /inventario).
 */

var panelConsulta = document.getElementById('consulta');
var rutaConsulta = panelConsulta.dataset.ruta;
var nombreLista = panelConsulta.dataset.nombre;
var mensajeConsulta = document.getElementById('mensaje-operacion');
var cuerpoConsulta = document.getElementById('registros-operacion');
var columnasConsulta = panelConsulta.querySelectorAll('th[data-campo]');

function textoError(error) {
    if (error instanceof TypeError) {
        return 'No hay conexión con el servidor. Revisa que el backend esté corriendo.';
    }
    return error.message || 'No se pudo cargar la información.';
}

function mapaProveedores(lista) {
    var mapa = {};
    (lista || []).forEach(function (proveedor) {
        mapa[proveedor.idProveedor] = proveedor.nombreEmpresa;
    });
    return mapa;
}

function dibujarConsulta(registros, proveedores) {
    cuerpoConsulta.innerHTML = '';

    registros.forEach(function (registro) {
        var fila = document.createElement('tr');
        columnasConsulta.forEach(function (columna) {
            var campo = columna.dataset.campo;
            var valor = registro[campo];
            if (campo === 'idProveedor') {
                valor = proveedores[valor];
            }
            var celda = document.createElement('td');
            celda.textContent = valor === null || valor === undefined || valor === '' ? '—' : valor;
            fila.appendChild(celda);
        });
        cuerpoConsulta.appendChild(fila);
    });

    if (!registros.length) {
        var filaVacia = document.createElement('tr');
        var celdaVacia = document.createElement('td');
        celdaVacia.colSpan = columnasConsulta.length;
        celdaVacia.textContent = 'No hay ' + nombreLista + ' registrados. Los da de alta el administrador.';
        filaVacia.appendChild(celdaVacia);
        cuerpoConsulta.appendChild(filaVacia);
    }
}

function cargarConsulta() {
    mensajeConsulta.textContent = 'Cargando...';
    return Promise.all([pedirApi(rutaConsulta), pedirApi('/proveedores')])
        .then(function (resultados) {
            dibujarConsulta(resultados[0] || [], mapaProveedores(resultados[1]));
            mensajeConsulta.textContent = '';
        })
        .catch(function (error) {
            mensajeConsulta.textContent = textoError(error);
        });
}

document.getElementById('actualizar-operacion').onclick = cargarConsulta;
cargarConsulta();