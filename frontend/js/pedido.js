var claveBorrador = 'gestion-cultivos-pedido-actual';

function leerBorrador() {
    var guardado = sessionStorage.getItem(claveBorrador);
    return guardado ? JSON.parse(guardado) : { cantidades: {}, fechaRecoleccion: '' };
}

function guardarBorrador(borrador) {
    sessionStorage.setItem(claveBorrador, JSON.stringify(borrador));
}

function fechaLocal(fecha) {
    return fecha.getFullYear() + '-' + String(fecha.getMonth() + 1).padStart(2, '0') + '-' + String(fecha.getDate()).padStart(2, '0');
}

function inicioRecoleccion() {
    var inicio = new Date();
    if (inicio.getHours() >= 18) inicio.setDate(inicio.getDate() + 1);
    return inicio;
}

function limiteRecoleccion() {
    var limite = inicioRecoleccion();
    limite.setDate(limite.getDate() + 6);
    return fechaLocal(limite);
}

function fechaPermitida(fecha) {
    // Se permite elegir un día dentro de una ventana de siete días.
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha)
        && fecha >= fechaLocal(inicioRecoleccion())
        && fecha <= limiteRecoleccion();
}
