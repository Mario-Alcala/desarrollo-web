package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Cosecha;

@Repository
public class CosechaRepository {

    private final JdbcClient jdbc;

    public CosechaRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Cosecha> buscarTodas() {
        return jdbc.sql("SELECT * FROM cosechas ORDER BY id_cosecha")
                .query(Cosecha.class)
                .list();
    }

    public Cosecha buscarPorId(int id) {
        List<Cosecha> resultado = jdbc.sql(
                "SELECT * FROM cosechas WHERE id_cosecha = :id")
                .param("id", id)
                .query(Cosecha.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public void insertar(Cosecha cosecha) {
        jdbc.sql("""
                INSERT INTO cosechas
                (id_cultivo, fecha_cosecha, cantidad_cosechada)
                VALUES
                (:idCultivo, :fecha, :cantidad)
                """)
                .param("idCultivo", cosecha.getIdCultivo())
                .param("fecha", cosecha.getFechaCosecha())
                .param("cantidad", cosecha.getCantidadCosechada())
                .update();
    }

    public void actualizar(Cosecha cosecha) {
        jdbc.sql("""
                UPDATE cosechas
                SET id_cultivo = :idCultivo,
                    fecha_cosecha = :fecha,
                    cantidad_cosechada = :cantidad
                WHERE id_cosecha = :id
                """)
                .param("idCultivo", cosecha.getIdCultivo())
                .param("fecha", cosecha.getFechaCosecha())
                .param("cantidad", cosecha.getCantidadCosechada())
                .param("id", cosecha.getIdCosecha())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("DELETE FROM cosechas WHERE id_cosecha = :id")
                .param("id", id)
                .update();
    }
}
