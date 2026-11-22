package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.model.VariedadProducto;
import com.cultivos.gestioncultivos_backend.service.VariedadProductoService;

@RestController
@RequestMapping("/api/variedades-producto")
public class VariedadProductoController {

    private final VariedadProductoService servicio;

    public VariedadProductoController(VariedadProductoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<VariedadProducto> listar(@RequestParam(name = "idFamilia", required = false) Integer idFamilia) {
        return servicio.listar(idFamilia);
    }

    @GetMapping("/{id}")
    public VariedadProducto obtener(@PathVariable("id") int id) { return servicio.obtener(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VariedadProducto crear(@RequestBody VariedadProducto variedad) { return servicio.crear(variedad); }

    @PutMapping("/{id}")
    public VariedadProducto actualizar(@PathVariable("id") int id, @RequestBody VariedadProducto variedad) {
        return servicio.actualizar(id, variedad);
    }
}
