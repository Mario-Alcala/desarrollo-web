/*
 * ARCHIVO: js/usuarios-admin.js
 * CAPA: FRONTEND (lógica). ¿ES CASCARÓN? NO: consulta la API, valida el formulario y dibuja la tabla.
 * QUÉ USA DEL BACKEND: /api/usuarios (GET para listar, POST para crear, PUT para editar).
 *   Campos de la API: idUsuario, nombreUsuario, correoElectronico, contrasena (solo de escritura) y rol.
 * REGLAS DEL DOCUMENTO: el administrador registra empleados y les asigna un rol (administrador_agricultor
 *   o trabajador). Los clientes se registran desde su propia pantalla: aquí se ven, pero no se crean ni
 *   se les puede cambiar el rol. El correo no se puede repetir. La contraseña la cifra el backend.
 * LE FALTA: eliminar usuarios; sesión y roles reales; que el backend rechace correos repetidos
 *   (aquí también se valida, pero la regla debe vivir en el backend).
 * PROBLEMAS DEL BACKEND (UsuarioService), por avisar al equipo:
 *   1) validar() acepta los roles "agricultor", "trabajador" y "cliente", pero el documento y la columna
 *      rol (ENUM) dicen "administrador_agricultor": por ahora la API no deja crear administradores.
 *   2) actualizar() exige contraseña siempre y la vuelve a cifrar: no se puede editar sin escribirla.
 *      Por eso EDICION_EXIGE_CONTRASENA vale true; cuando el backend la acepte vacía, ponla en false.
 * AÑADIDO POR BACKEND INCOMPLETO: si la API no responde se usan USUARIOS_EJEMPLO (los cambios entonces
 *   viven solo en memoria y se pierden al recargar). Si la API responde con la lista vacía NO se usan:
 *   la tabla sale vacía y el primer usuario se guarda de verdad en el backend.
 */

const API_USUARIOS = "http://localhost:8081/api/usuarios";

const NOMBRE_ROL = {
    administrador_agricultor: "Administrador / Agricultor",
    trabajador: "Trabajador",
    cliente: "Cliente"
};
const ROLES_ASIGNABLES = ["administrador_agricultor", "trabajador"];

const USUARIOS_EJEMPLO = [
    { idUsuario: 1, nombreUsuario: "Ana Torres", correoElectronico: "ana@gestioncultivos.example", rol: "administrador_agricultor" },
    { idUsuario: 2, nombreUsuario: "Luis Martínez", correoElectronico: "luis@gestioncultivos.example", rol: "trabajador" },
    { idUsuario: 3, nombreUsuario: "Rosa Hernández", correoElectronico: "rosa@gestioncultivos.example", rol: "trabajador" },
    { idUsuario: 4, nombreUsuario: "Restaurante La Hacienda", correoElectronico: "compras@lahacienda.example", rol: "cliente" }
];

const tabla = document.getElementById("lista-usuarios");
const mensajeUsuarios = document.getElementById("mensaje-usuarios");
const buscadorUsuarios = document.querySelector("#topbar input");
const dialogoUsuario = document.getElementById("dialogo-usuario");
const formularioUsuario = document.getElementById("formulario-usuario");
const mensajeFormularioUsuario = document.getElementById("mensaje-formulario-usuario");

// El backend actual exige contraseña también al editar (ver PROBLEMAS DEL BACKEND arriba).
let EDICION_EXIGE_CONTRASENA = true;

let usuarios = [];
let usandoEjemplo = false;
let rolActivo = "todos";
let editandoIdUsuario = null;

/* ---------- Lógica pura (sin DOM): es lo que prueban las pruebas automáticas ---------- */

// Devuelve "" si todo está bien o el texto del primer error encontrado.
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
    if (contrasena === "" && EDICION_EXIGE_CONTRASENA) return "Escribe la contraseña del usuario (la actual o una nueva): el backend la exige al editar.";
    if (contrasena !== "" && contrasena.length < 8) return "La contraseña debe tener al menos 8 caracteres.";

    const rolPermitido = ROLES_ASIGNABLES.includes(datos.rol) || (actual && actual.rol === "cliente" && datos.rol === "cliente");
    if (!rolPermitido) return "Elige un rol válido: administrador o trabajador.";
    return "";
}

function filtrarUsuarios(lista, rol, texto) {
    const q = (texto || "").trim().toLowerCase();
    return lista.filter(u =>
        (rol === "todos" || u.rol === rol) &&
        (!q || String(u.nombreUsuario).toLowerCase().includes(q) || String(u.correoElectronico).toLowerCase().includes(q))
    );
}

/* ---------- Datos ---------- */

async function cargarUsuarios() {
    try {
        const r = await fetch(API_USUARIOS);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const datos = await r.json();
        if (!Array.isArray(datos)) throw new Error("respuesta inesperada");
        usuarios = datos;
        usandoEjemplo = false;
        if (mensajeUsuarios.textContent === MENSAJE_EJEMPLO_USUARIOS) mensajeUsuarios.textContent = "";
    } catch (e) {
        usuarios = USUARIOS_EJEMPLO.map(u => ({ ...u }));
        usandoEjemplo = true;
        mensajeUsuarios.textContent = MENSAJE_EJEMPLO_USUARIOS;
    }
    dibujarUsuarios();
}

