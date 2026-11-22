package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.VariedadProducto;

@Repository
public class VariedadProductoRepository {

    private static final String CONSULTA = """
            SELECT v.id_variedad, v.id_familia, v.nombre, v.descripcion,
                   v.imagen_url, v.precio_por_kg, f.nombre AS nombre_familia
            FROM variedades_producto v
            JOIN familias_producto f ON f.id_familia = v.id_familia
            """;

    private final JdbcClient jdbc;

    public VariedadProductoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<VariedadProducto> buscarTodas(Integer idFamilia) {
        String sql = CONSULTA + (idFamilia == null ? " ORDER BY f.nombre, v.nombre"
                : " WHERE v.id_familia = :idFamilia ORDER BY v.nombre");
        var consulta = jdbc.sql(sql);
        if (idFamilia != null) consulta.param("idFamilia", idFamilia);
        return consulta.query(VariedadProducto.class).list();
    }

    public VariedadProducto buscarPorId(int id) {
        List<VariedadProducto> resultado = jdbc.sql(CONSULTA + " WHERE v.id_variedad = :id")
                .param("id", id).query(VariedadProducto.class).list();
        return resultado.isEmpty() ? null : resultado.get(0);
    }

    public boolean existeFamilia(int idFamilia) {
        Integer cantidad = jdbc.sql("SELECT COUNT(*) FROM familias_producto WHERE id_familia = :id")
                .param("id", idFamilia).query(Integer.class).single();
        return cantidad > 0;
    }

    public boolean existeNombre(int idFamilia, String nombre, int idExcluir) {
        Integer cantidad = jdbc.sql("""
                SELECT COUNT(*) FROM variedades_producto
                WHERE id_familia = :familia AND LOWER(nombre) = LOWER(:nombre)
                  AND id_variedad <> :id
                """)
                .param("familia", idFamilia).param("nombre", nombre).param("id", idExcluir)
                .query(Integer.class).single();
        return cantidad > 0;
    }

    public Integer insertar(VariedadProducto variedad) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("""
                INSERT INTO variedades_producto
                    (id_familia, nombre, descripcion, imagen_url, precio_por_kg)
                VALUES (:familia, :nombre, :descripcion, :imagen, :precio)
                """)
                .param("familia", variedad.getIdFamilia()).param("nombre", variedad.getNombre())
                .param("descripcion", variedad.getDescripcion()).param("imagen", variedad.getImagenUrl())
                .param("precio", variedad.getPrecioPorKg()).update(llaves);
        return llaves.getKey().intValue();
    }

    public boolean actualizar(VariedadProducto variedad) {
        int filas = jdbc.sql("""
                UPDATE variedades_producto
                SET id_familia = :familia, nombre = :nombre, descripcion = :descripcion,
                    imagen_url = :imagen, precio_por_kg = :precio
                WHERE id_variedad = :id
                """)
                .param("familia", variedad.getIdFamilia()).param("nombre", variedad.getNombre())
                .param("descripcion", variedad.getDescripcion()).param("imagen", variedad.getImagenUrl())
                .param("precio", variedad.getPrecioPorKg()).param("id", variedad.getIdVariedad())
                .update();
        return filas > 0;
    }
}
