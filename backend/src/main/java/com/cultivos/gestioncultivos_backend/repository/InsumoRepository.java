package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Insumo;

@Repository
public class InsumoRepository {

    private final JdbcClient jdbc;

    public InsumoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Insumo> buscarTodos() {
        return jdbc.sql("SELECT * FROM insumos ORDER BY id_insumo")
                .query(Insumo.class).list();
    }

    public List<Insumo> buscarPorCategoria(String categoria) {
        return jdbc.sql("SELECT * FROM insumos WHERE categoria = :categoria ORDER BY id_insumo")
                .param("categoria", categoria).query(Insumo.class).list();
    }

    public Insumo buscarPorId(int id) {
        List<Insumo> resultado = jdbc.sql("SELECT * FROM insumos WHERE id_insumo = :id")
                .param("id", id).query(Insumo.class).list();
        if (resultado.isEmpty()) {
            return null;
        }
        return resultado.get(0);
    }

    public Integer insertar(Insumo insumo) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO insumos (nombre, categoria, tipo_abono, unidad_medida, id_proveedor)
                VALUES (:nombre, :categoria, :tipoAbono, :unidad, :proveedor)
                """)
                .param("nombre", insumo.getNombre())
                .param("categoria", insumo.getCategoria())
                .param("tipoAbono", insumo.getTipoAbono())
                .param("unidad", insumo.getUnidadMedida())
                .param("proveedor", insumo.getIdProveedor())
                .update(llaves);
        return llaves.getKey().intValue();
    }

    public boolean actualizar(Insumo insumo) {
        int filas = jdbc.sql("""
                UPDATE insumos
                SET nombre = :nombre, categoria = :categoria, tipo_abono = :tipoAbono,
                    unidad_medida = :unidad, id_proveedor = :proveedor
                WHERE id_insumo = :id
                """)
                .param("nombre", insumo.getNombre())
                .param("categoria", insumo.getCategoria())
                .param("tipoAbono", insumo.getTipoAbono())
                .param("unidad", insumo.getUnidadMedida())
                .param("proveedor", insumo.getIdProveedor())
                .param("id", insumo.getIdInsumo())
                .update();
        return filas > 0;
    }

    public boolean eliminar(int id) {
        int filas = jdbc.sql("DELETE FROM insumos WHERE id_insumo = :id")
                .param("id", id).update();
        return filas > 0;
    }
}
