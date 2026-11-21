package com.cultivos.gestioncultivos_backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cultivos.gestioncultivos_backend.model.AsignacionLote;
import com.cultivos.gestioncultivos_backend.model.Pedido;
import com.cultivos.gestioncultivos_backend.model.PedidoLote;
import com.cultivos.gestioncultivos_backend.repository.PedidoRepository;

@Service
public class PedidoService {
    private static final Map<String, String> ESTADOS_PEDIDO = Map.of(
            "pendiente", "pendiente", "en_transito", "enviado",
            "listo_recoleccion", "listo", "entregado", "entregado");
    private final PedidoRepository repositorio;

    public PedidoService(PedidoRepository repositorio) { this.repositorio = repositorio; }

    public List<Pedido> listar() { return repositorio.listar(); }

    public Pedido obtener(int id) {
        return repositorio.buscar(id).orElseThrow(() -> new NoSuchElementException("No existe el pedido #" + id));
    }

    public List<PedidoLote> listarLotes(int id) { obtener(id); return repositorio.listarLotes(id); }

    @Transactional
    public void asignarLote(int idPedido, AsignacionLote asignacion) {
        Pedido pedido = obtener(idPedido);
        if ("cancelado".equals(pedido.getEstado())) throw new IllegalArgumentException("No se puede asignar producto a un pedido cancelado");
        if (!"pendiente".equals(pedido.getEstado())) throw new IllegalArgumentException("Los kilos solo se pueden asignar antes de registrar el envío o la recolección");
        if (asignacion == null || asignacion.getIdCosecha() == null) throw new IllegalArgumentException("Selecciona un lote de cosecha");
        BigDecimal kilos = asignacion.getKilos();
        if (kilos == null || kilos.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Los kilos deben ser mayores que cero");
        BigDecimal disponible = repositorio.bloquearDisponible(asignacion.getIdCosecha());
        if (disponible == null) throw new NoSuchElementException("No existe ese lote de cosecha");
        if (kilos.compareTo(disponible) > 0) throw new IllegalArgumentException("Solo hay " + disponible.stripTrailingZeros().toPlainString() + " kg disponibles en ese lote");
        repositorio.descontarDisponible(asignacion.getIdCosecha(), kilos);
        repositorio.insertarLote(idPedido, asignacion.getIdCosecha(), kilos);
    }

    @Transactional
    public void actualizarEntrega(int idPedido, String estado) {
        Pedido pedido = obtener(idPedido);
        if (pedido.getCantidadLotes() == null || pedido.getCantidadLotes() == 0) throw new IllegalArgumentException("Asigna los kilos disponibles al pedido antes de registrar la entrega");
        String normalizado = estado == null ? "" : estado.trim().toLowerCase();
        if (!ESTADOS_PEDIDO.containsKey(normalizado)) throw new IllegalArgumentException("Elige un estado de envío o recolección");
        String actual = pedido.getEstadoEntrega() == null ? "pendiente" : pedido.getEstadoEntrega();
        if ("entregado".equals(actual)) throw new IllegalArgumentException("El pedido ya fue entregado o recogido");
        if ("pendiente".equals(actual) && "entregado".equals(normalizado)) throw new IllegalArgumentException("Registra primero el envío o que el pedido está listo para recoger");
        if (!"pendiente".equals(actual) && !"entregado".equals(normalizado)) throw new IllegalArgumentException("Después del envío o de dejarlo listo, el siguiente estado es entregado o recogido");
        if ("domicilio".equals(pedido.getTipoEntrega()) && "listo_recoleccion".equals(normalizado)) throw new IllegalArgumentException("Este pedido es para envío a domicilio");
        if ("recoleccion".equals(pedido.getTipoEntrega()) && "en_transito".equals(normalizado)) throw new IllegalArgumentException("Este pedido se recoge en bodega");
        repositorio.cambiarEntrega(idPedido, normalizado, ESTADOS_PEDIDO.get(normalizado));
    }
}
