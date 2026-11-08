
# Gestión de Cultivos · `desarrollo-web`

Plataforma web para gestionar cultivos y el banco de semillas, con arquitectura de 3 capas:

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
├── database/
│   └── init.sql                 # crea la base de datos y el usuario de MySQL
├── backend/                     # Spring Boot (puerto 8080)
│   ├── pom.xml
│   ├── mvnw                     # Maven Wrapper 
│   └── src/main/
│       ├── java/com/cultivos/gestioncultivos_backend/
│       │   ├── controller/      # API REST (+ página de inicio)
│       │   ├── service/         # lógica de negocio y validaciones
│       │   ├── repository/      # SQL con JdbcClient
│       │   ├── model/           # Cultivo, Semilla
│       │   ├── config/          # CORS
│       │   └── exception/       # errores en JSON
│       └── resources/
│           ├── application.yaml # conexión a MySQL
│           ├── schema.sql       # tablas (se ejecuta al arrancar)
│           └── templates/       # plantilla Thymeleaf
└── frontend/                    # sitio estático (puerto 5500)
    ├── index.html
    ├── css/styles.css
    └── js/app.js                # consumo de la API con fetch
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
sudo service mysql start
sudo mysql < database/init.sql
```

Esto crea la base `gestion_cultivos` y el usuario `cultivos_user` (credenciales de desarrollo en `database/init.sql`).
Las **tablas las crea el backend** al arrancar (`backend/src/main/resources/schema.sql`).

Si prefieres otro usuario o clave, el backend lee las variables de entorno `DB_USER` y `DB_PASSWORD`.

## 5. Ejecutar el backend (terminal 1)

```bash
cd ~/desarrollo-web/backend
chmod +x mvnw
./mvnw spring-boot:run
```

La primera vez tarda unos minutos (descarga Maven y las dependencias). Está listo cuando aparece
`Started GestioncultivosBackendApplication`.

Comprobar que funciona y que está conectado a MySQL:

```bash
curl http://localhost:8080/api/cultivos          # responde []  (lista vacía)
mysql -u cultivos_user -p gestion_cultivos -e "SHOW TABLES;"   # clave: Cultivos_2026!
```

También puedes abrir <http://localhost:8080> en el navegador (página de inicio con plantilla Thymeleaf).
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

Base: `http://localhost:8080/api`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/cultivos` | Lista cultivos. Query String opcional: `?etapa=Siembra` |
| GET | `/cultivos/{id}` | Obtiene un cultivo |
| POST | `/cultivos` | Crea un cultivo (201) |
| PUT | `/cultivos/{id}` | Actualiza un cultivo |
| DELETE | `/cultivos/{id}` | Elimina un cultivo (204) |
| GET · POST · PUT · DELETE | `/semillas`, `/semillas/{id}` | Igual que cultivos, para el banco de semillas |

Los errores se devuelven como JSON: `{"error": "mensaje"}` (400 datos inválidos, 404 no encontrado).

Ejemplos con `curl`:

```bash
curl -X POST http://localhost:8080/api/cultivos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Maíz","tipo":"Cereal","etapaFenologica":"Siembra"}'

curl "http://localhost:8080/api/cultivos?etapa=Siembra"

curl -X PUT http://localhost:8080/api/cultivos/1 \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Maíz criollo","tipo":"Cereal","etapaFenologica":"Vegetación"}'

curl -X DELETE http://localhost:8080/api/cultivos/1

curl -X POST http://localhost:8080/api/semillas \
  -H "Content-Type: application/json" \
  -d '{"variedad":"Tomate cherry","stockDisponible":25,"proveedorOrigen":"AgroSur","fechaCaducidad":"2027-05-01"}'
```



### Reproducir el proyecto en otro WSL

En un Ubuntu/WSL limpio basta con repetir, en orden, las secciones **2 → 3 → 4 → 5 → 6**.

## 8. Solución de problemas

| Síntoma | Solución |
|---------|----------|
| `Permission denied` al ejecutar `./mvnw` | `chmod +x mvnw` |
| `Communications link failure` / `Connection refused` | MySQL está apagado: `sudo service mysql start` |
| `Access denied for user 'cultivos_user'` o `Unknown database` | Falta ejecutar `sudo mysql < database/init.sql` (desde la carpeta raíz del proyecto) |
| `Port 8080 was already in use` | Cierra el otro proceso (ver cuál es con `sudo ss -ltnp \| grep :8080`) |
| El frontend dice "Sin conexión con el backend" | Verifica que el backend esté corriendo y que abras `http://localhost:5500` (no `file://`) |
| Error de versión de Java al compilar | Necesitas Java 17+: `sudo apt install openjdk-17-jdk` y `sudo update-alternatives --config java` |
| `./mvnw test` falla | Las pruebas arrancan Spring y se conectan a MySQL: debe estar encendido y con `init.sql` ejecutado |

# desarrollo-web
305251cbf381a93854ff52546cb26435d28aab31
