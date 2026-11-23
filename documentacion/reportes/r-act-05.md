# Reporte de Avance del Proyecto

**Equipo:** Gestión de Cultivos  
**Fecha:** 22/11/2026  
**Número de reporte:** 05  
**Repositorio GitHub:** https://github.com/Mario-Alcala/desarrollo-web  
**Periodo:** desde el commit de corte del reporte 3, [`9ed045e`](https://github.com/Mario-Alcala/desarrollo-web/commit/9ed045e07e568c1c38271352a75ef5ac44e2f0c1) (commit [`6dfe008`](https://github.com/Mario-Alcala/desarrollo-web/commit/6dfe0086d5dcfc8f3956ccbc9cd88c9d72ef5670) más la documentación de este reporte)

---

# 1. Actividades realizadas

Correcion de errores

--Pantallas del trabajador conectadas al API: Cultivos activos, Banco de semillas, Inventario, Observaciones (bitácora),
  Riego, Fertilizantes, Abono, Terreno, Distribución y Calendario usan Fetch (`js/api.js`). El trabajador ya no crea ni
  borra terrenos, cultivos o insumos: consulta y registra actividades, como pide la descripción.

--Sesión por usuario: El login guarda el id, nombre y rol; las pantallas del trabajador piden iniciar sesión y toman de
  ahí quién registra cada riego, observación, cosecha, movimiento o entrega.

--Calendario sincronizado: Las etapas (germinación, siembra, vegetación/riego, floración y cosecha) se guardan en la
  tabla `etapas_cultivo`; al completar una, el backend actualiza la etapa del cultivo. Antes vivían en `localStorage`.

--Validación de formularios compartida (`js/validacion.js`) y pruebas automáticas de la lógica.

--Backend: corrección del registro de riegos, estado de plagas y enfermedades, seguimientos, calendario de etapas y
  responsable de cada entrega.

--Pantallas del administrador y del trabajador hechos por Alessandro Roa, usuarios, registro de cosecha, inventario por movimientos,
  y consultas de terreno, abonos y fertilizantes.

--Reorganización de Kevin: frontend separado por rol (`empleado/`, `cliente/`, `administrador-agricultor/`), login y
  registro en el API, catálogo y cuentas de prueba en `init.sql`

--Integración de ramas: `kevin/avances-no-subidos`, `usuarios-admin` y `frontend-terrenos`, lista para Pull Request hacia `main`.

---

# 2. Evidencias de trabajo

|      Actividad      |      Integrante responsable      |      Enlace a commit      |
|---------------------|----------------------------------|---------------------------|


| Corrección de la base (`init.sql`) | Integrante 1 — Mario Javier Bonavides Alcalá | [`4b5cdbf`](https://github.com/Mario-Alcala/desarrollo-web/commit/4b5cdbf539d2dab9aaf41ea405689c3b414fe987) |

| Backend: riegos, seguimientos, calendario de etapas y responsable de entrega | Integrante 1 — Mario Javier Bonavides Alcalá | [`8b9aff8`](https://github.com/Mario-Alcala/desarrollo-web/commit/8b9aff8d1c09d7504764aba5dceb039e4286901c), [`fbb9e02`](https://github.com/Mario-Alcala/desarrollo-web/commit/fbb9e0240282400bb544c88b7e04b18b626d0b34) |

| Pantallas del trabajador con Fetch, validación, calendario y README (con IA) | Integrante 1 — Mario Javier Bonavides Alcalá | [`3291e67`](https://github.com/Mario-Alcala/desarrollo-web/commit/3291e677bbb27215e81fc2134c9e9df34d5eabc3), [`1d2fb24`](https://github.com/Mario-Alcala/desarrollo-web/commit/1d2fb24744a43c700c71fbba7f057a77aebe9f57) |

| Documentación del reporte 4 | Integrante 1 — Mario Javier Bonavides Alcalá | commit que agrega `documentacion/IAG/Release_04` en la rama `integracion` |


---

# 3. Problemas encontrados
|-------------------------|--------------------------|
|        Problema         |         Solución         |
|-------------------------|--------------------------|

| El registro de riegos siempre fallaba (error 500): la clase Java insertaba `id_terreno`, columna que el `init.sql` ya no tiene, y no enviaba `id_usuario`. | `Riego` guarda `idUsuario`; el terreno se obtiene por la parcela del cultivo. |

| Las pantallas no sabían quién había iniciado sesión: el login guardaba solo nombre y rol, y las pantallas necesitan el id. | El login guarda `usuarioSesion` con id, nombre y rol; `sesion.js` protege las páginas. |

| Las rutas `/abonos`, `/fertilizantes`, `/distribucion` y `/detalle-distribucion` leen tablas que no existen en `init.sql`. | Las pantallas del trabajador usan insumos, inventario y pedidos. Las rutas rotas siguen en el código: el equipo debe decidir si se quitan o se rehacen. |

| El calendario usaba productos de ejemplo guardados en el navegador. | Tabla y API `etapas-cultivo`; completar una etapa actualiza el cultivo. |

| Al fusionar `usuarios-admin`, Git decía "Automatic merge went well" pero escribía los cambios en las copias de `documentacion/IAG/` (las tomaba como el archivo renombrado). | Merge sin detección de renombres (`-s recursive -X no-renames`) y resolución manual de los 5 conflictos. |

---

# 4. Avance funcional

**Listo en código y probado sin la base real** (pruebas automáticas y navegador con API simulada; falta confirmar con MySQL):

--Pantallas del trabajador: Cultivos activos, Banco de semillas, Inventario, Observaciones/bitácora, Riego, Fertilizantes,
  Abono, Terreno, Distribución, Calendario y Programar etapas.
--Inicio y cierre de sesión con rol; registro de actividades a nombre del usuario.
--Validación de formularios (fechas, cantidades, existencias, orden de etapas).
--Calendario sincronizado con la etapa del cultivo.
--Pantalla de Usuarios del administrador.

**Pendiente:**

--Probar los endpoints nuevos y corregidos contra Spring Boot y MySQL (comandos en `documentacion/IAG/Release_04/Integrante_01/Uso_02/pruebas.md`).
--Cliente: catálogo, pago, historial y recolección siguen con `localStorage`; falta `POST /pedidos` en el backend.
--Base de datos frente a la descripción: tablas `productos` y `bodegas`; `id_producto` e `id_semilla` en cultivos;
  `area_trabajo` en usuarios; `estado_pago` en pedidos; dirección desglosada en la entrega.
--Pedir sesión en las pantallas del administrador.

---

# 5. Uso de IA generativa

**Herramienta utilizada:** Claude, modelo Claude Opus 5.5.

**Actividad para la que se utilizó:** analizar el proyecto, corregir el backend, completar las pantallas del trabajador con Fetch, validación y calendario.

**Código o contenido generado:** commits [`38bb99f`](https://github.com/Mario-Alcala/desarrollo-web/commit/38bb99f8fb2816c7227ae95e143a88bdfa7d702a), [`200e4bd`](https://github.com/Mario-Alcala/desarrollo-web/commit/200e4bde094062746d5a6963e6ae9e99e7d8a3f1), [`8b9aff8`](https://github.com/Mario-Alcala/desarrollo-web/commit/8b9aff8d1c09d7504764aba5dceb039e4286901c), [`fbb9e02`](https://github.com/Mario-Alcala/desarrollo-web/commit/fbb9e0240282400bb544c88b7e04b18b626d0b34), [`3291e67`](https://github.com/Mario-Alcala/desarrollo-web/commit/3291e677bbb27215e81fc2134c9e9df34d5eabc3), [`1d2fb24`](https://github.com/Mario-Alcala/desarrollo-web/commit/1d2fb24744a43c700c71fbba7f057a77aebe9f57) y los archivos de `documentacion/IAG/Release_04`. Detalle en [`r-ia-dev-s04.md`](../IAG/Release_04/Integrante_01/r-ia-dev-s04.md) y [`r-ia-doc-04.md`](../IAG/Release_04/r-ia-doc-04.md).

**Modificaciones realizadas por el equipo:** _(completar después de la revisión del Pull Request)_.

**Forma en que se verificó el resultado:** compilación del backend, prueba de las reglas del calendario en memoria,
  50 pruebas de lógica con `node --test`, 26 flujos en navegador sin errores de JavaScript contra una API simulada y
  capturas de pantalla. Falta la verificación con MySQL.

---

# 6. Participación individual

**Integrante 1 — Mario Javier Bonavides Alcalá:** corrección de `init.sql`; integración de las ramas; corrección del
  backend; pantallas del trabajador con Fetch, validación y calendario; documentación del reporte.


---

# 7. Próximas actividades

--Probar con Spring Boot y MySQL los endpoints de riegos, etapas, seguimientos y entregas, y guardar la salida de `curl`.
--Conectar el flujo del cliente con Fetch: crear `POST /pedidos` y reemplazar `localStorage` en catálogo, pago, historial y recolección.
--Acordar los cambios de base de datos que faltan frente a la descripción (`productos`, `bodegas`, `area_trabajo`, `estado_pago`, dirección de entrega).
--Quitar o rehacer las rutas `/abonos`, `/fertilizantes`, `/distribucion` y `/detalle-distribucion`.

---

## Observaciones adicionales

--Decisión técnica: la integración se entrega como rama `integracion` para revisarla en un Pull Request, no directamente en `main`.

--Base de datos: el `init.sql` agrega solo la columna `estado` de incidencias y la tabla `etapas_cultivo`; si la base se
  creó con una versión antigua (por ejemplo, `riegos` con `id_terreno`), hay que recrearla.

--Ramas:el contenido de `reparar-integracion-admin` (catálogo de familias y variedades) ya está en `main` por otros commits; la rama se puede borrar.

--Numeración: los archivos `documentacion/IAG/Integrante_0X/r-ia-dev-s04.md` son de la numeración anterior (el reporte
  que se renombró a 3). Los del reporte 4 están en `documentacion/IAG/Release_04`.
