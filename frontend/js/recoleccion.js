/* Datos: muestra el calendario y permite elegir la fecha del pedido. No recibe atributos. */
let fechaVista = new Date();
let fechaElegida = '';
const mensajeRecoleccion = document.getElementById('mensaje-recoleccion');

/* Datos: dibuja el mes y habilita sus días disponibles. No recibe atributos. */
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
        const fecha = fechaLocal(new Date(anio, mes, dia));
        const boton = document.createElement('button');
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
    const hoy = new Date();
    const limite = inicioRecoleccion();
    limite.setDate(limite.getDate() + 6);
    document.getElementById('mes-anterior').disabled = anio * 12 + mes <= hoy.getFullYear() * 12 + hoy.getMonth();
    document.getElementById('mes-siguiente').disabled = anio * 12 + mes >= limite.getFullYear() * 12 + limite.getMonth();
}

/* Datos: abre otro mes del calendario. Recibe el número de meses que se debe avanzar. */
function cambiarMesRecoleccion(cambio) {
    fechaVista = new Date(fechaVista.getFullYear(), fechaVista.getMonth() + cambio, 1);
    mostrarRecoleccion();
}

/* Datos: guarda la fecha elegida en el borrador y vuelve al pago. No recibe atributos. */
function guardarFechaRecoleccion() {
    if (!fechaPermitida(fechaElegida)) {
        mensajeRecoleccion.textContent = 'Selecciona una fecha disponible.';
        return;
    }
    try {
        const borrador = leerBorrador();
        if (!tieneSeleccionPedido(borrador)) {
            mensajeRecoleccion.textContent = 'Primero selecciona productos en el catálogo.';
            return;
        }
        borrador.fechaRecoleccion = fechaElegida;
        guardarBorrador(borrador);
        window.location.href = 'pago.html';
    } catch (error) {
        mensajeRecoleccion.textContent = 'No se pudo guardar la fecha.';
    }
}

/* Datos: conecta el calendario y recupera la selección del pago. No recibe atributos. */
function iniciarRecoleccion() {
    document.getElementById('mes-anterior').onclick = function () { cambiarMesRecoleccion(-1); };
    document.getElementById('mes-siguiente').onclick = function () { cambiarMesRecoleccion(1); };
    document.getElementById('guardar-fecha').onclick = guardarFechaRecoleccion;
    try {
        const borrador = leerBorrador();
        if (!tieneSeleccionPedido(borrador)) {
            window.location.replace('catalogo.html');
            return;
        }
        fechaElegida = fechaPermitida(borrador.fechaRecoleccion) ? borrador.fechaRecoleccion : '';
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
