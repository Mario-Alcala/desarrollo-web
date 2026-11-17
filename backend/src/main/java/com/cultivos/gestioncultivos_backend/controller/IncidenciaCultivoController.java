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

import com.cultivos.gestioncultivos_backend.model.IncidenciaCultivo;
import com.cultivos.gestioncultivos_backend.service.IncidenciaCultivoService;

@RestController
@RequestMapping("/api/incidencias-cultivo")
public class IncidenciaCultivoController {

    private final IncidenciaCultivoService servicio;

    public IncidenciaCultivoController(
            IncidenciaCultivoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<IncidenciaCultivo> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public IncidenciaCultivo obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void crear(@RequestBody IncidenciaCultivo incidencia) {
        servicio.crear(incidencia);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void actualizar(
            @PathVariable("id") int id,
            @RequestBody IncidenciaCultivo incidencia) {
        servicio.actualizar(id, incidencia);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") int id) {
        servicio.eliminar(id);
    }
}