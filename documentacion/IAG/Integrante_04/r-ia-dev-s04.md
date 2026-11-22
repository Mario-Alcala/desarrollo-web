# Registro de desarrollo con IA — Integrante 4, Ángel de Jesús

**Release:** 4  
**Herramienta:** ChatGPT  
**Modelo:** GPT-4.0 según el Word recibido; temperatura no indicada.  
**Repositorio:** https://github.com/Mario-Alcala/desarrollo-web

Este es un solo reporte `r-ia-dev` para el integrante. Las carpetas `Uso_##/` guardan las evidencias por sesión. Los prompts que el Word llama borradores o resúmenes se mantienen etiquetados como resúmenes.

## Sesiones documentadas

| Uso | Tema | Código anterior → posterior | Diff / evidencia | Alcance comprobado |
|---|---|---|---|---|
| 01 | Inicio, login y crear cuenta. | `9c0c506 → 1e425ea`, filtrado a login, inicio, crear cuenta, CSS de acceso/cuenta y `ap.js`. | `Uso_01/cambios.diff`, `Uso_01/numstat.txt`; imágenes extraídas a `Evidencias_Word/`. | El Word describe una interfaz de acceso y una pantalla de creación de cuenta; no demuestra autenticación o registro persistente en el servidor. |
| 02 | Calendario y programación de etapas. | `1beb12c → 9c0c506`; entre esos commits también está la mejora `e2db6b2`. | `Uso_02/cambios.diff`, `Uso_02/numstat.txt`. | Se documenta calendario visual y programación local. El Word no adjunta prueba de persistencia en base de datos. |
| 03 | Catálogo del cliente y resumen del pedido. | El Word no trae un par de commits exclusivo. `f85c354 → 1e425ea` se usa solo como rango amplio para los archivos del catálogo/carrito. | `Uso_03/cambios.diff`, `Uso_03/numstat.txt`. | El Word asoció commits de calendario a este uso; se deja corregido que no son una evidencia específica de catálogo. La captura muestra la interfaz, no una compra guardada en SQL. |
| 04 | Pago, transferencia, recolección e historial. | No hay un par aislado por función. `d2c9ce6 → 1e425ea` es un rango amplio para los archivos de pago, recolección e historial. | `Uso_04/cambios.diff`, `Uso_04/numstat.txt`. | El Word presenta el pago como demostración. No se documenta cobro real ni rastreo de paquetería. |
| 05 | Formularios y vistas operativas del trabajador. | `96a73b0 → d2c9ce6`, filtrado a formularios y JavaScript operativo. | `Uso_05/cambios.diff`, `Uso_05/numstat.txt`. | El Word reconoce que los formularios aún no funcionaban como se esperaba y que las rutas de ejemplo no estaban confirmadas. |
| 06 | Semillas dentro de Inventario y retiro de Distribución del menú. | `96a73b0 → d2c9ce6`, filtrado a inventario y navegación. | `Uso_06/cambios.diff`, `Uso_06/numstat.txt`. | El Word muestra la base visual, pero señala que aún faltaba registrar los datos. |

El texto de cada prompt, respuesta y reflexión está dentro de su carpeta `Uso_##/`. Las 16 imágenes incrustadas en el Word están en `Evidencias_Word/`; se conservaron en el orden del documento porque no todas tienen una etiqueta que permita asignarlas con certeza a una sesión.

## Límites de los registros

- Las sesiones 03 y 04 no tienen commits propios claramente separados en el Word. Los rangos amplios de sus diffs están señalados y no deben presentarse como commits exclusivos de esas pantallas.
- Las sesiones 05 y 06 separan por rutas los cambios operativos y de inventario dentro de un rango compartido.
- Las capturas muestran pantallas; no demuestran persistencia, autenticación real ni procesamiento de pagos.
