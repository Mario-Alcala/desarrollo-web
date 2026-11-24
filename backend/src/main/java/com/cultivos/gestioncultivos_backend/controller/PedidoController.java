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
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpSession;

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
    public List<Pedido> listar(HttpSession sesion) {
        exigirPersonal(sesion);
        return servicio.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crearCompra(@RequestBody PedidoNuevo solicitud, HttpSession sesion) {
        if (!"cliente".equals(rolSesion(sesion))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Inicia sesión con una cuenta de cliente para comprar.");
        }
        solicitud.setIdUsuario(usuarioSesion(sesion));
        return servicio.crearCompra(solicitud);
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> registrar(@RequestBody PedidoNuevo solicitud, HttpSession sesion) {
        exigirPersonal(sesion);
        return servicio.crearCompra(solicitud);
    }

    @GetMapping("/cliente/{idUsuario}")
    public List<Map<String, Object>> historialCliente(@PathVariable("idUsuario") int idUsuario, HttpSession sesion) {
        exigirClientePropio(sesion, idUsuario);
        return servicio.historialCliente(idUsuario);
    }

    @GetMapping("/{id}")
    public Pedido obtener(@PathVariable("id") int id, HttpSession sesion) {
        exigirPersonal(sesion);
        return servicio.obtener(id);
    }

    @GetMapping("/{id}/lotes")
    public List<PedidoLote> lotes(@PathVariable("id") int id, HttpSession sesion) {
        exigirPersonal(sesion);
        return servicio.listarLotes(id);
    }

    @PostMapping("/{id}/lotes")
    @ResponseStatus(HttpStatus.CREATED)
    public void asignarLote(@PathVariable("id") int id, @RequestBody AsignacionLote asignacion, HttpSession sesion) {
        exigirPersonal(sesion);
        servicio.asignarLote(id, asignacion, usuarioSesion(sesion));
    }

    @PutMapping("/{id}/entrega")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void actualizarEntrega(@PathVariable("id") int id, @RequestBody Map<String, String> solicitud, HttpSession sesion) {
        exigirPersonal(sesion);
        servicio.actualizarEntrega(id, solicitud.get("estado"), solicitud.get("numeroRastreo"), usuarioSesion(sesion));
    }

    private int usuarioSesion(HttpSession sesion) {
        Object id = sesion.getAttribute("idUsuario");
        if (!(id instanceof Number)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para continuar.");
        }
        return ((Number) id).intValue();
    }

    private String rolSesion(HttpSession sesion) {
        usuarioSesion(sesion);
        Object rol = sesion.getAttribute("rol");
        return rol == null ? "" : rol.toString();
    }

    private void exigirPersonal(HttpSession sesion) {
        String rol = rolSesion(sesion);
        if (!esPersonal(rol)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta acción requiere una cuenta de trabajador o administrador.");
        }
    }

    private boolean esPersonal(String rol) {
        return "administrador_agricultor".equals(rol)
                || "agricultor".equals(rol)
                || "trabajador".equals(rol);
    }

    private void exigirClientePropio(HttpSession sesion, int idSolicitado) {
        int idSesion = usuarioSesion(sesion);
        if (!"cliente".equals(rolSesion(sesion)) || idSesion != idSolicitado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo puedes consultar tus propios pedidos.");
        }
    }
}
