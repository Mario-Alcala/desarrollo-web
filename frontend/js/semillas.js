/**
 * Muestra el banco de semillas y registra entradas y salidas de los lotes.
 *
 * @author Equipo de Gestión de Cultivos
 */
class BancoSemillas {
    /**
     * Prepara las listas de lotes, semillas, proveedores y movimientos.
     */
    constructor() {
        this.lotesSemilla = [];
        this.semillasPorId = {};
        this.proveedoresSemilla = {};
        this.movimientosSemilla = [];
    }

    /**
     * Consulta lotes de semillas, insumos, proveedores, movimientos y cultivos desde la API.
     */
    cargarBanco() {
        const pantalla = this;
        mensajeSemillas.textContent = 'Cargando…';
        return Promise.all([
            pedirApi('/inventario/categoria/semilla'),
            pedirApi('/insumos?categoria=semilla'),
            pedirApi('/proveedores'),
            pedirApi('/movimientos-inventario'),
            Campo.cargar()
        ]).then(function (r) {
            pantalla.lotesSemilla = r[0] || [];
            pantalla.semillasPorId = {};
            (r[1] || []).forEach(function (s) { pantalla.semillasPorId[s.idInsumo] = s; });
            pantalla.proveedoresSemilla = {};
            (r[2] || []).forEach(function (p) { pantalla.proveedoresSemilla[p.idProveedor] = p.nombreEmpresa; });
            const ids = {};
            pantalla.lotesSemilla.forEach(function (l) { ids[l.idInventario] = true; });
            pantalla.movimientosSemilla = (r[3] || []).filter(function (m) { return ids[m.idInventario]; });
            Campo.llenarSelectCultivos(selectCultivoSemilla, { textoInicial: 'Sin cultivo (otro uso)' });
            pantalla.dibujarBanco();
            pantalla.llenarLotesSemilla();
            pantalla.dibujarMovimientosSemilla();
            mensajeSemillas.textContent = '';
        }).catch(function (error) {
            mensajeSemillas.textContent = textoErrorApi(error);
        });
    }

    /**
     * Muestra los lotes que coinciden con la búsqueda y el filtro.
     */
    dibujarBanco() {
        const pantalla = this;
        const cuerpo = document.getElementById('lista-semillas');
        cuerpo.innerHTML = '';
        const hoy = Validacion.hoy();
        const texto = buscadorSemillas.value.trim().toLowerCase();
        const visibles = this.lotesSemilla.filter(function (lote) {
            const estado = pantalla.estadoSemilla(lote, hoy);
            const coincide = !texto || (lote.nombreInsumo + ' ' + pantalla.proveedorDeSemilla(lote)).toLowerCase().indexOf(texto) !== -1;
            return coincide && (!soloUsables.checked || estado.vigente);
        });
        const totales = {};
        visibles.forEach(function (lote) {
            const estado = pantalla.estadoSemilla(lote, hoy);
            const fila = document.createElement('tr');
            celda(fila, '#' + lote.idInventario);
            celda(fila, lote.nombreInsumo);
            celda(fila, pantalla.proveedorDeSemilla(lote));
            celda(fila, cantidadTexto(lote.cantidad, lote.unidadMedida));
            celda(fila, lote.fechaIngreso);
            celda(fila, lote.fechaCaducidad);
            const td = celda(fila, '');
            td.textContent = '';
            const insignia = document.createElement('span');
            insignia.className = 'insignia ' + estado.clase;
            insignia.textContent = estado.texto;
            td.appendChild(insignia);
            cuerpo.appendChild(fila);
            if (estado.vigente) {
                const unidad = lote.unidadMedida || '';
                totales[unidad] = (totales[unidad] || 0) + Number(lote.cantidad);
            }
        });
        if (!visibles.length) {
            filaSinDatos(cuerpo, 7, this.lotesSemilla.length ? 'Ninguna semilla coincide con el filtro.' : 'No hay semillas en el banco. Las da de alta el administrador.');
        }
        const partes = Object.keys(totales).map(function (u) { return cantidadTexto(totales[u], u); });
        document.getElementById('total-semillas').textContent = partes.length ? partes.join(' · ') : '—';
    }

