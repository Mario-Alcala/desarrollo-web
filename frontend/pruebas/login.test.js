const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const codigo = fs.readFileSync(path.join(__dirname, '..', 'js', 'ap.js'), 'utf8');

function prepararLogin(usuario) {
    const guardados = new Map();
    const correo = { value: usuario.correoElectronico, checkValidity: () => true, focus() {} };
    const contrasena = { value: 'clave-prueba', focus() {} };
    const mensaje = { textContent: '' };
    const formulario = {
        submit: null,
        addEventListener(evento, accion) {
            if (evento === 'submit') this.submit = accion;
        }
    };
    const elementos = {
        'crear-cuenta': null,
        'formulario-login': formulario,
        'formulario-registro': null,
        correo,
        contrasena,
        'mensaje-login': mensaje
    };
    const llamadas = [];
    const ctx = vm.createContext({
        URLSearchParams,
        document: { getElementById: id => elementos[id] || null },
        window: { location: {
            search: '', hostname: '127.0.0.1', href: 'http://127.0.0.1:3000/frontend/login.html',
            replace(url) {
                this.href = url;
                if (url.indexOf('http://localhost') === 0) this.hostname = 'localhost';
            }
        } },
        sessionStorage: {
            setItem: (clave, valor) => guardados.set(clave, String(valor)),
            getItem: clave => guardados.get(clave),
            removeItem: clave => guardados.delete(clave)
        },
        fetch: async (url, opciones) => {
            llamadas.push({ url, opciones });
            return { ok: true, json: async () => usuario };
        }
    });
    vm.runInContext(codigo, ctx);
    return { ctx, formulario, llamadas, guardados, mensaje };
}

const cuentas = [
    ['trabajador', 'empleado/cultivos.html'],
    ['administrador_agricultor', 'administrador-agricultor/resumen.html'],
    ['cliente', 'cliente/catalogo.html']
];

for (const [rol, destino] of cuentas) {
    test('el login de ' + rol + ' autentica por API, guarda la sesión y abre su interfaz', async () => {
        const usuario = {
            idUsuario: 7,
            nombreUsuario: 'Cuenta de prueba',
            correoElectronico: rol + '@local.test',
            rol
        };
        const estado = prepararLogin(usuario);
        await estado.formulario.submit({ preventDefault() {} });

        assert.equal(estado.llamadas.length, 1);
        assert.equal(estado.llamadas[0].url, 'http://localhost:8081/api/usuarios/login');
        assert.equal(estado.llamadas[0].opciones.credentials, 'include');
        assert.deepEqual(JSON.parse(estado.llamadas[0].opciones.body), {
            correoElectronico: usuario.correoElectronico,
            contrasena: 'clave-prueba'
        });
        assert.equal(JSON.parse(estado.guardados.get('usuarioSesion')).rol, rol);
        assert.equal(estado.guardados.get('usuarioId'), '7');
        assert.equal(estado.ctx.window.location.href, destino);
    });
}
