/**
 * Consulta, filtra y guarda usuarios mediante la API.
 *
 * @author Equipo de Gestión de Cultivos
 */
class UsuariosAdmin {
    /**
     * Prepara el filtro de rol y el identificador del usuario que se edita.
     */
    constructor() {
        this.rolActivo = "todos";
        this.editandoIdUsuario = null;
    }

    /**
     * Valida nombre, correo, contraseña y rol.
     *
     * @param datos - Datos de la cuenta que se va a registrar o editar.
     * @param lista - Usuarios consultados en la API.
     * @param idEditando - Identificador del usuario que se está editando.
     */
    validarUsuario(datos, lista, idEditando) {
        const nombre = (datos.nombreUsuario || "").trim();
        const correo = (datos.correoElectronico || "").trim().toLowerCase();
        const contrasena = datos.contrasena || "";
        const actual = idEditando == null ? null : lista.find(u => u.idUsuario === idEditando);

        if (nombre.length < 3) return "El nombre debe tener al menos 3 caracteres.";
        if (nombre.length > 80) return "El nombre no puede pasar de 80 caracteres.";

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return "Escribe un correo válido, por ejemplo nombre@dominio.com.";
        const repetido = lista.some(u => u.idUsuario !== idEditando && String(u.correoElectronico).toLowerCase() === correo);
        if (repetido) return "Ya existe un usuario con ese correo.";

        if (contrasena === "" && idEditando == null) return "La contraseña es obligatoria.";
        if (contrasena === "" && dialogoUsuario && EDICION_EXIGE_CONTRASENA) return "Escribe la contraseña del usuario (la actual o una nueva).";
        if (contrasena !== "" && contrasena.length < 8) return "La contraseña debe tener al menos 8 caracteres.";

        const rolPermitido = ROLES_ASIGNABLES.includes(datos.rol) || (actual && actual.rol === "cliente" && datos.rol === "cliente");
        if (!rolPermitido) return "Elige un rol válido: administrador o trabajador.";
        return "";
    }

    /**
     * Selecciona usuarios por rol, nombre o correo.
     *
     * @param lista - Usuarios consultados en la API.
     * @param rol - Rol elegido en el filtro.
     * @param texto - Texto de búsqueda para el nombre y el correo.
     */
    filtrarUsuarios(lista, rol, texto) {
        const q = (texto || "").trim().toLowerCase();
        return lista.filter(u =>
            (rol === "todos" || u.rol === rol) &&
            (!q || String(u.nombreUsuario).toLowerCase().includes(q) || String(u.correoElectronico).toLowerCase().includes(q))
        );
    }

    /**
     * Actualiza la tabla con la lista recibida de la API.
     */
    async cargarUsuarios() {
        try {
            const r = await fetch(API_USUARIOS);
            if (!r.ok) throw new Error("HTTP " + r.status);
            const datos = await r.json();
            if (!Array.isArray(datos)) throw new Error("respuesta inesperada");
            usuarios = datos;
            if (mensajeUsuarios.textContent === ERROR_CARGA_USUARIOS) mensajeUsuarios.textContent = "";
            this.dibujarUsuarios();
            return true;
        } catch (e) {
            usuarios = [];
            mensajeUsuarios.textContent = ERROR_CARGA_USUARIOS;
            this.dibujarUsuarios();
            return false;
        }
    }

    /**
     * Arma una fila de la tabla.
     *
     * @param u - Un usuario con su ID, nombre, correo y rol.
     */
    filaUsuario(u) {
        const pantalla = this;
        const fila = document.createElement("tr");
        const nombre = document.createElement("td");
        nombre.textContent = u.nombreUsuario;
        const correo = document.createElement("td");
        correo.textContent = u.correoElectronico;
        const celdaRol = document.createElement("td");
        const etiquetaRol = document.createElement("span");
        const rol = String(u.rol || "");
        etiquetaRol.textContent = NOMBRE_ROL[rol] || rol.charAt(0).toUpperCase() + rol.slice(1);
        etiquetaRol.className = "etq";
        if (rol === "administrador_agricultor") etiquetaRol.className += " etq-ok";
        if (rol === "trabajador") etiquetaRol.className += " etq-aviso";
        celdaRol.append(etiquetaRol);
        const celdaAccion = document.createElement("td");
        const botonEditar = document.createElement("button");
        botonEditar.textContent = "Editar";
        botonEditar.className = "boton boton-secundario boton-chico";
        botonEditar.type = "button";
        botonEditar.addEventListener("click", function () {
            pantalla.abrirFormularioUsuario(u);
        });
        celdaAccion.append(botonEditar);
        fila.append(nombre, correo, celdaRol, celdaAccion);
        return fila;
    }

