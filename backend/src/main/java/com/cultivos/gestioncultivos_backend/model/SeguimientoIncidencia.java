package com.cultivos.gestioncultivos_backend.model;

import java.time.LocalDate;

/**
 * Acción de seguimiento sobre una plaga o enfermedad (tabla seguimientos_incidencia).
 * estadoIncidencia no es columna: si llega, el servicio cambia el estado de la incidencia
 * (en_seguimiento o erradicada) en la misma transacción.
 */
public class SeguimientoIncidencia {

    private Integer idSeguimiento;
    private Integer idIncidencia;
    private Integer idUsuario;
    private LocalDate fecha;
    private String accionRealizada;
    private String observacion;
    private String estadoIncidencia;

    public SeguimientoIncidencia() {
    }

    public Integer getIdSeguimiento() { return idSeguimiento; }
    public void setIdSeguimiento(Integer idSeguimiento) { this.idSeguimiento = idSeguimiento; }
    public Integer getIdIncidencia() { return idIncidencia; }
    public void setIdIncidencia(Integer idIncidencia) { this.idIncidencia = idIncidencia; }
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public String getAccionRealizada() { return accionRealizada; }
    public void setAccionRealizada(String accionRealizada) { this.accionRealizada = accionRealizada; }
    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }
    public String getEstadoIncidencia() { return estadoIncidencia; }
    public void setEstadoIncidencia(String estadoIncidencia) { this.estadoIncidencia = estadoIncidencia; }
}
