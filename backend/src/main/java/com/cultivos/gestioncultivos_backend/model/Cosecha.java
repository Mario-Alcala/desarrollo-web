package com.cultivos.gestioncultivos_backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Cosecha {

    private Integer idCosecha;
    private Long idCultivo;
    private LocalDate fechaCosecha;
    private BigDecimal cantidadCosechada;

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
}