    /**
     * Muestra los movimientos recientes de semillas.
     */
    dibujarMovimientosSemilla() {
        const pantalla = this;
        const cuerpo = document.getElementById('lista-movimientos-semilla');
        cuerpo.innerHTML = '';
        const visibles = this.movimientosSemilla.slice(0, 15);
        visibles.forEach(function (m) {
            const lote = pantalla.loteSemilla(m.idInventario);
            const fila = document.createElement('tr');
            celda(fila, String(m.fechaMovimiento || '').replace('T', ' ').slice(0, 16));
            celda(fila, lote ? lote.nombreInsumo : 'Lote #' + m.idInventario);
            celda(fila, m.tipoMovimiento === 'salida' ? 'Salida' : 'Entrada');
            celda(fila, cantidadTexto(m.cantidad, lote && lote.unidadMedida));
            celda(fila, m.observacion);
            cuerpo.appendChild(fila);
        });
        if (!visibles.length) {
            filaSinDatos(cuerpo, 5, 'Todavía no hay movimientos de semillas.');
        }
    }

    /**
     * Busca un lote de semillas.
     *
     * @param id - El ID del lote.
     */
    loteSemilla(id) {
        return this.lotesSemilla.find(lote => String(lote.idInventario) === String(id)) || null;
    }

    /**
     * Determina la disponibilidad de un lote de semillas.
     *
     * @param lote - Lote de inventario que se está consultando.
     * @param hoy - Fecha actual en formato AAAA-MM-DD.
     */
    estadoSemilla(lote, hoy) {
        if (Number(lote.cantidad) <= 0) {
            return { texto: 'Agotada', clase: 'peligro', vigente: false, conExistencia: false };
        }
        if (lote.fechaCaducidad && lote.fechaCaducidad < hoy) {
            return { texto: 'Caducada', clase: 'peligro', vigente: false, conExistencia: true };
        }
        if (lote.fechaCaducidad && Validacion.diasEntre(hoy, lote.fechaCaducidad) <= 30) {
            return { texto: 'Caduca en ' + Validacion.diasEntre(hoy, lote.fechaCaducidad) + ' día(s)', clase: 'alerta', vigente: true, conExistencia: true };
        }
        return { texto: 'Vigente', clase: 'listo', vigente: true, conExistencia: true };
    }

    /**
     * Busca el proveedor del lote.
     *
     * @param lote - El lote de semillas.
     */
    proveedorDeSemilla(lote) {
        const semilla = this.semillasPorId[lote.idInsumo];
        return semilla ? this.proveedoresSemilla[semilla.idProveedor] || '' : '';
    }

    /**
     * Llena el selector con los lotes que admite el tipo de movimiento.
     */
    llenarLotesSemilla() {
        const pantalla = this;
        const hoy = Validacion.hoy();
        const esSalida = selectTipoSemilla.value === 'salida';
        const anterior = selectLoteSemilla.value;
        selectLoteSemilla.innerHTML = '<option value="">Selecciona un lote</option>';
        this.lotesSemilla.forEach(function (lote) {
            const estado = pantalla.estadoSemilla(lote, hoy);
            if (esSalida && !estado.vigente) {
                return;
            }
            const opcion = document.createElement('option');
            opcion.value = lote.idInventario;
            opcion.textContent = '#' + lote.idInventario + ' · ' + lote.nombreInsumo + ' · ' + cantidadTexto(lote.cantidad, lote.unidadMedida);
            selectLoteSemilla.appendChild(opcion);
        });
        selectLoteSemilla.value = this.loteSemilla(anterior) ? anterior : '';
        document.getElementById('bloque-cultivo-semilla').hidden = !esSalida;
        this.mostrarDisponibleSemilla();
    }

    /**
     * Muestra la cantidad disponible del lote de semillas elegido.
     */
    mostrarDisponibleSemilla() {
        const lote = this.loteSemilla(selectLoteSemilla.value);
        document.getElementById('s-disponible').textContent = lote
            ? 'Disponible: ' + cantidadTexto(lote.cantidad, lote.unidadMedida) + (lote.fechaCaducidad ? ' · caduca ' + lote.fechaCaducidad : '')
            : '';
    }

