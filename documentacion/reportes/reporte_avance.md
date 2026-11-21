# REPORTE DE AVANCE DEL PROYECTO

**Equipo:** [NOMBRE_O_NÚMERO_DEL_EQUIPO]  
**Fecha:** 20/11/2026  
**Número de reporte:** [NÚMERO_DE_REPORTE]  
**Repositorio GitHub:** https://github.com/Mario-Alcala/desarrollo-web

## 1. Actividades realizadas

- Se trabajaron las interfaces de inicio, login y crear cuenta con HTML, CSS y JavaScript sencillo. Crear cuenta quedó únicamente como pantalla y el acceso del trabajador utiliza credenciales de demostración.
- Se acomodó el catálogo para que el cliente seleccione kilos, vea subtotales y total y prepare su pedido en esa misma pantalla. Se separaron las opciones del trabajador.
- Se trabajó el pago en una página independiente, con tarjeta o transferencia, calendario de recolección e historial de pedidos. Entregar pedido abre una sección de rastreo que todavía no tiene acciones.
- Se mantuvo el panel gestor para administrar los productos locales y se organizaron las vistas operativas de cultivos, observaciones, riegos, fertilizantes, abonos y terrenos con consumo de API.
- Se integró semillas dentro de inventario y se retiraron la página y los enlaces de distribución. Se adaptaron inventario, semillas, abonos y fertilizantes a los campos del backend recibido mediante pull.
- Se ajustó el calendario visual: programación por fecha, etapas, notas, completar o eliminar, navegación mensual, cambio de año y botón Regresar. Se quitó cosecha estimada; Cosecha permanece como etapa.
- Se mantuvieron las páginas HTML al mismo nivel, sin views, y los estilos y scripts en carpetas separadas.
- Se respaldó el frontend y se sincronizó Git sin conflictos. Los últimos cambios permanecen locales, sin commit ni push. Se prepararon los tres reportes con evidencia pendiente por completar.

## 2. Evidencias de trabajo

| Actividad | Integrante responsable | Enlace a commit |
|---|---|---|
| Inicio, login y crear cuenta visual | [NOMBRE_DESARROLLADOR_3] / apoyo: [NOMBRE_DESARROLLADOR_4] | [ENLACE_COMMIT_ACCESO] |
| Catálogo, cantidades y resumen del pedido | [NOMBRE_DESARROLLADOR_3] / apoyo: [NOMBRE_DESARROLLADOR_4] | [ENLACE_COMMIT_CATALOGO] |
| Pago, transferencia, recolección e historial | [NOMBRE_RESPONSABLE] / apoyo: [NOMBRE_DESARROLLADOR_4] | [ENLACE_COMMIT_PEDIDOS] |
| Gestor y navegación del trabajador | [NOMBRE_RESPONSABLE] / apoyo: [NOMBRE_DESARROLLADOR_4] | [ENLACE_COMMIT_GESTION] |
| Cultivos, riegos, observaciones y terrenos | [NOMBRE_DESARROLLADOR_4] | [ENLACE_COMMIT_OPERACIONES] |
| Inventario con semillas, abonos y fertilizantes | [NOMBRE_DESARROLLADOR_4] | [ENLACE_COMMIT_INVENTARIO] |
| Calendario visual y programación de etapas | [NOMBRE_DESARROLLADOR_4] | [ENLACE_COMMIT_CALENDARIO] |
| Rutas, retiro de distribución y formato del código | [NOMBRE_DESARROLLADOR_4] | [ENLACE_COMMIT_ESTRUCTURA] |
| Actualización de reportes | [NOMBRE_DESARROLLADOR_4] / revisión: [INTEGRANTES] | [ENLACE_COMMIT_REPORTES] |

