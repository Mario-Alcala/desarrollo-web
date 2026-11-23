/*
 * ARCHIVO: pruebas/login.test.js
 * Pruebas de sesionDeTrabajador() en js/ap.js (la sesión que se guarda al entrar como trabajador).
 * Se ejecuta con:  node --test frontend/pruebas/login.test.js
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const codigo = fs.readFileSync(path.join(__dirname, '..', 'js', 'ap.js'), 'utf8');
// document simulado sin elementos: la parte de pantalla de ap.js no se activa.
const ctx = vm.createContext({ document: { getElementById: () => null }, String });
vm.runInContext(codigo, ctx);
const plano = (x) => JSON.parse(JSON.stringify(x));

const usuarios = [
    { idUsuario: 1, nombreUsuario: 'Felipe', correoElectronico: 'trabajador@gmail.com', rol: 'trabajador' },
    { idUsuario: 2, nombreUsuario: 'Ana', correoElectronico: 'ana@correo.com', rol: 'administrador_agricultor' },
    { idUsuario: 3, nombreUsuario: 'Cli', correoElectronico: 'cli@correo.com', rol: 'cliente' },
    { idUsuario: 7, nombreUsuario: 'Luis', correoElectronico: 'Luis.Campo@Correo.com ', rol: 'trabajador' }
];

test('devuelve la sesión con el id real, el nombre y el rol del trabajador', () => {
    assert.deepStrictEqual(plano(ctx.sesionDeTrabajador(usuarios, 'trabajador@gmail.com')),
        { idUsuario: 1, nombre: 'Felipe', rol: 'trabajador' });
});

test('ignora mayúsculas y espacios en el correo', () => {
    assert.strictEqual(ctx.sesionDeTrabajador(usuarios, '  TRABAJADOR@Gmail.com ').idUsuario, 1);
});

test('un correo que no es de trabajador (administrador o cliente) no abre sesión de trabajador', () => {
    assert.strictEqual(ctx.sesionDeTrabajador(usuarios, 'ana@correo.com'), null);
    assert.strictEqual(ctx.sesionDeTrabajador(usuarios, 'cli@correo.com'), null);
});

test('correo inexistente, lista vacía o nula devuelven null', () => {
    assert.strictEqual(ctx.sesionDeTrabajador(usuarios, 'otro@correo.com'), null);
    assert.strictEqual(ctx.sesionDeTrabajador([], 'trabajador@gmail.com'), null);
    assert.strictEqual(ctx.sesionDeTrabajador(null, 'trabajador@gmail.com'), null);
});

test('usa el id del usuario encontrado (no un id fijo) y compara sin importar mayúsculas guardadas', () => {
    assert.deepStrictEqual(plano(ctx.sesionDeTrabajador(usuarios, 'luis.campo@correo.com')),
        { idUsuario: 7, nombre: 'Luis', rol: 'trabajador' });
});