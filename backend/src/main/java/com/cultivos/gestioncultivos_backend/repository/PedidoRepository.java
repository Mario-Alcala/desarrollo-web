package com.cultivos.gestioncultivos_backend.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Pedido;
import com.cultivos.gestioncultivos_backend.model.PedidoLote;

@Repository
public class PedidoRepository {
    private final JdbcClient jdbc;

    public PedidoRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public List<Pedido> listar() {
        return jdbc.sql("""
                SELECT p.id_pedido, p.id_usuario, u.nombre_usuario AS cliente,
                       p.fecha_pedido, p.tipo_entrega, p.estado, p.total,
                       d.estado AS estado_entrega, d.fecha_salida, d.fecha_entrega,
                       d.numero_rastreo1 AS numero_rastreo, d.direccion_entrega AS direccion_entrega,
                       d.fecha_recoleccion AS fecha_recoleccion,
                       d.id_usuario AS id_responsable, r.nombre_usuario AS responsable,
                       COUNT(dp.id_detalle) AS cantidad_lotes,
                       CASE WHEN SUM(CASE WHEN dp.precio_unitario > 0 THEN 1 ELSE 0 END) > 0
                            THEN TRUE ELSE FALSE END AS compra_catalogo
                FROM pedidos p
                JOIN usuarios u ON u.id_usuario = p.id_usuario
                LEFT JOIN distribuciones d ON d.id_pedido = p.id_pedido
                LEFT JOIN usuarios r ON r.id_usuario = d.id_usuario
                LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
                GROUP BY p.id_pedido, p.id_usuario, u.nombre_usuario,
                         p.fecha_pedido, p.tipo_entrega, p.estado, p.total,
                         d.estado, d.fecha_salida, d.fecha_entrega, d.numero_rastreo1,
                         d.direccion_entrega, d.fecha_recoleccion, d.id_usuario, r.nombre_usuario
                ORDER BY p.fecha_pedido DESC, p.id_pedido DESC
                """)
                .query(Pedido.class).list();
    }

    public List<Map<String, Object>> catalogoCliente() {
        return jdbc.sql("""
                SELECT v.id_variedad AS idVariedad, f.nombre AS familia, v.nombre AS variedad,
                       v.descripcion AS descripcion, v.imagen_url AS imagenUrl,
                       v.precio_por_kg AS precioPorKg, c.id_cosecha AS idCosecha,
                       c.estado_maduracion AS maduracion, c.cantidad_disponible AS kilos,
                       c.ubicacion_bodega AS ubicacionBodega
                FROM variedades_producto v
                JOIN familias_producto f ON f.id_familia = v.id_familia
                JOIN cultivos cu ON cu.id_variedad = v.id_variedad
                    OR (cu.id_variedad IS NULL AND LOWER(cu.nombre) = LOWER(CONCAT(f.nombre, ' ', v.nombre)))
                JOIN cosechas c ON c.id_cultivo = cu.id
                WHERE c.cantidad_disponible > 0 AND v.precio_por_kg > 0
                ORDER BY f.nombre, v.nombre, c.fecha_cosecha, c.id_cosecha
                """).query().listOfRows();
    }

    public boolean esCliente(int idUsuario) {
        return jdbc.sql("SELECT COUNT(*) FROM usuarios WHERE id_usuario = :id AND rol = 'cliente'")
                .param("id", idUsuario).query(Integer.class).single() > 0;
    }

    public Map<String, Object> bloquearLoteParaVenta(int idCosecha) {
        List<Map<String, Object>> filas = jdbc.sql("""
                SELECT c.cantidad_disponible AS kilos, v.precio_por_kg AS precioPorKg
                FROM cosechas c
                JOIN cultivos cu ON cu.id = c.id_cultivo
                JOIN variedades_producto v ON v.id_variedad = cu.id_variedad OR cu.id_variedad IS NULL
                JOIN familias_producto f ON f.id_familia = v.id_familia
                WHERE c.id_cosecha = :id AND c.cantidad_disponible > 0
                  AND (cu.id_variedad IS NOT NULL OR LOWER(cu.nombre) = LOWER(CONCAT(f.nombre, ' ', v.nombre)))
                FOR UPDATE
                """).param("id", idCosecha).query().listOfRows();
        return filas.isEmpty() ? null : filas.get(0);
    }