    /**
     * Dibuja los usuarios visibles según el filtro actual.
     */
    dibujarUsuarios() {
        const visibles = this.filtrarUsuarios(usuarios, this.rolActivo, buscadorUsuarios ? buscadorUsuarios.value : "");
        tabla.replaceChildren(...visibles.map(this.filaUsuario.bind(this)));
        if (mensajeUsuarios.textContent === ERROR_CARGA_USUARIOS) return;
        if (!visibles.length) mensajeUsuarios.textContent = "No hay usuarios para mostrar.";
        else if (mensajeUsuarios.textContent === "No hay usuarios para mostrar.") mensajeUsuarios.textContent = "";
    }

    /**
     * Prepara el formulario de alta o edición.
     *
     * @param usuario - Cuenta que se edita o null para registrar una nueva.
     */
    abrirFormularioUsuario(usuario) {
        this.editandoIdUsuario = usuario ? usuario.idUsuario : null;
        campo("titulo-dialogo-usuario", "titulo-formulario").textContent = usuario ? "Editar usuario" : "Agregar usuario";
        mensajeFormularioUsuario.textContent = "";
        formularioUsuario.reset();
        const selector = campo("u-rol", "rol-usuario");
        selector.disabled = false;
        if (usuario) {
            campo("u-nombre", "nombre-usuario").value = usuario.nombreUsuario;
            campo("u-correo", "correo-usuario").value = usuario.correoElectronico;
            if (!dialogoUsuario && usuario.rol === "cliente" && !selector.querySelector('option[value="cliente"]')) {
                const opcion = document.createElement("option");
                opcion.value = "cliente";
                opcion.textContent = NOMBRE_ROL.cliente;
                opcion.hidden = true;
                selector.append(opcion);
            }
            selector.value = usuario.rol;
            selector.disabled = usuario.rol === "cliente";
        }
        if (dialogoUsuario) {
            campo("ayuda-contrasena").textContent = !usuario
                ? "Mínimo 8 caracteres. El backend la guarda cifrada."
                : (EDICION_EXIGE_CONTRASENA
                    ? "Obligatoria al editar: escribe la actual o una nueva (mínimo 8 caracteres)."
                    : "Déjala vacía para conservar la contraseña actual.");
            dialogoUsuario.showModal();
        } else {
            panelUsuario.hidden = false;
        }
    }

    /**
     * Oculta el formulario de Usuarios.
     */
    cerrarFormularioUsuario() {
        if (dialogoUsuario) dialogoUsuario.close();
        else panelUsuario.hidden = true;
    }

