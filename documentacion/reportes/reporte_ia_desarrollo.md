# REPORTE DE IA DESARROLLO EN EL PROYECTO

**Fecha:** 20/11/2026  
**Número de reporte:** [NÚMERO_DE_REPORTE]

## 1. Breve descripción de uso

Utilicé apoyo de IA para trabajar el frontend de Gestión de Cultivos con HTML5, CSS3 y JavaScript puro. Las consultas abarcaron inicio y acceso, catálogo y pedido, pago y recolección, gestor, vistas del trabajador, inventario con semillas y calendario de etapas. También pedí ayuda para ordenar las rutas, revisar formularios, preparar consultas mediante fetch y sincronizar el repositorio.

La intención fue avanzar con código sencillo que pudiera leer y modificar en clase. Las vistas HTML se mantienen juntas en frontend, sin carpeta views; los estilos y scripts están separados en css y js.

## 2. Evidencias de uso

Los prompts siguientes son **borradores breves reconstruidos** a partir de las consultas de la sesión, no transcripciones literales. Las respuestas son resúmenes del apoyo realizado. Los marcadores se deben completar con evidencia del repositorio; no representan commits o capturas ya adjuntos. El modelo exacto y la temperatura no quedaron registrados para estas evidencias.

### Evidencia 1. Inicio, acceso y crear cuenta

| Campo | Evidencia |
|---|---|
| Herramienta | Codex, asistente de IA para apoyo en desarrollo. |
| Modelo/temperatura | [MODELO_UTILIZADO] / [TEMPERATURA_O_NO_DISPONIBLE] |
| Prompt original | Ayúdame a acomodar el inicio y el login con HTML y CSS sencillos. Deja crear cuenta solo como pantalla. (Borrador resumido; sustituir por el enlace o texto real si se solicita evidencia literal). |
| Respuesta de IA | Se trabajaron las vistas con campos básicos, navegación y estilos separados. El acceso del trabajador quedó como validación de demostración; crear cuenta quedó sin guardar usuarios. |
| Código anterior | [HASH_ANTERIOR] · [RUTA_O_FRAGMENTO_ANTERIOR] |
| Código posterior | [HASH_POSTERIOR] · [RUTA_O_FRAGMENTO_POSTERIOR]. Los últimos cambios siguen locales y no tienen commit. |
| Diferencias entre versiones | Inicio, login y registro visual; navegación del cliente al catálogo y del trabajador a cultivos. Credenciales de prueba solicitadas: trabajador@gmail.com y 1234. [SALIDA_GIT_DIFF_NUMSTAT] |
| Prueba de funcionamiento | Revisar enlaces, campos vacíos, credenciales correctas e incorrectas y comprobar que Crear cuenta no registra usuarios. [CAPTURA_O_PRUEBA_FUNCIONAL] |
| Código de uso | [CÓDIGO_DE_USO_SEGÚN_LA_CLASIFICACIÓN_DEL_CURSO] |
| Reflexión del estudiante | Aprendí a separar una pantalla de acceso de una autenticación real. La validación en JavaScript todavía no protege los recursos del servidor. |

### Evidencia 2. Calendario y programación de etapas

| Campo | Evidencia |
|---|---|
| Herramienta | Codex, asistente de IA para apoyo en desarrollo. |
| Modelo/temperatura | [MODELO_UTILIZADO] / [TEMPERATURA_O_NO_DISPONIBLE] |
| Prompt original | Ayúdame a mostrar las etapas en un calendario con mes y año. Quita cosecha estimada y agrega Regresar. (Borrador resumido; sustituir por el enlace o texto real si se solicita evidencia literal). |
| Respuesta de IA | Se ajustó la cuadrícula mensual, el campo de año y el regreso a cultivos. Se retiró cosecha estimada del formulario y de las marcas; Cosecha sigue disponible como etapa. |
| Código anterior | [HASH_ANTERIOR] · [RUTA_O_FRAGMENTO_ANTERIOR] |
| Código posterior | [HASH_POSTERIOR] · [RUTA_O_FRAGMENTO_POSTERIOR]. Los últimos cambios siguen locales y no tienen commit. |
| Diferencias entre versiones | Calendario visual y formulario de programación separados. Eventos locales con fecha, cultivo, etapa, notas y estado; acciones de completar y eliminar. Los datos antiguos se conservan. [SALIDA_GIT_DIFF_NUMSTAT] |
| Prueba de funcionamiento | Prueba automatizada en navegador: guardar una etapa, verla en su fecha, completarla y cambiar a 2028. La lista de etapas permanece visible aunque cambie el mes o año. [CAPTURA_O_PRUEBA_FUNCIONAL] |
| Código de uso | [CÓDIGO_DE_USO_SEGÚN_LA_CLASIFICACIÓN_DEL_CURSO] |
| Reflexión del estudiante | Me ayudó a distinguir el calendario de un formulario. También entendí que guardar fechas en el navegador no las comparte con la base de datos. |

