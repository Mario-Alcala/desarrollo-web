package com.cultivos.gestioncultivos_backend.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class PedidoRepository {
    private final JdbcClient jdbc;

    public PedidoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> catalogo() {
        return jdbc.sql("""
                SELECT v.id_variedad AS "idVariedad", v.familia, v.nombre,
                       v.descripcion, v.imagen, v.precio_kilo AS "precioKilo",
                       c.id_cosecha AS "idCosecha", c.estado_maduracion AS maduracion,
                       c.cantidad_disponible AS kilos
                FROM variedades v
                JOIN cultivos cu ON cu.id_variedad = v.id_variedad
                JOIN cosechas c ON c.id_cultivo = cu.id
                WHERE c.cantidad_disponible > 0 AND v.precio_kilo > 0
                ORDER BY v.nombre, v.id_variedad, c.id_cosecha
                """).query().listOfRows();
    }

    public Map<String, Object> bloquearLote(int id) {
        // La fila queda bloqueada hasta terminar la transacción del pedido.
        List<Map<String, Object>> filas = jdbc.sql("""
                SELECT c.cantidad_disponible AS kilos, v.precio_kilo AS "precioKilo"
                FROM cosechas c
                JOIN cultivos cu ON cu.id = c.id_cultivo
                JOIN variedades v ON v.id_variedad = cu.id_variedad
                WHERE c.id_cosecha = :id FOR UPDATE
                """).param("id", id).query().listOfRows();
        if (filas.isEmpty()) {
            throw new IllegalArgumentException("El lote no existe o no tiene una variedad asignada.");
        }
        return filas.get(0);
    }

    public boolean esCliente(int idUsuario) {
        return jdbc.sql("SELECT COUNT(*) FROM usuarios WHERE id_usuario = :id AND rol = 'cliente'")
                .param("id", idUsuario).query(Integer.class).single() == 1;
    }

    public int insertarPedido(int usuario, String metodo, String entrega, BigDecimal total) {
        GeneratedKeyHolder clave = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO pedidos (id_usuario, metodo_pago, tipo_entrega, total)
                VALUES (:usuario, :metodo, :entrega, :total)
                """).param("usuario", usuario).param("metodo", metodo)
                .param("entrega", entrega).param("total", total).update(clave, "id_pedido");
        return clave.getKey().intValue();
    }

    public void insertarEntrega(int pedido, String direccion, LocalDate fecha) {
        jdbc.sql("""
                INSERT INTO distribuciones (id_pedido, direccion_entrega, fecha_recoleccion)
                VALUES (:pedido, :direccion, :fecha)
                """).param("pedido", pedido).param("direccion", direccion)
                .param("fecha", fecha).update();
    }

    public void insertarDetalle(int pedido, int cosecha, BigDecimal kilos, BigDecimal precio) {
        jdbc.sql("""
                INSERT INTO detalle_pedido (id_pedido, id_cosecha, cantidad, precio_unitario)
                VALUES (:pedido, :cosecha, :kilos, :precio)
                """).param("pedido", pedido).param("cosecha", cosecha)
                .param("kilos", kilos).param("precio", precio).update();
        int filas = jdbc.sql("""
                UPDATE cosechas SET cantidad_disponible = cantidad_disponible - :kilos
                WHERE id_cosecha = :id AND cantidad_disponible >= :kilos
                """).param("id", cosecha).param("kilos", kilos).update();
        if (filas != 1) {
            throw new IllegalArgumentException("El lote ya no tiene suficientes kilos.");
        }
    }

    public List<Map<String, Object>> historial(int usuario) {
        return jdbc.sql("""
                SELECT p.id_pedido AS "idPedido", p.fecha_pedido AS "fechaPedido",
                       p.metodo_pago AS "metodoPago", p.tipo_entrega AS "tipoEntrega",
                       p.estado, p.total, d.id_cosecha AS "idCosecha", d.cantidad AS kilos,
                       d.precio_unitario AS "precioKilo",
                       COALESCE(v.nombre, cu.nombre) AS nombre,
                       e.direccion_entrega AS direccion, e.fecha_recoleccion AS "fechaRecoleccion",
                       e.numero_rastreo1 AS rastreo
                FROM pedidos p
                JOIN detalle_pedido d ON d.id_pedido = p.id_pedido
                JOIN cosechas c ON c.id_cosecha = d.id_cosecha
                JOIN cultivos cu ON cu.id = c.id_cultivo
                LEFT JOIN variedades v ON v.id_variedad = cu.id_variedad
                LEFT JOIN distribuciones e ON e.id_pedido = p.id_pedido
                WHERE p.id_usuario = :usuario
                ORDER BY p.fecha_pedido DESC, p.id_pedido DESC, d.id_detalle
                """).param("usuario", usuario).query().listOfRows();
    }
}
