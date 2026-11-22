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

import com.cultivos.gestioncultivos_backend.model.Riego;
import com.cultivos.gestioncultivos_backend.service.RiegoService;

@RestController
@RequestMapping("/api/riegos")
public class RiegoController {

    private final RiegoService servicio;

    public RiegoController(RiegoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Riego> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Riego obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void crear(@RequestBody Riego riego) {
        servicio.crear(riego);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void actualizar(
            @PathVariable("id") int id,
            @RequestBody Riego riego) {
        servicio.actualizar(id, riego);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") int id) {
        servicio.eliminar(id);
    }
}
