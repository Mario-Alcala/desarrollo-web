/*
 * ARCHIVO: frontend/pruebas/usuarios.test.js
 * QUÉ PRUEBA: js/usuarios-admin.js (pantalla Usuarios del administrador) sin abrir navegador ni backend.
 * CÓMO CORRER (desde la raíz del repo):  node --test frontend/pruebas/usuarios.test.js
 * CÓMO FUNCIONA: carga admin-comun.js y usuarios-admin.js en un "navegador falso" (DOM mínimo) y simula
 *   la API con un fetch falso, así se prueban los casos de éxito y de error sin el backend.
 * AUTORÍA: pruebas generadas con IA (Claude) y revisadas por el integrante; ver registro de IA (Uso 08).
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

class El {
    constructor(tag) {
        this.tagName = tag; this.children = []; this.style = {}; this.dataset = {};
        this.value = ""; this.checked = false; this.disabled = false; this.textContent = "";
        this.className = ""; this.listeners = {}; this.abierto = false;
    }
    append(...n) { this.children.push(...n); }
    replaceChildren(...n) { this.children = n; }
    addEventListener(t, f) { (this.listeners[t] ||= []).push(f); }
    setAttribute() {}
    querySelectorAll() { return []; }
    reset() {}
    showModal() { this.abierto = true; }
    close() { this.abierto = false; }
    disparar(tipo, evento = {}) { return Promise.all((this.listeners[tipo] || []).map(f => f({ preventDefault() {}, ...evento }))); }
}
const textoDe = el => [el.textContent, ...el.children.map(textoDe)].join(" ").replace(/\s+/g, " ").trim();
const esperar = () => new Promise(r => setTimeout(r, 5));

const API_LISTA = [
    { idUsuario: 1, nombreUsuario: "Ana Torres", correoElectronico: "ana@x.mx", rol: "administrador_agricultor" },
    { idUsuario: 2, nombreUsuario: "Luis Martínez", correoElectronico: "luis@x.mx", rol: "trabajador" },
    { idUsuario: 3, nombreUsuario: "Cliente Uno", correoElectronico: "cliente@x.mx", rol: "cliente" }
];

// opciones.api: "ok" (usa API_LISTA), "caida" (fetch falla), "vacia" (devuelve []), "rechaza" (POST/PUT dan 500)
async function cargarPantalla({ api = "ok" } = {}) {
    const elementos = {};
    const documento = {
        createElement: t => new El(t),
        getElementById: i => (elementos[i] ||= new El("#" + i)),
        querySelector: s => (elementos[s] ||= new El(s))
    };
    const llamadas = [];
    const fetchFalso = async (url, opciones = {}) => {
        const metodo = opciones.method || "GET";
        llamadas.push({ url, metodo, cuerpo: opciones.body ? JSON.parse(opciones.body) : null });
        if (api === "caida") throw new Error("Failed to fetch");
        if (metodo === "GET") return { ok: true, status: 200, json: async () => (api === "vacia" ? [] : API_LISTA) };
        return api === "rechaza" ? { ok: false, status: 500 } : { ok: true, status: 201 };
    };
    const ctx = vm.createContext({ document: documento, fetch: fetchFalso, console, Math, Set, Number, String, JSON, Array });
    const dir = path.join(__dirname, "..", "js");
    for (const f of ["admin-comun.js", "usuarios-admin.js"]) vm.runInContext(fs.readFileSync(path.join(dir, f), "utf8"), ctx);
    await esperar();
    const e = id => documento.getElementById(id);
    const ev = c => vm.runInContext(c, ctx);
    const llenar = (v = {}) => {
        const base = { "u-nombre": "Pedro Gómez", "u-correo": "pedro@x.mx", "u-contrasena": "secreto123", "u-rol": "trabajador" };
        Object.entries({ ...base, ...v }).forEach(([id, val]) => (e(id).value = val));
    };
    const enviar = async () => { await e("formulario-usuario").disparar("submit"); await esperar(); };
    const filas = () => e("lista-usuarios").children;
    return { e, ev, llenar, enviar, filas, llamadas, documento };
}

// ============ validarUsuario (lógica pura) ============
const base = { nombreUsuario: "Pedro Gómez", correoElectronico: "pedro@x.mx", contrasena: "secreto123", rol: "trabajador" };
const valida = async (datos, id = null) => {
    const p = await cargarPantalla();
    return p.ev(`validarUsuario(${JSON.stringify(datos)}, ${JSON.stringify(API_LISTA)}, ${id === null ? "null" : id})`);
};

test("validarUsuario: datos correctos devuelven ''", async () => assert.equal(await valida(base), ""));
test("validarUsuario: nombre muy corto o vacío", async () => {
    assert.match(await valida({ ...base, nombreUsuario: "Al" }), /nombre/i);
    assert.match(await valida({ ...base, nombreUsuario: "   " }), /nombre/i);
});
test("validarUsuario: correos con formato inválido", async () => {
    for (const c of ["", "pedro", "pedro@", "pedro@x", "pe dro@x.mx"])
        assert.match(await valida({ ...base, correoElectronico: c }), /correo/i, `correo: "${c}"`);
});
test("validarUsuario: correo repetido (sin importar mayúsculas) se rechaza", async () => {
    assert.match(await valida({ ...base, correoElectronico: "ANA@x.mx" }), /ya existe/i);
});
test("validarUsuario: al editar, conservar el propio correo es válido", async () => {
    assert.equal(await valida({ ...base, correoElectronico: "luis@x.mx" }, 2), "");
});
test("validarUsuario: contraseña obligatoria al crear y de 8+ caracteres", async () => {
    assert.match(await valida({ ...base, contrasena: "" }), /contraseña es obligatoria/i);
    assert.match(await valida({ ...base, contrasena: "corta" }), /8 caracteres/);
    assert.equal(await valida({ ...base, contrasena: "12345678" }), "");
});
test("validarUsuario: al editar, hoy la contraseña es obligatoria (el backend la exige) y una corta no sirve", async () => {
    assert.match(await valida({ ...base, correoElectronico: "luis@x.mx", contrasena: "" }, 2), /contraseña/i);
    assert.match(await valida({ ...base, correoElectronico: "luis@x.mx", contrasena: "abc" }, 2), /8 caracteres/);
});
test("validarUsuario: con EDICION_EXIGE_CONTRASENA = false, editar con contraseña vacía se acepta", async () => {
    const p = await cargarPantalla();
    p.ev("EDICION_EXIGE_CONTRASENA = false");
    const r = p.ev(`validarUsuario(${JSON.stringify({ ...base, correoElectronico: "luis@x.mx", contrasena: "" })}, ${JSON.stringify(API_LISTA)}, 2)`);
    assert.equal(r, "");
});
test("validarUsuario: no se puede asignar rol cliente ni roles inventados", async () => {
    assert.match(await valida({ ...base, rol: "cliente" }), /rol/i);
    assert.match(await valida({ ...base, rol: "superadmin" }), /rol/i);
    assert.match(await valida({ ...base, rol: "" }), /rol/i);
});
test("validarUsuario: un cliente existente conserva su rol al editarlo", async () => {
    assert.equal(await valida({ ...base, correoElectronico: "cliente@x.mx", rol: "cliente" }, 3), "");
});

// ============ filtrarUsuarios ============
test("filtrarUsuarios: por rol, por texto y combinados", async () => {
    const p = await cargarPantalla();
    const f = (rol, t) => JSON.parse(p.ev(`JSON.stringify(filtrarUsuarios(${JSON.stringify(API_LISTA)}, "${rol}", "${t}").map(u => u.idUsuario))`));
    assert.deepEqual(f("todos", ""), [1, 2, 3]);
    assert.deepEqual(f("trabajador", ""), [2]);
    assert.deepEqual(f("todos", "ANA"), [1]);
    assert.deepEqual(f("todos", "cliente@"), [3]);
    assert.deepEqual(f("cliente", "ana"), []);
});

// ============ Pantalla: carga ============
test("con la API disponible se dibujan los usuarios y no aparece el aviso de ejemplo", async () => {
    const p = await cargarPantalla();
    assert.equal(p.filas().length, 3);
    assert.doesNotMatch(p.e("mensaje-usuarios").textContent, /ejemplo/);
    assert.match(textoDe(p.filas()[0]), /Ana Torres ana@x\.mx Administrador \/ Agricultor/);
});
test("si la API está caída se usan los datos de ejemplo y se avisa", async () => {
    const p = await cargarPantalla({ api: "caida" });
    assert.equal(p.filas().length, 4);
    assert.match(p.e("mensaje-usuarios").textContent, /datos de ejemplo/);
});
test("si la API responde con la lista vacía se muestra vacía (no se inventan datos) y el alta va a la API", async () => {
    const p = await cargarPantalla({ api: "vacia" });
    assert.equal(p.filas().length, 0);
    assert.equal(p.e("mensaje-usuarios").textContent, "No hay usuarios para mostrar.");
    await p.e("agregar-usuario").disparar("click");
    p.llenar(); await p.enviar();
    assert.equal(p.llamadas.filter(l => l.metodo === "POST").length, 1);
});

// ============ Pantalla: filtros y búsqueda ============
test("filtro por rol y búsqueda; sin resultados muestra aviso", async () => {
    const p = await cargarPantalla();
    await p.e("filtros-rol").disparar("click", { target: { closest: () => ({ dataset: { valor: "trabajador" }, setAttribute() {} }) } });
    assert.equal(p.filas().length, 1);
    await p.e("filtros-rol").disparar("click", { target: { closest: () => ({ dataset: { valor: "todos" }, setAttribute() {} }) } });
    p.e("#topbar input").value = "zzz"; await p.e("#topbar input").disparar("input");
    assert.equal(p.filas().length, 0);
    assert.equal(p.e("mensaje-usuarios").textContent, "No hay usuarios para mostrar.");
    p.e("#topbar input").value = ""; await p.e("#topbar input").disparar("input");
    assert.equal(p.e("mensaje-usuarios").textContent, "");
});

// ============ Pantalla: formulario ============
test("alta válida: hace POST con los campos de la API, cierra el diálogo y recarga la lista", async () => {
    const p = await cargarPantalla();
    await p.e("agregar-usuario").disparar("click");
    assert.equal(p.e("dialogo-usuario").abierto, true);
    p.llenar(); await p.enviar();
    const post = p.llamadas.find(l => l.metodo === "POST");
    assert.deepEqual(post.cuerpo, { nombreUsuario: "Pedro Gómez", correoElectronico: "pedro@x.mx", rol: "trabajador", contrasena: "secreto123" });
    assert.equal(post.url, "http://localhost:8081/api/usuarios");
    assert.equal(p.e("dialogo-usuario").abierto, false);
    assert.equal(p.llamadas.filter(l => l.metodo === "GET").length, 2, "recarga la lista tras guardar");
    assert.equal(p.e("mensaje-usuarios").textContent, "Usuario registrado.");
});
test("alta con correo repetido: no llama a la API y muestra el error", async () => {
    const p = await cargarPantalla();
    await p.e("agregar-usuario").disparar("click");
    p.llenar({ "u-correo": "ana@x.mx" }); await p.enviar();
    assert.equal(p.llamadas.filter(l => l.metodo === "POST").length, 0);
    assert.match(p.e("mensaje-formulario-usuario").textContent, /ya existe/i);
    assert.equal(p.e("dialogo-usuario").abierto, true);
});
test("alta con contraseña corta o rol cliente: no llama a la API", async () => {
    const p = await cargarPantalla();
    await p.e("agregar-usuario").disparar("click");
    p.llenar({ "u-contrasena": "123" }); await p.enviar();
    assert.match(p.e("mensaje-formulario-usuario").textContent, /8 caracteres/);
    p.llenar({ "u-rol": "cliente" }); await p.enviar();
    assert.match(p.e("mensaje-formulario-usuario").textContent, /rol/i);
    assert.equal(p.llamadas.filter(l => l.metodo === "POST").length, 0);
});
test("si el backend responde error, el diálogo sigue abierto y se explica el fallo", async () => {
    const p = await cargarPantalla({ api: "ok" });
    // la API de lectura funciona; la escritura se simula rechazada
    const original = p.ev("fetch");
    p.ev("fetch = async (u, o = {}) => (o.method ? { ok: false, status: 500 } : { ok: true, status: 200, json: async () => [] })");
    await p.e("agregar-usuario").disparar("click");
    p.llenar(); await p.enviar();
    assert.match(p.e("mensaje-formulario-usuario").textContent, /rechazó la petición \(HTTP 500\)/);
    assert.equal(p.e("dialogo-usuario").abierto, true);
});
test("editar con contraseña: PUT con todos los campos, incluida la contraseña", async () => {
    const p = await cargarPantalla();
    p.ev("abrirFormularioUsuario(usuarios[1])");
    assert.equal(p.e("titulo-dialogo-usuario").textContent, "Editar usuario");
    assert.equal(p.e("u-nombre").value, "Luis Martínez");
    assert.match(p.e("ayuda-contrasena").textContent, /Obligatoria al editar/);
    p.llenar({ "u-nombre": "Luis M. Ruiz", "u-correo": "luis@x.mx", "u-contrasena": "nuevaclave1", "u-rol": "administrador_agricultor" });
    await p.enviar();
    const put = p.llamadas.find(l => l.metodo === "PUT");
    assert.equal(put.url, "http://localhost:8081/api/usuarios/2");
    assert.deepEqual(put.cuerpo, { nombreUsuario: "Luis M. Ruiz", correoElectronico: "luis@x.mx", rol: "administrador_agricultor", contrasena: "nuevaclave1" });
    assert.equal(p.e("mensaje-usuarios").textContent, "Usuario actualizado.");
});
test("editar sin contraseña: no llama a la API (el backend daría 400) y lo explica", async () => {
    const p = await cargarPantalla();
    p.ev("abrirFormularioUsuario(usuarios[1])");
    p.llenar({ "u-correo": "luis@x.mx", "u-contrasena": "" });
    await p.enviar();
    assert.equal(p.llamadas.filter(l => l.metodo === "PUT").length, 0);
    assert.match(p.e("mensaje-formulario-usuario").textContent, /contraseña/i);
    assert.equal(p.e("dialogo-usuario").abierto, true);
});
test("con EDICION_EXIGE_CONTRASENA = false, editar sin contraseña manda el PUT sin el campo contrasena", async () => {
    const p = await cargarPantalla();
    p.ev("EDICION_EXIGE_CONTRASENA = false");
    p.ev("abrirFormularioUsuario(usuarios[1])");
    assert.match(p.e("ayuda-contrasena").textContent, /Déjala vacía/);
    p.llenar({ "u-correo": "luis@x.mx", "u-contrasena": "" });
    await p.enviar();
    const put = p.llamadas.find(l => l.metodo === "PUT");
    assert.deepEqual(put.cuerpo, { nombreUsuario: "Pedro Gómez", correoElectronico: "luis@x.mx", rol: "trabajador" });
});
test("editar un cliente: el selector de rol queda bloqueado", async () => {
    const p = await cargarPantalla();
    p.ev("abrirFormularioUsuario(usuarios[2])");
    assert.equal(p.e("u-rol").disabled, true);
    p.ev("abrirFormularioUsuario(usuarios[1])");
    assert.equal(p.e("u-rol").disabled, false);
});
test("sin API (datos de ejemplo): el alta vive solo en memoria y no llama a POST", async () => {
    const p = await cargarPantalla({ api: "caida" });
    await p.e("agregar-usuario").disparar("click");
    p.llenar(); await p.enviar();
    assert.equal(p.filas().length, 5);
    assert.equal(p.llamadas.filter(l => l.metodo === "POST").length, 0);
    assert.match(p.e("mensaje-usuarios").textContent, /solo en esta sesión/);
});