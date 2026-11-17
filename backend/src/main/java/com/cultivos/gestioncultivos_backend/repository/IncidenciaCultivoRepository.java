package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.IncidenciaCultivo;

@Repository
public class IncidenciaCultivoRepository {

    private final JdbcClient jdbc;

    public IncidenciaCultivoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<IncidenciaCultivo> buscarTodas() {
        return jdbc.sql("""
                SELECT * FROM incidencias_cultivo
                ORDER BY id_incidencia
                """)
                .query(IncidenciaCultivo.class)
                .list();
    }

    public IncidenciaCultivo buscarPorId(int id) {
        List<IncidenciaCultivo> resultado = jdbc.sql("""
                SELECT * FROM incidencias_cultivo
                WHERE id_incidencia = :id
                """)
                .param("id", id)
                .query(IncidenciaCultivo.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public void insertar(IncidenciaCultivo incidencia) {
        jdbc.sql("""
                INSERT INTO incidencias_cultivo
                (id_cultivo, id_usuario, fecha_incidencia,
                 tipo_incidencia, descripcion, nivel_gravedad)
                VALUES
                (:cultivo, :usuario, :fecha,
                 :tipo, :descripcion, :gravedad)
                """)
                .param("cultivo", incidencia.getIdCultivo())
                .param("usuario", incidencia.getIdUsuario())
                .param("fecha", incidencia.getFechaIncidencia())
                .param("tipo", incidencia.getTipoIncidencia())
                .param("descripcion", incidencia.getDescripcion())
                .param("gravedad", incidencia.getNivelGravedad())
                .update();
    }

    public void actualizar(IncidenciaCultivo incidencia) {
        jdbc.sql("""
                UPDATE incidencias_cultivo
                SET id_cultivo = :cultivo,
                    id_usuario = :usuario,
                    fecha_incidencia = :fecha,
                    tipo_incidencia = :tipo,
                    descripcion = :descripcion,
                    nivel_gravedad = :gravedad
                WHERE id_incidencia = :id
                """)
                .param("cultivo", incidencia.getIdCultivo())
                .param("usuario", incidencia.getIdUsuario())
                .param("fecha", incidencia.getFechaIncidencia())
                .param("tipo", incidencia.getTipoIncidencia())
                .param("descripcion", incidencia.getDescripcion())
                .param("gravedad", incidencia.getNivelGravedad())
                .param("id", incidencia.getIdIncidencia())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("""
                DELETE FROM incidencias_cultivo
                WHERE id_incidencia = :id
                """)
                .param("id", id)
                .update();
    }
}