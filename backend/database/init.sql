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
    tipo_abono ENUM('organico', 'inorganico') NULL,
    unidad_medida VARCHAR(30) NOT NULL,
    id_proveedor INT,
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
);

-- Agrega tipo_abono también cuando la tabla insumos ya existía sin esa columna.
SET @existe_tipo_abono = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'insumos'
      AND COLUMN_NAME = 'tipo_abono'
);
SET @sql_tipo_abono = IF(
    @existe_tipo_abono = 0,
    'ALTER TABLE insumos ADD COLUMN tipo_abono ENUM(''organico'', ''inorganico'') NULL AFTER categoria',
    'SELECT 1'
);
PREPARE sentencia_tipo_abono FROM @sql_tipo_abono;
EXECUTE sentencia_tipo_abono;
DEALLOCATE PREPARE sentencia_tipo_abono;

-- Completa el tipo de los abonos anteriores sin cambiar los que ya estén clasificados.
UPDATE insumos
SET tipo_abono = 'organico'
WHERE categoria = 'abono'
  AND tipo_abono IS NULL
  AND (LOWER(nombre) LIKE '%compost%'
       OR LOWER(nombre) LIKE '%estiercol%'
       OR LOWER(nombre) LIKE '%estiércol%'
       OR LOWER(nombre) LIKE '%orgánic%'
       OR LOWER(nombre) LIKE '%organic%');

UPDATE insumos
SET tipo_abono = 'inorganico'
WHERE categoria = 'abono'
  AND tipo_abono IS NULL
  AND (LOWER(nombre) LIKE '%mineral%'
       OR LOWER(nombre) LIKE '%inorgánic%'
       OR LOWER(nombre) LIKE '%inorganic%');

CREATE TABLE IF NOT EXISTS familias_producto (
    id_familia INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
);

-- Si ya existía la versión anterior, quita el tipo de familia (fruta/verdura).
SET @existe_tipo_familia = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'familias_producto'
      AND COLUMN_NAME = 'categoria'
);
SET @indice_tipo_familia = (
    SELECT INDEX_NAME
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'familias_producto'
      AND COLUMN_NAME = 'categoria'
      AND INDEX_NAME <> 'PRIMARY'
    LIMIT 1
);
SET @sql_tipo_familia = IF(
    @existe_tipo_familia = 0,
    'SELECT 1',
    IF(@indice_tipo_familia IS NULL,
       'ALTER TABLE familias_producto DROP COLUMN categoria',
       CONCAT('ALTER TABLE familias_producto DROP INDEX `', @indice_tipo_familia, '`, DROP COLUMN categoria'))
);
PREPARE sentencia_tipo_familia FROM @sql_tipo_familia;
EXECUTE sentencia_tipo_familia;
DEALLOCATE PREPARE sentencia_tipo_familia;

SET @existe_indice_familia = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'familias_producto'
      AND INDEX_NAME = 'uq_familias_producto_nombre'
);
SET @sql_indice_familia = IF(
    @existe_indice_familia = 0,
    'CREATE UNIQUE INDEX uq_familias_producto_nombre ON familias_producto (nombre)',
    'SELECT 1'
);
PREPARE sentencia_indice_familia FROM @sql_indice_familia;
EXECUTE sentencia_indice_familia;
DEALLOCATE PREPARE sentencia_indice_familia;

CREATE TABLE IF NOT EXISTS variedades_producto (
    id_variedad INT PRIMARY KEY AUTO_INCREMENT,
    id_familia INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    imagen_url VARCHAR(500),
    precio_por_kg DECIMAL(10,2) NOT NULL,
    UNIQUE (id_familia, nombre),
    FOREIGN KEY (id_familia) REFERENCES familias_producto(id_familia)
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
-- Datos de ejemplo (se insertan solo cuando no existe el registro de referencia)
-- ---------------------------------------------------------------------
INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena, rol)
SELECT 'Administrador', 'admin@gestioncultivos.local', 'sin-acceso-web', 'administrador_agricultor'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo_electronico = 'admin@gestioncultivos.local');

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
SELECT c.id, u.id_usuario, CURRENT_DATE, 85.5, 80.5, 'maduro', 'Bodega Central'
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

