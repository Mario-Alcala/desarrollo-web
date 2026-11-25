/**
 * Comparte las consultas de cultivos, terrenos, parcelas y usuarios entre pantallas de campo.
 *
 * @author Equipo de Gestión de Cultivos
 */
class DatosCampo {
    /** Inicializa las listas de cultivos, parcelas y terrenos. */
    constructor() {
        this.datos = { cultivos: [], parcelas: {}, terrenos: [] };
    }

    /**
     * Consulta cultivos, terrenos y parcelas desde la API.
     */
    cargar() {
        const datos = this.datos;
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

    /**
     * Busca un cultivo de la consulta.
     *
     * @param id - El ID del cultivo.
     */
    cultivoPorId(id) {
        const datos = this.datos;
        return datos.cultivos.find(cultivo => String(cultivo.id) === String(id)) || null;
    }

    /**
     * Obtiene el texto con parcela y terreno.
     *
     * @param cultivo - El cultivo.
     */
    ubicacion(cultivo) {
        const datos = this.datos;
        const parcela = cultivo ? datos.parcelas[cultivo.idParcela] : null;
        return parcela ? parcela.nombre + ' · ' + parcela.terreno : 'Parcela #' + (cultivo ? cultivo.idParcela : '?');
    }

    /**
     * Forma el nombre de un cultivo con su ubicación.
     *
     * @param cultivoOId - El cultivo o su ID.
     */
    nombreCultivo(cultivoOId) {
        const cultivo = typeof cultivoOId === 'object' ? cultivoOId : this.cultivoPorId(cultivoOId);
        if (!cultivo) {
            return 'Cultivo #' + cultivoOId;
        }
        return cultivo.nombre + ' (' + this.ubicacion(cultivo) + ')';
    }

    /**
     * Devuelve los cultivos que no están finalizados.
     */
    activos() {
        const datos = this.datos;
        return datos.cultivos.filter(function (c) { return c.estado !== 'finalizado'; });
    }

    /**
     * Carga opciones de cultivo.
     *
     * @param select - Selector que se llena con los cultivos.
     * @param [opciones] - Opciones de filtrado y texto inicial del selector.
     */
    llenarSelectCultivos(select, opciones) {
        const datos = this.datos;
        const o = opciones || {};
        const lista = o.todos ? datos.cultivos : this.activos();
        const anterior = select.value;
        select.innerHTML = '';
        const inicial = document.createElement('option');
        inicial.value = '';
        inicial.textContent = o.textoInicial || (lista.length ? 'Selecciona un cultivo' : 'No hay cultivos activos');
        select.appendChild(inicial);
        lista.forEach(cultivo => {
            const opcion = document.createElement('option');
            opcion.value = cultivo.id;
            opcion.textContent = this.nombreCultivo(cultivo) + (cultivo.etapaFenologica ? ' · ' + cultivo.etapaFenologica : '');
            select.appendChild(opcion);
        });
        if (anterior && this.cultivoPorId(anterior)) {
            select.value = anterior;
        }
        return lista.length;
    }

    /**
     * Consulta la API para relacionar cada usuario con su nombre.
     */
    cargarNombresUsuarios() {
        return pedirApi('/usuarios').then(function (lista) {
            const mapa = {};
            (lista || []).forEach(function (u) { mapa[u.idUsuario] = u.nombreUsuario; });
            return mapa;
        }).catch(function () {
            return {};
        });
    }
}

/** Datos que comparten las pantallas de campo. */
const Campo = new DatosCampo();

/**
 * Agrega una celda a la tabla.
 *
 * @param fila - Fila de la tabla que recibe la celda.
 * @param texto - Texto que se quiere mostrar.
 */
function celda(fila, texto) {
    const td = document.createElement('td');
    td.textContent = texto === null || texto === undefined || texto === '' ? '—' : texto;
    fila.appendChild(td);
    return td;
}

/**
 * Agrega una fila con un mensaje.
 *
 * @param cuerpo - Cuerpo de la tabla.
 * @param columnas - Cantidad de columnas que cubre la celda.
 * @param texto - Texto que se quiere mostrar.
 */
function filaSinDatos(cuerpo, columnas, texto) {
    const fila = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columnas;
    td.textContent = texto;
    fila.appendChild(td);
    cuerpo.appendChild(fila);
}

/**
 * Formatea una cantidad con su unidad.
 *
 * @param valor - Cantidad que se quiere formatear.
 * @param unidad - Unidad que se agrega a la cantidad.
 */
function cantidadTexto(valor, unidad) {
    if (valor === null || valor === undefined || valor === '') {
        return '—';
    }
    return Number(valor).toLocaleString('es-MX', { maximumFractionDigits: 2 }) + (unidad ? ' ' + unidad : '');
}
