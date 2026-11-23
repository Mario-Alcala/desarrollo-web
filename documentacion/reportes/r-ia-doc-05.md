# Reporte de Uso Documental en el Proyecto

**Fecha:** 22/11/2026  
**Número de reporte:** 05  
**Integrante:** Mario Javier Bonavides Alcalá (Integrante 1)

---

# 1. Breve descripción de uso

Consulté a Claude para entender en qué estado estaba el proyecto frente a la descripción (roles, interfaces y tablas),
para saber cómo integrar en `main` el trabajo que un compañero dejó en otra rama sin perder cambios. En este registro van solo las consultas de explicación y documentación; lo que la IA generó o modificó en el código está en [`Integrante_01/r-ia-dev-s04.md`](Integrante_01/r-ia-dev-s04.md).

---

# 2. Evidencias de uso

|    Fecha    |        Herramienta       |    Enlace a prompt    |    Enlace a respuesta    |
|-------------|--------------------------|-----------------------|--------------------------|
|  22/11/2026 | Claude (Claude Opus 5.5) | [Estado del proyecto y comparación con la descripción](Integrante_01/Uso_01/prompt.md) | [Secciones "Cómo va el proyecto" y "Lo que sigue pendiente"](Integrante_01/Uso_01/respuesta.md) |

|  22/11/2026 | Claude (Claude Opus 5.5) | [Cómo integrar en `main` la rama de un colaborador](Integrante_01/Uso_01/prompt.md) | [Sección "Cómo integrar todo en main"](Integrante_01/Uso_01/respuesta.md) |

| 22/11/2026 | Claude (Claude Opus 5.5) | [Documentar el reporte 4 en los formatos del curso](Integrante_01/Consulta_01/prompt.md) | [Resumen de la respuesta y archivos generados](Integrante_01/Consulta_01/respuesta.md) |

> Las dos primeras consultas forman parte del mismo mensaje que los usos de código; el prompt está transcrito una sola
> vez en `Uso_01/prompt.md`.

## 2.1 Resumen de lo que aclaró cada consulta

**Estado del proyecto.** El backend estaba bien encaminado, pero había diferencias entre el código, el `init.sql` y la
descripción: el registro de riegos fallaba porque la clase insertaba una columna que ya no existe; las rutas de abonos,
fertilizantes y distribución leían tablas inexistentes; el login no guardaba el id del usuario; el calendario usaba datos
de ejemplo en el navegador; y faltan elementos de la descripción como las tablas `productos` y `bodegas`, `area_trabajo`
en usuarios, `estado_pago` en pedidos y la dirección desglosada en la entrega.

**Integración de ramas.** Se explicó qué rama tenía qué cambios, que mi `main` local iba atrasado y que tenía un commit sin
subir. También por qué un merge normal de `usuarios-admin` decía "Automatic merge went well" pero escribía los cambios en
las copias de `documentacion/IAG/`: Git detectaba esas copias como el archivo renombrado. La solución es fusionar sin
detección de renombres (`-s recursive -X no-renames`), mover cada pantalla a `frontend/empleado/` corrigiendo rutas,
revisar `git status` y subir el resultado como Pull Request para que lo revise el equipo.

**Documentación.** Cómo repartir lo hecho entre los tres formatos: el código generado va en el reporte de IA desarrollo con
`numstat`, diff y pruebas; las explicaciones en este registro; y las actividades del equipo en el reporte de avance.

---

## Observaciones adicionales

- La herramienta no muestra la temperatura del modelo.
- Si el curso pide el enlace a la conversación, se puede agregar el enlace compartido de claude.ai en la columna de
  respuesta; aquí se enlazan las transcripciones guardadas en el repositorio.
- La respuesta de la consulta de documentación se registra como resumen, porque su resultado son los archivos generados.
