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

-- ---------------------------------------------------------------------
-- Cultivos  (model/Cultivo.java, repository/CultivoRepository.java)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cultivos (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    nombre            VARCHAR(100) NOT NULL,
    tipo              VARCHAR(100),
    etapa_fenologica  VARCHAR(100),
    fecha_registro    DATE,
    PRIMARY KEY (id)
);

-- ---------------------------------------------------------------------
-- Banco de semillas  (model/Semilla.java, repository/SemillaRepository.java)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS semillas (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    variedad          VARCHAR(100) NOT NULL,
    stock_disponible  INT          NOT NULL DEFAULT 0,
    proveedor_origen  VARCHAR(100),
    fecha_caducidad   DATE,
    PRIMARY KEY (id)
);

-- ---------------------------------------------------------------------
-- Terrenos  (model/Terreno.java, repository/TerrenoRepository.java)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS terrenos (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(100)  NOT NULL,
    ubicacion      VARCHAR(255),
    superficie_ha  DECIMAL(10,2),
    tipo_suelo     VARCHAR(100),
    estado         VARCHAR(30)   NOT NULL DEFAULT 'Disponible',
    PRIMARY KEY (id)
);

-- ---------------------------------------------------------------------
-- Herramientas  (model/Herramienta.java, repository/HerramientaRepository.java)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS herramientas (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    nombre             VARCHAR(100)  NOT NULL,
    tipo               VARCHAR(100),
    cantidad           INT           NOT NULL DEFAULT 1,
    estado             VARCHAR(30)   NOT NULL DEFAULT 'Disponible',
    fecha_adquisicion  DATE,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS proveedores (
    id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    nombre_empresa VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS inventario (
    id_inventario INT PRIMARY KEY AUTO_INCREMENT,
    cantidad INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_caducidad DATE NULL
    categoria VARCHAR(50) NOT NULL,
    id_proveedor INT,
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
);

CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id_movimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_inventario INT NOT NULL,
    tipo_movimiento ENUM('entrada', 'salida') NOT NULL,
    cantidad INT NOT NULL,
    fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario)
);

CREATE TABLE IF NOT EXISTS fertilizantes(
    id_fertilizante INT PRIMARY KEY AUTO_INCREMENTE,
    nombre_fertilizante VARCHAR(100) NOT NULL,
    tipo_fertilizante VARCHAR(50) NOT NULL,
    fecha_caducidad DATE NOT NULL,
    id_proveedor INT,
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
)

CREATE TABLE IF NOT EXISTS abonos(
    id_abono INT PRIMARY KEY AUTO_INCREMENT,
    nombre_abono VARCHAR(100) NOT NULL,
    tipo_abono VARCHAR(50) NOT NULL,
    fecha_caducidad DATE NOT NULL,
    id_proveedor INT,
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
)

CREATE TABLE IF NOT EXISTS cosechas(
    id_cosecha INT PRIMARY KEY AUTO_INCREMENT,
    id_cultivo INT NOT NULL,
    fecha_cosecha DATE NOT NULL,
    cantidad_cosechada DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_cultivo) REFERENCES cultivos(id)

);

CREATE TABLE IF NOT EXISTS distribucion (
    id_distribucion INT PRIMARY KEY AUTO_INCREMENT,
    fecha_salida DATE NOT NULL,
    fecha_entrega DATE NULL,
    destino VARCHAR(100) NOT NULL,
    responsable VARCHAR(100) NOT NULL,
    estado ENUM('pendiente', 'en_transito', 'entregado') NOT NULL DEFAULT 'pendiente',
    FOREIGN KEY (id_cosecha) REFERENCES cosechas(id_cosecha)

);

CREATE TABLE IF NOT EXISTS detalle_distribucion (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_distribucion INT NOT NULL,
    id_cosecha INT NOT NULL,
    cantidad INT NOT NULL,
    FOREIGN KEY (id_distribucion) REFERENCES distribucion(id_distribucion),
    FOREIGN KEY (id_cosecha) REFERENCES cosechas(id_cosecha)
)