INSERT INTO insumos (nombre, categoria, tipo_abono, unidad_medida, id_proveedor)
SELECT 'Composta orgánica', 'abono', 'organico', 'kg', p.id_proveedor FROM proveedores p
WHERE p.nombre_empresa = 'AgroSur'
AND NOT EXISTS (SELECT 1 FROM insumos i WHERE i.nombre = 'Composta orgánica' AND i.categoria = 'abono');

INSERT INTO insumos (nombre, categoria, tipo_abono, unidad_medida, id_proveedor)
SELECT 'Estiércol composteado', 'abono', 'organico', 'kg', p.id_proveedor FROM proveedores p
WHERE p.nombre_empresa = 'AgroSur'
AND NOT EXISTS (SELECT 1 FROM insumos i WHERE i.nombre = 'Estiércol composteado' AND i.categoria = 'abono');

INSERT INTO insumos (nombre, categoria, tipo_abono, unidad_medida, id_proveedor)
SELECT 'Abono mineral', 'abono', 'inorganico', 'kg', p.id_proveedor FROM proveedores p
WHERE p.nombre_empresa = 'Fertiverde'
AND NOT EXISTS (SELECT 1 FROM insumos i WHERE i.nombre = 'Abono mineral' AND i.categoria = 'abono');

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

INSERT INTO familias_producto (nombre)
SELECT datos.nombre
FROM (
    SELECT 'Tomate' AS nombre
    UNION ALL SELECT 'Calabacita'
    UNION ALL SELECT 'Maíz'
    UNION ALL SELECT 'Limón'
    UNION ALL SELECT 'Aguacate'
    UNION ALL SELECT 'Chile'
) AS datos
WHERE NOT EXISTS (
    SELECT 1 FROM familias_producto f
    WHERE f.nombre = datos.nombre
);

-- Cherry es una variedad de tomate, no una familia independiente.
DELETE FROM familias_producto
WHERE LOWER(nombre) = 'cherry'
  AND NOT EXISTS (
      SELECT 1 FROM variedades_producto v
      WHERE v.id_familia = familias_producto.id_familia
  );

INSERT INTO variedades_producto (id_familia, nombre, descripcion, imagen_url, precio_por_kg)
SELECT f.id_familia, datos.variedad, datos.descripcion, NULL, datos.precio
FROM (
    SELECT 'Tomate' AS familia, 'Cherry' AS variedad,
           'Tomate pequeño y dulce, ideal para ensaladas y botanas.' AS descripcion, 48.00 AS precio
    UNION ALL SELECT 'Tomate', 'Saladette', 'Tomate firme de pulpa gruesa, perfecto para salsas.', 32.00
    UNION ALL SELECT 'Tomate', 'Verde', 'Tomate verde para salsas y guisos.', 30.00
    UNION ALL SELECT 'Calabacita', 'Italiana', 'Calabacita tierna de cáscara verde.', 28.00
    UNION ALL SELECT 'Maíz', 'Elote', 'Elote dulce recién cortado.', 18.00
    UNION ALL SELECT 'Limón', 'Persa', 'Limón jugoso y de cáscara delgada.', 26.00
    UNION ALL SELECT 'Aguacate', 'Hass', 'Aguacate cremoso de cáscara rugosa.', 85.00
    UNION ALL SELECT 'Chile', 'Serrano', 'Chile picante de temporada.', 40.00
) AS datos
JOIN familias_producto f ON f.nombre = datos.familia
WHERE NOT EXISTS (
    SELECT 1 FROM variedades_producto v
    WHERE v.id_familia = f.id_familia AND v.nombre = datos.variedad
);

INSERT INTO inventario (id_insumo, cantidad, fecha_ingreso, fecha_caducidad)
SELECT i.id_insumo, 120, CURRENT_DATE, NULL FROM insumos i
WHERE i.nombre = 'Composta orgánica'
AND NOT EXISTS (SELECT 1 FROM inventario x WHERE x.id_insumo = i.id_insumo);

INSERT INTO inventario (id_insumo, cantidad, fecha_ingreso, fecha_caducidad)
SELECT i.id_insumo, 65, CURRENT_DATE, NULL FROM insumos i
WHERE i.nombre = 'Estiércol composteado'
AND NOT EXISTS (SELECT 1 FROM inventario x WHERE x.id_insumo = i.id_insumo);

INSERT INTO inventario (id_insumo, cantidad, fecha_ingreso, fecha_caducidad)
SELECT i.id_insumo, 40, CURRENT_DATE, '2027-06-30' FROM insumos i
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

