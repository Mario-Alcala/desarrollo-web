package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Terreno;

@Repository
public class TerrenoRepository {

    private final JdbcClient jdbc;

    public TerrenoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Terreno> buscarTodos() {
        return jdbc.sql("SELECT id, nombre, ubicacion, superficie_m2 / 10000 AS superficie_ha, latitud, longitud, estado FROM terrenos ORDER BY id")
                .query(Terreno.class)
                .list();
    }

    public Optional<Terreno> buscarPorId(Long id) {
        return jdbc.sql("SELECT id, nombre, ubicacion, superficie_m2 / 10000 AS superficie_ha, latitud, longitud, estado FROM terrenos WHERE id = :id")
                .param("id", id)
                .query(Terreno.class)
                .optional();
    }

    public Long insertar(Terreno terreno) {
        KeyHolder llaves = new GeneratedKeyHolder();

        jdbc.sql("""
                INSERT INTO terrenos (nombre, ubicacion, superficie_m2, latitud, longitud, estado)
                VALUES (:nombre, :ubicacion, :superficie, :latitud, :longitud, :estado)
                """)
                .param("nombre", terreno.getNombre())
                .param("ubicacion", terreno.getUbicacion())
                .param("superficie", terreno.getSuperficieHa() == null ? 0 : terreno.getSuperficieHa() * 10000)
                .param("latitud", terreno.getLatitud())
                .param("longitud", terreno.getLongitud())
                .param("estado", terreno.getEstado())
                .update(llaves);

        return llaves.getKey().longValue();
    }

    public boolean actualizar(Terreno terreno) {
        int filas = jdbc.sql("""
                UPDATE terrenos
                SET nombre = :nombre, ubicacion = :ubicacion,
                    superficie_m2 = :superficie, latitud = :latitud,
                    longitud = :longitud, estado = :estado
                WHERE id = :id
                """)
                .param("nombre", terreno.getNombre())
                .param("ubicacion", terreno.getUbicacion())
                .param("superficie", terreno.getSuperficieHa() == null ? 0 : terreno.getSuperficieHa() * 10000)
                .param("latitud", terreno.getLatitud())
                .param("longitud", terreno.getLongitud())
                .param("estado", terreno.getEstado())
                .param("id", terreno.getId())
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
