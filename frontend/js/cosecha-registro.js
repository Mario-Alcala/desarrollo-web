/*
 * ARCHIVO: js/cosecha-registro.js
 * CAPA: FRONTEND (lógica + DOM). Acción "Registrar cosecha" del trabajador, dentro de cultivos.html.
 * CASCARÓN?: NO. Habla con el backend real.
 * BACKEND: GET /api/cultivos (llena el select), GET /api/cosechas (lista "Mis últimos lotes"),
 *          POST /api/cosechas (crea el lote: kilos disponibles = kilos cosechados).
 * REGLAS: el cultivo se elige de los existentes; el trabajador sale de la sesión (sesion.js), no de un selector;
 *         maduración solo verde o maduro; kilos > 0 con máximo 2 decimales (DECIMAL(10,2)); ubicación obligatoria.
 *         El lote aparece solo en la Bodega del administrador (GET /api/cosechas): no se captura otra vez ahí.
 * DEPENDE DE: js/api.js (pedirApi) y js/sesion.js (usuarioActual), cargados antes en cultivos.html.
 * LE FALTA: js/ap.js todavía no guarda la sesión (usuarioActual() devuelve null hasta que el login la guarde).
 *           El backend no valida la ubicación ni que el usuario exista (un id inexistente da error 500 por la llave foránea).
 */

var MADURACIONES = ['verde', 'maduro'];
var MAX_KILOS = 99999999.99;
var MAX_UBICACION = 100;

function dosDigitos(n) {
    return (n < 10 ? '0' : '') + n;
}

function hoyLocal() {
    var d = new Date();
    return d.getFullYear() + '-' + dosDigitos(d.getMonth() + 1) + '-' + dosDigitos(d.getDate());
}

function fechaExiste(texto) {
    var p = texto.split('-');
    var anio = Number(p[0]);
    var mes = Number(p[1]);
    var dia = Number(p[2]);
    var d = new Date(Date.UTC(anio, mes - 1, dia));
    return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

/* Devuelve "" si los datos son válidos, o el texto del primer error. `hoy` viene como AAAA-MM-DD. */
function validarCosecha(datos, hoy) {
    var cultivo = Number(datos.idCultivo);
    if (!datos.idCultivo || !Number.isInteger(cultivo) || cultivo <= 0) {
        return 'Selecciona un cultivo.';
    }

    var fecha = datos.fechaCosecha || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !fechaExiste(fecha)) {
        return 'Indica una fecha de cosecha válida.';
    }
    if (fecha > hoy) {
        return 'La fecha de cosecha no puede ser futura.';
    }

    var kilos = String(datos.kilos === undefined || datos.kilos === null ? '' : datos.kilos).trim();
    if (kilos === '') {
        return 'Indica los kilos cosechados.';
    }
    if (!/^\d+(\.\d{1,2})?$/.test(kilos)) {
        return 'Los kilos deben ser un número positivo con máximo 2 decimales.';
    }
    if (Number(kilos) <= 0) {
        return 'Los kilos cosechados deben ser mayores que cero.';
    }
    if (Number(kilos) > MAX_KILOS) {
        return 'Los kilos cosechados son demasiado grandes.';
    }

    if (MADURACIONES.indexOf(datos.maduracion) === -1) {
        return 'Elige la maduración del lote: verde o maduro.';
    }

    var ubicacion = String(datos.ubicacion || '').trim();
    if (ubicacion === '') {
        return 'Indica la ubicación en bodega.';
    }
    if (ubicacion.length > MAX_UBICACION) {
        return 'La ubicación en bodega no puede pasar de ' + MAX_UBICACION + ' caracteres.';
    }
    return '';
}

/* Cuerpo del POST /api/cosechas. El trabajador sale de la sesión; los kilos disponibles empiezan iguales a los cosechados. */
function armarCosecha(datos, usuario) {
    var kilos = Number(String(datos.kilos).trim());
    return {
        idCultivo: Number(datos.idCultivo),
        idUsuario: usuario.idUsuario,
        fechaCosecha: datos.fechaCosecha,
        cantidadCosechada: kilos,
        cantidadDisponible: kilos,
        estadoMaduracion: datos.maduracion,
        ubicacionBodega: String(datos.ubicacion).trim()
    };
}

function mensajeError(error) {
    if (error && error.name === 'TypeError') {
        return 'No se pudo conectar con el backend (¿está encendido en el puerto 8081?).';
    }
    return error && error.message ? error.message : 'No se pudo registrar la cosecha.';
}

/* `api` es pedirApi en el navegador; se recibe como parámetro para poder probarlo sin red. */
function registrarCosecha(datos, usuario, hoy, api) {
    if (!usuario) {
        return Promise.resolve({ ok: false, error: 'Inicia sesión para registrar una cosecha.' });
    }
    var error = validarCosecha(datos, hoy);
    if (error) {
        return Promise.resolve({ ok: false, error: error });
    }
    return api('/cosechas', 'POST', armarCosecha(datos, usuario))
        .then(function () { return { ok: true, error: '' }; })
        .catch(function (fallo) { return { ok: false, error: mensajeError(fallo) }; });
}