-- ---------------------------------------------------------------------
-- Más datos de referencia para que se vean las pantallas de los tres roles.
-- Se identifican por nombres, correos y fechas para no duplicarlos al reejecutar.
-- Las cuentas son solo datos de muestra; no tienen contraseña de acceso.
-- ---------------------------------------------------------------------

INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena, rol)
SELECT 'Trabajador de campo', 'trabajador@gestioncultivos.local', 'sin-acceso-web', 'trabajador'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo_electronico = 'trabajador@gestioncultivos.local');

INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena, rol)
SELECT 'Cliente de muestra', 'cliente@gestioncultivos.local', 'sin-acceso-web', 'cliente'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo_electronico = 'cliente@gestioncultivos.local');

INSERT INTO terrenos (nombre, ubicacion, superficie_m2, superficie_ha, tipo_suelo, latitud, longitud, estado)
SELECT 'La Esperanza', 'Coatepec, Veracruz', 1800, 0.1800, 'Franco-arenoso', 19.4523, -96.9611, 'ocupado'
WHERE NOT EXISTS (SELECT 1 FROM terrenos WHERE nombre = 'La Esperanza');

INSERT INTO parcelas (id_terreno, nombre, superficie_m2, estado)
SELECT t.id, 'Parcela B', 350, 'ocupada' FROM terrenos t
WHERE t.nombre = 'El Encino' AND NOT EXISTS (
    SELECT 1 FROM parcelas p WHERE p.id_terreno = t.id AND p.nombre = 'Parcela B'
);

INSERT INTO parcelas (id_terreno, nombre, superficie_m2, estado)
SELECT t.id, 'Parcela A', 600, 'ocupada' FROM terrenos t
WHERE t.nombre = 'La Esperanza' AND NOT EXISTS (
    SELECT 1 FROM parcelas p WHERE p.id_terreno = t.id AND p.nombre = 'Parcela A'
);

INSERT INTO parcelas (id_terreno, nombre, superficie_m2, estado)
SELECT t.id, 'Parcela B', 500, 'disponible' FROM terrenos t
WHERE t.nombre = 'La Esperanza' AND NOT EXISTS (
    SELECT 1 FROM parcelas p WHERE p.id_terreno = t.id AND p.nombre = 'Parcela B'
);

INSERT INTO cultivos (id_parcela, nombre, familia, etapa_fenologica, fecha_siembra, estado)
SELECT p.id_parcela, 'Calabacita italiana', 'Calabacita', 'Floración', '2026-09-18', 'activo'
FROM parcelas p JOIN terrenos t ON t.id = p.id_terreno
WHERE t.nombre = 'El Encino' AND p.nombre = 'Parcela B'
AND NOT EXISTS (SELECT 1 FROM cultivos c WHERE c.id_parcela = p.id_parcela AND c.nombre = 'Calabacita italiana');

INSERT INTO cultivos (id_parcela, nombre, familia, etapa_fenologica, fecha_siembra, estado)
SELECT p.id_parcela, 'Chile serrano', 'Chile', 'Fructificación', '2026-08-25', 'activo'
FROM parcelas p JOIN terrenos t ON t.id = p.id_terreno
WHERE t.nombre = 'La Esperanza' AND p.nombre = 'Parcela A'
AND NOT EXISTS (SELECT 1 FROM cultivos c WHERE c.id_parcela = p.id_parcela AND c.nombre = 'Chile serrano');

INSERT INTO cultivos (id_parcela, nombre, familia, etapa_fenologica, fecha_siembra, estado)
SELECT p.id_parcela, 'Maíz elote', 'Maíz', 'Maduración', '2026-07-20', 'activo'
FROM parcelas p JOIN terrenos t ON t.id = p.id_terreno
WHERE t.nombre = 'La Esperanza' AND p.nombre = 'Parcela A'
AND NOT EXISTS (SELECT 1 FROM cultivos c WHERE c.id_parcela = p.id_parcela AND c.nombre = 'Maíz elote');

INSERT INTO observaciones_cultivos (id_cultivo, id_usuario, fecha_observacion, descripcion)
SELECT c.id, u.id_usuario, '2026-11-19', 'Hojas firmes y buen crecimiento; revisar humedad del suelo en la siguiente visita.'
FROM cultivos c JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE c.nombre = 'Tomate cherry'
AND NOT EXISTS (
    SELECT 1 FROM observaciones_cultivos o
    WHERE o.id_cultivo = c.id AND o.fecha_observacion = '2026-11-19'
      AND o.descripcion LIKE 'Hojas firmes y buen crecimiento%'
);

