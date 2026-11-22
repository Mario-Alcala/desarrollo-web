package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Inventario;

@Repository
public class InventarioRepository {

    private final JdbcClient jdbc;

    public InventarioRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Inventario> buscarTodos() {
        return jdbc.sql("SELECT * FROM inventario ORDER BY id_inventario")
                .query(Inventario.class)
                .list();
    }

    public Inventario buscarPorId(int id) {
        List<Inventario> resultado = jdbc.sql(
                "SELECT * FROM inventario WHERE id_inventario = :id")
                .param("id", id)
                .query(Inventario.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public void insertar(Inventario producto) {
        jdbc.sql("""
                INSERT INTO inventario
                (nombre_producto, categoria, cantidad, unidad_medida,
                 stock_minimo, fecha_caducidad, id_proveedor)
                VALUES
                (:nombre, :categoria, :cantidad, :unidad,
                 :minimo, :caducidad, :proveedor)
                """)
                .param("nombre", producto.getNombreProducto())
                .param("categoria", producto.getCategoria())
                .param("cantidad", producto.getCantidad())
                .param("unidad", producto.getUnidadMedida())
                .param("minimo", producto.getStockMinimo())
                .param("caducidad", producto.getFechaCaducidad())
                .param("proveedor", producto.getIdProveedor())
                .update();
    }

    public void actualizar(Inventario producto) {
        jdbc.sql("""
                UPDATE inventario
                SET nombre_producto = :nombre,
                    categoria = :categoria,
                    cantidad = :cantidad,
                    unidad_medida = :unidad,
                    stock_minimo = :minimo,
                    fecha_caducidad = :caducidad,
                    id_proveedor = :proveedor
                WHERE id_inventario = :id
                """)
                .param("nombre", producto.getNombreProducto())
                .param("categoria", producto.getCategoria())
                .param("cantidad", producto.getCantidad())
                .param("unidad", producto.getUnidadMedida())
                .param("minimo", producto.getStockMinimo())
                .param("caducidad", producto.getFechaCaducidad())
                .param("proveedor", producto.getIdProveedor())
                .param("id", producto.getIdInventario())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("DELETE FROM inventario WHERE id_inventario = :id")
                .param("id", id)
                .update();
    }

    public List<Inventario> buscarPorCategoria(String categoria) {
        return jdbc.sql("""
                SELECT * FROM inventario
                WHERE categoria = :categoria
                ORDER BY id_inventario
                """)
                .param("categoria", categoria)
                .query(Inventario.class)
                .list();
    }
}
