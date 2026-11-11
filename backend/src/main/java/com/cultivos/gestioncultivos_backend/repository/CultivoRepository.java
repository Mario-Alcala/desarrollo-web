package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import com.cultivos.gestioncultivos_backend.model.cultivo;

/** Capa de datos: SQL puro con JdbcClient (sin Hibernate). */

@Repository
public class CultivoRepository {

    private final JdbcClient jdbc;

    public CultivoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Cultivo> buscarTodos() {
        return jdbc.sql("SELECT * FROM cultivos ORDER BY id")
                .query(Cultivo.class)
                .list();
    }

    public List<Cultivo> buscarPorEtapa(String etapa) {
        return jdbc.sql("SELECT * FROM cultivos WHERE etapa_fenologica = :etapa ORDER BY id")
                .param("etapa", etapa)
                .query(Cultivo.class)
                .list();
    }

    public Optional<Cultivo> buscarPorId(Long id) {
        return jdbc.sql("SELECT * FROM cultivos WHERE id = :id")
                .param("id", id)
                .query(Cultivo.class)
                .optional();
    }

    /** Inserta el cultivo y devuelve el id generado por MySQL. */
    
    public Long insertar(Cultivo c) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO cultivos (nombre, tipo, etapa_fenologica, fecha_registro)
                VALUES (:nombre, :tipo, :etapa, :fecha)
                """)
                .param("nombre", c.getNombre())
                .param("tipo", c.getTipo())
                .param("etapa", c.getEtapaFenologica())
                .param("fecha", c.getFechaRegistro())
                .update(llaves);
        return llaves.getKey().longValue();
    }

    public boolean actualizar(Cultivo c) {
        int filas = jdbc.sql("""
                UPDATE cultivos
                   SET nombre = :nombre, tipo = :tipo,
                       etapa_fenologica = :etapa, fecha_registro = :fecha
                 WHERE id = :id
                """)
                .param("nombre", c.getNombre())
                .param("tipo", c.getTipo())
                .param("etapa", c.getEtapaFenologica())
                .param("fecha", c.getFechaRegistro())
                .param("id", c.getId())
                .update();
        return filas > 0;
    }

    public boolean eliminar(Long id) {
        int filas = jdbc.sql("DELETE FROM cultivos WHERE id = :id")
                .param("id", id)
                .update();
        return filas > 0;
    }
}
