# Reporte individual de uso de IA generativa

**Proyecto:** Gestión de Cultivos  
**Equipo:** Gestión de Cultivos  
**Fecha:** 22/11/2026  
**Número de reporte:** 04  
**Integrante:** Kevin Miguel García Montané — Integrante 2  
**Repositorio:** https://github.com/Mario-Alcala/desarrollo-web  
**Rama de trabajo para la integración:** `kevin/integracion-funciones`

## Declaración de uso de IA

Utilicé Codex como apoyo para analizar cambios de código, integrar funciones de las ramas del equipo, resolver conflictos entre versiones del backend y el frontend, ajustar consultas y métodos Java, y aclarar el flujo de Git. Revisé las modificaciones resultantes y pedí conservar como referencia la estructura de datos y las rutas acordadas para el proyecto. La IA apoyó la generación y adaptación del código; las decisiones sobre qué versión conservar y cómo organizar la integración las indiqué durante el trabajo.

## Herramienta y clasificación

- **Herramienta:** Codex.
- **Modelo:** GPT-6.
- **Temperatura:** No aplica en esta interfaz de Codex.
- **Tipos de uso:** generación, modificación, depuración, explicación y revisión de código.
- **Lenguajes y herramientas:** Java, SQL, JavaScript, HTML, Git y Maven.

## Usos de IA para generación y modificación de código

### 1. Integración de las ramas del equipo con la estructura acordada

- **Prompt:** Integra las funciones de administración y de empleado con mi rama como base. Conserva el `init.sql`, los nombres de datos y la organización actual; adapta a esa estructura las funciones nuevas de las otras ramas.
- **Respuesta de IA:** Se revisaron las ramas y sus cambios, se integraron en `kevin/integracion-funciones` y se resolvieron los conflictos conservando el esquema SQL de la rama base. La integración quedó registrada en commits separados para la base reciente, la administración de usuarios y las funciones del empleado.
- **Código anterior:** `6dfe008` — base local de `kevin/avances-no-subidos`.
- **Código posterior:** `c7884ee`, `815d74d` y `a6d6f27` — commits locales en `kevin/integracion-funciones`.
- **Diferencias:** `git diff --shortstat 6dfe008 a6d6f27` reportó 125 archivos modificados, 8,206 inserciones y 1,387 eliminaciones en el resultado conjunto de las ramas. El cambio incluye código aportado desde más de una rama.
- **Verificación:** se comprobó la compilación del backend con `mvnw -q -DskipTests compile` y la sintaxis de los archivos JavaScript con `node --check`.
- **Código de uso:** modificación, integración y depuración.
- **Reflexión:** Aprendí que al integrar ramas hay que revisar el contrato de datos y las rutas compartidas antes de aceptar una versión completa de un archivo.

### 2. Conservación del registro de cosecha y creación del lote de bodega

- **Prompt:** Revisa el registro de cosecha del empleado para que use un cultivo existente. Al guardar debe crear el lote con los kilos cosechados disponibles en bodega, registrar su maduración y ubicación, y finalizar el cultivo sin volver a capturarlo en Bodega.
- **Respuesta de IA:** Se mantuvo el flujo de registro asociado al cultivo existente. El servicio valida kilos, fecha, maduración y ubicación; al crear el lote asigna la cantidad disponible y finaliza el cultivo correspondiente. Bodega consulta ese lote ya creado.
- **Código anterior:** `CosechaService` y `CosechaRepository` previos a la integración.
- **Código posterior:** `backend/src/main/java/com/cultivos/gestioncultivos_backend/service/CosechaService.java`, `backend/src/main/java/com/cultivos/gestioncultivos_backend/repository/CosechaRepository.java` y `frontend/js/cosecha-registro.js`.
- **Diferencias:** el lote se relaciona con un cultivo existente y la existencia inicial se deriva de los kilos cosechados. No se crea una segunda captura para Bodega.
- **Verificación:** compilación del backend y revisión de sintaxis JavaScript.
- **Código de uso:** modificación y depuración.
- **Reflexión:** Comprendí que la cosecha representa el lote físico que pasa a bodega, mientras que el cultivo continúa siendo el registro de la parcela.

### 3. Registro de quién actualiza la entrega de un pedido

