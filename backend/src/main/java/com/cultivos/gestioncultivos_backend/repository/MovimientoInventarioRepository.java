package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Inventario;
import com.cultivos.gestioncultivos_backend.model.MovimientoInventario;

@Repository
public class MovimientoInventarioRepository {

    private final JdbcClient jdbc;

    public MovimientoInventarioRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<MovimientoInventario> buscarTodos() {
        return jdbc.sql("""
                SELECT * FROM movimientos_inventario
                ORDER BY fecha_movimiento DESC
                """)
                .query(MovimientoInventario.class)
                .list();
    }

    public MovimientoInventario buscarPorId(int id) {
        List<MovimientoInventario> resultado = jdbc.sql("""
                SELECT * FROM movimientos_inventario
                WHERE id_movimiento = :id
                """)
                .param("id", id)
                .query(MovimientoInventario.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public List<MovimientoInventario> buscarPorInventario(int idInventario) {
        return jdbc.sql("""
                SELECT * FROM movimientos_inventario
                WHERE id_inventario = :idInventario
                ORDER BY fecha_movimiento DESC
                """)
                .param("idInventario", idInventario)
                .query(MovimientoInventario.class)
                .list();
    }

    public Inventario buscarInventario(int idInventario) {
        List<Inventario> resultado = jdbc.sql("""
                SELECT * FROM inventario
                WHERE id_inventario = :id
                """)
                .param("id", idInventario)
                .query(Inventario.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public int registrarEntrada(int idInventario, int cantidad) {
        return jdbc.sql("""
                UPDATE inventario
                SET cantidad = cantidad + :cantidad
                WHERE id_inventario = :id
                """)
                .param("cantidad", cantidad)
                .param("id", idInventario)
                .update();
    }

    public int registrarSalida(int idInventario, int cantidad) {
        return jdbc.sql("""
                UPDATE inventario
                SET cantidad = cantidad - :cantidad
                WHERE id_inventario = :id
                  AND cantidad >= :cantidad
                """)
                .param("cantidad", cantidad)
                .param("id", idInventario)
                .update();
    }

    public void insertar(MovimientoInventario movimiento) {
        jdbc.sql("""
                INSERT INTO movimientos_inventario
                (id_inventario, tipo_movimiento, cantidad)
                VALUES
                (:idInventario, :tipo, :cantidad)
                """)
                .param("idInventario", movimiento.getIdInventario())
                .param("tipo", movimiento.getTipoMovimiento())
                .param("cantidad", movimiento.getCantidad())
                .update();
    }
}