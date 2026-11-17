package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Fertilizante;

@Repository
public class FertilizanteRepository {

    private final JdbcClient jdbc;

    public FertilizanteRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Fertilizante> buscarTodos() {
        return jdbc.sql("SELECT * FROM fertilizantes ORDER BY id_fertilizante")
                .query(Fertilizante.class)
                .list();
    }

    public Fertilizante buscarPorId(int id) {
        List<Fertilizante> resultado = jdbc.sql("""
                SELECT * FROM fertilizantes
                WHERE id_fertilizante = :id
                """)
                .param("id", id)
                .query(Fertilizante.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public void insertar(Fertilizante fertilizante) {
        jdbc.sql("""
                INSERT INTO fertilizantes
                (nombre_fertilizante, tipo_fertilizante, fecha_caducidad, id_proveedor)
                VALUES
                (:nombre, :tipo, :fecha, :proveedor)
                """)
                .param("nombre", fertilizante.getNombreFertilizante())
                .param("tipo", fertilizante.getTipoFertilizante())
                .param("fecha", fertilizante.getFechaCaducidad())
                .param("proveedor", fertilizante.getIdProveedor())
                .update();
    }

    public void actualizar(Fertilizante fertilizante) {
        jdbc.sql("""
                UPDATE fertilizantes
                SET nombre_fertilizante = :nombre,
                    tipo_fertilizante = :tipo,
                    fecha_caducidad = :fecha,
                    id_proveedor = :proveedor
                WHERE id_fertilizante = :id
                """)
                .param("nombre", fertilizante.getNombreFertilizante())
                .param("tipo", fertilizante.getTipoFertilizante())
                .param("fecha", fertilizante.getFechaCaducidad())
                .param("proveedor", fertilizante.getIdProveedor())
                .param("id", fertilizante.getIdFertilizante())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("""
                DELETE FROM fertilizantes
                WHERE id_fertilizante = :id
                """)
                .param("id", id)
                .update();
    }
}