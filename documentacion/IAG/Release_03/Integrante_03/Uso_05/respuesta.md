# Respuesta de la IA — Uso 05

## Qué entregó la IA
- Datos de ejemplo `PEDIDOS` (5 pedidos) para pegar al final de `js/admin-datos.js`. Siguen las reglas del documento: el total no se guarda (se calcula con el detalle), el precio por kilo va dentro de cada renglón del detalle y la entrega vive dentro del pedido (a domicilio con dirección y número de rastreo; recolección con bodega y día).
- `pedidos.html`, `css/pedidos.css`, `js/pedidos-comun.js` (totalPedido, kilosPedido, fmtFecha, tipoEstado) y `js/pedidos.js` (tabla de pedidos, filtro por estado, búsqueda por cliente o número, mensaje con el total sin cancelados).
- No modificó ninguno de mis archivos existentes; todo lo nuevo está en archivos aparte.

## Cómo se comprobó
- La IA probó la lista en un navegador **simulado** (no real) con mis datos: 5 filas, total del pedido 1001 = $1,700.00, filtro "cancelado", búsqueda por "lupe" y "1002", y búsqueda sin resultados. Eso no sustituye mis pruebas en el navegador.

## Limitaciones y pendientes
- Falta el detalle del pedido (pedido-detalle.html), al que apunta "Ver detalle →" (hoy da 404).
- Los datos son de ejemplo; no hay API de pedidos. No hay paginación ni cambio de estado.
- Las clases CSS de la página las copió de mi catalogo-admin.html; no vio mi admin-vistas.css, así que el aspecto debo verificarlo yo.