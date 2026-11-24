# Dudas técnicas y consultas a IA

Integrante: Carlos Alessandro Roa Vázquez — Integrante 3 | Herramienta: Claude

| Duda | Respuesta aplicada y aprendizaje |
|---|---|
| ¿Cómo registrar cosecha sin duplicar Bodega? | El registro crea el lote y Bodega muestra ese mismo lote. |
| ¿Por qué una salida de 999 pasó inicialmente? | El historial reflejaba una entrada previa de 999; el saldo explica la validación posterior. |
| ¿Por qué GET /api/parcelas devolvía 404? | La ruta disponible era /api/parcelas/terreno/{id}; el frontend debe usar rutas del controller. |
| ¿Por qué hay “sin conexión” si Spring está arriba? | Revisar puerto, CORS y caché por separado. |
| ¿Qué debe permitir terrenos.html al trabajador? | Consultar, no registrar terrenos ni parcelas. |
| ¿Cómo obtiene un riego el terreno relacionado? | Seguir cultivo-parcela-terreno, sin pedir el terreno de nuevo. |
| ¿Cómo actualizar cultivos.html sin borrar cosecha? | Revisar dependencias y conservar panel/scripts existentes antes de reemplazar la vista. |
| ¿Qué cubre una prueba automática? | Reglas repetibles de cantidades, roles y fechas; navegador y SQL revisan el flujo completo. |
