# Registro de desarrollo con IA — Integrante 2, Kevin

**Proyecto:** Gestión de Cultivos  
**Release:** Reporte 2  
**Herramienta:** ChatGPT en Codex.  
**Modelo/temperatura:** No registrados.  
**Repositorio:** https://github.com/Mario-Alcala/desarrollo-web

## Uso de IA para código

**Prompt representativo reconstruido:** “Conforme a lo que me toca del backend, ayúdame a completar los módulos de proveedores, inventario, riego, cosechas, abonos, fertilizantes, distribución, observaciones e incidencias. Explícame qué archivos van en controller, service, repository y model.”

**Prompt sobre clima tomado del registro:** “Dime qué copio dónde y cómo para que quede listo para implementar en el frontend, incluyendo la consulta del clima y las coordenadas del terreno.”

El primer prompt es una reconstrucción temática; el segundo resume la petición entregada en el registro de referencia. No se recibieron capturas de una prueba exitosa.

**Respuesta de IA:** Se propusieron clases para las capas REST y el acceso SQL de los módulos asignados, además de una integración del backend con Open-Meteo y el uso de latitud y longitud del terreno. El código se adaptó a los nombres y tablas del proyecto.

**Código anterior:** 97c0c02 — Api funcional-V1  
**Código posterior:** fbdfea3 — Api Rest Completada (tag V1-Final)  
**Commits incluidos:** 71c30d3, 48dd149, af6ee64, 250831d y fbdfea3.  
**Diferencias:** Uso_01/numstat.txt contiene la salida de git diff --numstat 97c0c02 fbdfea3 -- backend; Uso_01/cambios.diff conserva el diff completo.  
**Código generado/modificado:** módulos de proveedores, inventario y movimientos, riego, cosechas, abonos, fertilizantes, distribución, usuarios, observaciones e incidencias; consulta meteorológica y coordenadas de terrenos.  
**Prueba:** El historial registra ejecuciones y correcciones de compilación. En el reporte de referencia se indicó que la conexión con MySQL todavía no se había probado porque el servicio/base no estaba disponible; no se presenta como integración validada de extremo a extremo.  
**Reflexión propuesta para revisión:** Entendí cómo conectar controller, service y repository, y que para consultar el clima de un terreno el backend debe usar sus coordenadas. También aprendí que los errores de inicio pueden deberse a componentes de Spring no registrados o a la conexión con MySQL, no necesariamente al endpoint.

Los archivos antes/después guardan los archivos del backend modificados dentro de este rango.
