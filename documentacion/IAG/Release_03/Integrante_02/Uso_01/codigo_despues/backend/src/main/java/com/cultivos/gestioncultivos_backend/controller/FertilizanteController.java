package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;
import java.util.NoSuchElementException;

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

import com.cultivos.gestioncultivos_backend.model.Insumo;
import com.cultivos.gestioncultivos_backend.service.InsumoService;

@RestController
@RequestMapping("/api/fertilizantes")
public class FertilizanteController {

    private final InsumoService servicio;

    public FertilizanteController(InsumoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Insumo> listar() {
        return servicio.listar("fertilizante");
    }

    @GetMapping("/{id}")
    public Insumo obtener(@PathVariable("id") int id) {
        return obtenerFertilizante(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Insumo crear(@RequestBody Insumo insumo) {
        if (insumo == null) {
            throw new IllegalArgumentException("Los datos del fertilizante son obligatorios");
        }
        insumo.setCategoria("fertilizante");
        return servicio.crear(insumo);
    }

    @PutMapping("/{id}")
    public Insumo actualizar(@PathVariable("id") int id, @RequestBody Insumo insumo) {
        obtenerFertilizante(id);
        if (insumo == null) {
            throw new IllegalArgumentException("Los datos del fertilizante son obligatorios");
        }
        insumo.setCategoria("fertilizante");
        return servicio.actualizar(id, insumo);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") int id) {
        obtenerFertilizante(id);
        servicio.eliminar(id);
    }

    private Insumo obtenerFertilizante(int id) {
        Insumo insumo = servicio.obtener(id);
        if (!"fertilizante".equals(insumo.getCategoria())) {
            throw new NoSuchElementException("No existe el fertilizante con id " + id);
        }
        return insumo;
    }
}
