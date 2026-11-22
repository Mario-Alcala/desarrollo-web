package com.cultivos.gestioncultivos_backend.model;

import java.math.BigDecimal;

public class VariedadProducto {

    private Integer idVariedad;
    private Integer idFamilia;
    private String nombre;
    private String descripcion;
    private String imagenUrl;
    private BigDecimal precioPorKg;
    private String nombreFamilia;

    public VariedadProducto() {
    }

    public Integer getIdVariedad() { return idVariedad; }
    public void setIdVariedad(Integer idVariedad) { this.idVariedad = idVariedad; }
    public Integer getIdFamilia() { return idFamilia; }
    public void setIdFamilia(Integer idFamilia) { this.idFamilia = idFamilia; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public BigDecimal getPrecioPorKg() { return precioPorKg; }
    public void setPrecioPorKg(BigDecimal precioPorKg) { this.precioPorKg = precioPorKg; }
    public String getNombreFamilia() { return nombreFamilia; }
    public void setNombreFamilia(String nombreFamilia) { this.nombreFamilia = nombreFamilia; }
}
