# Reporte de IA Desarrollo en el Proyecto

**Fecha:** 22/11/2026  
**Número de reporte:** 05  
**Integrante:** Mario Javier Bonavides Alcalá (Integrante 1)  
**Repositorio:** https://github.com/Mario-Alcala/desarrollo-web (rama `integracion`)

---

# 1. Breve descripción de uso

Usé Claude para revisar el estado del proyecto contra la descripción (roles, interfaces y tablas), integrar en una sola
rama el trabajo que estaba repartido en otras ramas y completar mi parte del Release 4: las pantallas interactivas del
Trabajador (Cultivos activos, Banco de semillas, Inventario, Observaciones, Riego/fertilizantes/abono, Terreno y
Distribución), el uso de Fetch hacia el API REST, la validación de formularios y la sincronización del calendario de
etapas (germinación, siembra, floración y cosecha).

Fue una sola sesión con un solo mensaje. Se separa en tres usos según los commits que produjo:

| Uso | Tema | Commits |
|-----|------|---------|
| [Uso 01](#uso-01--integración-de-ramas) | Integración de `kevin/avances-no-subidos`, `usuarios-admin` y `frontend-terrenos` | [`38bb99f`](https://github.com/Mario-Alcala/desarrollo-web/commit/38bb99f8fb2816c7227ae95e143a88bdfa7d702a), [`200e4bd`](https://github.com/Mario-Alcala/desarrollo-web/commit/200e4bde094062746d5a6963e6ae9e99e7d8a3f1) |

| [Uso 02](#uso-02--correcciones-y-ampliación-del-backend) | Correcciones y ampliación del backend que necesitaban las pantallas | [`8b9aff8`](https://github.com/Mario-Alcala/desarrollo-web/commit/8b9aff8d1c09d7504764aba5dceb039e4286901c), [`fbb9e02`](https://github.com/Mario-Alcala/desarrollo-web/commit/fbb9e0240282400bb544c88b7e04b18b626d0b34) |

| [Uso 03](#uso-03--pantallas-del-trabajador-fetch-validación-y-calendario) | Pantallas del trabajador, Fetch, validación, calendario y README | [`3291e67`](https://github.com/Mario-Alcala/desarrollo-web/commit/3291e677bbb27215e81fc2134c9e9df34d5eabc3), [`1d2fb24`](https://github.com/Mario-Alcala/desarrollo-web/commit/1d2fb24744a43c700c71fbba7f057a77aebe9f57) |

---

# 2. Evidencias de uso

## Uso 01 — Integración de ramas

|  Evidencia |         Formato         |
|------------|-------------------------|
| Herramienta | Claude |
| Modelo/temperatura | Claude Opus 5.5 |
| Prompt original | Despues analiza y verifica que pueda estar como lo siguiente descripcion breve, dame la correccion de los errores que encontraste y dame lo que falte |
| Respuesta de IA | [Uso_01/respuesta.md](Uso_01/respuesta.md), sección "Cómo integrar todo en main" |
| Código anterior | Commit [`6dfe008`](https://github.com/Mario-Alcala/desarrollo-web/commit/6dfe0086d5dcfc8f3956ccbc9cd88c9d72ef5670) (`kevin/avances-no-subidos`) y [`9c1b831`](https://github.com/Mario-Alcala/desarrollo-web/commit/9c1b83107fae488f4e28ddcf8e891da2613cfaba) (`usuarios-admin`) |

| Código posterior | Commit [`200e4bd`](https://github.com/Mario-Alcala/desarrollo-web/commit/200e4bde094062746d5a6963e6ae9e99e7d8a3f1) (después de los merges [`38bb99f`](https://github.com/Mario-Alcala/desarrollo-web/commit/38bb99f8fb2816c7227ae95e143a88bdfa7d702a) y [`200e4bd`](https://github.com/Mario-Alcala/desarrollo-web/commit/200e4bde094062746d5a6963e6ae9e99e7d8a3f1)) |

| Diferencias entre versiones | `git diff --numstat 6dfe008 200e4bd` (salida abajo); diff completo en [Uso_01/cambios.diff](Uso_01/cambios.diff) |

| Prueba de funcionamiento | [Uso_01/pruebas.md](Uso_01/pruebas.md): ramas contenidas, documentación sin cambios y 38/38 pruebas de Alessandro |

| Código de uso | Revisión / Depuración (resolución de conflictos de merge) |
| Reflexión del estudiante | [Uso_01/reflexion.md](Uso_01/reflexion.md) |

```text
$ git diff --numstat 6dfe008 200e4bd
95	0	frontend/administrador-agricultor/usuarios-admin.html
42	0	frontend/css/usuarios.css
5	38	frontend/empleado/abonos.html
109	43	frontend/empleado/cultivos.html
5	29	frontend/empleado/fertilizantes.html
50	28	frontend/empleado/inventario.html
27	55	frontend/empleado/terrenos.html
74	0	frontend/js/consulta-insumos.js
133	0	frontend/js/consulta-terrenos.js
246	0	frontend/js/cosecha-registro.js
248	0	frontend/js/cultivos-actividades.js
224	0	frontend/js/inventario-movimientos.js
22	0	frontend/js/sesion.js
1	0	frontend/js/sidebar.js
212	0	frontend/js/usuarios-admin.js
150	0	frontend/pruebas/cosecha.test.js
248	0	frontend/pruebas/usuarios.test.js
```

La mayor parte de estas líneas es código de Alessandro que ya existía en `usuarios-admin`. Lo que se hizo fue resolver
los conflictos: mover sus cinco pantallas a `frontend/empleado/` y `usuarios-admin.html` a `administrador-agricultor/`
cambiando las rutas `css/`, `js/` e `index.html` por `../`, y conservar en `cultivos.html` el panel de clima de Kevin.

## Uso 02 — Correcciones y ampliación del backend

| Evidencia | Formato |
|------------|------------------------|
| Herramienta | Claude (claude.ai), con acceso a archivos y terminal |
| Modelo/temperatura | Claude Opus 5.5 / no visible en claude.ai |
| Prompt original | [Uso_02/prompt.md](Uso_02/prompt.md) (mismo mensaje que el Uso 01) |
| Respuesta de IA | [Uso_02/respuesta.md](Uso_02/respuesta.md) |

| Código anterior | Commit [`200e4bd`](https://github.com/Mario-Alcala/desarrollo-web/commit/200e4bde094062746d5a6963e6ae9e99e7d8a3f1) |

| Código posterior | Commit [`fbb9e02`](https://github.com/Mario-Alcala/desarrollo-web/commit/fbb9e0240282400bb544c88b7e04b18b626d0b34) (incluye [`8b9aff8`](https://github.com/Mario-Alcala/desarrollo-web/commit/8b9aff8d1c09d7504764aba5dceb039e4286901c)) |
| Diferencias entre versiones | `git diff --numstat 200e4bd fbb9e02` (salida abajo); diff completo en [Uso_02/cambios.diff](Uso_02/cambios.diff) |
| Prueba de funcionamiento | [Uso_02/pruebas.md](Uso_02/pruebas.md): compilación de 100 clases sin errores y 22/22 reglas del calendario; los `curl` contra MySQL quedan pendientes |
| Código de uso | Depuración / Modificación / Generación / Pruebas |
| Reflexión del estudiante | [Uso_02/reflexion.md](Uso_02/reflexion.md) |

```text
$ git diff --numstat 200e4bd fbb9e02
47	0	backend/database/init.sql
70	0	backend/src/main/java/com/cultivos/gestioncultivos_backend/controller/EtapaCultivoController.java
12	1	backend/src/main/java/com/cultivos/gestioncultivos_backend/controller/PedidoController.java
44	0	backend/src/main/java/com/cultivos/gestioncultivos_backend/controller/SeguimientoIncidenciaController.java
46	0	backend/src/main/java/com/cultivos/gestioncultivos_backend/model/EtapaCultivo.java
11	1	backend/src/main/java/com/cultivos/gestioncultivos_backend/model/IncidenciaCultivo.java
7	0	backend/src/main/java/com/cultivos/gestioncultivos_backend/model/Pedido.java
6	5	backend/src/main/java/com/cultivos/gestioncultivos_backend/model/Riego.java
37	0	backend/src/main/java/com/cultivos/gestioncultivos_backend/model/SeguimientoIncidencia.java
109	0	backend/src/main/java/com/cultivos/gestioncultivos_backend/repository/EtapaCultivoRepository.java
13	3	backend/src/main/java/com/cultivos/gestioncultivos_backend/repository/IncidenciaCultivoRepository.java
11	5	backend/src/main/java/com/cultivos/gestioncultivos_backend/repository/PedidoRepository.java
5	5	backend/src/main/java/com/cultivos/gestioncultivos_backend/repository/RiegoRepository.java
57	0	backend/src/main/java/com/cultivos/gestioncultivos_backend/repository/SeguimientoIncidenciaRepository.java
4	0	backend/src/main/java/com/cultivos/gestioncultivos_backend/service/CosechaService.java
191	0	backend/src/main/java/com/cultivos/gestioncultivos_backend/service/EtapaCultivoService.java
16	1	backend/src/main/java/com/cultivos/gestioncultivos_backend/service/IncidenciaCultivoService.java
7	1	backend/src/main/java/com/cultivos/gestioncultivos_backend/service/PedidoService.java
2	2	backend/src/main/java/com/cultivos/gestioncultivos_backend/service/RiegoService.java
83	0	backend/src/main/java/com/cultivos/gestioncultivos_backend/service/SeguimientoIncidenciaService.java
1	1	frontend/js/terreno-detalle.js
```

## Uso 03 — Pantallas del trabajador, Fetch, validación y calendario

| Evidencia | Formato |
|------------|------------------------|
| Herramienta | Claude  |
| Modelo/temperatura | Claude Opus 5.5  |
| Prompt original | [Uso_03/prompt.md](Uso_03/prompt.md) (mismo mensaje que el Uso 01) |

| Respuesta de IA | [Uso_03/respuesta.md](Uso_03/respuesta.md) |

| Código anterior | Commit [`fbb9e02`](https://github.com/Mario-Alcala/desarrollo-web/commit/fbb9e0240282400bb544c88b7e04b18b626d0b34) |
| Código posterior | Commit [`1d2fb24`](https://github.com/Mario-Alcala/desarrollo-web/commit/1d2fb24744a43c700c71fbba7f057a77aebe9f57) (incluye [`3291e67`](https://github.com/Mario-Alcala/desarrollo-web/commit/3291e677bbb27215e81fc2134c9e9df34d5eabc3)) |
| Diferencias entre versiones | `git diff --numstat fbb9e02 1d2fb24` (salida abajo); diff completo en [Uso_03/cambios.diff](Uso_03/cambios.diff) |
| Prueba de funcionamiento | [Uso_03/pruebas.md](Uso_03/pruebas.md): 50/50 pruebas de lógica, 26/26 flujos en navegador contra una API simulada sin errores de JavaScript, y capturas ([calendario](Uso_03/calendario.png), [distribución](Uso_03/distribucion.png), [bitácora](Uso_03/observaciones.png)) |
| Código de uso | Generación / Modificación / Diseño / Pruebas / Documentación |
| Reflexión del estudiante | [Uso_03/reflexion.md](Uso_03/reflexion.md) |

```text
$ git diff --numstat fbb9e02 1d2fb24
33	1	README.md
155	0	frontend/css/trabajador.css
81	13	frontend/empleado/abonos.html
55	11	frontend/empleado/calendario.html
8	2	frontend/empleado/cultivos.html
67	0	frontend/empleado/distribucion.html
104	28	frontend/empleado/etapas.html
81	13	frontend/empleado/fertilizantes.html
8	2	frontend/empleado/inventario.html
141	40	frontend/empleado/observaciones.html
64	39	frontend/empleado/riegos.html
131	0	frontend/empleado/semillas.html
75	68	frontend/empleado/terrenos.html
11	0	frontend/js/ap.js
201	0	frontend/js/aplicacion-insumos.js
305	0	frontend/js/bitacora.js
211	0	frontend/js/calendario-logica.js
301	237	frontend/js/calendario.js
0	74	frontend/js/consulta-insumos.js
16	7	frontend/js/cultivos-actividades.js
128	0	frontend/js/datos-campo.js
284	0	frontend/js/distribucion.js
221	0	frontend/js/etapas.js
0	26	frontend/js/inventario.js
0	190	frontend/js/operaciones.js
0	46	frontend/js/proveedores.js
135	0	frontend/js/riegos-trabajador.js
225	0	frontend/js/semillas.js
49	4	frontend/js/sesion.js
167	0	frontend/js/validacion.js
73	0	frontend/pruebas/calendario.test.js
62	0	frontend/pruebas/validacion.test.js
```

> El prompt y la respuesta están copiados en los archivos enlazados de cada carpeta `Uso_##`.

---

## Observaciones adicionales

- **Límite de las pruebas:**  El backend se compiló contra interfaces mínimas de Spring y las pantallas se probaron contra una API simulada que
  responde con el mismo JSON que los controladores. Falta correr los `curl` de [Uso_02/pruebas.md](Uso_02/pruebas.md) con
  Spring Boot y MySQL, y pegar ahí la salida.

- **Base de datos:** quien tenga la base creada con un `init.sql` anterior debe recrearla
  (`sudo mysql -e "DROP DATABASE gestion_cultivos;" && sudo mysql < database/init.sql`).

- **Hashes:** los enlaces funcionan cuando la rama `integracion` se sube a GitHub tal como viene en `integracion.bundle`.
  Si la integración se rehace a mano, los hashes cambian; entonces hay que volver a generar los `numstat` con
  `git diff --numstat <anterior> <posterior>`.

- **Revisión propia:** _Revision de lo generado por la IA que tuviera la estructura e implementacion correcta, correccion de la estrutura_.

- La documentación de este reporte también se hizo con apoyo de la IA; esa consulta está registrada en
  [`../r-ia-doc-04.md`](../r-ia-doc-04.md).
