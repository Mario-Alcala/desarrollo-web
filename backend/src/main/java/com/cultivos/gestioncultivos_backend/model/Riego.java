package com.cultivos.gestioncultivos_backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Riego {

    private Integer idRiego;
    private Long idCultivo;
    /** Trabajador que registró el riego (riegos.id_usuario). El terreno se obtiene por la parcela del cultivo. */
    private Integer idUsuario;
    private LocalDate fechaRiego;
    private BigDecimal cantidadAgua;
    private String unidadMedida;
    private String metodo;
    private String observaciones;

    public Riego() {
    }

    public Integer getIdRiego() {
        return idRiego;
    }

    public void setIdRiego(Integer idRiego) {
        this.idRiego = idRiego;
    }

    public Long getIdCultivo() {
        return idCultivo;
    }

    public void setIdCultivo(Long idCultivo) {
        this.idCultivo = idCultivo;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public LocalDate getFechaRiego() {
        return fechaRiego;
    }

    public void setFechaRiego(LocalDate fechaRiego) {
        this.fechaRiego = fechaRiego;
    }

    public BigDecimal getCantidadAgua() {
        return cantidadAgua;
    }

    public void setCantidadAgua(BigDecimal cantidadAgua) {
        this.cantidadAgua = cantidadAgua;
    }

    public String getUnidadMedida() {
        return unidadMedida;
    }

    public void setUnidadMedida(String unidadMedida) {
        this.unidadMedida = unidadMedida;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}