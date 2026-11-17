package com.cultivos.gestioncultivos_backend.model;

import java.time.LocalDate;

public class Fertilizante {

    private Integer idFertilizante;
    private String nombreFertilizante;
    private String tipoFertilizante;
    private LocalDate fechaCaducidad;
    private Integer idProveedor;

    public Fertilizante() {
    }

    public Integer getIdFertilizante() {
        return idFertilizante;
    }

    public void setIdFertilizante(Integer idFertilizante) {
        this.idFertilizante = idFertilizante;
    }

    public String getNombreFertilizante() {
        return nombreFertilizante;
    }

    public void setNombreFertilizante(String nombreFertilizante) {
        this.nombreFertilizante = nombreFertilizante;
    }

    public String getTipoFertilizante() {
        return tipoFertilizante;
    }

    public void setTipoFertilizante(String tipoFertilizante) {
        this.tipoFertilizante = tipoFertilizante;
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