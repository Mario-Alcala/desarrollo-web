/**
 * Maneja el formulario y la tabla de operaciones, como los registros de riego.
 *
 * @author Equipo de Gestión de Cultivos
 */
class Operaciones {
    /**
     * Prepara el formulario, su ruta y el estado de la edición.
     *
     * @param {HTMLFormElement} formulario - Formulario de la operación.
     */
    constructor(formulario) {
        this.formulario = formulario;
        this.ruta = formulario.dataset.ruta;
        this.campoId = formulario.dataset.id;
        this.idEnEdicion = null;
        this.registros = [];
        this.mensaje = document.getElementById('mensaje-operacion');
        this.campos = formulario.querySelectorAll('[name]');
    }

    /**
     * Consulta la API para llenar los selectores relacionados con el formulario.
     */
    async cargarRelaciones() {
        const selectores = this.formulario.querySelectorAll('select[data-ruta]');
        for (let i = 0; i < selectores.length; i++) {
            const select = selectores[i];
            const datos = await pedirApi(select.dataset.ruta);
            select.innerHTML = '<option value="">Selecciona una opción</option>';
            for (let j = 0; j < datos.length; j++) {
                const opcion = document.createElement('option');
                opcion.value = datos[j][select.dataset.id];
                opcion.textContent = datos[j][select.dataset.nombre];
                select.appendChild(opcion);
            }
        }
    }

    /**
     * Consulta los registros de la ruta que usa el formulario.
     */
    async cargarRegistros() {
        this.mensaje.textContent = '';
        const datos = await pedirApi(this.ruta);
        this.registros = datos || [];
        this.dibujarRegistros();
        this.mensaje.textContent = '';
    }

    /**
     * Actualiza los selectores y la lista de registros.
     */
    async actualizarOperacion() {
        document.getElementById('guardar-operacion').disabled = true;
        try {
            await this.cargarRelaciones();
            await this.cargarRegistros();
        } catch (error) {
            this.mensaje.textContent = errorApi(error);
        }
        document.getElementById('guardar-operacion').disabled = false;
    }

    /**
     * Muestra los registros con sus acciones de edición y eliminación.
     */
    dibujarRegistros() {
        const cuerpo = document.getElementById('registros-operacion');
        cuerpo.innerHTML = '';
        const columnas = document.querySelectorAll('th[data-campo]');

        for (let i = 0; i < this.registros.length; i++) {
            let registro = this.registros[i];
            const fila = document.createElement('tr');

            for (let j = 0; j < columnas.length; j++) {
                const columna = columnas[j];
                const celda = document.createElement('td');
                let valor = registro[columna.dataset.campo];
                const select = this.formulario.querySelector('select[name="' + columna.dataset.campo + '"]');

                if (select && select.dataset.ruta) {
                    for (let k = 0; k < select.options.length; k++) {
                        if (select.options[k].value === String(valor)) {
                            valor = select.options[k].textContent;
                            break;
                        }
                    }
                }

                celda.textContent = valor === null || valor === undefined ? '—' : valor;
                fila.appendChild(celda);
            }

            const acciones = document.createElement('td');

            const editar = document.createElement('button');
            editar.className = 'boton boton-secundario';
            editar.textContent = 'Editar';
            editar.onclick = () => this.editarRegistro(registro);

            const eliminar = document.createElement('button');
            eliminar.className = 'boton boton-secundario';
            eliminar.textContent = 'Eliminar';
            eliminar.onclick = () => this.eliminarRegistro(registro, eliminar);

            acciones.appendChild(editar);
            acciones.appendChild(eliminar);
            fila.appendChild(acciones);
            cuerpo.appendChild(fila);
        }

        if (!this.registros.length) {
            const fila = document.createElement('tr');
            const celda = document.createElement('td');
            celda.colSpan = columnas.length + 1;
            celda.textContent = 'No hay registros.';
            fila.appendChild(celda);
            cuerpo.appendChild(fila);
        }
    }

