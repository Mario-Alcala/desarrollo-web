package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Riego;

@Repository
public class RiegoRepository {

    private final JdbcClient jdbc;

    public RiegoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Riego> buscarTodos() {
        return jdbc.sql("SELECT * FROM riegos ORDER BY id_riego")
                .query(Riego.class)
                .list();
    }

    public Riego buscarPorId(int id) {
        List<Riego> resultado = jdbc.sql(
                "SELECT * FROM riegos WHERE id_riego = :id")
                .param("id", id)
                .query(Riego.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public void insertar(Riego riego) {
        jdbc.sql("""
                INSERT INTO riegos
                (id_cultivo, id_usuario, fecha_riego, cantidad_agua,
                 unidad_medida, metodo, observaciones)
                VALUES
                (:cultivo, :usuario, :fecha, :cantidad,
                 :unidad, :metodo, :observaciones)
                """)
                .param("cultivo", riego.getIdCultivo())
                .param("usuario", riego.getIdUsuario())
                .param("fecha", riego.getFechaRiego())
                .param("cantidad", riego.getCantidadAgua())
                .param("unidad", riego.getUnidadMedida())
                .param("metodo", riego.getMetodo())
                .param("observaciones", riego.getObservaciones())
                .update();
    }

    public void actualizar(Riego riego) {
        jdbc.sql("""
                UPDATE riegos
                SET id_cultivo = :cultivo,
                    id_usuario = :usuario,
                    fecha_riego = :fecha,
                    cantidad_agua = :cantidad,
                    unidad_medida = :unidad,
                    metodo = :metodo,
                    observaciones = :observaciones
                WHERE id_riego = :id
                """)
                .param("cultivo", riego.getIdCultivo())
                .param("usuario", riego.getIdUsuario())
                .param("fecha", riego.getFechaRiego())
                .param("cantidad", riego.getCantidadAgua())
                .param("unidad", riego.getUnidadMedida())
                .param("metodo", riego.getMetodo())
                .param("observaciones", riego.getObservaciones())
                .param("id", riego.getIdRiego())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("DELETE FROM riegos WHERE id_riego = :id")
                .param("id", id)
                .update();
    }
}
