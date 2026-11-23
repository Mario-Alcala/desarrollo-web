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
import com.cultivos.gestioncultivos_backend.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService servicio;

    public UsuarioController(UsuarioService servicio) {
        this.servicio = servicio;
    }

    @PostMapping("/login")
    public Usuario login(@RequestBody Usuario datos, jakarta.servlet.http.HttpServletRequest request) {
        jakarta.servlet.http.HttpSession anterior = request.getSession(false);
        if (anterior != null) { anterior.invalidate(); }
        Usuario usuario = servicio.autenticarCliente(datos.getCorreoElectronico(), datos.getContrasena());
        request.getSession(true).setAttribute("clienteId", usuario.getIdUsuario());
        return usuario;
    }

    @PostMapping("/salir")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void salir(jakarta.servlet.http.HttpServletRequest request) {
        jakarta.servlet.http.HttpSession sesion = request.getSession(false);
        if (sesion != null) { sesion.invalidate(); }
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