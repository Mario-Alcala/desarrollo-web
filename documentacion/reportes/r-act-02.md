# Reporte de actividades

**Equipo:** Gestión de Cultivos — Mario (Integrante 1), Kevin (Integrante 2), Alessandro Roa (Integrante 3) y Ángel de Jesús (Integrante 4)  
**Fecha:** 16/11/2026  
**Número de reporte:** 2  
**Repositorio GitHub:** https://github.com/Mario-Alcala/desarrollo-web

## 1. Actividades realizadas

Durante este periodo se desarrolló la primera versión funcional de la API y se completaron varios módulos del backend. Se organizaron modelos, repositorios, servicios y controladores para consultar y administrar los datos desde las rutas REST.

También se amplió la base de datos para incluir proveedores, inventario, riego, cosechas, abonos, fertilizantes, movimientos, distribución, usuarios, observaciones e incidencias de cultivo. Se agregó la consulta del clima mediante Open-Meteo usando coordenadas de los terrenos.

## 2. Evidencias de trabajo

| Actividad | Integrante responsable | Commits |
|---|---|---|
| Estructura, base de datos inicial y CRUD para cultivos, semillas, terrenos y herramientas | Mario — Integrante 1 | 4fe111c, 48eaa0b, c2b097b, 6facd14, 7948bbc, 39b0f27, 97c0c02 |
| Proveedores, inventario, riego, cosechas, abonos, fertilizantes, distribución, usuarios, observaciones, incidencias y clima | Kevin — Integrante 2 | 71c30d3, 48dd149, af6ee64, 250831d, fbdfea3 |
| Sin cambios de código identificados dentro del corte revisado | Alessandro Roa — Integrante 3 | No hay commits en el periodo |
| Sin cambios de código identificados dentro del corte revisado | Ángel de Jesús — Integrante 4 | No hay commits en el periodo |

Los enlaces de comparación y el desglose por archivo se encuentran en ../IAG/Release_02/Integrante_01/Uso_01/ y ../IAG/Release_02/Integrante_02/Uso_01/.

## 3. Problemas encontrados

- El Maven Wrapper tardó en descargar Maven; se continuó usando la instalación local de Maven en WSL.
- Spring no encontraba algunos repositories porque no estaban registrados como componentes. Se corrigieron las anotaciones de Spring.
- La aplicación no podía conectarse a MySQL cuando el servicio no estaba instalado o iniciado. La validación completa con la base quedó limitada hasta configurar MySQL y ejecutar el script SQL.

## 4. Avance funcional

Quedó una versión inicial de la API con CRUD para cultivos, semillas, terrenos y herramientas. Se agregaron los módulos backend descritos en la tabla de actividades, junto con la integración para consultar clima por coordenadas. Los logs prueban cambios de código, pero no demuestran que todos los endpoints hayan sido validados de extremo a extremo con MySQL.

## 5. Uso de IA generativa

Kevin (Integrante 2) usó ChatGPT en Codex para resolver dudas de Spring/Java, recibir propuestas de código para las capas del backend y orientar la integración meteorológica.
Mario (Integrante 1) No se registro en este release, pero si tiene cambios en otros
Carlos (Integrante 3) No se registro en este release, pero si tiene cambios en posteriores
Angel(Integrante 4) No se registro en este release, peor si tiene cambios posteriores

## 6. Participación individual

- **Mario (Integrante 1):** estructura inicial, CRUD de cultivos, semillas, terrenos y herramientas, repositorios, servicios, controladores y cambios iniciales a SQL.
- **Kevin (Integrante 2):** módulos backend asignados y consulta del clima con coordenadas de terrenos.
- **Alessandro Roa (Integrante 3):** no se identificaron commits suyos dentro de este periodo.
- **Ángel de Jesús (Integrante 4):** no se identificaron commits suyos dentro de este periodo.

La falta de commits no permite afirmar que no hayan realizado consultas o trabajo fuera del repositorio.

## 7. Próximas actividades

Continuar con la integración del frontend a los endpoints, iniciar MySQL en el entorno de desarrollo y verificar las operaciones contra la base de datos.

