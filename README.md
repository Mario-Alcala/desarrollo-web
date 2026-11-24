
# Gestión de Cultivos · `desarrollo-web`

Plataforma web para gestionar cultivos, el banco de semillas, terrenos y herramientas, con arquitectura de 3 capas:

|   Capa   | Tecnología                          |
|----------|-------------------------------------|
| Frontend | HTML, CSS y JavaScript (API Fetch)  |
| Backend  | Java 17 + Spring Boot (controladores REST, servicios, plantilla Thymeleaf) |
| Datos    | MySQL, acceso con **Spring JDBC** (`JdbcClient`) y SQL |

Todo el proyecto se desarrolla y ejecuta desde **WSL (Ubuntu)**.

## Estructura del repositorio

```
desarrollo-web/
├── README.md
├── backend/                     # Spring Boot (puerto 8081)
│   ├── pom.xml
│   ├── mvnw                     # Maven Wrapper 
│   ├── database/
│   │   └── init.sql             # crea la base, el usuario y las tablas de MySQL
│   └── src/main/
│       ├── java/com/cultivos/gestioncultivos_backend/
│       │   ├── controller/      # API REST (+ página de inicio)
│       │   ├── service/         # lógica de negocio y validaciones
│       │   ├── repository/      # SQL con JdbcClient
│       │   ├── model/           # Cultivo, Semilla, Terreno, Herramienta
│       │   ├── config/          # CORS
│       │   └── exception/       # errores en JSON
│       └── resources/
│           ├── application.yaml # conexión a MySQL
│           └── templates/       # plantilla Thymeleaf
└── frontend/                    # sitio estático (puerto 5500)
    ├── index.html               # inicio y acceso
    ├── administrador-agricultor/ # vistas de administración agrícola
    ├── empleado/                 # vistas de trabajo en campo y bodega
    ├── cliente/                  # catálogo y flujo de pedidos
    ├── css/                      # estilos compartidos
    └── js/                       # JavaScript compartido y lógica de vistas
```

## 1. Requisitos

- Windows 10/11 con **WSL 2** y **Ubuntu 22.04 o 24.04**.
  Si no lo tienes, en PowerShell (como administrador): `wsl --install -d Ubuntu`
- Todos los comandos siguientes se ejecutan **dentro de la terminal de Ubuntu (WSL)**.
- Trabaja en el sistema de archivos de Linux (`~`), no en `/mnt/c/...`.

## 2. Instalar el entorno (una sola vez)

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk git mysql-server curl python3

java -version       # verificacion de intalaciondebe ser 17 o superior
git --version       # verificacion de intalacion
mysql --version     # verificacion de intalacion
python3 --version   # verificacion de intalacion
```

Maven no se instala: el proyecto incluye Maven Wrapper (`mvnw`), que se descarga solo la primera vez (requiere internet).

## 3. Obtener el proyecto

```bash
cd ~
git clone https://github.com/Mario-Alcala/desarrollo-web.git
cd desarrollo-web
```

## 4. Preparar la base de datos

```bash
cd ~/desarrollo-web/backend
sudo service mysql start
sudo mysql < database/init.sql
```

Esto crea la base `gestion_cultivos`, el usuario `cultivos_user` y las tablas de terrenos, parcelas, cultivos, cosechas, proveedores, insumos, inventario, pedidos y herramientas, además de datos iniciales de demostración.
Las credenciales de desarrollo están en `backend/database/init.sql` y deben coincidir con las de `application.yaml`. Es seguro volver a ejecutarlo: no duplica datos.

Si prefieres otro usuario o clave, el backend lee las variables de entorno `DB_USER` y `DB_PASSWORD`.

## 5. Ejecutar el backend (terminal 1)

```bash
cd ~/desarrollo-web/backend
chmod +x mvnw
bash iniciar-api.sh
```

La primera vez tarda unos minutos (descarga Maven y las dependencias). Está listo cuando aparece
`Started GestioncultivosBackendApplication`.
El backend usa MySQL y la base se prepara con `database/init.sql`. Puedes iniciar con `./mvnw spring-boot:run` o `bash iniciar-api.sh`. El script comprueba si Spring Boot ya está activo antes de iniciar otra instancia.

Comprobar que funciona y que está conectado a MySQL:

```bash
curl http://localhost:8081/api/cultivos          # responde la lista de cultivos registrados
mysql -u cultivos_user -p gestion_cultivos -e "SHOW TABLES;"   # clave: cultivos-web
```

También puedes abrir <http://localhost:8081> en el navegador (página de inicio con plantilla Thymeleaf).
Para detenerlo: `Ctrl + C`.

## 6. Ejecutar el frontend (terminal 2)

```bash
cd ~/desarrollo-web/frontend
python3 -m http.server 5500
```

Abre <http://localhost:5500> en el navegador de Windows (WSL reenvía `localhost` automáticamente).
Arriba a la derecha debe aparecer **"API conectada"**.

> El frontend debe servirse en el puerto **5500**: es el origen que el backend permite por CORS
> (`backend/.../config/CorsConfig.java`). No lo abras con doble clic (`file://`).

