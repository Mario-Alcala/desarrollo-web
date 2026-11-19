var claveCalendario = 'gestion-cultivos-calendario';
var formularioEtapa = document.getElementById('formulario-etapa');
var cultivoSeleccionado = document.getElementById('cultivo');
var etapaSeleccionada = document.getElementById('etapa');
var fechaInicio = document.getElementById('fecha-inicio');
var fechaCosecha = document.getElementById('fecha-cosecha');
var notas = document.getElementById('notas');
var mensajeEtapa = document.getElementById('mensaje-etapa');

function leerCalendario() {
    var guardado = localStorage.getItem(claveCalendario);
    if (guardado === null) {
        return { siguienteId: 1, eventos: [] };
    }
    return JSON.parse(guardado);
}

function guardarCalendario(calendario) {
    localStorage.setItem(claveCalendario, JSON.stringify(calendario));
}

function cargarCultivos() {
    try {
        var seleccionAnterior = cultivoSeleccionado.value;
        var productos = leerDatos().productos;
        cultivoSeleccionado.innerHTML = '<option value="">Selecciona un cultivo</option>';
        productos.forEach(function (producto) {
            var opcion = document.createElement('option');
            opcion.value = producto.id;
            opcion.textContent = producto.nombre;
            cultivoSeleccionado.appendChild(opcion);
        });
        cultivoSeleccionado.value = seleccionAnterior;
        document.getElementById('guardar-etapa').disabled = productos.length === 0;
        if (productos.length === 0) {
            mensajeEtapa.textContent = 'No hay cultivos. Agrega uno desde el panel gestor para registrar etapas.';
        }
    } catch (error) {
        mensajeEtapa.textContent = 'No se pudieron cargar los cultivos del navegador.';
        document.getElementById('guardar-etapa').disabled = true;
    }
}

function mostrarFecha(fecha) {
    var partes = fecha.split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function mostrarEtapas() {
    var lista = document.getElementById('lista-etapas');
    lista.innerHTML = '';
    try {
        var eventos = leerCalendario().eventos;
        eventos.sort(function (a, b) {
            return a.inicio.localeCompare(b.inicio) || a.id - b.id;
        });
        if (eventos.length === 0) {
            var vacia = document.createElement('tr');
            agregarCelda(vacia, 'Todavía no hay etapas registradas.').colSpan = 7;
            lista.appendChild(vacia);
        }
        eventos.forEach(function (evento) {
            var fila = document.createElement('tr');
            agregarCelda(fila, evento.cultivoNombre);
            agregarCelda(fila, evento.etapa);
            agregarCelda(fila, mostrarFecha(evento.inicio));
            agregarCelda(fila, mostrarFecha(evento.cosecha));
            agregarCelda(fila, evento.notas || 'Sin notas').className = 'notas-tarea';
            var estado = agregarCelda(fila, evento.completada ? 'Completada' : 'Pendiente');
            if (evento.completada) { estado.className = 'etapa-completada'; }
            var acciones = agregarCelda(fila, '');
            var completar = document.createElement('button');
            completar.textContent = 'Completar';
            completar.className = 'boton boton-secundario';
            completar.disabled = evento.completada;
            completar.onclick = function () { completarEtapa(evento.id); };
            var eliminar = document.createElement('button');
            eliminar.textContent = 'Eliminar';
            eliminar.className = 'boton boton-secundario';
            eliminar.onclick = function () { eliminarEtapa(evento.id); };
            acciones.appendChild(completar);
            acciones.appendChild(eliminar);
            lista.appendChild(fila);
        });
    } catch (error) {
        mensajeEtapa.textContent = 'No se pudieron leer las etapas guardadas.';
    }
}

formularioEtapa.addEventListener('submit', function (evento) {
    evento.preventDefault();
    if (!fechaInicio.value || !fechaCosecha.value) {
        mensajeEtapa.textContent = 'Completa la fecha de inicio y la fecha estimada de cosecha.';
        return;
    }
    // En la etapa Siembra, el inicio corresponde a la fecha de siembra.
    if (fechaCosecha.value < fechaInicio.value) {
        mensajeEtapa.textContent = 'La cosecha no puede ser anterior al inicio de la etapa o siembra.';
        return;
    }
    if (!formularioEtapa.checkValidity()) {
        mensajeEtapa.textContent = 'Selecciona un cultivo, una etapa y fechas válidas.';
        formularioEtapa.reportValidity();
        return;
    }
    try {
        var producto = buscarProducto(leerDatos(), Number(cultivoSeleccionado.value));
        if (!producto) {
            cargarCultivos();
            mensajeEtapa.textContent = 'El cultivo ya no está disponible. Selecciona otro.';
            return;
        }
        var calendario = leerCalendario();
        calendario.eventos.push({
            id: calendario.siguienteId,
            cultivoId: producto.id,
            cultivoNombre: producto.nombre,
            etapa: etapaSeleccionada.value,
            inicio: fechaInicio.value,
            cosecha: fechaCosecha.value,
            notas: notas.value.trim(),
            completada: false
        });
        calendario.siguienteId++;
        guardarCalendario(calendario);
        formularioEtapa.reset();
        mostrarEtapas();
        mensajeEtapa.textContent = 'Etapa guardada.';
    } catch (error) {
        mensajeEtapa.textContent = 'No se pudo guardar la etapa. Revisa el almacenamiento del navegador.';
    }
});

function completarEtapa(id) {
    try {
        var calendario = leerCalendario();
        calendario.eventos.forEach(function (evento) {
            if (evento.id === id) { evento.completada = true; }
        });
        guardarCalendario(calendario);
        mostrarEtapas();
        mensajeEtapa.textContent = 'Etapa marcada como completada.';
    } catch (error) {
        mensajeEtapa.textContent = 'No se pudo guardar el cambio.';
    }
}

function eliminarEtapa(id) {
    if (!confirm('¿Eliminar esta etapa del calendario?')) { return; }
    try {
        var calendario = leerCalendario();
        calendario.eventos = calendario.eventos.filter(function (evento) {
            return evento.id !== id;
        });
        guardarCalendario(calendario);
        mostrarEtapas();
        mensajeEtapa.textContent = 'Etapa eliminada.';
    } catch (error) {
        mensajeEtapa.textContent = 'No se pudo eliminar la etapa.';
    }
}

// Preparado para consultar el controlador de Spring Boot; no se llama todavía.
// Retorna cultivos del servidor. Sus IDs no deben mezclarse con los IDs locales.
// Las fechas de cosecha y notas aún requieren un endpoint propio de calendario.
function consultarCultivosBackend() {
    return fetch('http://localhost:8080/api/cultivos')
        .then(function (respuesta) {
            if (!respuesta.ok) { throw new Error('No se pudieron consultar los cultivos.'); }
            return respuesta.json();
        });
}
// Ejemplo futuro: consultarCultivosBackend().then(function (cultivos) {
//     console.log(cultivos);
// }).catch(function (error) { mensajeEtapa.textContent = error.message; });

window.addEventListener('storage', function (evento) {
    if (evento.key === claveDatos || evento.key === null) { cargarCultivos(); }
    if (evento.key === claveCalendario || evento.key === null) { mostrarEtapas(); }
});
cargarCultivos();
mostrarEtapas();
