package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.SeguimientoIncidencia;

@Repository
public class SeguimientoIncidenciaRepository {

    private final JdbcClient jdbc;

    public SeguimientoIncidenciaRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<SeguimientoIncidencia> buscarTodos() {
        return jdbc.sql("""
                SELECT * FROM seguimientos_incidencia
                ORDER BY fecha DESC, id_seguimiento DESC
                """)
                .query(SeguimientoIncidencia.class)
                .list();
    }

    public List<SeguimientoIncidencia> buscarPorIncidencia(int idIncidencia) {
        return jdbc.sql("""
                SELECT * FROM seguimientos_incidencia
                WHERE id_incidencia = :id
                ORDER BY fecha DESC, id_seguimiento DESC
                """)
                .param("id", idIncidencia)
                .query(SeguimientoIncidencia.class)
                .list();
    }

    public int insertar(SeguimientoIncidencia seguimiento) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO seguimientos_incidencia
                (id_incidencia, id_usuario, fecha, accion_realizada, observacion)
                VALUES
                (:incidencia, :usuario, :fecha, :accion, :observacion)
                """)
                .param("incidencia", seguimiento.getIdIncidencia())
                .param("usuario", seguimiento.getIdUsuario())
                .param("fecha", seguimiento.getFecha())
                .param("accion", seguimiento.getAccionRealizada())
                .param("observacion", seguimiento.getObservacion())
                .update(llaves);
        return llaves.getKey().intValue();
    }
}
