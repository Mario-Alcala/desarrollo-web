package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Abono;

@Repository
public class AbonoRepository {

    private final JdbcClient jdbc;

    public AbonoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Abono> buscarTodos() {
        return jdbc.sql("SELECT * FROM abonos ORDER BY id_abono")
                .query(Abono.class)
                .list();
    }

    public Abono buscarPorId(int id) {
        List<Abono> resultado = jdbc.sql("""
                SELECT * FROM abonos
                WHERE id_abono = :id
                """)
                .param("id", id)
                .query(Abono.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public void insertar(Abono abono) {
        jdbc.sql("""
                INSERT INTO abonos
                (nombre_abono, tipo_abono, fecha_caducidad, id_proveedor)
                VALUES
                (:nombre, :tipo, :fecha, :proveedor)
                """)
                .param("nombre", abono.getNombreAbono())
                .param("tipo", abono.getTipoAbono())
                .param("fecha", abono.getFechaCaducidad())
                .param("proveedor", abono.getIdProveedor())
                .update();
    }

    public void actualizar(Abono abono) {
        jdbc.sql("""
                UPDATE abonos
                SET nombre_abono = :nombre,
                    tipo_abono = :tipo,
                    fecha_caducidad = :fecha,
                    id_proveedor = :proveedor
                WHERE id_abono = :id
                """)
                .param("nombre", abono.getNombreAbono())
                .param("tipo", abono.getTipoAbono())
                .param("fecha", abono.getFechaCaducidad())
                .param("proveedor", abono.getIdProveedor())
                .param("id", abono.getIdAbono())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("DELETE FROM abonos WHERE id_abono = :id")
                .param("id", id)
                .update();
    }
}
