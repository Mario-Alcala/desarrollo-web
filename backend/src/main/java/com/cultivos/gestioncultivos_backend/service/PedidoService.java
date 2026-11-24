package com.cultivos.gestioncultivos_backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cultivos.gestioncultivos_backend.model.AsignacionLote;
import com.cultivos.gestioncultivos_backend.model.Pedido;
import com.cultivos.gestioncultivos_backend.model.PedidoLote;
import com.cultivos.gestioncultivos_backend.model.PedidoNuevo;
import com.cultivos.gestioncultivos_backend.repository.PedidoRepository;

@Service
public class PedidoService {
    private static final Map<String, String> ESTADOS_PEDIDO = Map.of(
            "pendiente", "pendiente", "en_transito", "enviado",
            "listo_recoleccion", "listo", "entregado", "entregado");
    private final PedidoRepository repositorio;

    public PedidoService(PedidoRepository repositorio) { this.repositorio = repositorio; }

    public List<Pedido> listar() { return repositorio.listar(); }

    public List<Map<String, Object>> catalogoCliente() { return repositorio.catalogoCliente(); }

    public List<Map<String, Object>> historialCliente(int idUsuario) {
        if (!repositorio.esCliente(idUsuario)) throw new NoSuchElementException("No existe ese cliente");
        return repositorio.historialCliente(idUsuario);
    }

    @Transactional
    public Map<String, Object> crearCompra(PedidoNuevo solicitud) {
        if (solicitud == null || solicitud.getIdUsuario() == null || !repositorio.esCliente(solicitud.getIdUsuario())) {
            throw new IllegalArgumentException("Inicia sesión con una cuenta de cliente para comprar.");
        }
        String metodo = solicitud.getMetodoPago() == null ? "" : solicitud.getMetodoPago().trim().toLowerCase();
        if (!List.of("tarjeta", "transferencia").contains(metodo)) {
            throw new IllegalArgumentException("Selecciona tarjeta o transferencia.");
        }
        String entrega = solicitud.getTipoEntrega() == null ? "" : solicitud.getTipoEntrega().trim().toLowerCase();
        String direccion = null;
        LocalDate fechaRecoleccion = null;
        if ("domicilio".equals(entrega)) {
            direccion = solicitud.getDireccion() == null ? "" : solicitud.getDireccion().trim();
            if (direccion.isBlank() || direccion.length() > 255) {
                throw new IllegalArgumentException("Escribe la dirección completa en un máximo de 255 caracteres.");
            }
        } else if ("recoleccion".equals(entrega)) {
            fechaRecoleccion = solicitud.getFechaRecoleccion();
            LocalDate hoy = LocalDate.now();
            if (fechaRecoleccion == null || fechaRecoleccion.isBefore(hoy) || fechaRecoleccion.isAfter(hoy.plusDays(7))) {
                throw new IllegalArgumentException("Elige una fecha de recolección dentro de los próximos 7 días.");
            }
        } else {
            throw new IllegalArgumentException("Selecciona entrega a domicilio o recolección.");
        }
        if (solicitud.getDetalles() == null || solicitud.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("Agrega al menos un producto al pedido.");
        }

        Map<Integer, BigDecimal> cantidades = new TreeMap<>();
        for (PedidoNuevo.Detalle detalle : solicitud.getDetalles()) {
            if (detalle == null || detalle.getIdCosecha() == null || detalle.getIdCosecha() <= 0
                    || detalle.getKilos() == null || detalle.getKilos().signum() <= 0
                    || detalle.getKilos().stripTrailingZeros().scale() > 2) {
                throw new IllegalArgumentException("Cada producto debe tener un lote válido y kilos positivos con hasta dos decimales.");
            }
            cantidades.merge(detalle.getIdCosecha(), detalle.getKilos(), BigDecimal::add);
        }

        Map<Integer, BigDecimal> precios = new TreeMap<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Map.Entry<Integer, BigDecimal> detalle : cantidades.entrySet()) {
            Map<String, Object> lote = repositorio.bloquearLoteParaVenta(detalle.getKey());
            if (lote == null) throw new NoSuchElementException("No existe el lote " + detalle.getKey() + " o ya no está disponible.");
            BigDecimal disponibles = (BigDecimal) lote.get("kilos");
            BigDecimal precio = (BigDecimal) lote.get("precioPorKg");
            if (detalle.getValue().compareTo(disponibles) > 0) {
                throw new IllegalArgumentException("No hay suficientes kilos disponibles en el lote " + detalle.getKey() + ".");
            }
            precios.put(detalle.getKey(), precio);
            total = total.add(precio.multiply(detalle.getValue()).setScale(2, RoundingMode.HALF_UP));
        }
        if (total.signum() <= 0) throw new IllegalArgumentException("El total del pedido debe ser mayor que cero.");

