package com.cultivos.gestioncultivos_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cultivos.gestioncultivos_backend.model.AsignacionLote;
import com.cultivos.gestioncultivos_backend.model.Pedido;
import com.cultivos.gestioncultivos_backend.model.PedidoLote;
import com.cultivos.gestioncultivos_backend.model.PedidoNuevo;
import com.cultivos.gestioncultivos_backend.service.PedidoService;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
    private final PedidoService servicio;

    public PedidoController(PedidoService servicio) { this.servicio = servicio; }

    @GetMapping
    public List<Pedido> listar() { return servicio.listar(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crearCompra(@RequestBody PedidoNuevo solicitud) {
        return servicio.crearCompra(solicitud);
    }

    @GetMapping("/cliente/{idUsuario}")
    public List<Map<String, Object>> historialCliente(@PathVariable("idUsuario") int idUsuario) {
        return servicio.historialCliente(idUsuario);
    }

    @GetMapping("/{id}")
    public Pedido obtener(@PathVariable("id") int id) { return servicio.obtener(id); }

    @GetMapping("/{id}/lotes")
    public List<PedidoLote> lotes(@PathVariable("id") int id) { return servicio.listarLotes(id); }

    @PostMapping("/{id}/lotes")
    @ResponseStatus(HttpStatus.CREATED)
    public void asignarLote(@PathVariable("id") int id, @RequestBody AsignacionLote asignacion) {
        servicio.asignarLote(id, asignacion);
    }

    @PutMapping("/{id}/entrega")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void actualizarEntrega(@PathVariable("id") int id, @RequestBody Map<String, String> solicitud) {
        Integer responsable = null;
        String idUsuario = solicitud.get("idUsuario");
        if (idUsuario != null && !idUsuario.isBlank()) {
            try {
                responsable = Integer.valueOf(idUsuario.trim());
            } catch (NumberFormatException ex) {
                throw new IllegalArgumentException("El id del trabajador no es válido");
            }
        }
        servicio.actualizarEntrega(id, solicitud.get("estado"), solicitud.get("numeroRastreo"), responsable);
    }
}