    /**
     * Envía el alta o la edición a la API.
     *
     * @param evento - El evento de envío del formulario.
     */
    async guardarUsuario(evento) {
        evento.preventDefault();
        mensajeFormularioUsuario.textContent = "";

        const datos = {
            nombreUsuario: campo("u-nombre", "nombre-usuario").value.trim(),
            correoElectronico: campo("u-correo", "correo-usuario").value.trim().toLowerCase(),
            contrasena: campo("u-contrasena", "contrasena-usuario").value,
            rol: campo("u-rol", "rol-usuario").value
        };

        const error = this.validarUsuario(datos, usuarios, this.editandoIdUsuario);
        if (error) {
            mensajeFormularioUsuario.textContent = error;
            return;
        }

        const cuerpo = { nombreUsuario: datos.nombreUsuario, correoElectronico: datos.correoElectronico, rol: datos.rol };
        if (datos.contrasena !== "") cuerpo.contrasena = datos.contrasena;

        try {
            const nuevo = this.editandoIdUsuario === null;
            const r = await fetch(nuevo ? API_USUARIOS : API_USUARIOS + "/" + this.editandoIdUsuario, {
                method: nuevo ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cuerpo)
            });
            if (!r.ok) throw new Error("HTTP " + r.status);
            this.cerrarFormularioUsuario();
            mensajeUsuarios.textContent = nuevo ? "Usuario registrado." : "Usuario actualizado.";
            if (await this.cargarUsuarios()) mensajeUsuarios.textContent = nuevo ? "Usuario registrado." : "Usuario actualizado.";
        } catch (e) {
            const respondio = String(e.message).startsWith("HTTP");
            mensajeFormularioUsuario.textContent = respondio
                ? "El backend rechazó la petición (" + e.message + "). Revisa los datos, la contraseña y el rol."
                : "No se pudo conectar con el backend. Revisa que esté encendido.";
        }
    }

    /**
     * Actualiza el rol visible en la tabla.
     *
     * @param valorFiltro - El valor elegido en el filtro.
     */
    elegirRol(valorFiltro) {
        this.rolActivo = valorFiltro;
        this.dibujarUsuarios();
    }

    /**
     * Conecta los controles que ya existen en ambas vistas y carga la tabla.
     */
    iniciarUsuarios() {
        const pantalla = this;
        formularioUsuario.addEventListener("submit", this.guardarUsuario.bind(this));
        campo("agregar-usuario", "mostrar-formulario").addEventListener("click", function () {
            pantalla.abrirFormularioUsuario(null);
        });
        campo("cancelar-usuario", "cancelar-formulario").addEventListener("click", this.cerrarFormularioUsuario.bind(this));
        if (dialogoUsuario) {
            iniciarFiltros(campo("filtros-rol"), this.elegirRol.bind(this));
        } else {
            const botones = document.querySelectorAll(".filtros-usuario button[data-rol]");
            for (const boton of botones) {
                boton.addEventListener("click", function () {
                    pantalla.elegirRol(boton.dataset.rol);
                });
            }
        }
        if (buscadorUsuarios) buscadorUsuarios.addEventListener("input", this.dibujarUsuarios.bind(this));
        this.cargarUsuarios();
    }
}

const API_USUARIOS = "http://localhost:8081/api/usuarios";

const NOMBRE_ROL = {
    administrador_agricultor: "Administrador / Agricultor",
    trabajador: "Trabajador",
    cliente: "Cliente"
};
const ROLES_ASIGNABLES = ["administrador_agricultor", "trabajador"];

const ERROR_CARGA_USUARIOS = "No se pudieron consultar los usuarios. Revisa que el backend esté encendido.";
const tabla = document.getElementById("lista-usuarios");
const mensajeUsuarios = document.getElementById("mensaje-usuarios");
const buscadorUsuarios = document.querySelector("#topbar input");
const dialogoUsuario = document.getElementById("dialogo-usuario");
const panelUsuario = document.getElementById("panel-formulario");
const formularioUsuario = document.getElementById("formulario-usuario");
const mensajeFormularioUsuario = campo("mensaje-formulario-usuario", "mensaje-formulario");
let EDICION_EXIGE_CONTRASENA = true;
let usuarios = [];

const usuariosAdmin = new UsuariosAdmin();

/**
 * Busca un campo en las dos vistas existentes de Usuarios.
 *
 * @param id - Identificador del elemento HTML.
 * @param [alternativo] - Identificador de respaldo en la otra vista.
 */
function campo(id, alternativo) {
    return document.getElementById(id) || (alternativo ? document.getElementById(alternativo) : null);
}

/**
 * Valida nombre, correo, contraseña y rol.
 *
 * @param datos - Datos de la cuenta que se va a registrar o editar.
 * @param lista - Usuarios consultados en la API.
 * @param idEditando - Identificador del usuario que se está editando.
 */
function validarUsuario(datos, lista, idEditando) {
    return usuariosAdmin.validarUsuario(datos, lista, idEditando);
}

/**
 * Selecciona usuarios por rol, nombre o correo.
 *
 * @param lista - Usuarios consultados en la API.
 * @param rol - Rol elegido en el filtro.
 * @param texto - Texto de búsqueda para el nombre y el correo.
 */
function filtrarUsuarios(lista, rol, texto) {
    return usuariosAdmin.filtrarUsuarios(lista, rol, texto);
}

/**
 * Prepara el formulario de alta o edición.
 *
 * @param usuario - Cuenta que se edita o null para registrar una nueva.
 */
function abrirFormularioUsuario(usuario) {
    return usuariosAdmin.abrirFormularioUsuario(usuario);
}

usuariosAdmin.iniciarUsuarios();