INSERT INTO incidencias_cultivo (id_cultivo, id_usuario, fecha_incidencia, tipo_incidencia, descripcion, nivel_gravedad)
SELECT c.id, u.id_usuario, '2026-11-17', 'plaga', 'Se observaron pulgones en algunas hojas jóvenes.', 'medio'
FROM cultivos c JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE c.nombre = 'Calabacita italiana'
AND NOT EXISTS (
    SELECT 1 FROM incidencias_cultivo i
    WHERE i.id_cultivo = c.id AND i.fecha_incidencia = '2026-11-17' AND i.tipo_incidencia = 'plaga'
);

INSERT INTO seguimientos_incidencia (id_incidencia, id_usuario, fecha, accion_realizada, observacion)
SELECT i.id_incidencia, u.id_usuario, '2026-11-19',
       'Se retiraron las hojas más afectadas y se aplicó jabón potásico.',
       'Revisar nuevamente la parcela en la próxima jornada.'
FROM incidencias_cultivo i
JOIN cultivos c ON c.id = i.id_cultivo
JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE c.nombre = 'Calabacita italiana' AND i.fecha_incidencia = '2026-11-17' AND i.tipo_incidencia = 'plaga'
AND NOT EXISTS (
    SELECT 1 FROM seguimientos_incidencia s
    WHERE s.id_incidencia = i.id_incidencia AND s.fecha = '2026-11-19'
);

INSERT INTO riegos (id_cultivo, id_usuario, fecha_riego, cantidad_agua, unidad_medida, metodo, observaciones)
SELECT c.id, u.id_usuario, '2026-11-20 07:30:00', 18.00, 'litros', 'Goteo',
       'Riego de la mañana; humedad adecuada al terminar.'
FROM cultivos c JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE c.nombre = 'Tomate cherry'
AND NOT EXISTS (
    SELECT 1 FROM riegos r WHERE r.id_cultivo = c.id AND r.fecha_riego = '2026-11-20 07:30:00'
);

INSERT INTO riegos (id_cultivo, id_usuario, fecha_riego, cantidad_agua, unidad_medida, metodo, observaciones)
SELECT c.id, u.id_usuario, '2026-11-20 08:15:00', 24.00, 'litros', 'Manguera',
       'Riego ligero después de retirar hojas afectadas.'
FROM cultivos c JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE c.nombre = 'Calabacita italiana'
AND NOT EXISTS (
    SELECT 1 FROM riegos r WHERE r.id_cultivo = c.id AND r.fecha_riego = '2026-11-20 08:15:00'
);

INSERT INTO cosechas (id_cultivo, id_usuario, fecha_cosecha, cantidad_cosechada,
                      cantidad_disponible, estado_maduracion, ubicacion_bodega)
SELECT c.id, u.id_usuario, '2026-11-18', 72.00, 50.00, 'maduro', 'Bodega Central'
FROM cultivos c JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE c.nombre = 'Calabacita italiana'
AND NOT EXISTS (
    SELECT 1 FROM cosechas x WHERE x.id_cultivo = c.id AND x.fecha_cosecha = '2026-11-18'
      AND x.estado_maduracion = 'maduro'
);

INSERT INTO cosechas (id_cultivo, id_usuario, fecha_cosecha, cantidad_cosechada,
                      cantidad_disponible, estado_maduracion, ubicacion_bodega)
SELECT c.id, u.id_usuario, '2026-11-19', 110.00, 110.00, 'maduro', 'Bodega Norte'
FROM cultivos c JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE c.nombre = 'Maíz elote'
AND NOT EXISTS (
    SELECT 1 FROM cosechas x WHERE x.id_cultivo = c.id AND x.fecha_cosecha = '2026-11-19'
      AND x.estado_maduracion = 'maduro'
);

INSERT INTO inventario (id_insumo, cantidad, fecha_ingreso, fecha_caducidad)
SELECT i.id_insumo, 80.00, '2026-11-10', NULL FROM insumos i
WHERE i.nombre = 'Abono mineral'
AND NOT EXISTS (SELECT 1 FROM inventario x WHERE x.id_insumo = i.id_insumo);

