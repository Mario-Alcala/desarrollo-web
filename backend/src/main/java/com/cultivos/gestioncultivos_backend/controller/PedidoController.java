package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;
import java.util.Map;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.cultivos.gestioncultivos_backend.model.PedidoNuevo;
import com.cultivos.gestioncultivos_backend.service.PedidoService;

@RestController
@RequestMapping("/api")
public class PedidoController {
    private final PedidoService servicio;

    public PedidoController(PedidoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/catalogo")
    public List<Map<String, Object>> catalogo() {
        return servicio.catalogo();
    }

    @PostMapping("/pedidos")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crear(@RequestBody PedidoNuevo pedido, HttpSession sesion) {
        return servicio.crear(cliente(sesion), pedido);
    }

    @GetMapping("/pedidos")
    public List<Map<String, Object>> historial(HttpSession sesion) {
        return servicio.historial(cliente(sesion));
    }

    private int cliente(HttpSession sesion) {
        Object id = sesion.getAttribute("clienteId");
        if (!(id instanceof Integer)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión como cliente.");
        }
        return (Integer) id;
    }
}
