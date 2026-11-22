# Respuesta de la IA — Uso 02

## Qué pasó
- La IA construyó primero las cuatro pantallas restantes de una vez y las probó en su propio entorno con Playwright. Yo pedí que no fuera así: quería ventana por ventana en VS Code
- Entregó solo Catálogo, inline: `css/admin-vistas.css`, `js/admin-comun.js`, `js/admin-datos.js` (productos y cosechas de ejemplo), `js/sidebar.js` (menú completo de administrador), `catalogo-admin.html`, `js/catalogo-admin.js`.

## Reglas de la especificación que implementó
- El catálogo no guarda kilos ni maduración: se calculan de los lotes de cosecha
- Filtros, búsqueda, y agregar/editar con validaciones; los cambios viven solo en memoria (se pierden al recargar; mensaje en pantalla).
- Primer paso de la regla "parcela ocupada = tiene cultivo activo" queda para las otras pantallas.

## Límites
- Las pruebas con Playwright las corrió la IA, no yo
- Los datos son de ejemplo; no hay endpoint de catálogo confirmado en el backend
