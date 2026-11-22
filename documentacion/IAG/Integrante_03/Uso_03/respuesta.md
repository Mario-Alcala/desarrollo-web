# Respuesta de la IA — Uso 03

## Qué entregó Claude
Cuatro piezas de código para copiar y pegar, más una lista de verificación y comandos de git:
1. Datos de ejemplo para pegar al final de `js/admin-datos.js`: arreglos `PROVEEDORES` (4) e `INSUMOS` (7).
2. Estilos de tabla (`.tabla-admin`, `.tabla-admin-contenedor`) para pegar al final de `css/admin-vistas.css`.
3. `frontend/proveedores.html`: encabezado con comentario de cascarón, dos pestañas (Proveedores / Insumos),
   filtros por categoría, tabla y dos ventanas `<dialog>` (proveedor e insumo).
4. `frontend/js/proveedores.js`: lógica de pestañas, filtros, buscador, tabla, alta/edición y validación.
5. "Paso 5. Probar": lista de verificación para el estudiante (resultados esperados calculados a mano).
6. Comandos git sugeridos (el estudiante usó su propia rama y sus propios mensajes de commit).

## Reglas de la especificación implementadas
- Semillas, abonos y fertilizantes en UNA sola lista de insumos, separada por categoría (no listas repetidas).
- Insumo con nombre, categoría, variedad o tipo, unidad de medida y activo/inactivo.
- Proveedor con nombre de empresa, contacto, teléfono, correo y dirección.
- Pestañas, filtro por categoría de insumo y buscador de la barra superior.
- Alta y edición con ventana de formulario; reutiliza `crear`, `etiqueta`, `crearBoton`, `iniciarFiltros`
  de `admin-comun.js` y los estilos de `admin-vistas.css`.

## Qué falló o se descartó
Algo de texto estuvo de mas solo lo modifique y quite algunas cosas

## Pendiente y limitaciones
- Datos de ejemplo: no se conecta a la API; no verifiqué rutas de proveedores ni insumos en el backend.
- Los cambios viven solo en memoria y se pierden al recargar.
- No se puede desactivar ni eliminar un proveedor; no se muestran existencias por insumo.
- La validación del teléfono (regex) es adición de la IA; la especificación no la pide.
- No vi `admin.css`; el estilo depende de variables y clases que no pude comprobar.
- La IA no ejecutó ni probó el código; no generó pruebas automatizadas.