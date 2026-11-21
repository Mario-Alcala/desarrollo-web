var claveCalendario = 'gestion-cultivos-calendario';
var fechaVista = new Date();
var fechaEnlace = new URLSearchParams(window.location.search).get('fecha');
if (fechaEnlace && /^\d{4}-\d{2}-\d{2}$/.test(fechaEnlace)) {
    var partesFecha = fechaEnlace.split('-');
    fechaVista = new Date(Number(partesFecha[0]), Number(partesFecha[1]) - 1, 1);
}
var diaElegido = '';
var cultivosCalendario = [];
var filtroCultivo = document.getElementById('filtro-cultivo');
var cultivoSeleccionado = document.getElementById('cultivo');
var mensajeEtapa = document.getElementById('mensaje-etapa');
var formularioEtapa = document.getElementById('formulario-etapa');
var numeroCarga = 0;

function leerCalendario() {
    var datos = localStorage.getItem(claveCalendario);
    return datos ? JSON.parse(datos) : {
        siguienteId: 1, eventos: []
    };
}
function guardarCalendario(datos) {
    localStorage.setItem(claveCalendario, JSON.stringify(datos));
}
function fechaTexto(fecha) {
    return fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
}
function colorEtapa(etapa) {
    if (etapa === 'Germinación') {
        return 'germinacion';
    }
    if (etapa === 'Siembra') {
        return 'siembra';
    }
    if (etapa === 'Floración') {
        return 'floracion';
    }
    if (etapa === 'Cosecha') {
        return 'cosecha';
    }
    return 'riego';
}
function eventosVisibles() {
    return leerCalendario().eventos.filter(function (evento) {
        return (evento.origen || 'local') === 'local' && (!filtroCultivo.value || String(evento.cultivoId) === filtroCultivo.value);
    });
}
function consultarCultivosBackend() {
    return fetch('http://localhost:8080/api/cultivos').then(function (respuesta) {
        if (!respuesta.ok) {
            throw new Error('No se pudieron consultar los cultivos.');
        }
        return respuesta.json();
    });
}

function cargarCultivosCalendario() {
    var cargaActual = ++numeroCarga;
    if (formularioEtapa) { document.getElementById('guardar-etapa').disabled = true; }
    mensajeEtapa.textContent = '';
    var consulta;
    try {
        // Por ahora los cultivos se cargan siempre desde los datos locales.
        consulta = Promise.resolve(leerDatos().productos);
    } catch (error) {
        mensajeEtapa.textContent = error.message;
        return;
    }
    consulta.then(function (cultivos) {
        if (cargaActual !== numeroCarga) {
            return;
        }
        cultivosCalendario = cultivos || [];
        mostrarSeguimiento();
        var anterior = filtroCultivo.value;
        filtroCultivo.innerHTML = '<option value="">Todos los cultivos</option>';
        if (cultivoSeleccionado) { cultivoSeleccionado.innerHTML = '<option value="">Selecciona un cultivo</option>'; }
        cultivosCalendario.forEach(function (cultivo) {
            [filtroCultivo, cultivoSeleccionado].forEach(function (select) {
                if (!select) { return; }
                var opcion = document.createElement('option');
                opcion.value = cultivo.id;
                opcion.textContent = cultivo.nombre + (cultivo.etapaFenologica ? ' · ' + cultivo.etapaFenologica : '');
                select.appendChild(opcion);
            });
        });
        filtroCultivo.value = anterior;
        if (formularioEtapa) { document.getElementById('guardar-etapa').disabled = !cultivosCalendario.length; }
        mensajeEtapa.textContent = cultivosCalendario.length ? '' : 'No hay cultivos registrados.';
        dibujarCalendario();
    }).catch(function (error) {
        if (cargaActual !== numeroCarga) {
            return;
        }
        cultivosCalendario = [];
        mostrarSeguimiento();
        if (cultivoSeleccionado) { cultivoSeleccionado.innerHTML = '<option value="">Sin conexión</option>'; }
        mensajeEtapa.textContent = '';
        dibujarCalendario();
    });
}