        int idPedido = repositorio.insertarCompra(solicitud.getIdUsuario(), metodo, entrega, total);
        repositorio.insertarEntregaCliente(idPedido, direccion, fechaRecoleccion);
        for (Map.Entry<Integer, BigDecimal> detalle : cantidades.entrySet()) {
            repositorio.insertarDetalleCompra(idPedido, detalle.getKey(), detalle.getValue(), precios.get(detalle.getKey()));
        }
        return Map.of("idPedido", idPedido, "total", total, "estado", "pendiente");
    }

    public Pedido obtener(int id) {
        return repositorio.buscar(id).orElseThrow(() -> new NoSuchElementException("No existe el pedido #" + id));
    }

    public List<PedidoLote> listarLotes(int id) { obtener(id); return repositorio.listarLotes(id); }

    @Transactional
    public void asignarLote(int idPedido, AsignacionLote asignacion, int idResponsable) {
        repositorio.bloquearPedido(idPedido);
        Pedido pedido = obtener(idPedido);
        if (Boolean.TRUE.equals(pedido.getCompraCatalogo())) {
            throw new IllegalArgumentException("Este pedido ya tiene los lotes reservados desde el catálogo");
        }
        if ("cancelado".equals(pedido.getEstado())) throw new IllegalArgumentException("No se puede asignar producto a un pedido cancelado");
        if (!"pendiente".equals(pedido.getEstado())) throw new IllegalArgumentException("Los kilos solo se pueden asignar antes de registrar el envío o la recolección");
        if (asignacion == null || asignacion.getIdCosecha() == null) throw new IllegalArgumentException("Selecciona un lote de cosecha");
        BigDecimal kilos = asignacion.getKilos();
        if (kilos == null || kilos.compareTo(BigDecimal.ZERO) <= 0 || kilos.stripTrailingZeros().scale() > 2) throw new IllegalArgumentException("Los kilos deben ser positivos y tener hasta dos decimales");
        BigDecimal disponible = repositorio.bloquearDisponible(asignacion.getIdCosecha());
        if (disponible == null) throw new NoSuchElementException("No existe ese lote de cosecha");
        if (kilos.compareTo(disponible) > 0) throw new IllegalArgumentException("Solo hay " + disponible.stripTrailingZeros().toPlainString() + " kg disponibles en ese lote");
        repositorio.descontarDisponible(asignacion.getIdCosecha(), kilos);
        repositorio.insertarLote(idPedido, asignacion.getIdCosecha(), kilos);
        repositorio.registrarEmpacador(idPedido, idResponsable);
    }

    @Transactional
    public void actualizarEntrega(int idPedido, String estado, String numeroRastreo) {
        actualizarEntrega(idPedido, estado, numeroRastreo, null);
    }

    @Transactional
    public void actualizarEntrega(int idPedido, String estado, String numeroRastreo, Integer idResponsable) {
        repositorio.bloquearPedido(idPedido);
        Pedido pedido = obtener(idPedido);
        if (pedido.getCantidadLotes() == null || pedido.getCantidadLotes() == 0) throw new IllegalArgumentException("Asigna los kilos disponibles al pedido antes de registrar la entrega");
        if ("cancelado".equals(pedido.getEstado())) throw new IllegalArgumentException("El pedido está cancelado");
        String normalizado = estado == null ? "" : estado.trim().toLowerCase();
        if (!ESTADOS_PEDIDO.containsKey(normalizado) || "pendiente".equals(normalizado)) throw new IllegalArgumentException("Elige un estado de envío o recolección");
        String actual = pedido.getEstadoEntrega() == null ? "pendiente" : pedido.getEstadoEntrega();
        if ("entregado".equals(actual)) throw new IllegalArgumentException("El pedido ya fue entregado o recogido");
        if ("pendiente".equals(actual) && "entregado".equals(normalizado)) throw new IllegalArgumentException("Registra primero el envío o que el pedido está listo para recoger");
        if (!"pendiente".equals(actual) && !"entregado".equals(normalizado)) throw new IllegalArgumentException("Después del envío o de dejarlo listo, el siguiente estado es entregado o recogido");
        if ("domicilio".equals(pedido.getTipoEntrega()) && "listo_recoleccion".equals(normalizado)) throw new IllegalArgumentException("Este pedido es para envío a domicilio");
        if ("recoleccion".equals(pedido.getTipoEntrega()) && "en_transito".equals(normalizado)) throw new IllegalArgumentException("Este pedido se recoge en bodega");
        if (numeroRastreo != null && numeroRastreo.length() > 100) throw new IllegalArgumentException("El número de rastreo no debe exceder 100 caracteres");
        if (numeroRastreo != null && !numeroRastreo.isBlank() && !"domicilio".equals(pedido.getTipoEntrega())) throw new IllegalArgumentException("El rastreo solo aplica a entregas a domicilio");
        repositorio.cambiarEntrega(idPedido, normalizado, ESTADOS_PEDIDO.get(normalizado),
                numeroRastreo == null ? null : numeroRastreo.trim(), idResponsable);
    }
}