Los responsables son espacios para confirmar con el equipo. Los cambios de esta revisión todavía no tienen commit. Adjuntar [HASH_ANTERIOR], [HASH_POSTERIOR], [SALIDA_GIT_DIFF_NUMSTAT] y [CAPTURA_O_PRUEBA_FUNCIONAL] cuando corresponda.

## 3. Problemas encontrados

- **Organización de vistas:** se había considerado una carpeta views, pero el proyecto utiliza los HTML juntos dentro de frontend. Fue necesario mantener esa estructura y revisar las referencias.
- **Rutas y menús:** algunos enlaces correspondían a módulos movidos o retirados. Se quitaron las referencias a distribución y la página independiente de semillas.
- **Formato de CSS y JS:** se pidió conservar saltos de línea, indentación y funciones sencillas para poder entender y revisar el código en clase.
- **Calendario:** un formulario de registro no cubría la necesidad de consultar fechas visualmente. Se separó la programación de etapas de la cuadrícula y se añadieron controles de mes y año.
- **Cambios del backend:** el pull modificó los modelos de inventario e insumos. Los formularios debían enviar los nombres de campos actuales y ya no los de la versión anterior.
- **Sincronización de Git:** antes de preparar una subida había cambios locales de varios módulos. Se respaldó el frontend y se ejecutó git pull --ff-only para traer el trabajo del equipo sin sobrescribirlos. El avance de 9c0c506 a 96a73b0 fue sin conflictos; no fue necesario resolver una mezcla manual y no se realizó push.
- **Validación de integración:** una prueba con API simulada permite revisar el formulario y su payload, pero no demuestra que la base de datos real guarde correctamente. Esa verificación continúa pendiente.

## 4. Avance funcional

| Interfaz o módulo | Estado del frontend | Pendiente o limitación |
|---|---|---|
| Inicio y login | Navegación y validación básica; acceso de demostración del trabajador. | Autenticación y permisos reales del servidor. |
| Crear cuenta | Pantalla con campos y botones. | Registro de usuarios; el botón no guarda una cuenta. |
| Catálogo y pedido | Selección por kilos, límites por stock, subtotales y total local. | Productos y pedidos conectados a la API real. |
| Pago y transferencia | Selección de método, validación de tarjeta y confirmación de pedido de prueba. | Cuenta bancaria y procesamiento real de pagos; no hay cobros. |
| Recolección | Calendario para seleccionar una fecha dentro del periodo permitido. | Disponibilidad y confirmación de recolección del servidor. |
| Historial | Tabla con producto, cantidad, fecha y tipo de entrega de pedidos locales. | Historial por usuario autenticado en la base de datos. |
| Rastreo | Sección accesible desde Entregar pedido, con botón sin acción. | Pantalla y estados reales de seguimiento. |
| Panel gestor | Alta, edición y eliminación de productos en almacenamiento local. | Sincronización con backend y permisos. |
| Cultivos, observaciones, riegos y terrenos | Formularios, listas y operaciones mediante fetch. | Pruebas completas con Java, relaciones y datos reales. |
| Inventario y semillas | Una misma interfaz con secciones para existencias y semillas; campos acordes con el backend nuevo. | Validación integral contra base de datos y revisión de reglas con el equipo. |
| Abonos y fertilizantes | Formularios adaptados al modelo Insumo y proveedor escrito por nombre. | Pruebas con servidor real y revisión de datos existentes. |
| Calendario | Cuadrícula mensual, año editable, etapas locales, completar/eliminar y regreso a cultivos. | Endpoint para eventos y asociación con cultivos reales. Hoy toma los productos locales como opciones. |
| Distribución | Retirada de las vistas y menús del frontend. | No se eliminó ni modificó su implementación del backend. |

En esta revisión pasaron pruebas automatizadas de navegador para calendario, cambio de año, programación de etapas, historial, tarjeta, transferencia, recolección y persistencia del pedido. Se revisó que los datos de tarjeta no se almacenen y que pago y recolección se adapten a una pantalla pequeña.

