# Registro de generación de código con IA — Reporte 3

**Integrante:** Kevin Miguel García Montané (Integrante 2)  
**Herramienta:** ChatGPT dentro de Codex  
**Modelo/temperatura:** no aparece en la evidencia disponible.  
**Periodo:** 19–22/11/2026

## Uso 01 — Correcciones del API

**Prompt original (resumen fiel):** revisar el backend del proyecto y ayudar a corregir las operaciones y clases Java que se estaban preparando, manteniendo la estructura de Controller, Service, Repository y Model y explicando los errores de ejecución.

**Respuesta de IA:** apoyo para revisar errores de compilación/inyección de dependencias y corregir las clases del API. Las recomendaciones se adaptaron al código existente. El historial de cambios asociado es `9c0c506 -> 96a73b0`; el commit de Kevin registra la corrección del API.

**Código anterior/posterior:** comparar los archivos backend en esos dos commits.  
**Diferencias:** [`Uso_01/numstat.txt`](Integrante_02/Uso_01/numstat.txt) y [`Uso_01/cambios.diff`](Integrante_02/Uso_01/cambios.diff).  
**Evidencia de ejecución:** se reportó que Spring Boot inició después de corregir el bean del repositorio; esta evidencia no reemplaza pruebas individuales de cada endpoint.

## Uso 02 — Familias y variedades del catálogo

**Prompt original (resumen fiel):** agregar al API lo necesario para administrar familias y variedades del catálogo de acuerdo con la estructura SQL del proyecto, con sus clases Java y endpoints, y dejarlo preparado para conectarlo después desde el frontend.

**Respuesta de IA:** se prepararon modelos y capas Java de familia/variedad y modelos auxiliares para login y pronóstico. Se revisó el alcance para no afirmar que las vistas ya estuvieran integradas completamente con estos endpoints.

**Commits:** `dfc2d21 -> a25e15f`; esta comparación contiene el cambio de Kevin para el catálogo.  
**Diferencias:** [`Uso_02/numstat.txt`](Integrante_02/Uso_02/numstat.txt) y [`Uso_02/cambios.diff`](Integrante_02/Uso_02/cambios.diff).  
**Prueba:** el diff verifica los archivos y cambios incluidos; no prueba por sí mismo llamadas reales desde el frontend ni persistencia de todas las operaciones.

## Reflexión del estudiante

Usé la IA como apoyo para entender errores y revisar cómo conectar las capas del backend. También pedí que las clases de familia y variedad quedaran listas para usarse desde el frontend. Tuve que comparar lo sugerido con el SQL y el código existente, porque tener los modelos y rutas no significa que la integración completa ya esté comprobada. El modelo exacto y la temperatura no quedaron guardados en mi evidencia.
