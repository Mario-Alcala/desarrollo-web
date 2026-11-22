package com.cultivos.gestioncultivos_backend.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cultivos.gestioncultivos_backend.model.Usuario;
import com.cultivos.gestioncultivos_backend.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository repositorio;
    private final PasswordEncoder codificador;

    public UsuarioService(
            UsuarioRepository repositorio,
            PasswordEncoder codificador) {
        this.repositorio = repositorio;
        this.codificador = codificador;
    }

    public List<Usuario> listar() {
        return repositorio.buscarTodos();
    }

    public Usuario obtener(int id) {
        Usuario usuario = repositorio.buscarPorId(id);

        if (usuario == null) {
            throw new NoSuchElementException(
                    "No existe el usuario con id " + id);
        }

        return usuario;
    }

    public void crear(Usuario usuario) {
        validar(usuario);

        usuario.setContrasena(
                codificador.encode(usuario.getContrasena()));

        repositorio.insertar(usuario);
    }

    public void registrarCliente(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException("Los datos de la cuenta son obligatorios");
        }
        usuario.setRol("cliente");
        crear(usuario);
    }

    public Usuario iniciarSesion(String correo, String contrasena) {
        if (correo == null || correo.isBlank() || contrasena == null || contrasena.isBlank()) {
            throw new IllegalArgumentException("Escribe tu correo y contraseña");
        }

        Usuario usuario = repositorio.buscarPorCorreo(correo.trim());
        if (usuario == null || !codificador.matches(contrasena, usuario.getContrasena())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos");
        }

        return usuario;
    }

    public void actualizar(int id, Usuario usuario) {
        obtener(id);
        validar(usuario);

        usuario.setIdUsuario(id);
        usuario.setContrasena(
                codificador.encode(usuario.getContrasena()));

        repositorio.actualizar(usuario);
    }

    public void eliminar(int id) {
        obtener(id);
        repositorio.eliminar(id);
    }

    private void validar(Usuario usuario) {
        if (usuario == null) {
            throw new IllegalArgumentException("El usuario es obligatorio");
        }

        if (usuario.getNombreUsuario() == null
                || usuario.getNombreUsuario().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre de usuario es obligatorio");
        }

        if (usuario.getCorreoElectronico() == null
                || usuario.getCorreoElectronico().isBlank()) {
            throw new IllegalArgumentException(
                    "El correo electrónico es obligatorio");
        }

        if (usuario.getContrasena() == null
                || usuario.getContrasena().isBlank()) {
            throw new IllegalArgumentException(
                    "La contraseña es obligatoria");
        }

        if (usuario.getRol() == null
                || !(usuario.getRol().equalsIgnoreCase("administrador_agricultor")
                || usuario.getRol().equalsIgnoreCase("agricultor")
                || usuario.getRol().equalsIgnoreCase("trabajador")
                || usuario.getRol().equalsIgnoreCase("cliente"))) {
            throw new IllegalArgumentException(
                    "El rol debe ser administrador_agricultor, trabajador o cliente");
        }

        usuario.setNombreUsuario(usuario.getNombreUsuario().trim());
        usuario.setCorreoElectronico(
                usuario.getCorreoElectronico().trim());
        usuario.setRol(usuario.getRol().equalsIgnoreCase("agricultor")
                ? "administrador_agricultor"
                : usuario.getRol().toLowerCase());
    }
}
