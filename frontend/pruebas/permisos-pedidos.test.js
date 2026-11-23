/*
 * ARCHIVO: pruebas/permisos-pedidos.test.js
 * Pruebas de js/permisos-pedidos.js (qué acciones ve cada rol en los pedidos).
 * Se ejecuta con:  node --test frontend/pruebas/permisos-pedidos.test.js
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const codigo = fs.readFileSync(path.join(__dirname, '..', 'js', 'permisos-pedidos.js'), 'utf8');
function cargar(sesion) {
    const almacen = sesion === undefined ? null : sesion;
    const ctx = vm.createContext({
        JSON,
        sessionStorage: { getItem: () => almacen }
    });
    vm.runInContext(codigo, ctx);
    return ctx;
}
const plano = (x) => JSON.parse(JSON.stringify(x));

test('administrador: asigna y puede dejar cualquier estado, incluido el final', () => {
    const a = plano(cargar().accionesPedido('administrador_agricultor', 'pendiente'));
    assert.strictEqual(a.asignar, true);
    assert.strictEqual(a.entrega, true);
    assert.ok(a.estadosEntrega.includes('entregado'));
});

test('trabajador: asigna y prepara, pero no puede marcar entregado', () => {
    const a = plano(cargar().accionesPedido('trabajador', 'pendiente'));
    assert.strictEqual(a.asignar, true);
    assert.strictEqual(a.entrega, true);
    assert.deepStrictEqual(a.estadosEntrega, ['pendiente', 'en_transito', 'listo_recoleccion']);
    assert.match(a.aviso, /administrador confirma/);
});

test('cliente y roles desconocidos solo consultan', () => {
    for (const rol of ['cliente', 'otro', '']) {
        const a = plano(cargar().accionesPedido(rol, 'pendiente'));
        assert.strictEqual(a.asignar, false, rol);
        assert.strictEqual(a.entrega, false, rol);
        assert.deepStrictEqual(a.estadosEntrega, [], rol);
        assert.match(a.aviso, /solo puedes consultar/);
    }
});

test('pedidos entregados o cancelados no admiten cambios, ni siquiera al administrador', () => {
    for (const estado of ['entregado', 'cancelado']) {
        for (const rol of ['administrador_agricultor', 'trabajador']) {
            const a = plano(cargar().accionesPedido(rol, estado));
            assert.strictEqual(a.asignar, false, rol + ' ' + estado);
            assert.strictEqual(a.entrega, false, rol + ' ' + estado);
            assert.match(a.aviso, /no admite cambios/);
        }
    }
});

test('sin sesión: con la bandera activa se comporta como administrador; apagada, solo consulta', () => {
    const ctx = cargar();
    assert.strictEqual(ctx.SIN_SESION_COMO_ADMIN, true);
    assert.strictEqual(plano(ctx.accionesPedido(null, 'pendiente')).asignar, true);
    ctx.SIN_SESION_COMO_ADMIN = false;
    assert.strictEqual(plano(ctx.accionesPedido(null, 'pendiente')).asignar, false);
});

test('rolDeSesion lee el rol guardado y tolera sesión ausente o dañada', () => {
    assert.strictEqual(cargar(JSON.stringify({ idUsuario: 1, rol: 'trabajador' })).rolDeSesion(), 'trabajador');
    assert.strictEqual(cargar().rolDeSesion(), null);
    assert.strictEqual(cargar('{no es json').rolDeSesion(), null);
    assert.strictEqual(cargar(JSON.stringify({ idUsuario: 1 })).rolDeSesion(), null);
});

test('el enlace dice "Preparar pedido" para el trabajador y "Ver pedido" para los demás', () => {
    const ctx = cargar();
    assert.strictEqual(ctx.textoAccionPedido('trabajador'), 'Preparar pedido →');
    assert.strictEqual(ctx.textoAccionPedido('administrador_agricultor'), 'Ver pedido →');
    assert.strictEqual(ctx.textoAccionPedido(null), 'Ver pedido →');
});