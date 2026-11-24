/* Datos: este archivo valida y registra lotes de cosecha del trabajador. No recibe atributos. */

const MADURACIONES = ['verde', 'maduro'];
const MAX_KILOS = 99999999.99;
const MAX_UBICACION = 100;

/* Datos: esta función valida y envía el registro de cosecha. Recibe los datos, el usuario, la fecha de hoy y la función de la API. */
function registrarCosecha(datos, usuario, hoy, api) {
    if (!usuario) {
        return Promise.resolve({ ok: false, error: 'Inicia sesión para registrar una cosecha.' });
    }
    const error = validarCosecha(datos, hoy);
    if (error) {
        return Promise.resolve({ ok: false, error: error });
    }
    return api('/cosechas', 'POST', armarCosecha(datos, usuario))
        .then(function () { return { ok: true, error: '' }; })
        .catch(function (fallo) { return { ok: false, error: mensajeError(fallo) }; });
}

/* Datos: esta función formatea un número con dos dígitos. Recibe un número. */
function dosDigitos(n) {
    return (n < 10 ? '0' : '') + n;
}

/* Datos: esta función obtiene la fecha local actual en formato año, mes y día. No recibe atributos. */
function hoyLocal() {
    const d = new Date();
    return d.getFullYear() + '-' + dosDigitos(d.getMonth() + 1) + '-' + dosDigitos(d.getDate());
}

/* Datos: esta función comprueba que el texto representa una fecha válida. Recibe el texto de la fecha. */
function fechaExiste(texto) {
    const p = texto.split('-');
    const anio = Number(p[0]);
    const mes = Number(p[1]);
    const dia = Number(p[2]);
    const d = new Date(Date.UTC(anio, mes - 1, dia));
    return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

/* Datos: esta función valida cultivo, fecha, kilos, maduración y ubicación. Recibe los datos y la fecha de hoy. */
function validarCosecha(datos, hoy) {
    const cultivo = Number(datos.idCultivo);
    if (!datos.idCultivo || !Number.isInteger(cultivo) || cultivo <= 0) {
        return 'Selecciona un cultivo.';
    }

    const fecha = datos.fechaCosecha || '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !fechaExiste(fecha)) {
        return 'Indica una fecha de cosecha válida.';
    }
    if (fecha > hoy) {
        return 'La fecha de cosecha no puede ser futura.';
    }

    const kilos = String(datos.kilos === undefined || datos.kilos === null ? '' : datos.kilos).trim();
    if (kilos === '') {
        return 'Indica los kilos cosechados.';
    }
    if (!/^\d+(\.\d{1,2})?$/.test(kilos)) {
        return 'Los kilos deben ser un número positivo con máximo 2 decimales.';
    }
    if (Number(kilos) <= 0) {
        return 'Los kilos cosechados deben ser mayores que cero.';
    }
    if (Number(kilos) > MAX_KILOS) {
        return 'Los kilos cosechados son demasiado grandes.';
    }

    if (MADURACIONES.indexOf(datos.maduracion) === -1) {
        return 'Elige la maduración del lote: verde o maduro.';
    }

    const ubicacion = String(datos.ubicacion || '').trim();
    if (ubicacion === '') {
        return 'Indica la ubicación en bodega.';
    }
    if (ubicacion.length > MAX_UBICACION) {
        return 'La ubicación en bodega no puede pasar de ' + MAX_UBICACION + ' caracteres.';
    }
    return '';
}

/* Datos: esta función prepara el registro con los kilos disponibles y el trabajador. Recibe los datos y el usuario. */
function armarCosecha(datos, usuario) {
    const kilos = Number(String(datos.kilos).trim());
    return {
        idCultivo: Number(datos.idCultivo),
        idUsuario: usuario.idUsuario,
        fechaCosecha: datos.fechaCosecha,
        cantidadCosechada: kilos,
        cantidadDisponible: kilos,
        estadoMaduracion: datos.maduracion,
        ubicacionBodega: String(datos.ubicacion).trim()
    };
}

/* Datos: esta función prepara el texto del error de cosecha. Recibe el error. */
function mensajeError(error) {
    if (error && error.name === 'TypeError') {
        return 'No se pudo conectar con el backend (¿está encendido en el puerto 8081?).';
    }
    return error && error.message ? error.message : 'No se pudo registrar la cosecha.';
}

/* Datos: esta función prepara las opciones de cultivos no finalizados. Recibe la lista de cultivos. */
function opcionesCultivos(lista) {
    return (lista || [])
        .filter(function (c) { return c.estado !== 'finalizado'; })
        .map(function (c) {
            const id = c.id !== undefined ? c.id : c.idCultivo;
            let texto = c.nombre || ('Cultivo ' + id);
            if (c.idParcela !== undefined && c.idParcela !== null) {
                texto += ' · parcela ' + c.idParcela;
            }
            return { valor: String(id), texto: texto };
        });
}