INSERT INTO movimientos_inventario (id_inventario, id_usuario, tipo_movimiento, cantidad, fecha_movimiento, observacion)
SELECT v.id_inventario, u.id_usuario, 'entrada', 45.00, '2026-11-10 09:00:00', 'Recepción de semillas para la temporada.'
FROM inventario v
JOIN insumos i ON i.id_insumo = v.id_insumo
JOIN usuarios u ON u.correo_electronico = 'admin@gestioncultivos.local'
WHERE i.nombre = 'Semilla de maíz blanco H-520'
AND NOT EXISTS (
    SELECT 1 FROM movimientos_inventario m WHERE m.id_inventario = v.id_inventario
      AND m.fecha_movimiento = '2026-11-10 09:00:00' AND m.tipo_movimiento = 'entrada'
);

INSERT INTO movimientos_inventario (id_inventario, id_usuario, tipo_movimiento, cantidad, fecha_movimiento, observacion)
SELECT v.id_inventario, u.id_usuario, 'salida', 5.00, '2026-11-18 08:00:00', 'Semilla entregada para la siembra de la parcela.'
FROM inventario v
JOIN insumos i ON i.id_insumo = v.id_insumo
JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE i.nombre = 'Semilla de maíz blanco H-520'
AND NOT EXISTS (
    SELECT 1 FROM movimientos_inventario m WHERE m.id_inventario = v.id_inventario
      AND m.fecha_movimiento = '2026-11-18 08:00:00' AND m.tipo_movimiento = 'salida'
);

INSERT INTO pedidos (id_usuario, fecha_pedido, metodo_pago, tipo_entrega, estado, total)
SELECT u.id_usuario, '2026-11-21 10:30:00', 'transferencia', 'domicilio', 'pendiente', 180.00
FROM usuarios u WHERE u.correo_electronico = 'cliente@gestioncultivos.local'
AND NOT EXISTS (
    SELECT 1 FROM pedidos p WHERE p.id_usuario = u.id_usuario AND p.fecha_pedido = '2026-11-21 10:30:00'
);

INSERT INTO pedidos (id_usuario, fecha_pedido, metodo_pago, tipo_entrega, estado, total)
SELECT u.id_usuario, '2026-11-20 12:15:00', 'tarjeta', 'recoleccion', 'listo', 112.00
FROM usuarios u WHERE u.correo_electronico = 'cliente@gestioncultivos.local'
AND NOT EXISTS (
    SELECT 1 FROM pedidos p WHERE p.id_usuario = u.id_usuario AND p.fecha_pedido = '2026-11-20 12:15:00'
);

INSERT INTO pedidos (id_usuario, fecha_pedido, metodo_pago, tipo_entrega, estado, total)
SELECT u.id_usuario, '2026-11-18 14:00:00', 'transferencia', 'domicilio', 'entregado', 240.00
FROM usuarios u WHERE u.correo_electronico = 'cliente@gestioncultivos.local'
AND NOT EXISTS (
    SELECT 1 FROM pedidos p WHERE p.id_usuario = u.id_usuario AND p.fecha_pedido = '2026-11-18 14:00:00'
);

INSERT INTO detalle_pedido (id_pedido, id_cosecha, cantidad, precio_unitario)
SELECT p.id_pedido, h.id_cosecha, 3.00, 48.00
FROM pedidos p JOIN usuarios u ON u.id_usuario = p.id_usuario
JOIN cosechas h ON h.estado_maduracion = 'maduro'
JOIN cultivos c ON c.id = h.id_cultivo AND c.nombre = 'Tomate cherry'
WHERE u.correo_electronico = 'cliente@gestioncultivos.local'
  AND p.fecha_pedido = '2026-11-21 10:30:00'
  AND h.id_cosecha = (SELECT MIN(h2.id_cosecha) FROM cosechas h2 JOIN cultivos c2 ON c2.id = h2.id_cultivo
                      WHERE c2.nombre = 'Tomate cherry' AND h2.estado_maduracion = 'maduro')
  AND NOT EXISTS (SELECT 1 FROM detalle_pedido d WHERE d.id_pedido = p.id_pedido AND d.id_cosecha = h.id_cosecha);

