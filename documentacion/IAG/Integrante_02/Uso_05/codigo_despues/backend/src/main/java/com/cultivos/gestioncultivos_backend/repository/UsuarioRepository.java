package com.cultivos.gestioncultivos_backend.repository;

import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import com.cultivos.gestioncultivos_backend.model.Usuario;

@Repository
public class UsuarioRepository {

    private final JdbcClient jdbc;

    public UsuarioRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Usuario> buscarTodos() {
        return jdbc.sql("""
                SELECT id_usuario, nombre_usuario, correo_electronico, rol
                FROM usuarios
                ORDER BY id_usuario
                """)
                .query(Usuario.class)
                .list();
    }

    public Usuario buscarPorId(int id) {
        List<Usuario> resultado = jdbc.sql("""
                SELECT id_usuario, nombre_usuario, correo_electronico, rol
                FROM usuarios
                WHERE id_usuario = :id
                """)
                .param("id", id)
                .query(Usuario.class)
                .list();

        if (resultado.isEmpty()) {
            return null;
        }

        return resultado.get(0);
    }

    public void insertar(Usuario usuario) {
        jdbc.sql("""
                INSERT INTO usuarios
                (nombre_usuario, correo_electronico, contrasena, rol)
                VALUES
                (:nombre, :correo, :contrasena, :rol)
                """)
                .param("nombre", usuario.getNombreUsuario())
                .param("correo", usuario.getCorreoElectronico())
                .param("contrasena", usuario.getContrasena())
                .param("rol", usuario.getRol())
                .update();
    }

    public void actualizar(Usuario usuario) {
        jdbc.sql("""
                UPDATE usuarios
                SET nombre_usuario = :nombre,
                    correo_electronico = :correo,
                    contrasena = :contrasena,
                    rol = :rol
                WHERE id_usuario = :id
                """)
                .param("nombre", usuario.getNombreUsuario())
                .param("correo", usuario.getCorreoElectronico())
                .param("contrasena", usuario.getContrasena())
                .param("rol", usuario.getRol())
                .param("id", usuario.getIdUsuario())
                .update();
    }

    public void eliminar(int id) {
        jdbc.sql("DELETE FROM usuarios WHERE id_usuario = :id")
                .param("id", id)
                .update();
    }
}