/* Datos: esta función filtra y ordena los lotes del trabajador. Recibe la lista, el ID del usuario y el máximo de lotes. */
function lotesDelUsuario(lista, idUsuario, maximo) {
    return (lista || [])
        .filter(function (c) { return c.idUsuario === idUsuario; })
        .sort(function (a, b) { return b.idCosecha - a.idCosecha; })
        .slice(0, maximo || 10);
}

/* Datos: esta función prepara el formulario y carga cultivos y cosechas. No recibe atributos. */
function iniciarRegistroCosecha() {
    const formulario = document.getElementById('formulario-cosecha');
    if (!formulario) {
        return;
    }
    const selectCultivo = document.getElementById('c-cultivo');
    const campoFecha = document.getElementById('c-fecha');
    const campoKilos = document.getElementById('c-kilos');
    const campoMaduracion = document.getElementById('c-maduracion');
    const campoUbicacion = document.getElementById('c-ubicacion');
    const boton = document.getElementById('guardar-cosecha');
    const mensaje = document.getElementById('mensaje-cosecha');
    const quien = document.getElementById('quien-registra');
    const cuerpoLotes = document.getElementById('lotes-cosecha');

    campoFecha.value = hoyLocal();
    campoFecha.max = hoyLocal();

    const usuario = usuarioActual();
    if (usuario) {
        quien.textContent = 'Registra: ' + (usuario.nombre || ('usuario ' + usuario.idUsuario));
    } else {
        quien.textContent = 'Inicia sesión para registrar una cosecha.';
        boton.disabled = true;
    }

    /* Datos: esta función muestra los lotes del trabajador. Recibe la lista de cosechas de la API. */
    function dibujarLotes(lista) {
        cuerpoLotes.innerHTML = '';
        const lotes = usuario ? lotesDelUsuario(lista, usuario.idUsuario, 10) : [];
        lotes.forEach(function (lote) {
            const fila = document.createElement('tr');
            [lote.idCosecha, lote.nombreCultivo || lote.idCultivo, lote.fechaCosecha, lote.cantidadCosechada,
                lote.cantidadDisponible, lote.estadoMaduracion, lote.ubicacionBodega].forEach(function (valor) {
                const celda = document.createElement('td');
                celda.textContent = valor === null || valor === undefined ? '—' : valor;
                fila.appendChild(celda);
            });
            cuerpoLotes.appendChild(fila);
        });
        if (!lotes.length) {
            const vacia = document.createElement('tr');
            const celdaVacia = document.createElement('td');
            celdaVacia.colSpan = 7;
            celdaVacia.textContent = 'Todavía no has registrado lotes.';
            vacia.appendChild(celdaVacia);
            cuerpoLotes.appendChild(vacia);
        }
    }

    /* Datos: esta función consulta la API y muestra los lotes. No recibe atributos. */
    function cargarLotes() {
        return pedirApi('/cosechas').then(dibujarLotes).catch(function (error) {
            mensaje.textContent = mensajeError(error);
        });
    }

    /* Datos: esta función consulta la API y llena el selector de cultivos. No recibe atributos. */
    function cargarCultivos() {
        return pedirApi('/cultivos').then(function (lista) {
            const opciones = opcionesCultivos(lista);
            selectCultivo.innerHTML = '';
            const inicial = document.createElement('option');
            inicial.value = '';
            inicial.textContent = opciones.length ? 'Selecciona un cultivo' : 'No hay cultivos disponibles';
            selectCultivo.appendChild(inicial);
            opciones.forEach(function (o) {
                const opcion = document.createElement('option');
                opcion.value = o.valor;
                opcion.textContent = o.texto;
                selectCultivo.appendChild(opcion);
            });
            if (!opciones.length) {
                mensaje.textContent = 'No hay cultivos registrados. Pide al administrador que registre uno.';
            }
        }).catch(function (error) {
            mensaje.textContent = mensajeError(error);
        });
    }

    formulario.addEventListener('submit', function (evento) {
        evento.preventDefault();
        mensaje.textContent = '';
        boton.disabled = true;
        const datos = {
            idCultivo: selectCultivo.value,
            fechaCosecha: campoFecha.value,
            kilos: campoKilos.value,
            maduracion: campoMaduracion.value,
            ubicacion: campoUbicacion.value
        };
        registrarCosecha(datos, usuarioActual(), hoyLocal(), pedirApi).then(function (resultado) {
            if (resultado.ok) {
                formulario.reset();
                campoFecha.value = hoyLocal();
                mensaje.textContent = 'Lote registrado. Sus kilos disponibles son los cosechados y ya aparece en la Bodega del administrador.';
                return cargarLotes();
            }
            mensaje.textContent = resultado.error;
        }).finally(function () {
            boton.disabled = !usuario;
        });
    });

    cargarCultivos();
    cargarLotes();
}

if (typeof document !== 'undefined') {
    iniciarRegistroCosecha();
}
