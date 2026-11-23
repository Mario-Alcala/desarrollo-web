/*
 * ARCHIVO: js/cultivos-actividades.js
 * CAPA: FRONTEND (lógica). Pantalla de cultivos del trabajador: consulta y registro de actividades.
 * QUÉ USA DEL BACKEND (con pedirApi() de js/api.js):
 *   GET /cultivos, GET /terrenos y GET /parcelas/terreno/{id} (para mostrar el nombre de la parcela y
 *   deducir el terreno), POST /observaciones-cultivos y POST /riegos.
 *   NO hace POST a /cultivos: los cultivos los da de alta el administrador. No pide el ID de parcela.
 * SESIÓN: el usuario de la observación sale de usuarioActual() (js/sesion.js); no hay selector de usuario.
 * CONVIVENCIA: va dentro de una función para no chocar con los nombres de js/cosecha-registro.js,
 *   que se carga en la misma página.
 * RIEGO: el usuario sale de la sesión y el terreno se obtiene desde la parcela del cultivo.
 */

(function () {
    var mensajeCultivos = document.getElementById('mensaje-operacion');
    var cuerpoCultivos = document.getElementById('registros-cultivos');
    var filtroEstado = document.getElementById('filtro-estado');
    var textoUsuario = document.getElementById('usuario-sesion');

    var dlgObservacion = document.getElementById('dialogo-observacion');
    var formObservacion = document.getElementById('formulario-observacion');
    var textoCultivoObs = document.getElementById('cultivo-observacion');
    var campoObsFecha = document.getElementById('obs-fecha');
    var campoObsDescripcion = document.getElementById('obs-descripcion');
    var mensajeObs = document.getElementById('mensaje-obs');
    var botonGuardarObs = document.getElementById('guardar-obs');

    var dlgRiego = document.getElementById('dialogo-riego');
    var formRiego = document.getElementById('formulario-riego');
    var textoCultivoRiego = document.getElementById('cultivo-riego');
    var campoRiegoFecha = document.getElementById('riego-fecha');
    var campoRiegoCantidad = document.getElementById('riego-cantidad');
    var campoRiegoUnidad = document.getElementById('riego-unidad');
    var campoRiegoMetodo = document.getElementById('riego-metodo');
    var campoRiegoNotas = document.getElementById('riego-notas');
    var mensajeRiego = document.getElementById('mensaje-riego');
    var botonGuardarRiego = document.getElementById('guardar-riego');

    var cultivos = [];
    var parcelas = {};
    var cultivoElegido = null;
    var usuario = usuarioActual();

    function textoError(error) {
        if (error instanceof TypeError) {
            return 'No hay conexión con el servidor. Revisa que el backend esté corriendo.';
        }
        return error.message || 'No se pudo completar la operación.';
    }

    function hoyLocal() {
        var ahora = new Date();
        var local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 10);
    }

    function agregarCelda(fila, texto) {
        var celda = document.createElement('td');
        celda.textContent = texto === null || texto === undefined || texto === '' ? '—' : texto;
        fila.appendChild(celda);
        return celda;
    }

    function textoParcela(cultivo) {
        var parcela = parcelas[cultivo.idParcela];
        return parcela ? parcela.nombre + ' · ' + parcela.terreno : '—';
    }

    function crearBotonAccion(texto, alClic) {
        var boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'boton boton-secundario';
        boton.textContent = texto;
        boton.onclick = alClic;
        return boton;
    }

    function dibujarCultivos() {
        var estado = filtroEstado.value;
        var visibles = cultivos.filter(function (cultivo) {
            return !estado || cultivo.estado === estado;
        });

        cuerpoCultivos.innerHTML = '';
        visibles.forEach(function (cultivo) {
            var fila = document.createElement('tr');
            agregarCelda(fila, cultivo.nombre);
            agregarCelda(fila, cultivo.familia);
            agregarCelda(fila, textoParcela(cultivo));
            agregarCelda(fila, cultivo.etapaFenologica);
            agregarCelda(fila, cultivo.fechaSiembra);
            agregarCelda(fila, cultivo.estado);

            var acciones = document.createElement('td');
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
            var filaVacia = document.createElement('tr');
            var celdaVacia = document.createElement('td');
            celdaVacia.colSpan = 7;
            celdaVacia.textContent = 'No hay cultivos para mostrar. Los da de alta el administrador.';
            filaVacia.appendChild(celdaVacia);
            cuerpoCultivos.appendChild(filaVacia);
        }
    }

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

    /* ---------- Observación ---------- */
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
        var descripcion = campoObsDescripcion.value.trim();
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

    /* ---------- Riego ---------- */
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
        var cantidad = Number(campoRiegoCantidad.value);
        if (!(cantidad > 0)) {
            mensajeRiego.textContent = 'La cantidad de agua debe ser mayor que cero.';
            return;
        }
        var parcela = parcelas[cultivoElegido.idParcela];
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

    /* ---------- Eventos generales ---------- */
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
})();
