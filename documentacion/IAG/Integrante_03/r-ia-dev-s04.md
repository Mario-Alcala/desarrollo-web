# Registro de desarrollo con IA — Integrante 3, Carlos Alessandro Roa Vázquez

**Release:** 4  
**Herramienta:** Claude (Anthropic)  
**Modelo indicado en la declaración:** `claude-sonnet-5-5`; la temperatura no está disponible para el usuario.  
**Repositorio:** https://github.com/Mario-Alcala/desarrollo-web

Este es el único reporte `r-ia-dev` del integrante para este release. Los usos de código no tienen un reporte `r-ia-dev` separado: cada sesión conserva sus evidencias en `Uso_##/`.

## Sesiones de generación/modificación de código

| Uso | Actividad | Código anterior → posterior | Diff y archivos | Prueba / límite |
|---|---|---|---|---|
| 01 | Pantallas de terrenos: lista, detalle, sidebar y estilos. | `96a73b0 → f46b1aa` | Ver `Uso_01/cambios.diff` y `Uso_01/numstat.txt`; código antes/después en las carpetas del mismo uso. | Capturas en `Uso_01/`. El ZIP indica que se usaron datos de ejemplo y que la integración con la API no se comprobó de extremo a extremo. |
| 02 | Catálogo administrativo, filtros, formularios y utilidades compartidas. | `f46b1aa → 6ee5af5` | Ver `Uso_02/cambios.diff` y `Uso_02/numstat.txt`. | Capturas en `Uso_02/`. El registro dice que los cambios del formulario permanecían en memoria y se perdían al recargar. |
| 03 | Pantalla de proveedores e insumos. | `6ee5af5 → 51821ed` | Ver `Uso_03/cambios.diff` y `Uso_03/numstat.txt`. | Capturas en `Uso_03/`. El registro indica que los datos eran de ejemplo y que no se verificaron rutas reales del API. |
| 04 | Bodega: lotes, herramientas, cosechas y movimientos. | `51821ed → 8153263` | Ver `Uso_04/cambios.diff` y `Uso_04/numstat.txt`. | Capturas en `Uso_04/`. El registro reconoce que la pantalla usa datos locales y que faltaban funciones para guardar movimientos y probar la integración real. |
| 05 | Lista de pedidos, filtro, búsqueda y cálculo del total. | `8153263 → 5b95117` | Ver `Uso_05/cambios.diff` y `Uso_05/numstat.txt`. | Capturas en `Uso_05/`. La respuesta del ZIP distingue pruebas simuladas por IA de pruebas realizadas por el estudiante; el detalle del pedido y la conexión con el API seguían pendientes en esa sesión. |

Los textos literales de prompts, respuestas y reflexiones están en los respectivos `prompt.md`, `respuesta.md` y `reflexion.md`. Las capturas proporcionadas se conservaron dentro de cada uso.

## Uso documental que no generó código

El Uso 06 del ZIP trata sobre la documentación de IA, la estructura de los reportes y cómo comparar commits. No se cuenta como sesión de generación de código; su prompt, respuesta y reflexión se conservan en `Uso_06/` y también se resume en `../r-ia-doc-04.md`.

## Observaciones sobre la evidencia

- El integrante declara que usó Claude para generar y ajustar la mayor parte del HTML, CSS y JavaScript de sus pantallas.
- Cada `cambios.diff` se generó con los commits correspondientes; el resumen por archivo está en `numstat.txt`.
- Una captura visual demuestra el estado mostrado en esa captura, pero no prueba que los datos se guardaran en MySQL.
- No se atribuyeron pruebas simuladas de Claude al integrante como si las hubiera ejecutado él.
