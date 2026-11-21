-- =====================================================================
-- Gestión de Cultivos - script de inicialización (cultivos, semillas, terrenos y herramientas)
--
-- Uso, parado en la carpeta backend/ (desde WSL):
--     sudo mysql < database/init.sql
--   o bien:
--     mysql -u root -p < database/init.sql
--
-- Es seguro ejecutarlo más de una vez: no borra datos ni duplica filas.
-- Usuario y contraseña coinciden con los valores por defecto de
-- src/main/resources/application.yaml (DB_USER / DB_PASSWORD).
-- =====================================================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS gestion_cultivos
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'cultivos_user'@'localhost' IDENTIFIED BY 'cultivos-web';
-- Si el usuario ya existia con otra contrasena, CREATE USER no la cambia:
-- ALTER USER la deja igual a la del application.yaml.
ALTER USER 'cultivos_user'@'localhost' IDENTIFIED BY 'cultivos-web';
GRANT ALL PRIVILEGES ON gestion_cultivos.* TO 'cultivos_user'@'localhost';
FLUSH PRIVILEGES;

USE gestion_cultivos;

CREATE TABLE IF NOT EXISTS terrenos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255),
    superficie_m2 DECIMAL(10,2) NOT NULL DEFAULT 0,
    superficie_ha DECIMAL(10,4),
    tipo_suelo VARCHAR(100),
    latitud DOUBLE,
    longitud DOUBLE,
    estado VARCHAR(30) NOT NULL DEFAULT 'Disponible'
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('administrador_agricultor', 'trabajador', 'cliente') NOT NULL
);

CREATE TABLE IF NOT EXISTS parcelas (
    id_parcela BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_terreno BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    superficie_m2 DECIMAL(10,2) NOT NULL,
    estado ENUM('disponible', 'ocupada') NOT NULL DEFAULT 'disponible',
    FOREIGN KEY (id_terreno) REFERENCES terrenos(id)
);

CREATE TABLE IF NOT EXISTS cultivos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_parcela BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    familia VARCHAR(100),
    etapa_fenologica VARCHAR(100),
    fecha_siembra DATE,
    estado ENUM('activo', 'finalizado') NOT NULL DEFAULT 'activo',
    FOREIGN KEY (id_parcela) REFERENCES parcelas(id_parcela)
);

CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    nombre_empresa VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS insumos (
    id_insumo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    categoria ENUM('semilla', 'abono', 'fertilizante') NOT NULL,
    unidad_medida VARCHAR(30) NOT NULL,
    id_proveedor INT,
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
);

CREATE TABLE IF NOT EXISTS inventario (
    id_inventario INT PRIMARY KEY AUTO_INCREMENT,
    id_insumo INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha_ingreso DATE NOT NULL,
    fecha_caducidad DATE,
    FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo)
);

CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id_movimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_inventario INT NOT NULL,
    id_usuario INT NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida') NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion VARCHAR(255),
    FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS herramientas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(100),
    cantidad INT NOT NULL DEFAULT 1,
    estado VARCHAR(30) NOT NULL DEFAULT 'Disponible',
    fecha_adquisicion DATE
);

