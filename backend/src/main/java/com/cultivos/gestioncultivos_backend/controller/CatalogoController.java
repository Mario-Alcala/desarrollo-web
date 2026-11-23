package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.service.PedidoService;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {
    private final PedidoService servicio;

    public CatalogoController(PedidoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Map<String, Object>> listarProductosDisponibles() {
        return servicio.catalogoCliente();
    }
}
