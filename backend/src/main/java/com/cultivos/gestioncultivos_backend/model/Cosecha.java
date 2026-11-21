package com.cultivos.gestioncultivos_backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Cosecha {

    private Integer idCosecha;
    private Long idCultivo;
    private Integer idUsuario;
    private LocalDate fechaCosecha;
    private BigDecimal cantidadCosechada;
    private BigDecimal cantidadDisponible;
    private String estadoMaduracion;
    private String ubicacionBodega;
    private String nombreCultivo;

    public Cosecha() {
    }

    public Integer getIdCosecha() {
        return idCosecha;
    }

    public void setIdCosecha(Integer idCosecha) {
        this.idCosecha = idCosecha;
    }

    public Long getIdCultivo() {
        return idCultivo;
    }

    public void setIdCultivo(Long idCultivo) {
        this.idCultivo = idCultivo;
    }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public LocalDate getFechaCosecha() {
        return fechaCosecha;
    }

    public void setFechaCosecha(LocalDate fechaCosecha) {
        this.fechaCosecha = fechaCosecha;
    }

    public BigDecimal getCantidadCosechada() {
        return cantidadCosechada;
    }

    public void setCantidadCosechada(BigDecimal cantidadCosechada) {
        this.cantidadCosechada = cantidadCosechada;
    }

    public BigDecimal getCantidadDisponible() { return cantidadDisponible; }
    public void setCantidadDisponible(BigDecimal cantidadDisponible) { this.cantidadDisponible = cantidadDisponible; }
    public String getEstadoMaduracion() { return estadoMaduracion; }
    public void setEstadoMaduracion(String estadoMaduracion) { this.estadoMaduracion = estadoMaduracion; }
    public String getUbicacionBodega() { return ubicacionBodega; }
    public void setUbicacionBodega(String ubicacionBodega) { this.ubicacionBodega = ubicacionBodega; }
    public String getNombreCultivo() { return nombreCultivo; }
    public void setNombreCultivo(String nombreCultivo) { this.nombreCultivo = nombreCultivo; }
}