CREATE TABLE IF NOT EXISTS cosechas (
    id_cosecha INT PRIMARY KEY AUTO_INCREMENT,
    id_cultivo BIGINT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_cosecha DATE NOT NULL,
    cantidad_cosechada DECIMAL(10,2) NOT NULL,
    cantidad_disponible DECIMAL(10,2) NOT NULL,
    estado_maduracion VARCHAR(30),
    ubicacion_bodega VARCHAR(100),
    FOREIGN KEY (id_cultivo) REFERENCES cultivos(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS observaciones_cultivos (
    id_observacion INT PRIMARY KEY AUTO_INCREMENT,
    id_cultivo BIGINT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_observacion DATE NOT NULL,
    descripcion TEXT NOT NULL,
    FOREIGN KEY (id_cultivo) REFERENCES cultivos(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS incidencias_cultivo (
    id_incidencia INT PRIMARY KEY AUTO_INCREMENT,
    id_cultivo BIGINT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_incidencia DATE NOT NULL,
    tipo_incidencia ENUM('plaga', 'enfermedad') NOT NULL,
    descripcion TEXT NOT NULL,
    nivel_gravedad ENUM('bajo', 'medio', 'alto') NOT NULL,
    FOREIGN KEY (id_cultivo) REFERENCES cultivos(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS seguimientos_incidencia (
    id_seguimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_incidencia INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha DATE NOT NULL,
    accion_realizada TEXT NOT NULL,
    observacion TEXT,
    FOREIGN KEY (id_incidencia) REFERENCES incidencias_cultivo(id_incidencia),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS riegos (
    id_riego INT PRIMARY KEY AUTO_INCREMENT,
    id_cultivo BIGINT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_riego DATETIME NOT NULL,
    cantidad_agua DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    metodo VARCHAR(50),
    observaciones VARCHAR(255),
    FOREIGN KEY (id_cultivo) REFERENCES cultivos(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metodo_pago ENUM('transferencia', 'tarjeta') NOT NULL,
    tipo_entrega ENUM('domicilio', 'recoleccion') NOT NULL,
    estado ENUM('pendiente', 'preparando', 'listo', 'enviado', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS detalle_pedido (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_cosecha INT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    FOREIGN KEY (id_cosecha) REFERENCES cosechas(id_cosecha)
);

CREATE TABLE IF NOT EXISTS distribuciones (
    id_distribucion INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL UNIQUE,
    id_usuario INT,
    fecha_salida DATETIME,
    fecha_entrega DATETIME,
    direccion_entrega VARCHAR(255),
    fecha_recoleccion DATE,
    numero_rastreo1 VARCHAR(100),
    estado ENUM('pendiente', 'preparando', 'en_transito', 'listo_recoleccion', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- ---------------------------------------------------------------------
-- Datos de ejemplo (solo se insertan si la tabla está vacía)
-- ---------------------------------------------------------------------
INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena, rol)
SELECT 'Administrador', 'admin@gestioncultivos.local', 'sin-acceso-web', 'administrador_agricultor'
WHERE NOT EXISTS (SELECT 1 FROM usuarios);

INSERT INTO terrenos (nombre, ubicacion, superficie_m2, estado)
SELECT 'El Encino', 'Xalapa, Veracruz', 1200, 'ocupado'
WHERE NOT EXISTS (SELECT 1 FROM terrenos WHERE nombre = 'El Encino');

INSERT INTO parcelas (id_terreno, nombre, superficie_m2, estado)
SELECT t.id, 'Parcela A', 400, 'ocupada' FROM terrenos t
WHERE t.nombre = 'El Encino' AND NOT EXISTS (
    SELECT 1 FROM parcelas p WHERE p.id_terreno = t.id AND p.nombre = 'Parcela A'
);

INSERT INTO cultivos (id_parcela, nombre, familia, etapa_fenologica, fecha_siembra, estado)
SELECT p.id_parcela, 'Tomate cherry', 'Hortaliza', 'Floración', CURRENT_DATE, 'activo'
FROM parcelas p JOIN terrenos t ON t.id = p.id_terreno
WHERE t.nombre = 'El Encino' AND p.nombre = 'Parcela A'
AND NOT EXISTS (SELECT 1 FROM cultivos c WHERE c.id_parcela = p.id_parcela AND c.estado = 'activo');

INSERT INTO cosechas (id_cultivo, id_usuario, fecha_cosecha, cantidad_cosechada,
                      cantidad_disponible, estado_maduracion, ubicacion_bodega)
SELECT c.id, u.id_usuario, CURRENT_DATE, 85.5, 85.5, 'maduro', 'Bodega Central'
FROM cultivos c CROSS JOIN usuarios u
WHERE c.nombre = 'Tomate cherry' AND u.correo_electronico = 'admin@gestioncultivos.local'
AND NOT EXISTS (
    SELECT 1 FROM cosechas x WHERE x.id_cultivo = c.id AND x.estado_maduracion = 'maduro'
);

INSERT INTO cosechas (id_cultivo, id_usuario, fecha_cosecha, cantidad_cosechada,
                      cantidad_disponible, estado_maduracion, ubicacion_bodega)
SELECT c.id, u.id_usuario, CURRENT_DATE, 60, 60, 'verde', 'Bodega Central'
FROM cultivos c CROSS JOIN usuarios u
WHERE c.nombre = 'Tomate cherry' AND u.correo_electronico = 'admin@gestioncultivos.local'
AND NOT EXISTS (
    SELECT 1 FROM cosechas x WHERE x.id_cultivo = c.id AND x.estado_maduracion = 'verde'
);

INSERT INTO proveedores (nombre_empresa, contacto, telefono, email, direccion)
SELECT 'AgroSur', 'Laura Méndez', '2281234567', 'ventas@agrosur.local', 'Xalapa, Veracruz'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE nombre_empresa = 'AgroSur');

INSERT INTO proveedores (nombre_empresa, contacto, telefono, email, direccion)
SELECT 'Semillas del Golfo', 'Carlos Ibarra', '2299876543', 'contacto@semillasgolfo.local', 'Veracruz, Veracruz'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE nombre_empresa = 'Semillas del Golfo');

INSERT INTO proveedores (nombre_empresa, contacto, telefono, email, direccion)
SELECT 'Fertiverde', 'Ana Torres', '2288765432', 'ventas@fertiverde.local', 'Coatepec, Veracruz'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE nombre_empresa = 'Fertiverde');

INSERT INTO insumos (nombre, categoria, unidad_medida, id_proveedor)
SELECT 'Composta orgánica', 'abono', 'kg', p.id_proveedor FROM proveedores p
WHERE p.nombre_empresa = 'AgroSur'
AND NOT EXISTS (SELECT 1 FROM insumos i WHERE i.nombre = 'Composta orgánica' AND i.categoria = 'abono');

INSERT INTO insumos (nombre, categoria, unidad_medida, id_proveedor)
SELECT 'Estiércol composteado', 'abono', 'kg', p.id_proveedor FROM proveedores p
WHERE p.nombre_empresa = 'AgroSur'
AND NOT EXISTS (SELECT 1 FROM insumos i WHERE i.nombre = 'Estiércol composteado' AND i.categoria = 'abono');

INSERT INTO insumos (nombre, categoria, unidad_medida, id_proveedor)
SELECT 'Semilla de maíz blanco H-520', 'semilla', 'kg', p.id_proveedor FROM proveedores p
WHERE p.nombre_empresa = 'Semillas del Golfo'
AND NOT EXISTS (SELECT 1 FROM insumos i WHERE i.nombre = 'Semilla de maíz blanco H-520' AND i.categoria = 'semilla');

INSERT INTO insumos (nombre, categoria, unidad_medida, id_proveedor)
SELECT 'Semilla de tomate Río Grande', 'semilla', 'kg', p.id_proveedor FROM proveedores p
WHERE p.nombre_empresa = 'Semillas del Golfo'
AND NOT EXISTS (SELECT 1 FROM insumos i WHERE i.nombre = 'Semilla de tomate Río Grande' AND i.categoria = 'semilla');

INSERT INTO insumos (nombre, categoria, unidad_medida, id_proveedor)
SELECT 'Fertilizante NPK 17-17-17', 'fertilizante', 'kg', p.id_proveedor FROM proveedores p
WHERE p.nombre_empresa = 'Fertiverde'
AND NOT EXISTS (SELECT 1 FROM insumos i WHERE i.nombre = 'Fertilizante NPK 17-17-17' AND i.categoria = 'fertilizante');

INSERT INTO inventario (id_insumo, cantidad, fecha_ingreso, fecha_caducidad)
SELECT i.id_insumo, 120, CURRENT_DATE, NULL FROM insumos i
WHERE i.nombre = 'Composta orgánica'
AND NOT EXISTS (SELECT 1 FROM inventario x WHERE x.id_insumo = i.id_insumo);

INSERT INTO inventario (id_insumo, cantidad, fecha_ingreso, fecha_caducidad)
SELECT i.id_insumo, 65, CURRENT_DATE, NULL FROM insumos i
WHERE i.nombre = 'Estiércol composteado'
AND NOT EXISTS (SELECT 1 FROM inventario x WHERE x.id_insumo = i.id_insumo);

INSERT INTO inventario (id_insumo, cantidad, fecha_ingreso, fecha_caducidad)
SELECT i.id_insumo, 45, CURRENT_DATE, '2027-06-30' FROM insumos i
WHERE i.nombre = 'Semilla de maíz blanco H-520'
AND NOT EXISTS (SELECT 1 FROM inventario x WHERE x.id_insumo = i.id_insumo);

INSERT INTO inventario (id_insumo, cantidad, fecha_ingreso, fecha_caducidad)
SELECT i.id_insumo, 18, CURRENT_DATE, '2027-04-30' FROM insumos i
WHERE i.nombre = 'Semilla de tomate Río Grande'
AND NOT EXISTS (SELECT 1 FROM inventario x WHERE x.id_insumo = i.id_insumo);

INSERT INTO inventario (id_insumo, cantidad, fecha_ingreso, fecha_caducidad)
SELECT i.id_insumo, 50, CURRENT_DATE, '2028-11-21' FROM insumos i
WHERE i.nombre = 'Fertilizante NPK 17-17-17'
AND NOT EXISTS (SELECT 1 FROM inventario x WHERE x.id_insumo = i.id_insumo);

INSERT INTO herramientas (nombre, tipo, cantidad, estado, fecha_adquisicion)
SELECT * FROM (
    SELECT 'Pala de punta' AS nombre, 'Manual' AS tipo,
           10 AS cantidad, 'Disponible' AS estado,
           '2026-01-15' AS fecha_adquisicion
    UNION ALL
    SELECT 'Tractor agrícola', 'Maquinaria', 1,
           'En uso', '2025-08-20'
    UNION ALL
    SELECT 'Riego por goteo', 'Riego', 4,
           'Mantenimiento', '2026-03-10'
) AS datos
WHERE NOT EXISTS (SELECT 1 FROM herramientas);