INSERT INTO detalle_pedido (id_pedido, id_cosecha, cantidad, precio_unitario)
SELECT p.id_pedido, h.id_cosecha, 2.00, 18.00
FROM pedidos p JOIN usuarios u ON u.id_usuario = p.id_usuario
JOIN cosechas h ON h.estado_maduracion = 'maduro'
JOIN cultivos c ON c.id = h.id_cultivo AND c.nombre = 'Maíz elote'
WHERE u.correo_electronico = 'cliente@gestioncultivos.local'
  AND p.fecha_pedido = '2026-11-21 10:30:00'
  AND NOT EXISTS (SELECT 1 FROM detalle_pedido d WHERE d.id_pedido = p.id_pedido AND d.id_cosecha = h.id_cosecha);

INSERT INTO detalle_pedido (id_pedido, id_cosecha, cantidad, precio_unitario)
SELECT p.id_pedido, h.id_cosecha, 4.00, 28.00
FROM pedidos p JOIN usuarios u ON u.id_usuario = p.id_usuario
JOIN cosechas h ON h.estado_maduracion = 'maduro'
JOIN cultivos c ON c.id = h.id_cultivo AND c.nombre = 'Calabacita italiana'
WHERE u.correo_electronico = 'cliente@gestioncultivos.local'
  AND p.fecha_pedido = '2026-11-20 12:15:00'
  AND NOT EXISTS (SELECT 1 FROM detalle_pedido d WHERE d.id_pedido = p.id_pedido AND d.id_cosecha = h.id_cosecha);

INSERT INTO detalle_pedido (id_pedido, id_cosecha, cantidad, precio_unitario)
SELECT p.id_pedido, h.id_cosecha, 5.00, 48.00
FROM pedidos p JOIN usuarios u ON u.id_usuario = p.id_usuario
JOIN cosechas h ON h.estado_maduracion = 'maduro'
JOIN cultivos c ON c.id = h.id_cultivo AND c.nombre = 'Tomate cherry'
WHERE u.correo_electronico = 'cliente@gestioncultivos.local'
  AND p.fecha_pedido = '2026-11-18 14:00:00'
  AND h.id_cosecha = (SELECT MIN(h2.id_cosecha) FROM cosechas h2 JOIN cultivos c2 ON c2.id = h2.id_cultivo
                      WHERE c2.nombre = 'Tomate cherry' AND h2.estado_maduracion = 'maduro')
  AND NOT EXISTS (SELECT 1 FROM detalle_pedido d WHERE d.id_pedido = p.id_pedido AND d.id_cosecha = h.id_cosecha);

INSERT INTO distribuciones (id_pedido, id_usuario, direccion_entrega, estado)
SELECT p.id_pedido, u.id_usuario, 'Calle Revolución 45, Xalapa, Veracruz', 'pendiente'
FROM pedidos p JOIN usuarios cliente ON cliente.id_usuario = p.id_usuario
JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE cliente.correo_electronico = 'cliente@gestioncultivos.local'
  AND p.fecha_pedido = '2026-11-21 10:30:00'
  AND NOT EXISTS (SELECT 1 FROM distribuciones d WHERE d.id_pedido = p.id_pedido);

INSERT INTO distribuciones (id_pedido, id_usuario, fecha_salida, fecha_entrega, direccion_entrega,
                            numero_rastreo1, estado)
SELECT p.id_pedido, u.id_usuario, '2026-11-18 15:00:00', '2026-11-18 17:00:00',
       'Av. Xalapa 120, Xalapa, Veracruz', 'GC-2026-001', 'entregado'
FROM pedidos p JOIN usuarios cliente ON cliente.id_usuario = p.id_usuario
JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE cliente.correo_electronico = 'cliente@gestioncultivos.local'
  AND p.fecha_pedido = '2026-11-18 14:00:00'
  AND NOT EXISTS (SELECT 1 FROM distribuciones d WHERE d.id_pedido = p.id_pedido);

INSERT INTO distribuciones (id_pedido, id_usuario, fecha_recoleccion, estado)
SELECT p.id_pedido, u.id_usuario, '2026-11-22', 'listo_recoleccion'
FROM pedidos p JOIN usuarios cliente ON cliente.id_usuario = p.id_usuario
JOIN usuarios u ON u.correo_electronico = 'trabajador@gestioncultivos.local'
WHERE cliente.correo_electronico = 'cliente@gestioncultivos.local'
  AND p.fecha_pedido = '2026-11-20 12:15:00'
  AND NOT EXISTS (SELECT 1 FROM distribuciones d WHERE d.id_pedido = p.id_pedido);
