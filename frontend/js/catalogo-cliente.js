/**
 * @file Catálogo para clientes.
 */

/**
 * Consulta el catálogo y conserva los lotes seleccionados hasta el pago.
 *
 * @author Equipo de Gestión de Cultivos
 */
class VistaCatalogoCliente {
    /** Prepara los controles y el estado de la pantalla. */
    constructor() {
        this.api = 'http://localhost:8081/api';
        this.productos = document.getElementById('productos');
        this.detalle = document.getElementById('detalle-pedido');
        this.mensaje = document.getElementById('mensaje-catalogo');
        this.cantidades = {};
        this.lotes = [];
    }

    /**
     * Consulta los productos y lotes de la API.
     */
    async cargarCatalogoCliente() {
        this.mensaje.textContent = 'Cargando productos disponibles…';
        try {
            const respuesta = await fetch(this.api + '/catalogo');
            if (!respuesta.ok) {
                throw new Error('No se pudo cargar el catálogo desde el API.');
            }
            this.lotes = await respuesta.json();
            this.dibujarCatalogoCliente();
        } catch (error) {
            this.mensaje.textContent = error.message;
        }
    }

    /**
     * Crea un elemento para mostrar un producto o lote.
     *
     * @param tag - Etiqueta HTML, por ejemplo, `article` o `td`.
     * @param [texto] - Texto que se muestra en el elemento.
     * @param [clase] - Clase CSS del elemento.
     */
    crearNodo(tag, texto, clase) {
        const nodo = document.createElement(tag);
        if (texto !== undefined) nodo.textContent = texto;
        if (clase) nodo.className = clase;
        return nodo;
    }

    /**
     * Muestra un importe con dos posiciones decimales.
     *
     * @param valor - Importe en pesos.
     */
    dineroCliente(valor) {
        return '$' + Number(valor || 0).toFixed(2);
    }

    /**
     * Muestra los kilos elegidos y calcula subtotales y total.
     */
    mostrarResumenCliente() {
        this.detalle.replaceChildren();
        let total = 0;
        this.lotes.forEach((lote) => {
            const kilos = Number(this.cantidades[lote.idCosecha] || 0);
            if (!kilos) return;
            const subtotal = Number(lote.precioPorKg) * kilos;
            total += subtotal;
            const fila = document.createElement('tr');
            fila.append(this.crearNodo('td', lote.familia + ' ' + lote.variedad + ' · ' + lote.maduracion + ' · Lote #' + lote.idCosecha),
                this.crearNodo('td', kilos.toFixed(2) + ' kg'), this.crearNodo('td', this.dineroCliente(subtotal)));
            this.detalle.appendChild(fila);
        });
        if (!this.detalle.children.length) {
            const fila = document.createElement('tr');
            const celda = this.crearNodo('td', 'Todavía no seleccionas productos.');
            celda.colSpan = 3;
            fila.appendChild(celda);
            this.detalle.appendChild(fila);
        }
        document.getElementById('total').textContent = this.dineroCliente(total);
        document.getElementById('finalizar').disabled = total <= 0;
    }

    /**
     * Dibuja las tarjetas que coinciden con la búsqueda y la maduración.
     */
    dibujarCatalogoCliente() {
        const texto = document.getElementById('buscar-producto-cliente').value.trim().toLowerCase();
        const maduracion = document.getElementById('filtro-maduracion-cliente').value;
        this.productos.replaceChildren();
        const productos = this.filtrarProductos(texto, maduracion);
        productos.forEach((producto) => {
            const tarjeta = this.crearNodo('article', undefined, 'producto');
            const titulo = this.crearNodo('h2', producto.familia + ' ' + producto.variedad);
            if (producto.imagenUrl) {
                const imagen = document.createElement('img');
                imagen.className = 'producto-imagen';
                imagen.src = producto.imagenUrl;
                imagen.alt = producto.familia + ' ' + producto.variedad;
                imagen.loading = 'lazy';
                imagen.addEventListener('error', () => { imagen.replaceWith(this.crearNodo('div', 'Imagen no disponible', 'producto-imagen sin-imagen')); });
                tarjeta.appendChild(imagen);
            } else {
                tarjeta.appendChild(this.crearNodo('div', 'Sin imagen', 'producto-imagen sin-imagen'));
            }
            tarjeta.appendChild(titulo);
            if (producto.descripcion) tarjeta.appendChild(this.crearNodo('p', producto.descripcion));
            tarjeta.appendChild(this.crearNodo('p', this.dineroCliente(producto.precioPorKg) + ' / kg'));
            if (producto.lotes.length === 0) {
                tarjeta.appendChild(this.crearNodo('p', 'Sin cosecha disponible por el momento.'));
            }
            for (const lote of producto.lotes) {
                tarjeta.appendChild(this.dibujarLoteCliente(lote));
            }
            this.productos.appendChild(tarjeta);
        });
        this.mensaje.textContent = productos.length ? '' : 'No hay lotes disponibles que coincidan con la búsqueda.';
        this.mostrarResumenCliente();
    }

