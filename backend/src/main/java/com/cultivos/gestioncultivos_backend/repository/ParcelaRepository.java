package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Parcela;

@Repository
public class ParcelaRepository {
    private final JdbcClient jdbc;

    public ParcelaRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    public List<Parcela> buscarPorTerreno(Long idTerreno) {
        return jdbc.sql("""
                SELECT p.id_parcela, p.id_terreno, p.nombre, p.superficie_m2, p.estado,
                       c.id AS id_cultivo, c.nombre AS cultivo_nombre,
                       c.etapa_fenologica
                FROM parcelas p
                LEFT JOIN cultivos c ON c.id_parcela = p.id_parcela AND c.estado = 'activo'
                WHERE p.id_terreno = :idTerreno
                ORDER BY p.id_parcela
                """)
                .param("idTerreno", idTerreno)
                .query(Parcela.class)
                .list();
    }
}
