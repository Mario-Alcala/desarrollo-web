package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Inventario;

@Repository
public class InventarioRepository {

    private static final String CONSULTA_CON_INSUMO = """
            SELECT i.id_inventario, i.id_insumo, i.cantidad, i.fecha_ingreso,
                   i.fecha_caducidad, n.nombre AS nombre_insumo,
                   n.categoria, n.unidad_medida
            FROM inventario i
            JOIN insumos n ON n.id_insumo = i.id_insumo
            """;

    private final JdbcClient jdbc;

    public InventarioRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Inventario> buscarTodos() {
        return jdbc.sql(CONSULTA_CON_INSUMO + " ORDER BY i.id_inventario")
                .query(Inventario.class).list();
    }

    public List<Inventario> buscarPorInsumo(int idInsumo) {
        return jdbc.sql(CONSULTA_CON_INSUMO + " WHERE i.id_insumo = :id ORDER BY i.fecha_ingreso")
                .param("id", idInsumo).query(Inventario.class).list();
    }

    public List<Inventario> buscarPorCategoria(String categoria) {
        return jdbc.sql(CONSULTA_CON_INSUMO + " WHERE n.categoria = :categoria ORDER BY i.id_inventario")
                .param("categoria", categoria).query(Inventario.class).list();
    }

    public Inventario buscarPorId(int id) {
        List<Inventario> resultado = jdbc.sql(CONSULTA_CON_INSUMO + " WHERE i.id_inventario = :id")
                .param("id", id).query(Inventario.class).list();
        if (resultado.isEmpty()) {
            return null;
        }
        return resultado.get(0);
    }

    public Integer insertar(Inventario inventario) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO inventario (id_insumo, cantidad, fecha_ingreso, fecha_caducidad)
                VALUES (:insumo, :cantidad, :ingreso, :caducidad)
                """)
                .param("insumo", inventario.getIdInsumo())
                .param("cantidad", inventario.getCantidad())
                .param("ingreso", inventario.getFechaIngreso())
                .param("caducidad", inventario.getFechaCaducidad())
                .update(llaves);
        return llaves.getKey().intValue();
    }

    public boolean actualizar(Inventario inventario) {
        int filas = jdbc.sql("""
                UPDATE inventario
                SET id_insumo = :insumo, cantidad = :cantidad,
                    fecha_ingreso = :ingreso, fecha_caducidad = :caducidad
                WHERE id_inventario = :id
                """)
                .param("insumo", inventario.getIdInsumo())
                .param("cantidad", inventario.getCantidad())
                .param("ingreso", inventario.getFechaIngreso())
                .param("caducidad", inventario.getFechaCaducidad())
                .param("id", inventario.getIdInventario())
                .update();
        return filas > 0;
    }

    public boolean eliminar(int id) {
        int filas = jdbc.sql("DELETE FROM inventario WHERE id_inventario = :id")
                .param("id", id).update();
        return filas > 0;
    }

    public boolean existeInsumo(int idInsumo) {
        Integer cantidad = jdbc.sql("SELECT COUNT(*) FROM insumos WHERE id_insumo = :id")
                .param("id", idInsumo).query(Integer.class).single();
        return cantidad > 0;
    }
}
