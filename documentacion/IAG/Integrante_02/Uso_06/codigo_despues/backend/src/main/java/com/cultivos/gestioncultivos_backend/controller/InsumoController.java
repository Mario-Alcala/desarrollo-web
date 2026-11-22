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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.model.Insumo;
import com.cultivos.gestioncultivos_backend.service.InsumoService;

@RestController
@RequestMapping("/api/insumos")
public class InsumoController {

    private final InsumoService servicio;

    public InsumoController(InsumoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Insumo> listar(@RequestParam(name = "categoria", required = false) String categoria) {
        return servicio.listar(categoria);
    }

    @GetMapping("/{id}")
    public Insumo obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Insumo crear(@RequestBody Insumo insumo) {
        return servicio.crear(insumo);
    }

    @PutMapping("/{id}")
    public Insumo actualizar(@PathVariable("id") int id, @RequestBody Insumo insumo) {
        return servicio.actualizar(id, insumo);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") int id) {
        servicio.eliminar(id);
    }
}
