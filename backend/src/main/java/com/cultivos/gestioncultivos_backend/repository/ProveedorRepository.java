package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Proveedor;

@Repository 
public class ProveedorRepository {

    private final JdbcClient jdbc;

    public ProveedorRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;

    }
    

    public List<Proveedor> buscarTodos() {
        return jdbc.sql("SELECT * FROM proveedores ORDER BY id_proveedor")
               .query(Proveedor.class)
                .list();
    }

    public Proveedor buscarPorId(int id){
        List<Proveedor> resultado = jdbc.sql("SELECT * FROM proveedores WHERE id_proveedor = :id")
                .param("id", id)
                .query(Proveedor.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
                
    }

    public Integer insertar(Proveedor p) {
        KeyHolder llaves = new GeneratedKeyHolder();
        jdbc.sql("INSERT INTO proveedores (nombre_empresa, contacto, telefono, email, direccion) VALUES (:nombre_empresa, :contacto, :telefono, :email, :direccion)")
                .param("nombre_empresa", p.getNombreEmpresa())
                .param("contacto", p.getContacto())
                .param("telefono", p.getTelefono())
                .param("email", p.getEmail())
                .param("direccion", p.getDireccion())
                .update(llaves);
        return llaves.getKey().intValue();
    }

    public void actualizar(Proveedor p){
        jdbc.sql("UPDATE proveedores SET nombre_empresa = :nombre_empresa, contacto = :contacto, telefono = :telefono, email = :email, direccion = :direccion WHERE id_proveedor = :id")
                .param("nombre_empresa", p.getNombreEmpresa())
                .param("contacto", p.getContacto())
                .param("telefono", p.getTelefono())
                .param("email", p.getEmail())
                .param("direccion", p.getDireccion())
                .param("id", p.getIdProveedor())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("DELETE FROM proveedores WHERE id_proveedor = :id")
                .param("id", id)
                .update();
    }

}
