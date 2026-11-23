var apiUsuarios = 'http://localhost:8081/api/usuarios';
var usuariosAdmin = [];
var rolFiltroUsuarios = 'todos';
var idUsuarioEditando = null;
var formularioUsuarios = document.getElementById('formulario-usuario');
var mensajeUsuarios = document.getElementById('mensaje-usuarios');
var mensajeFormulario = document.getElementById('mensaje-formulario');
var cuerpoUsuarios = document.getElementById('lista-usuarios');

async function cargarUsuariosAdmin() {
    mensajeUsuarios.textContent = 'Cargando usuarios…';
    try {
        var respuesta = await fetch(apiUsuarios);
        if (!respuesta.ok) throw new Error('No se pudieron cargar los usuarios.');
        usuariosAdmin = await respuesta.json();
        dibujarUsuariosAdmin();
        mensajeUsuarios.textContent = '';
    } catch (error) {
        mensajeUsuarios.textContent = error.message || 'No se pudo conectar con el API.';
    }
}

function dibujarUsuariosAdmin() {
    cuerpoUsuarios.replaceChildren();
    var visibles = usuariosAdmin.filter(function (usuario) {
        return rolFiltroUsuarios === 'todos' || usuario.rol === rolFiltroUsuarios;
    });
    visibles.forEach(function (usuario) {
        var fila = document.createElement('tr');
        [usuario.nombreUsuario, usuario.correoElectronico, usuario.rol].forEach(function (dato) {
            var celda = document.createElement('td');
            celda.textContent = dato || '—';
            fila.appendChild(celda);
        });
        var acciones = document.createElement('td');
        if (usuario.rol !== 'cliente') {
            var editar = document.createElement('button');
            editar.type = 'button'; editar.className = 'boton boton-secundario'; editar.textContent = 'Editar';
            editar.addEventListener('click', function () { editarUsuarioAdmin(usuario); });
            acciones.appendChild(editar);
        } else {
            acciones.textContent = 'Registro del cliente';
        }
        fila.appendChild(acciones);
        cuerpoUsuarios.appendChild(fila);
    });
    if (!visibles.length) mensajeUsuarios.textContent = 'No hay usuarios para mostrar.';
}

function editarUsuarioAdmin(usuario) {
    idUsuarioEditando = usuario.idUsuario;
    document.getElementById('titulo-formulario').textContent = 'Editar usuario';
    document.getElementById('nombre-usuario').value = usuario.nombreUsuario;
    document.getElementById('correo-usuario').value = usuario.correoElectronico;
    document.getElementById('contrasena-usuario').value = '';
    document.getElementById('contrasena-usuario').required = false;
    document.getElementById('rol-usuario').value = usuario.rol;
    document.getElementById('panel-formulario').hidden = false;
    mensajeFormulario.textContent = '';
}

document.getElementById('mostrar-formulario').addEventListener('click', function () {
    idUsuarioEditando = null;
    formularioUsuarios.reset();
    document.getElementById('titulo-formulario').textContent = 'Agregar usuario';
    document.getElementById('contrasena-usuario').required = true;
    document.getElementById('panel-formulario').hidden = false;
    mensajeFormulario.textContent = '';
});
document.getElementById('cancelar-formulario').addEventListener('click', function () {
    document.getElementById('panel-formulario').hidden = true;
    formularioUsuarios.reset();
});
document.querySelectorAll('[data-rol]').forEach(function (boton) {
    boton.addEventListener('click', function () { rolFiltroUsuarios = boton.dataset.rol; dibujarUsuariosAdmin(); });
});

formularioUsuarios.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    var datos = {
        nombreUsuario: document.getElementById('nombre-usuario').value.trim(),
        correoElectronico: document.getElementById('correo-usuario').value.trim(),
        contrasena: document.getElementById('contrasena-usuario').value,
        rol: document.getElementById('rol-usuario').value
    };
    if (!formularioUsuarios.reportValidity()) return;
    if (usuariosAdmin.some(function (u) { return u.idUsuario !== idUsuarioEditando && u.correoElectronico.toLowerCase() === datos.correoElectronico.toLowerCase(); })) {
        mensajeFormulario.textContent = 'Ya existe una cuenta con ese correo.';
        return;
    }
    if (datos.contrasena && datos.contrasena.length < 8) {
        mensajeFormulario.textContent = 'La contraseña debe tener al menos 8 caracteres.';
        return;
    }
    var editar = idUsuarioEditando !== null;
    if (editar && !datos.contrasena) delete datos.contrasena;
    try {
        var respuesta = await fetch(apiUsuarios + (editar ? '/' + idUsuarioEditando : ''), {
            method: editar ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        var resultado = await respuesta.json().catch(function () { return {}; });
        if (!respuesta.ok) throw new Error(resultado.mensaje || resultado.message || 'No se pudo guardar el usuario.');
        document.getElementById('panel-formulario').hidden = true;
        formularioUsuarios.reset();
        await cargarUsuariosAdmin();
        mensajeUsuarios.textContent = editar ? 'Usuario actualizado.' : 'Usuario registrado.';
    } catch (error) {
        mensajeFormulario.textContent = error.message;
    }
});

cargarUsuariosAdmin();
