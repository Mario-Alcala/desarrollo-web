package com.cultivos.gestioncultivos_backend.model;

import java.time.LocalDate;

public class Semilla {

    private Long id;
    private String variedad;
    private Integer stockDisponible;
    private String proveedorOrigen;
    private LocalDate fechaCaducidad;

    public Semilla() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVariedad() {
        return variedad;
    }

    public void setVariedad(String variedad) {
        this.variedad = variedad;
    }

    public Integer getStockDisponible() {
        return stockDisponible;
    }

    public void setStockDisponible(Integer stockDisponible) {
        this.stockDisponible = stockDisponible;
    }

    public String getProveedorOrigen() {
        return proveedorOrigen;
    }

    public void setProveedorOrigen(String proveedorOrigen) {
        this.proveedorOrigen = proveedorOrigen;
    }

    public LocalDate getFechaCaducidad() {
        return fechaCaducidad;
    }

    public void setFechaCaducidad(LocalDate fechaCaducidad) {
        this.fechaCaducidad = fechaCaducidad;
    }
}
