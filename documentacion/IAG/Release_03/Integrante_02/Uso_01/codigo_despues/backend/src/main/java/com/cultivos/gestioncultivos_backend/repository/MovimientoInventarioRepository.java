package com.cultivos.gestioncultivos_backend.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
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
        return jdbc.sql("SELECT * FROM movimientos_inventario ORDER BY fecha_movimiento DESC")
                .query(MovimientoInventario.class).list();
    }

    public MovimientoInventario buscarPorId(int id) {
        List<MovimientoInventario> resultado = jdbc.sql(
                "SELECT * FROM movimientos_inventario WHERE id_movimiento = :id")
                .param("id", id).query(MovimientoInventario.class).list();
        if (resultado.isEmpty()) {
            return null;
        }
        return resultado.get(0);
    }

    public List<MovimientoInventario> buscarPorInventario(int idInventario) {
        return jdbc.sql("""
                SELECT * FROM movimientos_inventario
                WHERE id_inventario = :id
                ORDER BY fecha_movimiento DESC
                """)
                .param("id", idInventario).query(MovimientoInventario.class).list();
    }

    public Inventario buscarInventario(int idInventario) {
        List<Inventario> resultado = jdbc.sql("""
                SELECT id_inventario, id_insumo, cantidad, fecha_ingreso, fecha_caducidad
                FROM inventario WHERE id_inventario = :id
                """)
                .param("id", idInventario).query(Inventario.class).list();
        if (resultado.isEmpty()) {
            return null;
        }
        return resultado.get(0);
    }

    public int registrarEntrada(int idInventario, BigDecimal cantidad) {
        return jdbc.sql("""
                UPDATE inventario SET cantidad = cantidad + :cantidad
                WHERE id_inventario = :id
                """)
                .param("cantidad", cantidad).param("id", idInventario).update();
    }

    public int registrarSalida(int idInventario, BigDecimal cantidad) {
        return jdbc.sql("""
                UPDATE inventario SET cantidad = cantidad - :cantidad
                WHERE id_inventario = :id AND cantidad >= :cantidad
                """)
                .param("cantidad", cantidad).param("id", idInventario).update();
    }

    public Integer insertar(MovimientoInventario movimiento) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO movimientos_inventario
                (id_inventario, id_usuario, tipo_movimiento, cantidad, observacion)
                VALUES (:inventario, :usuario, :tipo, :cantidad, :observacion)
                """)
                .param("inventario", movimiento.getIdInventario())
                .param("usuario", movimiento.getIdUsuario())
                .param("tipo", movimiento.getTipoMovimiento())
                .param("cantidad", movimiento.getCantidad())
                .param("observacion", movimiento.getObservacion())
                .update(llaves);
        return llaves.getKey().intValue();
    }
}
