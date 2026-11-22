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
