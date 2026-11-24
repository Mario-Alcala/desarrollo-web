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

import com.cultivos.gestioncultivos_backend.model.ObservacionCultivo;
import com.cultivos.gestioncultivos_backend.service.ObservacionCultivoService;

@RestController
@RequestMapping("/api/observaciones-cultivos")
public class ObservacionCultivoController {

    private final ObservacionCultivoService servicio;

    public ObservacionCultivoController(
            ObservacionCultivoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<ObservacionCultivo> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public ObservacionCultivo obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void crear(@RequestBody ObservacionCultivo observacion) {
        servicio.crear(observacion);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void actualizar(
            @PathVariable("id") int id,
            @RequestBody ObservacionCultivo observacion) {
        servicio.actualizar(id, observacion);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") int id) {
        servicio.eliminar(id);
    }
}