    /**
     * Crea el control de cantidad.
     *
     * @param lote - Lote con su identificador, maduración y existencias.
     */
    dibujarLoteCliente(lote) {
        const filaLote = this.crearNodo('div', undefined, 'panel espacio');
        filaLote.appendChild(this.crearNodo('strong', 'Lote #' + lote.idCosecha + ' · ' + (lote.maduracion || 'Sin clasificar')));
        filaLote.appendChild(this.crearNodo('p', 'Disponible: ' + Number(lote.kilos).toLocaleString('es-MX') + ' kg'));
        const etiqueta = this.crearNodo('label', 'Kilos');
        const campo = document.createElement('input');
        campo.type = 'number';
        campo.min = '0';
        campo.max = String(lote.kilos);
        campo.step = '0.01';
        campo.value = this.cantidades[lote.idCosecha] || '';
        campo.setAttribute('aria-label', 'Kilos del lote ' + lote.idCosecha);
        campo.addEventListener('input', () => {
            const valor = Number(campo.value);
            if (!campo.value || valor <= 0) {
                delete this.cantidades[lote.idCosecha];
            } else {
                const kilos = Math.min(valor, Number(lote.kilos));
                this.cantidades[lote.idCosecha] = Math.round(kilos * 100) / 100;
                campo.value = this.cantidades[lote.idCosecha];
            }
            this.mostrarResumenCliente();
        });
        etiqueta.appendChild(campo);
        filaLote.appendChild(etiqueta);
        return filaLote;
    }

    /**
     * Agrupa por idVariedad.
     *
     * @param lotes - Lista de lotes devueltos por la API.
     */
    agruparProductos(lotes) {
        const grupos = {};
        for (const lote of lotes) {
            const llave = String(lote.idVariedad);
            if (!grupos[llave]) {
                grupos[llave] = {
                    idVariedad: lote.idVariedad,
                    familia: lote.familia,
                    variedad: lote.variedad,
                    descripcion: lote.descripcion,
                    imagenUrl: lote.imagenUrl,
                    precioPorKg: Number(lote.precioPorKg),
                    lotes: []
                };
            }
            if (lote.idCosecha !== null && lote.idCosecha !== undefined) {
                grupos[llave].lotes.push(lote);
            }
        }
        return Object.values(grupos);
    }

    /**
     * Elige qué productos mostrar.
     *
     * @param texto - Texto de búsqueda del catálogo.
     * @param maduracion - Maduración seleccionada en el filtro.
     */
    filtrarProductos(texto, maduracion) {
        return this.agruparProductos(this.lotes).filter((producto) => {
            const descripcion = producto.familia + ' ' + producto.variedad + ' ' + (producto.descripcion || '');
            producto.lotes = producto.lotes.filter(lote => !maduracion || lote.maduracion === maduracion);
            return descripcion.toLowerCase().includes(texto) && (!maduracion || producto.lotes.length > 0);
        });
    }

    /**
     * Guarda idCosecha y kilos del carrito para abrir el pago.
     */
    finalizarPedidoCliente() {
        const usuarioId = sessionStorage.getItem('usuarioId');
        const rol = sessionStorage.getItem('usuarioRol');
        if (!usuarioId || rol !== 'cliente') {
            this.mensaje.textContent = 'Inicia sesión con una cuenta de cliente para continuar.';
            return;
        }
        const detalles = Object.keys(this.cantidades).map((id) => {
            return { idCosecha: Number(id), kilos: Number(this.cantidades[id]) };
        });
        sessionStorage.setItem('pedidoGestionCultivos', JSON.stringify(detalles));
        sessionStorage.removeItem('fechaRecoleccionGestionCultivos');
        window.location.href = 'pago.html';
    }

    /**
     * Conecta los controles y carga el catálogo al abrir.
     */
    iniciarCatalogoCliente() {
        document.getElementById('buscar-producto-cliente').addEventListener('input', () => this.dibujarCatalogoCliente());
        document.getElementById('filtro-maduracion-cliente').addEventListener('change', () => this.dibujarCatalogoCliente());
        document.getElementById('finalizar').addEventListener('click', () => this.finalizarPedidoCliente());
        this.cargarCatalogoCliente();
    }
}

const vistaCatalogoCliente = new VistaCatalogoCliente();
vistaCatalogoCliente.iniciarCatalogoCliente();
