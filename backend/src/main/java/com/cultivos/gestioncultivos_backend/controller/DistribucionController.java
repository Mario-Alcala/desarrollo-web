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

import com.cultivos.gestioncultivos_backend.model.Distribucion;
import com.cultivos.gestioncultivos_backend.service.DistribucionService;

@RestController
@RequestMapping("/api/distribuciones")
public class DistribucionController {

    private final DistribucionService servicio;

    public DistribucionController(DistribucionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Distribucion> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Distribucion obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void crear(@RequestBody Distribucion distribucion) {
        servicio.crear(distribucion);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void actualizar(
            @PathVariable("id") int id,
            @RequestBody Distribucion distribucion) {
        servicio.actualizar(id, distribucion);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") int id) {
        servicio.eliminar(id);
    }
}