### Evidencia 3. Catálogo y resumen del pedido

| Campo | Evidencia |
|---|---|
| Herramienta | Codex, asistente de IA para apoyo en desarrollo. |
| Modelo/temperatura | [MODELO_UTILIZADO] / [TEMPERATURA_O_NO_DISPONIBLE] |
| Prompt original | Ayúdame a poner el pedido dentro del catálogo y a quitar los enlaces del trabajador de esa pantalla. (Borrador resumido; sustituir por el enlace o texto real si se solicita evidencia literal). |
| Respuesta de IA | Se concentraron los productos, los botones de kilos y el resumen en el catálogo. El cliente conserva Inicio y sus opciones de pedido e historial. |
| Código anterior | [HASH_ANTERIOR] · [RUTA_O_FRAGMENTO_ANTERIOR] |
| Código posterior | [HASH_POSTERIOR] · [RUTA_O_FRAGMENTO_POSTERIOR]. Los últimos cambios siguen locales y no tienen commit. |
| Diferencias entre versiones | Cantidades limitadas por existencias, subtotal por producto, total y navegación hacia pago. Se retiraron textos de práctica y la compra de la vista de cultivos. [SALIDA_GIT_DIFF_NUMSTAT] |
| Prueba de funcionamiento | Prueba en navegador: seleccionar un kilo, comprobar el total, pasar a pago, regresar y conservar el pedido; al confirmar, revisar el descuento de existencias locales. [CAPTURA_O_PRUEBA_FUNCIONAL] |
| Código de uso | [CÓDIGO_DE_USO_SEGÚN_LA_CLASIFICACIÓN_DEL_CURSO] |
| Reflexión del estudiante | Separar el catálogo de las actividades del trabajador hizo más claro qué opciones corresponden a cada vista. |

### Evidencia 4. Pago, transferencia, recolección e historial

| Campo | Evidencia |
|---|---|
| Herramienta | Codex, asistente de IA para apoyo en desarrollo. |
| Modelo/temperatura | [MODELO_UTILIZADO] / [TEMPERATURA_O_NO_DISPONIBLE] |
| Prompt original | Ayúdame a abrir pago en otra página, agregar transferencia y elegir la recolección en un calendario. (Borrador resumido; sustituir por el enlace o texto real si se solicita evidencia literal). |
| Respuesta de IA | Se mantuvo pago como página independiente, se agregó la selección Tarjeta/Transferencia y el calendario de recolección. Entregar pedido abre una sección de rastreo cuyo botón aún no realiza acciones. |
| Código anterior | [HASH_ANTERIOR] · [RUTA_O_FRAGMENTO_ANTERIOR] |
| Código posterior | [HASH_POSTERIOR] · [RUTA_O_FRAGMENTO_POSTERIOR]. Los últimos cambios siguen locales y no tienen commit. |
| Diferencias entre versiones | Validación de tarjeta solo cuando se elige ese método; transferencia sin datos bancarios inventados. Pedido e historial locales, fecha de recolección y confirmación de prueba. No hay cobros ni seguimiento real. [SALIDA_GIT_DIFF_NUMSTAT] |
| Prueba de funcionamiento | Pruebas en navegador de tarjeta y transferencia, fechas permitidas durante catorce días, cambio de mes, confirmación, historial, stock y ausencia de datos de tarjeta en localStorage. [CAPTURA_O_PRUEBA_FUNCIONAL] |
| Código de uso | [CÓDIGO_DE_USO_SEGÚN_LA_CLASIFICACIÓN_DEL_CURSO] |
| Reflexión del estudiante | Aprendí que elegir un método de pago no equivale a procesar dinero. Falta integrar el pago real y los pedidos con el backend. |

### Evidencia 5. Gestor, trabajador y vistas operativas

