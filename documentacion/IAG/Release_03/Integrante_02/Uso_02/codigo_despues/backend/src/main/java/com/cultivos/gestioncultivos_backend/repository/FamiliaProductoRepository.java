package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.FamiliaProducto;

@Repository
public class FamiliaProductoRepository {

    private final JdbcClient jdbc;

    public FamiliaProductoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<FamiliaProducto> buscarTodas() {
        return jdbc.sql("SELECT id_familia, nombre FROM familias_producto ORDER BY nombre")
                .query(FamiliaProducto.class).list();
    }

    public FamiliaProducto buscarPorId(int id) {
        List<FamiliaProducto> resultado = jdbc.sql("""
                SELECT id_familia, nombre FROM familias_producto WHERE id_familia = :id
                """).param("id", id).query(FamiliaProducto.class).list();
        return resultado.isEmpty() ? null : resultado.get(0);
    }

    public boolean existeNombre(String nombre, int idExcluir) {
        Integer cantidad = jdbc.sql("""
                SELECT COUNT(*) FROM familias_producto
                WHERE LOWER(nombre) = LOWER(:nombre) AND id_familia <> :id
                """)
                .param("nombre", nombre).param("id", idExcluir)
                .query(Integer.class).single();
        return cantidad > 0;
    }

    public Integer insertar(FamiliaProducto familia) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("INSERT INTO familias_producto (nombre) VALUES (:nombre)")
                .param("nombre", familia.getNombre())
                .update(llaves);
        return llaves.getKey().intValue();
    }

    public boolean actualizar(FamiliaProducto familia) {
        int filas = jdbc.sql("""
                UPDATE familias_producto SET nombre = :nombre
                WHERE id_familia = :id
                """)
                .param("nombre", familia.getNombre())
                .param("id", familia.getIdFamilia()).update();
        return filas > 0;
    }
}
