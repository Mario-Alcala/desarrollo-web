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

import com.cultivos.gestioncultivos_backend.model.Fertilizante;
import com.cultivos.gestioncultivos_backend.service.FertilizanteService;

@RestController
@RequestMapping("/api/fertilizantes")
public class FertilizanteController {

    private final FertilizanteService servicio;

    public FertilizanteController(FertilizanteService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Fertilizante> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Fertilizante obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void crear(@RequestBody Fertilizante fertilizante) {
        servicio.crear(fertilizante);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void actualizar(
            @PathVariable("id") int id,
            @RequestBody Fertilizante fertilizante) {
        servicio.actualizar(id, fertilizante);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") int id) {
        servicio.eliminar(id);
    }
}
