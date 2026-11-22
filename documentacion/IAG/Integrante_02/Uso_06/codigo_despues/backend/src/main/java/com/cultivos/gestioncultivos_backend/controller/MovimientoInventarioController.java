package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.model.MovimientoInventario;
import com.cultivos.gestioncultivos_backend.service.MovimientoInventarioService;

@RestController
@RequestMapping("/api/movimientos-inventario")
public class MovimientoInventarioController {

    private final MovimientoInventarioService servicio;

    public MovimientoInventarioController(
            MovimientoInventarioService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<MovimientoInventario> listar() {
        return servicio.listar();
    }

    @GetMapping("/{id}")
    public MovimientoInventario obtener(@PathVariable("id") int id) {
        return servicio.obtener(id);
    }

    @GetMapping("/inventario/{idInventario}")
    public List<MovimientoInventario> listarPorInventario(
            @PathVariable("idInventario") int idInventario) {
        return servicio.listarPorInventario(idInventario);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovimientoInventario crear(@RequestBody MovimientoInventario movimiento) {
        return servicio.crear(movimiento);
    }
}
