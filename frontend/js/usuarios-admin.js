/* Datos: consulta, filtra y guarda usuarios mediante la API. No recibe atributos. */

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
let rolActivo = "todos";
let editandoIdUsuario = null;

/* Datos: valida nombre, correo, contraseña y rol. Recibe los datos, la lista de usuarios y el ID en edición. */
function validarUsuario(datos, lista, idEditando) {
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

/* Datos: selecciona usuarios por rol, nombre o correo. Recibe la lista, el rol y el texto de búsqueda. */
function filtrarUsuarios(lista, rol, texto) {
    const q = (texto || "").trim().toLowerCase();
    return lista.filter(u =>
        (rol === "todos" || u.rol === rol) &&
        (!q || String(u.nombreUsuario).toLowerCase().includes(q) || String(u.correoElectronico).toLowerCase().includes(q))
    );
}

/* Datos: actualiza la tabla con la lista recibida de la API. No recibe atributos. */
async function cargarUsuarios() {
    try {
        const r = await fetch(API_USUARIOS);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const datos = await r.json();
        if (!Array.isArray(datos)) throw new Error("respuesta inesperada");
        usuarios = datos;
        if (mensajeUsuarios.textContent === ERROR_CARGA_USUARIOS) mensajeUsuarios.textContent = "";
        dibujarUsuarios();
        return true;
    } catch (e) {
        usuarios = [];
        mensajeUsuarios.textContent = ERROR_CARGA_USUARIOS;
        dibujarUsuarios();
        return false;
    }
}

/* Datos: arma una fila de la tabla. Recibe un usuario con su ID, nombre, correo y rol. */
function filaUsuario(u) {
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
        abrirFormularioUsuario(u);
    });
    celdaAccion.append(botonEditar);
    fila.append(nombre, correo, celdaRol, celdaAccion);
    return fila;
}

/* Datos: dibuja los usuarios visibles según el filtro actual. No recibe atributos. */
function dibujarUsuarios() {
    const visibles = filtrarUsuarios(usuarios, rolActivo, buscadorUsuarios ? buscadorUsuarios.value : "");
    tabla.replaceChildren(...visibles.map(filaUsuario));
    if (mensajeUsuarios.textContent === ERROR_CARGA_USUARIOS) return;
    if (!visibles.length) mensajeUsuarios.textContent = "No hay usuarios para mostrar.";
    else if (mensajeUsuarios.textContent === "No hay usuarios para mostrar.") mensajeUsuarios.textContent = "";
}

/* Datos: busca un campo en las dos vistas existentes de Usuarios. Recibe el ID y el ID alternativo. */
function campo(id, alternativo) {
    return document.getElementById(id) || (alternativo ? document.getElementById(alternativo) : null);
}

/* Datos: prepara el formulario de alta o edición. Recibe el usuario a editar o null para dar de alta. */
function abrirFormularioUsuario(usuario) {
    editandoIdUsuario = usuario ? usuario.idUsuario : null;
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

/* Datos: oculta el formulario de Usuarios. No recibe atributos. */
function cerrarFormularioUsuario() {
    if (dialogoUsuario) dialogoUsuario.close();
    else panelUsuario.hidden = true;
}

/* Datos: envía el alta o la edición a la API. Recibe el evento de envío del formulario. */
async function guardarUsuario(evento) {
    evento.preventDefault();
    mensajeFormularioUsuario.textContent = "";

    const datos = {
        nombreUsuario: campo("u-nombre", "nombre-usuario").value.trim(),
        correoElectronico: campo("u-correo", "correo-usuario").value.trim().toLowerCase(),
        contrasena: campo("u-contrasena", "contrasena-usuario").value,
        rol: campo("u-rol", "rol-usuario").value
    };

    const error = validarUsuario(datos, usuarios, editandoIdUsuario);
    if (error) {
        mensajeFormularioUsuario.textContent = error;
        return;
    }

    const cuerpo = { nombreUsuario: datos.nombreUsuario, correoElectronico: datos.correoElectronico, rol: datos.rol };
    if (datos.contrasena !== "") cuerpo.contrasena = datos.contrasena;

    try {
        const nuevo = editandoIdUsuario === null;
        const r = await fetch(nuevo ? API_USUARIOS : API_USUARIOS + "/" + editandoIdUsuario, {
            method: nuevo ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cuerpo)
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
        cerrarFormularioUsuario();
        mensajeUsuarios.textContent = nuevo ? "Usuario registrado." : "Usuario actualizado.";
        if (await cargarUsuarios()) mensajeUsuarios.textContent = nuevo ? "Usuario registrado." : "Usuario actualizado.";
    } catch (e) {
        const respondio = String(e.message).startsWith("HTTP");
        mensajeFormularioUsuario.textContent = respondio
            ? "El backend rechazó la petición (" + e.message + "). Revisa los datos, la contraseña y el rol."
            : "No se pudo conectar con el backend. Revisa que esté encendido.";
    }
}

/* Datos: actualiza el rol visible en la tabla. Recibe el valor elegido en el filtro. */
function elegirRol(valorFiltro) {
    rolActivo = valorFiltro;
    dibujarUsuarios();
}

/* Datos: conecta los controles que ya existen en ambas vistas y carga la tabla. No recibe atributos. */
function iniciarUsuarios() {
    formularioUsuario.addEventListener("submit", guardarUsuario);
    campo("agregar-usuario", "mostrar-formulario").addEventListener("click", function () {
        abrirFormularioUsuario(null);
    });
    campo("cancelar-usuario", "cancelar-formulario").addEventListener("click", cerrarFormularioUsuario);
    if (dialogoUsuario) {
        iniciarFiltros(campo("filtros-rol"), elegirRol);
    } else {
        const botones = document.querySelectorAll(".filtros-usuario button[data-rol]");
        for (const boton of botones) {
            boton.addEventListener("click", function () {
                elegirRol(boton.dataset.rol);
            });
        }
    }
    if (buscadorUsuarios) buscadorUsuarios.addEventListener("input", dibujarUsuarios);
    cargarUsuarios();
}

iniciarUsuarios();
