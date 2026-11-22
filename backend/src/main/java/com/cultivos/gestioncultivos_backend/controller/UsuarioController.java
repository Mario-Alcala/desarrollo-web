package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.model.Usuario;
import com.cultivos.gestioncultivos_backend.model.SolicitudLogin;
import com.cultivos.gestioncultivos_backend.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService servicio;

    public UsuarioController(UsuarioService servicio) {
        this.servicio = servicio;
    }

    @PostMapping("/login")
    public Usuario iniciarSesion(@RequestBody SolicitudLogin solicitud) {
        return servicio.iniciarSesion(
                solicitud.getCorreoElectronico(), solicitud.getContrasena());
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public void registrarCliente(@RequestBody Usuario usuario) {
        servicio.registrarCliente(usuario);
    }

    @GetMapping
    public List<Usuario> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Usuario obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void crear(@RequestBody Usuario usuario) {
        servicio.crear(usuario);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void actualizar(
            @PathVariable("id") int id,
            @RequestBody Usuario usuario) {
        servicio.actualizar(id, usuario);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") int id) {
        servicio.eliminar(id);
    }
}