También pasaron pruebas de semillas, inventario, abonos y fertilizantes con respuestas de API simuladas. Las capturas y comprobantes deben adjuntarse en [CAPTURA_O_PRUEBA_FUNCIONAL]. No se afirma que esas pruebas hayan escrito en la base de datos real.

## 5. Uso de IA generativa

**Herramienta utilizada:** Codex. Modelo y configuración: [MODELO_Y_CONFIGURACIÓN].

**Actividad para la que se utilizó:** apoyo para organizar vistas, ajustar el calendario, integrar el pedido con el catálogo, revisar formularios operativos, conservar las rutas, sincronizar Git y redactar borradores de documentación.

**Código o contenido generado:** estructuras HTML, estilos CSS, funciones JavaScript, validaciones, llamadas fetch, ajustes de navegación y estos reportes. Se mantuvieron código sin frameworks y archivos legibles.

**Modificaciones realizadas por el equipo:** a partir de las indicaciones del estudiante se cambió el calendario de registro a una vista visual, se movió el pedido al catálogo, se separó el pago, se integraron semillas al inventario y se retiró distribución. La revisión y aceptación de los demás integrantes queda en [VALIDACIÓN_DEL_EQUIPO].

**Forma en que se verificó el resultado:** pruebas en un navegador aislado con datos locales de prueba, API simulada para los formularios ajustados, revisión de rutas y estado de Git. Faltan pruebas con el backend y la base de datos del equipo, además de adjuntar las evidencias.

Las consultas se organizaron como apoyos breves: “Ayúdame con el calendario y sus etapas”, “Revisa el catálogo y los menús”, “Acomoda las rutas sin views”, “Integra semillas en inventario” y “Revisa el pull sin hacer push”. Son resúmenes reconstruidos, no citas literales.

## 6. Participación individual

- **Integrante 1 — [NOMBRE]:** [ACTIVIDADES_REALES_Y_EVIDENCIAS_DEL_INTEGRANTE_1].
- **Integrante 2 — [NOMBRE]:** [ACTIVIDADES_REALES_Y_EVIDENCIAS_DEL_INTEGRANTE_2].
- **Integrante 3 — [NOMBRE]:** [ACTIVIDADES_REALES_DEL_DESARROLLADOR_3]. Confirmar las responsabilidades de las vistas del cliente y la revisión del flujo compartido.
- **Integrante 4 — [MI_NOMBRE]:** asumí el rol de Desarrollador 4 para trabajar el calendario y las vistas operativas del trabajador. También apoyé la organización y unificación con el trabajo del Desarrollador 3 en inicio/acceso, catálogo, pedido y pago. Solicité ajustes de estructura, navegación y documentación, y utilicé IA como apoyo para construir y revisar el código. Falta acordar con el equipo la evidencia final de cada contribución.

## 7. Próximas actividades

1. **Actividad 1:** probar cultivos, inventario, semillas y demás formularios con el backend Java y la base de datos real; comprobar altas, cambios, bajas y relaciones.
2. **Actividad 2:** integrar autenticación, roles y registro de usuarios; sustituir el acceso de demostración por validaciones del servidor.
3. **Actividad 3:** conectar el calendario a cultivos y eventos reales, conservando las fechas y etapas ya registradas que el equipo decida migrar.
4. **Actividad 4:** completar pedidos, historial por cliente, transferencia y rastreo según los acuerdos del equipo; verificar antes de incorporar pagos reales.
5. **Actividad 5:** revisar los cambios locales, agregar capturas y hashes a los reportes, preparar los commits correspondientes y realizar el push manual cuando el estudiante lo decida.

## Observaciones adicionales

Este avance distingue funciones locales, consumo de API y tareas pendientes. Los cambios del frontend y los reportes permanecen locales, sin publicar en GitHub en esta revisión. No se generó la bitácora final; estos archivos corresponden únicamente a los reportes solicitados.
