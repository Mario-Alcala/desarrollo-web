/* Datos: este archivo muestra cultivos y permite registrar riegos y observaciones. No recibe atributos. */

/* Datos: esta función conecta los eventos de esta pantalla y carga los datos. No recibe atributos. */
function iniciarCultivosActividades() {
    const mensajeCultivos = document.getElementById('mensaje-operacion');
    const cuerpoCultivos = document.getElementById('registros-cultivos');
    const filtroEstado = document.getElementById('filtro-estado');
    const textoUsuario = document.getElementById('usuario-sesion');

    const dlgObservacion = document.getElementById('dialogo-observacion');
    const formObservacion = document.getElementById('formulario-observacion');
    const textoCultivoObs = document.getElementById('cultivo-observacion');
    const campoObsFecha = document.getElementById('obs-fecha');
    const campoObsDescripcion = document.getElementById('obs-descripcion');
    const mensajeObs = document.getElementById('mensaje-obs');
    const botonGuardarObs = document.getElementById('guardar-obs');

    const dlgRiego = document.getElementById('dialogo-riego');
    const formRiego = document.getElementById('formulario-riego');
    const textoCultivoRiego = document.getElementById('cultivo-riego');
    const campoRiegoFecha = document.getElementById('riego-fecha');
    const campoRiegoCantidad = document.getElementById('riego-cantidad');
    const campoRiegoUnidad = document.getElementById('riego-unidad');
    const campoRiegoMetodo = document.getElementById('riego-metodo');
    const campoRiegoNotas = document.getElementById('riego-notas');
    const mensajeRiego = document.getElementById('mensaje-riego');
    const botonGuardarRiego = document.getElementById('guardar-riego');

    let cultivos = [];
    let parcelas = {};
    let cultivoElegido = null;
    const usuario = usuarioActual();

    /* Datos: esta función prepara un mensaje para errores de consulta o guardado. Recibe el error. */
    function textoError(error) {
        if (error instanceof TypeError) {
            return 'No hay conexión con el servidor. Revisa que el backend esté corriendo.';
        }
        return error.message || 'No se pudo completar la operación.';
    }

    /* Datos: esta función obtiene la fecha local actual en formato año, mes y día. No recibe atributos. */
    function hoyLocal() {
        const ahora = new Date();
        const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 10);
    }

    /* Datos: esta función agrega una celda de texto. Recibe una fila y su texto. */
    function agregarCelda(fila, texto) {
        const celda = document.createElement('td');
        celda.textContent = texto === null || texto === undefined || texto === '' ? '—' : texto;
        fila.appendChild(celda);
        return celda;
    }

    /* Datos: esta función busca el nombre de la parcela y su terreno. Recibe el cultivo. */
    function textoParcela(cultivo) {
        const parcela = parcelas[cultivo.idParcela];
        return parcela ? parcela.nombre + ' · ' + parcela.terreno : '—';
    }

    /* Datos: esta función crea una acción de la tabla de cultivos. Recibe el texto y la función del botón. */
    function crearBotonAccion(texto, alClic) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'boton boton-secundario';
        boton.textContent = texto;
        boton.onclick = alClic;
        return boton;
    }

    /* Datos: esta función muestra los cultivos que cumplen el filtro de estado. No recibe atributos. */
    function dibujarCultivos() {
        const estado = filtroEstado.value;
        const visibles = cultivos.filter(function (cultivo) {
            return !estado || cultivo.estado === estado;
        });

        cuerpoCultivos.innerHTML = '';
        visibles.forEach(function (cultivo) {
            const fila = document.createElement('tr');
            agregarCelda(fila, cultivo.nombre);
            agregarCelda(fila, cultivo.familia);
            agregarCelda(fila, textoParcela(cultivo));
            agregarCelda(fila, cultivo.etapaFenologica);
            agregarCelda(fila, cultivo.fechaSiembra);
            agregarCelda(fila, cultivo.estado);

            const acciones = document.createElement('td');
            if (cultivo.estado === 'activo') {
                acciones.appendChild(crearBotonAccion('Registrar riego', function () {
                    abrirRiego(cultivo);
                }));
                acciones.appendChild(crearBotonAccion('Registrar observación', function () {
                    abrirObservacion(cultivo);
                }));
            } else {
                acciones.textContent = '—';
            }
            fila.appendChild(acciones);
            cuerpoCultivos.appendChild(fila);
        });

        if (!visibles.length) {
            const filaVacia = document.createElement('tr');
            const celdaVacia = document.createElement('td');
            celdaVacia.colSpan = 7;
            celdaVacia.textContent = 'No hay cultivos para mostrar. Los da de alta el administrador.';
            filaVacia.appendChild(celdaVacia);
            cuerpoCultivos.appendChild(filaVacia);
        }
    }

    /* Datos: esta función consulta las parcelas de cada terreno desde la API. No recibe atributos. */
    function cargarParcelas() {
        parcelas = {};
        return pedirApi('/terrenos').then(function (terrenos) {
            return Promise.all((terrenos || []).map(function (terreno) {
                return pedirApi('/parcelas/terreno/' + terreno.id).then(function (lista) {
                    (lista || []).forEach(function (parcela) {
                        parcelas[parcela.idParcela] = {
                            nombre: parcela.nombre,
                            idTerreno: terreno.id,
                            terreno: terreno.nombre
                        };
                    });
                });
            }));
        });
    }

    /* Datos: esta función carga los cultivos y sus parcelas. No recibe atributos. */
    function cargarTodo() {
        mensajeCultivos.textContent = 'Cargando...';
        return Promise.all([pedirApi('/cultivos'), cargarParcelas()])
            .then(function (resultados) {
                cultivos = resultados[0] || [];
                dibujarCultivos();
                mensajeCultivos.textContent = '';
            })
            .catch(function (error) {
                mensajeCultivos.textContent = textoError(error);
            });
    }

    /* Datos: esta función envía un riego u observación a la API. Recibe la ruta, datos, diálogo, mensaje, botón y texto de confirmación. */
    function enviarActividad(ruta, datos, dialogo, mensajeError, boton, textoOk) {
        boton.disabled = true;
        pedirApi(ruta, 'POST', datos)
            .then(function () {
                dialogo.close();
                mensajeCultivos.textContent = textoOk;
            })
            .catch(function (error) {
                mensajeError.textContent = textoError(error);
            })
            .finally(function () {
                boton.disabled = false;
            });
    }

    /* Datos: esta función prepara el formulario de observaciones. Recibe el cultivo. */
    function abrirObservacion(cultivo) {
        cultivoElegido = cultivo;
        formObservacion.reset();
        mensajeObs.textContent = '';
        textoCultivoObs.textContent = 'Cultivo: ' + cultivo.nombre + ' (' + textoParcela(cultivo) + ')';
        campoObsFecha.value = hoyLocal();
        dlgObservacion.showModal();
    }

    formObservacion.addEventListener('submit', function (evento) {
        evento.preventDefault();
        mensajeObs.textContent = '';

        if (!usuario) {
            mensajeObs.textContent = 'No hay sesión iniciada. Inicia sesión para registrar observaciones.';
            return;
        }
        if (!formObservacion.reportValidity()) {
            return;
        }
        const descripcion = campoObsDescripcion.value.trim();
        if (!descripcion) {
            mensajeObs.textContent = 'Escribe la observación.';
            return;
        }

        enviarActividad('/observaciones-cultivos', {
            idCultivo: cultivoElegido.id,
            idUsuario: usuario.idUsuario,
            fechaObservacion: campoObsFecha.value,
            descripcion: descripcion
        }, dlgObservacion, mensajeObs, botonGuardarObs, 'Observación registrada en el servidor.');
    });

    /* Datos: esta función prepara el formulario de riegos. Recibe el cultivo. */
    function abrirRiego(cultivo) {
        cultivoElegido = cultivo;
        formRiego.reset();
        mensajeRiego.textContent = '';
        textoCultivoRiego.textContent = 'Cultivo: ' + cultivo.nombre + ' (' + textoParcela(cultivo) + ')';
        campoRiegoFecha.value = hoyLocal();
        dlgRiego.showModal();
    }

    formRiego.addEventListener('submit', function (evento) {
        evento.preventDefault();
        mensajeRiego.textContent = '';

        if (!formRiego.reportValidity()) {
            return;
        }
        const cantidad = Number(campoRiegoCantidad.value);
        if (!(cantidad > 0)) {
            mensajeRiego.textContent = 'La cantidad de agua debe ser mayor que cero.';
            return;
        }
        const parcela = parcelas[cultivoElegido.idParcela];
        if (!parcela) {
            mensajeRiego.textContent = 'No se encontró el terreno de este cultivo.';
            return;
        }

        enviarActividad('/riegos', {
            idCultivo: cultivoElegido.id,
            idUsuario: usuario.idUsuario,
            fechaRiego: campoRiegoFecha.value,
            cantidadAgua: cantidad,
            unidadMedida: campoRiegoUnidad.value.trim(),
            metodo: campoRiegoMetodo.value.trim() || null,
            observaciones: campoRiegoNotas.value.trim() || null
        }, dlgRiego, mensajeRiego, botonGuardarRiego, 'Riego registrado en el servidor.');
    });

    document.getElementById('cancelar-obs').onclick = function () { dlgObservacion.close(); };
    document.getElementById('cancelar-riego').onclick = function () { dlgRiego.close(); };
    document.getElementById('actualizar-operacion').onclick = cargarTodo;
    filtroEstado.onchange = dibujarCultivos;

    if (usuario) {
        textoUsuario.textContent = usuario.nombre || 'Usuario #' + usuario.idUsuario;
    } else {
        textoUsuario.textContent = 'Sin sesión (para registrar observaciones hay que iniciar sesión)';
    }
    cargarTodo();
}

iniciarCultivosActividades();