CREATE TABLE IF NOT EXISTS riesgos (
    id_riesgo INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(255) NOT NULL,
    nivel_riesgo ENUM('bajo', 'medio', 'alto') NOT NULL,
    fecha_identificacion DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS observaciones_cultivos(
    id_observacion INT PRIMARY KEY AUTO_INCREMENT,
    id_cultivo INT NOT NULL, --LLAVE FORANEA
    id_usuario INT NOT NULL, --LLAVE FORANEA
    fecha_observacion DATE NOT NULL,
    descripcion TEXT NOT NULL,
    FOREIGN KEY (id_cultivo) REFERENCES cultivos(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)    
);

CREATE TABLE IF NOT EXISTS incidencias_cultivo (
    id_incidencia INT PRIMARY KEY AUTO_INCREMENT,
    id_cultivo INT NOT NULL, --LLAVE FORANEA
    id_usuario INT NOT NULL, --LLAVE FORANEA
    fecha_incidencia DATE NOT NULL,
    descripcion TEXT NOT NULL,
    nivel_gravedad ENUM('bajo', 'medio', 'alto') NOT NULL,
    FOREIGN KEY (id_cultivo) REFERENCES cultivos(id),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'empleado', 'cliente') NOT NULL
)

CREATE TABLE IF NOT EXISTS(
    id_riego INT PRIMARY KEY AUTO_INCREMENT,
    id_cultivo INT NOT NULL,
    fecha_riego DATE NOT NULL,
    cantidad_agua DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20) NOT NULL,
    metodo VARCHAR(50) NULL,
    observaciones VARCHAR(255),
    FOREIGN KEY (id_cultivo) REFERENCES cultivos(id)
    FOREIGN KEY (id_terreno) REFERENCES terrenos(id)
);
-- ---------------------------------------------------------------------
-- Datos de ejemplo (solo se insertan si la tabla está vacía)
-- ---------------------------------------------------------------------
INSERT INTO cultivos (nombre, tipo, etapa_fenologica, fecha_registro)
SELECT * FROM (
    SELECT 'Maíz criollo' AS nombre, 'Cereal'     AS tipo, 'Siembra'     AS etapa_fenologica, '2026-11-01' AS fecha_registro
    UNION ALL
    SELECT 'Frijol negro',           'Leguminosa',          'Germinación',                      '2026-11-03'
    UNION ALL
    SELECT 'Tomate saladette',       'Hortaliza',           'Floración',                        '2026-11-05'
) AS datos
WHERE NOT EXISTS (SELECT 1 FROM cultivos);

INSERT INTO semillas (variedad, stock_disponible, proveedor_origen, fecha_caducidad)
SELECT * FROM (
    SELECT 'Maíz blanco H-520' AS variedad, 120 AS stock_disponible, 'Agroinsumos del Golfo' AS proveedor_origen, '2027-06-30' AS fecha_caducidad
    UNION ALL
    SELECT 'Frijol Jamapa',                  80,                      'Semillas Veracruz',                         '2027-03-15'
    UNION ALL
    SELECT 'Tomate Río Grande',              45,                      'Agroinsumos del Golfo',                     '2026-12-31'
) AS datos
WHERE NOT EXISTS (SELECT 1 FROM semillas);

INSERT INTO terrenos (nombre, ubicacion, superficie_ha, tipo_suelo, estado)
SELECT * FROM (
    SELECT 'Parcela Norte' AS nombre, 'Veracruz, Ver.' AS ubicacion, 2.50 AS superficie_ha, 'Franco-arcilloso' AS tipo_suelo, 'Disponible' AS estado
    UNION ALL
    SELECT 'Parcela Sur',             'Veracruz, Ver.',              1.80,                     'Arenoso',                       'En uso'
    UNION ALL
    SELECT 'Invernadero 1',           'Boca del Río, Ver.',          0.30,                     'Sustrato',                      'En descanso'
) AS datos
WHERE NOT EXISTS (SELECT 1 FROM terrenos);

INSERT INTO herramientas (nombre, tipo, cantidad, estado, fecha_adquisicion)
SELECT * FROM (
    SELECT 'Pala de punta' AS nombre, 'Manual' AS tipo, 10 AS cantidad, 'Disponible' AS estado, '2026-01-15' AS fecha_adquisicion
    UNION ALL
    SELECT 'Tractor agrícola',        'Maquinaria',      1,             'En uso',                '2025-08-20'
    UNION ALL
    SELECT 'Riego por goteo',         'Riego',           4,             'Mantenimiento',         '2026-03-10'
) AS datos
WHERE NOT EXISTS (SELECT 1 FROM herramientas);
