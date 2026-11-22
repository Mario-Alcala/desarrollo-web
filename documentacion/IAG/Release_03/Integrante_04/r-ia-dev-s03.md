# Registro de generación de código con IA — Reporte 3

**Integrante:** Ángel de Jesús Nieto Hernández (Integrante 4)  
**Herramienta/modelo declarados en el Word:** ChatGPT, GPT-4.0; temperatura no indicada.  
**Periodo del trabajo:** 16–20/11/2026  
**Fuente principal:** `Reporte_Desarrollo (1).docx`, incluyendo las capturas incrustadas.

## Sesiones de código registradas

| Uso | Trabajo descrito y prompt conservado | Comparación de commits y archivos revisados |
|---|---|---|
| 01 | Inicio, login y registro. Prompt: “Ayúdame a acomodar el inicio y el login con HTML y CSS, ya que a mí no me sale como login, me sale chueco”. | `b9be992 -> 1e425ea`, filtrado a `index.html`, `login.html`, `crear-cuenta.html`, `css/acceso.css`, `css/cuenta.css` y `js/ap.js`. |
| 02 | Calendario de etapas. Prompt: “Ayúdame a mostrar las etapas en un calendario con mes y año”. | `f85c354 -> 9c0c506`, filtrado a `calendario.html`, `etapas.html`, `css/calendario.css` y `js/calendario.js`. |
| 03 | Catálogo y pedido. Prompt: “Ayúdame a poner el pedido dentro del catálogo y a quitar los enlaces del trabajador de esa pantalla”. | `f85c354 -> 1e425ea`, filtrado a `catalogo.html`, `js/catalogo.js` y `js/carrito.js`. Rango amplio: incluye otros cambios intermedios. |
| 04 | Pago, transferencia, recolección e historial. Prompt: “Ayúdame a abrir pago en otra página, agregar transferencia y elegir la recolección en un calendario”. | `d2c9ce6 -> 1e425ea`, filtrado a `pago.html`, `css/pago.css`, `js/pago.js`, `recoleccion.html`, `js/recoleccion.js`, `historial.html`, `js/historial.js`, `js/pedido.js` y `js/carrito.js`. Rango amplio: no atribuye todos los cambios del rango a una sola solicitud. |
| 05 | Formularios y navegación de operación del trabajador. Prompt resumido del Word: ordenar las opciones del trabajador y revisar formularios con `fetch`. | `96a73b0 -> d2c9ce6`, filtrado a las vistas y scripts de operaciones (`abonos`, `fertilizantes`, `cultivos`, `observaciones`, `riegos`, `terrenos`, `api.js`, `operaciones.js` y `proveedores.js`). |
| 06 | Inventario: integrar semillas en la vista y retirar Distribución del menú. Prompt: “Ayúdame a mover semillas dentro de inventario y quitar distribución del menú y de las vistas”. | `d2c9ce6 -> 1e425ea`, filtrado a `inventario.html`, `js/inventario.js` y `js/sidebar.js`. |

En cada carpeta `Uso_01`–`Uso_06` se guardan el prompt o resumen del Word, la respuesta, la reflexión, el `numstat` y el diff/código antes y después cuando corresponde. Los rangos amplios se etiquetan como tales para no presentar un diff acumulado como si proviniera de un solo prompt.

## Consultas documentales del Word

Los seis enlaces de consultas generales, sus fechas y el resumen disponible están en [`../r-ia-doc-03.md`](../r-ia-doc-03.md). El Word no transcribe literalmente el contenido de esas conversaciones, así que no se inventa una respuesta textual.

## Prueba, revisión y límites

El Word incluye capturas de las interfaces de acceso, calendario, catálogo/pedido, pago, recolección, historial, operación e inventario. Las capturas sirven como evidencia visual. Algunas funciones se encontraban en demostración o no estaban conectadas al backend; no prueban persistencia, procesamiento real de pagos ni seguimiento real de envíos.

## Reflexión del estudiante

El Word indica que el apoyo de IA ayudó a ordenar interfaces y entender la diferencia entre una pantalla, una validación en JavaScript y una operación respaldada por el servidor. También señala que quedan dependencias de rutas y conexión al backend por revisar. Ángel debe confirmar esta redacción y firmar su declaración personal.
