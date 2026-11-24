# Reporte de Uso Documental en el Proyecto

**Fecha: 13/11/2026 **  
**Número de reporte: 01 **  

---

# 1. Breve descripción de uso

Se utilizó Claude durante el desarrollo del backend de Gestión de Cultivos con tres propósitos: revisar el código y corregir errores (error 500 al abrir el sistema y fallo de acceso a MySQL), completar lo que faltaba para la entrega (CRUD de terrenos y herramientas, script de base de datos y pruebas) y redactar la documentación (README, descripción de la entrega y secciones de este reporte). Las consultas generales y conceptuales se hicieron con Gemini.


---

# 2. Evidencias de uso

| Fecha | Herramienta | Enlace a prompt | Enlace a respuesta |
|------------|------------------------|-----------------|-------|
| 11/11/2026 | Claude | [Prompt 1](#prompt-1) | [Respuesta 1](#respuesta-1) |
| 11/11/2026 – 12/11/2026 | Claude | [Prompt 2](#prompt-2) | [Respuesta 2](#respuesta-2) |
| 12/11/2026 | Claude | [Prompt 3](#prompt-3) | [Respuesta 3](#respuesta-3) |
| 12/11/2026 | Claude | [Prompt 4](#prompt-4) | [Respuesta 4](#respuesta-4) |
| 13/11/2026 | Claude | [Prompt 5](#prompt-5) | [Respuesta 5](#respuesta-5) |
> El prompt y la respuesta pueden ser copiados como una subsección y enlazados
### Prompt 1

> analiza el backend del proyecto verifica que todo este bien hecho e implementado y corriegue el error conservando lo que llevamos de proyecto, indicame cada cambio que quieres hacer y como se hara

Adjuntos: `backend.zip` y captura de la Whitelabel Error Page (status 500).

### Respuesta 1

Identificó la causa del error 500: `HomeController` devolvía la vista `index`, pero la carpeta `templates/` estaba vacía. Creó `index.html`, el script `init.sql` y la clase `ApiExceptionHandler` (errores en JSON con el código HTTP correcto), normalizó los finales de línea de un archivo y entregó el proyecto corregido en `backend-corregido.zip`.

---

## Observaciones adicionales

Agregar cualquier comentario explicativo relevante.
