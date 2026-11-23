
var formularioCuenta = document.getElementById('formulario-cuenta');
var mensajeCuenta = document.getElementById('mensaje-cuenta');
var botonCuenta = document.getElementById('boton-crear-cuenta');

formularioCuenta.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (!formularioCuenta.reportValidity()) {
        return;
    }

    var nombre = document.getElementById('nombre-cuenta').value.trim();
    var correo = document.getElementById('correo-cuenta').value.trim();
    var contrasena = document.getElementById('contrasena-cuenta').value;

    botonCuenta.disabled = true;
    mensajeCuenta.textContent = 'Registrando cuenta...';

    pedirApi('/usuarios', 'POST', {
        nombreUsuario: nombre,
        correoElectronico: correo,
        contrasena: contrasena,
        rol: 'cliente'
    })
    .then(function () {
        mensajeCuenta.textContent = 'Cuenta creada correctamente.';
        window.location.href = 'login.html';
    })
    .catch(function (error) {
        mensajeCuenta.textContent =
            error.message || 'No se pudo crear la cuenta.';
    })
    .finally(function () {
        botonCuenta.disabled = false;
    });
});
