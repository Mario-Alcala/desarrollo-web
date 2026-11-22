# Respuesta de la IA — Uso_04: Bodega

## Qué entregó Claude
1. Datos de ejemplo para `js/admin-datos.js`: `BODEGAS` (2), `INVENTARIO` (7 lotes), `HERRAMIENTAS` (6),
   `MOVIMIENTOS` (4).
2. Un ajuste pequeño de estilos para `css/admin-vistas.css` (ancho del selector, números a la derecha).
3. `frontend/bodega.html`: cuatro pestañas (Insumos, Herramientas, Cosechas, Movimientos), selector de
   bodega, tabla y ventana para registrar movimientos.
4. `frontend/js/bodega.js`: toda la lógica.
5. "Paso 5. Probar" (lista de verificación para el estudiante) y comandos git sugeridos.

## Reglas de la especificación implementadas
- Lotes de inventario enlazados a insumo, proveedor y bodega; la unidad sale del insumo, no se repite.
- Caducidad opcional: "Sin caducidad", "Caduca en N d" (30 días o menos) y "Caducado".
- Entradas y salidas registradas como movimientos de inventario; la salida no puede superar lo disponible.
- Al guardar un movimiento se actualiza la cantidad del lote y se agrega el movimiento a la lista.
- Herramientas en la misma interfaz, con su bodega y estado.
- Cosechas solo de consulta, como lote disponible para venta ("Disponible para venta" o "Agotado"); los
  kilos no se guardan de nuevo en otro lado.
- Filtro por bodega y buscador de la barra superior.

## Qué falló o se descartó
Texto de mas tuve que cambiar algunos titulos y textos

## Pendiente y limitaciones
- Datos de ejemplo: no se conecta a la API; no verifiqué rutas de bodegas, inventario ni movimientos.
- Cambios solo en memoria; el usuario que registra el movimiento está escrito fijo ("Administrador / Agricultor");
  la especificación guarda un id de usuario.
- El selector de lote del movimiento muestra todas las bodegas, aunque haya un filtro activo.
- Alta de herramientas, motivo de la salida y descuento de cosecha al vender: no implementados.
- La IA no ejecutó ni probó el código; no generó pruebas automatizadas.