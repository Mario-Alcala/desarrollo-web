/* Datos: este archivo comparte las consultas de cultivos, terrenos, parcelas y usuarios entre pantallas de campo. No recibe atributos. */

const Campo = crearCampo();

/* Datos: prepara el estado y las consultas compartidas de campo. No recibe atributos. */
function crearCampo() {
    const datos = { cultivos: [], parcelas: {}, terrenos: [] };

    /* Datos: esta función consulta cultivos, terrenos y parcelas desde la API. No recibe atributos. */
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

    /* Datos: esta función busca un cultivo de la consulta. Recibe el ID del cultivo. */
    function cultivoPorId(id) {
        return datos.cultivos.find(cultivo => String(cultivo.id) === String(id)) || null;
    }

    /* Datos: esta función obtiene el texto con parcela y terreno. Recibe el cultivo. */
    function ubicacion(cultivo) {
        const parcela = cultivo ? datos.parcelas[cultivo.idParcela] : null;
        return parcela ? parcela.nombre + ' · ' + parcela.terreno : 'Parcela #' + (cultivo ? cultivo.idParcela : '?');
    }

    /* Datos: esta función forma el nombre de un cultivo con su ubicación. Recibe el cultivo o su ID. */
    function nombreCultivo(cultivoOId) {
        const cultivo = typeof cultivoOId === 'object' ? cultivoOId : cultivoPorId(cultivoOId);
        if (!cultivo) {
            return 'Cultivo #' + cultivoOId;
        }
        return cultivo.nombre + ' (' + ubicacion(cultivo) + ')';
    }

    /* Datos: esta función devuelve los cultivos que no están finalizados. No recibe atributos. */
    function activos() {
        return datos.cultivos.filter(function (c) { return c.estado !== 'finalizado'; });
    }

    /* Datos: esta función carga opciones de cultivo. Recibe el selector y las opciones de filtrado. */
    function llenarSelectCultivos(select, opciones) {
        const o = opciones || {};
        const lista = o.todos ? datos.cultivos : activos();
        const anterior = select.value;
        select.innerHTML = '';
        const inicial = document.createElement('option');
        inicial.value = '';
        inicial.textContent = o.textoInicial || (lista.length ? 'Selecciona un cultivo' : 'No hay cultivos activos');
        select.appendChild(inicial);
        lista.forEach(function (cultivo) {
            const opcion = document.createElement('option');
            opcion.value = cultivo.id;
            opcion.textContent = nombreCultivo(cultivo) + (cultivo.etapaFenologica ? ' · ' + cultivo.etapaFenologica : '');
            select.appendChild(opcion);
        });
        if (anterior && cultivoPorId(anterior)) {
            select.value = anterior;
        }
        return lista.length;
    }

    /* Datos: esta función consulta la API para relacionar cada usuario con su nombre. No recibe atributos. */
    function cargarNombresUsuarios() {
        return pedirApi('/usuarios').then(function (lista) {
            const mapa = {};
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
}

/* Datos: esta función agrega una celda a la tabla. Recibe la fila y el texto. */
function celda(fila, texto) {
    const td = document.createElement('td');
    td.textContent = texto === null || texto === undefined || texto === '' ? '—' : texto;
    fila.appendChild(td);
    return td;
}

/* Datos: esta función agrega una fila con un mensaje. Recibe el cuerpo de tabla, número de columnas y texto. */
function filaSinDatos(cuerpo, columnas, texto) {
    const fila = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columnas;
    td.textContent = texto;
    fila.appendChild(td);
    cuerpo.appendChild(fila);
}

/* Datos: esta función formatea una cantidad con su unidad. Recibe la cantidad y la unidad. */
function cantidadTexto(valor, unidad) {
    if (valor === null || valor === undefined || valor === '') {
        return '—';
    }
    return Number(valor).toLocaleString('es-MX', { maximumFractionDigits: 2 }) + (unidad ? ' ' + unidad : '');
}