/* Opciones del select: solo cultivos que no estén finalizados. Acepta id o idCultivo. */
function opcionesCultivos(lista) {
    return (lista || [])
        .filter(function (c) { return c.estado !== 'finalizado'; })
        .map(function (c) {
            var id = c.id !== undefined ? c.id : c.idCultivo;
            var texto = c.nombre || ('Cultivo ' + id);
            if (c.idParcela !== undefined && c.idParcela !== null) {
                texto += ' · parcela ' + c.idParcela;
            }
            return { valor: String(id), texto: texto };
        });
}

/* Últimos lotes registrados por este trabajador, el más reciente primero. */
function lotesDelUsuario(lista, idUsuario, maximo) {
    return (lista || [])
        .filter(function (c) { return c.idUsuario === idUsuario; })
        .sort(function (a, b) { return b.idCosecha - a.idCosecha; })
        .slice(0, maximo || 10);
}

/* ---------- Pantalla (solo corre en el navegador) ---------- */

function iniciarRegistroCosecha() {
    var formulario = document.getElementById('formulario-cosecha');
    if (!formulario) {
        return;
    }
    var selectCultivo = document.getElementById('c-cultivo');
    var campoFecha = document.getElementById('c-fecha');
    var campoKilos = document.getElementById('c-kilos');
    var campoMaduracion = document.getElementById('c-maduracion');
    var campoUbicacion = document.getElementById('c-ubicacion');
    var boton = document.getElementById('guardar-cosecha');
    var mensaje = document.getElementById('mensaje-cosecha');
    var quien = document.getElementById('quien-registra');
    var cuerpoLotes = document.getElementById('lotes-cosecha');

    campoFecha.value = hoyLocal();
    campoFecha.max = hoyLocal();

    var usuario = usuarioActual();
    if (usuario) {
        quien.textContent = 'Registra: ' + (usuario.nombre || ('usuario ' + usuario.idUsuario));
    } else {
        quien.textContent = 'Inicia sesión para registrar una cosecha.';
        boton.disabled = true;
    }

    function dibujarLotes(lista) {
        cuerpoLotes.innerHTML = '';
        var lotes = usuario ? lotesDelUsuario(lista, usuario.idUsuario, 10) : [];
        lotes.forEach(function (lote) {
            var fila = document.createElement('tr');
            [lote.idCosecha, lote.nombreCultivo || lote.idCultivo, lote.fechaCosecha, lote.cantidadCosechada,
                lote.cantidadDisponible, lote.estadoMaduracion, lote.ubicacionBodega].forEach(function (valor) {
                var celda = document.createElement('td');
                celda.textContent = valor === null || valor === undefined ? '—' : valor;
                fila.appendChild(celda);
            });
            cuerpoLotes.appendChild(fila);
        });
        if (!lotes.length) {
            var vacia = document.createElement('tr');
            var celdaVacia = document.createElement('td');
            celdaVacia.colSpan = 7;
            celdaVacia.textContent = 'Todavía no has registrado lotes.';
            vacia.appendChild(celdaVacia);
            cuerpoLotes.appendChild(vacia);
        }
    }

    function cargarLotes() {
        return pedirApi('/cosechas').then(dibujarLotes).catch(function (error) {
            mensaje.textContent = mensajeError(error);
        });
    }

    function cargarCultivos() {
        return pedirApi('/cultivos').then(function (lista) {
            var opciones = opcionesCultivos(lista);
            selectCultivo.innerHTML = '';
            var inicial = document.createElement('option');
            inicial.value = '';
            inicial.textContent = opciones.length ? 'Selecciona un cultivo' : 'No hay cultivos disponibles';
            selectCultivo.appendChild(inicial);
            opciones.forEach(function (o) {
                var opcion = document.createElement('option');
                opcion.value = o.valor;
                opcion.textContent = o.texto;
                selectCultivo.appendChild(opcion);
            });
            if (!opciones.length) {
                mensaje.textContent = 'No hay cultivos registrados. Pide al administrador que registre uno.';
            }
        }).catch(function (error) {
            mensaje.textContent = mensajeError(error);
        });
    }

    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();
        mensaje.textContent = '';
        boton.disabled = true;
        var datos = {
            idCultivo: selectCultivo.value,
            fechaCosecha: campoFecha.value,
            kilos: campoKilos.value,
            maduracion: campoMaduracion.value,
            ubicacion: campoUbicacion.value
        };
        registrarCosecha(datos, usuarioActual(), hoyLocal(), pedirApi).then(function (resultado) {
            if (resultado.ok) {
                formulario.reset();
                campoFecha.value = hoyLocal();
                mensaje.textContent = 'Lote registrado. Sus kilos disponibles son los cosechados y ya aparece en la Bodega del administrador.';
                return cargarLotes();
            }
            mensaje.textContent = resultado.error;
        }).finally(function () {
            boton.disabled = !usuario;
        });
    });

    cargarCultivos();
    cargarLotes();
}

if (typeof document !== 'undefined') {
    iniciarRegistroCosecha();
}