| Campo | Evidencia |
|---|---|
| Herramienta | Codex, asistente de IA para apoyo en desarrollo. |
| Modelo/temperatura | [MODELO_UTILIZADO] / [TEMPERATURA_O_NO_DISPONIBLE] |
| Prompt original | Ayúdame a ordenar las opciones del trabajador y a revisar los formularios con fetch y validaciones sencillas. (Borrador resumido; sustituir por el enlace o texto real si se solicita evidencia literal). |
| Respuesta de IA | Se organizaron las vistas de cultivos, observaciones, riegos, fertilizantes, abonos y terrenos con formularios y listas. El gestor administra los productos locales que usa el catálogo. |
| Código anterior | [HASH_ANTERIOR] · [RUTA_O_FRAGMENTO_ANTERIOR] |
| Código posterior | [HASH_POSTERIOR] · [RUTA_O_FRAGMENTO_POSTERIOR]. Los últimos cambios siguen locales y no tienen commit. |
| Diferencias entre versiones | Formularios operativos con consultas y operaciones a la API, selección de relaciones y proveedores escritos por nombre. La disponibilidad depende del servidor; no se sustituyen fallos por éxitos simulados. [SALIDA_GIT_DIFF_NUMSTAT] |
| Prueba de funcionamiento | Revisar altas, edición y eliminación con el backend del equipo. En esta revisión se probaron abonos y fertilizantes con API simulada; las demás operaciones requieren evidencia adicional. [CAPTURA_O_PRUEBA_FUNCIONAL] |
| Código de uso | [CÓDIGO_DE_USO_SEGÚN_LA_CLASIFICACIÓN_DEL_CURSO] |
| Reflexión del estudiante | El mismo diseño de formulario se puede reutilizar sin agregar un framework. Es necesario verificar que cada campo coincida con lo que recibe Java. |

### Evidencia 6. Inventario con semillas y retiro de distribución

| Campo | Evidencia |
|---|---|
| Herramienta | Codex, asistente de IA para apoyo en desarrollo. |
| Modelo/temperatura | [MODELO_UTILIZADO] / [TEMPERATURA_O_NO_DISPONIBLE] |
| Prompt original | Ayúdame a mover semillas dentro de inventario y quitar distribución del menú y de las vistas. (Borrador resumido; sustituir por el enlace o texto real si se solicita evidencia literal). |
| Respuesta de IA | Se integraron Existencias y Semillas en inventario.html. Se eliminaron las páginas independientes de semillas y distribución y sus enlaces. Se adaptaron los campos al backend recibido en el pull. |
| Código anterior | [HASH_ANTERIOR] · [RUTA_O_FRAGMENTO_ANTERIOR] |
| Código posterior | [HASH_POSTERIOR] · [RUTA_O_FRAGMENTO_POSTERIOR]. Los últimos cambios siguen locales y no tienen commit. |
| Diferencias entre versiones | Inventario usa idInsumo, cantidad, fechaIngreso y fechaCaducidad; semillas usa nombre, unidadMedida e idProveedor. Abonos y fertilizantes se ajustaron al nuevo modelo Insumo. El backend de distribución no se eliminó. [SALIDA_GIT_DIFF_NUMSTAT] |
| Prueba de funcionamiento | Prueba con API simulada: crear, editar y eliminar semillas; guardar existencias; rechazar caducidad anterior al ingreso; comprobar nombres de campos y proveedores. [CAPTURA_O_PRUEBA_FUNCIONAL] |
| Código de uso | [CÓDIGO_DE_USO_SEGÚN_LA_CLASIFICACIÓN_DEL_CURSO] |
| Reflexión del estudiante | Mover una sección también requiere revisar sus rutas y datos. El pull cambió el contrato de la API y fue necesario adaptar los formularios. |

### Evidencia 7. Organización de HTML, CSS y JavaScript

| Campo | Evidencia |
|---|---|
| Herramienta | Codex, asistente de IA para apoyo en desarrollo. |
| Modelo/temperatura | [MODELO_UTILIZADO] / [TEMPERATURA_O_NO_DISPONIBLE] |
| Prompt original | Ayúdame a revisar las rutas y el formato del código. Los HTML deben quedar juntos, sin carpeta views. (Borrador resumido; sustituir por el enlace o texto real si se solicita evidencia literal). |
| Respuesta de IA | Se mantuvieron los HTML al mismo nivel dentro de frontend, con hojas de estilo en css y scripts en js. Se revisaron las referencias locales y se conservó código sin frameworks. |
| Código anterior | [HASH_ANTERIOR] · [RUTA_O_FRAGMENTO_ANTERIOR] |
| Código posterior | [HASH_POSTERIOR] · [RUTA_O_FRAGMENTO_POSTERIOR]. Los últimos cambios siguen locales y no tienen commit. |
| Diferencias entre versiones | Enlaces entre las páginas, rutas de estilos y scripts y separación de responsabilidades. Se mantienen saltos de línea e indentación para poder revisar el código en clase. [SALIDA_GIT_DIFF_NUMSTAT] |
| Prueba de funcionamiento | Comprobación de archivos enlazados, sintaxis de JavaScript y búsqueda de referencias a views, semillas.html y distribucion.html. [CAPTURA_O_PRUEBA_FUNCIONAL] |
| Código de uso | [CÓDIGO_DE_USO_SEGÚN_LA_CLASIFICACIÓN_DEL_CURSO] |
| Reflexión del estudiante | La estructura de carpetas ayuda, pero cada cambio de ubicación obliga a comprobar los enlaces para evitar páginas rotas. |

