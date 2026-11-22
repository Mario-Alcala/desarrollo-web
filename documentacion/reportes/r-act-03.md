# Reporte de actividades — Release 3

**Equipo:** Gestión de Cultivos  
**Fecha:** 22/11/2026  
**Número de reporte:** 3  
**Repositorio:** https://github.com/Mario-Alcala/desarrollo-web  
**Commit de corte:** `9ed045e07e568c1c38271352a75ef5ac44e2f0c1`

## 1. Actividades realizadas

Durante este periodo se avanzó en el backend agrícola, las pantallas administrativas y operativas, el calendario y el flujo de compra del cliente. También se ordenaron las evidencias de uso de IA para que cada integrante tenga un registro individual y el equipo conserve un reporte general.

- Se ampliaron las operaciones del API para proveedores, inventario, riego, cosechas, abonos, fertilizantes, movimientos, usuarios, observaciones e incidencias. Se agregaron modelos para familias y variedades del catálogo.
- Se crearon vistas administrativas de terrenos y detalle, catálogo, proveedores, bodega y pedidos.
- Se trabajaron el calendario de etapas, las pantallas de acceso y registro, la navegación del trabajador y las vistas del cliente para catálogo, pedido, pago, recolección e historial.
- Se revisaron errores de inicio del servidor y conflictos de integración de Git. El servidor no pudo iniciar cuando el puerto 8081 ya estaba ocupado.
- Se documentaron las sesiones de código y las consultas de IA por integrante, indicando límites cuando una pantalla usa datos de ejemplo o todavía no confirma persistencia en MySQL.

## 2. Evidencias de trabajo

| Integrante | Actividad comprobada | Commits de referencia |
|---|---|---|
| **Integrante 1 — Mario Javier Bonavides Alcalá** | Correcciones de estilos y vistas de cultivos/gestor. El log confirma cambios, pero no se recibió evidencia que permita afirmar si utilizó IA. | [`1d04a98`](https://github.com/Mario-Alcala/desarrollo-web/commit/1d04a98ceaace9e7fda4be10364a261cc8ab9d48) |
| **Integrante 2 — Kevin Miguel García Montané** | Correcciones del API y modelos para familias, variedades, solicitud de login y pronóstico diario. | [`96a73b0`](https://github.com/Mario-Alcala/desarrollo-web/commit/96a73b0ddb7b970d8b2b2879d8cd2e59c5537c8b), [`a25e15f`](https://github.com/Mario-Alcala/desarrollo-web/commit/a25e15f55800b8f7a41ac23e246bc46bc0f7c33e) |
| **Integrante 3 — Carlos Alessandro Roa Vázquez** | Pantallas administrativas de terrenos, catálogo, proveedores, bodega y pedidos. | [`f46b1aa`](https://github.com/Mario-Alcala/desarrollo-web/commit/f46b1aa236b1f2d3624f8e1b4097c04bf535263f), [`6ee5af5`](https://github.com/Mario-Alcala/desarrollo-web/commit/6ee5af592508a864804e2088dc16990401501ff4), [`51821ed`](https://github.com/Mario-Alcala/desarrollo-web/commit/51821ed3c1d9e3b0fd98a5847fe64cacbe4f76df), [`8153263`](https://github.com/Mario-Alcala/desarrollo-web/commit/81532633788aa7ae03e2d4c1b1e07e636756df96), [`5b95117`](https://github.com/Mario-Alcala/desarrollo-web/commit/5b951172015a3f6ff4659908b2902733189a99dd) |
| **Integrante 4 — Ángel de Jesús Nieto Hernández** | Calendario y etapas, acceso/registro, catálogo y pedido, pago/recolección/historial, además de vistas de operación e inventario. | [`1beb12c`](https://github.com/Mario-Alcala/desarrollo-web/commit/1beb12cfb7743310fb40f8056fd5d09e85b24a7d), [`e2db6b2`](https://github.com/Mario-Alcala/desarrollo-web/commit/e2db6b2e944c05bdd66079374bc0c3bc6752375f), [`9c0c506`](https://github.com/Mario-Alcala/desarrollo-web/commit/9c0c50644230a436261631792ad9bf0964b79933), [`d2c9ce6`](https://github.com/Mario-Alcala/desarrollo-web/commit/d2c9ce6e85b05b3466b87e78d6dd7a759b6109ec), [`1e425ea`](https://github.com/Mario-Alcala/desarrollo-web/commit/1e425ea1100a4d6b20221ffb199bd150323fb7ad) |

El merge `dfc2d21` registró conflictos en `frontend/inventario.html`, `frontend/js/inventario.js`, `frontend/js/proveedores.js` y `frontend/terrenos.html`. El commit final `9ed045e` también contiene archivos de registro de error de JVM; no se describen como una función del sistema. El commit `a25e15f` incluye clases Java del catálogo y modelos, aunque su mensaje menciona correcciones de frontend.

## 3. Problemas encontrados

- El servidor Spring Boot no inició cuando otro proceso ya ocupaba el puerto 8081.
- Git rechazó un push porque la rama local y la remota tenían cambios diferentes; después se resolvieron conflictos en cuatro archivos de frontend.
- En el reporte de Ángel, algunos hashes indicados para catálogo/pedido correspondían al calendario. En el registro individual se aclara qué comparaciones son rangos amplios filtrados por archivos y no atribuciones exactas de un único commit.
- Algunas vistas usan datos de demostración. Una pantalla visible no prueba por sí misma que sus datos ya se guarden en el API o en MySQL.

## 4. Avance funcional

Se avanzó en los módulos y vistas indicados en la tabla de evidencias. El nivel de integración debe distinguirse por pantalla: algunas consultas y formularios dependen de datos locales o simulados, y las operaciones que requieren persistencia deben confirmarse contra la base de datos antes de considerarlas terminadas de extremo a extremo.

## 5. Uso de IA generativa

El detalle de consultas explicativas está en [`r-ia-doc-03.md`](../IAG/Release_03/r-ia-doc-03.md). Las sesiones de generación/modificación de código y declaraciones individuales están en [`documentacion/IAG/Release_03`](../IAG/Release_03/README.md). No se atribuye uso de IA a Mario sin una declaración o evidencia suya; su contribución Git sí queda registrada.

## 6. Participación individual

Durante este release, **Mario Javier Bonavides Alcalá** realizó correcciones en las vistas de cultivos y gestor. **Kevin Miguel García Montané** trabajó en el API y agregó las clases relacionadas con familias y variedades del catálogo. **Carlos Alessandro Roa Vázquez** desarrolló las pantallas administrativas de terrenos, catálogo, proveedores, bodega y pedidos. **Ángel de Jesús Nieto Hernández** trabajó en el calendario, las pantallas de acceso y registro, el flujo de compra del cliente y las vistas del trabajador e inventario.

## 7. Próximas actividades

- Verificar los formularios principales con el API y MySQL, documentando qué operaciones persisten realmente.
- Revisar las rutas del catálogo, los pedidos, inventario y clima desde la interfaz hasta el backend.
- Confirmar con cada integrante las declaraciones personales de IA y completar únicamente lo que cada persona valide.