## 7. API REST

Base: `http://localhost:8081/api`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/cultivos` | Lista cultivos. Query String opcional: `?etapa=Siembra` |
| GET | `/cultivos/{id}` | Obtiene un cultivo |
| POST | `/cultivos` | Crea un cultivo (201) |
| PUT | `/cultivos/{id}` | Actualiza un cultivo |
| DELETE | `/cultivos/{id}` | Elimina un cultivo (204) |
| GET · POST · PUT · DELETE | `/semillas`, `/semillas/{id}` | Igual que cultivos, para el banco de semillas |
| GET · POST · PUT · DELETE | `/terrenos`, `/terrenos/{id}` | Igual que cultivos, para terrenos. Estados válidos: `disponible`, `ocupado` |
| GET · POST · PUT · DELETE | `/herramientas`, `/herramientas/{id}` | Igual que cultivos, para herramientas. Estados válidos: Disponible, En uso, Mantenimiento |
| GET | `/parcelas/terreno/{idTerreno}` | Lista las parcelas del terreno y el cultivo activo asociado |
| GET · POST · PUT · DELETE | `/cosechas`, `/cosechas/{id}` | Registra lotes empacados, kilos disponibles y maduración |
| GET · POST · PUT · DELETE | `/proveedores`, `/proveedores/{id}` | Administra proveedores, independientemente de inventario |
| GET · POST · PUT · DELETE | `/insumos`, `/insumos/{id}` · `/inventario`, `/inventario/{id}` | Catálogo de insumos y existencias por lote |
| GET | `/pedidos`, `/pedidos/{id}/lotes` | Consulta pedidos y kilos asignados desde cosechas |
| POST · PUT | `/pedidos/{id}/lotes`, `/pedidos/{id}/entrega` | Asigna kilos disponibles o registra envío/recolección |
| GET · POST · PUT · DELETE | `/riegos`, `/riegos/{id}` | Riegos por cultivo. Guarda `idUsuario` (quien riega); el terreno se obtiene por la parcela |
| GET · POST · PUT · DELETE | `/observaciones-cultivos`, `/incidencias-cultivo` | Bitácora: observaciones y plagas/enfermedades (`estado`: abierta, en_seguimiento, erradicada) |
| GET · POST | `/seguimientos-incidencia` (`?idIncidencia=`) | Acciones de seguimiento; `estadoIncidencia` opcional cambia el estado de la incidencia |
| GET · POST · PUT · DELETE | `/etapas-cultivo` (`?idCultivo=`), `/etapas-cultivo/{id}` | Calendario: germinación, siembra, vegetación/riego, floración y cosecha |
| PUT | `/etapas-cultivo/{id}/completar` | `{"idUsuario":2,"fechaReal":"2026-11-22"}`: completa la etapa y actualiza `cultivos.etapa_fenologica` |
| GET · POST | `/inventario/categoria/{categoria}`, `/movimientos-inventario` | Lotes por categoría (semilla, abono, fertilizante) y entradas/salidas |

Los errores se devuelven como JSON: `{"fecha": "...", "estado": 404, "mensaje": "..."}` (400 datos inválidos, 404 no encontrado, 500 error de base de datos).

Ejemplos con `curl`:

```bash
curl -X POST http://localhost:8081/api/cultivos \
  -H "Content-Type: application/json" \
  -d '{"idParcela":1,"nombre":"Maíz","familia":"Cereal","etapaFenologica":"Siembra","fechaSiembra":"2026-11-01"}'

