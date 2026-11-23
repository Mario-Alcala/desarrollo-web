/*
 * ARCHIVO: js/riegos-trabajador.js
 * CAPA: FRONTEND (DOM). Pantalla Riego del trabajador (empleado/riegos.html).
 * BACKEND (Fetch con pedirApi): GET /cultivos, /terrenos, /parcelas/terreno/{id}, /riegos, /usuarios; POST /riegos.
 * REGLAS (descripción del proyecto): el riego se relaciona con el cultivo; el terreno se obtiene por la parcela;
 *   quien registra sale de la sesión (riegos.id_usuario). Fecha no futura ni anterior a la siembra;
 *   agua > 0 con máximo 2 decimales.
 * DEPENDE DE: api.js, sesion.js, validacion.js, datos-campo.js
 */

var usuarioRiego = usuarioActual();
var formRiego = document.getElementById('formulario-riego');
var selectCultivoRiego = document.getElementById('riego-cultivo');
var campoFechaRiego = document.getElementById('riego-fecha');
var campoCantidadRiego = document.getElementById('riego-cantidad');
var selectUnidadRiego = document.getElementById('riego-unidad');
var selectMetodoRiego = document.getElementById('riego-metodo');
var campoNotasRiego = document.getElementById('riego-notas');
var mensajeRiego = document.getElementById('mensaje-riego');
var mensajeGeneral = document.getElementById('mensaje');
var filtroRiegos = document.getElementById('filtro-cultivo');
var riegos = [];
var nombresUsuarios = {};

function mostrarUbicacion() {
    var cultivo = Campo.cultivoPorId(selectCultivoRiego.value);
    document.getElementById('riego-ubicacion').textContent = cultivo
        ? 'Ubicación: ' + Campo.ubicacion(cultivo) + (cultivo.fechaSiembra ? ' · Siembra: ' + cultivo.fechaSiembra : '')
        : '';
    campoFechaRiego.min = cultivo && cultivo.fechaSiembra ? cultivo.fechaSiembra : '';
}

function dibujarRiegos() {
    var cuerpo = document.getElementById('lista-riegos');
    cuerpo.innerHTML = '';
    var visibles = riegos.filter(function (r) {
        return !filtroRiegos.value || String(r.idCultivo) === filtroRiegos.value;
    }).sort(function (a, b) {
        return String(b.fechaRiego).localeCompare(String(a.fechaRiego)) || b.idRiego - a.idRiego;
    });
    var totales = {};
    visibles.forEach(function (r) {
        var fila = document.createElement('tr');
        celda(fila, String(r.fechaRiego).slice(0, 10));
        celda(fila, Campo.nombreCultivo(r.idCultivo));
        celda(fila, cantidadTexto(r.cantidadAgua, r.unidadMedida));
        celda(fila, r.metodo);
        celda(fila, nombresUsuarios[r.idUsuario] || (r.idUsuario ? 'Usuario #' + r.idUsuario : ''));
        celda(fila, r.observaciones);
        cuerpo.appendChild(fila);
        var unidad = r.unidadMedida || '';
        totales[unidad] = (totales[unidad] || 0) + Number(r.cantidadAgua || 0);
    });
    if (!visibles.length) {
        filaSinDatos(cuerpo, 6, 'No hay riegos registrados para esta selección.');
    }
    var partes = Object.keys(totales).map(function (u) { return cantidadTexto(totales[u], u); });
    document.getElementById('total-agua').textContent = partes.length ? partes.join(' · ') : '—';
}

function cargarRiegos() {
    mensajeGeneral.textContent = 'Cargando…';
    return Promise.all([Campo.cargar(), pedirApi('/riegos'), Campo.cargarNombresUsuarios()])
        .then(function (r) {
            riegos = r[1] || [];
            nombresUsuarios = r[2];
            var activos = Campo.llenarSelectCultivos(selectCultivoRiego);
            Campo.llenarSelectCultivos(filtroRiegos, { todos: true, textoInicial: 'Todos los cultivos' });
            mostrarUbicacion();
            dibujarRiegos();
            mensajeGeneral.textContent = activos ? '' : 'No hay cultivos activos. Los da de alta el administrador.';
        })
        .catch(function (error) {
            mensajeGeneral.textContent = textoErrorApi(error);
        });
}

formRiego.addEventListener('submit', function (evento) {
    evento.preventDefault();
    mensajeRiego.textContent = '';
    if (!usuarioRiego) {
        mensajeRiego.textContent = 'Inicia sesión para registrar riegos.';
        return;
    }
    var cultivo = Campo.cultivoPorId(selectCultivoRiego.value);
    var error = Validacion.primerError([
        [selectCultivoRiego, cultivo ? '' : 'Selecciona un cultivo activo.'],
        [campoFechaRiego, Validacion.fecha(campoFechaRiego.value, {
            nombre: 'la fecha de riego', noFutura: true,
            minima: cultivo && cultivo.fechaSiembra, nombreMinima: 'la siembra (' + (cultivo && cultivo.fechaSiembra) + ')'
        })],
        [campoCantidadRiego, Validacion.numero(campoCantidadRiego.value, { nombre: 'la cantidad de agua', maximo: 99999999.99 })],
        [selectUnidadRiego, Validacion.opcion(selectUnidadRiego.value, ['litros', 'm3', 'galones'], 'la unidad')],
        [campoNotasRiego, Validacion.texto(campoNotasRiego.value, { nombre: 'las observaciones', maximo: 255, obligatorio: false })]
    ]);
    if (error) {
        mensajeRiego.textContent = error;
        return;
    }
    var boton = document.getElementById('guardar-riego');
    boton.disabled = true;
    pedirApi('/riegos', 'POST', {
        idCultivo: cultivo.id,
        idUsuario: usuarioRiego.idUsuario,
        fechaRiego: campoFechaRiego.value,
        cantidadAgua: Number(campoCantidadRiego.value),
        unidadMedida: selectUnidadRiego.value,
        metodo: selectMetodoRiego.value || null,
        observaciones: campoNotasRiego.value.trim() || null
    }).then(function () {
        formRiego.reset();
        campoFechaRiego.value = Validacion.hoy();
        return cargarRiegos();
    }).then(function () {
        mensajeGeneral.textContent = 'Riego registrado. Ya aparece en la bitácora y en el calendario.';
        mensajeGeneral.className = 'mensaje ok';
    }).catch(function (fallo) {
        mensajeRiego.textContent = textoErrorApi(fallo);
    }).finally(function () {
        boton.disabled = false;
    });
});

selectCultivoRiego.addEventListener('change', mostrarUbicacion);
filtroRiegos.addEventListener('change', dibujarRiegos);
document.getElementById('actualizar').onclick = cargarRiegos;
campoFechaRiego.value = Validacion.hoy();
campoFechaRiego.max = Validacion.hoy();
var cultivoEnUrl = new URLSearchParams(window.location.search).get('cultivo');
cargarRiegos().then(function () {
    if (cultivoEnUrl && Campo.cultivoPorId(cultivoEnUrl)) {
        selectCultivoRiego.value = cultivoEnUrl;
        mostrarUbicacion();
    }
});
