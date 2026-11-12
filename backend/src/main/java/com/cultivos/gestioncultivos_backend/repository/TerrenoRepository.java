package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Terreno;

/** Capa de datos: SQL puro con JdbcClient (sin Hibernate). */
@Repository
public class TerrenoRepository {

    private final JdbcClient jdbc;

    public TerrenoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Terreno> buscarTodos() {
        return jdbc.sql("SELECT * FROM terrenos ORDER BY id")
                .query(Terreno.class)
                .list();
    }

    public Optional<Terreno> buscarPorId(Long id) {
        return jdbc.sql("SELECT * FROM terrenos WHERE id = :id")
                .param("id", id)
                .query(Terreno.class)
                .optional();
    }

    /** Inserta el terreno y devuelve el id generado por MySQL. */
    public Long insertar(Terreno t) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO terrenos (nombre, ubicacion, superficie_ha, tipo_suelo, estado)
                VALUES (:nombre, :ubicacion, :superficie, :suelo, :estado)
                """)
                .param("nombre", t.getNombre())
                .param("ubicacion", t.getUbicacion())
                .param("superficie", t.getSuperficieHa())
                .param("suelo", t.getTipoSuelo())
                .param("estado", t.getEstado())
                .update(llaves);
        return llaves.getKey().longValue();
    }

    public boolean actualizar(Terreno t) {
        int filas = jdbc.sql("""
                UPDATE terrenos
                   SET nombre = :nombre, ubicacion = :ubicacion, superficie_ha = :superficie,
                       tipo_suelo = :suelo, estado = :estado
                 WHERE id = :id
                """)
                .param("nombre", t.getNombre())
                .param("ubicacion", t.getUbicacion())
                .param("superficie", t.getSuperficieHa())
                .param("suelo", t.getTipoSuelo())
                .param("estado", t.getEstado())
                .param("id", t.getId())
                .update();
        return filas > 0;
    }

    public boolean eliminar(Long id) {
        int filas = jdbc.sql("DELETE FROM terrenos WHERE id = :id")
                .param("id", id)
                .update();
        return filas > 0;
    }
}
