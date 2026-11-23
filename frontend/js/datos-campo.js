/*
 * ARCHIVO: js/datos-campo.js
 * CAPA: FRONTEND (lógica compartida del trabajador). Carga con Fetch (pedirApi de js/api.js)
 *   los cultivos, terrenos y parcelas, y arma textos y listas que usan varias pantallas.
 * BACKEND: GET /cultivos, GET /terrenos, GET /parcelas/terreno/{id}, GET /usuarios.
 * DEPENDE DE: js/api.js
 */

var Campo = (function () {

    var datos = { cultivos: [], parcelas: {}, terrenos: [] };

    /* Carga cultivos y parcelas en paralelo. Devuelve una promesa con { cultivos, parcelas, terrenos }. */
    function cargar() {
        return Promise.all([pedirApi('/cultivos'), pedirApi('/terrenos')]).then(function (r) {
            datos.cultivos = r[0] || [];
            datos.terrenos = r[1] || [];
            datos.parcelas = {};
            return Promise.all(datos.terrenos.map(function (terreno) {
                return pedirApi('/parcelas/terreno/' + encodeURIComponent(terreno.id)).then(function (lista) {
                    (lista || []).forEach(function (parcela) {
                        datos.parcelas[parcela.idParcela] = {
                            nombre: parcela.nombre,
                            idTerreno: terreno.id,
                            terreno: terreno.nombre
                        };
                    });
                });
            }));
        }).then(function () {
            return datos;
        });
    }

    function cultivoPorId(id) {
        for (var i = 0; i < datos.cultivos.length; i++) {
            if (String(datos.cultivos[i].id) === String(id)) {
                return datos.cultivos[i];
            }
        }
        return null;
    }

    function ubicacion(cultivo) {
        var parcela = cultivo ? datos.parcelas[cultivo.idParcela] : null;
        return parcela ? parcela.nombre + ' · ' + parcela.terreno : 'Parcela #' + (cultivo ? cultivo.idParcela : '?');
    }

    function nombreCultivo(cultivoOId) {
        var cultivo = typeof cultivoOId === 'object' ? cultivoOId : cultivoPorId(cultivoOId);
        if (!cultivo) {
            return 'Cultivo #' + cultivoOId;
        }
        return cultivo.nombre + ' (' + ubicacion(cultivo) + ')';
    }

    function activos() {
        return datos.cultivos.filter(function (c) { return c.estado !== 'finalizado'; });
    }

    /* Llena un <select> con los cultivos (solo activos salvo que se pida lo contrario). */
    function llenarSelectCultivos(select, opciones) {
        var o = opciones || {};
        var lista = o.todos ? datos.cultivos : activos();
        var anterior = select.value;
        select.innerHTML = '';
        var inicial = document.createElement('option');
        inicial.value = '';
        inicial.textContent = o.textoInicial || (lista.length ? 'Selecciona un cultivo' : 'No hay cultivos activos');
        select.appendChild(inicial);
        lista.forEach(function (cultivo) {
            var opcion = document.createElement('option');
            opcion.value = cultivo.id;
            opcion.textContent = nombreCultivo(cultivo) + (cultivo.etapaFenologica ? ' · ' + cultivo.etapaFenologica : '');
            select.appendChild(opcion);
        });
        if (anterior && cultivoPorId(anterior)) {
            select.value = anterior;
        }
        return lista.length;
    }

    /* Mapa idUsuario -> nombre, para mostrar quién registró cada actividad. */
    function cargarNombresUsuarios() {
        return pedirApi('/usuarios').then(function (lista) {
            var mapa = {};
            (lista || []).forEach(function (u) { mapa[u.idUsuario] = u.nombreUsuario; });
            return mapa;
        }).catch(function () {
            return {};
        });
    }

    return {
        cargar: cargar,
        datos: datos,
        cultivoPorId: cultivoPorId,
        nombreCultivo: nombreCultivo,
        ubicacion: ubicacion,
        activos: activos,
        llenarSelectCultivos: llenarSelectCultivos,
        cargarNombresUsuarios: cargarNombresUsuarios
    };
})();

/* Utilidades de tabla compartidas. */
function celda(fila, texto) {
    var td = document.createElement('td');
    td.textContent = texto === null || texto === undefined || texto === '' ? '—' : texto;
    fila.appendChild(td);
    return td;
}

function filaSinDatos(cuerpo, columnas, texto) {
    var fila = document.createElement('tr');
    var td = document.createElement('td');
    td.colSpan = columnas;
    td.textContent = texto;
    fila.appendChild(td);
    cuerpo.appendChild(fila);
}

function cantidadTexto(valor, unidad) {
    if (valor === null || valor === undefined || valor === '') {
        return '—';
    }
    return Number(valor).toLocaleString('es-MX', { maximumFractionDigits: 2 }) + (unidad ? ' ' + unidad : '');
}
