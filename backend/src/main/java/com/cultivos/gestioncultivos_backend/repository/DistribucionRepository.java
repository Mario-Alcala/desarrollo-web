package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Distribucion;

@Repository
public class DistribucionRepository {

    private final JdbcClient jdbc;

    public DistribucionRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Distribucion> buscarTodas() {
        return jdbc.sql("SELECT * FROM distribucion ORDER BY id_distribucion")
                .query(Distribucion.class)
                .list();
    }

    public Distribucion buscarPorId(int id) {
        List<Distribucion> resultado = jdbc.sql(
                "SELECT * FROM distribucion WHERE id_distribucion = :id")
                .param("id", id)
                .query(Distribucion.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public void insertar(Distribucion distribucion) {
        jdbc.sql("""
                INSERT INTO distribucion
                (fecha_salida, fecha_entrega, destino, responsable, estado)
                VALUES
                (:fechaSalida, :fechaEntrega, :destino, :responsable, :estado)
                """)
                .param("fechaSalida", distribucion.getFechaSalida())
                .param("fechaEntrega", distribucion.getFechaEntrega())
                .param("destino", distribucion.getDestino())
                .param("responsable", distribucion.getResponsable())
                .param("estado", distribucion.getEstado())
                .update();
    }

    public void actualizar(Distribucion distribucion) {
        jdbc.sql("""
                UPDATE distribucion
                SET fecha_salida = :fechaSalida,
                    fecha_entrega = :fechaEntrega,
                    destino = :destino,
                    responsable = :responsable,
                    estado = :estado
                WHERE id_distribucion = :id
                """)
                .param("fechaSalida", distribucion.getFechaSalida())
                .param("fechaEntrega", distribucion.getFechaEntrega())
                .param("destino", distribucion.getDestino())
                .param("responsable", distribucion.getResponsable())
                .param("estado", distribucion.getEstado())
                .param("id", distribucion.getIdDistribucion())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("DELETE FROM distribucion WHERE id_distribucion = :id")
                .param("id", id)
                .update();
    }
}