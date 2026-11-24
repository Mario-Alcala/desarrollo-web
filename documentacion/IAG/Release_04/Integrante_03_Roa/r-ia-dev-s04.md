# Reporte de IA para desarrollo

Proyecto: Gestión de Cultivos | Release: 04  
Integrante: Carlos Alessandro Roa Vázquez — Integrante 3  
Herramienta: Claude | Modelo registrado: Sonnet 5.5, temperatura no configurable

## Uso 01 — Registro de cosecha
Prompt: Añade cosecha dentro de cultivos del trabajador: cultivo existente, usuario de sesión, kilos, fecha, maduración y ubicación; Bodega consulta el lote creado.  
Respuesta: Panel en cultivos.html, cosecha-registro.js y pruebas de validación.  
Anterior e890b41; posterior 15829d9. Diferencias: git diff --numstat e890b41 15829d9; cultivos.html +58/-1, cosecha-registro.js +246, cosecha.test.js +150.  
Prueba: 14 pruebas automáticas y registro SQL con disponibles igual a cosechados. Uso: generación/pruebas/depuración. Reflexión: Bodega no debe crear una segunda captura del mismo lote.

## Uso 02 — Pedidos por rol y sesión
Prompt: Reutiliza lista y detalle de pedidos; muestra acciones según rol y agrega el menú y sesión del trabajador.  
Respuesta: reglas de permisos, sesión y enlaces sin duplicar pedidos.html.  
Anterior 026ae6b; posterior b73f746. Diferencias: git diff --numstat 026ae6b b73f746; incluye ap.js, sidebar.js, permisos-pedidos.js, vistas y pruebas.  
Prueba: 7 pruebas de permisos y 5 de login. Uso: generación/pruebas/depuración. Reflexión: una vista compartida puede adaptar acciones al rol.

## Uso 03 — Puerto API y consulta de abonos/fertilizantes
Prompt: Corrige el puerto y deja abonos/fertilizantes consultando artículos existentes, sin crear productos duplicados.  
Respuesta: api.js actualizado y consulta-insumos.js reutilizado por ambas vistas.  
Anterior 9ed045e; posterior a124604 (intermedio 197e46e). Diferencias: git diff --numstat 9ed045e a124604.  
Prueba: consultas al API en 8081 y revisión de CORS con curl. Uso: generación/depuración. Reflexión: puerto, CORS y caché son causas separadas.

## Uso 04 — Movimientos de inventario
Prompt: Registra entradas/salidas de un lote existente, valida saldo y usa el ID de sesión.  
Respuesta: formulario y lógica inventario-movimientos.js; no se da de alta el artículo desde esa vista.  
Anterior a124604; posterior 00ca9ca. Diferencias: git diff --numstat a124604 00ca9ca; inventario.html +50/-28, inventario-movimientos.js +224, sesion.js +22.  
Prueba: el backend rechazó una salida superior al saldo con HTTP 400. Uso: generación/modificación/pruebas. Reflexión: movimiento cambia saldo, no define producto.

## Uso 05 — Consulta de terrenos y parcelas
Prompt: El trabajador consulta terrenos/parcelas existentes y ve superficie en m², sin registrar terrenos.  
Respuesta: consulta-terrenos.js consulta parcelas por terreno y terrenos.html muestra m².  
Anterior 15829d9; posterior 2a16b0f; ajuste de estado en 026ae6b. Diferencias: git diff --numstat 15829d9 2a16b0f.  
Prueba: GET /api/parcelas/terreno/{id} devolvió parcelas con y sin cultivo. Uso: generación/depuración. Reflexión: el estado puede derivarse de la presencia de cultivo.

## Uso 06 — Cultivos, riegos y observaciones
Prompt: Lista cultivos existentes y registra riegos/observaciones ligados al cultivo; conserva el panel de cosecha y no pidas ID de parcela.  
Respuesta: cultivos-actividades.js y ajustes a cultivos.html; se encapsuló la lógica para evitar colisión de variables.  
Anterior 2a16b0f; posterior 9c1b831, continuado en b73f746. Diferencias: git diff --numstat 2a16b0f 9c1b831.  
Prueba: se revisó el flujo con cultivos y parcelas existentes. Uso: generación/modificación/depuración. Reflexión: revisar el HTML anterior evitó eliminar el registro de cosecha.
