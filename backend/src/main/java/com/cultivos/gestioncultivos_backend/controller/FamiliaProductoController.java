package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.model.FamiliaProducto;
import com.cultivos.gestioncultivos_backend.service.FamiliaProductoService;

@RestController
@RequestMapping("/api/familias-producto")
public class FamiliaProductoController {

    private final FamiliaProductoService servicio;

    public FamiliaProductoController(FamiliaProductoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<FamiliaProducto> listar() { return servicio.listar(); }

    @GetMapping("/{id}")
    public FamiliaProducto obtener(@PathVariable("id") int id) { return servicio.obtener(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FamiliaProducto crear(@RequestBody FamiliaProducto familia) { return servicio.crear(familia); }

    @PutMapping("/{id}")
    public FamiliaProducto actualizar(@PathVariable("id") int id, @RequestBody FamiliaProducto familia) {
        return servicio.actualizar(id, familia);
    }
}
