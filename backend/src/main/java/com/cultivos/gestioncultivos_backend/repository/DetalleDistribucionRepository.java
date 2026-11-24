package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.DetalleDistribucion;

@Repository
public class DetalleDistribucionRepository {

    private final JdbcClient jdbc;

    public DetalleDistribucionRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<DetalleDistribucion> buscarTodos() {
        return jdbc.sql("SELECT * FROM detalle_distribucion ORDER BY id_detalle")
                .query(DetalleDistribucion.class)
                .list();
    }

    public List<DetalleDistribucion> buscarPorDistribucion(int idDistribucion) {
        return jdbc.sql("""
                SELECT * FROM detalle_distribucion
                WHERE id_distribucion = :idDistribucion
                ORDER BY id_detalle
                """)
                .param("idDistribucion", idDistribucion)
                .query(DetalleDistribucion.class)
                .list();
    }

    public DetalleDistribucion buscarPorId(int id) {
        List<DetalleDistribucion> resultado = jdbc.sql(
                "SELECT * FROM detalle_distribucion WHERE id_detalle = :id")
                .param("id", id)
                .query(DetalleDistribucion.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public void insertar(DetalleDistribucion detalle) {
        jdbc.sql("""
                INSERT INTO detalle_distribucion
                (id_distribucion, id_cosecha, cantidad)
                VALUES
                (:idDistribucion, :idCosecha, :cantidad)
                """)
                .param("idDistribucion", detalle.getIdDistribucion())
                .param("idCosecha", detalle.getIdCosecha())
                .param("cantidad", detalle.getCantidad())
                .update();
    }

    public void actualizar(DetalleDistribucion detalle) {
        jdbc.sql("""
                UPDATE detalle_distribucion
                SET id_distribucion = :idDistribucion,
                    id_cosecha = :idCosecha,
                    cantidad = :cantidad
                WHERE id_detalle = :id
                """)
                .param("idDistribucion", detalle.getIdDistribucion())
                .param("idCosecha", detalle.getIdCosecha())
                .param("cantidad", detalle.getCantidad())
                .param("id", detalle.getIdDetalle())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("DELETE FROM detalle_distribucion WHERE id_detalle = :id")
                .param("id", id)
                .update();
    }
}