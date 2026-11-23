/*
 * ARCHIVO: pruebas/calendario.test.js
 * Pruebas de js/calendario-logica.js: orden de etapas, calendario sugerido y eventos sincronizados.
 * Se ejecuta con:  node --test frontend/pruebas/
 */
const test = require('node:test');
const assert = require('node:assert');
const { CalendarioLogica: C } = require('../js/calendario-logica.js');

const cultivo = { id: 1, nombre: 'Tomate cherry', estado: 'activo', fechaSiembra: '2026-11-01', etapaFenologica: 'Siembra' };
const etapas = [
    { idEtapa: 10, idCultivo: 1, etapa: 'Siembra', fechaProgramada: '2026-11-01', estado: 'completada', fechaReal: '2026-11-02' },
    { idEtapa: 11, idCultivo: 1, etapa: 'Floración', fechaProgramada: '2027-01-01', estado: 'pendiente' }
];

test('reconoce etapas sin acentos ni mayúsculas', () => {
    assert.strictEqual(C.indiceEtapa('floracion'), 3);
    assert.strictEqual(C.indiceEtapa('GERMINACIÓN'), 0);
    assert.strictEqual(C.indiceEtapa('Vegetación'), 2);
    assert.strictEqual(C.indiceEtapa('Vegetación/Riego'), 2);
    assert.strictEqual(C.indiceEtapa('poda'), -1);
    assert.strictEqual(C.claseEtapa('Cosecha'), 'cosecha');
});

test('valida el orden de las fechas contra las etapas existentes', () => {
    const ok = { idCultivo: 1, etapa: 'Vegetación/Riego', fechaProgramada: '2026-12-01' };
    assert.strictEqual(C.validarProgramacion(ok, etapas, cultivo), '');
    assert.match(C.validarProgramacion({ etapa: 'Cosecha', fechaProgramada: '2026-12-15' }, etapas, cultivo), /antes de Floración/);
    assert.match(C.validarProgramacion({ etapa: 'Germinación', fechaProgramada: '2026-11-10' }, etapas, cultivo), /después de Siembra/);
    assert.match(C.validarProgramacion({ etapa: 'Floración', fechaProgramada: '2027-01-05' }, etapas, cultivo), /ya tiene programada/);
    assert.match(C.validarProgramacion({ etapa: 'Cosecha', fechaProgramada: '2026-10-01' }, [], cultivo), /antes de la siembra/);
    assert.match(C.validarProgramacion(ok, etapas, { estado: 'finalizado' }), /finalizado/);
    assert.match(C.validarProgramacion({ etapa: 'Poda', fechaProgramada: '2026-12-01' }, etapas, cultivo), /Elige la etapa/);
});

test('al reprogramar se ignora la propia etapa', () => {
    const cambio = { idEtapa: 11, etapa: 'Floración', fechaProgramada: '2027-01-10' };
    assert.strictEqual(C.validarProgramacion(cambio, etapas, cultivo), '');
});

test('calendario sugerido: fechas desde la base y sin repetir etapas', () => {
    const r = C.sugerirCalendario('2026-10-17', C.DIAS_SUGERIDOS, etapas);
    assert.strictEqual(r.error, '');
    assert.deepStrictEqual(r.etapas.map((e) => e.etapa), ['Germinación', 'Vegetación/Riego', 'Cosecha']);
    assert.strictEqual(r.etapas[0].fechaProgramada, '2026-10-17');
    assert.strictEqual(r.etapas[2].fechaProgramada, '2027-01-15');
    const malo = C.sugerirCalendario('2026-10-17', { 'Germinación': 0, 'Siembra': 15, 'Vegetación/Riego': 10, 'Floración': 60, 'Cosecha': 90 });
    assert.match(malo.error, /no pueden ser menos/);
});

test('eventos: etapas, siembra registrada, riegos y cosechas, con filtro', () => {
    const fuentes = {
        cultivos: [cultivo, { id: 2, nombre: 'Maíz', estado: 'activo', fechaSiembra: '2026-11-05' }],
        etapas: etapas,
        riegos: [{ idCultivo: 1, fechaRiego: '2026-11-20', cantidadAgua: 30, unidadMedida: 'litros' }],
        cosechas: [{ idCultivo: 2, fechaCosecha: '2026-11-21', cantidadCosechada: 12.5, nombreCultivo: 'Maíz' }]
    };
    const todos = C.construirEventos(fuentes, '');
    // Tomate ya tiene Siembra completada, así que solo Maíz muestra "Siembra registrada".
    assert.deepStrictEqual(todos.map((e) => e.tipo), ['etapa', 'siembra', 'riego', 'cosecha', 'etapa']);
    assert.strictEqual(todos[0].fecha, '2026-11-02');
    const soloTomate = C.construirEventos(fuentes, '1');
    assert.ok(soloTomate.every((e) => e.idCultivo === 1));
    assert.strictEqual(soloTomate.length, 3);
});

test('próxima etapa y atraso', () => {
    assert.deepStrictEqual(
        { ...C.proximaEtapa(etapas, '2026-12-30'), idEtapa: undefined },
        { etapa: 'Floración', fecha: '2027-01-01', dias: 2, atrasada: false, idEtapa: undefined });
    assert.strictEqual(C.proximaEtapa(etapas, '2027-01-05').atrasada, true);
    assert.strictEqual(C.proximaEtapa([], '2027-01-05'), null);
});
