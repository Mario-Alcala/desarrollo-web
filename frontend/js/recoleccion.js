/**
 * @file Muestra el calendario y permite elegir la fecha del pedido.
 *
 * @author Equipo de Gestión de Cultivos
 */
let fechaVista = new Date();
let fechaElegida = '';
const mensajeRecoleccion = document.getElementById('mensaje-recoleccion');

/**
 * Dibuja el mes y habilita sus días disponibles.
 */
function mostrarRecoleccion() {
    const anio = fechaVista.getFullYear();
    const mes = fechaVista.getMonth();
    document.getElementById('nombre-mes').textContent = fechaVista.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    const lista = document.getElementById('dias-recoleccion');
    lista.innerHTML = '';
    const inicio = new Date(anio, mes, 1).getDay();
    const cantidad = new Date(anio, mes + 1, 0).getDate();

    for (let espacio = 0; espacio < inicio; espacio++) {
        lista.appendChild(document.createElement('span'));
    }

    for (let dia = 1; dia <= cantidad; dia++) {
        const fecha = pedidoEnPreparacion.fechaLocal(new Date(anio, mes, dia));
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.textContent = dia;
        boton.dataset.fecha = fecha;
        boton.disabled = !pedidoEnPreparacion.fechaPermitida(fecha);
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
    document.getElementById('guardar-fecha').disabled = !pedidoEnPreparacion.fechaPermitida(fechaElegida);
    const hoy = new Date();
    const limite = pedidoEnPreparacion.inicioRecoleccion();
    limite.setDate(limite.getDate() + 6);
    document.getElementById('mes-anterior').disabled = anio * 12 + mes <= hoy.getFullYear() * 12 + hoy.getMonth();
    document.getElementById('mes-siguiente').disabled = anio * 12 + mes >= limite.getFullYear() * 12 + limite.getMonth();
}

/**
 * Abre otro mes del calendario.
 *
 * @param cambio - Cantidad de meses que se avanza o retrocede.
 */
function cambiarMesRecoleccion(cambio) {
    fechaVista = new Date(fechaVista.getFullYear(), fechaVista.getMonth() + cambio, 1);
    mostrarRecoleccion();
}

/**
 * Guarda la fecha elegida en el borrador y vuelve al pago.
 */
function guardarFechaRecoleccion() {
    if (!pedidoEnPreparacion.fechaPermitida(fechaElegida)) {
        mensajeRecoleccion.textContent = 'Selecciona una fecha disponible.';
        return;
    }
    try {
        const borrador = pedidoEnPreparacion.leerBorrador();
        if (!pedidoEnPreparacion.tieneSeleccionPedido(borrador)) {
            mensajeRecoleccion.textContent = 'Primero selecciona productos en el catálogo.';
            return;
        }
        borrador.fechaRecoleccion = fechaElegida;
        pedidoEnPreparacion.guardarBorrador(borrador);
        window.location.href = 'pago.html';
    } catch (error) {
        mensajeRecoleccion.textContent = 'No se pudo guardar la fecha.';
    }
}

/**
 * Conecta el calendario y recupera la selección del pago.
 */
function iniciarRecoleccion() {
    document.getElementById('mes-anterior').onclick = function () { cambiarMesRecoleccion(-1); };
    document.getElementById('mes-siguiente').onclick = function () { cambiarMesRecoleccion(1); };
    document.getElementById('guardar-fecha').onclick = guardarFechaRecoleccion;
    try {
        const borrador = pedidoEnPreparacion.leerBorrador();
        if (!pedidoEnPreparacion.tieneSeleccionPedido(borrador)) {
            window.location.replace('catalogo.html');
            return;
        }
        fechaElegida = pedidoEnPreparacion.fechaPermitida(borrador.fechaRecoleccion) ? borrador.fechaRecoleccion : '';
        if (fechaElegida) {
            const partes = fechaElegida.split('-');
            fechaVista = new Date(Number(partes[0]), Number(partes[1]) - 1, 1);
        }
        mostrarRecoleccion();
    } catch (error) {
        mensajeRecoleccion.textContent = 'No se pudo consultar el pedido.';
    }
}

iniciarRecoleccion();
