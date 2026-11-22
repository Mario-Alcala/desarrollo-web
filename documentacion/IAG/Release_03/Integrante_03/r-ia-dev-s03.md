# Registro de generación de código con IA — Reporte 3

**Integrante:** Carlos Alessandro Roa Vázquez (Integrante 3)  
**Herramienta/modelo declarados:** Claude (Anthropic), `claude-sonnet-5-5` configurado; temperatura no controlable por el usuario.  
**Periodo:** 19–20/11/2026  
**Fuente:** `documentacion (1).zip`, carpeta `Integrante_03`.

## Código generado o modificado

La evidencia entregada documenta cinco usos de código:

| Uso | Pantalla/cambio | Comparación Git registrada |
|---|---|---|
| 01 | Terrenos: menú lateral y superior, tarjetas, detalle y estilos administrativos. | `96a73b0 -> f46b1aa` |
| 02 | Catálogo administrativo: lista de familias/variedades, formulario y filtros. | `f46b1aa -> 6ee5af5` |
| 03 | Proveedores y productos relacionados: pantalla con navegación, filtros y datos de demostración. | `6ee5af5 -> 51821ed` |
| 04 | Bodega: presentación de existencias, lotes, herramientas y movimientos. | `51821ed -> 8153263` |
| 05 | Pedidos: lista con búsqueda, filtros por estado y cálculo del total mostrado. | `8153263 -> 5b95117` |

Cada carpeta `Uso_01`–`Uso_05` contiene prompt, respuesta, reflexión, `cambios.diff`, `numstat.txt` y capturas/código antes y después cuando se entregaron. Los hashes son las comparaciones consignadas en el ZIP; `--numstat` resume líneas agregadas y eliminadas por archivo, no mide calidad ni confirma funcionamiento.

## Uso 06 — Documentación, sin generación de código

Uso 06 trató de organizar los reportes y explicar `git diff`, los hashes, los formatos y las reflexiones de las cinco sesiones anteriores. Por tanto, queda registrado en `r-ia-doc-03.md`; no se cuenta como una sexta sesión de generación de código. La carpeta conserva sus archivos originales de prompt, respuesta y reflexión.

## Prueba y límites

Las pantallas de evidencia muestran las interfaces. Las reflexiones indican que parte de la información es local/de ejemplo y que no todas las operaciones se guardan al recargar. Las pruebas automatizadas simuladas por IA se distinguen de la revisión manual del integrante; no se presentan como una validación completa contra el API o la base de datos.

## Reflexión del estudiante

La IA me ayudó a mantener un estilo parecido entre las vistas y a avanzar pantalla por pantalla. Revisé los formularios, filtros y datos que se mostraban; también corregí detalles cuando el resultado no coincidía con lo que quería. Me falta confirmar con las pruebas del sistema qué formularios ya guardan datos reales y cuáles siguen usando ejemplos locales.
