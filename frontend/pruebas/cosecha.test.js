/*
 * ARCHIVO: pruebas/cosecha.test.js
 * Pruebas de la lógica de js/cosecha-registro.js (validación, cuerpo del POST, errores, listas).
 * Se ejecuta con:  node --test frontend/pruebas/cosecha.test.js
 * El navegador se simula con vm (sin DOM): la parte de pantalla no corre aquí.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const codigo = fs.readFileSync(path.join(__dirname, '..', 'js', 'cosecha-registro.js'), 'utf8');
const ctx = vm.createContext({ Promise, Number, String, Date, JSON });
vm.runInContext(codigo, ctx);

const HOY = '2026-11-22';
const USUARIO = { idUsuario: 7, nombre: 'Ana', rol: 'trabajador' };
const valido = () => ({
    idCultivo: '3', fechaCosecha: '2026-11-20', kilos: '12.5', maduracion: 'maduro', ubicacion: 'Pasillo A'
});
const plano = (x) => JSON.parse(JSON.stringify(x));

test('datos válidos no dan error', () => {
    assert.strictEqual(ctx.validarCosecha(valido(), HOY), '');
});

test('sin cultivo o con cultivo no numérico se rechaza', () => {
    for (const v of ['', 'abc', '0', '-2', '1.5']) {
        const d = valido(); d.idCultivo = v;
        assert.strictEqual(ctx.validarCosecha(d, HOY), 'Selecciona un cultivo.', 'valor: ' + v);
    }
});

test('fecha vacía, inexistente o futura se rechaza; hoy sí se permite', () => {
    let d = valido(); d.fechaCosecha = '';
    assert.match(ctx.validarCosecha(d, HOY), /fecha/);
    d = valido(); d.fechaCosecha = '2026-02-31';
    assert.match(ctx.validarCosecha(d, HOY), /válida/);
    d = valido(); d.fechaCosecha = '2026-11-23';
    assert.match(ctx.validarCosecha(d, HOY), /futura/);
    d = valido(); d.fechaCosecha = HOY;
    assert.strictEqual(ctx.validarCosecha(d, HOY), '');
});

test('kilos: vacío, cero, negativo, texto, 3 decimales y exceso se rechazan', () => {
    const casos = { '': /Indica/, '0': /mayores que cero/, '0.00': /mayores que cero/, '-1': /positivo/,
        'abc': /positivo/, '1.234': /2 decimales/, '100000000': /demasiado/ };
    for (const k of Object.keys(casos)) {
        const d = valido(); d.kilos = k;
        assert.match(ctx.validarCosecha(d, HOY), casos[k], 'kilos: ' + k);
    }
});

test('kilos válidos: entero, 1 y 2 decimales, y número ya convertido', () => {
    for (const k of ['5', '12.5', '0.01', '99999999.99', 8.25]) {
        const d = valido(); d.kilos = k;
        assert.strictEqual(ctx.validarCosecha(d, HOY), '', 'kilos: ' + k);
    }
});

test('maduración solo verde o maduro', () => {
    for (const m of ['', 'podrido', 'Verde ', undefined]) {
        const d = valido(); d.maduracion = m;
        assert.match(ctx.validarCosecha(d, HOY), /verde o maduro/, 'valor: ' + m);
    }
    const d = valido(); d.maduracion = 'verde';
    assert.strictEqual(ctx.validarCosecha(d, HOY), '');
});

test('ubicación: vacía o solo espacios se rechaza; más de 100 caracteres se rechaza', () => {
    let d = valido(); d.ubicacion = '   ';
    assert.match(ctx.validarCosecha(d, HOY), /ubicación/);
    d = valido(); d.ubicacion = 'x'.repeat(101);
    assert.match(ctx.validarCosecha(d, HOY), /100/);
    d = valido(); d.ubicacion = 'x'.repeat(100);
    assert.strictEqual(ctx.validarCosecha(d, HOY), '');
});

test('el cuerpo del POST toma el usuario de la sesión y deja disponibles = cosechados', () => {
    const d = valido(); d.idUsuario = 99; d.ubicacion = '  Pasillo A  ';
    assert.deepStrictEqual(plano(ctx.armarCosecha(d, USUARIO)), {
        idCultivo: 3, idUsuario: 7, fechaCosecha: '2026-11-20',
        cantidadCosechada: 12.5, cantidadDisponible: 12.5,
        estadoMaduracion: 'maduro', ubicacionBodega: 'Pasillo A'
    });
});

test('registrar: sin sesión no llama a la API', async () => {
    let llamadas = 0;
    const r = await ctx.registrarCosecha(valido(), null, HOY, () => { llamadas++; return Promise.resolve(); });
    assert.strictEqual(r.ok, false);
    assert.match(r.error, /sesión/);
    assert.strictEqual(llamadas, 0);
});

test('registrar: datos inválidos no llaman a la API', async () => {
    let llamadas = 0;
    const d = valido(); d.kilos = '0';
    const r = await ctx.registrarCosecha(d, USUARIO, HOY, () => { llamadas++; return Promise.resolve(); });
    assert.strictEqual(r.ok, false);
    assert.strictEqual(llamadas, 0);
});

test('registrar: datos válidos hacen un solo POST /cosechas con el cuerpo correcto', async () => {
    const llamadas = [];
    const r = await ctx.registrarCosecha(valido(), USUARIO, HOY, (ruta, metodo, cuerpo) => {
        llamadas.push({ ruta, metodo, cuerpo }); return Promise.resolve(null);
    });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(llamadas.length, 1);
    assert.strictEqual(llamadas[0].ruta, '/cosechas');
    assert.strictEqual(llamadas[0].metodo, 'POST');
    assert.strictEqual(llamadas[0].cuerpo.idUsuario, 7);
    assert.strictEqual(llamadas[0].cuerpo.cantidadDisponible, llamadas[0].cuerpo.cantidadCosechada);
});

test('registrar: error del backend y backend apagado dan mensajes distintos', async () => {
    const rechazo = await ctx.registrarCosecha(valido(), USUARIO, HOY,
        () => Promise.reject(new Error('El cultivo es obligatorio')));
    assert.strictEqual(rechazo.ok, false);
    assert.strictEqual(rechazo.error, 'El cultivo es obligatorio');

    const apagado = await ctx.registrarCosecha(valido(), USUARIO, HOY,
        () => Promise.reject(new TypeError('Failed to fetch')));
    assert.strictEqual(apagado.ok, false);
    assert.match(apagado.error, /No se pudo conectar/);
});

test('opciones de cultivos: omite finalizados y acepta id o idCultivo', () => {
    const lista = [
        { id: 1, nombre: 'Tomate', idParcela: 4, estado: 'activo' },
        { idCultivo: 2, nombre: 'Chile' },
        { id: 3, nombre: 'Maíz', estado: 'finalizado' }
    ];
    assert.deepStrictEqual(plano(ctx.opcionesCultivos(lista)), [
        { valor: '1', texto: 'Tomate · parcela 4' },
        { valor: '2', texto: 'Chile' }
    ]);
    assert.deepStrictEqual(plano(ctx.opcionesCultivos(null)), []);
});

test('lotes del usuario: solo los suyos, el más reciente primero, máximo indicado', () => {
    const lista = [
        { idCosecha: 1, idUsuario: 7 }, { idCosecha: 2, idUsuario: 8 },
        { idCosecha: 3, idUsuario: 7 }, { idCosecha: 4, idUsuario: 7 }
    ];
    assert.deepStrictEqual(plano(ctx.lotesDelUsuario(lista, 7, 2)).map(l => l.idCosecha), [4, 3]);
    assert.deepStrictEqual(plano(ctx.lotesDelUsuario(lista, 99, 10)), []);
});