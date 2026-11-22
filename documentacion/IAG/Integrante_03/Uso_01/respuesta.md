# Respuesta de la IA — Uso 01


## Qué entregó la IA
- Pasos de git para traer lo del equipo sin clonar de nuevo (`fetch`, `checkout main`, `pull`; explicó que la rama local `frontend-vistas-admin` solo existía en mi máquina, y que mi base era el commit `96a73b0`).
- Ayuda para levantar el entorno: instalar MySQL en WSL, recrear el usuario `cultivos_user`, correr `./mvnw` desde `backend/`, comprobar el puerto real (8081, el README dice 8080).
- Código inline para `frontend/`: `terrenos.html`, `terreno-detalle.html`, `css/admin.css`, `css/terrenos.css`, `js/sidebar.js`, `js/terrenos.js`, `js/terrenos-datos.js` (datos de ejemplo), `js/terreno-detalle.js`, cada uno con comentario de cabecera (cascarón / frontend / backend / qué falta / qué se añadió por backend incompleto).
- Clima del terreno con Open-Meteo usando latitud/longitud.

## Qué NO funcionó a la primera
- Mi `terrenos.js` quedó con un bloque duplicado y `usandoEjemplo` sin definir → la IA entregó el archivo completo corregido.
- Página vacía por falta de `terrenos-datos.js` → la IA lo creó.