- **Prompt:** En la actualización de entrega guarda también el usuario de la sesión que registra el cambio. Conserva el número de rastreo, los estados de domicilio o recolección y la compra que ya se genera desde el catálogo.
- **Respuesta de IA:** Se adaptaron el controlador, el servicio y el repositorio de pedidos para recibir el identificador de usuario, actualizar la distribución existente y devolver el responsable al consultar pedidos. La pantalla de detalle envía el identificador guardado en la sesión.
- **Código anterior:** `PedidoController`, `PedidoService`, `PedidoRepository` y `pedido-detalle.js` antes de integrar el registro del responsable.
- **Código posterior:** `backend/src/main/java/com/cultivos/gestioncultivos_backend/controller/PedidoController.java`, `backend/src/main/java/com/cultivos/gestioncultivos_backend/service/PedidoService.java`, `backend/src/main/java/com/cultivos/gestioncultivos_backend/repository/PedidoRepository.java`, `backend/src/main/java/com/cultivos/gestioncultivos_backend/model/Pedido.java` y `frontend/js/pedido-detalle.js`.
- **Diferencias:** la solicitud de entrega incluye `idUsuario`; la distribución conserva el estado y el rastreo y registra a la persona responsable.
- **Verificación:** compilación de Java y revisión de sintaxis de `pedido-detalle.js`.
- **Código de uso:** generación, modificación e integración.
- **Reflexión:** El identificador del empleado debe salir de la sesión; pedirlo otra vez en un selector podría guardar un responsable distinto de quien inició sesión.

### 4. Administración de usuarios y asignación de roles

- **Prompt:** Integra la interfaz para que el administrador pueda registrar y editar cuentas internas con correo único y rol permitido. Los clientes deben registrarse desde su propia pantalla y no elegir un rol administrativo.
- **Respuesta de IA:** Se incorporaron la pantalla de usuarios y su lógica de consulta, validación, alta y edición. Se limitaron las opciones internas a administrador/agricultor y trabajador, dejando el registro de cliente en su flujo propio.
- **Código anterior:** no existía una interfaz de administración de usuarios conectada al API en la estructura integrada.
- **Código posterior:** `frontend/administrador-agricultor/usuarios-admin.html`, `frontend/js/usuarios-admin.js`, `frontend/css/usuarios.css` y los métodos correspondientes de `UsuarioService`.
- **Diferencias:** la lista y el formulario se relacionan con `/api/usuarios`; la contraseña se procesa en el backend y no se muestra en la lista.
- **Verificación:** revisión de sintaxis JavaScript y compilación del backend.
- **Código de uso:** generación, modificación y revisión.
- **Reflexión:** La interfaz puede ocultar opciones de rol, pero la regla también debe validarse en el servidor para que no dependa solo del navegador.

### 5. Riego ligado al cultivo y a la sesión del trabajador

- **Prompt:** Ajusta el registro de riego para elegir un cultivo existente y obtener de ahí la parcela y el terreno. Guarda fecha, cantidad de agua, unidad, método, observaciones y el usuario de la sesión; no pidas que escriban otra vez el terreno.
- **Respuesta de IA:** Se adaptó el envío del registro para relacionarlo con el cultivo y con el usuario autenticado. La relación de la parcela permite consultar el terreno sin duplicar el dato en el formulario.
- **Código anterior:** formulario y lógica del riego que enviaban el terreno como otro dato ingresado por el empleado.
- **Código posterior:** `backend/src/main/java/com/cultivos/gestioncultivos_backend/model/Riego.java`, `backend/src/main/java/com/cultivos/gestioncultivos_backend/service/RiegoService.java`, `backend/src/main/java/com/cultivos/gestioncultivos_backend/repository/RiegoRepository.java` y `frontend/js/cultivos-actividades.js`.
- **Diferencias:** el registro se relaciona con un cultivo existente y el usuario responsable se toma de la sesión.
- **Verificación:** compilación del backend y revisión de sintaxis JavaScript.
- **Código de uso:** modificación y depuración.
- **Reflexión:** Relacionar el riego con el cultivo evita que una misma labor quede asociada a un terreno distinto por un dato capturado dos veces.

### 6. Reutilización de las pantallas de pedidos según el rol

- **Prompt:** Reutiliza la lista y el detalle de pedidos para administrador y trabajador. Muestra acciones según el rol: el empleado prepara y actualiza el avance, y el administrador conserva la administración del pedido. No crees una segunda lista duplicada.
- **Respuesta de IA:** Se agregó lógica de permisos de interfaz que filtra las acciones y estados visibles según el rol y el estado actual del pedido. Se conservó una sola ruta para consultar y preparar pedidos.
- **Código anterior:** vista de pedidos que mostraba las mismas acciones para todos los usuarios.
- **Código posterior:** `frontend/js/permisos-pedidos.js`, `frontend/js/pedidos.js`, `frontend/js/pedido-detalle.js`, `frontend/administrador-agricultor/pedidos.html` y `frontend/administrador-agricultor/pedido-detalle.html`.
- **Diferencias:** el trabajador puede asignar lotes y marcar el pedido enviado o listo para recoger; la confirmación final se deja al administrador. Los pedidos del catálogo no vuelven a reservar los lotes.
- **Verificación:** comprobación de sintaxis JavaScript y compilación del backend.
- **Código de uso:** generación, modificación y revisión.
- **Reflexión:** Una pantalla compartida reduce duplicidad, pero debe cambiar sus acciones según el rol para no mezclar responsabilidades.

### 7. Resolución de conflictos sin reemplazar el esquema de la base

