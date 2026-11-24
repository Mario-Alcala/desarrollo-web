package com.cultivos.gestioncultivos_backend.model;

public class DetalleDistribucion {

    private Integer idDetalle;
    private Integer idDistribucion;
    private Integer idCosecha;
    private Integer cantidad;

    public DetalleDistribucion() {
    }

    public Integer getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(Integer idDetalle) {
        this.idDetalle = idDetalle;
    }

    public Integer getIdDistribucion() {
        return idDistribucion;
    }

    public void setIdDistribucion(Integer idDistribucion) {
        this.idDistribucion = idDistribucion;
    }

    public Integer getIdCosecha() {
        return idCosecha;
    }

    public void setIdCosecha(Integer idCosecha) {
        this.idCosecha = idCosecha;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
}