### Evidencia 8. Sincronización y revisión de Git

| Campo | Evidencia |
|---|---|
| Herramienta | Codex, asistente de IA para apoyo en desarrollo. |
| Modelo/temperatura | [MODELO_UTILIZADO] / [TEMPERATURA_O_NO_DISPONIBLE] |
| Prompt original | Ayúdame a revisar git status y hacer pull sin perder mis cambios. Esta vez no hagas push. (Borrador resumido; sustituir por el enlace o texto real si se solicita evidencia literal). |
| Respuesta de IA | Se respaldó el frontend y se realizó git pull --ff-only. El remoto avanzó de 9c0c506 a 96a73b0 sin conflictos. Los cambios locales permanecieron sin commit ni push. |
| Código anterior | [HASH_ANTERIOR] · [RUTA_O_FRAGMENTO_ANTERIOR] |
| Código posterior | [HASH_POSTERIOR] · [RUTA_O_FRAGMENTO_POSTERIOR]. Los últimos cambios siguen locales y no tienen commit. |
| Diferencias entre versiones | Se incorporaron cambios remotos del backend y se conservaron los módulos locales. Los ajustes de esta revisión no tienen todavía un hash de commit. [SALIDA_GIT_DIFF_NUMSTAT] |
| Prueba de funcionamiento | Resultado del pull: fast-forward sin conflictos. Adjuntar git status final y comparar los cambios locales antes de preparar un commit. [CAPTURA_O_PRUEBA_FUNCIONAL] |
| Código de uso | [CÓDIGO_DE_USO_SEGÚN_LA_CLASIFICACIÓN_DEL_CURSO] |
| Reflexión del estudiante | Aprendí a revisar los cambios del equipo antes de subir los míos y a distinguir traer cambios con pull de publicar cambios con push. |

## Consultas técnicas seleccionadas para documentar

Los siguientes prompts se resumen a partir de las dudas de la sesión. Se incluyen los que ayudaron a entender o implementar partes concretas del código, no todas las preguntas de la conversación.

| Tipo | Prompt resumido | Respuesta o apoyo recibido |
|---|---|---|
| Generación y modificación de código | “¿Se puede agregar al resumen del administrador el pronóstico de varios días usando la API del clima y hacer que avance conforme pasan los días?” | Se revisó el pronóstico disponible en Open-Meteo y se preparó la consulta de varios días para mostrarlo en el resumen. Después se ajustó la actualización para consultar el clima una vez al día, a medianoche. |
| Comprensión de código | “¿Cómo funciona `Optional` en un método y cómo devuelve un objeto `Semilla`?” | Se explicó que `Optional<Semilla>` representa que una búsqueda puede encontrar o no un registro, y que al consultar la base de datos el resultado se convierte en el objeto `Semilla` mediante el mapeo de columnas. |
| Comprensión de capas | “¿Cómo sabe `SemillaService` cuándo ejecutar las validaciones y llamar al repositorio?” | Se aclaró el recorrido desde el controlador al servicio: el controlador llama al método del servicio, el servicio valida los datos y después solicita al repositorio leer o escribir en la base de datos. |
| Organización de interfaz | “¿Cómo quedaría bien distribuida una página HTML completa para PC y se puede reutilizar un sidebar por cada rol?” | Se explicó cómo organizar el contenedor principal, el menú lateral y el área de contenido, y cómo reutilizar la navegación común sin repetir toda su estructura en cada página. |

Para los cambios de código de esta sesión, el commit anterior registrado es `dfc2d21c84e09635471d93d1aa535b2979878848` (`Merge remote-tracking branch 'origin/main'`). El commit posterior queda pendiente de agregar cuando el estudiante lo comparta después de realizar su commit. No se inventan hashes ni enlaces de diferencias.

## Observaciones adicionales

El acceso del trabajador es una demostración local, no autenticación del servidor. Crear cuenta sigue siendo solo una interfaz. El catálogo, el gestor, los pedidos, el historial y las etapas del calendario usan almacenamiento del navegador; no se debe afirmar que se sincronizan automáticamente con la base de datos.

Las vistas operativas utilizan fetch. Las pruebas de inventario, semillas, fertilizantes y abonos realizadas en esta revisión usaron respuestas simuladas de API, por lo que aún se requiere validación con Java y la base de datos real. La función de consulta de cultivos del calendario está preparada, pero la carga actual del calendario usa productos locales.

El pago sigue siendo de prueba: no se guardan números de tarjeta ni códigos de seguridad y no se realizan cobros. Transferencia todavía no tiene cuenta bancaria configurada. El rastreo queda pendiente. Este documento es un borrador de reporte, no la bitácora final.
