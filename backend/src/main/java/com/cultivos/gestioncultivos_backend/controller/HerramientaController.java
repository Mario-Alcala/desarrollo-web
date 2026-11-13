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

import com.cultivos.gestioncultivos_backend.model.Herramienta;
import com.cultivos.gestioncultivos_backend.service.HerramientaService;

/** API REST de herramientas: GET, POST, PUT y DELETE sobre /api/herramientas. */

@RestController
@RequestMapping("/api/herramientas")
public class HerramientaController {

    private final HerramientaService servicio;

    public HerramientaController(HerramientaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Herramienta> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Herramienta obtener(@PathVariable("id") Long id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Herramienta crear(@RequestBody Herramienta herramienta) {
        return servicio.crear(herramienta);
    }

    @PutMapping("/{id}")
    public Herramienta actualizar(@PathVariable("id") Long id, @RequestBody Herramienta herramienta) {
        return servicio.actualizar(id, herramienta);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") Long id) {
        servicio.eliminar(id);
    }
}
