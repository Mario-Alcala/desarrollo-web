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

function limiteRecoleccion() {
    var limite = new Date();
    limite.setDate(limite.getDate() + 13);
    return fechaLocal(limite);
}

function fechaPermitida(fecha) {
    // Dos semanas contando el día de hoy, como en el sketch.
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha >= fechaLocal(new Date()) && fecha <= limiteRecoleccion();
}
