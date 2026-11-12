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

import com.cultivos.gestioncultivos_backend.model.Terreno;
import com.cultivos.gestioncultivos_backend.service.TerrenoService;

/** API REST de terrenos: GET, POST, PUT y DELETE sobre /api/terrenos. */
@RestController
@RequestMapping("/api/terrenos")
public class TerrenoController {

    private final TerrenoService servicio;

    public TerrenoController(TerrenoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Terreno> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public Terreno obtener(@PathVariable("id") Long id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Terreno crear(@RequestBody Terreno terreno) {
        return servicio.crear(terreno);
    }

    @PutMapping("/{id}")
    public Terreno actualizar(@PathVariable("id") Long id, @RequestBody Terreno terreno) {
        return servicio.actualizar(id, terreno);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") Long id) {
        servicio.eliminar(id);
    }
}
