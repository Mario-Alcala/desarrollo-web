package com.cultivos.gestioncultivos_backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// Solo datos del pedido; nunca recibe tarjeta, CVV, total ni precio del navegador.
public class PedidoNuevo {
    public String metodoPago;
    public String tipoEntrega;
    public String direccion;
    public LocalDate fechaRecoleccion;
    public List<Detalle> detalles;

    public static class Detalle {
        public Integer idCosecha;
        public BigDecimal kilos;
    }
}
