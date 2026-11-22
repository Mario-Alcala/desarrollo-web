package com.cultivos.gestioncultivos_backend.model;

import java.time.LocalDate;

public class Abono {

    private Integer idAbono;
    private String nombreAbono;
    private String tipoAbono;
    private LocalDate fechaCaducidad;
    private Integer idProveedor;

    public Abono() {
    }

    public Integer getIdAbono() {
        return idAbono;
    }

    public void setIdAbono(Integer idAbono) {
        this.idAbono = idAbono;
    }

    public String getNombreAbono() {
        return nombreAbono;
    }

    public void setNombreAbono(String nombreAbono) {
        this.nombreAbono = nombreAbono;
    }

    public String getTipoAbono() {
        return tipoAbono;
    }

    public void setTipoAbono(String tipoAbono) {
        this.tipoAbono = tipoAbono;
    }

    public LocalDate getFechaCaducidad() {
        return fechaCaducidad;
    }

    public void setFechaCaducidad(LocalDate fechaCaducidad) {
        this.fechaCaducidad = fechaCaducidad;
    }

    public Integer getIdProveedor() {
        return idProveedor;
    }

    public void setIdProveedor(Integer idProveedor) {
        this.idProveedor = idProveedor;
    }
}
