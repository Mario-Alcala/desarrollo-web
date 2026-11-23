package com.cultivos.gestioncultivos_backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cultivos.gestioncultivos_backend.model.PedidoNuevo;
import com.cultivos.gestioncultivos_backend.repository.PedidoRepository;

@Service
public class PedidoService {
    private final PedidoRepository repositorio;
    private static final BigDecimal MAXIMO = new BigDecimal("99999999.99");

    public PedidoService(PedidoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Map<String, Object>> catalogo() {
        return repositorio.catalogo();
    }

    public List<Map<String, Object>> historial(int usuario) {
        return repositorio.historial(usuario);
    }

    @Transactional
    public Map<String, Object> crear(int usuario, PedidoNuevo pedido) {
        if (!repositorio.esCliente(usuario)) {
            throw new IllegalArgumentException("El usuario no es un cliente registrado.");
        }
        if (pedido == null || !("tarjeta".equals(pedido.metodoPago) || "transferencia".equals(pedido.metodoPago))) {
            throw new IllegalArgumentException("Selecciona tarjeta o transferencia.");
        }
        String direccion = null;
        LocalDate fecha = null;
        if ("domicilio".equals(pedido.tipoEntrega)) {
            if (pedido.direccion == null || pedido.direccion.isBlank() || pedido.direccion.trim().length() > 255) {
                throw new IllegalArgumentException("Escribe una dirección de hasta 255 caracteres.");
            }
            direccion = pedido.direccion.trim();
        } else if ("recoleccion".equals(pedido.tipoEntrega)) {
            fecha = pedido.fechaRecoleccion;
            if (fecha == null || fecha.isBefore(LocalDate.now()) || fecha.isAfter(LocalDate.now().plusDays(13))) {
                throw new IllegalArgumentException("Selecciona una fecha de recolección dentro de los próximos 14 días.");
            }
        } else {
            throw new IllegalArgumentException("Selecciona domicilio o recolección.");
        }
        if (pedido.detalles == null || pedido.detalles.isEmpty() || pedido.detalles.size() > 100) {
            throw new IllegalArgumentException("Selecciona entre 1 y 100 lotes.");
        }
        // Se suman lotes repetidos y se bloquean por ID para evitar sobreventas.
        Map<Integer, BigDecimal> cantidades = new TreeMap<>();
        for (PedidoNuevo.Detalle detalle : pedido.detalles) {
            if (detalle == null || detalle.idCosecha == null || detalle.idCosecha <= 0
                    || detalle.kilos == null || detalle.kilos.signum() <= 0
                    || detalle.kilos.stripTrailingZeros().scale() > 2 || detalle.kilos.compareTo(MAXIMO) > 0) {
                throw new IllegalArgumentException("Cada lote requiere kilos positivos con máximo dos decimales.");
            }
            cantidades.merge(detalle.idCosecha, detalle.kilos, BigDecimal::add);
        }
        Map<Integer, BigDecimal> precios = new TreeMap<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Map.Entry<Integer, BigDecimal> detalle : cantidades.entrySet()) {
            Map<String, Object> lote = repositorio.bloquearLote(detalle.getKey());
            BigDecimal disponibles = (BigDecimal) lote.get("kilos");
            BigDecimal precio = (BigDecimal) lote.get("precioKilo");
            if (detalle.getValue().compareTo(disponibles) > 0 || precio.signum() <= 0) {
                throw new IllegalArgumentException("Existencias insuficientes o precio inválido para el lote " + detalle.getKey());
            }
            precios.put(detalle.getKey(), precio);
            total = total.add(precio.multiply(detalle.getValue()).setScale(2, RoundingMode.HALF_UP));
        }
        if (total.signum() <= 0 || total.compareTo(MAXIMO) > 0) {
            throw new IllegalArgumentException("El total del pedido está fuera del rango permitido.");
        }
        int id = repositorio.insertarPedido(usuario, pedido.metodoPago, pedido.tipoEntrega, total);
        repositorio.insertarEntrega(id, direccion, fecha);
        for (Map.Entry<Integer, BigDecimal> detalle : cantidades.entrySet()) {
            repositorio.insertarDetalle(id, detalle.getKey(), detalle.getValue(), precios.get(detalle.getKey()));
        }
        return Map.of("idPedido", id, "total", total, "estado", "pendiente");
    }
}
