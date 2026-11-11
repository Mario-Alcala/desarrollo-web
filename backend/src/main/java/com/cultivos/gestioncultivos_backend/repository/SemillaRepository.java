package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Semilla;

/** Capa de datos: SQL puro con JdbcClient (sin Hibernate). */
@Repository
public class SemillaRepository {

    private final JdbcClient jdbc;

    public SemillaRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Semilla> buscarTodas() {
        return jdbc.sql("SELECT * FROM semillas ORDER BY id")
                .query(Semilla.class)
                .list();
    }

    public Optional<Semilla> buscarPorId(Long id) {
        return jdbc.sql("SELECT * FROM semillas WHERE id = :id")
                .param("id", id)
                .query(Semilla.class)
                .optional();
    }

    /** Inserta la semilla y devuelve el id generado por MySQL. */
    public Long insertar(Semilla s) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO semillas (variedad, stock_disponible, proveedor_origen, fecha_caducidad)
                VALUES (:variedad, :stock, :proveedor, :caducidad)
                """)
                .param("variedad", s.getVariedad())
                .param("stock", s.getStockDisponible())
                .param("proveedor", s.getProveedorOrigen())
                .param("caducidad", s.getFechaCaducidad())
                .update(llaves);
        return llaves.getKey().longValue();
    }

    public boolean actualizar(Semilla s) {
        int filas = jdbc.sql("""
                UPDATE semillas
                   SET variedad = :variedad, stock_disponible = :stock,
                       proveedor_origen = :proveedor, fecha_caducidad = :caducidad
                 WHERE id = :id
                """)
                .param("variedad", s.getVariedad())
                .param("stock", s.getStockDisponible())
                .param("proveedor", s.getProveedorOrigen())
                .param("caducidad", s.getFechaCaducidad())
                .param("id", s.getId())
                .update();
        return filas > 0;
    }

    public boolean eliminar(Long id) {
        int filas = jdbc.sql("DELETE FROM semillas WHERE id = :id")
                .param("id", id)
                .update();
        return filas > 0;
    }
}
