# Reporte de IA para desarrollo

Proyecto: Gestión de Cultivos | Release: 04  
Integrante: Ángel de Jesús Nieto Hernández — Integrante 4 | Herramienta: ChatGPT

## Uso 01 — Relaciones entre variedad, cultivo y cosecha
Prompt: Relaciona producto comercial, cultivo de parcela y lote cosechado mediante IDs; guarda maduración por lote y conserva unidades.  
Respuesta: se revisó variedad-cultivo-cosecha y terreno-parcela-cultivo con SHOW CREATE TABLE y DESCRIBE.  
Anterior: esquema que confundía las tres entidades. Posterior: relación por id_variedad, id_parcela e id_cultivo.  
Diferencias: SHOW CREATE TABLE cultivos confirmó FK a variedades; DESCRIBE cosechas/parcelas mostró tipos DECIMAL.  
Prueba: consultas MySQL y capturas en el archivo fuente. Uso: diseño SQL/revisión. Reflexión: producto, siembra y lote son entidades distintas.

## Uso 02 — Inventario unificado
Prompt: Comprueba que la semilla de inventario se guarde en MySQL y el proveedor se relacione por ID; evita duplicar abonos y fertilizantes.  
Respuesta: se identificó insumos con categorías y id_proveedor.  
Anterior: formularios como artículos separados. Posterior: categoría semilla/abono/fertilizante en insumos.  
Diferencias: DESCRIBE y SELECT de insumos mostraron tomate, kilos, categoría semilla y proveedor asociado.  
Prueba: fila confirmada en MySQL y GET /api/insumos respondió. Uso: análisis de persistencia. Reflexión: las operaciones deben reutilizar artículos existentes.

## Uso 03 — Catálogo por lote
Prompt: Analiza por qué catálogo está vacío y muestra variedad, precio, maduración y kilos por lote.  
Respuesta: revisión del GET /api/catalogo y JOIN variedades-cultivos-cosechas.  
Anterior: vista vacía. Posterior: contrato con idVariedad, idCosecha, precioKilo, maduracion y kilos.  
Diferencias: consulta filtra cantidad disponible y precio positivo.  
Prueba: curl obtuvo 200 con lista vacía y el conteo de variedades era cero. Uso: análisis/diseño/depuración. Reflexión: la ruta podía funcionar aunque faltaran datos relacionados.

## Uso 04 — Registro y sesión de cliente (archivo fuente Uso_05)
Prompt: Conecta el registro existente con fetch, fija rol cliente y conserva sesión para compras e historial.  
Respuesta: se alinearon nombreUsuario, correoElectronico y contrasena con el modelo y se separaron POST de registro y login.  
Anterior: JSON enviaba nombre. Posterior: contrato alineado con Usuario.java y nombre_usuario.  
Diferencias: revisión de login, crear-cuenta, ap.js, modelo y repositorio.  
Prueba: login rechazó correo no registrado; se corrigió la referencia al script de alta. Uso: modificación/depuración. Reflexión: nombres JSON deben coincidir y backend debe imponer el rol.

## Uso 05 — Propuesta de parcelas (archivo fuente Uso_06)
Prompt: Diseña pantalla administrativa separada de parcelas con terreno, nombre, m² decimal y estado, usando las rutas del API.  
Respuesta: propuesta parcelas.html, parcelas.css, parcelas.js y operaciones GET/POST/PUT/DELETE.  
Anterior: gestión territorial sin vista separada. Posterior: diseño con idTerreno, nombre, superficieM2 y estado.  
Diferencias: JOIN terrenos.id con parcelas.id_terreno y validación de relaciones con cultivos.  
Prueba: diseño contrastado con DESCRIBE parcelas y rutas del API. Uso: generación de propuesta/diseño. Reflexión: separar alta administrativa de consulta del trabajador evita duplicar responsabilidades.
