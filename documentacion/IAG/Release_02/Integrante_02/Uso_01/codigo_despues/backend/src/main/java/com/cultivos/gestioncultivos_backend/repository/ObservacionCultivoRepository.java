package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.ObservacionCultivo;

@Repository
public class ObservacionCultivoRepository {

    private final JdbcClient jdbc;

    public ObservacionCultivoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<ObservacionCultivo> buscarTodas() {
        return jdbc.sql("""
                SELECT * FROM observaciones_cultivos
                ORDER BY id_observacion
                """)
                .query(ObservacionCultivo.class)
                .list();
    }

    public ObservacionCultivo buscarPorId(int id) {
        List<ObservacionCultivo> resultado = jdbc.sql("""
                SELECT * FROM observaciones_cultivos
                WHERE id_observacion = :id
                """)
                .param("id", id)
                .query(ObservacionCultivo.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public void insertar(ObservacionCultivo observacion) {
        jdbc.sql("""
                INSERT INTO observaciones_cultivos
                (id_cultivo, id_usuario, fecha_observacion, descripcion)
                VALUES
                (:cultivo, :usuario, :fecha, :descripcion)
                """)
                .param("cultivo", observacion.getIdCultivo())
                .param("usuario", observacion.getIdUsuario())
                .param("fecha", observacion.getFechaObservacion())
                .param("descripcion", observacion.getDescripcion())
                .update();
    }

    public void actualizar(ObservacionCultivo observacion) {
        jdbc.sql("""
                UPDATE observaciones_cultivos
                SET id_cultivo = :cultivo,
                    id_usuario = :usuario,
                    fecha_observacion = :fecha,
                    descripcion = :descripcion
                WHERE id_observacion = :id
                """)
                .param("cultivo", observacion.getIdCultivo())
                .param("usuario", observacion.getIdUsuario())
                .param("fecha", observacion.getFechaObservacion())
                .param("descripcion", observacion.getDescripcion())
                .param("id", observacion.getIdObservacion())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("""
                DELETE FROM observaciones_cultivos
                WHERE id_observacion = :id
                """)
                .param("id", id)
                .update();
    }
}
