package com.cultivos.gestioncultivos_backend.model;

import java.math.BigDecimal;

public class AsignacionLote {
    private Integer idCosecha;
    private BigDecimal kilos;

    public Integer getIdCosecha() { return idCosecha; }
    public void setIdCosecha(Integer idCosecha) { this.idCosecha = idCosecha; }
    public BigDecimal getKilos() { return kilos; }
    public void setKilos(BigDecimal kilos) { this.kilos = kilos; }
}
