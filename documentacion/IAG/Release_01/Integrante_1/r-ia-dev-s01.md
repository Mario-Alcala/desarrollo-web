# Reporte de IA Desarrollo en el Proyecto

**Fecha:13/11/2026 **  
**Número de reporte: 01 **  

---

# 1. Breve descripción de uso

Se utilizaron dos modelos de inteligencia artifial para el desarrollo de esta parte del proyecto las cuales serian gemini y claude.
Ambas se utilizaron con distintos fines, preguntas sobre algunos temas, consultas sobre temas generales del proyecto, ayuda con la distribucion y planeacion del proyecto, revision de codigos, correccion de errores, ect.
---

# 2. Evidencias de uso

|      Evidencia      |      Formato      | 
|---------------------|-------------------------|
Herramienta        | Google Gemini
Modelo/temperatura | Gemini Flash-Lite 3.5
Prompt original    | "analiza el backend del proyecto verifica que todo este bien hecho e implementado y corriegue el error, indicame cada cambio que quieres hacer y como se hara"

Respuesta de IA    | Análisis de la capa de persistencia y servicios, indicando que las interfaces de repositorio estaban vacías y debían extender de JpaRepository para activar los métodos CRUD de Spring Data JPA, además de implementar la anotación @Service y la inyección de dependencias en los servicios de Cultivos y Semillas.

Código anterior | Commit (48d2b5d) No se hizo un commit exacto de esta parte
Código posterior | Commit (0897eef) No se hizo commit exacto de esta parte

Diferencias entre versiones | git diff --numstat 48d2b5d 0897eez (copiar la salida)

Prueba de funcionamiento | CURL o captura imagen del resultado

Código de uso | Generación / Modificación / Depuración / Explicación / Diseño / Revisión / Documentación / Pruebas
Reflexión del estudiante | Texto breve que describe lo obtenido u ocurrido y lo aprendido por parte del estudiante
El uso de la IA permitió identificar rápidamente un error conceptual clave en la arquitectura de 3 capas de Spring Boot: las interfaces de repositorio no pueden estar vacías si se pretende interactuar con la base de datos MySQL a través de ORM. Al extenderlas correctamente de JpaRepository e implementar los servicios con inyección de dependencias, la aplicación logró levantar sin errores 500, comprendiendo mejor la integración entre Spring Data, JPA y el mapeo de entidades.


|      Evidencia      |      Formato      | 
|---------------------|-------------------------|
Herramienta | cLaude
Modelo/temperatura | Claude Sonnet 5.5 / No aplica 
Prompt original | analiza mi proyecto y dime si el api fecth es funcional y esta bien hecho, verifica que esto este bien hecho y sea escalable a futuro; Desarrollo de entidades, repositorios y controladores REST para: Registro de cultivos y atributos principales. Banco de semillas y Administración de semillas. Administración de terreno. Administración de herramientas. Entregables: Endpoints CRUD funcionales para cultivos, semillas, terrenos y herramientas; scripts de base de datos relacional.

Respuesta de IA |

Resumen (la respuesta completa está en el chat):

- El backend tenía entidades, repositorios y servicios de los 4 módulos, pero solo cultivos y semillas funcionaban de punta a punta.
- Faltaban `HerramientaController` (archivo vacío) y las tablas `terrenos` y `herramientas` en `init.sql`.
- El frontend (`index.html`, `app.js`, `styles.css`) estaba vacío, así que no había fetch que evaluar; la API sí estaba lista para recibirlo (CORS, JSON y códigos HTTP).
- Se corrigieron: el controlador de herramientas, `init.sql`, la lista de endpoints de la página de inicio, el `.gitignore` (ignoraba `.mvn/`) y el README.
- Se agregó el script `probar-api.sh` y el documento `DESCRIPCION-ENTREGA.md`.
- Se recomendó: relaciones entre tablas, migraciones versionadas, paginación, validación con `@Valid` y pruebas de endpoints.

Código anterior | Commit (48d2b5d) No se hizo commit exacto de esta parte
Código posterior | Commit (0897eef) No se hizo commit exacto de esta parte
Diferencias entre versiones | git diff --numstat 48d2b5d 0897eez (copiar la salida) No se hizo commit exacto de esta parte

Prueba de funcionamiento | CURL o captura imagen del resultado
Código de uso | Generación / Modificación / Depuración / Explicación / Diseño / Revisión / Documentación / Pruebas

Reflexión del estudiante | Texto breve que describe lo obtenido u ocurrido y lo aprendido por parte del estudiante

> El prompt y la respuesta pueden ser copiados como una subsección y enlazados

---

## Observaciones adicionales

Agregar cualquier comentario explicativo relevante.
