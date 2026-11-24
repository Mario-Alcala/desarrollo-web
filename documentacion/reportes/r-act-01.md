# Reporte de Avance del Proyecto

**Equipo: 01 **  
**Fecha:13/11/2026 **  
**Número de reporte: 01 **  
**Repositorio GitHub: https://github.com/Mario-Alcala/desarrollo-web **  

---

# 1. Actividades realizadas

Se realizo la primera parte del proyecto, se configuro el repositorio que se estara utilizando para este proyecto, se crearon las distintas carpteas que llevaran la logica principal de la aplicacion(controller, exception, model, repository, service y config) la primera parte del backend; metodos CRUD para semillas, cultivos, terrenos y herramientas.

Configuracion para la conexion con la base de datos (init)
---

# 2. Evidencias de trabajo

|      Actividad       |  Integrante responsable   |  Enlace a commit  |
|----------------------|---------------------------|-------------------|
|Creacion de la logica |
|principal del proyecto| Mario J. Bonavides Alcala |https://github.com/Mario-Alcala/desarrollo-web/commit/48eaa0bef769891d4c097a14d678df42f4a7fc99 |

|Configuracion inicial | Mario J. Bonavides Alcala |
| de la base de datos  |                           |https://github.com/Mario-Alcala/desarrollo-web/commit/7948bbcf73644f960b95a57e4581cb3d52b7820e|
| | | |
| | | |
| | | |

---


# 3. Problemas encontrados

|   Problema    |   Causa   |   Solución   |
|---------------|-----------|--------------|
| Error 500 (Whitelabel Error Page) al abrir la raíz '/' |'HomeController' devolvía la vista 'index', pero la carpeta 'templates' estaba vacía y Thymeleaf no encontraba la plantilla | Se creó 'templates/index.html' |

| Errores de la API terminaban en 500 | En la carpeta 'exception/' estaba un id inexistente o un dato inválido no tenía manejo | Se creó 'ApiExceptionHandler', que responde JSON con 400, 404 o 500 según el caso |

| Base de datos sin script ni tablas | `application.yaml` citaba `database/init.sql`, que aun no existía, y las tablas `terrenos` y `herramientas` no estaban definidas | Se creó `init.sql` con la base, el usuario, las 4 tablas y datos de ejemplo; se puede ejecutar varias veces sin duplicar datos |

| `Access denied for user 'cultivos_user'` | La clave de MySQL no coincidía con la de `application.yaml`: el usuario ya existía con otra clave, `CREATE USER IF NOT EXISTS` no la cambia y MySQL distingue mayúsculas | Se agregó `ALTER USER` en `init.sql` y se unificó la contraseña en ambos archivos |

| `./mvnw` fallaba al clonar el proyecto en otro WSL | El `.gitignore` ignoraba `.mvn/`, así que `maven-wrapper.properties` no se versionaba | Se quitó esa línea y se agregó la carpeta a Git |

| README desactualizado | Mencionaba archivos que ya no existian, una ruta y una clave incorrectas y un formato de error distinto al real, además de restos de una fusión de Git | Se corrigió el README según el código real |

---

# 4. Avance funcional

## Funcionalidades operativas

|       Funcionalidad       |       Cómo se comprueba       |
|---------------------------|-------------------------------|
| Registro de cultivos y atributos principales: CRUD en `/api/cultivos`, con filtro `?etapa=` | `GET /api/cultivos` y `./scripts/probar-api.sh` |

| Banco y administración de semillas: CRUD en `/api/semillas`, con control de stock | `GET /api/semillas` y `./scripts/probar-api.sh` |

| Administración de terrenos: CRUD en `/api/terrenos` | `GET /api/terrenos` y `./scripts/probar-api.sh` |

| Administración de herramientas: CRUD en `/api/herramientas` | `GET /api/herramientas` y `./scripts/probar-api.sh` |

| Base de datos relacional: script `init.sql` con 4 tablas, usuario y datos de ejemplo | `sudo mysql gestion_cultivos -e "SHOW TABLES;"` |

| Validaciones y errores en JSON (400 dato inválido, 404 no encontrado, 500 error de base de datos) | `GET /api/terrenos/9999` responde 404 |

| CORS para el frontend en el puerto 5500 y página de inicio con la lista de endpoints | Abrir `http://localhost:8080` |

| Documentación de instalación y pruebas | `README.md` y `DESCRIPCION-ENTREGA.md` |

La prueba automática (`probar-api.sh`) ejecuta 29 comprobaciones sobre los 4 módulos.

---

## Funcionalidades pendientes

- Frontend: consumo del API con fetch (`index.html`, `app.js` y `styles.css`).
- Relaciones entre tablas (por ejemplo, un cultivo asociado a un terreno y a una semilla).
- Paginación en los listados.
- Pruebas automatizadas de servicios y controladores (hoy solo existe `contextLoads`).
- Migraciones versionadas de la base de datos.
- Autenticación y roles de usuario (según el alcance general del proyecto).

---

# 5. Uso de IA generativa

Documentar el uso de herramientas de inteligencia artificial durante el desarrollo del proyecto.

- **Herramienta utilizada: Gemini - Claude **
- **Actividad para la que se utilizó: Gemini se utilizó para preguntas o consultas generales, como dudas de conceptos y de instalación del entorno. Claude se utilizó para revisar el backend, encontrar y corregir el error 500 **

- **Código o contenido generado: **
--Plantilla `index.html` de la página de inicio (corrige el error 500).
--Script `init.sql` con la base de datos, el usuario, las 4 tablas y datos de ejemplo.
--Script de pruebas `probar-api.sh`.

- **Modificaciones realizadas por el equipo: **
--El equipo revisó el contenido generado y lo integró al repositorio. Cambió la contraseña de la base de datos en `init.sql` y `application.yaml`, ajustó los textos de la documentación y subió los cambios a GitHub.

- **Forma en que se verificó el resultado: **
 --Se ejecutaron los scripts y el backend en WSL con MySQL. Se comprobaron las tablas con `SHOW TABLES`, se probaron los endpoints en el navegador y con `curl`, y se ejecutó `probar-api.sh`, que revisa el CRUD de los 4 módulos.

> Si no se utilizó IA, indicarlo expresamente.
Si se uso

---

# 6. Participación individual

Describir brevemente la contribución de cada integrante.

- **Integrante 1: Mario Javier Bonavides Alcala **
- **Integrante 2:**
- **Integrante 3:**
- **Integrante 4:**

---

# 7. Próximas actividades

Indicar las tareas que se realizarán antes del siguiente reporte.

- Actividad 1
--Creacion inicial del backend, creacion de api metodos CRUD


---

## Observaciones adicionales
-Esta es una version inicial del proyecto y muy tardia derivado de algunas implicaciones durante su desarrollo, aun asi se considera la posibilidad de tener una major escalabilidad incluso en los metodos ya escritos(modificaciones y/o actualizaciones)
