package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Herramienta;

/** Capa de datos: SQL puro con JdbcClient. */

@Repository
public class HerramientaRepository {

    private final JdbcClient jdbc;

    public HerramientaRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Herramienta> buscarTodas() {
        return jdbc.sql("SELECT * FROM herramientas ORDER BY id")
                .query(Herramienta.class)
                .list();
    }

    public Optional<Herramienta> buscarPorId(Long id) {
        return jdbc.sql("SELECT * FROM herramientas WHERE id = :id")
                .param("id", id)
                .query(Herramienta.class)
                .optional();
    }

    /** Inserta la herramienta y devuelve el id generado por MySQL. */
    public Long insertar(Herramienta h) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO herramientas (nombre, tipo, cantidad, estado, fecha_adquisicion)
                VALUES (:nombre, :tipo, :cantidad, :estado, :fecha)
                """)
                .param("nombre", h.getNombre())
                .param("tipo", h.getTipo())
                .param("cantidad", h.getCantidad())
                .param("estado", h.getEstado())
                .param("fecha", h.getFechaAdquisicion())
                .update(llaves);
        return llaves.getKey().longValue();
    }

    public boolean actualizar(Herramienta h) {
        int filas = jdbc.sql("""
                UPDATE herramientas
                   SET nombre = :nombre, tipo = :tipo, cantidad = :cantidad,
                       estado = :estado, fecha_adquisicion = :fecha
                 WHERE id = :id
                """)
                .param("nombre", h.getNombre())
                .param("tipo", h.getTipo())
                .param("cantidad", h.getCantidad())
                .param("estado", h.getEstado())
                .param("fecha", h.getFechaAdquisicion())
                .param("id", h.getId())
                .update();
        return filas > 0;
    }

    public boolean eliminar(Long id) {
        int filas = jdbc.sql("DELETE FROM herramientas WHERE id = :id")
                .param("id", id)
                .update();
        return filas > 0;
    }
}