    /**
     * Carga el registro elegido en el formulario de edición.
     *
     * @param {Object} registro - Registro que se va a editar.
     */
    editarRegistro(registro) {
        this.idEnEdicion = registro[this.campoId];
        for (let i = 0; i < this.campos.length; i++) {
            const campo = this.campos[i];
            const valor = registro[campo.name];
            campo.value = valor === null || valor === undefined ? '' : valor;
        }
        document.getElementById('guardar-operacion').textContent = 'Guardar cambios';
        this.campos[0].focus();
    }

    /**
     * Pide confirmación, elimina el registro y actualiza la tabla.
     *
     * @param {Object} registro - Registro que se va a eliminar.
     * @param {HTMLButtonElement} eliminar - Botón de la fila.
     */
    async eliminarRegistro(registro, eliminar) {
        if (!confirm('¿Eliminar este registro?')) {
            return;
        }
        eliminar.disabled = true;
        try {
            await pedirApi(this.ruta + '/' + registro[this.campoId], 'DELETE');
            this.limpiarOperacion();
            await this.cargarRegistros();
        } catch (error) {
            this.mensaje.textContent = errorApi(error);
            eliminar.disabled = false;
        }
    }

    /**
     * Limpia el formulario y vuelve al modo de registro.
     */
    limpiarOperacion() {
        this.idEnEdicion = null;
        this.formulario.reset();
        document.getElementById('guardar-operacion').textContent = 'Guardar';
    }

    /**
     * Registra o actualiza los datos en la ruta del formulario.
     *
     * @param evento - El evento del formulario.
     */
    async guardarOperacion(evento) {
        evento.preventDefault();

        for (let i = 0; i < this.campos.length; i++) {
            const campo = this.campos[i];
            if (campo.type === 'text' || campo.tagName === 'TEXTAREA') {
                campo.value = campo.value.trim();
            }
        }

        if (!this.formulario.reportValidity()) {
            return;
        }

        const datos = {};
        for (let i = 0; i < this.campos.length; i++) {
            const campo = this.campos[i];
            let valor = campo.value;
            datos[campo.name] = valor === ''
                ? null
                : (campo.type === 'number' || campo.dataset.numero ? Number(valor) : valor);
        }

        if (['/riegos', '/observaciones-cultivos', '/incidencias-cultivo', '/cosechas', '/movimientos-inventario'].includes(this.ruta)) {
            const idUsuarioSesion = sessionStorage.getItem('usuarioId');
            if (!idUsuarioSesion) {
                this.mensaje.textContent = 'Inicia sesión para registrar esta actividad.';
                return;
            }
            datos.idUsuario = Number(idUsuarioSesion);
        }

        if (datos.fechaCaducidad && datos.fechaIngreso && datos.fechaCaducidad < datos.fechaIngreso) {
            this.mensaje.textContent = 'La caducidad no puede ser anterior al ingreso.';
            return;
        }

        if ((datos.latitud === null) !== (datos.longitud === null)) {
            this.mensaje.textContent = 'Completa latitud y longitud juntas, o deja ambas vacías.';
            return;
        }

        const boton = document.getElementById('guardar-operacion');
        boton.disabled = true;
        const ruta = this.ruta + (this.idEnEdicion === null ? '' : '/' + this.idEnEdicion);

        try {
            await pedirApi(ruta, this.idEnEdicion === null ? 'POST' : 'PUT', datos);
            this.limpiarOperacion();
            await this.cargarRegistros();
            this.mensaje.textContent = 'Registro guardado en el servidor.';
        } catch (error) {
            this.mensaje.textContent = errorApi(error);
        }
        boton.disabled = false;
    }

    /**
     * Conecta los eventos de esta pantalla y carga los datos.
     */
    iniciar() {
        this.formulario.addEventListener('submit', evento => this.guardarOperacion(evento));
        document.getElementById('cancelar-operacion').onclick = () => this.limpiarOperacion();
        document.getElementById('actualizar-operacion').onclick = () => this.actualizarOperacion();
        this.actualizarOperacion();
    }
}

const operaciones = new Operaciones(document.getElementById('formulario-operacion'));
operaciones.iniciar();
