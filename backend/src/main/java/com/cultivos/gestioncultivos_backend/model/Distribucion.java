package com.cultivos.gestioncultivos_backend.model;

import java.time.LocalDate;

public class Distribucion {

    private Integer idDistribucion;
    private LocalDate fechaSalida;
    private LocalDate fechaEntrega;
    private String destino;
    private String responsable;
    private String estado;

    public Distribucion() {
    }

    public Integer getIdDistribucion() {
        return idDistribucion;
    }

    public void setIdDistribucion(Integer idDistribucion) {
        this.idDistribucion = idDistribucion;
    }

    public LocalDate getFechaSalida() {
        return fechaSalida;
    }

    public void setFechaSalida(LocalDate fechaSalida) {
        this.fechaSalida = fechaSalida;
    }

    public LocalDate getFechaEntrega() {
        return fechaEntrega;
    }

    public void setFechaEntrega(LocalDate fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public String getResponsable() {
        return responsable;
    }

    public void setResponsable(String responsable) {
        this.responsable = responsable;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}