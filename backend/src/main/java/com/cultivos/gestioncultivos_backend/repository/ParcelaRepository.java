package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Parcela;

@Repository
public class ParcelaRepository {
    private final JdbcClient jdbc;

    public ParcelaRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public List<Parcela> buscarPorTerreno(Long idTerreno) {
        return jdbc.sql("""
                SELECT p.id_parcela, p.id_terreno, p.nombre, p.superficie_m2, p.estado,
                       c.id AS id_cultivo, c.id_variedad, c.nombre AS cultivo_nombre,
                       c.familia AS cultivo_familia, c.etapa_fenologica,
                       c.fecha_siembra, c.estado AS estado_cultivo
                FROM parcelas p
                LEFT JOIN cultivos c ON c.id_parcela = p.id_parcela AND c.estado = 'activo'
                WHERE p.id_terreno = :idTerreno
                ORDER BY p.id_parcela
                """)
                .param("idTerreno", idTerreno)
                .query(Parcela.class)
                .list();
    }

    public double superficieRegistrada(Long idTerreno) {
        return jdbc.sql("SELECT COALESCE(SUM(superficie_m2), 0) FROM parcelas WHERE id_terreno = :idTerreno")
                .param("idTerreno", idTerreno)
                .query(Double.class)
                .single();
    }

    public Long insertar(Parcela parcela) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO parcelas (id_terreno, nombre, superficie_m2, estado)
                VALUES (:terreno, :nombre, :superficie, 'disponible')
                """)
                .param("terreno", parcela.getIdTerreno())
                .param("nombre", parcela.getNombre())
                .param("superficie", parcela.getSuperficieM2())
                .update(llaves);
        return llaves.getKey().longValue();
    }
}
