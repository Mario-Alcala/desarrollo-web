# Registro de consultas de IA generativa — Reporte 3

**Proyecto:** Gestión de Cultivos  
**Periodo documentado:** 18–22/11/2026  
**Herramienta consultada por Kevin:** ChatGPT dentro de Codex  
**Alcance:** consultas de explicación, depuración y documentación; la generación/modificación de código se registra en los `r-ia-dev-s03.md` individuales.

## Integrante 2 — Kevin Miguel García Montané

| Tema | Consulta registrada | Resumen de la respuesta |
|---|---|---|
| Spring y capas | ¿Cómo se conectan Controller, Service y Repository? ¿Para qué sirven la inyección por constructor, `@PathVariable` y `@RequestBody`? | El controlador recibe HTTP, el servicio contiene validaciones y reglas, y el repositorio ejecuta las consultas. Spring inyecta dependencias por constructor; `@PathVariable` toma datos de la ruta y `@RequestBody` convierte JSON a un objeto. |
| Retornos y errores | ¿Por qué algunos métodos devuelven algo y otros son `void`? ¿`return` sirve para devolver excepciones? | Se retorna un dato cuando forma parte de la respuesta al cliente. Un método puede ser `void` si no necesita cuerpo de respuesta; los errores se comunican mediante excepciones y el estado HTTP correspondiente. |
| `throw`, excepción y `throws` | ¿Cuál es la diferencia entre `throw` y una excepción? ¿Siempre se usa `throw`? | La excepción representa el problema; `throw` lanza una instancia y `throws` declara que el método puede propagarla. No toda operación necesita lanzar una excepción manualmente. |
| Inserciones e identificadores | ¿Por qué `insertar` afecta el ID? | MySQL asigna el ID autoincremental; el repositorio recupera la llave generada para que el servicio pueda devolver el objeto creado con su identificador. |
| Búsqueda y filtros | ¿Hay que agregar métodos para buscar por nombre? ¿En qué capa se ponen? | Si la interfaz necesita filtrar, el repositorio consulta por el criterio; el servicio aplica reglas y el controlador recibe el parámetro, por ejemplo mediante `?nombre=`. |
| Ubicación del clima | ¿Cómo se define que el pronóstico es de Xalapa y conviene guardar coordenadas? | La ubicación se determina con latitud y longitud del terreno o valores ingresados. La hora local no determina la ciudad. Las coordenadas deben asociarse al terreno si el clima se consulta para ese sitio. |
| Pronóstico | ¿Se puede mostrar una semana y actualizar al pasar los días? ¿Y consultar a medianoche? | Se explicó el uso de un pronóstico diario y la programación de actualización. La evidencia debe distinguir entre tener un modelo/ruta y haber comprobado una sincronización real del proveedor meteorológico. |
| Git y archivos de reporte | ¿Qué significa el diff entre commits y se tienen que copiar todas las clases Java? | `git diff HASH_ANTERIOR HASH_POSTERIOR` compara dos versiones; `git diff --numstat` resume líneas agregadas/eliminadas por archivo. El reporte señala los archivos relevantes sin duplicar todo el proyecto. |

## Integrante 3 — Carlos Alessandro Roa Vázquez

La fuente es `documentacion (1).zip`, especialmente `Integrante_03/Uso_06/`. Esa sesión trató de cómo cumplir los formatos de la clase, documentar usos previos, explicar `git diff --numstat`, ubicar hashes, preparar reflexiones y organizar los archivos de evidencia. También pidió conservar el orden de los usos 01–05 y registrar Uso 06 como documentación. No es una sesión de generación de código.

Además, el archivo `documentacion/reportes/r-ia-doc.md` incluido por separado registra consultas numeradas 1–5 y 7–9. Se conservan los números que aparecen en la fuente; no se agrega una consulta 6 que no fue entregada:

| N.º fuente | Tema de la consulta | Resumen de la aclaración |
|---|---|---|
| 1 | Incorporar cambios de `origin/main` sin perder trabajo y entender ramas locales/remotas. | Revisar estado y rama, guardar cambios antes de integrar y verificar el resultado del merge/pull. |
| 2 | Maven en WSL y MySQL. | Diferenciar el Maven Wrapper del Maven instalado y comprobar el servicio MySQL antes de arrancar Spring. |
| 3 | Código duplicado en `terrenos.js`. | Identificar y retirar el bloque duplicado para evitar listeners o funciones repetidas. |
| 4 | Comentario de encabezado para archivos. | Usar un encabezado breve con nombre, capa y propósito del archivo. |
| 5 | Cómo funcionan las pantallas, `fetch`, datos de respaldo, conversión de hectáreas a m², Open-Meteo y Git/backend. | Distinguir datos que llegan del API de datos locales de ejemplo; documentar la conversión y la fuente de clima, y separar responsabilidades frontend/backend. |
| 7 | Reflexión del Uso 05 y funciones `totalPedido`/`dibujarPedidos`. | `totalPedido` suma cantidad por precio por renglón y `dibujarPedidos` presenta la lista; la reflexión debe describir lo que el estudiante verificó. |
| 8 | Cómo organizar los documentos y los formatos de IA. | Mantener el reporte de actividad de equipo aparte del registro de consultas y del registro de generación de código. |
| 9 | Revisión de declaración y reporte. | Corregir datos faltantes o inconsistentes y no afirmar como comprobado lo que no aparece en las evidencias. |

## Integrante 4 — Ángel de Jesús Nieto Hernández

El Word `Reporte_Desarrollo (1).docx` incluye seis enlaces de conversaciones de ChatGPT y una descripción general de consultas sobre organización de reportes, explicación de interfaces, qué funciona con datos locales y qué depende del backend, y problemas de rutas/estructura. Se registra el contenido que el Word sí proporciona; no se reconstruye texto literal que no está incluido en el documento.

| Fecha indicada | Conversación enlazada | Uso descrito en el Word |
|---|---|---|
| 16/11/2026 | [ChatGPT 1](https://chatgpt.com/share/6b012292-6d54-83e8-9b17-e5c520102577) y [ChatGPT 2](https://chatgpt.com/share/6b012346-f68c-83e8-b7cf-8e4732458a75) | Organización del reporte y descripción de actividades. |
| 16/11/2026 | [ChatGPT 2](https://chatgpt.com/share/6b012346-f68c-83e8-b7cf-8e4732458a75) | Consulta de apoyo para explicar/documentar el trabajo. |
| 16/11/2026 | [ChatGPT 3](https://chatgpt.com/share/6b0123ba-7c0c-83e8-ae88-548a0b9ae869) | Apoyo de documentación y explicación. |
| 18/11/2026 | [ChatGPT 4](https://chatgpt.com/share/6b012472-fc18-83e8-9f2a-f51e9cfd2071) | Explicar pantallas, organización y dependencias del backend. |
| 20/11/2026 | [ChatGPT 5](https://chatgpt.com/share/6b012580-e64c-83e8-9560-53601c239dd5) | Distinguir lo implementado de lo que usa datos locales y ordenar rutas. |
| 20/11/2026 | [ChatGPT 6](https://chatgpt.com/share/6b0124f9-594c-83e8-bae5-5d95e6e09b9f) | Apoyo final para explicar y documentar las interfaces. |

Las consultas específicas que ayudaron a generar código están en el `r-ia-dev-s03.md` de Ángel, junto con los prompts transcritos o resumidos desde el Word.

## Integrante 1 — Mario Javier Bonavides Alcalá

No se recibió un registro de consultas de IA de Mario para este periodo. Sus cambios de Git se incluyen en el reporte de actividad; el historial por sí solo no permite afirmar si utilizó IA.

