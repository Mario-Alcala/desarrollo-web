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
        return jdbc.sql("""
                SELECT c.*, cu.nombre AS nombre_cultivo
                FROM cosechas c JOIN cultivos cu ON cu.id = c.id_cultivo
                ORDER BY c.id_cosecha
                """)
                .query(Cosecha.class)
                .list();
    }

    public Cosecha buscarPorId(int id) {
        List<Cosecha> resultado = jdbc.sql("""
                SELECT c.*, cu.nombre AS nombre_cultivo
                FROM cosechas c JOIN cultivos cu ON cu.id = c.id_cultivo
                WHERE c.id_cosecha = :id
                """)
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
                (id_cultivo, id_usuario, fecha_cosecha, cantidad_cosechada,
                 cantidad_disponible, estado_maduracion, ubicacion_bodega)
                VALUES
                (:idCultivo, :idUsuario, :fecha, :cantidad,
                 :disponible, :maduracion, :bodega)
                """)
                .param("idCultivo", cosecha.getIdCultivo())
                .param("idUsuario", cosecha.getIdUsuario())
                .param("fecha", cosecha.getFechaCosecha())
                .param("cantidad", cosecha.getCantidadCosechada())
                .param("disponible", cosecha.getCantidadDisponible())
                .param("maduracion", cosecha.getEstadoMaduracion())
                .param("bodega", cosecha.getUbicacionBodega())
                .update();
    }

    public void actualizar(Cosecha cosecha) {
        jdbc.sql("""
                UPDATE cosechas
                SET id_cultivo = :idCultivo,
                    id_usuario = :idUsuario,
                    fecha_cosecha = :fecha,
                    cantidad_cosechada = :cantidad,
                    cantidad_disponible = :disponible,
                    estado_maduracion = :maduracion,
                    ubicacion_bodega = :bodega
                WHERE id_cosecha = :id
                """)
                .param("idCultivo", cosecha.getIdCultivo())
                .param("idUsuario", cosecha.getIdUsuario())
                .param("fecha", cosecha.getFechaCosecha())
                .param("cantidad", cosecha.getCantidadCosechada())
                .param("disponible", cosecha.getCantidadDisponible())
                .param("maduracion", cosecha.getEstadoMaduracion())
                .param("bodega", cosecha.getUbicacionBodega())
                .param("id", cosecha.getIdCosecha())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("DELETE FROM cosechas WHERE id_cosecha = :id")
                .param("id", id)
                .update();
    }
}
