package com.cultivos.gestioncultivos_backend.model;

import java.math.BigDecimal;

public class PedidoLote {
    private Integer idDetalle;
    private Integer idCosecha;
    private String producto;
    private String maduracion;
    private BigDecimal cantidad;
    private BigDecimal disponible;

    public Integer getIdDetalle() { return idDetalle; }
    public void setIdDetalle(Integer idDetalle) { this.idDetalle = idDetalle; }
    public Integer getIdCosecha() { return idCosecha; }
    public void setIdCosecha(Integer idCosecha) { this.idCosecha = idCosecha; }
    public String getProducto() { return producto; }
    public void setProducto(String producto) { this.producto = producto; }
    public String getMaduracion() { return maduracion; }
    public void setMaduracion(String maduracion) { this.maduracion = maduracion; }
    public BigDecimal getCantidad() { return cantidad; }
    public void setCantidad(BigDecimal cantidad) { this.cantidad = cantidad; }
    public BigDecimal getDisponible() { return disponible; }
    public void setDisponible(BigDecimal disponible) { this.disponible = disponible; }
}
