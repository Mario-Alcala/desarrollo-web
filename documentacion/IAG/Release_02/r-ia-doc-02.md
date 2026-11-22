# Reporte de consultas con IA — Reporte 2

**Proyecto:** Gestión de Cultivos  
**Periodo:** 8 al 16 de noviembre de 2026  
**Herramienta:** ChatGPT en Codex  
**Repositorio:** https://github.com/Mario-Alcala/desarrollo-web

Este documento resume dudas para entender el código; no incluye solicitudes cuyo objetivo principal fue generar código. Las preguntas son resúmenes de la conversación, salvo el ejemplo del repository, que se marca como reconstruido.

| Integrante | Prompt o duda resumida | Respuesta resumida |
|---|---|---|
| Kevin — Integrante 2 | ¿Qué significa @PathVariable y de dónde obtiene el ID? | Spring toma el valor de una parte de la URL, por ejemplo /api/proveedores/5. |
| Kevin — Integrante 2 | ¿Para qué sirve @RequestBody? | Lee el JSON del cuerpo de la solicitud y lo convierte en un objeto Java. |
| Kevin — Integrante 2 | ¿Por qué algunos métodos regresan un objeto y otros usan void? | Se regresa un valor cuando el cliente necesita recibir datos; void permite responder con un estado HTTP sin cuerpo. |
| Kevin — Integrante 2 | ¿Qué diferencia hay entre throw y una excepción? | La excepción representa el error; throw es la instrucción que la lanza. |
| Kevin — Integrante 2 | Prompt de ejemplo reconstruido: “Muéstrame un método con JdbcClient que busque proveedores por nombre y explícame cómo llamarlo desde el service y el controller.” | La consulta SQL pertenece al repository; el service la invoca y el controller expone la ruta. El valor de búsqueda debe enviarse como parámetro. |

## Participación del equipo

En Git se observan cambios de Mario (Integrante 1) y Kevin (Integrante 2) durante el periodo. Los primeros commits identificados de Ángel (Integrante 4) son del 18 de noviembre; los de Alessandro Roa (Integrante 3), del 19 de noviembre. Eso confirma quién hizo commits en el corte, pero no confirma si los demás hicieron consultas de IA fuera de Git.
