var lotesCatalogo = [];
var carrito = {};
var mensajeCatalogo = document.getElementById('mensaje-catalogo');

function cargarCatalogo() {
    document.getElementById('finalizar').disabled = true;
    mensajeCatalogo.textContent = 'Cargando productos...';
    pedirApi('/catalogo').then(function (lotes) {
        lotesCatalogo = lotes;
        carrito = leerBorrador().cantidades;
        var ajustado = false;
        Object.keys(carrito).forEach(function (id) {
            var lote = lotes.find(function (actual) { return String(actual.idCosecha) === id; });
            if (!lote || !Number.isFinite(Number(carrito[id])) || Number(carrito[id]) <= 0) {
                delete carrito[id]; ajustado = true;
            } else if (Number(carrito[id]) > Number(lote.kilos)) {
                carrito[id] = Number(lote.kilos); ajustado = true;
            }
        });
        mostrarCatalogo();
        mensajeCatalogo.textContent = ajustado ? 'Las existencias cambiaron. Revisa tu pedido.' :
            (lotes.length ? '' : 'No hay lotes disponibles por el momento.');
    }).catch(function (error) {
        document.getElementById('productos').innerHTML = '';
        mensajeCatalogo.textContent = mensajeCliente(error);
    });
}

function mostrarCatalogo() {
    var lista = document.getElementById('productos');
    lista.innerHTML = '';
    var variedades = {};
    lotesCatalogo.forEach(function (lote) {
        var tarjeta = variedades[lote.idVariedad];
        if (!tarjeta) {
            tarjeta = document.createElement('article');
            tarjeta.className = 'producto';
            var titulo = document.createElement('h2');
            titulo.textContent = lote.nombre;
            tarjeta.appendChild(titulo);
            if (lote.imagen) {
                var url = new URL(lote.imagen, window.location.href);
                if (url.protocol === 'http:' || url.protocol === 'https:') {
                    var imagen = document.createElement('img');
                    imagen.src = url.href; imagen.alt = lote.nombre; imagen.className = 'imagen-producto';
                    tarjeta.appendChild(imagen);
                }
            }
            [lote.familia, lote.descripcion, dinero(lote.precioKilo) + ' / kg'].forEach(function (texto) {
                var parrafo = document.createElement('p'); parrafo.textContent = texto || ''; tarjeta.appendChild(parrafo);
            });
            lista.appendChild(tarjeta);
            variedades[lote.idVariedad] = tarjeta;
        }
        var bloque = document.createElement('div');
        bloque.className = 'lote-producto';
        var textoLote = document.createElement('p');
        textoLote.textContent = 'Lote ' + lote.idCosecha + ' · Maduración: ' + (lote.maduracion || 'Sin registrar') +
            ' · Disponibles: ' + Number(lote.kilos).toFixed(2) + ' kg';
        bloque.appendChild(textoLote);
        var controles = document.createElement('div'); controles.className = 'cantidad';
        var menos = document.createElement('button'); menos.type = 'button'; menos.textContent = '−';
        menos.className = 'boton boton-secundario'; menos.setAttribute('aria-label', 'Restar 0.25 kg al lote ' + lote.idCosecha);
        menos.onclick = function () { cambiarCantidad(lote, Math.max(0, Number(carrito[lote.idCosecha] || 0) - 0.25)); };
        var cantidad = document.createElement('input'); cantidad.type = 'number'; cantidad.min = '0'; cantidad.step = '0.01';
        cantidad.max = lote.kilos; cantidad.value = carrito[lote.idCosecha] || 0;
        cantidad.setAttribute('aria-label', 'Kilos del lote ' + lote.idCosecha);
        cantidad.onchange = function () {
            if (this.reportValidity() && this.value !== '') { cambiarCantidad(lote, Number(this.value)); }
            else { this.value = carrito[lote.idCosecha] || 0; }
        };
        var mas = document.createElement('button'); mas.type = 'button'; mas.textContent = '+'; mas.className = 'boton';
        mas.setAttribute('aria-label', 'Sumar 0.25 kg al lote ' + lote.idCosecha);
        mas.onclick = function () { cambiarCantidad(lote, Math.min(Number(lote.kilos), Number(carrito[lote.idCosecha] || 0) + 0.25)); };
        controles.appendChild(menos); controles.appendChild(cantidad); controles.appendChild(mas);
        bloque.appendChild(controles); tarjeta.appendChild(bloque);
    });
    mostrarResumen();
}

function cambiarCantidad(lote, cantidad) {
    cantidad = Math.round(cantidad * 100) / 100;
    if (cantidad < 0 || cantidad > Number(lote.kilos)) { return; }
    if (cantidad === 0) { delete carrito[lote.idCosecha]; }
    else { carrito[lote.idCosecha] = cantidad; }
    mostrarCatalogo();
}

function mostrarResumen() {
    var cuerpo = document.getElementById('detalle-pedido'); cuerpo.innerHTML = '';
    var total = 0;
    lotesCatalogo.forEach(function (lote) {
        var kilos = Number(carrito[lote.idCosecha] || 0);
        if (!kilos) { return; }
        var subtotal = subtotalCentavos(lote.precioKilo, kilos); total += subtotal;
        var fila = document.createElement('tr');
        agregarCelda(fila, lote.nombre + ' · Lote ' + lote.idCosecha);
        agregarCelda(fila, kilos.toFixed(2) + ' kg'); agregarCelda(fila, dinero(subtotal / 100)); cuerpo.appendChild(fila);
    });
    document.getElementById('total').textContent = dinero(total / 100);
    document.getElementById('finalizar').disabled = total <= 0;
    var borrador = leerBorrador(); borrador.cantidades = carrito; guardarBorrador(borrador);
}

document.getElementById('finalizar').onclick = function () { window.location.href = 'pago.html'; };
window.addEventListener('pageshow', cargarCatalogo);
