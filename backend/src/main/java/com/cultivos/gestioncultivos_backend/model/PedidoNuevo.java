package com.cultivos.gestioncultivos_backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PedidoNuevo {
    private Integer idUsuario;
    private String metodoPago;
    private String tipoEntrega;
    private String direccion;
    private LocalDate fechaRecoleccion;
    private List<Detalle> detalles;

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    public String getTipoEntrega() { return tipoEntrega; }
    public void setTipoEntrega(String tipoEntrega) { this.tipoEntrega = tipoEntrega; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public LocalDate getFechaRecoleccion() { return fechaRecoleccion; }
    public void setFechaRecoleccion(LocalDate fechaRecoleccion) { this.fechaRecoleccion = fechaRecoleccion; }
    public List<Detalle> getDetalles() { return detalles; }
    public void setDetalles(List<Detalle> detalles) { this.detalles = detalles; }

    public static class Detalle {
        private Integer idCosecha;
        private BigDecimal kilos;
        public Integer getIdCosecha() { return idCosecha; }
        public void setIdCosecha(Integer idCosecha) { this.idCosecha = idCosecha; }
        public BigDecimal getKilos() { return kilos; }
        public void setKilos(BigDecimal kilos) { this.kilos = kilos; }
    }
}