- **Prompt:** Resuelve los conflictos de integración sin perder mi versión de `init.sql`, los datos actuales ni las funciones que ya trabajan con ese esquema. Explícame qué archivos deben conservar la base y cuáles pueden combinarse.
- **Respuesta de IA:** Se revisaron los archivos en conflicto por separado. Se mantuvo la definición de base de datos elegida como referencia y se combinaron las funciones compatibles de pedidos, usuarios y operaciones del empleado. Los archivos auxiliares de Windows con nombres no válidos para el sistema se dejaron fuera de la rama de integración.
- **Código anterior:** conflictos pendientes entre las versiones de las ramas.
- **Código posterior:** commits de integración `c7884ee`, `815d74d` y `a6d6f27`.
- **Diferencias:** se conservaron las relaciones y columnas utilizadas por el API, evitando sustituir el esquema completo por el de otra rama.
- **Verificación:** `git status` quedó limpio después de cada commit de integración; `git merge-base --is-ancestor` confirmó la inclusión de las tres ramas.
- **Código de uso:** depuración, integración y revisión.
- **Reflexión:** En un conflicto de SQL no basta con aceptar una versión automáticamente; hay que comprobar que los modelos y consultas Java coincidan con las tablas elegidas.

### 8. Corrección de una incompatibilidad aparecida al integrar cambios

- **Prompt:** Revisa por qué deja de compilar el backend después de incorporar la rama. Conserva el flujo de login que ya usa el proyecto y elimina cualquier método o manejador duplicado que no corresponda al esquema actual.
- **Respuesta de IA:** Se identificó un método de autenticación que llamaba a una búsqueda inexistente en el repositorio y un manejador repetido para la misma excepción. Se conservó el servicio de usuarios compatible con el login existente y se retiró el manejador duplicado.
- **Código anterior:** integración con método de repositorio faltante y manejadores duplicados para `ResponseStatusException`.
- **Código posterior:** `backend/src/main/java/com/cultivos/gestioncultivos_backend/service/UsuarioService.java` y `backend/src/main/java/com/cultivos/gestioncultivos_backend/exception/ApiExceptionHandler.java`.
- **Diferencias:** se restableció la correspondencia entre el servicio y el repositorio y quedó un único manejador para esa excepción.
- **Verificación:** `mvnw -q -DskipTests compile` terminó correctamente.
- **Código de uso:** depuración y revisión.
- **Reflexión:** La compilación ayuda a detectar referencias inexistentes, pero también conviene revisar duplicados de configuración que el compilador no detecta.

## Dudas técnicas consultadas

| Duda | Respuesta aplicada al proyecto |
|---|---|
| ¿Por qué `git pull` dice que la rama no tiene upstream? | La rama local de integración no estaba asociada a una rama remota. Se puede indicar `git pull origin nombre-rama` o configurar el seguimiento al crear una rama local. |
| ¿Por qué Ángel no aparece al ejecutar `git branch`? | `git branch` muestra ramas locales. `git branch -a` muestra también las referencias remotas. Para crear una local que siga a la remota se usa `git switch --track origin/feature/empleado-y-trabajador-funcionando-angel`. |
| ¿Qué diferencia hay entre `pull` y fusionar una rama? | `pull` trae cambios de una rama remota a la rama actual. Para incorporar funciones de otra rama se debe seleccionar esa rama como origen y resolver las diferencias, cuidando no mezclarla por error en otra rama. |
| ¿En un equipo conviene `rebase` o `merge` para integrar ramas ya compartidas? | En esta integración se usó `merge` para conservar los commits originales de cada integrante y registrar explícitamente la unión de las ramas. |
| ¿Qué significa que un archivo aparezca como `both modified` o `UU`? | Ambas ramas cambiaron el mismo archivo y Git necesita que se elija o combine el contenido. Después de resolverlo, `git add` marca ese archivo como resuelto; no se debe usar `--skip` para ocultar un conflicto de SQL. |
| ¿Cómo se verifica que las ramas ya quedaron integradas? | Se revisan `git log --graph` y `git merge-base --is-ancestor rama HEAD`. También se consulta `git status` para confirmar que no queden conflictos ni cambios sin guardar. |
| ¿Por qué un push puede ser rechazado después de hacer commits? | El repositorio remoto puede tener commits que no están en la rama local. Hay que traer e integrar la rama remota adecuada antes de volver a subir; no conviene forzar el push en una rama compartida. |
| ¿Cómo se conserva quién preparó o actualizó un pedido? | El identificador debe provenir de la sesión iniciada y guardarse en la distribución relacionada con el pedido. Así no se introduce un usuario manualmente ni se crea una entrega duplicada. |

## Commits relacionados

| Commit | Descripción |
|---|---|
| `c7884ee` | Integra funciones recientes de empleados y administración. |
| `815d74d` | Integra la rama de administración de usuarios. |
| `a6d6f27` | Integra la rama de funciones del empleado. |

Estos commits pertenecen a `kevin/integracion-funciones`. El reporte se guarda como documento individual del integrante 2; los commits de integración conservan también los cambios incorporados desde las ramas del equipo.
