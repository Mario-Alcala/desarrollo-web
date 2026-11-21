package com.cultivos.gestioncultivos_backend.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
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
                       COUNT(dp.id_detalle) AS cantidad_lotes
                FROM pedidos p
                JOIN usuarios u ON u.id_usuario = p.id_usuario
                LEFT JOIN distribuciones d ON d.id_pedido = p.id_pedido
                LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
                GROUP BY p.id_pedido, p.id_usuario, u.nombre_usuario,
                         p.fecha_pedido, p.tipo_entrega, p.estado, p.total,
                         d.estado, d.fecha_salida, d.fecha_entrega
                ORDER BY p.fecha_pedido DESC, p.id_pedido DESC
                """)
                .query(Pedido.class).list();
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

    public int cambiarEntrega(int idPedido, String estadoEntrega, String estadoPedido) {
        jdbc.sql("""
                INSERT INTO distribuciones (id_pedido, fecha_salida, fecha_entrega, estado)
                VALUES (
                    :pedido,
                    CASE WHEN :estado = 'en_transito' THEN CURRENT_TIMESTAMP ELSE NULL END,
                    CASE WHEN :estado = 'entregado' THEN CURRENT_TIMESTAMP ELSE NULL END,
                    :estado
                )
                ON DUPLICATE KEY UPDATE
                    fecha_salida = CASE WHEN :estado = 'en_transito' THEN COALESCE(fecha_salida, CURRENT_TIMESTAMP) ELSE fecha_salida END,
                    fecha_entrega = CASE WHEN :estado = 'entregado' THEN CURRENT_TIMESTAMP ELSE fecha_entrega END,
                    estado = :estado
                """)
                .param("pedido", idPedido).param("estado", estadoEntrega).update();
        return jdbc.sql("UPDATE pedidos SET estado = :estado WHERE id_pedido = :pedido")
                .param("estado", estadoPedido).param("pedido", idPedido).update();
    }
}
