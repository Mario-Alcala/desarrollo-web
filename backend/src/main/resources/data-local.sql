-- Usuarios locales de demostración. Contraseña: Prueba123! (BCrypt).
INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena, rol)
SELECT 'Empleado de prueba', 'empleado.prueba@local.test',
       '$2a$10$4i9hrc8RWkUDLWB27.EH7OqkRTKUOXLQZy7L7dIXvOI30K0EGNs7q', 'trabajador'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE correo_electronico = 'empleado.prueba@local.test'
);
