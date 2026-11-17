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

import com.cultivos.gestioncultivos_backend.model.DetalleDistribucion;
import com.cultivos.gestioncultivos_backend.service.DetalleDistribucionService;

@RestController
@RequestMapping("/api/detalles-distribucion")
public class DetalleDistribucionController {

    private final DetalleDistribucionService servicio;

    public DetalleDistribucionController(
            DetalleDistribucionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<DetalleDistribucion> listar() {
        return servicio.listar();
    }

    @GetMapping("/distribucion/{idDistribucion}")
    public List<DetalleDistribucion> listarPorDistribucion(
            @PathVariable("idDistribucion") int idDistribucion) {
        return servicio.listarPorDistribucion(idDistribucion);
    }

    @GetMapping("/{id}")
    public DetalleDistribucion obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void crear(@RequestBody DetalleDistribucion detalle) {
        servicio.crear(detalle);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void actualizar(
            @PathVariable("id") int id,
            @RequestBody DetalleDistribucion detalle) {
        servicio.actualizar(id, detalle);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable("id") int id) {
        servicio.eliminar(id);
    }
}