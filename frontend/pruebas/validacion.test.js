/*
 * ARCHIVO: pruebas/validacion.test.js
 * Pruebas de js/validacion.js (reglas de los formularios del trabajador).
 * Se ejecuta con:  node --test frontend/pruebas/
 */
const test = require('node:test');
const assert = require('node:assert');
const { Validacion: V } = require('../js/validacion.js');

test('fechas: formato, existencia, futuras y mínima', () => {
    assert.strictEqual(V.fecha('2026-11-20', { nombre: 'la fecha', noFutura: true, hoy: '2026-11-22' }), '');
    assert.match(V.fecha('', { nombre: 'la fecha' }), /Indica la fecha/);
    assert.match(V.fecha('2026-02-30', { nombre: 'la fecha' }), /válida/);
    assert.match(V.fecha('22/11/2026', { nombre: 'la fecha' }), /válida/);
    assert.match(V.fecha('2026-11-23', { nombre: 'la fecha de riego', noFutura: true, hoy: '2026-11-22' }), /no puede ser futura/);
    assert.match(V.fecha('2026-10-01', { nombre: 'la fecha', minima: '2026-11-01', nombreMinima: 'la siembra' }), /anterior a la siembra/);
    assert.strictEqual(V.fecha('2024-02-29', { nombre: 'la fecha' }), '');
});

test('números: positivos, decimales y máximo', () => {
    assert.strictEqual(V.numero('12.5', { nombre: 'los kilos' }), '');
    assert.strictEqual(V.numero(3, { nombre: 'los kilos' }), '');
    for (const malo of ['', 'abc', '-1', '1.234', '1e3', ' ']) {
        assert.notStrictEqual(V.numero(malo, { nombre: 'los kilos' }), '', 'debía rechazar ' + JSON.stringify(malo));
    }
    assert.match(V.numero('0', { nombre: 'la cantidad' }), /mayor que cero/);
    assert.match(V.numero('20', { nombre: 'la cantidad', maximo: 18, unidad: 'kg' }), /máximo 18 kg/);
    assert.strictEqual(V.numero('18', { nombre: 'la cantidad', maximo: 18 }), '');
    assert.strictEqual(V.numero('0', { nombre: 'x', mayorQueCero: false }), '');
});

test('texto obligatorio y longitud', () => {
    assert.match(V.texto('   ', { nombre: 'la observación' }), /Escribe la observación/);
    assert.strictEqual(V.texto('', { nombre: 'las notas', obligatorio: false }), '');
    assert.match(V.texto('x'.repeat(256), { nombre: 'las notas', maximo: 255 }), /máximo 255/);
});

test('opciones e ids', () => {
    assert.strictEqual(V.opcion('plaga', ['plaga', 'enfermedad']), '');
    assert.notStrictEqual(V.opcion('hongo', ['plaga', 'enfermedad']), '');
    assert.strictEqual(V.idValido('3'), '');
    assert.notStrictEqual(V.idValido(''), '');
    assert.notStrictEqual(V.idValido('1.5'), '');
});

test('días entre fechas y suma de días cruzando meses y años', () => {
    assert.strictEqual(V.diasEntre('2026-11-22', '2026-12-01'), 9);
    assert.strictEqual(V.diasEntre('2026-12-01', '2026-11-22'), -9);
    assert.strictEqual(V.sumarDias('2026-12-25', 10), '2027-01-04');
    assert.strictEqual(V.sumarDias('2028-02-28', 1), '2028-02-29');
});

test('primerError devuelve el primero y marca aria-invalid', () => {
    const campo = () => {
        const attrs = {};
        return { attrs, setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; }, focus: () => {} };
    };
    const a = campo(), b = campo();
    assert.strictEqual(V.primerError([[a, ''], [b, 'falla b']]), 'falla b');
    assert.strictEqual(b.attrs['aria-invalid'], 'true');
    assert.strictEqual(a.attrs['aria-invalid'], undefined);
});
