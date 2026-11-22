# Reflexión — Uso 05: Pantalla de Pedidos y entregas (lista)

La IA me generó la lista de pedidos siguiendo la misma estructura de mi página de Catálogo
(menú y barra superior dibujados por sidebar.js, filtros en chips, mensaje de estado arriba).
Lo pegué en VS Code y lo probé en el navegador.
el documento del proyecto pide que el total de un pedido se calcule con su detalle si ambia un renglón, el total nunca queda desactualizado ni contradice al detalle. El álculo  stá en totalPedido (pedidos-comun.js): recorre los renglones del pedido y suma kg × precioPorKg de cada uno. El precio va dentro del renglón para que un pedido conserve el precio del día aunque luego cambie el catálogo.
