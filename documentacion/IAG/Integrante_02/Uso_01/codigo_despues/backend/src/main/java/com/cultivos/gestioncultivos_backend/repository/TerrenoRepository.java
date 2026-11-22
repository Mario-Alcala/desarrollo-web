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

    public Long insertar(Terreno terreno) {
        KeyHolder llaves = new GeneratedKeyHolder();

        jdbc.sql("""
                INSERT INTO terrenos
                (nombre, ubicacion, superficie_ha, tipo_suelo, estado,
                 latitud, longitud)
                VALUES
                (:nombre, :ubicacion, :superficie, :suelo, :estado,
                 :latitud, :longitud)
                """)
                .param("nombre", terreno.getNombre())
                .param("ubicacion", terreno.getUbicacion())
                .param("superficie", terreno.getSuperficieHa())
                .param("suelo", terreno.getTipoSuelo())
                .param("estado", terreno.getEstado())
                .param("latitud", terreno.getLatitud())
                .param("longitud", terreno.getLongitud())
                .update(llaves);

        return llaves.getKey().longValue();
    }

    public boolean actualizar(Terreno terreno) {
        int filas = jdbc.sql("""
                UPDATE terrenos
                SET nombre = :nombre,
                    ubicacion = :ubicacion,
                    superficie_ha = :superficie,
                    tipo_suelo = :suelo,
                    estado = :estado,
                    latitud = :latitud,
                    longitud = :longitud
                WHERE id = :id
                """)
                .param("nombre", terreno.getNombre())
                .param("ubicacion", terreno.getUbicacion())
                .param("superficie", terreno.getSuperficieHa())
                .param("suelo", terreno.getTipoSuelo())
                .param("estado", terreno.getEstado())
                .param("latitud", terreno.getLatitud())
                .param("longitud", terreno.getLongitud())
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