    /**
     * Registra una entrada o salida de semillas.
     *
     * @param evento - El evento del formulario.
     */
    guardarMovimientoSemilla(evento) {
        const pantalla = this;
        evento.preventDefault();
        mensajeFormSemilla.textContent = '';
        if (!usuarioSemillas) {
            mensajeFormSemilla.textContent = 'Inicia sesión para registrar movimientos de semillas.';
            return;
        }
        const lote = this.loteSemilla(selectLoteSemilla.value);
        const esSalida = selectTipoSemilla.value === 'salida';
        const cultivo = esSalida ? Campo.cultivoPorId(selectCultivoSemilla.value) : null;
        const error = Validacion.primerError([
            [selectTipoSemilla, Validacion.opcion(selectTipoSemilla.value, ['salida', 'entrada'], 'el tipo de movimiento')],
            [selectLoteSemilla, lote ? '' : 'Selecciona un lote del banco.'],
            [campoCantidadSemilla, Validacion.numero(campoCantidadSemilla.value, {
                nombre: 'la cantidad', unidad: lote && lote.unidadMedida,
                maximo: esSalida && lote ? Number(lote.cantidad) : 99999999.99
            })],
            [selectLoteSemilla, esSalida && lote && lote.fechaCaducidad && lote.fechaCaducidad < Validacion.hoy()
                ? 'Ese lote está caducado; no se puede usar para sembrar.' : ''],
            [campoNotasSemilla, Validacion.texto(campoNotasSemilla.value, { nombre: 'las notas', maximo: 120, obligatorio: false })]
        ]);
        if (error) {
            mensajeFormSemilla.textContent = error;
            return;
        }
        let detalle = esSalida
            ? (cultivo ? 'Siembra en ' + Campo.nombreCultivo(cultivo) : 'Salida de semilla')
            : 'Entrada de semilla';
        if (campoNotasSemilla.value.trim()) {
            detalle += '. ' + campoNotasSemilla.value.trim();
        }
        const boton = document.getElementById('guardar-semilla');
        boton.disabled = true;
        pedirApi('/movimientos-inventario', 'POST', {
            idInventario: lote.idInventario,
            idUsuario: usuarioSemillas.idUsuario,
            tipoMovimiento: selectTipoSemilla.value,
            cantidad: Number(campoCantidadSemilla.value),
            observacion: detalle.slice(0, 255)
        }).then(function () {
            formSemilla.reset();
            return pantalla.cargarBanco();
        }).then(function () {
            mensajeSemillas.textContent = 'Movimiento registrado en el banco de semillas.';
            mensajeSemillas.className = 'mensaje ok';
        }).catch(function (fallo) {
            mensajeFormSemilla.textContent = textoErrorApi(fallo);
        }).finally(function () {
            boton.disabled = false;
        });
    }

    /**
     * Conecta los eventos de esta pantalla y carga los datos.
     */
    iniciarSemillas() {
        formSemilla.addEventListener('submit', this.guardarMovimientoSemilla.bind(this));
        selectTipoSemilla.addEventListener('change', this.llenarLotesSemilla.bind(this));
        selectLoteSemilla.addEventListener('change', this.mostrarDisponibleSemilla.bind(this));
        buscadorSemillas.addEventListener('input', this.dibujarBanco.bind(this));
        soloUsables.addEventListener('change', this.dibujarBanco.bind(this));
        document.getElementById('actualizar').onclick = this.cargarBanco.bind(this);
        this.cargarBanco();
    }
}

const usuarioSemillas = usuarioActual();
const formSemilla = document.getElementById('formulario-semilla');
const selectLoteSemilla = document.getElementById('s-lote');
const selectTipoSemilla = document.getElementById('s-tipo');
const selectCultivoSemilla = document.getElementById('s-cultivo');
const campoCantidadSemilla = document.getElementById('s-cantidad');
const campoNotasSemilla = document.getElementById('s-notas');
const mensajeFormSemilla = document.getElementById('mensaje-semilla');
const mensajeSemillas = document.getElementById('mensaje');
const buscadorSemillas = document.getElementById('buscar-semilla');
const soloUsables = document.getElementById('solo-usables');

const bancoSemillas = new BancoSemillas();

bancoSemillas.iniciarSemillas();
