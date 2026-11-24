# Reporte de IA para desarrollo

Proyecto: Gestión de Cultivos | Release: 04  
Integrante: Kevin Miguel García Montané — Integrante 2  
Herramienta: Codex | Modelo: GPT-6  
Repositorio: https://github.com/Mario-Alcala/desarrollo-web  
Rama local de integración: kevin/integracion-funciones

## Uso 01 — Contratos de esquema y backend
Prompt de trabajo: Revisa init.sql y las clases de parcela, terreno, inventario, usuario y clima. Haz coincidir campos entre SQL, Java y API y conserva las relaciones elegidas.  
Respuesta aplicada: ajustes en esquema y capas de persistencia de parcelas, insumos, inventario, terrenos, usuarios y clima.  
Anterior: 9ed045e. Posterior: 087c022. Diferencias: git diff --stat 9ed045e 087c022. Incluye init.sql, controladores, modelos, repositorios y servicios de Clima, Parcela, Terreno, Insumo y Usuario.  
Prueba: compilación de backend y revisión de rutas/contratos durante el trabajo.  
Uso: generación, modificación y depuración. Reflexión: comprobé que nombres y unidades coincidan entre HTML, JSON, Java y SQL.

## Uso 02 — Catálogo y pedido asociados a lotes
Prompt de trabajo: Relaciona el catálogo con cosechas usando IDs. Al confirmar una compra conserva el lote, kilos y precio por kilo, sin comparar nombres de productos.  
Respuesta aplicada: se añadió consulta de catálogo y modelo de pedido nuevo, con ajustes en servicio/repositorio y pantallas del cliente.  
Anterior: 6dfe008. Posterior: 2c245eb. Diferencias: git diff --stat 6dfe008 2c245eb. Incluye CatalogoController, PedidoNuevo, PedidoRepository/Service, cambios de cosecha/cultivo/riego, catálogo, pago e historial.  
Prueba: revisión del contrato API entre catálogo y capas Java.  
Uso: generación, modificación e integración. Reflexión: variedad es identidad comercial; id_cosecha identifica los kilos comprables.

## Uso 03 — Integrar administración y funciones de empleado
Prompt de trabajo: Usa mi rama como base; conserva init.sql y adapta usuarios-admin y empleado-y-trabajador-funcionando-angel a las rutas y datos acordados.  
Respuesta aplicada: commits locales separados integraron cambios del backend, administración de usuarios y funciones del trabajador, manteniendo visibles las ramas fuente.  
Anterior: 2c245eb y d479a16. Posterior: c7884ee, 815d74d y a6d6f27. Diferencias: git show --stat c7884ee; git show --stat 815d74d; git show --stat a6d6f27.  
Prueba: compilación Maven y revisión de sintaxis JavaScript en la integración.  
Uso: revisión, modificación, depuración e integración. Reflexión: el contenido de un merge puede incluir código de otros; el historial permite separar autorías.

## Uso 04 — Upstream, ramas remotas y cambios protegidos
Prompt de trabajo: Explica por qué pull no conoce la rama destino, cómo obtener la rama remota de Ángel localmente y cómo revisar cambios sin perder el trabajo actual.  
Respuesta aplicada: se distinguieron ramas locales y referencias remotas, y se integró la referencia correcta en la rama de trabajo.  
Anterior: rama local sin seguimiento. Posterior: historial de integración hasta a6d6f27. Diferencias: git branch -a; git log --graph --oneline --decorate; git show --stat a6d6f27.  
Prueba: la rama local pudo compararse con la remota y el historial mostró los merges.  
Uso: explicación y depuración de Git. Reflexión: confirmar rama activa, upstream y estado antes de pull o switch evita mezclar versiones.
