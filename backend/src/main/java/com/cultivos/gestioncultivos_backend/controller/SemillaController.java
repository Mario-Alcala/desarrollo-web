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

import com.cultivos.gestioncultivos_backend.model.Semilla;
import com.cultivos.gestioncultivos_backend.service.SemillaService;

/** API REST del banco de semillas: GET, POST, PUT y DELETE sobre /api/semillas. */

@RestController
@RequestMapping("/api/semillas")
public class SemillaController {

    private final SemillaService servicio;

    public SemillaController(SemillaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Semilla> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Semilla obtener(@PathVariable("id") Long id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Semilla crear(@RequestBody Semilla semilla) {
        return servicio.crear(semilla);
    }

    @PutMapping("/{id}")
    public Semilla actualizar(@PathVariable("id") Long id, @RequestBody Semilla semilla) {
        return servicio.actualizar(id, semilla);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") Long id) {
        servicio.eliminar(id);
    }
}
