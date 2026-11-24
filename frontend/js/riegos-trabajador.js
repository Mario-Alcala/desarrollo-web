/* Datos: este archivo consulta los riegos y permite registrar riegos de cultivos activos. No recibe atributos. */

const usuarioRiego = usuarioActual();
const formRiego = document.getElementById('formulario-riego');
const selectCultivoRiego = document.getElementById('riego-cultivo');
const campoFechaRiego = document.getElementById('riego-fecha');
const campoCantidadRiego = document.getElementById('riego-cantidad');
const selectUnidadRiego = document.getElementById('riego-unidad');
const selectMetodoRiego = document.getElementById('riego-metodo');
const campoNotasRiego = document.getElementById('riego-notas');
const mensajeRiego = document.getElementById('mensaje-riego');
const mensajeGeneral = document.getElementById('mensaje');
const filtroRiegos = document.getElementById('filtro-cultivo');
let riegos = [];
let nombresUsuarios = {};

/* Datos: esta función consulta los cultivos, riegos y responsables desde la API. No recibe atributos. */
function cargarRiegos() {
    mensajeGeneral.textContent = 'Cargando…';
    return Promise.all([Campo.cargar(), pedirApi('/riegos'), Campo.cargarNombresUsuarios()])
        .then(function (r) {
            riegos = r[1] || [];
            nombresUsuarios = r[2];
            const activos = Campo.llenarSelectCultivos(selectCultivoRiego);
            Campo.llenarSelectCultivos(filtroRiegos, { todos: true, textoInicial: 'Todos los cultivos' });
            mostrarUbicacion();
            dibujarRiegos();
            mensajeGeneral.textContent = activos ? '' : 'No hay cultivos activos. Los da de alta el administrador.';
        })
        .catch(function (error) {
            mensajeGeneral.textContent = textoErrorApi(error);
        });
}

/* Datos: esta función muestra los riegos del cultivo que coincide con el filtro. No recibe atributos. */
function dibujarRiegos() {
    const cuerpo = document.getElementById('lista-riegos');
    cuerpo.innerHTML = '';
    const visibles = riegos.filter(function (r) {
        return !filtroRiegos.value || String(r.idCultivo) === filtroRiegos.value;
    }).sort(function (a, b) {
        return String(b.fechaRiego).localeCompare(String(a.fechaRiego)) || b.idRiego - a.idRiego;
    });
    const totales = {};
    visibles.forEach(function (r) {
        const fila = document.createElement('tr');
        celda(fila, String(r.fechaRiego).slice(0, 10));
        celda(fila, Campo.nombreCultivo(r.idCultivo));
        celda(fila, cantidadTexto(r.cantidadAgua, r.unidadMedida));
        celda(fila, r.metodo);
        celda(fila, nombresUsuarios[r.idUsuario] || (r.idUsuario ? 'Usuario #' + r.idUsuario : ''));
        celda(fila, r.observaciones);
        cuerpo.appendChild(fila);
        const unidad = r.unidadMedida || '';
        totales[unidad] = (totales[unidad] || 0) + Number(r.cantidadAgua || 0);
    });
    if (!visibles.length) {
        filaSinDatos(cuerpo, 6, 'No hay riegos registrados para esta selección.');
    }
    const partes = Object.keys(totales).map(function (u) { return cantidadTexto(totales[u], u); });
    document.getElementById('total-agua').textContent = partes.length ? partes.join(' · ') : '—';
}

/* Datos: esta función muestra la parcela y el terreno del cultivo seleccionado. No recibe atributos. */
function mostrarUbicacion() {
    const cultivo = Campo.cultivoPorId(selectCultivoRiego.value);
    document.getElementById('riego-ubicacion').textContent = cultivo
        ? 'Ubicación: ' + Campo.ubicacion(cultivo) + (cultivo.fechaSiembra ? ' · Siembra: ' + cultivo.fechaSiembra : '')
        : '';
    campoFechaRiego.min = cultivo && cultivo.fechaSiembra ? cultivo.fechaSiembra : '';
}

/* Datos: esta función valida y registra un riego. Recibe el evento del formulario. */
function guardarRiego(evento) {
    evento.preventDefault();
    mensajeRiego.textContent = '';
    if (!usuarioRiego) {
        mensajeRiego.textContent = 'Inicia sesión para registrar riegos.';
        return;
    }
    const cultivo = Campo.cultivoPorId(selectCultivoRiego.value);
    const error = Validacion.primerError([
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
    const boton = document.getElementById('guardar-riego');
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
}

/* Datos: esta función conecta los eventos de esta pantalla y carga los datos. No recibe atributos. */
function iniciarRiegosTrabajador() {
    formRiego.addEventListener('submit', guardarRiego);
    selectCultivoRiego.addEventListener('change', mostrarUbicacion);
    filtroRiegos.addEventListener('change', dibujarRiegos);
    document.getElementById('actualizar').onclick = cargarRiegos;
    campoFechaRiego.value = Validacion.hoy();
    campoFechaRiego.max = Validacion.hoy();
    const cultivoEnUrl = new URLSearchParams(window.location.search).get('cultivo');
    cargarRiegos().then(function () {
        if (cultivoEnUrl && Campo.cultivoPorId(cultivoEnUrl)) {
            selectCultivoRiego.value = cultivoEnUrl;
            mostrarUbicacion();
        }
    });
}

iniciarRiegosTrabajador();
