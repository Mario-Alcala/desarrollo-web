var fechaVista = new Date();
var fechaElegida = '';
var mensajeRecoleccion = document.getElementById('mensaje-recoleccion');

function mostrarRecoleccion() {
    var anio = fechaVista.getFullYear();
    var mes = fechaVista.getMonth();
    document.getElementById('nombre-mes').textContent = fechaVista.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    var lista = document.getElementById('dias-recoleccion');
    lista.innerHTML = '';
    var inicio = new Date(anio, mes, 1).getDay();
    var cantidad = new Date(anio, mes + 1, 0).getDate();

    for (var espacio = 0; espacio < inicio; espacio++) {
        lista.appendChild(document.createElement('span'));
    }

    for (var dia = 1; dia <= cantidad; dia++) {
        var fecha = fechaLocal(new Date(anio, mes, dia));
        var boton = document.createElement('button');
        boton.type = 'button';
        boton.textContent = dia;
        boton.dataset.fecha = fecha;
        boton.disabled = !fechaPermitida(fecha);
        boton.setAttribute('aria-label', 'Recoger el ' + fecha);
        boton.setAttribute('aria-pressed', fecha === fechaElegida ? 'true' : 'false');
        if (fecha === fechaElegida) {
            boton.className = 'elegido';
        }
        boton.onclick = function () {
            fechaElegida = this.dataset.fecha;
            mostrarRecoleccion();
        };
        lista.appendChild(boton);
    }

    document.getElementById('dia-seleccionado').textContent = fechaElegida ? 'Fecha seleccionada: ' + fechaElegida : 'Aún no seleccionas una fecha.';
    document.getElementById('guardar-fecha').disabled = !fechaPermitida(fechaElegida);
    var hoy = new Date();
    var limite = new Date();
    limite.setDate(limite.getDate() + 13);
    document.getElementById('mes-anterior').disabled = anio * 12 + mes <= hoy.getFullYear() * 12 + hoy.getMonth();
    document.getElementById('mes-siguiente').disabled = anio * 12 + mes >= limite.getFullYear() * 12 + limite.getMonth();
}

document.getElementById('mes-anterior').onclick = function () {
    fechaVista = new Date(fechaVista.getFullYear(), fechaVista.getMonth() - 1, 1);
    mostrarRecoleccion();
};

document.getElementById('mes-siguiente').onclick = function () {
    fechaVista = new Date(fechaVista.getFullYear(), fechaVista.getMonth() + 1, 1);
    mostrarRecoleccion();
};

document.getElementById('guardar-fecha').onclick = function () {
    if (!fechaPermitida(fechaElegida)) {
        mensajeRecoleccion.textContent = 'Selecciona una fecha disponible.';
        return;
    }
    try {
        var borrador = leerBorrador();
        if (!Object.keys(borrador.cantidades).length) {
            mensajeRecoleccion.textContent = 'Primero selecciona productos en el catálogo.';
            return;
        }
        borrador.fechaRecoleccion = fechaElegida;
        guardarBorrador(borrador);
        window.location.href = 'pago.html';
    } catch (error) {
        mensajeRecoleccion.textContent = 'No se pudo guardar la fecha.';
    }
};

try {
    var borradorRecoleccion = leerBorrador();
    if (!Object.keys(borradorRecoleccion.cantidades).length) {
        window.location.replace('catalogo.html');
    } else {
        fechaElegida = fechaPermitida(borradorRecoleccion.fechaRecoleccion) ? borradorRecoleccion.fechaRecoleccion : '';
        if (fechaElegida) {
            var partes = fechaElegida.split('-');
            fechaVista = new Date(Number(partes[0]), Number(partes[1]) - 1, 1);
        }
        mostrarRecoleccion();
    }
} catch (error) {
    mensajeRecoleccion.textContent = 'No se pudo consultar el pedido.';
}