    public int insertarCompra(int idUsuario, String metodoPago, String tipoEntrega, BigDecimal total) {
        KeyHolder llave = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO pedidos (id_usuario, metodo_pago, tipo_entrega, estado, total)
                VALUES (:usuario, :metodo, :entrega, 'pendiente', :total)
                """)
                .param("usuario", idUsuario).param("metodo", metodoPago)
                .param("entrega", tipoEntrega).param("total", total).update(llave);
        return llave.getKey().intValue();
    }

    public void insertarEntregaCliente(int idPedido, String direccion, LocalDate fechaRecoleccion) {
        jdbc.sql("""
                INSERT INTO distribuciones (id_pedido, direccion_entrega, fecha_recoleccion, estado)
                VALUES (:pedido, :direccion, :fecha, 'pendiente')
                """)
                .param("pedido", idPedido).param("direccion", direccion)
                .param("fecha", fechaRecoleccion).update();
    }

    public void insertarDetalleCompra(int idPedido, int idCosecha, BigDecimal kilos, BigDecimal precio) {
        jdbc.sql("""
                INSERT INTO detalle_pedido (id_pedido, id_cosecha, cantidad, precio_unitario)
                VALUES (:pedido, :cosecha, :kilos, :precio)
                """)
                .param("pedido", idPedido).param("cosecha", idCosecha)
                .param("kilos", kilos).param("precio", precio).update();
        int filas = jdbc.sql("""
                UPDATE cosechas SET cantidad_disponible = cantidad_disponible - :kilos
                WHERE id_cosecha = :id AND cantidad_disponible >= :kilos
                """)
                .param("id", idCosecha).param("kilos", kilos).update();
        if (filas != 1) throw new IllegalArgumentException("Ya no hay suficientes kilos en el lote seleccionado.");
    }

    public List<Map<String, Object>> historialCliente(int idUsuario) {
        return jdbc.sql("""
                SELECT p.id_pedido AS idPedido, p.fecha_pedido AS fechaPedido,
                       p.metodo_pago AS metodoPago, p.tipo_entrega AS tipoEntrega,
                       p.estado AS estadoPedido, p.total AS total,
                       dp.id_cosecha AS idCosecha, dp.cantidad AS kilos,
                       dp.precio_unitario AS precioPorKg,
                       COALESCE(v.nombre, cu.nombre) AS variedad,
                       f.nombre AS familia, c.estado_maduracion AS maduracion,
                       d.direccion_entrega AS direccion, d.fecha_recoleccion AS fechaRecoleccion,
                       d.numero_rastreo1 AS numeroRastreo, d.estado AS estadoEntrega
                FROM pedidos p
                JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
                JOIN cosechas c ON c.id_cosecha = dp.id_cosecha
                JOIN cultivos cu ON cu.id = c.id_cultivo
                LEFT JOIN variedades_producto v ON v.id_variedad = cu.id_variedad
                LEFT JOIN familias_producto f ON f.id_familia = v.id_familia
                LEFT JOIN distribuciones d ON d.id_pedido = p.id_pedido
                WHERE p.id_usuario = :usuario
                ORDER BY p.fecha_pedido DESC, p.id_pedido DESC, dp.id_detalle
                """)
                .param("usuario", idUsuario).query().listOfRows();
    }

    public Optional<Pedido> buscar(int id) {
        return listar().stream().filter(p -> p.getIdPedido() == id).findFirst();
    }

    public List<PedidoLote> listarLotes(int idPedido) {
        return jdbc.sql("""
                SELECT dp.id_detalle, dp.id_cosecha, cu.nombre AS producto,
                       c.estado_maduracion AS maduracion, dp.cantidad,
                       c.cantidad_disponible AS disponible
                FROM detalle_pedido dp
                JOIN cosechas c ON c.id_cosecha = dp.id_cosecha
                JOIN cultivos cu ON cu.id = c.id_cultivo
                WHERE dp.id_pedido = :idPedido
                ORDER BY dp.id_detalle
                """)
                .param("idPedido", idPedido)
                .query(PedidoLote.class).list();
    }

    public BigDecimal bloquearDisponible(int idCosecha) {
        return jdbc.sql("SELECT cantidad_disponible FROM cosechas WHERE id_cosecha = :id FOR UPDATE")
                .param("id", idCosecha).query(BigDecimal.class).optional().orElse(null);
    }

    public void descontarDisponible(int idCosecha, BigDecimal kilos) {
        jdbc.sql("UPDATE cosechas SET cantidad_disponible = cantidad_disponible - :kilos WHERE id_cosecha = :id AND cantidad_disponible >= :kilos")
                .param("kilos", kilos).param("id", idCosecha).update();
    }

    public void insertarLote(int idPedido, int idCosecha, BigDecimal kilos) {
        jdbc.sql("INSERT INTO detalle_pedido (id_pedido, id_cosecha, cantidad, precio_unitario) VALUES (:pedido, :cosecha, :kilos, 0)")
                .param("pedido", idPedido).param("cosecha", idCosecha).param("kilos", kilos).update();
    }

    public int cambiarEntrega(int idPedido, String estadoEntrega, String estadoPedido, String numeroRastreo, Integer idResponsable) {
        jdbc.sql("""
                INSERT INTO distribuciones (id_pedido, id_usuario, fecha_salida, fecha_entrega, numero_rastreo1, estado)
                VALUES (
                    :pedido,
                    :responsable,
                    CASE WHEN :estado = 'en_transito' THEN CURRENT_TIMESTAMP ELSE NULL END,
                    CASE WHEN :estado = 'entregado' THEN CURRENT_TIMESTAMP ELSE NULL END,
                    NULLIF(:rastreo, ''),
                    :estado
                )
                ON DUPLICATE KEY UPDATE
                    fecha_salida = CASE WHEN :estado = 'en_transito' THEN COALESCE(fecha_salida, CURRENT_TIMESTAMP) ELSE fecha_salida END,
                    fecha_entrega = CASE WHEN :estado = 'entregado' THEN CURRENT_TIMESTAMP ELSE fecha_entrega END,
                    numero_rastreo1 = COALESCE(NULLIF(:rastreo, ''), numero_rastreo1),
                    estado = :estado,
                    id_usuario = COALESCE(:responsable, id_usuario)
                """)
                .param("pedido", idPedido).param("estado", estadoEntrega)
                .param("rastreo", numeroRastreo == null ? "" : numeroRastreo)
                .param("responsable", idResponsable).update();
        return jdbc.sql("UPDATE pedidos SET estado = :estado WHERE id_pedido = :pedido")
                .param("estado", estadoPedido).param("pedido", idPedido).update();
    }
}
