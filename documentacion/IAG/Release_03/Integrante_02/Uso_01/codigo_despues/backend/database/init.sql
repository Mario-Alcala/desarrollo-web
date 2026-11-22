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
    superficie_m2 DECIMAL(10,2) NOT NULL,
    estado ENUM('disponible', 'ocupado') NOT NULL DEFAULT 'disponible'
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

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('administrador_agricultor', 'trabajador', 'cliente') NOT NULL
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
INSERT INTO cultivos (nombre, tipo, etapa_fenologica, fecha_registro)
SELECT * FROM (
    SELECT 'Maíz criollo' AS nombre, 'Cereal' AS tipo,
           'Siembra' AS etapa_fenologica, '2026-11-01' AS fecha_registro
    UNION ALL
    SELECT 'Frijol negro', 'Leguminosa', 'Germinación', '2026-11-03'
    UNION ALL
    SELECT 'Tomate saladette', 'Hortaliza', 'Floración', '2026-11-05'
) AS datos
WHERE NOT EXISTS (SELECT 1 FROM cultivos);

INSERT INTO semillas (variedad, stock_disponible, proveedor_origen, fecha_caducidad)
SELECT * FROM (
    SELECT 'Maíz blanco H-520' AS variedad, 120 AS stock_disponible,
           'Agroinsumos del Golfo' AS proveedor_origen,
           '2027-06-30' AS fecha_caducidad
    UNION ALL
    SELECT 'Frijol Jamapa', 80, 'Semillas Veracruz', '2027-03-15'
    UNION ALL
    SELECT 'Tomate Río Grande', 45, 'Agroinsumos del Golfo', '2026-12-31'
) AS datos
WHERE NOT EXISTS (SELECT 1 FROM semillas);

INSERT INTO terrenos
(nombre, ubicacion, superficie_ha, tipo_suelo, estado)
SELECT * FROM (
    SELECT 'Parcela Norte' AS nombre, 'Veracruz, Ver.' AS ubicacion,
           2.50 AS superficie_ha, 'Franco-arcilloso' AS tipo_suelo,
           'Disponible' AS estado
    UNION ALL
    SELECT 'Parcela Sur', 'Veracruz, Ver.', 1.80,
           'Arenoso', 'En uso'
    UNION ALL
    SELECT 'Invernadero 1', 'Boca del Río, Ver.', 0.30,
           'Sustrato', 'En descanso'
) AS datos
WHERE NOT EXISTS (SELECT 1 FROM terrenos);

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