const MENSAJE_EJEMPLO_USUARIOS = "No se pudo leer la API de usuarios: se muestran datos de ejemplo. " + MENSAJE_SESION;

/* ---------- Pantalla ---------- */

function filaUsuario(u) {
    const fila = crear("tr");
    const celdaRol = crear("td");
    celdaRol.append(etiqueta(NOMBRE_ROL[u.rol] || capitalizar(u.rol), u.rol === "administrador_agricultor" ? "ok" : (u.rol === "trabajador" ? "aviso" : "")));
    const celdaAccion = crear("td");
    celdaAccion.append(crearBoton("Editar", "boton boton-secundario boton-chico", () => abrirFormularioUsuario(u)));
    fila.append(crear("td", u.nombreUsuario), crear("td", u.correoElectronico), celdaRol, celdaAccion);
    return fila;
}

function dibujarUsuarios() {
    const visibles = filtrarUsuarios(usuarios, rolActivo, buscadorUsuarios.value);
    tabla.replaceChildren(...visibles.map(filaUsuario));
    if (!visibles.length) mensajeUsuarios.textContent = "No hay usuarios para mostrar.";
    else if (mensajeUsuarios.textContent === "No hay usuarios para mostrar.") mensajeUsuarios.textContent = "";
}

function campo(id) {
    return document.getElementById(id);
}

function abrirFormularioUsuario(usuario) {
    editandoIdUsuario = usuario ? usuario.idUsuario : null;
    campo("titulo-dialogo-usuario").textContent = usuario ? "Editar usuario" : "Agregar usuario";
    mensajeFormularioUsuario.textContent = "";
    formularioUsuario.reset();
    const selector = campo("u-rol");
    selector.disabled = false;
    if (usuario) {
        campo("u-nombre").value = usuario.nombreUsuario;
        campo("u-correo").value = usuario.correoElectronico;
        campo("u-rol").value = usuario.rol;
        // Los clientes se registran solos: no se les cambia el rol desde aquí.
        if (usuario.rol === "cliente") selector.disabled = true;
    }
    campo("ayuda-contrasena").textContent = !usuario
        ? "Mínimo 8 caracteres. El backend la guarda cifrada."
        : (EDICION_EXIGE_CONTRASENA
            ? "Obligatoria al editar: escribe la actual o una nueva (mínimo 8 caracteres)."
            : "Déjala vacía para conservar la contraseña actual.");
    dialogoUsuario.showModal();
}

formularioUsuario.addEventListener("submit", async evento => {
    evento.preventDefault();
    mensajeFormularioUsuario.textContent = "";

    const datos = {
        nombreUsuario: campo("u-nombre").value.trim(),
        correoElectronico: campo("u-correo").value.trim().toLowerCase(),
        contrasena: campo("u-contrasena").value,
        rol: campo("u-rol").value
    };

    const error = validarUsuario(datos, usuarios, editandoIdUsuario);
    if (error) {
        mensajeFormularioUsuario.textContent = error;
        return;
    }

    const cuerpo = { nombreUsuario: datos.nombreUsuario, correoElectronico: datos.correoElectronico, rol: datos.rol };
    if (datos.contrasena !== "") cuerpo.contrasena = datos.contrasena;

    if (usandoEjemplo) {
        // Sin API: solo en memoria.
        if (editandoIdUsuario === null) {
            usuarios.push({ idUsuario: Math.max(0, ...usuarios.map(u => u.idUsuario)) + 1, ...cuerpo, contrasena: undefined });
        } else {
            Object.assign(usuarios.find(u => u.idUsuario === editandoIdUsuario), { ...cuerpo, contrasena: undefined });
        }
        dialogoUsuario.close();
        mensajeUsuarios.textContent = MENSAJE_EJEMPLO_USUARIOS;
        dibujarUsuarios();
        return;
    }

    try {
        const nuevo = editandoIdUsuario === null;
        const r = await fetch(nuevo ? API_USUARIOS : API_USUARIOS + "/" + editandoIdUsuario, {
            method: nuevo ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cuerpo)
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
        dialogoUsuario.close();
        mensajeUsuarios.textContent = nuevo ? "Usuario registrado." : "Usuario actualizado.";
        await cargarUsuarios();
        if (!usandoEjemplo) mensajeUsuarios.textContent = nuevo ? "Usuario registrado." : "Usuario actualizado.";
    } catch (e) {
        const respondio = String(e.message).startsWith("HTTP");
        mensajeFormularioUsuario.textContent = respondio
            ? "El backend rechazó la petición (" + e.message + "). Revisa los datos, la contraseña y el rol."
            : "No se pudo conectar con el backend. Revisa que esté encendido.";
    }
});

campo("agregar-usuario").addEventListener("click", () => abrirFormularioUsuario(null));
campo("cancelar-usuario").addEventListener("click", () => dialogoUsuario.close());
iniciarFiltros(campo("filtros-rol"), valorFiltro => {
    rolActivo = valorFiltro;
    dibujarUsuarios();
});
buscadorUsuarios.addEventListener("input", dibujarUsuarios);

cargarUsuarios();