curl "http://localhost:8081/api/cultivos?etapa=Siembra"

curl -X PUT http://localhost:8081/api/cultivos/1 \
  -H "Content-Type: application/json" \
  -d '{"idParcela":1,"nombre":"Maíz criollo","familia":"Cereal","etapaFenologica":"Vegetación","fechaSiembra":"2026-11-01"}'

curl -X DELETE http://localhost:8081/api/cultivos/1

curl -X POST http://localhost:8081/api/semillas \
  -H "Content-Type: application/json" \
  -d '{"variedad":"Tomate cherry","stockDisponible":25,"proveedorOrigen":"AgroSur","fechaCaducidad":"2027-05-01"}'

curl -X POST http://localhost:8081/api/terrenos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Parcela Este","ubicacion":"Veracruz, Ver.","superficieHa":1.5,"tipoSuelo":"Franco","estado":"Disponible"}'

curl -X POST http://localhost:8081/api/herramientas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Azadón","tipo":"Manual","cantidad":6,"estado":"Disponible","fechaAdquisicion":"2026-02-01"}'
```



### Reproducir el proyecto en otro WSL

En un Ubuntu/WSL limpio basta con repetir, en orden, las secciones **2 → 3 → 4 → 5 → 6**.

## 8. Pantallas del trabajador (`frontend/empleado/`)

Inicia sesión con `empleado.prueba@local.test` / `Prueba123!`. Todas usan Fetch (`js/api.js`) y la sesión de `js/sesion.js`
(quien registra sale de la sesión, no de un selector).

| Pantalla | Archivo | Qué hace |
|----------|---------|----------|
| Cultivos activos | `cultivos.html` | Consulta cultivos, clima del terreno, registra riego, observación y cosecha |
| Banco de semillas | `semillas.html` | Lotes de semilla, caducidad, uso en siembra (salida) y entradas |
| Inventario | `inventario.html` | Entradas y salidas sobre lotes existentes |
| Observaciones | `observaciones.html` | Observaciones, plagas/enfermedades, seguimientos y bitácora unificada |
| Riego / Fertilizantes / Abono | `riegos.html`, `fertilizantes.html`, `abonos.html` | Riegos por cultivo; aplicación de insumos (salida del lote) |
| Terreno | `terrenos.html` | Consulta de terrenos y parcelas (ocupada/disponible calculado) |
| Distribución | `distribucion.html` | Empacador asigna kilos de lotes; cargador registra salida o "listo para recoger"; chofer confirma entrega |
| Calendario | `calendario.html`, `etapas.html` | Etapas guardadas en el servidor; al completarlas se actualiza la etapa del cultivo |

Pruebas de la lógica del frontend (validaciones, calendario, cosecha, usuarios):

```bash
node --test frontend/pruebas/*.test.js
```

> **Si tu base se creó con una versión anterior de `init.sql`** (por ejemplo, `riegos` con `id_terreno`),
> vuelve a crearla: `sudo mysql -e "DROP DATABASE gestion_cultivos;" && sudo mysql < database/init.sql`.
> El script también agrega por sí solo la columna `estado` de `incidencias_cultivo` y la tabla `etapas_cultivo`.

## 9. Solución de problemas

| Síntoma | Solución |
|---------|----------|
| `Permission denied` al ejecutar `./mvnw` | `chmod +x mvnw` |
| `Communications link failure` / `Connection refused` | MySQL está apagado: `sudo service mysql start` |
| `Access denied for user 'cultivos_user'` o `Unknown database` | Falta ejecutar `sudo mysql < database/init.sql` (desde la carpeta `backend/`) |
| `Port 8081 was already in use` | Usa `bash iniciar-api.sh` desde `backend/`; si ya hay una instancia respondiendo, la reutiliza y no inicia otra. Si el puerto está ocupado sin que responda el API, revisa el proceso con `sudo ss -ltnp \| grep :8081` antes de detenerlo. |
| El frontend dice "Sin conexión con el backend" | Verifica que el backend esté corriendo y que abras `http://localhost:5500` (no `file://`) |
| Error de versión de Java al compilar | Necesitas Java 17+: `sudo apt install openjdk-17-jdk` y `sudo update-alternatives --config java` |
| `./mvnw test` falla | Las pruebas arrancan Spring y se conectan a MySQL: debe estar encendido y con `init.sql` ejecutado |
