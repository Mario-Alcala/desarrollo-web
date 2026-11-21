package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import com.cultivos.gestioncultivos_backend.model.Cultivo;

/** Capa de datos: SQL puro con JdbcClient (sin Hibernate). */

@Repository
public class CultivoRepository {

    private final JdbcClient jdbc;

    public CultivoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Cultivo> buscarTodos() {
        return jdbc.sql("SELECT c.*, c.familia AS tipo, c.fecha_siembra AS fecha_registro FROM cultivos c ORDER BY c.id")
                .query(Cultivo.class)
                .list();
    }

    public List<Cultivo> buscarPorEtapa(String etapa) {
        return jdbc.sql("SELECT c.*, c.familia AS tipo, c.fecha_siembra AS fecha_registro FROM cultivos c WHERE c.etapa_fenologica = :etapa ORDER BY c.id")
                .param("etapa", etapa)
                .query(Cultivo.class)
                .list();
    }

    public Optional<Cultivo> buscarPorId(Long id) {
        return jdbc.sql("SELECT c.*, c.familia AS tipo, c.fecha_siembra AS fecha_registro FROM cultivos c WHERE c.id = :id")
                .param("id", id)
                .query(Cultivo.class)
                .optional();
    }

    /** Inserta el cultivo y devuelve el id generado por MySQL. */
    
    public Long insertar(Cultivo c) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO cultivos (id_parcela, nombre, familia, etapa_fenologica, fecha_siembra, estado)
                VALUES (:parcela, :nombre, :familia, :etapa, :fecha, :estado)
                """)
                .param("parcela", c.getIdParcela())
                .param("nombre", c.getNombre())
                .param("familia", c.getFamilia() != null ? c.getFamilia() : c.getTipo())
                .param("etapa", c.getEtapaFenologica())
                .param("fecha", c.getFechaSiembra() != null ? c.getFechaSiembra() : c.getFechaRegistro())
                .param("estado", c.getEstado() == null ? "activo" : c.getEstado())
                .update(llaves);
        return llaves.getKey().longValue();
    }

    public boolean actualizar(Cultivo c) {
        int filas = jdbc.sql("""
                UPDATE cultivos
                   SET id_parcela = :parcela, nombre = :nombre, familia = :familia,
                       etapa_fenologica = :etapa, fecha_siembra = :fecha, estado = :estado
                 WHERE id = :id
                """)
                .param("parcela", c.getIdParcela())
                .param("nombre", c.getNombre())
                .param("familia", c.getFamilia() != null ? c.getFamilia() : c.getTipo())
                .param("etapa", c.getEtapaFenologica())
                .param("fecha", c.getFechaSiembra() != null ? c.getFechaSiembra() : c.getFechaRegistro())
                .param("estado", c.getEstado() == null ? "activo" : c.getEstado())
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
