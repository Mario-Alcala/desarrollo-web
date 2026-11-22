# Reflexión — Uso 06: Documentación del uso de IA

El curso pide documentar todo el uso de IA, y me preocupó porque casi todo el código de mis pantallas de administrador lo generó la IA, y vi que el formato habla de "generación de código"la IA generó la mayoría del código, yo lo pegué, lo probé y lo corregí con ella, y yo escribo algunos filtros y validaciones y mis propias pruebas 

- Cada commit tiene un hash, un código corto como 5b95117 que lo identifica. Con
  `git log --oneline` veo los commits en orden.
- El "antes" y el "después" de cada uso son los hashes de dos commits seguidos.
- `git diff --numstat <antes> <después>` muestra por archivo cuántas líneas se agregaron
  y cuántas se quitaron. En los archivos nuevos todo es agregado; en sidebar.js hay líneas
  quitadas porque ya existía y se reemplazó.

