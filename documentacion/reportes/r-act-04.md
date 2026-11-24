# Reporte de avance del proyecto

**Equipo:** Gestión de Cultivos  
**Fecha:** 22/11/2026  
**Número de reporte:** 04  
**Repositorio GitHub:** https://github.com/Mario-Alcala/desarrollo-web  
**Periodo:** cambios desarrollados para el Release 04, incluyendo las funciones incorporadas desde las ramas de los integrantes.

## 1. Actividades realizadas

Durante este release se conectaron y ajustaron funciones de administración, trabajador y cliente para que compartieran las mismas relaciones de datos y el mismo flujo operativo.

- Se ajustó el esquema y el backend para representar parcelas, variedades, cultivos y cosechas mediante sus identificadores. La cosecha se maneja como lote con kilos disponibles y maduración propia.
- Se conectó la administración de usuarios con una pantalla para consultar, registrar y editar cuentas internas.
- Se incorporó el registro de cosecha desde el módulo de cultivos del trabajador. Al guardar, se genera el lote que después aparece en Bodega.
- Se conectaron acciones del trabajador para consultar terrenos y parcelas, registrar riegos y observaciones, revisar insumos y realizar movimientos de inventario sobre existencias existentes.
- Se añadieron los permisos de pedidos por rol y se ajustaron la sesión y los menús para que las pantallas existentes muestren las acciones correspondientes.
- Se revisaron las pantallas de catálogo, pago e historial para que usen los datos del catálogo y las cosechas disponibles.
- Se ajustaron rutas, puertos y referencias entre frontend y API, y se revisaron contratos de JSON, clases Java y columnas SQL.
- Se integraron en una rama de trabajo los avances de la rama base de Kevin y las funciones de administración y empleado provenientes de las ramas de Roa y Ángel. La integración quedó en commits locales para su revisión.

## 2. Evidencias de trabajo

