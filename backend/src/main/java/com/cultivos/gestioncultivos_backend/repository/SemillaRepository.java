package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Semilla;

/** Capa de datos: las semillas se guardan como insumos de categoria semilla. */
@Repository
public class SemillaRepository {

    private final JdbcClient jdbc;

    public SemillaRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Semilla> buscarTodas() {
        return jdbc.sql("""
                SELECT id_insumo AS id, nombre, unidad_medida AS unidadMedida,
                       id_proveedor AS idProveedor
                FROM insumos
                WHERE categoria = 'semilla'
                ORDER BY id_insumo
                """)
                .query(Semilla.class)
                .list();
    }

    public Semilla buscarPorId(Long id) {
        List<Semilla> resultado = jdbc.sql("""
                SELECT id_insumo AS id, nombre, unidad_medida AS unidadMedida,
                       id_proveedor AS idProveedor
                FROM insumos
                WHERE id_insumo = :id AND categoria = 'semilla'
                """)
                .param("id", id)
                .query(Semilla.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }
        return resultado.get(0);
    }

    public Long insertar(Semilla semilla) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO insumos (nombre, categoria, unidad_medida, id_proveedor)
                VALUES (:nombre, 'semilla', :unidad, :proveedor)
                """)
                .param("nombre", semilla.getNombre())
                .param("unidad", semilla.getUnidadMedida())
                .param("proveedor", semilla.getIdProveedor())
                .update(llaves);
        return llaves.getKey().longValue();
    }

    public boolean actualizar(Semilla semilla) {
        int filas = jdbc.sql("""
                UPDATE insumos
                SET nombre = :nombre, unidad_medida = :unidad,
                    id_proveedor = :proveedor
                WHERE id_insumo = :id AND categoria = 'semilla'
                """)
                .param("nombre", semilla.getNombre())
                .param("unidad", semilla.getUnidadMedida())
                .param("proveedor", semilla.getIdProveedor())
                .param("id", semilla.getId())
                .update();
        return filas > 0;
    }

    public boolean eliminar(Long id) {
        int filas = jdbc.sql("""
                DELETE FROM insumos
                WHERE id_insumo = :id AND categoria = 'semilla'
                """)
                .param("id", id)
                .update();
        return filas > 0;
    }
}