function mostrarSeguimiento() {
    var lista = document.getElementById('cultivos-seguimiento');
    if (!lista) { return; }
    lista.innerHTML = '';
    cultivosCalendario.forEach(function (cultivo) {
        var tarjeta = document.createElement('div');
        tarjeta.className = 'cultivo-seguimiento';
        var nombre = document.createElement('strong');
        nombre.textContent = cultivo.nombre;
        var etapa = document.createElement('p');
        etapa.textContent = 'Etapa actual: ' + (cultivo.etapaFenologica || 'Por programar');
        tarjeta.appendChild(nombre);
        tarjeta.appendChild(etapa);
        lista.appendChild(tarjeta);
    });
}

function dibujarCalendario() {
    if (!document.getElementById('dias-calendario')) { return; }
    try {
        var eventos = eventosVisibles();
        var contenedor = document.getElementById('dias-calendario');
        contenedor.innerHTML = '';
        var anio = fechaVista.getFullYear();
        var mes = fechaVista.getMonth();
        document.getElementById('anio-calendario').value = anio;
        document.getElementById('titulo-mes').textContent = fechaVista.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        var comienzo = (new Date(anio, mes, 1).getDay() + 6) % 7;
        var dias = new Date(anio, mes + 1, 0).getDate();
        var espacios = Math.ceil((comienzo + dias) / 7) * 7;
        for (var i = 0; i < espacios; i++) {
            var casilla = document.createElement('div');
            casilla.className = 'dia';
            if (i < comienzo || i >= comienzo + dias) {
                casilla.classList.add('dia-vacio');
            } else {
                var numero = i - comienzo + 1;
                var fecha = fechaTexto(new Date(anio, mes, numero));
                var boton = document.createElement('button');
                boton.textContent = numero;
                boton.dataset.fecha = fecha;
                boton.setAttribute('aria-label', 'Ver tareas del ' + fecha);
                boton.onclick = function () {
                    diaElegido = this.dataset.fecha;
                    dibujarCalendario();
                };
                casilla.appendChild(boton);
                if (fecha === fechaTexto(new Date())) {
                    casilla.classList.add('hoy');
                }
                if (fecha === diaElegido) {
                    casilla.classList.add('seleccionado');
                }
                eventos.forEach(function (evento) {
                    if (evento.inicio === fecha) {
                        agregarMarca(casilla, evento, evento.etapa);
                    }
                });
            }
            contenedor.appendChild(casilla);
        }
        mostrarTareas(eventos);
    } catch (error) {
        mensajeEtapa.textContent = 'No se pudo leer el calendario guardado.';
    }
}
function agregarMarca(casilla, evento, etiqueta) {
    var marca = document.createElement('span');
    marca.className = 'marca-etapa ' + colorEtapa(evento.etapa);
    if (evento.completada) {
        marca.classList.add('completada');
    }
    marca.textContent = evento.cultivoNombre + ' · ' + etiqueta + (evento.completada ? ' ✓' : '');
    casilla.appendChild(marca);
}
function mostrarTareas(eventos) {
    var lista = document.getElementById('tareas-calendario');
    lista.innerHTML = '';
    document.getElementById('titulo-tareas').textContent = 'Etapas programadas';
    eventos.sort(function (a, b) { return a.inicio.localeCompare(b.inicio) || a.id - b.id; });
    if (!eventos.length) {
        lista.textContent = 'No hay tareas programadas para esta selección.';
    }
    eventos.forEach(function (evento) {
        var bloque = document.createElement('article');
        bloque.className = 'tarea';
        var titulo = document.createElement('h3');
        titulo.textContent = evento.cultivoNombre + ' · ' + evento.etapa;
        var fechas = document.createElement('p');
        fechas.textContent = 'Fecha: ' + evento.inicio;
        var notas = document.createElement('p');
        notas.textContent = (evento.completada ? 'Completada. ' : 'Pendiente. ') + (evento.notas || 'Sin notas.');
        var completar = document.createElement('button');
        completar.className = 'boton boton-secundario';
        completar.textContent = 'Completar';
        completar.disabled = evento.completada;
        completar.onclick = function () {
            cambiarEvento(evento.id, false);
        };
        var eliminar = document.createElement('button');
        eliminar.className = 'boton boton-secundario';
        eliminar.textContent = 'Eliminar';
        eliminar.onclick = function () { if (confirm('¿Eliminar esta etapa?')) { cambiarEvento(evento.id, true); } };
        bloque.appendChild(titulo);
        bloque.appendChild(fechas);
        bloque.appendChild(notas);
        bloque.appendChild(completar);
        bloque.appendChild(eliminar);
        lista.appendChild(bloque);
    });
}
function cambiarEvento(id, eliminar) {
    try {
        var datos = leerCalendario();
        if (eliminar) { datos.eventos = datos.eventos.filter(function (evento) { return evento.id !== id; }); }
        else { datos.eventos.forEach(function (evento) { if (evento.id === id) { evento.completada = true; } }); }
        guardarCalendario(datos);
        dibujarCalendario();
        mensajeEtapa.textContent = eliminar ? 'Etapa eliminada.' : 'Etapa completada.';
    } catch (error) {
        mensajeEtapa.textContent = 'No se pudo guardar el cambio.';
    }
}
if (formularioEtapa) {
formularioEtapa.addEventListener('submit', function (evento) {
    evento.preventDefault();
    var inicio = document.getElementById('fecha-inicio').value;
    if (!inicio) {
        mensajeEtapa.textContent = 'Selecciona la fecha de la etapa.';
        return;
    }
    if (!formularioEtapa.reportValidity()) {
        return;
    }
    var cultivo = null;
    cultivosCalendario.forEach(function (actual) { if (String(actual.id) === cultivoSeleccionado.value) { cultivo = actual; } });
    if (!cultivo) {
        mensajeEtapa.textContent = 'Actualiza y selecciona un cultivo disponible.';
        return;
    }
    try {
        var datos = leerCalendario();
        datos.eventos.push({ id: datos.siguienteId++, origen: 'local', cultivoId: cultivo.id, cultivoNombre: cultivo.nombre,
            etapa: document.getElementById('etapa').value, inicio: inicio,
            notas: document.getElementById('notas').value.trim(), completada: false });
        guardarCalendario(datos);
        var partes = inicio.split('-');
        fechaVista = new Date(Number(partes[0]), Number(partes[1]) - 1, 1);
        diaElegido = inicio;
        filtroCultivo.value = String(cultivo.id);
        formularioEtapa.reset();
        dibujarCalendario();
        window.location.href = 'calendario.html?fecha=' + inicio;
    } catch (error) {
        mensajeEtapa.textContent = 'No se pudo guardar la etapa en el navegador.';
    }
});
}
if (document.getElementById('dias-calendario')) {
document.getElementById('anio-calendario').onchange = function () {
    if (!this.reportValidity() || !this.value) { return; }
    fechaVista = new Date(Number(this.value), fechaVista.getMonth(), 1);
    diaElegido = '';
    dibujarCalendario();
};
document.getElementById('mes-anterior').onclick = function () {
    fechaVista = new Date(fechaVista.getFullYear(), fechaVista.getMonth() - 1, 1);
    diaElegido = '';
    dibujarCalendario();
};
document.getElementById('mes-siguiente').onclick = function () {
    fechaVista = new Date(fechaVista.getFullYear(), fechaVista.getMonth() + 1, 1);
    diaElegido = '';
    dibujarCalendario();
};
document.getElementById('mes-actual').onclick = function () {
    fechaVista = new Date();
    diaElegido = fechaTexto(fechaVista);
    dibujarCalendario();
};
}

filtroCultivo.onchange = function () {
    diaElegido = '';
    dibujarCalendario();
};
window.addEventListener('storage', function (evento) {
    if (evento.key === claveCalendario || evento.key === null) {
        dibujarCalendario();
    }
    if (evento.key === claveDatos || evento.key === null) {
        cargarCultivosCalendario();
    }
});
// Los eventos quedan locales hasta conectar el calendario con Java.
// Mantener los eventos locales hasta que el equipo agregue ese endpoint.
dibujarCalendario();
cargarCultivosCalendario();