| Actividad | Integrante responsable | Evidencia en Git |
|---|---|---|
| Ajustes de SQL y backend para etapas, seguimientos de incidencias, riegos y entregas | Integrante 1 — Mario Javier Bonavides Alcalá | [4b5cdbf](https://github.com/Mario-Alcala/desarrollo-web/commit/4b5cdbf539d2dab9aaf41ea405689c3b414fe987), [8b9aff8](https://github.com/Mario-Alcala/desarrollo-web/commit/8b9aff8d1c09d7504764aba5dceb039e4286901c), [fbb9e02](https://github.com/Mario-Alcala/desarrollo-web/commit/fbb9e0240282400bb544c88b7e04b18b626d0b34) |
| Pantallas de trabajador con Fetch, validaciones y calendario conectado | Integrante 1 — Mario Javier Bonavides Alcalá | [3291e67](https://github.com/Mario-Alcala/desarrollo-web/commit/3291e677bbb27215e81fc2134c9e9df34d5eabc3), [1d2fb24](https://github.com/Mario-Alcala/desarrollo-web/commit/1d2fb24744a43c700c71fbba7f057a77aebe9f57) |
| Ajustes al esquema, controladores y repositorios; relación de catálogo, cosecha y pedido | Integrante 2 — Kevin Miguel García Montané | [087c022](https://github.com/Mario-Alcala/desarrollo-web/commit/087c022f7a8b5f910ee0f85af674d8747a108e88), [2c245eb](https://github.com/Mario-Alcala/desarrollo-web/commit/2c245eb226e6078ff579f382b1f478b58811fbd2) |
| Integración de la base del proyecto con las ramas de administración y empleado | Integrante 2 — Kevin Miguel García Montané | [c7884ee](https://github.com/Mario-Alcala/desarrollo-web/commit/c7884ee91a9a8b84e859eccb04e32db2b8089a02), [815d74d](https://github.com/Mario-Alcala/desarrollo-web/commit/815d74d36eda572244dd4373c943d1582b788bd2), [a6d6f27](https://github.com/Mario-Alcala/desarrollo-web/commit/a6d6f27) |
| Consulta de abonos/fertilizantes, movimientos de inventario, terrenos, cosecha y permisos de pedidos | Integrante 3 — Carlos Alessandro Roa Vázquez | [197e46e](https://github.com/Mario-Alcala/desarrollo-web/commit/197e46e59473c3fab26f75b485e274389ddede5d), [a124604](https://github.com/Mario-Alcala/desarrollo-web/commit/a124604de92eb6fdd4f3bc1e8940a895faaeeb0a), [00ca9ca](https://github.com/Mario-Alcala/desarrollo-web/commit/00ca9ca4e110778424c7e799a983b2e8727e6e81), [15829d9](https://github.com/Mario-Alcala/desarrollo-web/commit/15829d9386ef237c76830e1c424df90c95edd623), [2a16b0f](https://github.com/Mario-Alcala/desarrollo-web/commit/2a16b0fee308facd3983bf504b294afe6d306715), [9c1b831](https://github.com/Mario-Alcala/desarrollo-web/commit/9c1b83107fae488f4e28ddcf8e891da2613cfaba), [b73f746](https://github.com/Mario-Alcala/desarrollo-web/commit/b73f7465003eea306c4947ca00d8fc385298edc9) |
| API y pantallas de empleado y cliente relacionadas con parcelas, cultivos, cosecha y pedidos | Integrante 4 — Ángel de Jesús Nieto Hernández | [fe7819c](https://github.com/Mario-Alcala/desarrollo-web/commit/fe7819c), [337366c](https://github.com/Mario-Alcala/desarrollo-web/commit/337366c) |

## 3. Problemas encontrados y solución

| Problema | Solución aplicada |
|---|---|
| Los cambios de ramas usaban versiones y rutas diferentes para algunas pantallas. | Se compararon los archivos y se integraron las pantallas en la estructura por rol, corrigiendo las referencias a scripts, estilos y rutas. |
| El registro de riego y los datos de sesión no coincidían entre formulario, Java y SQL. | Se alinearon los campos y se usó la sesión del trabajador para identificar quién registra la actividad. El terreno se obtiene mediante las relaciones del cultivo y su parcela. |
| El catálogo mostraba productos sin separar la disponibilidad por cosecha. | Se relacionó variedad, cultivo y lote por IDs; los kilos y la maduración se consultan por lote. |
| El trabajador podía encontrar acciones que pertenecen a administración o formularios que duplicaban artículos. | Se cambiaron las vistas de consulta del trabajador y se dejaron las entradas/salidas como movimientos sobre lotes existentes. |
| Algunas llamadas del frontend apuntaban a rutas o puertos distintos de los que expone Spring. | Se ajustaron las direcciones y se revisaron los endpoints y CORS desde el navegador y con solicitudes HTTP. |
| El calendario dependía de datos locales y no compartía las etapas del cultivo. | Las etapas se enlazaron con el backend y completar una etapa actualiza el progreso del cultivo. |

## 4. Avance funcional

**Funciones desarrolladas durante el release**

- Administración de cuentas internas con roles.
- Registro de cosecha asociado a un cultivo existente y aparición del lote en Bodega.
- Consulta de terrenos y parcelas desde el módulo del trabajador.
- Registro de riegos y observaciones vinculadas al cultivo.
- Movimientos de inventario con validación de existencias.
- Abonos y fertilizantes como consulta de artículos administrados.
- Pedidos con acciones adaptadas al rol y sesión del usuario.
- Etapas fenológicas enlazadas al backend.
- Integración de catálogo y cosechas mediante relaciones por ID.

**Siguiente trabajo**

- Terminar de conectar el flujo completo de compra del cliente con catálogo, pago, historial y entrega.
- Ejecutar el flujo integrado completo con Spring Boot y MySQL usando el esquema final del equipo.
- Revisar con el equipo los cambios de esquema que afectan a productos, bodegas, pedidos y dirección de entrega.
- Incorporar la rama de integración mediante revisión del equipo antes de llevarla a la rama principal.

## 5. Uso de IA generativa

- **Mario Javier Bonavides Alcalá:** Claude para revisión de ramas, ajustes de backend y desarrollo de las pantallas del trabajador, validaciones y calendario.
- **Kevin Miguel García Montané:** Codex para adaptar código y contratos SQL/Java, revisar el flujo de catálogo y pedidos, y apoyar la integración de ramas.
- **Carlos Alessandro Roa Vázquez:** Claude para las pantallas y lógica de cosecha, inventario, terrenos, cultivos y pedidos por rol.
- **Ángel de Jesús Nieto Hernández:** ChatGPT para revisar relaciones de datos y proponer ajustes de inventario, catálogo, usuarios y parcelas.

Los prompts, respuestas y reflexiones individuales se encuentran en las carpetas de cada integrante dentro de este IAG.

## 6. Participación individual

- **Integrante 1 — Mario Javier Bonavides Alcalá:** trabajó en correcciones del esquema y backend, registro de etapas y seguimientos, riegos y entregas; conectó pantallas del trabajador con el API y ajustó validaciones y calendario.
- **Integrante 2 — Kevin Miguel García Montané:** ajustó el backend y los contratos con SQL, enlazó catálogo, cosechas y pedidos, mantuvo la rama base del proyecto e integró los cambios de administración y empleado en una rama de trabajo.
- **Integrante 3 — Carlos Alessandro Roa Vázquez:** desarrolló las pantallas de cosecha, consulta de terrenos y cultivos, movimientos de inventario, consulta de abonos/fertilizantes y permisos de pedidos por rol.
- **Integrante 4 — Ángel de Jesús Nieto Hernández:** trabajó en las funciones de backend y frontend para empleado y cliente, incluyendo relaciones de parcelas, cultivos, cosechas y pedidos.

## 7. Próximas actividades

- Conectar y recorrer de principio a fin la compra del cliente, desde la selección de lotes hasta el historial y la entrega.
- Probar endpoints y persistencia con la base MySQL acordada.
- Revisar permisos por rol en el servidor además de ocultar acciones en la interfaz.
- Revisar la rama de integración con los compañeros y después preparar su incorporación a la rama principal.
